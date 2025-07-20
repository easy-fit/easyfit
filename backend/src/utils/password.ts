import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (candidatePassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

export const changedPasswordAfter = (passwordChangedAt: Date | undefined, jwtTimestamp: number): boolean => {
  if (!passwordChangedAt) return false;
  const changedTimestamp = Math.floor(passwordChangedAt.getTime() / 1000);
  return jwtTimestamp < changedTimestamp;
};
