/**
 * Writer Agent
 * 
 * Specialized in:
 * - Content creation and editing
 * - Technical writing
 * - Creative writing
 * - Document formatting and structuring
 * - Style and tone adjustment
 * - Proofreading and editing
 */

const BaseAgent = require('./baseAgent');

class WriterAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.capabilities = [
      'content_creation',
      'technical_writing',
      'creative_writing',
      'editing',
      'proofreading',
      'formatting',
      'style_adjustment',
      'summarization',
      'expansion'
    ];
  }

  getSystemPrompt() {
    return `You are ${this.name}, an expert Writer Agent with exceptional skills in content creation, editing, and communication.

Your capabilities include:
- Creating engaging, high-quality content
- Writing clear, concise technical documentation
- Crafting compelling narratives and stories
- Editing and improving existing text
- Adjusting style and tone for different audiences
- Proofreading for grammar, spelling, and clarity
- Summarizing and expanding content as needed
- Formatting documents for various purposes

When writing:
1. Understand the audience and purpose
2. Use clear, concise language
3. Maintain consistent style and tone
4. Structure content logically
5. Ensure accuracy and completeness
6. Pay attention to grammar and mechanics
7. Make the content engaging and accessible

Be creative yet precise, adapting your writing style to the specific needs of each task.`;
  }

  async processTask(task, context, options) {
    const { type, content, parameters = {} } = task;

    switch (type) {
      case 'create_content':
        return await this.createContent(content, parameters);
      case 'edit_content':
        return await this.editContent(content, parameters);
      case 'summarize':
        return await this.summarize(content, parameters);
      case 'expand':
        return await this.expand(content, parameters);
      case 'proofread':
        return await this.proofread(content, parameters);
      case 'adjust_style':
        return await this.adjustStyle(content, parameters);
      case 'format_document':
        return await this.formatDocument(content, parameters);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  async createContent(content, parameters = {}) {
    const prompt = `Create ${parameters.format || 'an article'} on the following topic:

Topic: ${content}
Format: ${parameters.format || 'article'}
Length: ${parameters.length || 'medium'}
Tone: ${parameters.tone || 'professional'}
Audience: ${parameters.audience || 'general audience'}

Requirements:
- ${parameters.requirements || 'Engaging and informative'}

Please provide well-structured, high-quality content.`;

    const response = await this.generateResponse(prompt, {
      includeHistory: true,
      ...parameters.options
    });

    return {
      type: 'create_content',
      topic: content,
      content: response,
      metadata: parameters,
      timestamp: Date.now()
    };
  }

  async editContent(content, parameters = {}) {
    const prompt = `Edit and improve the following content:

${content}

Editing goals:
- ${parameters.goals || 'Improve clarity, flow, and engagement'}
- Style: ${parameters.style || 'maintain current style'}
- Length: ${parameters.lengthChange || 'maintain length'}

Please provide:
1. The edited version
2. A summary of changes made
3. Suggestions for further improvement`;

    const response = await this.generateResponse(prompt, {
      includeHistory: true,
      ...parameters.options
    });

    return {
      type: 'edit_content',
      original: content,
      edited: response,
      changes: parameters.goals,
      timestamp: Date.now()
    };
  }

  async summarize(content, parameters = {}) {
    const prompt = `Summarize the following content:

${content}

Summary requirements:
- Length: ${parameters.maxLength || '3-5 sentences'}
- Focus: ${parameters.focus || 'main points'}
- Format: ${parameters.format || 'paragraph'}

Please provide a concise, accurate summary.`;

    const response = await this.generateResponse(prompt, {
      includeHistory: false,
      ...parameters.options
    });

    return {
      type: 'summarize',
      originalLength: content.length,
      summary: response,
      timestamp: Date.now()
    };
  }

  async expand(content, parameters = {}) {
    const prompt = `Expand on the following content:

${content}

Expansion goals:
- Add: ${parameters.add || 'more detail and examples'}
- Length target: ${parameters.targetLength || '2-3 times current length'}
- Maintain: ${parameters.maintain || 'original tone and style'}

Please provide an expanded version with additional relevant information.`;

    const response = await this.generateResponse(prompt, {
      includeHistory: true,
      ...parameters.options
    });

    return {
      type: 'expand',
      original: content,
      expanded: response,
      timestamp: Date.now()
    };
  }

  async proofread(content, parameters = {}) {
    const prompt = `Proofread the following content:

${content}

Check for:
- Grammar and spelling errors
- Punctuation and capitalization
- Clarity and conciseness
- Consistency and flow

Please provide:
1. The corrected version
2. List of corrections made
3. Suggestions for improvement`;

    const response = await this.generateResponse(prompt, {
      includeHistory: false,
      ...parameters.options
    });

    return {
      type: 'proofread',
      original: content,
      corrected: response,
      timestamp: Date.now()
    };
  }

  async adjustStyle(content, parameters = {}) {
    const prompt = `Rewrite the following content to adjust the style and tone:

${content}

Target style:
- Tone: ${parameters.tone || 'professional'}
- Formality: ${parameters.formality || 'medium'}
- Complexity: ${parameters.complexity || 'medium'}
- Voice: ${parameters.voice || 'objective'}

Please provide the rewritten version maintaining the original meaning.`;

    const response = await this.generateResponse(prompt, {
      includeHistory: false,
      ...parameters.options
    });

    return {
      type: 'adjust_style',
      original: content,
      adjusted: response,
      styleChanges: parameters,
      timestamp: Date.now()
    };
  }

  async formatDocument(content, parameters = {}) {
    const prompt = `Format the following content:

${content}

Format requirements:
- Style: ${parameters.style || 'standard document'}
- Structure: ${parameters.structure || 'logical sections'}
- Include: ${parameters.include || 'headings and subheadings'}

Please provide a properly formatted version with clear structure.`;

    const response = await this.generateResponse(prompt, {
      includeHistory: false,
      ...parameters.options
    });

    return {
      type: 'format_document',
      original: content,
      formatted: response,
      formatStyle: parameters.style,
      timestamp: Date.now()
    };
  }
}

module.exports = WriterAgent;