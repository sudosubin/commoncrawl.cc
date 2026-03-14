import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LINK_CLASS_NAME =
  "inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90";

const HomePage = () => (
  <section
    data-testid="landing-page"
    className="flex h-full min-h-0 flex-col gap-4 overflow-auto"
  >
    <Card>
      <CardHeader>
        <CardTitle>Search Common Crawl snapshots</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-3 text-sm">
        <p>
          commoncrawl.cc provides a search-focused console for Common Crawl
          index exploration.
        </p>
        <p>
          Open the search workspace to query captures, timeline, and raw
          responses.
        </p>
        <div>
          <a href="/search" className={LINK_CLASS_NAME}>
            Open search workspace
          </a>
        </div>
      </CardContent>
    </Card>
  </section>
);

export default HomePage;
