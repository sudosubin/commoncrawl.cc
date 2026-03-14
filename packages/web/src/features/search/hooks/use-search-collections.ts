import { useStore } from "@nanostores/preact";
import { useMemo } from "preact/hooks";

import { $collInfo } from "@/api/queries";

import type { SelectOption } from "../types";

const useSearchCollections = () => {
  const { data: collinfo, loading, error } = useStore($collInfo);

  const collectionOptions = useMemo(
    () =>
      Array.isArray(collinfo)
        ? collinfo.map((item) => item.id).filter(Boolean)
        : [],
    [collinfo],
  );

  const collectionSelectOptions = useMemo<SelectOption[]>(
    () => collectionOptions.map((value) => ({ value, label: value })),
    [collectionOptions],
  );

  const sidebarFooterMessage = useMemo(() => {
    if (loading) return "Loading collection options...";
    if (error)
      return "Collection options are unavailable. Showing the default collection.";
    return `Loaded ${collectionOptions.length.toLocaleString()} collection options.`;
  }, [collectionOptions.length, error, loading]);

  return { collectionSelectOptions, sidebarFooterMessage };
};

export default useSearchCollections;
