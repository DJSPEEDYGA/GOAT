/**
 * GOAT Data Module - Unified Data Access Layer
 * All data is embedded locally - NO external API calls required
 * 100% offline, self-contained, no login required
 */

const fs = require('fs');
const path = require('path');

// Data paths
const dataDir = path.join(__dirname, '../data');

/**
 * Load JSON data file with caching
 */
const dataCache = {};
function loadDataFile(filename) {
    if (dataCache[filename]) {
        return dataCache[filename];
    }
    
    try {
        const filePath = path.join(dataDir, filename);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            dataCache[filename] = data;
            return data;
        }
    } catch (error) {
        console.error(`Error loading ${filename}:`, error.message);
    }
    return null;
}

/**
 * Get WAKA FLOCKA FLAME Music Catalog
 * 511 songs from ASCAP catalog
 */
function getMusicCatalog() {
    return loadDataFile('waka_catalog.json') || {
        publisher: "BRICK SQUAD MONOPOLY PUBLISHING",
        artist: "WAKA FLOCKA FLAME",
        composer: "JUAQUIN MALPHURS",
        total_songs: 0,
        songs: []
    };
}

/**
 * Get Network Profiles
 * 142 profiles with 140 connections
 * "Our Network Is Our Net Worth"
 */
function getNetworkProfiles() {
    const data = loadDataFile('network_profiles.json');
    return data || { profiles: [], connections: [] };
}

/**
 * Get all songs from catalog
 */
function getAllSongs() {
    const catalog = getMusicCatalog();
    return catalog.songs || [];
}

/**
 * Search songs by title
 */
function searchSongs(query) {
    const songs = getAllSongs();
    const lowerQuery = query.toLowerCase();
    return songs.filter(song => 
        song.song_title.toLowerCase().includes(lowerQuery) ||
        song.composer?.toLowerCase().includes(lowerQuery) ||
        song.label?.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get songs by collaborator
 */
function getSongsByCollaborator(artistName) {
    const songs = getAllSongs();
    const lowerName = artistName.toLowerCase();
    return songs.filter(song => 
        song.song_title.toLowerCase().includes(lowerName) ||
        (song.artist && song.artist.toLowerCase().includes(lowerName))
    );
}

/**
 * Get unique collaborators/featured artists
 */
function getCollaborators() {
    const songs = getAllSongs();
    const collaborators = new Set();
    
    songs.forEach(song => {
        // Extract featured artists from song titles
        const featMatch = song.song_title.match(/\(FEAT\.\s*([^)]+)\)/i) || 
                         song.song_title.match(/\[FEAT\.\s*([^\]]+)\]/i);
        if (featMatch) {
            featMatch[1].split(/&|,/).forEach(artist => {
                collaborators.add(artist.trim().toUpperCase());
            });
        }
        // Add label as collaborator
        if (song.label) {
            collaborators.add(song.label.toUpperCase());
        }
    });
    
    return Array.from(collaborators).sort();
}

/**
 * Get catalog statistics
 */
function getCatalogStats() {
    const catalog = getMusicCatalog();
    const songs = catalog.songs || [];
    
    const labels = {};
    const albums = {};
    let totalShare = 0;
    
    songs.forEach(song => {
        if (song.label) {
            labels[song.label] = (labels[song.label] || 0) + 1;
        }
        if (song.album) {
            albums[song.album] = (albums[song.album] || 0) + 1;
        }
        totalShare += song.share_percent || 0;
    });
    
    return {
        total_songs: songs.length,
        total_share: totalShare,
        unique_labels: Object.keys(labels).length,
        unique_albums: Object.keys(albums).length,
        top_labels: Object.entries(labels)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count })),
        top_albums: Object.entries(albums)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }))
    };
}

/**
 * Get network statistics
 */
function getNetworkStats() {
    const data = getNetworkProfiles();
    const profiles = data.profiles || [];
    const connections = data.connections || [];
    
    const byType = {};
    let totalNetWorth = 0;
    let totalInfluence = 0;
    
    profiles.forEach(profile => {
        byType[profile.type] = (byType[profile.type] || 0) + 1;
        totalNetWorth += profile.netWorth || 0;
        totalInfluence += profile.influence || 0;
    });
    
    return {
        total_profiles: profiles.length,
        total_connections: connections.length,
        total_net_worth: totalNetWorth,
        avg_influence: profiles.length > 0 ? totalInfluence / profiles.length : 0,
        by_type: byType,
        verified_count: profiles.filter(p => p.verified).length
    };
}

/**
 * Export catalog to CSV format
 */
function exportCatalogCSV() {
    const songs = getAllSongs();
    const headers = ['ID', 'ISWC', 'Song Title', 'Composer', 'Publisher', 'Label', 'Album', 'Share %', 'ISRC'];
    const rows = songs.map(song => [
        song.id,
        song.iswc,
        `"${song.song_title.replace(/"/g, '""')}"`,
        song.composer,
        song.publisher,
        song.label,
        song.album,
        song.share_percent,
        song.isrc
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// API Keys Configuration (embedded for local use)
const API_CONFIG = {
    superninja: 'CUTSsX7.UBvzlbTUCFb8zQJm6j-8_X-5zy8p5QEsuYRENK1ONKE',
    hostinger: 'VK2DgV31mpN5c6e8gJK50LJR1QgPwcyMYKthc7Gl8f14e176',
    supabase: 'sbp_073f78daede405731dc30abb4eab334429203c2c',
    googleAI: 'AIzaSyBNrZ-P8-n5NxzsceYDZUwrrkPSd3LtEks',
    fashionApp: 'D7Vqj4g.t6ljK678nBb5z90vd8-thJf3A5BCCQ8kg-Shz2D5g5c'
};

// Server Configuration
const SERVER_CONFIG = {
    ip: '93.127.214.171',
    os: 'Ubuntu 24.04.3 LTS',
    resources: { cpu: 2, ram: '8GB', disk: '386GB' },
    location: 'Lithuania - Vilnius'
};

module.exports = {
    // Data loaders
    getMusicCatalog,
    getNetworkProfiles,
    getAllSongs,
    searchSongs,
    getSongsByCollaborator,
    getCollaborators,
    
    // Statistics
    getCatalogStats,
    getNetworkStats,
    
    // Export
    exportCatalogCSV,
    
    // Configuration
    API_CONFIG,
    SERVER_CONFIG,
    
    // Cache management
    clearCache: () => { Object.keys(dataCache).forEach(k => delete dataCache[k]); },
    loadDataFile
};