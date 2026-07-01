"""
GOAT Royalty App - Main Application
====================================
FastAPI backend for the GOAT application.
Provides REST API and WebSocket endpoints for all features.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import json
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from .config import config, GOATConfig
from ..agents.orchestrator import GOATOrchestrator

# Frontend path
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="GOAT Royalty App",
    description="All-in-One AI-Powered Royalty, Blockchain, DSP Distribution, Video Editing & Crypto Mining App",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize orchestrator
orchestrator = None


@app.on_event("startup")
async def startup_event():
    """Initialize the orchestrator on startup"""
    global orchestrator
    orchestrator = GOATOrchestrator()
    print("🚀 GOAT Orchestrator initialized")


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"


class TaskRequest(BaseModel):
    task: str
    agent: Optional[str] = None
    thread_id: str = "default"


class ConfigUpdate(BaseModel):
    section: str
    key: str
    value: Any


# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@app.get("/api")
async def api_root():
    """API root endpoint"""
    return {
        "name": config.app_name,
        "version": config.app_version,
        "tagline": config.app_tagline,
        "author": config.app_author,
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "orchestrator": orchestrator is not None,
            "agents": list(orchestrator.workers.keys()) if orchestrator else [],
            "config_loaded": True
        }
    }


@app.get("/status")
async def get_status():
    """Get application status"""
    return {
        "app": {
            "name": config.app_name,
            "version": config.app_version,
            "uptime": "running",
        },
        "agents": {
            "total": len(orchestrator.workers) if orchestrator else 0,
            "available": list(orchestrator.workers.keys()) if orchestrator else []
        },
        "features": {
            "royalty_tracking": True,
            "blockchain_verification": True,
            "dsp_distribution": True,
            "video_editing": True,
            "crypto_mining": True,
            "content_analysis": True
        },
        "models": {
            "orchestrator": config.agents.orchestrator_model,
            "workers": config.agents.worker_model,
            "nvidia_models": 220
        },
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# CHAT & TASK ENDPOINTS
# ============================================================================

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat with the AI orchestrator"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    try:
        result = await orchestrator.execute(request.message, request.thread_id)
        
        # Extract the final response
        messages = result.get("messages", [])
        final_message = messages[-1].content if messages else "No response generated"
        
        return {
            "response": final_message,
            "thread_id": request.thread_id,
            "results": result.get("results", {}),
            "task_history": result.get("task_history", []),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/task")
async def execute_task(request: TaskRequest):
    """Execute a specific task with optional agent selection"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    try:
        if request.agent and request.agent in orchestrator.workers:
            # Execute with specific agent
            worker = orchestrator.workers[request.agent]
            result = await worker.execute(request.task)
            
            return {
                "agent": request.agent,
                "task": request.task,
                "result": result.dict() if hasattr(result, 'dict') else result,
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Let orchestrator handle it
            result = await orchestrator.execute(request.task, request.thread_id)
            
            return {
                "orchestrator": True,
                "task": request.task,
                "results": result.get("results", {}),
                "task_history": result.get("task_history", []),
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# AGENT ENDPOINTS
# ============================================================================

@app.get("/api/agents")
async def list_agents():
    """List all available agents"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    agents = []
    for name, worker in orchestrator.workers.items():
        agents.append({
            "name": name,
            "description": worker.description if hasattr(worker, 'description') else "",
            "tools": [t.__name__ if hasattr(t, '__name__') else str(t) for t in worker.tools] if hasattr(worker, 'tools') else []
        })
    
    return {
        "agents": agents,
        "total": len(agents),
        "orchestrator": {
            "model": config.agents.orchestrator_model,
            "temperature": config.agents.orchestrator_temperature
        }
    }


@app.get("/api/agents/{agent_name}")
async def get_agent_info(agent_name: str):
    """Get information about a specific agent"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    if agent_name not in orchestrator.workers:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    
    worker = orchestrator.workers[agent_name]
    
    return {
        "name": agent_name,
        "description": worker.description if hasattr(worker, 'description') else "",
        "tools": [t.__name__ if hasattr(t, '__name__') else str(t) for t in worker.tools] if hasattr(worker, 'tools') else [],
        "model": config.agents.worker_model
    }


# ============================================================================
# FEATURE ENDPOINTS
# ============================================================================

@app.post("/api/royalty/calculate")
async def calculate_royalty(data: Dict[str, Any]):
    """Calculate royalties"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    streams = data.get("streams", 1000000)
    platform = data.get("platform", "spotify")
    
    result = await orchestrator.workers["royalty_tracker"].execute(
        f"Calculate royalties for {streams} streams on {platform}"
    )
    
    return result.dict() if hasattr(result, 'dict') else result


@app.post("/api/distribution/release")
async def create_release(data: Dict[str, Any]):
    """Create a new release for distribution"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    title = data.get("title", "Untitled")
    artist = data.get("artist", "Unknown")
    
    result = await orchestrator.workers["dsp_distributor"].execute(
        f"Distribute new release '{title}' by {artist} to all platforms"
    )
    
    return result.dict() if hasattr(result, 'dict') else result


@app.post("/api/blockchain/verify")
async def verify_transaction(data: Dict[str, Any]):
    """Verify a blockchain transaction"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    tx_hash = data.get("tx_hash", "")
    
    result = await orchestrator.workers["blockchain_verifier"].execute(
        f"Verify transaction {tx_hash}"
    )
    
    return result.dict() if hasattr(result, 'dict') else result


@app.post("/api/mining/start")
async def start_mining(data: Dict[str, Any]):
    """Start crypto mining"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    coin = data.get("coin", "ETH")
    
    result = await orchestrator.workers["crypto_miner"].execute(
        f"Start mining {coin}"
    )
    
    return result.dict() if hasattr(result, 'dict') else result


@app.post("/api/video/edit")
async def edit_video(data: Dict[str, Any]):
    """Edit video"""
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")
    
    action = data.get("action", "edit")
    
    result = await orchestrator.workers["video_editor"].execute(
        f"{action} video"
    )
    
    return result.dict() if hasattr(result, 'dict') else result


# ============================================================================
# CONFIGURATION ENDPOINTS
# ============================================================================

@app.get("/api/config")
async def get_config():
    """Get current configuration"""
    return {
        "app": {
            "name": config.app_name,
            "version": config.app_version,
        },
        "agents": {
            "orchestrator_model": config.agents.orchestrator_model,
            "worker_model": config.agents.worker_model,
            "memory_enabled": config.agents.memory_enabled,
        },
        "blockchain": {
            "mining_enabled": config.blockchain.mining_enabled,
        },
        "video": {
            "gpu_acceleration": config.video.gpu_acceleration,
        }
    }


@app.post("/api/config")
async def update_config(update: ConfigUpdate):
    """Update configuration"""
    # This would update the config in a real implementation
    return {
        "status": "updated",
        "section": update.section,
        "key": update.key,
        "value": update.value
    }


# ============================================================================
# WEBSOCKET ENDPOINT
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                command = message.get("command", "chat")
                content = message.get("content", "")
                
                if command == "chat":
                    result = await orchestrator.execute(content)
                    response = {
                        "type": "response",
                        "content": result.get("messages", [{}])[-1].content if result.get("messages") else "",
                        "results": result.get("results", {}),
                        "timestamp": datetime.now().isoformat()
                    }
                elif command == "status":
                    response = {
                        "type": "status",
                        "content": await get_status(),
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    response = {
                        "type": "error",
                        "content": f"Unknown command: {command}",
                        "timestamp": datetime.now().isoformat()
                    }
                
                await websocket.send_json(response)
                
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "content": "Invalid JSON message",
                    "timestamp": datetime.now().isoformat()
                })
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")


# ============================================================================
# FRONTEND ROUTES
# ============================================================================

@app.get("/", include_in_schema=False)
async def serve_frontend():
    """Serve the main frontend application"""
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"message": "GOAT Royalty App API - Visit /docs for API documentation"}


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)