import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter,
  log:
    process.env.LOGS === "true"
      ? ["query", "info", "warn", "error"]
      : undefined,
});

export const prismaClient = prisma;
