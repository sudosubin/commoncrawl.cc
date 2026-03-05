import assert from "node:assert/strict";

import { afterEach, describe, it, vi } from "vitest";

import { createApp } from "@/app";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api-v1-index-coll-timestamp-url.ts", () => {
  it("given memento timestamp route when specific capture requested then proxies upstream", async () => {
    // given
    const fetchMock = vi.fn(async (input: URL | Request | string) => {
      const target = typeof input === "string" ? input : input.toString();
      assert.equal(
        target,
        "https://index.commoncrawl.org/CC-MAIN-1970-01/19700101000000/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
        "then timestamp route should call memento upstream endpoint",
      );
      return new Response("ok", {
        headers: {
          "content-type": "text/html",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/CC-MAIN-1970-01/19700101000000/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
    );

    // then
    assert.equal(res.status, 200, "then timestamp route should return success");
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then timestamp route should call upstream once",
    );
  });
});
