import { nanoquery } from "@nanostores/query";

import {
  getApiV1IndexCcbotJson,
  getApiV1IndexCollinfoJson,
  getApiV1IndexGraphinfoJson,
} from "@/api/__generated__";
import { withStatus } from "@/api/base";

const [createFetcherStore] = nanoquery();
const createQuery = <T>(key: string, request: () => Promise<T>) =>
  createFetcherStore([key], {
    fetcher: request,
    revalidateOnFocus: true,
    onErrorRetry: null,
  });

export const $collInfo = createQuery("collinfo", () =>
  withStatus(() => getApiV1IndexCollinfoJson(), 200, "collinfo.json"),
);

export const $graphInfo = createQuery("graphinfo", () =>
  withStatus(() => getApiV1IndexGraphinfoJson(), 200, "graphinfo.json"),
);

export const $ccbot = createQuery("ccbot", () =>
  withStatus(() => getApiV1IndexCcbotJson(), 200, "ccbot.json"),
);
