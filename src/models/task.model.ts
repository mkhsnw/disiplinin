// Existing interfaces remain the same
export interface UserBasic {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TeamBasic {
  id: string;
  name: string;
  description?: string;
}

export interface LabelBasic {
  id: string;
  name: string;
  color: string;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'CANCELLED';

export class CreateTaskRequest {
  title: string;
  description: string;
  priority: Priority;
  assigneeId?: string;
  deadline?: Date;
  labelIds?: string[];
  teamId?: string;
}

export class UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  assigneeId?: string;
  deadline?: Date;
}

export class CreateTaskResponse {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  assigneeId?: string;
  teamId?: string;
  aiPrioritySuggestion?: Priority;
  aiPriorityConfidence?: number;
}

export class UpdateTaskResponse {
  id: string;
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  deadline?: string;
  updatedAt: string;
  assigneeId?: string;
  teamId?: string;
}

export class TaskDetailResponse {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  author: UserBasic;
  assignee?: UserBasic;
  team?: TeamBasic;
  labels: LabelBasic[];
  aiPrioritySuggestion?: Priority;
  aiPriorityConfidence?: number;
  commentsCount: number;
  attachmentsCount: number;
}

export class TaskListItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  author: UserBasic;
  assignee?: UserBasic;
  team?: TeamBasic;
  labels: LabelBasic[];
  aiPrioritySuggestion?: Priority;
  aiPriorityConfidence?: number;
  commentsCount: number;
  attachmentsCount: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  assigneeId?: string;
  teamId?: string;
  search?: string;
  labelIds?: string[];
}

export interface TaskListRequest {
  page?: number;
  limit?: number;
  status?: TaskStatus[];
  priority?: Priority[];
  assigneeId?: string;
  teamId?: string;
  search?: string;
  labelIds?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'deadline' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}
