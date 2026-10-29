import { pool, query } from '../src/config/database.js';

const sql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'user';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users
        ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'));
    END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS kitchens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL,
    base_unit VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pantry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id UUID NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(30) NOT NULL,
    expiration_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    instructions TEXT,
    prep_time_minutes INT CHECK (prep_time_minutes >= 0),
    difficulty VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2),
    unit VARCHAR(30),
    required BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_type VARCHAR(80) NOT NULL,
    value VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
    label VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE refresh_tokens
ADD COLUMN IF NOT EXISTS user_agent TEXT;

ALTER TABLE refresh_tokens
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(80);

CREATE TABLE IF NOT EXISTS global_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(50) NOT NULL UNIQUE,
    model_url TEXT NOT NULL,
    weights_url TEXT NOT NULL,
    labels_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kitchen_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id UUID NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
    base_model_id UUID REFERENCES global_models(id) ON DELETE SET NULL,
    version VARCHAR(50) NOT NULL,
    model_url TEXT NOT NULL,
    weights_url TEXT NOT NULL,
    labels_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kitchen_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id UUID NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
    preference_type VARCHAR(80) NOT NULL,
    value VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_learning_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR(20) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    kitchen_id UUID REFERENCES kitchens(id) ON DELETE CASCADE,
    version VARCHAR(80) NOT NULL,
    model_data JSONB NOT NULL,
    model_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id UUID NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    recipe_name VARCHAR(150) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    cooked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT
);

ALTER TABLE recipe_history
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'finished';

ALTER TABLE recipe_history
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;

ALTER TABLE recipe_history
ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP;

ALTER TABLE recipe_history
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

UPDATE recipe_history rh
SET user_id = k.user_id
FROM kitchens k
WHERE rh.kitchen_id = k.id
AND rh.user_id IS NULL;

CREATE TABLE IF NOT EXISTS recipe_history_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_history_id UUID NOT NULL REFERENCES recipe_history(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_history_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_history_id UUID NOT NULL REFERENCES recipe_history(id) ON DELETE CASCADE,
    step_number INT NOT NULL CHECK (step_number > 0),
    instruction TEXT NOT NULL,
    UNIQUE (recipe_history_id, step_number)
);

CREATE TABLE IF NOT EXISTS ingredient_usage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id UUID NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
    recipe_history_id UUID REFERENCES recipe_history(id) ON DELETE SET NULL,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(30) NOT NULL,
    used_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kitchens_user_id ON kitchens(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_kitchen_id ON pantry_items(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_ingredient_id ON pantry_items(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_training_images_ingredient_id ON training_images(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_kitchen_models_kitchen_id ON kitchen_models(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_preferences_kitchen_id ON kitchen_preferences(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_recipe_learning_models_scope ON recipe_learning_models(scope);
CREATE INDEX IF NOT EXISTS idx_recipe_learning_models_user_id ON recipe_learning_models(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_learning_models_kitchen_id ON recipe_learning_models(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_recipe_history_kitchen_id ON recipe_history(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_recipe_history_user_id ON recipe_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_history_ingredients_history_id ON recipe_history_ingredients(recipe_history_id);
CREATE INDEX IF NOT EXISTS idx_recipe_history_ingredients_ingredient_id ON recipe_history_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_history_steps_history_id ON recipe_history_steps(recipe_history_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_usage_history_kitchen_id ON ingredient_usage_history(kitchen_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_usage_history_ingredient_id ON ingredient_usage_history(ingredient_id);

DROP FUNCTION IF EXISTS fn_create_refresh_token(UUID, TEXT, TIMESTAMP);
DROP FUNCTION IF EXISTS fn_create_refresh_token(UUID, TEXT, TIMESTAMP, TEXT, VARCHAR);
DROP FUNCTION IF EXISTS fn_get_valid_refresh_token(TEXT);
DROP FUNCTION IF EXISTS fn_get_active_refresh_tokens_by_user(UUID);
DROP FUNCTION IF EXISTS fn_revoke_refresh_token(TEXT);
DROP FUNCTION IF EXISTS fn_revoke_refresh_token_by_id(UUID, UUID);
DROP FUNCTION IF EXISTS fn_revoke_all_refresh_tokens_by_user(UUID);
DROP FUNCTION IF EXISTS fn_delete_expired_refresh_tokens();
DROP FUNCTION IF EXISTS fn_get_recipe_history_with_ingredients(UUID);
DROP FUNCTION IF EXISTS fn_get_user_recipe_history_with_ingredients(UUID);
DROP FUNCTION IF EXISTS fn_get_recipe_history_by_id(UUID);
DROP FUNCTION IF EXISTS fn_get_recipe_history_kitchen_id(UUID);
DROP FUNCTION IF EXISTS fn_delete_recipe_history(UUID);
DROP FUNCTION IF EXISTS fn_get_kitchen_insights(UUID);
DROP FUNCTION IF EXISTS fn_repeat_recipe_history(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS fn_rebuild_recipe_learning_models(UUID, UUID);
DROP FUNCTION IF EXISTS fn_get_active_recipe_learning_models(UUID, UUID);
DROP FUNCTION IF EXISTS fn_get_recipe_learning_models(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS fn_set_recipe_learning_model_url(UUID, TEXT);
DROP FUNCTION IF EXISTS fn_create_recipe_history_with_ingredients(UUID, UUID, VARCHAR, INT, TEXT, JSONB);
DROP FUNCTION IF EXISTS fn_create_recipe_history_with_ingredients(UUID, UUID, VARCHAR, INT, TEXT, JSONB, JSONB);
DROP FUNCTION IF EXISTS fn_create_recipe_history_with_ingredients(UUID, UUID, UUID, VARCHAR, INT, TEXT, JSONB, JSONB);
DROP FUNCTION IF EXISTS fn_start_recipe_history(UUID);
DROP FUNCTION IF EXISTS fn_finish_recipe_history(UUID);

CREATE OR REPLACE FUNCTION fn_get_global_models()
RETURNS TABLE (
    id UUID,
    version VARCHAR,
    model_url TEXT,
    weights_url TEXT,
    labels_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT gm.id, gm.version, gm.model_url, gm.weights_url, gm.labels_url, gm.is_active, gm.created_at
    FROM global_models gm
    ORDER BY gm.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_refresh_token(
    p_user_id UUID,
    p_token_hash TEXT,
    p_expires_at TIMESTAMP,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address VARCHAR DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_refresh_token_id UUID;
BEGIN
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
    VALUES (p_user_id, p_token_hash, p_expires_at, p_user_agent, p_ip_address)
    RETURNING id INTO v_refresh_token_id;

    RETURN v_refresh_token_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_valid_refresh_token(p_token_hash TEXT)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    token_hash TEXT,
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT rt.id, rt.user_id, rt.token_hash, rt.expires_at, rt.revoked_at, rt.created_at,
           rt.user_agent, rt.ip_address
    FROM refresh_tokens rt
    WHERE rt.token_hash = p_token_hash
    AND rt.revoked_at IS NULL
    AND rt.expires_at > NOW();
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_active_refresh_tokens_by_user(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT rt.id, rt.user_id, rt.expires_at, rt.created_at, rt.user_agent, rt.ip_address
    FROM refresh_tokens rt
    WHERE rt.user_id = p_user_id
    AND rt.revoked_at IS NULL
    AND rt.expires_at > NOW()
    ORDER BY rt.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_revoke_refresh_token(p_token_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = p_token_hash
    AND revoked_at IS NULL;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_revoke_refresh_token_by_id(
    p_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE id = p_id
    AND user_id = p_user_id
    AND revoked_at IS NULL;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_revoke_all_refresh_tokens_by_user(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = p_user_id
    AND revoked_at IS NULL;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_expired_refresh_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM refresh_tokens
    WHERE expires_at <= NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_active_global_model()
RETURNS TABLE (
    id UUID,
    version VARCHAR,
    model_url TEXT,
    weights_url TEXT,
    labels_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT gm.id, gm.version, gm.model_url, gm.weights_url, gm.labels_url, gm.is_active, gm.created_at
    FROM global_models gm
    WHERE gm.is_active = TRUE
    ORDER BY gm.created_at DESC
    LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_global_model(
    p_version VARCHAR,
    p_model_url TEXT,
    p_weights_url TEXT,
    p_labels_url TEXT,
    p_is_active BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_model_id UUID;
BEGIN
    IF p_is_active THEN
        UPDATE global_models SET is_active = FALSE;
    END IF;

    INSERT INTO global_models (version, model_url, weights_url, labels_url, is_active)
    VALUES (p_version, p_model_url, p_weights_url, p_labels_url, p_is_active)
    RETURNING id INTO v_model_id;

    RETURN v_model_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_activate_global_model(p_model_id UUID)
RETURNS TABLE (
    id UUID,
    version VARCHAR,
    model_url TEXT,
    weights_url TEXT,
    labels_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM global_models gm WHERE gm.id = p_model_id) THEN
        RAISE EXCEPTION 'Global model not found';
    END IF;

    UPDATE global_models SET is_active = FALSE;
    UPDATE global_models SET is_active = TRUE WHERE global_models.id = p_model_id;

    RETURN QUERY
    SELECT gm.id, gm.version, gm.model_url, gm.weights_url, gm.labels_url, gm.is_active, gm.created_at
    FROM global_models gm
    WHERE gm.id = p_model_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_kitchen_models(p_kitchen_id UUID)
RETURNS TABLE (
    id UUID,
    kitchen_id UUID,
    base_model_id UUID,
    version VARCHAR,
    model_url TEXT,
    weights_url TEXT,
    labels_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT km.id, km.kitchen_id, km.base_model_id, km.version, km.model_url, km.weights_url,
           km.labels_url, km.is_active, km.created_at
    FROM kitchen_models km
    WHERE km.kitchen_id = p_kitchen_id
    ORDER BY km.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_active_kitchen_model(p_kitchen_id UUID)
RETURNS TABLE (
    id UUID,
    kitchen_id UUID,
    base_model_id UUID,
    version VARCHAR,
    model_url TEXT,
    weights_url TEXT,
    labels_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT km.id, km.kitchen_id, km.base_model_id, km.version, km.model_url, km.weights_url,
           km.labels_url, km.is_active, km.created_at
    FROM kitchen_models km
    WHERE km.kitchen_id = p_kitchen_id
    AND km.is_active = TRUE
    ORDER BY km.created_at DESC
    LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_kitchen_model(
    p_kitchen_id UUID,
    p_base_model_id UUID,
    p_version VARCHAR,
    p_model_url TEXT,
    p_weights_url TEXT,
    p_labels_url TEXT,
    p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_model_id UUID;
BEGIN
    IF p_is_active THEN
        UPDATE kitchen_models SET is_active = FALSE WHERE kitchen_id = p_kitchen_id;
    END IF;

    INSERT INTO kitchen_models (
        kitchen_id, base_model_id, version, model_url, weights_url, labels_url, is_active
    )
    VALUES (
        p_kitchen_id, p_base_model_id, p_version, p_model_url, p_weights_url, p_labels_url, p_is_active
    )
    RETURNING id INTO v_model_id;

    RETURN v_model_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_kitchen_preferences(p_kitchen_id UUID)
RETURNS TABLE (
    id UUID,
    kitchen_id UUID,
    preference_type VARCHAR,
    value VARCHAR,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT kp.id, kp.kitchen_id, kp.preference_type, kp.value, kp.created_at
    FROM kitchen_preferences kp
    WHERE kp.kitchen_id = p_kitchen_id
    ORDER BY kp.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_kitchen_preference(
    p_kitchen_id UUID,
    p_preference_type VARCHAR,
    p_value VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_preference_id UUID;
BEGIN
    INSERT INTO kitchen_preferences (kitchen_id, preference_type, value)
    VALUES (p_kitchen_id, p_preference_type, p_value)
    RETURNING id INTO v_preference_id;

    RETURN v_preference_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_kitchen_preference(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM kitchen_preferences WHERE id = p_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_recipe_history(p_kitchen_id UUID)
RETURNS TABLE (
    id UUID,
    kitchen_id UUID,
    recipe_id UUID,
    recipe_name VARCHAR,
    rating INT,
    cooked_at TIMESTAMP,
    notes TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT rh.id, rh.kitchen_id, rh.recipe_id, rh.recipe_name, rh.rating, rh.cooked_at, rh.notes
    FROM recipe_history rh
    WHERE rh.kitchen_id = p_kitchen_id
    ORDER BY rh.cooked_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_recipe_history(
    p_kitchen_id UUID,
    p_recipe_id UUID,
    p_recipe_name VARCHAR,
    p_rating INT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_history_id UUID;
BEGIN
    INSERT INTO recipe_history (kitchen_id, recipe_id, recipe_name, rating, notes)
    VALUES (p_kitchen_id, p_recipe_id, p_recipe_name, p_rating, p_notes)
    RETURNING id INTO v_history_id;

    RETURN v_history_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_recipe_history_with_ingredients(p_kitchen_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    kitchen_id UUID,
    recipe_id UUID,
    recipe_name VARCHAR,
    rating INT,
    cooked_at TIMESTAMP,
    notes TEXT,
    status VARCHAR,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    ingredients JSONB,
    steps JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rh.id,
        rh.user_id,
        rh.kitchen_id,
        rh.recipe_id,
        rh.recipe_name,
        rh.rating,
        rh.cooked_at,
        rh.notes,
        rh.status,
        rh.started_at,
        rh.finished_at,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'ingredientId', rhi.ingredient_id,
                    'ingredientName', i.name,
                    'quantity', rhi.quantity,
                    'unit', rhi.unit
                )
                ORDER BY i.name
            ) FILTER (WHERE rhi.id IS NOT NULL),
            '[]'::jsonb
        ) AS ingredients,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', rhs.id,
                        'stepNumber', rhs.step_number,
                        'instruction', rhs.instruction
                    )
                    ORDER BY rhs.step_number
                )
                FROM recipe_history_steps rhs
                WHERE rhs.recipe_history_id = rh.id
            ),
            '[]'::jsonb
        ) AS steps
    FROM recipe_history rh
    LEFT JOIN recipe_history_ingredients rhi ON rhi.recipe_history_id = rh.id
    LEFT JOIN ingredients i ON i.id = rhi.ingredient_id
    WHERE rh.kitchen_id = p_kitchen_id
    GROUP BY rh.id
    ORDER BY rh.cooked_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_user_recipe_history_with_ingredients(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    kitchen_id UUID,
    recipe_id UUID,
    recipe_name VARCHAR,
    rating INT,
    cooked_at TIMESTAMP,
    notes TEXT,
    status VARCHAR,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    ingredients JSONB,
    steps JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rh.id,
        rh.user_id,
        rh.kitchen_id,
        rh.recipe_id,
        rh.recipe_name,
        rh.rating,
        rh.cooked_at,
        rh.notes,
        rh.status,
        rh.started_at,
        rh.finished_at,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'ingredientId', rhi.ingredient_id,
                    'ingredientName', i.name,
                    'quantity', rhi.quantity,
                    'unit', rhi.unit
                )
                ORDER BY i.name
            ) FILTER (WHERE rhi.id IS NOT NULL),
            '[]'::jsonb
        ) AS ingredients,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', rhs.id,
                        'stepNumber', rhs.step_number,
                        'instruction', rhs.instruction
                    )
                    ORDER BY rhs.step_number
                )
                FROM recipe_history_steps rhs
                WHERE rhs.recipe_history_id = rh.id
            ),
            '[]'::jsonb
        ) AS steps
    FROM recipe_history rh
    LEFT JOIN recipe_history_ingredients rhi ON rhi.recipe_history_id = rh.id
    LEFT JOIN ingredients i ON i.id = rhi.ingredient_id
    WHERE rh.user_id = p_user_id
    GROUP BY rh.id
    ORDER BY rh.cooked_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_recipe_history_by_id(p_history_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    kitchen_id UUID,
    recipe_id UUID,
    recipe_name VARCHAR,
    rating INT,
    cooked_at TIMESTAMP,
    notes TEXT,
    status VARCHAR,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    ingredients JSONB,
    steps JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rh.id,
        rh.user_id,
        rh.kitchen_id,
        rh.recipe_id,
        rh.recipe_name,
        rh.rating,
        rh.cooked_at,
        rh.notes,
        rh.status,
        rh.started_at,
        rh.finished_at,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'ingredientId', rhi.ingredient_id,
                    'ingredientName', i.name,
                    'quantity', rhi.quantity,
                    'unit', rhi.unit
                )
                ORDER BY i.name
            ) FILTER (WHERE rhi.id IS NOT NULL),
            '[]'::jsonb
        ) AS ingredients,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', rhs.id,
                        'stepNumber', rhs.step_number,
                        'instruction', rhs.instruction
                    )
                    ORDER BY rhs.step_number
                )
                FROM recipe_history_steps rhs
                WHERE rhs.recipe_history_id = rh.id
            ),
            '[]'::jsonb
        ) AS steps
    FROM recipe_history rh
    LEFT JOIN recipe_history_ingredients rhi ON rhi.recipe_history_id = rh.id
    LEFT JOIN ingredients i ON i.id = rhi.ingredient_id
    WHERE rh.id = p_history_id
    GROUP BY rh.id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_recipe_history_kitchen_id(p_history_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_kitchen_id UUID;
BEGIN
    SELECT rh.kitchen_id INTO v_kitchen_id
    FROM recipe_history rh
    WHERE rh.id = p_history_id;

    RETURN v_kitchen_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_recipe_history(p_history_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM recipe_history
    WHERE id = p_history_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_recipe_history_with_ingredients(
    p_user_id UUID,
    p_kitchen_id UUID,
    p_recipe_id UUID,
    p_recipe_name VARCHAR,
    p_rating INT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_ingredients JSONB DEFAULT '[]'::jsonb,
    p_steps JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_history_id UUID;
    v_item JSONB;
    v_ingredient_id UUID;
    v_quantity NUMERIC;
    v_unit VARCHAR;
    v_step_number INT;
    v_instruction TEXT;
BEGIN
    INSERT INTO recipe_history (user_id, kitchen_id, recipe_id, recipe_name, rating, notes, status)
    VALUES (p_user_id, p_kitchen_id, p_recipe_id, p_recipe_name, p_rating, p_notes, 'planned')
    RETURNING id INTO v_history_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_ingredients, '[]'::jsonb))
    LOOP
        v_ingredient_id := (v_item ->> 'ingredientId')::UUID;
        v_quantity := (v_item ->> 'quantity')::NUMERIC;
        v_unit := TRIM(v_item ->> 'unit');

        IF v_ingredient_id IS NOT NULL AND v_quantity > 0 AND v_unit <> '' THEN
            INSERT INTO recipe_history_ingredients (
                recipe_history_id,
                ingredient_id,
                quantity,
                unit
            )
            VALUES (
                v_history_id,
                v_ingredient_id,
                v_quantity,
                v_unit
            );
        END IF;
    END LOOP;

    FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_steps, '[]'::jsonb))
    LOOP
        v_step_number := (v_item ->> 'stepNumber')::INT;
        v_instruction := TRIM(v_item ->> 'instruction');

        IF v_step_number > 0 AND v_instruction <> '' THEN
            INSERT INTO recipe_history_steps (
                recipe_history_id,
                step_number,
                instruction
            )
            VALUES (
                v_history_id,
                v_step_number,
                v_instruction
            );
        END IF;
    END LOOP;

    RETURN v_history_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_start_recipe_history(p_history_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE recipe_history
    SET
        status = 'in_progress',
        started_at = COALESCE(started_at, NOW())
    WHERE id = p_history_id
    AND status <> 'finished';

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_repeat_recipe_history(
    p_source_history_id UUID,
    p_target_kitchen_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_history_id UUID;
BEGIN
    UPDATE recipe_history
    SET
        kitchen_id = p_target_kitchen_id,
        status = 'in_progress',
        started_at = NOW(),
        finished_at = NULL
    WHERE id = p_source_history_id
    AND user_id = p_user_id
    RETURNING id INTO v_history_id;

    IF v_history_id IS NULL THEN
        RAISE EXCEPTION 'Recipe history not found';
    END IF;

    RETURN v_history_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_rebuild_recipe_learning_models(
    p_user_id UUID,
    p_kitchen_id UUID
)
RETURNS TABLE (
    id UUID,
    scope VARCHAR,
    user_id UUID,
    kitchen_id UUID,
    version VARCHAR,
    model_data JSONB,
    model_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_global_id UUID;
    v_user_model_id UUID;
    v_kitchen_model_id UUID;
    v_version VARCHAR;
BEGIN
    v_version := 'recipe-' || to_char(NOW(), 'YYYYMMDDHH24MISSMS');

    UPDATE recipe_learning_models rlm
    SET is_active = FALSE
    WHERE rlm.scope = 'global'
    OR (rlm.scope = 'user' AND rlm.user_id = p_user_id)
    OR (rlm.scope = 'kitchen' AND rlm.kitchen_id = p_kitchen_id);

    INSERT INTO recipe_learning_models (scope, version, model_data)
    VALUES (
        'global',
        v_version || '-global',
        jsonb_build_object(
            'scope', 'global',
            'generatedAt', NOW(),
            'recipes', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'recipeName', recipe_name,
                        'timesCooked', times_cooked,
                        'avgRating', avg_rating,
                        'lastCookedAt', last_cooked_at
                    )
                    ORDER BY times_cooked DESC, last_cooked_at DESC
                )
                FROM (
                    SELECT
                        rh.recipe_name,
                        COUNT(*)::INT AS times_cooked,
                        ROUND(AVG(rh.rating)::NUMERIC, 2) AS avg_rating,
                        MAX(rh.cooked_at) AS last_cooked_at
                    FROM recipe_history rh
                    WHERE rh.status = 'finished'
                    GROUP BY rh.recipe_name
                    LIMIT 50
                ) recipes
            ), '[]'::jsonb),
            'ingredients', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'ingredientId', ingredient_id,
                        'ingredientName', ingredient_name,
                        'timesUsed', times_used,
                        'totalQuantity', total_quantity,
                        'unit', unit
                    )
                    ORDER BY times_used DESC, total_quantity DESC
                )
                FROM (
                    SELECT
                        i.id AS ingredient_id,
                        i.name AS ingredient_name,
                        COUNT(*)::INT AS times_used,
                        SUM(iuh.quantity)::NUMERIC AS total_quantity,
                        iuh.unit
                    FROM ingredient_usage_history iuh
                    INNER JOIN ingredients i ON i.id = iuh.ingredient_id
                    GROUP BY i.id, i.name, iuh.unit
                    LIMIT 50
                ) ingredients
            ), '[]'::jsonb)
        )
    )
    RETURNING recipe_learning_models.id INTO v_global_id;

    INSERT INTO recipe_learning_models (scope, user_id, version, model_data)
    VALUES (
        'user',
        p_user_id,
        v_version || '-user',
        jsonb_build_object(
            'scope', 'user',
            'userId', p_user_id,
            'generatedAt', NOW(),
            'recipes', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'recipeName', recipe_name,
                        'timesCooked', times_cooked,
                        'avgRating', avg_rating,
                        'lastCookedAt', last_cooked_at
                    )
                    ORDER BY times_cooked DESC, last_cooked_at DESC
                )
                FROM (
                    SELECT
                        rh.recipe_name,
                        COUNT(*)::INT AS times_cooked,
                        ROUND(AVG(rh.rating)::NUMERIC, 2) AS avg_rating,
                        MAX(rh.cooked_at) AS last_cooked_at
                    FROM recipe_history rh
                    WHERE rh.status = 'finished'
                    AND rh.user_id = p_user_id
                    GROUP BY rh.recipe_name
                    LIMIT 50
                ) recipes
            ), '[]'::jsonb),
            'ingredients', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'ingredientId', ingredient_id,
                        'ingredientName', ingredient_name,
                        'timesUsed', times_used,
                        'totalQuantity', total_quantity,
                        'unit', unit
                    )
                    ORDER BY times_used DESC, total_quantity DESC
                )
                FROM (
                    SELECT
                        i.id AS ingredient_id,
                        i.name AS ingredient_name,
                        COUNT(*)::INT AS times_used,
                        SUM(iuh.quantity)::NUMERIC AS total_quantity,
                        iuh.unit
                    FROM ingredient_usage_history iuh
                    INNER JOIN ingredients i ON i.id = iuh.ingredient_id
                    INNER JOIN recipe_history rh ON rh.id = iuh.recipe_history_id
                    WHERE rh.user_id = p_user_id
                    GROUP BY i.id, i.name, iuh.unit
                    LIMIT 50
                ) ingredients
            ), '[]'::jsonb)
        )
    )
    RETURNING recipe_learning_models.id INTO v_user_model_id;

    INSERT INTO recipe_learning_models (scope, user_id, kitchen_id, version, model_data)
    VALUES (
        'kitchen',
        p_user_id,
        p_kitchen_id,
        v_version || '-kitchen',
        jsonb_build_object(
            'scope', 'kitchen',
            'userId', p_user_id,
            'kitchenId', p_kitchen_id,
            'generatedAt', NOW(),
            'recipes', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'recipeName', recipe_name,
                        'timesCooked', times_cooked,
                        'avgRating', avg_rating,
                        'lastCookedAt', last_cooked_at
                    )
                    ORDER BY times_cooked DESC, last_cooked_at DESC
                )
                FROM (
                    SELECT
                        rh.recipe_name,
                        COUNT(*)::INT AS times_cooked,
                        ROUND(AVG(rh.rating)::NUMERIC, 2) AS avg_rating,
                        MAX(rh.cooked_at) AS last_cooked_at
                    FROM recipe_history rh
                    WHERE rh.status = 'finished'
                    AND rh.kitchen_id = p_kitchen_id
                    GROUP BY rh.recipe_name
                    LIMIT 50
                ) recipes
            ), '[]'::jsonb),
            'ingredients', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'ingredientId', ingredient_id,
                        'ingredientName', ingredient_name,
                        'timesUsed', times_used,
                        'totalQuantity', total_quantity,
                        'unit', unit
                    )
                    ORDER BY times_used DESC, total_quantity DESC
                )
                FROM (
                    SELECT
                        i.id AS ingredient_id,
                        i.name AS ingredient_name,
                        COUNT(*)::INT AS times_used,
                        SUM(iuh.quantity)::NUMERIC AS total_quantity,
                        iuh.unit
                    FROM ingredient_usage_history iuh
                    INNER JOIN ingredients i ON i.id = iuh.ingredient_id
                    WHERE iuh.kitchen_id = p_kitchen_id
                    GROUP BY i.id, i.name, iuh.unit
                    LIMIT 50
                ) ingredients
            ), '[]'::jsonb)
        )
    )
    RETURNING recipe_learning_models.id INTO v_kitchen_model_id;

    RETURN QUERY
    SELECT rlm.id, rlm.scope, rlm.user_id, rlm.kitchen_id, rlm.version,
           rlm.model_data, rlm.model_url, rlm.is_active, rlm.created_at
    FROM recipe_learning_models rlm
    WHERE rlm.id IN (v_global_id, v_user_model_id, v_kitchen_model_id)
    ORDER BY rlm.scope ASC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_active_recipe_learning_models(
    p_user_id UUID,
    p_kitchen_id UUID
)
RETURNS TABLE (
    id UUID,
    scope VARCHAR,
    user_id UUID,
    kitchen_id UUID,
    version VARCHAR,
    model_data JSONB,
    model_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT rlm.id, rlm.scope, rlm.user_id, rlm.kitchen_id, rlm.version,
           rlm.model_data, rlm.model_url, rlm.is_active, rlm.created_at
    FROM recipe_learning_models rlm
    WHERE rlm.is_active = TRUE
    AND (
        rlm.scope = 'global'
        OR (rlm.scope = 'user' AND rlm.user_id = p_user_id)
        OR (rlm.scope = 'kitchen' AND rlm.kitchen_id = p_kitchen_id)
    )
    ORDER BY rlm.scope ASC, rlm.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_recipe_learning_models(
    p_scope VARCHAR DEFAULT NULL,
    p_search VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    scope VARCHAR,
    user_id UUID,
    kitchen_id UUID,
    user_name VARCHAR,
    kitchen_name VARCHAR,
    version VARCHAR,
    model_data JSONB,
    model_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rlm.id,
        rlm.scope,
        rlm.user_id,
        rlm.kitchen_id,
        u.name AS user_name,
        k.name AS kitchen_name,
        rlm.version,
        rlm.model_data,
        rlm.model_url,
        rlm.is_active,
        rlm.created_at
    FROM recipe_learning_models rlm
    LEFT JOIN users u ON u.id = rlm.user_id
    LEFT JOIN kitchens k ON k.id = rlm.kitchen_id
    WHERE (p_scope IS NULL OR rlm.scope = p_scope)
    AND (
        p_search IS NULL
        OR p_search = ''
        OR LOWER(rlm.version) LIKE '%' || LOWER(p_search) || '%'
        OR LOWER(COALESCE(u.name, '')) LIKE '%' || LOWER(p_search) || '%'
        OR LOWER(COALESCE(u.email, '')) LIKE '%' || LOWER(p_search) || '%'
        OR LOWER(COALESCE(k.name, '')) LIKE '%' || LOWER(p_search) || '%'
    )
    ORDER BY rlm.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_set_recipe_learning_model_url(
    p_model_id UUID,
    p_model_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE recipe_learning_models
    SET model_url = p_model_url
    WHERE id = p_model_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_finish_recipe_history(p_history_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_kitchen_id UUID;
    v_item RECORD;
BEGIN
    SELECT kitchen_id INTO v_kitchen_id
    FROM recipe_history
    WHERE id = p_history_id
    AND status <> 'finished';

    IF v_kitchen_id IS NULL THEN
        RETURN FALSE;
    END IF;

    FOR v_item IN
        SELECT ingredient_id, quantity, unit
        FROM recipe_history_ingredients
        WHERE recipe_history_id = p_history_id
    LOOP
        INSERT INTO ingredient_usage_history (
            kitchen_id,
            recipe_history_id,
            ingredient_id,
            quantity,
            unit
        )
        VALUES (
            v_kitchen_id,
            p_history_id,
            v_item.ingredient_id,
            v_item.quantity,
            v_item.unit
        );

        UPDATE pantry_items
        SET
            quantity = GREATEST(quantity - v_item.quantity, 0),
            updated_at = NOW()
        WHERE id = (
            SELECT pi.id
            FROM pantry_items pi
            WHERE pi.kitchen_id = v_kitchen_id
            AND pi.ingredient_id = v_item.ingredient_id
            AND LOWER(pi.unit) = LOWER(v_item.unit)
            ORDER BY pi.created_at ASC
            LIMIT 1
        );
    END LOOP;

    UPDATE recipe_history
    SET
        status = 'finished',
        started_at = COALESCE(started_at, NOW()),
        finished_at = NOW(),
        cooked_at = NOW()
    WHERE id = p_history_id;

    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_kitchen_insights(p_kitchen_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT k.user_id INTO v_user_id
    FROM kitchens k
    WHERE k.id = p_kitchen_id;

    RETURN jsonb_build_object(
        'mostUsedIngredients',
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'ingredientId', usage.ingredient_id,
                        'ingredientName', usage.ingredient_name,
                        'totalQuantity', usage.total_quantity,
                        'unit', usage.unit,
                        'timesUsed', usage.times_used,
                        'lastUsedAt', usage.last_used_at
                    )
                    ORDER BY usage.times_used DESC, usage.total_quantity DESC
                )
                FROM (
                    SELECT
                        i.id AS ingredient_id,
                        i.name AS ingredient_name,
                        SUM(iuh.quantity)::NUMERIC AS total_quantity,
                        iuh.unit,
                        COUNT(*)::INT AS times_used,
                        MAX(iuh.used_at) AS last_used_at
                    FROM ingredient_usage_history iuh
                    INNER JOIN ingredients i ON i.id = iuh.ingredient_id
                    WHERE iuh.kitchen_id = p_kitchen_id
                    GROUP BY i.id, i.name, iuh.unit
                    ORDER BY times_used DESC, total_quantity DESC
                    LIMIT 8
                ) usage
            ),
            '[]'::jsonb
        ),
        'frequentRecipes',
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'recipeName', recipes.recipe_name,
                        'timesCooked', recipes.times_cooked,
                        'lastCookedAt', recipes.last_cooked_at
                    )
                    ORDER BY recipes.times_cooked DESC, recipes.last_cooked_at DESC
                )
                FROM (
                    SELECT recipe_name, COUNT(*)::INT AS times_cooked, MAX(cooked_at) AS last_cooked_at
                    FROM recipe_history
                    WHERE user_id = v_user_id
                    AND status = 'finished'
                    GROUP BY recipe_name
                    ORDER BY times_cooked DESC, last_cooked_at DESC
                    LIMIT 8
                ) recipes
            ),
            '[]'::jsonb
        ),
        'lowStockItems',
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', stock.id,
                        'ingredientName', stock.ingredient_name,
                        'quantity', stock.quantity,
                        'unit', stock.unit
                    )
                    ORDER BY stock.quantity ASC
                )
                FROM (
                    SELECT
                        pi.id,
                        i.name AS ingredient_name,
                        pi.quantity,
                        pi.unit
                    FROM pantry_items pi
                    INNER JOIN ingredients i ON i.id = pi.ingredient_id
                    WHERE pi.kitchen_id = p_kitchen_id
                    AND (
                        (LOWER(pi.unit) IN ('pieza', 'piezas') AND pi.quantity <= 2)
                        OR (LOWER(pi.unit) IN ('gramo', 'gramos', 'g', 'mililitro', 'mililitros', 'ml') AND pi.quantity <= 100)
                        OR (LOWER(pi.unit) NOT IN ('pieza', 'piezas', 'gramo', 'gramos', 'g', 'mililitro', 'mililitros', 'ml') AND pi.quantity <= 1)
                    )
                    ORDER BY pi.quantity ASC
                    LIMIT 8
                ) stock
            ),
            '[]'::jsonb
        ),
        'recommendations',
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'recipeName', recommendations.recipe_name,
                        'timesCooked', recommendations.times_cooked,
                        'ingredientCount', recommendations.ingredient_count,
                        'availableCount', recommendations.available_count,
                        'missing', recommendations.missing
                    )
                    ORDER BY recommendations.available_count DESC, recommendations.times_cooked DESC
                )
                FROM (
                    WITH recipe_totals AS (
                        SELECT
                            rh.recipe_name,
                            COUNT(DISTINCT rh.id)::INT AS times_cooked,
                            COUNT(rhi.id)::INT AS ingredient_count,
                            COUNT(rhi.id) FILTER (
                                WHERE COALESCE(pi.quantity, 0) >= rhi.quantity
                            )::INT AS available_count,
                            jsonb_agg(
                                jsonb_build_object(
                                    'ingredientName', i.name,
                                    'requiredQuantity', rhi.quantity,
                                    'unit', rhi.unit,
                                    'availableQuantity', COALESCE(pi.quantity, 0)
                                )
                            ) FILTER (
                                WHERE COALESCE(pi.quantity, 0) < rhi.quantity
                            ) AS missing
                        FROM recipe_history rh
                        INNER JOIN recipe_history_ingredients rhi ON rhi.recipe_history_id = rh.id
                        INNER JOIN ingredients i ON i.id = rhi.ingredient_id
                        LEFT JOIN pantry_items pi ON pi.kitchen_id = p_kitchen_id
                            AND pi.ingredient_id = rhi.ingredient_id
                            AND LOWER(pi.unit) = LOWER(rhi.unit)
                        WHERE rh.user_id = v_user_id
                        GROUP BY rh.recipe_name
                    )
                    SELECT
                        recipe_name,
                        times_cooked,
                        ingredient_count,
                        available_count,
                        COALESCE(missing, '[]'::jsonb) AS missing
                    FROM recipe_totals
                    ORDER BY available_count DESC, times_cooked DESC
                    LIMIT 5
                ) recommendations
            ),
            '[]'::jsonb
        )
    );
END;
$$;

DROP FUNCTION IF EXISTS fn_get_users();
DROP FUNCTION IF EXISTS fn_get_user_by_id(UUID);
DROP FUNCTION IF EXISTS fn_get_user_by_email(VARCHAR);
DROP FUNCTION IF EXISTS fn_get_user_with_password_by_email(VARCHAR);
DROP FUNCTION IF EXISTS fn_create_user(VARCHAR, VARCHAR, TEXT);
DROP FUNCTION IF EXISTS fn_create_user(VARCHAR, VARCHAR, TEXT, VARCHAR);
DROP FUNCTION IF EXISTS fn_count_users();

CREATE OR REPLACE FUNCTION fn_get_users()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at
    FROM users u
    ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_user_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at
    FROM users u
    WHERE u.id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_user_by_email(p_email VARCHAR)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    is_active BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at
    FROM users u
    WHERE lower(u.email) = lower(p_email);
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_user_with_password_by_email(p_email VARCHAR)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    is_active BOOLEAN,
    password_hash TEXT,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.email, u.role, u.is_active, u.password_hash, u.created_at
    FROM users u
    WHERE lower(u.email) = lower(p_email);
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_user(
    p_name VARCHAR,
    p_email VARCHAR,
    p_password_hash TEXT,
    p_role VARCHAR DEFAULT 'user'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    INSERT INTO users (name, email, password_hash, role)
    VALUES (p_name, p_email, p_password_hash, p_role)
    RETURNING id INTO v_user_id;

    RETURN v_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_user(
    p_id UUID,
    p_name VARCHAR,
    p_email VARCHAR,
    p_role VARCHAR DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE users
    SET
        name = p_name,
        email = p_email,
        role = COALESCE(p_role, role),
        is_active = COALESCE(p_is_active, is_active),
        updated_at = NOW()
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_user(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM users
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_training_images()
RETURNS TABLE (
    id UUID,
    ingredient_id UUID,
    ingredient_name VARCHAR,
    label VARCHAR,
    image_url TEXT,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ti.id,
        ti.ingredient_id,
        i.name AS ingredient_name,
        ti.label,
        ti.image_url,
        ti.created_at
    FROM training_images ti
    LEFT JOIN ingredients i ON i.id = ti.ingredient_id
    ORDER BY ti.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_training_images_paginated(
    p_page INT DEFAULT 1,
    p_page_size INT DEFAULT 12,
    p_ingredient_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    ingredient_id UUID,
    ingredient_name VARCHAR,
    label VARCHAR,
    image_url TEXT,
    created_at TIMESTAMP,
    total_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ti.id,
        ti.ingredient_id,
        i.name AS ingredient_name,
        ti.label,
        ti.image_url,
        ti.created_at,
        count(*) OVER() AS total_count
    FROM training_images ti
    LEFT JOIN ingredients i ON i.id = ti.ingredient_id
    WHERE p_ingredient_id IS NULL OR ti.ingredient_id = p_ingredient_id
    ORDER BY ti.created_at DESC
    LIMIT p_page_size
    OFFSET GREATEST(p_page - 1, 0) * p_page_size;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_training_images_by_ingredient(
    p_ingredient_id UUID
)
RETURNS TABLE (
    id UUID,
    ingredient_id UUID,
    ingredient_name VARCHAR,
    label VARCHAR,
    image_url TEXT,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ti.id,
        ti.ingredient_id,
        i.name AS ingredient_name,
        ti.label,
        ti.image_url,
        ti.created_at
    FROM training_images ti
    LEFT JOIN ingredients i ON i.id = ti.ingredient_id
    WHERE ti.ingredient_id = p_ingredient_id
    ORDER BY ti.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_training_image_by_id(
    p_id UUID
)
RETURNS TABLE (
    id UUID,
    ingredient_id UUID,
    ingredient_name VARCHAR,
    label VARCHAR,
    image_url TEXT,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ti.id,
        ti.ingredient_id,
        i.name AS ingredient_name,
        ti.label,
        ti.image_url,
        ti.created_at
    FROM training_images ti
    LEFT JOIN ingredients i ON i.id = ti.ingredient_id
    WHERE ti.id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_training_dataset()
RETURNS TABLE (
    label VARCHAR,
    ingredient_id UUID,
    images TEXT[],
    image_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ti.label,
        ti.ingredient_id,
        array_agg(ti.image_url ORDER BY ti.created_at ASC) AS images,
        count(*) AS image_count
    FROM training_images ti
    GROUP BY ti.label, ti.ingredient_id
    ORDER BY ti.label ASC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_training_image(
    p_ingredient_id UUID,
    p_label VARCHAR,
    p_image_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_training_image_id UUID;
BEGIN
    INSERT INTO training_images (ingredient_id, label, image_url)
    VALUES (p_ingredient_id, p_label, p_image_url)
    RETURNING id INTO v_training_image_id;

    RETURN v_training_image_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_training_image(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM training_images
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_training_image(
    p_id UUID,
    p_ingredient_id UUID,
    p_label VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE training_images
    SET
        ingredient_id = p_ingredient_id,
        label = p_label
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_ingredients()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    category VARCHAR,
    base_unit VARCHAR,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.category, i.base_unit, i.created_at
    FROM ingredients i
    ORDER BY i.name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_ingredient_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    category VARCHAR,
    base_unit VARCHAR,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.category, i.base_unit, i.created_at
    FROM ingredients i
    WHERE i.id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_ingredient(
    p_name VARCHAR,
    p_category VARCHAR,
    p_base_unit VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_ingredient_id UUID;
BEGIN
    INSERT INTO ingredients (name, category, base_unit)
    VALUES (p_name, p_category, p_base_unit)
    RETURNING id INTO v_ingredient_id;

    RETURN v_ingredient_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_ingredient(
    p_id UUID,
    p_name VARCHAR,
    p_category VARCHAR,
    p_base_unit VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ingredients
    SET
        name = p_name,
        category = p_category,
        base_unit = p_base_unit,
        updated_at = NOW()
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_ingredient(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ingredients
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_kitchens()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    name VARCHAR,
    owner_name VARCHAR,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT k.id, k.user_id, k.name, u.name AS owner_name, k.created_at
    FROM kitchens k
    INNER JOIN users u ON u.id = k.user_id
    ORDER BY k.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_kitchen_by_id(p_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    name VARCHAR,
    owner_name VARCHAR,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT k.id, k.user_id, k.name, u.name AS owner_name, k.created_at
    FROM kitchens k
    INNER JOIN users u ON u.id = k.user_id
    WHERE k.id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_kitchens_by_user(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    name VARCHAR,
    owner_name VARCHAR,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT k.id, k.user_id, k.name, u.name AS owner_name, k.created_at
    FROM kitchens k
    INNER JOIN users u ON u.id = k.user_id
    WHERE k.user_id = p_user_id
    ORDER BY k.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_create_kitchen(
    p_user_id UUID,
    p_name VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_kitchen_id UUID;
BEGIN
    INSERT INTO kitchens (user_id, name)
    VALUES (p_user_id, p_name)
    RETURNING id INTO v_kitchen_id;

    RETURN v_kitchen_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_kitchen(
    p_id UUID,
    p_name VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE kitchens
    SET name = p_name, updated_at = NOW()
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_kitchen(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM kitchens
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_pantry_items()
RETURNS TABLE (
    pantry_item_id UUID,
    kitchen_id UUID,
    ingredient_id UUID,
    ingredient_name VARCHAR,
    category VARCHAR,
    quantity NUMERIC,
    unit VARCHAR,
    expiration_date DATE,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pi.id,
        pi.kitchen_id,
        i.id,
        i.name,
        i.category,
        pi.quantity,
        pi.unit,
        pi.expiration_date,
        pi.created_at
    FROM pantry_items pi
    INNER JOIN ingredients i ON i.id = pi.ingredient_id
    ORDER BY pi.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_pantry_item_by_id(
    p_id UUID
)
RETURNS TABLE (
    pantry_item_id UUID,
    kitchen_id UUID,
    ingredient_id UUID,
    ingredient_name VARCHAR,
    category VARCHAR,
    quantity NUMERIC,
    unit VARCHAR,
    expiration_date DATE,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pi.id,
        pi.kitchen_id,
        i.id,
        i.name,
        i.category,
        pi.quantity,
        pi.unit,
        pi.expiration_date,
        pi.created_at
    FROM pantry_items pi
    INNER JOIN ingredients i ON i.id = pi.ingredient_id
    WHERE pi.id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_kitchen_pantry(
    p_kitchen_id UUID
)
RETURNS TABLE (
    pantry_item_id UUID,
    kitchen_id UUID,
    ingredient_id UUID,
    ingredient_name VARCHAR,
    category VARCHAR,
    quantity NUMERIC,
    unit VARCHAR,
    expiration_date DATE,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pi.id,
        pi.kitchen_id,
        i.id,
        i.name,
        i.category,
        pi.quantity,
        pi.unit,
        pi.expiration_date,
        pi.created_at
    FROM pantry_items pi
    INNER JOIN ingredients i ON i.id = pi.ingredient_id
    WHERE pi.kitchen_id = p_kitchen_id
    ORDER BY i.name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION fn_add_pantry_item(
    p_kitchen_id UUID,
    p_ingredient_id UUID,
    p_quantity NUMERIC,
    p_unit VARCHAR,
    p_expiration_date DATE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_pantry_item_id UUID;
BEGIN
    INSERT INTO pantry_items (
        kitchen_id,
        ingredient_id,
        quantity,
        unit,
        expiration_date
    )
    VALUES (
        p_kitchen_id,
        p_ingredient_id,
        p_quantity,
        p_unit,
        p_expiration_date
    )
    RETURNING id INTO v_pantry_item_id;

    RETURN v_pantry_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_pantry_item(
    p_id UUID,
    p_quantity NUMERIC,
    p_unit VARCHAR,
    p_expiration_date DATE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE pantry_items
    SET
        quantity = p_quantity,
        unit = p_unit,
        expiration_date = p_expiration_date,
        updated_at = NOW()
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_pantry_item(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM pantry_items
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_recipes()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    instructions TEXT,
    prep_time_minutes INT,
    difficulty VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.description,
        r.instructions,
        r.prep_time_minutes,
        r.difficulty
    FROM recipes r
    ORDER BY r.name ASC;
END;
$$;
`;

try {
  await query(sql);
  console.info('Database setup completed.');
} finally {
  await pool.end();
}
