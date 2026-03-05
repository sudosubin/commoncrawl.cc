import { sValidator } from "@hono/standard-validator";
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

const querySchema = v.record(v.string(), v.string());

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/api/v1/index/graphinfo.json",
  sValidator("query", querySchema),
  describeRoute({
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: resolver(responseSchema),
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
