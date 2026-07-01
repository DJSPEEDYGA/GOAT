/**
 * SUPER GOAT ROYALTIES - Security Middleware Suite
 * Rate limiting, input validation, API authentication, error sanitization
 */

const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ==================== RATE LIMITERS ====================

/** Global API rate limiter - 100 req/min per IP */
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.', retryAfter: 60 },
    validate: { xForwardedForHeader: false }
});

/** Strict limiter for AI/chat endpoints - 30 req/min */
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'AI request limit reached. Please wait before sending more requests.', retryAfter: 60 },
    validate: { xForwardedForHeader: false }
});

/** Auth endpoint limiter - 10 req/min (brute-force protection) */
const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again later.', retryAfter: 60 },
    validate: { xForwardedForHeader: false }
});

// ==================== INPUT VALIDATION SCHEMAS ====================

const schemas = {
    /** Chat message validation */
    chat: Joi.object({
        messages: Joi.array().items(
            Joi.object({
                role: Joi.string().valid('user', 'assistant', 'system').required(),
                content: Joi.string().min(1).max(32000).required()
            })
        ).min(1).max(50).required(),
        provider: Joi.string().max(50).optional(),
        model: Joi.string().max(100).optional(),
        options: Joi.object({
            temperature: Joi.number().min(0).max(2).optional(),
            max_tokens: Joi.number().integer().min(1).max(128000).optional(),
            top_p: Joi.number().min(0).max(1).optional(),
            stream: Joi.boolean().optional()
        }).optional()
    }),

    /** Text generation validation */
    generate: Joi.object({
        prompt: Joi.string().min(1).max(32000).required(),
        model: Joi.string().max(100).optional(),
        provider: Joi.string().max(50).optional(),
        options: Joi.object({
            temperature: Joi.number().min(0).max(2).optional(),
            max_tokens: Joi.number().integer().min(1).max(128000).optional(),
            top_p: Joi.number().min(0).max(1).optional()
        }).optional()
    }),

    /** Revenue analysis validation */
    revenueAnalysis: Joi.object({
        revenueData: Joi.object().optional(),
        timeframe: Joi.string().valid('week', 'month', 'quarter', 'year').optional(),
        platform: Joi.string().max(50).optional(),
        provider: Joi.string().max(50).optional(),
        model: Joi.string().max(100).optional()
    }),

    /** Market prediction validation */
    marketPrediction: Joi.object({
        genre: Joi.string().max(50).optional(),
        platform: Joi.string().max(50).optional(),
        timeframe: Joi.string().valid('week', 'month', 'quarter', 'year', '1month', '3months', '6months', '1year').optional(),
        provider: Joi.string().max(50).optional(),
        model: Joi.string().max(100).optional()
    }),

    /** Content recommendation validation */
    contentRecommendation: Joi.object({
        artistProfile: Joi.object().optional(),
        currentContent: Joi.object().optional(),
        provider: Joi.string().max(50).optional(),
        model: Joi.string().max(100).optional()
    }),

    /** Contract generation validation */
    contractGeneration: Joi.object({
        contractType: Joi.string().max(100).optional(),
        parties: Joi.alternatives().try(Joi.object(), Joi.array()).optional(),
        terms: Joi.alternatives().try(Joi.object(), Joi.array()).optional(),
        provider: Joi.string().max(50).optional(),
        model: Joi.string().max(100).optional()
    }),

    /** RAG query validation */
    ragQuery: Joi.object({
        query: Joi.string().min(1).max(5000).required()
    }),

    /** Model search validation */
    modelSearch: Joi.object({
        q: Joi.string().min(1).max(200).required()
    }),

    /** Auto-route validation */
    autoRoute: Joi.object({
        prompt: Joi.string().min(1).max(32000).required(),
        taskType: Joi.string().max(50).optional(),
        modelFamily: Joi.string().max(50).optional(),
        options: Joi.object().optional()
    }),

    /** Compare models validation */
    compareModels: Joi.object({
        prompt: Joi.string().min(1).max(32000).required(),
        providers: Joi.array().items(Joi.string().max(50)).min(1).max(5).optional(),
        model: Joi.string().max(100).optional(),
        options: Joi.object().optional()
    }),

    /** Catalog search validation */
    catalogSearch: Joi.object({
        q: Joi.string().max(200).optional(),
        title: Joi.string().max(200).optional(),
        writer: Joi.string().max(200).optional(),
        role: Joi.string().max(20).optional(),
        status: Joi.string().max(50).optional(),
        page: Joi.number().integer().min(1).max(1000).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        sort: Joi.string().valid('title', 'date', 'id').optional(),
        order: Joi.string().valid('asc', 'desc').optional()
    })
};

// ==================== VALIDATION MIDDLEWARE ====================

/**
 * Creates validation middleware for a given schema
 * @param {string} schemaName - Key in schemas object
 * @param {string} source - 'body' or 'query'
 */
function validate(schemaName, source = 'body') {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) return next();

        const data = source === 'query' ? req.query : req.body;
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: false
        });

        if (error) {
            const details = error.details.map(d => d.message).join('; ');
            return res.status(400).json({
                error: 'Validation failed',
                details: details
            });
        }

        // Replace with sanitized/validated data
        if (source === 'query') {
            req.query = value;
        } else {
            req.body = value;
        }
        next();
    };
}

// ==================== API KEY AUTHENTICATION ====================

/**
 * Optional API key authentication middleware
 * Checks X-API-Key header or ?apiKey query param
 * If GOAT_API_KEY env is not set, all requests pass through (dev mode)
 */
function apiKeyAuth(req, res, next) {
    const masterKey = process.env.GOAT_API_KEY;

    // If no master key is configured, skip auth (development mode)
    if (!masterKey) return next();

    const provided = req.headers['x-api-key'] || req.query.apiKey;

    if (!provided) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Provide API key via X-API-Key header'
        });
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
        Buffer.from(provided.padEnd(128, '\0')),
        Buffer.from(masterKey.padEnd(128, '\0'))
    );

    if (!isValid) {
        return res.status(403).json({ error: 'Invalid API key' });
    }

    next();
}

/**
 * JWT token authentication for user-specific routes
 */
function jwtAuth(req, res, next) {
    const secret = process.env.JWT_SECRET;
    if (!secret) return next(); // Skip in dev mode

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Bearer token required' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ==================== ERROR SANITIZATION ====================

/**
 * Sanitize error responses - never expose internal details in production
 */
function sanitizeError(err, req, res, next) {
    const isDev = process.env.NODE_ENV !== 'production';

    // Log full error internally
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    if (isDev) console.error(err.stack);

    const statusCode = err.statusCode || err.status || 500;

    const response = {
        error: statusCode >= 500 ? 'Internal server error' : err.message || 'Request failed',
        status: statusCode
    };

    // Only include details in development
    if (isDev) {
        response.debug = {
            message: err.message,
            stack: err.stack?.split('\n').slice(0, 3)
        };
    }

    res.status(statusCode).json(response);
}

// ==================== REQUEST ID & TIMING ====================

/**
 * Adds unique request ID and timing to every request
 */
function requestEnhancer(req, res, next) {
    req.requestId = crypto.randomUUID();
    req.startTime = Date.now();

    // Add request ID to response headers
    res.setHeader('X-Request-Id', req.requestId);

    // Track response time
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - req.startTime;
        res.setHeader('X-Response-Time', `${duration}ms`);
        originalEnd.apply(this, args);
    };

    next();
}

// ==================== SECURITY HEADERS ====================

/**
 * Additional security headers beyond helmet defaults
 */
function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
}

module.exports = {
    // Rate limiters
    globalLimiter,
    aiLimiter,
    authLimiter,
    // Validation
    validate,
    schemas,
    // Authentication
    apiKeyAuth,
    jwtAuth,
    // Error handling
    sanitizeError,
    // Enhancers
    requestEnhancer,
    securityHeaders
};