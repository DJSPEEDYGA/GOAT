"""
Self-Contained LLM System Module
Manages local LLM execution with multiple specialized models
"""

import subprocess
import json
from typing import Optional, Dict, List, Any
from pathlib import Path


class LLMModel:
    """Represents a single LLM model"""
    
    def __init__(self, name: str, ollama_name: str, description: str):
        self.name = name
        self.ollama_name = ollama_name
        self.description = description
        self.memory_requirement_gb = 0
        self.is_loaded = False
    
    def load(self):
        """Load model into memory"""
        try:
            # Check if model is available
            result = subprocess.run(
                ["ollama", "list"],
                capture_output=True,
                text=True
            )
            
            if self.ollama_name in result.stdout:
                self.is_loaded = True
                print(f"✓ Model {self.name} available")
                return True
            else:
                print(f"⚠️  Model {self.name} not found in Ollama")
                return False
        except Exception as e:
            print(f"✗ Error checking model {self.name}: {e}")
            return False
    
    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate text using this model
        
        Args:
            prompt: Input prompt
            **kwargs: Additional parameters (temperature, max_tokens, etc.)
        
        Returns:
            Generated text
        """
        if not self.is_loaded:
            raise ValueError(f"Model {self.name} is not loaded")
        
        try:
            # Build command
            cmd = ["ollama", "run", self.ollama_name]
            
            # Add parameters
            if "temperature" in kwargs:
                cmd.extend(["--temperature", str(kwargs["temperature"])])
            if "max_tokens" in kwargs:
                cmd.extend(["--num_predict", str(kwargs["max_tokens"])])
            
            # Add prompt
            cmd.append(prompt)
            
            # Run generation
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                raise RuntimeError(f"Generation failed: {result.stderr}")
        
        except subprocess.TimeoutExpired:
            raise TimeoutError(f"Generation timed out for model {self.name}")
        except Exception as e:
            raise RuntimeError(f"Error generating with {self.name}: {e}")


class SelfContainedLLM:
    """
    Self-contained LLM system with multiple specialized models
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the self-contained LLM system
        
        Args:
            config_path: Path to configuration file
        """
        self.models = {}
        self.primary_model = None
        self.config = self._load_config(config_path)
        
        # Initialize models
        self._initialize_models()
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, str]:
        """Load configuration from file"""
        default_config = {
            "primary_model": "llama3.1:70b",
            "reasoning_model": "llama3.1:8b",
            "coding_model": "codellama:13b",
            "lightweight_model": "phi3:mini"
        }
        
        if config_path and Path(config_path).exists():
            # Load from file (implementation would go here)
            pass
        
        return default_config
    
    def _initialize_models(self):
        """Initialize all LLM models"""
        print("🤖 Initializing Self-Contained LLM System...")
        
        # Define models
        model_definitions = [
            {
                "name": "reasoning",
                "ollama_name": self.config.get("reasoning_model", "llama3.1:8b"),
                "description": "General reasoning and tasks",
                "memory_requirement_gb": 8
            },
            {
                "name": "primary",
                "ollama_name": self.config.get("primary_model", "llama3.1:70b"),
                "description": "Advanced reasoning and complex tasks",
                "memory_requirement_gb": 40
            },
            {
                "name": "coding",
                "ollama_name": self.config.get("coding_model", "codellama:13b"),
                "description": "Code generation and debugging",
                "memory_requirement_gb": 16
            },
            {
                "name": "lightweight",
                "ollama_name": self.config.get("lightweight_model", "phi3:mini"),
                "description": "Fast, lightweight inference",
                "memory_requirement_gb": 4
            }
        ]
        
        for model_def in model_definitions:
            model = LLMModel(
                name=model_def["name"],
                ollama_name=model_def["ollama_name"],
                description=model_def["description"]
            )
            model.memory_requirement_gb = model_def["memory_requirement_gb"]
            
            # Try to load model
            if model.load():
                self.models[model.name] = model
                if model.name == "primary":
                    self.primary_model = model
            else:
                print(f"  ⚠️  Skipping unavailable model: {model.name}")
        
        # Set fallback if primary not available
        if not self.primary_model and self.models:
            self.primary_model = list(self.models.values())[0]
            print(f"  ℹ️  Using {self.primary_model.name} as primary model")
        
        print(f"✓ System initialized with {len(self.models)} models\n")
    
    def get_model(self, model_name: Optional[str] = None) -> LLMModel:
        """
        Get a model by name
        
        Args:
            model_name: Name of model to retrieve (None for primary)
        
        Returns:
            LLMModel instance
        """
        if model_name and model_name in self.models:
            return self.models[model_name]
        elif self.primary_model:
            return self.primary_model
        else:
            raise RuntimeError("No models available")
    
    def generate(
        self,
        prompt: str,
        model_name: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate text using specified or primary model
        
        Args:
            prompt: Input prompt
            model_name: Name of model to use (None for primary)
            **kwargs: Additional generation parameters
        
        Returns:
            Generated text
        """
        model = self.get_model(model_name)
        return model.generate(prompt, **kwargs)
    
    def generate_with_reasoning(
        self,
        task: str,
        context: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate response with reasoning step using reasoning model
        
        Args:
            task: Task description
            context: Additional context
            **kwargs: Generation parameters
        
        Returns:
            Generated response
        """
        prompt = f"""
Task: {task}

Context: {context if context else "No additional context provided"}

Please reason through this task step by step, then provide your response.

1. Analyze the task
2. Identify key information needed
3. Consider potential approaches
4. Formulate solution
5. Provide final answer
"""
        
        # Use reasoning model
        return self.generate(
            prompt=prompt,
            model_name="reasoning",
            temperature=kwargs.get("temperature", 0.7),
            max_tokens=kwargs.get("max_tokens", 1000)
        )
    
    def generate_code(
        self,
        task: str,
        language: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate code using coding model
        
        Args:
            task: Code generation task
            language: Programming language
            **kwargs: Generation parameters
        
        Returns:
            Generated code
        """
        language_instruction = f"in {language}" if language else ""
        prompt = f"""
Generate code {language_instruction} to accomplish the following task:

{task}

Requirements:
- Write clean, maintainable code
- Include comments for complex logic
- Follow best practices
- Handle edge cases
- Include error handling

Provide only the code, no explanations.
"""
        
        return self.generate(
            prompt=prompt,
            model_name="coding",
            temperature=kwargs.get("temperature", 0.3),
            max_tokens=kwargs.get("max_tokens", 2000)
        )
    
    def quick_generate(self, prompt: str, **kwargs) -> str:
        """
        Quick generation using lightweight model
        
        Args:
            prompt: Input prompt
            **kwargs: Generation parameters
        
        Returns:
            Generated text
        """
        return self.generate(
            prompt=prompt,
            model_name="lightweight",
            temperature=kwargs.get("temperature", 0.5),
            max_tokens=kwargs.get("max_tokens", 500)
        )
    
    def chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        **kwargs
    ) -> str:
        """
        Conversational generation with history
        
        Args:
            message: Current message
            conversation_history: Previous messages
            **kwargs: Generation parameters
        
        Returns:
            Response
        """
        prompt_parts = []
        
        # Add conversation history
        if conversation_history:
            for msg in conversation_history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                prompt_parts.append(f"{role.capitalize()}: {content}")
        
        # Add current message
        prompt_parts.append(f"User: {message}")
        prompt_parts.append("Assistant:")
        
        prompt = "\n".join(prompt_parts)
        
        return self.generate(
            prompt=prompt,
            temperature=kwargs.get("temperature", 0.8),
            max_tokens=kwargs.get("max_tokens", 1000)
        )
    
    def list_models(self) -> List[Dict[str, Any]]:
        """
        List all available models
        
        Returns:
            List of model information dictionaries
        """
        return [
            {
                "name": model.name,
                "description": model.description,
                "ollama_name": model.ollama_name,
                "memory_requirement_gb": model.memory_requirement_gb,
                "is_loaded": model.is_loaded
            }
            for model in self.models.values()
        ]


# Singleton instance
_llm_system: Optional[SelfContainedLLM] = None


def get_llm_system() -> SelfContainedLLM:
    """Get singleton instance of LLM system"""
    global _llm_system
    if _llm_system is None:
        _llm_system = SelfContainedLLM()
    return _llm_system


if __name__ == "__main__":
    # Test the LLM system
    llm = SelfContainedLLM()
    
    print("=" * 60)
    print("Testing Self-Contained LLM System")
    print("=" * 60)
    
    # List models
    print("\n📋 Available Models:")
    models = llm.list_models()
    for model in models:
        print(f"  {model['name']}: {model['description']}")
        print(f"    Ollama: {model['ollama_name']}")
        print(f"    Memory: {model['memory_requirement_gb']}GB")
        print(f"    Status: {'✓ Loaded' if model['is_loaded'] else '✗ Not loaded'}")
    
    # Test generation
    print("\n🧪 Testing Generation...")
    test_prompt = "Explain what a self-healing system is in 3 sentences."
    
    try:
        response = llm.generate(test_prompt)
        print(f"\nPrompt: {test_prompt}")
        print(f"\nResponse:\n{response}\n")
    except Exception as e:
        print(f"✗ Test failed: {e}")