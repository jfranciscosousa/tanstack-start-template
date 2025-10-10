import { beforeAll } from "vitest";
import { prismaClient } from "~/server/prisma";

async function cleanup() {
  await prismaClient.session.deleteMany({});
  await prismaClient.user.deleteMany({});
}

beforeAll(cleanup);
