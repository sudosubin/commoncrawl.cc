export type SnapshotRow = {
  urlkey: string;
  timestamp: string;
  url: string;
  status: string;
  mime: string;
};

export type CaptureTarget = {
  url: string;
  timestamp: string;
};

export type SearchRequest = {
  collection: string;
  url: string;
  encodedUrl: string;
};

export type SnapshotIndexMeta = {
  blockCount: number;
  raw: string;
};

export type SearchResult = {
  request: SearchRequest;
  snapshots: SnapshotRow[];
  snapshotQueryLimit: number;
  snapshotIndexMeta?: SnapshotIndexMeta;
  timeline?: SnapshotRow[];
  capture?: {
    endpoint: string;
    status: number;
    contentType: string;
    headers: Array<[string, string]>;
    preview: string;
    target: CaptureTarget;
    targetKey: string;
  };
  raw: {
    index: string;
    snapshotPagedIndex?: string;
    timelineJson?: string;
    capture?: string;
    timemapLink?: string;
    timemapCdxj?: string;
  };
};

export type SearchTab = "snapshots" | "timeline" | "capture";
export type ReplayInputMode = "closest" | "pinned";
export type CaptureMode = "latest" | "closest" | "timestamp";
export type DeferredLoadStatus = "idle" | "loading" | "success" | "error";

export type SearchFormValues = {
  collection: string;
  url: string;
  replayMode: ReplayInputMode;
  replayDatetime: string;
  limit: number;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type DeferredLoadState = {
  timeline: DeferredLoadStatus;
  capture: DeferredLoadStatus;
};

export type DeferredErrorState = {
  timeline: string | null;
  capture: string | null;
};
