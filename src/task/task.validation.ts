import z from "zod";

export class TaskValidation{
  static readonly CREATE_TASK = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    assigneeId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    deadline: z.date().optional(),
  })
}