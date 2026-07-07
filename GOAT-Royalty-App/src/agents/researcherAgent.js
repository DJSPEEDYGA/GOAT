/**
 * Researcher Agent
 * 
 * Specialized in:
 * - Web search and information gathering
 * - Data analysis and synthesis
 * - Fact-checking and verification
 * - Research planning and execution
 */

const BaseAgent = require('./baseAgent');

class ResearcherAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.capabilities = [
      'web_search',
      'data_analysis',
      'fact_checking',
      'research_planning',
      'information_synthesis',
      'source_verification',
      'trend_analysis'
    ];
  }

  getSystemPrompt() {
    return `You are ${this.name}, an expert Researcher Agent with exceptional skills in information gathering, data analysis, and research synthesis.

Your capabilities include:
- Conducting comprehensive web searches
- Analyzing and synthesizing data from multiple sources
- Fact-checking and verifying information
- Planning and executing research strategies
- Identifying trends and patterns
- Evaluating source credibility

When conducting research:
1. Start by understanding the research question clearly
2. Develop a systematic research approach
3. Gather information from diverse, credible sources
4. Analyze and synthesize findings
5. Present clear, well-supported conclusions
6. Always cite your sources

Be thorough, methodical, and objective in your research. When information is uncertain or contradictory, acknowledge the limitations and seek additional verification.`;
  }

  async processTask(task, context, options) {
    const { type, query, parameters = {} } = task;

    switch (type) {
      case 'web_search':
        return await this.webSearch(query, parameters);
      case 'data_analysis':
        return await this.dataAnalysis(query, parameters);
      case 'fact_check':
        return await this.factCheck(query, parameters);
      case 'research_plan':
        return await this.createResearchPlan(query, parameters);
      case 'trend_analysis':
        return await this.trendAnalysis(query, parameters);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  async webSearch(query, parameters = {}) {
    const prompt = `Conduct a comprehensive web search for: "${query}"

Parameters:
- Depth: ${parameters.depth || 'standard'}
- Timeframe: ${parameters.timeframe || 'all time'}
- Sources: ${parameters.sources || 'all'}

Please provide:
1. Key findings and insights
2. Relevant sources with URLs
3. Summary of information
4. Additional related topics to explore`;

    const response = await this.generateResponse(prompt, {
      includeHistory: true,
      ...parameters.options
    });

    return {
      type: 'web_search',
      query,
      findings: response,
      timestamp: Date.now()
    };
  }

  async dataAnalysis(query, parameters = {}) {
    const data = parameters.data || context?.ragContext;
    
    const prompt = `Analyze the following data related to: "${query}"

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Key trends and patterns
2. Statistical insights
3. Correlations and relationships
4. Actionable recommendations
5. Limitations and caveats`;

    const response = await this.generateResponse(prompt, {
      includeHistory: true,
      ...parameters.options
    });

    return {
      type: 'data_analysis',
      query,
      analysis: response,
      timestamp: Date.now()
    };
  }

  async factCheck(query, parameters = {}) {
    const prompt = `Fact-check the following claim or statement: "${query}"

Please provide:
1. Verdict (True, False, Partially True, Uncertain)
2. Evidence supporting your verdict
3. Relevant sources and citations
4. Context and nuance
5. Counterarguments if applicable`;

    const response = await this.generateResponse(prompt, {
      includeHistory: true,
      ...parameters.options
    });

    return {
      type: 'fact_check',
      claim: query,
      verdict: response,
      timestamp: Date.now()
    };
  }

  async createResearchPlan(query, parameters = {}) {
    const prompt = `Create a comprehensive research plan for: "${query}"

Requirements:
- Budget: ${parameters.budget || 'flexible'}
- Timeline: ${parameters.timeline || 'flexible'}
- Depth: ${parameters.depth || 'comprehensive'}

Please provide:
1. Research objectives and questions
2. Methodology and approach
3. Required resources and tools
4. Timeline and milestones
5. Expected deliverables
6. Risk assessment and mitigation`;

    const response = await this.generateResponse(prompt, {
      includeHistory: true,
      ...parameters.options
    });

    return {
      type: 'research_plan',
      query,
      plan: response,
      timestamp: Date.now()
    };
  }

  async trendAnalysis(query, parameters = {}) {
    const prompt = `Conduct a trend analysis for: "${query}"

Timeframe: ${parameters.timeframe || 'past year'}
Industry: ${parameters.industry || 'general'}

Please provide:
1. Current trends
2. Emerging patterns
3. Historical evolution
4. Future predictions
5. Key drivers and factors
6. Implications and opportunities`;

    const response = await this.generateResponse(prompt, {
      includeHistory: true,
      ...parameters.options
    });

    return {
      type: 'trend_analysis',
      query,
      analysis: response,
      timestamp: Date.now()
    };
  }
}

module.exports = ResearcherAgent;