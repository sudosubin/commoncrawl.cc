import { readFile, writeFile } from "node:fs/promises";

const generated = new URL("../src/api/__generated__/index.ts", import.meta.url);

const source = await readFile(generated, "utf8");
const patched = source
  .replace(
    "import { orvalFetch } from '../fetcher';",
    'import { orvalFetch } from "@/api/fetcher";',
  )
  .replace(
    'import { orvalFetch } from "../fetcher";',
    'import { orvalFetch } from "@/api/fetcher";',
  );

if (patched !== source) {
  await writeFile(generated, patched, "utf8");
}
