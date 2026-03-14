export type TimeParts = { hours: number; minutes: number; seconds: number };
export type DateTimeInputMode = "timestamp" | "accept-datetime";

export const pad2 = (value: number) => String(value).padStart(2, "0");

export const formatDateLabel = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const formatTimeLabel = (time: TimeParts) =>
  `${pad2(time.hours)}:${pad2(time.minutes)}:${pad2(time.seconds)}`;

export const formatDateTimeLabel = (date: Date) =>
  `${formatDateLabel(date)} ${formatTimeLabel({
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  })}`;

export const toDraftDate = (value?: Date) =>
  value ? new Date(value) : new Date();

export const withDatePart = (base: Date, pickedDate: Date) => {
  const next = new Date(base);
  next.setFullYear(
    pickedDate.getFullYear(),
    pickedDate.getMonth(),
    pickedDate.getDate(),
  );
  return next;
};

export const withTimePart = (base: Date, time: TimeParts) => {
  const next = new Date(base);
  next.setHours(time.hours, time.minutes, time.seconds, 0);
  return next;
};

export const formatTimestampFromDate = (date: Date) =>
  `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;

export const parseDateTimeDefault = (
  defaultValue: string,
  mode: DateTimeInputMode,
): Date | undefined => {
  if (mode !== "timestamp") {
    const parsed = new Date(defaultValue);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  const match = defaultValue.match(
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
  );
  if (!match) return undefined;

  const [, year, month, day, hours, minutes, seconds] = match;
  return new Date(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10) - 1,
    Number.parseInt(day, 10),
    Number.parseInt(hours, 10),
    Number.parseInt(minutes, 10),
    Number.parseInt(seconds, 10),
  );
};
