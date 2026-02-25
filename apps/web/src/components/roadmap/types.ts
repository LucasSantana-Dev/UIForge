export type ItemStatus = 'done' | 'in-progress' | 'planned';

export interface RoadmapItem {
  label: string;
  status: ItemStatus;
  githubUrl?: string;
}

export interface Phase {
  number: number;
  title: string;
  subtitle: string;
  status: 'active' | 'planned' | 'future';
  estimatedDate: string;
  items: RoadmapItem[];
}
