// src/task/task.validation.ts
import { z } from 'zod';
import { Priority, Status } from '@prisma/client';

export class TaskValidation {
  static readonly CREATE_TASK = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(1000, 'Description too long'),
    priority: z.nativeEnum(Priority),
    assigneeId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    // Fix: Handle both string and Date for deadline
    deadline: z
      .union([z.string().datetime(), z.date()])
      .transform((val) => {
        if (typeof val === 'string') {
          return new Date(val);
        }
        return val;
      })
      .optional(),
    labelIds: z.array(z.string().uuid()).optional(),
  });

  static readonly UPDATE_TASK = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(1000).optional(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(Status).optional(),
    assigneeId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    deadline: z
      .union([z.string().datetime(), z.date()])
      .transform((val) => {
        if (typeof val === 'string') {
          return new Date(val);
        }
        return val;
      })
      .optional(),
    labelIds: z.array(z.string().uuid()).optional(),
  });

  static readonly UPDATE_STATUS = z.object({
    status: z.nativeEnum(Status),
  });

  static readonly ASSIGN_TASK = z.object({
    assigneeId: z.string().uuid(),
  });
}
