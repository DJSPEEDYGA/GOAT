"""
Resource Manager Module
Handles intelligent resource allocation and optimization for the self-contained LLM system.
"""

import os
import psutil
import threading
import logging
from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import time

logger = logging.getLogger(__name__)


class ResourceType(Enum):
    """Types of system resources that can be managed."""
    MEMORY = "memory"
    CPU = "cpu"
    GPU = "gpu"
    DISK = "disk"


@dataclass
class ResourceRequirement:
    """Resource requirements for a task."""
    min_memory_gb: float
    recommended_memory_gb: float
    min_cpu_cores: int
    recommended_cpu_cores: int
    requires_gpu: bool = False
    gpu_memory_gb: float = 0.0
    estimated_duration_seconds: int = 60


@dataclass
class ResourceAllocation:
    """Represents allocated resources for a task."""
    task_id: str
    memory_mb: int
    cpu_cores: int
    gpu_memory_mb: int = 0
    allocated_at: float = field(default_factory=time.time)
    expires_at: Optional[float] = None


class ResourceManager:
    """
    Manages system resources intelligently, allocating based on task requirements
    and system capacity. Implements automatic scaling and resource optimization.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Singleton pattern to ensure only one resource manager exists."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the resource manager."""
        if hasattr(self, "_initialized"):
            return
            
        self.allocations: Dict[str, ResourceAllocation] = {}
        self.reserved_memory_mb = 0
        self.reserved_cpu_cores = 0
        self.reserved_gpu_memory_mb = 0
        self.lock = threading.RLock()
        
        # Configuration
        self.max_memory_usage_percent = 85.0
        self.max_cpu_usage_percent = 90.0
        self.gpu_available = self._check_gpu_availability()
        self.total_gpu_memory_mb = self._get_total_gpu_memory()
        
        logger.info("ResourceManager initialized")
        logger.info(f"GPU Available: {self.gpu_available}")
        if self.gpu_available:
            logger.info(f"Total GPU Memory: {self.total_gpu_memory_mb} MB")
    
    def _check_gpu_availability(self) -> bool:
        """Check if GPU is available."""
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False
    
    def _get_total_gpu_memory(self) -> float:
        """Get total GPU memory in MB."""
        try:
            import torch
            if torch.cuda.is_available():
                return torch.cuda.get_device_properties(0).total_memory / (1024 * 1024)
        except ImportError:
            pass
        return 0.0
    
    def get_available_memory_mb(self) -> float:
        """Get available memory in MB."""
        mem = psutil.virtual_memory()
        return mem.available / (1024 * 1024)
    
    def get_available_cpu_cores(self) -> int:
        """Get available CPU cores."""
        cpu_count = psutil.cpu_count(logical=True)
        cpu_percent = psutil.cpu_percent(interval=0.1)
        available_ratio = (100.0 - cpu_percent) / 100.0
        return int(max(1, cpu_count * available_ratio))
    
    def get_available_gpu_memory_mb(self) -> float:
        """Get available GPU memory in MB."""
        if not self.gpu_available:
            return 0.0
        
        try:
            import torch
            if torch.cuda.is_available():
                total_memory = torch.cuda.get_device_properties(0).total_memory
                allocated_memory = torch.cuda.memory_allocated(0)
                return (total_memory - allocated_memory) / (1024 * 1024)
        except Exception as e:
            logger.warning(f"Error getting GPU memory: {e}")
        return 0.0
    
    def can_allocate(self, requirement: ResourceRequirement) -> Tuple[bool, str]:
        """
        Check if resources can be allocated for a task.
        
        Args:
            requirement: The resource requirement to check
            
        Returns:
            Tuple of (can_allocate, reason)
        """
        available_memory_mb = self.get_available_memory_mb()
        required_memory_mb = requirement.min_memory_gb * 1024
        
        if available_memory_mb * (self.max_memory_usage_percent / 100.0) < required_memory_mb:
            return False, f"Insufficient memory: need {required_memory_mb} MB, have {available_memory_mb} MB"
        
        available_cpu_cores = self.get_available_cpu_cores()
        if available_cpu_cores < requirement.min_cpu_cores:
            return False, f"Insufficient CPU: need {requirement.min_cpu_cores} cores, have {available_cpu_cores}"
        
        if requirement.requires_gpu:
            if not self.gpu_available:
                return False, "GPU required but not available"
            
            available_gpu_memory_mb = self.get_available_gpu_memory_mb()
            required_gpu_memory_mb = requirement.gpu_memory_gb * 1024
            
            if available_gpu_memory_mb < required_gpu_memory_mb:
                return False, f"Insufficient GPU memory: need {required_gpu_memory_mb} MB, have {available_gpu_memory_mb} MB"
        
        return True, "Resources available"
    
    def allocate_resources(
        self, 
        task_id: str, 
        requirement: ResourceRequirement,
        allocation_duration_seconds: Optional[int] = None
    ) -> Optional[ResourceAllocation]:
        """
        Allocate resources for a task.
        
        Args:
            task_id: Unique identifier for the task
            requirement: Resource requirements for the task
            allocation_duration_seconds: Optional duration in seconds
            
        Returns:
            ResourceAllocation if successful, None otherwise
        """
        with self.lock:
            can_allocate, reason = self.can_allocate(requirement)
            if not can_allocate:
                logger.warning(f"Cannot allocate resources for task {task_id}: {reason}")
                return None
            
            # Calculate optimal allocation based on recommendation
            memory_mb = int(min(
                requirement.recommended_memory_gb * 1024,
                self.get_available_memory_mb() * 0.8
            ))
            
            cpu_cores = min(
                requirement.recommended_cpu_cores,
                self.get_available_cpu_cores()
            )
            
            gpu_memory_mb = 0
            if requirement.requires_gpu and self.gpu_available:
                gpu_memory_mb = min(
                    requirement.gpu_memory_gb * 1024,
                    self.get_available_gpu_memory_mb()
                )
            
            # Create allocation
            expires_at = None
            if allocation_duration_seconds:
                expires_at = time.time() + allocation_duration_seconds
            
            allocation = ResourceAllocation(
                task_id=task_id,
                memory_mb=memory_mb,
                cpu_cores=cpu_cores,
                gpu_memory_mb=gpu_memory_mb,
                expires_at=expires_at
            )
            
            self.allocations[task_id] = allocation
            self.reserved_memory_mb += memory_mb
            self.reserved_cpu_cores += cpu_cores
            self.reserved_gpu_memory_mb += gpu_memory_mb
            
            logger.info(f"Allocated resources for task {task_id}: "
                       f"{memory_mb} MB memory, {cpu_cores} CPU cores, "
                       f"{gpu_memory_mb} MB GPU memory")
            
            return allocation
    
    def release_resources(self, task_id: str) -> bool:
        """
        Release resources allocated for a task.
        
        Args:
            task_id: Unique identifier for the task
            
        Returns:
            True if resources were released, False if task not found
        """
        with self.lock:
            if task_id not in self.allocations:
                logger.warning(f"No allocation found for task {task_id}")
                return False
            
            allocation = self.allocations[task_id]
            self.reserved_memory_mb -= allocation.memory_mb
            self.reserved_cpu_cores -= allocation.cpu_cores
            self.reserved_gpu_memory_mb -= allocation.gpu_memory_mb
            
            del self.allocations[task_id]
            
            logger.info(f"Released resources for task {task_id}")
            return True
    
    def get_system_status(self) -> Dict[str, Any]:
        """
        Get current system resource status.
        
        Returns:
            Dictionary containing system resource information
        """
        status = {
            "memory": {
                "total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
                "available_gb": round(self.get_available_memory_mb() / 1024, 2),
                "used_percent": psutil.virtual_memory().percent,
                "reserved_mb": self.reserved_memory_mb
            },
            "cpu": {
                "total_cores": psutil.cpu_count(logical=True),
                "available_cores": self.get_available_cpu_cores(),
                "usage_percent": psutil.cpu_percent(interval=0.1),
                "reserved_cores": self.reserved_cpu_cores
            },
            "gpu": {
                "available": self.gpu_available,
                "total_memory_gb": round(self.total_gpu_memory_mb / 1024, 2),
                "available_memory_gb": round(self.get_available_gpu_memory_mb() / 1024, 2),
                "reserved_memory_mb": self.reserved_gpu_memory_mb
            },
            "active_allocations": len(self.allocations)
        }
        
        return status
    
    def estimate_task_requirement(self, task_description: str) -> ResourceRequirement:
        """
        Estimate resource requirements based on task description.
        
        Args:
            task_description: Description of the task
            
        Returns:
            Estimated ResourceRequirement
        """
        task_description = task_description.lower()
        
        # Default values
        min_memory_gb = 4.0
        recommended_memory_gb = 8.0
        min_cpu_cores = 2
        recommended_cpu_cores = 4
        requires_gpu = False
        gpu_memory_gb = 0.0
        estimated_duration = 60
        
        # Analyze task description
        if "large model" in task_description or "13b" in task_description or "70b" in task_description:
            min_memory_gb = 16.0
            recommended_memory_gb = 32.0
            estimated_duration = 300
        elif "medium model" in task_description or "7b" in task_description:
            min_memory_gb = 8.0
            recommended_memory_gb = 16.0
            estimated_duration = 180
        elif "small model" in task_description or "1b" in task_description or "embedding" in task_description:
            min_memory_gb = 2.0
            recommended_memory_gb = 4.0
            estimated_duration = 30
        
        if "image generation" in task_description or "diffusion" in task_description:
            requires_gpu = True
            gpu_memory_gb = 8.0
            min_memory_gb = max(min_memory_gb, 8.0)
            recommended_memory_gb = max(recommended_memory_gb, 16.0)
            estimated_duration = 120
        
        if "batch processing" in task_description or "multiple" in task_description:
            gpu_memory_gb *= 2
            estimated_duration *= 2
        
        if "training" in task_description or "fine-tune" in task_description:
            requires_gpu = True
            gpu_memory_gb = max(gpu_memory_gb, 16.0)
            estimated_duration = 3600
        
        return ResourceRequirement(
            min_memory_gb=min_memory_gb,
            recommended_memory_gb=recommended_memory_gb,
            min_cpu_cores=min_cpu_cores,
            recommended_cpu_cores=recommended_cpu_cores,
            requires_gpu=requires_gpu,
            gpu_memory_gb=gpu_memory_gb,
            estimated_duration_seconds=estimated_duration
        )
    
    def cleanup_expired_allocations(self):
        """Clean up expired resource allocations."""
        with self.lock:
            current_time = time.time()
            expired_tasks = [
                task_id for task_id, alloc in self.allocations.items()
                if alloc.expires_at and alloc.expires_at < current_time
            ]
            
            for task_id in expired_tasks:
                self.release_resources(task_id)
                logger.info(f"Cleaned up expired allocation for task {task_id}")
    
    def get_resource_recommendation(self, task_description: str) -> Dict[str, Any]:
        """
        Get resource recommendations for a task.
        
        Args:
            task_description: Description of the task
            
        Returns:
            Dictionary with recommendations and constraints
        """
        requirement = self.estimate_task_requirement(task_description)
        can_allocate, reason = self.can_allocate(requirement)
        
        return {
            "requirement": requirement,
            "can_allocate": can_allocate,
            "reason": reason,
            "system_status": self.get_system_status()
        }


# Convenience function to get resource manager instance
def get_resource_manager() -> ResourceManager:
    """Get the singleton resource manager instance."""
    return ResourceManager()