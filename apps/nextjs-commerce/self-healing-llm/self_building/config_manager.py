"""
Config Manager Module
Intelligent configuration management with optimization and adaptation.
"""

import logging
import json
import os
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
from pathlib import Path

import yaml

logger = logging.getLogger(__name__)


class ConfigScope(Enum):
    """Scopes of configuration."""
    SYSTEM = "system"
    MODEL = "model"
    HEALING = "healing"
    CHECKPOINT = "checkpoint"
    SELF_BUILDING = "self_building"
    CUSTOM = "custom"


@dataclass
class ConfigValue:
    """Represents a configuration value with metadata."""
    key: str
    value: Any
    scope: ConfigScope
    description: str = ""
    data_type: str = "any"
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    allowed_values: Optional[List[Any]] = None
    last_modified: datetime = field(default_factory=datetime.utcnow)
    source: str = "default"  # default, user, optimized, learned
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "key": self.key,
            "value": self.value,
            "scope": self.scope.value,
            "description": self.description,
            "data_type": self.data_type,
            "min_value": self.min_value,
            "max_value": self.max_value,
            "allowed_values": self.allowed_values,
            "last_modified": self.last_modified.isoformat(),
            "source": self.source
        }


class ConfigManager:
    """
    Manages system configuration with intelligent optimization
    and adaptation capabilities.
    """
    
    _instance = None
    _lock = None
    
    def __init__(self, config_dir: Optional[str] = None):
        """
        Initialize the config manager.
        
        Args:
            config_dir: Directory to store configuration files
        """
        if hasattr(self, "_initialized"):
            return
            
        self.config_dir = Path(config_dir) if config_dir else Path("./config")
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        self.configs: Dict[str, ConfigValue] = {}
        self.config_history: List[Dict[str, Any]] = []
        
        # Configuration file paths
        self.main_config_file = self.config_dir / "main_config.yaml"
        self.user_config_file = self.config_dir / "user_config.yaml"
        self.optimized_config_file = self.config_dir / "optimized_config.yaml"
        self.learned_config_file = self.config_dir / "learned_config.yaml"
        
        # Configuration overrides (user > optimized > default)
        self.override_priority = [
            "user",
            "optimized",
            "learned",
            "default"
        ]
        
        logger.info(f"ConfigManager initialized with directory: {self.config_dir}")
        
        # Load default configurations
        self._load_default_configs()
    
    def _load_default_configs(self):
        """Load default system configurations."""
        # System configurations
        default_system_configs = {
            "system.memory_limit_gb": {
                "value": 32.0,
                "scope": ConfigScope.SYSTEM,
                "description": "Maximum memory limit in GB",
                "data_type": "float",
                "min_value": 4.0,
                "max_value": 128.0
            },
            "system.cpu_cores": {
                "value": 8,
                "scope": ConfigScope.SYSTEM,
                "description": "Number of CPU cores to use",
                "data_type": "int",
                "min_value": 1,
                "max_value": 64
            },
            "system.log_level": {
                "value": "INFO",
                "scope": ConfigScope.SYSTEM,
                "description": "Logging level",
                "data_type": "str",
                "allowed_values": ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
            }
        }
        
        # Model configurations
        default_model_configs = {
            "model.temperature": {
                "value": 0.7,
                "scope": ConfigScope.MODEL,
                "description": "Temperature for text generation",
                "data_type": "float",
                "min_value": 0.0,
                "max_value": 2.0
            },
            "model.max_tokens": {
                "value": 2048,
                "scope": ConfigScope.MODEL,
                "description": "Maximum tokens to generate",
                "data_type": "int",
                "min_value": 1,
                "max_value": 4096
            },
            "model.top_p": {
                "value": 0.9,
                "scope": ConfigScope.MODEL,
                "description": "Top-p sampling parameter",
                "data_type": "float",
                "min_value": 0.0,
                "max_value": 1.0
            }
        }
        
        # Healing configurations
        default_healing_configs = {
            "healing.auto_healing_enabled": {
                "value": True,
                "scope": ConfigScope.HEALING,
                "description": "Enable automatic healing",
                "data_type": "bool"
            },
            "healing.auto_remediate_threshold": {
                "value": "WARNING",
                "scope": ConfigScope.HEALING,
                "description": "Auto-remediate faults at or below this severity",
                "data_type": "str",
                "allowed_values": ["INFO", "WARNING", "ERROR"]
            },
            "healing.max_retries": {
                "value": 3,
                "scope": ConfigScope.HEALING,
                "description": "Maximum retries for remediation",
                "data_type": "int",
                "min_value": 1,
                "max_value": 10
            }
        }
        
        # Checkpoint configurations
        default_checkpoint_configs = {
            "checkpoint.max_checkpoints": {
                "value": 10,
                "scope": ConfigScope.CHECKPOINT,
                "description": "Maximum number of checkpoints to retain",
                "data_type": "int",
                "min_value": 1,
                "max_value": 50
            },
            "checkpoint.retention_hours": {
                "value": 24,
                "scope": ConfigScope.CHECKPOINT,
                "description": "Checkpoint retention period in hours",
                "data_type": "int",
                "min_value": 1,
                "max_value": 168
            },
            "checkpoint.auto_checkpoint_enabled": {
                "value": True,
                "scope": ConfigScope.CHECKPOINT,
                "description": "Enable automatic checkpointing",
                "data_type": "bool"
            }
        }
        
        # Combine all default configs
        all_defaults = {
            **default_system_configs,
            **default_model_configs,
            **default_healing_configs,
            **default_checkpoint_configs
        }
        
        # Register configs
        for key, config_data in all_defaults.items():
            self.register_config(key, **config_data)
        
        logger.info("Loaded default configurations")
    
    def register_config(
        self,
        key: str,
        value: Any,
        scope: ConfigScope = ConfigScope.CUSTOM,
        description: str = "",
        data_type: str = "any",
        min_value: Optional[float] = None,
        max_value: Optional[float] = None,
        allowed_values: Optional[List[Any]] = None,
        source: str = "default"
    ):
        """
        Register a configuration value.
        
        Args:
            key: Configuration key (e.g., "system.memory_limit_gb")
            value: Configuration value
            scope: Configuration scope
            description: Description of the configuration
            data_type: Type of the configuration value
            min_value: Minimum allowed value (for numeric types)
            max_value: Maximum allowed value (for numeric types)
            allowed_values: List of allowed values (for enum-like types)
            source: Source of the configuration
        """
        config_value = ConfigValue(
            key=key,
            value=value,
            scope=scope,
            description=description,
            data_type=data_type,
            min_value=min_value,
            max_value=max_value,
            allowed_values=allowed_values,
            source=source
        )
        
        self.configs[key] = config_value
        logger.debug(f"Registered config: {key} = {value} (scope: {scope.value})")
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get a configuration value.
        
        Args:
            key: Configuration key
            default: Default value if key not found
            
        Returns:
            Configuration value or default
        """
        return self.configs.get(key, ConfigValue(
            key=key,
            value=default,
            scope=ConfigScope.CUSTOM,
            source="default"
        )).value
    
    def set(
        self,
        key: str,
        value: Any,
        source: str = "user",
        record_change: bool = True
    ) -> bool:
        """
        Set a configuration value.
        
        Args:
            key: Configuration key
            value: New value
            source: Source of the configuration
            record_change: Whether to record this change in history
            
        Returns:
            True if set successfully
        """
        if key not in self.configs:
            logger.warning(f"Config key not found: {key}")
            return False
        
        config = self.configs[key]
        
        # Validate value
        if not self._validate_value(config, value):
            logger.error(f"Invalid value for config {key}: {value}")
            return False
        
        # Record change if requested
        if record_change:
            self.config_history.append({
                "key": key,
                "old_value": config.value,
                "new_value": value,
                "timestamp": datetime.utcnow().isoformat(),
                "source": source
            })
        
        # Update configuration
        config.value = value
        config.last_modified = datetime.utcnow()
        config.source = source
        
        logger.info(f"Updated config {key} = {value} (source: {source})")
        return True
    
    def _validate_value(self, config: ConfigValue, value: Any) -> bool:
        """
        Validate a configuration value.
        
        Args:
            config: Configuration definition
            value: Value to validate
            
        Returns:
            True if value is valid
        """
        # Type checking
        if config.data_type == "int":
            if not isinstance(value, int):
                try:
                    value = int(value)
                except (ValueError, TypeError):
                    return False
        elif config.data_type == "float":
            if not isinstance(value, (int, float)):
                try:
                    value = float(value)
                except (ValueError, TypeError):
                    return False
        elif config.data_type == "bool":
            if not isinstance(value, bool):
                if isinstance(value, str):
                    return value.lower() in ("true", "false", "1", "0")
                return False
        elif config.data_type == "str":
            if not isinstance(value, str):
                return False
        
        # Range checking
        if config.min_value is not None and value < config.min_value:
            return False
        if config.max_value is not None and value > config.max_value:
            return False
        
        # Allowed values checking
        if config.allowed_values is not None and value not in config.allowed_values:
            return False
        
        return True
    
    def get_all(self, scope: Optional[ConfigScope] = None) -> Dict[str, Any]:
        """
        Get all configuration values, optionally filtered by scope.
        
        Args:
            scope: Optional scope filter
            
        Returns:
            Dictionary of configuration values
        """
        if scope:
            return {
                key: config.value
                for key, config in self.configs.items()
                if config.scope == scope
            }
        else:
            return {
                key: config.value
                for key, config in self.configs.items()
            }
    
    def get_configs_by_scope(self, scope: ConfigScope) -> Dict[str, ConfigValue]:
        """
        Get all configuration definitions for a scope.
        
        Args:
            scope: Configuration scope
            
        Returns:
            Dictionary of configuration definitions
        """
        return {
            key: config
            for key, config in self.configs.items()
            if config.scope == scope
        }
    
    def optimize_config(self, performance_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize configurations based on performance metrics.
        
        Args:
            performance_metrics: Dictionary of performance metrics
            
        Returns:
            Dictionary of recommended configuration changes
        """
        recommendations = {}
        
        # Simple optimization rules (can be enhanced with ML)
        if "memory_usage_percent" in performance_metrics:
            memory_usage = performance_metrics["memory_usage_percent"]
            if memory_usage > 80:
                current_limit = self.get("system.memory_limit_gb", 32.0)
                recommendations["system.memory_limit_gb"] = current_limit * 1.5
        
        if "latency_ms" in performance_metrics:
            latency = performance_metrics["latency_ms"]
            if latency > 1000:
                # Reduce max tokens to improve speed
                current_max_tokens = self.get("model.max_tokens", 2048)
                recommendations["model.max_tokens"] = max(512, int(current_max_tokens * 0.7))
        
        if "error_rate" in performance_metrics:
            error_rate = performance_metrics["error_rate"]
            if error_rate > 0.05:
                # Enable auto-healing if not already enabled
                if not self.get("healing.auto_healing_enabled", False):
                    recommendations["healing.auto_healing_enabled"] = True
        
        logger.info(f"Generated {len(recommendations)} configuration optimization recommendations")
        
        return recommendations
    
    def apply_optimized_configs(self, recommendations: Dict[str, Any]):
        """
        Apply optimized configuration recommendations.
        
        Args:
            recommendations: Dictionary of configuration changes
        """
        for key, value in recommendations.items():
            if self.set(key, value, source="optimized"):
                logger.info(f"Applied optimized config: {key} = {value}")
    
    def save_config(self, file_path: Optional[Path] = None):
        """
        Save current configuration to file.
        
        Args:
            file_path: Optional file path (defaults to main config file)
        """
        file_path = file_path or self.main_config_file
        
        config_data = {
            key: config.to_dict()
            for key, config in self.configs.items()
        }
        
        with open(file_path, 'w') as f:
            yaml.dump(config_data, f, default_flow_style=False)
        
        logger.info(f"Saved configuration to {file_path}")
    
    def load_config(self, file_path: Optional[Path] = None):
        """
        Load configuration from file.
        
        Args:
            file_path: Optional file path (defaults to main config file)
        """
        file_path = file_path or self.main_config_file
        
        if not file_path.exists():
            logger.warning(f"Config file not found: {file_path}")
            return
        
        with open(file_path, 'r') as f:
            config_data = yaml.safe_load(f) or {}
        
        for key, data in config_data.items():
            # Only set if config exists
            if key in self.configs:
                self.set(key, data["value"], source=data.get("source", "user"))
        
        logger.info(f"Loaded configuration from {file_path}")
    
    def get_config_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get configuration change history.
        
        Args:
            limit: Maximum number of changes to return
            
        Returns:
            List of configuration changes
        """
        return self.config_history[-limit:]
    
    def export_configs(self, scope: Optional[ConfigScope] = None) -> str:
        """
        Export configurations as JSON string.
        
        Args:
            scope: Optional scope filter
            
        Returns:
            JSON string of configurations
        """
        configs_dict = self.get_all(scope)
        return json.dumps(configs_dict, indent=2, default=str)


# Convenience function to get config manager instance
def get_config_manager(config_dir: Optional[str] = None) -> ConfigManager:
    """Get a ConfigManager instance."""
    return ConfigManager(config_dir)