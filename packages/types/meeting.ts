// Meeting Types
export interface Meeting {
  id: string;
  projectId: string;
  tenantId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
