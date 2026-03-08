import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";

import {
  serviceUnavailableResponse,
  tooManyRequestsResponse,
  type Bindings,
} from "@/types";
import { request } from "@/utils/network";

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
