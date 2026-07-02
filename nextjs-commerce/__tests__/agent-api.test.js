'use strict';

/**
 * Tests for src/routes/agent.js
 * Agent capabilities, chat conversation tracking, task execution, and stop endpoint.
 */

// Set minimal env vars before loading any modules
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.LOYALTY_ENCRYPTION_SECRET = 'c'.repeat(64);
process.env.LOYALTY_KEY_HARVEY = 'harvey-test-key-abc123';

// Mock auth middleware so tests never touch JWT or MongoDB.
// These top-level jest.mock() calls are hoisted and applied to every require().
jest.mock('../src/middleware/auth', () => ({
  protect: (req, _res, next) => {
    req.user = { id: 'user-test-123', role: 'admin' };
    next();
  },
  authorize: () => (_req, _res, next) => next(),
}));

// Mock AutonomousAgent so tests don't require real AI API keys
jest.mock('../src/agents/AutonomousAgent', () => {
  return jest.fn().mockImplementation(() => ({
    tools: {
      analyzeRoyalties: { name: 'analyze_royalties', description: 'Analyze royalties', parameters: {} },
      processPayment:   { name: 'process_payment',   description: 'Process payment',   parameters: {} },
    },
    state: {
      isRunning: false,
      currentTask: null,
      iterations: 0,
      results: [],
    },
    run: jest.fn().mockResolvedValue({
      summary: 'Mock agent response',
      results: [{ tool: 'analyze_royalties', output: 'done' }],
    }),
  }));
});

const express = require('express');
const request = require('supertest');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal Express app that mounts the agent router.
 * Uses jest.isolateModules() so each call gets a fresh module instance with
 * an empty `activeAgents` Map, preventing state leakage between tests.
 */
function buildApp() {
  let agentRouter;
  jest.isolateModules(() => {
    agentRouter = require('../src/routes/agent');
  });

  const app = express();
  app.use(express.json());
  app.use('/api/agent', agentRouter);
  // Basic error handler so AppError responses reach the test assertions
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  });
  return app;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/agent/capabilities', () => {
  test('returns success with capabilities array', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/agent/capabilities');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.capabilities)).toBe(true);
    expect(res.body.data.capabilities.length).toBeGreaterThan(0);
    expect(res.body.data.count).toBe(res.body.data.capabilities.length);
  });

  test('each capability has name and description', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/agent/capabilities');
    for (const cap of res.body.data.capabilities) {
      expect(typeof cap.name).toBe('string');
      expect(typeof cap.description).toBe('string');
    }
  });
});

describe('POST /api/agent/chat', () => {
  test('returns 400 when message is missing', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/agent/chat')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns agent response with stable conversationId', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/agent/chat')
      .send({ message: 'Hello agent', conversationId: 'conv-abc-123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.conversationId).toBe('conv-abc-123');
    expect(typeof res.body.data.response).toBe('string');
  });

  test('generates and returns a new conversationId when none is provided', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/agent/chat')
      .send({ message: 'Start a conversation' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    // A new ID starting with "conv-" should be returned consistently
    expect(res.body.data.conversationId).toMatch(/^conv-/);
  });

  test('reuses same conversationId across multiple messages', async () => {
    // Use a single app instance so the shared activeAgents Map retains state
    const app = buildApp();
    const convId = 'conv-persist-test';

    const res1 = await request(app)
      .post('/api/agent/chat')
      .send({ message: 'First message', conversationId: convId });

    const res2 = await request(app)
      .post('/api/agent/chat')
      .send({ message: 'Second message', conversationId: convId });

    expect(res1.body.data.conversationId).toBe(convId);
    expect(res2.body.data.conversationId).toBe(convId);
  });
});

describe('GET /api/agent/list', () => {
  test('returns empty agents array when no agents are running', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/agent/list');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.agents)).toBe(true);
    expect(res.body.data.count).toBe(res.body.data.agents.length);
  });
});

describe('POST /api/agent/tasks/:taskName', () => {
  test('starts a known predefined task and returns 202', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/agent/tasks/monthly-close')
      .send({ parameters: {} });

    expect(res.statusCode).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.taskName).toBe('monthly-close');
    expect(res.body.data.status).toBe('running');
    expect(typeof res.body.data.agentId).toBe('string');
  });

  test('returns 404 for an unknown task name', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/agent/tasks/not-a-real-task')
      .send({ parameters: {} });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/agent/stop/:agentId', () => {
  test('returns 404 when agentId is not found', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/agent/stop/non-existent-agent-id');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
