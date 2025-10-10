import { beforeEach } from "node:test";
import { afterAll } from "vitest";
import { prismaClient } from "~/server/prisma";

async function cleanup() {
  await prismaClient.session.deleteMany({});
  await prismaClient.user.deleteMany({});
}

beforeEach(cleanup);
afterAll(cleanup);
