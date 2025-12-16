import { queueService } from '../../services/queue/redis';
import { createMasterJob } from '../createMasterJob';
import { createTaskJob } from '../createTaskJob';
import { dispatchTask } from '../dispatchTask';

export interface MeetingPipelineInput {
  audioFileKey: string;
  meetingId: string;
  tenantId: string;
  language?: string;
  promptTemplate?: string;
}

export async function runMeetingPipeline(input: MeetingPipelineInput): Promise<string> {
  console.log(`Starting meeting pipeline for ${input.meetingId}`);

  // 1. Create master job
  const masterJob = await createMasterJob({
    tenantId: input.tenantId,
    projectId: input.meetingId,
    type: 'MEETING_PIPELINE',
    payload: {
      meetingId: input.meetingId,
      audioFileKey: input.audioFileKey,
      language: input.language,
    },
  });

  // 2. Create transcription task
  const transcriptionTask = await createTaskJob({
    masterJobId: masterJob.id,
    tenantId: input.tenantId,
    worker: 'transcription',
    payload: {
      fileKey: input.audioFileKey,
      meetingId: input.meetingId,
      tenantId: input.tenantId,
      language: input.language,
    },
  });

  // 3. Create meaning extraction task (depends on transcription)
  const meaningTask = await createTaskJob({
    masterJobId: masterJob.id,
    tenantId: input.tenantId,
    worker: 'meaning',
    payload: {
      transcriptionKey: `transcriptions/${input.tenantId}/${input.meetingId}.json`,
      meetingId: input.meetingId,
      tenantId: input.tenantId,
      promptTemplate: input.promptTemplate,
    },
  });

  // 4. Dispatch tasks to queue
  await dispatchTask(transcriptionTask.id);
  await dispatchTask(meaningTask.id);

  console.log(`Meeting pipeline started for ${input.meetingId}`);
  return masterJob.id;
}

// Example usage:
// const input: MeetingPipelineInput = {
//   audioFileKey: 'uploads/meeting123.mp3',
//   meetingId: 'meeting123',
//   tenantId: 'tenant1',
//   language: 'en',
// };
// runMeetingPipeline(input);
