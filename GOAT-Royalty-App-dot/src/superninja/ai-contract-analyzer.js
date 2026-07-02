/**
 * AI LEGAL CONTRACT ANALYZER
 * Intelligent contract analysis and recommendations
 * Created by SuperNinja - NinjaTech AI
 */

const { EventEmitter } = require('events');

class AIContractAnalyzer extends EventEmitter {
  constructor(goatBrain) {
    super();
    this.goatBrain = goatBrain;
    this.contractHistory = [];
    this.legalTemplates = new Map();
    this.riskCategories = new Map();
    this.isAnalyzing = false;
  }

  /**
   * Initialize AI Contract Analyzer
   */
  async initialize() {
    console.log('⚖️ AI Contract Analyzer initializing...');
    
    // Load legal templates
    await this.loadLegalTemplates();
    
    // Load risk categories
    await this.loadRiskCategories();
    
    console.log('✅ AI Contract Analyzer ready');
  }

  /**
   * Load legal templates
   */
  async loadLegalTemplates() {
    const templates = [
      {
        id: 'standard-recording',
        name: 'Standard Recording Agreement',
        type: 'recording',
        keyClauses: [
          'term',
          'territory',
          'royalty-rate',
          'advances',
          'ownership',
          'delivery-commitments'
        ],
        standardRoyaltyRange: { min: 12, max: 20 },
        recommendedTerm: '3-5 years',
        territory: 'worldwide'
      },
      {
        id: 'publishing',
        name: 'Publishing Agreement',
        type: 'publishing',
        keyClauses: [
          'ownership-split',
          'administration',
          'collection',
          'synchronization-rights',
          'term',
          'reversion'
        ],
        standardSplit: { writer: 75, publisher: 25 },
        recommendedTerm: '3-5 years with reversion',
        territory: 'worldwide'
      },
      {
        id: 'distribution',
        name: 'Distribution Agreement',
        type: 'distribution',
        keyClauses: [
          'distribution-fees',
          'territory',
          'payment-terms',
          'reporting',
          'termination',
          'marketing-commitments'
        ],
        standardFeeRange: { min: 15, max: 25 },
        recommendedTerm: '1-3 years',
        territory: 'worldwide or regional'
      },
      {
        id: 'sync-licensing',
        name: 'Synchronization License',
        type: 'sync',
        keyClauses: [
          'license-fee',
          'usage-rights',
          'territory',
          'term',
          'exclusivity',
          'credit'
        ],
        standardFeeRange: { min: 1000, max: 50000 },
        recommendedTerm: 'perpetual or 3-5 years',
        territory: 'worldwide or specific'
      },
      {
        id: 'performance-rights',
        name: 'Performance Rights Agreement',
        type: 'performance',
        keyClauses: [
          'performance-royalties',
          'collection-rights',
          'territory',
          'reporting',
          'payment-schedule'
        ],
        standardRate: 'performance society rates',
        recommendedTerm: 'ongoing',
        territory: 'worldwide'
      },
      {
        id: 'producer-agreement',
        name: 'Producer Agreement',
        type: 'producer',
        keyClauses: [
          'producer-fee',
          'royalty-share',
          'credit',
          'delivery',
          'ownership',
          'recoupment'
        ],
        standardRoyaltyRange: { min: 2, max: 5 },
        recommendedTerm: 'per track or album',
        territory: 'worldwide'
      },
      {
        id: 'management',
        name: 'Management Agreement',
        type: 'management',
        keyClauses: [
          'commission-rate',
          'term',
          'territory',
          'exclusive-representation',
          'duties',
          'termination'
        ],
        standardCommission: { min: 15, max: 25 },
        recommendedTerm: '1-3 years',
        territory: 'worldwide'
      },
      {
        id: 'licensing',
        name: 'Music Licensing Agreement',
        type: 'licensing',
        keyClauses: [
          'license-type',
          'fee',
          'usage-rights',
          'territory',
          'term',
          'exclusivity'
        ],
        standardFeeRange: { min: 500, max: 25000 },
        recommendedTerm: '1-5 years',
        territory: 'as specified'
      }
    ];
    
    for (const template of templates) {
      this.legalTemplates.set(template.id, template);
    }
  }

  /**
   * Load risk categories
   */
  async loadRiskCategories() {
    const categories = [
      {
        id: 'financial-risk',
        name: 'Financial Risk',
        severity: 'high',
        indicators: [
          'unfavorable royalty rates',
          'high advances with difficult recoupment',
          'unclear payment terms',
          'hidden fees',
          'unreasonable expenses'
        ],
        recommendations: [
          'Negotiate higher royalty rates',
          'Clarify recoupment terms',
          'Define expense caps',
          'Establish payment schedule'
        ]
      },
      {
        id: 'ownership-risk',
        name: 'Ownership Risk',
        severity: 'critical',
        indicators: [
          'work-for-hire language',
          'master ownership transfer',
          'copyright assignment',
          'lack of reversion rights',
          'perpetual licenses'
        ],
        recommendations: [
          'Maintain copyright ownership',
          'Negotiate license instead of assignment',
          'Include reversion clauses',
          'Define usage limitations'
        ]
      },
      {
        id: 'term-risk',
        name: 'Term Risk',
        severity: 'medium',
        indicators: [
          'excessively long terms',
          'automatic renewals',
          'difficult termination',
          'lack of exit clauses',
          'perpetual agreements'
        ],
        recommendations: [
          'Negotiate shorter terms',
          'Include termination rights',
          'Add performance milestones',
          'Define renewal conditions'
        ]
      },
      {
        id: 'territory-risk',
        name: 'Territory Risk',
        severity: 'medium',
        indicators: [
          'overly broad territories',
          'unrestricted global rights',
          'lack of territorial limitations',
          'worldwide exclusivity'
        ],
        recommendations: [
          'Limit territories to relevant markets',
          'Negotiate regional rights separately',
          'Include territorial opt-outs'
        ]
      },
      {
        id: 'exclusivity-risk',
        name: 'Exclusivity Risk',
        severity: 'high',
        indicators: [
          'broad exclusive rights',
          'restriction on other opportunities',
          'non-compete clauses',
          'exclusive representation'
        ],
        recommendations: [
          'Limit exclusivity scope',
          'Define non-exclusive alternatives',
          'Include carve-outs for specific projects'
        ]
      },
      {
        id: 'performance-risk',
        name: 'Performance Risk',
        severity: 'medium',
        indicators: [
          'unclear delivery requirements',
          'unrealistic commitments',
          'vague performance obligations',
          'lack of minimum guarantees'
        ],
        recommendations: [
          'Define clear deliverables',
          'Establish realistic milestones',
          'Include minimum guarantees'
        ]
      },
      {
        id: 'control-risk',
        name: 'Control Risk',
        severity: 'high',
        indicators: [
          'creative control limitations',
          'approval right restrictions',
          'decision-making authority',
          'approval process delays'
        ],
        recommendations: [
          'Maintain creative control',
          'Define approval timelines',
          'Include consultation rights'
        ]
      }
    ];
    
    for (const category of categories) {
      this.riskCategories.set(category.id, category);
    }
  }

  /**
   * Analyze contract
   */
  async analyzeContract(contractData) {
    if (this.isAnalyzing) {
      throw new Error('Already analyzing');
    }
    
    this.isAnalyzing = true;
    
    const analysis = {
      id: this.generateAnalysisId(),
      contractData: contractData,
      status: 'parsing',
      createdAt: Date.now(),
      stages: []
    };
    
    this.emit('analysis-started', analysis);
    
    try {
      // Stage 1: Parse contract text
      await this.runAnalysisStage(analysis, 'parsing', 'Parsing contract document', async () => {
        return await this.parseContract(contractData);
      });
      
      // Stage 2: Identify contract type
      await this.runAnalysisStage(analysis, 'identification', 'Identifying contract type', async () => {
        return await this.identifyContractType(contractData);
      });
      
      // Stage 3: Extract key clauses
      await this.runAnalysisStage(analysis, 'extraction', 'Extracting key clauses', async () => {
        return await this.extractClauses(contractData);
      });
      
      // Stage 4: Analyze risks
      await this.runAnalysisStage(analysis, 'risk-analysis', 'Analyzing contractual risks', async () => {
        return await this.analyzeRisks(contractData);
      });
      
      // Stage 5: Compare with standards
      await this.runAnalysisStage(analysis, 'comparison', 'Comparing with industry standards', async () => {
        return await this.compareWithStandards(contractData);
      });
      
      // Stage 6: Generate recommendations
      await this.runAnalysisStage(analysis, 'recommendations', 'Generating recommendations', async () => {
        return await this.generateRecommendations(contractData);
      });
      
      analysis.status = 'completed';
      analysis.completedAt = Date.now();
      
      this.contractHistory.push(analysis);
      this.emit('analysis-completed', analysis);
      
      console.log('⚖️ Contract analysis completed successfully!');
      
      return analysis;
      
    } catch (error) {
      analysis.status = 'failed';
      analysis.error = error.message;
      analysis.failedAt = Date.now();
      
      this.emit('analysis-failed', analysis);
      
      throw error;
      
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Run analysis stage
   */
  async runAnalysisStage(analysis, stageName, description, stageFunction) {
    console.log(`🎯 ${description}...`);
    
    const stage = {
      name: stageName,
      description: description,
      status: 'running',
      startedAt: Date.now()
    };
    
    analysis.stages.push(stage);
    this.emit('stage-started', { analysis, stage });
    
    try {
      const result = await stageFunction();
      
      stage.status = 'completed';
      stage.result = result;
      stage.completedAt = Date.now();
      
      this.emit('stage-completed', { analysis, stage });
      
      return result;
      
    } catch (error) {
      stage.status = 'failed';
      stage.error = error.message;
      stage.completedAt = Date.now();
      
      this.emit('stage-failed', { analysis, stage });
      
      throw error;
    }
  }

  /**
   * Parse contract
   */
  async parseContract(contractData) {
    const parsing = {
      text: contractData.text || '',
      metadata: {
        pages: contractData.pages || 1,
        wordCount: (contractData.text || '').split(/\s+/).length,
        dateDetected: this.detectDate(contractData.text),
        partiesDetected: this.detectParties(contractData.text)
      },
      structure: {
        sections: this.identifySections(contractData.text),
        clauses: this.identifyClauses(contractData.text)
      }
    };
    
    // Use GOAT Brain for AI parsing if available
    if (this.goatBrain) {
      const prompt = `Parse this contract and identify the main sections, key clauses, and parties involved:\n\n${contractData.text}`;
      
      try {
        const aiResponse = await this.goatBrain.generateResponse(prompt, {
          mode: 'specialist',
          provider: 'openai'
        });
        
        parsing.aiInsights = aiResponse;
      } catch (error) {
        console.warn('⚠️ Could not get AI parsing:', error.message);
      }
    }
    
    return parsing;
  }

  /**
   * Identify contract type
   */
  async identifyContractType(contractData) {
    const text = (contractData.text || '').toLowerCase();
    
    const typeMatches = [
      { type: 'recording', keywords: ['recording', 'master', 'artist', 'label'] },
      { type: 'publishing', keywords: ['publishing', 'copyright', 'writer', 'composition'] },
      { type: 'distribution', keywords: ['distribution', 'distributor', 'platform'] },
      { type: 'sync', keywords: ['synchronization', 'sync', 'film', 'tv', 'visual'] },
      { type: 'performance', keywords: ['performance', 'public', 'broadcasting'] },
      { type: 'producer', keywords: ['producer', 'production', 'beats', 'instrumental'] },
      { type: 'management', keywords: ['management', 'manager', 'representation'] },
      { type: 'licensing', keywords: ['license', 'licensing', 'permission'] }
    ];
    
    let bestMatch = null;
    let highestScore = 0;
    
    for (const match of typeMatches) {
      const score = match.keywords.reduce((sum, keyword) => {
        return sum + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = match.type;
      }
    }
    
    return {
      detectedType: bestMatch || 'unknown',
      confidence: Math.min(highestScore * 20, 100),
      template: bestMatch ? this.legalTemplates.get(bestMatch) : null
    };
  }

  /**
   * Extract key clauses
   */
  async extractClauses(contractData) {
    const text = contractData.text || '';
    const clauses = [];
    
    // Common clause patterns
    const clausePatterns = [
      { name: 'Term', regex: /term\s+of\s+this\s+agreement/i },
      { name: 'Territory', regex: /territory|territories/i },
      { name: 'Royalty Rate', regex: /royalty|royalties/i },
      { name: 'Advances', regex: /advance|advances/i },
      { name: 'Ownership', regex: /ownership|master|copyright/i },
      { name: 'Delivery', regex: /delivery|deliverables/i },
      { name: 'Payment Terms', regex: /payment|payable/i },
      { name: 'Termination', regex: /termination|terminate/i },
      { name: 'Exclusivity', regex: /exclusive|exclusivity/i },
      { name: 'Credit', regex: /credit|crediting/i }
    ];
    
    for (const pattern of clausePatterns) {
      const matches = text.match(pattern.regex);
      if (matches) {
        clauses.push({
          name: pattern.name,
          found: true,
          context: this.extractClauseContext(text, pattern.name)
        });
      }
    }
    
    return clauses;
  }

  /**
   * Extract clause context
   */
  extractClauseContext(text, clauseName) {
    const lines = text.split('\n');
    const context = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(clauseName.toLowerCase())) {
        // Get surrounding lines
        const start = Math.max(0, i - 1);
        const end = Math.min(lines.length, i + 3);
        context.push(lines.slice(start, end).join('\n'));
      }
    }
    
    return context.join('\n---\n');
  }

  /**
   * Analyze risks
   */
  async analyzeRisks(contractData) {
    const risks = {
      overallRisk: 'medium',
      flaggedItems: [],
      riskCategories: []
    };
    
    const text = (contractData.text || '').toLowerCase();
    
    // Analyze each risk category
    for (const [categoryId, category] of this.riskCategories) {
      const categoryRisks = {
        category: category.name,
        severity: category.severity,
        found: [],
        riskLevel: 'low'
      };
      
      for (const indicator of category.indicators) {
        if (text.includes(indicator.toLowerCase())) {
          categoryRisks.found.push(indicator);
        }
      }
      
      // Determine risk level based on findings
      if (categoryRisks.found.length > 2) {
        categoryRisks.riskLevel = category.severity;
      } else if (categoryRisks.found.length > 0) {
        categoryRisks.riskLevel = 'medium';
      }
      
      if (categoryRisks.found.length > 0) {
        risks.riskCategories.push(categoryRisks);
        risks.flaggedItems.push({
          category: category.name,
          indicators: categoryRisks.found,
          severity: categoryRisks.riskLevel
        });
      }
    }
    
    // Determine overall risk
    const criticalRisks = risks.riskCategories.filter(r => r.riskLevel === 'critical').length;
    const highRisks = risks.riskCategories.filter(r => r.riskLevel === 'high').length;
    
    if (criticalRisks > 0) {
      risks.overallRisk = 'critical';
    } else if (highRisks > 0) {
      risks.overallRisk = 'high';
    }
    
    return risks;
  }

  /**
   * Compare with standards
   */
  async compareWithStandards(contractData) {
    const comparison = {
      templateMatch: null,
      deviations: [],
      favorableTerms: [],
      unfavorableTerms: []
    };
    
    // Get template for contract type
    const typeAnalysis = await this.identifyContractType(contractData);
    if (typeAnalysis.template) {
      comparison.templateMatch = typeAnalysis.template;
      
      // Compare key terms
      comparison.deviations = [
        {
          term: 'Royalty Rate',
          standard: `${typeAnalysis.template.standardRoyaltyRange.min}-${typeAnalysis.template.standardRoyaltyRange.max}%`,
          detected: 'Extracted from contract',
          status: 'needs-verification'
        },
        {
          term: 'Term',
          standard: typeAnalysis.template.recommendedTerm,
          detected: 'Extracted from contract',
          status: 'needs-verification'
        },
        {
          term: 'Territory',
          standard: typeAnalysis.template.territory,
          detected: 'Extracted from contract',
          status: 'needs-verification'
        }
      ];
    }
    
    return comparison;
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations(contractData) {
    const recommendations = {
      overall: [],
      clauseSpecific: [],
      negotiationPoints: [],
      legalReview: false
    };
    
    // Overall recommendations
    recommendations.overall = [
      'Review all flagged risk items carefully',
      'Consider legal consultation for critical risks',
      'Negotiate unfavorable terms',
      'Document all agreed changes'
    ];
    
    // Clause-specific recommendations based on risks
    const riskAnalysis = await this.analyzeRisks(contractData);
    for (const risk of riskAnalysis.riskCategories) {
      const category = this.riskCategories.get(risk.category.replace(' Risk', '').replace(' ', '-').toLowerCase());
      if (category) {
        recommendations.clauseSpecific.push({
          category: risk.category,
          recommendations: category.recommendations
        });
      }
    }
    
    // Negotiation points
    recommendations.negotiationPoints = [
      'Royalty rates and payment terms',
      'Term length and renewal options',
      'Territory and exclusivity',
      'Ownership and reversion rights',
      'Performance obligations'
    ];
    
    // Legal review recommendation
    if (riskAnalysis.overallRisk === 'critical' || riskAnalysis.overallRisk === 'high') {
      recommendations.legalReview = true;
    }
    
    return recommendations;
  }

  /**
   * Detect date in contract
   */
  detectDate(text) {
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i;
    const match = text.match(datePattern);
    return match ? match[0] : null;
  }

  /**
   * Detect parties in contract
   */
  detectParties(text) {
    const partyPattern = /(?:between|by|and)\s+([A-Z][A-Za-z\s]+(?:Inc\.|LLC|Corp\.|Ltd\.|Company)?)/g;
    const matches = text.match(partyPattern);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Identify sections in contract
   */
  identifySections(text) {
    const sectionPattern = /^\s*(\d+\.?\s*[A-Z][^.]+)$/gm;
    const matches = text.match(sectionPattern);
    return matches ? matches.map(m => m.trim()) : [];
  }

  /**
   * Identify clauses in contract
   */
  identifyClauses(text) {
    const clausePattern = /^\s*(\d+\.\d+\.?\s+[A-Z][^.]+)$/gm;
    const matches = text.match(clausePattern);
    return matches ? matches.map(m => m.trim()) : [];
  }

  /**
   * Get analysis history
   */
  getAnalysisHistory(limit = 10) {
    return this.contractHistory.slice(-limit);
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Array.from(this.legalTemplates.values());
  }

  /**
   * Get risk categories
   */
  getRiskCategories() {
    return Array.from(this.riskCategories.values());
  }

  /**
   * Generate unique analysis ID
   */
  generateAnalysisId() {
    return `anal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIContractAnalyzer;
}