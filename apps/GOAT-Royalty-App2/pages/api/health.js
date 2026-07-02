/**
 * Health Check API Endpoint
 * Used for Docker health checks and monitoring
 */

export default function handler(req, res) {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GOAT Royalty App',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json(healthCheck);
}