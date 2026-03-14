import { useCallback, useState } from "preact/hooks";

import {
  EMPTY_DEFERRED_ERROR_STATE,
  EMPTY_DEFERRED_LOAD_STATE,
} from "../constants";
import {
  fetchCapture,
  fetchSnapshotIndexMeta,
  fetchSnapshots,
  fetchTimeline,
  fetchTimemapCdxj,
  fetchTimemapLink,
} from "../search-api";
import type {
  CaptureTarget,
  DeferredErrorState,
  DeferredLoadState,
  DeferredLoadStatus,
  SearchFormValues,
  SearchResult,
  SearchTab,
} from "../types";

type SearchLoadingTarget = SearchTab | "timemap-link" | "timemap-cdxj" | null;

type RunSearchOptions = {
  preserveDeferredData?: boolean;
  snapshotPage?: number;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const getCaptureTargetKey = (target: CaptureTarget) =>
  `${target.timestamp}:${target.url}`;

const useSearchData = () => {
  const [loadingTarget, setLoadingTarget] = useState<SearchLoadingTarget>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [captureTargetKey, setCaptureTargetKey] = useState<string | null>(null);
  const [deferredLoadState, setDeferredLoadState] = useState<DeferredLoadState>(
    EMPTY_DEFERRED_LOAD_STATE,
  );
  const [deferredErrorState, setDeferredErrorState] =
    useState<DeferredErrorState>(EMPTY_DEFERRED_ERROR_STATE);

  const loading = loadingTarget !== null;

  const patchResult = useCallback(
    (updater: (current: SearchResult) => SearchResult) => {
      setResult((current) => (current ? updater(current) : current));
    },
    [],
  );

  const setDeferredState = useCallback(
    (
      key: keyof DeferredLoadState,
      status: DeferredLoadStatus,
      error: string | null = null,
    ) => {
      setDeferredLoadState((current) => ({ ...current, [key]: status }));
      setDeferredErrorState((current) => ({ ...current, [key]: error }));
    },
    [],
  );

  const resetSearchState = useCallback(() => {
    setLoadingTarget(null);
    setErrorMessage(null);
    setResult(null);
    setCaptureTargetKey(null);
    setDeferredLoadState(EMPTY_DEFERRED_LOAD_STATE);
    setDeferredErrorState(EMPTY_DEFERRED_ERROR_STATE);
  }, []);

  const runSearch = useCallback(
    async (values: SearchFormValues, options?: RunSearchOptions) => {
      const collection = values.collection.trim();
      const url = values.url.trim();

      if (!collection || !url) {
        setErrorMessage("Collection and URL are required.");
        return;
      }

      setLoadingTarget("snapshots");
      setErrorMessage(null);

      try {
        const preserveDeferredData =
          options?.preserveDeferredData &&
          result?.request.collection === collection &&
          result.request.url === url;

        const [nextResult, snapshotIndexMeta] = await Promise.all([
          fetchSnapshots(values, options?.snapshotPage),
          preserveDeferredData && result?.snapshotIndexMeta
            ? Promise.resolve(result.snapshotIndexMeta)
            : fetchSnapshotIndexMeta(values),
        ]);
        const previousRaw = preserveDeferredData ? result?.raw : undefined;

        setResult({
          request: nextResult.request,
          snapshots: nextResult.snapshots,
          snapshotQueryLimit: nextResult.snapshotQueryLimit,
          snapshotIndexMeta,
          timeline: preserveDeferredData ? result?.timeline : undefined,
          capture: preserveDeferredData ? result?.capture : undefined,
          raw: {
            index: nextResult.indexRaw,
            snapshotPagedIndex: snapshotIndexMeta.raw,
            timelineJson: previousRaw?.timelineJson,
            capture: preserveDeferredData ? previousRaw?.capture : undefined,
            timemapLink: previousRaw?.timemapLink,
            timemapCdxj: previousRaw?.timemapCdxj,
          },
        });
        setCaptureTargetKey(preserveDeferredData ? captureTargetKey : null);
        setDeferredLoadState(
          preserveDeferredData ? deferredLoadState : EMPTY_DEFERRED_LOAD_STATE,
        );
        setDeferredErrorState(
          preserveDeferredData
            ? deferredErrorState
            : EMPTY_DEFERRED_ERROR_STATE,
        );
      } catch (error) {
        setErrorMessage(getErrorMessage(error));

        if (!options?.preserveDeferredData) {
          setResult(null);
        }
      } finally {
        setLoadingTarget(null);
      }
    },
    [captureTargetKey, deferredErrorState, deferredLoadState, result],
  );

  const loadSnapshotPage = useCallback(
    async (values: SearchFormValues, page: number) => {
      if (!result) return;

      const nextQueryLimit = values.limit * (page + 1);
      if (result.snapshotQueryLimit >= nextQueryLimit) return;

      setLoadingTarget("snapshots");
      setErrorMessage(null);

      try {
        const nextResult = await fetchSnapshots(values, page);

        patchResult((current) => ({
          ...current,
          snapshots: nextResult.snapshots,
          snapshotQueryLimit: nextResult.snapshotQueryLimit,
          raw: {
            ...current.raw,
            index: nextResult.indexRaw,
          },
        }));
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setLoadingTarget(null);
      }
    },
    [patchResult, result],
  );

  const ensureTimelineLoaded = useCallback(async () => {
    if (!result || result.timeline || deferredLoadState.timeline !== "idle") {
      return;
    }

    setDeferredState("timeline", "loading");
    setLoadingTarget("timeline");

    try {
      const nextTimeline = await fetchTimeline(result.request);

      patchResult((current) => ({
        ...current,
        timeline: nextTimeline.timeline,
        raw: {
          ...current.raw,
          timelineJson: nextTimeline.timelineRaw,
        },
      }));
      setDeferredState("timeline", "success");
    } catch (error) {
      setDeferredState("timeline", "error", getErrorMessage(error));
    } finally {
      setLoadingTarget(null);
    }
  }, [deferredLoadState.timeline, patchResult, result, setDeferredState]);

  const ensureCaptureLoaded = useCallback(
    async (submittedSearch: SearchFormValues, target: CaptureTarget | null) => {
      if (!result || !target) return;

      const targetKey = getCaptureTargetKey(target);
      if (result.capture?.targetKey === targetKey) return;
      if (
        deferredLoadState.capture === "loading" &&
        captureTargetKey === targetKey
      )
        return;
      if (
        deferredLoadState.capture === "error" &&
        captureTargetKey === targetKey
      )
        return;

      setCaptureTargetKey(targetKey);
      setDeferredState("capture", "loading");
      setLoadingTarget("capture");

      try {
        const nextCapture = await fetchCapture(
          result.request,
          submittedSearch,
          target,
        );

        patchResult((current) => ({
          ...current,
          capture: nextCapture.capture,
          raw: {
            ...current.raw,
            capture: nextCapture.captureRaw,
          },
        }));
        setDeferredState("capture", "success");
      } catch (error) {
        setDeferredState("capture", "error", getErrorMessage(error));
      } finally {
        setLoadingTarget(null);
      }
    },
    [
      captureTargetKey,
      deferredLoadState.capture,
      patchResult,
      result,
      setDeferredState,
    ],
  );

  const handleFetchTimemapLink = useCallback(async () => {
    if (!result) return;

    setLoadingTarget("timemap-link");

    try {
      const timemapLink = await fetchTimemapLink(result.request);

      patchResult((current) => ({
        ...current,
        raw: {
          ...current.raw,
          timemapLink,
        },
      }));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingTarget(null);
    }
  }, [patchResult, result]);

  const handleFetchTimemapCdxj = useCallback(async () => {
    if (!result) return;

    setLoadingTarget("timemap-cdxj");

    try {
      const timemapCdxj = await fetchTimemapCdxj(result.request);

      patchResult((current) => ({
        ...current,
        raw: {
          ...current.raw,
          timemapCdxj,
        },
      }));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingTarget(null);
    }
  }, [patchResult, result]);

  return {
    deferredErrorState,
    deferredLoadState,
    ensureCaptureLoaded,
    ensureTimelineLoaded,
    errorMessage,
    fetchTimemapCdxj: handleFetchTimemapCdxj,
    fetchTimemapLink: handleFetchTimemapLink,
    loadSnapshotPage,
    loading,
    loadingTarget,
    resetSearchState,
    result,
    runSearch,
  };
};

export default useSearchData;
