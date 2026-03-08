ALTER TABLE "sessions" ADD COLUMN "expires_at" timestamp;
UPDATE "sessions" SET "expires_at" = now() + interval '30 days' WHERE "expires_at" IS NULL;
ALTER TABLE "sessions" ALTER COLUMN "expires_at" SET NOT NULL;
