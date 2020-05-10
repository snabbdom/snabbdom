module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: { project: ['./tsconfig.json'] },
  ignorePatterns: [
    '/examples/**/build.js'
  ],
  rules: {
    'import/newline-after-import': 'error',
    'max-statements-per-line': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/prefer-includes': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-dynamic-delete': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'comma-dangle': ['error', 'only-multiline'],
    'no-mixed-operators': 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    semi: ['error', 'always'],
  }
};
