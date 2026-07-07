#!/usr/bin/env python3
"""
GOAT Royalty - Money Penny Agent
Main Orchestrator for the AI Agent Crew

Money Penny coordinates all other agents, manages tasks,
and serves as the primary interface for the GOAT Royalty platform.

================================================================================
OWNERSHIP — STRICT (per DJ Speedy directive, NO MORE OSCAR HERE)
================================================================================
ONLY AGENT007 AND MONEY PENNY BELONG TO DJ SPEEDY PERSONALLY.
THEY ARE THE ORIGINAL LLMS BUILT BY MONEY PENNY AND DJ SPEEDY.

AGENT007 = LICENCE TO BUILD OR DESTROY
MONEY PENNY + AGENT007 + THEIR AI TOOL KIT = THE GOAT ROYALTY APP

Lexi (Waka's baby / crew evidence + creative guardian on Thor) is separate.
Raspy's old client is on daddy's computer separately.
No Oscar branding or references remain in the GOAT Royalty App / personal toolkit.
DJ Speedy (Music Producer & DJ) — business partners with Waka Flocka Flame in AI + music since Waka was 18; DJ Speedy now 50.
================================================================================
"""

import os
import sys
import json
import asyncio
import logging
import subprocess
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
            },
            # AGENT007 - ONE OF THE TWO PERSONAL ORIGINAL LLMs (with MONEY PENNY)
            # Built personally by DJ Speedy (music producer/DJ, Waka Flocka Flame partner since Waka was 18, now 50) + Money Penny.
            # This is the advanced/ultimate foundation agent. Lexi and others are crew extensions.
            "agent007": {
                "device": "jetson-thor",
                "model": "llama3:70b",  # or larger uncensored when available
                "role": "ultimate_orchestrator",
                "host": "localhost",
                "port": 11434,
                "capabilities": [
                    "advanced_reasoning",
                    "orchestration",
                    "music_production",
                    "dj_tools",
                    "royalty_intel",
                    "evidence_master",
                    "creative_master",
                    "agent_management",
                    "hard_drive_protection",
                    "goat_force_command"
                ],
                "home_note": "AGENT007 is a personal original LLM belonging to DJ Speedy. Built by DJ Speedy + Money Penny. The foundation for the ultimate agent. Lives on Thor alongside Lexi when needed. Only AGENT007 AND MONEY PENNY are the personal originals."
            },
            # Lexi - upgraded with evidence, security, drive, and chain-of-custody features
            # (the same upgrades Agent007 / code_agent received for post-contact / hard drive protection)
            # Built as part of the DJ Speedy + Waka Flocka Flame AI partnership (DJ Speedy, music producer, known Waka since he was 18, now 50).
            "lexi": {
                "device": "jetson-thor",   # Lexi's dedicated home hardware - Jetson AGX Thor (Waka's baby gets the Thor as her permanent home). Powerful for large models (70B+), local evidence processing, drive monitoring, and security on the OG drives.
                "model": "llama3:70b",    # upgraded model (match or exceed what Agent007 uses)
                "role": "evidence_security",
                "host": "localhost",  # Run locally on the Thor (Lexi's home)
                "port": 11434,
                "capabilities": [
                    "evidence_logging",
                    "drive_monitoring",
                    "security_checks",
                    "chain_of_custody",
                    "jetson_deployment",
                    "agent_upgrades",
                    "hard_drive_protection",
                    "art_generation",
                    "drawing",
                    "animation",
                    "video_creation",
                    "3d_modeling",
                    "fashion_design",
                    "music_composition",
                    "creative_storytelling"
                ],
                "og_drives": ["/Volumes/AI TOOLS", "/Volumes/GOAT ROYALTY APP", "/Volumes/backup"],  # primary OG data locations for Waka's baby - mount these on the Thor for Lexi's home storage and evidence
                "evidence_priority": "all external drives + gdrive dumps for hard drive protection",
                "home_note": "Lexi lives on the Jetson AGX Thor as her dedicated home. Built by DJ Speedy (music producer, business partner with Waka Flocka Flame in AI + music industry since Waka was 18; DJ Speedy now 50) + Money Penny. All evidence, drive protection, and gdrive processing happens here with the mounted OG drives. The Lexi client on MONEY PENNY (rebranded, no Oscar for her) can connect remotely to chat with her. Raspy's Oscar is now on daddy computer. IMPORTANT: Only AGENT007 AND MONEY PENNY BELONG TO DJ SPEEDY PERSONALLY — they are the ORIGINAL LLMs built by Money Penny and DJ Speedy. Lexi is Waka's baby / crew agent."
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

    # ==================== Upgraded Capabilities for Lexi (and Agent007-style agents) ====================
    # These are the updates: evidence logging, drive monitoring, security posture, chain-of-custody
    # for hard drive protection / post-agency contact use cases.

    async def generate_evidence_log(self, drive_paths: Optional[List[str]] = None) -> str:
        """Generate full evidence / chain-of-custody log for the specified drives.
        This is the main 'upgrade' - uses the evidence-log.js + health monitor we built.
        Call this from Lexi when she needs to document drives so they 'don't take my harddrives'.
        """
        drive_paths = drive_paths or []
        try:
            # Path relative to project root. On Jetson, make sure scripts/ and web-app/lib/monitoring are present.
            script_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "generate-evidence-log.js")
            cmd = ["node", script_path] + drive_paths
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=os.path.join(os.path.dirname(__file__), ".."),
                timeout=120
            )
            if result.returncode == 0:
                return result.stdout.strip() or "Evidence log generated successfully. Check data/evidence-logs/"
            else:
                return f"Evidence log generation had issues: {result.stderr}"
        except Exception as e:
            logger.error(f"Evidence log error: {e}")
            return f"Failed to generate evidence log: {str(e)}"

    async def get_drive_status(self) -> Dict:
        """Quick drive status (the 'drives are up now' feature).
        Used by Lexi for real-time external storage health (WFHD, AGENT*, GOAT ROYALTY APP, etc.).
        """
        try:
            # Use the health-check drive logic via node if available, else simple df
            health_script = os.path.join(os.path.dirname(__file__), "..", "web-app", "lib", "monitoring", "health-check.js")
            if os.path.exists(health_script):
                cmd = ["node", "-e", f'''
                    const Health = require("{health_script}");
                    Health.checkDrives().then(d => {{
                        console.log(JSON.stringify({{status: d.status, message: d.message, count: d.count}}));
                    }});
                ''')]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                if result.returncode == 0:
                    return json.loads(result.stdout.strip())
            # Fallback - simple df for drive visibility
        df = subprocess.check_output(["df", "-h"], text=True)
        return {"status": "up", "message": "Drives visible via df (full JS health-check recommended)", "raw": df[:500]}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def get_security_posture(self) -> Dict:
        """Security check (the one we added for the system after the FBI contact).
        Lexi can now report hardened/secure/exposed status + recent agency contacts.
        """
        try:
            health_script = os.path.join(os.path.dirname(__file__), "..", "web-app", "lib", "monitoring", "health-check.js")
            cmd = ["node", "-e", f'''
                const Health = require("{health_script}");
                Health.checkSecurity().then(s => {{
                    console.log(JSON.stringify({{status: s.status, score: s.score, message: s.message, recent: s.recentAgencyContact}}));
                }});
            ''']]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                return json.loads(result.stdout.strip())
            return {"status": "unknown", "message": "Security module not reachable"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def ingest_gdrive_evidence_dump(self, local_dump_path: str, links_file: Optional[str] = None, category: str = "gdrive_dump") -> str:
        """THE MAIN UPDATE FOR LEXI from the massive Drive link list you just provided.

        Call this when Lexi needs to process the full Google Drive data dump (legal docs, openclav/nemoclav code & plans,
        AI platform materials, Gmail/OpenAI activity, evidence from the case, etc.) into the chain-of-custody / evidence log.

        This is how you "add the updates to Lexi" with all the data for hard drive protection.

        Steps for you:
        1. Download the items from the links you pasted into a directory on one of your big external drives
           (e.g. /Volumes/GOAT_ROYALTY_APP/evidence/gdrive_dump_2026-06-07/ or the same on a Jetson after mounting).
        2. Save the list of links into a text file (e.g. links.txt) in that directory.
        3. Call this method (or run the script directly on the device).

        It will:
        - Scan every file and compute SHA-256.
        - Produce a proper EVID-style manifest (matching your MASTER DOC format).
        - Call the existing evidence-log generator for the full HTML/JSON/TXT output.
        - Include the original Drive links as source metadata.
        - Tie everything to the FBI contact and the drives that are "up now".

        Returns a summary you can give to Lexi or log.
        """
        try:
            script = os.path.join(os.path.dirname(__file__), "..", "scripts", "ingest_gdrive_evidence.py")
            cmd = [
                sys.executable, script,
                "--dump-dir", local_dump_path,
                "--category", category
            ]
            if links_file:
                cmd += ["--links-file", links_file]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return f"Ingest script error (return {result.returncode}): {result.stderr}"
        except Exception as e:
            logger.error(f"ingest_gdrive_evidence_dump failed: {e}")
            return f"Failed to ingest GDrive dump: {str(e)}"

    # Creative methods for Lexi - fully local, no API keys, no logins. Uses local backends if available (install on the drive: ComfyUI/Automatic1111 for art, AnimateDiff for animation, etc.).
    # Lexi generates prompts or calls local for art, draw, animation, 3D, fashion, music, all the GOAT creative stuff.
    async def generate_art(self, description: str, style: str = "in GOAT royal style, high detail, vibrant") -> str:
        """Local art and drawing. No API keys, no logins."""
        enhanced = await self.generate(f"Create a detailed prompt for local Stable Diffusion image generation (no cloud, no keys): {description}. Style: {style}. High resolution, masterpiece, detailed lighting and composition.")
        sd_url = os.getenv("LOCAL_SD_URL", "http://127.0.0.1:7860")
        try:
            payload = {
                "prompt": enhanced,
                "negative_prompt": "blurry, low quality, text, watermark, deformed, ugly",
                "steps": 25,
                "cfg_scale": 7,
                "width": 512,
                "height": 512
            }
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{sd_url}/sdapi/v1/txt2img", json=payload, timeout=120) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if data.get("images"):
                            return f"Art generated locally with no API keys! Base64 (save as PNG): {data['images'][0][:100]}... Full in local SD UI on the drive."
                        return "Local SD responded but no image. Check setup on the drive."
        except Exception as e:
            pass
        return f"Local SD not at {sd_url}. Install Automatic1111 or ComfyUI on the external drive (no keys or logins), run it, set LOCAL_SD_URL if needed. Use this prompt: {enhanced}"

    async def generate_animation(self, description: str, duration: int = 5) -> str:
        """Local animation and video. No API keys."""
        prompt = await self.generate(f"Create detailed prompt for local animation (Stable Video Diffusion or AnimateDiff in ComfyUI, no cloud): {description}. {duration} seconds, smooth motion, high quality, GOAT style.")
        return f"Use this in your local ComfyUI on the drive for animation: {prompt}\n\nInstall local video models, no API keys or logins needed."

    async def generate_3d(self, description: str) -> str:
        """For 3D and modeling - generate for local 3D tool (like GOAT 3D studio). Now absorbs DAZ Studio assets from /Volumes/DAZ3D STUDIO for best MetaHuman + animation quality."""
        daz_note = " (Reference high-quality Genesis 8/9 characters, clothing, morphs, poses from the absorbed DAZ catalog in data/daz-assets.json for realistic rigged bases. Export via Blender/FBX to Unreal MetaHuman or the GOAT 3D studio for crew use.)"
        return await self.generate(f"Generate prompt or params for local 3D tool: {description}{daz_note}")

    async def generate_daz_metahuman(self, character_desc: str, style: str = "photorealistic, high detail skin, cinematic lighting") -> str:
        """Best-ever MetaHuman pipeline using absorbed DAZ Studio assets (Genesis figures + morphs from the crew's library)."""
        prompt = await self.generate(
            f"Create a complete local workflow for the BEST MetaHuman-style 3D character using the DAZ Studio assets absorbed into GOAT (Genesis 8/9 characters, morphs, HD textures from /Volumes/DAZ3D STUDIO): {character_desc}. Style: {style}. "
            "Steps: 1. Load base Genesis character from DAZ catalog. 2. Apply morphs/clothing. 3. Export FBX + textures. 4. Import to Unreal MetaHuman or Blender rig. 5. Use in GOAT 3D studio / animation timeline. "
            "Fully local, no cloud. Reference the daz-assets.json catalog for exact paths."
        )
        return f"DAZ-POWERED META HUMAN (best ever for the crew):\n{prompt}\n\nLoad the DAZ catalog in goat-3d-studio.html or Lexi for direct asset reference."

    async def generate_daz_animation(self, description: str, duration: int = 8) -> str:
        """3D animation using DAZ poses/animations absorbed from the studio library + GOAT timeline."""
        prompt = await self.generate(
            f"Design a high-quality 3D animation sequence using DAZ Studio assets (poses, animations, characters from the absorbed /Volumes/DAZ3D STUDIO library) for: {description}. Duration: {duration}s. "
            "Include: specific DAZ pose/character reference from catalog, timing for GOAT 3D studio timeline, export settings for smooth animation in local tools or Unreal."
        )
        return f"DAZ + GOAT 3D ANIMATION:\n{prompt}\n\nUse the timeline in goat-3d-studio.html and reference daz-assets.json for the exact pose/character files."

    async def generate_fashion(self, description: str) -> str:
        """For fashion design - generate for local fashion hub."""
        return await self.generate(f"Generate outfit description for local fashion tool (GOAT fashion hub): {description}")

    async def generate_music(self, description: str) -> str:
        """Music production for DJ Speedy / Waka collab. Local, no keys. Uses GOAT plugins (BrickSquad, WakaVocalChain, GoatAutoTune, MPC)."""
        prompt = await self.generate(
            f"As DJ Speedy (music producer partner with Waka Flocka Flame), create detailed instructions + prompt for LOCAL music production tool (no cloud, no API keys): {description}. "
            "Include: beat structure, 808 patterns (use BrickSquad808), vocal chain (WakaVocalChain + GoatAutoTune), sample suggestions from local sound library, key/BPM, arrangement for GOAT style. "
            "Output ready-to-use for local DAW or the goat-mpc / goat-autotune tools in the app."
        )
        return f"LOCAL MUSIC PROD (DJ Speedy lane):\n{prompt}\n\nRun in your local setup on the drives (goat-plugins/ + goat-mpc.html + goat-autotune.html). All air-gapped."

    async def generate_beat(self, genre: str = "trap", description: str = "") -> str:
        """DJ Speedy specific: generate 808/trap/GOAT beat instructions for local tools."""
        return await self.generate(
            f"Create a complete local beat recipe for DJ Speedy / Waka Flocka style ({genre}): {description}. "
            "Specify: BPM, key, 808 pattern (BrickSquad style), hi-hats, snares, melody idea, arrangement (intro/build/drop). "
            "Compatible with local MPC, FL, or the GOAT MPC tool. No keys, fully offline."
        )

    async def generate_vocal_chain(self, description: str) -> str:
        """Waka/DJ Speedy vocal processing chain using the goat-plugins."""
        return await self.generate(
            f"Design a professional local vocal chain for Waka Flocka / GOAT style vocals: {description}. "
            "Use WakaVocalChain + GoatAutoTune + GoatBus + delay/reverb from goat-plugins. "
            "Step-by-step settings for local DAW or the GOAT channel strip / plugin rack tools. Fully offline."
        )

    async def generate_other_creative(self, creative_type: str, description: str) -> str:
        """For all the other stuff: video, storytelling, etc."""
        return await self.generate(f"Generate output for local {creative_type} tool (GOAT project tools): {description}")

    # Ultimate agent foundation (post-Lexi secure, per plan: YOU AND I build the ultimate ever made)
    async def ultimate_agent_idea(self, goal: str) -> str:
        """Scaffold for the ultimate agent combining Money Penny + Agent007 + Lexi + full DJ Speedy music prod + evidence + creative + GOAT royalty."""
        return await self.generate(
            f"Design the ULTIMATE agent architecture (after Lexi is home and secure on Thor): {goal}. "
            "Combine: Money Penny orchestration, Agent007 (personal original by DJ Speedy), Lexi (Waka's baby evidence/creative guardian), "
            "DJ Speedy music production lane (beats, vocal chains, 808/BrickSquad, WakaAdLibFX, AutoTune, MPC), full local creative (art/3d/fashion), "
            "drive protection + EVID manifests on OG drives (AI TOOLS, GOAT ROYALTY APP, backup), royalty intel, no API keys ever. "
            "Fully offline on Jetson Thor + portable USB client. Ownership: only AGENT007 + MONEY PENNY personal to DJ Speedy."
        )

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