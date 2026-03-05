import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";

import {
  collSchema,
  collectionNotFoundResponse,
  serviceUnavailableResponse,
  timestampSchema,
  tooManyRequestsResponse,
  type Bindings,
  urlSchema,
} from "@/types";
import { request } from "@/utils/network";

const paramSchema = v.object({
  coll: collSchema,
  timestamp: timestampSchema,
  url: urlSchema,
});

const responseSchema = v.string();

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/api/v1/index/:coll/:timestamp{[0-9]{1,14}}/:url{.+}",
  sValidator("param", paramSchema),
  describeRoute({
    summary: "Memento API",
    description:
      "pywb supports the Memento Protocol as specified in RFC 7089 and provides API endpoints for Memento TimeMaps and TimeGates per collection.",
    responses: {
      200: {
        description:
          "The 'canonical' URI-M is included in the ``content-location`` header and should be used to reference the memento in the future.",
        content: {
          "text/html": {
            schema: resolver(responseSchema),
          },
          "application/octet-stream": {
            schema: resolver(responseSchema),
          },
        },
      },
      404: collectionNotFoundResponse,
      429: tooManyRequestsResponse,
      503: serviceUnavailableResponse,
    },
  }),
  async (c) => {
    const requestUrl = new URL(c.req.url);
    const { coll, timestamp, url } = c.req.valid("param");
    const encodedUrl = encodeURIComponent(url);

    return request<string>(
      c,
      `/${coll}/${timestamp}/${encodedUrl}${requestUrl.search}`,
    );
  },
);

export default app;
