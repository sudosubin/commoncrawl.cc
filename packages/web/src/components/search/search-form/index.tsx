import type { JSX } from "preact";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SearchFormValues, SelectOption } from "@/features/search/types";

import FormSelectField from "../form-select-field";
import ReplayDateTimeField from "../replay-date-time-field";

type SearchFormProps = {
  collectionOptions: SelectOption[];
  defaultValues: SearchFormValues;
  formVersion: number;
  loading: boolean;
  onSubmit: (event: JSX.TargetedEvent<HTMLFormElement, SubmitEvent>) => void;
};

const FIELD_CLASS_NAME =
  "h-8 w-full rounded-md border border-input bg-input/20 px-2 text-xs text-foreground outline-none data-[size=default]:h-8 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

const SearchForm = ({
  collectionOptions,
  defaultValues,
  formVersion,
  loading,
  onSubmit,
}: SearchFormProps) => (
  <form key={formVersion} className="flex flex-col gap-3.5" onSubmit={onSubmit}>
    <FormSelectField
      id="search-collection"
      name="collection"
      label="Collection"
      defaultValue={defaultValues.collection}
      options={collectionOptions}
      className={FIELD_CLASS_NAME}
    />

    <div className="flex flex-col gap-2">
      <Label htmlFor="search-url">URL</Label>
      <Input
        id="search-url"
        name="url"
        aria-label="URL"
        defaultValue={defaultValues.url}
        className="h-8 text-xs"
      />
    </div>

    <ReplayDateTimeField
      id="search-replay-datetime"
      label="Replay datetime (optional)"
      defaultValue={defaultValues.replayDatetime}
      defaultMode={defaultValues.replayMode}
    />

    <p className="text-muted-foreground text-[11px]">
      Use Nearest for TimeGate negotiation or Exact for a timestamped replay
      URL.
    </p>

    <Button type="submit" disabled={loading} className="mt-2 h-8">
      {loading ? "Searching..." : "Find snapshots"}
    </Button>
  </form>
);

export default SearchForm;
