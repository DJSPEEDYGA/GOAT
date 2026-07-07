/**
 * Royalty Agent - Manages royalty calculations and payments
 * Specialized worker for royalty management tasks
 */

const BaseWorkerAgent = require('../base-worker');

class RoyaltyAgent extends BaseWorkerAgent {
  constructor() {
    super({
      name: 'Royalty Agent',
      capabilities: [
        'royalty-calculation',
        'payment-processing',
        'contract-management',
        'split-analysis',
        'revenue-tracking',
        'statement-generation'
      ]
    });
    
    this.royaltyRates = {
      streaming: {
        spotify: 0.0035,
        apple: 0.007,
        youtube: 0.002,
        amazon: 0.004,
        tidal: 0.0125,
        deezer: 0.006
      },
      download: 0.70, // 70% of retail price
      sync: 0.50, // 50% of sync fee
      performance: 0.50 // 50% of performance royalties
    };
  }

  async execute(task, params = {}) {
    this.status = 'processing';
    this.log(`Executing task: ${task}`);

    try {
      const taskLower = task.toLowerCase();
      let result;

      if (taskLower.includes('calculate') || taskLower.includes('compute')) {
        result = await this.calculateRoyalties(params);
      } else if (taskLower.includes('split') || taskLower.includes('divide')) {
        result = await this.calculateSplits(params);
      } else if (taskLower.includes('statement') || taskLower.includes('report')) {
        result = await this.generateStatement(params);
      } else if (taskLower.includes('fetch') || taskLower.includes('data')) {
        result = await this.fetchRoyaltyData(params);
      } else if (taskLower.includes('contract')) {
        result = await this.manageContract(params);
      } else {
        result = await this.generalRoyaltyTask(task, params);
      }

      this.status = 'ready';
      return {
        success: true,
        agent: this.name,
        task,
        result,
        timestamp: Date.now()
      };
    } catch (error) {
      this.status = 'error';
      this.log(`Error: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Calculate royalties based on streams, sales, and ownership
   */
  async calculateRoyalties(params) {
    const { streams, sales, ownership, platform } = params;
    
    const calculations = {
      streamingRevenue: 0,
      downloadRevenue: 0,
      totalRevenue: 0,
      breakdown: []
    };

    // Calculate streaming revenue
    if (streams) {
      for (const [platformName, streamCount] of Object.entries(streams)) {
        const rate = this.royaltyRates.streaming[platformName] || 0.003;
        const revenue = streamCount * rate * (ownership || 1);
        calculations.streamingRevenue += revenue;
        calculations.breakdown.push({
          platform: platformName,
          streams: streamCount,
          rate,
          revenue: revenue.toFixed(2)
        });
      }
    }

    // Calculate download revenue
    if (sales) {
      for (const [platformName, saleCount] of Object.entries(sales)) {
        const price = params.prices?.[platformName] || 0.99;
        const revenue = saleCount * price * this.royaltyRates.download * (ownership || 1);
        calculations.downloadRevenue += revenue;
        calculations.breakdown.push({
          platform: platformName,
          sales: saleCount,
          price,
          revenue: revenue.toFixed(2)
        });
      }
    }

    calculations.totalRevenue = calculations.streamingRevenue + calculations.downloadRevenue;

    return {
      summary: `Total royalties calculated: $${calculations.totalRevenue.toFixed(2)}`,
      calculations,
      recommendations: this.generateRecommendations(calculations)
    };
  }

  /**
   * Calculate splits among multiple parties
   */
  async calculateSplits(params) {
    const { parties, totalAmount, workId } = params;
    
    if (!parties || !Array.isArray(parties)) {
      throw new Error('Parties array is required for split calculation');
    }

    const splits = parties.map(party => ({
      name: party.name,
      role: party.role || 'Contributor',
      percentage: party.percentage,
      amount: (totalAmount * party.percentage / 100).toFixed(2),
      walletAddress: party.walletAddress || null
    }));

    const totalPercentage = parties.reduce((sum, p) => sum + p.percentage, 0);
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return {
        success: false,
        warning: `Split percentages sum to ${totalPercentage}%, not 100%`,
        splits,
        suggestedAdjustment: 100 - totalPercentage
      };
    }

    return {
      success: true,
      workId,
      totalAmount,
      splits,
      blockchainReady: splits.every(s => s.walletAddress),
      summary: `Calculated splits for ${parties.length} parties totaling $${totalAmount.toFixed(2)}`
    };
  }

  /**
   * Generate royalty statement
   */
  async generateStatement(params) {
    const { period, artist, works, transactions } = params;
    
    const statement = {
      id: `STMNT-${Date.now()}`,
      period: period || 'Current Period',
      artist: artist || 'Unknown Artist',
      generatedAt: new Date().toISOString(),
      works: works || [],
      transactions: transactions || [],
      totals: {
        grossRevenue: 0,
        deductions: 0,
        netRevenue: 0
      },
      status: 'generated'
    };

    // Calculate totals if transactions provided
    if (transactions) {
      statement.totals.grossRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      statement.totals.netRevenue = statement.totals.grossRevenue - statement.totals.deductions;
    }

    return {
      statement,
      summary: `Generated statement ${statement.id} for ${statement.artist}`,
      nextSteps: [
        'Review statement details',
        'Verify transaction accuracy',
        'Approve for payment processing',
        'Publish to blockchain for transparency'
      ]
    };
  }

  /**
   * Fetch royalty data from connected sources
   */
  async fetchRoyaltyData(params) {
    const { sources } = params;
    
    // Simulate data fetching from various sources
    const data = {
      spotify: { streams: 0, revenue: 0 },
      apple: { streams: 0, revenue: 0 },
      youtube: { streams: 0, revenue: 0 },
      amazon: { streams: 0, revenue: 0 },
      lastUpdated: new Date().toISOString()
    };

    return {
      success: true,
      data,
      summary: 'Royalty data fetched from all connected sources',
      recommendations: [
        'Connect additional DSP accounts for complete data',
        'Set up automated daily sync',
        'Enable real-time notifications for significant changes'
      ]
    };
  }

  /**
   * Manage contract information
   */
  async manageContract(params) {
    const { action, contract } = params;
    
    switch (action) {
      case 'create':
        return {
          success: true,
          contract: {
            id: `CTR-${Date.now()}`,
            ...contract,
            createdAt: new Date().toISOString(),
            status: 'draft'
          },
          summary: 'Contract created successfully'
        };
      case 'analyze':
        return {
          success: true,
          analysis: {
            fairnessScore: 75,
            concerns: ['Standard royalty rate', 'Reasonable term length'],
            suggestions: ['Consider performance escalators', 'Add reversion clause']
          }
        };
      default:
        return {
          success: true,
          message: 'Contract management ready'
        };
    }
  }

  /**
   * General royalty task handler
   */
  async generalRoyaltyTask(task, params) {
    return {
      success: true,
      message: `Processed royalty task: ${task}`,
      params,
      suggestions: [
        'Use "calculate" for royalty calculations',
        'Use "split" for payment distributions',
        'Use "statement" for report generation'
      ]
    };
  }

  /**
   * Generate recommendations based on calculations
   */
  generateRecommendations(calculations) {
    const recommendations = [];
    
    if (calculations.streamingRevenue > calculations.downloadRevenue * 10) {
      recommendations.push('Consider focusing on streaming promotion strategies');
    }
    
    if (calculations.totalRevenue < 100) {
      recommendations.push('Revenue is below threshold - consider promotional campaigns');
    }
    
    recommendations.push('Enable blockchain verification for transparent royalty tracking');
    recommendations.push('Set up automated split payments for efficiency');
    
    return recommendations;
  }
}

module.exports = RoyaltyAgent;