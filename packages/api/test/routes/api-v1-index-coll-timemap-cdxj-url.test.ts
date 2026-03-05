import assert from "node:assert/strict";

import { afterEach, describe, it, vi } from "vitest";

import { createApp } from "@/app";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api-v1-index-coll-timemap-cdxj-url.ts", () => {
  it("given timemap cdxj route when requested then proxies cdxj response", async () => {
    // given
    const fetchMock = vi.fn(async (input: URL | Request | string) => {
      const target = typeof input === "string" ? input : input.toString();
      assert.equal(
        target,
        "https://index.commoncrawl.org/CC-MAIN-1970-01/timemap/cdxj/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
        "then timemap cdxj route should call cdxj upstream endpoint",
      );
      return new Response(
        'org,commoncrawl)/get-started 19700101000000 {"url": "https://commoncrawl.org/get-started"}\n',
        {
          headers: {
            "content-type": "text/x-cdxj",
          },
        },
      );
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/CC-MAIN-1970-01/timemap/cdxj/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
    );

    // then
    assert.equal(
      res.status,
      200,
      "then timemap cdxj route should return success",
    );
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then timemap cdxj route should call upstream once",
    );
    assert.ok(
      (res.headers.get("content-type") ?? "").includes("text/x-cdxj"),
      "then timemap cdxj route should preserve cdxj content-type",
    );
  });
});
