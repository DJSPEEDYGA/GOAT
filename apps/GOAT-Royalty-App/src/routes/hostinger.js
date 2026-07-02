/**
 * Hostinger API Routes
 * Provides endpoints for managing Hostinger hosting services
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const HostingerService = require('../services/hostingerService');

// Initialize Hostinger service
const hostingerService = new HostingerService();

/**
 * @route   GET /api/hostinger/test
 * @desc    Test Hostinger API connection
 * @access  Private (Admin only)
 */
router.get('/test', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test Hostinger connection',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/domains
 * @desc    Get all domains
 * @access  Private (Admin only)
 */
router.get('/domains', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getDomains();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch domains',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/domains/:domainName
 * @desc    Get domain details
 * @access  Private (Admin only)
 */
router.get('/domains/:domainName', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getDomainDetails(req.params.domainName);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch domain details',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/domains/:domainName/dns
 * @desc    Get DNS records for a domain
 * @access  Private (Admin only)
 */
router.get('/domains/:domainName/dns', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getDNSRecords(req.params.domainName);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DNS records',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/hostinger/domains/:domainName/dns
 * @desc    Create a new DNS record
 * @access  Private (Admin only)
 */
router.post('/domains/:domainName/dns', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.createDNSRecord(req.params.domainName, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create DNS record',
      details: error.message
    });
  }
});

/**
 * @route   PUT /api/hostinger/domains/:domainName/dns/:recordId
 * @desc    Update a DNS record
 * @access  Private (Admin only)
 */
router.put('/domains/:domainName/dns/:recordId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.updateDNSRecord(
      req.params.domainName,
      req.params.recordId,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update DNS record',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/hostinger/domains/:domainName/dns/:recordId
 * @desc    Delete a DNS record
 * @access  Private (Admin only)
 */
router.delete('/domains/:domainName/dns/:recordId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.deleteDNSRecord(
      req.params.domainName,
      req.params.recordId
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete DNS record',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/domains/:domainName/ssl
 * @desc    Get SSL certificate information
 * @access  Private (Admin only)
 */
router.get('/domains/:domainName/ssl', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getSSLInfo(req.params.domainName);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SSL information',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/hostinger/domains/:domainName/ssl
 * @desc    Install SSL certificate
 * @access  Private (Admin only)
 */
router.post('/domains/:domainName/ssl', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.installSSL(req.params.domainName, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to install SSL certificate',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/hosting
 * @desc    Get hosting account information
 * @access  Private (Admin only)
 */
router.get('/hosting', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getHostingInfo();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hosting information',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/hosting/stats
 * @desc    Get hosting statistics
 * @access  Private (Admin only)
 */
router.get('/hosting/stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getHostingStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hosting statistics',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/hosting/bandwidth
 * @desc    Get bandwidth usage
 * @access  Private (Admin only)
 */
router.get('/hosting/bandwidth', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const result = await hostingerService.getBandwidthUsage(start_date, end_date);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bandwidth usage',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/hosting/disk-usage
 * @desc    Get disk usage
 * @access  Private (Admin only)
 */
router.get('/hosting/disk-usage', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getDiskUsage();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disk usage',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/domains/:domainName/emails
 * @desc    Get email accounts for a domain
 * @access  Private (Admin only)
 */
router.get('/domains/:domainName/emails', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getEmailAccounts(req.params.domainName);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email accounts',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/hostinger/domains/:domainName/emails
 * @desc    Create a new email account
 * @access  Private (Admin only)
 */
router.post('/domains/:domainName/emails', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.createEmailAccount(req.params.domainName, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create email account',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/hostinger/domains/:domainName/emails/:emailId
 * @desc    Delete an email account
 * @access  Private (Admin only)
 */
router.delete('/domains/:domainName/emails/:emailId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.deleteEmailAccount(
      req.params.domainName,
      req.params.emailId
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete email account',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/databases
 * @desc    Get all databases
 * @access  Private (Admin only)
 */
router.get('/databases', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getDatabases();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch databases',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/hostinger/databases
 * @desc    Create a new database
 * @access  Private (Admin only)
 */
router.post('/databases', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.createDatabase(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create database',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/ftp
 * @desc    Get FTP accounts
 * @access  Private (Admin only)
 */
router.get('/ftp', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getFTPAccounts();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FTP accounts',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/hostinger/ftp
 * @desc    Create FTP account
 * @access  Private (Admin only)
 */
router.post('/ftp', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.createFTPAccount(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create FTP account',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/domains/check/:domainName
 * @desc    Check domain availability
 * @access  Private (Admin only)
 */
router.get('/domains/check/:domainName', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.checkDomainAvailability(req.params.domainName);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check domain availability',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/hostinger/account
 * @desc    Get account information
 * @access  Private (Admin only)
 */
router.get('/account', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await hostingerService.getAccountInfo();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account information',
      details: error.message
    });
  }
});

module.exports = router;