import { Queue } from 'bullmq';
import { redisConnection } from '../services/redis';

export async function dispatchTask(task: any) {
  try {
    // Create or get the task queue
    const queue = new Queue('smartx-tasks', {
      connection: redisConnection,
      prefix: process.env.QUEUE_PREFIX || 'smartx'
    });

    // Add task to the queue
    await queue.add(task.type, task, {
      jobId: task.id,
      removeOnComplete: true,
      removeOnFail: 1000
    });

    console.log(`✅ Task ${task.id} dispatched to Redis queue`);
    return { success: true, taskId: task.id };
  } catch (error) {
    console.error(`❌ Failed to dispatch task ${task.id}:`, error);
    throw error;
  }
}
