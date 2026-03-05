import assert from "node:assert/strict";

import { afterEach, describe, it, vi } from "vitest";

import { createApp } from "@/app";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api-v1-index-coll-timemap-link-url.ts", () => {
  it("given timemap link route when requested then proxies link-format response", async () => {
    // given
    const fetchMock = vi.fn(async (input: URL | Request | string) => {
      const target = typeof input === "string" ? input : input.toString();
      assert.equal(
        target,
        "https://index.commoncrawl.org/CC-MAIN-1970-01/timemap/link/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
        "then timemap link route should call link timemap upstream endpoint",
      );
      return new Response('<...>; rel="memento"', {
        headers: {
          "content-type": "application/link-format",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/CC-MAIN-1970-01/timemap/link/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
    );

    // then
    assert.equal(
      res.status,
      200,
      "then timemap link route should return success",
    );
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then timemap link route should call upstream once",
    );
  });
});
