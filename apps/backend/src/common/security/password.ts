import bcrypt from "bcryptjs";

// Number of rounds for bcrypt hashing
const SALT_ROUNDS = 10;

export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain: string, hash: string | null) => {
  if (!hash) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(plain, hash);
};
