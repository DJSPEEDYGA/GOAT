"""
Checkpoint Manager Module
Handles system state checkpointing and recovery for resilience.
"""

import logging
import os
import pickle
import json
import shutil
import threading
import time
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
from pathlib import Path

logger = logging.getLogger(__name__)


class CheckpointType(Enum):
    """Types of checkpoints."""
    SYSTEM_STATE = "system_state"
    MODEL_STATE = "model_state"
    KNOWLEDGE_BASE = "knowledge_base"
    CONFIGURATION = "configuration"
    CUSTOM = "custom"


class CheckpointStatus(Enum):
    """Status of checkpoints."""
    CREATING = "creating"
    COMPLETED = "completed"
    FAILED = "failed"
    RESTORING = "restoring"
    CORRUPTED = "corrupted"


@dataclass
class Checkpoint:
    """Represents a checkpoint."""
    checkpoint_id: str
    checkpoint_type: CheckpointType
    description: str
    path: str
    created_at: datetime
    status: CheckpointStatus = CheckpointStatus.COMPLETED
    size_bytes: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert checkpoint to dictionary."""
        return {
            "checkpoint_id": self.checkpoint_id,
            "checkpoint_type": self.checkpoint_type.value,
            "description": self.description,
            "path": self.path,
            "created_at": self.created_at.isoformat(),
            "status": self.status.value,
            "size_bytes": self.size_bytes,
            "size_mb": round(self.size_bytes / (1024 * 1024), 2),
            "metadata": self.metadata
        }


class CheckpointManager:
    """
    Manages system state checkpointing and recovery.
    Supports automatic checkpointing, retention policies, and verification.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __init__(self, checkpoint_dir: Optional[str] = None):
        """
        Initialize the checkpoint manager.
        
        Args:
            checkpoint_dir: Directory to store checkpoints
        """
        if hasattr(self, "_initialized"):
            return
            
        self.checkpoint_dir = Path(checkpoint_dir) if checkpoint_dir else Path("./checkpoints")
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        
        self.checkpoints: Dict[str, Checkpoint] = {}
        self.lock = threading.RLock()
        
        # Configuration
        self.max_checkpoints = 10
        self.retention_hours = 24
        self.auto_checkpoint_enabled = True
        self.auto_checkpoint_interval_seconds = 3600  # 1 hour
        self.auto_checkpoint_thread: Optional[threading.Thread] = None
        self.auto_checkpoint_running = False
        
        # State capture callbacks
        self.state_capture_handlers: Dict[CheckpointType, Callable[[], Dict[str, Any]]] = {}
        self.state_restore_handlers: Dict[CheckpointType, Callable[[Dict[str, Any]], None]] = {}
        
        # Statistics
        self.stats = {
            "total_checkpoints_created": 0,
            "total_checkpoints_restored": 0,
            "total_checkpoints_failed": 0,
            "last_checkpoint_time": None
        }
        
        logger.info(f"CheckpointManager initialized with directory: {self.checkpoint_dir}")
    
    def _generate_checkpoint_id(self, checkpoint_type: CheckpointType) -> str:
        """Generate a unique checkpoint ID."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"{checkpoint_type.value}-{timestamp}"
    
    def register_state_handler(
        self, 
        checkpoint_type: CheckpointType,
        capture_handler: Callable[[], Dict[str, Any]],
        restore_handler: Callable[[Dict[str, Any]], None]
    ):
        """
        Register state capture and restore handlers for a checkpoint type.
        
        Args:
            checkpoint_type: Type of checkpoint
            capture_handler: Function to capture state
            restore_handler: Function to restore state
        """
        self.state_capture_handlers[checkpoint_type] = capture_handler
        self.state_restore_handlers[checkpoint_type] = restore_handler
        logger.info(f"Registered state handlers for {checkpoint_type.value}")
    
    def create_checkpoint(
        self,
        checkpoint_type: CheckpointType,
        description: str = "",
        custom_data: Optional[Dict[str, Any]] = None
    ) -> Checkpoint:
        """
        Create a checkpoint.
        
        Args:
            checkpoint_type: Type of checkpoint
            description: Description of the checkpoint
            custom_data: Custom data to store (for CUSTOM type)
            
        Returns:
            Created Checkpoint object
        """
        checkpoint_id = self._generate_checkpoint_id(checkpoint_type)
        checkpoint_path = self.checkpoint_dir / checkpoint_id
        checkpoint_path.mkdir(parents=True, exist_ok=True)
        
        checkpoint = Checkpoint(
            checkpoint_id=checkpoint_id,
            checkpoint_type=checkpoint_type,
            description=description or f"Checkpoint of {checkpoint_type.value}",
            path=str(checkpoint_path),
            created_at=datetime.utcnow(),
            status=CheckpointStatus.CREATING
        )
        
        with self.lock:
            self.checkpoints[checkpoint_id] = checkpoint
        
        logger.info(f"Creating checkpoint {checkpoint_id}")
        
        try:
            # Capture state based on type
            if checkpoint_type == CheckpointType.CUSTOM and custom_data:
                # Store custom data
                data_file = checkpoint_path / "custom_data.json"
                with open(data_file, 'w') as f:
                    json.dump(custom_data, f, indent=2, default=str)
                
                checkpoint.size_bytes = sum(
                    f.stat().st_size for f in checkpoint_path.rglob('*') if f.is_file()
                )
                
            elif checkpoint_type in self.state_capture_handlers:
                # Use registered handler to capture state
                state_data = self.state_capture_handlers[checkpoint_type]()
                
                # Save state data
                state_file = checkpoint_path / "state_data.pkl"
                with open(state_file, 'wb') as f:
                    pickle.dump(state_data, f)
                
                # Also save as JSON for readability
                json_file = checkpoint_path / "state_data.json"
                with open(json_file, 'w') as f:
                    json.dump(state_data, f, indent=2, default=str)
                
                checkpoint.size_bytes = sum(
                    f.stat().st_size for f in checkpoint_path.rglob('*') if f.is_file()
                )
                
                checksum = self._calculate_checksum(checkpoint_path)
                checkpoint.metadata["checksum"] = checksum
            
            else:
                # Create empty checkpoint for registered types without handlers
                logger.warning(f"No handler registered for {checkpoint_type.value}, creating empty checkpoint")
            
            # Save checkpoint metadata
            metadata_file = checkpoint_path / "checkpoint_metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(checkpoint.to_dict(), f, indent=2, default=str)
            
            checkpoint.status = CheckpointStatus.COMPLETED
            self.stats["total_checkpoints_created"] += 1
            self.stats["last_checkpoint_time"] = datetime.utcnow().isoformat()
            
            logger.info(f"Checkpoint {checkpoint_id} created successfully")
            
            # Apply retention policy
            self._apply_retention_policy()
            
            return checkpoint
            
        except Exception as e:
            logger.error(f"Error creating checkpoint {checkpoint_id}: {e}")
            checkpoint.status = CheckpointStatus.FAILED
            self.stats["total_checkpoints_failed"] += 1
            return checkpoint
    
    def restore_checkpoint(self, checkpoint_id: str) -> bool:
        """
        Restore system state from a checkpoint.
        
        Args:
            checkpoint_id: ID of checkpoint to restore
            
        Returns:
            True if restoration was successful
        """
        with self.lock:
            if checkpoint_id not in self.checkpoints:
                logger.error(f"Checkpoint not found: {checkpoint_id}")
                return False
            
            checkpoint = self.checkpoints[checkpoint_id]
        
        # Verify checkpoint exists and is valid
        checkpoint_path = Path(checkpoint.path)
        if not checkpoint_path.exists():
            logger.error(f"Checkpoint path does not exist: {checkpoint_path}")
            return False
        
        logger.info(f"Restoring checkpoint {checkpoint_id}")
        checkpoint.status = CheckpointStatus.RESTORING
        
        try:
            # Verify checksum if available
            if "checksum" in checkpoint.metadata:
                current_checksum = self._calculate_checksum(checkpoint_path)
                if current_checksum != checkpoint.metadata["checksum"]:
                    logger.error(f"Checkpoint {checkpoint_id} is corrupted (checksum mismatch)")
                    checkpoint.status = CheckpointStatus.CORRUPTED
                    return False
            
            # Restore state based on type
            if checkpoint.checkpoint_type in self.state_restore_handlers:
                state_file = checkpoint_path / "state_data.pkl"
                if state_file.exists():
                    with open(state_file, 'rb') as f:
                        state_data = pickle.load(f)
                    
                    # Call restore handler
                    self.state_restore_handlers[checkpoint.checkpoint_type](state_data)
                else:
                    logger.warning(f"No state data found for checkpoint {checkpoint_id}")
            else:
                logger.info(f"No restore handler for {checkpoint.checkpoint_type.value}, restoration completed")
            
            self.stats["total_checkpoints_restored"] += 1
            logger.info(f"Checkpoint {checkpoint_id} restored successfully")
            
            return True
            
        except Exception as e:
            logger.error(f"Error restoring checkpoint {checkpoint_id}: {e}")
            return False
    
    def _calculate_checksum(self, path: Path) -> str:
        """Calculate MD5 checksum of checkpoint directory."""
        import hashlib
        
        hash_md5 = hashlib.md5()
        for file_path in sorted(path.rglob('*')):
            if file_path.is_file() and file_path.name != "checkpoint_metadata.json":
                with open(file_path, 'rb') as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        hash_md5.update(chunk)
        
        return hash_md5.hexdigest()
    
    def _apply_retention_policy(self):
        """Apply retention policy to old checkpoints."""
        with self.lock:
            cutoff_time = datetime.utcnow() - timedelta(hours=self.retention_hours)
            
            # Identify checkpoints to remove
            to_remove = []
            for checkpoint_id, checkpoint in self.checkpoints.items():
                if checkpoint.created_at < cutoff_time:
                    to_remove.append(checkpoint_id)
            
            # Also check max checkpoint limit
            if len(self.checkpoints) > self.max_checkpoints:
                # Sort by creation time and remove oldest beyond limit
                sorted_checkpoints = sorted(
                    self.checkpoints.items(),
                    key=lambda x: x[1].created_at
                )
                excess = len(self.checkpoints) - self.max_checkpoints
                for checkpoint_id, _ in sorted_checkpoints[:excess]:
                    if checkpoint_id not in to_remove:
                        to_remove.append(checkpoint_id)
            
            # Remove old checkpoints
            for checkpoint_id in to_remove:
                try:
                    checkpoint = self.checkpoints[checkpoint_id]
                    checkpoint_path = Path(checkpoint.path)
                    if checkpoint_path.exists():
                        shutil.rmtree(checkpoint_path)
                    del self.checkpoints[checkpoint_id]
                    logger.info(f"Removed old checkpoint {checkpoint_id}")
                except Exception as e:
                    logger.error(f"Error removing checkpoint {checkpoint_id}: {e}")
    
    def list_checkpoints(self, checkpoint_type: Optional[CheckpointType] = None) -> List[Checkpoint]:
        """
        List all checkpoints or filter by type.
        
        Args:
            checkpoint_type: Optional type filter
            
        Returns:
            List of checkpoints
        """
        with self.lock:
            if checkpoint_type:
                return [
                    cp for cp in self.checkpoints.values()
                    if cp.checkpoint_type == checkpoint_type
                ]
            else:
                return list(self.checkpoints.values())
    
    def get_checkpoint(self, checkpoint_id: str) -> Optional[Checkpoint]:
        """
        Get a specific checkpoint.
        
        Returns:
            Checkpoint object if found, None otherwise
        """
        return self.checkpoints.get(checkpoint_id)
    
    def delete_checkpoint(self, checkpoint_id: str) -> bool:
        """
        Delete a checkpoint.
        
        Args:
            checkpoint_id: ID of checkpoint to delete
            
        Returns:
            True if deleted successfully
        """
        with self.lock:
            if checkpoint_id not in self.checkpoints:
                return False
            
            checkpoint = self.checkpoints[checkpoint_id]
            checkpoint_path = Path(checkpoint.path)
            
            try:
                if checkpoint_path.exists():
                    shutil.rmtree(checkpoint_path)
                del self.checkpoints[checkpoint_id]
                logger.info(f"Deleted checkpoint {checkpoint_id}")
                return True
            except Exception as e:
                logger.error(f"Error deleting checkpoint {checkpoint_id}: {e}")
                return False
    
    def start_auto_checkpoint(self):
        """Start automatic periodic checkpointing."""
        if self.auto_checkpoint_running:
            logger.warning("Auto checkpoint already running")
            return
        
        self.auto_checkpoint_running = True
        
        def auto_checkpoint_loop():
            while self.auto_checkpoint_running:
                try:
                    if self.auto_checkpoint_enabled:
                        # Create checkpoint for each registered type
                        for checkpoint_type in self.state_capture_handlers:
                            try:
                                self.create_checkpoint(
                                    checkpoint_type=checkpoint_type,
                                    description=f"Auto checkpoint for {checkpoint_type.value}"
                                )
                            except Exception as e:
                                logger.error(f"Error in auto checkpoint: {e}")
                except Exception as e:
                    logger.error(f"Error in auto checkpoint loop: {e}")
                
                time.sleep(self.auto_checkpoint_interval_seconds)
        
        self.auto_checkpoint_thread = threading.Thread(
            target=auto_checkpoint_loop,
            daemon=True
        )
        self.auto_checkpoint_thread.start()
        
        logger.info(f"Started auto checkpoint (interval: {self.auto_checkpoint_interval_seconds}s)")
    
    def stop_auto_checkpoint(self):
        """Stop automatic periodic checkpointing."""
        self.auto_checkpoint_running = False
        if self.auto_checkpoint_thread:
            self.auto_checkpoint_thread.join(timeout=5.0)
            self.auto_checkpoint_thread = None
        logger.info("Stopped auto checkpoint")
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get checkpoint statistics.
        
        Returns:
            Dictionary containing checkpoint statistics
        """
        with self.lock:
            total_size_bytes = sum(cp.size_bytes for cp in self.checkpoints.values())
            
            return {
                "total_checkpoints": len(self.checkpoints),
                "total_checkpoints_created": self.stats["total_checkpoints_created"],
                "total_checkpoints_restored": self.stats["total_checkpoints_restored"],
                "total_checkpoints_failed": self.stats["total_checkpoints_failed"],
                "total_size_mb": round(total_size_bytes / (1024 * 1024), 2),
                "last_checkpoint_time": self.stats["last_checkpoint_time"],
                "auto_checkpoint_enabled": self.auto_checkpoint_enabled,
                "auto_checkpoint_running": self.auto_checkpoint_running,
                "checkpoints_by_type": {
                    cp_type.value: len([cp for cp in self.checkpoints.values() if cp.checkpoint_type == cp_type])
                    for cp_type in CheckpointType
                }
            }


# Convenience function to get checkpoint manager instance
def get_checkpoint_manager(checkpoint_dir: Optional[str] = None) -> CheckpointManager:
    """Get a CheckpointManager instance."""
    return CheckpointManager(checkpoint_dir)