// SmartX AI Prompts
// Centralized prompt templates for AI workers

export const MEANING_PROMPT_V1 = `
Analyze the following meeting transcript and extract:
1. Key goals and objectives
2. Action items with owners
3. Important decisions made
4. Open questions or concerns

Transcript:
{{transcript}}

Format response as JSON with confidence scores for each extraction.
`;

export const DOCUMENT_PROMPT_V1 = `
Generate a professional {{documentType}} document based on the following requirements:

Title: {{title}}
Purpose: {{purpose}}
Audience: {{audience}}
Key Points: {{keyPoints}}

Format as markdown with appropriate headings and sections.
`;

export const CODE_PROMPT_V1 = `
Generate a {{language}} code implementation for the following specification:

Component: {{componentName}}
Description: {{description}}
Requirements: {{requirements}}
Dependencies: {{dependencies}}

Provide complete implementation with tests and documentation.
`;
