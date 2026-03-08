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
