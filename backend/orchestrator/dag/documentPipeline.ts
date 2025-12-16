import { createMasterJob } from '../createMasterJob';
import { createTaskJob } from '../createTaskJob';
import { dispatchTask } from '../dispatchTask';

export interface DocumentPipelineInput {
  meaningKey: string;
  tenantId: string;
  documentType: 'PRD' | 'TechnicalSpec' | 'Report' | 'Custom';
  template?: string;
  customSchema?: any;
}

export async function runDocumentPipeline(input: DocumentPipelineInput): Promise<string> {
  console.log(`Starting document pipeline for ${input.documentType}`);

  // 1. Create master job
  const masterJob = await createMasterJob({
    tenantId: input.tenantId,
    projectId: `doc-${Date.now()}`,
    type: 'DOCUMENT_PIPELINE',
    payload: {
      meaningKey: input.meaningKey,
      documentType: input.documentType,
      tenantId: input.tenantId,
    },
  });

  // 2. Create document generation task
  const docTask = await createTaskJob({
    masterJobId: masterJob.id,
    tenantId: input.tenantId,
    worker: 'documents',
    payload: {
      meaningKey: input.meaningKey,
      tenantId: input.tenantId,
      documentType: input.documentType,
      template: input.template,
      customSchema: input.customSchema,
    },
  });

  // 3. Dispatch task
  await dispatchTask(docTask.id);

  console.log(`Document pipeline started for ${input.documentType}`);
  return masterJob.id;
}

// Example usage:
// const input: DocumentPipelineInput = {
//   meaningKey: 'meaning/tenant1/meeting123.json',
//   tenantId: 'tenant1',
//   documentType: 'PRD',
// };
// runDocumentPipeline(input);
