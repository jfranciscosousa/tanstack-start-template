import { hash, compare } from "bcrypt-ts";

export function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
