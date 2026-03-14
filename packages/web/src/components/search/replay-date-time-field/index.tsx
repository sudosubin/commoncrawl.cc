import type { JSX } from "preact";
import { useMemo, useState } from "preact/hooks";

import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IS_TEST_ENV } from "@/features/search/constants";
import type { ReplayInputMode } from "@/features/search/types";
import { formatTimestampFromDate, parseDateTimeDefault } from "@/lib/date-time";

type ReplayDateTimeFieldProps = {
  id: string;
  label: string;
  defaultValue: string;
  defaultMode: ReplayInputMode;
};

type ReplayModeTabsProps = {
  mode: ReplayInputMode;
  visible: boolean;
  onChange: (value: ReplayInputMode) => void;
};

const getModeDescription = (mode: ReplayInputMode) => {
  return mode === "pinned"
    ? "Uses the timestamped replay URL."
    : "Uses the closest capture for this time.";
};

const ReplayModeTabs = ({ mode, onChange, visible }: ReplayModeTabsProps) => {
  if (!visible) return null;

  return (
    <div className="flex flex-col gap-2 pt-1">
      <Tabs
        value={mode}
        onValueChange={(value) =>
          onChange(value === "pinned" ? "pinned" : "closest")
        }
        className="gap-1.5"
      >
        <TabsList className="bg-muted/40 h-7 rounded-md p-0.5">
          <TabsTrigger value="closest" className="h-6 px-2 text-[11px]">
            Nearest
          </TabsTrigger>
          <TabsTrigger value="pinned" className="h-6 px-2 text-[11px]">
            Exact
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="text-muted-foreground text-[11px]">
        {getModeDescription(mode)}
      </p>
    </div>
  );
};

const ReplayDateTimeFieldTest = ({
  defaultMode,
  defaultValue,
  id,
  label,
}: ReplayDateTimeFieldProps) => {
  const [replayMode, setReplayMode] = useState<ReplayInputMode>(defaultMode);
  const [textValue, setTextValue] = useState(defaultValue);
  const hasReplayValue = textValue.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <input type="hidden" name="replayMode" value={replayMode} />
      <Input
        id={id}
        aria-label={label}
        name="replayDatetime"
        defaultValue={defaultValue}
        className="h-8 text-xs"
        onInput={(event: JSX.TargetedEvent<HTMLInputElement, InputEvent>) => {
          setTextValue(event.currentTarget.value);
        }}
      />
      <ReplayModeTabs
        mode={replayMode}
        visible={hasReplayValue}
        onChange={setReplayMode}
      />
    </div>
  );
};

const ReplayDateTimeFieldRuntime = ({
  defaultMode,
  defaultValue,
  id,
  label,
}: ReplayDateTimeFieldProps) => {
  const [replayMode, setReplayMode] = useState<ReplayInputMode>(defaultMode);
  const parseMode = replayMode === "pinned" ? "timestamp" : "accept-datetime";
  const [dateValue, setDateValue] = useState<Date | undefined>(() =>
    parseDateTimeDefault(defaultValue, parseMode),
  );

  const normalizedValue = useMemo(() => {
    if (!dateValue) return "";

    return parseMode === "timestamp"
      ? formatTimestampFromDate(dateValue)
      : dateValue.toUTCString();
  }, [dateValue, parseMode]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <input type="hidden" name="replayMode" value={replayMode} />
      <input type="hidden" name="replayDatetime" value={normalizedValue} />
      <DateTimePicker
        value={dateValue}
        onChange={setDateValue}
        clearable
        placeholder="Set a time or use latest"
      />
      <ReplayModeTabs
        mode={replayMode}
        visible={normalizedValue.trim().length > 0}
        onChange={setReplayMode}
      />
    </div>
  );
};

const ReplayDateTimeField = (props: ReplayDateTimeFieldProps) => {
  return IS_TEST_ENV ? (
    <ReplayDateTimeFieldTest {...props} />
  ) : (
    <ReplayDateTimeFieldRuntime {...props} />
  );
};

export default ReplayDateTimeField;
