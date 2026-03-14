import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import useSearchWorkbench from "@/features/search/hooks/use-search-workbench";

import SearchForm from "../search-form";
import SearchInspectorPane from "../search-inspector-pane";
import SearchResultsPane from "../search-results-pane";
import SearchSummaryCards from "../search-summary-cards";

const SearchWorkbench = () => {
  const {
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
    pagedSnapshots,
    pagedTimeline,
    result,
    rowsPerPage,
    rowsPerPageOptions,
    searchTabs,
    selectedCaptureTarget,
    selectedCaptureTargetKey,
    sidebarFooterMessage,
    snapshotPage,
    snapshotRows,
    snapshotTotalPages,
    timelineLoaded,
    timelinePage,
    timelineRows,
    timelineTotalPages,
    setTimelinePage,
  } = useSearchWorkbench();

  const captureErrorMessage = deferredErrorState.capture;

  return (
    <SidebarProvider className="border-border bg-card relative h-full min-h-0 overflow-hidden rounded-2xl border">
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <div className="px-2 py-1">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Console
            </p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-2 pt-0">
              <SearchForm
                formVersion={formVersion}
                loading={loading}
                defaultValues={formDefaults}
                collectionOptions={collectionSelectOptions}
                onSubmit={handleSearchSubmit}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <p className="text-muted-foreground px-2 pb-2 text-xs">
            {sidebarFooterMessage}
          </p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-0">
        <header className="flex h-14 items-center gap-2 border-b px-3 sm:px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="h-4 data-vertical:self-auto"
          />
          <div className="flex min-w-0 flex-col">
            <h3 className="text-foreground truncate text-sm font-semibold">
              Search Common Crawl snapshots
            </h3>
            <p className="text-muted-foreground truncate text-xs">
              Console workspace with tabbed results and structured inspector.
            </p>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
          {loading ? (
            <div className="bg-background/80 pointer-events-none absolute inset-x-4 top-4 z-10 rounded-md">
              <Progress indeterminate aria-label="Search in progress" />
            </div>
          ) : null}

          {errorMessage ? (
            <Alert variant="destructive" aria-live="polite">
              <AlertTitle>Search error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>Ready to query</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  Run a query from the sidebar to open the results workspace.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {result ? (
            <>
              <SearchSummaryCards
                firstSeen={firstSeen}
                latestSeen={latestSeen}
                loadedSnapshotCount={snapshotRows.length}
                snapshotBlockCount={
                  result.snapshotIndexMeta?.blockCount ?? null
                }
                timelineCount={timelineLoaded ? timelineRows.length : null}
              />

              <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <SearchResultsPane
                  activeTab={activeTab}
                  captureErrorMessage={captureErrorMessage}
                  captureFailed={deferredLoadState.capture === "error"}
                  deferredErrorState={deferredErrorState}
                  onCaptureRowSelect={handleCaptureRowSelect}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  onSnapshotPageChange={handleSnapshotPageChange}
                  onTabChange={handleTabChange}
                  pagedSnapshots={pagedSnapshots}
                  pagedTimeline={pagedTimeline}
                  result={result}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={rowsPerPageOptions}
                  searchTabs={searchTabs}
                  selectedCaptureTarget={selectedCaptureTarget}
                  selectedCaptureTargetKey={selectedCaptureTargetKey}
                  snapshotPage={snapshotPage}
                  snapshotTotalPages={snapshotTotalPages}
                  timelineLoaded={timelineLoaded}
                  timelinePage={timelinePage}
                  timelineTotalPages={timelineTotalPages}
                  onTimelinePageChange={setTimelinePage}
                />

                <SearchInspectorPane
                  captureErrorMessage={captureErrorMessage}
                  deferredErrorState={deferredErrorState}
                  onAccordionChange={handleInspectorAccordionChange}
                  onFetchTimemapCdxj={fetchTimemapCdxj}
                  onFetchTimemapLink={fetchTimemapLink}
                  result={result}
                />
              </section>
            </>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SearchWorkbench;
