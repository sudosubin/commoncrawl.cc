import type { RequestHandler } from "msw";

import {
  getGetApiV1IndexCcbotJsonMockHandler,
  getGetApiV1IndexCollinfoJsonMockHandler,
  getGetApiV1IndexGraphinfoJsonMockHandler,
} from "@/api/__generated__/index.msw";

export const handlers: RequestHandler[] = [
  getGetApiV1IndexCollinfoJsonMockHandler(),
  getGetApiV1IndexGraphinfoJsonMockHandler(),
  getGetApiV1IndexCcbotJsonMockHandler(),
];
