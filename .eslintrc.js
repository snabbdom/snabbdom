module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: { project: [ './tsconfig.json', ] },
  ignorePatterns: [
    '/examples/**/build.js',
    '/dist/'
  ],
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'comma-dangle': 'off',
    'dot-notation': 'off',
    'import/first': 'off',
    'no-mixed-operators': 'off',
    'no-sequences': 'off',
    'no-undef': 'off',
    'no-unneeded-ternary': 'off',
    'no-unused-expressions': 'off',
    'no-unused-vars': 'off',
    'no-void': 'off',
    'node/no-deprecated-api': 'off',
    'one-var': 'off',
    'prefer-const': 'off',
    'quote-props': 'off',
    eqeqeq: 'off',
    quotes: 'off',
    semi: 'off'
  }
}
