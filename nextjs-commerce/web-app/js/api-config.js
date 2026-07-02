/**
 * API Configuration for GOAT Royalty App
 * Change this to point to your cloud server
 */

const API_CONFIG = {
    // Your Cloud Server
    CLOUD_URL: 'http://169.254.24.18',
    
    // Port (5001 for backend API, 3000 for web)
    PORT: 5001,
    
    // Full API URL
    get API_URL() {
        return `${this.CLOUD_URL}:${this.PORT}`;
    },
    
    // WebSocket URL (for real-time updates)
    get WS_URL() {
        return `ws://${this.CLOUD_URL}:${this.PORT}`;
    },
    
    // Mining API endpoints
    MINING: {
        POOL_DASHBOARD: () => `${API_CONFIG.API_URL}/api/pool/dashboard`,
        F2POOL: () => `${API_CONFIG.API_URL}/api/pool/f2pool`,
        VIABTC: () => `${API_CONFIG.API_URL}/api/pool/viabtc`,
        POOLIN: () => `${API_CONFIG.API_URL}/api/pool/poolin`,
        ZERGPOOL: () => `${API_CONFIG.API_URL}/api/pool/zergpool`,
        WALLETS: () => `${API_CONFIG.API_URL}/api/pool/wallets`,
    },
    
    // Health check
    HEALTH: () => `${API_CONFIG.API_URL}/health`,
    
    // Check if server is reachable
    async checkConnection() {
        try {
            const response = await fetch(this.HEALTH());
            const data = await response.json();
            return { connected: true, data };
        } catch (error) {
            return { connected: false, error: error.message };
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}

// Make globally available
window.API_CONFIG = API_CONFIG;

console.log('🔗 API Configuration loaded');
console.log('📍 API URL:', API_CONFIG.API_URL);
console.log('🔌 WebSocket URL:', API_CONFIG.WS_URL);