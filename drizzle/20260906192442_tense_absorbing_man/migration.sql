ALTER TABLE "accounts" ADD COLUMN "issuer" text;--> statement-breakpoint
UPDATE "accounts"
SET "issuer" = CASE
  WHEN "provider_id" = 'credential' THEN 'local:credential'
  ELSE 'local:oauth:' || "provider_id"
END;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_issuer_account_id_idx" ON "accounts" ("issuer","account_id");