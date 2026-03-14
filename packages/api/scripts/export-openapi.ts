import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { createApp } from "@/app";

const outputPath = process.argv[2] ?? "./openapi.json";
const resolvedOutputPath = resolve(process.cwd(), outputPath);

const app = createApp();

const response = await app.request(
  "http://localhost/openapi.json",
  { method: "GET" },
  {
    CORS_ALLOW_ORIGIN: "http://localhost:3000",
    INDEX_UPSTREAM_BASE_URL: "https://index.commoncrawl.org",
    INDEX_UPSTREAM_TIMEOUT_MS: "20000",
  },
);

if (!response.ok) {
  throw new Error(`Failed to generate OpenAPI document: ${response.status}`);
}

const document = await response.text();

await mkdir(dirname(resolvedOutputPath), { recursive: true });
await writeFile(resolvedOutputPath, document, "utf8");

console.log(`OpenAPI exported to ${resolvedOutputPath}`);
