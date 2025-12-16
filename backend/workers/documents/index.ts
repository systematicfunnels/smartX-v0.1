import { llmClient } from '../../services/llm/client';
import { storageService } from '../../services/storage/s3';
import { queueService } from '../../services/queue/redis';

export interface DocumentTask {
  meaningKey: string;
  template?: string;
  tenantId: string;
  documentType: 'PRD' | 'TechnicalSpec' | 'Report' | 'Custom';
  customSchema?: any;
}

export interface DocumentResult {
  content: string;
  metadata: {
    title: string;
    author: string;
    createdAt: string;
    documentType: string;
    version: string;
  };
  sections: Array<{
    title: string;
    content: string;
    level: number;
  }>;
  confidence: number;
  warnings: string[];
}

export async function runDocumentWorker(task: DocumentTask): Promise<DocumentResult> {
  console.log(`Starting document generation for ${task.documentType}`);

  try {
    // 1. Download meaning data
    const meaningBuffer = await storageService.getFile(task.meaningKey);
    const meaningData = JSON.parse(meaningBuffer.toString('utf-8'));

    // 2. Generate document
    const document = await generateDocument(meaningData, task);

    // 3. Store document
    const docKey = `documents/${task.tenantId}/${Date.now()}-${task.documentType}.json`;
    await storageService.uploadFile(
      docKey,
      JSON.stringify(document, null, 2),
      'application/json'
    );

    console.log(`Document generation completed`);
    return document;
  } catch (error) {
    console.error(`Document generation failed:`, error);
    throw error;
  }
}

async function generateDocument(meaningData: any, task: DocumentTask): Promise<DocumentResult> {
  const template = getDocumentTemplate(task.documentType, task.template);
  const schema = task.customSchema || getDefaultSchema(task.documentType);

  const prompt = `
    Generate a professional ${task.documentType} document based on the following meaning data:

    MEANING DATA:
    ${JSON.stringify(meaningData, null, 2)}

    TEMPLATE:
    ${template}

    SCHEMA:
    ${JSON.stringify(schema, null, 2)}

    Requirements:
    1. Follow the specified template and schema
    2. Include all relevant sections
    3. Use professional language and formatting
    4. Ensure logical flow and coherence
    5. Include confidence score and any warnings

    Format as valid JSON matching the DocumentResult interface.
  `;

  const result = await llmClient.generateCompletion(prompt, {
    maxTokens: 2500,
    temperature: 0.2, // More deterministic for document generation
  });

  try {
    return JSON.parse(result);
  } catch (parseError) {
    console.error('Failed to parse document result:', parseError);
    return createFallbackDocument(task);
  }
}

function getDocumentTemplate(documentType: string, customTemplate?: string): string {
  if (customTemplate) return customTemplate;

  const templates: Record<string, string> = {
    PRD: `# Product Requirements Document

## 1. Overview
[Product description and purpose]

## 2. Goals
[Product goals and objectives]

## 3. Requirements
[Functional and non-functional requirements]

## 4. User Stories
[User personas and stories]

## 5. Technical Specifications
[Technical requirements and constraints]

## 6. Success Metrics
[KPIs and success criteria]`,
    TechnicalSpec: `# Technical Specification

## 1. System Overview
[System architecture and components]

## 2. API Specifications
[API endpoints and contracts]

## 3. Data Models
[Database schemas and data structures]

## 4. Integration Points
[External system integrations]

## 5. Security Requirements
[Security and compliance requirements]`,
    Report: `# Analysis Report

## 1. Executive Summary
[High-level findings and recommendations]

## 2. Methodology
[Research and analysis approach]

## 3. Findings
[Detailed analysis results]

## 4. Recommendations
[Actionable recommendations]

## 5. Conclusion
[Summary and next steps]`,
    Custom: `# Custom Document

[Custom content based on provided schema]`,
  };

  return templates[documentType] || templates.Custom;
}

function getDefaultSchema(documentType: string): any {
  const schemas: Record<string, any> = {
    PRD: {
      sections: ['Overview', 'Goals', 'Requirements', 'User Stories', 'Technical Specifications', 'Success Metrics'],
    },
    TechnicalSpec: {
      sections: ['System Overview', 'API Specifications', 'Data Models', 'Integration Points', 'Security Requirements'],
    },
    Report: {
      sections: ['Executive Summary', 'Methodology', 'Findings', 'Recommendations', 'Conclusion'],
    },
    Custom: {
      sections: ['Custom content'],
    },
  };

  return schemas[documentType] || schemas.Custom;
}

function createFallbackDocument(task: DocumentTask): DocumentResult {
  return {
    content: `# ${task.documentType} Document\n\nThis is a fallback document structure.`,
    metadata: {
      title: `${task.documentType} Document`,
      author: 'SmartX AI',
      createdAt: new Date().toISOString(),
      documentType: task.documentType,
      version: '1.0',
    },
    sections: [
      {
        title: 'Introduction',
        content: 'This document was generated as a fallback.',
        level: 1,
      },
    ],
    confidence: 0.5,
    warnings: ['Fallback document generated - may need manual review'],
  };
}

// Register worker with queue service
queueService.createWorker('documents', async (job) => {
  const task = job.data as DocumentTask;
  return runDocumentWorker(task);
});
