"""
Remediation Engine Module
Executes automatic remediation actions to fix detected faults.
"""

import logging
import os
import subprocess
import threading
import time
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import gc
import psutil

from .fault_detector import Fault, FaultCategory, FaultSeverity
from .root_cause_analyzer import RootCause
from ..core.resource_manager import get_resource_manager

logger = logging.getLogger(__name__)


class RemediationStatus(Enum):
    """Status of remediation actions."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESSFUL = "successful"
    FAILED = "failed"
    PARTIAL = "partial"
    CANCELLED = "cancelled"


class RemediationStrategy(Enum):
    """Types of remediation strategies."""
    RESTART = "restart"
    CLEAR_CACHE = "clear_cache"
    SCALE_RESOURCES = "scale_resources"
    UPDATE_CONFIG = "update_config"
    ROLLBACK = "rollback"
    DATA_REPAIR = "data_repair"
    PROCESS_TERMINATION = "process_termination"
    MANUAL_INTERVENTION = "manual_intervention"


@dataclass
class RemediationAction:
    """Represents a remediation action."""
    action_id: str
    strategy: RemediationStrategy
    description: str
    target_component: str
    fault_id: str
    status: RemediationStatus = RemediationStatus.PENDING
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    result_message: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert action to dictionary for serialization."""
        return {
            "action_id": self.action_id,
            "strategy": self.strategy.value,
            "description": self.description,
            "target_component": self.target_component,
            "fault_id": self.fault_id,
            "status": self.status.value,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "result_message": self.result_message,
            "metadata": self.metadata
        }


class RemediationEngine:
    """
    Executes automatic remediation actions to fix detected faults.
    Implements safe, reversible, and monitored remediation strategies.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Singleton pattern to ensure only one remediation engine exists."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the remediation engine."""
        if hasattr(self, "_initialized"):
            return
            
        self.active_actions: Dict[str, RemediationAction] = {}
        self.action_history: List[RemediationAction] = []
        self.lock = threading.RLock()
        
        # Configuration
        self.max_retries = 3
        self.retry_delay_seconds = 30
        self.safety_checks_enabled = True
        self.manual_approval_required_for = [
            RemediationStrategy.ROLLBACK,
            RemediationStrategy.MANUAL_INTERVENTION,
            RemediationStrategy.PROCESS_TERMINATION
        ]
        
        # Statistics
        self.stats = {
            "total_actions": 0,
            "successful_actions": 0,
            "failed_actions": 0,
            "actions_by_strategy": {strategy.value: 0 for strategy in RemediationStrategy}
        }
        
        # Resource manager
        self.resource_manager = get_resource_manager()
        
        logger.info("RemediationEngine initialized")
    
    def _generate_action_id(self) -> str:
        """Generate a unique action ID."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"ACTION-{timestamp}"
    
    def create_remediation_plan(
        self, 
        root_cause: RootCause
    ) -> List[RemediationAction]:
        """
        Create a remediation plan based on root cause analysis.
        
        Args:
            root_cause: The root cause analysis
            
        Returns:
            List of remediation actions to execute
        """
        actions = []
        
        for remediation in root_cause.suggested_remediations:
            action = self._map_remediation_to_action(
                remediation, 
                root_cause.fault_id,
                root_cause.related_components
            )
            if action:
                actions.append(action)
        
        return actions
    
    def _map_remediation_to_action(
        self, 
        remediation: str, 
        fault_id: str,
        related_components: List[str]
    ) -> Optional[RemediationAction]:
        """Map a remediation suggestion to a concrete action."""
        remediation_lower = remediation.lower()
        
        # Map remediation text to strategy
        if "restart" in remediation_lower or "reboot" in remediation_lower:
            strategy = RemediationStrategy.RESTART
            component = related_components[0] if related_components else "system"
        elif "clear cache" in remediation_lower or "flush" in remediation_lower:
            strategy = RemediationStrategy.CLEAR_CACHE
            component = related_components[0] if related_components else "cache"
        elif "scale" in remediation_lower or "increase" in remediation_lower or "allocate" in remediation_lower:
            strategy = RemediationStrategy.SCALE_RESOURCES
            component = related_components[0] if related_components else "resources"
        elif "config" in remediation_lower or "setting" in remediation_lower:
            strategy = RemediationStrategy.UPDATE_CONFIG
            component = "configuration"
        elif "rollback" in remediation_lower or "revert" in remediation_lower:
            strategy = RemediationStrategy.ROLLBACK
            component = related_components[0] if related_components else "system"
        elif "repair" in remediation_lower or "fix data" in remediation_lower:
            strategy = RemediationStrategy.DATA_REPAIR
            component = "data"
        elif "kill" in remediation_lower or "terminate" in remediation_lower:
            strategy = RemediationStrategy.PROCESS_TERMINATION
            component = related_components[0] if related_components else "process"
        else:
            # Default to manual intervention for unknown remediations
            strategy = RemediationStrategy.MANUAL_INTERVENTION
            component = "manual"
        
        return RemediationAction(
            action_id=self._generate_action_id(),
            strategy=strategy,
            description=remediation,
            target_component=component,
            fault_id=fault_id
        )
    
    def execute_action(self, action: RemediationAction) -> RemediationAction:
        """
        Execute a remediation action.
        
        Args:
            action: The action to execute
            
        Returns:
            Updated action with execution results
        """
        # Check if manual approval is required
        if action.strategy in self.manual_approval_required_for:
            action.status = RemediationStatus.CANCELLED
            action.result_message = "Manual approval required for this strategy"
            logger.warning(f"Action {action.action_id} requires manual approval")
            return action
        
        # Start execution
        action.status = RemediationStatus.IN_PROGRESS
        action.start_time = datetime.utcnow()
        
        with self.lock:
            self.active_actions[action.action_id] = action
        
        try:
            # Execute the remediation strategy
            result = self._execute_strategy(action)
            
            action.status = result["status"]
            action.result_message = result["message"]
            action.metadata.update(result["metadata"])
            action.end_time = datetime.utcnow()
            
            # Update statistics
            self.stats["total_actions"] += 1
            self.stats["actions_by_strategy"][action.strategy.value] += 1
            if action.status == RemediationStatus.SUCCESSFUL:
                self.stats["successful_actions"] += 1
            else:
                self.stats["failed_actions"] += 1
            
            logger.info(f"Action {action.action_id} completed: {action.status.value}")
            
        except Exception as e:
            logger.error(f"Error executing action {action.action_id}: {e}")
            action.status = RemediationStatus.FAILED
            action.result_message = f"Exception: {str(e)}"
            action.end_time = datetime.utcnow()
            
            self.stats["total_actions"] += 1
            self.stats["failed_actions"] += 1
        
        # Move from active to history
        with self.lock:
            self.action_history.append(action)
            if action.action_id in self.active_actions:
                del self.active_actions[action.action_id]
        
        return action
    
    def _execute_strategy(self, action: RemediationAction) -> Dict[str, Any]:
        """Execute a specific remediation strategy."""
        strategy_handlers = {
            RemediationStrategy.CLEAR_CACHE: self._clear_cache,
            RemediationStrategy.SCALE_RESOURCES: self._scale_resources,
            RemediationStrategy.PROCESS_TERMINATION: self._terminate_process,
        }
        
        handler = strategy_handlers.get(action.strategy)
        if handler:
            return handler(action)
        
        # Not implemented strategies
        return {
            "status": RemediationStatus.FAILED,
            "message": f"Strategy {action.strategy.value} not implemented",
            "metadata": {}
        }
    
    def _clear_cache(self, action: RemediationAction) -> Dict[str, Any]:
        """Clear system cache to free memory."""
        logger.info(f"Clearing cache for {action.target_component}")
        
        try:
            # Force Python garbage collection
            collected = gc.collect()
            
            # Clear system page cache (Linux)
            if os.name != 'nt':
                try:
                    # Clear page caches, dentries and inodes
                    subprocess.run(
                        ["sync"],
                        check=True,
                        capture_output=True,
                        timeout=10
                    )
                    
                    # Warn about cache clearing (read-only operation)
                    logger.warning("Skipping page cache clear (requires sudo)")
                    
                except Exception as e:
                    logger.warning(f"Could not clear page cache: {e}")
            
            return {
                "status": RemediationStatus.SUCCESSFUL,
                "message": f"Cleared Python garbage collector ({collected} objects collected)",
                "metadata": {"objects_collected": collected}
            }
            
        except Exception as e:
            return {
                "status": RemediationStatus.FAILED,
                "message": f"Failed to clear cache: {str(e)}",
                "metadata": {}
            }
    
    def _scale_resources(self, action: RemediationAction) -> Dict[str, Any]:
        """Attempt to scale resources (informational only)."""
        logger.info(f"Resource scaling request for {action.target_component}")
        
        # Get current resource status
        status = self.resource_manager.get_system_status()
        
        return {
            "status": RemediationStatus.SUCCESSFUL,
            "message": "Resource scaling information collected",
            "metadata": {
                "current_status": status,
                "recommendation": "Manual intervention may be required for actual scaling"
            }
        }
    
    def _terminate_process(self, action: RemediationAction) -> Dict[str, Any]:
        """Terminate a specific process."""
        # Manual approval is required for this in the main method
        return {
            "status": RemediationStatus.CANCELLED,
            "message": "Manual approval required for process termination",
            "metadata": {}
        }
    
    def execute_remediation_plan(
        self, 
        actions: List[RemediationAction],
        stop_on_failure: bool = True
    ) -> List[RemediationAction]:
        """
        Execute a remediation plan with multiple actions.
        
        Args:
            actions: List of actions to execute
            stop_on_failure: Whether to stop on first failure
            
        Returns:
            List of executed actions with results
        """
        results = []
        
        for action in actions:
            logger.info(f"Executing action: {action.description}")
            
            result = self.execute_action(action)
            results.append(result)
            
            # Stop if action failed and stop_on_failure is True
            if stop_on_failure and result.status == RemediationStatus.FAILED:
                logger.warning(f"Stopping remediation plan due to failure in action {result.action_id}")
                break
            
            # Small delay between actions
            time.sleep(1)
        
        return results
    
    def get_active_actions(self) -> List[RemediationAction]:
        """Get all currently active remediation actions."""
        with self.lock:
            return list(self.active_actions.values())
    
    def get_action_history(self, limit: int = 100) -> List[RemediationAction]:
        """
        Get remediation action history.
        
        Args:
            limit: Maximum number of actions to return
            
        Returns:
            List of historical actions
        """
        with self.lock:
            return self.action_history[-limit:]
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get remediation statistics.
        
        Returns:
            Dictionary containing remediation statistics
        """
        with self.lock:
            return {
                "total_actions": self.stats["total_actions"],
                "successful_actions": self.stats["successful_actions"],
                "failed_actions": self.stats["failed_actions"],
                "success_rate": (
                    self.stats["successful_actions"] / self.stats["total_actions"] * 100
                    if self.stats["total_actions"] > 0 else 0
                ),
                "actions_by_strategy": self.stats["actions_by_strategy"].copy(),
                "active_actions": len(self.active_actions)
            }


# Convenience function to get remediation engine instance
def get_remediation_engine() -> RemediationEngine:
    """Get the singleton remediation engine instance."""
    return RemediationEngine()