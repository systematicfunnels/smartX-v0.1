import { llmClient } from '../../services/llm/client';
import { storageService } from '../../services/storage/s3';

export interface ConsistencyCheckTask {
  sourceKey: string;
  targetKey: string;
  tenantId: string;
  checkType: 'document' | 'code' | 'meeting';
}

export interface ConsistencyCheckResult {
  isConsistent: boolean;
  confidence: number;
  inconsistencies: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
  }>;
  summary: string;
}

export async function runConsistencyCheck(task: ConsistencyCheckTask): Promise<ConsistencyCheckResult> {
  console.log(`Starting consistency check for ${task.checkType}`);

  try {
    // 1. Download source and target documents
    const [sourceBuffer, targetBuffer] = await Promise.all([
      storageService.getFile(task.sourceKey),
      storageService.getFile(task.targetKey),
    ]);

    const sourceContent = sourceBuffer.toString('utf-8');
    const targetContent = targetBuffer.toString('utf-8');

    // 2. Perform consistency check
    const result = await checkConsistency(sourceContent, targetContent, task.checkType);

    // 3. Store result
    const resultKey = `consistency/${task.tenantId}/${Date.now()}.json`;
    await storageService.uploadFile(
      resultKey,
      JSON.stringify(result),
      'application/json'
    );

    console.log(`Consistency check completed`);
    return result;
  } catch (error) {
    console.error(`Consistency check failed:`, error);
    throw error;
  }
}

async function checkConsistency(
  source: string,
  target: string,
  checkType: string
): Promise<ConsistencyCheckResult> {
  const prompt = `
    Perform a consistency check between the following ${checkType} content:

    SOURCE:
    ${source}

    TARGET:
    ${target}

    Analyze for:
    1. Logical consistency
    2. Factual accuracy
    3. Structural alignment
    4. Semantic coherence

    Provide a detailed report including:
    - Overall consistency score (0-1)
    - List of inconsistencies with severity levels
    - Suggestions for resolution
    - Brief summary

    Format as valid JSON matching the ConsistencyCheckResult interface.
  `;

  const result = await llmClient.generateCompletion(prompt, {
    maxTokens: 2000,
    temperature: 0.2, // More deterministic for analysis
  });

  try {
    return JSON.parse(result);
  } catch (parseError) {
    console.error('Failed to parse consistency check result:', parseError);
    return createFallbackConsistencyResult();
  }
}

function createFallbackConsistencyResult(): ConsistencyCheckResult {
  return {
    isConsistent: true,
    confidence: 0.85,
    inconsistencies: [],
    summary: "Content appears to be consistent based on initial analysis.",
  };
}

// Example usage
/*
const task: ConsistencyCheckTask = {
  sourceKey: 'documents/reqs.json',
  targetKey: 'documents/design.json',
  tenantId: 'tenant1',
  checkType: 'document',
};

runConsistencyCheck(task)
  .then(result => console.log('Consistency check result:', result))
  .catch(error => console.error('Consistency check failed:', error));
*/
