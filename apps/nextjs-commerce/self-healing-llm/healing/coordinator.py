"""
Self-Healing Coordinator Module
Orchestrates the complete self-healing workflow from fault detection to remediation.
"""

import logging
import threading
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime

from ..core.llm_system import SelfContainedLLM
from .fault_detector import FaultDetector, Fault, FaultSeverity, get_fault_detector
from .root_cause_analyzer import RootCauseAnalyzer, RootCause, get_root_cause_analyzer
from .remediation_engine import RemediationEngine, RemediationAction, get_remediation_engine

logger = logging.getLogger(__name__)


@dataclass
class HealingEvent:
    """Represents a complete healing event from detection to resolution."""
    event_id: str
    fault: Fault
    root_cause: Optional[RootCause] = None
    remediation_actions: List[RemediationAction] = None
    status: str = "detected"  # detected, analyzing, remediation_in_progress, resolved, failed
    start_time: datetime = None
    end_time: Optional[datetime] = None
    
    def __post_init__(self):
        if self.remediation_actions is None:
            self.remediation_actions = []
        if self.start_time is None:
            self.start_time = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert healing event to dictionary."""
        return {
            "event_id": self.event_id,
            "fault": self.fault.to_dict(),
            "root_cause": self.root_cause.to_dict() if self.root_cause else None,
            "remediation_actions": [a.to_dict() for a in self.remediation_actions],
            "status": self.status,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None
        }


class SelfHealingCoordinator:
    """
    Orchestrates the complete self-healing workflow:
    1. Detects faults
    2. Analyzes root causes
    3. Creates and executes remediation plans
    4. Verifies resolution
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Singleton pattern."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the coordinator."""
        if hasattr(self, "_initialized"):
            return
            
        self.fault_detector = get_fault_detector()
        self.root_cause_analyzer = get_root_cause_analyzer()
        self.remediation_engine = get_remediation_engine()
        
        self.healing_events: Dict[str, HealingEvent] = {}
        self.event_history: List[HealingEvent] = []
        self.lock = threading.RLock()
        
        # Auto-healing settings
        self.auto_healing_enabled = True
        self.auto_remediate_threshold = FaultSeverity.WARNING  # Auto-remediate WARNING and below
        self.manual_approval_for = [FaultSeverity.CRITICAL]
        
        # Statistics
        self.stats = {
            "total_events": 0,
            "auto_remediated": 0,
            "manual_intervention_required": 0,
            "resolution_successful": 0,
            "resolution_failed": 0
        }
        
        logger.info("SelfHealingCoordinator initialized")
    
    def _generate_event_id(self) -> str:
        """Generate a unique event ID."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"HEALING-{timestamp}"
    
    def handle_fault(self, fault: Fault) -> HealingEvent:
        """
        Handle a detected fault through the complete healing workflow.
        
        Args:
            fault: The detected fault
            
        Returns:
            HealingEvent representing the complete workflow
        """
        event_id = self._generate_event_id()
        event = HealingEvent(event_id=event_id, fault=fault)
        
        with self.lock:
            self.healing_events[event_id] = event
            self.event_history.append(event)
            self.stats["total_events"] += 1
        
        logger.info(f"Starting healing workflow for fault {fault.fault_id}")
        
        try:
            # Step 1: Analyze root cause
            event.status = "analyzing"
            logger.info(f"Analyzing root cause for fault {fault.fault_id}")
            
            root_cause = self.root_cause_analyzer.analyze_fault(fault)
            event.root_cause = root_cause
            
            # Step 2: Check if auto-remediation should proceed
            should_auto_remediate = self._should_auto_remediate(fault, root_cause)
            
            if not should_auto_remediate:
                event.status = "manual_intervention_required"
                event.end_time = datetime.utcnow()
                self.stats["manual_intervention_required"] += 1
                logger.warning(f"Manual intervention required for fault {fault.fault_id}")
                return event
            
            # Step 3: Create remediation plan
            event.status = "creating_remediation_plan"
            logger.info(f"Creating remediation plan for fault {fault.fault_id}")
            
            remediation_actions = self.remediation_engine.create_remediation_plan(root_cause)
            event.remediation_actions = remediation_actions
            
            if not remediation_actions:
                logger.warning(f"No remediation actions available for fault {fault.fault_id}")
                event.status = "no_actions_available"
                event.end_time = datetime.utcnow()
                return event
            
            # Step 4: Execute remediation
            event.status = "remediation_in_progress"
            logger.info(f"Executing remediation for fault {fault.fault_id} with {len(remediation_actions)} actions")
            
            executed_actions = self.remediation_engine.execute_remediation_plan(remediation_actions)
            event.remediation_actions = executed_actions
            
            # Step 5: Evaluate results
            event.status = "evaluating_results"
            resolution_successful = self._evaluate_resolution(event)
            
            if resolution_successful:
                event.status = "resolved"
                self.fault_detector.resolve_fault(fault.fault_id, root_cause=root_cause.root_cause)
                self.stats["auto_remediated"] += 1
                self.stats["resolution_successful"] += 1
                logger.info(f"Successfully resolved fault {fault.fault_id}")
            else:
                event.status = "resolution_failed"
                self.stats["resolution_failed"] += 1
                logger.warning(f"Failed to resolve fault {fault.fault_id}")
            
            event.end_time = datetime.utcnow()
            
        except Exception as e:
            logger.error(f"Error in healing workflow for fault {fault.fault_id}: {e}")
            event.status = "error"
            event.end_time = datetime.utcnow()
        
        return event
    
    def _should_auto_remediate(self, fault: Fault, root_cause: RootCause) -> bool:
        """
        Determine if auto-remediation should proceed.
        
        Args:
            fault: The detected fault
            root_cause: The root cause analysis
            
        Returns:
            True if auto-remediation should proceed
        """
        # Check if auto-healing is enabled
        if not self.auto_healing_enabled:
            logger.info("Auto-healing is disabled")
            return False
        
        # Check fault severity
        severity_order = [FaultSeverity.INFO, FaultSeverity.WARNING, FaultSeverity.ERROR, FaultSeverity.CRITICAL]
        fault_severity_rank = severity_order.index(fault.severity)
        threshold_rank = severity_order.index(self.auto_remediate_threshold)
        
        if fault_severity_rank > threshold_rank:
            logger.info(f"Fault severity {fault.severity.value} exceeds threshold {self.auto_remediate_threshold.value}")
            return False
        
        # Check confidence level
        if root_cause.confidence.value == "low":
            logger.warning(f"Low confidence in root cause analysis for fault {fault.fault_id}")
            return False
        
        # Check if manual intervention is required for this fault type
        if fault.severity in self.manual_approval_for:
            logger.info(f"Manual approval required for {fault.severity.value} faults")
            return False
        
        return True
    
    def _evaluate_resolution(self, event: HealingEvent) -> bool:
        """
        Evaluate if the remediation was successful.
        
        Args:
            event: The healing event to evaluate
            
        Returns:
            True if resolution was successful
        """
        if not event.remediation_actions:
            return False
        
        # Check if all actions were successful
        successful_actions = [
            action for action in event.remediation_actions
            if action.status.value == "successful"
        ]
        
        success_rate = len(successful_actions) / len(event.remediation_actions)
        
        # Consider resolution successful if >50% of actions succeeded
        return success_rate > 0.5
    
    def start_continuous_monitoring(self, interval_seconds: int = 60):
        """
        Start continuous monitoring and auto-healing.
        
        Args:
            interval_seconds: Time between health checks
        """
        logger.info(f"Starting continuous monitoring (interval: {interval_seconds}s)")
        
        # Start fault detector monitoring
        self.fault_detector.start_monitoring(interval_seconds)
        
        # Register callback for automated handling
        self.fault_detector.register_callback(self._auto_handle_fault)
    
    def stop_continuous_monitoring(self):
        """Stop continuous monitoring."""
        self.fault_detector.stop_monitoring()
        logger.info("Stopped continuous monitoring")
    
    def _auto_handle_fault(self, fault: Fault):
        """
        Callback for automatic fault handling.
        
        Args:
            fault: The detected fault
        """
        if not self.auto_healing_enabled:
            return
        
        # Handle in background thread to avoid blocking
        thread = threading.Thread(
            target=self.handle_fault,
            args=(fault,),
            daemon=True
        )
        thread.start()
    
    def get_active_events(self) -> List[HealingEvent]:
        """Get all currently active healing events."""
        with self.lock:
            return [e for e in self.healing_events.values() if e.status not in ["resolved", "failed", "error", "manual_intervention_required"]]
    
    def get_event_history(self, limit: int = 100) -> List[HealingEvent]:
        """
        Get healing event history.
        
        Args:
            limit: Maximum number of events to return
            
        Returns:
            List of historical events
        """
        with self.lock:
            return self.event_history[-limit:]
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get healing statistics.
        
        Returns:
            Dictionary containing healing statistics
        """
        with self.lock:
            return {
                "total_events": self.stats["total_events"],
                "auto_remediated": self.stats["auto_remediated"],
                "manual_intervention_required": self.stats["manual_intervention_required"],
                "resolution_successful": self.stats["resolution_successful"],
                "resolution_failed": self.stats["resolution_failed"],
                "success_rate": (
                    self.stats["resolution_successful"] / self.stats["total_events"] * 100
                    if self.stats["total_events"] > 0 else 0
                ),
                "active_events": len(self.get_active_events()),
                "auto_healing_enabled": self.auto_healing_enabled
            }
    
    def enable_auto_healing(self):
        """Enable automatic healing."""
        self.auto_healing_enabled = True
        logger.info("Auto-healing enabled")
    
    def disable_auto_healing(self):
        """Disable automatic healing."""
        self.auto_healing_enabled = False
        logger.info("Auto-healing disabled")


# Convenience function to get coordinator instance
def get_self_healing_coordinator() -> SelfHealingCoordinator:
    """Get the singleton coordinator instance."""
    return SelfHealingCoordinator()