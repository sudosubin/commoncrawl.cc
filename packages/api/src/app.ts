import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

import ccbotApp from "@/routes/api-v1-index-ccbot";
import collIndexApp from "@/routes/api-v1-index-coll-index";
import collTimemapCdxjUrlApp from "@/routes/api-v1-index-coll-timemap-cdxj-url";
import collTimemapJsonUrlApp from "@/routes/api-v1-index-coll-timemap-json-url";
import collTimemapLinkUrlApp from "@/routes/api-v1-index-coll-timemap-link-url";
import collTimestampUrlApp from "@/routes/api-v1-index-coll-timestamp-url";
import collUrlApp from "@/routes/api-v1-index-coll-url";
import collinfoApp from "@/routes/api-v1-index-collinfo";
import graphinfoApp from "@/routes/api-v1-index-graphinfo";
import type { ApiContext, Bindings } from "@/types";

export function createApp() {
  const app = new Hono<{ Bindings: Bindings }>();

  app.use(
    cors({
      origin: (_, c: ApiContext) => c.env.CORS_ALLOW_ORIGIN,
      maxAge: 86_400,
    }),
  );
  app.use(csrf());

  app.route("", ccbotApp);
  app.route("", collIndexApp);
  app.route("", collTimemapJsonUrlApp);
  app.route("", collTimemapLinkUrlApp);
  app.route("", collTimemapCdxjUrlApp);
  app.route("", collTimestampUrlApp);
  app.route("", collUrlApp);
  app.route("", collinfoApp);
  app.route("", graphinfoApp);

  app.get(
    "/openapi.json",
    openAPIRouteHandler(app, {
      documentation: {
        openapi: "3.1.1",
        info: {
          title: "Common Crawl Index Server API Proxy",
          version: "0.0.1",
        },
      },
      excludeStaticFile: false,
    }),
  );

  return app;
}
