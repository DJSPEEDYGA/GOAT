// ============================================================
// GOAT BRAIN - Multi-Model Super LLM Orchestrator
// Combines 215+ LLMs into one unified intelligence
// Super GOAT Royalty 3.0 - Harvey Miller (DJ Speedy)
// ============================================================

/**
 * GOAT Brain Orchestration Modes:
 * 
 * 1. CONSENSUS  - Query multiple models, find agreement (voting)
 * 2. BEST-OF-N  - Query N models, pick the best response
 * 3. CHAIN      - Pipeline responses through sequential models
 * 4. SPECIALIST - Auto-route to the best model for the task
 * 5. ENSEMBLE   - Merge/synthesize responses from multiple models
 * 6. DEBATE     - Models critique each other's responses
 * 7. PARALLEL   - Query all models simultaneously, return all
 */

const ORCHESTRATION_MODES = {
  consensus: {
    name: 'Consensus',
    icon: '🗳️',
    description: 'Query 3-5 models, find the most agreed-upon answer',
    minModels: 3,
    maxModels: 7
  },
  bestOfN: {
    name: 'Best of N',
    icon: '🏆',
    description: 'Query N models, use a judge model to pick the best',
    minModels: 2,
    maxModels: 5
  },
  chain: {
    name: 'Chain',
    icon: '🔗',
    description: 'Pipeline through models: draft → refine → polish',
    minModels: 2,
    maxModels: 4
  },
  specialist: {
    name: 'Auto-Specialist',
    icon: '🎯',
    description: 'Automatically route to the best model for the task',
    minModels: 1,
    maxModels: 1
  },
  ensemble: {
    name: 'Ensemble',
    icon: '🧬',
    description: 'Synthesize responses from multiple models into one',
    minModels: 2,
    maxModels: 5
  },
  debate: {
    name: 'Debate',
    icon: '⚔️',
    description: 'Models debate and critique each other for best answer',
    minModels: 2,
    maxModels: 3
  },
  parallel: {
    name: 'Parallel',
    icon: '⚡',
    description: 'Query all selected models simultaneously',
    minModels: 2,
    maxModels: 10
  }
};

// Task classification keywords for auto-routing
const TASK_CLASSIFIERS = {
  code: {
    keywords: ['code', 'program', 'function', 'debug', 'javascript', 'python', 'html', 'css', 'api', 'script', 'compile', 'algorithm', 'git', 'npm', 'class', 'method', 'variable', 'loop', 'syntax', 'regex', 'sql', 'database', 'react', 'node', 'typescript', 'deploy', 'docker', 'backend', 'frontend', 'fullstack'],
    preferredModels: {
      nvidia: ['qwen/qwen2.5-coder-32b-instruct', 'mistralai/codestral-22b-instruct-v0.1', 'meta/codellama-70b'],
      groq: ['llama-3.3-70b-versatile'],
      together: ['Qwen/Qwen2.5-Coder-32B-Instruct']
    }
  },
  reasoning: {
    keywords: ['think', 'reason', 'logic', 'math', 'calculate', 'prove', 'analyze', 'solve', 'puzzle', 'paradox', 'philosophy', 'theorem', 'equation', 'probability', 'statistics', 'step by step', 'chain of thought', 'explain why', 'complex'],
    preferredModels: {
      nvidia: ['deepseek-ai/deepseek-r1', 'qwen/qwq-32b', 'meta/llama-3.1-405b-instruct'],
      groq: ['deepseek-r1-distill-llama-70b', 'qwen-qwq-32b'],
      sambanova: ['DeepSeek-R1', 'QwQ-32B']
    }
  },
  creative: {
    keywords: ['write', 'story', 'poem', 'lyric', 'song', 'creative', 'imagine', 'fiction', 'novel', 'blog', 'essay', 'article', 'content', 'marketing', 'copy', 'slogan', 'brand', 'script', 'screenplay', 'narrative'],
    preferredModels: {
      nvidia: ['meta/llama-3.3-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct', 'mistralai/mistral-large-2-instruct'],
      groq: ['llama-3.3-70b-versatile'],
      together: ['meta-llama/Llama-3.3-70B-Instruct-Turbo']
    }
  },
  music: {
    keywords: ['music', 'beat', 'track', 'album', 'spotify', 'royalty', 'stream', 'playlist', 'mix', 'master', 'bpm', 'key', 'chord', 'melody', 'bass', 'drums', 'producer', 'dj', 'release', 'distribution', 'label', 'genre', 'hip hop', 'rap', 'r&b', 'edm'],
    preferredModels: {
      nvidia: ['meta/llama-3.3-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct', 'qwen/qwen2.5-72b-instruct'],
      groq: ['llama-3.3-70b-versatile'],
      sambanova: ['Meta-Llama-3.3-70B-Instruct']
    }
  },
  analysis: {
    keywords: ['analyze', 'data', 'csv', 'json', 'excel', 'spreadsheet', 'chart', 'graph', 'visualization', 'report', 'metrics', 'kpi', 'dashboard', 'insight', 'trend', 'compare', 'benchmark', 'performance', 'revenue', 'profit'],
    preferredModels: {
      nvidia: ['deepseek-ai/deepseek-r1', 'meta/llama-3.1-405b-instruct', 'qwen/qwen2.5-72b-instruct'],
      groq: ['llama-3.3-70b-versatile'],
      together: ['meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo']
    }
  },
  general: {
    keywords: [],
    preferredModels: {
      nvidia: ['meta/llama-3.3-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct'],
      groq: ['llama-3.3-70b-versatile'],
      together: ['meta-llama/Llama-3.3-70B-Instruct-Turbo']
    }
  }
};

class GOATBrain {
  constructor(callModelFn) {
    // callModelFn(provider, modelId, messages, options) => Promise<{content, model, provider}>
    this.callModel = callModelFn;
    this.history = [];
  }

  /**
   * Classify the task type from user message
   */
  classifyTask(message) {
    const msg = message.toLowerCase();
    let bestMatch = 'general';
    let bestScore = 0;

    for (const [taskType, config] of Object.entries(TASK_CLASSIFIERS)) {
      if (taskType === 'general') continue;
      const score = config.keywords.reduce((acc, kw) => {
        return acc + (msg.includes(kw) ? 1 : 0);
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = taskType;
      }
    }

    return bestMatch;
  }

  /**
   * Get recommended models for a task
   */
  getSpecialistModels(taskType, availableProviders) {
    const classifier = TASK_CLASSIFIERS[taskType] || TASK_CLASSIFIERS.general;
    const models = [];

    for (const [provider, modelIds] of Object.entries(classifier.preferredModels)) {
      if (availableProviders.includes(provider) || provider === 'nvidia') {
        for (const modelId of modelIds) {
          models.push({ provider, modelId });
        }
      }
    }

    return models;
  }

  /**
   * SPECIALIST MODE - Auto-route to best model
   */
  async specialist(messages, availableProviders, settings) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const taskType = this.classifyTask(lastMessage);
    const specialists = this.getSpecialistModels(taskType, availableProviders);

    if (specialists.length === 0) {
      throw new Error('No suitable models available for this task');
    }

    const chosen = specialists[0];
    const result = await this.callModel(chosen.provider, chosen.modelId, messages, settings);

    return {
      mode: 'specialist',
      taskType,
      chosenModel: chosen,
      response: result.content,
      metadata: {
        model: chosen.modelId,
        provider: chosen.provider,
        taskType,
        usage: result.usage
      }
    };
  }

  /**
   * CONSENSUS MODE - Query multiple models, find agreement
   */
  async consensus(messages, modelConfigs, settings) {
    // Query all models in parallel
    const promises = modelConfigs.map(config =>
      this.callModel(config.provider, config.modelId, messages, settings)
        .then(r => ({ success: true, ...r, config }))
        .catch(e => ({ success: false, error: e.message, config }))
    );

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success);

    if (successful.length === 0) {
      throw new Error('All models failed. Check API keys and connectivity.');
    }

    if (successful.length === 1) {
      return {
        mode: 'consensus',
        response: successful[0].content,
        responses: successful.map(r => ({ model: r.config.modelId, content: r.content })),
        agreement: 1.0,
        metadata: { modelsQueried: modelConfigs.length, modelsResponded: successful.length }
      };
    }

    // Use the first successful model as a judge to synthesize
    const judgeMessages = [
      ...messages,
      {
        role: 'user',
        content: `I have received ${successful.length} responses from different AI models to my last question. Please synthesize these into one definitive, best answer. Find the consensus - what do most models agree on? If there are disagreements, explain the strongest position.

${successful.map((r, i) => `**Model ${i + 1} (${r.config.modelId}):**\n${r.content}`).join('\n\n---\n\n')}

Please provide a unified, synthesized answer:`
      }
    ];

    const synthesis = await this.callModel(
      successful[0].config.provider,
      successful[0].config.modelId,
      judgeMessages,
      settings
    );

    return {
      mode: 'consensus',
      response: synthesis.content,
      responses: successful.map(r => ({ model: r.config.modelId, provider: r.config.provider, content: r.content })),
      failures: results.filter(r => !r.success).map(r => ({ model: r.config.modelId, error: r.error })),
      metadata: {
        modelsQueried: modelConfigs.length,
        modelsResponded: successful.length,
        judge: successful[0].config.modelId
      }
    };
  }

  /**
   * BEST-OF-N MODE - Pick the best response
   */
  async bestOfN(messages, modelConfigs, judgeConfig, settings) {
    const promises = modelConfigs.map(config =>
      this.callModel(config.provider, config.modelId, messages, settings)
        .then(r => ({ success: true, ...r, config }))
        .catch(e => ({ success: false, error: e.message, config }))
    );

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success);

    if (successful.length === 0) throw new Error('All models failed');
    if (successful.length === 1) {
      return { mode: 'bestOfN', response: successful[0].content, winner: successful[0].config.modelId };
    }

    // Ask judge to pick the best
    const judgeMessages = [
      ...messages,
      {
        role: 'user',
        content: `You are a response quality judge. I asked ${successful.length} AI models the same question. Please evaluate each response for accuracy, completeness, helpfulness, and clarity. Then provide the BEST response, or create an improved version based on the best parts of each.

${successful.map((r, i) => `**Response ${i + 1} (${r.config.modelId}):**\n${r.content}`).join('\n\n---\n\n')}

Please provide the best response (you may combine the best elements):`
      }
    ];

    const judge = judgeConfig || successful[0].config;
    const verdict = await this.callModel(judge.provider, judge.modelId, judgeMessages, settings);

    return {
      mode: 'bestOfN',
      response: verdict.content,
      responses: successful.map(r => ({ model: r.config.modelId, content: r.content })),
      judge: judge.modelId,
      metadata: { modelsQueried: modelConfigs.length, modelsResponded: successful.length }
    };
  }

  /**
   * CHAIN MODE - Pipeline through sequential models
   */
  async chain(messages, modelConfigs, settings) {
    let currentContent = messages[messages.length - 1]?.content || '';
    const chainResults = [];
    const roles = ['Draft Generator', 'Refiner & Fact-Checker', 'Final Polish & Formatting', 'Quality Assurance'];

    for (let i = 0; i < modelConfigs.length; i++) {
      const config = modelConfigs[i];
      const role = roles[i] || `Step ${i + 1}`;

      const chainMessages = i === 0
        ? messages
        : [
          ...messages.slice(0, -1),
          {
            role: 'user',
            content: `You are acting as the "${role}" in a multi-model pipeline. The previous model generated this response to the user's question:

**Previous Response:**
${currentContent}

**Your role:** ${role}. Please improve, refine, correct any errors, and enhance this response. Make it better while keeping the core content. If you are the final step, ensure perfect formatting and presentation.`
          }
        ];

      try {
        const result = await this.callModel(config.provider, config.modelId, chainMessages, settings);
        currentContent = result.content;
        chainResults.push({
          step: i + 1,
          role,
          model: config.modelId,
          provider: config.provider,
          content: result.content
        });
      } catch (error) {
        chainResults.push({ step: i + 1, role, model: config.modelId, error: error.message });
        // Continue with previous content if a step fails
      }
    }

    return {
      mode: 'chain',
      response: currentContent,
      chain: chainResults,
      metadata: {
        steps: modelConfigs.length,
        completed: chainResults.filter(r => !r.error).length
      }
    };
  }

  /**
   * ENSEMBLE MODE - Synthesize multiple responses into one
   */
  async ensemble(messages, modelConfigs, settings) {
    const promises = modelConfigs.map(config =>
      this.callModel(config.provider, config.modelId, messages, settings)
        .then(r => ({ success: true, ...r, config }))
        .catch(e => ({ success: false, error: e.message, config }))
    );

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success);

    if (successful.length === 0) throw new Error('All models failed');
    if (successful.length === 1) {
      return { mode: 'ensemble', response: successful[0].content };
    }

    // Use the strongest model (first in list) to synthesize
    const synthesisMessages = [
      ...messages,
      {
        role: 'user',
        content: `You are synthesizing responses from ${successful.length} different AI models into one comprehensive, authoritative answer. Take the best insights, most accurate information, and clearest explanations from each response. Create a single unified response that is better than any individual one.

${successful.map((r, i) => `**Model ${i + 1} (${r.config.modelId}):**\n${r.content}`).join('\n\n---\n\n')}

Create a single synthesized, comprehensive response:`
      }
    ];

    const synthesis = await this.callModel(
      successful[0].config.provider,
      successful[0].config.modelId,
      synthesisMessages,
      settings
    );

    return {
      mode: 'ensemble',
      response: synthesis.content,
      sources: successful.map(r => ({ model: r.config.modelId, content: r.content })),
      metadata: { modelsUsed: successful.length, synthesizer: successful[0].config.modelId }
    };
  }

  /**
   * DEBATE MODE - Models critique each other
   */
  async debate(messages, modelConfigs, settings, rounds = 2) {
    if (modelConfigs.length < 2) throw new Error('Debate requires at least 2 models');

    const debateLog = [];

    // Round 1: Initial responses
    const initialPromises = modelConfigs.slice(0, 2).map(config =>
      this.callModel(config.provider, config.modelId, messages, settings)
        .then(r => ({ success: true, ...r, config }))
        .catch(e => ({ success: false, error: e.message, config }))
    );

    const initialResults = await Promise.all(initialPromises);
    const [model1, model2] = initialResults;

    if (!model1?.success || !model2?.success) {
      const working = initialResults.find(r => r.success);
      if (working) return { mode: 'debate', response: working.content };
      throw new Error('Both debate models failed');
    }

    debateLog.push(
      { round: 1, model: model1.config.modelId, role: 'Initial Response', content: model1.content },
      { round: 1, model: model2.config.modelId, role: 'Initial Response', content: model2.content }
    );

    let lastResponse1 = model1.content;
    let lastResponse2 = model2.content;

    // Debate rounds
    for (let round = 2; round <= rounds + 1; round++) {
      // Model 1 critiques Model 2
      const critique1Messages = [...messages, {
        role: 'user',
        content: `Another AI model responded to the same question with this answer:\n\n${lastResponse2}\n\nYour previous answer was:\n\n${lastResponse1}\n\nPlease critique the other model's response, identify any errors or missing information, and provide your improved, definitive answer.`
      }];

      // Model 2 critiques Model 1
      const critique2Messages = [...messages, {
        role: 'user',
        content: `Another AI model responded to the same question with this answer:\n\n${lastResponse1}\n\nYour previous answer was:\n\n${lastResponse2}\n\nPlease critique the other model's response, identify any errors or missing information, and provide your improved, definitive answer.`
      }];

      const [r1, r2] = await Promise.all([
        this.callModel(model1.config.provider, model1.config.modelId, critique1Messages, settings).catch(e => ({ content: lastResponse1 })),
        this.callModel(model2.config.provider, model2.config.modelId, critique2Messages, settings).catch(e => ({ content: lastResponse2 }))
      ]);

      lastResponse1 = r1.content;
      lastResponse2 = r2.content;

      debateLog.push(
        { round, model: model1.config.modelId, role: 'Critique & Revision', content: r1.content },
        { round, model: model2.config.modelId, role: 'Critique & Revision', content: r2.content }
      );
    }

    // Final synthesis
    const judgeModel = modelConfigs[2] || modelConfigs[0];
    const judgeMessages = [...messages, {
      role: 'user',
      content: `Two AI models debated this question over ${rounds} rounds. Here are their final positions:

**Model A (${model1.config.modelId}):**
${lastResponse1}

**Model B (${model2.config.modelId}):**
${lastResponse2}

As the final judge, provide the definitive best answer, incorporating the strongest arguments from both sides.`
    }];

    const finalVerdict = await this.callModel(judgeModel.provider, judgeModel.modelId, judgeMessages, settings);

    return {
      mode: 'debate',
      response: finalVerdict.content,
      debateLog,
      metadata: {
        rounds: rounds + 1,
        model1: model1.config.modelId,
        model2: model2.config.modelId,
        judge: judgeModel.modelId
      }
    };
  }

  /**
   * PARALLEL MODE - Query all models simultaneously, return all
   */
  async parallel(messages, modelConfigs, settings) {
    const promises = modelConfigs.map(config =>
      this.callModel(config.provider, config.modelId, messages, settings)
        .then(r => ({ success: true, ...r, config }))
        .catch(e => ({ success: false, error: e.message, config }))
    );

    const results = await Promise.all(promises);

    return {
      mode: 'parallel',
      response: results.filter(r => r.success)[0]?.content || 'All models failed',
      responses: results.map(r => ({
        model: r.config.modelId,
        provider: r.config.provider,
        success: r.success,
        content: r.success ? r.content : null,
        error: r.success ? null : r.error
      })),
      metadata: {
        total: modelConfigs.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
  }

  /**
   * Main orchestration entry point
   */
  async orchestrate(mode, messages, modelConfigs, settings = {}) {
    const startTime = Date.now();

    let result;
    switch (mode) {
      case 'specialist':
        result = await this.specialist(messages, settings.availableProviders || ['nvidia'], settings);
        break;
      case 'consensus':
        result = await this.consensus(messages, modelConfigs, settings);
        break;
      case 'bestOfN':
        result = await this.bestOfN(messages, modelConfigs, settings.judgeConfig, settings);
        break;
      case 'chain':
        result = await this.chain(messages, modelConfigs, settings);
        break;
      case 'ensemble':
        result = await this.ensemble(messages, modelConfigs, settings);
        break;
      case 'debate':
        result = await this.debate(messages, modelConfigs, settings, settings.debateRounds || 2);
        break;
      case 'parallel':
        result = await this.parallel(messages, modelConfigs, settings);
        break;
      default:
        throw new Error(`Unknown orchestration mode: ${mode}`);
    }

    result.duration = Date.now() - startTime;
    this.history.push({ timestamp: new Date().toISOString(), mode, models: modelConfigs.length, duration: result.duration });

    return result;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GOATBrain, ORCHESTRATION_MODES, TASK_CLASSIFIERS };
}