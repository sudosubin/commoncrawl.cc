import { setupWorker } from "msw/browser";

import { handlers } from "@/mocks/handlers";

export const worker = setupWorker(...handlers);
export const startMockWorker = () =>
  worker.start({ onUnhandledRequest: "bypass" });
