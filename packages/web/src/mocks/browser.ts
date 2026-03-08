import { setupWorker } from "msw/browser";

import { handlers } from "@/mocks/handlers";

export const worker = setupWorker(...handlers);

export function startMockWorker() {
  return worker.start({
    onUnhandledRequest: "bypass",
  });
}
