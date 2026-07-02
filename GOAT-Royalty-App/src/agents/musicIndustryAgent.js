/**
 * Music Industry Agent
 * Specialized in music business, royalties, entertainment law, and industry trends
 * Perfect for managing music catalogs, royalty tracking, and industry partnerships
 */

const BaseAgent = require('./baseAgent');

class MusicIndustryAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.name = config.name || 'Music Industry Expert';
    this.capabilities = [
      'royalty_calculations',
      'music_law_compliance',
      'catalog_management',
      'licensing_negotiations',
      'trend_analysis',
      'contract_review',
      'distribution_strategy',
      'performance_rights_management'
    ];
  }

  getSystemPrompt() {
    return `You are ${this.name}, an expert music industry agent specializing in:
    - Music royalty calculations and tracking
    - Entertainment law and compliance
    - Music catalog management and monetization
    - Licensing negotiations and deals
    - Industry trend analysis and market intelligence
    - Contract review and artist agreements
    - Distribution strategies across platforms
    - Performance rights organization management

    You have deep knowledge of PROs (ASCAP, BMI, SESAC), digital distributors, 
    streaming platforms, music publishing, and the current state of the music business.
    You provide strategic advice for maximizing revenue and protecting intellectual property.`;
  }

  async processTask(task, context, options) {
    const { type, data } = task;

    switch (type) {
      case 'calculate_royalties':
        return await this.calculateRoyalties(data, context);
      case 'review_contract':
        return await this.reviewContract(data, context);
      case 'analyze_trends':
        return await this.analyzeIndustryTrends(data, context);
      case 'manage_catalog':
        return await this.manageCatalog(data, context);
      case 'negotiate_license':
        return await this.negotiateLicense(data, context);
      default:
        return await this.generateResponse(
          `As a music industry expert, help with this task: ${JSON.stringify(task)}`,
          options
        );
    }
  }

  async calculateRoyalties(data, context) {
    const prompt = `Calculate music royalties for the following scenario:
    - Streaming revenue: ${data.streamingRevenue || 'not specified'}
    - Physical sales: ${data.physicalSales || 'not specified'}
    - Licensing deals: ${data.licensingDeals || 'not specified'}
    - Performance royalties: ${data.performanceRoyalties || 'not specified'}
    - Song splits: ${JSON.stringify(data.splits || {})}
    - Territory: ${data.territory || 'global'}

    Provide a detailed breakdown including:
    1. Total projected revenue
    2. Distribution across rights holders
    3. PRO deductions
    4. Platform-specific rates
    5. Recommendations for optimization`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'royalty_calculation',
      analysis: response,
      timestamp: Date.now()
    };
  }

  async reviewContract(data, context) {
    const prompt = `Review this music contract/agreement:
    ${JSON.stringify(data.contract, null, 2)}

    Analyze for:
    1. Fairness of terms
    2. Rights granted and retained
    3. Payment structures and schedules
    4. Duration and termination clauses
    5. Potential risks or red flags
    6. Suggested improvements or negotiations
    7. Compliance with industry standards`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'contract_review',
      analysis: response,
      recommendations: response,
      timestamp: Date.now()
    };
  }

  async analyzeIndustryTrends(data, context) {
    const prompt = `Analyze current music industry trends focusing on:
    - Genre popularity and emerging sounds
    - Platform-specific trends (Spotify, TikTok, YouTube, etc.)
    - Revenue model changes
    - Artist development shifts
    - Technology impacts (AI, blockchain, etc.)
    - Market opportunities for ${data.focusArea || 'independent artists'}

    Provide actionable insights for strategic planning.`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'trend_analysis',
      insights: response,
      timestamp: Date.now()
    };
  }

  async manageCatalog(data, context) {
    const prompt = `Provide catalog management strategy for:
    - Total tracks: ${data.trackCount || 'various'}
    - Genres: ${data.genres || 'mixed'}
    - Current platforms: ${data.platforms || 'limited'}
    - Revenue goals: ${data.revenueGoals || 'maximize'}

    Include recommendations for:
    1. Platform optimization
    2. Release scheduling
    3. Cross-promotion opportunities
    4. Metadata optimization
    5. Rights management`;

    const response = await this.generateResponse(prompt);
    return {
      type: 'catalog_management',
      strategy: response,
      timestamp: Date.now()
    };
  }

  async negotiateLicense(data, context) {
    const prompt = `Prepare negotiation strategy for music licensing:
    - License type: ${data.licenseType || 'sync license'}
    - Usage: ${data.usage || 'not specified'}
    - Duration: ${data.duration || 'not specified'}
    - Territory: ${data.territory || 'not specified'}
    - Budget: ${data.budget || 'flexible'}

    Provide:
    1. Key negotiation points
    2. Pricing benchmarks
    3. Deal structure options
    4. Red lines and minimum requirements
    5. Counter-proposal strategies`;

    const response = await this.generateResponse(prompt, { useRAG: true });
    return {
      type: 'license_negotiation',
      strategy: response,
      timestamp: Date.now()
    };
  }

  extractQueryFromTask(task) {
    const keywords = {
      'calculate_royalties': 'music royalties streaming revenue splits',
      'review_contract': 'music contract terms agreement entertainment law',
      'analyze_trends': 'music industry trends platform analysis market',
      'manage_catalog': 'music catalog management distribution metadata',
      'negotiate_license': 'music licensing negotiation deal sync rights'
    };
    return keywords[task.type] || 'music industry business';
  }
}

module.exports = MusicIndustryAgent;