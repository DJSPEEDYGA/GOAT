// SuperNinja AI - Axiom-Style Browser Automation Engine
// No-code browser automation, web scraping, and data extraction
// Inspired by Axiom.ai features - Built for Harvey Miller (DJ Speedy)

const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

class AxiomBrowserAutomation {
  constructor() {
    this.bots = [];
    this.runningBot = null;
    this.botWindow = null;
    this.recordings = [];
    this.templates = this.loadTemplates();
    this.logsDir = path.join(__dirname, '..', '..', 'axiom-logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  // ============================================================
  // BOT MANAGEMENT
  // ============================================================

  createBot(name, description = '') {
    const bot = {
      id: 'bot_' + Date.now(),
      name,
      description,
      steps: [],
      variables: {},
      schedule: null,
      settings: {
        speed: 'normal',
        retryOnError: true,
        maxRetries: 3,
        timeout: 30000,
        headless: false,
        userAgent: null,
        viewport: { width: 1920, height: 1080 },
        screenshots: true,
        notifications: true
      },
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        lastRun: null,
        avgDuration: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bots.push(bot);
    this.saveBots();
    return bot;
  }

  deleteBot(botId) {
    this.bots = this.bots.filter(b => b.id !== botId);
    this.saveBots();
  }

  duplicateBot(botId) {
    const original = this.bots.find(b => b.id === botId);
    if (!original) return null;

    const copy = JSON.parse(JSON.stringify(original));
    copy.id = 'bot_' + Date.now();
    copy.name = original.name + ' (Copy)';
    copy.stats = { totalRuns: 0, successfulRuns: 0, failedRuns: 0, lastRun: null, avgDuration: 0 };
    copy.createdAt = new Date().toISOString();

    this.bots.push(copy);
    this.saveBots();
    return copy;
  }

  // ============================================================
  // STEP BUILDER - No-Code Automation Steps
  // ============================================================

  addStep(botId, step) {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) return null;

    const newStep = {
      id: 'step_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      order: bot.steps.length + 1,
      enabled: true,
      ...step
    };

    bot.steps.push(newStep);
    bot.updatedAt = new Date().toISOString();
    this.saveBots();
    return newStep;
  }

  // Available step types (Axiom-style)
  getStepTypes() {
    return {
      // Navigation
      navigate: {
        name: 'Go to URL',
        category: 'Navigation',
        icon: '🌐',
        params: { url: '' },
        description: 'Navigate to a specific URL'
      },
      goBack: {
        name: 'Go Back',
        category: 'Navigation',
        icon: '⬅️',
        params: {},
        description: 'Go back to previous page'
      },
      goForward: {
        name: 'Go Forward',
        category: 'Navigation',
        icon: '➡️',
        params: {},
        description: 'Go forward to next page'
      },
      newTab: {
        name: 'Open New Tab',
        category: 'Navigation',
        icon: '📑',
        params: { url: '' },
        description: 'Open URL in a new tab'
      },
      switchTab: {
        name: 'Switch Tab',
        category: 'Navigation',
        icon: '🔄',
        params: { tabIndex: 0 },
        description: 'Switch to a specific tab'
      },

      // Interaction
      click: {
        name: 'Click Element',
        category: 'Interaction',
        icon: '👆',
        params: { selector: '', waitBefore: 0 },
        description: 'Click on a page element'
      },
      doubleClick: {
        name: 'Double Click',
        category: 'Interaction',
        icon: '👆👆',
        params: { selector: '' },
        description: 'Double click on an element'
      },
      type: {
        name: 'Type Text',
        category: 'Interaction',
        icon: '⌨️',
        params: { selector: '', text: '', clearFirst: true },
        description: 'Type text into an input field'
      },
      pressKey: {
        name: 'Press Key',
        category: 'Interaction',
        icon: '🔤',
        params: { key: 'Enter' },
        description: 'Press a keyboard key'
      },
      selectDropdown: {
        name: 'Select Dropdown',
        category: 'Interaction',
        icon: '📋',
        params: { selector: '', value: '' },
        description: 'Select an option from a dropdown'
      },
      checkbox: {
        name: 'Toggle Checkbox',
        category: 'Interaction',
        icon: '☑️',
        params: { selector: '', checked: true },
        description: 'Check or uncheck a checkbox'
      },
      uploadFile: {
        name: 'Upload File',
        category: 'Interaction',
        icon: '📤',
        params: { selector: '', filePath: '' },
        description: 'Upload a file to a file input'
      },
      scroll: {
        name: 'Scroll Page',
        category: 'Interaction',
        icon: '📜',
        params: { direction: 'down', amount: 500, selector: null },
        description: 'Scroll the page or an element'
      },
      hover: {
        name: 'Hover Element',
        category: 'Interaction',
        icon: '🎯',
        params: { selector: '' },
        description: 'Hover over an element'
      },

      // Data Extraction
      scrapeText: {
        name: 'Scrape Text',
        category: 'Data Extraction',
        icon: '📝',
        params: { selector: '', variable: '', multiple: false },
        description: 'Extract text content from elements'
      },
      scrapeAttribute: {
        name: 'Scrape Attribute',
        category: 'Data Extraction',
        icon: '🏷️',
        params: { selector: '', attribute: 'href', variable: '' },
        description: 'Extract an attribute value from elements'
      },
      scrapeTable: {
        name: 'Scrape Table',
        category: 'Data Extraction',
        icon: '📊',
        params: { selector: 'table', variable: '', includeHeaders: true },
        description: 'Extract data from an HTML table'
      },
      scrapeList: {
        name: 'Scrape List',
        category: 'Data Extraction',
        icon: '📋',
        params: { selector: '', variable: '' },
        description: 'Extract items from a list'
      },
      screenshot: {
        name: 'Take Screenshot',
        category: 'Data Extraction',
        icon: '📸',
        params: { fullPage: false, selector: null, savePath: '' },
        description: 'Capture a screenshot of the page'
      },
      scrapeHTML: {
        name: 'Scrape HTML',
        category: 'Data Extraction',
        icon: '🔧',
        params: { selector: '', variable: '' },
        description: 'Extract raw HTML from elements'
      },

      // Logic & Control
      wait: {
        name: 'Wait',
        category: 'Logic',
        icon: '⏱️',
        params: { duration: 1000 },
        description: 'Wait for a specified duration (ms)'
      },
      waitForElement: {
        name: 'Wait for Element',
        category: 'Logic',
        icon: '👁️',
        params: { selector: '', timeout: 10000 },
        description: 'Wait until an element appears'
      },
      waitForNavigation: {
        name: 'Wait for Navigation',
        category: 'Logic',
        icon: '🔄',
        params: { timeout: 30000 },
        description: 'Wait for page navigation to complete'
      },
      ifCondition: {
        name: 'If Condition',
        category: 'Logic',
        icon: '🔀',
        params: { condition: '', thenSteps: [], elseSteps: [] },
        description: 'Conditional branching based on page state'
      },
      loop: {
        name: 'Loop',
        category: 'Logic',
        icon: '🔁',
        params: { type: 'count', count: 5, selector: '', steps: [] },
        description: 'Repeat steps multiple times or over elements'
      },
      breakLoop: {
        name: 'Break Loop',
        category: 'Logic',
        icon: '🛑',
        params: {},
        description: 'Exit the current loop'
      },

      // Data Management
      setVariable: {
        name: 'Set Variable',
        category: 'Data',
        icon: '📦',
        params: { name: '', value: '' },
        description: 'Set a variable value'
      },
      incrementVariable: {
        name: 'Increment Variable',
        category: 'Data',
        icon: '➕',
        params: { name: '', amount: 1 },
        description: 'Increment a numeric variable'
      },
      exportCSV: {
        name: 'Export to CSV',
        category: 'Data',
        icon: '📄',
        params: { data: '', filePath: '' },
        description: 'Export scraped data to CSV file'
      },
      exportJSON: {
        name: 'Export to JSON',
        category: 'Data',
        icon: '📋',
        params: { data: '', filePath: '' },
        description: 'Export scraped data to JSON file'
      },
      exportGoogleSheets: {
        name: 'Export to Google Sheets',
        category: 'Data',
        icon: '📊',
        params: { spreadsheetId: '', sheetName: '', data: '' },
        description: 'Export data to Google Sheets'
      },

      // AI-Powered (SuperNinja exclusive)
      aiExtract: {
        name: 'AI Extract Data',
        category: 'AI',
        icon: '🤖',
        params: { prompt: '', selector: '', variable: '' },
        description: 'Use AI to intelligently extract and parse data from page content'
      },
      aiDecision: {
        name: 'AI Decision',
        category: 'AI',
        icon: '🧠',
        params: { prompt: '', context: '', thenSteps: [], elseSteps: [] },
        description: 'Let AI decide the next action based on page content'
      },
      aiSummarize: {
        name: 'AI Summarize Page',
        category: 'AI',
        icon: '📝',
        params: { selector: 'body', variable: '', maxLength: 500 },
        description: 'Use AI to summarize page content'
      },
      aiClassify: {
        name: 'AI Classify Content',
        category: 'AI',
        icon: '🏷️',
        params: { selector: '', categories: [], variable: '' },
        description: 'Use AI to classify page content into categories'
      },
      aiGenerateResponse: {
        name: 'AI Generate Response',
        category: 'AI',
        icon: '💬',
        params: { prompt: '', context: '', variable: '' },
        description: 'Generate AI response based on scraped data'
      },

      // Advanced
      executeJS: {
        name: 'Execute JavaScript',
        category: 'Advanced',
        icon: '⚡',
        params: { code: '', variable: '' },
        description: 'Execute custom JavaScript in the page'
      },
      httpRequest: {
        name: 'HTTP Request',
        category: 'Advanced',
        icon: '🌐',
        params: { method: 'GET', url: '', headers: {}, body: '', variable: '' },
        description: 'Make an HTTP API request'
      },
      webhook: {
        name: 'Send Webhook',
        category: 'Advanced',
        icon: '🔗',
        params: { url: '', method: 'POST', data: '' },
        description: 'Send data to a webhook URL'
      },
      notification: {
        name: 'Send Notification',
        category: 'Advanced',
        icon: '🔔',
        params: { title: '', message: '' },
        description: 'Show a desktop notification'
      }
    };
  }

  // ============================================================
  // BOT EXECUTION ENGINE
  // ============================================================

  async runBot(botId) {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) throw new Error('Bot not found');
    if (this.runningBot) throw new Error('Another bot is already running');

    this.runningBot = bot;
    const startTime = Date.now();
    const runLog = {
      botId: bot.id,
      botName: bot.name,
      startedAt: new Date().toISOString(),
      steps: [],
      variables: { ...bot.variables },
      status: 'running',
      errors: []
    };

    try {
      // Create automation browser window
      this.botWindow = new BrowserWindow({
        width: bot.settings.viewport.width,
        height: bot.settings.viewport.height,
        show: !bot.settings.headless,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      // Execute each step
      for (let i = 0; i < bot.steps.length; i++) {
        const step = bot.steps[i];
        if (!step.enabled) continue;

        const stepLog = {
          stepId: step.id,
          type: step.type,
          startedAt: new Date().toISOString(),
          status: 'running'
        };

        try {
          await this.executeStep(step, runLog.variables);
          stepLog.status = 'success';
          stepLog.completedAt = new Date().toISOString();
        } catch (error) {
          stepLog.status = 'error';
          stepLog.error = error.message;
          runLog.errors.push({ step: i + 1, error: error.message });

          if (bot.settings.retryOnError) {
            let retried = false;
            for (let retry = 0; retry < bot.settings.maxRetries; retry++) {
              try {
                await this.wait(1000 * (retry + 1));
                await this.executeStep(step, runLog.variables);
                stepLog.status = 'success (retry ' + (retry + 1) + ')';
                retried = true;
                break;
              } catch (retryError) {
                continue;
              }
            }
            if (!retried) throw error;
          } else {
            throw error;
          }
        }

        runLog.steps.push(stepLog);
      }

      runLog.status = 'success';
      bot.stats.successfulRuns++;
    } catch (error) {
      runLog.status = 'failed';
      runLog.error = error.message;
      bot.stats.failedRuns++;
    } finally {
      const duration = Date.now() - startTime;
      runLog.completedAt = new Date().toISOString();
      runLog.duration = duration;

      bot.stats.totalRuns++;
      bot.stats.lastRun = new Date().toISOString();
      bot.stats.avgDuration = Math.round(
        ((bot.stats.avgDuration * (bot.stats.totalRuns - 1)) + duration) / bot.stats.totalRuns
      );

      if (this.botWindow && !this.botWindow.isDestroyed()) {
        if (bot.settings.headless) this.botWindow.close();
      }

      this.runningBot = null;
      this.saveBots();
      this.saveRunLog(runLog);
    }

    return runLog;
  }

  async executeStep(step, variables) {
    const wc = this.botWindow?.webContents;
    if (!wc) throw new Error('Browser window not available');

    switch (step.type) {
      case 'navigate':
        await wc.loadURL(this.interpolate(step.params.url, variables));
        break;

      case 'goBack':
        if (wc.canGoBack()) wc.goBack();
        break;

      case 'goForward':
        if (wc.canGoForward()) wc.goForward();
        break;

      case 'click':
        await wc.executeJavaScript(`
          document.querySelector('${step.params.selector}')?.click()
        `);
        break;

      case 'type':
        const text = this.interpolate(step.params.text, variables);
        await wc.executeJavaScript(`
          const el = document.querySelector('${step.params.selector}');
          if (el) {
            ${step.params.clearFirst ? "el.value = '';" : ''}
            el.value = '${text.replace(/'/g, "\\'")}';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        `);
        break;

      case 'pressKey':
        await wc.executeJavaScript(`
          document.dispatchEvent(new KeyboardEvent('keydown', { key: '${step.params.key}' }));
          document.dispatchEvent(new KeyboardEvent('keyup', { key: '${step.params.key}' }));
        `);
        break;

      case 'selectDropdown':
        await wc.executeJavaScript(`
          const sel = document.querySelector('${step.params.selector}');
          if (sel) { sel.value = '${step.params.value}'; sel.dispatchEvent(new Event('change', { bubbles: true })); }
        `);
        break;

      case 'scroll':
        const amount = step.params.direction === 'up' ? -step.params.amount : step.params.amount;
        await wc.executeJavaScript(`
          ${step.params.selector 
            ? `document.querySelector('${step.params.selector}')?.scrollBy(0, ${amount})` 
            : `window.scrollBy(0, ${amount})`}
        `);
        break;

      case 'hover':
        await wc.executeJavaScript(`
          const hoverEl = document.querySelector('${step.params.selector}');
          if (hoverEl) hoverEl.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        `);
        break;

      case 'scrapeText':
        const scraped = await wc.executeJavaScript(`
          ${step.params.multiple 
            ? `Array.from(document.querySelectorAll('${step.params.selector}')).map(el => el.textContent.trim())`
            : `document.querySelector('${step.params.selector}')?.textContent?.trim() || ''`}
        `);
        if (step.params.variable) variables[step.params.variable] = scraped;
        break;

      case 'scrapeAttribute':
        const attrVal = await wc.executeJavaScript(`
          document.querySelector('${step.params.selector}')?.getAttribute('${step.params.attribute}') || ''
        `);
        if (step.params.variable) variables[step.params.variable] = attrVal;
        break;

      case 'scrapeTable':
        const tableData = await wc.executeJavaScript(`
          const table = document.querySelector('${step.params.selector}');
          if (!table) return [];
          const rows = Array.from(table.querySelectorAll('tr'));
          rows.map(row => Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent.trim()));
        `);
        if (step.params.variable) variables[step.params.variable] = tableData;
        break;

      case 'scrapeHTML':
        const html = await wc.executeJavaScript(`
          document.querySelector('${step.params.selector}')?.innerHTML || ''
        `);
        if (step.params.variable) variables[step.params.variable] = html;
        break;

      case 'screenshot':
        const image = await wc.capturePage();
        const screenshotPath = step.params.savePath || path.join(this.logsDir, `screenshot_${Date.now()}.png`);
        fs.writeFileSync(screenshotPath, image.toPNG());
        break;

      case 'wait':
        await this.wait(step.params.duration);
        break;

      case 'waitForElement':
        await this.waitForSelector(wc, step.params.selector, step.params.timeout);
        break;

      case 'setVariable':
        variables[step.params.name] = this.interpolate(step.params.value, variables);
        break;

      case 'incrementVariable':
        variables[step.params.name] = (parseInt(variables[step.params.name]) || 0) + step.params.amount;
        break;

      case 'executeJS':
        const jsResult = await wc.executeJavaScript(step.params.code);
        if (step.params.variable) variables[step.params.variable] = jsResult;
        break;

      case 'loop':
        if (step.params.type === 'count') {
          for (let i = 0; i < step.params.count; i++) {
            variables['_loopIndex'] = i;
            for (const loopStep of (step.params.steps || [])) {
              await this.executeStep(loopStep, variables);
            }
          }
        }
        break;

      case 'exportCSV':
        const csvData = variables[step.params.data];
        if (Array.isArray(csvData)) {
          const csv = csvData.map(row => 
            Array.isArray(row) ? row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') : String(row)
          ).join('\n');
          fs.writeFileSync(step.params.filePath || path.join(this.logsDir, `export_${Date.now()}.csv`), csv);
        }
        break;

      case 'exportJSON':
        const jsonData = variables[step.params.data];
        fs.writeFileSync(
          step.params.filePath || path.join(this.logsDir, `export_${Date.now()}.json`),
          JSON.stringify(jsonData, null, 2)
        );
        break;

      case 'httpRequest':
        const axios = require('axios');
        const httpResult = await axios({
          method: step.params.method,
          url: this.interpolate(step.params.url, variables),
          headers: step.params.headers,
          data: step.params.body ? JSON.parse(this.interpolate(step.params.body, variables)) : undefined
        });
        if (step.params.variable) variables[step.params.variable] = httpResult.data;
        break;

      case 'webhook':
        const axiosWh = require('axios');
        await axiosWh.post(step.params.url, variables[step.params.data] || variables);
        break;

      case 'notification':
        const { Notification } = require('electron');
        new Notification({
          title: this.interpolate(step.params.title, variables),
          body: this.interpolate(step.params.message, variables)
        }).show();
        break;

      default:
        console.warn(`Unknown step type: ${step.type}`);
    }
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  interpolate(text, variables) {
    if (!text) return text;
    return String(text).replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitForSelector(wc, selector, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const found = await wc.executeJavaScript(`!!document.querySelector('${selector}')`);
      if (found) return true;
      await this.wait(200);
    }
    throw new Error(`Element "${selector}" not found within ${timeout}ms`);
  }

  // ============================================================
  // TEMPLATES - Pre-built automation bots
  // ============================================================

  loadTemplates() {
    return [
      {
        id: 'template_spotify_scraper',
        name: 'Spotify Playlist Scraper',
        description: 'Scrape track names, artists, and play counts from a Spotify playlist',
        category: 'Music',
        icon: '🎵',
        steps: [
          { type: 'navigate', params: { url: '{{playlistUrl}}' } },
          { type: 'waitForElement', params: { selector: '[data-testid="tracklist-row"]', timeout: 10000 } },
          { type: 'scrapeText', params: { selector: '[data-testid="tracklist-row"] a[href*="/track/"]', variable: 'trackNames', multiple: true } },
          { type: 'exportCSV', params: { data: 'trackNames', filePath: 'spotify_tracks.csv' } },
          { type: 'notification', params: { title: 'Scraping Complete', message: 'Spotify playlist data exported' } }
        ]
      },
      {
        id: 'template_youtube_analytics',
        name: 'YouTube Channel Analytics',
        description: 'Scrape video titles, views, and dates from a YouTube channel',
        category: 'Music',
        icon: '📺',
        steps: [
          { type: 'navigate', params: { url: '{{channelUrl}}/videos' } },
          { type: 'waitForElement', params: { selector: 'ytd-rich-item-renderer', timeout: 10000 } },
          { type: 'scroll', params: { direction: 'down', amount: 3000 } },
          { type: 'wait', params: { duration: 2000 } },
          { type: 'scrapeText', params: { selector: '#video-title', variable: 'videoTitles', multiple: true } },
          { type: 'scrapeText', params: { selector: '#metadata-line span:first-child', variable: 'viewCounts', multiple: true } },
          { type: 'exportJSON', params: { data: 'videoTitles', filePath: 'youtube_analytics.json' } }
        ]
      },
      {
        id: 'template_social_engagement',
        name: 'Social Media Auto-Engagement',
        description: 'Automatically like and comment on posts matching your criteria',
        category: 'Social Media',
        icon: '📱',
        steps: [
          { type: 'navigate', params: { url: '{{socialUrl}}' } },
          { type: 'waitForElement', params: { selector: 'article', timeout: 10000 } },
          { type: 'loop', params: { type: 'count', count: 10, steps: [
            { type: 'click', params: { selector: '[aria-label="Like"]' } },
            { type: 'wait', params: { duration: 2000 } },
            { type: 'scroll', params: { direction: 'down', amount: 800 } }
          ]}}
        ]
      },
      {
        id: 'template_royalty_checker',
        name: 'Royalty Platform Checker',
        description: 'Check royalty earnings across multiple platforms',
        category: 'Music',
        icon: '💰',
        steps: [
          { type: 'navigate', params: { url: 'https://artists.spotify.com' } },
          { type: 'waitForElement', params: { selector: '.earnings', timeout: 15000 } },
          { type: 'scrapeText', params: { selector: '.earnings-total', variable: 'spotifyEarnings' } },
          { type: 'screenshot', params: { fullPage: false, savePath: 'spotify_earnings.png' } },
          { type: 'notification', params: { title: 'Royalty Check Complete', message: 'Earnings: {{spotifyEarnings}}' } }
        ]
      },
      {
        id: 'template_web_scraper',
        name: 'General Web Scraper',
        description: 'Scrape data from any website with pagination',
        category: 'Data',
        icon: '🕷️',
        steps: [
          { type: 'navigate', params: { url: '{{targetUrl}}' } },
          { type: 'waitForElement', params: { selector: '{{dataSelector}}', timeout: 10000 } },
          { type: 'loop', params: { type: 'count', count: 5, steps: [
            { type: 'scrapeText', params: { selector: '{{dataSelector}}', variable: 'pageData', multiple: true } },
            { type: 'click', params: { selector: '{{nextPageSelector}}' } },
            { type: 'wait', params: { duration: 2000 } }
          ]}},
          { type: 'exportCSV', params: { data: 'pageData', filePath: 'scraped_data.csv' } }
        ]
      },
      {
        id: 'template_form_filler',
        name: 'Auto Form Filler',
        description: 'Automatically fill out web forms with your data',
        category: 'Productivity',
        icon: '📝',
        steps: [
          { type: 'navigate', params: { url: '{{formUrl}}' } },
          { type: 'waitForElement', params: { selector: 'form', timeout: 10000 } },
          { type: 'type', params: { selector: '{{nameField}}', text: '{{name}}', clearFirst: true } },
          { type: 'type', params: { selector: '{{emailField}}', text: '{{email}}', clearFirst: true } },
          { type: 'click', params: { selector: '{{submitButton}}' } },
          { type: 'waitForNavigation', params: { timeout: 10000 } },
          { type: 'screenshot', params: { fullPage: false, savePath: 'form_submitted.png' } }
        ]
      },
      {
        id: 'template_price_monitor',
        name: 'Price Monitor',
        description: 'Monitor product prices and get alerts on changes',
        category: 'E-Commerce',
        icon: '💲',
        steps: [
          { type: 'navigate', params: { url: '{{productUrl}}' } },
          { type: 'waitForElement', params: { selector: '{{priceSelector}}', timeout: 10000 } },
          { type: 'scrapeText', params: { selector: '{{priceSelector}}', variable: 'currentPrice' } },
          { type: 'notification', params: { title: 'Price Update', message: 'Current price: {{currentPrice}}' } },
          { type: 'exportJSON', params: { data: 'currentPrice', filePath: 'price_history.json' } }
        ]
      },
      {
        id: 'template_ai_research',
        name: 'AI-Powered Research Bot',
        description: 'Use AI to research topics and compile summaries',
        category: 'AI',
        icon: '🤖',
        steps: [
          { type: 'navigate', params: { url: 'https://www.google.com/search?q={{searchQuery}}' } },
          { type: 'waitForElement', params: { selector: '#search', timeout: 10000 } },
          { type: 'scrapeText', params: { selector: '.g', variable: 'searchResults', multiple: true } },
          { type: 'aiSummarize', params: { selector: '#search', variable: 'summary', maxLength: 1000 } },
          { type: 'exportJSON', params: { data: 'summary', filePath: 'research_summary.json' } }
        ]
      }
    ];
  }

  createBotFromTemplate(templateId, variables = {}) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return null;

    const bot = this.createBot(template.name, template.description);
    bot.variables = { ...variables };
    bot.steps = template.steps.map((step, i) => ({
      id: 'step_' + Date.now() + '_' + i,
      order: i + 1,
      enabled: true,
      ...step
    }));

    this.saveBots();
    return bot;
  }

  // ============================================================
  // SCHEDULING
  // ============================================================

  scheduleBot(botId, schedule) {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) return null;

    bot.schedule = {
      enabled: true,
      type: schedule.type || 'interval',
      interval: schedule.interval || 3600000,
      cron: schedule.cron || null,
      nextRun: new Date(Date.now() + (schedule.interval || 3600000)).toISOString(),
      ...schedule
    };

    this.saveBots();
    return bot.schedule;
  }

  // ============================================================
  // PERSISTENCE
  // ============================================================

  saveBots() {
    try {
      const botsFile = path.join(this.logsDir, 'bots.json');
      fs.writeFileSync(botsFile, JSON.stringify(this.bots, null, 2));
    } catch (error) {
      console.error('Error saving bots:', error);
    }
  }

  loadBots() {
    try {
      const botsFile = path.join(this.logsDir, 'bots.json');
      if (fs.existsSync(botsFile)) {
        this.bots = JSON.parse(fs.readFileSync(botsFile, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading bots:', error);
    }
  }

  saveRunLog(runLog) {
    try {
      const logFile = path.join(this.logsDir, `run_${runLog.botId}_${Date.now()}.json`);
      fs.writeFileSync(logFile, JSON.stringify(runLog, null, 2));
    } catch (error) {
      console.error('Error saving run log:', error);
    }
  }
}

module.exports = AxiomBrowserAutomation;