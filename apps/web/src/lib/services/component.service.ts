import { findComponentWithProject } from '@/lib/repositories/component.repo';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';
import {
  uploadToStorage,
  downloadFromStorage,
  deleteFromStorage,
  generateComponentStoragePath,
  STORAGE_BUCKETS,
} from '@/lib/api/storage';

export async function verifyProjectAccess(
  projectId: string,
  userId: string,
  requireOwnership = false
): Promise<any> {
  const { findProjectById } = await import('@/lib/repositories/project.repo');
  const project = await findProjectById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (requireOwnership && project.user_id !== userId) {
    throw new ForbiddenError('You do not own this project');
  }

  if (!requireOwnership && project.user_id !== userId && !project.is_public) {
    throw new ForbiddenError('You do not have access to this project');
  }

  return project;
}

export async function verifyComponentAccess(
  componentId: string,
  userId: string,
  requireOwnership = false
): Promise<any> {
  const component = await findComponentWithProject(componentId);

  if (!component) {
    throw new NotFoundError('Component not found');
  }

  const project = component.projects as any;
  if (requireOwnership && project.user_id !== userId) {
    throw new ForbiddenError('You do not own this component');
  }

  if (!requireOwnership && project.user_id !== userId && !project.is_public) {
    throw new ForbiddenError('You do not have access to this component');
  }

  return component;
}

export async function getComponentCode(storagePath: string | null): Promise<string> {
  if (!storagePath) return '';
  try {
    return (await downloadFromStorage(STORAGE_BUCKETS.PROJECT_FILES, storagePath, true)) as string;
  } catch {
    return '';
  }
}

export async function storeComponentCode(
  projectId: string,
  componentId: string,
  framework: string,
  codeContent: string,
  existingPath?: string | null
): Promise<string> {
  const storagePath =
    existingPath || generateComponentStoragePath(projectId, componentId, framework);

  await uploadToStorage(STORAGE_BUCKETS.PROJECT_FILES, storagePath, codeContent, 'text/plain');

  return storagePath;
}

export async function deleteComponentCode(storagePath: string | null): Promise<void> {
  if (!storagePath) return;
  try {
    await deleteFromStorage(STORAGE_BUCKETS.PROJECT_FILES, storagePath);
  } catch {
    // Continue even if storage deletion fails
  }
}
