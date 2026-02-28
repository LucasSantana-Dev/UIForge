import {
  findProjectById,
  listProjects as repoListProjects,
  type ProjectListParams,
} from '@/lib/repositories/project.repo';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';
import type { PaginatedResult } from '@/lib/repositories/base.repo';

export type { PaginatedResult };

export interface ProjectListQuery {
  userId: string;
  search?: string;
  framework?: string;
  page?: number;
  limit?: number;
}

export async function verifyProjectOwnership(
  projectId: string,
  userId: string
): Promise<any> {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.user_id !== userId) {
    throw new ForbiddenError('You do not own this project');
  }

  return project;
}

export async function listProjects(
  query: ProjectListQuery
): Promise<PaginatedResult<any>> {
  const params: ProjectListParams = {
    userId: query.userId,
    search: query.search,
    framework: query.framework,
    page: query.page,
    limit: query.limit,
  };
  return repoListProjects(params);
}
