import { render } from "@testing-library/preact";
import { LocationProvider } from "preact-iso";

import App from "@/app";

export const renderApp = (path = "/") => {
  window.history.pushState({}, "", path);

  return render(
    <LocationProvider>
      <App />
    </LocationProvider>,
  );
};
