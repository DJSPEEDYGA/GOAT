/**
 * Automation Jobs API Endpoint
 * Manages scheduled tasks and workflow automation
 */

import { AutomationFramework, GOATAppAutomation } from '../../../lib/automation/workflow-manager.js';

// Global automation instance (would be stored in database in production)
let automationInstance = null;

function getAutomation(integrations = {}) {
  if (!automationInstance) {
    automationInstance = new GOATAppAutomation(integrations);
  }
  return automationInstance;
}

export default async function handler(req, res) {
  const { action, jobId, enabled } = req.query;

  try {
    const automation = getAutomation({
      tiktok: null, // Would be initialized with actual integrations
      mlc: null,
      soundExchange: null
    });

    switch (req.method) {
      case 'GET':
        if (action === 'status') {
          // Get all jobs status
          const jobs = automation.automation.getAllJobs();
          const history = automation.automation.getJobHistory({ limit: 50 });
          
          res.status(200).json({
            success: true,
            jobs,
            recentHistory: history,
            totalJobs: jobs.length,
            runningJobs: jobs.filter(j => j.status === 'running').length
          });
        } else if (action === 'job' && jobId) {
          // Get specific job status
          const status = automation.automation.getJobStatus(jobId);
          res.status(200).json({
            success: true,
            ...status
          });
        } else if (action === 'history') {
          // Get job history
          const history = automation.automation.getJobHistory({
            jobId: jobId || undefined,
            status: req.query.status || undefined,
            limit: parseInt(req.query.limit) || 100
          });
          res.status(200).json({
            success: true,
            history,
            count: history.length
          });
        } else if (action === 'check-rotations') {
          // Check if any keys need rotation
          const rotationsNeeded = automation.automation.checkRotationsNeeded();
          res.status(200).json({
            success: true,
            rotationsNeeded,
            count: rotationsNeeded.length
          });
        } else {
          // Default: return all jobs
          const jobs = automation.automation.getAllJobs();
          res.status(200).json({
            success: true,
            jobs,
            defaultJobs: {
              sync_tiktok_analytics: {
                name: 'Sync TikTok Analytics',
                schedule: 'Every 15 minutes',
                purpose: 'Fetches latest analytics from TikTok Creator Marketplace'
              },
              sync_mlc_royalties: {
                name: 'Sync MLC Royalties',
                schedule: 'Every 6 hours',
                purpose: 'Fetches mechanical royalty data from MLC'
              },
              sync_soundexchange: {
                name: 'Sync SoundExchange',
                schedule: 'Daily at midnight',
                purpose: 'Fetches performance royalty data from SoundExchange'
              },
              generate_daily_report: {
                name: 'Generate Daily Report',
                schedule: 'Daily at 1 AM',
                purpose: 'Creates comprehensive daily analytics report'
              },
              check_royalty_payments: {
                name: 'Check Royalty Payments',
                schedule: 'Hourly',
                purpose: 'Monitors for new royalty payments across all platforms'
              }
            }
          });
        }
        break;

      case 'POST':
        if (action === 'execute' && jobId) {
          // Execute a job manually
          const params = req.body || {};
          const result = await automation.automation.executeJob(jobId, params);
          res.status(200).json({
            success: true,
            message: `Job ${jobId} executed`,
            result
          });
        } else if (action === 'register') {
          // Register a new job
          const jobConfig = req.body;
          const job = automation.automation.registerJob(jobConfig);
          res.status(201).json({
            success: true,
            message: 'Job registered successfully',
            job
          });
        } else if (action === 'run-all') {
          // Run all enabled jobs
          const jobs = automation.automation.getAllJobs();
          const enabledJobs = jobs.filter(j => j.enabled);
          const results = [];
          
          for (const job of enabledJobs) {
            try {
              const result = await automation.automation.executeJob(job.id);
              results.push({ jobId: job.id, status: 'success', result });
            } catch (error) {
              results.push({ jobId: job.id, status: 'error', error: error.message });
            }
          }
          
          res.status(200).json({
            success: true,
            message: `Executed ${enabledJobs.length} jobs`,
            results
          });
        } else {
          res.status(400).json({ 
            error: 'Invalid POST action. Use: execute (with jobId), register, or run-all' 
          });
        }
        break;

      case 'PUT':
        if (action === 'enable' && jobId) {
          // Enable a job
          const result = automation.automation.setJobEnabled(jobId, true);
          res.status(200).json({
            success: true,
            message: `Job ${jobId} enabled`,
            ...result
          });
        } else if (action === 'disable' && jobId) {
          // Disable a job
          const result = automation.automation.setJobEnabled(jobId, false);
          res.status(200).json({
            success: true,
            message: `Job ${jobId} disabled`,
            ...result
          });
        } else {
          res.status(400).json({ 
            error: 'Invalid PUT action. Use: enable or disable (with jobId)' 
          });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Automation API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}