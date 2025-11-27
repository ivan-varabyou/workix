import { Injectable, Logger } from '@nestjs/common';

import { WorkerContext, WorkerInput, WorkerOutput } from '../interfaces/worker-framework.interface';
import { WorkerTemplate, WorkerTemplateConfig } from '../interfaces/worker-template.interface';
import { Worker, WorkerFrameworkService } from './worker-framework.service';

/**
 * Worker Templates Service
 * Pre-built worker templates for common domains
 */
@Injectable()
export class WorkerTemplatesService {
  private readonly logger = new Logger(WorkerTemplatesService.name);
  private templates: Map<string, WorkerTemplate> = new Map();

  constructor(private workerFramework: WorkerFrameworkService) {
    this.initializeTemplates();
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    // Content domain templates
    this.registerTemplate({
      id: 'content-writer',
      name: 'Content Writer',
      domain: 'content',
      description: 'AI-powered content writer for articles, blog posts, and marketing copy',
      capabilities: ['text-generation', 'content-creation', 'seo-optimization'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
      },
      prompt:
        'You are an expert content writer. Create engaging, SEO-optimized content based on the provided topic and requirements.',
    });

    this.registerTemplate({
      id: 'content-editor',
      name: 'Content Editor',
      domain: 'content',
      description: 'AI-powered content editor for proofreading, editing, and improving content',
      capabilities: ['text-editing', 'grammar-check', 'style-improvement'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.3,
      },
      prompt:
        'You are an expert content editor. Review and improve the provided content for grammar, style, clarity, and engagement.',
    });

    // E-commerce domain templates
    this.registerTemplate({
      id: 'product-description-writer',
      name: 'Product Description Writer',
      domain: 'ecommerce',
      description: 'AI-powered product description writer for e-commerce platforms',
      capabilities: ['product-description', 'seo-optimization', 'marketing-copy'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.6,
      },
      prompt:
        'You are an expert e-commerce copywriter. Create compelling, SEO-optimized product descriptions that highlight key features and benefits.',
    });

    this.registerTemplate({
      id: 'product-categorizer',
      name: 'Product Categorizer',
      domain: 'ecommerce',
      description: 'AI-powered product categorization and tagging service',
      capabilities: ['categorization', 'tagging', 'classification'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.2,
      },
      prompt:
        'You are an expert e-commerce analyst. Categorize and tag products based on their attributes, features, and target audience.',
    });

    this.registerTemplate({
      id: 'price-optimizer',
      name: 'Price Optimizer',
      domain: 'ecommerce',
      description: 'AI-powered price optimization based on market analysis',
      capabilities: ['price-analysis', 'market-research', 'optimization'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.1,
      },
      prompt:
        'You are an expert pricing analyst. Analyze market data and suggest optimal pricing strategies for products.',
    });

    // Support domain templates
    this.registerTemplate({
      id: 'support-agent',
      name: 'Support Agent',
      domain: 'support',
      description: 'AI-powered customer support agent for handling inquiries and tickets',
      capabilities: ['customer-support', 'ticket-handling', 'faq-answering'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.5,
      },
      prompt:
        'You are a helpful customer support agent. Provide accurate, friendly, and professional responses to customer inquiries.',
    });

    this.registerTemplate({
      id: 'ticket-classifier',
      name: 'Ticket Classifier',
      domain: 'support',
      description: 'AI-powered ticket classification and routing service',
      capabilities: ['classification', 'routing', 'priority-assignment'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.2,
      },
      prompt:
        'You are an expert support analyst. Classify support tickets by category, priority, and assign them to appropriate teams.',
    });

    this.registerTemplate({
      id: 'knowledge-base-builder',
      name: 'Knowledge Base Builder',
      domain: 'support',
      description: 'AI-powered knowledge base article generator from support tickets',
      capabilities: ['knowledge-extraction', 'article-generation', 'documentation'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.4,
      },
      prompt:
        'You are an expert technical writer. Create clear, comprehensive knowledge base articles from support tickets and documentation.',
    });

    // Marketing domain templates
    this.registerTemplate({
      id: 'social-media-manager',
      name: 'Social Media Manager',
      domain: 'marketing',
      description: 'AI-powered social media content creator and scheduler',
      capabilities: ['social-media', 'content-creation', 'scheduling'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.8,
      },
      prompt:
        'You are an expert social media manager. Create engaging, platform-optimized social media posts that drive engagement.',
    });

    this.registerTemplate({
      id: 'email-campaign-writer',
      name: 'Email Campaign Writer',
      domain: 'marketing',
      description: 'AI-powered email campaign content creator',
      capabilities: ['email-marketing', 'campaign-creation', 'copywriting'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.7,
      },
      prompt:
        'You are an expert email marketer. Create compelling email campaigns with subject lines, body content, and CTAs.',
    });

    // Analytics domain templates
    this.registerTemplate({
      id: 'data-analyst',
      name: 'Data Analyst',
      domain: 'analytics',
      description: 'AI-powered data analysis and insights generation',
      capabilities: ['data-analysis', 'insights-generation', 'reporting'],
      config: {
        type: 'ai',
        model: 'gpt-4',
        temperature: 0.2,
      },
      prompt:
        'You are an expert data analyst. Analyze data, identify trends, and generate actionable insights and recommendations.',
    });

    this.logger.log(`Initialized ${this.templates.size} worker templates`);
  }

  /**
   * Register template
   */
  registerTemplate(template: WorkerTemplate): void {
    this.templates.set(template.id, template);
    this.logger.log(`Template registered: ${template.id} (${template.domain})`);
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): WorkerTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * List templates by domain
   */
  getTemplatesByDomain(domain: WorkerTemplate['domain']): WorkerTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.domain === domain);
  }

  /**
   * List all templates
   */
  listTemplates(): WorkerTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Create worker from template
   */
  createWorkerFromTemplate(templateId: string, customizations?: WorkerTemplateConfig): Worker {
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const config = { ...template.config, ...customizations };

    const worker: Worker = {
      id: `${template.id}-${Date.now()}`,
      name: template.name,
      type: config.type || 'ai',
      version: '1.0.0',
      description: template.description,
      capabilities: template.capabilities,
      execute: async (input: WorkerInput, _context?: WorkerContext): Promise<WorkerOutput> => {
        // This would be implemented by the actual worker framework
        // For now, return a placeholder
        return {
          success: true,
          output: `Worker ${template.name} executed with input: ${JSON.stringify(input)}`,
        };
      },
      metadata: {
        ...template.metadata,
        templateId: template.id,
        domain: template.domain,
        prompt: template.prompt,
      },
    };

    // Register worker in framework
    this.workerFramework.registerWorker(worker);

    this.logger.log(`Worker created from template: ${templateId} -> ${worker.id}`);

    return worker;
  }

  /**
   * Get templates by capability
   */
  getTemplatesByCapability(capability: string): WorkerTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.capabilities.includes(capability));
  }
}
