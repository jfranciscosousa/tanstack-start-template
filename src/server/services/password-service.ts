import { compare, hash } from "bcrypt-ts";

export function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export function verifyPassword(password: string, hashedPassword?: string) {
  if (!hashedPassword) return false;

  return compare(password, hashedPassword);
}
