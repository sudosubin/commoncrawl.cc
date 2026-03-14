import type { ComponentChildren } from "preact";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  CaptureTarget,
  DeferredErrorState,
  SearchResult,
  SearchTab,
  SnapshotRow,
  SelectOption,
} from "@/features/search/types";

import ControlledSelectField from "../controlled-select-field";

type ResultColumn<T> = {
  header: string;
  renderCell: (row: T) => ComponentChildren;
  className?: string;
};

type ResultTableTabProps<T> = {
  value: SearchTab;
  columns: ResultColumn<T>[];
  rows: T[];
  emptyState: string;
  loadingState?: string;
  loaded: boolean;
  rowKey: (row: T, index: number) => string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  selectedRowKey?: string | null;
};

type SearchResultsPaneProps = {
  activeTab: SearchTab;
  captureErrorMessage: string | null;
  captureFailed: boolean;
  deferredErrorState: DeferredErrorState;
  onRowsPerPageChange: (value: string) => void;
  onSnapshotPageChange: (page: number) => void;
  onTabChange: (value: string) => void;
  onCaptureRowSelect: (row: SnapshotRow) => void;
  pagedSnapshots: SnapshotRow[];
  pagedTimeline: SnapshotRow[];
  result: SearchResult;
  rowsPerPage: number;
  rowsPerPageOptions: SelectOption[];
  searchTabs: Array<{ key: SearchTab; label: string }>;
  selectedCaptureTarget: CaptureTarget | null;
  selectedCaptureTargetKey: string | null;
  snapshotPage: number;
  snapshotTotalPages: number;
  timelineLoaded: boolean;
  timelinePage: number;
  timelineTotalPages: number;
  onTimelinePageChange: (page: number) => void;
};

const MONO_CELL_CLASS_NAME = "font-mono";
const ROWS_SELECT_CLASS_NAME =
  "h-7 w-20 rounded-md border border-input bg-input/20 px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const DISABLED_PAGINATION_CLASS_NAME = "pointer-events-none opacity-50";
const CLICKABLE_ROW_CLASS_NAME = "cursor-pointer hover:bg-muted/70";
const SELECTED_ROW_CLASS_NAME = "bg-muted";

const snapshotColumns: ResultColumn<SnapshotRow>[] = [
  {
    header: "Timestamp",
    renderCell: (row) => row.timestamp,
    className: MONO_CELL_CLASS_NAME,
  },
  { header: "Status", renderCell: (row) => row.status },
  { header: "MIME", renderCell: (row) => row.mime || "-" },
  { header: "URL", renderCell: (row) => row.url },
];

const timelineColumns: ResultColumn<SnapshotRow>[] = [
  {
    header: "Timestamp",
    renderCell: (row) => row.timestamp,
    className: MONO_CELL_CLASS_NAME,
  },
  { header: "Status", renderCell: (row) => row.status },
  { header: "URL", renderCell: (row) => row.url },
];

const getRowKey = (row: SnapshotRow) => `${row.timestamp}:${row.url}`;

const renderPagination = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void,
) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const visiblePages = [currentPage - 1, currentPage, currentPage + 1].filter(
    (page) => page >= 1 && page <= totalPages,
  );
  const firstVisiblePage = visiblePages[0];
  const lastVisiblePage = visiblePages[visiblePages.length - 1];

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={!canGoPrev}
            className={!canGoPrev ? DISABLED_PAGINATION_CLASS_NAME : undefined}
            onClick={(event) => {
              event.preventDefault();
              if (canGoPrev) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {firstVisiblePage && firstVisiblePage > 1 ? (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(1);
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {firstVisiblePage > 2 ? (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            ) : null}
          </>
        ) : null}

        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === currentPage}
              onClick={(event) => {
                event.preventDefault();
                onPageChange(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {lastVisiblePage && lastVisiblePage < totalPages ? (
          <>
            {lastVisiblePage < totalPages - 1 ? (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            ) : null}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(totalPages);
                }}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        ) : null}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={!canGoNext}
            className={!canGoNext ? DISABLED_PAGINATION_CLASS_NAME : undefined}
            onClick={(event) => {
              event.preventDefault();
              if (canGoNext) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

const ResultTableTab = <T,>({
  columns,
  currentPage,
  emptyState,
  loaded,
  loadingState = "Loading...",
  onPageChange,
  onRowClick,
  rowKey,
  rows,
  selectedRowKey,
  totalPages,
  value,
}: ResultTableTabProps<T>) => {
  const hasPagination =
    loaded && rows.length > 0 && currentPage && totalPages && onPageChange;

  return (
    <TabsContent value={value} className="min-h-0">
      <ScrollArea className="border-border h-[30rem] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loaded ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground"
                >
                  {loadingState}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground"
                >
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                const key = rowKey(row, index);
                const isSelected = selectedRowKey === key;

                return (
                  <TableRow
                    key={key}
                    data-selected={isSelected || undefined}
                    className={
                      onRowClick
                        ? `${CLICKABLE_ROW_CLASS_NAME} ${isSelected ? SELECTED_ROW_CLASS_NAME : ""}`
                        : undefined
                    }
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.header}
                        className={column.className}
                      >
                        {column.renderCell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {hasPagination ? (
        <div className="pt-2">
          {renderPagination(currentPage, totalPages, onPageChange)}
        </div>
      ) : null}
    </TabsContent>
  );
};

const SearchResultsPane = ({
  activeTab,
  captureErrorMessage,
  captureFailed,
  deferredErrorState,
  onCaptureRowSelect,
  onRowsPerPageChange,
  onSnapshotPageChange,
  onTabChange,
  pagedSnapshots,
  pagedTimeline,
  result,
  rowsPerPage,
  rowsPerPageOptions,
  searchTabs,
  selectedCaptureTarget,
  selectedCaptureTargetKey,
  snapshotPage,
  snapshotTotalPages,
  timelineLoaded,
  timelinePage,
  timelineTotalPages,
  onTimelinePageChange,
}: SearchResultsPaneProps) => {
  const captureMessage = captureFailed
    ? (captureErrorMessage ?? "Capture failed to load.")
    : selectedCaptureTarget
      ? "Loading selected capture..."
      : "Select a snapshot or timeline row to inspect capture.";

  return (
    <Card className="min-h-0">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          className="min-h-0 flex-1 gap-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList variant="line">
              {searchTabs.map((item) => (
                <TabsTrigger key={item.key} value={item.key}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-2">
              <Label
                htmlFor="rows-per-page"
                className="text-muted-foreground text-[11px]"
              >
                Rows
              </Label>
              <ControlledSelectField
                id="rows-per-page"
                value={String(rowsPerPage)}
                options={rowsPerPageOptions}
                onValueChange={onRowsPerPageChange}
                className={ROWS_SELECT_CLASS_NAME}
              />
            </div>
          </div>

          <ResultTableTab
            value="snapshots"
            columns={snapshotColumns}
            loaded
            rows={pagedSnapshots}
            emptyState="No snapshot rows."
            rowKey={getRowKey}
            selectedRowKey={selectedCaptureTargetKey}
            onRowClick={onCaptureRowSelect}
            currentPage={snapshotPage}
            totalPages={snapshotTotalPages}
            onPageChange={onSnapshotPageChange}
          />

          <ResultTableTab
            value="timeline"
            columns={timelineColumns}
            loaded={timelineLoaded}
            rows={pagedTimeline}
            emptyState="No timeline rows."
            loadingState={
              deferredErrorState.timeline ?? "Loading timeline on demand..."
            }
            rowKey={getRowKey}
            selectedRowKey={selectedCaptureTargetKey}
            onRowClick={onCaptureRowSelect}
            currentPage={timelinePage}
            totalPages={timelineTotalPages}
            onPageChange={onTimelinePageChange}
          />

          <TabsContent value="capture" className="min-h-0">
            <ScrollArea className="border-border bg-background h-[30rem] rounded-md border p-3">
              {selectedCaptureTarget ? (
                <div className="text-muted-foreground mb-3 space-y-1 text-xs">
                  <p>
                    <strong className="text-foreground">URL:</strong>{" "}
                    {selectedCaptureTarget.url}
                  </p>
                  <p>
                    <strong className="text-foreground">Timestamp:</strong>{" "}
                    {selectedCaptureTarget.timestamp}
                  </p>
                </div>
              ) : null}

              {result.capture &&
              result.capture.targetKey === selectedCaptureTargetKey ? (
                <pre className="text-foreground text-xs leading-5">
                  {result.capture.preview || "(empty body)"}
                </pre>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {captureMessage}
                </p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SearchResultsPane;
