/**
 * Google Drive API Service
 * 
 * Handles all Google Drive operations for the GOAT Royalty App
 * 
 * @author DJSPEEDYGA
 * @version 1.0.0
 */

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const { Readable } = require('stream');

class GoogleDriveAPI {
  constructor(config) {
    this.config = config;
    this.drive = null;
    this.auth = null;
  }

  /**
   * Authenticate with Google Drive API
   */
  async authenticate() {
    try {
      // Load OAuth2 credentials
      const credentials = await this.loadCredentials();
      
      // Create OAuth2 client
      const { OAuth2 } = google.auth;
      this.auth = new OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
      );

      // Set credentials (refresh token for service account)
      this.auth.setCredentials({
        refresh_token: credentials.refreshToken
      });

      // Create Drive API client
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      // Test connection
      await this.testConnection();
      
      return true;
    } catch (error) {
      console.error('Google Drive authentication failed:', error.message);
      throw error;
    }
  }

  /**
   * Load credentials from file or environment
   */
  async loadCredentials() {
    if (this.config.credentialsPath) {
      const credentialsData = await fs.readFile(this.config.credentialsPath, 'utf8');
      return JSON.parse(credentialsData);
    } else if (this.config.clientId && this.config.clientSecret) {
      return {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        redirectUri: this.config.redirectUri || 'urn:ietf:wg:oauth:2.0:oob',
        refreshToken: this.config.refreshToken
      };
    } else {
      throw new Error('No Google Drive credentials provided');
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await this.drive.about.get({
        fields: 'user'
      });
      console.log(`✅ Connected to Google Drive as: ${response.data.user.displayName}`);
      return true;
    } catch (error) {
      throw new Error('Failed to connect to Google Drive API');
    }
  }

  /**
   * List all files in Google Drive
   */
  async listFiles(options = {}) {
    try {
      const response = await this.drive.files.list({
        pageSize: options.pageSize || 100,
        fields: options.fields || 'files(id, name, mimeType, size, modifiedTime, parents, webContentLink)',
        q: options.query || undefined,
        orderBy: options.orderBy || 'modifiedTime desc'
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Failed to list files:', error.message);
      throw error;
    }
  }

  /**
   * List files changed since a specific time
   */
  async listChangedFiles(sinceTime) {
    try {
      const query = sinceTime 
        ? `modifiedTime > '${new Date(sinceTime).toISOString()}'`
        : undefined;

      return await this.listFiles({
        query,
        orderBy: 'modifiedTime desc'
      });
    } catch (error) {
      console.error('Failed to list changed files:', error.message);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType,size,modifiedTime,parents,webContentLink,thumbnailLink'
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get file metadata:', error.message);
      throw error;
    }
  }

  /**
   * Download a file to local storage
   */
  async downloadFile(fileId, outputPath) {
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Get file metadata
      const metadata = await this.getFileMetadata(fileId);

      // Download file
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'stream' });

      // Write to file
      const writeStream = require('fs').createWriteStream(outputPath);
      const fileStream = response.data.pipe(writeStream);

      await new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      console.log(`✅ Downloaded: ${metadata.name} -> ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Failed to download file:', error.message);
      throw error;
    }
  }

  /**
   * Stream a large file without full download
   */
  async streamFile(fileId, outputPath) {
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Create stream
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'stream' });

      // Create readable stream from response
      const readableStream = response.data;

      // Pipe to file with chunk tracking
      const writeStream = require('fs').createWriteStream(outputPath);
      
      let bytesTransferred = 0;
      readableStream.on('data', (chunk) => {
        bytesTransferred += chunk.length;
      });

      readableStream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          console.log(`✅ Streamed ${bytesTransferred} bytes: ${outputPath}`);
          resolve();
        });
        writeStream.on('error', reject);
      });

      return outputPath;
    } catch (error) {
      console.error('Failed to stream file:', error.message);
      throw error;
    }
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(options) {
    try {
      const fileMetadata = {
        name: options.name,
        parents: options.parents
      };

      const media = {
        mimeType: options.mimeType || 'application/octet-stream',
        body: options.data
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webContentLink'
      });

      console.log(`✅ Uploaded: ${response.data.name} (${response.data.id})`);
      return response.data;
    } catch (error) {
      console.error('Failed to upload file:', error.message);
      throw error;
    }
  }

  /**
   * Update an existing file
   */
  async updateFile(fileId, options) {
    try {
      const fileMetadata = {
        name: options.name
      };

      const media = {
        mimeType: options.mimeType,
        body: options.data
      };

      const response = await this.drive.files.update({
        fileId: fileId,
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webContentLink'
      });

      console.log(`✅ Updated: ${response.data.name}`);
      return response.data;
    } catch (error) {
      console.error('Failed to update file:', error.message);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });
      
      console.log(`✅ Deleted file: ${fileId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error.message);
      throw error;
    }
  }

  /**
   * Search files by query
   */
  async searchFiles(query) {
    try {
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, size, modifiedTime, webContentLink)'
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Failed to search files:', error.message);
      throw error;
    }
  }

  /**
   * Create a folder
   */
  async createFolder(name, parentFolderId = null) {
    try {
      const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id,name'
      });

      console.log(`✅ Created folder: ${response.data.name} (${response.data.id})`);
      return response.data;
    } catch (error) {
      console.error('Failed to create folder:', error.message);
      throw error;
    }
  }

  /**
   * Share a file/folder
   */
  async shareFile(fileId, emailAddress, role = 'reader') {
    try {
      const permission = {
        type: 'user',
        role: role,
        emailAddress: emailAddress
      };

      await this.drive.permissions.create({
        fileId: fileId,
        resource: permission,
        sendNotificationEmail: false
      });

      console.log(`✅ Shared ${fileId} with ${emailAddress} (${role})`);
      return true;
    } catch (error) {
      console.error('Failed to share file:', error.message);
      throw error;
    }
  }

  /**
   * Get file content as text (for small files)
   */
  async getFileContentText(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'text' });

      return response.data;
    } catch (error) {
      console.error('Failed to get file content:', error.message);
      throw error;
    }
  }

  /**
   * Batch download files
   */
  async batchDownload(fileIds, outputDirectory) {
    const results = [];
    
    for (const fileId of fileIds) {
      try {
        const metadata = await this.getFileMetadata(fileId);
        const outputPath = path.join(outputDirectory, metadata.name);
        await this.downloadFile(fileId, outputPath);
        results.push({ fileId, outputPath, success: true });
      } catch (error) {
        results.push({ fileId, error: error.message, success: false });
      }
    }

    return results;
  }

  /**
   * Get storage quota
   */
  async getStorageQuota() {
    try {
      const response = await this.drive.about.get({
        fields: 'storageQuota'
      });

      return response.data.storageQuota;
    } catch (error) {
      console.error('Failed to get storage quota:', error.message);
      throw error;
    }
  }

  /**
   * Monitor file changes (using change notifications)
   */
  async startChangeMonitoring(callback) {
    try {
      let pageToken = null;
      
      const checkChanges = async () => {
        const response = await this.drive.changes.list({
          pageToken: pageToken
        });

        const changes = response.data.changes || [];
        
        if (changes.length > 0) {
          await callback(changes);
        }

        pageToken = response.data.newStartPageToken;
      };

      // Check for changes every minute
      setInterval(checkChanges, 60000);
      
    } catch (error) {
      console.error('Failed to start change monitoring:', error.message);
      throw error;
    }
  }
}

module.exports = { GoogleDriveAPI };