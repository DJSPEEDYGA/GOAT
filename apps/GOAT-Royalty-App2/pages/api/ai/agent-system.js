/**
 * GOAT Royalty App - AI Agent System API
 * 
 * API endpoints for the advanced multi-agent system
 */

import { MultiAgentSystem } from '../../../lib/GOAT_AGENT_SYSTEM.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the multi-agent system
let agentSystem = null;

function getAgentSystem() {
  if (!agentSystem) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    agentSystem = new MultiAgentSystem({
      llm: model,
      verbose: process.env.NODE_ENV === 'development'
    });
  }
  return agentSystem;
}

export default async function handler(req, res) {
  const { method } = req;
  
  try {
    const system = getAgentSystem();
    
    switch (method) {
      case 'GET':
        return handleGet(req, res, system);
      case 'POST':
        return handlePost(req, res, system);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Agent System API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

async function handleGet(req, res, system) {
  const { action } = req.query;
  
  switch (action) {
    case 'status':
      return res.status(200).json({
        success: true,
        status: system.getStatus()
      });
      
    case 'agents':
      return res.status(200).json({
        success: true,
        agents: Array.from(system.agents.values()).map(a => ({
          id: a.id,
          name: a.name,
          role: a.role,
          capabilities: a.capabilities,
          specialization: a.specialization
        }))
      });
      
    case 'learning':
      return res.status(200).json({
        success: true,
        learning: system.learningSystem.getPerformanceReport()
      });
      
    default:
      return res.status(200).json({
        success: true,
        message: 'GOAT Agent System API',
        endpoints: {
          'GET /api/ai/agent-system?action=status': 'Get system status',
          'GET /api/ai/agent-system?action=agents': 'List all agents',
          'GET /api/ai/agent-system?action=learning': 'Get learning metrics',
          'POST /api/ai/agent-system': 'Execute actions',
        },
        actions: [
          'execute-goal',
          'query-rag',
          'make-decision',
          'add-experience'
        ]
      });
  }
}

async function handlePost(req, res, system) {
  const { action, data } = req.body;
  
  switch (action) {
    case 'execute-goal':
      const goalResult = await system.executeGoal(data.goal);
      return res.status(200).json({
        success: true,
        result: goalResult
      });
      
    case 'query-rag':
      const ragResult = await system.queryRAG(data.question);
      return res.status(200).json({
        success: true,
        result: ragResult
      });
      
    case 'make-decision':
      const decision = system.makeDecision(data.options, data.context);
      return res.status(200).json({
        success: true,
        decision
      });
      
    case 'add-experience':
      await system.learningSystem.recordExperience(data.experience);
      return res.status(200).json({
        success: true,
        message: 'Experience recorded'
      });
      
    default:
      return res.status(400).json({
        success: false,
        error: `Unknown action: ${action}`,
        availableActions: ['execute-goal', 'query-rag', 'make-decision', 'add-experience']
      });
  }
}