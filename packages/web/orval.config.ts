import { defineConfig } from "orval";

export default defineConfig({
  commoncrawl: {
    input: {
      target: "../api/openapi.json",
    },
    output: {
      target: "./src/api/__generated__/index.ts",
      schemas: "./src/api/__generated__/model",
      mode: "split",
      client: "fetch",
      mock: { type: "msw", useExamples: true },
      clean: true,
      prettier: false,
      override: {
        mutator: { path: "./src/api/fetcher.ts", name: "orvalFetch" },
      },
    },
    hooks: {
      afterAllFilesWrite: [
        {
          command: "pnpm exec oxlint --fix src/api/__generated__/",
          injectGeneratedDirsAndFiles: false,
        },
        {
          command: "pnpm exec oxfmt src/api/__generated__/",
          injectGeneratedDirsAndFiles: false,
        },
      ],
    },
  },
});
