import type { ApiContext } from "@/types";

const REQUEST_ALLOWED_HEADERS = new Set([
  "accept",
  "accept-datetime",
  "if-modified-since",
  "if-none-match",
  "range",
]);

const RESPONSE_DENIED_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "set-cookie",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const buildRequestHeaders = (headers: Headers) => {
  return {
    ...filterHeaders(headers, (key) =>
      REQUEST_ALLOWED_HEADERS.has(key.toLowerCase()),
    ),
    "user-agent": "@commoncrawl.cc/api@0.0.1",
  };
};

const buildResponseHeaders = (headers: Headers) => {
  return filterHeaders(
    headers,
    (key) => !RESPONSE_DENIED_HEADERS.has(key.toLowerCase()),
  );
};

const filterHeaders = (headers: Headers, predicate: (k: string) => boolean) => {
  return new Headers([...headers.entries()].filter(([key]) => predicate(key)));
};

type TypedResponse<T> = Response & {
  json(): Promise<T>;
};

export async function request<TResponse = unknown>(
  c: ApiContext,
  path: string,
): Promise<TypedResponse<TResponse>> {
  const timeoutMs = Number(c.env?.INDEX_UPSTREAM_TIMEOUT_MS ?? "20000");
  const upstreamBaseUrl =
    c.env?.INDEX_UPSTREAM_BASE_URL ?? "https://index.commoncrawl.org";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(new URL(path, upstreamBaseUrl), {
      method: "GET",
      headers: buildRequestHeaders(c.req.raw.headers),
      signal: controller.signal,
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: buildResponseHeaders(response.headers),
    }) as TypedResponse<TResponse>;
  } catch {
    return new Response(
      JSON.stringify({ message: "Upstream request failed" }),
      {
        status: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    ) as TypedResponse<TResponse>;
  } finally {
    clearTimeout(timeout);
  }
}
