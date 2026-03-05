import assert from "node:assert/strict";

import { describe, it } from "vitest";

import { createApp } from "@/app";

describe("app.ts", () => {
  it("given default app when cors preflight then responds with allow-origin", async () => {
    // given
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/collinfo.json",
      {
        method: "OPTIONS",
        headers: {
          origin: "https://example.com",
          "access-control-request-method": "GET",
        },
      },
    );

    // then
    assert.equal(res.status, 204, "then status should be 204 for preflight");
    assert.equal(
      res.headers.get("access-control-allow-origin"),
      "https://commoncrawl.cc",
      "then allow-origin should use configured default origin",
    );
  });

  it("given unsafe method when csrf check fails then responds 403", async () => {
    // given
    const app = createApp();

    // when
    const res = await app.request(
      "http://localhost/api/v1/index/collinfo.json",
      {
        method: "POST",
        headers: {
          origin: "https://evil.example",
        },
      },
    );

    // then
    assert.equal(
      res.status,
      403,
      "then csrf middleware should block unsafe cross-origin request",
    );
  });

  it("given app when requesting openapi json then includes core paths and schemas", async () => {
    // given
    const app = createApp();

    // when
    const res = await app.request("http://localhost/openapi.json");

    // then
    assert.equal(
      res.status,
      200,
      "then openapi endpoint should return success",
    );

    const body = (await res.json()) as {
      paths: Record<string, any>;
    };

    const pathKeys = Object.keys(body.paths);

    assert.ok(
      pathKeys.includes("/api/v1/index/ccbot.json"),
      "then ccbot metadata path should exist",
    );
    assert.ok(
      pathKeys.includes("/api/v1/index/collinfo.json"),
      "then collinfo metadata path should exist",
    );
    assert.ok(
      pathKeys.includes("/api/v1/index/graphinfo.json"),
      "then graphinfo metadata path should exist",
    );

    const cdxKey = pathKeys.find((key) => key.includes("-index"));
    assert.ok(cdxKey, "then cdx index path should be present in openapi");

    const cdxPath = body.paths[cdxKey!].get;
    assert.equal(
      cdxPath.responses["200"].content["text/x-cdxj"].schema.type,
      "string",
      "then success response schema should be string",
    );
    assert.equal(
      cdxPath.responses["400"].content["application/json"].schema.type,
      "object",
      "then bad request schema should be object",
    );
  });
});
