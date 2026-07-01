/**
 * AUTONOMOUS TASK RUNNER SYSTEM
 * Handles background task execution and scheduling
 * Created by SuperNinja - NinjaTech AI
 */

class AutonomousRunner {
  constructor(superninjaCore) {
    this.core = superninjaCore;
    this.scheduledTasks = new Map();
    this.recurringTasks = new Map();
    this.taskHistory = [];
    this.isRunning = false;
  }

  /**
   * Start the autonomous runner
   */
  start() {
    if (this.isRunning) {
      console.log('⚡ Autonomous Runner already running');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Autonomous Runner started');
    
    // Start the main processing loop
    this.processingLoop();
    
    // Start scheduled task checker
    this.scheduledTaskChecker();
  }

  /**
   * Stop the autonomous runner
   */
  stop() {
    this.isRunning = false;
    console.log('🛑 Autonomous Runner stopped');
  }

  /**
   * Main processing loop - handles task queue
   */
  async processingLoop() {
    while (this.isRunning) {
      try {
        // Check if stealth mode is not active
        if (!this.core.isStealthMode) {
          // Process next task from queue
          const task = this.getNextTask();
          if (task) {
            await this.executeTask(task);
          }
        }
        
        // Small delay to prevent CPU overload
        await this.sleep(100);
        
      } catch (error) {
        console.error('❌ Error in processing loop:', error);
        await this.sleep(1000);
      }
    }
  }

  /**
   * Scheduled task checker - runs periodic checks
   */
  async scheduledTaskChecker() {
    while (this.isRunning) {
      try {
        const now = Date.now();
        
        // Check for scheduled tasks
        for (const [taskId, scheduledTask] of this.scheduledTasks) {
          if (scheduledTask.scheduledTime <= now && !scheduledTask.executed) {
            await this.executeTask(scheduledTask.task);
            scheduledTask.executed = true;
          }
        }
        
        // Check for recurring tasks
        for (const [taskId, recurringTask] of this.recurringTasks) {
          if (this.shouldExecuteRecurring(recurringTask, now)) {
            await this.executeTask(recurringTask.task);
            recurringTask.lastExecution = now;
          }
        }
        
        await this.sleep(1000); // Check every second
        
      } catch (error) {
        console.error('❌ Error in scheduled task checker:', error);
        await this.sleep(5000);
      }
    }
  }

  /**
   * Get next task from queue
   */
  getNextTask() {
    if (this.core.taskQueue.length === 0) {
      return null;
    }
    
    // Sort by priority and timestamp
    this.core.taskQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.timestamp - b.timestamp; // Older tasks first
    });
    
    return this.core.taskQueue.shift();
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    const startTime = Date.now();
    
    try {
      task.status = 'running';
      task.startedAt = startTime;
      
      console.log(`🎯 Executing task: ${task.type} - ${task.description}`);
      
      // Find best agent
      const agent = this.core.findBestAgent(task);
      
      if (!agent) {
        throw new Error('No suitable agent found for task');
      }
      
      // Execute task
      agent.status = 'busy';
      const result = await agent.processTask(task);
      
      task.status = 'completed';
      task.result = result;
      task.completedAt = Date.now();
      task.duration = task.completedAt - startTime;
      
      agent.status = 'idle';
      agent.performance.tasksRun++;
      
      // Add to history
      this.taskHistory.unshift(task);
      
      // Keep history limited to last 1000 tasks
      if (this.taskHistory.length > 1000) {
        this.taskHistory = this.taskHistory.slice(0, 1000);
      }
      
      console.log(`✅ Task completed in ${task.duration}ms`);
      
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.failedAt = Date.now();
      
      console.error(`❌ Task failed: ${error.message}`);
      
      // Retry logic for failed tasks
      if (task.retries < 3) {
        task.retries = (task.retries || 0) + 1;
        task.status = 'queued';
        this.core.taskQueue.push(task);
        console.log(`🔄 Retrying task (attempt ${task.retries})`);
      }
    }
  }

  /**
   * Schedule a task for specific time
   */
  scheduleTask(task, scheduledTime) {
    const taskId = this.core.generateTaskId();
    
    this.scheduledTasks.set(taskId, {
      id: taskId,
      task: {
        ...task,
        id: taskId
      },
      scheduledTime: scheduledTime.getTime(),
      executed: false
    });
    
    console.log(`⏰ Task scheduled for: ${scheduledTime.toLocaleString()}`);
    
    return taskId;
  }

  /**
   * Schedule a recurring task
   */
  scheduleRecurringTask(task, interval) {
    const taskId = this.core.generateTaskId();
    
    this.recurringTasks.set(taskId, {
      id: taskId,
      task: {
        ...task,
        id: taskId
      },
      interval: interval, // in milliseconds
      lastExecution: 0
    });
    
    console.log(`🔄 Recurring task scheduled every ${interval}ms`);
    
    return taskId;
  }

  /**
   * Check if recurring task should execute
   */
  shouldExecuteRecurring(recurringTask, now) {
    return (now - recurringTask.lastExecution) >= recurringTask.interval;
  }

  /**
   * Cancel a scheduled task
   */
  cancelScheduledTask(taskId) {
    if (this.scheduledTasks.has(taskId)) {
      this.scheduledTasks.delete(taskId);
      console.log(`❌ Cancelled scheduled task: ${taskId}`);
      return true;
    }
    
    if (this.recurringTasks.has(taskId)) {
      this.recurringTasks.delete(taskId);
      console.log(`❌ Cancelled recurring task: ${taskId}`);
      return true;
    }
    
    return false;
  }

  /**
   * Get runner statistics
   */
  getStatistics() {
    const completedTasks = this.taskHistory.filter(t => t.status === 'completed');
    const failedTasks = this.taskHistory.filter(t => t.status === 'failed');
    
    return {
      isRunning: this.isRunning,
      taskQueueLength: this.core.taskQueue.length,
      scheduledTasks: this.scheduledTasks.size,
      recurringTasks: this.recurringTasks.size,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      successRate: completedTasks.length > 0 
        ? (completedTasks.length / (completedTasks.length + failedTasks.length)) * 100 
        : 100,
      averageTaskDuration: completedTasks.length > 0
        ? completedTasks.reduce((sum, t) => sum + (t.duration || 0), 0) / completedTasks.length
        : 0,
      recentTasks: this.taskHistory.slice(0, 10)
    };
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, md));
  }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutonomousRunner;
}