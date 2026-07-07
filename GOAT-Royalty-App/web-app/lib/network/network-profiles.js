/**
 * Network Profiles Module - "Our Network Is Our Net Worth"
 * Connect the dots between artists, labels, collaborators, and industry contacts
 */

const fs = require('fs');
const path = require('path');

// Network profiles data file
const networkPath = path.join(__dirname, '../../data/network_profiles.json');

// Initialize network data structure
function initNetworkData() {
    const defaultData = {
        profiles: [],
        connections: [],
        companies: [],
        opportunities: []
    };
    
    try {
        if (fs.existsSync(networkPath)) {
            return JSON.parse(fs.readFileSync(networkPath, 'utf8'));
        }
        fs.writeFileSync(networkPath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    } catch (error) {
        console.error('Error initializing network data:', error);
        return defaultData;
    }
}

// Industry profile types
const ProfileTypes = {
    ARTIST: 'artist',
    PRODUCER: 'producer',
    SONGWRITER: 'songwriter',
    EXECUTIVE: 'executive',
    LABEL: 'label',
    PUBLISHER: 'publisher',
    DISTRIBUTOR: 'distributor',
    MANAGER: 'manager',
    ATTORNEY: 'attorney',
    ENGINEER: 'engineer',
    DJ: 'dj',
    INFLUENCER: 'influencer'
};

// Connection types
const ConnectionTypes = {
    COLLABORATION: 'collaboration',
    BUSINESS: 'business',
    MENTORSHIP: 'mentorship',
    PARTNERSHIP: 'partnership',
    FRIENDSHIP: 'friendship',
    FAMILY: 'family',
    CONTRACT: 'contract'
};

const NetworkProfiles = {
    ProfileTypes,
    ConnectionTypes,

    /**
     * Get all profiles
     */
    getAllProfiles() {
        const data = initNetworkData();
        return data.profiles || [];
    },

    /**
     * Get profile by ID
     */
    getProfileById(id) {
        const data = initNetworkData();
        return data.profiles?.find(p => p.id === id) || null;
    },

    /**
     * Search profiles by name or skill
     */
    searchProfiles(query) {
        const data = initNetworkData();
        const lowerQuery = query.toLowerCase();
        return data.profiles?.filter(p => 
            p.name?.toLowerCase().includes(lowerQuery) ||
            p.skills?.some(s => s.toLowerCase().includes(lowerQuery)) ||
            p.company?.toLowerCase().includes(lowerQuery)
        ) || [];
    },

    /**
     * Get profiles by type
     */
    getProfilesByType(type) {
        const data = initNetworkData();
        return data.profiles?.filter(p => p.type === type) || [];
    },

    /**
     * Add new profile
     */
    addProfile(profile) {
        const data = initNetworkData();
        const newProfile = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...profile,
            connections: [],
            netWorth: profile.netWorth || 0,
            influence: profile.influence || 0,
            verified: false
        };
        data.profiles.push(newProfile);
        fs.writeFileSync(networkPath, JSON.stringify(data, null, 2));
        return newProfile;
    },

    /**
     * Update profile
     */
    updateProfile(id, updates) {
        const data = initNetworkData();
        const index = data.profiles?.findIndex(p => p.id === id);
        if (index >= 0) {
            data.profiles[index] = { ...data.profiles[index], ...updates, updatedAt: new Date().toISOString() };
            fs.writeFileSync(networkPath, JSON.stringify(data, null, 2));
            return data.profiles[index];
        }
        return null;
    },

    /**
     * Get all connections
     */
    getAllConnections() {
        const data = initNetworkData();
        return data.connections || [];
    },

    /**
     * Get connections for a profile
     */
    getProfileConnections(profileId) {
        const data = initNetworkData();
        return data.connections?.filter(c => 
            c.from === profileId || c.to === profileId
        ) || [];
    },

    /**
     * Add connection between profiles
     */
    addConnection(from, to, type, metadata = {}) {
        const data = initNetworkData();
        const connection = {
            id: Date.now().toString(),
            from,
            to,
            type,
            strength: metadata.strength || 1,
            since: metadata.since || new Date().toISOString(),
            notes: metadata.notes || '',
            deals: metadata.deals || [],
            songs: metadata.songs || []
        };
        data.connections.push(connection);
        fs.writeFileSync(networkPath, JSON.stringify(data, null, 2));
        return connection;
    },

    /**
     * Calculate network value for a profile
     */
    calculateNetworkValue(profileId) {
        const data = initNetworkData();
        const connections = data.connections?.filter(c => 
            c.from === profileId || c.to === profileId
        ) || [];
        
        let totalValue = 0;
        connections.forEach(conn => {
            const otherId = conn.from === profileId ? conn.to : conn.from;
            const otherProfile = data.profiles?.find(p => p.id === otherId);
            if (otherProfile) {
                totalValue += (otherProfile.netWorth || 0) * (conn.strength || 1) * 0.1;
            }
        });
        
        return totalValue;
    },

    /**
     * Get network statistics
     */
    getNetworkStats() {
        const data = initNetworkData();
        const profiles = data.profiles || [];
        const connections = data.connections || [];
        
        const totalNetWorth = profiles.reduce((sum, p) => sum + (p.netWorth || 0), 0);
        const avgConnectionsPerProfile = profiles.length > 0 ? 
            (connections.length * 2) / profiles.length : 0;
        
        const typeCounts = {};
        profiles.forEach(p => {
            typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
        });
        
        return {
            totalProfiles: profiles.length,
            totalConnections: connections.length,
            totalNetworkNetWorth: totalNetWorth,
            averageConnectionsPerProfile: avgConnectionsPerProfile.toFixed(2),
            profileTypeBreakdown: typeCounts,
            topInfluencers: profiles
                .sort((a, b) => (b.influence || 0) - (a.influence || 0))
                .slice(0, 10)
                .map(p => ({ id: p.id, name: p.name, influence: p.influence }))
        };
    },

    /**
     * Get opportunities (deal flow)
     */
    getOpportunities() {
        const data = initNetworkData();
        return data.opportunities || [];
    },

    /**
     * Add opportunity
     */
    addOpportunity(opportunity) {
        const data = initNetworkData();
        const newOpp = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: 'open',
            ...opportunity
        };
        data.opportunities.push(newOpp);
        fs.writeFileSync(networkPath, JSON.stringify(data, null, 2));
        return newOpp;
    },

    /**
     * Import profiles from catalog data (extract collaborators)
     */
    importFromCatalog(catalogSongs) {
        const data = initNetworkData();
        const extractedProfiles = [];
        
        catalogSongs.forEach(song => {
            // Extract featured artists
            const featMatch = song.song_title?.match(/\(FEAT\.?\s*([^)]+)\)/i);
            if (featMatch) {
                const featuredArtist = featMatch[1].trim();
                const existingProfile = data.profiles?.find(p => 
                    p.name?.toLowerCase() === featuredArtist.toLowerCase()
                );
                
                if (!existingProfile) {
                    extractedProfiles.push({
                        name: featuredArtist,
                        type: ProfileTypes.ARTIST,
                        source: 'catalog',
                        sourceSong: song.song_title,
                        company: song.label || ''
                    });
                }
            }
            
            // Extract labels as companies
            if (song.label && !data.companies?.find(c => c.name === song.label)) {
                if (!data.companies) data.companies = [];
                data.companies.push({
                    id: Date.now().toString() + Math.random(),
                    name: song.label,
                    type: 'label',
                    songs: [song.song_title]
                });
            }
        });
        
        // Add extracted profiles
        extractedProfiles.forEach(profile => {
            if (!data.profiles?.find(p => p.name?.toLowerCase() === profile.name.toLowerCase())) {
                const newProfile = {
                    id: Date.now().toString() + Math.random(),
                    createdAt: new Date().toISOString(),
                    ...profile,
                    connections: [],
                    netWorth: 0,
                    influence: 0,
                    verified: false
                };
                data.profiles.push(newProfile);
            }
        });
        
        fs.writeFileSync(networkPath, JSON.stringify(data, null, 2));
        return extractedProfiles;
    }
};

module.exports = NetworkProfiles;