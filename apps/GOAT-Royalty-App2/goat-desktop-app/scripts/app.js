/**
 * GOAT Royalty App - Main Application Script
 * Desktop application with AI agents and royalty management
 */

const { ipcRenderer } = require('electron');

// Application State
const AppState = {
  currentSection: 'dashboard',
  selectedModel: 'gpt-4-turbo',
  miningActive: false,
  autonomousMode: true,
  settings: {
    theme: 'dark',
    aiProvider: 'auto',
    defaultNetwork: 'ethereum',
    blockchainVerification: true
  },
  agents: {
    orchestrator: { status: 'ready', tasks: 0 },
    coder: { status: 'ready', tasks: 0 },
    analyst: { status: 'ready', tasks: 0 },
    royalty: { status: 'ready', tasks: 0 },
    blockchain: { status: 'ready', tasks: 0 },
    mining: { status: 'ready', tasks: 0 },
    distribution: { status: 'ready', tasks: 0 },
    video: { status: 'ready', tasks: 0 },
    audio: { status: 'ready', tasks: 0 }
  },
  chat: {
    messages: [],
    context: []
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  console.log('[GOAT] Initializing application...');
  
  // Set up window controls
  setupWindowControls();
  
  // Set up navigation
  setupNavigation();
  
  // Set up AI Chat
  setupAIChat();
  
  // Set up Mining
  setupMining();
  
  // Set up Wallet
  setupWallet();
  
  // Set up Orchestrator
  setupOrchestrator();
  
  // Load settings
  loadSettings();
  
  console.log('[GOAT] Application initialized');
}

// Window Controls
function setupWindowControls() {
  document.getElementById('btnMinimize')?.addEventListener('click', () => {
    ipcRenderer.send('window:minimize');
  });
  
  document.getElementById('btnMaximize')?.addEventListener('click', () => {
    ipcRenderer.send('window:maximize');
  });
  
  document.getElementById('btnClose')?.addEventListener('click', () => {
    ipcRenderer.send('window:close');
  });
}

// Navigation
function setupNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  
  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      if (section) {
        navigateToSection(section);
      }
    });
  });
}

function navigateToSection(sectionId) {
  // Update sidebar
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === sectionId) {
      item.classList.add('active');
    }
  });
  
  // Update content
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = document.getElementById(`section-${sectionId}`);
  if (targetSection) {
    targetSection.classList.add('active');
    AppState.currentSection = sectionId;
  }
}

// AI Chat
function setupAIChat() {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('btnSend');
  const modelOptions = document.querySelectorAll('.model-option');
  
  // Send message on button click
  sendBtn?.addEventListener('click', () => {
    sendChatMessage();
  });
  
  // Send message on Enter (Shift+Enter for new line)
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  
  // Model selection
  modelOptions.forEach(option => {
    option.addEventListener('click', () => {
      modelOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      AppState.selectedModel = option.dataset.model;
      
      // Update model indicator
      const modelIndicator = document.querySelector('.current-model');
      if (modelIndicator) {
        modelIndicator.textContent = option.querySelector('.model-name').textContent;
      }
    });
  });
  
  // Auto-resize textarea
  chatInput?.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });
}

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput?.value.trim();
  
  if (!message) return;
  
  // Add user message to UI
  addChatMessage('user', message);
  chatInput.value = '';
  chatInput.style.height = 'auto';
  
  // Show typing indicator
  showTypingIndicator();
  
  try {
    // Send to AI
    const response = await invokeAIChat(message);
    
    // Remove typing indicator
    hideTypingIndicator();
    
    // Add AI response
    addChatMessage('assistant', response);
  } catch (error) {
    hideTypingIndicator();
    addChatMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
    console.error('[GOAT] Chat error:', error);
  }
}

function addChatMessage(role, content) {
  const messagesContainer = document.getElementById('chatMessages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  const avatar = role === 'user' ? '👤' : '🐐';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-text">${formatMessage(content)}</div>
    </div>
  `;
  
  messagesContainer?.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Store in state
  AppState.chat.messages.push({ role, content });
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('chatMessages');
  
  const indicator = document.createElement('div');
  indicator.id = 'typingIndicator';
  indicator.className = 'message assistant';
  indicator.innerHTML = `
    <div class="message-avatar">🐐</div>
    <div class="message-content">
      <div class="message-text">Thinking...</div>
    </div>
  `;
  
  messagesContainer?.appendChild(indicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  indicator?.remove();
}

async function invokeAIChat(message) {
  try {
    const response = await ipcRenderer.invoke('ai:chat', {
      messages: [...AppState.chat.messages, { role: 'user', content: message }],
      model: AppState.selectedModel
    });
    
    return response.choices?.[0]?.message?.content || 'I received your message but could not generate a response.';
  } catch (error) {
    // Fallback to simulated response
    return generateSimulatedResponse(message);
  }
}

function generateSimulatedResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('royalty') || lowerMessage.includes('payment')) {
    return "I can help you with royalty management. The GOAT Royalty App provides comprehensive tools for tracking, calculating, and distributing royalties across all major platforms. Would you like me to help you calculate royalties for a specific work, or do you need assistance with payment verification on the blockchain?";
  }
  
  if (lowerMessage.includes('blockchain') || lowerMessage.includes('verify')) {
    return "Blockchain verification is a core feature of GOAT. All royalty transactions can be verified on-chain, providing immutable proof of ownership and payments. I can help you verify transactions, create proof records, or deploy smart contracts for automated royalty distribution.";
  }
  
  if (lowerMessage.includes('mining') || lowerMessage.includes('crypto')) {
    return "The mining module supports multiple cryptocurrencies including Bitcoin, Ethereum Classic, Ravencoin, and more. You can configure mining intensity, select pools, and enable automatic profit switching. Would you like me to help you start mining or optimize your current setup?";
  }
  
  if (lowerMessage.includes('ai') || lowerMessage.includes('agent')) {
    return "GOAT features a hierarchical AI agent architecture with an Orchestrator that coordinates specialized worker agents. The workers include: Coder (code generation), Analyst (data analysis), Royalty (royalty calculations), Blockchain (on-chain operations), Mining (crypto mining), Distribution (DSP delivery), Video (video editing), and Audio (audio processing). Each agent operates autonomously while the Orchestrator ensures coordinated task execution.";
  }
  
  if (lowerMessage.includes('distribute') || lowerMessage.includes('dsp') || lowerMessage.includes('spotify')) {
    return "The Distribution agent can deliver your content to over 50 DSPs including Spotify, Apple Music, YouTube Music, Amazon Music, Tidal, and more. I can help you prepare metadata, upload assets, and track distribution status across all platforms.";
  }
  
  return "I'm your AI assistant in the GOAT Royalty App. I have access to 215+ LLMs and can help you with royalty tracking, blockchain verification, AI agents, mining operations, content distribution, and more. What would you like to accomplish today?";
}

function formatMessage(content) {
  // Basic formatting: convert newlines to <br>
  return content.replace(/\n/g, '<br>');
}

// Mining Setup
function setupMining() {
  const startBtn = document.getElementById('btnStartMining');
  const stopBtn = document.getElementById('btnStopMining');
  
  startBtn?.addEventListener('click', startMining);
  stopBtn?.addEventListener('click', stopMining);
  
  // Initialize mining status display
  updateMiningDisplay();
}

async function startMining() {
  const coin = document.getElementById('miningCoin')?.value || 'bitcoin';
  const intensity = document.getElementById('miningIntensity')?.value || 'medium';
  const pool = document.getElementById('miningPool')?.value || 'auto';
  const autoSwitch = document.getElementById('autoProfitSwitch')?.checked || false;
  
  try {
    const result = await ipcRenderer.invoke('blockchain:mining:start', {
      coins: [coin],
      intensity,
      pool,
      autoSwitch
    });
    
    if (result.success) {
      AppState.miningActive = true;
      updateMiningDisplay();
      addLogEntry('Mining', `Started mining ${coin} with ${intensity} intensity`);
      
      // Simulate mining stats update
      startMiningSimulation();
    }
  } catch (error) {
    console.error('[GOAT] Mining start error:', error);
    // Simulate successful start for demo
    AppState.miningActive = true;
    updateMiningDisplay();
    startMiningSimulation();
  }
}

async function stopMining() {
  try {
    await ipcRenderer.invoke('blockchain:mining:stop');
  } catch (error) {
    console.error('[GOAT] Mining stop error:', error);
  }
  
  AppState.miningActive = false;
  updateMiningDisplay();
  addLogEntry('Mining', 'Mining stopped');
}

function updateMiningDisplay() {
  const statusIndicator = document.getElementById('miningStatus');
  const startBtn = document.getElementById('btnStartMining');
  const stopBtn = document.getElementById('btnStopMining');
  
  if (AppState.miningActive) {
    statusIndicator.innerHTML = `
      <span class="status-icon">⛏️</span>
      <span class="status-text">Mining Active</span>
    `;
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    statusIndicator.innerHTML = `
      <span class="status-icon">⏸️</span>
      <span class="status-text">Not Mining</span>
    `;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

let miningSimulationInterval = null;

function startMiningSimulation() {
  if (miningSimulationInterval) {
    clearInterval(miningSimulationInterval);
  }
  
  miningSimulationInterval = setInterval(() => {
    if (!AppState.miningActive) {
      clearInterval(miningSimulationInterval);
      return;
    }
    
    // Update fake stats
    const hashrate = document.getElementById('miningHashrate');
    const power = document.getElementById('miningPower');
    const temp = document.getElementById('miningTemp');
    const revenue = document.getElementById('miningRevenue');
    
    const intensity = document.getElementById('miningIntensity')?.value || 'medium';
    const baseHashrate = intensity === 'low' ? 50 : intensity === 'high' ? 150 : 100;
    const basePower = intensity === 'low' ? 150 : intensity === 'high' ? 350 : 250;
    
    if (hashrate) hashrate.textContent = `${(baseHashrate + Math.random() * 10).toFixed(1)} MH/s`;
    if (power) power.textContent = `${(basePower + Math.random() * 20).toFixed(0)}W`;
    if (temp) temp.textContent = `${(55 + Math.random() * 15).toFixed(0)}°C`;
    if (revenue) revenue.textContent = `$${(Math.random() * 5 + 1).toFixed(2)}`;
  }, 2000);
}

// Wallet Setup
function setupWallet() {
  const connectBtn = document.getElementById('btnConnectWallet');
  const copyBtn = document.getElementById('copyAddress');
  
  connectBtn?.addEventListener('click', connectWallet);
  copyBtn?.addEventListener('click', copyAddress);
}

async function connectWallet() {
  // Simulate wallet connection
  const addressEl = document.getElementById('walletAddress');
  if (addressEl) {
    const fakeAddress = '0x' + Math.random().toString(16).substr(2, 40);
    addressEl.textContent = fakeAddress;
    
    // Update balance
    const balanceEl = document.querySelector('.balance-amount');
    if (balanceEl) {
      balanceEl.textContent = `$${(Math.random() * 10000).toFixed(2)}`;
    }
  }
  
  addLogEntry('Wallet', 'Wallet connected');
}

function copyAddress() {
  const addressEl = document.getElementById('walletAddress');
  if (addressEl && addressEl.textContent !== 'No wallet connected') {
    navigator.clipboard.writeText(addressEl.textContent);
  }
}

// Orchestrator Setup
function setupOrchestrator() {
  const executeBtn = document.getElementById('btnExecuteGoal');
  const autonomousBtn = document.getElementById('btnAutonomousMode');
  
  executeBtn?.addEventListener('click', executeGoal);
  autonomousBtn?.addEventListener('click', toggleAutonomousMode);
  
  // Initialize agent status
  updateAgentStatus();
}

async function executeGoal() {
  const goalInput = document.getElementById('goalInput');
  const goal = goalInput?.value.trim();
  
  if (!goal) {
    alert('Please enter a goal for the orchestrator');
    return;
  }
  
  addLogEntry('Orchestrator', `Processing goal: ${goal.substring(0, 50)}...`);
  
  try {
    const result = await ipcRenderer.invoke('ai:orchestrate', {
      goal,
      context: AppState
    });
    
    if (result.success) {
      addLogEntry('Orchestrator', 'Goal completed successfully');
      // Add detailed log entries for each subtask
      if (result.results) {
        for (const [taskId, taskResult] of Object.entries(result.results)) {
          addLogEntry(taskResult.agent || 'Worker', taskResult.success ? 'Task completed' : 'Task failed');
        }
      }
    }
  } catch (error) {
    console.error('[GOAT] Orchestration error:', error);
    // Simulate execution
    simulateGoalExecution(goal);
  }
  
  goalInput.value = '';
}

function simulateGoalExecution(goal) {
  addLogEntry('Orchestrator', 'Decomposing goal into subtasks...');
  
  setTimeout(() => {
    addLogEntry('Royalty', 'Fetching royalty data...');
  }, 500);
  
  setTimeout(() => {
    addLogEntry('Analyst', 'Calculating splits...');
  }, 1500);
  
  setTimeout(() => {
    addLogEntry('Blockchain', 'Verifying on-chain...');
  }, 2500);
  
  setTimeout(() => {
    addLogEntry('Orchestrator', 'Goal execution completed');
  }, 3500);
}

function toggleAutonomousMode() {
  AppState.autonomousMode = !AppState.autonomousMode;
  
  const btn = document.getElementById('btnAutonomousMode');
  if (btn) {
    btn.innerHTML = AppState.autonomousMode 
      ? '<span>🔄</span> Disable Autonomous Mode'
      : '<span>🔄</span> Enable Autonomous Mode';
  }
  
  addLogEntry('Orchestrator', `Autonomous mode ${AppState.autonomousMode ? 'enabled' : 'disabled'}`);
}

function updateAgentStatus() {
  // Update visual indicators for agents
  const workerNodes = document.querySelectorAll('.worker-node');
  workerNodes.forEach(node => {
    const agent = node.dataset.agent;
    if (agent && AppState.agents[agent]) {
      const statusIndicator = node.querySelector('.agent-status-indicator');
      if (statusIndicator) {
        statusIndicator.className = `agent-status-indicator ${AppState.agents[agent].status}`;
      }
    }
  });
}

function addLogEntry(agent, message) {
  const logContainer = document.getElementById('executionLog');
  if (!logContainer) return;
  
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-agent">${agent}</span>
    <span class="log-message">${message}</span>
  `;
  
  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Settings
function loadSettings() {
  // Load settings from IPC
  ipcRenderer.invoke('settings:get').then(settings => {
    if (settings) {
      AppState.settings = { ...AppState.settings, ...settings };
      applySettings();
    }
  }).catch(() => {
    // Use defaults
    applySettings();
  });
}

function applySettings() {
  // Apply theme
  document.body.setAttribute('data-theme', AppState.settings.theme);
  
  // Apply other settings to UI elements
  const aiProviderSelect = document.getElementById('defaultAIProvider');
  if (aiProviderSelect) aiProviderSelect.value = AppState.settings.aiProvider;
  
  const networkSelect = document.getElementById('defaultNetwork');
  if (networkSelect) networkSelect.value = AppState.settings.defaultNetwork;
  
  const verificationToggle = document.getElementById('blockchainVerification');
  if (verificationToggle) verificationToggle.checked = AppState.settings.blockchainVerification;
  
  const autonomousToggle = document.getElementById('autonomousMode');
  if (autonomousToggle) autonomousToggle.checked = AppState.autonomousMode;
}

// Listen for navigation events from main process
ipcRenderer.on('navigate', (event, section) => {
  navigateToSection(section);
});

ipcRenderer.on('ai-command', (event, data) => {
  if (data.action === 'startAutonomous') {
    if (!AppState.autonomousMode) {
      toggleAutonomousMode();
    }
    navigateToSection('ai-orchestrator');
  }
});

// Initialize revenue chart placeholder
function initCharts() {
  const canvas = document.getElementById('revenueCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Simple chart visualization
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw bars
  const barWidth = 30;
  const gap = 15;
  const startX = 20;
  const maxHeight = 150;
  
  const data = [45, 67, 89, 75, 92, 88, 95, 82, 78, 85, 91, 88];
  const goldGradient = ctx.createLinearGradient(0, 0, 0, maxHeight);
  goldGradient.addColorStop(0, '#FFD700');
  goldGradient.addColorStop(1, '#FFA500');
  
  data.forEach((value, index) => {
    const height = (value / 100) * maxHeight;
    const x = startX + index * (barWidth + gap);
    const y = canvas.height - height - 20;
    
    ctx.fillStyle = goldGradient;
    ctx.fillRect(x, y, barWidth, height);
  });
}

// Initialize on load
window.addEventListener('load', () => {
  setTimeout(initCharts, 100);
});

console.log('[GOAT] Application script loaded');