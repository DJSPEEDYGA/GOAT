/**
 * GOAT Royalty App — Event Delegation System
 * Replaces all inline onclick handlers with secure data-* attribute delegation.
 * This eliminates the need for 'unsafe-inline' in CSP script-src.
 * 
 * Handles:
 *   data-tool="xxx"           → openTool('xxx')
 *   data-quick="..."          → quickAction('...')
 *   data-action="xxx"         → dispatches to named handler
 *   data-ue-tab="xxx"         → setUETab('xxx')
 *   data-ue-mode="xxx"        → setUEMode('xxx')
 *   data-chat-select="id"     → selectChat('id')
 *   data-chat-delete="id"     → deleteChat('id', event)
 *   data-model-category="c"   → filterModelHubCategory('c')
 *   data-model-select="id"    → selectModelFromHub('id')
 *   data-quick-terminal="cmd" → quickTerminal('cmd')
 *   data-remove-file="i"      → removeAttachedFile(i)
 *   data-ue-load-snippet="i"  → loadUESnippet(i)
 *   data-ue-copy-snippet="i"  → copyUESnippetOutput(i)
 *   data-goat-mode="id"       → setGOATBrainMode('id') + classList
 *   data-music-action="name"  → set message-input + send
 *   data-external="url"       → openExternal(url)
 *   data-browse-path="path"   → browse directory
 */
(function initEventDelegation() {
  'use strict';

  // Compound action handlers (set message + close tool panel + send)
  function compoundSend(text) {
    const input = document.getElementById('message-input');
    if (input) input.value = text;
    if (window.closeToolPanel) window.closeToolPanel();
    if (window.sendMessage) window.sendMessage();
  }

  // Map of data-action values to their handler functions
  const actionHandlers = {
    // Core app actions
    toggleGOATBrain: () => window.toggleGOATBrain && window.toggleGOATBrain(),
    newChat:         () => window.newChat && window.newChat(),
    toggleSidebar:   () => window.toggleSidebar && window.toggleSidebar(),
    openSettings:    () => window.openSettings && window.openSettings(),
    attachFile:      () => window.attachFile && window.attachFile(),
    clearChat:       () => window.clearChat && window.clearChat(),
    sendMessage:     () => window.sendMessage && window.sendMessage(),
    closeToolPanel:  () => window.closeToolPanel && window.closeToolPanel(),
    closeSettings:   () => window.closeSettings && window.closeSettings(),

    // Tool panel actions
    runTerminalCommand: () => window.runTerminalCommand && window.runTerminalCommand(),
    browseDirectory:    () => window.browseDirectory && window.browseDirectory(),
    loadFileInEditor:   () => window.loadFileInEditor && window.loadFileInEditor(),
    saveFileFromEditor: () => window.saveFileFromEditor && window.saveFileFromEditor(),
    runCodeFromEditor:  () => window.runCodeFromEditor && window.runCodeFromEditor(),
    webSearch:          () => window.webSearch && window.webSearch(),
    openAudioFile:      () => window.openAudioFile && window.openAudioFile(),
    openPDFFile:        () => window.openPDFFile && window.openPDFFile(),
    openDataFile:       () => window.openDataFile && window.openDataFile(),
    calculateRoyalty:   () => window.calculateRoyalty && window.calculateRoyalty(),

    // UE CoPilot actions
    clearUEContext:      () => window.clearUEContext && window.clearUEContext(),
    runUECoPilot:        () => window.runUECoPilot && window.runUECoPilot(),
    copyUEOutput:        () => window.copyUEOutput && window.copyUEOutput(),
    sendUEOutputToChat:  () => window.sendUEOutputToChat && window.sendUEOutputToChat(),
    saveUESnippet:       () => window.saveUESnippet && window.saveUESnippet(),
    clearUEHistory:      () => window.clearUEHistory && window.clearUEHistory(),
    runUECoPilotToChat:  () => window.runUECoPilotToChat && window.runUECoPilotToChat(),
    useUEQuickPrompt:    (el) => {
      const p = el.getAttribute('data-p');
      if (window.useUEQuickPrompt && p) window.useUEQuickPrompt(p);
    },

    // Compound tool actions (set message + close + send)
    generateImage:   () => {
      const prompt = document.getElementById('imagePrompt');
      compoundSend('Generate image: ' + (prompt ? prompt.value : ''));
    },
    transcribeAudio: () => compoundSend('Transcribe the attached audio'),
    extractPDF:      () => compoundSend('Extract text from attached PDF'),
    summarizePDF:    () => compoundSend('Summarize attached PDF'),
    analyzeData:     () => compoundSend('Analyze attached data file'),
    visualizeData:   () => compoundSend('Create visualizations from attached data'),

    // Clipboard actions
    copyCodeEditor: () => {
      const area = document.getElementById('codeEditorArea');
      if (area) navigator.clipboard.writeText(area.value);
    },
    copyCodeBlock: (el) => {
      const code = el.previousElementSibling;
      if (code) navigator.clipboard.writeText(code.textContent);
    },
  };

  document.addEventListener('click', function(e) {
    const el = e.target.closest(
      '[data-tool],[data-quick],[data-action],[data-ue-tab],[data-ue-mode],' +
      '[data-chat-select],[data-chat-delete],[data-model-category],[data-model-select],' +
      '[data-quick-terminal],[data-remove-file],[data-ue-load-snippet],[data-ue-copy-snippet],' +
      '[data-goat-mode],[data-music-action],[data-external],[data-browse-path]'
    );
    if (!el) return;

    // data-tool → openTool
    const toolName = el.getAttribute('data-tool');
    if (toolName !== null) {
      e.preventDefault();
      window.openTool && window.openTool(toolName);
      return;
    }

    // data-quick → quickAction
    const quickText = el.getAttribute('data-quick');
    if (quickText !== null) {
      e.preventDefault();
      window.quickAction && window.quickAction(quickText);
      return;
    }

    // data-action → named handler
    const actionName = el.getAttribute('data-action');
    if (actionName !== null) {
      e.preventDefault();
      const handler = actionHandlers[actionName];
      if (handler) {
        handler(el);
      } else {
        console.warn('[EventDelegator] Unknown action:', actionName);
      }
      return;
    }

    // data-ue-tab → setUETab
    const ueTab = el.getAttribute('data-ue-tab');
    if (ueTab !== null) {
      e.preventDefault();
      window.setUETab && window.setUETab(ueTab);
      return;
    }

    // data-ue-mode → setUEMode
    const ueMode = el.getAttribute('data-ue-mode');
    if (ueMode !== null) {
      e.preventDefault();
      window.setUEMode && window.setUEMode(ueMode);
      return;
    }

    // data-chat-select → selectChat
    const chatId = el.getAttribute('data-chat-select');
    if (chatId !== null) {
      e.preventDefault();
      window.selectChat && window.selectChat(chatId);
      return;
    }

    // data-chat-delete → deleteChat
    const chatDelId = el.getAttribute('data-chat-delete');
    if (chatDelId !== null) {
      e.stopPropagation();
      e.preventDefault();
      window.deleteChat && window.deleteChat(chatDelId, e);
      return;
    }

    // data-model-category → filterModelHubCategory
    const modelCat = el.getAttribute('data-model-category');
    if (modelCat !== null) {
      e.preventDefault();
      window.filterModelHubCategory && window.filterModelHubCategory(modelCat);
      return;
    }

    // data-model-select → selectModelFromHub
    const modelId = el.getAttribute('data-model-select');
    if (modelId !== null) {
      e.preventDefault();
      window.selectModelFromHub && window.selectModelFromHub(modelId);
      return;
    }

    // data-quick-terminal → quickTerminal
    const termCmd = el.getAttribute('data-quick-terminal');
    if (termCmd !== null) {
      e.preventDefault();
      window.quickTerminal && window.quickTerminal(termCmd);
      return;
    }

    // data-remove-file → removeAttachedFile
    const fileIdx = el.getAttribute('data-remove-file');
    if (fileIdx !== null) {
      e.preventDefault();
      window.removeAttachedFile && window.removeAttachedFile(parseInt(fileIdx));
      return;
    }

    // data-ue-load-snippet → loadUESnippet
    const snippetIdx = el.getAttribute('data-ue-load-snippet');
    if (snippetIdx !== null) {
      e.preventDefault();
      window.loadUESnippet && window.loadUESnippet(parseInt(snippetIdx));
      return;
    }

    // data-ue-copy-snippet → copyUESnippetOutput
    const copyIdx = el.getAttribute('data-ue-copy-snippet');
    if (copyIdx !== null) {
      e.preventDefault();
      window.copyUESnippetOutput && window.copyUESnippetOutput(parseInt(copyIdx));
      return;
    }

    // data-goat-mode → setGOATBrainMode + classList toggle
    const goatMode = el.getAttribute('data-goat-mode');
    if (goatMode !== null) {
      e.preventDefault();
      window.setGOATBrainMode && window.setGOATBrainMode(goatMode);
      document.querySelectorAll('.goat-mode-card').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      return;
    }

    // data-music-action → set message + close + send
    const musicAction = el.getAttribute('data-music-action');
    if (musicAction !== null) {
      e.preventDefault();
      const msg = musicAction === 'Catalog Analysis' 
        ? 'Analyze my track catalog' 
        : 'Help me with ' + musicAction.toLowerCase();
      compoundSend(msg);
      return;
    }

    // data-external → open external URL
    const extUrl = el.getAttribute('data-external');
    if (extUrl !== null) {
      e.preventDefault();
      window.superNinja && window.superNinja.openExternal && window.superNinja.openExternal(extUrl);
      return;
    }

    // data-browse-path → browse directory
    const browsePath = el.getAttribute('data-browse-path');
    if (browsePath !== null) {
      e.preventDefault();
      const input = document.getElementById('filePathInput');
      if (input) {
        input.value = browsePath;
        window.browseDirectory && window.browseDirectory();
      }
      return;
    }
  });

  console.log('[GOAT] Event delegation system initialized — CSP hardened ✅');
})();