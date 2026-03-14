import { fireEvent, screen } from "@testing-library/preact";
import { HttpResponse, http } from "msw";

import { renderApp } from "./render-app";

export const snapshotNdjson =
  '{"urlkey":"org,example)/","timestamp":"20260206181759","url":"https://example.com/","status":"200","mime":"text/html"}\n';

export const pagedIndexNdjson =
  '{"urlkey":"org,example)/","part":"cdx-00001.gz","offset":123,"length":456,"lineno":1}\n';

export const createSnapshotNdjson = (count: number, prefix = "page") =>
  Array.from({ length: count }, (_, index) => {
    const value = index + 1;
    const paddedDay = String((value % 28) + 1).padStart(2, "0");

    return JSON.stringify({
      urlkey: `org,example)/${prefix}-${value}`,
      timestamp: `202602${paddedDay}181759`,
      url: `https://example.com/${prefix}-${value}`,
      status: "200",
      mime: "text/html",
    });
  }).join("\n") + (count ? "\n" : "");

type RequestCountHandler = () => void;

type MockIndexOptions = {
  body?: string;
  bodiesByLimit?: Record<string, string>;
  pagedIndexBody?: string;
  onRequest?: (request: Request) => void;
};

type MockDeferredOptions = {
  body?: string;
  status?: number;
  onRequest?: RequestCountHandler;
};
type MockCaptureOptions = MockDeferredOptions & { route?: "url" | "timestamp" };

export const mockIndex = ({
  body = snapshotNdjson,
  bodiesByLimit = {},
  pagedIndexBody = pagedIndexNdjson,
  onRequest,
}: MockIndexOptions = {}) =>
  http.get(
    "http://localhost:8787/api/v1/index/CC-MAIN-2026-08-index",
    ({ request }) => {
      onRequest?.(request);

      const params = new URL(request.url).searchParams;
      if (params.get("showPagedIndex") === "true") {
        return HttpResponse.text(pagedIndexBody, {
          status: 200,
          headers: { "content-type": "application/x-ndjson" },
        });
      }

      const limit = params.get("limit") ?? "";
      return HttpResponse.text(bodiesByLimit[limit] ?? body, {
        status: 200,
        headers: { "content-type": "application/x-ndjson" },
      });
    },
  );

export const mockTimeline = ({
  body = snapshotNdjson,
  onRequest,
  status = 200,
}: MockDeferredOptions = {}) =>
  http.get(
    "http://localhost:8787/api/v1/index/:collection/timemap/json/:url",
    () => {
      onRequest?.();
      return HttpResponse.text(body, {
        status,
        headers: { "content-type": "application/x-ndjson" },
      });
    },
  );

export const mockCapture = ({
  body = "HTTP/1.1 302 Found",
  onRequest,
  route = "url",
  status = 200,
}: MockCaptureOptions = {}) =>
  http.get(
    route === "timestamp"
      ? "http://localhost:8787/api/v1/index/:collection/:timestamp/:url"
      : "http://localhost:8787/api/v1/index/:collection/:url",
    () => {
      onRequest?.();
      return HttpResponse.text(body, {
        status,
        headers: {
          "content-type":
            status === 200 ? "application/link-format" : "text/plain",
        },
      });
    },
  );

export const submitSearch = async (path = "/search") => {
  renderApp(path);
  fireEvent.click(screen.getByRole("button", { name: "Find snapshots" }));
  await screen.findByText("Inspector");
};
