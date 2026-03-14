import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SearchSummaryCardsProps = {
  firstSeen: string;
  latestSeen: string;
  loadedSnapshotCount: number;
  snapshotBlockCount: number | null;
  timelineCount: number | null;
};

const VALUE_CLASS_NAME = "text-xl font-bold text-foreground";
const TIMESTAMP_CLASS_NAME = "font-mono text-sm font-bold text-foreground";
const META_TEXT_CLASS_NAME = "pt-1 text-[11px] text-muted-foreground";

const SearchSummaryCards = ({
  firstSeen,
  latestSeen,
  loadedSnapshotCount,
  snapshotBlockCount,
  timelineCount,
}: SearchSummaryCardsProps) => (
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <Card size="sm">
      <CardHeader>
        <CardTitle>Snapshots</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={VALUE_CLASS_NAME}>
          {snapshotBlockCount === null
            ? "—"
            : snapshotBlockCount.toLocaleString()}
        </p>
        <p className={META_TEXT_CLASS_NAME}>
          Paged index blocks · loaded {loadedSnapshotCount.toLocaleString()}{" "}
          rows.
        </p>
      </CardContent>
    </Card>

    <Card size="sm">
      <CardHeader>
        <CardTitle>Timeline entries</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={VALUE_CLASS_NAME}>
          {timelineCount === null ? "—" : timelineCount.toLocaleString()}
        </p>
        {timelineCount === null ? (
          <p className={META_TEXT_CLASS_NAME}>Loads when Timeline is opened.</p>
        ) : null}
      </CardContent>
    </Card>

    <Card size="sm">
      <CardHeader>
        <CardTitle>First seen</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={TIMESTAMP_CLASS_NAME}>{firstSeen}</p>
      </CardContent>
    </Card>

    <Card size="sm">
      <CardHeader>
        <CardTitle>Latest seen</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={TIMESTAMP_CLASS_NAME}>{latestSeen}</p>
      </CardContent>
    </Card>
  </section>
);

export default SearchSummaryCards;
