"""
Core Module for Self-Healing LLM System
Provides foundational components for the self-contained LLM architecture.
"""

from .llm_system import SelfContainedLLM, ModelConfig
from .knowledge_base import LocalKnowledgeBase
from .resource_manager import (
    ResourceManager, 
    ResourceType, 
    ResourceRequirement, 
    ResourceAllocation,
    get_resource_manager
)

__all__ = [
    # LLM System
    "SelfContainedLLM",
    "ModelConfig",
    
    # Knowledge Base
    "LocalKnowledgeBase",
    
    # Resource Management
    "ResourceManager",
    "ResourceType",
    "ResourceRequirement",
    "ResourceAllocation",
    "get_resource_manager",
]