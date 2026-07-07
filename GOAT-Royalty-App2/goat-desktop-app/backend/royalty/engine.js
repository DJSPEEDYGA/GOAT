/**
 * Royalty Calculation Engine
 * Core engine for royalty calculations and payment processing
 */

class RoyaltyEngine {
  constructor() {
    this.rates = {
      streaming: {
        spotify: { perStream: 0.0035, name: 'Spotify' },
        apple: { perStream: 0.007, name: 'Apple Music' },
        youtube: { perStream: 0.002, name: 'YouTube Music' },
        amazon: { perStream: 0.004, name: 'Amazon Music' },
        tidal: { perStream: 0.0125, name: 'Tidal' },
        deezer: { perStream: 0.006, name: 'Deezer' },
        soundcloud: { perStream: 0.0025, name: 'SoundCloud' },
        pandora: { perStream: 0.0013, name: 'Pandora' }
      },
      download: {
        iTunes: { percentage: 0.70, name: 'iTunes' },
        amazonMP3: { percentage: 0.70, name: 'Amazon MP3' },
        googlePlay: { percentage: 0.70, name: 'Google Play' },
        beatport: { percentage: 0.50, name: 'Beatport' }
      },
      sync: { percentage: 0.50 },
      performance: { percentage: 0.50 },
      mechanical: { rate: 0.091, name: 'US Mechanical Royalty' }
    };

    this.cache = new Map();
  }

  /**
   * Calculate streaming royalties
   */
  calculateStreaming(platform, streams, ownershipPercentage = 1) {
    const platformRate = this.rates.streaming[platform];
    if (!platformRate) {
      throw new Error(`Unknown platform: ${platform}`);
    }
    return streams * platformRate.perStream * ownershipPercentage;
  }

  /**
   * Calculate download royalties
   */
  calculateDownload(platform, units, price, ownershipPercentage = 1) {
    const platformRate = this.rates.download[platform];
    if (!platformRate) {
      return units * price * 0.70 * ownershipPercentage;
    }
    return units * price * platformRate.percentage * ownershipPercentage;
  }

  /**
   * Full royalty calculation for a work
   */
  async calculate(params) {
    const {
      workId,
      streams = {},
      downloads = {},
      syncLicenses = [],
      ownershipPercentage = 1,
      splitAgreement = []
    } = params;

    const results = {
      workId,
      totalRevenue: 0,
      breakdown: {
        streaming: { total: 0, details: [] },
        downloads: { total: 0, details: [] },
        sync: { total: 0, details: [] },
        other: { total: 0, details: [] }
      },
      splits: [],
      calculatedAt: new Date().toISOString()
    };

    // Calculate streaming revenue
    for (const [platform, streamCount] of Object.entries(streams)) {
      const revenue = this.calculateStreaming(platform, streamCount, ownershipPercentage);
      results.breakdown.streaming.total += revenue;
      results.breakdown.streaming.details.push({
        platform: this.rates.streaming[platform]?.name || platform,
        streams: streamCount,
        rate: this.rates.streaming[platform]?.perStream || 0.003,
        revenue: revenue.toFixed(4)
      });
    }

    // Calculate download revenue
    for (const [platform, data] of Object.entries(downloads)) {
      const { units, price } = data;
      const revenue = this.calculateDownload(platform, units, price, ownershipPercentage);
      results.breakdown.downloads.total += revenue;
      results.breakdown.downloads.details.push({
        platform: this.rates.download[platform]?.name || platform,
        units,
        price,
        revenue: revenue.toFixed(4)
      });
    }

    // Calculate sync revenue
    for (const sync of syncLicenses) {
      const revenue = sync.fee * this.rates.sync.percentage * ownershipPercentage;
      results.breakdown.sync.total += revenue;
      results.breakdown.sync.details.push({
        project: sync.project,
        fee: sync.fee,
        revenue: revenue.toFixed(4)
      });
    }

    // Calculate total
    results.totalRevenue = 
      results.breakdown.streaming.total + 
      results.breakdown.downloads.total + 
      results.breakdown.sync.total +
      results.breakdown.other.total;

    // Calculate splits
    if (splitAgreement.length > 0) {
      for (const party of splitAgreement) {
        results.splits.push({
          name: party.name,
          role: party.role,
          percentage: party.percentage,
          amount: (results.totalRevenue * party.percentage / 100).toFixed(4)
        });
      }
    }

    return results;
  }

  /**
   * Generate royalty statement
   */
  generateStatement(data, period) {
    return {
      id: `STMNT-${Date.now()}`,
      period,
      generatedAt: new Date().toISOString(),
      data,
      summary: {
        totalRevenue: data.totalRevenue?.toFixed(2) || '0.00',
        parties: data.splits?.length || 0,
        platforms: Object.keys(data.breakdown?.streaming?.details || {}).length
      }
    };
  }
}

module.exports = new RoyaltyEngine();