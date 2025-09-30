import { defineConfig, globalIgnores } from "eslint/config";
import tslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import markdown from "@eslint/markdown";
import importPlugin from "eslint-plugin-import-x";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

export default defineConfig([
  tslint.configs.recommended,
  markdown.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "import/extensions": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-empty-object-type": "off"
    },
    settings: {
      "import-x/resolver-next": [createTypeScriptImportResolver({})]
    }
  },
  {
    files: ["README-*"],
    rules: {
      "markdown/no-missing-link-fragments": "off"
    }
  },
  {
    files: ["examples/**"],
    rules: {
      "import-x/no-unresolved": "off"
    }
  },
  globalIgnores(["build/*", "coverage/*", "CHANGELOG.md"]),
  eslintConfigPrettier
]);
