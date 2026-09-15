import type { TodoPriority, TodoRepeat } from "@/stores/todos-store";

export const PRIORITY_OPTIONS: { value: TodoPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const REPEAT_OPTIONS: { value: TodoRepeat; label: string }[] = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

/** Minutes before the due date; null means no reminder. */
export const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "None" },
  { value: 10, label: "10 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 60 * 24, label: "1 day before" },
];

/** Badge colours for the priority chip on the task detail card. */
export const PRIORITY_COLORS: Record<TodoPriority, string> = {
  low: "#04A7FF",
  medium: "#FFAF3F",
  high: "#FF5050",
};

export const priorityLabel = (p: TodoPriority) =>
  PRIORITY_OPTIONS.find((o) => o.value === p)?.label ?? "Medium";
export const repeatLabel = (r: TodoRepeat) =>
  REPEAT_OPTIONS.find((o) => o.value === r)?.label ?? "None";
export const reminderLabel = (m: number | null | undefined) =>
  REMINDER_OPTIONS.find((o) => o.value === (m ?? null))?.label ??
  `${m} minutes before`;
