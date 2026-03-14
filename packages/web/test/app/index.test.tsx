import { fireEvent, screen } from "@testing-library/preact";
import { describe, expect, it } from "vitest";

import { renderApp } from "../support/render-app";

describe("App routes", () => {
  it("renders landing page at /", () => {
    renderApp("/");

    expect(screen.getByTestId("landing-page")).toBeTruthy();
    expect(screen.queryByTestId("search-page")).toBeNull();
    expect(screen.getByText("Open search workspace")).toBeTruthy();
  });

  it("renders search workspace at /search", async () => {
    renderApp("/search");

    expect(screen.getByTestId("search-page")).toBeTruthy();
    expect(screen.queryByTestId("landing-page")).toBeNull();
    expect(screen.getByText("Search Common Crawl snapshots")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Find snapshots" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Try example.com" }),
    ).toBeNull();
    expect(screen.queryByLabelText("Snapshot limit")).toBeNull();
    expect(
      await screen.findByText(/Loaded 2 collection options\./i),
    ).toBeTruthy();
  });

  it("renders not found page for unknown route", () => {
    renderApp("/nope");

    expect(screen.getByText("Not Found")).toBeTruthy();
    expect(screen.getByText("Try Home or Search.")).toBeTruthy();
  });

  it("navigates between home and search routes", () => {
    renderApp("/");

    fireEvent.click(screen.getByRole("link", { name: "Search" }));
    expect(screen.getByTestId("search-page")).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(screen.getByTestId("landing-page")).toBeTruthy();
    expect(screen.getByText("Open search workspace")).toBeTruthy();
  });
});
