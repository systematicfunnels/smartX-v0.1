// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  hasMeet: boolean;
  hasDoc: boolean;
  hasCode: boolean;
  transcriptRetentionDays?: number;
  documentRetentionDays?: number;
  repositoryRetentionDays?: number;
  jobRetentionDays?: number;
}

export interface TenantFeatureFlags {
  hasMeet: boolean;
  hasDoc: boolean;
  hasCode: boolean;
}

export interface TenantRetentionPolicies {
  transcriptRetentionDays?: number;
  documentRetentionDays?: number;
  repositoryRetentionDays?: number;
  jobRetentionDays?: number;
}
