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
const example = [
  'com,example)/ 20260206181759 {"url": "https://www.example.com/", "mime": "text/html", "mime-detected": "text/html", "status": "200", "digest": "JUWMXAQNHPTRTHYQWT3EJILYCL7YC3PQ", "length": "951", "offset": "607115282", "filename": "crawl-data/CC-MAIN-2026-08/segments/1770395505396.36/warc/CC-MAIN-20260206181458-20260206211458-00865.warc.gz", "languages": "eng", "encoding": "ISO-8859-1"}',
  'com,example)/ 20260206222421 {"url": "https://www.example.com/", "mime": "text/html", "mime-detected": "text/html", "status": "200", "digest": "JUWMXAQNHPTRTHYQWT3EJILYCL7YC3PQ", "length": "953", "offset": "572768496", "filename": "crawl-data/CC-MAIN-2026-08/segments/1770395505610.3/warc/CC-MAIN-20260206211956-20260207001956-00865.warc.gz", "languages": "eng", "encoding": "ISO-8859-1"}',
].join("\n");

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/api/v1/index/:coll/timemap/cdxj/:url{.+}",
  sValidator("param", paramSchema),
  describeRoute({
    summary: "TimeMap API",
    description:
      "The timemap API is available at ``/<coll>/timemap/<type>/<url>`` for any pywb collection ``<coll>`` and ``<url>`` in the collection.",
    responses: {
      200: {
        description: "Returns a timemap in the native CDXJ format.",
        content: {
          "text/x-cdxj": {
            schema: resolver(responseSchema),
            example,
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
      `/${coll}/timemap/cdxj/${encodedUrl}${requestUrl.search}`,
    );
  },
);

export default app;
