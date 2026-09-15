export async function hashPassword(password: string) {
  return Bun.password.hash(password, { algorithm: "argon2id" });
}

export async function verifyPassword(password: string, hash: string) {
  try {
    return await Bun.password.verify(password, hash);
  } catch {
    return false;
  }
}
