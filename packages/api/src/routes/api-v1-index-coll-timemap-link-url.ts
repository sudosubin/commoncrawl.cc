import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";

import {
  collSchema,
  collectionNotFoundResponse,
  serviceUnavailableResponse,
  tooManyRequestsResponse,
  type Bindings,
  urlSchema,
} from "@/types";
import { request } from "@/utils/network";

const paramSchema = v.object({
  coll: collSchema,
  url: urlSchema,
});

const responseSchema = v.string();

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/api/v1/index/:coll/timemap/link/:url{.+}",
  sValidator("param", paramSchema),
  describeRoute({
    summary: "TimeMap API",
    description:
      "The timemap API is available at ``/<coll>/timemap/<type>/<url>`` for any pywb collection ``<coll>`` and ``<url>`` in the collection.",
    responses: {
      200: {
        description:
          "Returns an ``application/link-format`` as required by the Memento spec.",
        content: {
          "application/link-format": {
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
    const { coll, url } = c.req.valid("param");
    const encodedUrl = encodeURIComponent(url);

    return request<string>(
      c,
      `/${coll}/timemap/link/${encodedUrl}${requestUrl.search}`,
    );
  },
);

export default app;
