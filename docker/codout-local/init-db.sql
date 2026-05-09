-- Postgres extensions required by the schema. Without these, the first
-- `prisma migrate deploy` from the app container fails with P3018.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
