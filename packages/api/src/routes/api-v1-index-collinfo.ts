import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";

import {
  serviceUnavailableResponse,
  tooManyRequestsResponse,
  type Bindings,
} from "@/types";
import { request } from "@/utils/network";

const responseSchema = v.array(
  v.object({
    id: v.string(),
    name: v.string(),
    timegate: v.string(),
    "cdx-api": v.string(),
    from: v.string(),
    to: v.string(),
  }),
);

const example: v.InferOutput<typeof responseSchema> = [
  {
    id: "CC-MAIN-2026-08",
    name: "February 2026 Index",
    timegate: "https://index.commoncrawl.org/CC-MAIN-2026-08/",
    "cdx-api": "https://index.commoncrawl.org/CC-MAIN-2026-08-index",
    from: "2026-02-06T18:14:58",
    to: "2026-02-19T11:27:33",
  },
  {
    id: "CC-MAIN-2026-04",
    name: "January 2026 Index",
    timegate: "https://index.commoncrawl.org/CC-MAIN-2026-04/",
    "cdx-api": "https://index.commoncrawl.org/CC-MAIN-2026-04-index",
    from: "2026-01-12T16:12:39",
    to: "2026-01-25T14:05:40",
  },
  {
    id: "CC-MAIN-2025-51",
    name: "December 2025 Index",
    timegate: "https://index.commoncrawl.org/CC-MAIN-2025-51/",
    "cdx-api": "https://index.commoncrawl.org/CC-MAIN-2025-51-index",
    from: "2025-12-04T19:18:28",
    to: "2025-12-17T14:22:46",
  },
];

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/api/v1/index/collinfo.json",
  describeRoute({
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: resolver(responseSchema),
            example,
          },
        },
      },
      429: tooManyRequestsResponse,
      503: serviceUnavailableResponse,
    },
  }),
  async (c) =>
    request<v.InferOutput<typeof responseSchema>>(c, "/collinfo.json"),
);

export default app;
