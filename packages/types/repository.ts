// Repository Types
export interface Repository {
  id: string;
  projectId: string;
  tenantId: string;
  stack: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isPinned: boolean;
  lastAccessedAt?: Date;
}
