import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { LocationProvider } from "preact-iso";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { App } from "@/app";

const mockCollinfo = [
  {
    id: "CC-MAIN-2026-08",
    name: "February 2026 Index",
    timegate: "https://index.commoncrawl.org/CC-MAIN-2026-08/",
    "cdx-api": "https://index.commoncrawl.org/CC-MAIN-2026-08-index",
    from: "2026-02-01T00:00:00Z",
    to: "2026-02-28T23:59:59Z",
  },
];

const mockGraphinfo = [
  {
    id: "cc-main-2026-08-feb",
    crawls: ["CC-MAIN-2026-08"],
    index: "https://example.com/index",
    location: "s3://example/graph",
    stats: {
      host: { nodes: 123456, arcs: 987654 },
      domain: { nodes: 654321, arcs: 123456 },
    },
  },
];

const mockCcbot = {
  creationTime: "2026-02-21T00:00:00.000000",
  prefixes: [
    { ipv4Prefix: "18.97.9.168/29" },
    { ipv6Prefix: "2600:1f28::/60" },
  ],
};

function renderApp(path = "/") {
  window.history.pushState({}, "", path);

  return render(
    <LocationProvider>
      <App />
    </LocationProvider>,
  );
}

beforeAll(() => {
  Object.defineProperty(window, "scrollTo", {
    value: () => {},
    writable: true,
  });
});

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (requestUrl === "http://localhost:8787/api/v1/index/collinfo.json") {
      return new Response(JSON.stringify(mockCollinfo), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (requestUrl === "http://localhost:8787/api/v1/index/graphinfo.json") {
      return new Response(JSON.stringify(mockGraphinfo), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (requestUrl === "http://localhost:8787/api/v1/index/ccbot.json") {
      return new Response(JSON.stringify(mockCcbot), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  });
});

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
  vi.restoreAllMocks();
});

describe("App routes", () => {
  it("renders metadata sections on the home page", async () => {
    renderApp("/");

    expect(screen.getByTestId("home-page")).toBeTruthy();
    expect(screen.queryByTestId("about-page")).toBeNull();

    expect(await screen.findByText("CC-MAIN-2026-08")).toBeTruthy();
    expect(await screen.findByText("cc-main-2026-08-feb")).toBeTruthy();
    expect(await screen.findByText("18.97.9.168/29")).toBeTruthy();
  });

  it("renders the about page when URL is /about", () => {
    renderApp("/about");

    expect(screen.getByTestId("about-page")).toBeTruthy();
    expect(screen.queryByTestId("home-page")).toBeNull();
  });

  it("navigates between routes", async () => {
    renderApp("/");

    fireEvent.click(screen.getByRole("link", { name: "About" }));
    expect(screen.getByTestId("about-page")).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(screen.getByTestId("home-page")).toBeTruthy();
    expect(await screen.findByText("CC-MAIN-2026-08")).toBeTruthy();
  });
});
