/**
 * GOAT Royalty App - Music Royalty Management Platform
 * Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST. All rights reserved.
 * 
 * Created: December 19, 2024
 * Authors: HARVEY L MILLER JR, JUAQUIN J MALPHURS, KEVIN W HALLINGQUEST
 * Version: 1.0
 * License: All Rights Reserved
 * 
 * Description: Performance monitoring and optimization system
 * 
 * This software is the proprietary property of HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST
 * and is protected by copyright laws and international copyright treaties.
 * Unauthorized use, reproduction, or distribution is strictly prohibited.
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: [],
      pageLoads: [],
      userInteractions: [],
      errors: [],
      resources: []
    };
    this.startTime = Date.now();
    this.observers = new Map();
  }

  // Initialize performance monitoring
  initialize() {
    if (typeof window !== 'undefined') {
      this.setupWebVitalsMonitoring();
      this.setupResourceMonitoring();
      this.setupUserInteractionTracking();
    }
  }

  // Track API call performance
  trackAPICall(url, method, startTime, endTime, status, error = null) {
    const metric = {
      url,
      method,
      startTime,
      endTime,
      duration: endTime - startTime,
      status,
      error,
      timestamp: new Date().toISOString()
    };

    this.metrics.apiCalls.push(metric);

    // Alert on slow API calls
    if (metric.duration > 5000) {
      this.reportSlowAPI(metric);
    }

    // Keep only last 1000 metrics
    if (this.metrics.apiCalls.length > 1000) {
      this.metrics.apiCalls = this.metrics.apiCalls.slice(-1000);
    }
  }

  // Track page load performance
  trackPageLoad(pageName, startTime, endTime) {
    const metric = {
      pageName,
      startTime,
      endTime,
      duration: endTime - startTime,
      timestamp: new Date().toISOString(),
      navigationTiming: this.getNavigationTiming()
    };

    this.metrics.pageLoads.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.pageLoads.length > 100) {
      this.metrics.pageLoads = this.metrics.pageLoads.slice(-100);
    }
  }

  // Track user interaction
  trackUserInteraction(type, target, startTime, endTime) {
    const metric = {
      type, // 'click', 'scroll', 'input', etc.
      target: target.tagName || 'unknown',
      duration: endTime - startTime,
      timestamp: new Date().toISOString()
    };

    this.metrics.userInteractions.push(metric);

    // Keep only last 500 metrics
    if (this.metrics.userInteractions.length > 500) {
      this.metrics.userInteractions = this.metrics.userInteractions.slice(-500);
    }
  }

  // Setup Web Vitals monitoring
  setupWebVitalsMonitoring() {
    // Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  // Observe Largest Contentful Paint (LCP)
  observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordWebVital('LCP', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
    }
  }

  // Observe First Input Delay (FID)
  observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordWebVital('FID', entry.processingStart - entry.startTime);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('FID', observer);
    }
  }

  // Observe Cumulative Layout Shift (CLS)
  observeCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordWebVital('CLS', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    }
  }

  // Record Web Vital
  recordWebVital(name, value) {
    const vital = {
      name,
      value,
      timestamp: new Date().toISOString(),
      rating: this.getWebVitalRating(name, value)
    };

    // Check if performance is poor
    if (vital.rating === 'POOR') {
      this.reportPoorWebVital(vital);
    }

    console.log(`Web Vital - ${name}: ${value} (${vital.rating})`);
  }

  // Get Web Vital rating
  getWebVitalRating(name, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'UNKNOWN';

    if (value <= threshold.good) return 'GOOD';
    if (value <= threshold.poor) return 'NEEDS_IMPROVEMENT';
    return 'POOR';
  }

  // Setup resource monitoring
  setupResourceMonitoring() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.trackResourceLoad(entry);
        });
      });
      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resources', observer);
    }
  }

  // Track resource loading
  trackResourceLoad(entry) {
    const resource = {
      name: entry.name,
      type: this.getResourceType(entry.name),
      duration: entry.duration,
      size: entry.transferSize || 0,
      timestamp: new Date().toISOString()
    };

    this.metrics.resources.push(resource);

    // Alert on slow resources
    if (resource.duration > 3000) {
      this.reportSlowResource(resource);
    }
  }

  // Get resource type from URL
  getResourceType(url) {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
    return 'other';
  }

  // Setup user interaction tracking
  setupUserInteractionTracking() {
    // Track click interactions
    document.addEventListener('click', (event) => {
      const startTime = performance.now();
      setTimeout(() => {
        this.trackUserInteraction('click', event.target, startTime, performance.now());
      }, 0);
    });

    // Track input interactions
    document.addEventListener('input', (event) => {
      const startTime = performance.now();
      setTimeout(() => {
        this.trackUserInteraction('input', event.target, startTime, performance.now());
      }, 0);
    });
  }

  // Get navigation timing
  getNavigationTiming() {
    if (typeof performance === 'undefined' || !performance.timing) {
      return null;
    }

    const timing = performance.timing;
    return {
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnect: timing.connectEnd - timing.connectStart,
      serverResponse: timing.responseEnd - timing.requestStart,
      domLoad: timing.domContentLoadedEventEnd - timing.navigationStart,
      fullLoad: timing.loadEventEnd - timing.navigationStart
    };
  }

  // Get performance metrics summary
  getMetricsSummary() {
    const summary = {
      uptime: Date.now() - this.startTime,
      totalAPICalls: this.metrics.apiCalls.length,
      totalPageLoads: this.metrics.pageLoads.length,
      totalUserInteractions: this.metrics.userInteractions.length,
      averageAPIResponseTime: this.getAverageAPIResponseTime(),
      slowestAPICall: this.getSlowestAPICall(),
      errorRate: this.getErrorRate(),
      resourceSummary: this.getResourceSummary()
    };

    return summary;
  }

  // Get average API response time
  getAverageAPIResponseTime() {
    if (this.metrics.apiCalls.length === 0) return 0;
    
    const total = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    return Math.round(total / this.metrics.apiCalls.length);
  }

  // Get slowest API call
  getSlowestAPICall() {
    if (this.metrics.apiCalls.length === 0) return null;
    
    return this.metrics.apiCalls.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
  }

  // Get error rate
  getErrorRate() {
    if (this.metrics.apiCalls.length === 0) return 0;
    
    const errors = this.metrics.apiCalls.filter(call => call.status >= 400).length;
    return Math.round((errors / this.metrics.apiCalls.length) * 100);
  }

  // Get resource summary
  getResourceSummary() {
    const summary = {};
    
    this.metrics.resources.forEach(resource => {
      if (!summary[resource.type]) {
        summary[resource.type] = {
          count: 0,
          totalSize: 0,
          averageLoadTime: 0
        };
      }
      
      summary[resource.type].count++;
      summary[resource.type].totalSize += resource.size;
    });

    // Calculate averages
    Object.keys(summary).forEach(type => {
      const resources = this.metrics.resources.filter(r => r.type === type);
      const totalTime = resources.reduce((sum, r) => sum + r.duration, 0);
      summary[type].averageLoadTime = Math.round(totalTime / resources.length);
    });

    return summary;
  }

  // Report slow API call
  reportSlowAPI(metric) {
    console.warn(`🐌 Slow API detected: ${metric.method} ${metric.url} took ${metric.duration}ms`);
    // TODO: Send to monitoring service
  }

  // Report slow resource
  reportSlowResource(resource) {
    console.warn(`🐌 Slow resource detected: ${resource.name} took ${resource.duration}ms`);
    // TODO: Send to monitoring service
  }

  // Report poor Web Vital
  reportPoorWebVital(vital) {
    console.warn(`⚠️ Poor Web Vital: ${vital.name} with value ${vital.value} is ${vital.rating}`);
    // TODO: Send to monitoring service
  }

  // Start performance timer
  startTimer(label) {
    const startTime = performance.now();
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = {
      apiCalls: [],
      pageLoads: [],
      userInteractions: [],
      errors: [],
      resources: []
    };
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      summary: this.getMetricsSummary(),
      detailed: this.metrics,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;