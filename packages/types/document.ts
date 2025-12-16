// Document Types
export interface Document {
  id: string;
  projectId: string;
  tenantId: string;
  type: 'PRD' | 'BRD' | 'STRATEGY' | 'SOP' | 'GDD' | 'PITCH' | 'CUSTOM';
  title: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  archivedAt?: Date;
}
