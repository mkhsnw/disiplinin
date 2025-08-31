import { ProjectCreateRequest } from 'src/models/projects.model';
import z, { ZodType } from 'zod';

export class ProjectValidation {
  static readonly CREATE_PROJECTS: ZodType<ProjectCreateRequest> = z.object({
    name: z
      .string()
      .min(1, 'Project name is required')
      .max(100, 'Project name too long'),
    description: z.string().min(1).max(500, 'Description too long').optional(),
    ownerId: z.uuid('Invalid owner ID format'),
  });
}
