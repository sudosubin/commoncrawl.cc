import type { RequestHandler } from "msw";

import {
  getGetApiV1IndexByCollByTimestampByUrlMockHandler,
  getGetApiV1IndexByCollByUrlMockHandler,
  getGetApiV1IndexByCollMockHandler,
  getGetApiV1IndexByCollTimemapCdxjByUrlMockHandler,
  getGetApiV1IndexByCollTimemapJsonByUrlMockHandler,
  getGetApiV1IndexByCollTimemapLinkByUrlMockHandler,
  getGetApiV1IndexCcbotJsonMockHandler,
  getGetApiV1IndexCollinfoJsonMockHandler,
  getGetApiV1IndexGraphinfoJsonMockHandler,
} from "@/api/__generated__/index.msw";

export const handlers: RequestHandler[] = [
  getGetApiV1IndexCollinfoJsonMockHandler(),
  getGetApiV1IndexGraphinfoJsonMockHandler(),
  getGetApiV1IndexCcbotJsonMockHandler(),
  getGetApiV1IndexByCollTimemapJsonByUrlMockHandler(),
  getGetApiV1IndexByCollTimemapLinkByUrlMockHandler(),
  getGetApiV1IndexByCollTimemapCdxjByUrlMockHandler(),
  getGetApiV1IndexByCollByTimestampByUrlMockHandler(),
  getGetApiV1IndexByCollByUrlMockHandler(),
  getGetApiV1IndexByCollMockHandler(),
];
