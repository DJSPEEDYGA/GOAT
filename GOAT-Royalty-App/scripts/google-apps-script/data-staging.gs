/**
 * GOAT Royalty App - Google Apps Script Data Staging
 * 
 * This script manages data staging from Google Sheets/Docs to Google Drive
 * for offline AI processing in the GOAT Royalty App
 * 
 * @author DJSPEEDYGA
 * @version 1.0.0
 */

// Configuration
const CONFIG = {
  FOLDER_ID: '17RV_P-8vWxnX6cmkJI_WF4He2kbiUaVf', // Your Google Drive folder ID
  DATA_TYPES: {
    ROYALTIES: 'royalties',
    ARTISTS: 'artists',
    CONTRACTS: 'contracts',
    PAYMENTS: 'payments',
    BOOKS: 'books',
    CODE_SNIPPETS: 'code_snippets',
    KNOWLEDGE_BASE: 'knowledge_base',
    ANALYTICS_DATA: 'analytics_data'
  }
};

/**
 * Creates custom menu in Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🐐 GOAT Royalty Pipeline')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Stage Data')
      .addItem('🎵 Royalties', 'stageRoyaltiesData')
      .addItem('👨‍🎤 Artists', 'stageArtistsData')
      .addItem('📄 Contracts', 'stageContractsData')
      .addItem('💰 Payments', 'stagePaymentsData')
      .addItem('📚 Books/Knowledge', 'stageKnowledgeData')
      .addItem('💻 Code Snippets', 'stageCodeData')
      .addItem('📈 Analytics Data', 'stageAnalyticsData')
      .addItem('🎯 All Active Sheet Data', 'stageActiveSheetData'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🔧 Utilities')
      .addItem('📋 View Staged Data', 'viewStagedData')
      .addItem('🗑️ Clear Staged Data', 'clearStagedData')
      .addItem('📊 Data Statistics', 'showDataStatistics')
      .addItem('🔄 Sync Status', 'showSyncStatus'))
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addItem('❓ Help', 'showHelp')
    .addToUi();
}

/**
 * Stage royalty data from active sheet
 */
function stageRoyaltiesData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheetToJSON(sheet);
  
  const stagedData = {
    type: CONFIG.DATA_TYPES.ROYALTIES,
    timestamp: new Date().toISOString(),
    source: sheet.getName(),
    data: data,
    metadata: {
      totalRecords: data.length,
      fields: Object.keys(data[0] || {}),
      stagingDate: new Date().toISOString()
    }
  };
  
  saveStagedData(stagedData, 'royalties_data');
  showSuccessMessage('Royalties data staged successfully!');
}

/**
 * Stage artist data from active sheet
 */
function stageArtistsData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheetToJSON(sheet);
  
  const stagedData = {
    type: CONFIG.DATA_TYPES.ARTISTS,
    timestamp: new Date().toISOString(),
    source: sheet.getName(),
    data: data,
    metadata: {
      totalArtists: data.length,
      fields: Object.keys(data[0] || {}),
      stagingDate: new Date().toISOString()
    }
  };
  
  saveStagedData(stagedData, 'artists_data');
  showSuccessMessage('Artists data staged successfully!');
}

/**
 * Stage contract data from active sheet
 */
function stageContractsData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheetToJSON(sheet);
  
  const stagedData = {
    type: CONFIG.DATA_TYPES.CONTRACTS,
    timestamp: new Date().toISOString(),
    source: sheet.getName(),
    data: data,
    metadata: {
      totalContracts: data.length,
      fields: Object.keys(data[0] || {}),
      stagingDate: new Date().toISOString()
    }
  };
  
  saveStagedData(stagedData, 'contracts_data');
  showSuccessMessage('Contracts data staged successfully!');
}

/**
 * Stage payment data from active sheet
 */
function stagePaymentsData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheetToJSON(sheet);
  
  const stagedData = {
    type: CONFIG.DATA_TYPES.PAYMENTS,
    timestamp: new Date().toISOString(),
    source: sheet.getName(),
    data: data,
    metadata: {
      totalPayments: data.length,
      fields: Object.keys(data[0] || {}),
      stagingDate: new Date().toISOString()
    }
  };
  
  saveStagedData(stagedData, 'payments_data');
  showSuccessMessage('Payments data staged successfully!');
}

/**
 * Stage knowledge base data (books, documents)
 */
function stageKnowledgeData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheetToJSON(sheet);
  
  const stagedData = {
    type: CONFIG.DATA_TYPES.KNOWLEDGE_BASE,
    timestamp: new Date().toISOString(),
    source: sheet.getName(),
    data: data,
    metadata: {
      totalEntries: data.length,
      fields: Object.keys(data[0] || {}),
      stagingDate: new Date().toISOString()
    }
  };
  
  saveStagedData(stagedData, 'knowledge_data');
  showSuccessMessage('Knowledge base data staged successfully!');
}

/**
 * Stage code snippets data
 */
function stageCodeData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheetToJSON(sheet);
  
  const stagedData = {
    type: CONFIG.DATA_TYPES.CODE_SNIPPETS,
    timestamp: new Date().toISOString(),
    source: sheet.getName(),
    data: data,
    metadata: {
      totalSnippets: data.length,
      fields: Object.keys(data[0] || {}),
      stagingDate: new Date().toISOString()
    }
  };
  
  saveStagedData(stagedData, 'code_data');
  showSuccessMessage('Code snippets data staged successfully!');
}

/**
 * Stage analytics data
 */
function stageAnalyticsData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheetToJSON(sheet);
  
  const stagedData = {
    type: CONFIG.DATA_TYPES.ANALYTICS_DATA,
    timestamp: new Date().toISOString(),
    source: sheet.getName(),
    data: data,
    metadata: {
      totalRecords: data.length,
      fields: Object.keys(data[0] || {}),
      stagingDate: new Date().toISOString()
    }
  };
  
  saveStagedData(stagedData, 'analytics_data');
  showSuccessMessage('Analytics data staged successfully!');
}

/**
 * Stage all data from active sheet (generic)
 */
function stageActiveSheetData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheetToJSON(sheet);
  
  const stagedData = {
    type: 'generic',
    timestamp: new Date().toISOString(),
    source: sheet.getName(),
    data: data,
    metadata: {
      totalRecords: data.length,
      fields: Object.keys(data[0] || {}),
      stagingDate: new Date().toISOString()
    }
  };
  
  const fileName = 'sheet_data_' + sheet.getName().replace(/\s+/g, '_');
  saveStagedData(stagedData, fileName);
  showSuccessMessage('Data from "' + sheet.getName() + '" staged successfully!');
}

/**
 * Convert spreadsheet data to JSON
 */
function sheetToJSON(sheet) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length === 0) {
    return [];
  }
  
  const headers = values[0].map(function(h) { return h.toString().trim().toLowerCase().replace(/\s+/g, '_'); });
  const data = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var item = {};
    
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j] || 'column_' + j;
      item[header] = row[j];
    }
    
    data.push(item);
  }
  
  return data;
}

/**
 * Save staged data to Google Drive
 */
function saveStagedData(stagedData, baseFileName) {
  var folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  var jsonString = JSON.stringify(stagedData, null, 2);
  var timestamp = new Date().getTime();
  var fileName = baseFileName + '_' + timestamp + '.json';
  
  // Create the file
  var file = folder.createFile(fileName, jsonString, MimeType.JSON);
  
  // Set description with metadata
  file.setDescription('GOAT Royalty App - ' + stagedData.type + ' - Staged at ' + new Date().toISOString());
  
  // Log staging
  logStagingActivity(stagedData, fileName);
  
  return file;
}

/**
 * Log staging activity
 */
function logStagingActivity(stagedData, fileName) {
  var folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  var logFileName = 'staging_log.json';
  
  var logData = {
    stagingHistory: []
  };
  
  // Try to load existing log
  var files = folder.getFilesByName(logFileName);
  if (files.hasNext()) {
    var existingFile = files.next();
    var existingContent = existingFile.getBlob().getDataAsString();
    try {
      logData = JSON.parse(existingContent);
    } catch (e) {
      // Start fresh if parse fails
    }
  }
  
  // Add new entry
  logData.stagingHistory.push({
    timestamp: new Date().toISOString(),
    type: stagedData.type,
    source: stagedData.source,
    fileName: fileName,
    recordCount: stagedData.data.length,
    success: true
  });
  
  // Keep only last 100 entries
  if (logData.stagingHistory.length > 100) {
    logData.stagingHistory = logData.stagingHistory.slice(-100);
  }
  
  // Save updated log
  var logJsonString = JSON.stringify(logData, null, 2);
  
  // Delete old log file if exists
  files = folder.getFilesByName(logFileName);
  if (files.hasNext()) {
    files.next().setTrashed(true);
  }
  
  folder.createFile(logFileName, logJsonString, MimeType.JSON);
}

/**
 * View staged data
 */
function viewStagedData() {
  var folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  var files = folder.getFiles();
  var stagedFiles = [];
  
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().indexOf('.json') !== -1 &amp;&amp; file.getName().indexOf('staging_log') === -1) {
      stagedFiles.push({
        name: file.getName(),
        size: formatBytes(file.getSize()),
        created: file.getDateCreated().toISOString(),
        url: file.getUrl()
      });
    }
  }
  
  if (stagedFiles.length === 0) {
    showInfoMessage('No staged data found in the folder.');
    return;
  }
  
  var message = stagedFiles.map(function(f) {
    return '📄 ' + f.name + '\n   Size: ' + f.size + '\n   Created: ' + new Date(f.created).toLocaleString() + '\n';
  }).join('\n');
  
  showInfoMessage('Staged Data Files (' + stagedFiles.length + '):\n\n' + message);
}

/**
 * Clear staged data
 */
function clearStagedData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Clear Staged Data',
    'Are you sure you want to delete all staged data files? This action cannot be undone.',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  var folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  var files = folder.getFiles();
  var deletedCount = 0;
  
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().indexOf('.json') !== -1 &amp;&amp; file.getName().indexOf('staging_log') === -1) {
      file.setTrashed(true);
      deletedCount++;
    }
  }
  
  showSuccessMessage('Cleared ' + deletedCount + ' staged data files.');
}

/**
 * Show data statistics
 */
function showDataStatistics() {
  var folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  var files = folder.getFiles();
  
  var totalFiles = 0;
  var totalSize = 0;
  var byType = {};
  var recentFile = null;
  var oldestFile = null;
  
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().indexOf('.json') !== -1 &amp;&amp; file.getName().indexOf('staging_log') === -1) {
      totalFiles++;
      totalSize += file.getSize();
      
      // Extract type from filename
      var typeMatch = file.getName().match(/([a-z_]+)_data_/);
      if (typeMatch) {
        var type = typeMatch[1];
        byType[type] = (byType[type] || 0) + 1;
      }
      
      // Track recent/oldest
      var created = file.getDateCreated();
      if (!recentFile || created > recentFile.date) {
        recentFile = { name: file.getName(), date: created };
      }
      if (!oldestFile || created < oldestFile.date) {
        oldestFile = { name: file.getName(), date: created };
      }
    }
  }
  
  var stats = {
    totalFiles: totalFiles,
    totalSize: formatBytes(totalSize),
    averageSize: totalFiles > 0 ? formatBytes(totalSize / totalFiles) : '0 B',
    byType: byType,
    recentFile: recentFile ? recentFile.name : 'None',
    oldestFile: oldestFile ? oldestFile.name : 'None',
    lastUpdated: new Date().toISOString()
  };
  
  var message = '📊 Staged Data Statistics\n\n';
  message += 'Total Files: ' + stats.totalFiles + '\n';
  message += 'Total Size: ' + stats.totalSize + '\n';
  message += 'Average Size: ' + stats.averageSize + '\n\n';
  
  message += 'By Type:\n';
  for (var type in stats.byType) {
    message += '  • ' + type + ': ' + stats.byType[type] + ' files\n';
  }
  
  message += '\nRecent: ' + stats.recentFile + '\n';
  message += 'Oldest: ' + stats.oldestFile + '\n';
  
  showInfoMessage(message);
}

/**
 * Show sync status
 */
function showSyncStatus() {
  var folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
  var files = folder.getFiles();
  
  var stagedFiles = [];
  var stagingLog = null;
  
  // Get staging log
  var logFiles = folder.getFilesByName('staging_log.json');
  if (logFiles.hasNext()) {
    var logContent = logFiles.next().getBlob().getDataAsString();
    try {
      stagingLog = JSON.parse(logContent);
    } catch (e) {
      // Log parse failed
    }
  }
  
  // Count staged files
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().indexOf('.json') !== -1 && file.getName().indexOf('staging_log') === -1) {
      stagedFiles.push(file);
    }
  }
  
  var message = '🔄 Sync Status\n\n';
  message += 'Staged Files: ' + stagedFiles.length + '\n';
  
  if (stagingLog && stagingLog.stagingHistory) {
    var lastStaging = stagingLog.stagingHistory[stagingLog.stagingHistory.length - 1];
    if (lastStaging) {
      message += 'Last Staging: ' + new Date(lastStaging.timestamp).toLocaleString() + '\n';
      message += 'Last Type: ' + lastStaging.type + '\n';
      message += 'Last Source: ' + lastStaging.source + '\n';
      message += 'Total Stagings: ' + stagingLog.stagingHistory.length + '\n';
    }
  } else {
    message += 'No staging history found.\n';
  }
  
  message += '\n✅ Ready for local app sync\n';
  message += '📁 Folder ID: ' + CONFIG.FOLDER_ID + '\n';
  
  showInfoMessage(message);
}

/**
 * Show settings
 */
function showSettings() {
  var message = '⚙️ GOAT Royalty Pipeline Settings\n\n';
  message += 'Folder ID: ' + CONFIG.FOLDER_ID + '\n\n';
  message += 'Data Types:\n';
  for (var key in CONFIG.DATA_TYPES) {
    message += '  • ' + key + ': ' + CONFIG.DATA_TYPES[key] + '\n';
  }
  message += '\nTo change settings, edit the CONFIG object in the script.';
  showInfoMessage(message);
}

/**
 * Show help
 */
function showHelp() {
  var message = '❓ GOAT Royalty Pipeline Help\n\n';
  message += 'How to use:\n';
  message += '1. Open your Google Sheet with data\n';
  message += '2. Click the "🐐 GOAT Royalty Pipeline" menu\n';
  message += '3. Select the appropriate staging option\n';
  message += '4. Data will be saved as JSON in Google Drive\n';
  message += '5. Your local app can download this data for offline use\n\n';
  message += 'Data Types:\n';
  message += '🎵 Royalties - Royalty payment data\n';
  message += '👨‍🎤 Artists - Artist information\n';
  message += '📄 Contracts - Contract details\n';
  message += '💰 Payments - Payment records\n';
  message += '📚 Books/Knowledge - Knowledge base entries\n';
  message += '💻 Code Snippets - Code samples\n';
  message += '📈 Analytics Data - Analytics metrics\n\n';
  message += 'For support, check the documentation.\n';
  showInfoMessage(message);
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  var k = 1024;
  var sizes = ['Bytes', 'KB', 'MB', 'GB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  SpreadsheetApp.getUi().alert('✅ ' + message);
}

/**
 * Show info message
 */
function showInfoMessage(message) {
  SpreadsheetApp.getUi().alert(message);
}