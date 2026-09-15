import { env } from "../env.ts";
import { sweepOverdue } from "../services/todos.ts";

export function startOverdueSweeper() {
  const run = async () => {
    try {
      const n = await sweepOverdue();
      if (n > 0) console.log(`[overdue] marked ${n} todo(s) overdue`);
    } catch (err) {
      console.error("[overdue] sweep failed", err);
    }
  };
  void run();
  const timer = setInterval(run, env.OVERDUE_SWEEP_INTERVAL_SECONDS * 1000);
  return () => clearInterval(timer);
}
