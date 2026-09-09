import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules/**", "image_cache/**", "image_store/**"] },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[source.value=/^\\..+\\.(cjs|mjs|jsx?|tsx?)$/]",
          message: "Omit the file extension on relative imports: use './file' not './file.ts' or './file.js'.",
        },
      ],
    },
  }
);
