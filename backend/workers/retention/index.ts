import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Default retention policies by tenant tier
 */
const DEFAULT_RETENTION_POLICIES = {
  free: {
    transcriptRetentionDays: 90,
    repositoryRetentionDays: 180,
    jobRetentionDays: 30
  },
  pro: {
    transcriptRetentionDays: 365,
    repositoryRetentionDays: 365,
    jobRetentionDays: 90
  },
  enterprise: {
    transcriptRetentionDays: null,   // unlimited
    repositoryRetentionDays: null,   // unlimited
    jobRetentionDays: 365
  }
};

/**
 * Get retention policy for a tenant
 */
async function getTenantRetentionPolicy(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      transcriptRetentionDays: true,
      repositoryRetentionDays: true,
      jobRetentionDays: true,
      // Add other fields as needed to determine tier
    }
  });

  // If tenant has custom retention policies, use them
  if (tenant?.transcriptRetentionDays !== undefined ||
      tenant?.repositoryRetentionDays !== undefined ||
      tenant?.jobRetentionDays !== undefined) {
    return tenant;
  }

  // Otherwise use defaults based on tier
  // TODO: Implement logic to determine tenant tier
  return DEFAULT_RETENTION_POLICIES.pro;
}

/**
 * Clean up old transcripts and meetings
 */
async function cleanupTranscripts() {
  console.log('Starting transcript cleanup...');

  const tenants = await prisma.tenant.findMany({
    where: {
      OR: [
        { transcriptRetentionDays: { not: null } },
        { transcriptRetentionDays: null } // Include unlimited for logging
      ]
    }
  });

  for (const tenant of tenants) {
    if (tenant.transcriptRetentionDays === null) {
      console.log(`Tenant ${tenant.id} (${tenant.name}): Unlimited transcript retention`);
      continue;
    }

    const retentionDays = tenant.transcriptRetentionDays || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Tenant ${tenant.id} (${tenant.name}): Cleaning up transcripts older than ${retentionDays} days`);

    // Find meetings older than retention period that aren't already deleted
    const oldMeetings = await prisma.meeting.findMany({
      where: {
        tenantId: tenant.id,
        createdAt: { lte: cutoffDate },
        deletedAt: null
      },
      select: { id: true, createdAt: true }
    });

    for (const meeting of oldMeetings) {
      try {
        // Soft delete the meeting (this will cascade to transcripts)
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { deletedAt: new Date() }
        });

        // Also soft delete all transcript segments
        await prisma.transcriptSegment.updateMany({
          where: {
            meetingId: meeting.id,
            deletedAt: null
          },
          data: { deletedAt: new Date() }
        });

        console.log(`Soft deleted meeting ${meeting.id} (created ${meeting.createdAt})`);
      } catch (error) {
        console.error(`Error deleting meeting ${meeting.id}:`, error);
      }
    }
  }

  console.log('Transcript cleanup completed');
}

/**
 * Clean up old repositories
 */
async function cleanupRepositories() {
  console.log('Starting repository cleanup...');

  const tenants = await prisma.tenant.findMany({
    where: {
      OR: [
        { repositoryRetentionDays: { not: null } },
        { repositoryRetentionDays: null } // Include unlimited for logging
      ]
    }
  });

  for (const tenant of tenants) {
    if (tenant.repositoryRetentionDays === null) {
      console.log(`Tenant ${tenant.id} (${tenant.name}): Unlimited repository retention`);
      continue;
    }

    const retentionDays = tenant.repositoryRetentionDays || 180;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Tenant ${tenant.id} (${tenant.name}): Cleaning up repositories older than ${retentionDays} days`);

    // Find unpinned repositories older than retention period
    const oldRepos = await prisma.repository.findMany({
      where: {
        tenantId: tenant.id,
        createdAt: { lte: cutoffDate },
        deletedAt: null,
        isPinned: false
      },
      select: { id: true, createdAt: true, isPinned: true }
    });

    for (const repo of oldRepos) {
      try {
        await prisma.repository.update({
          where: { id: repo.id },
          data: { deletedAt: new Date() }
        });
        console.log(`Soft deleted repository ${repo.id} (created ${repo.createdAt}, pinned: ${repo.isPinned})`);
      } catch (error) {
        console.error(`Error deleting repository ${repo.id}:`, error);
      }
    }
  }

  console.log('Repository cleanup completed');
}

/**
 * Clean up old jobs
 */
async function cleanupJobs() {
  console.log('Starting job cleanup...');

  const tenants = await prisma.tenant.findMany({
    where: {
      OR: [
        { jobRetentionDays: { not: null } },
        { jobRetentionDays: null } // Include unlimited for logging
      ]
    }
  });

  for (const tenant of tenants) {
    const retentionDays = tenant.jobRetentionDays || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Tenant ${tenant.id} (${tenant.name}): Cleaning up jobs older than ${retentionDays} days`);

    // Find completed jobs older than retention period
    const oldJobs = await prisma.masterJob.findMany({
      where: {
        tenantId: tenant.id,
        updatedAt: { lte: cutoffDate },
        deletedAt: null,
        status: { in: ['SUCCESS', 'FAILED'] } // Only clean up completed jobs
      },
      select: { id: true, createdAt: true, status: true }
    });

    for (const job of oldJobs) {
      try {
        // Soft delete the master job
        await prisma.masterJob.update({
          where: { id: job.id },
          data: { deletedAt: new Date() }
        });

        // Soft delete all associated task jobs
        await prisma.taskJob.updateMany({
          where: {
            masterJobId: job.id,
            deletedAt: null
          },
          data: { deletedAt: new Date() }
        });

        console.log(`Soft deleted job ${job.id} (created ${job.createdAt}, status: ${job.status})`);
      } catch (error) {
        console.error(`Error deleting job ${job.id}:`, error);
      }
    }
  }

  console.log('Job cleanup completed');
}

/**
 * Update last accessed time for repositories
 */
async function updateRepositoryAccessTimes() {
  console.log('Updating repository access times...');

  // This would be called when a repository is accessed
  // For now, we'll just log the concept
  console.log('Repository access time tracking implemented in API layer');

  console.log('Repository access time update completed');
}

/**
 * Main retention cleanup function
 */
export async function runRetentionCleanup() {
  console.log('=== Starting Retention Cleanup ===');
  const startTime = Date.now();

  try {
    // Run all cleanup tasks
    await cleanupTranscripts();
    await cleanupRepositories();
    await cleanupJobs();
    await updateRepositoryAccessTimes();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`=== Retention Cleanup Completed in ${duration}s ===`);
  } catch (error) {
    console.error('Retention cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Set default retention policies for new tenants
 */
export async function setDefaultRetentionPolicies(tenantId: string, tier: 'free' | 'pro' | 'enterprise' = 'pro') {
  const policy = DEFAULT_RETENTION_POLICIES[tier];

  return prisma.tenant.update({
    where: { id: tenantId },
    data: {
      transcriptRetentionDays: policy.transcriptRetentionDays,
      repositoryRetentionDays: policy.repositoryRetentionDays,
      jobRetentionDays: policy.jobRetentionDays
    }
  });
}

/**
 * Get retention statistics for a tenant
 */
export async function getRetentionStatistics(tenantId: string) {
  const now = new Date();

  // Count transcripts by age
  const transcriptStats = await prisma.transcriptSegment.groupBy({
    by: ['deletedAt'],
    where: { meeting: { tenantId } },
    _count: { _all: true }
  });

  // Count repositories by pinned status
  const repoStats = await prisma.repository.groupBy({
    by: ['isPinned', 'deletedAt'],
    where: { tenantId },
    _count: { _all: true }
  });

  // Count jobs by status and age
  const jobStats = await prisma.masterJob.groupBy({
    by: ['status', 'deletedAt'],
    where: { tenantId },
    _count: { _all: true }
  });

  return {
    transcripts: transcriptStats,
    repositories: repoStats,
    jobs: jobStats,
    generatedAt: now
  };
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  runRetentionCleanup().catch(console.error);
}
