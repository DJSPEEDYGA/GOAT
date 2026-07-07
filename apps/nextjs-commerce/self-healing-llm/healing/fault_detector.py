"""
Fault Detector Module
Detects and classifies faults across system components with multi-level monitoring.
"""

import logging
import time
import threading
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import psutil
import hashlib

logger = logging.getLogger(__name__)


class FaultSeverity(Enum):
    """Severity levels for detected faults."""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class FaultCategory(Enum):
    """Categories of faults that can be detected."""
    INFRASTRUCTURE = "infrastructure"
    APPLICATION = "application"
    DATA_QUALITY = "data_quality"
    SECURITY = "security"
    PERFORMANCE = "performance"
    LOGIC_ERROR = "logic_error"


@dataclass
class Fault:
    """Represents a detected fault."""
    fault_id: str
    category: FaultCategory
    severity: FaultSeverity
    component: str
    message: str
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    resolved: bool = False
    resolution_time: Optional[datetime] = None
    root_cause: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert fault to dictionary for serialization."""
        return {
            "fault_id": self.fault_id,
            "category": self.category.value,
            "severity": self.severity.value,
            "component": self.component,
            "message": self.message,
            "details": self.details,
            "timestamp": self.timestamp.isoformat(),
            "resolved": self.resolved,
            "resolution_time": self.resolution_time.isoformat() if self.resolution_time else None,
            "root_cause": self.root_cause
        }


class FaultDetector:
    """
    Detects and classifies faults across the system.
    Monitors infrastructure, application, and business logic layers.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Singleton pattern to ensure only one fault detector exists."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the fault detector."""
        if hasattr(self, "_initialized"):
            return
            
        self.detected_faults: Dict[str, Fault] = {}
        self.fault_history: List[Fault] = []
        self.monitoring_active = False
        self.monitor_thread: Optional[threading.Thread] = None
        self.callbacks: List[Callable[[Fault], None]] = []
        self.lock = threading.RLock()
        
        # Monitoring thresholds
        self.thresholds = {
            "memory_usage_percent": 90.0,
            "cpu_usage_percent": 95.0,
            "disk_usage_percent": 90.0,
            "response_time_ms": 5000,
            "error_rate_percent": 5.0,
            "gpu_memory_usage_percent": 95.0
        }
        
        # Statistics
        self.stats = {
            "total_faults_detected": 0,
            "faults_by_category": {cat.value: 0 for cat in FaultCategory},
            "faults_by_severity": {sev.value: 0 for sev in FaultSeverity},
            "faults_resolved": 0
        }
        
        logger.info("FaultDetector initialized")
    
    def register_callback(self, callback: Callable[[Fault], None]):
        """Register a callback function to be called when a fault is detected."""
        with self.lock:
            self.callbacks.append(callback)
            logger.info(f"Registered fault detection callback: {callback.__name__}")
    
    def _generate_fault_id(self) -> str:
        """Generate a unique fault ID."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_suffix = hashlib.md5(str(time.time()).encode()).hexdigest()[:6]
        return f"FAULT-{timestamp}-{random_suffix}"
    
    def detect_fault(self, fault: Fault):
        """
        Register a detected fault.
        
        Args:
            fault: The fault to register
        """
        with self.lock:
            self.detected_faults[fault.fault_id] = fault
            self.fault_history.append(fault)
            self.stats["total_faults_detected"] += 1
            self.stats["faults_by_category"][fault.category.value] += 1
            self.stats["faults_by_severity"][fault.severity.value] += 1
            
            logger.warning(f"Fault detected: {fault.fault_id} - {fault.message}")
            
            # Trigger callbacks
            for callback in self.callbacks:
                try:
                    callback(fault)
                except Exception as e:
                    logger.error(f"Error in fault callback: {e}")
    
    def resolve_fault(self, fault_id: str, root_cause: Optional[str] = None) -> bool:
        """
        Mark a fault as resolved.
        
        Args:
            fault_id: The ID of the fault to resolve
            root_cause: Optional root cause description
            
        Returns:
            True if fault was resolved, False if not found
        """
        with self.lock:
            if fault_id not in self.detected_faults:
                logger.warning(f"Fault not found: {fault_id}")
                return False
            
            fault = self.detected_faults[fault_id]
            fault.resolved = True
            fault.resolution_time = datetime.utcnow()
            fault.root_cause = root_cause
            
            self.stats["faults_resolved"] += 1
            
            logger.info(f"Fault resolved: {fault_id}")
            return True
    
    def check_infrastructure_health(self) -> List[Fault]:
        """
        Check infrastructure health (memory, CPU, disk, GPU).
        
        Returns:
            List of detected faults
        """
        faults = []
        
        # Memory check
        mem = psutil.virtual_memory()
        if mem.percent > self.thresholds["memory_usage_percent"]:
            fault = Fault(
                fault_id=self._generate_fault_id(),
                category=FaultCategory.INFRASTRUCTURE,
                severity=FaultSeverity.CRITICAL,
                component="memory",
                message=f"High memory usage: {mem.percent:.1f}%",
                details={
                    "total_gb": round(mem.total / (1024**3), 2),
                    "used_gb": round(mem.used / (1024**3), 2),
                    "threshold": self.thresholds["memory_usage_percent"]
                }
            )
            faults.append(fault)
        
        # CPU check
        cpu_percent = psutil.cpu_percent(interval=1.0)
        if cpu_percent > self.thresholds["cpu_usage_percent"]:
            fault = Fault(
                fault_id=self._generate_fault_id(),
                category=FaultCategory.INFRASTRUCTURE,
                severity=FaultSeverity.WARNING,
                component="cpu",
                message=f"High CPU usage: {cpu_percent:.1f}%",
                details={
                    "usage_percent": cpu_percent,
                    "threshold": self.thresholds["cpu_usage_percent"]
                }
            )
            faults.append(fault)
        
        # Disk check
        disk = psutil.disk_usage('/')
        disk_percent = (disk.used / disk.total) * 100
        if disk_percent > self.thresholds["disk_usage_percent"]:
            fault = Fault(
                fault_id=self._generate_fault_id(),
                category=FaultCategory.INFRASTRUCTURE,
                severity=FaultSeverity.WARNING,
                component="disk",
                message=f"High disk usage: {disk_percent:.1f}%",
                details={
                    "total_gb": round(disk.total / (1024**3), 2),
                    "used_gb": round(disk.used / (1024**3), 2),
                    "free_gb": round(disk.free / (1024**3), 2),
                    "threshold": self.thresholds["disk_usage_percent"]
                }
            )
            faults.append(fault)
        
        # GPU check if available
        try:
            import torch
            if torch.cuda.is_available():
                gpu_memory_allocated = torch.cuda.memory_allocated(0)
                gpu_memory_total = torch.cuda.get_device_properties(0).total_memory
                gpu_percent = (gpu_memory_allocated / gpu_memory_total) * 100
                
                if gpu_percent > self.thresholds["gpu_memory_usage_percent"]:
                    fault = Fault(
                        fault_id=self._generate_fault_id(),
                        category=FaultCategory.INFRASTRUCTURE,
                        severity=FaultSeverity.CRITICAL,
                        component="gpu",
                        message=f"High GPU memory usage: {gpu_percent:.1f}%",
                        details={
                            "allocated_gb": round(gpu_memory_allocated / (1024**3), 2),
                            "total_gb": round(gpu_memory_total / (1024**3), 2),
                            "threshold": self.thresholds["gpu_memory_usage_percent"]
                        }
                    )
                    faults.append(fault)
        except ImportError:
            pass
        
        return faults
    
    def check_application_health(self) -> List[Fault]:
        """
        Check application-level health.
        
        Returns:
            List of detected faults
        """
        faults = []
        
        # Check for memory leaks (process memory growth)
        process = psutil.Process()
        memory_info = process.memory_info()
        
        # Log memory usage for trend analysis
        memory_mb = memory_info.rss / (1024 * 1024)
        logger.debug(f"Process memory: {memory_mb:.2f} MB")
        
        return faults
    
    def check_performance_health(self) -> List[Fault]:
        """
        Check performance metrics.
        
        Returns:
            List of detected faults
        """
        faults = []
        
        # System load average (Unix-like systems)
        if hasattr(psutil, "getloadavg"):
            load1, load5, load15 = psutil.getloadavg()
            cpu_count = psutil.cpu_count()
            
            if load1 > cpu_count * 0.8:
                fault = Fault(
                    fault_id=self._generate_fault_id(),
                    category=FaultCategory.PERFORMANCE,
                    severity=FaultSeverity.WARNING,
                    component="system_load",
                    message=f"High system load: {load1:.2f}",
                    details={
                        "load_1min": load1,
                        "load_5min": load5,
                        "load_15min": load15,
                        "cpu_count": cpu_count
                    }
                )
                faults.append(fault)
        
        return faults
    
    def check_data_quality(self, data: Any, data_name: str = "data") -> List[Fault]:
        """
        Check data quality issues.
        
        Args:
            data: The data to check
            data_name: Name of the data being checked
            
        Returns:
            List of detected faults
        """
        faults = []
        
        # Check for empty data
        if data is None:
            fault = Fault(
                fault_id=self._generate_fault_id(),
                category=FaultCategory.DATA_QUALITY,
                severity=FaultSeverity.ERROR,
                component="data_validation",
                message=f"Data is None: {data_name}",
                details={"data_name": data_name}
            )
            faults.append(fault)
            return faults
        
        # Check for empty strings/lists/dicts
        if isinstance(data, (str, list, dict)) and len(data) == 0:
            fault = Fault(
                fault_id=self._generate_fault_id(),
                category=FaultCategory.DATA_QUALITY,
                severity=FaultSeverity.WARNING,
                component="data_validation",
                message=f"Empty data: {data_name}",
                details={"data_name": data_name, "data_type": type(data).__name__}
            )
            faults.append(fault)
        
        return faults
    
    def run_health_checks(self) -> List[Fault]:
        """
        Run all health checks and return detected faults.
        
        Returns:
            List of all detected faults
        """
        all_faults = []
        
        try:
            all_faults.extend(self.check_infrastructure_health())
        except Exception as e:
            logger.error(f"Error in infrastructure health check: {e}")
        
        try:
            all_faults.extend(self.check_application_health())
        except Exception as e:
            logger.error(f"Error in application health check: {e}")
        
        try:
            all_faults.extend(self.check_performance_health())
        except Exception as e:
            logger.error(f"Error in performance health check: {e}")
        
        # Register detected faults
        for fault in all_faults:
            self.detect_fault(fault)
        
        return all_faults
    
    def start_monitoring(self, interval_seconds: int = 60):
        """
        Start continuous monitoring in a background thread.
        
        Args:
            interval_seconds: Time between health checks in seconds
        """
        if self.monitoring_active:
            logger.warning("Monitoring is already active")
            return
        
        self.monitoring_active = True
        
        def monitor_loop():
            while self.monitoring_active:
                try:
                    self.run_health_checks()
                except Exception as e:
                    logger.error(f"Error in monitoring loop: {e}")
                
                time.sleep(interval_seconds)
        
        self.monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        logger.info(f"Started continuous monitoring (interval: {interval_seconds}s)")
    
    def stop_monitoring(self):
        """Stop continuous monitoring."""
        if not self.monitoring_active:
            logger.warning("Monitoring is not active")
            return
        
        self.monitoring_active = False
        
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5.0)
            self.monitor_thread = None
        
        logger.info("Stopped continuous monitoring")
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get fault detection statistics.
        
        Returns:
            Dictionary containing fault statistics
        """
        with self.lock:
            return {
                "total_faults_detected": self.stats["total_faults_detected"],
                " unresolved_faults": len([f for f in self.detected_faults.values() if not f.resolved]),
                "faults_resolved": self.stats["faults_resolved"],
                "faults_by_category": self.stats["faults_by_category"].copy(),
                "faults_by_severity": self.stats["faults_by_severity"].copy(),
                "active_monitoring": self.monitoring_active
            }
    
    def get_active_faults(self) -> List[Fault]:
        """
        Get all currently active (unresolved) faults.
        
        Returns:
            List of active faults
        """
        with self.lock:
            return [f for f in self.detected_faults.values() if not f.resolved]
    
    def get_fault_history(self, hours: int = 24) -> List[Fault]:
        """
        Get fault history from the last N hours.
        
        Args:
            hours: Number of hours of history to return
            
        Returns:
            List of faults from the specified time period
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        with self.lock:
            return [f for f in self.fault_history if f.timestamp >= cutoff_time]


# Convenience function to get fault detector instance
def get_fault_detector() -> FaultDetector:
    """Get the singleton fault detector instance."""
    return FaultDetector()