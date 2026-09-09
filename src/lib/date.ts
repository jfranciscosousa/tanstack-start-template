type DateValue = Date | string | number | null | undefined;

type DateFormat = "date" | "long-date" | "date-time";

const formats: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  date: {
    dateStyle: "medium",
  },
  "long-date": {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
  "date-time": {
    dateStyle: "medium",
    timeStyle: "short",
  },
};

export function formatDate(
  value: DateValue,
  format: DateFormat = "date",
  fallback = "N/A"
) {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", formats[format]).format(date);
}
