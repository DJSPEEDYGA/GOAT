"""
LLM System Orchestrator
Main system coordinator that integrates all components.
"""

import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

# Import from core module
from core import (
    SelfContainedLLM,
    LocalKnowledgeBase,
    get_resource_manager
)

# Import from healing module
from healing import (
    get_fault_detector,
    get_root_cause_analyzer,
    get_remediation_engine,
    get_self_healing_coordinator
)

# Import from checkpoint module
from checkpoint import get_checkpoint_manager

# Import from self_building module
from self_building import (
    get_config_manager,
    ArchitectureSearcher,
    TrainingPipeline,
    MetaLearningEngine
)

# Import checkpoint types
from checkpoint.checkpoint_manager import CheckpointType

logger = logging.getLogger(__name__)


@dataclass
class SystemState:
    """Represents the current state of the system."""
    status: str = "initializing"
    health_score: float = 100.0
    uptime_seconds: float = 0.0
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    last_health_check: Optional[datetime] = None


class LLMSystemOrchestrator:
    """
    Main system coordinator that integrates all components.
    Provides a unified interface to the self-healing LLM system.
    """
    
    _instance = None
    _lock = None
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the LLM system orchestrator.
        
        Args:
            config_path: Optional path to configuration file
        """
        if hasattr(self, "_initialized"):
            return
            
        self.start_time = datetime.utcnow()
        
        # Initialize all components
        logger.info("Initializing LLM System Orchestrator")
        
        # Core components
        self.llm = SelfContainedLLM()
        self.knowledge_base = LocalKnowledgeBase()
        self.resource_manager = get_resource_manager()
        
        # Healing components
        self.fault_detector = get_fault_detector()
        self.root_cause_analyzer = get_root_cause_analyzer()
        self.remediation_engine = get_remediation_engine()
        self.healing_coordinator = get_self_healing_coordinator()
        
        # Checkpoint component
        self.checkpoint_manager = get_checkpoint_manager()
        
        # Self-building components
        self.config_manager = get_config_manager()
        self.architecture_searcher = ArchitectureSearcher(self.llm)
        self.training_pipeline = TrainingPipeline()
        self.meta_learning_engine = MetaLearningEngine()
        
        # System state
        self.system_state = SystemState()
        self.running = False
        
        # Register state handlers for checkpointing
        self._register_state_handlers()
        
        logger.info("LLM System Orchestrator initialized successfully")
        
        self._initialized = True
    
    def _register_state_handlers(self):
        """Register state capture and restore handlers for checkpointing."""
        def capture_system_state():
            """Capture current system state."""
            return {
                "status": self.system_state.status,
                "health_score": self.system_state.health_score,
                "uptime_seconds": self.system_state.uptime_seconds,
                "total_requests": self.system_state.total_requests,
                "successful_requests": self.system_state.successful_requests,
                "failed_requests": self.system_state.failed_requests,
                "last_health_check": self.system_state.last_health_check.isoformat() if self.system_state.last_health_check else None,
                "config": self.config_manager.get_all()
            }
        
        def restore_system_state(state_data):
            """Restore system state."""
            self.system_state.status = state_data.get("status", "running")
            self.system_state.health_score = state_data.get("health_score", 100.0)
            self.system_state.uptime_seconds = state_data.get("uptime_seconds", 0.0)
            self.system_state.total_requests = state_data.get("total_requests", 0)
            self.system_state.successful_requests = state_data.get("successful_requests", 0)
            self.system_state.failed_requests = state_data.get("failed_requests", 0)
            
            last_check = state_data.get("last_health_check")
            if last_check:
                self.system_state.last_health_check = datetime.fromisoformat(last_check)
            
            # Restore configurations
            config = state_data.get("config", {})
            for key, value in config.items():
                self.config_manager.set(key, value, source="restored", record_change=False)
        
        self.checkpoint_manager.register_state_handler(
            checkpoint_type=CheckpointType.SYSTEM_STATE,
            capture_handler=capture_system_state,
            restore_handler=restore_system_state
        )
    
    def start(self):
        """Start the LLM system."""
        if self.running:
            logger.warning("System is already running")
            return
        
        logger.info("Starting LLM system")
        
        # Start continuous monitoring and auto-healing
        self.healing_coordinator.start_continuous_monitoring(interval_seconds=60)
        
        # Start automatic checkpointing
        self.checkpoint_manager.start_auto_checkpoint()
        
        # Update system state
        self.system_state.status = "running"
        self.system_state.last_health_check = datetime.utcnow()
        self.running = True
        
        logger.info("LLM system started successfully")
    
    def stop(self):
        """Stop the LLM system."""
        if not self.running:
            logger.warning("System is not running")
            return
        
        logger.info("Stopping LLM system")
        
        # Stop continuous monitoring
        self.healing_coordinator.stop_continuous_monitoring()
        
        # Stop automatic checkpointing
        self.checkpoint_manager.stop_auto_checkpoint()
        
        # Create final checkpoint
        self.checkpoint_manager.create_checkpoint(
            checkpoint_type=CheckpointType.SYSTEM_STATE,
            description="Final checkpoint before shutdown"
        )
        
        # Update system state
        self.system_state.status = "stopped"
        self.running = False
        
        logger.info("LLM system stopped successfully")
    
    def generate(
        self,
        prompt: str,
        model_type: str = "primary",
        **kwargs
    ) -> str:
        """
        Generate text using the LLM system.
        
        Args:
            prompt: Input prompt
            model_type: Type of model to use
            **kwargs: Additional generation parameters
            
        Returns:
            Generated text
        """
        try:
            # Update request counters
            self.system_state.total_requests += 1
            
            # Check system health
            if self.system_state.health_score < 50.0:
                logger.warning(f"System health is low: {self.system_state.health_score}")
            
            # Generate response
            response = self.llm.generate(prompt, model_type=model_type, **kwargs)
            
            # Update success counter
            self.system_state.successful_requests += 1
            
            # Update system health based on success
            self.system_state.health_score = min(100.0, self.system_state.health_score + 0.1)
            
            # Learn from the interaction
            self.meta_learning_engine.learn_from_usage({
                "prompt": prompt,
                "response": response,
                "model_type": model_type
            })
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            self.system_state.failed_requests += 1
            self.system_state.health_score = max(0.0, self.system_state.health_score - 5.0)
            
            # Report fault to meta learning engine
            self.meta_learning_engine.learn_from_fault({
                "category": "application",
                "component": "llm_orchestrator",
                "severity": "error",
                "message": str(e)
            })
            
            raise
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform a comprehensive health check.
        
        Returns:
            Dictionary containing health information
        """
        # Update uptime
        self.system_state.uptime_seconds = (datetime.utcnow() - self.start_time).total_seconds()
        self.system_state.last_health_check = datetime.utcnow()
        
        # Collect health information from all components
        health_info = {
            "system_status": self.system_state.status,
            "health_score": self.system_state.health_score,
            "uptime_seconds": self.system_state.uptime_seconds,
            "requests": {
                "total": self.system_state.total_requests,
                "successful": self.system_state.successful_requests,
                "failed": self.system_state.failed_requests,
                "success_rate": (
                    self.system_state.successful_requests / self.system_state.total_requests * 100
                    if self.system_state.total_requests > 0 else 100.0
                )
            },
            "resources": self.resource_manager.get_system_status(),
            "healing": self.healing_coordinator.get_statistics(),
            "checkpoint": self.checkpoint_manager.get_statistics(),
            "config": self.config_manager.get_statistics(),
            "learning": self.meta_learning_engine.get_statistics()
        }
        
        return health_info
    
    def optimize_system(self) -> Dict[str, Any]:
        """
        Perform system optimization.
        
        Returns:
            Dictionary containing optimization results
        """
        logger.info("Starting system optimization")
        
        # Get current performance metrics
        health_info = self.health_check()
        performance_metrics = {
            "latency_ms": health_info.get("resources", {}).get("memory", {}).get("used_percent", 0) * 10,
            "memory_usage_percent": health_info.get("resources", {}).get("memory", {}).get("used_percent", 0),
            "error_rate": health_info.get("requests", {}).get("failed", 0) / max(health_info.get("requests", {}).get("total", 1), 1)
        }
        
        # Generate config optimizations
        config_recommendations = self.config_manager.optimize_config(performance_metrics)
        self.config_manager.apply_optimized_configs(config_recommendations)
        
        # Get learning recommendations
        learning_recommendations = self.meta_learning_engine.get_recommendations()
        
        results = {
            "config_optimizations": config_recommendations,
            "learning_recommendations": learning_recommendations,
            "performance_metrics": performance_metrics
        }
        
        logger.info(f"System optimization completed: {len(config_recommendations)} config changes")
        
        return results
    
    def search_best_architecture(self, num_candidates: int = 10) -> Dict[str, Any]:
        """
        Search for the best architecture configuration.
        
        Args:
            num_candidates: Number of candidates to evaluate
            
        Returns:
            Dictionary containing search results
        """
        logger.info(f"Starting architecture search with {num_candidates} candidates")
        
        from self_building.architecture_searcher import SearchStrategy
        best_candidate = self.architecture_searcher.search(
            strategy=SearchStrategy.RANDOM_SEARCH,
            num_candidates=num_candidates
        )
        
        results = {
            "best_config": best_candidate.config,
            "performance_score": best_candidate.performance_score,
            "statistics": self.architecture_searcher.get_search_statistics()
        }
        
        logger.info(f"Architecture search completed: score={best_candidate.performance_score:.3f}")
        
        return results
    
    def create_checkpoint(self, description: str = "") -> str:
        """
        Create a system checkpoint.
        
        Args:
            description: Optional description
            
        Returns:
            Checkpoint ID
        """
        checkpoint = self.checkpoint_manager.create_checkpoint(
            checkpoint_type=CheckpointType.SYSTEM_STATE,
            description=description or "System checkpoint"
        )
        
        return checkpoint.checkpoint_id
    
    def restore_checkpoint(self, checkpoint_id: str) -> bool:
        """
        Restore system from a checkpoint.
        
        Args:
            checkpoint_id: ID of checkpoint to restore
            
        Returns:
            True if successful
        """
        return self.checkpoint_manager.restore_checkpoint(checkpoint_id)
    
    def get_system_status(self) -> Dict[str, Any]:
        """
        Get comprehensive system status.
        
        Returns:
            Dictionary containing system status
        """
        return {
            "overview": {
                "status": self.system_state.status,
                "running": self.running,
                "health_score": self.system_state.health_score,
                "uptime_seconds": self.system_state.uptime_seconds
            },
            "health": self.health_check(),
            "active_faults": len(self.healing_coordinator.get_active_events()),
            "learned_patterns": len(self.meta_learning_engine.get_learned_patterns()),
            "checkpoints": len(self.checkpoint_manager.list_checkpoints())
        }
    
    def enable_auto_healing(self):
        """Enable automatic healing."""
        self.healing_coordinator.enable_auto_healing()
    
    def disable_auto_healing(self):
        """Disable automatic healing."""
        self.healing_coordinator.disable_auto_healing()


# Singleton instance
_orchestrator_instance: Optional[LLMSystemOrchestrator] = None


def get_orchestrator(config_path: Optional[str] = None) -> LLMSystemOrchestrator:
    """Get the orchestrator instance."""
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = LLMSystemOrchestrator(config_path)
    return _orchestrator_instance