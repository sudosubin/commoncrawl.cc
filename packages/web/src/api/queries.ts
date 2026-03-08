import { nanoquery } from "@nanostores/query";

import {
  getApiV1IndexCcbotJson,
  getApiV1IndexCollinfoJson,
  getApiV1IndexGraphinfoJson,
} from "@/api/__generated__";
import { withStatus } from "@/api/base";

const [createFetcherStore] = nanoquery();

export const $collInfo = createFetcherStore(["collinfo"], {
  fetcher: async () =>
    withStatus(() => getApiV1IndexCollinfoJson(), 200, "collinfo.json"),
  revalidateOnFocus: true,
  onErrorRetry: null,
});

export const $graphInfo = createFetcherStore(["graphinfo"], {
  fetcher: async () =>
    withStatus(() => getApiV1IndexGraphinfoJson(), 200, "graphinfo.json"),
  revalidateOnFocus: true,
  onErrorRetry: null,
});

export const $ccbot = createFetcherStore(["ccbot"], {
  fetcher: async () =>
    withStatus(() => getApiV1IndexCcbotJson(), 200, "ccbot.json"),
  revalidateOnFocus: true,
  onErrorRetry: null,
});
