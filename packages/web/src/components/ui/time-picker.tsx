import { IconCheck, IconClock } from "@tabler/icons-react";
import * as React from "preact/compat";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimeLabel, pad2 } from "@/lib/date-time";
import { cn } from "@/lib/utils";

export type TimeValue = {
  hours: number;
  minutes: number;
  seconds: number;
};

export function toTimeValue(date: Date): TimeValue {
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}

type TimeColumnProps = {
  label: string;
  range: number;
  value: number;
  onChange: (next: number) => void;
};

function TimeColumn({ label, range, value, onChange }: TimeColumnProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const selected = listRef.current?.querySelector<HTMLElement>(
      "[data-selected='true']",
    );
    selected?.scrollIntoView({ block: "center" });
  }, [value]);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-muted-foreground text-center text-[10px] font-medium">
        {label}
      </p>
      <ScrollArea className="border-border h-32 w-14 rounded-md border">
        <div ref={listRef} className="space-y-1 p-1">
          {Array.from({ length: range }).map((_, index) => {
            const selected = index === value;

            return (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                data-selected={selected ? "true" : "false"}
                className={cn(
                  "h-7 w-full justify-center font-mono",
                  selected &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
                onClick={() => onChange(index)}
              >
                <span>{pad2(index)}</span>
                {selected ? (
                  <IconCheck data-icon="inline-end" className="size-3" />
                ) : null}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export type TimePickerPanelProps = {
  value: TimeValue;
  onChange: (nextValue: TimeValue) => void;
};

export function TimePickerPanel({ value, onChange }: TimePickerPanelProps) {
  return (
    <div className="border-border rounded-md border p-2">
      <div className="text-muted-foreground mb-2 flex items-center gap-1 text-[11px]">
        <IconClock className="size-3.5" />
        Time
      </div>

      <div className="grid grid-cols-3 gap-2">
        <TimeColumn
          label="HH"
          range={24}
          value={value.hours}
          onChange={(hours) => onChange({ ...value, hours })}
        />
        <TimeColumn
          label="MM"
          range={60}
          value={value.minutes}
          onChange={(minutes) => onChange({ ...value, minutes })}
        />
        <TimeColumn
          label="SS"
          range={60}
          value={value.seconds}
          onChange={(seconds) => onChange({ ...value, seconds })}
        />
      </div>
    </div>
  );
}

export type TimePickerProps = {
  value?: TimeValue;
  onChange: (nextValue: TimeValue) => void;
  disabled?: boolean;
  className?: string;
};

export function TimePicker({
  value,
  onChange,
  disabled = false,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draftValue, setDraftValue] = React.useState<TimeValue>(
    value ?? { hours: 0, minutes: 0, seconds: 0 },
  );

  React.useEffect(() => {
    if (!open) return;
    setDraftValue(value ?? { hours: 0, minutes: 0, seconds: 0 });
  }, [open, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn("h-8 w-full justify-start font-normal", className)}
          />
        }
      >
        {formatTimeLabel(value ?? { hours: 0, minutes: 0, seconds: 0 })}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2.5">
        <div className="flex flex-col gap-2.5">
          <TimePickerPanel value={draftValue} onChange={setDraftValue} />
          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onChange(draftValue);
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
