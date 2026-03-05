import assert from "node:assert/strict";

import { afterEach, describe, it, vi } from "vitest";

import { createApp } from "@/app";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api-v1-index-coll-timemap-json-url.ts", () => {
  it("given timemap json route when requested then proxies ndjson response", async () => {
    // given
    const fetchMock = vi.fn(async (input: URL | Request | string) => {
      const target = typeof input === "string" ? input : input.toString();
      assert.equal(
        target,
        "https://index.commoncrawl.org/CC-MAIN-1970-01/timemap/json/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
        "then timemap json route should call json timemap upstream endpoint",
      );
      return new Response('{"timestamp":"19700101000000"}\n', {
        headers: {
          "content-type": "text/x-ndjson",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/CC-MAIN-1970-01/timemap/json/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
    );

    // then
    assert.equal(
      res.status,
      200,
      "then timemap json route should return success",
    );
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then timemap json route should call upstream once",
    );
  });
});
