import {
  findGoldenPathById,
  listGoldenPaths as repoListGoldenPaths,
  type GoldenPathListParams,
} from '@/lib/repositories/golden-path.repo';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

export async function verifyGoldenPathOwnership(templateId: string, userId: string): Promise<any> {
  const template = await findGoldenPathById(templateId);
  if (!template) throw new NotFoundError('Golden path template not found');
  if (template.owner_id !== userId) {
    throw new ForbiddenError('You do not own this template');
  }
  return template;
}

export async function getGoldenPathDetail(templateId: string): Promise<any> {
  const template = await findGoldenPathById(templateId);
  if (!template) throw new NotFoundError('Golden path template not found');
  return template;
}

export interface GoldenPathListQuery {
  search?: string;
  type?: string;
  lifecycle?: string;
  framework?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

export async function listGoldenPathTemplates(query: GoldenPathListQuery = {}): Promise<{
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const params: GoldenPathListParams = {
    search: query.search,
    type: query.type,
    lifecycle: query.lifecycle,
    framework: query.framework,
    tags: query.tags ? query.tags.split(',').map((t) => t.trim()) : undefined,
    page: query.page || 1,
    limit: query.limit || 20,
  };

  const result = await repoListGoldenPaths(params);

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
