import { IconCalendar, IconX } from "@tabler/icons-react";
import * as React from "preact/compat";

import { Button, buttonVariants } from "@/components/ui/button";
import { DatePickerPanel } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TimePickerPanel,
  type TimeValue,
  toTimeValue,
} from "@/components/ui/time-picker";
import {
  formatDateTimeLabel,
  toDraftDate,
  withDatePart,
  withTimePart,
} from "@/lib/date-time";
import { cn } from "@/lib/utils";

export type DateTimePickerProps = {
  value?: Date;
  onChange: (value: Date | undefined) => void;
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function DateTimePicker({
  value,
  onChange,
  clearable = false,
  disabled = false,
  placeholder = "Pick date and time",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draftValue, setDraftValue] = React.useState<Date>(() =>
    toDraftDate(value),
  );

  const canClear = clearable && Boolean(value);

  React.useEffect(() => {
    if (!open) return;
    setDraftValue(toDraftDate(value));
  }, [open, value]);

  const handleOpen = React.useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  const handleApply = React.useCallback(() => {
    onChange(new Date(draftValue));
    setOpen(false);
  }, [draftValue, onChange]);

  const handleDateChange = React.useCallback((nextDate: Date) => {
    setDraftValue((current) => withDatePart(current, nextDate));
  }, []);

  const handleTimeChange = React.useCallback((nextTime: TimeValue) => {
    setDraftValue((current) => withTimePart(current, nextTime));
  }, []);

  const handleClearPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const handleClearClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onChange(undefined);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative min-w-0">
        <PopoverTrigger
          type="button"
          disabled={disabled}
          // Keep explicit open for reliable first-click behavior with Base UI + overlayed clear button.
          onClick={handleOpen}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-full min-w-0 justify-start font-normal",
            canClear ? "pr-6" : undefined,
            className,
          )}
        >
          <IconCalendar data-icon="inline-start" />
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value ? formatDateTimeLabel(value) : placeholder}
          </span>
        </PopoverTrigger>

        {canClear ? (
          <button
            type="button"
            aria-label="Clear date time"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 z-10 inline-flex size-4 -translate-y-1/2 items-center justify-center rounded-sm"
            onPointerDown={handleClearPointerDown}
            onClick={handleClearClick}
            disabled={disabled}
          >
            <IconX className="size-3" />
          </button>
        ) : null}
      </div>

      <PopoverContent
        align="start"
        className="w-auto max-w-[calc(100vw-2rem)] p-2.5"
      >
        <div className="flex flex-col gap-2.5">
          <DatePickerPanel value={draftValue} onChange={handleDateChange} />
          <TimePickerPanel
            value={toTimeValue(draftValue)}
            onChange={handleTimeChange}
          />

          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
