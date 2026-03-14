import {
  getApiV1IndexByCollByTimestampByUrl,
  getApiV1IndexByCollByUrl,
  getApiV1IndexByCollTimemapCdxjByUrl,
  getApiV1IndexByCollTimemapJsonByUrl,
  getApiV1IndexByCollTimemapLinkByUrl,
} from "@/api/__generated__";

import type {
  CaptureTarget,
  SearchFormValues,
  SearchRequest,
  SnapshotIndexMeta,
} from "./types";
import {
  dataToText,
  parseNdjsonRows,
  resolveApiBaseUrl,
  resolveCaptureMode,
} from "./utils";

const createSearchRequest = (values: SearchFormValues) => {
  const collection = values.collection.trim();
  const url = values.url.trim();

  return {
    collection,
    collectionIndex: collection.endsWith("-index")
      ? collection
      : `${collection}-index`,
    url,
    encodedUrl: encodeURIComponent(url),
  };
};

const getQueryError = (label: string, status: number) =>
  new Error(`${label} query failed (${status}).`);

const getSnapshotQueryLimit = (rowsPerPage: number, page: number) =>
  rowsPerPage * (page + 1);
const getCaptureTargetKey = (target: CaptureTarget) =>
  `${target.timestamp}:${target.url}`;

const buildCaptureEndpoint = (
  request: SearchRequest,
  replayDatetime: string,
  captureMode: ReturnType<typeof resolveCaptureMode>,
  target?: CaptureTarget,
) => {
  if (target) {
    return `/api/v1/index/${request.collection}/${target.timestamp}/${encodeURIComponent(target.url)}`;
  }

  return captureMode === "timestamp"
    ? `/api/v1/index/${request.collection}/${replayDatetime}/${request.encodedUrl}`
    : `/api/v1/index/${request.collection}/${request.encodedUrl}`;
};

const parseSnapshotIndexMeta = (raw: string): SnapshotIndexMeta => ({
  blockCount: raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length,
  raw,
});

export const fetchSnapshotIndexMeta = async (values: SearchFormValues) => {
  const request = createSearchRequest(values);
  const query = new URLSearchParams({
    url: request.url,
    output: "json",
    showPagedIndex: "true",
  });
  const response = await fetch(
    `${resolveApiBaseUrl()}/api/v1/index/${request.collectionIndex}?${query.toString()}`,
  );
  const raw = await response.text();

  if (!response.ok) throw getQueryError("Index metadata", response.status);

  return parseSnapshotIndexMeta(raw);
};

export const fetchSnapshots = async (values: SearchFormValues, page = 1) => {
  const request = createSearchRequest(values);
  const queryLimit = getSnapshotQueryLimit(values.limit, page);
  const query = new URLSearchParams({
    url: request.url,
    output: "json",
    limit: String(queryLimit),
  });
  const response = await fetch(
    `${resolveApiBaseUrl()}/api/v1/index/${request.collectionIndex}?${query.toString()}`,
  );
  const indexRaw = await response.text();

  if (!response.ok) throw getQueryError("Index", response.status);

  return {
    request: {
      collection: request.collection,
      url: request.url,
      encodedUrl: request.encodedUrl,
    },
    snapshots: parseNdjsonRows(indexRaw),
    snapshotQueryLimit: queryLimit,
    indexRaw,
  };
};

export const fetchTimeline = async (request: SearchRequest) => {
  const response = await getApiV1IndexByCollTimemapJsonByUrl(
    request.collection,
    request.encodedUrl,
  );
  const timelineRaw = await dataToText(response.data);

  if (response.status !== 200) throw getQueryError("Timeline", response.status);

  return { timeline: parseNdjsonRows(timelineRaw), timelineRaw };
};

export const fetchCapture = async (
  request: SearchRequest,
  values: SearchFormValues,
  target?: CaptureTarget,
) => {
  const replayDatetime = values.replayDatetime.trim();
  const captureMode = resolveCaptureMode(values);
  const encodedTargetUrl = target
    ? encodeURIComponent(target.url)
    : request.encodedUrl;
  const response = target
    ? await getApiV1IndexByCollByTimestampByUrl(
        request.collection,
        target.timestamp,
        encodedTargetUrl,
      )
    : captureMode === "timestamp"
      ? await getApiV1IndexByCollByTimestampByUrl(
          request.collection,
          replayDatetime,
          request.encodedUrl,
        )
      : await getApiV1IndexByCollByUrl(request.collection, request.encodedUrl, {
          headers:
            captureMode === "closest" && replayDatetime
              ? { "accept-datetime": replayDatetime }
              : undefined,
        });
  const captureRaw = await dataToText(response.data);

  if (response.status !== 200) throw getQueryError("Capture", response.status);

  const captureTarget = target ?? {
    url: request.url,
    timestamp: replayDatetime,
  };

  return {
    capture: {
      endpoint: buildCaptureEndpoint(
        request,
        replayDatetime,
        captureMode,
        target,
      ),
      status: response.status,
      contentType: response.headers.get("content-type") ?? "(unknown)",
      headers: [...response.headers.entries()],
      preview: captureRaw.slice(0, 4000),
      target: captureTarget,
      targetKey: getCaptureTargetKey(captureTarget),
    },
    captureRaw,
  };
};

export const fetchTimemapLink = async (request: SearchRequest) => {
  const response = await getApiV1IndexByCollTimemapLinkByUrl(
    request.collection,
    request.encodedUrl,
  );

  return dataToText(response.data);
};

export const fetchTimemapCdxj = async (request: SearchRequest) => {
  const response = await getApiV1IndexByCollTimemapCdxjByUrl(
    request.collection,
    request.encodedUrl,
  );

  return dataToText(response.data);
};
