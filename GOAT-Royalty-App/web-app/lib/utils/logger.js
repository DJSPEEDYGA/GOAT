/**
 * SUPER GOAT ROYALTIES - Structured Logger
 * Winston-based logging with file rotation, request tracking, and metrics
 */

const winston = require('winston');
const path = require('path');

// Custom format for clean console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, requestId, method, path: reqPath, duration, ...meta }) => {
        let line = `${timestamp} ${level}: ${message}`;
        if (requestId) line += ` [${requestId.slice(0, 8)}]`;
        if (method && reqPath) line += ` ${method} ${reqPath}`;
        if (duration) line += ` (${duration}ms)`;
        if (Object.keys(meta).length > 0 && !meta.service) {
            const extras = JSON.stringify(meta);
            if (extras !== '{}') line += ` ${extras}`;
        }
        return line;
    })
);

// JSON format for file logging
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    defaultMeta: { service: 'goat-royalties' },
    transports: [
        // Console output (always)
        new winston.transports.Console({
            format: consoleFormat
        }),
        // Combined log file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        }),
        // Error log file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5
        })
    ]
});

// ==================== METRICS COLLECTOR ====================

class MetricsCollector {
    constructor() {
        this.requests = {
            total: 0,
            byMethod: {},
            byPath: {},
            byStatus: {},
            errors: 0
        };
        this.responseTimes = [];
        this.aiRequests = {
            total: 0,
            byProvider: {},
            byModel: {},
            errors: 0,
            avgResponseTime: 0
        };
        this.startTime = Date.now();
    }

    /** Record an HTTP request */
    recordRequest(method, path, statusCode, duration) {
        this.requests.total++;
        this.requests.byMethod[method] = (this.requests.byMethod[method] || 0) + 1;

        // Normalize path (remove IDs/params for grouping)
        const normalizedPath = path.replace(/\/[a-f0-9-]{36}/g, '/:id')
            .replace(/\/\d+/g, '/:id')
            .split('?')[0];
        this.requests.byPath[normalizedPath] = (this.requests.byPath[normalizedPath] || 0) + 1;

        const statusGroup = `${Math.floor(statusCode / 100)}xx`;
        this.requests.byStatus[statusGroup] = (this.requests.byStatus[statusGroup] || 0) + 1;

        if (statusCode >= 400) this.requests.errors++;

        // Keep last 1000 response times for percentile calculation
        this.responseTimes.push(duration);
        if (this.responseTimes.length > 1000) this.responseTimes.shift();
    }

    /** Record an AI provider request */
    recordAIRequest(provider, model, duration, success) {
        this.aiRequests.total++;
        this.aiRequests.byProvider[provider] = (this.aiRequests.byProvider[provider] || 0) + 1;
        if (model) this.aiRequests.byModel[model] = (this.aiRequests.byModel[model] || 0) + 1;
        if (!success) this.aiRequests.errors++;

        // Running average
        const n = this.aiRequests.total;
        this.aiRequests.avgResponseTime = ((this.aiRequests.avgResponseTime * (n - 1)) + duration) / n;
    }

    /** Get response time percentiles */
    getPercentiles() {
        if (this.responseTimes.length === 0) return { p50: 0, p95: 0, p99: 0 };
        const sorted = [...this.responseTimes].sort((a, b) => a - b);
        const len = sorted.length;
        return {
            p50: sorted[Math.floor(len * 0.5)] || 0,
            p95: sorted[Math.floor(len * 0.95)] || 0,
            p99: sorted[Math.floor(len * 0.99)] || 0
        };
    }

    /** Get complete metrics snapshot */
    getSnapshot() {
        const uptimeMs = Date.now() - this.startTime;
        const uptimeHours = (uptimeMs / 3600000).toFixed(2);
        return {
            uptime: `${uptimeHours}h`,
            uptimeMs,
            http: {
                ...this.requests,
                avgResponseTime: this.responseTimes.length > 0
                    ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
                    : 0,
                percentiles: this.getPercentiles()
            },
            ai: this.aiRequests,
            memory: {
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
            }
        };
    }

    /** Reset all metrics */
    reset() {
        this.requests = { total: 0, byMethod: {}, byPath: {}, byStatus: {}, errors: 0 };
        this.responseTimes = [];
        this.aiRequests = { total: 0, byProvider: {}, byModel: {}, errors: 0, avgResponseTime: 0 };
    }
}

const metrics = new MetricsCollector();

/**
 * Express middleware that logs requests and collects metrics
 */
function requestLogger(req, res, next) {
    const start = Date.now();

    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - start;
        const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

        logger.log(level, `${req.method} ${req.path} ${res.statusCode}`, {
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.headers['user-agent']?.substring(0, 100)
        });

        metrics.recordRequest(req.method, req.path, res.statusCode, duration);
        originalEnd.apply(this, args);
    };

    next();
}

module.exports = { logger, metrics, requestLogger };