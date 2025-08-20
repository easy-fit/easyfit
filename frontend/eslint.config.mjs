import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Allow any types for faster development/deployment
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unused variables in some cases
      '@typescript-eslint/no-unused-vars': 'warn',
      // Allow missing dependencies in useEffect
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
