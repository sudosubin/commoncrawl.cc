import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";

import {
  cdxQuerySchema,
  collSchema,
  collectionNotFoundResponse,
  serviceUnavailableResponse,
  tooManyRequestsResponse,
  type Bindings,
  errorMessageSchema,
} from "@/types";
import { request } from "@/utils/network";

const paramSchema = v.object({
  coll: collSchema,
});

const responseSchema = v.string();
const cdxjExample = [
  'com,example)/ 20260206181759 {"url": "https://www.example.com/", "mime": "text/html", "mime-detected": "text/html", "status": "200", "digest": "JUWMXAQNHPTRTHYQWT3EJILYCL7YC3PQ", "length": "951", "offset": "607115282", "filename": "crawl-data/CC-MAIN-2026-08/segments/1770395505396.36/warc/CC-MAIN-20260206181458-20260206211458-00865.warc.gz", "languages": "eng", "encoding": "ISO-8859-1"}',
  'com,example)/ 20260206222421 {"url": "https://www.example.com/", "mime": "text/html", "mime-detected": "text/html", "status": "200", "digest": "JUWMXAQNHPTRTHYQWT3EJILYCL7YC3PQ", "length": "953", "offset": "572768496", "filename": "crawl-data/CC-MAIN-2026-08/segments/1770395505610.3/warc/CC-MAIN-20260206211956-20260207001956-00865.warc.gz", "languages": "eng", "encoding": "ISO-8859-1"}',
].join("\n");
const ndjsonExample = [
  '{"urlkey": "com,example)/", "timestamp": "20260206181759", "url": "https://www.example.com/", "mime": "text/html", "mime-detected": "text/html", "status": "200", "digest": "JUWMXAQNHPTRTHYQWT3EJILYCL7YC3PQ", "length": "951", "offset": "607115282", "filename": "crawl-data/CC-MAIN-2026-08/segments/1770395505396.36/warc/CC-MAIN-20260206181458-20260206211458-00865.warc.gz", "languages": "eng", "encoding": "ISO-8859-1"}',
  '{"urlkey": "com,example)/", "timestamp": "20260206222421", "url": "https://www.example.com/", "mime": "text/html", "mime-detected": "text/html", "status": "200", "digest": "JUWMXAQNHPTRTHYQWT3EJILYCL7YC3PQ", "length": "953", "offset": "572768496", "filename": "crawl-data/CC-MAIN-2026-08/segments/1770395505610.3/warc/CC-MAIN-20260206211956-20260207001956-00865.warc.gz", "languages": "eng", "encoding": "ISO-8859-1"}',
].join("\n");
const linkFormatExample = [
  '<https://www.example.com/>; rel="memento"; datetime="Fri, 06 Feb 2026 18:17:59 GMT",',
  '<https://www.example.com/>; rel="memento"; datetime="Fri, 06 Feb 2026 22:24:21 GMT"',
].join("\n");
const textExample = [
  "com,example)/ 20260206181759 https://www.example.com/ text/html text/html 200 JUWMXAQNHPTRTHYQWT3EJILYCL7YC3PQ 951 607115282 crawl-data/CC-MAIN-2026-08/segments/1770395505396.36/warc/CC-MAIN-20260206181458-20260206211458-00865.warc.gz eng ISO-8859-1",
  "com,example)/ 20260206222421 https://www.example.com/ text/html text/html 200 JUWMXAQNHPTRTHYQWT3EJILYCL7YC3PQ 953 572768496 crawl-data/CC-MAIN-2026-08/segments/1770395505610.3/warc/CC-MAIN-20260206211956-20260207001956-00865.warc.gz eng ISO-8859-1",
].join("\n");

const app = new Hono<{ Bindings: Bindings }>();

app.get(
  "/api/v1/index/:coll{.+-index}",
  sValidator("param", paramSchema),
  sValidator("query", cdxQuerySchema),
  describeRoute({
    summary: "CDXJ Server API",
    description:
      "The following is a reference of the api for querying and filtering archived resources.\n\nThe api can be used to get information about a range of archive captures/mementos, including filtering, sorting, and pagination for bulk query.\n\nThe actual archive files (WARC/ARC) files are not loaded during this query, only the generated CDXJ index.",
    responses: {
      200: {
        description:
          "The api can be used to get information about a range of archive captures/mementos, including filtering, sorting, and pagination for bulk query.",
        content: {
          "text/x-cdxj": {
            schema: resolver(responseSchema),
            example: cdxjExample,
          },
          "text/x-ndjson": {
            schema: resolver(responseSchema),
            example: ndjsonExample,
          },
          "application/link-format": {
            schema: resolver(responseSchema),
            example: linkFormatExample,
          },
          "text/plain": {
            schema: resolver(responseSchema),
            example: textExample,
          },
        },
      },
      400: {
        description:
          "The only required parameter to the cdx server api is the url.",
        content: {
          "application/json": {
            schema: resolver(errorMessageSchema),
            example: {
              message: 'The "url" param is required',
            },
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
    const { coll } = c.req.valid("param");
    const query = c.req.valid("query");

    if (!query.url && query.mode !== "list_sources") {
      return c.json({ message: 'The "url" param is required' }, 400);
    }

    const collName = coll.replace(/-index$/i, "");
    return request<string>(c, `/${collName}-index${requestUrl.search}`);
  },
);

export default app;
