"""
Self-Building Module for Self-Healing LLM System
Provides self-improvement and learning capabilities.
"""

from .config_manager import (
    ConfigManager,
    ConfigValue,
    ConfigScope,
    get_config_manager
)
from .architecture_searcher import (
    ArchitectureSearcher,
    ArchitectureCandidate,
    SearchStrategy,
    get_architecture_searcher
)
from .training_pipeline import (
    TrainingPipeline,
    TrainingTask,
    TrainingStatus,
    get_training_pipeline
)
from .meta_learning_engine import (
    MetaLearningEngine,
    LearnedPattern,
    PatternType,
    get_meta_learning_engine
)

__all__ = [
    # Configuration Management
    "ConfigManager",
    "ConfigValue",
    "ConfigScope",
    "get_config_manager",
    
    # Architecture Search
    "ArchitectureSearcher",
    "ArchitectureCandidate",
    "SearchStrategy",
    "get_architecture_searcher",
    
    # Training Pipeline
    "TrainingPipeline",
    "TrainingTask",
    "TrainingStatus",
    "get_training_pipeline",
    
    # Meta Learning
    "MetaLearningEngine",
    "LearnedPattern",
    "PatternType",
    "get_meta_learning_engine",
]