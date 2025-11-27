import { Injectable, Logger } from '@nestjs/common';

import { GenerationCacheService } from './generation-cache.service';
import { TextGenerationService } from './text-generation.service';

export interface IndustryContext {
  industry: string;
  targetAudience: string;
  tone: string;
  keyPoints: string[];
  bestPractices: string[];
  commonMistakes: string[];
}

export interface PromptContext {
  task: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
  constraints?: string[];
  examples?: string[];
}

@Injectable()
export class ContextGenerationService {
  private readonly logger = new Logger(ContextGenerationService.name);
  private readonly industryKnowledge: Map<string, IndustryContext> = new Map();

  constructor(
    private textGeneration: TextGenerationService,
    private cache: GenerationCacheService
  ) {
    this.initializeIndustryKnowledge();
  }

  /**
   * Initialize industry knowledge base
   */
  private initializeIndustryKnowledge(): void {
    // E-commerce
    this.industryKnowledge.set('ecommerce', {
      industry: 'E-commerce',
      targetAudience: 'Online shoppers',
      tone: 'Friendly, persuasive, clear',
      keyPoints: [
        'Highlight product benefits',
        'Use clear CTAs',
        'Include social proof',
        'Optimize for mobile',
        'Focus on conversion',
      ],
      bestPractices: [
        'Use urgency and scarcity',
        'Show customer reviews',
        'Clear pricing',
        'Easy checkout process',
      ],
      commonMistakes: [
        'Too much text',
        'Unclear product descriptions',
        'Missing CTAs',
        'Poor mobile experience',
      ],
    });

    // SaaS
    this.industryKnowledge.set('saas', {
      industry: 'SaaS',
      targetAudience: 'Business decision makers',
      tone: 'Professional, value-focused, technical',
      keyPoints: [
        'Emphasize ROI',
        'Showcase features',
        'Provide case studies',
        'Highlight integrations',
        'Focus on scalability',
      ],
      bestPractices: [
        'Clear value proposition',
        'Free trial offers',
        'Transparent pricing',
        'Customer success stories',
      ],
      commonMistakes: [
        'Too technical jargon',
        'Unclear pricing',
        'Missing social proof',
        'Weak CTAs',
      ],
    });

    // Content Marketing
    this.industryKnowledge.set('content', {
      industry: 'Content Marketing',
      targetAudience: 'Content creators, marketers',
      tone: 'Engaging, informative, creative',
      keyPoints: [
        'SEO optimization',
        'Engaging headlines',
        'Valuable content',
        'Visual appeal',
        'Shareability',
      ],
      bestPractices: [
        'Use storytelling',
        'Include visuals',
        'Optimize for SEO',
        'Encourage engagement',
      ],
      commonMistakes: ['Weak headlines', 'Poor SEO', 'No visuals', 'Lack of engagement'],
    });
  }

  /**
   * Generate optimal prompt with industry context
   */
  async generateOptimalPrompt(context: PromptContext): Promise<string> {
    const cacheKey = `prompt:${JSON.stringify(context)}`;
    const cached: string | null = (await this.cache.get(cacheKey)) as string | null;
    if (cached) {
      this.logger.debug(`Prompt cache hit for task: ${context.task}`);
      return cached;
    }

    const industryContext = context.industry
      ? this.industryKnowledge.get(context.industry.toLowerCase())
      : null;

    let prompt = `Task: ${context.task}\n\n`;

    if (industryContext) {
      prompt += `Industry Context:\n`;
      prompt += `- Industry: ${industryContext.industry}\n`;
      prompt += `- Target Audience: ${industryContext.targetAudience}\n`;
      prompt += `- Tone: ${industryContext.tone}\n`;
      prompt += `- Key Points: ${industryContext.keyPoints.join(', ')}\n`;
      prompt += `- Best Practices: ${industryContext.bestPractices.join(', ')}\n`;
      prompt += `- Common Mistakes to Avoid: ${industryContext.commonMistakes.join(', ')}\n\n`;
    }

    if (context.targetAudience) {
      prompt += `Target Audience: ${context.targetAudience}\n`;
    }

    if (context.tone) {
      prompt += `Tone: ${context.tone}\n`;
    }

    if (context.constraints && context.constraints.length > 0) {
      prompt += `Constraints: ${context.constraints.join(', ')}\n`;
    }

    if (context.examples && context.examples.length > 0) {
      prompt += `Examples:\n${context.examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n`;
    }

    prompt += `\nGenerate the best possible output for this task.`;

    // Cache the generated prompt
    await this.cache.set(cacheKey, prompt, 3600000); // 1 hour

    return prompt;
  }

  /**
   * Get industry knowledge
   */
  getIndustryKnowledge(industry: string): IndustryContext | null {
    return this.industryKnowledge.get(industry.toLowerCase()) || null;
  }

  /**
   * Add or update industry knowledge
   */
  setIndustryKnowledge(industry: string, context: IndustryContext) {
    this.industryKnowledge.set(industry.toLowerCase(), context);
    this.logger.log(`Industry knowledge updated: ${industry}`);
  }

  /**
   * Generate context-aware content
   */
  async generateContextualContent(
    context: PromptContext,
    options?: { maxLength?: number; style?: string }
  ): Promise<string> {
    const prompt = await this.generateOptimalPrompt(context);

    const result = await this.textGeneration.generateText(prompt, {
      style: (options?.style as any) || context.tone || 'professional',
    });

    return result;
  }
}
