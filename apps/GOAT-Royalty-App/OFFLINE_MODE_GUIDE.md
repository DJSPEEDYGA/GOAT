# 🔄 GOAT Royalty App - Offline Mode Guide

## Overview

The **Offline Mode** feature enables the GOAT Royalty App to function without internet access by using staged data from Google Apps Script. This creates a powerful workflow where you can:
1. Stage data in Google Sheets/Docs
2. Sync to Google Drive
3. Download to local app
4. Run AI processing **offline**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ONLINE STAGE (Optional)                   │
├─────────────────────────────────────────────────────────────┤
│  Google Sheets/Docs → Google Apps Script → Google Drive     │
│                                                              │
│  1. Stage data manually or automatically                    │
│  2. Convert to JSON format                                   │
│  3. Store in Google Drive folder                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼ (Initial sync)
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL OFFLINE MODE                        │
├─────────────────────────────────────────────────────────────┤
│  📁 offline-data/staged/                                     │
│     ├── royalties_data_*.json                               │
│     ├── artists_data_*.json                                 │
│     ├── contracts_data_*.json                               │
│     ├── payments_data_*.json                                │
│     ├── knowledge_data_*.json                               │
│     ├── code_data_*.json                                    │
│     └── analytics_data_*.json                               │
│                                                              │
│  🔍 Offline Data Service                                     │
│     • Load staged data                                       │
│     • Search and query                                       │
│     • Prepare for AI processing                              │
│                                                              │
│  🤖 Super LLM System (Offline)                               │
│     • Process data locally                                   │
│     • Generate insights                                      │
│     • No internet required                                   │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### Phase 1: Google Apps Script Setup

#### 1. Open Google Sheets
Create or open a Google Sheet with your data.

#### 2. Open Apps Script Editor
- Click: Extensions → Apps Script
- Delete existing code
- Copy the entire content from `scripts/google-apps-script/data-staging.gs`
- Paste into the editor
- Save the project

#### 3. Configure Folder ID
Edit the `CONFIG` object at the top of the script:
```javascript
const CONFIG = {
  FOLDER_ID: 'YOUR_GOOGLE_DRIVE_FOLDER_ID', // Your folder ID
  // ... rest of config
};
```

To find your folder ID:
1. Open your Google Drive folder
2. Copy the ID from the URL: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`

#### 4. Save and Authorize
- Click the Save icon (floppy disk)
- Name your project (e.g., "GOAT Royalty Data Staging")
- Close the editor
- Refresh your Google Sheet

#### 5. Use the Menu
You'll see a new menu: **🐐 GOAT Royalty Pipeline**

### Phase 2: Local App Setup

#### 1. Install Dependencies
```bash
npm install googleapis
```

#### 2. Configure Offline Data Service
Add to your `.env` file:
```env
OFFLINE_DATA_ROOT_DIR=./offline-data
OFFLINE_DATA_SYNC_INTERVAL=30
OFFLINE_DATA_CREDENTIALS_PATH=./config/google-drive-credentials.json
OFFLINE_DATA_NVIDIA_API_KEY=your-nvidia-api-key
```

#### 3. Initialize Service
```javascript
const { OfflineDataService } = require('./src/services/offlineDataService');

const offlineData = new OfflineDataService({
  rootDir: './offline-data',
  credentialsPath: './config/google-drive-credentials.json',
  nvidiaApiKey: process.env.NVIDIA_BUILD_API_KEY
});

await offlineData.initialize();
```

## Usage Workflow

### Step 1: Stage Data in Google Sheets

1. **Open your Google Sheet** with data
2. **Click menu**: 🐐 GOAT Royalty Pipeline
3. **Select staging option**:
   - 🎵 Royalties - Stage royalty payment data
   - 👨‍🎤 Artists - Stage artist information
   - 📄 Contracts - Stage contract details
   - 💰 Payments - Stage payment records
   - 📚 Books/Knowledge - Stage knowledge base
   - 💻 Code Snippets - Stage code samples
   - 📈 Analytics Data - Stage analytics metrics
   - 🎯 All Active Sheet Data - Generic staging

4. **Data is saved to Google Drive** as JSON

### Step 2: Sync to Local App (Online)

```bash
# Via API
POST /api/offline/sync

# Or programmatically
await offlineData.syncFromGoogleDrive();
```

### Step 3: Process Data Offline

```javascript
// Get data by type
const royalties = await offlineData.getDataByType('royalties');

// Get latest data
const latestRoyalties = await offlineData.getLatestData('royalties');

// Search data
const results = await offlineData.searchData('contract expiration');

// Process with AI (offline)
const analysis = await offlineData.processLocally(
  'Analyze royalties and identify trends',
  latestRoyalties.data
);
```

### Step 4: Schedule Automatic Syncs

```javascript
// Sync every 30 minutes
await offlineData.startScheduledSync(30);
```

## Data Staging Examples

### Example 1: Staging Royalty Data

**Google Sheet Structure:**
| Artist | Track | Streams | Revenue | Date |
|--------|-------|---------|---------|------|
| Artist A | Song 1 | 1000000 | 5000.00 | 2024-01-01 |
| Artist B | Song 2 | 500000 | 2500.00 | 2024-01-01 |

**Staging:**
1. Click: 🐐 GOAT Royalty Pipeline → 📊 Stage Data → 🎵 Royalties
2. Data is converted to JSON and saved to Google Drive

**Resulting JSON:**
```json
{
  "type": "royalties",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "Royalties Sheet",
  "data": [
    {
      "artist": "Artist A",
      "track": "Song 1",
      "streams": 1000000,
      "revenue": 5000.00,
      "date": "2024-01-01"
    },
    {
      "artist": "Artist B",
      "track": "Song 2",
      "streams": 500000,
      "revenue": 2500.00,
      "date": "2024-01-01"
    }
  ],
  "metadata": {
    "totalRecords": 2,
    "fields": ["artist", "track", "streams", "revenue", "date"],
    "stagingDate": "2024-01-15T10:30:00.000Z"
  }
}
```

### Example 2: Staging Knowledge Base

**Google Sheet Structure:**
| Title | Author | Category | Content | Tags |
|-------|--------|----------|---------|------|
| Music Business 101 | John Doe | Business | Content about music business... | royalty, contracts |

**Staging:**
1. Click: 🐐 GOAT Royalty Pipeline → 📊 Stage Data → 📚 Books/Knowledge
2. Data is saved to Google Drive

## Offline AI Processing

### Example Queries (Offline)

```javascript
// Analyze royalties
const result = await offlineData.processLocally(
  'Analyze royalty trends and identify top-performing artists',
  await offlineData.getDataForAI({ types: ['royalties'] })
);

// Contract analysis
const result = await offlineData.processLocally(
  'Review contracts and identify any expiring agreements',
  await offlineData.getDataForAI({ types: ['contracts'] })
);

// Knowledge retrieval
const result = await offlineData.processLocally(
  'Summarize key points about music business contracts',
  await offlineData.getDataForAI({ types: ['knowledge_base'] })
);
```

## API Endpoints

### Offline Data Management

#### Sync from Google Drive
```bash
POST /api/offline/sync
```

#### Get Data by Type
```bash
GET /api/offline/data/:type
```

#### Search Data
```bash
GET /api/offline/search?query=contract
```

#### Get Service Metrics
```bash
GET /api/offline/metrics
```

#### Process Data Offline
```bash
POST /api/offline/process
{
  "task": "Analyze royalties",
  "dataTypes": ["royalties"]
}
```

## Benefits

✅ **No Internet Required** - AI processing works completely offline  
✅ **Data Privacy** - Sensitive data stays local  
✅ **Cost Savings** - Reduced API calls  
✅ **Reliability** - Works without network connectivity  
✅ **Flexibility** - Stage any data from Google Sheets  
✅ **Automation** - Scheduled syncs when online  
✅ **Backup** - Automatic backup capabilities  

## Data Management

### Backup Data
```javascript
await offlineData.exportForBackup();
```

### Import Backup
```javascript
await offlineData.importFromBackup('./offline-data/backup/backup_1234567890.json');
```

### Clear Cache
```javascript
await offlineData.clearCache();
```

## Monitoring

### Check Service Metrics
```javascript
const metrics = offlineData.getMetrics();
console.log({
  totalSyncs: metrics.totalSyncs,
  lastSyncTime: metrics.lastSyncTime,
  stagedDataCount: metrics.stagedDataCount,
  isOnline: metrics.isOnline,
  dataTypes: metrics.dataTypes
});
```

### Check Connectivity
```javascript
await offlineData.checkConnectivity();
```

## Troubleshooting

### Script Not Appearing in Menu
1. Make sure you saved the Apps Script
2. Refresh the Google Sheet page
3. Check browser console for errors

### Authorization Issues
1. Click the menu item again
2. Review permissions carefully
3. Accept the authorization dialog

### Sync Failing
1. Check internet connectivity
2. Verify Google Drive credentials
3. Check folder ID is correct

### Data Not Loading
1. Verify JSON files are in `offline-data/staged/`
2. Check file format is valid JSON
3. Review service logs

## Best Practices

1. **Stage Data Regularly** - Keep data fresh with regular staging
2. **Use Descriptive Names** - Name your sheets clearly
3. **Validate Data** - Ensure data quality before staging
4. **Schedule Syncs** - Set up automatic syncs when online
5. **Backup Regularly** - Export backups periodically
6. **Monitor Metrics** - Track sync success and data quality
7. **Test Offline Mode** - Verify offline functionality before deployment

## Advanced Features

### Custom Data Types
Add custom data types to the Google Apps Script:
```javascript
const CONFIG = {
  DATA_TYPES: {
    CUSTOM_TYPE: 'custom_data'
  }
};
```

### Data Transformation
Transform data during staging:
```javascript
function transformRowData(row) {
  // Add custom transformations
  return {
    ...row,
    processed: true,
    timestamp: new Date().toISOString()
  };
}
```

### Conditional Staging
Stage only certain rows:
```javascript
function stageFilteredData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheetToJSON(sheet);
  
  // Filter data
  const filtered = data.filter(row => row.status === 'active');
  
  // Stage filtered data
  // ...
}
```

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Check service logs
- Contact support

## Conclusion

The Offline Mode enables the GOAT Royalty App to be **truly autonomous** - working without internet while still providing powerful AI capabilities through the Super LLM system!

**This is the perfect solution for:**
- Air-gapped environments
- Sensitive data processing
- Cost optimization
- Reliability and uptime
- Mobile/offline scenarios

**Start staging your data today and experience true offline AI processing!** 🚀