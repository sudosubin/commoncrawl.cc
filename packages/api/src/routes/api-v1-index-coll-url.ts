import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";

import {
  acceptDatetimeHeaderSchema,
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
const htmlExample = [
  '<!doctype html><html lang="en"><head>',
  "<!-- WB Insert -->",
  "<script>",
  "wbinfo = {};",
  'wbinfo.top_url = "https://index.commoncrawl.org/CC-MAIN-2026-08/20260206181759/https://www.example.com/";',
  'wbinfo.url = "https://www.example.com/";',
  'wbinfo.timestamp = "20260206181759";',
  "</script>",
  "</head><body></body></html>",
].join("\n");
const octetStreamExample =
  "\\u0089PNG\\r\\n\\u001a\\n\\u0000\\u0000\\u0000\\rIHDR...";

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/api/v1/index/:coll/:url{.+}",
  sValidator("param", paramSchema),
  sValidator("header", acceptDatetimeHeaderSchema),
  describeRoute({
    summary: "TimeGate API",
    description:
      "The TimeGate API for any pywb collection is ``/<coll>/<url>``, eg. ``/my-coll/http://example.com/``.",
    responses: {
      200: {
        description:
          "To avoid an extra redirect, the TimeGate returns the requested memento directly (200-style negotiation) without redirecting to its canonical, timestamped url.",
        content: {
          "text/html": {
            schema: resolver(responseSchema),
            example: htmlExample,
          },
          "application/octet-stream": {
            schema: resolver(responseSchema),
            example: octetStreamExample,
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

    return request<string>(c, `/${coll}/${encodedUrl}${requestUrl.search}`);
  },
);

export default app;
