import { llmClient } from '../../services/llm/client';
import { storageService } from '../../services/storage/s3';
import { queueService } from '../../services/queue/redis';

export interface CodegenTask {
  documentKey: string;
  targetLanguage: string;
  framework?: string;
  tenantId: string;
  requirements?: string[];
}

export interface CodegenResult {
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  structure: string;
  confidence: number;
  summary: string;
  warnings: string[];
}

export async function runCodegenWorker(task: CodegenTask): Promise<CodegenResult> {
  console.log(`Starting code generation for document ${task.documentKey}`);

  try {
    // 1. Download document
    const docBuffer = await storageService.getFile(task.documentKey);
    const documentContent = docBuffer.toString('utf-8');

    // 2. Generate code
    const codeResult = await generateCode(documentContent, task);

    // 3. Store generated code as zip
    const zipKey = `codegen/${task.tenantId}/${Date.now()}.zip`;
    // In a real implementation, we would create a zip file here
    // For now, we'll store the JSON representation
    await storageService.uploadFile(
      zipKey,
      JSON.stringify(codeResult, null, 2),
      'application/json'
    );

    console.log(`Code generation completed`);
    return codeResult;
  } catch (error) {
    console.error(`Code generation failed:`, error);
    throw error;
  }
}

async function generateCode(document: string, task: CodegenTask): Promise<CodegenResult> {
  const requirements = task.requirements?.join('\n- ') || 'No specific requirements';
  const framework = task.framework || 'None specified';

  const prompt = `
    Generate production-ready code based on the following document:

    DOCUMENT:
    ${document}

    REQUIREMENTS:
    - Target language: ${task.targetLanguage}
    - Framework: ${framework}
    - Specific requirements:
      - ${requirements}

    Provide:
    1. Complete file structure with all necessary files
    2. Full implementation for each file
    3. Proper error handling and documentation
    4. Configuration files
    5. Build scripts
    6. Confidence score (0-1)
    7. Summary of implementation
    8. Any warnings or limitations

    Format as valid JSON matching the CodegenResult interface.
    Ensure the code is production-ready and follows best practices.
  `;

  const result = await llmClient.generateCompletion(prompt, {
    maxTokens: 3000,
    temperature: 0.3, // More deterministic for code generation
  });

  try {
    return JSON.parse(result);
  } catch (parseError) {
    console.error('Failed to parse codegen result:', parseError);
    return createFallbackCodegenResult(task);
  }
}

function createFallbackCodegenResult(task: CodegenTask): CodegenResult {
  return {
    files: [
      {
        path: 'src/index.ts',
        content: `// Generated code for ${task.targetLanguage}\n// Framework: ${task.framework || 'None'}\nconsole.log('Hello World');`,
        language: task.targetLanguage,
      },
    ],
    structure: 'Basic project structure',
    confidence: 0.6,
    summary: 'Basic code generation completed',
    warnings: ['Fallback implementation used - may need manual review'],
  };
}

// Register worker with queue service
queueService.createWorker('codegen', async (job) => {
  const task = job.data as CodegenTask;
  return runCodegenWorker(task);
});
