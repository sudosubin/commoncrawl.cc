import { useEffect, useMemo, useState } from "preact/hooks";

import type { SearchResult } from "../types";

type UseSearchPaginationOptions = {
  result: SearchResult | null;
  rowsPerPage: number;
  snapshotPage: number;
};

const useSearchPagination = ({
  result,
  rowsPerPage,
  snapshotPage,
}: UseSearchPaginationOptions) => {
  const [timelinePage, setTimelinePage] = useState(1);

  const snapshots = result?.snapshots ?? [];
  const timelineRows = result?.timeline ?? [];
  const timelineLoaded = result?.timeline !== undefined;
  const snapshotTotalPages = Math.max(
    snapshotPage,
    Math.ceil(snapshots.length / rowsPerPage) || 1,
  );
  const timelineTotalPages = Math.max(
    1,
    Math.ceil(timelineRows.length / rowsPerPage),
  );

  const pagedSnapshots = useMemo(() => {
    const start = (snapshotPage - 1) * rowsPerPage;
    return snapshots.slice(start, start + rowsPerPage);
  }, [rowsPerPage, snapshotPage, snapshots]);

  const pagedTimeline = useMemo(() => {
    const start = (timelinePage - 1) * rowsPerPage;
    return timelineRows.slice(start, start + rowsPerPage);
  }, [rowsPerPage, timelinePage, timelineRows]);

  useEffect(() => {
    setTimelinePage(1);
  }, [result?.timeline, rowsPerPage]);

  useEffect(() => {
    if (timelinePage > timelineTotalPages) setTimelinePage(timelineTotalPages);
  }, [timelinePage, timelineTotalPages]);

  return {
    pagedSnapshots,
    pagedTimeline,
    snapshotTotalPages,
    timelineLoaded,
    timelinePage,
    timelineRows,
    timelineTotalPages,
    setTimelinePage,
  };
};

export default useSearchPagination;
