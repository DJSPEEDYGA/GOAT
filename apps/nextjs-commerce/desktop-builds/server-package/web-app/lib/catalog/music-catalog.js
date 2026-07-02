/**
 * Music Catalog Module - WAKA FLOCKA FLAME ASCAP Catalog
 * Real data from Music Reports publishing catalog
 */

const fs = require('fs');
const path = require('path');

// Load catalog data
const catalogPath = path.join(__dirname, '../../data/waka_catalog.json');
let catalogData = null;

function loadCatalog() {
    if (!catalogData) {
        try {
            const rawData = fs.readFileSync(catalogPath, 'utf8');
            catalogData = JSON.parse(rawData);
        } catch (error) {
            console.error('Error loading catalog:', error);
            catalogData = { songs: [], total_songs: 0 };
        }
    }
    return catalogData;
}

const MusicCatalog = {
    /**
     * Get full catalog data
     */
    getFullCatalog() {
        return loadCatalog();
    },

    /**
     * Get all songs
     */
    getAllSongs() {
        const catalog = loadCatalog();
        return catalog.songs || [];
    },

    /**
     * Get song by ID
     */
    getSongById(id) {
        const catalog = loadCatalog();
        return catalog.songs?.find(song => song.id === parseInt(id)) || null;
    },

    /**
     * Get song by ISWC
     */
    getSongByISWC(iswc) {
        const catalog = loadCatalog();
        return catalog.songs?.find(song => song.iswc === iswc) || null;
    },

    /**
     * Get song by ISRC
     */
    getSongByISRC(isrc) {
        const catalog = loadCatalog();
        return catalog.songs?.find(song => song.isrc === isrc) || null;
    },

    /**
     * Search songs by title
     */
    searchByTitle(query) {
        const catalog = loadCatalog();
        const lowerQuery = query.toLowerCase();
        return catalog.songs?.filter(song => 
            song.song_title.toLowerCase().includes(lowerQuery)
        ) || [];
    },

    /**
     * Get songs by album
     */
    getSongsByAlbum(album) {
        const catalog = loadCatalog();
        return catalog.songs?.filter(song => 
            song.album && song.album.toLowerCase().includes(album.toLowerCase())
        ) || [];
    },

    /**
     * Get songs by label
     */
    getSongsByLabel(label) {
        const catalog = loadCatalog();
        return catalog.songs?.filter(song => 
            song.label && song.label.toLowerCase().includes(label.toLowerCase())
        ) || [];
    },

    /**
     * Get catalog statistics
     */
    getStatistics() {
        const catalog = loadCatalog();
        const songs = catalog.songs || [];
        
        // Count by album
        const albumCounts = {};
        const labelCounts = {};
        let totalShare = 0;
        let songsWithAlbum = 0;
        let songsWithLabel = 0;
        let songsWithISRC = 0;

        songs.forEach(song => {
            if (song.album) {
                albumCounts[song.album] = (albumCounts[song.album] || 0) + 1;
                songsWithAlbum++;
            }
            if (song.label) {
                labelCounts[song.label] = (labelCounts[song.label] || 0) + 1;
                songsWithLabel++;
            }
            if (song.isrc) {
                songsWithISRC++;
            }
            totalShare += song.share_percent || 0;
        });

        return {
            totalSongs: songs.length,
            totalShare: totalShare,
            uniqueAlbums: Object.keys(albumCounts).length,
            uniqueLabels: Object.keys(labelCounts).length,
            songsWithAlbum: songsWithAlbum,
            songsWithLabel: songsWithLabel,
            songsWithISRC: songsWithISRC,
            topAlbums: Object.entries(albumCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([name, count]) => ({ name, count })),
            topLabels: Object.entries(labelCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([name, count]) => ({ name, count })),
            publisher: catalog.publisher,
            artist: catalog.artist,
            composer: catalog.composer,
            proAffiliation: catalog.pro_affiliation
        };
    },

    /**
     * Get featured collaborations (songs with features)
     */
    getCollaborations() {
        const catalog = loadCatalog();
        const songs = catalog.songs || [];
        
        return songs.filter(song => 
            song.song_title.toLowerCase().includes('feat') || 
            song.song_title.includes('FEAT')
        ).map(song => {
            const match = song.song_title.match(/\(FEAT\.?\s*([^)]+)\)/i);
            return {
                ...song,
                featuredArtist: match ? match[1].trim() : null
            };
        });
    },

    /**
     * Export catalog to CSV format
     */
    exportToCSV() {
        const catalog = loadCatalog();
        const songs = catalog.songs || [];
        
        const headers = ['ISWC', 'Title', 'Composer', 'Share %', 'Album', 'Label', 'ISRC'];
        const rows = songs.map(song => [
            song.iswc,
            `"${song.song_title.replace(/"/g, '""')}"`,
            song.composer,
            song.share_percent,
            `"${(song.album || '').replace(/"/g, '""')}"`,
            `"${(song.label || '').replace(/"/g, '""')}"`,
            song.isrc
        ]);
        
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
};

module.exports = MusicCatalog;