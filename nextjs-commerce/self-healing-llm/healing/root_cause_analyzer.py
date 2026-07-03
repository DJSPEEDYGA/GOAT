"""
Root Cause Analyzer Module
Uses local LLM to analyze faults and determine root causes.
"""

import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum
from datetime import datetime
import json

from ..core.llm_system import SelfContainedLLM
from .fault_detector import Fault, FaultCategory, FaultSeverity

logger = logging.getLogger(__name__)


class ConfidenceLevel(Enum):
    """Confidence levels for root cause analysis."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class RootCause:
    """Represents a detected root cause."""
    fault_id: str
    root_cause: str
    explanation: str
    confidence: ConfidenceLevel
    related_components: List[str]
    suggested_remediations: List[str]
    prevention_strategies: List[str]
    analysis_timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert root cause to dictionary for serialization."""
        return {
            "fault_id": self.fault_id,
            "root_cause": self.root_cause,
            "explanation": self.explanation,
            "confidence": self.confidence.value,
            "related_components": self.related_components,
            "suggested_remediations": self.suggested_remediations,
            "prevention_strategies": self.prevention_strategies,
            "analysis_timestamp": self.analysis_timestamp.isoformat()
        }


class RootCauseAnalyzer:
    """
    Uses local LLM to analyze faults and determine root causes.
    Implements intelligent RCA with multiple analysis strategies.
    """
    
    def __init__(self, llm: Optional[SelfContainedLLM] = None):
        """
        Initialize the root cause analyzer.
        
        Args:
            llm: Optional LLM instance for analysis
        """
        self.llm = llm or SelfContainedLLM()
        self.analysis_history: Dict[str, RootCause] = {}
        self.lock = None
        logger.info("RootCauseAnalyzer initialized")
    
    def analyze_fault(self, fault: Fault, context: Optional[Dict[str, Any]] = None) -> RootCause:
        """
        Analyze a fault to determine its root cause.
        
        Args:
            fault: The fault to analyze
            context: Optional additional context for analysis
            
        Returns:
            RootCause object with analysis results
        """
        # Build analysis prompt
        analysis_prompt = self._build_analysis_prompt(fault, context)
        
        # Get analysis from LLM
        try:
            response = self.llm.generate(
                prompt=analysis_prompt,
                model_type="reasoning",  # Use reasoning model for deep analysis
                temperature=0.3,  # Lower temperature for more deterministic results
                max_tokens=2000
            )
            
            # Parse the response
            root_cause = self._parse_analysis_response(fault, response)
            
            # Store analysis
            self.analysis_history[fault.fault_id] = root_cause
            
            logger.info(f"Analyzed root cause for fault {fault.fault_id}: {root_cause.root_cause}")
            
            return root_cause
            
        except Exception as e:
            logger.error(f"Error analyzing root cause: {e}")
            # Return fallback analysis
            return self._get_fallback_analysis(fault)
    
    def _build_analysis_prompt(self, fault: Fault, context: Optional[Dict[str, Any]] = None) -> str:
        """Build a prompt for root cause analysis."""
        prompt = f"""You are a Root Cause Analysis expert. Analyze the following fault and determine its root cause.

## Fault Information:
- Fault ID: {fault.fault_id}
- Category: {fault.category.value}
- Severity: {fault.severity.value}
- Component: {fault.component}
- Message: {fault.message}
- Timestamp: {fault.timestamp.isoformat()}

## Details:
{json.dumps(fault.details, indent=2) }

"""
        
        # Add context if provided
        if context:
            prompt += f"\n## Additional Context:\n{json.dumps(context, indent=2)}\n"
        
        prompt += """
## Analysis Instructions:
Please analyze this fault and provide:
1. **Root Cause**: The primary underlying issue that caused this fault
2. **Explanation**: A detailed explanation of how this root cause led to the fault
3. **Confidence**: Your confidence level (HIGH, MEDIUM, or LOW)
4. **Related Components**: List of other components that might be affected
5. **Suggested Remediations**: Specific steps to fix the immediate issue
6. **Prevention Strategies**: Long-term strategies to prevent similar faults

Please format your response as JSON with the following structure:
{
    "root_cause": "Primary root cause description",
    "explanation": "Detailed explanation",
    "confidence": "HIGH/MEDIUM/LOW",
    "related_components": ["component1", "component2"],
    "suggested_remediations": ["remediation1", "remediation2"],
    "prevention_strategies": ["strategy1", "strategy2"]
}
"""
        return prompt
    
    def _parse_analysis_response(self, fault: Fault, response: str) -> RootCause:
        """Parse the LLM response into a RootCause object."""
        try:
            # Try to parse as JSON
            # Extract JSON block if present
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                data = json.loads(json_str)
            else:
                # Fallback: parse text response
                data = self._parse_text_response(response)
            
            # Map confidence string to enum
            confidence_map = {
                "high": ConfidenceLevel.HIGH,
                "medium": ConfidenceLevel.MEDIUM,
                "low": ConfidenceLevel.LOW
            }
            confidence = confidence_map.get(
                data.get("confidence", "medium").lower(),
                ConfidenceLevel.MEDIUM
            )
            
            return RootCause(
                fault_id=fault.fault_id,
                root_cause=data.get("root_cause", "Unknown"),
                explanation=data.get("explanation", ""),
                confidence=confidence,
                related_components=data.get("related_components", []),
                suggested_remediations=data.get("suggested_remediations", []),
                prevention_strategies=data.get("prevention_strategies", []),
                analysis_timestamp=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Error parsing analysis response: {e}")
            return self._get_fallback_analysis(fault)
    
    def _parse_text_response(self, response: str) -> Dict[str, Any]:
        """Parse a non-JSON text response."""
        # Simple parsing fallback
        return {
            "root_cause": "Unable to parse detailed analysis",
            "explanation": response,
            "confidence": "LOW",
            "related_components": [],
            "suggested_remediations": ["Review logs for additional details"],
            "prevention_strategies": []
        }
    
    def _get_fallback_analysis(self, fault: Fault) -> RootCause:
        """Provide a fallback analysis when LLM analysis fails."""
        # Rule-based fallback based on fault category and component
        
        root_cause_map = {
            FaultCategory.INFRASTRUCTURE: {
                "memory": "Insufficient memory allocation or memory leak",
                "cpu": "High CPU load due to intensive computations or process overload",
                "disk": "Disk space exhaustion or disk I/O bottleneck",
                "gpu": "GPU memory exhaustion or GPU resource contention"
            },
            FaultCategory.APPLICATION: {
                "application": "Application logic error or unhandled exception"
            },
            FaultCategory.PERFORMANCE: {
                "system_load": "System under high load, need to scale resources"
            }
        }
        
        category_causes = root_cause_map.get(fault.category, {})
        root_cause = category_causes.get(fault.component, "Unknown root cause")
        
        return RootCause(
            fault_id=fault.fault_id,
            root_cause=root_cause,
            explanation=f"The fault in {fault.component} category {fault.category.value} was detected. Further investigation recommended.",
            confidence=ConfidenceLevel.LOW,
            related_components=[fault.component],
            suggested_remediations=[
                f"Monitor {fault.component} metrics closely",
                "Review system logs for additional details",
                "Consider implementing additional monitoring"
            ],
            prevention_strategies=[
                "Implement proactive monitoring alerts",
                "Set up automated scaling if applicable",
                "Regular health checks"
            ],
            analysis_timestamp=datetime.utcnow()
        )
    
    def batch_analyze_faults(self, faults: List[Fault]) -> Dict[str, RootCause]:
        """
        Analyze multiple faults in batch.
        
        Args:
            faults: List of faults to analyze
            
        Returns:
            Dictionary mapping fault IDs to RootCause objects
        """
        results = {}
        
        for fault in faults:
            try:
                root_cause = self.analyze_fault(fault)
                results[fault.fault_id] = root_cause
                logger.info(f"Analyzed fault {fault.fault_id}")
            except Exception as e:
                logger.error(f"Error analyzing fault {fault.fault_id}: {e}")
                continue
        
        return results
    
    def get_analysis(self, fault_id: str) -> Optional[RootCause]:
        """
        Get a previously performed analysis.
        
        Args:
            fault_id: The fault ID to look up
            
        Returns:
            RootCause object if found, None otherwise
        """
        return self.analysis_history.get(fault_id)
    
    def get_analysis_history(self) -> Dict[str, RootCause]:
        """
        Get all performed analyses.
        
        Returns:
            Dictionary of all analyses
        """
        return self.analysis_history.copy()
    
    def correlate_faults(self, faults: List[Fault]) -> List[Dict[str, Any]]:
        """
        Correlate multiple faults to find related issues.
        
        Args:
            faults: List of faults to correlate
            
        Returns:
            List of correlation results
        """
        if len(faults) < 2:
            return []
        
        # Build correlation prompt
        fault_summaries = []
        for fault in faults:
            fault_summaries.append({
                "id": fault.fault_id,
                "category": fault.category.value,
                "severity": fault.severity.value,
                "component": fault.component,
                "message": fault.message
            })
        
        prompt = f"""Analyze the following faults and identify any correlations or common root causes:

{json.dumps(fault_summaries, indent=2)}

Provide your response as JSON with this structure:
{{
    "correlations": [
        {{
            "fault_ids": ["fault1", "fault2"],
            "common_root_cause": "Description",
            "correlation_confidence": "HIGH/MEDIUM/LOW",
            "explanation": "Explanation of the correlation"
        }}
    ]
}}
"""
        
        try:
            response = self.llm.generate(
                prompt=prompt,
                model_type="reasoning",
                temperature=0.5,
                max_tokens=1500
            )
            
            # Parse response
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                data = json.loads(json_str)
                return data.get("correlations", [])
            
            return []
            
        except Exception as e:
            logger.error(f"Error correlating faults: {e}")
            return []