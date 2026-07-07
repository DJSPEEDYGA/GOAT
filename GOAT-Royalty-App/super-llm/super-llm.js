#!/usr/bin/env node
/**
 * Super LLM CLI Entry Point
 * 
 * Command-line interface for the Super LLM system
 * Combines 215 LLMs from NVIDIA Build into one intelligent system
 */

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const SuperLLM = require('./core/SuperLLM');
const SuperLLMIntegration = require('./core/SuperLLMIntegration');

// Version from package.json
const VERSION = require('./package.json').version;

// Configuration paths
const CONFIG_DIR = path.join(os.homedir(), '.super-llm');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Load or create configuration
 */
function loadConfig() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  
  return {
    apiKey: process.env.NVIDIA_BUILD_API_KEY || '',
    defaultModel: 'auto',
    outputFormat: 'text',
    enableCache: true,
    maxRetries: 3,
    timeout: 60000
  };
}

/**
 * Save configuration
 */
function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Initialize the Super LLM instance
 */
function initLLM(options = {}) {
  const config = loadConfig();
  
  if (!config.apiKey && !process.env.NVIDIA_BUILD_API_KEY) {
    console.error(chalk.red('Error: No API key configured.'));
    console.log(chalk.yellow('Run `super-llm config` to set up your API key.'));
    console.log(chalk.gray('Or set NVIDIA_BUILD_API_KEY environment variable.'));
    process.exit(1);
  }
  
  return new SuperLLM({
    apiKey: config.apiKey || process.env.NVIDIA_BUILD_API_KEY,
    defaultModel: options.model || config.defaultModel,
    maxRetries: options.retries || config.maxRetries,
    timeout: options.timeout || config.timeout,
    cacheEnabled: config.enableCache,
    ...options
  });
}

// CLI Program
program
  .name('super-llm')
  .description('AI system combining 215 LLMs with intelligent routing')
  .version(VERSION);

// Query command
program
  .command('query <prompt>')
  .description('Send a query to the Super LLM system')
  .option('-m, --model <model>', 'Specify model (auto, gpt-4o, claude-opus, etc.)', 'auto')
  .option('-t, --task <type>', 'Task type (code, reasoning, creative, math, etc.)')
  .option('-e, --ensemble', 'Use multi-model ensemble mode')
  .option('--models <models>', 'Comma-separated list of models for ensemble')
  .option('-o, --output <format>', 'Output format (text, json, markdown)', 'text')
  .option('--stream', 'Stream the response')
  .option('--no-cache', 'Disable caching')
  .action(async (prompt, options) => {
    const llm = initLLM(options);
    const spinner = ora('Processing query...').start();
    
    try {
      const queryOptions = {
        model: options.model,
        task: options.task,
        cache: options.cache !== false
      };
      
      if (options.ensemble) {
        queryOptions.mode = 'ensemble';
        if (options.models) {
          queryOptions.models = options.models.split(',').map(m => m.trim());
        }
      }
      
      if (options.stream) {
        spinner.stop();
        process.stdout.write(chalk.cyan('\nResponse: '));
        for await (const chunk of llm.streamQuery(prompt, queryOptions)) {
          process.stdout.write(chunk);
        }
        console.log('\n');
      } else {
        const response = await llm.query(prompt, queryOptions);
        spinner.succeed('Query completed');
        
        if (options.output === 'json') {
          console.log(JSON.stringify(response, null, 2));
        } else if (options.output === 'markdown') {
          console.log('\n---\n## Response\n\n' + response.content + '\n---\n');
        } else {
          console.log(chalk.cyan('\nResponse:'), response.content);
          if (response.model) {
            console.log(chalk.gray(`Model: ${response.model}`));
          }
        }
      }
    } catch (error) {
      spinner.fail('Query failed');
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Code command
program
  .command('code <prompt>')
  .description('Generate code using optimal code model')
  .option('-l, --language <lang>', 'Programming language')
  .option('-m, --model <model>', 'Override model selection')
  .option('--explain', 'Include explanation')
  .action(async (prompt, options) => {
    const llm = initLLM(options);
    const integration = new SuperLLMIntegration(llm);
    const spinner = ora('Generating code...').start();
    
    try {
      const codePrompt = options.language 
        ? `Generate ${options.language} code: ${prompt}`
        : `Generate code: ${prompt}`;
      
      const response = await integration.generateCode(codePrompt, {
        language: options.language,
        explain: options.explain
      });
      
      spinner.succeed('Code generated');
      console.log('\n' + chalk.green(response.code));
      
      if (options.explain && response.explanation) {
        console.log(chalk.gray('\n--- Explanation ---\n' + response.explanation));
      }
    } catch (error) {
      spinner.fail('Code generation failed');
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Chat command
program
  .command('chat')
  .description('Start an interactive chat session')
  .option('-m, --model <model>', 'Initial model', 'auto')
  .option('-s, --system <prompt>', 'System prompt')
  .action(async (options) => {
    const llm = initLLM(options);
    console.log(chalk.cyan('🚀 Super LLM Chat - Type "exit" to quit, "model" to change model\n'));
    
    let currentModel = options.model;
    const history = [];
    
    const askQuestion = async () => {
      const { input } = await inquirer.prompt([{
        type: 'input',
        name: 'input',
        message: chalk.blue('You:')
      }]);
      
      if (input.toLowerCase() === 'exit') {
        console.log(chalk.yellow('\nGoodbye!'));
        process.exit(0);
      }
      
      if (input.toLowerCase() === 'model') {
        const { model } = await inquirer.prompt([{
          type: 'input',
          name: 'model',
          message: 'Enter model name (auto, gpt-4o, claude-opus, etc.):'
        }]);
        currentModel = model;
        console.log(chalk.gray(`Model set to: ${model}\n`));
        return askQuestion();
      }
      
      const spinner = ora('Thinking...').start();
      
      try {
        const response = await llm.query(input, {
          model: currentModel,
          history: history.slice(-10),
          system: options.system
        });
        
        history.push({ role: 'user', content: input });
        history.push({ role: 'assistant', content: response.content });
        
        spinner.stop();
        console.log(chalk.green('\nAssistant:'), response.content);
        console.log(chalk.gray(`[${response.model}]\n`));
      } catch (error) {
        spinner.fail('Error');
        console.error(chalk.red(error.message));
      }
      
      askQuestion();
    };
    
    askQuestion();
  });

// Models command
program
  .command('models')
  .description('List available models')
  .option('-c, --category <category>', 'Filter by category')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const llm = initLLM({ model: 'auto' });
    const registry = llm.modelRegistry;
    
    if (options.json) {
      console.log(JSON.stringify(registry, null, 2));
      return;
    }
    
    console.log(chalk.cyan('\n📚 Available Models\n'));
    
    for (const [category, models] of Object.entries(registry)) {
      if (options.category && category !== options.category) continue;
      
      console.log(chalk.yellow(`\n${category.toUpperCase()}`));
      console.log(chalk.gray('─'.repeat(40)));
      
      for (const [id, model] of Object.entries(models)) {
        console.log(`  ${chalk.white(model.name.padEnd(25))} ${chalk.gray(`(${id})`)}`);
        console.log(`    ${chalk.gray('Capabilities:')} ${model.capabilities.join(', ')}`);
        console.log(`    ${chalk.gray('Context:')} ${model.contextWindow.toLocaleString()} tokens`);
      }
    }
    
    console.log(chalk.gray(`\n${Object.keys(registry).length} categories available\n`));
  });

// Config command
program
  .command('config')
  .description('Configure Super LLM settings')
  .option('--api-key <key>', 'Set API key')
  .option('--default-model <model>', 'Set default model')
  .option('--enable-cache <boolean>', 'Enable/disable cache')
  .option('--max-retries <number>', 'Set max retries')
  .action(async (options) => {
    const config = loadConfig();
    
    if (options.apiKey) {
      config.apiKey = options.apiKey;
      console.log(chalk.green('API key updated'));
    }
    
    if (options.defaultModel) {
      config.defaultModel = options.defaultModel;
      console.log(chalk.green(`Default model set to: ${options.defaultModel}`));
    }
    
    if (options.enableCache !== undefined) {
      config.enableCache = options.enableCache === 'true';
      console.log(chalk.green(`Cache ${config.enableCache ? 'enabled' : 'disabled'}`));
    }
    
    if (options.maxRetries) {
      config.maxRetries = parseInt(options.maxRetries);
      console.log(chalk.green(`Max retries set to: ${config.maxRetries}`));
    }
    
    // Interactive config if no options
    if (Object.keys(options).length === 0) {
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'NVIDIA Build API Key:',
          default: config.apiKey ? '********' : ''
        },
        {
          type: 'list',
          name: 'defaultModel',
          message: 'Default model:',
          choices: ['auto', 'gpt-4o', 'claude-opus-4', 'gemini-ultra', 'llama-3'],
          default: config.defaultModel
        },
        {
          type: 'confirm',
          name: 'enableCache',
          message: 'Enable caching?',
          default: config.enableCache
        },
        {
          type: 'number',
          name: 'maxRetries',
          message: 'Max retries:',
          default: config.maxRetries
        }
      ]);
      
      Object.assign(config, answers);
    }
    
    saveConfig(config);
    console.log(chalk.green('\nConfiguration saved!'));
  });

// Stats command
program
  .command('stats')
  .description('Show performance statistics')
  .option('--reset', 'Reset statistics')
  .action((options) => {
    const llm = initLLM();
    const stats = llm.getPerformanceStats();
    
    if (options.reset) {
      llm.resetStats();
      console.log(chalk.green('Statistics reset'));
      return;
    }
    
    console.log(chalk.cyan('\n📊 Performance Statistics\n'));
    console.log(`  ${chalk.white('Total Queries:')} ${stats.queries}`);
    console.log(`  ${chalk.white('Successes:')} ${chalk.green(stats.successes)}`);
    console.log(`  ${chalk.white('Failures:')} ${chalk.red(stats.failures)}`);
    console.log(`  ${chalk.white('Success Rate:')} ${stats.successRate}`);
    console.log(`  ${chalk.white('Avg Latency:')} ${stats.avgLatency}`);
    
    if (Object.keys(stats.modelStats).length > 0) {
      console.log(chalk.yellow('\nModel Usage:'));
      for (const [model, modelStats] of Object.entries(stats.modelStats)) {
        console.log(`  ${model}: ${modelStats.calls} calls, ${modelStats.avgLatency} avg latency`);
      }
    }
    console.log();
  });

// Install command
program
  .command('install')
  .description('Install Super LLM shell integration')
  .option('-s, --shell <shell>', 'Shell type (bash, zsh, fish)')
  .action((options) => {
    const shell = options.shell || process.env.SHELL?.split('/').pop() || 'bash';
    
    let rcFile;
    let command;
    
    if (shell === 'zsh') {
      rcFile = path.join(os.homedir(), '.zshrc');
      command = 'alias sllm="super-llm"';
    } else if (shell === 'fish') {
      rcFile = path.join(os.homedir(), '.config/fish/config.fish');
      command = 'alias sllm super-llm';
    } else {
      rcFile = path.join(os.homedir(), '.bashrc');
      command = 'alias sllm="super-llm"';
    }
    
    const comment = '\n# Super LLM alias\n';
    const aliasLine = command + '\n';
    
    if (fs.existsSync(rcFile)) {
      const content = fs.readFileSync(rcFile, 'utf8');
      if (!content.includes('alias sllm')) {
        fs.appendFileSync(rcFile, comment + aliasLine);
        console.log(chalk.green(`✓ Added alias to ${rcFile}`));
      } else {
        console.log(chalk.yellow('Alias already exists'));
      }
    }
    
    console.log(chalk.cyan('\nRestart your shell or run:'));
    console.log(chalk.gray(`  source ${rcFile}`));
    console.log(chalk.cyan('\nThen use:'));
    console.log(chalk.gray('  sllm query "your prompt"'));
  });

// Royalty command for GOAT-Royalty-App integration
program
  .command('royalty <action>')
  .description('Royalty management commands (GOAT-Royalty-App integration)')
  .option('-d, --data <json>', 'JSON data for analysis')
  .action(async (action, options) => {
    const llm = initLLM(options);
    const integration = new SuperLLMIntegration(llm);
    const spinner = ora(`Processing ${action}...`).start();
    
    try {
      let result;
      
      switch (action) {
        case 'analyze':
          if (!options.data) {
            spinner.fail('Missing --data option');
            process.exit(1);
          }
          result = await integration.analyzeRoyalties(JSON.parse(options.data));
          break;
          
        case 'contract':
          if (!options.data) {
            spinner.fail('Missing --data option');
            process.exit(1);
          }
          result = await integration.analyzeContract(options.data);
          break;
          
        case 'predict':
          if (!options.data) {
            spinner.fail('Missing --data option');
            process.exit(1);
          }
          result = await integration.predictRevenue(JSON.parse(options.data));
          break;
          
        default:
          spinner.fail(`Unknown action: ${action}`);
          console.log(chalk.yellow('Available actions: analyze, contract, predict'));
          process.exit(1);
      }
      
      spinner.succeed(`${action} completed`);
      console.log(chalk.cyan('\nResult:'));
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      spinner.fail(`${action} failed`);
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}