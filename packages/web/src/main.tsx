import { render } from "preact";
import { LocationProvider } from "preact-iso";

import { App } from "@/app";

import "@/styles.css";

if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === "true") {
  const { startMockWorker } = await import("@/mocks/browser");
  await startMockWorker();
}

render(
  <LocationProvider>
    <App />
  </LocationProvider>,
  document.getElementById("app") as HTMLElement,
);
