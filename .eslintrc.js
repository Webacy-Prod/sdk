module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prettier/prettier': 'error',
  },
  ignorePatterns: [
    'node_modules',
    '**/dist/**',
    'docs-site/.docusaurus/**',
    'docs-site/build/**',
    '**/__tests__/**',
    '**/*.test.ts',
    '**/*.spec.ts',
  ],
};
