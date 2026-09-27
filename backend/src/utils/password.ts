import bcrypt from 'bcrypt';

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, 12);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
