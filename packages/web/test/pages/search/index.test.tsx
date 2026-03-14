import { fireEvent, screen, waitFor } from "@testing-library/preact";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/node";

import { renderApp } from "../../support/render-app";
import {
  createSnapshotNdjson,
  mockCapture,
  mockIndex,
  mockTimeline,
  submitSearch,
} from "../../support/search";

describe("Search page", () => {
  it("hydrates the rows value from the query limit", async () => {
    const limits: string[] = [];
    let pagedIndexRequests = 0;
    let timelineRequests = 0;
    let captureRequests = 0;

    server.use(
      mockIndex({
        onRequest: (request) => {
          const params = new URL(request.url).searchParams;
          if (params.get("showPagedIndex") === "true") {
            pagedIndexRequests += 1;
            return;
          }
          limits.push(params.get("limit") ?? "");
        },
      }),
      mockTimeline({ onRequest: () => (timelineRequests += 1) }),
      mockCapture({ onRequest: () => (captureRequests += 1) }),
    );

    renderApp("/search?limit=50");

    expect(await screen.findByText("Inspector")).toBeTruthy();
    expect(limits).toEqual(["100"]);
    expect(pagedIndexRequests).toBe(1);
    expect(timelineRequests).toBe(0);
    expect(captureRequests).toBe(0);
    expect((screen.getByLabelText("Rows") as HTMLSelectElement).value).toBe(
      "50",
    );
    expect(screen.getByText("Paged index blocks 1")).toBeTruthy();
  });

  it("updates url query only when Find snapshots is submitted", async () => {
    server.use(mockIndex());
    renderApp("/search");

    fireEvent.input(screen.getByRole("textbox", { name: "URL" }), {
      target: { value: "https://www.example.org/" },
    });

    expect(new URLSearchParams(window.location.search).get("url")).not.toBe(
      "https://www.example.org/",
    );

    fireEvent.click(screen.getByRole("button", { name: "Find snapshots" }));

    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get("url")).toBe(
        "https://www.example.org/",
      );
    });

    expect(await screen.findByText("Inspector")).toBeTruthy();
  });

  it("uses timestamp mode automatically when timestamp is present", async () => {
    server.use(mockIndex(), mockCapture({ route: "timestamp" }));
    renderApp("/search");

    fireEvent.input(
      screen.getByRole("textbox", { name: "Replay datetime (optional)" }),
      {
        target: { value: "20250101000000" },
      },
    );
    fireEvent.click(screen.getByRole("tab", { name: "Exact" }));
    fireEvent.click(screen.getByRole("button", { name: "Find snapshots" }));

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("when")).toBeNull();
      expect(params.get("ts")).toBe("20250101000000");
    });

    expect(await screen.findByText("Inspector")).toBeTruthy();
  });

  it("prefetches more snapshots as the user pages forward and syncs the page query", async () => {
    const limits: string[] = [];
    let pagedIndexRequests = 0;

    server.use(
      mockIndex({
        bodiesByLimit: {
          "40": createSnapshotNdjson(40, "snapshot"),
          "60": createSnapshotNdjson(40, "snapshot"),
        },
        onRequest: (request) => {
          const params = new URL(request.url).searchParams;
          if (params.get("showPagedIndex") === "true") {
            pagedIndexRequests += 1;
            return;
          }
          limits.push(params.get("limit") ?? "");
        },
      }),
    );

    await submitSearch();

    expect(
      await screen.findByText("https://example.com/snapshot-1"),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Go to previous page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Go to next page" })
        .getAttribute("aria-disabled"),
    ).toBe("false");
    expect(new URLSearchParams(window.location.search).get("page")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(limits).toEqual(["40", "60"]);
    });
    expect(pagedIndexRequests).toBe(1);
    expect(
      await screen.findByText("https://example.com/snapshot-21"),
    ).toBeTruthy();
    expect(new URLSearchParams(window.location.search).get("page")).toBe("2");
    expect(
      screen
        .getByRole("button", { name: "Go to previous page" })
        .getAttribute("aria-disabled"),
    ).toBe("false");
    expect(
      screen
        .getByRole("button", { name: "Go to next page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("hydrates the snapshot page from the url", async () => {
    const limits: string[] = [];
    let pagedIndexRequests = 0;

    server.use(
      mockIndex({
        bodiesByLimit: {
          "60": createSnapshotNdjson(25, "snapshot"),
        },
        onRequest: (request) => {
          const params = new URL(request.url).searchParams;
          if (params.get("showPagedIndex") === "true") {
            pagedIndexRequests += 1;
            return;
          }
          limits.push(params.get("limit") ?? "");
        },
      }),
    );

    renderApp("/search?url=example.com%2F*&page=2");

    expect(
      await screen.findByText("https://example.com/snapshot-21"),
    ).toBeTruthy();
    expect(limits).toEqual(["60"]);
    expect(pagedIndexRequests).toBe(1);
    expect(
      screen
        .getByRole("button", { name: "Go to next page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("loads timeline and capture lazily when their tabs open", async () => {
    let timelineRequests = 0;
    let captureRequests = 0;

    server.use(
      mockIndex(),
      mockTimeline({ onRequest: () => (timelineRequests += 1) }),
      mockCapture({
        route: "timestamp",
        onRequest: () => (captureRequests += 1),
      }),
    );

    await submitSearch();

    expect(timelineRequests).toBe(0);
    expect(captureRequests).toBe(0);

    fireEvent.click(screen.getByRole("tab", { name: "Timeline" }));
    await waitFor(() => expect(timelineRequests).toBe(1));

    fireEvent.click(screen.getByRole("tab", { name: "Capture" }));
    await waitFor(() => expect(captureRequests).toBe(1));
  });

  it("opens a clicked snapshot row in Capture without changing the search url", async () => {
    let captureRequests = 0;

    server.use(
      mockIndex(),
      mockCapture({
        route: "timestamp",
        onRequest: () => (captureRequests += 1),
      }),
    );
    await submitSearch();

    fireEvent.click(screen.getByText("https://example.com/"));

    expect(await screen.findByText("URL:")).toBeTruthy();
    expect(
      (await screen.findAllByText("https://example.com/")).length,
    ).toBeGreaterThan(0);
    expect(new URLSearchParams(window.location.search).get("url")).toBeNull();
    expect(new URLSearchParams(window.location.search).get("ts")).toBeNull();
    await waitFor(() => expect(captureRequests).toBe(1));
  });

  it("loads inspector accordion data lazily", async () => {
    let captureRequests = 0;

    server.use(
      mockIndex(),
      mockCapture({
        route: "timestamp",
        onRequest: () => (captureRequests += 1),
      }),
    );
    await submitSearch();

    expect(captureRequests).toBe(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Raw capture response" }),
    );
    await waitFor(() => expect(captureRequests).toBe(1));
  });

  it("does not retry capture automatically after a failure", async () => {
    let captureRequests = 0;

    server.use(
      mockIndex(),
      mockCapture({
        route: "timestamp",
        status: 404,
        onRequest: () => (captureRequests += 1),
      }),
    );
    await submitSearch();

    fireEvent.click(screen.getByRole("tab", { name: "Capture" }));

    await waitFor(() => expect(captureRequests).toBe(1));
    expect(
      await screen.findAllByText("Capture query failed (404)."),
    ).toHaveLength(2);
    expect(screen.queryByText("Search error")).toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(captureRequests).toBe(1);
  });

  it("renders collection select with loaded options", async () => {
    renderApp("/search");

    await screen.findByRole("option", { name: "CC-MAIN-2026-04" });
    expect(
      (
        screen.getByRole("combobox", {
          name: "Collection",
        }) as HTMLSelectElement
      ).value,
    ).toBe("CC-MAIN-2026-08");
  });
});
