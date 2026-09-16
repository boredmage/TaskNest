import { env } from "../env.ts";
import { sweepReminders } from "../services/todos.ts";

/** Every minute, push "due soon" reminders for todos whose reminder window opened. */
export function startReminderSweeper() {
  const run = async () => {
    try {
      const n = await sweepReminders();
      if (n > 0) console.log(`[reminders] sent ${n} reminder(s)`);
    } catch (err) {
      console.error("[reminders] sweep failed", err);
    }
  };
  void run();
  const timer = setInterval(run, env.REMINDER_SWEEP_INTERVAL_SECONDS * 1000);
  return () => clearInterval(timer);
}
