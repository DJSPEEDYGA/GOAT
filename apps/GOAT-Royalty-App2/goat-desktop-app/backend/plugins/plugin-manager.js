/**
 * GOAT Plugin System
 * Extensible plugin architecture for unlimited customization
 */

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = {
      'before-process': [],
      'after-process': [],
      'on-error': [],
      'on-mining-start': [],
      'on-mining-stop': [],
      'on-royalty-calc': [],
      'on-blockchain-tx': [],
      'on-ai-response': []
    };
    this.loadBuiltInPlugins();
  }

  loadBuiltInPlugins() {
    // AI Assistant Plugin
    this.register({
      name: 'AI Assistant',
      version: '1.0.0',
      description: 'AI-powered assistant for all operations',
      hooks: {
        'before-process': async (data) => {
          console.log('AI Assistant enhancing request...');
          return { ...data, enhanced: true };
        }
      }
    });

    // Auto-Optimizer Plugin
    this.register({
      name: 'Auto-Optimizer',
      version: '1.0.0',
      description: 'Automatically optimizes settings for best performance',
      hooks: {
        'on-mining-start': async (data) => {
          console.log('Optimizing mining settings...');
          return { ...data, optimized: true };
        }
      }
    });

    // Analytics Tracker Plugin
    this.register({
      name: 'Analytics Tracker',
      version: '1.0.0',
      description: 'Tracks and analyzes all app usage',
      hooks: {
        'after-process': async (data) => {
          console.log('Recording analytics...');
          return data;
        }
      }
    });
  }

  register(plugin) {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }
    
    this.plugins.set(plugin.name, plugin);
    
    // Register hooks
    if (plugin.hooks) {
      for (const [hookName, handler] of Object.entries(plugin.hooks)) {
        if (this.hooks[hookName]) {
          this.hooks[hookName].push({ plugin: plugin.name, handler });
        }
      }
    }
    
    console.log(`Plugin registered: ${plugin.name}`);
    return true;
  }

  unregister(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return false;
    
    // Remove hooks
    if (plugin.hooks) {
      for (const hookName of Object.keys(plugin.hooks)) {
        this.hooks[hookName] = this.hooks[hookName].filter(
          h => h.plugin !== pluginName
        );
      }
    }
    
    this.plugins.delete(pluginName);
    return true;
  }

  async executeHook(hookName, data) {
    const hooks = this.hooks[hookName];
    if (!hooks || hooks.length === 0) return data;
    
    let result = data;
    for (const { handler } of hooks) {
      try {
        result = await handler(result);
      } catch (error) {
        console.error(`Hook error in ${hookName}:`, error);
      }
    }
    return result;
  }

  getPlugins() {
    return Array.from(this.plugins.values());
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  createCustomPlugin(config) {
    const plugin = {
      name: config.name || 'Custom Plugin',
      version: config.version || '1.0.0',
      description: config.description || 'User-created plugin',
      hooks: config.hooks || {},
      customFunctions: config.functions || {}
    };
    
    this.register(plugin);
    return plugin;
  }
}

module.exports = PluginManager;