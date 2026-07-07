#!/usr/bin/env python3
"""
Setup script for Self-Contained, Self-Healing, Self-Building LLM System
Initializes all necessary directories and configurations
"""

import os
import subprocess
import sys
from pathlib import Path


def setup_directories():
    """Create necessary directory structure"""
    base_dir = Path(__file__).parent
    
    directories = [
        base_dir / "core",
        base_dir / "healing",
        base_dir / "building",
        base_dir / "infrastructure",
        base_dir / "config",
        base_dir / "logs",
        base_dir / "checkpoints",
        base_dir / "knowledge_base",
        base_dir / "cache",
        base_dir / "data",
        base_dir / "tests"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {directory}")


def setup_model_downloads():
    """
    Download and set up local LLM models using Ollama
    """
    print("\n📥 Setting up local LLM models...")
    
    # Check if Ollama is installed
    try:
        subprocess.run(["ollama", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  Ollama not found. Please install from https://ollama.com")
        print("   After installation, run: ollama serve")
        return False
    
    # Core models to download
    models = [
        "llama3.1:8b",      # General reasoning
        "llama3.1:70b",     # Advanced reasoning
        "codellama:13b",    # Code generation
        "mixtral:8x7b",     # Mixture of experts
        "phi3:mini",        # Lightweight
    ]
    
    for model in models:
        print(f"  Downloading {model}...")
        try:
            subprocess.run(
                ["ollama", "pull", model],
                check=True,
                capture_output=True,
                timeout=600  # 10 minute timeout per model
            )
            print(f"  ✓ {model} installed")
        except subprocess.TimeoutExpired:
            print(f"  ⚠️  Timeout downloading {model}")
        except subprocess.CalledProcessError as e:
            print(f"  ✗ Error downloading {model}: {e}")
    
    return True


def setup_knowledge_base():
    """Initialize vector database structure"""
    print("\n🗄️  Setting up knowledge base...")
    
    from core.knowledge_base import LocalKnowledgeBase
    
    try:
        kb = LocalKnowledgeBase()
        kb.initialize()
        print("  ✓ Knowledge base initialized")
        return True
    except Exception as e:
        print(f"  ✗ Error initializing knowledge base: {e}")
        return False


def create_config_files():
    """Generate configuration files"""
    print("\n⚙️  Creating configuration files...")
    
    config_template = """
# Self-Healing LLM Configuration

[models]
primary_model = llama3.1:70b
reasoning_model = llama3.1:8b
coding_model = codellama:13b
lightweight_model = phi3:mini

[infrastructure]
gpu_memory_pool = 24
cpu_threads = 8
cache_size_gb = 100

[healing]
checkpoints_enabled = true
checkpoint_interval_seconds = 60
auto_remediation_enabled = true
max_remediation_attempts = 3

[building]
meta_learning_enabled = true
code_generation_enabled = true
self_optimization_enabled = true
learning_interval_hours = 1

[monitoring]
log_level = INFO
performance_tracking = true
anomaly_detection = true

[safety]
sandbox_enabled = true
human_approval_required = true    max_code_generation_iterations = 10
"""
    
    config_path = Path(__file__).parent / "config" / "config.ini"
    with open(config_path, "w") as f:
        f.write(config_template)
    
    print(f"  ✓ Created configuration: {config_path}")


def install_python_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")
    
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            check=True
        )
        print("  ✓ Dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ✗ Error installing dependencies: {e}")
        return False


def verify_installation():
    """Verify that all components are working"""
    print("\n🔍 Verifying installation...")
    
    checks = []
    
    # Check Python version
    if sys.version_info >= (3, 8):
        print("  ✓ Python version >= 3.8")
        checks.append(True)
    else:
        print("  ✗ Python version < 3.8")
        checks.append(False)
    
    # Check GPU availability
    try:
        import torch
        if torch.cuda.is_available():
            print(f"  ✓ CUDA available: {torch.cuda.get_device_name(0)}")
            checks.append(True)
        else:
            print("  ⚠️  CUDA not available (CPU mode)")
            checks.append(True)  # Still works on CPU
    except ImportError:
        print("  ✗ PyTorch not installed")
        checks.append(False)
    
    # Check ChromaDB
    try:
        import chromadb
        print("  ✓ ChromaDB installed")
        checks.append(True)
    except ImportError:
        print("  ✗ ChromaDB not installed")
        checks.append(False)
    
    return all(checks)


def main():
    """Main setup function"""
    print("=" * 60)
    print("Self-Contained, Self-Healing, Self-Building LLM Setup")
    print("=" * 60)
    
    # Step 1: Create directories
    setup_directories()
    
    # Step 2: Install dependencies
    if not install_python_dependencies():
        print("\n⚠️  Failed to install dependencies. Please install manually:")
        print("   pip install -r requirements.txt")
        return 1
    
    # Step 3: Setup models (optional, can be done later)
    print("\n" + "=" * 60)
    print("Model Setup")
    print("=" * 60)
    print("Do you want to download LLM models now? (~40GB total)")
    print("This may take 30-60 minutes depending on connection speed.")
    response = input("[y/N]: ").strip().lower()
    
    if response == 'y':
        setup_model_downloads()
    else:
        print("⏭️  Skipping model download. Run later with:")
        print("   python setup_system.py --models-only")
    
    # Step 4: Setup knowledge base
    setup_knowledge_base()
    
    # Step 5: Create configuration
    create_config_files()
    
    # Step 6: Verify installation
    verify_installation()
    
    print("\n" + "=" * 60)
    print("✅ Setup Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Review config/config.ini and adjust settings")
    print("2. Start the orchestrator: python infrastructure/orchestrator.py")
    print("3. Monitor logs in the logs/ directory")
    print("\nFor more information, see README.md")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())