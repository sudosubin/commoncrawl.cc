import { render } from "preact";
import { LocationProvider } from "preact-iso";

import { App } from "@/app";

import "@/styles.css";

render(
  <LocationProvider>
    <App />
  </LocationProvider>,
  document.getElementById("app") as HTMLElement,
);
