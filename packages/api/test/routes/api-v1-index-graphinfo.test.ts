import assert from "node:assert/strict";

import { afterEach, describe, it, vi } from "vitest";

import { createApp } from "@/app";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api-v1-index-graphinfo.ts", () => {
  it("given graphinfo route when upstream responds then proxies graph metadata", async () => {
    // given
    const fetchMock = vi.fn(async (input: URL | Request | string) => {
      const target = typeof input === "string" ? input : input.toString();
      assert.equal(
        target,
        "https://index.commoncrawl.org/graphinfo.json",
        "then graphinfo route should call graphinfo upstream endpoint",
      );
      return new Response(JSON.stringify([{ id: "cc-main-1970-01-jan" }]), {
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/graphinfo.json",
    );

    // then
    assert.equal(res.status, 200, "then graphinfo route should return success");
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then graphinfo route should call upstream once",
    );
  });
});
