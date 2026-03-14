import { IconCalendar } from "@tabler/icons-react";
import * as React from "preact/compat";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateLabel, toDraftDate } from "@/lib/date-time";
import { cn } from "@/lib/utils";

export type DatePickerPanelProps = {
  value: Date;
  onChange: (nextValue: Date) => void;
};

export function DatePickerPanel({ value, onChange }: DatePickerPanelProps) {
  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={(nextValue: Date | undefined) => {
        if (nextValue) onChange(nextValue);
      }}
    />
  );
}

export type DatePickerProps = {
  value?: Date;
  onChange: (nextValue: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Pick date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState<Date>(() =>
    toDraftDate(value),
  );

  React.useEffect(() => {
    if (!open) return;
    setDraftDate(toDraftDate(value));
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
        <IconCalendar data-icon="inline-start" />
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value ? formatDateLabel(value) : placeholder}
        </span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-2.5">
        <div className="flex flex-col gap-2.5">
          <DatePickerPanel value={draftDate} onChange={setDraftDate} />
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
                onChange(draftDate);
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
