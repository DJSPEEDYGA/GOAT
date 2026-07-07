/**
 * Hostinger API Service
 * Provides integration with Hostinger API for domain management, hosting operations, and automation
 */

const axios = require('axios');

class HostingerService {
  constructor(apiToken) {
    this.apiToken = apiToken || process.env.HOSTINGER_API_TOKEN;
    this.baseURL = 'https://api.hostinger.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Get all domains associated with the account
   */
  async getDomains() {
    try {
      const response = await this.client.get('/domains');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getDomains');
    }
  }

  /**
   * Get details of a specific domain
   */
  async getDomainDetails(domainName) {
    try {
      const response = await this.client.get(`/domains/${domainName}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getDomainDetails');
    }
  }

  /**
   * Get DNS records for a domain
   */
  async getDNSRecords(domainName) {
    try {
      const response = await this.client.get(`/domains/${domainName}/dns`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getDNSRecords');
    }
  }

  /**
   * Create a new DNS record
   */
  async createDNSRecord(domainName, recordData) {
    try {
      const response = await this.client.post(`/domains/${domainName}/dns`, recordData);
      return {
        success: true,
        data: response.data,
        message: 'DNS record created successfully'
      };
    } catch (error) {
      return this.handleError(error, 'createDNSRecord');
    }
  }

  /**
   * Update an existing DNS record
   */
  async updateDNSRecord(domainName, recordId, recordData) {
    try {
      const response = await this.client.put(`/domains/${domainName}/dns/${recordId}`, recordData);
      return {
        success: true,
        data: response.data,
        message: 'DNS record updated successfully'
      };
    } catch (error) {
      return this.handleError(error, 'updateDNSRecord');
    }
  }

  /**
   * Delete a DNS record
   */
  async deleteDNSRecord(domainName, recordId) {
    try {
      await this.client.delete(`/domains/${domainName}/dns/${recordId}`);
      return {
        success: true,
        message: 'DNS record deleted successfully'
      };
    } catch (error) {
      return this.handleError(error, 'deleteDNSRecord');
    }
  }

  /**
   * Get SSL certificate information
   */
  async getSSLInfo(domainName) {
    try {
      const response = await this.client.get(`/domains/${domainName}/ssl`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getSSLInfo');
    }
  }

  /**
   * Install SSL certificate
   */
  async installSSL(domainName, sslData) {
    try {
      const response = await this.client.post(`/domains/${domainName}/ssl`, sslData);
      return {
        success: true,
        data: response.data,
        message: 'SSL certificate installed successfully'
      };
    } catch (error) {
      return this.handleError(error, 'installSSL');
    }
  }

  /**
   * Get hosting account information
   */
  async getHostingInfo() {
    try {
      const response = await this.client.get('/hosting');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getHostingInfo');
    }
  }

  /**
   * Get email accounts for a domain
   */
  async getEmailAccounts(domainName) {
    try {
      const response = await this.client.get(`/domains/${domainName}/emails`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getEmailAccounts');
    }
  }

  /**
   * Create a new email account
   */
  async createEmailAccount(domainName, emailData) {
    try {
      const response = await this.client.post(`/domains/${domainName}/emails`, emailData);
      return {
        success: true,
        data: response.data,
        message: 'Email account created successfully'
      };
    } catch (error) {
      return this.handleError(error, 'createEmailAccount');
    }
  }

  /**
   * Delete an email account
   */
  async deleteEmailAccount(domainName, emailId) {
    try {
      await this.client.delete(`/domains/${domainName}/emails/${emailId}`);
      return {
        success: true,
        message: 'Email account deleted successfully'
      };
    } catch (error) {
      return this.handleError(error, 'deleteEmailAccount');
    }
  }

  /**
   * Get database information
   */
  async getDatabases() {
    try {
      const response = await this.client.get('/databases');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getDatabases');
    }
  }

  /**
   * Create a new database
   */
  async createDatabase(databaseData) {
    try {
      const response = await this.client.post('/databases', databaseData);
      return {
        success: true,
        data: response.data,
        message: 'Database created successfully'
      };
    } catch (error) {
      return this.handleError(error, 'createDatabase');
    }
  }

  /**
   * Get FTP accounts
   */
  async getFTPAccounts() {
    try {
      const response = await this.client.get('/ftp');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getFTPAccounts');
    }
  }

  /**
   * Create FTP account
   */
  async createFTPAccount(ftpData) {
    try {
      const response = await this.client.post('/ftp', ftpData);
      return {
        success: true,
        data: response.data,
        message: 'FTP account created successfully'
      };
    } catch (error) {
      return this.handleError(error, 'createFTPAccount');
    }
  }

  /**
   * Get hosting statistics
   */
  async getHostingStats() {
    try {
      const response = await this.client.get('/hosting/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getHostingStats');
    }
  }

  /**
   * Get bandwidth usage
   */
  async getBandwidthUsage(startDate, endDate) {
    try {
      const response = await this.client.get('/hosting/bandwidth', {
        params: { start_date: startDate, end_date: endDate }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getBandwidthUsage');
    }
  }

  /**
   * Get disk usage
   */
  async getDiskUsage() {
    try {
      const response = await this.client.get('/hosting/disk-usage');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getDiskUsage');
    }
  }

  /**
   * Check domain availability
   */
  async checkDomainAvailability(domainName) {
    try {
      const response = await this.client.get(`/domains/check/${domainName}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'checkDomainAvailability');
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo() {
    try {
      const response = await this.client.get('/account');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'getAccountInfo');
    }
  }

  /**
   * Error handler
   */
  handleError(error, method) {
    console.error(`Hostinger API Error in ${method}:`, error.message);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data.message || 'API request failed',
        statusCode: error.response.status,
        details: error.response.data
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'No response from Hostinger API',
        details: 'Network error or timeout'
      };
    } else {
      return {
        success: false,
        error: error.message,
        details: 'Request configuration error'
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const result = await this.getAccountInfo();
      return {
        success: result.success,
        message: result.success ? 'Hostinger API connection successful' : 'Connection failed',
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Hostinger API',
        error: error.message
      };
    }
  }
}

module.exports = HostingerService;