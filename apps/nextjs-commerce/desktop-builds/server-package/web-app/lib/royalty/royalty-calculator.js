/**
 * Royalty Calculator Module
 * Calculate and track royalties for music catalog
 */

const fs = require('fs');
const path = require('path');

// Royalty rates (typical industry rates)
const ROYALTY_RATES = {
    // Streaming rates per stream (average)
    spotify: 0.004,
    appleMusic: 0.008,
    youtube: 0.002,
    tidal: 0.012,
    amazon: 0.006,
    pandora: 0.0015,
    deezer: 0.005,
    soundcloud: 0.003,
    
    // Sync licensing (one-time fees)
    sync_tv: 15000,
    sync_film: 25000,
    sync_ad: 50000,
    sync_videogame: 20000,
    sync_trailer: 35000,
    
    // Mechanical royalties per unit
    mechanical_digital: 0.091,
    mechanical_physical: 0.091,
    
    // Performance royalties (per play on radio)
    radio_terrestrial: 0.00,
    radio_satellite: 0.0025,
    radio_internet: 0.0022
};

// Typical splits
const DEFAULT_SPLITS = {
    artist: 50,
    publisher: 50,
    songwriter: 50,
    label: 0,
    producer: 0
};

const RoyaltyCalculator = {
    rates: ROYALTY_RATES,
    
    /**
     * Calculate streaming royalties
     */
    calculateStreamingRoyalties(platform, streams, sharePercent = 100) {
        const rate = ROYALTY_RATES[platform] || 0.004;
        const grossRoyalty = streams * rate;
        const shareRoyalty = grossRoyalty * (sharePercent / 100);
        return {
            platform,
            streams,
            ratePerStream: rate,
            grossRoyalty: grossRoyalty.toFixed(2),
            sharePercent,
            netRoyalty: shareRoyalty.toFixed(2)
        };
    },
    
    /**
     * Calculate multi-platform streaming royalties
     */
    calculateAllStreamingRoyalties(streamingData, sharePercent = 100) {
        const results = [];
        let total = 0;
        
        Object.entries(streamingData).forEach(([platform, streams]) => {
            const calc = this.calculateStreamingRoyalties(platform, streams, sharePercent);
            results.push(calc);
            total += parseFloat(calc.netRoyalty);
        });
        
        return {
            platforms: results,
            totalRoyalties: total.toFixed(2),
            totalStreams: Object.values(streamingData).reduce((a, b) => a + b, 0)
        };
    },
    
    /**
     * Calculate sync placement fee
     */
    calculateSyncFee(type, durationSeconds, exclusive = false, sharePercent = 100) {
        const baseFee = ROYALTY_RATES[`sync_${type}`] || 15000;
        
        // Duration modifier
        let durationModifier = 1;
        if (durationSeconds <= 30) durationModifier = 0.5;
        else if (durationSeconds <= 60) durationModifier = 0.75;
        else if (durationSeconds <= 120) durationModifier = 1;
        else durationModifier = 1.5;
        
        // Exclusive modifier
        const exclusiveModifier = exclusive ? 2 : 1;
        
        const grossFee = baseFee * durationModifier * exclusiveModifier;
        const netFee = grossFee * (sharePercent / 100);
        
        return {
            type,
            durationSeconds,
            exclusive,
            baseFee,
            durationModifier,
            exclusiveModifier,
            grossFee: grossFee.toFixed(2),
            sharePercent,
            netFee: netFee.toFixed(2)
        };
    },
    
    /**
     * Calculate mechanical royalties
     */
    calculateMechanicalRoyalties(units, type = 'digital', sharePercent = 100) {
        const rate = ROYALTY_RATES[`mechanical_${type}`] || 0.091;
        const grossRoyalty = units * rate;
        const netRoyalty = grossRoyalty * (sharePercent / 100);
        
        return {
            type,
            units,
            ratePerUnit: rate,
            grossRoyalty: grossRoyalty.toFixed(2),
            sharePercent,
            netRoyalty: netRoyalty.toFixed(2)
        };
    },
    
    /**
     * Calculate estimated annual royalty income for catalog
     */
    estimateAnnualRoyalties(catalogStats, projectedStreams) {
        const estimates = {
            streaming: 0,
            sync: 0,
            mechanical: 0,
            performance: 0
        };
        
        // Streaming estimates
        if (projectedStreams) {
            Object.entries(projectedStreams).forEach(([platform, streams]) => {
                const rate = ROYALTY_RATES[platform] || 0.004;
                estimates.streaming += streams * rate;
            });
        }
        
        // Estimate sync opportunities (assuming 2-5 per year for established catalog)
        const syncOpportunities = Math.min(5, Math.floor(catalogStats.totalSongs / 100));
        estimates.sync = syncOpportunities * 25000; // Average sync fee
        
        // Performance royalties (BMI/ASCAP) - estimated based on catalog size
        estimates.performance = catalogStats.totalSongs * 50; // Rough estimate per song
        
        const total = estimates.streaming + estimates.sync + estimates.mechanical + estimates.performance;
        
        return {
            breakdown: estimates,
            total: total.toFixed(2),
            monthly: (total / 12).toFixed(2),
            perSong: (total / catalogStats.totalSongs).toFixed(2)
        };
    },
    
    /**
     * Split royalties among stakeholders
     */
    splitRoyalties(totalRoyalty, splits = DEFAULT_SPLITS) {
        const result = {};
        let remaining = 100;
        
        Object.entries(splits).forEach(([party, percent]) => {
            const amount = totalRoyalty * (percent / 100);
            result[party] = {
                percent,
                amount: amount.toFixed(2)
            };
            remaining -= percent;
        });
        
        result.unallocated = {
            percent: remaining,
            amount: (totalRoyalty * (remaining / 100)).toFixed(2)
        };
        
        return result;
    },
    
    /**
     * Generate royalty report
     */
    generateRoyaltyReport(catalogSongs, period = 'monthly') {
        const report = {
            period,
            generatedAt: new Date().toISOString(),
            summary: {
                totalSongs: catalogSongs.length,
                totalShare: catalogSongs.reduce((sum, s) => sum + (s.share_percent || 0), 0)
            },
            projections: null,
            byLabel: {},
            byAlbum: {}
        };
        
        // Group by label
        catalogSongs.forEach(song => {
            const label = song.label || 'Unknown';
            if (!report.byLabel[label]) {
                report.byLabel[label] = { songs: 0, totalShare: 0 };
            }
            report.byLabel[label].songs++;
            report.byLabel[label].totalShare += song.share_percent || 0;
        });
        
        // Group by album
        catalogSongs.forEach(song => {
            const album = song.album || 'Unknown';
            if (!report.byAlbum[album]) {
                report.byAlbum[album] = { songs: 0, totalShare: 0 };
            }
            report.byAlbum[album].songs++;
            report.byAlbum[album].totalShare += song.share_percent || 0;
        });
        
        return report;
    }
};

module.exports = RoyaltyCalculator;