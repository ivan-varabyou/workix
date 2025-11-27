import { Injectable, Logger } from '@nestjs/common';

/**
 * Prompt Template
 */
export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string; // Template with {{variable}} placeholders
  variables: string[]; // List of required variables
  defaultValues?: Record<string, unknown>; // Default values for variables
  metadata?: Record<string, unknown>;
}

/**
 * Prompt Rendering Options
 */
export interface PromptRenderingOptions {
  variables: Record<string, unknown>;
  strict?: boolean; // Throw error if variable is missing
  defaultValue?: string; // Default value for missing variables
}

/**
 * Prompt Manager Service
 * Handles prompt templates and variable binding
 */
@Injectable()
export class PromptManagerService {
  private readonly logger = new Logger(PromptManagerService.name);
  private templates: Map<string, PromptTemplate> = new Map();

  /**
   * Register prompt template
   */
  registerTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
    this.logger.log(`Prompt template registered: ${template.id} (${template.name})`);
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * List all templates
   */
  listTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Render prompt from template
   */
  renderPrompt(templateId: string, options: PromptRenderingOptions): string {
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return this.renderTemplate(
      template.template,
      {
        ...template.defaultValues,
        ...options.variables,
      },
      options
    );
  }

  /**
   * Render prompt from template string
   */
  renderTemplate(
    templateString: string,
    variables: Record<string, unknown>,
    options?: PromptRenderingOptions
  ): string {
    const strict = options?.strict ?? false;
    const defaultValue = options?.defaultValue ?? '';

    // Extract all variables from template
    const variablePattern = /\{\{(\w+)(?::([^}]+))?\}\}/g;
    const matches = Array.from(templateString.matchAll(variablePattern));

    let rendered = templateString;

    for (const match of matches) {
      const fullMatch = match[0]; // {{variable}} or {{variable:default}}
      const varName = match[1];
      const defaultVal = match[2] || defaultValue;

      let value: string | number | boolean | undefined;

      if (varName && variables[varName] !== undefined) {
        const varValue = variables[varName];
        // Convert to string if needed
        if (
          typeof varValue === 'string' ||
          typeof varValue === 'number' ||
          typeof varValue === 'boolean'
        ) {
          value = varValue;
        } else {
          value = String(varValue);
        }
      } else if (defaultVal) {
        value = defaultVal;
      } else if (strict) {
        throw new Error(`Missing required variable: ${varName}`);
      } else {
        value = '';
      }

      // Convert value to string
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

      // Replace in template
      rendered = rendered.replace(fullMatch, stringValue);
    }

    return rendered;
  }

  /**
   * Extract variables from template string
   */
  extractVariables(templateString: string): string[] {
    const variablePattern = /\{\{(\w+)(?::[^}]+)?\}\}/g;
    const matches = Array.from(templateString.matchAll(variablePattern));
    const variables = new Set<string>();

    for (const match of matches) {
      if (match[1]) {
        variables.add(match[1]);
      }
    }

    return Array.from(variables);
  }

  /**
   * Validate template
   */
  validateTemplate(template: PromptTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.id) {
      errors.push('Template ID is required');
    }

    if (!template.name) {
      errors.push('Template name is required');
    }

    if (!template.template) {
      errors.push('Template string is required');
    }

    // Extract variables from template
    const extractedVars = this.extractVariables(template.template);

    // Check if all extracted variables are in variables list
    for (const varName of extractedVars) {
      if (!template.variables.includes(varName)) {
        errors.push(`Variable ${varName} is used in template but not declared in variables list`);
      }
    }

    // Check if all declared variables are used
    for (const varName of template.variables) {
      if (!extractedVars.includes(varName)) {
        errors.push(`Variable ${varName} is declared but not used in template`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create template from string
   */
  createTemplate(
    id: string,
    name: string,
    templateString: string,
    options?: {
      description?: string;
      defaultValues?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }
  ): PromptTemplate {
    const variables = this.extractVariables(templateString);

    const template: PromptTemplate = {
      id,
      name,
      template: templateString,
      variables,
    };
    if (options?.description !== undefined) {
      template.description = options.description;
    }
    if (options?.defaultValues !== undefined) {
      template.defaultValues = options.defaultValues;
    }
    if (options?.metadata !== undefined) {
      template.metadata = options.metadata;
    }

    // Validate template
    const validation = this.validateTemplate(template);
    if (!validation.valid) {
      this.logger.warn(`Template validation warnings for ${id}:`, validation.errors);
    }

    this.registerTemplate(template);

    return template;
  }

  /**
   * Delete template
   */
  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * Update template
   */
  updateTemplate(templateId: string, updates: Partial<PromptTemplate>): PromptTemplate | undefined {
    const template = this.templates.get(templateId);

    if (!template) {
      return undefined;
    }

    const updated: PromptTemplate = {
      ...template,
      ...updates,
      id: templateId, // Prevent ID change
    };

    // Re-extract variables if template changed
    if (updates.template) {
      updated.variables = this.extractVariables(updates.template);
    }

    // Validate updated template
    const validation = this.validateTemplate(updated);
    if (!validation.valid) {
      this.logger.warn(`Template validation warnings for ${templateId}:`, validation.errors);
    }

    this.templates.set(templateId, updated);
    return updated;
  }
}
