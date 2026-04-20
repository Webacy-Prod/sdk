module.exports = {
  extends: ['../../.eslintrc.js'],
  overrides: [
    {
      // Commander's action callback params are typed `any` — scope the unsafe-*
      // exceptions to command files only, keeping shared plumbing strict.
      files: ['src/commands/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
  ],
};
