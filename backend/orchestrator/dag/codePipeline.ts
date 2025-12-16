import { createMasterJob } from '../createMasterJob';
import { createTaskJob } from '../createTaskJob';
import { dispatchTask } from '../dispatchTask';

export interface CodePipelineInput {
  documentKey: string;
  tenantId: string;
  targetLanguage: string;
  framework?: string;
  requirements?: string[];
}

export async function runCodePipeline(input: CodePipelineInput): Promise<string> {
  console.log(`Starting code generation pipeline for ${input.targetLanguage}`);

  // 1. Create master job
  const masterJob = await createMasterJob({
    tenantId: input.tenantId,
    projectId: `code-${Date.now()}`,
    type: 'CODE_PIPELINE',
    payload: {
      documentKey: input.documentKey,
      targetLanguage: input.targetLanguage,
      tenantId: input.tenantId,
    },
  });

  // 2. Create code generation task
  const codeTask = await createTaskJob({
    masterJobId: masterJob.id,
    tenantId: input.tenantId,
    worker: 'codegen',
    payload: {
      documentKey: input.documentKey,
      tenantId: input.tenantId,
      targetLanguage: input.targetLanguage,
      framework: input.framework,
      requirements: input.requirements,
    },
  });

  // 3. Dispatch task
  await dispatchTask(codeTask.id);

  console.log(`Code generation pipeline started for ${input.targetLanguage}`);
  return masterJob.id;
}

// Example usage:
// const input: CodePipelineInput = {
//   documentKey: 'documents/tenant1/prd123.json',
//   tenantId: 'tenant1',
//   targetLanguage: 'typescript',
//   framework: 'nextjs',
// };
// runCodePipeline(input);
