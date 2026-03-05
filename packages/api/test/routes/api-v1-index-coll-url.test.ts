import assert from "node:assert/strict";

import { afterEach, describe, it, vi } from "vitest";

import { createApp } from "@/app";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api-v1-index-coll-url.ts", () => {
  it("given timegate route when url capture requested then proxies upstream content", async () => {
    // given
    const fetchMock = vi.fn(async (input: URL | Request | string) => {
      const target = typeof input === "string" ? input : input.toString();
      assert.equal(
        target,
        "https://index.commoncrawl.org/CC-MAIN-1970-01/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
        "then timegate route should call timegate upstream endpoint",
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
      "http://localhost/api/v1/index/CC-MAIN-1970-01/https%3A%2F%2Fcommoncrawl.org%2Fget-started",
    );

    // then
    assert.equal(res.status, 200, "then timegate route should return success");
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then timegate route should call upstream once",
    );
  });

  it("given generic coll and url when path requested then route still proxies", async () => {
    // given
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/not-supported/path/extra/segment",
    );

    // then
    assert.equal(
      res.status,
      200,
      "then generic path should still match proxy route",
    );
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then generic path request should call upstream once",
    );
  });
});
