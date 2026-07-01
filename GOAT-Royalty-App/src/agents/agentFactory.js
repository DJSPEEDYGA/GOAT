/**
 * AgentFactory - Central management system for all AI agents in GOAT Royalty App
 * Handles agent creation, registration, retrieval, and coordination
 */

const MusicIndustryAgent = require('./musicIndustryAgent');
const BusinessStrategyAgent = require('./businessStrategyAgent');
const LegalComplianceAgent = require('./legalComplianceAgent');
const TechDevelopmentAgent = require('./techDevelopmentAgent');
const CreativeContentAgent = require('./creativeContentAgent');
const ResearcherAgent = require('./researcherAgent');
const WriterAgent = require('./writerAgent');
const FashionDesignerAgent = require('./fashionDesignerAgent');
const PersonalStylistAgent = require('./personalStylistAgent');
const FashionBusinessAgent = require('./fashionBusinessAgent');

class AgentFactory {
    constructor() {
        this.agents = new Map();
        this.agentTypes = new Map();
        this.initializeAgents();
    }

    /**
     * Initialize all available agents
     */
    initializeAgents() {
        // Music Industry Agents
        this.registerAgentType('MusicIndustry', () => new MusicIndustryAgent());
        
        // Business & Strategy Agents
        this.registerAgentType('BusinessStrategy', () => new BusinessStrategyAgent());
        
        // Legal Agents
        this.registerAgentType('LegalCompliance', () => new LegalComplianceAgent());
        
        // Technology Agents
        this.registerAgentType('TechDevelopment', () => new TechDevelopmentAgent());
        
        // Creative Agents
        this.registerAgentType('CreativeContent', () => new CreativeContentAgent());
        
        // Research & Writing Agents
        this.registerAgentType('Researcher', () => new ResearcherAgent());
        this.registerAgentType('Writer', () => new WriterAgent());
        
        // Fashion Industry Agents
        this.registerAgentType('FashionDesigner', () => new FashionDesignerAgent({ name: 'Fashion Designer Expert' }));
        this.registerAgentType('PersonalStylist', () => new PersonalStylistAgent());
        this.registerAgentType('FashionBusiness', () => new FashionBusinessAgent());
    }

    /**
     * Register agent type
     */
    registerAgentType(typeName, factoryFunction) {
        this.agentTypes.set(typeName, factoryFunction);
    }

    /**
     * Create new agent instance
     */
    createAgent(typeName) {
        if (!this.agentTypes.has(typeName)) {
            throw new Error(`Unknown agent type: ${typeName}`);
        }
        
        const factoryFunction = this.agentTypes.get(typeName);
        const agent = factoryFunction();
        
        this.agents.set(agent.id, agent);
        
        return agent;
    }

    /**
     * Get agent by ID
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }

    /**
     * Get agent by type
     */
    getAgentByType(typeName) {
        for (const [id, agent] of this.agents) {
            if (agent.name === typeName) {
                return agent;
            }
        }
        
        // If no active agent of this type, create one
        return this.createAgent(typeName);
    }

    /**
     * Get all agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }

    /**
     * Get agents by industry
     */
    getAgentsByIndustry(industry) {
        return this.getAllAgents().filter(agent => 
            agent.industry.toLowerCase() === industry.toLowerCase()
        );
    }

    /**
     * Get agents by capability
     */
    getAgentsByCapability(capability) {
        return this.getAllAgents().filter(agent => 
            agent.hasCapability(capability)
        );
    }

    /**
     * Find best agent for task
     */
    findBestAgentForTask(capability, industry = null) {
        let candidates = this.getAgentsByCapability(capability);
        
        if (industry) {
            const industryCandidates = candidates.filter(agent => 
                agent.industry.toLowerCase() === industry.toLowerCase()
            );
            
            if (industryCandidates.length > 0) {
                candidates = industryCandidates;
            }
        }
        
        // Sort by success rate
        candidates.sort((a, b) => {
            const aRate = a.performanceMetrics.totalOperations > 0 ?
                a.performanceMetrics.successfulOperations / a.performanceMetrics.totalOperations : 0;
            const bRate = b.performanceMetrics.totalOperations > 0 ?
                b.performanceMetrics.successfulOperations / b.performanceMetrics.totalOperations : 0;
            return bRate - aRate;
        });
        
        if (candidates.length > 0) {
            return candidates[0];
        }
        
        // No agent found, try to create one
        const agentType = this.findAgentTypeForCapability(capability);
        if (agentType) {
            return this.createAgent(agentType);
        }
        
        return null;
    }

    /**
     * Find agent type for capability
     */
    findAgentTypeForCapability(capability) {
        for (const [typeName, factoryFunction] of this.agentTypes) {
            const testAgent = factoryFunction();
            if (testAgent.hasCapability(capability)) {
                return typeName;
            }
        }
        return null;
    }

    /**
     * Execute task using appropriate agent
     */
    async executeTask(capability, params, industry = null) {
        const agent = this.findBestAgentForTask(capability, industry);
        
        if (!agent) {
            throw new Error(`No agent available for capability: ${capability}`);
        }
        
        return await agent.executeCapability(capability, params);
    }

    /**
     * Get available agent types
     */
    getAvailableAgentTypes() {
        return Array.from(this.agentTypes.keys());
    }

    /**
     * Get available capabilities
     */
    getAvailableCapabilities() {
        const capabilities = new Set();
        
        for (const agent of this.getAllAgents()) {
            agent.capabilities.forEach(cap => capabilities.add(cap));
        }
        
        return Array.from(capabilities);
    }

    /**
     * Get available industries
     */
    getAvailableIndustries() {
        const industries = new Set();
        
        for (const agent of this.getAllAgents()) {
            industries.add(agent.industry);
        }
        
        return Array.from(industries);
    }

    /**
     * Deactivate agent
     */
    deactivateAgent(agentId) {
        const agent = this.getAgent(agentId);
        if (agent) {
            agent.deactivate();
            return true;
        }
        return false;
    }

    /**
     * Activate agent
     */
    activateAgent(agentId) {
        const agent = this.getAgent(agentId);
        if (agent) {
            agent.activate();
            return true;
        }
        return false;
    }

    /**
     * Remove agent
     */
    removeAgent(agentId) {
        return this.agents.delete(agentId);
    }

    /**
     * Get factory statistics
     */
    getStatistics() {
        const stats = {
            totalAgents: this.agents.size,
            availableTypes: this.agentTypes.size,
            activeAgents: 0,
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            byIndustry: {},
            byCapability: {}
        };
        
        for (const agent of this.getAllAgents()) {
            if (agent.isActive) {
                stats.activeAgents++;
            }
            
            stats.totalOperations += agent.performanceMetrics.totalOperations;
            stats.successfulOperations += agent.performanceMetrics.successfulOperations;
            stats.failedOperations += agent.performanceMetrics.failedOperations;
            
            // Group by industry
            if (!stats.byIndustry[agent.industry]) {
                stats.byIndustry[agent.industry] = 0;
            }
            stats.byIndustry[agent.industry]++;
            
            // Group by capability
            agent.capabilities.forEach(cap => {
                if (!stats.byCapability[cap]) {
                    stats.byCapability[cap] = 0;
                }
                stats.byCapability[cap]++;
            });
        }
        
        return stats;
    }

    /**
     * Get agent performance report
     */
    getPerformanceReport() {
        const report = {
            agents: [],
            summary: {
                totalAgents: 0,
                averageSuccessRate: 0,
                averageResponseTime: 0
            }
        };
        
        let totalSuccessRate = 0;
        let totalResponseTime = 0;
        
        for (const agent of this.getAllAgents()) {
            const successRate = agent.performanceMetrics.totalOperations > 0 ?
                (agent.performanceMetrics.successfulOperations / agent.performanceMetrics.totalOperations) * 100 : 100;
            
            const agentReport = {
                id: agent.id,
                name: agent.name,
                industry: agent.industry,
                isActive: agent.isActive,
                capabilities: agent.capabilities,
                performance: {
                    totalOperations: agent.performanceMetrics.totalOperations,
                    successfulOperations: agent.performanceMetrics.successfulOperations,
                    failedOperations: agent.performanceMetrics.failedOperations,
                    successRate: successRate.toFixed(2) + '%',
                    averageResponseTime: agent.performanceMetrics.averageResponseTime.toFixed(2) + 'ms'
                }
            };
            
            report.agents.push(agentReport);
            
            totalSuccessRate += successRate;
            totalResponseTime += agent.performanceMetrics.averageResponseTime;
        }
        
        report.summary.totalAgents = this.agents.size;
        report.summary.averageSuccessRate = this.agents.size > 0 ?
            (totalSuccessRate / this.agents.size).toFixed(2) + '%' : '0%';
        report.summary.averageResponseTime = this.agents.size > 0 ?
            (totalResponseTime / this.agents.size).toFixed(2) + 'ms' : '0ms';
        
        return report;
    }

    /**
     * Reset all agents
     */
    resetAllAgents() {
        for (const agent of this.getAllAgents()) {
            agent.reset();
        }
    }

    /**
     * Export factory state
     */
    exportState() {
        return {
            statistics: this.getStatistics(),
            performance: this.getPerformanceReport(),
            agents: this.getAllAgents().map(agent => agent.export())
        };
    }
}

// Singleton instance
let factoryInstance = null;

/**
 * Get singleton instance of AgentFactory
 */
function getAgentFactory() {
    if (!factoryInstance) {
        factoryInstance = new AgentFactory();
    }
    return factoryInstance;
}

module.exports = AgentFactory;
module.exports.getAgentFactory = getAgentFactory;