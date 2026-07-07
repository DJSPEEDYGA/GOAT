/**
 * Mining Service
 * Manages cryptocurrency mining operations
 */

class MiningService {
  constructor() {
    this.status = {
      active: false,
      coins: [],
      hashrate: 0,
      power: 0,
      startTime: null,
      earnings: 0
    };

    this.config = {
      intensity: 'medium',
      pool: null,
      autoSwitch: true,
      temperatureLimit: 80
    };

    this.listeners = new Set();
  }

  /**
   * Start mining
   */
  async start(config = {}) {
    if (this.status.active) {
      return { success: false, message: 'Mining already active' };
    }

    this.config = { ...this.config, ...config };
    this.status.active = true;
    this.status.startTime = Date.now();
    this.status.coins = config.coins || ['bitcoin'];
    this.status.hashrate = this.calculateHashrate(this.config.intensity);

    this.emit('miningStarted', this.status);

    return {
      success: true,
      message: `Mining started for ${this.status.coins.join(', ')}`,
      status: this.getStatus()
    };
  }

  /**
   * Stop mining
   */
  async stop() {
    if (!this.status.active) {
      return { success: false, message: 'Mining not active' };
    }

    const finalStats = {
      duration: this.status.startTime ? Date.now() - this.status.startTime : 0,
      totalEarnings: this.status.earnings,
      averageHashrate: this.status.hashrate
    };

    this.status = {
      active: false,
      coins: [],
      hashrate: 0,
      power: 0,
      startTime: null,
      earnings: 0
    };

    this.emit('miningStopped', finalStats);

    return {
      success: true,
      message: 'Mining stopped',
      finalStats
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      ...this.status,
      config: this.config,
      uptime: this.status.startTime ? Date.now() - this.status.startTime : 0,
      efficiency: this.calculateEfficiency()
    };
  }

  /**
   * Calculate hashrate based on intensity
   */
  calculateHashrate(intensity) {
    const rates = { low: 50, medium: 100, high: 150 };
    return rates[intensity] || 100;
  }

  /**
   * Calculate efficiency
   */
  calculateEfficiency() {
    if (!this.status.hashrate) return 0;
    const power = this.calculatePower(this.config.intensity);
    return (this.status.hashrate / power).toFixed(3);
  }

  /**
   * Calculate power consumption
   */
  calculatePower(intensity) {
    const power = { low: 150, medium: 250, high: 350 };
    return power[intensity] || 250;
  }

  /**
   * Event emitter methods
   */
  on(event, callback) {
    this.listeners.add({ event, callback });
  }

  emit(event, data) {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        listener.callback(data);
      }
    }
  }
}

module.exports = new MiningService();