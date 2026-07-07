"""
Meta Learning Engine Module
Learns from experience to improve system performance over time.
"""

import logging
import json
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import statistics
from pathlib import Path

logger = logging.getLogger(__name__)


class PatternType(Enum):
    """Types of patterns that can be learned."""
    FAULT_PATTERN = "fault_pattern"
    PERFORMANCE_PATTERN = "performance_pattern"
    REMEDIATION_PATTERN = "remediation_pattern"
    CONFIGURATION_PATTERN = "configuration_pattern"
    USAGE_PATTERN = "usage_pattern"


@dataclass
class LearnedPattern:
    """Represents a learned pattern."""
    pattern_id: str
    pattern_type: PatternType
    description: str
    confidence: float
    frequency: int
    last_seen: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "pattern_id": self.pattern_id,
            "pattern_type": self.pattern_type.value,
            "description": self.description,
            "confidence": self.confidence,
            "frequency": self.frequency,
            "last_seen": self.last_seen.isoformat(),
            "metadata": self.metadata
        }


class MetaLearningEngine:
    """
    Learns from experience to improve system performance over time.
    Identifies patterns, makes predictions, and provides recommendations.
    """
    
    def __init__(self, data_dir: Optional[str] = None):
        """
        Initialize the meta learning engine.
        
        Args:
            data_dir: Directory to store learned patterns
        """
        self.data_dir = Path(data_dir) if data_dir else Path("./learned_patterns")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.learned_patterns: Dict[str, LearnedPattern] = {}
        self.pattern_history: List[LearnedPattern] = []
        
        # Learning configuration
        self.confidence_threshold = 0.7
        self.pattern_min_frequency = 3
        self.learning_enabled = True
        
        # Statistics
        self.stats = {
            "total_patterns_learned": 0,
            "patterns_by_type": {pt.value: 0 for pt in PatternType},
            "predictions_made": 0,
            "prediction_accuracy": 0.0
        }
        
        logger.info(f"MetaLearningEngine initialized with directory: {self.data_dir}")
    
    def _generate_pattern_id(self, pattern_type: PatternType) -> str:
        """Generate a unique pattern ID."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        import hashlib
        hash_suffix = hashlib.md5(str(timestamp).encode()).hexdigest()[:6]
        return f"PATTERN-{pattern_type.value}-{hash_suffix}"
    
    def learn_from_fault(self, fault_data: Dict[str, Any]):
        """
        Learn from a fault occurrence.
        
        Args:
            fault_data: Dictionary containing fault information
        """
        # Extract features
        category = fault_data.get("category", "unknown")
        component = fault_data.get("component", "unknown")
        severity = fault_data.get("severity", "unknown")
        
        # Create pattern key
        pattern_key = f"{category}_{component}_{severity}"
        
        # Update or create pattern
        if pattern_key in self.learned_patterns:
            pattern = self.learned_patterns[pattern_key]
            pattern.frequency += 1
            pattern.last_seen = datetime.utcnow()
            
            # Update confidence based on frequency
            pattern.confidence = min(0.95, pattern.confidence + 0.05)
        else:
            pattern = LearnedPattern(
                pattern_id=self._generate_pattern_id(PatternType.FAULT_PATTERN),
                pattern_type=PatternType.FAULT_PATTERN,
                description=f"Recurring fault: {category} in {component} with {severity} severity",
                confidence=0.5,
                frequency=1,
                last_seen=datetime.utcnow(),
                metadata={
                    "category": category,
                    "component": component,
                    "severity": severity
                }
            )
            self.learned_patterns[pattern_key] = pattern
            self.stats["total_patterns_learned"] += 1
            self.stats["patterns_by_type"][PatternType.FAULT_PATTERN.value] += 1
        
        logger.debug(f"Learned fault pattern: {pattern_key}")
    
    def learn_from_performance(self, performance_data: Dict[str, Any]):
        """
        Learn from performance metrics.
        
        Args:
            performance_data: Dictionary containing performance information
        """
        # Extract features
        latency = performance_data.get("latency_ms", 0)
        memory_usage = performance_data.get("memory_usage_percent", 0)
        cpu_usage = performance_data.get("cpu_usage_percent", 0)
        
        # Categorize performance
        if latency > 5000 or memory_usage > 90 or cpu_usage > 90:
            performance_level = "poor"
        elif latency > 2000 or memory_usage > 70 or cpu_usage > 70:
            performance_level = "moderate"
        else:
            performance_level = "good"
        
        # Create pattern key
        pattern_key = f"performance_{performance_level}"
        
        # Update or create pattern
        if pattern_key in self.learned_patterns:
            pattern = self.learned_patterns[pattern_key]
            pattern.frequency += 1
            pattern.last_seen = datetime.utcnow()
            pattern.confidence = min(0.95, pattern.confidence + 0.05)
        else:
            pattern = LearnedPattern(
                pattern_id=self._generate_pattern_id(PatternType.PERFORMANCE_PATTERN),
                pattern_type=PatternType.PERFORMANCE_PATTERN,
                description=f"Performance pattern: {performance_level}",
                confidence=0.6,
                frequency=1,
                last_seen=datetime.utcnow(),
                metadata={
                    "performance_level": performance_level,
                    "avg_latency": latency,
                    "avg_memory": memory_usage,
                    "avg_cpu": cpu_usage
                }
            )
            self.learned_patterns[pattern_key] = pattern
            self.stats["total_patterns_learned"] += 1
            self.stats["patterns_by_type"][PatternType.PERFORMANCE_PATTERN.value] += 1
        
        logger.debug(f"Learned performance pattern: {pattern_key}")
    
    def learn_from_remediation(self, remediation_data: Dict[str, Any]):
        """
        Learn from remediation outcomes.
        
        Args:
            remediation_data: Dictionary containing remediation information
        """
        # Extract features
        strategy = remediation_data.get("strategy", "unknown")
        success = remediation_data.get("success", False)
        fault_type = remediation_data.get("fault_type", "unknown")
        
        if not success:
            return  # Only learn from successful remediations
        
        # Create pattern key
        pattern_key = f"remediation_{strategy}_{fault_type}"
        
        # Update or create pattern
        if pattern_key in self.learned_patterns:
            pattern = self.learned_patterns[pattern_key]
            pattern.frequency += 1
            pattern.last_seen = datetime.utcnow()
            pattern.confidence = min(0.98, pattern.confidence + 0.1)
        else:
            pattern = LearnedPattern(
                pattern_id=self._generate_pattern_id(PatternType.REMEDIATION_PATTERN),
                pattern_type=PatternType.REMEDIATION_PATTERN,
                description=f"Successful remediation: {strategy} for {fault_type}",
                confidence=0.7,
                frequency=1,
                last_seen=datetime.utcnow(),
                metadata={
                    "strategy": strategy,
                    "fault_type": fault_type,
                    "success_rate": 1.0
                }
            )
            self.learned_patterns[pattern_key] = pattern
            self.stats["total_patterns_learned"] += 1
            self.stats["patterns_by_type"][PatternType.REMEDIATION_PATTERN.value] += 1
        
        logger.debug(f"Learned remediation pattern: {pattern_key}")
    
    def predict_fault_probability(self, fault_data: Dict[str, Any]) -> float:
        """
        Predict the probability of a fault occurring.
        
        Args:
            fault_data: Dictionary containing fault information
            
        Returns:
            Probability (0.0 to 1.0)
        """
        category = fault_data.get("category", "unknown")
        component = fault_data.get("component", "unknown")
        severity = fault_data.get("severity", "unknown")
        
        pattern_key = f"{category}_{component}_{severity}"
        
        if pattern_key not in self.learned_patterns:
            return 0.05  # Default low probability
        
        pattern = self.learned_patterns[pattern_key]
        
        # Base probability on pattern confidence and frequency
        base_probability = pattern.confidence * 0.3
        
        # Adjust based on frequency (more frequent = higher probability)
        frequency_factor = min(1.0, pattern.frequency / 10.0)
        
        probability = base_probability * (1.0 + frequency_factor)
        
        self.stats["predictions_made"] += 1
        
        return min(0.95, probability)
    
    def recommend_remediation(self, fault_data: Dict[str, Any]) -> Optional[str]:
        """
        Recommend a remediation strategy based on learned patterns.
        
        Args:
            fault_data: Dictionary containing fault information
            
        Returns:
            Recommended strategy or None
        """
        fault_type = fault_data.get("component", "unknown")
        
        # Find successful remediation patterns for this fault type
        matching_patterns = [
            p for p in self.learned_patterns.values()
            if (p.pattern_type == PatternType.REMEDIATION_PATTERN and
                "fault_type" in p.metadata and
                p.metadata["fault_type"] == fault_type and
                p.confidence >= self.confidence_threshold)
        ]
        
        if not matching_patterns:
            return None
        
        # Sort by confidence and frequency
        matching_patterns.sort(
            key=lambda x: (x.confidence, x.frequency),
            reverse=True
        )
        
        best_pattern = matching_patterns[0]
        
        return best_pattern.metadata.get("strategy")
    
    def get_recommendations(self) -> List[Dict[str, Any]]:
        """
        Get system improvement recommendations based on learned patterns.
        
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Analyze fault patterns
        fault_patterns = [
            p for p in self.learned_patterns.values()
            if p.pattern_type == PatternType.FAULT_PATTERN and
            p.confidence >= self.confidence_threshold and
            p.frequency >= self.pattern_min_frequency
        ]
        
        for pattern in fault_patterns:
            if pattern.confidence > 0.8:
                recommendations.append({
                    "type": "fault_prevention",
                    "priority": "high",
                    "description": f"High-confidence fault pattern detected: {pattern.description}",
                    "action": f"Investigate {pattern.metadata.get('component')} component",
                    "confidence": pattern.confidence
                })
        
        # Analyze performance patterns
        performance_patterns = [
            p for p in self.learned_patterns.values()
            if p.pattern_type == PatternType.PERFORMANCE_PATTERN and
            p.metadata.get("performance_level") == "poor" and
            p.confidence >= self.confidence_threshold
        ]
        
        if performance_patterns:
            recommendations.append({
                "type": "performance_optimization",
                "priority": "medium",
                "description": "Poor performance patterns detected",
                "action": "Review resource allocation and optimization strategies",
                "confidence": statistics.mean([p.confidence for p in performance_patterns])
            })
        
        return recommendations
    
    def get_learned_patterns(
        self,
        pattern_type: Optional[PatternType] = None,
        min_confidence: float = 0.0,
        min_frequency: int = 0
    ) -> List[LearnedPattern]:
        """
        Get learned patterns with optional filtering.
        
        Args:
            pattern_type: Optional pattern type filter
            min_confidence: Minimum confidence threshold
            min_frequency: Minimum frequency threshold
            
        Returns:
            List of learned patterns
        """
        patterns = list(self.learned_patterns.values())
        
        if pattern_type:
            patterns = [p for p in patterns if p.pattern_type == pattern_type]
        
        patterns = [p for p in patterns if p.confidence >= min_confidence]
        patterns = [p for p in patterns if p.frequency >= min_frequency]
        
        # Sort by confidence and frequency
        patterns.sort(key=lambda x: (x.confidence, x.frequency), reverse=True)
        
        return patterns
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get meta learning statistics.
        
        Returns:
            Dictionary containing statistics
        """
        return {
            "total_patterns_learned": self.stats["total_patterns_learned"],
            "patterns_by_type": self.stats["patterns_by_type"].copy(),
            "predictions_made": self.stats["predictions_made"],
            "prediction_accuracy": self.stats["prediction_accuracy"],
            "confidence_threshold": self.confidence_threshold,
            "learning_enabled": self.learning_enabled,
            "active_patterns": len(self.learned_patterns)
        }
    
    def save_patterns(self, file_path: Optional[Path] = None):
        """Save learned patterns to file."""
        file_path = file_path or self.data_dir / "learned_patterns.json"
        
        patterns_data = {
            pattern_key: pattern.to_dict()
            for pattern_key, pattern in self.learned_patterns.items()
        }
        
        with open(file_path, 'w') as f:
            json.dump(patterns_data, f, indent=2, default=str)
        
        logger.info(f"Saved {len(self.learned_patterns)} patterns to {file_path}")
    
    def load_patterns(self, file_path: Optional[Path] = None):
        """Load learned patterns from file."""
        file_path = file_path or self.data_dir / "learned_patterns.json"
        
        if not file_path.exists():
            logger.warning(f"Patterns file not found: {file_path}")
            return
        
        with open(file_path, 'r') as f:
            patterns_data = json.load(f)
        
        for pattern_key, pattern_dict in patterns_data.items():
            pattern = LearnedPattern(
                pattern_id=pattern_dict["pattern_id"],
                pattern_type=PatternType(pattern_dict["pattern_type"]),
                description=pattern_dict["description"],
                confidence=pattern_dict["confidence"],
                frequency=pattern_dict["frequency"],
                last_seen=datetime.fromisoformat(pattern_dict["last_seen"]),
                metadata=pattern_dict.get("metadata", {})
            )
            self.learned_patterns[pattern_key] = pattern
        
        logger.info(f"Loaded {len(self.learned_patterns)} patterns from {file_path}")