/**
 * Hostinger Tools for Autonomous Agent
 * Provides hosting management capabilities to the AI agent
 */

const HostingerService = require('../../services/hostingerService');

class HostingerTools {
  constructor() {
    this.hostingerService = new HostingerService();
  }

  /**
   * Get all available Hostinger tools
   */
  getTools() {
    return [
      {
        name: 'manage_domain',
        description: 'Manage domain settings including DNS records and SSL certificates',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'get_details', 'get_dns', 'add_dns', 'update_dns', 'delete_dns'],
              description: 'The action to perform on the domain'
            },
            domain_name: {
              type: 'string',
              description: 'The domain name to manage'
            },
            dns_data: {
              type: 'object',
              description: 'DNS record data (for add/update actions)',
              properties: {
                type: { type: 'string', description: 'DNS record type (A, CNAME, MX, TXT, etc.)' },
                name: { type: 'string', description: 'Record name' },
                value: { type: 'string', description: 'Record value' },
                ttl: { type: 'number', description: 'Time to live in seconds' }
              }
            },
            record_id: {
              type: 'string',
              description: 'DNS record ID (for update/delete actions)'
            }
          },
          required: ['action']
        },
        execute: this.manageDomain.bind(this)
      },
      {
        name: 'manage_ssl',
        description: 'Manage SSL certificates for domains',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['get_info', 'install'],
              description: 'SSL management action'
            },
            domain_name: {
              type: 'string',
              description: 'The domain name'
            },
            ssl_data: {
              type: 'object',
              description: 'SSL certificate data (for install action)',
              properties: {
                certificate: { type: 'string', description: 'SSL certificate content' },
                private_key: { type: 'string', description: 'Private key content' },
                ca_bundle: { type: 'string', description: 'CA bundle (optional)' }
              }
            }
          },
          required: ['action', 'domain_name']
        },
        execute: this.manageSSL.bind(this)
      },
      {
        name: 'manage_email',
        description: 'Manage email accounts for domains',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'create', 'delete'],
              description: 'Email management action'
            },
            domain_name: {
              type: 'string',
              description: 'The domain name'
            },
            email_data: {
              type: 'object',
              description: 'Email account data (for create action)',
              properties: {
                username: { type: 'string', description: 'Email username' },
                password: { type: 'string', description: 'Email password' },
                quota: { type: 'number', description: 'Mailbox quota in MB' }
              }
            },
            email_id: {
              type: 'string',
              description: 'Email account ID (for delete action)'
            }
          },
          required: ['action', 'domain_name']
        },
        execute: this.manageEmail.bind(this)
      },
      {
        name: 'get_hosting_stats',
        description: 'Get hosting statistics including bandwidth, disk usage, and performance metrics',
        parameters: {
          type: 'object',
          properties: {
            metric: {
              type: 'string',
              enum: ['overview', 'bandwidth', 'disk_usage', 'all'],
              description: 'The type of statistics to retrieve'
            },
            start_date: {
              type: 'string',
              description: 'Start date for bandwidth stats (YYYY-MM-DD)'
            },
            end_date: {
              type: 'string',
              description: 'End date for bandwidth stats (YYYY-MM-DD)'
            }
          },
          required: ['metric']
        },
        execute: this.getHostingStats.bind(this)
      },
      {
        name: 'manage_database',
        description: 'Manage databases on the hosting account',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'create'],
              description: 'Database management action'
            },
            database_data: {
              type: 'object',
              description: 'Database configuration (for create action)',
              properties: {
                name: { type: 'string', description: 'Database name' },
                username: { type: 'string', description: 'Database username' },
                password: { type: 'string', description: 'Database password' }
              }
            }
          },
          required: ['action']
        },
        execute: this.manageDatabase.bind(this)
      },
      {
        name: 'manage_ftp',
        description: 'Manage FTP accounts for file transfers',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'create'],
              description: 'FTP management action'
            },
            ftp_data: {
              type: 'object',
              description: 'FTP account data (for create action)',
              properties: {
                username: { type: 'string', description: 'FTP username' },
                password: { type: 'string', description: 'FTP password' },
                directory: { type: 'string', description: 'Home directory path' }
              }
            }
          },
          required: ['action']
        },
        execute: this.manageFTP.bind(this)
      },
      {
        name: 'check_domain_availability',
        description: 'Check if a domain name is available for registration',
        parameters: {
          type: 'object',
          properties: {
            domain_name: {
              type: 'string',
              description: 'The domain name to check'
            }
          },
          required: ['domain_name']
        },
        execute: this.checkDomainAvailability.bind(this)
      },
      {
        name: 'get_account_info',
        description: 'Get Hostinger account information and limits',
        parameters: {
          type: 'object',
          properties: {}
        },
        execute: this.getAccountInfo.bind(this)
      }
    ];
  }

  /**
   * Manage domain operations
   */
  async manageDomain(params) {
    try {
      const { action, domain_name, dns_data, record_id } = params;

      switch (action) {
        case 'list':
          return await this.hostingerService.getDomains();
        
        case 'get_details':
          if (!domain_name) throw new Error('domain_name is required');
          return await this.hostingerService.getDomainDetails(domain_name);
        
        case 'get_dns':
          if (!domain_name) throw new Error('domain_name is required');
          return await this.hostingerService.getDNSRecords(domain_name);
        
        case 'add_dns':
          if (!domain_name || !dns_data) throw new Error('domain_name and dns_data are required');
          return await this.hostingerService.createDNSRecord(domain_name, dns_data);
        
        case 'update_dns':
          if (!domain_name || !record_id || !dns_data) {
            throw new Error('domain_name, record_id, and dns_data are required');
          }
          return await this.hostingerService.updateDNSRecord(domain_name, record_id, dns_data);
        
        case 'delete_dns':
          if (!domain_name || !record_id) {
            throw new Error('domain_name and record_id are required');
          }
          return await this.hostingerService.deleteDNSRecord(domain_name, record_id);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Manage SSL certificates
   */
  async manageSSL(params) {
    try {
      const { action, domain_name, ssl_data } = params;

      switch (action) {
        case 'get_info':
          return await this.hostingerService.getSSLInfo(domain_name);
        
        case 'install':
          if (!ssl_data) throw new Error('ssl_data is required');
          return await this.hostingerService.installSSL(domain_name, ssl_data);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Manage email accounts
   */
  async manageEmail(params) {
    try {
      const { action, domain_name, email_data, email_id } = params;

      switch (action) {
        case 'list':
          return await this.hostingerService.getEmailAccounts(domain_name);
        
        case 'create':
          if (!email_data) throw new Error('email_data is required');
          return await this.hostingerService.createEmailAccount(domain_name, email_data);
        
        case 'delete':
          if (!email_id) throw new Error('email_id is required');
          return await this.hostingerService.deleteEmailAccount(domain_name, email_id);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get hosting statistics
   */
  async getHostingStats(params) {
    try {
      const { metric, start_date, end_date } = params;

      switch (metric) {
        case 'overview':
          return await this.hostingerService.getHostingStats();
        
        case 'bandwidth':
          return await this.hostingerService.getBandwidthUsage(start_date, end_date);
        
        case 'disk_usage':
          return await this.hostingerService.getDiskUsage();
        
        case 'all':
          const [stats, bandwidth, disk] = await Promise.all([
            this.hostingerService.getHostingStats(),
            this.hostingerService.getBandwidthUsage(start_date, end_date),
            this.hostingerService.getDiskUsage()
          ]);
          return {
            success: true,
            data: {
              stats: stats.data,
              bandwidth: bandwidth.data,
              disk_usage: disk.data
            }
          };
        
        default:
          throw new Error(`Unknown metric: ${metric}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Manage databases
   */
  async manageDatabase(params) {
    try {
      const { action, database_data } = params;

      switch (action) {
        case 'list':
          return await this.hostingerService.getDatabases();
        
        case 'create':
          if (!database_data) throw new Error('database_data is required');
          return await this.hostingerService.createDatabase(database_data);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Manage FTP accounts
   */
  async manageFTP(params) {
    try {
      const { action, ftp_data } = params;

      switch (action) {
        case 'list':
          return await this.hostingerService.getFTPAccounts();
        
        case 'create':
          if (!ftp_data) throw new Error('ftp_data is required');
          return await this.hostingerService.createFTPAccount(ftp_data);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check domain availability
   */
  async checkDomainAvailability(params) {
    try {
      const { domain_name } = params;
      return await this.hostingerService.checkDomainAvailability(domain_name);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(params) {
    try {
      return await this.hostingerService.getAccountInfo();
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = HostingerTools;