#!/usr/bin/env ts-node

import { storageService } from '../../backend/services/storage/s3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CleanupOptions {
  days?: number;
  dryRun?: boolean;
  includeBackups?: boolean;
}

async function cleanupStorage(options: CleanupOptions = {}) {
  const { days = 30, dryRun = true, includeBackups = false } = options;

  console.log(`Starting cleanup process (dryRun: ${dryRun})`);
  console.log(`Targeting files older than ${days} days`);

  try {
    // 1. Clean up old files from storage
    const files = await storageService.listFiles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filesToDelete = files.filter(file => {
      // Skip backups if not requested
      if (!includeBackups && file.includes('/backups/')) {
        return false;
      }

      // Extract date from filename if possible
      const dateMatch = file.match(/(\\d{4}-\\d{2}-\\d{2})/);
      if (dateMatch) {
        const fileDate = new Date(dateMatch[0]);
        return fileDate < cutoffDate;
      }

      return false;
    });

    console.log(`Found ${filesToDelete.length} files to clean up`);

    if (!dryRun && filesToDelete.length > 0) {
      for (const file of filesToDelete) {
        await storageService.deleteFile(file);
        console.log(`Deleted: ${file}`);
      }
    } else if (dryRun) {
      console.log('Dry run - would delete:');
      filesToDelete.forEach(file => console.log(`  - ${file}`));
    }

    // 2. Clean up old database records
    const oldJobs = await prisma.masterJob.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        status: 'COMPLETED',
      },
    });

    console.log(`Found ${oldJobs.length} completed jobs to clean up`);

    if (!dryRun && oldJobs.length > 0) {
      for (const job of oldJobs) {
        await prisma.masterJob.delete({
          where: { id: job.id },
        });
        console.log(`Deleted job: ${job.id}`);
      }
    } else if (dryRun) {
      console.log('Dry run - would delete jobs:');
      oldJobs.forEach((job: any) => console.log(`  - ${job.id}`));
    }

    console.log('Cleanup process completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: CleanupOptions = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) {
      options.days = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--execute') {
      options.dryRun = false;
    } else if (args[i] === '--include-backups') {
      options.includeBackups = true;
    }
  }

  cleanupStorage(options);
}

export { cleanupStorage };
