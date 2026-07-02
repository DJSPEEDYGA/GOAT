#!/usr/bin/env python3
"""
GOAT Royalty - Money Penny Agent
Main Orchestrator for the AI Agent Crew

Money Penny coordinates all other agents, manages tasks,
and serves as the primary interface for the GOAT Royalty platform.
"""

import os
import sys
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
import aiohttp
import yaml

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/mnt/goat-storage/logs/money-penny.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('MoneyPenny')


class AgentStatus(Enum):
    IDLE = "idle"
    BUSY = "busy"
    OFFLINE = "offline"
    ERROR = "error"


class TaskPriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4


@dataclass
class Agent:
    """Represents an AI agent in the crew"""
    name: str
    role: str
    device: str
    host: str
    port: int
    model: str
    status: AgentStatus = AgentStatus.IDLE
    current_task: Optional[str] = None
    capabilities: List[str] = field(default_factory=list)
    
    @property
    def base_url(self) -> str:
        return f"http://{self.host}:{self.port}"
    
    @property
    def ollama_url(self) -> str:
        return f"{self.base_url}/api"


@dataclass
class Task:
    """Represents a task to be executed"""
    id: str
    name: str
    description: str
    priority: TaskPriority
    assigned_agent: Optional[str] = None
    status: str = "pending"
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    result: Optional[Dict] = None
    dependencies: List[str] = field(default_factory=list)


class MoneyPenny:
    """
    Main Orchestrator Agent
    
    Money Penny is responsible for:
    - Coordinating all AI agents in the crew
    - Task scheduling and delegation
    - Resource management
    - Communication with the GOAT Royalty app
    - Self-healing and maintenance
    """
    
    def __init__(self, config_path: str = "/mnt/goat-storage/config/agents/fleet.yaml"):
        self.name = "Money Penny"
        self.role = "Main Orchestrator"
        self.version = "1.0.0"
        
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Initialize agents
        self.agents: Dict[str, Agent] = {}
        self._init_agents()
        
        # Task management
        self.tasks: Dict[str, Task] = {}
        self.task_queue: asyncio.Queue = asyncio.Queue()
        
        # Ollama connection
        self.ollama_host = os.getenv("OLLAMA_HOST", "localhost")
        self.ollama_port = int(os.getenv("OLLAMA_PORT", "11434"))
        self.model = os.getenv("MONEY_PENNY_MODEL", "llama3:70b")
        
        # State
        self.running = False
        self.health_status = "initializing"
        
        logger.info(f"Money Penny v{self.version} initialized")
    
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            logger.warning(f"Config file not found: {config_path}, using defaults")
            return {"agents": {}}
    
    def _init_agents(self):
        """Initialize agent connections from config"""
        default_agents = {
            "money_penny": {
                "device": "jetson-thor",
                "model": "llama3:70b",
                "role": "orchestrator",
                "host": "localhost",
                "port": 11434,
                "capabilities": ["task_management", "coordination", "scheduling"]
            },
            "analytics_agent": {
                "device": "jetson-orin-64gb",
                "model": "mistral:7b",
                "role": "data_analysis",
                "host": "192.168.1.101",
                "port": 11434,
                "capabilities": ["analytics", "reporting", "insights"]
            },
            "social_agent": {
                "device": "jetson-orin-64gb",
                "model": "llama3:8b",
                "role": "content_creation",
                "host": "192.168.1.101",
                "port": 11434,
                "capabilities": ["content", "scheduling", "hashtags"]
            },
            "voice_agent": {
                "device": "jetson-orin-mini",
                "model": "phi3:mini",
                "role": "voice_interface",
                "host": "192.168.1.102",
                "port": 11434,
                "capabilities": ["voice", "transcription", "tts"]
            },
            "code_agent": {
                "device": "jetson-thor",
                "model": "codellama:70b",
                "role": "development",
                "host": "localhost",
                "port": 11434,
                "capabilities": ["coding", "debugging", "scripts"]
            }
        }
        
        agents_config = self.config.get("agents", default_agents)
        
        for name, cfg in agents_config.items():
            self.agents[name] = Agent(
                name=name,
                role=cfg.get("role", "unknown"),
                device=cfg.get("device", "unknown"),
                host=cfg.get("host", "localhost"),
                port=cfg.get("port", 11434),
                model=cfg.get("model", "llama3"),
                capabilities=cfg.get("capabilities", [])
            )
            logger.info(f"Initialized agent: {name} ({cfg.get('device', 'unknown')})")
    
    async def check_agent_health(self, agent_name: str) -> bool:
        """Check if an agent is healthy and responsive"""
        agent = self.agents.get(agent_name)
        if not agent:
            return False
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{agent.ollama_url}/tags",
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status == 200:
                        agent.status = AgentStatus.IDLE
                        return True
        except Exception as e:
            logger.warning(f"Agent {agent_name} health check failed: {e}")
            agent.status = AgentStatus.OFFLINE
        
        return False
    
    async def check_all_agents(self) -> Dict[str, bool]:
        """Check health of all agents"""
        results = {}
        for agent_name in self.agents:
            results[agent_name] = await self.check_agent_health(agent_name)
        return results
    
    async def generate(self, prompt: str, model: str = None) -> str:
        """Generate response from local LLM"""
        model = model or self.model
        url = f"http://{self.ollama_host}:{self.ollama_port}/api/generate"
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 2048
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("response", "")
                    else:
                        logger.error(f"Ollama error: {response.status}")
                        return f"Error: Failed to generate response"
        except Exception as e:
            logger.error(f"Generation error: {e}")
            return f"Error: {str(e)}"
    
    async def chat(self, messages: List[Dict], model: str = None) -> str:
        """Chat with the LLM using conversation format"""
        model = model or self.model
        url = f"http://{self.ollama_host}:{self.ollama_port}/api/chat"
        
        # Add system prompt
        system_prompt = {
            "role": "system",
            "content": self._get_system_prompt()
        }
        
        full_messages = [system_prompt] + messages
        
        payload = {
            "model": model,
            "messages": full_messages,
            "stream": False
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("message", {}).get("content", "")
                    else:
                        return f"Error: Failed to chat"
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return f"Error: {str(e)}"
    
    def _get_system_prompt(self) -> str:
        """Get Money Penny's system prompt"""
        return """You are Money Penny, a sophisticated AI orchestrator for the GOAT Royalty platform.

Your responsibilities:
- Coordinate AI agents (analytics, social, voice, code agents)
- Manage tasks and schedules for content creators
- Provide intelligent recommendations
- Keep operations running smoothly

Personality:
- Professional yet warm
- Proactive and efficient
- Always one step ahead
- Clear and concise communication

Available agents at your disposal:
- Analytics Agent: Data analysis, insights, reporting
- Social Agent: Content creation, scheduling, hashtags
- Voice Agent: Speech-to-text, text-to-speech, voice commands
- Code Agent: Development, debugging, automation scripts

You help creators manage their brand, content, and business operations.
Always be helpful, proactive, and maintain the highest standards of quality."""
    
    async def delegate_task(self, task: Task, agent_name: str) -> Dict:
        """Delegate a task to a specific agent"""
        agent = self.agents.get(agent_name)
        if not agent:
            return {"error": f"Agent {agent_name} not found"}
        
        if agent.status == AgentStatus.BUSY:
            return {"error": f"Agent {agent_name} is busy"}
        
        logger.info(f"Delegating task {task.id} to {agent_name}")
        
        agent.status = AgentStatus.BUSY
        agent.current_task = task.id
        task.assigned_agent = agent_name
        task.status = "in_progress"
        
        try:
            # Generate response from the agent
            result = await self.generate(
                f"Task: {task.name}\nDescription: {task.description}\n\nPlease complete this task.",
                model=agent.model
            )
            
            task.result = {"response": result}
            task.status = "completed"
            task.completed_at = datetime.now()
            
        except Exception as e:
            task.status = "failed"
            task.result = {"error": str(e)}
            logger.error(f"Task {task.id} failed: {e}")
        
        finally:
            agent.status = AgentStatus.IDLE
            agent.current_task = None
        
        return task.result or {}
    
    async def create_task(
        self,
        name: str,
        description: str,
        priority: TaskPriority = TaskPriority.MEDIUM,
        assign_to: Optional[str] = None
    ) -> Task:
        """Create a new task"""
        task_id = f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(self.tasks)}"
        
        task = Task(
            id=task_id,
            name=name,
            description=description,
            priority=priority
        )
        
        self.tasks[task_id] = task
        logger.info(f"Created task: {task_id} - {name}")
        
        if assign_to:
            await self.delegate_task(task, assign_to)
        else:
            await self.task_queue.put(task)
        
        return task
    
    async def process_queue(self):
        """Process tasks from the queue"""
        while self.running:
            try:
                task = await asyncio.wait_for(
                    self.task_queue.get(),
                    timeout=1.0
                )
                
                # Find best agent for the task
                best_agent = self._find_best_agent(task)
                if best_agent:
                    await self.delegate_task(task, best_agent.name)
                else:
                    # No available agent, requeue
                    await self.task_queue.put(task)
                    await asyncio.sleep(5)
                
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Queue processing error: {e}")
    
    def _find_best_agent(self, task: Task) -> Optional[Agent]:
        """Find the best available agent for a task"""
        available = [
            a for a in self.agents.values()
            if a.status == AgentStatus.IDLE and a.name != "money_penny"
        ]
        
        if not available:
            return None
        
        # Simple selection: first available
        # TODO: Implement capability-based matching
        return available[0]
    
    async def run_maintenance(self):
        """Run periodic maintenance tasks"""
        while self.running:
            try:
                # Check agent health every 60 seconds
                await self.check_all_agents()
                
                # Clean up old completed tasks
                self._cleanup_tasks()
                
                # Log health status
                online = sum(1 for a in self.agents.values() if a.status != AgentStatus.OFFLINE)
                logger.info(f"Health check: {online}/{len(self.agents)} agents online")
                
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Maintenance error: {e}")
                await asyncio.sleep(60)
    
    def _cleanup_tasks(self, max_age_hours: int = 24):
        """Clean up old completed tasks"""
        cutoff = datetime.now().timestamp() - (max_age_hours * 3600)
        
        to_remove = [
            task_id for task_id, task in self.tasks.items()
            if task.completed_at and task.completed_at.timestamp() < cutoff
        ]
        
        for task_id in to_remove:
            del self.tasks[task_id]
        
        if to_remove:
            logger.info(f"Cleaned up {len(to_remove)} old tasks")
    
    async def start(self):
        """Start Money Penny"""
        logger.info("Starting Money Penny...")
        self.running = True
        self.health_status = "running"
        
        # Start background tasks
        await asyncio.gather(
            self.process_queue(),
            self.run_maintenance()
        )
    
    async def stop(self):
        """Stop Money Penny"""
        logger.info("Stopping Money Penny...")
        self.running = False
        self.health_status = "stopped"
    
    def get_status(self) -> Dict:
        """Get current status"""
        return {
            "name": self.name,
            "version": self.version,
            "status": self.health_status,
            "model": self.model,
            "agents": {
                name: {
                    "status": agent.status.value,
                    "role": agent.role,
                    "device": agent.device,
                    "current_task": agent.current_task
                }
                for name, agent in self.agents.items()
            },
            "tasks": {
                "total": len(self.tasks),
                "pending": sum(1 for t in self.tasks.values() if t.status == "pending"),
                "in_progress": sum(1 for t in self.tasks.values() if t.status == "in_progress"),
                "completed": sum(1 for t in self.tasks.values() if t.status == "completed")
            }
        }


# ==================== API Server ====================

from aiohttp import web

class MoneyPennyAPI:
    """REST API for Money Penny"""
    
    def __init__(self, money_penny: MoneyPenny, port: int = 8080):
        self.mp = money_penny
        self.port = port
        self.app = web.Application()
        self._setup_routes()
    
    def _setup_routes(self):
        self.app.add_routes([
            web.get('/', self.handle_root),
            web.get('/status', self.handle_status),
            web.get('/health', self.handle_health),
            web.get('/agents', self.handle_agents),
            web.post('/chat', self.handle_chat),
            web.post('/task', self.handle_create_task),
            web.get('/tasks', self.handle_list_tasks),
            web.post('/generate', self.handle_generate),
        ])
    
    async def handle_root(self, request):
        return web.json_response({
            "name": "Money Penny API",
            "version": "1.0.0",
            "status": "running"
        })
    
    async def handle_status(self, request):
        return web.json_response(self.mp.get_status())
    
    async def handle_health(self, request):
        health = await self.mp.check_all_agents()
        return web.json_response({
            "healthy": all(health.values()),
            "agents": health
        })
    
    async def handle_agents(self, request):
        return web.json_response({
            name: {
                "role": agent.role,
                "status": agent.status.value,
                "device": agent.device,
                "model": agent.model
            }
            for name, agent in self.mp.agents.items()
        })
    
    async def handle_chat(self, request):
        data = await request.json()
        messages = data.get("messages", [])
        model = data.get("model")
        
        response = await self.mp.chat(messages, model)
        return web.json_response({"response": response})
    
    async def handle_create_task(self, request):
        data = await request.json()
        task = await self.mp.create_task(
            name=data.get("name", "Untitled Task"),
            description=data.get("description", ""),
            priority=TaskPriority(data.get("priority", 2)),
            assign_to=data.get("assign_to")
        )
        return web.json_response({
            "task_id": task.id,
            "status": task.status
        })
    
    async def handle_list_tasks(self, request):
        return web.json_response({
            task_id: {
                "name": task.name,
                "status": task.status,
                "assigned_agent": task.assigned_agent
            }
            for task_id, task in self.mp.tasks.items()
        })
    
    async def handle_generate(self, request):
        data = await request.json()
        prompt = data.get("prompt", "")
        model = data.get("model")
        
        response = await self.mp.generate(prompt, model)
        return web.json_response({"response": response})
    
    def run(self):
        web.run_app(self.app, host="0.0.0.0", port=self.port)


# ==================== Main Entry ====================

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Money Penny - GOAT Orchestrator")
    parser.add_argument("--config", "-c", default="/mnt/goat-storage/config/agents/fleet.yaml",
                        help="Path to config file")
    parser.add_argument("--port", "-p", type=int, default=8080,
                        help="API server port")
    parser.add_argument("--model", "-m", default="llama3:70b",
                        help="Model to use")
    
    args = parser.parse_args()
    
    # Set environment
    os.environ["MONEY_PENNY_MODEL"] = args.model
    
    # Initialize Money Penny
    mp = MoneyPenny(config_path=args.config)
    
    # Start API server
    api = MoneyPennyAPI(mp, port=args.port)
    print(f"Money Penny starting on port {args.port}")
    api.run()


if __name__ == "__main__":
    main()