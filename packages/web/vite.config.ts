/// <reference types="vitest/config" />

import { fileURLToPath, URL } from "node:url";

import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    env: {
      VITE_API_BASE_URL: "http://localhost:8787",
      VITE_USE_MSW: "false",
    },
  },
});
