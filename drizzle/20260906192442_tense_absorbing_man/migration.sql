ALTER TABLE "accounts" ADD COLUMN "issuer" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_issuer_account_id_idx" ON "accounts" ("issuer","account_id");