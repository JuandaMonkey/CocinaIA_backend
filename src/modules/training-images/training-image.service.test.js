import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCleanupPlan } from './training-image.service.js';

const ingredients = [
  { id: 'ingredient-tomato', name: 'Tomate' },
  { id: 'ingredient-potato', name: 'Papa' },
];

test('normaliza etiquetas y vincula ingredientes conocidos', () => {
  const plan = buildCleanupPlan(
    [
      {
        id: 'image-1',
        ingredientId: null,
        label: '  tomate  ',
        imageUrl: 'https://example.com/tomato.jpg',
      },
    ],
    ingredients,
  );

  assert.deepEqual(plan.updates, [
    {
      id: 'image-1',
      label: 'Tomate',
      ingredientId: 'ingredient-tomato',
    },
  ]);
  assert.equal(plan.issues[0].type, 'missing_ingredient');
});

test('elimina solamente duplicados con URL y etiqueta equivalentes', () => {
  const plan = buildCleanupPlan(
    [
      {
        id: 'image-1',
        ingredientId: 'ingredient-potato',
        label: 'Papa',
        imageUrl: 'https://example.com/potato.jpg',
      },
      {
        id: 'image-2',
        ingredientId: 'ingredient-potato',
        label: 'papa',
        imageUrl: 'https://example.com/potato.jpg',
      },
    ],
    ingredients,
  );

  assert.deepEqual(plan.deleteIds, ['image-2']);
  assert.equal(plan.issues.at(-1).type, 'exact_duplicate');
});

test('detecta contenido duplicado aunque las URLs sean diferentes', () => {
  const plan = buildCleanupPlan(
    [
      {
        id: 'image-1',
        ingredientId: 'ingredient-potato',
        label: 'Papa',
        imageUrl: 'https://example.com/potato-a.jpg',
        contentHash: 'same-content',
      },
      {
        id: 'image-2',
        ingredientId: 'ingredient-potato',
        label: 'Papa',
        imageUrl: 'https://example.com/potato-b.jpg',
        contentHash: 'same-content',
      },
    ],
    ingredients,
  );

  assert.deepEqual(plan.deleteIds, ['image-2']);
  assert.equal(plan.issues.at(-1).type, 'exact_duplicate');
});

test('deja para revision manual una URL usada por etiquetas distintas', () => {
  const plan = buildCleanupPlan(
    [
      {
        id: 'image-1',
        ingredientId: 'ingredient-potato',
        label: 'Papa',
        imageUrl: 'https://example.com/shared.jpg',
      },
      {
        id: 'image-2',
        ingredientId: 'ingredient-tomato',
        label: 'Tomate',
        imageUrl: 'https://example.com/shared.jpg',
      },
    ],
    ingredients,
  );

  assert.deepEqual(plan.deleteIds, []);
  assert.equal(plan.issues[0].type, 'label_conflict');
  assert.equal(plan.issues[0].automatic, false);
});

test('marca URLs invalidas para eliminacion automatica', () => {
  const plan = buildCleanupPlan(
    [
      {
        id: 'image-1',
        ingredientId: 'ingredient-tomato',
        label: 'Tomate',
        imageUrl: '',
      },
    ],
    ingredients,
  );

  assert.deepEqual(plan.deleteIds, ['image-1']);
  assert.equal(plan.issues[0].type, 'invalid_url');
});
