import { defineConfig } from "orval";

export default defineConfig({
  commoncrawl: {
    input: {
      target: "../api/openapi.json",
    },
    output: {
      target: "./src/api/__generated__/index.ts",
      client: "fetch",
      clean: true,
      prettier: false,
      override: {
        mutator: {
          path: "./src/api/fetcher.ts",
          name: "orvalFetch",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: [
        {
          command: "tsx ./scripts/orval-postprocess.ts",
          injectGeneratedDirsAndFiles: false,
        },
        "pnpm exec oxlint --fix src/api/__generated__/index.ts",
        "pnpm exec oxfmt src/api/__generated__/index.ts",
      ],
    },
  },
});
