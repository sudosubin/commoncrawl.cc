import type { Context } from "hono";
import { resolver } from "hono-openapi";
import * as v from "valibot";

export type ApiContext = Context<{ Bindings: Bindings }>;

export type Bindings = {
  CORS_ALLOW_ORIGIN: string;
  INDEX_UPSTREAM_BASE_URL: string;
  INDEX_UPSTREAM_TIMEOUT_MS: string;
};

export const collSchema = v.pipe(v.string(), v.minLength(1));

export const collIndexSchema = v.pipe(v.string(), v.minLength(1));

export const timestampSchema = v.pipe(v.string(), v.regex(/^[0-9]{1,14}$/));

export const urlSchema = v.pipe(v.string(), v.minLength(1));

// Backward-compatible aliases
export const collectionIdSchema = collSchema;
export const collectionIndexIdSchema = collIndexSchema;
export const originalUrlSchema = urlSchema;

const boolStringSchema = v.string();

export const cdxQuerySchema = v.object({
  url: v.optional(v.string()),
  mode: v.optional(v.picklist(["index", "list_sources"])),
  output: v.optional(v.picklist(["json", "link", "cdxj", "text"])),
  filter: v.optional(v.union([v.string(), v.array(v.string())])),
  fields: v.optional(v.string()),
  fl: v.optional(v.string()),
  limit: v.optional(v.pipe(v.string(), v.regex(/^[1-9][0-9]*$/))),
  page: v.optional(v.pipe(v.string(), v.regex(/^[0-9]+$/))),
  pageSize: v.optional(v.pipe(v.string(), v.regex(/^[1-9][0-9]*$/))),
  from: v.optional(v.pipe(v.string(), v.regex(/^[0-9]{1,14}$/))),
  from_ts: v.optional(v.pipe(v.string(), v.regex(/^[0-9]{1,14}$/))),
  to: v.optional(v.pipe(v.string(), v.regex(/^[0-9]{1,14}$/))),
  showNumPages: v.optional(boolStringSchema),
  matchType: v.optional(v.picklist(["exact", "prefix", "host", "domain"])),
  sort: v.optional(v.picklist(["reverse", "closest"])),
  closest: v.optional(v.pipe(v.string(), v.regex(/^(?:[0-9]{1,14}|now)$/))),
  reverse: v.optional(boolStringSchema),
  collapseTime: v.optional(v.pipe(v.string(), v.regex(/^[1-9][0-9]*$/))),
  resolveRevisits: v.optional(boolStringSchema),
  allowFuzzy: v.optional(boolStringSchema),
  showPagedIndex: v.optional(boolStringSchema),
});

export const acceptDatetimeHeaderSchema = v.object({
  "accept-datetime": v.optional(v.string()),
});

export const errorMessageSchema = v.object({
  message: v.string(),
});

export const plainTextSchema = v.string();

export const collectionNotFoundResponse = {
  description: "Not Found",
  content: {
    "text/plain": {
      schema: resolver(plainTextSchema),
    },
  },
};

export const tooManyRequestsResponse = {
  description: "Too Many Requests",
  content: {
    "text/plain": {
      schema: resolver(plainTextSchema),
    },
    "text/html": {
      schema: resolver(v.string()),
    },
  },
};

export const serviceUnavailableResponse = {
  description: "Service Unavailable",
  content: {
    "text/plain": {
      schema: resolver(plainTextSchema),
    },
    "text/html": {
      schema: resolver(v.string()),
    },
  },
};
