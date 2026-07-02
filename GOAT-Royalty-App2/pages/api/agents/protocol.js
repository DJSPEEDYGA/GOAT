import { AgentCommunicationProtocol, TransportLayer, MessageRouter, SchemaRegistry } from '../../../lib/agents/protocol.js';

// Initialize Agent Communication Protocol
const transportLayer = new TransportLayer();
const schemaRegistry = new SchemaRegistry();
const messageRouter = new MessageRouter(transportLayer, schemaRegistry);

const acp = new AgentCommunicationProtocol({
  transportLayer,
  messageRouter,
  schemaRegistry
});

// Register standard schemas
schemaRegistry.register('royalty-query', {
  type: 'object',
  properties: {
    artistId: { type: 'string' },
    dateRange: { type: 'object' },
    platforms: { type: 'array' }
  },
  required: ['artistId']
});

schemaRegistry.register('payment-request', {
  type: 'object',
  properties: {
    recipientId: { type: 'string' },
    amount: { type: 'number' },
    currency: { type: 'string' }
  },
  required: ['recipientId', 'amount']
});

schemaRegistry.register('analytics-request', {
  type: 'object',
  properties: {
    metricType: { type: 'string' },
    filters: { type: 'object' },
    granularity: { type: 'string' }
  },
  required: ['metricType']
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action, agentId, agentInfo, targetAgent, capability, message, messageType, payload, schemaName, schema } = req.body;

      switch (action) {
        case 'register':
          // Register an agent with the protocol
          acp.registerAgent(agentId, agentInfo || {});
          return res.status(200).json({
            success: true,
            agentId,
            message: 'Agent registered successfully'
          });

        case 'unregister':
          // Unregister an agent
          acp.unregisterAgent(agentId);
          return res.status(200).json({
            success: true,
            agentId,
            message: 'Agent unregistered successfully'
          });

        case 'send':
          // Send a message to a specific agent
          const sendResult = await acp.sendMessage(agentId, targetAgent, message);
          return res.status(200).json({
            success: true,
            from: agentId,
            to: targetAgent,
            messageId: sendResult.messageId,
            status: sendResult.status
          });

        case 'broadcast':
          // Broadcast a message to all agents with a capability
          const broadcastResult = await acp.broadcastToCapability(agentId, capability, message);
          return res.status(200).json({
            success: true,
            from: agentId,
            capability,
            recipients: broadcastResult.recipients,
            messageId: broadcastResult.messageId
          });

        case 'request':
          // Send a request and wait for response
          const response = await acp.request(agentId, targetAgent, message, {
            timeout: req.body.timeout || 30000
          });
          return res.status(200).json({
            success: true,
            request: message,
            response
          });

        case 'subscribe':
          // Subscribe to a message type
          acp.subscribe(agentId, messageType, req.body.callback);
          return res.status(200).json({
            success: true,
            agentId,
            messageType,
            message: 'Subscribed to message type'
          });

        case 'agents':
          // List all registered agents
          const agents = acp.getRegisteredAgents();
          return res.status(200).json({
            success: true,
            agents
          });

        case 'capabilities':
          // Find agents with specific capability
          const capableAgents = acp.findAgentsByCapability(capability);
          return res.status(200).json({
            success: true,
            capability,
            agents: capableAgents
          });

        case 'schema-register':
          // Register a new message schema
          schemaRegistry.register(schemaName, schema);
          return res.status(200).json({
            success: true,
            schemaName,
            message: 'Schema registered successfully'
          });

        case 'schema-validate':
          // Validate a payload against a schema
          const validation = schemaRegistry.validate(schemaName, payload);
          return res.status(200).json({
            success: true,
            schemaName,
            valid: validation.valid,
            errors: validation.errors || []
          });

        case 'schemas':
          // List all registered schemas
          return res.status(200).json({
            success: true,
            schemas: schemaRegistry.list()
          });

        case 'status':
          // Get protocol status
          return res.status(200).json({
            success: true,
            status: {
              registeredAgents: acp.getRegisteredAgents().length,
              activeConnections: transportLayer.activeConnections?.size || 0,
              messagesRouted: messageRouter.messagesRouted || 0
            }
          });

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action'
          });
      }
    } catch (error) {
      console.error('Agent Protocol API error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET request - return API info
  return res.status(200).json({
    name: 'GOAT Agent Communication Protocol API',
    version: '1.0.0',
    protocol: 'ACP (Agent Communication Protocol)',
    compatibleWith: ['MCP (Model Context Protocol)', 'A2A (Agent-to-Agent)'],
    capabilities: [
      'Agent registration and discovery',
      'Point-to-point messaging',
      'Capability-based broadcasting',
      'Request-response patterns',
      'Schema validation',
      'Message routing'
    ],
    endpoints: {
      'POST /api/agents/protocol': {
        actions: ['register', 'unregister', 'send', 'broadcast', 'request', 'subscribe', 'agents', 'capabilities', 'schema-register', 'schema-validate', 'schemas', 'status'],
        description: 'Agent Communication Protocol for cross-framework collaboration'
      }
    }
  });
}