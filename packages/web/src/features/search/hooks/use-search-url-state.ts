import { useCallback, useEffect, useState } from "preact/hooks";

import { DEFAULT_LIMIT, INITIAL_SEARCH_FORM_VALUES } from "../constants";
import type { SearchFormValues, SearchTab } from "../types";
import {
  buildSearchUrl,
  isSearchTab,
  parseSearchValuesFromUrl,
} from "../utils";

type UseSearchUrlStateOptions = {
  onHydrate: () => void;
};

type CommitSearchOptions = {
  activateSnapshots?: boolean;
  snapshotPage?: number;
};

const useSearchUrlState = ({ onHydrate }: UseSearchUrlStateOptions) => {
  const [formDefaults, setFormDefaults] = useState(INITIAL_SEARCH_FORM_VALUES);
  const [formVersion, setFormVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<SearchTab>("snapshots");
  const [submittedSearch, setSubmittedSearch] = useState<SearchFormValues>(
    INITIAL_SEARCH_FORM_VALUES,
  );
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_LIMIT);
  const [didHydrateFromUrl, setDidHydrateFromUrl] = useState(false);
  const [snapshotPage, setSnapshotPage] = useState(1);
  const [pendingAutoSearchValues, setPendingAutoSearchValues] =
    useState<SearchFormValues | null>(null);

  const applyFormDefaults = useCallback((nextDefaults: SearchFormValues) => {
    setFormDefaults(nextDefaults);
    setFormVersion((version) => version + 1);
  }, []);

  const hydrateFromUrl = useCallback(() => {
    const { values, tab, page, run } = parseSearchValuesFromUrl();

    applyFormDefaults(values);
    setRowsPerPage(values.limit);
    setSubmittedSearch(values);
    setActiveTab(tab);
    setSnapshotPage(page);
    setPendingAutoSearchValues(run ? values : null);
    onHydrate();
    setDidHydrateFromUrl(true);
  }, [applyFormDefaults, onHydrate]);

  useEffect(() => {
    hydrateFromUrl();
    window.addEventListener("popstate", hydrateFromUrl);

    return () => window.removeEventListener("popstate", hydrateFromUrl);
  }, [hydrateFromUrl]);

  useEffect(() => {
    if (!didHydrateFromUrl) return;

    const currentUrl = `${window.location.pathname}${window.location.search}`;
    const nextUrl = buildSearchUrl(submittedSearch, activeTab, snapshotPage);

    if (currentUrl !== nextUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [activeTab, didHydrateFromUrl, snapshotPage, submittedSearch]);

  const clearPendingAutoSearch = useCallback(
    () => setPendingAutoSearchValues(null),
    [],
  );

  const commitSearch = useCallback(
    (values: SearchFormValues, options?: CommitSearchOptions) => {
      setSubmittedSearch(values);
      setSnapshotPage(options?.snapshotPage ?? 1);

      if (options?.activateSnapshots ?? true) {
        setActiveTab("snapshots");
      }
    },
    [],
  );

  const handleRowsPerPageChange = useCallback(
    (nextValue: string) => {
      const nextRowsPerPage = Number.parseInt(nextValue, 10);

      if (
        !Number.isFinite(nextRowsPerPage) ||
        nextRowsPerPage <= 0 ||
        nextRowsPerPage === rowsPerPage
      ) {
        return;
      }

      setRowsPerPage(nextRowsPerPage);
    },
    [rowsPerPage],
  );

  const handleTabChange = useCallback((value: string) => {
    if (isSearchTab(value)) {
      setActiveTab(value);
    }
  }, []);

  return {
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
  };
};

export default useSearchUrlState;
