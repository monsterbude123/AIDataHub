// Shared bcrypt utility to avoid multiple imports in bundle
import bcrypt from 'bcryptjs';

export const hashPassword = (
  password: string,
  rounds: number = 10
): Promise<string> => {
  return bcrypt.hash(password, rounds);
};

export const comparePassword = (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
