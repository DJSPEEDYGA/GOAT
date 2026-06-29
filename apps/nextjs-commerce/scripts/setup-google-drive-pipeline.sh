#!/bin/bash

# GOAT Royalty App - Google Drive Pipeline Setup Script
# 
# This script sets up the complete Google Drive data pipeline
# 
# @author DJSPEEDYGA
# @version 1.0.0

set -e

echo "🚀 Setting up GOAT Royalty App Google Drive Data Pipeline..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PIPELINE_DIR="./pipeline"
CONFIG_DIR="./config"
LOGS_DIR="./logs"

echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p "$PIPELINE_DIR"/{input,output,processing,cache,logs,metadata,ai-access}
mkdir -p "$CONFIG_DIR"
mkdir -p "$LOGS_DIR"

echo -e "${GREEN}✅ Directories created${NC}"
echo ""

echo -e "${BLUE}📝 Installing dependencies...${NC}"
npm install googleapis
npm install @google-cloud/local-auth
npm install mime-types
npm install pdf-parse
npm install epub2
npm install music-metadata
npm install sharp

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}🔑 Setting up Google Drive credentials...${NC}"

# Check if credentials file exists
if [ ! -f "$CONFIG_DIR/google-drive-credentials.json" ]; then
    echo -e "${YELLOW}⚠️  Google Drive credentials not found${NC}"
    echo ""
    echo "Please follow these steps to set up Google Drive API:"
    echo ""
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Create a new project or select existing one"
    echo "3. Enable Google Drive API"
    echo "4. Create OAuth 2.0 credentials"
    echo "5. Download the credentials JSON file"
    echo "6. Place it at: $CONFIG_DIR/google-drive-credentials.json"
    echo ""
    read -p "Press Enter after you've placed the credentials file..."
fi

if [ -f "$CONFIG_DIR/google-drive-credentials.json" ]; then
    echo -e "${GREEN}✅ Google Drive credentials found${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping credential check - you'll need to add them later${NC}"
fi

echo ""

echo -e "${BLUE}⚙️  Creating pipeline configuration...${NC}"

cat > "$CONFIG_DIR/pipeline-config.json" <<EOF
{
  "googleDrive": {
    "credentialsPath": "./config/google-drive-credentials.json",
    "folderId": "17RV_P-8vWxnX6cmkJI_WF4He2kbiUaVf",
    "pageSize": 1000,
    "syncInterval": 300000
  },
  "dataProcessor": {
    "enableCache": true,
    "cacheSize": 1000,
    "maxFileSize": 1073741824
  },
  "aiHub": {
    "indexPath": "./pipeline/metadata",
    "enableSearch": true,
    "maxCacheSize": 100
  },
  "pipeline": {
    "rootDir": ".",
    "batchSize": 50,
    "enableCompression": true,
    "logLevel": "info"
  }
}
EOF

echo -e "${GREEN}✅ Pipeline configuration created${NC}"
echo ""

echo -e "${BLUE}🌐 Creating API routes...${NC}"

# Create API routes for pipeline access
cat > ./src/routes/pipeline.js <<'EOF'
/**
 * Pipeline API Routes
 * 
 * Provides API endpoints for the Google Drive data pipeline
 */

const express = require('express');
const router = express.Router();
const { GoogleDriveDataPipeline } = require('../scripts/google-drive-pipeline');

let pipelineInstance = null;

/**
 * Initialize pipeline
 */
router.post('/initialize', async (req, res) => {
  try {
    const config = require('../../config/pipeline-config.json');
    pipelineInstance = new GoogleDriveDataPipeline(config);
    await pipelineInstance.initialize();
    
    res.json({ success: true, message: 'Pipeline initialized' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Start pipeline
 */
router.post('/start', async (req, res) => {
  try {
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    await pipelineInstance.start();
    
    res.json({ success: true, message: 'Pipeline started' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Stop pipeline
 */
router.post('/stop', async (req, res) => {
  try {
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    await pipelineInstance.stop();
    
    res.json({ success: true, message: 'Pipeline stopped' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get pipeline metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    const metrics = pipelineInstance.getMetrics();
    
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Search files
 */
router.get('/search', async (req, res) => {
  try {
    const { query, category, limit } = req.query;
    
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    const results = await pipelineInstance.searchFiles(query, {
      category,
      limit: parseInt(limit) || 20
    });
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get file content
 */
router.get('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    const content = await pipelineInstance.getFileContent(id);
    
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Sync to Google Drive
 */
router.post('/sync-to-drive', async (req, res) => {
  try {
    const { localPath, remotePath } = req.body;
    
    if (!pipelineInstance) {
      return res.status(400).json({ success: false, error: 'Pipeline not initialized' });
    }
    
    await pipelineInstance.syncToGoogleDrive(localPath, remotePath);
    
    res.json({ success: true, message: 'Synced to Google Drive' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
EOF

echo -e "${GREEN}✅ API routes created${NC}"
echo ""

echo -e "${BLUE}📄 Creating documentation...${NC}"

cat > ./docs/GOOGLE_DRIVE_PIPELINE.md <<'EOF'
# Google Drive Data Pipeline Documentation

## Overview

The Google Drive Data Pipeline creates a bidirectional data flow between your 6.5 TB Google Drive vault and the GOAT Royalty App, with AI assistant integration.

## Architecture

```
┌─────────────────┐
│  Google Drive   │ 6.5 TB Vault
│   (6.5 TB)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Pipeline  │ Sync & Processing
└────────┬────────┘
         │
         ├──────────────┐
         ▼              ▼
┌─────────────┐  ┌─────────────┐
│ Local Storage│  │ AI Assistant│
│  (Categorized)│  │    Hub      │
└─────────────┘  └─────────────┘
```

## Features

### 1. Bidirectional Sync
- Google Drive → Local App
- Local App → Google Drive (backup/sync)

### 2. Intelligent Categorization
- 📚 Books (PDF, EPUB, MOBI)
- 🎵 Music (MP3, WAV, FLAC, AAC)
- 💻 Code (JS, Python, Java, JSON)
- 📄 Contracts (DOC, DOCX, PDF)
- 📊 Data (CSV, SQL, Excel)
- 🎨 Visuals (PNG, JPG, SVG)
- 🎬 Videos (MP4, MOV, AVI)

### 3. Metadata Extraction
- Book metadata (author, ISBN, subjects)
- Music metadata (artist, album, genre, duration)
- Code analysis (functions, classes, imports)
- Contract parsing (parties, dates, terms)

### 4. AI Assistant Integration
- Full-text search across all resources
- Intelligent query processing
- Context-aware responses
- Real-time data access

## Setup Instructions

### 1. Install Dependencies
```bash
npm install googleapis @google-cloud/local-auth mime-types
```

### 2. Configure Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials:
   - Application type: Desktop app
   - Download credentials JSON
5. Save credentials to `config/google-drive-credentials.json`

### 3. Run Setup Script
```bash
bash scripts/setup-google-drive-pipeline.sh
```

### 4. Start the Pipeline
```bash
# Via API
POST /api/pipeline/initialize
POST /api/pipeline/start

# Or via script
node scripts/run-pipeline.js
```

## API Endpoints

### Pipeline Control
- `POST /api/pipeline/initialize` - Initialize pipeline
- `POST /api/pipeline/start` - Start sync
- `POST /api/pipeline/stop` - Stop sync
- `GET /api/pipeline/metrics` - Get metrics

### File Access
- `GET /api/pipeline/search?query=...` - Search files
- `GET /api/pipeline/file/:id` - Get file content
- `POST /api/pipeline/sync-to-drive` - Sync to Google Drive

## Usage Examples

### Search Files
```bash
curl "http://localhost:5001/api/pipeline/search?query=contract&limit=10"
```

### Get File Content
```bash
curl "http://localhost:5001/api/pipeline/file/resource-id"
```

### AI Assistant Query
```bash
# The AI assistant can now access all your vault content
POST /api/agent/execute
{
  "task": "Analyze all contracts and find expiring ones"
}
```

## File Categories

### Books
- PDF documents with metadata extraction
- EPUB and MOBI support
- Author, title, ISBN extraction
- Full-text indexing

### Music
- Audio metadata extraction
- Artist, album, genre tracking
- Duration and bitrate analysis
- Streaming support for large files

### Code
- Syntax-aware processing
- Function and class extraction
- Import dependency tracking
- Multi-language support

### Contracts
- Document parsing
- Party identification
- Date extraction
- Term analysis

### Data
- CSV parsing
- SQL schema extraction
- Database analysis
- Data quality checks

## Performance Optimization

### Large Files
- Files > 100MB are streamed, not fully downloaded
- Reference files created for quick access
- Lazy loading for content

### Caching
- Metadata cached in memory
- Search results cached
- Configurable cache size

### Batch Processing
- Files processed in batches of 50
- Progress tracking
- Error handling per file

## Security

- OAuth 2.0 authentication
- Token refresh handling
- Secure credential storage
- Access logging

## Troubleshooting

### Authentication Issues
```bash
# Check credentials file
cat config/google-drive-credentials.json

# Test connection
node scripts/test-google-drive.js
```

### Sync Issues
```bash
# Check pipeline logs
tail -f logs/pipeline.log

# Reset sync state
rm pipeline/metadata/sync-state.json
```

### Performance Issues
```bash
# Reduce batch size in config
# Enable compression
# Increase sync interval
```

## AI Assistant Access

The AI assistant (Super Ninja) now has direct access to:

1. **All files in your vault** - Through the AI Hub
2. **Full-text search** - Across all categories
3. **Content retrieval** - On-demand file access
4. **Real-time sync** - Always up-to-date data

This creates a powerful knowledge base that the AI can query and reason over.

## Support

For issues and questions, see:
- GitHub Issues
- API Documentation
- Troubleshooting Guide
EOF

echo -e "${GREEN}✅ Documentation created${NC}"
echo ""

echo -e "${BLUE}🔧 Creating startup script...${NC}"

cat > ./scripts/run-pipeline.js <<'EOF'
/**
 * Pipeline Startup Script
 */

const { GoogleDriveDataPipeline } = require('./google-drive-pipeline');
const config = require('../config/pipeline-config.json');

async function startPipeline() {
  console.log('🚀 Starting GOAT Royalty App Data Pipeline...\n');
  
  try {
    const pipeline = new GoogleDriveDataPipeline(config);
    
    // Initialize
    await pipeline.initialize();
    
    // Start
    await pipeline.start();
    
    console.log('\n✅ Pipeline is running!');
    console.log('Press Ctrl+C to stop\n');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⏹️  Stopping pipeline...');
      await pipeline.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Pipeline failed to start:', error);
    process.exit(1);
  }
}

startPipeline();
EOF

chmod +x ./scripts/run-pipeline.js

echo -e "${GREEN}✅ Startup script created${NC}"
echo ""

echo -e "${GREEN}🎉 Google Drive Pipeline setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Add your Google Drive credentials to: $CONFIG_DIR/google-drive-credentials.json"
echo "2. Start the pipeline: node scripts/run-pipeline.js"
echo "3. Access via API: POST /api/pipeline/start"
echo "4. Monitor logs: tail -f logs/pipeline.log"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "Full documentation available at: docs/GOOGLE_DRIVE_PIPELINE.md"
echo ""