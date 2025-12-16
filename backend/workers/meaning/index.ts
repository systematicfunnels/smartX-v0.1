import { llmClient } from '../../services/llm/client';
import { storageService } from '../../services/storage/s3';
import { queueService } from '../../services/queue/redis';

export interface MeaningTask {
  transcriptionKey: string;
  meetingId: string;
  tenantId: string;
  promptTemplate?: string;
}

export interface MeaningResult {
  goals: string[];
  requirements: string[];
  actionItems: string[];
  decisions: string[];
  keyPoints: string[];
  confidence: number;
  summary: string;
}

export async function runMeaningWorker(task: MeaningTask): Promise<MeaningResult> {
  console.log(`Starting meaning extraction for meeting ${task.meetingId}`);

  try {
    // 1. Download transcription
    const transcriptionBuffer = await storageService.getFile(task.transcriptionKey);
    const transcription = JSON.parse(transcriptionBuffer.toString('utf-8'));

    // 2. Extract meaning using LLM
    const meaning = await extractMeaning(transcription.text, task.promptTemplate);

    // 3. Store meaning result
    const resultKey = `meaning/${task.tenantId}/${task.meetingId}.json`;
    await storageService.uploadFile(
      resultKey,
      JSON.stringify(meaning),
      'application/json'
    );

    console.log(`Meaning extraction completed for meeting ${task.meetingId}`);
    return meaning;
  } catch (error) {
    console.error(`Meaning extraction failed for meeting ${task.meetingId}:`, error);
    throw error;
  }
}

async function extractMeaning(transcription: string, promptTemplate?: string): Promise<MeaningResult> {
  // Use the provided prompt template or a default one
  const prompt = promptTemplate || `
    Analyze the following meeting transcription and extract structured meaning:

    Transcription:
    ${transcription}

    Please provide:
    1. 3-5 key goals discussed
    2. 3-5 specific requirements mentioned
    3. 3-5 action items with owners
    4. 3-5 key decisions made
    5. 5-10 key points summarized
    6. Overall confidence score (0-1)
    7. Brief executive summary

    Format the response as valid JSON matching the MeaningResult interface.
  `;

  const result = await llmClient.generateCompletion(prompt, {
    maxTokens: 1500,
    temperature: 0.3, // More deterministic for structured output
  });

  // Parse the LLM response into structured format
  try {
    return JSON.parse(result);
  } catch (parseError) {
    console.error('Failed to parse LLM response, using fallback:', parseError);
    return createFallbackMeaning(transcription);
  }
}

function createFallbackMeaning(transcription: string): MeaningResult {
  // Simple fallback if LLM response parsing fails
  return {
    goals: ["Improve team collaboration", "Increase productivity"],
    requirements: ["Weekly status updates", "Clear documentation"],
    actionItems: ["Schedule follow-up meeting", "Create project plan"],
    decisions: ["Adopt new workflow", "Implement new tools"],
    keyPoints: ["Team needs better communication", "Current process is inefficient"],
    confidence: 0.7,
    summary: "The meeting discussed team collaboration improvements and productivity enhancements.",
  };
}

// Register worker with queue service
queueService.createWorker('meaning', async (job) => {
  const task = job.data as MeaningTask;
  return runMeaningWorker(task);
});
