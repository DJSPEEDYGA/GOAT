# NVIDIA AI Integration Guide for GOAT Royalty App

## Overview

The GOAT Royalty App now integrates with **NVIDIA NIM (NVIDIA Inference Microservices)** API, providing access to state-of-the-art AI models for intelligent royalty management, document processing, and advanced AI capabilities.

## Available NVIDIA Models

### Large Language Models (LLMs)

#### Top Recommended Models for GOAT Royalty App:

**1. Meta / llama-3.1-405b-instruct** - PRIMARY CHOICE
- **Use Case**: General purpose AI assistant, document analysis, contract review
- **Strengths**: Large context, excellent reasoning, strong performance
- **Cost**: Higher (405B parameters)
- **Best For**: Complex queries, document understanding, legal analysis

**2. Meta / llama-3.1-70b-instruct** - BALANCED CHOICE
- **Use Case**: Day-to-day operations, royalty calculations, general queries
- **Strengths**: Good balance of performance and cost
- **Cost**: Moderate (70B parameters)
- **Best For**: Regular operations, efficient processing

**3. MiniMaxAI / minimax-m2.5** - SPECIALIZED FOR AGENTIC TASKS
- **Use Case**: Complex agentic workflows, software engineering, tool use
- **Strengths**: SOTA in coding (80.2% SWE-Bench), excellent tool use
- **Cost**: Variable (MoE architecture)
- **Best For**: Automated workflows, code generation, tool calling
- **Benchmarks**: 80.2% SWE-Bench, 51.3% Multi-SWE-Bench, 76.3% BrowseComp

**4. NVIDIA / llama-3.1-nemotron-ultra-253b-v1** - ENTERPRISE GRADE
- **Use Case**: Enterprise applications, compliance, safety
- **Strengths**: Safety guardrails, compliance-ready, optimized for business
- **Cost**: High (253B parameters)
- **Best For**: Enterprise deployments, regulated industries

**5. MistralAI / mistral-large** - EFFICIENT CHOICE
- **Use Case**: Quick queries, real-time responses
- **Strengths**: Fast inference, good performance
- **Cost**: Moderate
- **Best For**: Real-time applications, rapid responses

### Retrieval Models (Embeddings)

**Top Embedding Models:**

**1. NVIDIA / nv-embed-v1** - PRIMARY CHOICE
- **Dimension**: 768
- **Use Case**: General purpose semantic search
- **Best For**: Document retrieval, RAG systems

**2. NVIDIA / nv-embedqa-e5-v5**
- **Dimension**: 1024
- **Use Case**: Question-answer retrieval
- **Best For**: RAG question answering

**3. NVIDIA / llama-3.2-nemoretriever-1b-vlm-embed-v1**
- **Dimension**: 2048
- **Use Case**: Vision-language retrieval
- **Best For**: Multi-modal search, image-text retrieval

### Reranking Models

**1. NVIDIA / nv-rerankqa-mistral-4b-v3**
- **Use Case**: Reranking search results
- **Best For**: Improving RAG accuracy

**2. NVIDIA / llama-nemotron-rerank-1b-v2**
- **Use Case**: Document reranking
- **Best For**: Refining search results

### Visual Models

**1. NVIDIA / nemotron-nano-12b-v2-vl**
- **Use Case**: Vision-language tasks
- **Best For**: Image analysis, document scanning

**2. StabilityAI / stable-diffusion-3-medium**
- **Use Case**: Image generation
- **Best For**: Creating album art, marketing materials

## Integration Architecture

```
GOAT Royalty App
      |
      v
NVIDIA NIM API
      |
      v
+---------------------------+
| LLM Models                |
| - llama-3.1-405b-instruct |
| - minimax-m2.5            |
| - nemotron-ultra-253b     |
+---------------------------+
      |
      v
+---------------------------+
| Retrieval Models          |
| - nv-embed-v1             |
| - nv-embedqa-e5-v5        |
+---------------------------+
      |
      v
+---------------------------+
| Reranking Models          |
| - nv-rerankqa-mistral     |
+---------------------------+
```

## Configuration

### Environment Variables

```env
# NVIDIA API Configuration
NVIDIA_API_KEY=nvapi-xxxxx

# Primary LLM Model
NVIDIA_LLM_MODEL=meta/llama-3.1-405b-instruct

# Embedding Model
NVIDIA_EMBED_MODEL=nvidia/nv-embed-v1

# Reranking Model
NVIDIA_RERANK_MODEL=nvidia/nv-rerankqa-mistral-4b-v3

# Model Parameters
NVIDIA_MAX_TOKENS=4096
NVIDIA_TEMPERATURE=0.7
NVIDIA_TOP_P=0.9
```

## API Endpoints

### Base URL
```
https://integrate.api.nvidia.com/v1
```

### Chat Completions
```
POST /chat/completions
```

### Embeddings
```
POST /embeddings
```

### Reranking
```
POST /reranking
```

## Code Examples

### 1. Chat Completion (LLM)

```javascript
const axios = require('axios');

async function generateResponse(query, context) {
  const response = await axios.post(
    'https://integrate.api.nvidia.com/v1/chat/completions',
    {
      model: 'meta/llama-3.1-405b-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for the GOAT Royalty App.'
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuestion: ${query}`
        }
      ],
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.9
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.choices[0].message.content;
}
```

### 2. Generate Embeddings

```javascript
async function generateEmbeddings(texts) {
  const response = await axios.post(
    'https://integrate.api.nvidia.com/v1/embeddings',
    {
      model: 'nvidia/nv-embed-v1',
      input: texts,
      input_type: 'query'
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.data.map(item => item.embedding);
}
```

### 3. Rerank Results

```javascript
async function rerankResults(query, documents) {
  const response = await axios.post(
    'https://integrate.api.nvidia.com/v1/reranking',
    {
      model: 'nvidia/nv-rerankqa-mistral-4b-v3',
      query: query,
      documents: documents,
      top_n: 5
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.results;
}
```

## Model Selection Guide

### For Document Analysis
- **Primary**: llama-3.1-405b-instruct
- **Alternative**: nemotron-ultra-253b-v1

### For RAG Systems
- **LLM**: llama-3.1-70b-instruct
- **Embedding**: nv-embed-v1
- **Reranking**: nv-rerankqa-mistral-4b-v3

### For Code Generation
- **Primary**: minimax-m2.5 (80.2% SWE-Bench)
- **Alternative**: llama-3.1-405b-instruct

### For Real-time Chat
- **Primary**: mistral-large
- **Alternative**: llama-3.1-70b-instruct

### For Enterprise/Safety
- **Primary**: nemotron-ultra-253b-v1
- **Alternative**: llama-3.1-nemoguard-8b-content-safety

## Performance Benchmarks

### MiniMax-M2.5 (Agentic Tasks)
| Benchmark | Score |
|-----------|-------|
| SWE-Bench Verified | 80.2% |
| Multi-SWE-Bench | 51.3% |
| BrowseComp | 76.3% |
| AIME25 | 86.3 |
| GPQA-D | 85.2 |

### Llama-3.1-405B (General Purpose)
| Benchmark | Score |
|-----------|-------|
| MMLU | 88.6% |
| HumanEval | 89.0% |
| GSM8K | 96.8% |

## Best Practices

1. **Model Selection**
   - Use larger models for complex tasks
   - Use smaller models for real-time responses
   - Consider cost vs performance tradeoffs

2. **Context Management**
   - Keep context under 128K tokens
   - Use RAG for large document sets
   - Implement chunking for long documents

3. **Error Handling**
   - Implement retry logic with exponential backoff
   - Have fallback models configured
   - Monitor API usage and quotas

4. **Cost Optimization**
   - Cache frequently used embeddings
   - Use smaller models when possible
   - Batch API calls when appropriate

## Getting Started

1. **Get API Key**
   - Visit https://build.nvidia.com
   - Create account and get API key

2. **Configure Environment**
   ```bash
   export NVIDIA_API_KEY=nvapi-xxxxx
   ```

3. **Test Integration**
   ```bash
   curl -X POST https://integrate.api.nvidia.com/v1/chat/completions \
     -H "Authorization: Bearer $NVIDIA_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "meta/llama-3.1-405b-instruct",
       "messages": [{"role": "user", "content": "Hello!"}]
     }'
   ```

## Support

- NVIDIA Documentation: https://docs.nvidia.com/nim/
- Model Catalog: https://build.nvidia.com/explore/discover/models
- API Reference: https://docs.nvidia.com/nim/large-language-models/latest/

---

**GOAT Royalty App - Powered by NVIDIA AI** 🐐🚀