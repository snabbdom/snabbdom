module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  env: {
    browser: true,
    node: false,
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json", "test/tsconfig.json"],
      },
      extends: [
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
    {
      files: ["test/**/*.ts"],
      env: {
        browser: true,
        node: true,
      },
    },
    {
      files: ["*.js"],
      excludedFiles: ["examples/**"],
      extends: ["plugin:node/recommended"],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
