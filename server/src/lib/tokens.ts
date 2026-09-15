import { createHash, randomBytes, randomInt } from "node:crypto";

/** Opaque, URL-safe random token (used for refresh + reset tokens). */
export function randomToken(bytes = 48) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Six digit numeric OTP, zero-padded. */
export function randomOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

// Unambiguous uppercase alphabet (no 0/O, 1/I) for family invite codes.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomInviteCode(length = 8) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)];
  }
  return out;
}
