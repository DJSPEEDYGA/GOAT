/**
 * GOAT Royalty App - Music Royalty Management Platform
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 * 
 * Created: December 19, 2024
 * Authors: HARVEY L MILLER JR, JUAQUIN J MALPHURS, KEVIN W HALLINGQUEST
 * Version: 1.0
 * License: All Rights Reserved
 * 
 * Description: Comprehensive error handling and logging system
 * 
 * This software is the proprietary property of HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * and is protected by copyright laws and international copyright treaties.
 * Unauthorized use, reproduction, or distribution is strictly prohibited.
 */

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  // Log error with context
  logError(error, context = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server-side'
    };

    this.errors.push(errorData);

    // In development, log to console
    if (this.isDevelopment) {
      console.error('GOAT Royalty App Error:', errorData);
    }

    // In production, send to monitoring service
    if (!this.isDevelopment) {
      this.sendToMonitoringService(errorData);
    }
  }

  // Send error to monitoring service (placeholder)
  async sendToMonitoringService(errorData) {
    try {
      // TODO: Implement actual monitoring service integration
      // Could be Sentry, LogRocket, or custom solution
      console.log('Error sent to monitoring service:', errorData);
    } catch (e) {
      console.error('Failed to send error to monitoring service:', e);
    }
  }

  // Handle API errors
  handleApiError(error, endpoint, requestData) {
    const context = {
      type: 'API_ERROR',
      endpoint,
      requestData: this.sanitizeData(requestData)
    };

    this.logError(error, context);

    // Return user-friendly error message
    if (error.response) {
      // Server responded with error status
      return {
        message: this.getUserFriendlyMessage(error.response.status),
        status: error.response.status,
        details: this.isDevelopment ? error.response.data : null
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Unable to connect to the server. Please check your internet connection.',
        status: 0,
        details: null
      };
    } else {
      // Something else happened
      return {
        message: 'An unexpected error occurred. Please try again.',
        status: 500,
        details: this.isDevelopment ? error.message : null
      };
    }
  }

  // Get user-friendly error messages
  getUserFriendlyMessage(status) {
    const messages = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'You need to log in to access this feature.',
      403: 'You don\'t have permission to access this resource.',
      404: 'The requested resource was not found.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service maintenance in progress. Please try again later.'
    };

    return messages[status] || 'An unexpected error occurred. Please try again.';
  }

  // Sanitize sensitive data for logging
  sanitizeData(data) {
    if (!data) return null;
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'key'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // Get error statistics
  getErrorStats() {
    return {
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-10),
      errorTypes: this.getErrorTypes(),
      lastError: this.errors[this.errors.length - 1] || null
    };
  }

  // Get error types breakdown
  getErrorTypes() {
    const types = {};
    this.errors.forEach(error => {
      const type = error.context?.type || 'UNKNOWN';
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  // Clear error log
  clearErrors() {
    this.errors = [];
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;