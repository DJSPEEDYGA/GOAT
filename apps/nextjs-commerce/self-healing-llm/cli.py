"""
CLI Interface for Self-Healing LLM System
Command-line interface for interacting with the system.
"""

import argparse
import sys
import json
from typing import Optional

from llm_orchestrator import get_orchestrator


def cmd_start(args):
    """Start the LLM system."""
    orchestrator = get_orchestrator()
    orchestrator.start()
    print("✓ LLM system started successfully")
    print("Use 'status' command to check system health")


def cmd_stop(args):
    """Stop the LLM system."""
    orchestrator = get_orchestrator()
    orchestrator.stop()
    print("✓ LLM system stopped successfully")


def cmd_status(args):
    """Show system status."""
    orchestrator = get_orchestrator()
    status = orchestrator.get_system_status()
    
    print("\n" + "="*60)
    print("LLM SYSTEM STATUS")
    print("="*60)
    
    # Overview
    print(f"\n📊 Overview:")
    print(f"  Status: {status['overview']['status'].upper()}")
    print(f"  Running: {status['overview']['running']}")
    print(f"  Health Score: {status['overview']['health_score']:.1f}/100")
    print(f"  Uptime: {status['overview']['uptime_seconds']:.0f} seconds")
    
    # Requests
    health = status['health']
    requests = health['requests']
    print(f"\n📈 Requests:")
    print(f"  Total: {requests['total']}")
    print(f"  Successful: {requests['successful']}")
    print(f"  Failed: {requests['failed']}")
    print(f"  Success Rate: {requests['success_rate']:.1f}%")
    
    # Resources
    resources = health['resources']
    print(f"\n💻 Resources:")
    print(f"  Memory: {resources['memory']['used_percent']:.1f}% used ({resources['memory']['available_gb']:.1f} GB free)")
    print(f"  CPU: {resources['cpu']['usage_percent']:.1f}% used ({resources['cpu']['available_cores']} cores available)")
    print(f"  GPU: {'Available' if resources['gpu']['available'] else 'Not Available'}")
    
    # Healing
    healing = health['healing']
    print(f"\n🔧 Healing:")
    print(f"  Total Events: {healing['total_events']}")
    print(f"  Auto-Remediated: {healing['auto_remediated']}")
    print(f"  Success Rate: {healing['success_rate']:.1f}%")
    print(f"  Active Faults: {status['active_faults']}")
    
    # Learning
    learning = health['learning']
    print(f"\n🧠 Learning:")
    print(f"  Learned Patterns: {status['learned_patterns']}")
    print(f"  Predictions Made: {learning['predictions_made']}")
    
    # Checkpoints
    checkpoints = health['checkpoint']
    print(f"\n💾 Checkpoints:")
    print(f"  Total Checkpoints: {status['checkpoints']}")
    print(f"  Created: {checkpoints['total_checkpoints_created']}")
    print(f"  Restored: {checkpoints['total_checkpoints_restored']}")
    
    print("\n" + "="*60 + "\n")


def cmd_generate(args):
    """Generate text using the LLM."""
    orchestrator = get_orchestrator()
    
    if not args.prompt:
        print("Error: Prompt is required")
        sys.exit(1)
    
    print(f"\n🤔 Generating response for: {args.prompt[:80]}...\n")
    
    try:
        response = orchestrator.generate(
            prompt=args.prompt,
            model_type=args.model or "primary",
            max_tokens=args.max_tokens,
            temperature=args.temperature
        )
        
        print("📝 Response:")
        print("-" * 60)
        print(response)
        print("-" * 60)
        print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def cmd_optimize(args):
    """Optimize the system."""
    orchestrator = get_orchestrator()
    
    print("\n⚡ Starting system optimization...")
    
    results = orchestrator.optimize_system()
    
    print(f"\n✓ Optimization completed")
    print(f"  Config Changes: {len(results['config_optimizations'])}")
    print(f"  Recommendations: {len(results['learning_recommendations'])}")
    
    if results['config_optimizations']:
        print("\n🔧 Applied Configuration Changes:")
        for key, value in results['config_optimizations'].items():
            print(f"  • {key}: {value}")
    
    if results['learning_recommendations']:
        print("\n💡 Learning Recommendations:")
        for rec in results['learning_recommendations']:
            print(f"  • [{rec['priority'].upper()}] {rec['description']}")


def cmd_checkpoint(args):
    """Create a system checkpoint."""
    orchestrator = get_orchestrator()
    
    if args.list:
        checkpoints = orchestrator.checkpoint_manager.list_checkpoints()
        print(f"\n💾 Checkpoints ({len(checkpoints)} total):\n")
        for cp in checkpoints[-10:]:  # Show last 10
            print(f"  • {cp.checkpoint_id}")
            print(f"    Type: {cp.checkpoint_type.value}")
            print(f"    Created: {cp.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"    Status: {cp.status.value}")
            print(f"    Size: {cp.size_mb:.2f} MB")
            print()
    elif args.restore:
        if not orchestrator.restore_checkpoint(args.restore):
            print(f"❌ Failed to restore checkpoint: {args.restore}")
            sys.exit(1)
        print(f"✓ Restored checkpoint: {args.restore}")
    else:
        checkpoint_id = orchestrator.create_checkpoint(args.description or "CLI checkpoint")
        print(f"✓ Created checkpoint: {checkpoint_id}")


def cmd_search(args):
    """Search for best architecture."""
    orchestrator = get_orchestrator()
    
    print(f"\n🔍 Starting architecture search with {args.candidates} candidates...")
    
    results = orchestrator.search_best_architecture(num_candidates=args.candidates)
    
    print(f"\n✓ Search completed")
    print(f"\n🏆 Best Configuration:")
    for key, value in results['best_config'].items():
        print(f"  • {key}: {value}")
    
    print(f"\n📊 Performance Score: {results['performance_score']:.3f}")
    
    if args.json:
        print("\n📄 Full Results (JSON):")
        print(json.dumps(results, indent=2, default=str))


def cmd_health(args):
    """Run health check."""
    orchestrator = get_orchestrator()
    
    print("\n🏥 Running health check...\n")
    
    health = orchestrator.health_check()
    
    resources = health['resources']
    memory_percent = resources['memory']['used_percent']
    cpu_percent = resources['cpu']['usage_percent']
    
    # Health status
    if memory_percent > 90 or cpu_percent > 90:
        status = "⚠️  CRITICAL"
        status_code = 2
    elif memory_percent > 70 or cpu_percent > 70:
        status = "⚡ WARNING"
        status_code = 1
    else:
        status = "✓ HEALTHY"
        status_code = 0
    
    print(f"System Status: {status}")
    print(f"  Memory Usage: {memory_percent:.1f}%")
    print(f"  CPU Usage: {cpu_percent:.1f}%")
    print(f"  Health Score: {health['health_score']:.1f}/100")
    print(f"  Success Rate: {health['requests']['success_rate']:.1f}%")
    
    if args.json:
        print("\n📄 Full Health Data (JSON):")
        print(json.dumps(health, indent=2, default=str))
    
    sys.exit(status_code)


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Self-Healing LLM System CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Start the system
  python cli.py start
  
  # Check system status
  python cli.py status
  
  # Generate text
  python cli.py generate "Hello, how are you?"
  
  # Optimize system
  python cli.py optimize
  
  # Create checkpoint
  python cli.py checkpoint --description "Before update"
  
  # Run health check
  python cli.py health
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Start command
    parser_start = subparsers.add_parser('start', help='Start the LLM system')
    parser_start.set_defaults(func=cmd_start)
    
    # Stop command
    parser_stop = subparsers.add_parser('stop', help='Stop the LLM system')
    parser_stop.set_defaults(func=cmd_stop)
    
    # Status command
    parser_status = subparsers.add_parser('status', help='Show system status')
    parser_status.set_defaults(func=cmd_status)
    
    # Generate command
    parser_generate = subparsers.add_parser('generate', help='Generate text using LLM')
    parser_generate.add_argument('prompt', nargs='?', help='Input prompt')
    parser_generate.add_argument('--model', '-m', default='primary',
                                help='Model type to use (default: primary)')
    parser_generate.add_argument('--max-tokens', type=int, default=2048,
                                help='Maximum tokens to generate (default: 2048)')
    parser_generate.add_argument('--temperature', type=float, default=0.7,
                                help='Temperature for generation (default: 0.7)')
    parser_generate.set_defaults(func=cmd_generate)
    
    # Optimize command
    parser_optimize = subparsers.add_parser('optimize', help='Optimize the system')
    parser_optimize.set_defaults(func=cmd_optimize)
    
    # Checkpoint command
    parser_checkpoint = subparsers.add_parser('checkpoint', help='Manage checkpoints')
    parser_checkpoint.add_argument('--list', '-l', action='store_true',
                                  help='List all checkpoints')
    parser_checkpoint.add_argument('--restore', '-r', metavar='ID',
                                  help='Restore checkpoint by ID')
    parser_checkpoint.add_argument('--description', '-d', default='',
                                  help='Checkpoint description')
    parser_checkpoint.set_defaults(func=cmd_checkpoint)
    
    # Search command
    parser_search = subparsers.add_parser('search', help='Search for best architecture')
    parser_search.add_argument('--candidates', '-n', type=int, default=10,
                              help='Number of candidates to evaluate (default: 10)')
    parser_search.add_argument('--json', action='store_true',
                              help='Output results in JSON format')
    parser_search.set_defaults(func=cmd_search)
    
    # Health command
    parser_health = subparsers.add_parser('health', help='Run health check')
    parser_health.add_argument('--json', action='store_true',
                              help='Output results in JSON format')
    parser_health.set_defaults(func=cmd_health)
    
    # Parse arguments
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Execute command
    try:
        args.func(args)
    except KeyboardInterrupt:
        print("\n\n✓ Operation cancelled")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()