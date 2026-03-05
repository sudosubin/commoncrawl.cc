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
          },
          "text/x-ndjson": {
            schema: resolver(responseSchema),
          },
          "application/link-format": {
            schema: resolver(responseSchema),
          },
          "text/plain": {
            schema: resolver(responseSchema),
          },
        },
      },
      400: {
        description:
          "The only required parameter to the cdx server api is the url.",
        content: {
          "application/json": {
            schema: resolver(errorMessageSchema),
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
