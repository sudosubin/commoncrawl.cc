import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";

import {
  serviceUnavailableResponse,
  tooManyRequestsResponse,
  type Bindings,
} from "@/types";
import { request } from "@/utils/network";

const nodeArcStatsSchema = v.object({
  nodes: v.number(),
  arcs: v.number(),
});

const responseSchema = v.array(
  v.object({
    id: v.string(),
    crawls: v.array(v.string()),
    index: v.string(),
    location: v.string(),
    stats: v.object({
      host: nodeArcStatsSchema,
      domain: nodeArcStatsSchema,
    }),
  }),
);

const example: v.InferOutput<typeof responseSchema> = [
  {
    id: "cc-main-2025-26-dec-jan-feb",
    crawls: ["CC-MAIN-2025-51", "CC-MAIN-2026-04", "CC-MAIN-2026-08"],
    index:
      "https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2025-26-dec-jan-feb/index.html",
    location:
      "s3://commoncrawl/projects/hyperlinkgraph/cc-main-2025-26-dec-jan-feb/",
    stats: {
      host: { nodes: 288604261, arcs: 12365071120 },
      domain: { nodes: 134222466, arcs: 5380423856 },
    },
  },
  {
    id: "cc-main-2025-26-nov-dec-jan",
    crawls: ["CC-MAIN-2025-47", "CC-MAIN-2025-51", "CC-MAIN-2026-04"],
    index:
      "https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2025-26-nov-dec-jan/index.html",
    location:
      "s3://commoncrawl/projects/hyperlinkgraph/cc-main-2025-26-nov-dec-jan/",
    stats: {
      host: { nodes: 279356058, arcs: 13431887360 },
      domain: { nodes: 122294847, arcs: 6112336768 },
    },
  },
  {
    id: "cc-main-2025-oct-nov-dec",
    crawls: ["CC-MAIN-2025-43", "CC-MAIN-2025-47", "CC-MAIN-2025-51"],
    index:
      "https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2025-oct-nov-dec/index.html",
    location:
      "s3://commoncrawl/projects/hyperlinkgraph/cc-main-2025-oct-nov-dec/",
    stats: {
      host: { nodes: 250753325, arcs: 10858559096 },
      domain: { nodes: 121304598, arcs: 6220780848 },
    },
  },
];

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/api/v1/index/graphinfo.json",
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
    request<v.InferOutput<typeof responseSchema>>(c, "/graphinfo.json"),
);

export default app;
