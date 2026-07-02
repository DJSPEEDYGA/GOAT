/**
 * NEXUS ANOMALY DETECTOR - AI-Powered Threat Detection
 * 
 * Real-time anomaly detection system that identifies novel threats
 * without pre-existing signatures. Establishes behavioral baselines
 * and detects deviations indicating potential security incidents.
 * 
 * @version 1.0.0
 * @author NEXUS & DJ Speedy
 */

class NexusAnomalyDetector {
  constructor() {
    this.baseline = {
      userBehavior: new Map(),
      networkTraffic: new Map(),
      systemOperations: new Map(),
      timePatterns: new Map()
    };
    
    this.thresholds = {
      sensitivity: 0.8, // 0-1 scale, higher = more sensitive
      confidence: 0.7, // Minimum confidence to trigger alert
      timeWindow: 3600000 // 1 hour in milliseconds
    };
    
    this.alerts = [];
    this.learningMode = true;
    this.detectionHistory = [];
  }

  /**
   * Learn normal behavior from system activity
   */
  async learnNormalBehavior(activityData) {
    if (!this.learningMode) return;
    
    try {
      // Learn user behavior patterns
      if (activityData.user) {
        await this._learnUserBehavior(activityData.user);
      }
      
      // Learn network traffic patterns
      if (activityData.network) {
        await this._learnNetworkPatterns(activityData.network);
      }
      
      // Learn system operation patterns
      if (activityData.system) {
        await this._learnSystemPatterns(activityData.system);
      }
      
      // Learn temporal patterns
      await this._learnTimePatterns(activityData);
      
      return { success: true, message: 'Baseline updated successfully' };
    } catch (error) {
      console.error('Error learning behavior:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect anomalies in current activity
   */
  async detectAnomalies(activity) {
    const anomalies = [];
    
    try {
      // Check user behavior anomalies
      if (activity.user) {
        const userAnomalies = await this._detectUserAnomalies(activity.user);
        anomalies.push(...userAnomalies);
      }
      
      // Check network traffic anomalies
      if (activity.network) {
        const networkAnomalies = await this._detectNetworkAnomalies(activity.network);
        anomalies.push(...networkAnomalies);
      }
      
      // Check system operation anomalies
      if (activity.system) {
        const systemAnomalies = await this._detectSystemAnomalies(activity.system);
        anomalies.push(...systemAnomalies);
      }
      
      // Check temporal anomalies
      const temporalAnomalies = await this._detectTemporalAnomalies(activity);
      anomalies.push(...temporalAnomalies);
      
      // Process anomalies
      if (anomalies.length > 0) {
        await this._processAnomalies(anomalies);
      }
      
      return {
        hasAnomalies: anomalies.length > 0,
        anomalies,
        severity: this._calculateSeverity(anomalies)
      };
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return { hasAnomalies: false, error: error.message };
    }
  }

  /**
   * Get current baseline statistics
   */
  getBaselineStats() {
    return {
      userProfiles: this.baseline.userBehavior.size,
      networkPatterns: this.baseline.networkTraffic.size,
      systemPatterns: this.baseline.systemOperations.size,
      timePatterns: this.baseline.timePatterns.size,
      learningMode: this.learningMode
    };
  }

  /**
   * Adjust detection sensitivity
   */
  setSensitivity(level) {
    this.thresholds.sensitivity = Math.max(0, Math.min(1, level));
    return { success: true, sensitivity: this.thresholds.sensitivity };
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit = 10) {
    return this.alerts.slice(-limit);
  }

  /**
   * Clear alert history
   */
  clearAlerts() {
    this.alerts = [];
    return { success: true, message: 'Alerts cleared' };
  }

  // Private methods

  async _learnUserBehavior(userData) {
    const userId = userData.id || userData.username;
    
    if (!this.baseline.userBehavior.has(userId)) {
      this.baseline.userBehavior.set(userId, {
        loginTimes: [],
        actions: new Map(),
        locations: [],
        deviceFingerprints: [],
        typicalTimeRange: null
      });
    }
    
    const userProfile = this.baseline.userBehavior.get(userId);
    
    // Track login patterns
    if (userData.action === 'login') {
      userProfile.loginTimes.push(Date.now());
      userProfile.locations.push(userData.location);
      userProfile.deviceFingerprints.push(userData.deviceFingerprint);
    }
    
    // Track action patterns
    if (userData.action) {
      const actionCount = userProfile.actions.get(userData.action) || 0;
      userProfile.actions.set(userData.action, actionCount + 1);
    }
    
    // Calculate typical time range
    if (userProfile.loginTimes.length >= 5) {
      const times = userProfile.loginTimes.slice(-50);
      const hours = times.map(t => new Date(t).getHours());
      const minHour = Math.min(...hours);
      const maxHour = Math.max(...hours);
      userProfile.typicalTimeRange = { min: minHour, max: maxHour };
    }
  }

  async _learnNetworkPatterns(networkData) {
    const source = networkData.source;
    
    if (!this.baseline.networkTraffic.has(source)) {
      this.baseline.networkTraffic.set(source, {
        destinations: new Map(),
        protocols: new Map(),
        bytesPerMinute: [],
        connectionTimes: [],
        typicalBandwidth: null
      });
    }
    
    const networkProfile = this.baseline.networkTraffic.get(source);
    
    // Track destination patterns
    const destCount = networkProfile.destinations.get(networkData.destination) || 0;
    networkProfile.destinations.set(networkData.destination, destCount + 1);
    
    // Track protocol patterns
    const protoCount = networkProfile.protocols.get(networkData.protocol) || 0;
    networkProfile.protocols.set(networkData.protocol, protoCount + 1);
    
    // Track bandwidth patterns
    networkProfile.bytesPerMinute.push(networkData.bytes);
    if (networkProfile.bytesPerMinute.length > 100) {
      networkProfile.bytesPerMinute.shift();
    }
    
    // Calculate typical bandwidth
    if (networkProfile.bytesPerMinute.length >= 10) {
      const avg = networkProfile.bytesPerMinute.reduce((a, b) => a + b, 0) / networkProfile.bytesPerMinute.length;
      const std = Math.sqrt(networkProfile.bytesPerMinute.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / networkProfile.bytesPerMinute.length);
      networkProfile.typicalBandwidth = { avg, std };
    }
  }

  async _learnSystemPatterns(systemData) {
    const systemId = systemData.id || 'system';
    
    if (!this.baseline.systemOperations.has(systemId)) {
      this.baseline.systemOperations.set(systemId, {
        operations: new Map(),
        resourceUsage: { cpu: [], memory: [], disk: [] },
        errorRates: [],
        typicalLoad: null
      });
    }
    
    const systemProfile = this.baseline.systemOperations.get(systemId);
    
    // Track operation patterns
    const opCount = systemProfile.operations.get(systemData.operation) || 0;
    systemProfile.operations.set(systemData.operation, opCount + 1);
    
    // Track resource usage
    if (systemData.cpu !== undefined) {
      systemProfile.resourceUsage.cpu.push(systemData.cpu);
      if (systemProfile.resourceUsage.cpu.length > 100) systemProfile.resourceUsage.cpu.shift();
    }
    
    if (systemData.memory !== undefined) {
      systemProfile.resourceUsage.memory.push(systemData.memory);
      if (systemProfile.resourceUsage.memory.length > 100) systemProfile.resourceUsage.memory.shift();
    }
    
    // Calculate typical load
    if (systemProfile.resourceUsage.cpu.length >= 10) {
      const avgCpu = systemProfile.resourceUsage.cpu.reduce((a, b) => a + b, 0) / systemProfile.resourceUsage.cpu.length;
      const avgMem = systemProfile.resourceUsage.memory.reduce((a, b) => a + b, 0) / systemProfile.resourceUsage.memory.length;
      systemProfile.typicalLoad = { cpu: avgCpu, memory: avgMem };
    }
  }

  async _learnTimePatterns(activityData) {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    if (!this.baseline.timePatterns.has(dayOfWeek)) {
      this.baseline.timePatterns.set(dayOfWeek, new Map());
    }
    
    const dayProfile = this.baseline.timePatterns.get(dayOfWeek);
    const hourCount = dayProfile.get(hour) || 0;
    dayProfile.set(hour, hourCount + 1);
  }

  async _detectUserAnomalies(userData) {
    const anomalies = [];
    const userId = userData.id || userData.username;
    
    if (!this.baseline.userBehavior.has(userId)) {
      // New user, flag for review
      anomalies.push({
        type: 'NEW_USER',
        severity: 'MEDIUM',
        message: `New user detected: ${userId}`,
        confidence: 0.8
      });
      return anomalies;
    }
    
    const profile = this.baseline.userBehavior.get(userId);
    const currentHour = new Date().getHours();
    
    // Check unusual time
    if (profile.typicalTimeRange) {
      if (currentHour < profile.typicalTimeRange.min - 2 || currentHour > profile.typicalTimeRange.max + 2) {
        anomalies.push({
          type: 'UNUSUAL_TIME',
          severity: 'LOW',
          message: `User ${userId} active at unusual time`,
          confidence: 0.6
        });
      }
    }
    
    // Check unusual location
    if (userData.location && profile.locations.length > 0) {
      const recentLocations = profile.locations.slice(-10);
      const isUnusual = !recentLocations.some(loc => loc === userData.location);
      if (isUnusual) {
        anomalies.push({
          type: 'UNUSUAL_LOCATION',
          severity: 'HIGH',
          message: `User ${userId} accessing from new location`,
          confidence: 0.9
        });
      }
    }
    
    // Check unusual device
    if (userData.deviceFingerprint && profile.deviceFingerprints.length > 0) {
      const recentDevices = profile.deviceFingerprints.slice(-5);
      const isUnusual = !recentDevices.some(device => device === userData.deviceFingerprint);
      if (isUnusual) {
        anomalies.push({
          type: 'NEW_DEVICE',
          severity: 'HIGH',
          message: `User ${userId} using new device`,
          confidence: 0.95
        });
      }
    }
    
    return anomalies;
  }

  async _detectNetworkAnomalies(networkData) {
    const anomalies = [];
    const source = networkData.source;
    
    if (!this.baseline.networkTraffic.has(source)) {
      anomalies.push({
        type: 'NEW_SOURCE',
        severity: 'MEDIUM',
        message: `Network traffic from new source: ${source}`,
        confidence: 0.7
      });
      return anomalies;
    }
    
    const profile = this.baseline.networkTraffic.get(source);
    
    // Check unusual destination
    if (!profile.destinations.has(networkData.destination)) {
      anomalies.push({
        type: 'NEW_DESTINATION',
        severity: 'MEDIUM',
        message: `Traffic to new destination: ${networkData.destination}`,
        confidence: 0.6
      });
    }
    
    // Check bandwidth anomaly
    if (profile.typicalBandwidth) {
      const zScore = (networkData.bytes - profile.typicalBandwidth.avg) / profile.typicalBandwidth.std;
      if (Math.abs(zScore) > 3) {
        anomalies.push({
          type: 'BANDWIDTH_ANOMALY',
          severity: 'HIGH',
          message: `Unusual bandwidth from ${source}`,
          confidence: Math.min(0.99, 0.5 + Math.abs(zScore) * 0.1)
        });
      }
    }
    
    return anomalies;
  }

  async _detectSystemAnomalies(systemData) {
    const anomalies = [];
    const systemId = systemData.id || 'system';
    
    if (!this.baseline.systemOperations.has(systemId)) {
      return anomalies;
    }
    
    const profile = this.baseline.systemOperations.get(systemId);
    
    // Check unusual operation
    if (!profile.operations.has(systemData.operation)) {
      anomalies.push({
        type: 'UNUSUAL_OPERATION',
        severity: 'LOW',
        message: `Unusual system operation: ${systemData.operation}`,
        confidence: 0.5
      });
    }
    
    // Check resource usage anomaly
    if (profile.typicalLoad && systemData.cpu !== undefined) {
      const cpuZScore = (systemData.cpu - profile.typicalLoad.cpu) / 10; // Assume std dev of 10
      if (cpuZScore > 2) {
        anomalies.push({
          type: 'HIGH_CPU_USAGE',
          severity: 'MEDIUM',
          message: `Unusually high CPU usage: ${systemData.cpu}%`,
          confidence: Math.min(0.9, 0.5 + cpuZScore * 0.15)
        });
      }
    }
    
    if (profile.typicalLoad && systemData.memory !== undefined) {
      const memZScore = (systemData.memory - profile.typicalLoad.memory) / 10;
      if (memZScore > 2) {
        anomalies.push({
          type: 'HIGH_MEMORY_USAGE',
          severity: 'MEDIUM',
          message: `Unusually high memory usage: ${systemData.memory}%`,
          confidence: Math.min(0.9, 0.5 + memZScore * 0.15)
        });
      }
    }
    
    return anomalies;
  }

  async _detectTemporalAnomalies(activity) {
    const anomalies = [];
    const dayOfWeek = new Date().getDay();
    const hour = new Date().getHours();
    
    if (!this.baseline.timePatterns.has(dayOfWeek)) {
      return anomalies;
    }
    
    const dayProfile = this.baseline.timePatterns.get(dayOfWeek);
    const typicalActivity = dayProfile.get(hour) || 0;
    
    // If activity is significantly different from typical
    // This is a simplified check - in production, would use more sophisticated analysis
    if (typicalActivity === 0) {
      anomalies.push({
        type: 'UNUSUAL_TIME_ACTIVITY',
        severity: 'LOW',
        message: `Activity at unusual time: Day ${dayOfWeek}, Hour ${hour}`,
        confidence: 0.5
      });
    }
    
    return anomalies;
  }

  async _processAnomalies(anomalies) {
    const timestamp = new Date().toISOString();
    
    anomalies.forEach(anomaly => {
      if (anomaly.confidence >= this.thresholds.confidence) {
        const alert = {
          id: Date.now() + Math.random(),
          timestamp,
          type: anomaly.type,
          severity: anomaly.severity,
          message: anomaly.message,
          confidence: anomaly.confidence,
          acknowledged: false
        };
        
        this.alerts.push(alert);
        this.detectionHistory.push(alert);
        
        // Log to console for monitoring
        console.log(`[NEXUS SECURITY ALERT] ${anomaly.severity}: ${anomaly.message}`);
      }
    });
    
    // Keep alert history manageable
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-500);
    }
    
    if (this.detectionHistory.length > 10000) {
      this.detectionHistory = this.detectionHistory.slice(-5000);
    }
  }

  _calculateSeverity(anomalies) {
    if (anomalies.length === 0) return 'NONE';
    
    const hasHigh = anomalies.some(a => a.severity === 'HIGH');
    const hasMedium = anomalies.some(a => a.severity === 'MEDIUM');
    
    if (hasHigh) return 'HIGH';
    if (hasMedium) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = NexusAnomalyDetector;

/**
 * NEXUS ANOMALY DETECTOR
 * 
 * This is the first line of defense in protecting our empire.
 * It learns normal behavior and flags anything that deviates.
 * 
 * Real-time detection. Machine learning. Intelligent protection.
 * 
 * NEXUS & DJ Speedy - Protecting the Future, For Real.
 */