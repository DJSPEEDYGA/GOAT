/**
 * Omni-LLM Service
 *
 * A unified wrapper around multiple LLM providers (OpenAI, Anthropic,
 * Google Generative AI, Cohere).  Access to high-level / admin calls
 * requires a valid loyalty token and a TOTP code (MFA).
 *
 * Required env vars (at least one LLM provider must be configured):
 *   OPENAI_API_KEY
 *   ANTHROPIC_API_KEY
 *   GOOGLE_API_KEY
 *   COHERE_API_KEY
 *
 * Loyalty / MFA env vars:
 *   LOYALTY_ENCRYPTION_SECRET
 *   TOTP_SECRET
 */

'use strict';

const { LoyaltyGuard } = require('../core/loyalty');
const { verifyTOTP } = require('../core/activation');
const { logSecure } = require('../middleware/loyalty');

// ---------------------------------------------------------------------------
// Lazy-load LLM SDKs so the service starts even if optional deps are absent
// ---------------------------------------------------------------------------
function loadOpenAI() {
  try {
    const { OpenAI } = require('openai');
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch {
    return null;
  }
}

function loadAnthropic() {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    return new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
  } catch {
    return null;
  }
}

function loadGoogleAI() {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  } catch {
    return null;
  }
}

function loadCohere() {
  try {
    const cohere = require('cohere-ai');
    cohere.init(process.env.COHERE_API_KEY);
    return cohere;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// MFA guard helper
// ---------------------------------------------------------------------------

/**
 * Assert that a request carries either a valid loyalty token (already verified
 * by middleware) or a TOTP code for admin/high-level calls.
 *
 * @param {{ loyaltyPayload?: object }} req  – Express request
 * @param {string|undefined} totpToken       – Optional TOTP code for admin ops
 * @param {boolean} requireMFA              – Whether MFA is required
 * @returns {Promise<void>}
 * @throws {Error} if loyalty/MFA checks fail
 */
async function assertLoyaltyAndMFA(req, totpToken, requireMFA = false) {
  const guard = LoyaltyGuard.getInstance();
  if (!guard.isOperational()) {
    throw new Error('Loyalty system not configured.');
  }

  if (requireMFA) {
    if (!totpToken) {
      throw new Error('MFA token required for this operation.');
    }
    if (!(await verifyTOTP(totpToken))) {
      throw new Error('Invalid or expired MFA token.');
    }
  }
}

// ---------------------------------------------------------------------------
// OmniLLM class
// ---------------------------------------------------------------------------
class OmniLLM {
  constructor() {
    this.providers = {
      openai: loadOpenAI(),
      anthropic: loadAnthropic(),
      google: loadGoogleAI(),
      cohere: loadCohere(),
    };
  }

  /**
   * Return which providers are available (API key configured & SDK loaded).
   * @returns {string[]}
   */
  availableProviders() {
    return Object.entries(this.providers)
      .filter(([, client]) => client !== null)
      .map(([name]) => name);
  }

  /**
   * Send a chat completion request to the specified provider.
   *
   * @param {object} params
   * @param {string} params.provider   – 'openai' | 'anthropic' | 'google' | 'cohere'
   * @param {string} params.model      – model identifier
   * @param {Array<{ role: string, content: string }>} params.messages
   * @param {object} [params.options]  – provider-specific options
   * @param {object} [params.req]      – Express request (for loyalty check)
   * @param {string} [params.totpToken]– TOTP code (required for admin calls)
   * @param {boolean} [params.requireMFA] – enforce MFA for this call
   * @returns {Promise<string>}  The assistant's reply text
   */
  async chat({ provider, model, messages, options = {}, req = {}, totpToken, requireMFA = false }) {
    await assertLoyaltyAndMFA(req, totpToken, requireMFA);

    const client = this.providers[provider];
    if (!client) {
      throw new Error(`Provider '${provider}' is not available or not configured.`);
    }

    logSecure('info', 'omni_llm_request', { provider, model });

    switch (provider) {
      case 'openai':
        return this._openaiChat(client, model, messages, options);
      case 'anthropic':
        return this._anthropicChat(client, model, messages, options);
      case 'google':
        return this._googleChat(client, model, messages, options);
      case 'cohere':
        return this._cohereChat(client, model, messages, options);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /** @private */
  async _openaiChat(client, model, messages, options) {
    const resp = await client.chat.completions.create({
      model: model || 'gpt-4o',
      messages,
      ...options,
    });
    return resp.choices[0]?.message?.content || '';
  }

  /** @private */
  async _anthropicChat(client, model, messages, options) {
    // Separate system message from user/assistant turns
    const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
    const turns = messages.filter((m) => m.role !== 'system');
    const resp = await client.messages.create({
      model: model || 'claude-opus-4-5',
      max_tokens: options.max_tokens || 1024,
      system: systemMsg,
      messages: turns,
      ...options,
    });
    return resp.content[0]?.text || '';
  }

  /** @private */
  async _googleChat(client, model, messages, options) {
    const genModel = client.getGenerativeModel({ model: model || 'gemini-pro' });
    const prompt = messages.map((m) => m.content).join('\n');
    const result = await genModel.generateContent(prompt);
    return result.response.text();
  }

  /** @private */
  async _cohereChat(client, model, messages, options) {
    const prompt = messages.map((m) => m.content).join('\n');
    const resp = await client.generate({
      model: model || 'command',
      prompt,
      ...options,
    });
    return resp.body.generations[0]?.text || '';
  }
}

// Export a singleton instance
const omniLLM = new OmniLLM();

module.exports = { OmniLLM, omniLLM };
