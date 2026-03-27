"""
GOAT Royalty App - Configuration Management
==========================================
Central configuration for all app settings, API keys, and model configurations.
No login required - all tools ready to use out of the box.
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from dataclasses import dataclass, field
import yaml
import json

# App Base Paths
APP_DIR = Path(__file__).parent.parent.parent
CONFIG_DIR = APP_DIR / "config"
DATA_DIR = APP_DIR / "data"
CACHE_DIR = APP_DIR / "cache"
MODELS_DIR = APP_DIR / "models"

# Ensure directories exist
for d in [CONFIG_DIR, DATA_DIR, CACHE_DIR, MODELS_DIR]:
    d.mkdir(parents=True, exist_ok=True)


@dataclass
class NVIDIAConfig:
    """NVIDIA NIM API Configuration"""
    base_url: str = "https://integrate.api.nvidia.com/v1"
    api_key: str = os.getenv("NVIDIA_API_KEY", "")
    
    # Available Model Categories
    chat_models: List[str] = field(default_factory=lambda: [
        "meta/llama-3.3-70b-instruct",
        "mistralai/mistral-large",
        "mistralai/mixtral-8x22b-instruct-v0.1",
        "google/gemma-2-27b-it",
        "microsoft/phi-3-medium-128k-instruct",
        "nvidia/nemotron-4-340b-instruct",
        "qwen/qwen2.5-72b-instruct",
        "deepseek-ai/deepseek-r1",
    ])
    
    reasoning_models: List[str] = field(default_factory=lambda: [
        "deepseek-ai/deepseek-r1",
        "nvidia/nemotron-3-super-120b-a12b",
        "qwen/qwen3.5-122b-a10b",
    ])
    
    vision_models: List[str] = field(default_factory=lambda: [
        "google/deplot",
        "microsoft/kosmos-2",
        "nvidia/neva-22b",
    ])
    
    embedding_models: List[str] = field(default_factory=lambda: [
        "nvidia/nv-embedqa-e5-v5",
        "nvidia/llama-nemotron-embed-1b-v2",
    ])
    
    rerank_models: List[str] = field(default_factory=lambda: [
        "nvidia/llama-nemotron-rerank-1b-v2",
    ])


@dataclass
class BlockchainConfig:
    """Blockchain & Crypto Configuration"""
    # Ethereum
    ethereum_rpc_url: str = os.getenv("ETHEREUM_RPC", "https://eth.llamarpc.com")
    ethereum_websocket: str = os.getenv("ETHEREUM_WS", "wss://eth.llamarpc.com")
    
    # Polygon (Lower gas fees)
    polygon_rpc_url: str = os.getenv("POLYGON_RPC", "https://polygon.llamarpc.com")
    
    # Bitcoin
    bitcoin_rpc_url: str = os.getenv("BITCOIN_RPC", "https://blockchain.info")
    
    # Smart Contract Addresses
    royalty_contract_address: str = "0x0000000000000000000000000000000000000000"  # To be deployed
    
    # Mining Configuration
    mining_enabled: bool = True
    mining_pool_url: str = "stratum+tcp://pool.example.com:3333"
    mining_threads: int = 4
    
    # Gas Settings
    max_gas_price_gwei: int = 50
    priority_fee_gwei: int = 2


@dataclass
class DSPConfig:
    """Digital Service Provider Distribution Configuration"""
    # Google Sheets Integration
    google_credentials_path: str = str(CONFIG_DIR / "google_credentials.json")
    dsp_database_sheet_id: str = os.getenv("DSP_SHEET_ID", "")
    
    # Spotify
    spotify_client_id: str = os.getenv("SPOTIFY_CLIENT_ID", "")
    spotify_client_secret: str = os.getenv("SPOTIFY_CLIENT_SECRET", "")
    
    # YouTube
    youtube_api_key: str = os.getenv("YOUTUBE_API_KEY", "")
    youtube_client_id: str = os.getenv("YOUTUBE_CLIENT_ID", "")
    youtube_client_secret: str = os.getenv("YOUTUBE_CLIENT_SECRET", "")
    
    # Supported DSPs
    supported_dsps: List[str] = field(default_factory=lambda: [
        "spotify", "apple_music", "youtube_music", "amazon_music",
        "tidal", "deezer", "soundcloud", "pandora", "iheartradio",
        "napster", "audiomack", "beatport", "vevo", "qobuz",
        "jiosaavn", "gaana", "wynk", "hungama", "kkbox"
    ])


@dataclass
class VideoConfig:
    """Video Editing Configuration"""
    # Output Settings
    default_resolution: tuple = (1920, 1080)
    default_fps: int = 30
    default_codec: str = "libx264"
    default_audio_codec: str = "aac"
    
    # Effects Library
    effects_enabled: bool = True
    transitions_enabled: bool = True
    filters_enabled: bool = True
    
    # AI Features
    auto_caption_enabled: bool = True
    auto_thumbnail_enabled: bool = True
    background_removal_enabled: bool = True
    
    # GPU Acceleration
    gpu_acceleration: bool = True
    gpu_device: str = "auto"  # auto, cuda, metal, opencl


@dataclass
class AgentConfig:
    """AI Agent Configuration - Hierarchical Multi-Agent System"""
    # Orchestrator Settings
    orchestrator_model: str = "nvidia/nemotron-3-super-120b-a12b"
    orchestrator_temperature: float = 0.7
    orchestrator_max_tokens: int = 4096
    
    # Worker Agent Settings
    worker_model: str = "meta/llama-3.3-70b-instruct"
    worker_temperature: float = 0.3
    worker_max_tokens: int = 2048
    
    # Specialized Agent Roles
    agent_roles: List[str] = field(default_factory=lambda: [
        "royalty_tracker",      # Track royalties across platforms
        "blockchain_verifier",  # Verify on-chain transactions
        "dsp_distributor",      # Manage distribution to DSPs
        "video_editor",         # Video editing assistant
        "crypto_miner",         # Manage mining operations
        "content_analyzer",     # Analyze content performance
        "contract_manager",     # Smart contract interactions
        "report_generator",     # Generate reports and insights
        "api_connector",        # External API integrations
        "user_assistant",       # General user assistance
    ])
    
    # Memory Settings
    memory_enabled: bool = True
    memory_type: str = "chromadb"  # chromadb, faiss, sqlite
    memory_persist_dir: str = str(DATA_DIR / "memory")
    
    # Tool Calling
    tools_enabled: bool = True
    max_tool_calls: int = 10
    tool_timeout_seconds: int = 60


@dataclass
class GOATConfig:
    """Main GOAT App Configuration"""
    app_name: str = "GOAT"
    app_version: str = "1.0.0"
    app_author: str = "DJ Speedy"
    app_tagline: str = "IF YOU CAN THINK IT! You CAN DO IT IN THE APP"
    
    # Sub-configurations
    nvidia: NVIDIAConfig = field(default_factory=NVIDIAConfig)
    blockchain: BlockchainConfig = field(default_factory=BlockchainConfig)
    dsp: DSPConfig = field(default_factory=DSPConfig)
    video: VideoConfig = field(default_factory=VideoConfig)
    agents: AgentConfig = field(default_factory=AgentConfig)
    
    # UI Settings
    theme: str = "dark"
    language: str = "en"
    
    # Debug
    debug_mode: bool = True
    log_level: str = "INFO"
    log_file: str = str(DATA_DIR / "logs" / "goat.log")
    
    def save(self, path: Optional[str] = None):
        """Save configuration to YAML file"""
        path = path or str(CONFIG_DIR / "config.yaml")
        config_dict = {
            "app_name": self.app_name,
            "app_version": self.app_version,
            "theme": self.theme,
            "language": self.language,
            "debug_mode": self.debug_mode,
            "log_level": self.log_level,
            "nvidia": {
                "base_url": self.nvidia.base_url,
                "api_key": self.nvidia.api_key,
            },
            "blockchain": {
                "ethereum_rpc_url": self.blockchain.ethereum_rpc_url,
                "mining_enabled": self.blockchain.mining_enabled,
            },
            "dsp": {
                "supported_dsps": self.dsp.supported_dsps,
            },
            "video": {
                "default_resolution": list(self.video.default_resolution),
                "gpu_acceleration": self.video.gpu_acceleration,
            },
            "agents": {
                "orchestrator_model": self.agents.orchestrator_model,
                "worker_model": self.agents.worker_model,
                "memory_enabled": self.agents.memory_enabled,
            },
        }
        
        with open(path, 'w') as f:
            yaml.dump(config_dict, f, default_flow_style=False)
    
    @classmethod
    def load(cls, path: Optional[str] = None) -> "GOATConfig":
        """Load configuration from YAML file"""
        path = path or str(CONFIG_DIR / "config.yaml")
        
        if not os.path.exists(path):
            config = cls()
            config.save(path)
            return config
        
        with open(path, 'r') as f:
            config_dict = yaml.safe_load(f)
        
        config = cls()
        # Apply loaded values
        if config_dict:
            for key, value in config_dict.items():
                if hasattr(config, key):
                    setattr(config, key, value)
        
        return config


# Global configuration instance
config = GOATConfig()


if __name__ == "__main__":
    # Test configuration
    config = GOATConfig()
    config.save()
    print(f"✅ GOAT Configuration initialized")
    print(f"   App: {config.app_name} v{config.app_version}")
    print(f"   NVIDIA Models Available: {len(config.nvidia.chat_models)} chat, {len(config.nvidia.reasoning_models)} reasoning")
    print(f"   Agent Roles: {len(config.agents.agent_roles)}")
    print(f"   Supported DSPs: {len(config.dsp.supported_dsps)}")