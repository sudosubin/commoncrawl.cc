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

const example: v.InferOutput<typeof responseSchema> = {
  creationTime: "2025-06-23T17:02:06.734458",
  prefixes: [
    { ipv6Prefix: "2600:1f28:365:80b0::/60" },
    { ipv4Prefix: "18.97.9.168/29" },
    { ipv4Prefix: "18.97.14.80/29" },
    { ipv4Prefix: "18.97.14.88/30" },
    { ipv4Prefix: "98.85.178.216/32" },
  ],
};

app.get(
  "/api/v1/index/ccbot.json",
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
  async (c) => request<v.InferOutput<typeof responseSchema>>(c, "/ccbot.json"),
);

export default app;
