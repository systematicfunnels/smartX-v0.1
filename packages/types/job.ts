// Job Types
export interface MasterJob {
  id: string;
  projectId: string;
  tenantId: string;
  type: 'MEETING_PIPELINE' | 'DOCUMENT_PIPELINE' | 'CODE_PIPELINE';
  status: 'PENDING' | 'RUNNING' | 'FAILED' | 'SUCCESS';
  payload: any;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface TaskJob {
  id: string;
  masterJobId: string;
  tenantId: string;
  worker: 'TRANSCRIBE' | 'MEANING' | 'DOCUMENT' | 'CODEGEN';
  status: 'PENDING' | 'RUNNING' | 'FAILED' | 'SUCCESS';
  payload: any;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
