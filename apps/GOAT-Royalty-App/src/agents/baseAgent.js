/**
 * BaseAgent - Foundation class for all AI agents in GOAT Royalty App
 * Provides common functionality and structure for specialized agents
 */

class BaseAgent {
    constructor(name, industry, capabilities) {
        this.name = name;
        this.industry = industry;
        this.capabilities = capabilities || [];
        this.id = this.generateId();
        this.isActive = true;
        this.createdAt = new Date();
        this.operations = [];
        this.performanceMetrics = {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageResponseTime: 0
        };
    }

    /**
     * Generate unique agent ID
     */
    generateId() {
        return `${this.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    }

    /**
     * Log operation execution
     */
    logOperation(capability, description, metadata = {}) {
        const operation = {
            id: this.generateOperationId(),
            capability,
            description,
            timestamp: new Date(),
            duration: metadata.duration || 0,
            status: metadata.status || 'completed',
            metadata
        };
        
        this.operations.push(operation);
        this.updatePerformanceMetrics(operation);
        
        return operation;
    }

    /**
     * Generate operation ID
     */
    generateOperationId() {
        return `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(operation) {
        this.performanceMetrics.totalOperations++;
        
        if (operation.status === 'completed' || operation.status === 'success') {
            this.performanceMetrics.successfulOperations++;
        } else {
            this.performanceMetrics.failedOperations++;
        }
        
        // Update average response time
        const totalTime = this.performanceMetrics.averageResponseTime * 
                         (this.performanceMetrics.totalOperations - 1) + 
                         operation.duration;
        this.performanceMetrics.averageResponseTime = 
            totalTime / this.performanceMetrics.totalOperations;
    }

    /**
     * Get agent information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            industry: this.industry,
            capabilities: this.capabilities,
            isActive: this.isActive,
            createdAt: this.createdAt,
            performanceMetrics: this.performanceMetrics
        };
    }

    /**
     * Check if agent has specific capability
     */
    hasCapability(capability) {
        return this.capabilities.includes(capability);
    }

    /**
     * Activate agent
     */
    activate() {
        this.isActive = true;
        return this;
    }

    /**
     * Deactivate agent
     */
    deactivate() {
        this.isActive = false;
        return this;
    }

    /**
     * Get recent operations
     */
    getRecentOperations(limit = 10) {
        return this.operations.slice(-limit);
    }

    /**
     * Get operation statistics
     */
    getOperationStats() {
        const stats = {
            total: this.operations.length,
            byCapability: {},
            byStatus: {},
            averageDuration: 0
        };
        
        let totalDuration = 0;
        
        this.operations.forEach(op => {
            // Group by capability
            if (!stats.byCapability[op.capability]) {
                stats.byCapability[op.capability] = 0;
            }
            stats.byCapability[op.capability]++;
            
            // Group by status
            if (!stats.byStatus[op.status]) {
                stats.byStatus[op.status] = 0;
            }
            stats.byStatus[op.status]++;
            
            totalDuration += op.duration;
        });
        
        stats.averageDuration = this.operations.length > 0 ? 
            totalDuration / this.operations.length : 0;
        
        return stats;
    }

    /**
     * Execute capability (to be overridden by subclasses)
     */
    async executeCapability(capability, params) {
        if (!this.hasCapability(capability)) {
            throw new Error(`Agent ${this.name} does not have capability: ${capability}`);
        }
        
        const startTime = Date.now();
        let result;
        let status = 'completed';
        
        try {
            result = await this.performCapability(capability, params);
        } catch (error) {
            status = 'failed';
            result = { error: error.message };
        }
        
        const duration = Date.now() - startTime;
        
        this.logOperation(capability, `Executed ${capability}`, {
            duration,
            status,
            params
        });
        
        return result;
    }

    /**
     * Perform capability (to be implemented by subclasses)
     */
    async performCapability(capability, params) {
        throw new Error('performCapability must be implemented by subclass');
    }

    /**
     * Reset agent state
     */
    reset() {
        this.operations = [];
        this.performanceMetrics = {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageResponseTime: 0
        };
        return this;
    }

    /**
     * Export agent data
     */
    export() {
        return JSON.stringify({
            info: this.getInfo(),
            operations: this.getRecentOperations(100),
            stats: this.getOperationStats()
        }, null, 2);
    }
}

module.exports = BaseAgent;