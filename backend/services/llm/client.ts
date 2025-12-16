import { backendConfig } from '../../config';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

export class LLMClient {
  private client: OpenAI | any;
  private config: typeof backendConfig.llm;

  constructor() {
    this.config = backendConfig.llm;
    this.initializeClient();
  }

  private initializeClient() {
    switch (this.config.provider) {
      case 'openai':
        this.client = new OpenAI({
          apiKey: this.config.apiKey,
        });
        break;
      case 'anthropic':
        this.client = new Anthropic({
          apiKey: this.config.apiKey,
        });
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }

  async generateCompletion(prompt: string, options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    const model = options.model || this.config.model;
    const temperature = options.temperature || this.config.temperature;
    const maxTokens = options.maxTokens || 1000;

    try {
      if (this.config.provider === 'openai') {
        const response = await this.client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        });

        return response.choices[0].message.content || '';
      } else if (this.config.provider === 'anthropic') {
        const response = await this.client.messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: 'user', content: prompt }],
        });

        return response.content[0].text || '';
      }

      throw new Error(`Unsupported provider: ${this.config.provider}`);
    } catch (error) {
      console.error('LLM completion error:', error);
      throw new Error(`Failed to generate completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.config.provider !== 'openai') {
      throw new Error('Embeddings only supported with OpenAI provider');
    }

    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('LLM embedding error:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
export const llmClient = new LLMClient();
