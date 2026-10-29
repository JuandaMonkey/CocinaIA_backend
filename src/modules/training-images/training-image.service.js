import { AppError } from '../../shared/errors/app-error.js';
import { createHash } from 'node:crypto';
import { cloudinaryService } from '../../shared/services/cloudinary.service.js';
import { ingredientRepository } from '../ingredients/ingredient.repository.js';
import { trainingImageRepository } from './training-image.repository.js';

function normalizeLabel(value) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function isValidImageUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

async function inspectImageContent(image) {
  if (!isValidImageUrl(image.imageUrl ?? '')) {
    return image;
  }

  try {
    const response = await fetch(image.imageUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return { ...image, reachable: false };
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      ...image,
      reachable: true,
      contentHash: createHash('sha256').update(bytes).digest('hex'),
    };
  } catch {
    return { ...image, reachable: false };
  }
}

async function inspectImages(images) {
  const inspected = [];
  const concurrency = 6;

  for (let index = 0; index < images.length; index += concurrency) {
    const batch = images.slice(index, index + concurrency);
    inspected.push(...(await Promise.all(batch.map(inspectImageContent))));
  }

  return inspected;
}

export function buildCleanupPlan(images, ingredients) {
  const ingredientByName = new Map(
    ingredients.map((ingredient) => [normalizeLabel(ingredient.name), ingredient]),
  );
  const seenDuplicateKeys = new Map();
  const seenUrls = new Map();
  const updates = [];
  const deleteIds = [];
  const issues = [];

  for (const image of images) {
    const normalizedLabel = normalizeLabel(image.label ?? '');
    const ingredient = ingredientByName.get(normalizedLabel);
    const validUrl = isValidImageUrl(image.imageUrl ?? '');

    if (!validUrl) {
      issues.push({
        id: image.id,
        type: 'invalid_url',
        severity: 'error',
        label: image.label,
        imageUrl: image.imageUrl,
        message: 'La URL no es HTTP o HTTPS y el registro no puede entrenarse.',
        automatic: true,
      });
      deleteIds.push(image.id);
      continue;
    }

    if (image.reachable === false) {
      issues.push({
        id: image.id,
        type: 'unreachable_url',
        severity: 'error',
        label: image.label,
        imageUrl: image.imageUrl,
        message: 'No se pudo descargar la imagen; debe revisarse antes de eliminarla.',
        automatic: false,
      });
    }

    const contentIdentity = image.contentHash ?? image.imageUrl;
    const duplicateKey = `${normalizedLabel}|${contentIdentity}`;
    const originalDuplicate = seenDuplicateKeys.get(duplicateKey);

    if (originalDuplicate) {
      issues.push({
        id: image.id,
        type: 'exact_duplicate',
        severity: 'warning',
        label: image.label,
        imageUrl: image.imageUrl,
        message: `Duplica exactamente el registro ${originalDuplicate}.`,
        automatic: true,
      });
      deleteIds.push(image.id);
      continue;
    }

    seenDuplicateKeys.set(duplicateKey, image.id);

    const previousLabel = seenUrls.get(contentIdentity);
    if (previousLabel && previousLabel !== normalizedLabel) {
      issues.push({
        id: image.id,
        type: 'label_conflict',
        severity: 'error',
        label: image.label,
        imageUrl: image.imageUrl,
        message: 'El mismo contenido aparece con etiquetas diferentes.',
        automatic: false,
      });
    } else {
      seenUrls.set(contentIdentity, normalizedLabel);
    }

    if (!ingredient) {
      issues.push({
        id: image.id,
        type: 'unknown_label',
        severity: 'warning',
        label: image.label,
        imageUrl: image.imageUrl,
        message: 'La etiqueta no coincide con un ingrediente del catálogo.',
        automatic: false,
      });
      continue;
    }

    if (image.label !== ingredient.name || image.ingredientId !== ingredient.id) {
      issues.push({
        id: image.id,
        type: image.ingredientId ? 'inconsistent_label' : 'missing_ingredient',
        severity: 'warning',
        label: image.label,
        imageUrl: image.imageUrl,
        message: `Se normalizará como "${ingredient.name}" y se vinculará al catálogo.`,
        automatic: true,
      });
      updates.push({ id: image.id, label: ingredient.name, ingredientId: ingredient.id });
    }
  }

  return { issues, updates, deleteIds };
}

export function buildReviewGroups(images, ingredients) {
  const ingredientByName = new Map(
    ingredients.map((ingredient) => [normalizeLabel(ingredient.name), ingredient]),
  );
  const duplicatesByContent = new Map();
  const labelsByName = new Map();

  for (const image of images) {
    if (isValidImageUrl(image.imageUrl ?? '')) {
      const contentIdentity = image.contentHash ?? image.imageUrl;
      const duplicateItems = duplicatesByContent.get(contentIdentity) ?? [];
      duplicateItems.push(image);
      duplicatesByContent.set(contentIdentity, duplicateItems);
    }

    const normalizedLabel = normalizeLabel(image.label ?? '');
    const labelItems = labelsByName.get(normalizedLabel) ?? [];
    labelItems.push(image);
    labelsByName.set(normalizedLabel, labelItems);
  }

  const duplicateGroups = [...duplicatesByContent.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => {
      const sortedItems = [...items].sort(
        (left, right) => Date.parse(left.createdAt ?? '') - Date.parse(right.createdAt ?? ''),
      );

      return {
        key,
        keepId: sortedItems[0].id,
        items: sortedItems.map((item) => ({
          id: item.id,
          label: item.label,
          imageUrl: item.imageUrl,
          createdAt: item.createdAt,
        })),
      };
    });

  const labelGroups = [...labelsByName.entries()]
    .map(([normalizedLabel, items]) => {
      const ingredient = ingredientByName.get(normalizedLabel);
      const counts = new Map();

      for (const item of items) {
        counts.set(item.label, (counts.get(item.label) ?? 0) + 1);
      }

      const variants = [...counts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
      const options = [...new Set([ingredient?.name, ...variants.map((variant) => variant.label)])]
        .filter(Boolean);
      const inconsistent =
        variants.length > 1 ||
        (ingredient &&
          items.some(
            (item) => item.label !== ingredient.name || item.ingredientId !== ingredient.id,
          ));

      return {
        normalizedLabel,
        suggestedLabel: ingredient?.name ?? variants[0]?.label,
        ingredientId: ingredient?.id ?? null,
        affectedCount: items.length,
        variants,
        options,
        inconsistent,
      };
    })
    .filter((group) => group.inconsistent);

  return { duplicateGroups, labelGroups };
}

// servicio para manejar las imágenes de entrenamiento
export const trainingImageService = {
  // llamamos al repositorio para obtener las imágenes de entrenamiento
  async listTrainingImages({ ingredientId, page = 1, pageSize = 10 }) {
    return trainingImageRepository.findPaginated({
      ingredientId,
      page: Math.max(1, Number(page)),
      pageSize: Math.min(48, Math.max(1, Number(pageSize))),
    });
  },

  // llamamos al servicio para subir una imagen de entrenamiento
  async uploadTrainingImage(data, file) {
    // verificamos que se haya enviado una imagen
    if (!file) {
      throw new AppError('Image file is required', 400);
    }

    // buscamos si existe un ingrediente con la misma etiqueta
    const ingredient = await ingredientRepository.findByName(data.label);

    // subimos la imagen a cloudinary
    const uploadResult = await cloudinaryService.uploadImage(file);

    // guardamos el registro de la imagen
    return trainingImageRepository.create({
      ingredientId: ingredient?.id ?? null,
      label: data.label,
      imageUrl: uploadResult.secure_url,
    });
  },

  // llamamos al repositorio para obtener una imagen de entrenamiento por su id
  async getTrainingImage(id) {
    const trainingImage = await trainingImageRepository.findById(id);

    if (!trainingImage) {
      // si la imagen no existe, lanzamos un error
      throw new AppError('Training image not found', 404);
    }

    return trainingImage;
  },

  // llamamos al repositorio para obtener el dataset de entrenamiento
  async getDataset() {
    return trainingImageRepository.getDataset();
  },

  async analyzeDataset() {
    const [rawImages, ingredients] = await Promise.all([
      trainingImageRepository.findAll(),
      ingredientRepository.findAll(),
    ]);
    const images = await inspectImages(rawImages);
    const plan = buildCleanupPlan(images, ingredients);
    const reviewGroups = buildReviewGroups(images, ingredients);

    return {
      analyzedAt: new Date().toISOString(),
      totalImages: images.length,
      issueCount: plan.issues.length,
      automaticFixCount: plan.updates.length + plan.deleteIds.length,
      manualReviewCount: plan.issues.filter((issue) => !issue.automatic).length,
      clean: plan.issues.length === 0,
      issues: plan.issues,
      ...reviewGroups,
    };
  },

  async cleanupDataset({ deleteDuplicateIds, labelChoices }) {
    const [rawImages, ingredients] = await Promise.all([
      trainingImageRepository.findAll(),
      ingredientRepository.findAll(),
    ]);
    const images = await inspectImages(rawImages);
    const reviewGroups = buildReviewGroups(images, ingredients);
    const duplicateById = new Map(
      reviewGroups.duplicateGroups.flatMap((group) =>
        group.items.map((item) => [item.id, group]),
      ),
    );
    const requestedDeleteIds = [...new Set(deleteDuplicateIds)];

    for (const id of requestedDeleteIds) {
      if (!duplicateById.has(id)) {
        throw new AppError('Solo se pueden eliminar duplicados detectados.', 400);
      }
    }

    for (const group of reviewGroups.duplicateGroups) {
      const remaining = group.items.filter((item) => !requestedDeleteIds.includes(item.id));
      if (!remaining.length) {
        throw new AppError('Cada grupo duplicado debe conservar al menos una imagen.', 400);
      }
    }

    const labelGroupByKey = new Map(
      reviewGroups.labelGroups.map((group) => [group.normalizedLabel, group]),
    );
    const imageById = new Map(images.map((image) => [image.id, image]));
    const updates = [];

    for (const choice of labelChoices) {
      const group = labelGroupByKey.get(choice.normalizedLabel);
      if (!group || !group.options.includes(choice.label)) {
        throw new AppError('La opción elegida no pertenece al grupo de etiquetas.', 400);
      }

      for (const image of images) {
        if (
          normalizeLabel(image.label ?? '') === choice.normalizedLabel &&
          !requestedDeleteIds.includes(image.id)
        ) {
          updates.push({
            id: image.id,
            label: choice.label,
            ingredientId: group.ingredientId,
          });
        }
      }
    }

    const result = await trainingImageRepository.applyCleanup({
      updates,
      deleteIds: requestedDeleteIds.filter((id) => imageById.has(id)),
    });

    return {
      cleanedAt: new Date().toISOString(),
      analyzedImages: images.length,
      normalizedOrLinked: result.updated,
      deletedInvalidOrDuplicate: result.deleted,
      manualReviewCount: 0,
      remainingIssues: [],
    };
  },

  // llamamos al repositorio para eliminar una imagen de entrenamiento
  async deleteTrainingImage(id) {
    const deleted = await trainingImageRepository.delete(id);

    if (!deleted) {
      // si la imagen no existe, lanzamos un error
      throw new AppError('Training image not found', 404);
    }
  },

  // llamamos al repositorio para actualizar una imagen de entrenamiento
  async updateTrainingImage(id, data) {
    // buscamos si existe un ingrediente con la misma etiqueta
    const ingredient = await ingredientRepository.findByName(data.label);

    const trainingImage = await trainingImageRepository.update(id, {
      label: data.label,
      ingredientId: ingredient?.id ?? null,
    });

    if (!trainingImage) {
      // si la imagen no existe, lanzamos un error
      throw new AppError('Training image not found', 404);
    }

    return trainingImage;
  },
};
