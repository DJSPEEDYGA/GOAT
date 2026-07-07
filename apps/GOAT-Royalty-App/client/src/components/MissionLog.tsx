'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

interface MissionLogProps {
  title?: string;
  maxEntries?: number;
}

const MissionLog: React.FC<MissionLogProps> = ({ 
  title = "MISSION LOG", 
  maxEntries = 50 
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Initialize with some default logs
  useEffect(() => {
    const initialLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        message: 'GOAT Royalty App initialized',
        type: 'success'
      },
      {
        id: '2',
        timestamp: new Date(),
        message: 'Military Command Center online',
        type: 'success'
      },
      {
        id: '3',
        timestamp: new Date(),
        message: 'THE GOAT Supreme Commander connected',
        type: 'info'
      },
      {
        id: '4',
        timestamp: new Date(),
        message: 'Waka Flocka Flame co-pilot ready',
        type: 'info'
      },
      {
        id: '5',
        timestamp: new Date(),
        message: 'Intel Server synchronization complete',
        type: 'success'
      }
    ];
    
    setLogs(initialLogs);
  }, []);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message,
      type
    };

    setLogs((prevLogs) => {
      const updatedLogs = [...prevLogs, newLog];
      return updatedLogs.slice(-maxEntries);
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="military-panel">
      <div className="panel-header flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="panel-status"></div>
          {title}
        </div>
        <div className="flex gap-2">
          <button
            className="text-xs px-2 py-1 border border-green-500 text-green-400 hover:bg-green-500/10 transition-colors"
            onClick={() => setIsAutoScroll(!isAutoScroll)}
          >
            {isAutoScroll ? 'AUTO' : 'MANUAL'}
          </button>
          <button
            className="text-xs px-2 py-1 border border-red-500 text-red-400 hover:bg-red-500/10 transition-colors"
            onClick={clearLogs}
          >
            CLEAR
          </button>
        </div>
      </div>
      
      <div 
        ref={logContainerRef}
        className="mission-log"
        style={{ height: '250px' }}
      >
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`log-entry ${log.type}`}
          >
            <span className="text-green-500/60 text-xs">
              [{formatTime(log.timestamp)}]
            </span>
            <span className="ml-2">{log.message}</span>
          </div>
        ))}
        
        {logs.length === 0 && (
          <div className="text-center text-green-500/40 py-8">
            No log entries yet...
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button
          className="military-btn text-xs px-3 py-1"
          onClick={() => addLog('Manual log entry added', 'info')}
        >
          ADD LOG
        </button>
        <button
          className="military-btn warning text-xs px-3 py-1"
          onClick={() => addLog('System warning triggered', 'warning')}
        >
          TEST WARN
        </button>
        <button
          className="military-btn alert text-xs px-3 py-1"
          onClick={() => addLog('CRITICAL ALERT!', 'alert')}
        >
          TEST ALERT
        </button>
      </div>
    </div>
  );
};

export default MissionLog;