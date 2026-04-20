module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {
    // Commander's action callbacks type local options as `any`;
    // we validate/cast at the call site, so turn these off for the CLI package.
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
  },
};
