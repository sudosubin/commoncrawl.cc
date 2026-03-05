import assert from "node:assert/strict";

import { afterEach, describe, it, vi } from "vitest";

import { createApp } from "@/app";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api-v1-index-ccbot.ts", () => {
  it("given ccbot route when upstream responds then proxies ccbot json", async () => {
    // given
    const fetchMock = vi.fn(async (input: URL | Request | string) => {
      const target = typeof input === "string" ? input : input.toString();
      assert.equal(
        target,
        "https://index.commoncrawl.org/ccbot.json",
        "then ccbot handler should call the ccbot upstream endpoint",
      );
      return new Response(
        JSON.stringify({ creationTime: "1970-01-01T00:00:00.000000" }),
        {
          headers: { "content-type": "application/json" },
        },
      );
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request("http://localhost/api/v1/index/ccbot.json");

    // then
    assert.equal(res.status, 200, "then ccbot route should return success");
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then ccbot route should call upstream exactly once",
    );
  });
});
