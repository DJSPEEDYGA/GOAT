/**
 * SUPER GOAT ROYALTIES - Data Models
 * Comprehensive data structures for the platform
 */

class RevenueData {
    constructor() {
        this.totalRevenue = 0;
        this.growthRate = 0;
        this.platforms = {};
        this.predictions = [];
        this.history = [];
    }

    update(platform, amount, metadata = {}) {
        if (!this.platforms[platform]) {
            this.platforms[platform] = {
                revenue: 0,
                streams: 0,
                downloads: 0,
                growth: 0
            };
        }
        
        this.platforms[platform].revenue += amount;
        this.totalRevenue += amount;
        
        // Store metadata fields (streams, growth, downloads)
        if (metadata.streams) this.platforms[platform].streams = metadata.streams;
        if (metadata.growth) this.platforms[platform].growth = metadata.growth;
        if (metadata.downloads) this.platforms[platform].downloads = metadata.downloads;
        
        this.history.push({
            platform,
            amount,
            timestamp: new Date(),
            ...metadata
        });
    }

    getPlatformStats(platform) {
        return this.platforms[platform] || null;
    }

    getTotalByDateRange(startDate, endDate) {
        return this.history.filter(h => {
            const date = new Date(h.timestamp);
            return date >= startDate && date <= endDate;
        });
    }
}

class NFTPortfolio {
    constructor() {
        this.items = [];
        this.totalValue = 0;
        this.chains = {};
        this.salesHistory = [];
    }

    addItem(item) {
        this.items.push({
            id: item.id || Date.now().toString(),
            name: item.name,
            description: item.description,
            value: item.value,
            chain: item.chain,
            contractAddress: item.contractAddress,
            tokenId: item.tokenId,
            metadata: item.metadata || {},
            createdAt: new Date()
        });
        
        this.totalValue += item.value;
        
        if (!this.chains[item.chain]) {
            this.chains[item.chain] = { items: 0, value: 0 };
        }
        this.chains[item.chain].items++;
        this.chains[item.chain].value += item.value;
    }

    recordSale(itemId, salePrice, buyer) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            this.salesHistory.push({
                itemId,
                name: item.name,
                salePrice,
                buyer,
                previousValue: item.value,
                timestamp: new Date()
            });
            
            // Update value and total
            this.totalValue = this.totalValue - item.value + salePrice;
            item.value = salePrice;
        }
    }

    getByChain(chain) {
        return this.items.filter(i => i.chain === chain);
    }

    getTopItems(limit = 10) {
        return [...this.items].sort((a, b) => b.value - a.value).slice(0, limit);
    }
}

class CollaborationHub {
    constructor() {
        this.members = [];
        this.projects = [];
        this.files = [];
        this.sessions = [];
    }

    addMember(member) {
        this.members.push({
            id: member.id || Date.now().toString(),
            name: member.name,
            role: member.role || 'member',
            email: member.email,
            avatar: member.avatar,
            status: 'offline',
            joinedAt: new Date(),
            lastActive: new Date()
        });
    }

    createProject(project) {
        this.projects.push({
            id: project.id || Date.now().toString(),
            name: project.name,
            description: project.description,
            members: project.members || [],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            files: [],
            settings: project.settings || {}
        });
    }

    addFile(file) {
        this.files.push({
            id: file.id || Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            projectId: file.projectId,
            uploadedBy: file.uploadedBy,
            version: 1,
            versions: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    createSession(session) {
        this.sessions.push({
            id: session.id || Date.now().toString(),
            projectId: session.projectId,
            members: session.members || [],
            type: session.type || 'editing',
            startedAt: new Date(),
            endedAt: null,
            recordings: []
        });
    }

    getActiveMembers() {
        return this.members.filter(m => m.status === 'online');
    }

    getActiveProjects() {
        return this.projects.filter(p => p.status === 'active');
    }

    getProjectFiles(projectId) {
        return this.files.filter(f => f.projectId === projectId);
    }
}

class SmartContract {
    constructor() {
        this.id = Date.now().toString();
        this.type = 'standard';
        this.parties = [];
        this.terms = {};
        this.royaltySplits = {};
        this.status = 'draft';
        this.chain = 'ethereum';
        this.contractAddress = null;
        this.createdAt = new Date();
        this.deployedAt = null;
        this.transactions = [];
    }

    setParty(address, name, role, percentage) {
        this.parties.push({
            address,
            name,
            role,
            percentage,
            createdAt: new Date()
        });
    }

    setRoyaltySplit(splits) {
        this.royaltySplits = splits;
    }

    setTerms(terms) {
        this.terms = terms;
    }

    deploy(contractAddress) {
        this.contractAddress = contractAddress;
        this.status = 'deployed';
        this.deployedAt = new Date();
    }

    recordTransaction(txHash, type, data) {
        this.transactions.push({
            txHash,
            type,
            data,
            timestamp: new Date()
        });
    }
}

class AIMasteringJob {
    constructor() {
        this.id = Date.now().toString();
        this.trackName = '';
        this.sourceFile = null;
        this.outputFile = null;
        this.settings = {
            loudnessTarget: -14,
            stereoWidth: 100,
            eqPreset: 'neutral',
            compressionStyle: 'modern',
            referenceTrack: null
        };
        this.quality = {
            score: 0,
            issues: [],
            recommendations: []
        };
        this.status = 'pending';
        this.createdAt = new Date();
        this.completedAt = null;
    }

    setSourceFile(file) {
        this.sourceFile = file;
    }

    setSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    complete(outputFile, qualityScore, issues = []) {
        this.outputFile = outputFile;
        this.quality.score = qualityScore;
        this.quality.issues = issues;
        this.status = 'completed';
        this.completedAt = new Date();
    }
}

class MarketAnalysis {
    constructor() {
        this.genreTrends = {};
        this.platformInsights = {};
        this.competitorData = [];
        this.audienceDemographics = {};
        this.predictions = [];
        this.lastUpdated = null;
    }

    updateGenreTrends(genre, data) {
        this.genreTrends[genre] = {
            ...data,
            updatedAt: new Date()
        };
    }

    addPlatformInsight(platform, insight) {
        if (!this.platformInsights[platform]) {
            this.platformInsights[platform] = [];
        }
        this.platformInsights[platform].push({
            ...insight,
            timestamp: new Date()
        });
    }

    addPrediction(prediction) {
        this.predictions.push({
            ...prediction,
            createdAt: new Date()
        });
    }

    getTrendingGenres(limit = 5) {
        return Object.entries(this.genreTrends)
            .sort((a, b) => b[1].growth - a[1].growth)
            .slice(0, limit)
            .map(([genre, data]) => ({ genre, ...data }));
    }
}

module.exports = {
    RevenueData,
    NFTPortfolio,
    CollaborationHub,
    SmartContract,
    AIMasteringJob,
    MarketAnalysis
};