import { compare, hash } from "bcrypt-ts";

// Use minimum cost factor (4) in tests to avoid ~300ms per hash at cost 12.
const BCRYPT_COST = process.env.VITEST ? 4 : 12;

export function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_COST);
}

export function verifyPassword(password: string, hashedPassword?: string) {
  if (!hashedPassword) return false;

  return compare(password, hashedPassword);
}
