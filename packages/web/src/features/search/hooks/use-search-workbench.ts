import type { JSX } from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

import { ROWS_PER_PAGE_OPTIONS, TAB_ITEMS } from "../constants";
import type { CaptureTarget, SearchFormValues, SnapshotRow } from "../types";
import {
  getBoundaryTimestamp,
  parseAccordionValues,
  readSearchFormValues,
} from "../utils";
import useSearchCollections from "./use-search-collections";
import useSearchData from "./use-search-data";
import useSearchPagination from "./use-search-pagination";
import useSearchUrlState from "./use-search-url-state";

type SubmitSearchOptions = {
  activateSnapshots?: boolean;
  preserveDeferredData?: boolean;
  snapshotPage?: number;
};

const toCaptureTarget = (row: SnapshotRow | null): CaptureTarget | null => {
  if (!row) return null;
  return { url: row.url, timestamp: row.timestamp };
};

const getRowKey = (row: SnapshotRow | null) =>
  row ? `${row.timestamp}:${row.url}` : null;

const useSearchWorkbench = () => {
  const {
    deferredErrorState,
    deferredLoadState,
    ensureCaptureLoaded,
    ensureTimelineLoaded,
    errorMessage,
    fetchTimemapCdxj,
    fetchTimemapLink,
    loadSnapshotPage,
    loading,
    loadingTarget,
    resetSearchState,
    result,
    runSearch,
  } = useSearchData();

  const {
    activeTab,
    clearPendingAutoSearch,
    commitSearch,
    didHydrateFromUrl,
    formDefaults,
    formVersion,
    handleRowsPerPageChange,
    handleTabChange,
    pendingAutoSearchValues,
    rowsPerPage,
    setSnapshotPage,
    snapshotPage,
    submittedSearch,
  } = useSearchUrlState({ onHydrate: resetSearchState });

  const { collectionSelectOptions, sidebarFooterMessage } =
    useSearchCollections();
  const pagination = useSearchPagination({ result, rowsPerPage, snapshotPage });
  const { pagedSnapshots } = pagination;
  const [selectedCaptureRow, setSelectedCaptureRow] =
    useState<SnapshotRow | null>(null);

  const snapshotRows = result?.snapshots ?? [];
  const firstSeen = useMemo(
    () => getBoundaryTimestamp(snapshotRows, "first"),
    [snapshotRows],
  );
  const latestSeen = useMemo(
    () => getBoundaryTimestamp(snapshotRows, "latest"),
    [snapshotRows],
  );
  const selectedCaptureTarget = toCaptureTarget(
    selectedCaptureRow ?? pagedSnapshots[0] ?? null,
  );

  const submitSearch = useCallback(
    (values: SearchFormValues, options?: SubmitSearchOptions) => {
      const nextSnapshotPage = options?.snapshotPage ?? snapshotPage;
      const hasRequiredFields = Boolean(
        values.collection.trim() && values.url.trim(),
      );

      if (hasRequiredFields) {
        commitSearch(values, {
          activateSnapshots: options?.activateSnapshots,
          snapshotPage: nextSnapshotPage,
        });
      }

      void runSearch(values, {
        preserveDeferredData: options?.preserveDeferredData,
        snapshotPage: nextSnapshotPage,
      });
    },
    [commitSearch, runSearch, snapshotPage],
  );

  const handleSnapshotPageChange = useCallback(
    (page: number) => {
      if (page === snapshotPage) return;
      setSnapshotPage(page);
    },
    [setSnapshotPage, snapshotPage],
  );

  const handleCaptureRowSelect = useCallback(
    (row: SnapshotRow) => {
      setSelectedCaptureRow(row);
      handleTabChange("capture");
    },
    [handleTabChange],
  );

  useEffect(() => {
    if (!didHydrateFromUrl || !pendingAutoSearchValues) return;

    clearPendingAutoSearch();
    submitSearch(pendingAutoSearchValues, { snapshotPage });
  }, [
    clearPendingAutoSearch,
    didHydrateFromUrl,
    pendingAutoSearchValues,
    snapshotPage,
    submitSearch,
  ]);

  useEffect(() => {
    if (!result) {
      setSelectedCaptureRow(null);
      return;
    }

    setSelectedCaptureRow((current) => {
      if (
        current &&
        result.snapshots.some((row) => getRowKey(row) === getRowKey(current))
      ) {
        return current;
      }

      return pagedSnapshots[0] ?? result.snapshots[0] ?? null;
    });
  }, [pagedSnapshots, result]);

  useEffect(() => {
    if (activeTab === "timeline") {
      void ensureTimelineLoaded();
    }

    if (activeTab === "capture") {
      void ensureCaptureLoaded(submittedSearch, selectedCaptureTarget);
    }
  }, [
    activeTab,
    ensureCaptureLoaded,
    ensureTimelineLoaded,
    selectedCaptureTarget,
    submittedSearch,
  ]);

  useEffect(() => {
    if (!result || loadingTarget === "snapshots") return;
    void loadSnapshotPage(submittedSearch, snapshotPage);
  }, [loadSnapshotPage, loadingTarget, result, snapshotPage, submittedSearch]);

  useEffect(() => {
    if (!result || loadingTarget === "snapshots") return;
    if (submittedSearch.limit === rowsPerPage) return;

    submitSearch(
      {
        ...submittedSearch,
        limit: rowsPerPage,
      },
      {
        activateSnapshots: false,
        preserveDeferredData: true,
        snapshotPage: 1,
      },
    );
  }, [loadingTarget, result, rowsPerPage, submitSearch, submittedSearch]);

  const handleSearchSubmit = useCallback(
    (event: JSX.TargetedEvent<HTMLFormElement, SubmitEvent>) => {
      event.preventDefault();

      const values = readSearchFormValues(event.currentTarget, rowsPerPage);
      submitSearch(values, { snapshotPage: 1 });
    },
    [rowsPerPage, submitSearch],
  );

  const handleInspectorAccordionChange = useCallback(
    (nextValue: unknown) => {
      const values = parseAccordionValues(nextValue);
      const shouldLoadTimeline = values.includes("raw-timeline");
      const shouldLoadCapture =
        values.includes("headers") || values.includes("raw-capture");

      if (shouldLoadTimeline) {
        void ensureTimelineLoaded();
      }

      if (shouldLoadCapture) {
        void ensureCaptureLoaded(submittedSearch, selectedCaptureTarget);
      }
    },
    [
      ensureCaptureLoaded,
      ensureTimelineLoaded,
      selectedCaptureTarget,
      submittedSearch,
    ],
  );

  return {
    activeTab,
    collectionSelectOptions,
    deferredErrorState,
    deferredLoadState,
    errorMessage,
    fetchTimemapCdxj,
    fetchTimemapLink,
    firstSeen,
    formDefaults,
    formVersion,
    handleCaptureRowSelect,
    handleInspectorAccordionChange,
    handleRowsPerPageChange,
    handleSearchSubmit,
    handleSnapshotPageChange,
    handleTabChange,
    latestSeen,
    loading,
    result,
    rowsPerPage,
    rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
    searchTabs: TAB_ITEMS,
    selectedCaptureTarget,
    selectedCaptureTargetKey: getRowKey(
      selectedCaptureRow ?? pagedSnapshots[0] ?? null,
    ),
    sidebarFooterMessage,
    snapshotPage,
    snapshotRows,
    ...pagination,
  };
};

export default useSearchWorkbench;
