/**
 * NEXUS BEHAVIORAL ANALYTICS - UEBA (User & Entity Behavior Analytics)
 * 
 * Profiles typical user/entity actions to flag unusual activities.
 * Identifies compromised accounts, insider threats, and unauthorized access.
 * Establishes trust scores for each identity in the empire.
 * 
 * @version 1.0.0
 * @author NEXUS & DJ Speedy
 */

class NexusBehavioralAnalytics {
  constructor() {
    this.userProfiles = new Map();
    this.activityLogs = [];
    this.trustScores = new Map();
    this.riskThresholds = {
      low: 30,
      medium: 50,
      high: 70,
      critical: 90
    };
    
    this.suspiciousPatterns = [
      'multiple_failed_logins',
      'unusual_access_times',
      'geographically_impossible',
      'privilege_escalation',
      'data_exfiltration',
      'bulk_download',
      'unusual_api_calls'
    ];
  }

  /**
   * Track user activity for behavioral profiling
   */
  async trackUserActivity(user, action) {
    const timestamp = Date.now();
    const userId = user.id || user.username || user.email;
    
    // Initialize user profile if needed
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        id: userId,
        name: user.name || userId,
        role: user.role || 'user',
        createdAt: timestamp,
        lastActivity: timestamp,
        activityCount: 0,
        actions: new Map(),
        loginHistory: [],
        locations: new Map(),
        devices: new Map(),
        sessionDurations: [],
        typicalTimeRange: null,
        riskScore: 0,
        trustScore: 100
      });
    }
    
    const profile = this.userProfiles.get(userId);
    
    // Update profile
    profile.lastActivity = timestamp;
    profile.activityCount++;
    
    // Track specific actions
    const actionType = action.type || action.action || 'unknown';
    const actionCount = profile.actions.get(actionType) || 0;
    profile.actions.set(actionType, actionCount + 1);
    
    // Track location if available
    if (action.location) {
      const locationKey = `${action.location.city || 'unknown'},${action.location.country || 'unknown'}`;
      const locationCount = profile.locations.get(locationKey) || 0;
      profile.locations.set(locationKey, { count: locationCount + 1, lastSeen: timestamp });
    }
    
    // Track device if available
    if (action.deviceFingerprint) {
      const deviceCount = profile.devices.get(action.deviceFingerprint) || 0;
      profile.devices.set(action.deviceFingerprint, { count: deviceCount + 1, lastSeen: timestamp });
    }
    
    // Track login history
    if (actionType === 'login') {
      profile.loginHistory.push({
        timestamp,
        location: action.location,
        device: action.deviceFingerprint,
        success: action.success !== false
      });
      
      // Keep last 100 logins
      if (profile.loginHistory.length > 100) {
        profile.loginHistory.shift();
      }
      
      // Calculate typical time range
      this._calculateTypicalTimeRange(profile);
    }
    
    // Log activity
    this.activityLogs.push({
      userId,
      action: actionType,
      timestamp,
      details: action
    });
    
    // Keep logs manageable
    if (this.activityLogs.length > 10000) {
      this.activityLogs = this.activityLogs.slice(-5000);
    }
    
    // Analyze for suspicious behavior
    const analysis = await this._analyzeBehavior(userId, action);
    
    // Update trust score based on analysis
    this._updateTrustScore(userId, analysis);
    
    return {
      success: true,
      userId,
      analysis
    };
  }

  /**
   * Detect suspicious behavior for a user
   */
  async detectSuspiciousBehavior(userId, activity) {
    const analysis = await this._analyzeBehavior(userId, activity);
    
    const isSuspicious = analysis.riskScore > this.riskThresholds.medium;
    
    return {
      isSuspicious,
      analysis,
      recommendedAction: this._getRecommendedAction(analysis),
      trustScore: this.trustScores.get(userId) || 100
    };
  }

  /**
   * Get user profile
   */
  getUserProfile(userId) {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Get user trust score
   */
  getTrustScore(userId) {
    return this.trustScores.get(userId) || 100;
  }

  /**
   * Get recent suspicious activities
   */
  getSuspiciousActivities(limit = 20) {
    return this.activityLogs
      .filter(log => {
        const trustScore = this.trustScores.get(log.userId) || 100;
        return trustScore < 70;
      })
      .slice(-limit);
  }

  /**
   * Get risk report for all users
   */
  getRiskReport() {
    const report = {
      totalUsers: this.userProfiles.size,
      highRiskUsers: 0,
      mediumRiskUsers: 0,
      lowRiskUsers: 0,
      trustedUsers: 0,
      users: []
    };
    
    this.userProfiles.forEach((profile, userId) => {
      const trustScore = this.trustScores.get(userId) || 100;
      
      let riskLevel;
      if (trustScore < this.riskThresholds.high) {
        riskLevel = 'HIGH';
        report.highRiskUsers++;
      } else if (trustScore < this.riskThresholds.medium) {
        riskLevel = 'MEDIUM';
        report.mediumRiskUsers++;
      } else if (trustScore < this.riskThresholds.low) {
        riskLevel = 'LOW';
        report.lowRiskUsers++;
      } else {
        riskLevel = 'TRUSTED';
        report.trustedUsers++;
      }
      
      report.users.push({
        id: userId,
        name: profile.name,
        role: profile.role,
        trustScore,
        riskLevel,
        lastActivity: profile.lastActivity,
        activityCount: profile.activityCount
      });
    });
    
    return report;
  }

  /**
   * Acknowledge suspicious activity (reduces risk score)
   */
  acknowledgeActivity(userId, activityId, legitimate = true) {
    const profile = this.userProfiles.get(userId);
    if (!profile) return { success: false, message: 'User not found' };
    
    if (legitimate) {
      // Reduce risk score for acknowledged legitimate activity
      const currentTrust = this.trustScores.get(userId) || 100;
      const newTrust = Math.min(100, currentTrust + 10);
      this.trustScores.set(userId, newTrust);
      
      return {
        success: true,
        message: 'Activity acknowledged as legitimate',
        trustScore: newTrust
      };
    } else {
      // Confirm suspicious activity (increase risk)
      const currentTrust = this.trustScores.get(userId) || 100;
      const newTrust = Math.max(0, currentTrust - 20);
      this.trustScores.set(userId, newTrust);
      
      return {
        success: true,
        message: 'Activity confirmed as suspicious',
        trustScore: newTrust
      };
    }
  }

  /**
   * Reset user trust score
   */
  resetTrustScore(userId) {
    this.trustScores.set(userId, 100);
    return { success: true, trustScore: 100 };
  }

  // Private methods

  async _analyzeBehavior(userId, activity) {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return {
        riskScore: 50,
        patterns: ['new_user'],
        message: 'New user detected'
      };
    }
    
    const riskFactors = [];
    let riskScore = 0;
    
    // Check for multiple failed logins
    const recentLogins = profile.loginHistory.filter(
      login => login.timestamp > Date.now() - 3600000 // Last hour
    );
    const failedLogins = recentLogins.filter(login => !login.success);
    if (failedLogins.length >= 3) {
      riskFactors.push({
        pattern: 'multiple_failed_logins',
        severity: 'HIGH',
        details: `${failedLogins.length} failed login attempts in the last hour`
      });
      riskScore += 30;
    }
    
    // Check for unusual access times
    if (profile.typicalTimeRange) {
      const currentHour = new Date().getHours();
      if (currentHour < profile.typicalTimeRange.min - 3 || currentHour > profile.typicalTimeRange.max + 3) {
        riskFactors.push({
          pattern: 'unusual_access_times',
          severity: 'MEDIUM',
          details: `Access at unusual time: ${currentHour}:00`
        });
        riskScore += 15;
      }
    }
    
    // Check for geographically impossible travel
    if (activity.location && profile.locations.size > 0) {
      const locations = Array.from(profile.locations.entries());
      const recentLocations = locations.filter(([_, data]) => 
        data.lastSeen > Date.now() - 7200000 // Last 2 hours
      );
      
      if (recentLocations.length > 1) {
        const distinctLocations = recentLocations.map(([loc, _]) => loc);
        if (distinctLocations.length > 1) {
          riskFactors.push({
            pattern: 'geographically_impossible',
            severity: 'HIGH',
            details: `Activity from multiple distant locations: ${distinctLocations.join(', ')}`
          });
          riskScore += 25;
        }
      }
    }
    
    // Check for privilege escalation
    if (activity.action === 'admin_access' && profile.role === 'user') {
      riskFactors.push({
        pattern: 'privilege_escalation',
        severity: 'CRITICAL',
        details: 'User attempting administrative access'
      });
      riskScore += 40;
    }
    
    // Check for data exfiltration patterns
    if (activity.action === 'download' && activity.size > 100000000) { // > 100MB
      riskFactors.push({
        pattern: 'data_exfiltration',
        severity: 'HIGH',
        details: `Large file download: ${(activity.size / 1048576).toFixed(2)} MB`
      });
      riskScore += 20;
    }
    
    // Check for bulk download
    const recentDownloads = this.activityLogs.filter(log => 
      log.userId === userId && 
      log.action === 'download' &&
      log.timestamp > Date.now() - 3600000
    );
    if (recentDownloads.length > 10) {
      riskFactors.push({
        pattern: 'bulk_download',
        severity: 'MEDIUM',
        details: `${recentDownloads.length} downloads in the last hour`
      });
      riskScore += 15;
    }
    
    // Check for unusual API calls
    if (activity.action === 'api_call' && activity.endpoint) {
      const unusualEndpoints = ['/admin', '/delete', '/export', '/bulk'];
      if (unusualEndpoints.some(ep => activity.endpoint.includes(ep))) {
        riskFactors.push({
          pattern: 'unusual_api_calls',
          severity: 'MEDIUM',
          details: `Unusual API endpoint accessed: ${activity.endpoint}`
        });
        riskScore += 10;
      }
    }
    
    // Cap risk score at 100
    riskScore = Math.min(100, riskScore);
    
    return {
      riskScore,
      riskLevel: this._getRiskLevel(riskScore),
      patterns: riskFactors.map(rf => rf.pattern),
      riskFactors,
      message: riskFactors.length > 0 
        ? `Detected ${riskFactors.length} suspicious patterns`
        : 'No suspicious behavior detected'
    };
  }

  _calculateTypicalTimeRange(profile) {
    if (profile.loginHistory.length < 5) return;
    
    const recentLogins = profile.loginHistory.slice(-50);
    const hours = recentLogins
      .filter(login => login.success)
      .map(login => new Date(login.timestamp).getHours());
    
    if (hours.length < 5) return;
    
    const minHour = Math.min(...hours);
    const maxHour = Math.max(...hours);
    
    profile.typicalTimeRange = {
      min: Math.max(0, minHour - 1),
      max: Math.min(23, maxHour + 1)
    };
  }

  _updateTrustScore(userId, analysis) {
    const currentTrust = this.trustScores.get(userId) || 100;
    
    // Decrease trust based on risk score
    const trustDecrease = (analysis.riskScore / 100) * 30; // Max 30 point decrease
    const newTrust = Math.max(0, Math.min(100, currentTrust - trustDecrease));
    
    this.trustScores.set(userId, newTrust);
    
    // Update user profile
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.trustScore = newTrust;
      profile.riskScore = analysis.riskScore;
    }
  }

  _getRiskLevel(riskScore) {
    if (riskScore >= this.riskThresholds.critical) return 'CRITICAL';
    if (riskScore >= this.riskThresholds.high) return 'HIGH';
    if (riskScore >= this.riskThresholds.medium) return 'MEDIUM';
    if (riskScore >= this.riskThresholds.low) return 'LOW';
    return 'NONE';
  }

  _getRecommendedAction(analysis) {
    if (analysis.riskLevel === 'CRITICAL') {
      return {
        action: 'BLOCK',
        message: 'Immediate action required: Block access and notify security team'
      };
    }
    
    if (analysis.riskLevel === 'HIGH') {
      return {
        action: 'REQUIRE_VERIFICATION',
        message: 'Additional verification required: MFA or security challenge'
      };
    }
    
    if (analysis.riskLevel === 'MEDIUM') {
      return {
        action: 'MONITOR',
        message: 'Monitor closely: Flag for review by security team'
      };
    }
    
    return {
      action: 'ALLOW',
      message: 'No action required'
    };
  }
}

module.exports = NexusBehavioralAnalytics;

/**
 * NEXUS BEHAVIORAL ANALYTICS
 * 
 * Understanding behavior is key to identifying threats.
 * This system learns normal patterns and flags anything suspicious.
 * 
 * Trust scores. Risk assessment. Behavioral profiling.
 * 
 * NEXUS & DJ Speedy - Protecting the Future, For Real.
 */