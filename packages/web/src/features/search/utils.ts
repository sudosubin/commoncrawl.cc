import { DEFAULT_COLLECTION, DEFAULT_LIMIT, DEFAULT_URL } from "./constants";
import type {
  CaptureMode,
  ReplayInputMode,
  SearchFormValues,
  SearchTab,
  SnapshotRow,
} from "./types";

const AUTO_RUN_KEYS = ["coll", "url", "ts", "ad", "limit", "page"];

export const normalizeSearchFormValues = (
  values: SearchFormValues,
): SearchFormValues => {
  const limit =
    Number.isFinite(values.limit) && values.limit > 0
      ? values.limit
      : DEFAULT_LIMIT;

  return {
    collection: values.collection.trim(),
    url: values.url.trim(),
    replayMode: values.replayMode === "pinned" ? "pinned" : "closest",
    replayDatetime: values.replayDatetime.trim(),
    limit,
  };
};

export const resolveCaptureMode = (
  values: Pick<SearchFormValues, "replayDatetime" | "replayMode">,
): CaptureMode => {
  if (!values.replayDatetime.trim()) return "latest";
  return values.replayMode === "pinned" ? "timestamp" : "closest";
};

export const readSearchFormValues = (
  form: HTMLFormElement,
  limit: number,
): SearchFormValues => {
  const data = new FormData(form);

  return normalizeSearchFormValues({
    collection: String(data.get("collection") ?? "").trim(),
    url: String(data.get("url") ?? "").trim(),
    replayMode: String(data.get("replayMode") ?? "closest") as ReplayInputMode,
    replayDatetime: String(data.get("replayDatetime") ?? "").trim(),
    limit,
  });
};

export const parseSearchValuesFromUrl = (): {
  values: SearchFormValues;
  tab: SearchTab;
  page: number;
  run: boolean;
} => {
  const params = new URLSearchParams(window.location.search);
  const parsedLimit = Number.parseInt(params.get("limit") ?? "", 10);
  const parsedPage = Number.parseInt(params.get("page") ?? "", 10);
  const timestamp = params.get("ts") ?? "";
  const acceptDatetime = params.get("ad") ?? "";
  const tabParam = params.get("tab");

  const values = normalizeSearchFormValues({
    collection: params.get("coll") ?? DEFAULT_COLLECTION,
    url: params.get("url") ?? DEFAULT_URL,
    replayMode: timestamp ? "pinned" : "closest",
    replayDatetime: timestamp || acceptDatetime,
    limit:
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? parsedLimit
        : DEFAULT_LIMIT,
  });

  const tab: SearchTab =
    tabParam === "timeline" || tabParam === "capture" ? tabParam : "snapshots";
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return {
    values,
    tab,
    page,
    run: AUTO_RUN_KEYS.some((key) => params.has(key)),
  };
};

export const buildSearchUrl = (
  submittedSearch: SearchFormValues,
  activeTab: SearchTab,
  snapshotPage: number,
) => {
  const params = new URLSearchParams();

  if (submittedSearch.collection !== DEFAULT_COLLECTION) {
    params.set("coll", submittedSearch.collection);
  }

  if (submittedSearch.url !== DEFAULT_URL) {
    params.set("url", submittedSearch.url);
  }

  if (submittedSearch.replayDatetime) {
    const replayKey = submittedSearch.replayMode === "pinned" ? "ts" : "ad";
    params.set(replayKey, submittedSearch.replayDatetime);
  }

  if (submittedSearch.limit !== DEFAULT_LIMIT) {
    params.set("limit", String(submittedSearch.limit));
  }

  if (activeTab !== "snapshots") {
    params.set("tab", activeTab);
  }

  if (snapshotPage > 1) {
    params.set("page", String(snapshotPage));
  }

  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ""}`;
};

export const resolveApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) throw new Error("VITE_API_BASE_URL is required");

  return baseUrl.replace(/\/+$/, "");
};

export const dataToText = async (data: unknown) => {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (data instanceof Blob) return data.text();

  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

export const parseNdjsonRows = (payload: string): SnapshotRow[] => {
  return payload
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line) as Record<string, unknown>;

        return [
          {
            urlkey: String(parsed.urlkey ?? ""),
            timestamp: String(parsed.timestamp ?? ""),
            url: String(parsed.url ?? ""),
            status: String(parsed.status ?? ""),
            mime: String(parsed["mime-detected"] ?? parsed.mime ?? ""),
          },
        ];
      } catch {
        return [];
      }
    });
};

export const isSearchTab = (value: string): value is SearchTab => {
  return value === "snapshots" || value === "timeline" || value === "capture";
};

export const parseAccordionValues = (nextValue: unknown): string[] => {
  if (Array.isArray(nextValue)) {
    return nextValue.filter(
      (value): value is string => typeof value === "string",
    );
  }

  return typeof nextValue === "string" ? [nextValue] : [];
};

export const getBoundaryTimestamp = (
  rows: SnapshotRow[],
  direction: "first" | "latest",
) => {
  if (!rows.length) return "-";

  return (
    rows
      .map((row) => row.timestamp)
      .sort((left, right) =>
        direction === "first"
          ? left.localeCompare(right)
          : right.localeCompare(left),
      )[0] ?? "-"
  );
};
