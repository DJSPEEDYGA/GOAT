/**
 * Sync Opportunities Module
 * Track and manage sync placement opportunities
 */

const fs = require('fs');
const path = require('path');

const syncDataPath = path.join(__dirname, '../../data/sync_opportunities.json');

// Sync opportunity types
const SyncTypes = {
    TV_SHOW: 'tv_show',
    FILM: 'film',
    COMMERCIAL: 'commercial',
    VIDEOGAME: 'videogame',
    TRAILER: 'trailer',
    SOCIAL_MEDIA: 'social_media',
    PODCAST: 'podcast',
    STREAMING: 'streaming'
};

// Status types
const SyncStatus = {
    PENDING: 'pending',
    SUBMITTED: 'submitted',
    NEGOTIATING: 'negotiating',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    EXPIRED: 'expired'
};

// Default sync opportunities for WAKA catalog
const defaultOpportunities = [
    {
        id: 'sync_001',
        title: 'NBA 2K25 Soundtrack Placement',
        type: SyncTypes.VIDEOGAME,
        status: SyncStatus.PENDING,
        description: 'Seeking high-energy tracks for NBA 2K25 basketball video game soundtrack',
        songs: [],
        budget: 75000,
        deadline: '2025-06-30',
        contact: {
            company: '2K Sports',
            email: 'music@2ksports.com'
        },
        requirements: ['Explicit allowed', 'High energy', 'Sports anthem feel'],
        createdAt: '2025-01-15T00:00:00Z'
    },
    {
        id: 'sync_002',
        title: 'Fast & Furious 11 Soundtrack',
        type: SyncTypes.FILM,
        status: SyncStatus.PENDING,
        description: 'Looking for trap/hip-hop tracks for action sequences',
        songs: [],
        budget: 150000,
        deadline: '2025-04-15',
        contact: {
            company: 'Universal Pictures',
            email: 'music@universal.com'
        },
        requirements: ['Car culture', 'Trap beats', 'Club bangers'],
        createdAt: '2025-01-20T00:00:00Z'
    },
    {
        id: 'sync_003',
        title: 'Nike Campaign - "Just Do It"',
        type: SyncTypes.COMMERCIAL,
        status: SyncStatus.PENDING,
        description: 'Nike seeking motivational hip-hop for global campaign',
        songs: [],
        budget: 250000,
        deadline: '2025-03-01',
        contact: {
            company: 'Wieden+Kennedy',
            email: 'music@wk.com'
        },
        requirements: ['Motivational', 'Clean version required', 'Global rights'],
        createdAt: '2025-02-01T00:00:00Z'
    },
    {
        id: 'sync_004',
        title: 'Power Book III: Raising Kanan',
        type: SyncTypes.TV_SHOW,
        status: SyncStatus.SUBMITTED,
        description: 'Starz series seeking 90s/2000s inspired hip-hop',
        songs: ['Hard in da Paint', 'No Hands'],
        budget: 35000,
        deadline: '2025-04-01',
        contact: {
            company: 'Starz',
            email: 'music@starz.com'
        },
        requirements: ['New York vibes', 'Street anthems', 'Authentic hip-hop'],
        createdAt: '2025-01-25T00:00:00Z'
    },
    {
        id: 'sync_005',
        title: 'TikTok Trending Campaign',
        type: SyncTypes.SOCIAL_MEDIA,
        status: SyncStatus.ACCEPTED,
        description: 'TikTok music program for viral potential',
        songs: ['Grove St. Party', 'Round of Applause'],
        budget: 15000,
        deadline: '2025-02-28',
        contact: {
            company: 'TikTok Music',
            email: 'partnerships@tiktok.com'
        },
        requirements: ['High energy', 'Catchy hook', 'Dance potential'],
        createdAt: '2025-01-10T00:00:00Z'
    }
];

function initSyncData() {
    try {
        if (fs.existsSync(syncDataPath)) {
            return JSON.parse(fs.readFileSync(syncDataPath, 'utf8'));
        }
        const data = {
            opportunities: defaultOpportunities,
            submissions: [],
            placements: []
        };
        fs.writeFileSync(syncDataPath, JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('Error initializing sync data:', error);
        return { opportunities: [], submissions: [], placements: [] };
    }
}

const SyncOpportunities = {
    SyncTypes,
    SyncStatus,
    
    /**
     * Get all opportunities
     */
    getAllOpportunities() {
        const data = initSyncData();
        return data.opportunities || [];
    },
    
    /**
     * Get opportunity by ID
     */
    getOpportunityById(id) {
        const data = initSyncData();
        return data.opportunities?.find(o => o.id === id) || null;
    },
    
    /**
     * Get opportunities by status
     */
    getOpportunitiesByStatus(status) {
        const data = initSyncData();
        return data.opportunities?.filter(o => o.status === status) || [];
    },
    
    /**
     * Get opportunities by type
     */
    getOpportunitiesByType(type) {
        const data = initSyncData();
        return data.opportunities?.filter(o => o.type === type) || [];
    },
    
    /**
     * Add new opportunity
     */
    addOpportunity(opportunity) {
        const data = initSyncData();
        const newOpp = {
            id: `sync_${Date.now()}`,
            status: SyncStatus.PENDING,
            createdAt: new Date().toISOString(),
            songs: [],
            ...opportunity
        };
        data.opportunities.push(newOpp);
        fs.writeFileSync(syncDataPath, JSON.stringify(data, null, 2));
        return newOpp;
    },
    
    /**
     * Update opportunity
     */
    updateOpportunity(id, updates) {
        const data = initSyncData();
        const index = data.opportunities?.findIndex(o => o.id === id);
        if (index >= 0) {
            data.opportunities[index] = { 
                ...data.opportunities[index], 
                ...updates, 
                updatedAt: new Date().toISOString() 
            };
            fs.writeFileSync(syncDataPath, JSON.stringify(data, null, 2));
            return data.opportunities[index];
        }
        return null;
    },
    
    /**
     * Submit song for opportunity
     */
    submitSong(opportunityId, songTitle, notes = '') {
        const data = initSyncData();
        const oppIndex = data.opportunities?.findIndex(o => o.id === opportunityId);
        
        if (oppIndex >= 0) {
            const song = {
                title: songTitle,
                submittedAt: new Date().toISOString(),
                notes,
                status: 'submitted'
            };
            
            if (!data.opportunities[oppIndex].songs) {
                data.opportunities[oppIndex].songs = [];
            }
            data.opportunities[oppIndex].songs.push(song);
            
            // Add to submissions
            data.submissions.push({
                opportunityId,
                ...song
            });
            
            fs.writeFileSync(syncDataPath, JSON.stringify(data, null, 2));
            return song;
        }
        return null;
    },
    
    /**
     * Get sync statistics
     */
    getSyncStats() {
        const data = initSyncData();
        const opportunities = data.opportunities || [];
        
        const stats = {
            total: opportunities.length,
            byStatus: {},
            byType: {},
            totalBudget: 0,
            pendingValue: 0,
            acceptedValue: 0
        };
        
        opportunities.forEach(opp => {
            // Count by status
            stats.byStatus[opp.status] = (stats.byStatus[opp.status] || 0) + 1;
            
            // Count by type
            stats.byType[opp.type] = (stats.byType[opp.type] || 0) + 1;
            
            // Sum budgets
            stats.totalBudget += opp.budget || 0;
            
            if (opp.status === SyncStatus.PENDING || opp.status === SyncStatus.SUBMITTED) {
                stats.pendingValue += opp.budget || 0;
            }
            if (opp.status === SyncStatus.ACCEPTED || opp.status === SyncStatus.COMPLETED) {
                stats.acceptedValue += opp.budget || 0;
            }
        });
        
        return stats;
    },
    
    /**
     * Match songs to opportunity based on requirements
     */
    matchSongsToOpportunity(opportunityId, catalogSongs) {
        const opportunity = this.getOpportunityById(opportunityId);
        if (!opportunity) return [];
        
        const requirements = opportunity.requirements || [];
        const matchedSongs = [];
        
        catalogSongs.forEach(song => {
            let score = 0;
            const title = song.song_title?.toLowerCase() || '';
            
            // Check for explicit
            if (requirements.includes('Explicit allowed') && title.includes('explicit')) {
                score += 10;
            }
            
            // Check for energy keywords
            if (requirements.some(r => r.toLowerCase().includes('energy'))) {
                const energyWords = ['hard', 'fire', 'turnt', 'lit', 'banger', 'anthem'];
                energyWords.forEach(word => {
                    if (title.includes(word)) score += 5;
                });
            }
            
            // Check for dance/party potential
            if (requirements.some(r => r.toLowerCase().includes('dance') || r.toLowerCase().includes('party'))) {
                const partyWords = ['party', 'dance', 'club', 'shake', 'groove'];
                partyWords.forEach(word => {
                    if (title.includes(word)) score += 5;
                });
            }
            
            if (score > 0) {
                matchedSongs.push({ ...song, matchScore: score });
            }
        });
        
        return matchedSongs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
    },
    
    /**
     * Get upcoming deadlines
     */
    getUpcomingDeadlines(days = 30) {
        const data = initSyncData();
        const now = new Date();
        const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        
        return (data.opportunities || [])
            .filter(o => {
                const deadline = new Date(o.deadline);
                return deadline >= now && deadline <= futureDate;
            })
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
};

module.exports = SyncOpportunities;