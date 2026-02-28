import {
  findProjectById,
  listProjects as repoListProjects,
  type ProjectListParams,
} from '@/lib/repositories/project.repo';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

export interface ProjectListQuery {
  search?: string;
  framework?: string;
  page?: number;
  limit?: number;
}

export async function verifyProjectOwnership(projectId: string, userId: string): Promise<any> {
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
  userId: string,
  query: ProjectListQuery = {}
): Promise<{
  data: any[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const params: ProjectListParams = {
    userId,
    search: query.search,
    framework: query.framework,
    page: query.page || 1,
    limit: query.limit || 10,
  };
  const result = await repoListProjects(params);
  return {
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: Math.max(1, Math.ceil(result.total / result.limit)),
    },
  };
}
