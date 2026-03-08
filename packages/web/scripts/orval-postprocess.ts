import { readFile, writeFile } from "node:fs/promises";

async function patchFile(file: URL, patch: (source: string) => string) {
  const source = await readFile(file, "utf8");
  const patched = patch(source);

  if (patched !== source) {
    await writeFile(file, patched, "utf8");
  }
}

await patchFile(
  new URL("../src/api/__generated__/index.ts", import.meta.url),
  (source) =>
    source
      .replace(
        "import { orvalFetch } from '../fetcher';",
        'import { orvalFetch } from "@/api/fetcher";',
      )
      .replace(
        'import { orvalFetch } from "../fetcher";',
        'import { orvalFetch } from "@/api/fetcher";',
      ),
);

await patchFile(
  new URL("../src/api/__generated__/index.msw.ts", import.meta.url),
  (source) => {
    const withStringLiteralFixed = source.replaceAll(
      /(\(\):\s*ArrayBuffer\s*=>\s*)(`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g,
      (_match, prefix: string, value: string) =>
        `${prefix}new TextEncoder().encode(${value}).buffer`,
    );

    return withStringLiteralFixed.replaceAll(
      /(\(\):\s*ArrayBuffer\s*=>\s*)(faker\.string\.alpha\([\s\S]*?\))/g,
      (_match, prefix: string, value: string) =>
        `${prefix}new TextEncoder().encode(${value}).buffer`,
    );
  },
);
