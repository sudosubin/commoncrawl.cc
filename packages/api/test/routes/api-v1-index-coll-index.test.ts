import assert from "node:assert/strict";

import { afterEach, describe, it, vi } from "vitest";

import { createApp } from "@/app";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api-v1-index-coll-index.ts", () => {
  it("given cdx route when valid query then proxies ndjson response", async () => {
    // given
    const fetchMock = vi.fn(async (input: URL | Request | string) => {
      const target = typeof input === "string" ? input : input.toString();
      assert.equal(
        target,
        "https://index.commoncrawl.org/CC-MAIN-1970-01-index?url=commoncrawl.org/get-started&output=json",
        "then cdx route should call upstream with identical query string",
      );
      return new Response('{"url":"https://commoncrawl.org/get-started"}\n', {
        headers: {
          "content-type": "text/x-ndjson",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/CC-MAIN-1970-01-index?url=commoncrawl.org/get-started&output=json",
    );

    // then
    assert.equal(res.status, 200, "then cdx route should return success");
    assert.equal(
      fetchMock.mock.calls.length,
      1,
      "then cdx route should call upstream once",
    );
    assert.ok(
      (res.headers.get("content-type") ?? "").includes("text/x-ndjson"),
      "then cdx route should preserve upstream ndjson content-type",
    );
  });

  it("given cdx route when required url missing then returns 400 without fetch", async () => {
    // given
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify([{ ok: true }]), {
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/CC-MAIN-1970-01-index",
    );

    // then
    assert.equal(
      res.status,
      400,
      "then missing url should be rejected as bad request",
    );
    assert.equal(
      fetchMock.mock.calls.length,
      0,
      "then upstream should not be called when validation fails",
    );
  });
});
