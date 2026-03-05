import assert from "node:assert/strict";

import { afterEach, describe, it, vi } from "vitest";

import { createApp } from "@/app";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api-v1-index-collinfo.ts", () => {
  it("given collinfo route when upstream responds then proxies collection list", async () => {
    // given
    const fetchMock = vi.fn(async (input: URL | Request | string) => {
      const target = typeof input === "string" ? input : input.toString();
      assert.equal(
        target,
        "https://index.commoncrawl.org/collinfo.json",
        "then collinfo route should call collinfo upstream endpoint",
      );
      return new Response(JSON.stringify([{ id: "CC-MAIN-1970-01" }]), {
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/collinfo.json",
    );

    // then
    assert.equal(res.status, 200, "then collinfo route should return success");
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then collinfo route should call upstream once",
    );
  });

  it("given collinfo route when upstream throws then returns 502 error", async () => {
    // given
    const fetchMock = vi.fn(async () => {
      throw new Error("boom");
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/collinfo.json",
    );

    // then
    assert.equal(
      res.status,
      502,
      "then collinfo route should map upstream failure to 502",
    );
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then upstream should still be attempted exactly once",
    );

    const body = (await res.json()) as { message?: string };
    assert.equal(
      body.message,
      "Upstream request failed",
      "then error body should expose stable message",
    );
  });
});
