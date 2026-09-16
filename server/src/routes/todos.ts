import { Hono } from "hono";
import { z } from "zod";
import { todoPriority, todoRepeat, todoScope, todoStatus } from "../db/index.ts";
import { validate } from "../lib/validate.ts";
import { requireAuth, type AuthVariables } from "../middleware/auth.ts";
import * as todos from "../services/todos.ts";

const idParam = validate("param", z.object({ id: z.string().uuid() }));

const fields = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).nullable(),
  category: z.string().max(50).nullable(),
  due_date: z.string().nullable(),
  assignee_ids: z.array(z.string().uuid()).max(50).nullable(),
  priority: z.enum(todoPriority.enumValues),
  repeat: z.enum(todoRepeat.enumValues),
  reminder_minutes: z.number().int().min(0).max(60 * 24 * 30).nullable(),
});
const createBody = fields
  .partial()
  .required({ title: true })
  .extend({
    // Client-generated id so a todo created offline keeps its identity when
    // it's synced; a replay of the same create is a no-op.
    id: z.string().uuid().optional(),
    scope: z.enum(todoScope.enumValues).optional(),
    family_id: z.string().uuid().nullable().optional(),
  });
const updateBody = fields
  .extend({ status: z.enum(todoStatus.enumValues) })
  .partial()
  .strict();

export const todoRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .get("/", async (c) => c.json(await todos.listTodos(c.get("userId"))))
  .post("/", validate("json", createBody), async (c) =>
    c.json(await todos.createTodo(c.get("userId"), c.req.valid("json")), 201)
  )
  .patch("/:id", idParam, validate("json", updateBody), async (c) =>
    c.json(await todos.updateTodo(c.get("userId"), c.req.valid("param").id, c.req.valid("json")))
  )
  .delete("/:id", idParam, async (c) => {
    await todos.deleteTodo(c.get("userId"), c.req.valid("param").id);
    return c.body(null, 204);
  });
