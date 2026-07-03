"""
Local Knowledge Base Module
Self-contained vector database for RAG (Retrieval Augmented Generation)
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import hashlib
import json


class LocalKnowledgeBase:
    """
    Self-contained vector database for local knowledge storage and retrieval
    """
    
    def __init__(self, persist_directory: Optional[str] = None):
        """
        Initialize the knowledge base
        
        Args:
            persist_directory: Directory to store vector database
        """
        self.persist_directory = Path(persist_directory) if persist_directory else Path(__file__).parent.parent / "knowledge_base"
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        self.embeddings_cache = {}
        self.documents_store = {}
        self.metadata_store = {}
        
        # Knowledge domains
        self.domains = []
        
        print(f"💾 Knowledge Base initialized at {self.persist_directory}")
    
    def initialize(self):
        """Initialize knowledge base with default domains"""
        print("📚 Initializing knowledge base...")
        
        # Create knowledge domains
        self._create_knowledge_domains()
        
        # Load existing data if available
        self._load_existing_data()
        
        print("✓ Knowledge base ready\n")
    
    def _create_knowledge_domains(self):
        """Create initial knowledge domains"""
        
        domain_definitions = [
            {
                "name": "system_architecture",
                "description": "System architecture and design patterns",
                "documents": [
                    {
                        "content": """
The Self-Contained, Self-Healing, Self-Building LLM System uses a three-tier architecture:
1. Self-Contained Core: Handles local LLM execution and resource management
2. Self-Healing Layer: Provides fault detection, root cause analysis, and remediation
3. Self-Building Engine: Implements meta-learning and self-optimization

The system operates autonomously without external API dependencies, ensuring offline capability and data privacy.
                        """,
                        "metadata": {
                            "domain": "architecture",
                            "category": "overview",
                            "importance": "high"
                        }
                    },
                    {
                        "content": """
Key design principles for self-healing systems:
- Make failures cheap and recovery fast
- Infrastructure failures should be inputs to agent reasoning
- Use checkpointing for instant recovery from failures
- Implement graduated remediation (low-risk to high-risk fixes)
- Maintain human-in-the-loop for critical decisions
- Provide complete observability and logging
                        """,
                        "metadata": {
                            "domain": "architecture",
                            "category": "principles",
                            "importance": "high"
                        }
                    }
                ]
            },
            {
                "name": "best_practices",
                "description": "Coding best practices and standards",
                "documents": [
                    {
                        "content": """
Python best practices for production systems:
- Use type hints for better code clarity
- Implement proper error handling with try/except
- Write docstrings for all functions and classes
- Use logging instead of print statements
- Follow PEP 8 style guide
- Write unit tests for critical functions
- Use virtual environments for dependency isolation
- Keep functions small and focused
- Use context managers for resource management
- Prefer composition over inheritance
                        """,
                        "metadata": {
                            "domain": "best_practices",
                            "category": "python",
                            "importance": "medium"
                        }
                    }
                ]
            },
            {
                "name": "troubleshooting",
                "description": "Common issues and solutions",
                "documents": [
                    {
                        "content": """
Common failure modes and solutions:
1. Out of Memory (OOM): Reduce batch size, use gradient accumulation, or switch to smaller model
2. GPU not available: Fall back to CPU mode or install CUDA drivers
3. Model loading failure: Verify Ollama is installed and model is downloaded
4. Slow inference: Use quantization or switch to smaller model
5. Timeout errors: Increase timeout values or optimize prompt length
6. Connection refused: Check Ollama service is running (ollama serve)
                        """,
                        "metadata": {
                            "domain": "troubleshooting",
                            "category": "common_issues",
                            "importance": "high"
                        }
                    }
                ]
            },
            {
                "name": "security",
                "description": "Security practices and guidelines",
                "documents": [
                    {
                        "content": """
Security best practices for AI systems:
- Never expose API keys or credentials in code
- Use environment variables for sensitive configuration
- Implement input validation and sanitization
- Use sandboxed environments for code execution
- Limit file system access for generated code
- Implement rate limiting
- Log all security-relevant events
- Regularly update dependencies
- Use encryption for data at rest
- Implement proper authentication and authorization
                        """,
                        "metadata": {
                            "domain": "security",
                            "category": "practices",
                            "importance": "high"
                        }
                    }
                ]
            }
        ]
        
        # Add each domain
        for domain_def in domain_definitions:
            domain_name = domain_def["name"]
            print(f"  Adding domain: {domain_name}")
            
            # Add documents
            for doc in domain_def["documents"]:
                self.add_document(
                    content=doc["content"],
                    metadata=doc["metadata"],
                    domain=domain_name
                )
        
        self.domains = [d["name"] for d in domain_definitions]
    
    def _load_existing_data(self):
        """Load existing knowledge base data from disk"""
        data_file = self.persist_directory / "knowledge_data.json"
        
        if data_file.exists():
            try:
                with open(data_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                    self.documents_store = data.get("documents", {})
                    self.metadata_store = data.get("metadata", {})
                    self.embeddings_cache = data.get("embeddings", {})
                    
                    print(f"  Loaded {len(self.documents_store)} existing documents")
            except Exception as e:
                print(f"  ⚠️  Error loading existing data: {e}")
    
    def _save_data(self):
        """Save knowledge base data to disk"""
        data_file = self.persist_directory / "knowledge_data.json"
        
        try:
            data = {
                "documents": self.documents_store,
                "metadata": self.metadata_store,
                "embeddings": self.embeddings_cache
            }
            
            with open(data_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"✗ Error saving knowledge base: {e}")
    
    def _generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text (simplified version)
        In production, use actual embedding model (SentenceTransformers, etc.)
        """
        # Hash-based simple embedding for demonstration
        # In production, replace with: from sentence_transformers import SentenceTransformer
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        # Convert hash to numeric vector
        embedding = []
        for i in range(384):  # Standard embedding dimension
            char_index = i % len(text_hash)
            char_val = int(text_hash[char_index], 16)
            normalized_val = char_val / 15.0  # Normalize to 0-1
            embedding.append(normalized_val)
        
        return embedding
    
    def add_document(
        self,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        domain: str = "general"
    ):
        """
        Add a document to the knowledge base
        
        Args:
            content: Document content
            metadata: Document metadata
            domain: Knowledge domain
        """
        # Generate document ID
        doc_id = hashlib.md5(content.encode()).hexdigest()[:16]
        
        # Store document
        self.documents_store[doc_id] = {
            "content": content,
            "domain": domain
        }
        
        # Store metadata
        self.metadata_store[doc_id] = metadata or {}
        
        # Generate and cache embedding
        embedding = self._generate_embedding(content)
        self.embeddings_cache[doc_id] = embedding
        
        # Save to disk
        self._save_data()
        
        return doc_id
    
    def search(
        self,
        query: str,
        k: int = 5,
        domain: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search knowledge base for relevant documents
        
        Args:
            query: Search query
            k: Number of results to return
            domain: Filter by domain
        
        Returns:
            List of matching documents with metadata
        """
        # Generate query embedding
        query_embedding = self._generate_embedding(query)
        
        # Calculate similarities
        results = []
        for doc_id, doc_embedding in self.embeddings_cache.items():
            # Filter by domain if specified
            if domain and self.documents_store[doc_id]["domain"] != domain:
                continue
            
            # Calculate cosine similarity
            similarity = self._cosine_similarity(query_embedding, doc_embedding)
            
            results.append({
                "doc_id": doc_id,
                "content": self.documents_store[doc_id]["content"],
                "metadata": self.metadata_store[doc_id],
                "domain": self.documents_store[doc_id]["domain"],
                "similarity": similarity
            })
        
        # Sort by similarity and return top k
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:k]
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = sum(a ** 2 for a in vec1) ** 0.5
        magnitude2 = sum(b ** 2 for b in vec2) ** 0.5
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific document by ID
        
        Args:
            doc_id: Document ID
        
        Returns:
            Document data or None if not found
        """
        if doc_id in self.documents_store:
            return {
                "content": self.documents_store[doc_id]["content"],
                "metadata": self.metadata_store[doc_id],
                "domain": self.documents_store[doc_id]["domain"]
            }
        return None
    
    def list_domains(self) -> List[str]:
        """Get list of all knowledge domains"""
        return list(set(
            doc["domain"] for doc in self.documents_store.values()
        ))
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get knowledge base statistics"""
        return {
            "total_documents": len(self.documents_store),
            "total_domains": len(self.list_domains()),
            "domains": self.list_domains(),
            "persist_directory": str(self.persist_directory)
        }


# Singleton instance
_knowledge_base: Optional[LocalKnowledgeBase] = None


def get_knowledge_base() -> LocalKnowledgeBase:
    """Get singleton instance of knowledge base"""
    global _knowledge_base
    if _knowledge_base is None:
        _knowledge_base = LocalKnowledgeBase()
        _knowledge_base.initialize()
    return _knowledge_base


if __name__ == "__main__":
    # Test the knowledge base
    kb = LocalKnowledgeBase()
    kb.initialize()
    
    print("=" * 60)
    print("Testing Local Knowledge Base")
    print("=" * 60)
    
    # Show statistics
    print("\n📊 Statistics:")
    stats = kb.get_statistics()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # Test search
    print("\n🔍 Testing Search:")
    test_queries = [
        "How do I handle out of memory errors?",
        "What are the best practices for Python code?",
        "How is the system architecture organized?"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        results = kb.search(query, k=2)
        
        for i, result in enumerate(results, 1):
            print(f"\n  Result {i} (similarity: {result['similarity']:.3f}):")
            print(f"    Domain: {result['domain']}")
            print(f"    Content: {result['content'][:100]}...")