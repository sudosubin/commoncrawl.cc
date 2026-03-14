import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DeferredErrorState, SearchResult } from "@/features/search/types";

type InspectorAccordionSectionProps = {
  value: string;
  title: string;
  content: string | null | undefined;
  fallbackMessage: string;
};

type SearchInspectorPaneProps = {
  captureErrorMessage: string | null;
  deferredErrorState: DeferredErrorState;
  onAccordionChange: (value: unknown) => void;
  onFetchTimemapCdxj: () => Promise<void> | void;
  onFetchTimemapLink: () => Promise<void> | void;
  result: SearchResult;
};

const PRE_CLASS_NAME =
  "overflow-auto rounded border border-border bg-background p-2 text-xs";
const FALLBACK_CAPTURE_HEADERS = "Loading capture headers on demand...";
const FALLBACK_TIMELINE = "Loading timeline response on demand...";
const FALLBACK_CAPTURE = "Loading capture response on demand...";
const FALLBACK_SNAPSHOT_PAGED_INDEX =
  "Snapshot paged-index metadata is unavailable.";

const InspectorAccordionSection = ({
  content,
  fallbackMessage,
  title,
  value,
}: InspectorAccordionSectionProps) => {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        {content ? (
          <pre className={PRE_CLASS_NAME}>{content}</pre>
        ) : (
          <p className="text-muted-foreground text-xs">{fallbackMessage}</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const SearchInspectorPane = ({
  captureErrorMessage,
  deferredErrorState,
  onAccordionChange,
  onFetchTimemapCdxj,
  onFetchTimemapLink,
  result,
}: SearchInspectorPaneProps) => {
  const capture = result.capture;
  const captureStatus =
    capture?.status ?? (captureErrorMessage ? "error" : "—");
  const captureContentType =
    capture?.contentType ??
    (captureErrorMessage ? "Capture error" : "Capture not loaded");
  const captureEndpoint =
    capture?.endpoint ?? captureErrorMessage ?? "Loads when Capture is opened.";
  const headerCount = capture?.headers.length ?? 0;
  const snapshotBlockCount = result.snapshotIndexMeta?.blockCount ?? 0;

  return (
    <Card className="min-h-0">
      <CardHeader>
        <CardTitle>Inspector</CardTitle>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <p className="text-foreground text-xs">
          <strong>Endpoint:</strong>{" "}
          <code className="font-mono">{captureEndpoint}</code>
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">Status {captureStatus}</Badge>
          <Badge variant="secondary">{captureContentType}</Badge>
          <Badge variant="outline">
            Paged index blocks {snapshotBlockCount}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFetchTimemapLink}
          >
            Fetch TimeMap Link
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFetchTimemapCdxj}
          >
            Fetch TimeMap CDXJ
          </Button>
        </div>

        <ScrollArea className="border-border h-[22rem] rounded-md border">
          <Accordion multiple onValueChange={onAccordionChange}>
            <AccordionItem value="headers">
              <AccordionTrigger>
                Response headers ({headerCount})
              </AccordionTrigger>
              <AccordionContent>
                {capture ? (
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    {capture.headers.map(([name, value]) => (
                      <li key={name}>
                        <span className="font-mono font-semibold">{name}</span>:{" "}
                        {value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    {captureErrorMessage ?? FALLBACK_CAPTURE_HEADERS}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            <InspectorAccordionSection
              value="raw-index"
              title="Raw index response"
              content={result.raw.index}
              fallbackMessage="Index response is unavailable."
            />

            <InspectorAccordionSection
              value="raw-paged-index"
              title="Raw snapshot paged-index response"
              content={result.raw.snapshotPagedIndex}
              fallbackMessage={FALLBACK_SNAPSHOT_PAGED_INDEX}
            />

            <InspectorAccordionSection
              value="raw-timeline"
              title="Raw timeline JSON response"
              content={result.raw.timelineJson}
              fallbackMessage={deferredErrorState.timeline ?? FALLBACK_TIMELINE}
            />

            <InspectorAccordionSection
              value="raw-capture"
              title="Raw capture response"
              content={result.raw.capture}
              fallbackMessage={captureErrorMessage ?? FALLBACK_CAPTURE}
            />

            {result.raw.timemapLink ? (
              <InspectorAccordionSection
                value="raw-link"
                title="Raw TimeMap Link format"
                content={result.raw.timemapLink}
                fallbackMessage="TimeMap Link response is unavailable."
              />
            ) : null}

            {result.raw.timemapCdxj ? (
              <InspectorAccordionSection
                value="raw-cdxj"
                title="Raw TimeMap CDXJ format"
                content={result.raw.timemapCdxj}
                fallbackMessage="TimeMap CDXJ response is unavailable."
              />
            ) : null}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SearchInspectorPane;
