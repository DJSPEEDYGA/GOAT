/**
 * SUPER GOAT ROYALTIES APP - Agent Communication Protocol (ACP)
 * Standardized communication for cross-framework agent collaboration
 * Based on Model Context Protocol (MCP) standards
 */

class AgentCommunicationProtocol {
  constructor(config = {}) {
    this.id = `acp-${Date.now()}`;
    this.version = '1.0.0';
    this.transport = new TransportLayer(config.transport || 'http');
    this.messageRouter = new MessageRouter();
    this.schemaRegistry = new SchemaRegistry();
    
    // Registered agents and their capabilities
    this.agents = new Map();
    this.capabilities = new Map();
    
    // Message handling
    this.handlers = new Map();
    this.middleware = [];
    
    this.config = {
      maxMessageSize: config.maxMessageSize || 10485760, // 10MB
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      encryption: config.encryption || false
    };
  }

  // Register an agent with the protocol
  registerAgent(agentInfo) {
    const { id, name, capabilities, endpoint } = agentInfo;
    
    this.agents.set(id, {
      id,
      name,
      endpoint,
      status: 'online',
      registeredAt: Date.now(),
      lastSeen: Date.now()
    });
    
    // Register capabilities
    for (const cap of capabilities) {
      if (!this.capabilities.has(cap)) {
        this.capabilities.set(cap, []);
      }
      this.capabilities.get(cap).push(id);
    }
    
    console.log(`[ACP] Agent registered: ${name} (${id})`);
    
    return {
      success: true,
      agentId: id,
      registeredCapabilities: capabilities
    };
  }

  // Unregister an agent
  unregisterAgent(agentId) {
    const agent = this.agents.get(agentId);
    
    if (agent) {
      // Remove from capabilities map
      for (const [cap, agents] of this.capabilities) {
        const index = agents.indexOf(agentId);
        if (index > -1) {
          agents.splice(index, 1);
        }
      }
      
      this.agents.delete(agentId);
      console.log(`[ACP] Agent unregistered: ${agentId}`);
    }
  }

  // Send message to another agent
  async sendMessage(fromAgent, toAgent, message) {
    // Validate message
    const validation = this.validateMessage(message);
    if (!validation.valid) {
      throw new Error(`Invalid message: ${validation.errors.join(', ')}`);
    }
    
    // Create envelope
    const envelope = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      version: this.version,
      from: fromAgent,
      to: toAgent,
      timestamp: Date.now(),
      message,
      metadata: {
        ttl: this.config.timeout,
        priority: message.priority || 'normal',
        encryption: this.config.encryption
      }
    };
    
    // Route message
    return this.messageRouter.route(envelope);
  }

  // Broadcast message to all agents with specific capability
  async broadcastToCapability(capability, message, fromAgent) {
    const agents = this.capabilities.get(capability) || [];
    const results = [];
    
    for (const agentId of agents) {
      try {
        const result = await this.sendMessage(fromAgent, agentId, message);
        results.push({ agentId, success: true, result });
      } catch (error) {
        results.push({ agentId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Request-response pattern
  async request(targetAgent, request, fromAgent) {
    const message = {
      type: 'request',
      payload: request,
      requestId: `req-${Date.now()}`
    };
    
    const response = await this.sendMessage(fromAgent, targetAgent, message);
    
    return response;
  }

  // Subscribe to events from other agents
  subscribe(agentId, eventType, handler) {
    const key = `${agentId}:${eventType}`;
    
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }
    
    this.handlers.get(key).push(handler);
    
    return () => {
      const handlers = this.handlers.get(key);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  // Emit event to subscribers
  async emit(agentId, eventType, data) {
    const key = `*:${eventType}`; // Wildcard for all subscribers
    
    const handlers = this.handlers.get(key) || [];
    
    for (const handler of handlers) {
      try {
        await handler({ agentId, eventType, data, timestamp: Date.now() });
      } catch (error) {
        console.error(`[ACP] Handler error: ${error.message}`);
      }
    }
  }

  // Validate message against schema
  validateMessage(message) {
    const errors = [];
    
    if (!message.type) {
      errors.push('Message type is required');
    }
    
    if (message.payload === undefined) {
      errors.push('Message payload is required');
    }
    
    if (JSON.stringify(message).length > this.config.maxMessageSize) {
      errors.push('Message exceeds maximum size');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Find agents by capability
  findAgentsByCapability(capability) {
    return this.capabilities.get(capability) || [];
  }

  // Get agent info
  getAgentInfo(agentId) {
    return this.agents.get(agentId);
  }

  // Get all online agents
  getOnlineAgents() {
    return Array.from(this.agents.values()).filter(a => a.status === 'online');
  }

  // Health check
  async healthCheck() {
    const agents = Array.from(this.agents.values());
    let healthy = 0;
    
    for (const agent of agents) {
      try {
        const response = await this.transport.ping(agent.endpoint);
        if (response.ok) {
          agent.status = 'online';
          agent.lastSeen = Date.now();
          healthy++;
        }
      } catch {
        agent.status = 'offline';
      }
    }
    
    return {
      totalAgents: agents.length,
      healthyAgents: healthy,
      timestamp: Date.now()
    };
  }
}

// Transport Layer for message delivery
class TransportLayer {
  constructor(type = 'http') {
    this.type = type;
    this.connections = new Map();
  }

  async send(endpoint, envelope) {
    switch (this.type) {
      case 'http':
        return this.httpSend(endpoint, envelope);
      case 'websocket':
        return this.wsSend(endpoint, envelope);
      case 'memory':
        return this.memorySend(endpoint, envelope);
      default:
        throw new Error(`Unknown transport type: ${this.type}`);
    }
  }

  async httpSend(endpoint, envelope) {
    // Simulated HTTP send
    return {
      success: true,
      messageId: envelope.id,
      deliveredAt: Date.now()
    };
  }

  async wsSend(endpoint, envelope) {
    // Simulated WebSocket send
    return {
      success: true,
      messageId: envelope.id,
      deliveredAt: Date.now()
    };
  }

  async memorySend(endpoint, envelope) {
    // In-memory send for local agents
    return {
      success: true,
      messageId: envelope.id,
      deliveredAt: Date.now()
    };
  }

  async ping(endpoint) {
    return { ok: true, latency: Math.random() * 50 };
  }
}

// Message Router for intelligent routing
class MessageRouter {
  constructor() {
    this.routes = new Map();
    this.fallbackRoutes = new Map();
  }

  async route(envelope) {
    const targetEndpoint = await this.resolveEndpoint(envelope.to);
    
    if (!targetEndpoint) {
      throw new Error(`Unknown agent: ${envelope.to}`);
    }
    
    // Check for special routing rules
    const route = this.routes.get(envelope.to);
    
    if (route) {
      return route.handler(envelope);
    }
    
    // Default delivery
    return {
      success: true,
      messageId: envelope.id,
      deliveredTo: envelope.to,
      timestamp: Date.now()
    };
  }

  async resolveEndpoint(agentId) {
    // In production, this would look up the agent's endpoint
    return `agent://${agentId}`;
  }

  addRoute(agentId, handler) {
    this.routes.set(agentId, { handler, addedAt: Date.now() });
  }

  removeRoute(agentId) {
    this.routes.delete(agentId);
  }
}

// Schema Registry for message validation
class SchemaRegistry {
  constructor() {
    this.schemas = new Map();
    
    // Register default schemas
    this.registerDefaultSchemas();
  }

  registerDefaultSchemas() {
    // Request schema
    this.schemas.set('request', {
      type: 'object',
      required: ['type', 'payload'],
      properties: {
        type: { type: 'string', enum: ['request', 'response', 'event', 'error'] },
        payload: { type: 'object' },
        requestId: { type: 'string' },
        timestamp: { type: 'number' }
      }
    });
    
    // Response schema
    this.schemas.set('response', {
      type: 'object',
      required: ['type', 'payload', 'requestId'],
      properties: {
        type: { type: 'string', const: 'response' },
        payload: { type: 'object' },
        requestId: { type: 'string' },
        success: { type: 'boolean' }
      }
    });
    
    // Event schema
    this.schemas.set('event', {
      type: 'object',
      required: ['type', 'eventType', 'data'],
      properties: {
        type: { type: 'string', const: 'event' },
        eventType: { type: 'string' },
        data: { type: 'object' }
      }
    });
  }

  register(name, schema) {
    this.schemas.set(name, schema);
  }

  get(name) {
    return this.schemas.get(name);
  }

  validate(message, schemaName) {
    const schema = this.schemas.get(schemaName);
    
    if (!schema) {
      return { valid: true, errors: [] };
    }
    
    // Simplified validation
    const errors = [];
    
    for (const required of schema.required || []) {
      if (message[required] === undefined) {
        errors.push(`Missing required field: ${required}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Predefined Agent Types for the Protocol
const AgentTypes = {
  ORCHESTRATOR: {
    name: 'Orchestrator',
    capabilities: ['coordinate', 'delegate', 'monitor', 'report'],
    description: 'Manages and coordinates other agents'
  },
  DATA_COLLECTOR: {
    name: 'DataCollector',
    capabilities: ['fetch', 'scrape', 'transform', 'validate'],
    description: 'Collects and processes data from various sources'
  },
  ANALYZER: {
    name: 'Analyzer',
    capabilities: ['analyze', 'predict', 'recommend', 'report'],
    description: 'Analyzes data and provides insights'
  },
  EXECUTOR: {
    name: 'Executor',
    capabilities: ['execute', 'deploy', 'publish', 'distribute'],
    description: 'Executes actions and operations'
  },
  LEARNER: {
    name: 'Learner',
    capabilities: ['learn', 'adapt', 'improve', 'optimize'],
    description: 'Learns from feedback and improves performance'
  },
  VERIFIER: {
    name: 'Verifier',
    capabilities: ['verify', 'validate', 'audit', 'report'],
    description: 'Verifies and validates results'
  }
};

module.exports = {
  AgentCommunicationProtocol,
  TransportLayer,
  MessageRouter,
  SchemaRegistry,
  AgentTypes
};