import { cleanup } from "@testing-library/preact";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

import { server } from "@/mocks/node";

const collectionFixture = [
  {
    id: "CC-MAIN-2026-08",
    name: "February 2026 Index",
    timegate: "https://index.commoncrawl.org/CC-MAIN-2026-08/",
    "cdx-api": "https://index.commoncrawl.org/CC-MAIN-2026-08-index",
    from: "2026-02-06T18:14:58",
    to: "2026-02-19T11:27:33",
  },
  {
    id: "CC-MAIN-2026-04",
    name: "January 2026 Index",
    timegate: "https://index.commoncrawl.org/CC-MAIN-2026-04/",
    "cdx-api": "https://index.commoncrawl.org/CC-MAIN-2026-04-index",
    from: "2026-01-12T16:12:39",
    to: "2026-01-25T14:05:40",
  },
];

beforeAll(() => {
  Object.defineProperty(window, "scrollTo", {
    value: () => {},
    writable: true,
  });
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
  server.use(
    http.get("http://localhost:8787/api/v1/index/collinfo.json", () =>
      HttpResponse.json(collectionFixture),
    ),
  );
});

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
