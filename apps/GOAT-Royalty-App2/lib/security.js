/**
 * GOAT Royalty App - Music Royalty Management Platform
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 * 
 * Created: December 19, 2024
 * Authors: HARVEY L MILLER JR, JUAQUIN J MALPHURS, KEVIN W HALLINGQUEST
 * Version: 1.0
 * License: All Rights Reserved
 * 
 * Description: Security utilities and protection mechanisms
 * 
 * This software is the proprietary property of HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * and is protected by copyright laws and international copyright treaties.
 * Unauthorized use, reproduction, or distribution is strictly prohibited.
 */

import crypto from 'crypto';

class SecurityManager {
  constructor() {
    this.rateLimitStore = new Map();
    this.csrfStore = new Map();
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateKey();
  }

  // Generate encryption key
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Encrypt sensitive data
  encrypt(data) {
    try {
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Rate limiting implementation
  rateLimit(identifier, limit = 100, windowMs = 60000) {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    const record = this.rateLimitStore.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return { allowed: true, remaining: limit - 1 };
    }

    if (record.count >= limit) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      };
    }

    record.count++;
    return { allowed: true, remaining: limit - record.count };
  }

  // Generate CSRF token
  generateCSRFToken(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.csrfStore.set(sessionId, { token, expiresAt });
    return token;
  }

  // Validate CSRF token
  validateCSRFToken(sessionId, token) {
    const stored = this.csrfStore.get(sessionId);
    
    if (!stored || stored.token !== token) {
      return false;
    }

    if (Date.now() > stored.expiresAt) {
      this.csrfStore.delete(sessionId);
      return false;
    }

    return true;
  }

  // Clean up expired CSRF tokens
  cleanupCSRFTokens() {
    const now = Date.now();
    for (const [sessionId, data] of this.csrfStore.entries()) {
      if (now > data.expiresAt) {
        this.csrfStore.delete(sessionId);
      }
    }
  }

  // Input sanitization
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      errors: [
        password.length < minLength ? 'Password must be at least 8 characters long' : null,
        !hasUpperCase ? 'Password must contain at least one uppercase letter' : null,
        !hasLowerCase ? 'Password must contain at least one lowercase letter' : null,
        !hasNumbers ? 'Password must contain at least one number' : null,
        !hasSpecialChar ? 'Password must contain at least one special character' : null
      ].filter(error => error !== null)
    };
  }

  // Generate secure API key
  generateAPIKey() {
    return `goat_${crypto.randomBytes(32).toString('hex')}`;
  }

  // Hash password
  hashPassword(password, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }
    
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  // Verify password
  verifyPassword(password, hash, salt) {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
  }

  // Generate JWT secret
  generateJWTSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  // Create security headers
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }

  // Detect suspicious activity
  detectSuspiciousActivity(identifier, action) {
    // Implement suspicious activity detection logic
    const suspiciousPatterns = [
      /admin/i,
      /drop table/i,
      /union select/i,
      /script.*>/i,
      /javascript:/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(action));
  }

  // Log security event
  logSecurityEvent(event, details = {}) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      event,
      details: this.sanitizeSecurityDetails(details),
      severity: this.getEventSeverity(event)
    };

    console.warn('Security Event:', securityEvent);
    
    // TODO: Send to security monitoring service
    this.sendSecurityAlert(securityEvent);
  }

  // Sanitize security details for logging
  sanitizeSecurityDetails(details) {
    const sanitized = { ...details };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // Get event severity
  getEventSeverity(event) {
    const highSeverityEvents = [
      'RATE_LIMIT_EXCEEDED',
      'INVALID_CSRF_TOKEN',
      'SUSPICIOUS_ACTIVITY_DETECTED',
      'UNAUTHORIZED_ACCESS_ATTEMPT'
    ];

    return highSeverityEvents.includes(event) ? 'HIGH' : 'MEDIUM';
  }

  // Send security alert (placeholder)
  sendSecurityAlert(securityEvent) {
    // TODO: Implement actual alert system
    if (securityEvent.severity === 'HIGH') {
      console.error('🚨 HIGH SEVERITY SECURITY ALERT:', securityEvent);
    }
  }

  // Generate secure session ID
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Validate API request
  validateAPIRequest(req, apiKey) {
    // Implement API request validation
    const requiredHeaders = ['Content-Type', 'User-Agent'];
    const hasRequiredHeaders = requiredHeaders.every(header => req.headers[header]);
    
    if (!hasRequiredHeaders) {
      return { valid: false, error: 'Missing required headers' };
    }

    // Validate API key format
    if (!apiKey || !apiKey.startsWith('goat_')) {
      return { valid: false, error: 'Invalid API key format' };
    }

    return { valid: true };
  }
}

// Create singleton instance
const securityManager = new SecurityManager();

export default securityManager;