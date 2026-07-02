/**
 * GOAT Royalty App - Security Middleware
 * HIGH LEVEL SECURITY
 * 
 * Features:
 * - Request validation
 * - Rate limiting
 * - DDoS protection
 * - Signature verification
 * - Audit logging
 */

const crypto = require('crypto');

class SecurityMiddleware {
  constructor(config) {
    this.config = config;
    this.requestCounts = new Map();
    this.blockedIPs = new Set();
    this.suspiciousActivity = new Map();
  }

  // ═══════════════════════════════════════════════════════════
  // RATE LIMITING
  // ═══════════════════════════════════════════════════════════
  
  checkRateLimit(ip, endpoint) {
    const key = `${ip}:${endpoint}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { count: 1, startTime: now });
      return { allowed: true, remaining: this.config.SECURITY.firewall.rateLimitGlobal - 1 };
    }
    
    const record = this.requestCounts.get(key);
    
    if (now - record.startTime > windowMs) {
      // Reset window
      this.requestCounts.set(key, { count: 1, startTime: now });
      return { allowed: true, remaining: this.config.SECURITY.firewall.rateLimitGlobal - 1 };
    }
    
    if (record.count >= this.config.SECURITY.firewall.rateLimitGlobal) {
      this.flagSuspiciousActivity(ip, 'rate_limit_exceeded');
      return { allowed: false, remaining: 0, retryAfter: windowMs - (now - record.startTime) };
    }
    
    record.count++;
    return { allowed: true, remaining: this.config.SECURITY.firewall.rateLimitGlobal - record.count };
  }

  // ═══════════════════════════════════════════════════════════
  // DDoS PROTECTION
  // ═══════════════════════════════════════════════════════════
  
  detectDDoS(ip) {
    const key = `ddos:${ip}`;
    const now = Date.now();
    const threshold = 100; // requests per second
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { count: 1, startTime: now });
      return { detected: false };
    }
    
    const record = this.requestCounts.get(key);
    const elapsed = now - record.startTime;
    
    if (elapsed < 1000) { // Within 1 second
      if (record.count >= threshold) {
        this.blockIP(ip, 'ddos_detected');
        return { detected: true, blocked: true };
      }
      record.count++;
    } else {
      // Reset for new second
      this.requestCounts.set(key, { count: 1, startTime: now });
    }
    
    return { detected: false };
  }

  blockIP(ip, reason) {
    this.blockedIPs.add(ip);
    console.log(`🚫 IP BLOCKED: ${ip} - Reason: ${reason}`);
    this.logSecurityEvent('ip_blocked', { ip, reason });
  }

  isBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // ═══════════════════════════════════════════════════════════
  // SUSPICIOUS ACTIVITY DETECTION
  // ═══════════════════════════════════════════════════════════
  
  flagSuspiciousActivity(ip, reason) {
    const key = `suspicious:${ip}`;
    const count = this.suspiciousActivity.get(key) || 0;
    
    this.suspiciousActivity.set(key, count + 1);
    
    if (count + 1 >= 3) {
      this.blockIP(ip, `repeated_suspicious_activity:${reason}`);
    }
    
    console.log(`⚠️ SUSPICIOUS: ${ip} - ${reason} (count: ${count + 1})`);
    this.logSecurityEvent('suspicious_activity', { ip, reason, count: count + 1 });
  }

  // ═══════════════════════════════════════════════════════════
  // SIGNATURE VERIFICATION
  // ═══════════════════════════════════════════════════════════
  
  verifySignature(payload, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    
    if (!isValid) {
      this.logSecurityEvent('invalid_signature', { payload: payload.id || 'unknown' });
    }
    
    return isValid;
  }

  // ═══════════════════════════════════════════════════════════
  // REQUEST VALIDATION
  // ═══════════════════════════════════════════════════════════
  
  validateRequest(req) {
    const errors = [];
    
    // Check for blocked IP
    if (this.isBlocked(req.ip)) {
      return { valid: false, error: 'IP blocked', code: 403 };
    }
    
    // DDoS check
    const ddosCheck = this.detectDDoS(req.ip);
    if (ddosCheck.detected) {
      return { valid: false, error: 'DDoS detected', code: 429 };
    }
    
    // Rate limit check
    const rateCheck = this.checkRateLimit(req.ip, req.path);
    if (!rateCheck.allowed) {
      return { valid: false, error: 'Rate limit exceeded', code: 429, retryAfter: rateCheck.retryAfter };
    }
    
    // Validate headers
    if (!req.headers['user-agent']) {
      this.flagSuspiciousActivity(req.ip, 'missing_user_agent');
      errors.push('Missing User-Agent header');
    }
    
    // Check for SQL injection patterns
    const sqlPatterns = /('|"|;|--|\/\*|\*\/|xp_|exec|union|select|insert|delete|update|drop|create|alter)/i;
    if (sqlPatterns.test(JSON.stringify(req.body || {}))) {
      this.flagSuspiciousActivity(req.ip, 'sql_injection_attempt');
      return { valid: false, error: 'Invalid input', code: 400 };
    }
    
    // Check for XSS patterns
    const xssPatterns = /<script|javascript:|on\w+\s*=|data:/i;
    if (xssPatterns.test(JSON.stringify(req.body || {}))) {
      this.flagSuspiciousActivity(req.ip, 'xss_attempt');
      return { valid: false, error: 'Invalid input', code: 400 };
    }
    
    return { valid: true, rateLimit: rateCheck };
  }

  // ═══════════════════════════════════════════════════════════
  // API KEY VALIDATION
  // ═══════════════════════════════════════════════════════════
  
  validateAPIKey(apiKey) {
    // Check format
    if (!apiKey || typeof apiKey !== 'string') {
      return { valid: false, error: 'Invalid API key format' };
    }
    
    // Check prefix
    if (!apiKey.startsWith('goat_')) {
      return { valid: false, error: 'Invalid API key prefix' };
    }
    
    // Check length
    if (apiKey.length < 32 || apiKey.length > 128) {
      return { valid: false, error: 'Invalid API key length' };
    }
    
    return { valid: true };
  }

  // ═══════════════════════════════════════════════════════════
  // SECURITY HEADERS
  // ═══════════════════════════════════════════════════════════
  
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.nvidia.com https://api.openai.com",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
  }

  // ═══════════════════════════════════════════════════════════
  // LOGGING
  // ═══════════════════════════════════════════════════════════
  
  logSecurityEvent(event, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: this.getEventSeverity(event),
    };
    
    console.log(`🔒 SECURITY: ${event}`, logEntry);
    
    if (this.config.SECURITY.audit.alertOnSuspicious && logEntry.severity === 'high') {
      this.sendSecurityAlert(logEntry);
    }
    
    return logEntry;
  }

  getEventSeverity(event) {
    const highSeverity = ['ip_blocked', 'ddos_detected', 'sql_injection_attempt', 'xss_attempt'];
    const mediumSeverity = ['suspicious_activity', 'invalid_signature', 'rate_limit_exceeded'];
    
    if (highSeverity.includes(event)) return 'high';
    if (mediumSeverity.includes(event)) return 'medium';
    return 'low';
  }

  sendSecurityAlert(logEntry) {
    // In production, this would send alerts via email, Slack, etc.
    console.log('🚨 SECURITY ALERT:', logEntry);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPRESS MIDDLEWARE
  // ═══════════════════════════════════════════════════════════
  
  middleware() {
    return (req, res, next) => {
      // Add security headers
      const headers = this.getSecurityHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      // Validate request
      const validation = this.validateRequest(req);
      
      if (!validation.valid) {
        return res.status(validation.code || 400).json({
          error: validation.error,
          retryAfter: validation.retryAfter,
        });
      }
      
      // Add rate limit headers
      if (validation.rateLimit) {
        res.setHeader('X-RateLimit-Remaining', validation.rateLimit.remaining);
      }
      
      next();
    };
  }
}

module.exports = SecurityMiddleware;