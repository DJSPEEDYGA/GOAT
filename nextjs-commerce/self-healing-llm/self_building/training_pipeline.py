"""
Training Pipeline Module
Handles self-improvement through experience-based learning.
"""

import logging
import time
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class TrainingStatus(Enum):
    """Status of training operations."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class TrainingTask:
    """Represents a training task."""
    task_id: str
    task_type: str
    config: Dict[str, Any]
    status: TrainingStatus = TrainingStatus.PENDING
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    progress: float = 0.0
    metrics: Dict[str, Any] = field(default_factory=dict)
    error_message: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "task_id": self.task_id,
            "task_type": self.task_type,
            "config": self.config,
            "status": self.status.value,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "progress": self.progress,
            "metrics": self.metrics,
            "error_message": self.error_message
        }


class TrainingPipeline:
    """
    Handles self-improvement through experience-based learning.
    Manages training tasks, model updates, and performance tracking.
    """
    
    def __init__(self, data_dir: Optional[str] = None):
        """
        Initialize the training pipeline.
        
        Args:
            data_dir: Directory to store training data and models
        """
        self.data_dir = Path(data_dir) if data_dir else Path("./training_data")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.training_tasks: Dict[str, TrainingTask] = []
        self.task_history: List[TrainingTask] = []
        
        # Configuration
        self.auto_training_enabled = False
        self.min_samples_for_training = 100
        self.validation_split = 0.2
        
        # Experience storage
        self.experience_buffer: List[Dict[str, Any]] = []
        self.max_experience_buffer = 10000
        
        logger.info(f"TrainingPipeline initialized with directory: {self.data_dir}")
    
    def _generate_task_id(self, task_type: str) -> str:
        """Generate a unique task ID."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"TASK-{task_type}-{timestamp}"
    
    def add_experience(
        self,
        input_text: str,
        output_text: str,
        feedback_score: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Add an experience to the learning buffer.
        
        Args:
            input_text: Input prompt
            output_text: Generated output
            feedback_score: Optional feedback score (0.0 to 1.0)
            metadata: Optional metadata
        """
        experience = {
            "input_text": input_text,
            "output_text": output_text,
            "feedback_score": feedback_score,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        
        self.experience_buffer.append(experience)
        
        # Limit buffer size
        if len(self.experience_buffer) > self.max_experience_buffer:
            self.experience_buffer = self.experience_buffer[-self.max_experience_buffer:]
        
        # Check if we should trigger auto-training
        if (self.auto_training_enabled and 
            len(self.experience_buffer) >= self.min_samples_for_training):
            self.trigger_auto_training()
        
        logger.debug(f"Added experience, buffer size: {len(self.experience_buffer)}")
    
    def trigger_auto_training(self):
        """Trigger automatic training if enough samples are available."""
        if len(self.experience_buffer) < self.min_samples_for_training:
            logger.info("Not enough samples for training")
            return
        
        logger.info("Triggering auto-training")
        self.start_training_task("experience_fine_tuning")
    
    def start_training_task(
        self,
        task_type: str,
        config: Optional[Dict[str, Any]] = None
    ) -> TrainingTask:
        """
        Start a training task.
        
        Args:
            task_type: Type of training task
            config: Optional configuration
            
        Returns:
            TrainingTask object
        """
        task_id = self._generate_task_id(task_type)
        
        task = TrainingTask(
            task_id=task_id,
            task_type=task_type,
            config=config or {},
            status=TrainingStatus.RUNNING,
            start_time=datetime.utcnow()
        )
        
        self.training_tasks.append(task)
        
        logger.info(f"Started training task {task_id}")
        
        # Execute training
        try:
            if task_type == "experience_fine_tuning":
                self._train_on_experience(task)
            elif task_type == "architecture_optimization":
                self._train_architecture_optimization(task)
            else:
                task.status = TrainingStatus.FAILED
                task.error_message = f"Unknown task type: {task_type}"
        
        except Exception as e:
            logger.error(f"Error in training task {task_id}: {e}")
            task.status = TrainingStatus.FAILED
            task.error_message = str(e)
        
        finally:
            task.end_time = datetime.utcnow()
            self.task_history.append(task)
            self.training_tasks.remove(task)
        
        return task
    
    def _train_on_experience(self, task: TrainingTask):
        """Train model on collected experiences."""
        logger.info(f"Training on {len(self.experience_buffer)} experiences")
        
        # Filter experiences with feedback
        valid_experiences = [
            e for e in self.experience_buffer
            if e["feedback_score"] is not None
        ]
        
        if len(valid_experiences) == 0:
            task.status = TrainingStatus.FAILED
            task.error_message = "No experiences with feedback scores"
            return
        
        # Simulate training progress
        epochs = 10
        for epoch in range(epochs):
            task.progress = (epoch + 1) / epochs * 100
            time.sleep(0.1)  # Simulate training time
            
            # Simulate improving metrics
            task.metrics["epoch"] = epoch + 1
            task.metrics["loss"] = 1.0 - (epoch / epochs) * 0.8
            task.metrics["accuracy"] = 0.5 + (epoch / epochs) * 0.4
        
        task.status = TrainingStatus.COMPLETED
        
        logger.info(f"Training task {task.task_id} completed")
    
    def _train_architecture_optimization(self, task: TrainingTask):
        """Train architecture optimization."""
        logger.info(f"Training architecture optimization")
        
        # Simulate training
        task.progress = 100.0
        task.metrics["optimization_score"] = 0.85
        
        task.status = TrainingStatus.COMPLETED
        
        logger.info(f"Architecture optimization task {task.task_id} completed")
    
    def get_training_task(self, task_id: str) -> Optional[TrainingTask]:
        """Get a training task by ID."""
        for task in self.training_tasks:
            if task.task_id == task_id:
                return task
        for task in self.task_history:
            if task.task_id == task_id:
                return task
        return None
    
    def get_active_tasks(self) -> List[TrainingTask]:
        """Get all active training tasks."""
        return [task for task in self.training_tasks if task.status == TrainingStatus.RUNNING]
    
    def get_task_history(self, limit: int = 100) -> List[TrainingTask]:
        """Get training task history."""
        return self.task_history[-limit:]
    
    def get_experience_statistics(self) -> Dict[str, Any]:
        """Get statistics about collected experiences."""
        if not self.experience_buffer:
            return {}
        
        feedback_scores = [
            e["feedback_score"] 
            for e in self.experience_buffer 
            if e["feedback_score"] is not None
        ]
        
        return {
            "total_experiences": len(self.experience_buffer),
            "experiences_with_feedback": len(feedback_scores),
            "average_feedback_score": sum(feedback_scores) / len(feedback_scores) if feedback_scores else 0.0,
            "min_feedback_score": min(feedback_scores) if feedback_scores else 0.0,
            "max_feedback_score": max(feedback_scores) if feedback_scores else 0.0,
            "buffer_capacity": self.max_experience_buffer,
            "buffer_utilization": len(self.experience_buffer) / self.max_experience_buffer
        }
    
    def save_experiences(self, file_path: Optional[Path] = None):
        """Save experiences to file."""
        file_path = file_path or self.data_dir / "experiences.json"
        
        with open(file_path, 'w') as f:
            json.dump(self.experience_buffer, f, indent=2, default=str)
        
        logger.info(f"Saved {len(self.experience_buffer)} experiences to {file_path}")
    
    def load_experiences(self, file_path: Optional[Path] = None):
        """Load experiences from file."""
        file_path = file_path or self.data_dir / "experiences.json"
        
        if not file_path.exists():
            logger.warning(f"Experience file not found: {file_path}")
            return
        
        with open(file_path, 'r') as f:
            self.experience_buffer = json.load(f)
        
        logger.info(f"Loaded {len(self.experience_buffer)} experiences from {file_path}")
    
    def get_training_statistics(self) -> Dict[str, Any]:
        """Get training pipeline statistics."""
        return {
            "total_tasks": len(self.task_history),
            "active_tasks": len(self.get_active_tasks()),
            "completed_tasks": len([t for t in self.task_history if t.status == TrainingStatus.COMPLETED]),
            "failed_tasks": len([t for t in self.task_history if t.status == TrainingStatus.FAILED]),
            "experience_stats": self.get_experience_statistics(),
            "auto_training_enabled": self.auto_training_enabled
        }
    
    def enable_auto_training(self, min_samples: Optional[int] = None):
        """Enable automatic training."""
        self.auto_training_enabled = True
        if min_samples:
            self.min_samples_for_training = min_samples
        logger.info("Auto-training enabled")
    
    def disable_auto_training(self):
        """Disable automatic training."""
        self.auto_training_enabled = False
        logger.info("Auto-training disabled")