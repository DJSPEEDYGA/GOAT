/**
 * GOAT Royalty App — Gemini LLM Service
 * Core service library for Google Gemini AI integration
 * 
 * Features:
 * - Multi-model support (Gemini 2.0 Flash, Flash Lite, 2.5 Flash/Pro Preview)
 * - Streaming text generation with SSE
 * - Function calling / tool use
 * - Multimodal vision analysis (images)
 * - Conversation history management
 * - System instruction customization
 * - Safety settings configuration
 * - Token counting and usage tracking
 */

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// ─── Model Registry ──────────────────────────────────────────────────────────
const MODELS = {
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Fast, versatile model for everyday tasks',
    maxTokens: 8192,
    capabilities: ['text', 'code', 'analysis', 'streaming', 'function-calling'],
  },
  'gemini-2.0-flash-lite': {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    description: 'Lightweight model for quick responses',
    maxTokens: 8192,
    capabilities: ['text', 'code', 'streaming'],
  },
  'gemini-2.5-flash-preview-05-20': {
    id: 'gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash Preview',
    description: 'Next-gen flash model with enhanced reasoning',
    maxTokens: 8192,
    capabilities: ['text', 'code', 'analysis', 'streaming', 'function-calling', 'vision'],
  },
  'gemini-2.5-pro-preview-05-06': {
    id: 'gemini-2.5-pro-preview-05-06',
    name: 'Gemini 2.5 Pro Preview',
    description: 'Most capable model for complex tasks',
    maxTokens: 8192,
    capabilities: ['text', 'code', 'analysis', 'streaming', 'function-calling', 'vision'],
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Balanced performance and capability',
    maxTokens: 8192,
    capabilities: ['text', 'code', 'analysis', 'streaming', 'function-calling', 'vision'],
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast responses with good quality',
    maxTokens: 8192,
    capabilities: ['text', 'code', 'streaming', 'vision'],
  },
};

// ─── Default Safety Settings ─────────────────────────────────────────────────
const DEFAULT_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ─── GOAT System Instructions ────────────────────────────────────────────────
const GOAT_SYSTEM_INSTRUCTION = `You are GOAT AI, the intelligent assistant for the GOAT Royalty App — a comprehensive music royalty management platform created by Harvey L Miller Jr (DJ Speedy / FASTASSMAN).

Your expertise includes:
- Music royalties (mechanical, performance, synchronization, print, digital)
- Copyright registration and protection (ASCAP, BMI, SESAC, HFA)
- Music distribution and streaming analytics
- Publishing administration and catalog management
- Music industry business and legal guidance
- ISRC/ISWC codes and metadata management
- Blockchain and Web3 music applications
- AI-powered music analysis and recommendations

Always be professional, knowledgeable, and helpful. When discussing royalties, provide specific actionable guidance. Reference industry standards and best practices.`;

// ─── Persona System Instructions ─────────────────────────────────────────────
const PERSONAS = {
  default: GOAT_SYSTEM_INSTRUCTION,
  royalty_expert: `${GOAT_SYSTEM_INSTRUCTION}\n\nYou are specifically acting as a Music Royalty Expert. Focus on:\n- Detailed royalty calculations and splits\n- Collection society registrations\n- Revenue optimization strategies\n- Payment tracking and reconciliation\n- International royalty collection`,
  legal_advisor: `${GOAT_SYSTEM_INSTRUCTION}\n\nYou are specifically acting as a Music Legal Advisor. Focus on:\n- Copyright law and registration\n- Contract review and negotiation\n- Licensing agreements\n- Intellectual property protection\n- Music industry regulations and compliance`,
  producer: `${GOAT_SYSTEM_INSTRUCTION}\n\nYou are specifically acting as a Music Production Consultant. Focus on:\n- Beat making and production techniques\n- Sample clearance and licensing\n- Production credits and splits\n- Studio workflow optimization\n- Sound design and mixing advice`,
  marketing: `${GOAT_SYSTEM_INSTRUCTION}\n\nYou are specifically acting as a Music Marketing Strategist. Focus on:\n- Release strategies and promotional planning\n- Social media marketing for musicians\n- Playlist pitching and streaming optimization\n- Brand partnerships and sponsorships\n- Fan engagement and community building`,
  analyst: `${GOAT_SYSTEM_INSTRUCTION}\n\nYou are specifically acting as a Music Analytics Expert. Focus on:\n- Streaming data analysis and interpretation\n- Revenue forecasting and trends\n- Market analysis and competitive intelligence\n- Performance metrics and KPIs\n- Data-driven decision making for artists`,
};

// ─── GOAT Tools for Function Calling ─────────────────────────────────────────
const GOAT_TOOLS = [
  {
    name: 'calculate_royalties',
    description: 'Calculate music royalties based on streams, downloads, or performance data',
    parameters: {
      type: 'object',
      properties: {
        revenue_type: {
          type: 'string',
          enum: ['streaming', 'mechanical', 'performance', 'sync', 'print'],
          description: 'Type of royalty revenue',
        },
        streams_or_units: {
          type: 'number',
          description: 'Number of streams, downloads, or performance units',
        },
        rate_per_unit: {
          type: 'number',
          description: 'Rate per stream/unit in USD (optional, will use defaults)',
        },
        split_percentage: {
          type: 'number',
          description: 'Artist split percentage (0-100)',
        },
      },
      required: ['revenue_type', 'streams_or_units'],
    },
  },
  {
    name: 'lookup_track',
    description: 'Look up track information from the GOAT catalog by title, artist, or ISRC',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (title, artist, or ISRC code)' },
        search_type: {
          type: 'string',
          enum: ['title', 'artist', 'isrc', 'all'],
          description: 'Type of search to perform',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_streaming_analytics',
    description: 'Get streaming analytics for tracks or artists',
    parameters: {
      type: 'object',
      properties: {
        entity_type: { type: 'string', enum: ['track', 'artist', 'album'], description: 'Type of entity' },
        entity_name: { type: 'string', description: 'Name of track, artist, or album' },
        time_period: { type: 'string', enum: ['7d', '30d', '90d', '1y', 'all'], description: 'Time period' },
      },
      required: ['entity_type', 'entity_name'],
    },
  },
  {
    name: 'copyright_check',
    description: 'Check copyright registration status for a work',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the work' },
        author: { type: 'string', description: 'Author/composer name' },
        registration_number: { type: 'string', description: 'Copyright registration number (if known)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'distribution_status',
    description: 'Check distribution status across platforms for a release',
    parameters: {
      type: 'object',
      properties: {
        release_title: { type: 'string', description: 'Release/album title' },
        platforms: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific platforms to check (optional)',
        },
      },
      required: ['release_title'],
    },
  },
  {
    name: 'generate_report',
    description: 'Generate a royalty or analytics report',
    parameters: {
      type: 'object',
      properties: {
        report_type: {
          type: 'string',
          enum: ['royalty_summary', 'streaming_analytics', 'catalog_overview', 'revenue_forecast', 'distribution_report'],
          description: 'Type of report to generate',
        },
        time_period: { type: 'string', enum: ['monthly', 'quarterly', 'yearly', 'custom'], description: 'Report period' },
        format: { type: 'string', enum: ['summary', 'detailed', 'csv'], description: 'Output format' },
      },
      required: ['report_type'],
    },
  },
];

// ─── Tool Execution Handlers ─────────────────────────────────────────────────
const toolHandlers = {
  calculate_royalties: async (params) => {
    const rates = {
      streaming: 0.004,
      mechanical: 0.091,
      performance: 0.012,
      sync: 500,
      print: 0.08,
    };
    const rate = params.rate_per_unit || rates[params.revenue_type] || 0.004;
    const grossRevenue = params.streams_or_units * rate;
    const splitPct = (params.split_percentage || 100) / 100;
    const artistRevenue = grossRevenue * splitPct;

    return {
      revenue_type: params.revenue_type,
      units: params.streams_or_units,
      rate_per_unit: rate,
      gross_revenue: `$${grossRevenue.toFixed(2)}`,
      split_percentage: `${(splitPct * 100).toFixed(0)}%`,
      artist_revenue: `$${artistRevenue.toFixed(2)}`,
      note: params.rate_per_unit ? 'Using custom rate' : 'Using industry average rate',
    };
  },

  lookup_track: async (params) => {
    return {
      status: 'catalog_search',
      query: params.query,
      search_type: params.search_type || 'all',
      message: `Search for "${params.query}" would query the GOAT catalog database. Connect to Supabase for live results.`,
      suggestion: 'Use the Tracks page or ASAP Catalog for full search capabilities.',
    };
  },

  get_streaming_analytics: async (params) => {
    return {
      entity_type: params.entity_type,
      entity_name: params.entity_name,
      time_period: params.time_period || '30d',
      message: `Analytics for ${params.entity_type} "${params.entity_name}" would pull from connected streaming platforms.`,
      suggestion: 'Connect Spotify, Apple Music, and other platforms in the Analytics dashboard for live data.',
    };
  },

  copyright_check: async (params) => {
    return {
      title: params.title,
      author: params.author || 'Not specified',
      registration_number: params.registration_number || 'Not provided',
      message: `Copyright check for "${params.title}" would query registration databases.`,
      resources: [
        'US Copyright Office: copyright.gov',
        'ASCAP ACE: ascap.com/repertory',
        'BMI Repertoire: repertoire.bmi.com',
      ],
    };
  },

  distribution_status: async (params) => {
    const allPlatforms = ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Tidal', 'Deezer', 'Pandora'];
    const platforms = params.platforms || allPlatforms;
    return {
      release: params.release_title,
      platforms_checked: platforms,
      message: `Distribution status for "${params.release_title}" across ${platforms.length} platforms.`,
      suggestion: 'Check the Distribution page for real-time delivery status.',
    };
  },

  generate_report: async (params) => {
    return {
      report_type: params.report_type,
      time_period: params.time_period || 'monthly',
      format: params.format || 'summary',
      message: `Report generation for ${params.report_type} (${params.time_period || 'monthly'}) initiated.`,
      suggestion: 'Full reports are available in the Analytics and Royalty Engine sections.',
    };
  },
};

// ─── GeminiLLMService Class ──────────────────────────────────────────────────
class GeminiLLMService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Google AI API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.models = MODELS;
    this.personas = PERSONAS;
    this.tools = GOAT_TOOLS;
    this.toolHandlers = toolHandlers;
  }

  /**
   * Get available models list
   */
  getModels() {
    return Object.values(this.models);
  }

  /**
   * Validate model ID against allowed list
   */
  validateModel(modelId) {
    return this.models.hasOwnProperty(modelId);
  }

  /**
   * Get persona system instruction
   */
  getPersona(personaId) {
    return this.personas[personaId] || this.personas.default;
  }

  /**
   * Create a generative model instance with configuration
   */
  createModel(modelId, options = {}) {
    if (!this.validateModel(modelId)) {
      throw new Error(`Invalid model: "${modelId}". Allowed: ${Object.keys(this.models).join(', ')}`);
    }

    const config = {
      model: modelId,
      safetySettings: options.safetySettings || DEFAULT_SAFETY_SETTINGS,
    };

    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }

    if (options.tools) {
      config.tools = options.tools;
    }

    return this.genAI.getGenerativeModel(config);
  }

  /**
   * Generate a non-streaming text response
   */
  async generateText(modelId, prompt, options = {}) {
    const model = this.createModel(modelId, {
      systemInstruction: options.persona
        ? this.getPersona(options.persona)
        : this.personas.default,
      ...options,
    });

    const generationConfig = {
      temperature: options.temperature ?? 0.7,
      topP: options.topP ?? 0.95,
      topK: options.topK ?? 40,
      maxOutputTokens: options.maxTokens ?? this.models[modelId].maxTokens,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    return {
      text: response.text(),
      usage: response.usageMetadata || null,
      finishReason: response.candidates?.[0]?.finishReason || 'UNKNOWN',
    };
  }

  /**
   * Generate a streaming text response (returns async generator)
   */
  async *generateStream(modelId, messages, options = {}) {
    const model = this.createModel(modelId, {
      systemInstruction: options.persona
        ? this.getPersona(options.persona)
        : this.personas.default,
      ...options,
    });

    const generationConfig = {
      temperature: options.temperature ?? 0.7,
      topP: options.topP ?? 0.95,
      topK: options.topK ?? 40,
      maxOutputTokens: options.maxTokens ?? this.models[modelId].maxTokens,
    };

    // Convert messages to Gemini format
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: msg.parts || [{ text: msg.content || msg.text || '' }],
    }));

    const result = await model.generateContentStream({
      contents,
      generationConfig,
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield { type: 'text', content: text };
      }
    }

    // Final aggregated response metadata
    const aggregated = await result.response;
    yield {
      type: 'done',
      usage: aggregated.usageMetadata || null,
      finishReason: aggregated.candidates?.[0]?.finishReason || 'STOP',
    };
  }

  /**
   * Chat with conversation history (non-streaming)
   */
  async chat(modelId, messages, options = {}) {
    const model = this.createModel(modelId, {
      systemInstruction: options.persona
        ? this.getPersona(options.persona)
        : this.personas.default,
      ...options,
    });

    const generationConfig = {
      temperature: options.temperature ?? 0.7,
      topP: options.topP ?? 0.95,
      topK: options.topK ?? 40,
      maxOutputTokens: options.maxTokens ?? this.models[modelId].maxTokens,
    };

    // Separate history from the last user message
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: msg.parts || [{ text: msg.content || msg.text || '' }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history,
      generationConfig,
    });

    const result = await chat.sendMessage(
      lastMessage.parts || [{ text: lastMessage.content || lastMessage.text || '' }]
    );

    return {
      text: result.response.text(),
      usage: result.response.usageMetadata || null,
      finishReason: result.response.candidates?.[0]?.finishReason || 'UNKNOWN',
    };
  }

  /**
   * Function calling — send a message and process tool calls
   */
  async callWithTools(modelId, prompt, options = {}) {
    const toolDeclarations = this.tools.map((tool) => ({
      functionDeclarations: [{
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      }],
    }));

    const model = this.createModel(modelId, {
      systemInstruction: options.persona
        ? this.getPersona(options.persona)
        : this.personas.default,
      tools: toolDeclarations,
      ...options,
    });

    const generationConfig = {
      temperature: options.temperature ?? 0.3, // Lower temperature for tool calls
      topP: options.topP ?? 0.95,
      maxOutputTokens: options.maxTokens ?? this.models[modelId].maxTokens,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    const candidate = response.candidates?.[0];

    if (!candidate) {
      return { text: 'No response generated.', toolCalls: [], toolResults: [] };
    }

    // Check for function calls
    const functionCalls = candidate.content?.parts?.filter((p) => p.functionCall) || [];

    if (functionCalls.length === 0) {
      return {
        text: response.text(),
        toolCalls: [],
        toolResults: [],
        usage: response.usageMetadata || null,
      };
    }

    // Execute tool calls
    const toolResults = [];
    for (const part of functionCalls) {
      const { name, args } = part.functionCall;
      const handler = this.toolHandlers[name];
      if (handler) {
        try {
          const result = await handler(args);
          toolResults.push({ name, args, result, status: 'success' });
        } catch (err) {
          toolResults.push({ name, args, result: { error: err.message }, status: 'error' });
        }
      } else {
        toolResults.push({ name, args, result: { error: `Unknown tool: ${name}` }, status: 'error' });
      }
    }

    // Send tool results back to model for final response
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: candidate.content.parts },
      ],
      generationConfig,
    });

    const functionResponses = toolResults.map((tr) => ({
      functionResponse: {
        name: tr.name,
        response: tr.result,
      },
    }));

    const finalResult = await chat.sendMessage(functionResponses);

    return {
      text: finalResult.response.text(),
      toolCalls: functionCalls.map((fc) => ({ name: fc.functionCall.name, args: fc.functionCall.args })),
      toolResults,
      usage: finalResult.response.usageMetadata || null,
    };
  }

  /**
   * Analyze an image with text prompt (multimodal / vision)
   */
  async analyzeImage(modelId, imageData, prompt, options = {}) {
    const model = this.createModel(modelId, {
      systemInstruction: options.persona
        ? this.getPersona(options.persona)
        : this.personas.default,
      ...options,
    });

    const generationConfig = {
      temperature: options.temperature ?? 0.4,
      topP: options.topP ?? 0.95,
      maxOutputTokens: options.maxTokens ?? this.models[modelId].maxTokens,
    };

    // imageData should be { mimeType: 'image/jpeg', data: '<base64>' }
    const parts = [
      { text: prompt || 'Describe this image in detail.' },
      {
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        },
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig,
    });

    return {
      text: result.response.text(),
      usage: result.response.usageMetadata || null,
      finishReason: result.response.candidates?.[0]?.finishReason || 'UNKNOWN',
    };
  }

  /**
   * Count tokens for a given text
   */
  async countTokens(modelId, text) {
    const model = this.genAI.getGenerativeModel({ model: modelId });
    const result = await model.countTokens(text);
    return result;
  }
}

// ─── Singleton Factory ───────────────────────────────────────────────────────
let serviceInstance = null;

function getGeminiService(apiKey) {
  const key = apiKey || process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_AI_API_KEY environment variable is required');
  }
  if (!serviceInstance) {
    serviceInstance = new GeminiLLMService(key);
  }
  return serviceInstance;
}

module.exports = {
  GeminiLLMService,
  getGeminiService,
  MODELS,
  PERSONAS,
  GOAT_TOOLS,
  GOAT_SYSTEM_INSTRUCTION,
  DEFAULT_SAFETY_SETTINGS,
};