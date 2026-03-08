import { useStore } from "@nanostores/preact";
import type { ComponentChildren } from "preact";
import { Route, Router, useLocation } from "preact-iso";

import { $ccbot, $collInfo, $graphInfo } from "@/api/queries";

type NavLinkProps = {
  href: string;
  children: ComponentChildren;
};

type DataSectionProps = {
  title: string;
  sourcePath: string;
  loading: boolean;
  error: unknown;
  loadingText: string;
  errorText: string;
  children: ComponentChildren;
  testId: string;
};

function NavLink({ href, children }: NavLinkProps) {
  const { path, route } = useLocation();
  const isActive = path === href;

  return (
    <a
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`rounded-md px-3 py-2 text-base font-semibold transition-colors ${
        isActive
          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
          : "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      }`}
      onClick={(event) => {
        event.preventDefault();
        route(href);
      }}
    >
      {children}
    </a>
  );
}

function DataSection({
  title,
  sourcePath,
  loading,
  error,
  loadingText,
  errorText,
  children,
  testId,
}: DataSectionProps) {
  return (
    <section
      className="space-y-3 rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      data-testid={testId}
    >
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-base text-slate-700 dark:text-slate-200">
        Source:{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          {sourcePath}
        </code>
      </p>

      {loading ? (
        <p className="text-base text-slate-700 dark:text-slate-200">
          {loadingText}
        </p>
      ) : null}
      {error ? (
        <p className="text-base font-medium text-red-700 dark:text-red-300">
          {errorText}
        </p>
      ) : null}
      {children}
    </section>
  );
}

function HomePage() {
  const {
    data: collinfo,
    loading: isCollinfoLoading,
    error: collinfoError,
  } = useStore($collInfo);
  const {
    data: graphinfo,
    loading: isGraphinfoLoading,
    error: graphinfoError,
  } = useStore($graphInfo);
  const {
    data: ccbot,
    loading: isCcbotLoading,
    error: ccbotError,
  } = useStore($ccbot);

  return (
    <section data-testid="home-page" className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Home
      </h2>

      <DataSection
        title="Collections"
        sourcePath="/api/v1/index/collinfo.json"
        loading={isCollinfoLoading}
        error={collinfoError}
        loadingText="Loading collinfo..."
        errorText="Failed to load collinfo."
        testId="collinfo-section"
      >
        {!isCollinfoLoading && !collinfoError && collinfo?.length === 0 ? (
          <p className="text-base text-slate-700 dark:text-slate-200">
            No collections found.
          </p>
        ) : null}

        {collinfo && collinfo.length > 0 ? (
          <ul
            data-testid="collinfo-list"
            className="max-h-64 list-disc space-y-1 overflow-auto pl-5 text-base text-slate-800 dark:text-slate-100"
          >
            {collinfo.slice(0, 20).map((entry) => (
              <li key={entry.id}>
                <strong>{entry.id}</strong> — {entry.name}
              </li>
            ))}
          </ul>
        ) : null}
      </DataSection>

      <DataSection
        title="Web Graph Releases"
        sourcePath="/api/v1/index/graphinfo.json"
        loading={isGraphinfoLoading}
        error={graphinfoError}
        loadingText="Loading graphinfo..."
        errorText="Failed to load graphinfo."
        testId="graphinfo-section"
      >
        {!isGraphinfoLoading && !graphinfoError && graphinfo?.length === 0 ? (
          <p className="text-base text-slate-700 dark:text-slate-200">
            No graph releases found.
          </p>
        ) : null}

        {graphinfo && graphinfo.length > 0 ? (
          <ul
            data-testid="graphinfo-list"
            className="max-h-64 list-disc space-y-1 overflow-auto pl-5 text-base text-slate-800 dark:text-slate-100"
          >
            {graphinfo.slice(0, 20).map((entry) => (
              <li key={entry.id}>
                <strong>{entry.id}</strong> — crawls {entry.crawls.length}, host
                nodes {entry.stats.host.nodes.toLocaleString()}
              </li>
            ))}
          </ul>
        ) : null}
      </DataSection>

      <DataSection
        title="CCBot Prefixes"
        sourcePath="/api/v1/index/ccbot.json"
        loading={isCcbotLoading}
        error={ccbotError}
        loadingText="Loading ccbot..."
        errorText="Failed to load ccbot."
        testId="ccbot-section"
      >
        {ccbot ? (
          <>
            <p
              data-testid="ccbot-creation-time"
              className="text-base text-slate-800 dark:text-slate-100"
            >
              creationTime: <strong>{ccbot.creationTime}</strong>
            </p>
            <ul
              data-testid="ccbot-prefix-list"
              className="max-h-64 list-disc space-y-1 overflow-auto pl-5 text-base text-slate-800 dark:text-slate-100"
            >
              {ccbot.prefixes.slice(0, 20).map((prefix, index) => {
                const value =
                  "ipv4Prefix" in prefix
                    ? prefix.ipv4Prefix
                    : prefix.ipv6Prefix;
                return <li key={`${value}-${index}`}>{value}</li>;
              })}
            </ul>
          </>
        ) : null}
      </DataSection>
    </section>
  );
}

function AboutPage() {
  return (
    <section data-testid="about-page" className="space-y-3">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        About
      </h2>
      <p className="text-base text-slate-800 dark:text-slate-100">
        commoncrawl.cc provides a browser-friendly interface for Common Crawl
        index data.
      </p>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="space-y-3">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Not Found
      </h2>
      <p className="text-base text-slate-800 dark:text-slate-100">
        Try Home or About.
      </p>
    </section>
  );
}

export function App() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-6">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        commoncrawl.cc
      </h1>
      <nav aria-label="Main navigation" className="flex items-center gap-2">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/about">About</NavLink>
      </nav>

      <Router>
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route default component={NotFoundPage} />
      </Router>
    </main>
  );
}
