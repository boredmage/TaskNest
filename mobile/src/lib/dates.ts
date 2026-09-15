import { format, isToday, isTomorrow, isYesterday } from "date-fns";

function parse(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayWord(d: Date) {
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  return null;
}

/** "Today, 12:00" / "Tomorrow, 09:30" / "May 8, 12:00" */
export function formatDueLabel(value: string | Date | null | undefined) {
  const d = parse(value);
  if (!d) return "";
  return `${dayWord(d) ?? format(d, "MMM d")}, ${format(d, "HH:mm")}`;
}

/** "May 8, 2025" */
export function formatPostedLabel(value: string | Date | null | undefined) {
  const d = parse(value);
  return d ? format(d, "MMM d, yyyy") : "";
}

/** Section heading for the News tab: "Today" / "Yesterday" / "April 4". */
export function formatDayHeading(value: string | Date | null | undefined) {
  const d = parse(value);
  if (!d) return "";
  return dayWord(d) ?? format(d, "MMMM d");
}

/** "April 4" and "13:23" for the meta line under a notification. */
export function formatDayAndTime(value: string | Date | null | undefined) {
  const d = parse(value);
  if (!d) return { day: "", time: "" };
  return { day: format(d, "MMMM d"), time: format(d, "HH:mm") };
}
