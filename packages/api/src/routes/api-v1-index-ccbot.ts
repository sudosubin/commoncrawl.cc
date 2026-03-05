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

const querySchema = v.record(v.string(), v.string());

const app = new Hono<{ Bindings: Bindings }>();

const responseSchema = v.object({
  creationTime: v.string(),
  prefixes: v.array(
    v.union([
      v.object({ ipv4Prefix: v.string() }),
      v.object({ ipv6Prefix: v.string() }),
    ]),
  ),
});

app.get(
  "/api/v1/index/ccbot.json",
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
  async (c) => request<v.InferOutput<typeof responseSchema>>(c, "/ccbot.json"),
);

export default app;
