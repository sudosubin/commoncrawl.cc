import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/preact";
import { LocationProvider } from "preact-iso";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { App } from "@/app";
import { server } from "@/mocks/node";

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

  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("App routes", () => {
  it("renders metadata sections on the home page", async () => {
    renderApp("/");

    expect(screen.getByTestId("home-page")).toBeTruthy();
    expect(screen.queryByTestId("about-page")).toBeNull();

    const collInfoList = await screen.findByTestId("collinfo-list");
    const graphInfoList = await screen.findByTestId("graphinfo-list");
    const ccbotPrefixList = await screen.findByTestId("ccbot-prefix-list");

    expect(
      within(collInfoList).getAllByRole("listitem").length,
    ).toBeGreaterThan(0);
    expect(
      within(graphInfoList).getAllByRole("listitem").length,
    ).toBeGreaterThan(0);
    expect(
      within(ccbotPrefixList).getAllByRole("listitem").length,
    ).toBeGreaterThan(0);

    expect(
      (await screen.findByTestId("ccbot-creation-time")).textContent,
    ).toContain("creationTime:");
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
    expect(await screen.findByTestId("collinfo-list")).toBeTruthy();
  });
});
