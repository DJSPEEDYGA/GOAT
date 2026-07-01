/**
 * GOAT Royalty App - Natural Language Processing (NLP) Module
 * 
 * Inspired by: ACCERN Corporation - Accern NLP Platform
 * 
 * Capabilities:
 * - Semantic search across all contracts
 * - Clause comparison and extraction
 * - Risk assessment
 * - Automatic red flag detection
 * - Contract template library
 * - Natural language queries
 */

const axios = require('axios');
const { EventEmitter } = require('events');

class NlpModule extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      ollamaUrl: config.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434',
      ollamaModel: config.ollamaModel || process.env.OLLAMA_MODEL || 'llama3.1:8b',
      embeddingModel: config.embeddingModel || 'qwen2.5:14b',
      timeout: config.timeout || 120000,
      maxResults: config.maxResults || 10,
      ...config
    };

    // Clause library
    this.clauseLibrary = new Map();
    this.riskIndicators = new Map();
    this.templates = new Map();

    // Initialize
    this.initialize();
  }

  /**
   * Initialize with standard clause types and risk indicators
   */
  initialize() {
    // Common clause types
    this.clauseLibrary.set('termination', {
      keywords: ['terminate', 'termination', 'end', 'expire', 'cancellation'],
      importance: 'high'
    });

    this.clauseLibrary.set('royalty', {
      keywords: ['royalty', 'royalties', 'percentage', 'rate', 'compensation'],
      importance: 'high'
    });

    this.clauseLibrary.set('territory', {
      keywords: ['territory', 'geographic', 'region', 'worldwide', 'exclusive'],
      importance: 'medium'
    });

    this.clauseLibrary.set('obligation', {
      keywords: ['shall', 'must', 'obligation', 'required', 'mandatory'],
      importance: 'high'
    });

    // Risk indicators
    this.riskIndicators.set('perpetuity', {
      description: 'Perpetual rights grant',
      severity: 'high',
      keywords: ['perpetual', 'forever', 'in perpetuity', 'irrevocable']
    });

    this.riskIndicators.set('workForHire', {
      description: 'Work for hire assignment',
      severity: 'medium',
      keywords: ['work for hire', 'work made for hire', 'assignment']
    });

    this.riskIndicators.set('broadLicense', {
      description: 'Excessively broad license',
      severity: 'high',
      keywords: ['all media', 'all forms', 'all uses', 'universal']
    });

    this.riskIndicators.set('unfairDeductions', {
      description: 'Unreasonable deductions',
      severity: 'medium',
      keywords: ['reserve', 'packaging', 'free goods', 'breakage']
    });

    console.log('🧠 NLP Module initialized');
    console.log(`   Loaded ${this.clauseLibrary.size} clause types`);
    console.log(`   Loaded ${this.riskIndicators.size} risk indicators`);
  }

  /**
   * Semantic search across contracts
   */
  async semanticSearch(query, contractDatabase = []) {
    try {
      this.emit('searching', { query });

      // Use local LLM for semantic understanding
      const prompt = `Convert this natural language query into a structured search for contract analysis:

Query: "${query}"

Return JSON format:
{
  "searchTerms": ["term1", "term2"],
  "clauseTypes": ["type1", "type2"],
  "concepts": ["concept1", "concept2"],
  "filters": {
    "startDate": "YYYY-MM-DD or null",
    "endDate": "YYYY-MM-DD or null",
    "contractTypes": ["type1"]
  }
}`;

      const response = await this.callOllama(prompt, { temperature: 0.3 });
      
      // Parse the structured search
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const searchStructure = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        searchTerms: [query],
        clauseTypes: [],
        concepts: [],
        filters: {}
      };

      // Search through contract database (simplified)
      const results = contractDatabase
        .filter(contract => this.matchesContract(contract, searchStructure))
        .slice(0, this.config.maxResults);

      this.emit('searchComplete', { query, results });
      return {
        query,
        searchStructure,
        results,
        totalResults: results.length
      };

    } catch (error) {
      console.error(`❌ Semantic search error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Match contract against search structure
   */
  matchesContract(contract, searchStructure) {
    const { searchTerms, clauseTypes } = searchStructure;
    const contractText = JSON.stringify(contract).toLowerCase();

    // Check search terms
    const matchesTerms = searchTerms.some(term => 
      contractText.includes(term.toLowerCase())
    );

    // Check clause types
    const matchesTypes = clauseTypes.some(type => 
      contract.contractType?.toLowerCase().includes(type.toLowerCase())
    );

    return matchesTerms || matchesTypes || searchTerms.length === 0;
  }

  /**
   * Extract clauses from contract text
   */
  async extractClauses(contractText, clauseTypes = []) {
    try {
      const typesToExtract = clauseTypes.length > 0 
        ? clauseTypes 
        : Array.from(this.clauseLibrary.keys());

      const results = {};

      for (const type of typesToExtract) {
        const clauseDef = this.clauseLibrary.get(type);
        if (!clauseDef) continue;

        const prompt = `Extract all ${type} clauses from this contract. Return as JSON array:

{
  "clauses": [
    {
      "type": "${type}",
      "text": "exact clause text",
      "startIndex": 0,
      "endIndex": 0,
      "importance": "${clauseDef.importance}"
    }
  ]
}

Contract text:
${contractText}`;

        const response = await this.callOllama(prompt, { temperature: 0.3 });
        
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            results[type] = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          results[type] = { clauses: [], error: 'Parsing failed' };
        }
      }

      return results;

    } catch (error) {
      console.error(`❌ Clause extraction error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Compare clauses between contracts
   */
  async compareClauses(contract1Text, contract2Text, clauseType = 'all') {
    try {
      const prompt = `Compare these two contract documents and highlight differences in their clauses:

${clauseType === 'all' ? 'Compare all clause types' : `Focus on ${clauseType} clauses`}

Contract 1:
${contract1Text.substring(0, 8000)}

Contract 2:
${contract2Text.substring(0, 8000)}

Return JSON:
{
  "similarities": ["similar aspect 1", "similar aspect 2"],
  "differences": [
    {
      "type": "clause type",
      "contract1": "text or value",
      "contract2": "text or value",
      "significance": "high/medium/low",
      "notes": "explanation"
    }
  ],
  "recommendation": "which terms are more favorable and why"
}`;

      const response = await this.callOllama(prompt, { temperature: 0.5 });
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const comparison = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        similarities: [],
        differences: [],
        recommendation: response
      };

      return comparison;

    } catch (error) {
      console.error(`❌ Clause comparison error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Assess contract risk
   */
  async assessRisk(contractText) {
    try {
      const prompt = `Analyze this music contract for risk factors. Rate each risk and provide remediation suggestions:

Risk categories to assess:
1. Financial risks (royalty rates, deductions, payment terms)
2. Legal risks (contract duration, termination rights)
3. Creative risks (creative control, approval rights)
4. Attribution risks (credit, name/image likeness)
5. Territory risks (geographic restrictions)

Contract text:
${contractText}

Return JSON:
{
  "overallRiskScore": 1-10,
  "risks": [
    {
      "category": "financial",
      "severity": "critical/high/medium/low",
      "risk": "description",
      "clauseReference": "relevant text",
      "impact": "potential consequences",
      "remediation": "how to mitigate"
    }
  ],
  "recommendedActions": ["action 1", "action 2"],
  "summary": "overall risk assessment"
}`;

      const response = await this.callOllama(prompt, { temperature: 0.4 });
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const assessment = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        overallRiskScore: 5,
        risks: [],
        recommendedActions: [],
        summary: response
      };

      this.emit('riskAssessed', assessment);
      return assessment;

    } catch (error) {
      console.error(`❌ Risk assessment error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect red flags in contract
   */
  async detectRedFlags(contractText) {
    try {
      const redFlags = [];
      const textLower = contractText.toLowerCase();

      // Check against known risk indicators
      for (const [key, indicator] of this.riskIndicators) {
        const matches = indicator.keywords.some(keyword => 
          textLower.includes(keyword.toLowerCase())
        );

        if (matches) {
          // Find the context around the match
          const context = this.findContext(contractText, indicator.keywords[0]);
          
          redFlags.push({
            type: key,
            severity: indicator.severity,
            description: indicator.description,
            detectedKeyword: indicator.keywords.find(kw => 
              textLower.includes(kw.toLowerCase())
            ),
            context: context,
            recommendation: this.getRecommendation(key)
          });
        }
      }

      // AI-powered detection
      const prompt = `Identify any additional red flags or concerning clauses in this contract that were not caught by keyword matching:

Contract text:
${contractText.substring(0, 10000)}

Return JSON:
{
  "additionalFlags": [
    {
      "type": "flag type",
      "severity": "critical/high/medium/low",
      "description": "issue description",
      "clauseText": "relevant text",
      "risk": "what makes this risky",
      "recommendation": "how to address"
    }
  ]
}`;

      const response = await this.callOllama(prompt, { temperature: 0.4 });
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiFlags = JSON.parse(jsonMatch[0]);
          redFlags.push(...(aiFlags.additionalFlags || []));
        }
      } catch (e) {}

      // Sort by severity
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      redFlags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      this.emit('redFlagsDetected', redFlags);
      return redFlags;

    } catch (error) {
      console.error(`❌ Red flag detection error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find context around a keyword
   */
  findContext(text, keyword, contextLength = 150) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + keyword.length + contextLength);
    
    return text.substring(start, end);
  }

  /**
   * Get recommendation for red flag type
   */
  getRecommendation(flagType) {
    const recommendations = {
      perpetuity: 'Consider limiting the grant to a specific term (e.g., 5-10 years)',
      workForHire: 'Ensure fair compensation and maintain some rights',
      broadLicense: 'Limit the license to specific, agreed-upon uses',
      unfairDeductions: 'Negotiate reasonable deduction percentages or caps'
    };
    
    return recommendations[flagType] || 'Review clause carefully and seek negotiation';
  }

  /**
   * Create contract template
   */
  async createTemplate(templateName, contractType, customClauses = {}) {
    try {
      const prompt = `Generate a fair and balanced ${contractType} contract template for the music industry.

Template name: ${templateName}

Include standard clauses for:
- Parties identification
- Term and termination
- Rights granted
- Compensation/royalties
- Territory
- Representations and warranties
- Indemnification
- Governing law

Custom clauses to include:
${JSON.stringify(customClauses)}

Generate the complete contract template.`;

      const template = await this.callOllama(prompt, { temperature: 0.7 });
      
      this.templates.set(templateName, {
        contractType,
        clauses: customClauses,
        template: template,
        createdAt: new Date()
      });

      this.emit('templateCreated', { templateName, contractType });
      
      return {
        templateName,
        contractType,
        template,
        id: `template_${Date.now()}`
      };

    } catch (error) {
      console.error(`❌ Template creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all templates
   */
  getTemplates() {
    return Array.from(this.templates.entries());
  }

  /**
   * Call local Ollama
   */
  async callOllama(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.config.ollamaUrl}/api/chat`, {
        model: this.config.ollamaModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert music industry contract analyst and lawyer. Analyze contracts, extract clauses, identify risks, and provide clear, actionable recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_ctx: 16384 // Larger context for contract analysis
        }
      }, {
        timeout: this.config.timeout
      });

      return response.data.message?.content || '';

    } catch (error) {
      console.error('❌ Ollama API error:', error.message);
      throw new Error('Failed to process with local AI');
    }
  }
}

module.exports = NlpModule;