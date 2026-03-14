import type { SearchFormValues, SearchTab, SelectOption } from "./types";

export const DEFAULT_COLLECTION = "CC-MAIN-2026-08";
export const DEFAULT_URL = "example.com/*";
export const DEFAULT_LIMIT = 20;
export const IS_TEST_ENV = import.meta.env.MODE === "test";

export const ROWS_PER_PAGE_OPTIONS: SelectOption[] = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

export const TAB_ITEMS: Array<{ key: SearchTab; label: string }> = [
  { key: "snapshots", label: "Snapshots" },
  { key: "timeline", label: "Timeline" },
  { key: "capture", label: "Capture" },
];

export const INITIAL_SEARCH_FORM_VALUES: SearchFormValues = {
  collection: DEFAULT_COLLECTION,
  url: DEFAULT_URL,
  replayMode: "closest",
  replayDatetime: "",
  limit: DEFAULT_LIMIT,
};

export const EMPTY_DEFERRED_LOAD_STATE = {
  timeline: "idle",
  capture: "idle",
} as const;

export const EMPTY_DEFERRED_ERROR_STATE = {
  timeline: null,
  capture: null,
} as const;
