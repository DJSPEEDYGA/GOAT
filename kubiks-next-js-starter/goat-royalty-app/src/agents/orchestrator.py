"""
GOAT Orchestrator Agent
=======================
The supreme AI orchestrator using LangGraph state machines.
Manages all specialized worker agents with CrewAI integration.
"""

from typing import TypedDict, Annotated, Sequence, Literal, Any, Dict, List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
import asyncio
from datetime import datetime
import json
import os

# Import GOAT components
from ..core.config import config, NVIDIAConfig


# ============================================================================
# STATE DEFINITIONS
# ============================================================================

class AgentState(TypedDict):
    """Main state for the orchestrator agent"""
    messages: Annotated[Sequence[BaseMessage], "The messages in the conversation"]
    next_agent: str
    current_task: str
    task_history: List[Dict]
    results: Dict[str, Any]
    errors: List[str]
    metadata: Dict[str, Any]


class WorkerResult(BaseModel):
    """Result from a worker agent"""
    agent_name: str
    task: str
    result: Any
    success: bool
    timestamp: str = datetime.now().isoformat()
    metadata: Dict = {}


# ============================================================================
# ORCHESTRATOR CLASS
# ============================================================================

class GOATOrchestrator:
    """
    The Supreme AI Orchestrator for GOAT App
    
    Uses LangGraph for state management and CrewAI for worker agents.
    Implements hierarchical agent architecture with:
    - Supervisor/Manager agent for task decomposition
    - Specialized worker agents for specific domains
    - Memory and learning capabilities
    - Tool calling and API integration
    """
    
    def __init__(self, api_key: str = None):
        self.config = config
        self.api_key = api_key or config.nvidia.api_key or os.getenv("NVIDIA_API_KEY") or os.getenv("OPENAI_API_KEY", "sk-dummy-key-for-initialization")
        
        # Initialize LLM
        self.llm = self._init_llm()
        
        # Initialize worker agents
        self.workers = self._init_workers()
        
        # Build the graph
        self.graph = self._build_graph()
        
        # Memory
        self.memory = MemorySaver()
        self.app = self.graph.compile(checkpointer=self.memory)
    
    def _init_llm(self):
        """Initialize the main LLM using NVIDIA NIM"""
        return ChatOpenAI(
            model=self.config.agents.orchestrator_model,
            temperature=self.config.agents.orchestrator_temperature,
            max_tokens=self.config.agents.orchestrator_max_tokens,
            openai_api_key=self.api_key,
            openai_api_base=self.config.nvidia.base_url,
        )
    
    def _init_workers(self) -> Dict[str, Any]:
        """Initialize all specialized worker agents"""
        from .royalty_agent import RoyaltyAgent
        from .blockchain_agent import BlockchainAgent
        from .distribution_agent import DistributionAgent
        from .video_agent import VideoAgent
        from .mining_agent import MiningAgent
        from .content_agent import ContentAgent
        
        return {
            "royalty_tracker": RoyaltyAgent(),
            "blockchain_verifier": BlockchainAgent(),
            "dsp_distributor": DistributionAgent(),
            "video_editor": VideoAgent(),
            "crypto_miner": MiningAgent(),
            "content_analyzer": ContentAgent(),
        }
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph state machine"""
        
        # Define nodes
        async def supervisor_node(state: AgentState) -> AgentState:
            """Supervisor node - analyzes tasks and delegates to workers"""
            messages = state["messages"]
            current_task = state.get("current_task", "")
            
            # Use LLM to determine next action
            system_prompt = f"""You are the GOAT Orchestrator, the supreme AI manager.
            
            Your role is to:
            1. Analyze user requests and break them into subtasks
            2. Delegate tasks to the appropriate specialized agents
            3. Coordinate multi-agent workflows
            4. Aggregate results and provide comprehensive responses
            
            Available agents:
            - royalty_tracker: Track and calculate royalties across platforms
            - blockchain_verifier: Verify transactions on blockchain ledgers
            - dsp_distributor: Distribute content to Digital Service Providers
            - video_editor: Edit and process video content
            - crypto_miner: Manage cryptocurrency mining operations
            - content_analyzer: Analyze content performance and insights
            
            Current task: {current_task}
            
            Decide which agent(s) to invoke and in what order.
            Return JSON with: {{"next_agent": "agent_name", "reasoning": "why"}}
            """
            
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                *messages
            ])
            
            # Parse response
            try:
                parsed = json.loads(response.content)
                next_agent = parsed.get("next_agent", "end")
            except:
                next_agent = "end"
            
            return {
                **state,
                "next_agent": next_agent,
                "task_history": state.get("task_history", []) + [{
                    "agent": "supervisor",
                    "action": "delegation",
                    "target": next_agent,
                    "timestamp": datetime.now().isoformat()
                }]
            }
        
        async def worker_node(state: AgentState, worker_name: str) -> AgentState:
            """Generic worker node - executes tasks from specific agents"""
            worker = self.workers.get(worker_name)
            if not worker:
                return {
                    **state,
                    "errors": state.get("errors", []) + [f"Worker {worker_name} not found"]
                }
            
            try:
                result = await worker.execute(state["current_task"])
                return {
                    **state,
                    "results": {**state.get("results", {}), worker_name: result},
                    "messages": state["messages"] + [AIMessage(content=str(result))]
                }
            except Exception as e:
                return {
                    **state,
                    "errors": state.get("errors", []) + [f"{worker_name} error: {str(e)}"]
                }
        
        def should_continue(state: AgentState) -> str:
            """Determine if we should continue or end"""
            next_agent = state.get("next_agent", "end")
            if next_agent == "end" or next_agent not in self.workers:
                return "end"
            return next_agent
        
        # Build the graph
        graph = StateGraph(AgentState)
        
        # Add supervisor node
        graph.add_node("supervisor", supervisor_node)
        
        # Add worker nodes
        for worker_name in self.workers:
            graph.add_node(
                worker_name,
                lambda state, name=worker_name: worker_node(state, name)
            )
        
        # Add edges
        graph.set_entry_point("supervisor")
        
        # Conditional edges from supervisor
        graph.add_conditional_edges(
            "supervisor",
            should_continue,
            {**{name: name for name in self.workers}, "end": END}
        )
        
        # All workers return to supervisor
        for worker_name in self.workers:
            graph.add_edge(worker_name, "supervisor")
        
        return graph
    
    async def execute(self, task: str, thread_id: str = "default") -> Dict:
        """Execute a task through the orchestrator"""
        initial_state = {
            "messages": [HumanMessage(content=task)],
            "next_agent": "",
            "current_task": task,
            "task_history": [],
            "results": {},
            "errors": [],
            "metadata": {"thread_id": thread_id}
        }
        
        config = {"configurable": {"thread_id": thread_id}}
        result = await self.app.ainvoke(initial_state, config)
        
        return result
    
    def chat(self, message: str, thread_id: str = "default") -> str:
        """Simple chat interface"""
        result = asyncio.run(self.execute(message, thread_id))
        return result.get("messages", [])[-1].content if result.get("messages") else "No response"


# ============================================================================
# WORKER AGENT BASE CLASS
# ============================================================================

class WorkerAgent:
    """Base class for all worker agents"""
    
    name: str = "base_worker"
    description: str = "Base worker agent"
    tools: List = []
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=config.agents.worker_model,
            temperature=config.agents.worker_temperature,
            max_tokens=config.agents.worker_max_tokens,
            openai_api_key=config.nvidia.api_key,
            openai_api_base=config.nvidia.base_url,
        )
    
    async def execute(self, task: str) -> WorkerResult:
        """Execute a task"""
        raise NotImplementedError("Subclasses must implement execute()")
    
    def get_tools(self) -> List:
        """Get available tools for this agent"""
        return self.tools


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    "GOATOrchestrator",
    "WorkerAgent",
    "AgentState",
    "WorkerResult",
]


if __name__ == "__main__":
    # Test the orchestrator
    orchestrator = GOATOrchestrator()
    print("GOAT Orchestrator initialized successfully")
    print(f"Available workers: {list(orchestrator.workers.keys())}")