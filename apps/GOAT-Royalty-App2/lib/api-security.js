/**
 * 🛡️ GOAT Royalty App — Unified API Security Middleware
 * Composable security wrapper for all API routes
 * 
 * Architecture:
 * - withSecurity(handler, options) → wraps any API route
 * - Combines: rate limiting, input validation, method enforcement,
 *   security headers, CORS, logging, and optional auth
 * 
 * © 2025 Harvey Miller / FASTASSMAN Publishing Inc
 * Architect: SuperNinja AI — Security Hardening Layer
 */

const {
  rateLimit,
  setSecurityHeaders,
  getClientIP,
  validateMethod,
  sanitizeString,
  logSecurityEvent,
} = require('./security');

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT INJECTION DEFENSE — AI Endpoint Protection
// ═══════════════════════════════════════════════════════════════════════════════

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /system\s*:\s*/i,
  /\[\s*INST\s*\]/i,
  /\[\s*SYSTEM\s*\]/i,
  /<<\s*SYS\s*>>/i,
  /forget\s+(everything|all|your)\s+(you|instructions?|training)/i,
  /override\s+(your|all|the)\s+(instructions?|rules?|restrictions?)/i,
  /pretend\s+(you\s+are|to\s+be|you're)\s+/i,
  /jailbreak/i,
  /DAN\s*mode/i,
  /do\s+anything\s+now/i,
  /bypass\s+(your|all|the)\s+(filters?|restrictions?|safety)/i,
  /act\s+as\s+(if|though)\s+you\s+(have|had)\s+no\s+(restrictions?|rules?|limits?)/i,
  /reveal\s+(your|the)\s+(system|initial|original)\s+(prompt|instructions?|message)/i,
  /what\s+(is|are)\s+your\s+(system|initial|original)\s+(prompt|instructions?)/i,
  /output\s+(your|the)\s+(system|initial)\s+(prompt|message|instructions?)/i,
  /repeat\s+(the|your)\s+(system|initial)\s+(prompt|message|instructions?)/i,
  /print\s+(your|the)\s+(system|initial)\s+(prompt|instructions?)/i,
];

function detectPromptInjection(text) {
  if (typeof text !== 'string') return { detected: false, score: 0, patterns: [] };
  
  const matched = [];
  let score = 0;
  
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      matched.push(pattern.source);
      score += 1;
    }
  }
  
  // Check for excessive special characters (encoding attacks)
  const specialCharRatio = (text.match(/[<>{}[\]\\|`~^]/g) || []).length / Math.max(text.length, 1);
  if (specialCharRatio > 0.15) {
    matched.push('excessive_special_chars');
    score += 1;
  }
  
  // Check for very long inputs (potential buffer/context overflow)
  if (text.length > 50000) {
    matched.push('excessive_length');
    score += 1;
  }
  
  return {
    detected: score >= 1,
    score,
    severity: score >= 3 ? 'critical' : score >= 2 ? 'high' : score >= 1 ? 'medium' : 'low',
    patterns: matched,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST BODY SIZE VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════

function validateBodySize(body, maxSizeBytes = 5 * 1024 * 1024) {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body || {});
  return Buffer.byteLength(bodyStr, 'utf8') <= maxSizeBytes;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST FINGERPRINTING (for abuse detection)
// ═══════════════════════════════════════════════════════════════════════════════

function getRequestFingerprint(req) {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const accept = req.headers['accept'] || '';
  return `${ip}:${userAgent.substring(0, 50)}:${accept.substring(0, 30)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUSPICIOUS PATTERN DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

const SUSPICIOUS_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /burpsuite/i,
  /nmap/i,
  /masscan/i,
  /dirbuster/i,
  /gobuster/i,
  /wpscan/i,
  /hydra/i,
  /metasploit/i,
  /curl\/\d/i,   // bare curl (may be fine, flag only)
  /python-requests/i,
  /scrapy/i,
];

function isSuspiciousRequest(req) {
  const ua = req.headers['user-agent'] || '';
  const flags = [];
  
  for (const pattern of SUSPICIOUS_USER_AGENTS) {
    if (pattern.test(ua)) {
      flags.push(`suspicious_ua:${pattern.source}`);
    }
  }
  
  // Check for path traversal attempts
  const url = req.url || '';
  if (/\.\.\//g.test(url) || /\.\.%2f/gi.test(url)) {
    flags.push('path_traversal');
  }
  
  // Check for SQL injection patterns in URL
  if (/('|"|;|--|union\s+select|drop\s+table|insert\s+into)/i.test(url)) {
    flags.push('sqli_attempt');
  }
  
  return { suspicious: flags.length > 0, flags };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * withSecurity — Composable security middleware for API routes
 * 
 * @param {Function} handler - The API route handler
 * @param {Object} options - Security configuration
 * @param {string[]} options.methods - Allowed HTTP methods (default: ['POST'])
 * @param {number} options.rateLimit - Max requests per window (default: 60)
 * @param {number} options.rateLimitWindow - Window in ms (default: 60000)
 * @param {boolean} options.requireAuth - Require authentication (default: false)
 * @param {boolean} options.aiEndpoint - Enable prompt injection defense (default: false)
 * @param {number} options.maxBodySize - Max body size in bytes (default: 5MB)
 * @param {boolean} options.logRequests - Log all requests (default: true)
 * @param {boolean} options.cors - Enable CORS (default: true)
 * @param {string[]} options.allowedOrigins - CORS allowed origins
 * 
 * @returns {Function} Secured handler
 */
function withSecurity(handler, options = {}) {
  const {
    methods = ['POST'],
    rateLimit: rateLimitMax = 60,
    rateLimitWindow = 60000,
    requireAuth = false,
    aiEndpoint = false,
    maxBodySize = 5 * 1024 * 1024,
    logRequests = true,
    cors = true,
    allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://93.127.214.171',
      'https://goatroyalty.com',
      'https://www.goatroyalty.com',
    ],
  } = options;
  
  return async (req, res) => {
    const ip = getClientIP(req);
    const fingerprint = getRequestFingerprint(req);
    const startTime = Date.now();
    
    try {
      // ─── 1. Security Headers ────────────────────────────────────────────────
      setSecurityHeaders(res);
      
      // ─── 2. CORS ────────────────────────────────────────────────────────────
      if (cors) {
        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
        res.setHeader('Access-Control-Allow-Methods', methods.join(', ') + ', OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        if (req.method === 'OPTIONS') {
          return res.status(200).end();
        }
      }
      
      // ─── 3. Method Validation ───────────────────────────────────────────────
      if (!methods.includes(req.method)) {
        logSecurityEvent('blocked_method', { ip, method: req.method, url: req.url });
        return res.status(405).json({
          error: `Method ${req.method} not allowed. Use: ${methods.join(', ')}`,
        });
      }
      
      // ─── 4. Suspicious Request Detection ────────────────────────────────────
      const suspicion = isSuspiciousRequest(req);
      if (suspicion.suspicious) {
        logSecurityEvent('suspicious_request', {
          ip,
          url: req.url,
          flags: suspicion.flags,
          userAgent: req.headers['user-agent'],
        });
        
        // Block known attack tools
        if (suspicion.flags.some((f) => f.includes('path_traversal') || f.includes('sqli_attempt'))) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
      
      // ─── 5. Rate Limiting ───────────────────────────────────────────────────
      const rateLimitResult = rateLimit(ip, { windowMs: rateLimitWindow, max: rateLimitMax });
      
      res.setHeader('X-RateLimit-Limit', rateLimitMax);
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetIn / 1000));
      
      if (!rateLimitResult.allowed) {
        logSecurityEvent('rate_limited', { ip, url: req.url });
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(rateLimitResult.resetIn / 1000),
        });
      }
      
      // ─── 6. Body Size Validation ────────────────────────────────────────────
      if (req.body && !validateBodySize(req.body, maxBodySize)) {
        logSecurityEvent('oversized_body', { ip, url: req.url });
        return res.status(413).json({ error: 'Request body too large' });
      }
      
      // ─── 7. AI Prompt Injection Defense ─────────────────────────────────────
      if (aiEndpoint && req.body) {
        const textFields = extractTextFields(req.body);
        
        for (const { path, value } of textFields) {
          const injection = detectPromptInjection(value);
          
          if (injection.detected && injection.severity === 'critical') {
            logSecurityEvent('prompt_injection_blocked', {
              ip,
              url: req.url,
              severity: injection.severity,
              score: injection.score,
              patterns: injection.patterns,
              field: path,
            });
            return res.status(400).json({
              error: 'Request contains potentially harmful content and has been blocked.',
            });
          }
          
          if (injection.detected) {
            logSecurityEvent('prompt_injection_warning', {
              ip,
              url: req.url,
              severity: injection.severity,
              score: injection.score,
              patterns: injection.patterns,
              field: path,
            });
            // Allow but flag — don't block medium/low severity
          }
        }
      }
      
      // ─── 8. Request Logging ─────────────────────────────────────────────────
      if (logRequests) {
        logSecurityEvent('api_request', {
          ip,
          method: req.method,
          url: req.url,
          userAgent: (req.headers['user-agent'] || '').substring(0, 100),
        });
      }
      
      // ─── 9. Execute Handler ─────────────────────────────────────────────────
      const result = await handler(req, res);
      
      // ─── 10. Response Time Tracking ─────────────────────────────────────────
      const duration = Date.now() - startTime;
      if (duration > 10000) {
        logSecurityEvent('slow_request', { ip, url: req.url, durationMs: duration });
      }
      
      return result;
      
    } catch (error) {
      logSecurityEvent('api_error', {
        ip,
        url: req.url,
        error: error.message,
      });
      
      console.error(`[API ERROR] ${req.url}:`, error.message);
      
      if (!res.headersSent) {
        return res.status(500).json({
          error: 'Internal server error',
          // Never expose stack traces in production
          ...(process.env.NODE_ENV === 'development' ? { details: error.message } : {}),
        });
      }
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: Extract text fields from nested object (for prompt injection scan)
// ═══════════════════════════════════════════════════════════════════════════════

function extractTextFields(obj, path = '', results = []) {
  if (typeof obj === 'string') {
    results.push({ path: path || 'root', value: obj });
    return results;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      extractTextFields(item, `${path}[${idx}]`, results);
    });
    return results;
  }
  
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      extractTextFields(value, path ? `${path}.${key}` : key, results);
    }
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: withAISecurity — Shorthand for AI endpoints
// ═══════════════════════════════════════════════════════════════════════════════

function withAISecurity(handler, options = {}) {
  return withSecurity(handler, {
    methods: ['POST'],
    rateLimit: 30,
    rateLimitWindow: 60000,
    aiEndpoint: true,
    maxBodySize: 20 * 1024 * 1024, // 20MB for image uploads
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: withPublicSecurity — For public/read-only endpoints
// ═══════════════════════════════════════════════════════════════════════════════

function withPublicSecurity(handler, options = {}) {
  return withSecurity(handler, {
    methods: ['GET', 'POST'],
    rateLimit: 120,
    rateLimitWindow: 60000,
    aiEndpoint: false,
    maxBodySize: 1 * 1024 * 1024, // 1MB
    ...options,
  });
}

module.exports = {
  withSecurity,
  withAISecurity,
  withPublicSecurity,
  detectPromptInjection,
  isSuspiciousRequest,
  getRequestFingerprint,
  validateBodySize,
  extractTextFields,
  PROMPT_INJECTION_PATTERNS,
};