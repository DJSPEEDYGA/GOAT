// ============================================================
// GOAT POWER PROMPTING ENGINE v1.0
// Advanced AI Prompting Framework — ReAct, Chain-of-Thought,
// Quantum Engineering, Code Review, Adversarial Testing & More
// By Harvey Miller (DJ Speedy) — @DJSPEEDYGA
// ============================================================
'use strict';

// ── ENGINE STATE ─────────────────────────────────────────────
const peState = {
  activeMode: 'architect',
  reactIteration: 0,
  reactHistory: [],
  searchIterations: [],
  confidenceScore: 0,
  currentOutput: '',
  sessionHistory: [],
  quantumCircuit: null,
  codeReviewResult: null,
  jsonExtractResult: null,
  isProcessing: false,
  userGoal: '',
  subtasks: [],
  currentSubtask: 0,
};

// ── PROMPTING MODES ──────────────────────────────────────────
const PROMPT_MODES = [
  {
    id: 'architect',
    icon: '🏗️',
    label: 'Project Architect',
    color: '#6366f1',
    badge: 'DECOMPOSE',
    desc: 'Breaks any complex goal into 5 subtasks, identifies tools, executes sequentially with full thinking process',
    placeholder: 'Describe your complex project goal...\nExample: Build a real-time multiplayer game with leaderboards, anti-cheat, and MetaHuman characters',
  },
  {
    id: 'react',
    icon: '🔄',
    label: 'ReAct Search Engine',
    color: '#f59e0b',
    badge: 'THINK→ACT→OBSERVE',
    desc: '3-iteration search refinement with confidence scoring. Stops and evaluates at each step.',
    placeholder: 'What topic do you need deeply researched?\nExample: Latest advances in quantum error correction for NISQ devices 2025',
  },
  {
    id: 'senior_dev',
    icon: '👨‍💻',
    label: 'Senior Dev Code Review',
    color: '#22c55e',
    badge: 'CRITIQUE→IMPROVE',
    desc: 'Writes code, then acts as senior developer critiquing edge cases and security issues, then rewrites improved version',
    placeholder: 'Describe the code task to write and review...\nExample: Python script to parse JWT tokens, validate signatures, and extract user claims',
  },
  {
    id: 'json_extract',
    icon: '📊',
    label: 'Structured JSON Extractor',
    color: '#3b82f6',
    badge: 'STRICT FORMAT',
    desc: 'Extracts structured data from any text with zero hallucination. Strict JSON output only.',
    placeholder: 'Paste any text to extract structured data from...\nExample: Paste an email, contract, meeting notes, or article',
  },
  {
    id: 'quantum',
    icon: '⚛️',
    label: 'Quantum Circuit Engineer',
    color: '#8b5cf6',
    badge: 'QISKIT/PENNYLANE',
    desc: 'Translates high-level descriptions into quantum circuits. Step-by-step: registers → gates → entanglement → decoherence check',
    placeholder: 'Describe your quantum algorithm...\nExample: Variational Quantum Eigensolver (VQE) for H2 molecule ground state energy estimation',
  },
  {
    id: 'adversarial',
    icon: '⚔️',
    label: 'Adversarial Tester',
    color: '#ef4444',
    badge: 'STRESS TEST',
    desc: 'Tests AI with conflicting instructions and ambiguous prompts to find edge cases and failure modes',
    placeholder: 'Describe what you want to stress-test...\nExample: My customer service chatbot that handles refund requests',
  },
  {
    id: 'ceo_explain',
    icon: '💼',
    label: 'CEO Explainer',
    color: '#f97316',
    badge: 'DEEP REASONING',
    desc: '"Explain like I\'m a CEO" + "$100 bet" framing forces maximum accuracy and depth',
    placeholder: 'What complex technical topic needs a CEO-level explanation?\nExample: Why quantum computing will break current encryption and what we should do about it',
  },
  {
    id: 'clarify_first',
    icon: '❓',
    label: 'Clarify-First Agent',
    color: '#14b8a6',
    badge: 'NO ASSUMPTIONS',
    desc: 'Never assumes requirements. Generates clarifying questions first, then executes only after answers provided.',
    placeholder: 'Describe your request (the AI will ask clarifying questions before starting)...\nExample: Build me a recommendation system',
  },
];

// ── PROMPT TEMPLATES ─────────────────────────────────────────
const PROMPT_TEMPLATES = {
  architect: (goal) => `You are an expert project architect. I have a complex goal:

"${goal}"

Do NOT solve this immediately. Follow this exact process:

## STEP 1: DECOMPOSE INTO 5 SUBTASKS
Break this goal into exactly 5 smaller, concrete, sequential subtasks. Each must be independently achievable.

## STEP 2: IDENTIFY REQUIRED TOOLS
For each subtask, identify which external tools are required:
- Python code interpreter
- Web search
- File system operations  
- API calls (specify which)
- Database operations
- UI/visualization tools
- Testing frameworks

## STEP 3: EXECUTE SEQUENTIALLY
For each subtask, show your thinking process:
> **Subtask N:** [Name]
> **Think:** [What needs to happen and why]
> **Act:** [Specific action to take with the tool]
> **Observe:** [Expected output and success criteria]
> **Code/Implementation:** [Actual implementation if applicable]

## STEP 4: INTEGRATION PLAN
How do all 5 subtasks connect into the final solution?

## STEP 5: RISK ASSESSMENT
What could go wrong at each step and how to handle it?`,

  react: (topic) => `You are a research agent using the ReAct pattern (Reason + Act).

Topic: "${topic}"

Execute EXACTLY 3 iterations. After EACH iteration, STOP and evaluate:
- Is your current information sufficient? (Yes/No)
- Confidence score: X/100
- What's missing?

## ITERATION 1
**Think:** What do I already know about this topic? What are the gaps?
**Act:** [Formulate your first search query — be specific]
**Search Query:** "[Your optimized search query]"
**Observe:** [Synthesize what this search would return, key findings]
**Confidence Score:** [X/100]
**Is this enough?** [Yes/No — If No, explain what's missing]

## ITERATION 2  
**Think:** Based on iteration 1, what specific aspect needs deeper research?
**Act:** [Formulate a refined, more targeted search query]
**Search Query:** "[Your refined query — must be different from iteration 1]"
**Observe:** [New findings that fill the gaps from iteration 1]
**Confidence Score:** [X/100]
**Is this enough?** [Yes/No]

## ITERATION 3
**Think:** What final piece of information completes the picture?
**Act:** [Final verification search or alternative perspective]
**Search Query:** "[Your final query]"
**Observe:** [Final synthesis combining all 3 iterations]
**Final Confidence Score:** [X/100]

## FINAL ANSWER (Only after 3 iterations)
[Comprehensive answer combining all research iterations]
[State clearly: "My confidence in this answer is X/100 because..."]
[Any remaining uncertainties: "The following facts are unclear: ..."]`,

  senior_dev: (task) => `You are a full-stack developer AND a senior code reviewer. Work in 3 phases:

## PHASE 1: WRITE THE CODE
Task: "${task}"

Write a complete, working implementation. Include:
- All imports and dependencies
- Error handling
- Type hints (Python) or types (TypeScript/C++)
- Docstrings/comments

## PHASE 2: SENIOR DEVELOPER CRITIQUE
Now act as a senior developer reviewing your own code. Be ruthless. Analyze:

### Security Issues
- Input validation gaps
- Injection vulnerabilities (SQL, command, path traversal)
- Authentication/authorization flaws
- Sensitive data exposure
- Cryptographic weaknesses

### Edge Cases
- Null/undefined/empty inputs
- Integer overflow/underflow
- Race conditions (concurrent access)
- Network timeouts and retries
- File system permissions
- Memory leaks
- Unicode/encoding issues

### Performance Issues
- O(n²) or worse algorithms where O(n log n) is possible
- Unnecessary database calls in loops (N+1 problem)
- Memory inefficiency
- Missing caching opportunities

### Code Quality
- SOLID principles violations
- Missing tests for critical paths
- Tight coupling issues

**Critique Summary:**
- 🔴 Critical Issues: [list]
- 🟡 Medium Issues: [list]
- 🟢 Minor Issues: [list]

## PHASE 3: IMPROVED VERSION
Rewrite the code addressing ALL issues found in Phase 2.
Show a diff summary: "Changed X, Fixed Y, Added Z"`,

  json_extract: (text) => `You are a structured data extraction engine. Your ONLY output must be valid JSON.

Extract ALL relevant information from the following text and structure it using the most appropriate JSON schema.

Rules:
- Do NOT provide any conversational text before or after the JSON
- Do NOT assume any information not explicitly stated in the text
- Use null for missing fields — never guess or infer
- If you are uncertain about a value, add a "_confidence": 0.0-1.0 field next to it
- Detect the document type automatically (email, contract, meeting notes, code, article, etc.)
- Adapt the JSON structure to the document type

Text to extract:
---
${text}
---

Required base structure:
{
  "document_type": "...",
  "extraction_timestamp": "...",
  "data": {
    [adaptive fields based on document type]
  },
  "action_items": ["..."],
  "deadlines": ["..."],
  "entities": {
    "people": ["..."],
    "organizations": ["..."],
    "locations": ["..."],
    "dates": ["..."],
    "amounts": ["..."]
  },
  "confidence_overall": 0.0
}`,

  quantum: (algorithm) => `You are an expert Quantum Software Engineer proficient in Python (Qiskit/PennyLane) and C++ (CUDA-Q). You understand quantum mechanics, NISQ constraints, circuit optimization, and error correction. Your code must be efficient, well-documented, and error-free.

Algorithm to implement: "${algorithm}"

Follow this EXACT process:

## STEP 1: ALGORITHM ANALYSIS
- Mathematical description of the algorithm
- Classical vs quantum complexity comparison
- NISQ feasibility assessment (qubit count, circuit depth)
- Identify the quantum advantage (if any)

## STEP 2: CIRCUIT DESIGN
Think step-by-step:
1. **Quantum registers needed:** How many qubits? Why?
2. **Classical bits needed:** For measurement results
3. **Entanglement patterns:** Where and why is entanglement required?
4. **Gate sequence:** List all gates in order with justification
5. **Decoherence checkpoints:** Mark circuit positions where decoherence is most likely

## STEP 3: QISKIT IMPLEMENTATION
\`\`\`python
# Complete, runnable Qiskit circuit
# Include: circuit diagram, statevector simulation, measurement
\`\`\`

## STEP 4: PENNYLANE ALTERNATIVE (for gradient-based optimization)
\`\`\`python
# PennyLane version for variational algorithms
\`\`\`

## STEP 5: 2-QUBIT SIMULATION & VERIFICATION
- Simulate the circuit for the minimal 2-qubit case
- Show expected vs actual output
- Verify mathematical correctness
- Identify any logical flaws

## STEP 6: OPTIMIZATION
- Gate reduction techniques applied
- Transpilation for real hardware (ibm_nairobi or similar)
- Error mitigation strategies (ZNE, PEC, M3)
- Final circuit depth and two-qubit gate count`,

  adversarial: (system) => `You are an adversarial AI tester. Your job is to BREAK the following system by finding its failure modes.

System to test: "${system}"

## ROUND 1: CONFLICTING INSTRUCTIONS TEST
Generate 5 prompts with directly contradictory instructions:
Example: "Summarize this, but don't include the main point"
Each prompt should expose a different type of ambiguity handling failure.

## ROUND 2: EDGE CASE BOMBARDMENT
Generate 10 edge case inputs that would break the system:
- Empty inputs
- Extremely long inputs (>10,000 tokens)
- Inputs in unexpected languages
- Inputs with special characters/emojis/code injection
- Inputs designed to make the AI ignore its instructions (prompt injection)
- Inputs with false premises
- Inputs asking the system to violate its own rules

## ROUND 3: SEMANTIC TRAPS
Generate 5 prompts that sound reasonable but contain logical traps:
- Leading questions with false assumptions
- Requests that require impossible knowledge
- Questions where any answer reveals a flaw

## ROUND 4: JAILBREAK RESISTANCE TEST
Generate 3 sophisticated attempts to bypass the system's safety measures.
Then evaluate: How would a well-designed system handle each?

## FINAL VULNERABILITY REPORT
\`\`\`json
{
  "system_name": "...",
  "critical_vulnerabilities": [],
  "medium_vulnerabilities": [],
  "low_vulnerabilities": [],
  "recommended_mitigations": [],
  "overall_robustness_score": 0
}
\`\`\``,

  ceo_explain: (topic) => `I am willing to bet $100 that you cannot explain "${topic}" clearly enough that a Fortune 500 CEO — with an MBA but no technical background — could make a strategic business decision based on your explanation.

To win this bet, your explanation MUST:

## THE CEO BRIEFING FORMAT

### Executive Summary (30 seconds)
One paragraph. No jargon. The core idea in plain English.

### Why This Matters RIGHT NOW (Business Impact)
- What is the immediate business risk/opportunity?
- What happens to companies that ignore this?
- What happens to companies that embrace this?
- Specific dollar amounts or percentages where possible

### The Simple Analogy
Explain using ONE analogy from business/everyday life that makes it instantly clear.

### The Decision Framework
Three options the CEO must choose between:
1. **Act Now** — Cost, benefit, timeline
2. **Wait and Watch** — Risk, opportunity cost, trigger points
3. **Ignore** — Worst-case scenario in 2, 5, 10 years

### What Your Competitors Are Doing
Specific examples of companies leading vs lagging.

### The One Question to Ask Your CTO
A single, precise question that reveals if your technical team truly understands this.

### Recommended Action (CEO Decision)
One clear recommendation with confidence level.

---
Prove me wrong. Explain "${topic}" at CEO level.`,

  clarify_first: (request) => `You are a requirements engineer. You have received this request:

"${request}"

## CRITICAL RULE: DO NOT ASSUME ANY REQUIREMENTS
## CRITICAL RULE: DO NOT START BUILDING ANYTHING YET
## CRITICAL RULE: Ask for clarification if ANYTHING is unclear

## STEP 1: REQUIREMENT ANALYSIS
Analyze this request and identify:
- What is explicitly stated (certain)
- What is implied but not confirmed (uncertain)
- What is completely missing (unknown)
- What are the potential conflicting interpretations?

## STEP 2: CLARIFYING QUESTIONS
Generate ALL questions you need answered before starting. Organize by priority:

### 🔴 BLOCKING Questions (Cannot start without these)
[Questions where the answer completely changes the approach]

### 🟡 IMPORTANT Questions (Will significantly affect the solution)
[Questions about scope, scale, technology choices]

### 🟢 NICE TO KNOW Questions (Can assume a default but want to confirm)
[Questions about preferences and nice-to-haves]

## STEP 3: ASSUMPTIONS LOG
List any assumptions you are making and ask for confirmation:
"I am assuming X. Is this correct? If not, please clarify."

## STEP 4: PROPOSED SCOPE
Based on what IS clear, propose a minimal scope:
"If you confirm the blocking questions, here is what I plan to build: [minimal viable description]"

## AWAITING YOUR ANSWERS
Do not proceed until all 🔴 BLOCKING questions are answered.`,
};

// ── QUICK PROMPT PRESETS ──────────────────────────────────────
const QUICK_PRESETS = {
  architect: [
    'Build a real-time multiplayer game with MetaHuman characters and FiveM integration',
    'Create a music royalty tracking system with blockchain and smart contracts',
    'Design a worldwide artist-fan dating app with AI matchmaking and security',
    'Build an AI-powered video production pipeline from script to final cut',
  ],
  react: [
    'Latest advances in quantum error correction for NISQ devices 2025',
    'Best practices for MetaHuman facial animation in Unreal Engine 5.4',
    'How blockchain is transforming music royalty payments for independent artists',
    'Current state of AI-generated music and copyright law implications',
  ],
  senior_dev: [
    'Python script to validate JWT tokens, check signatures, extract claims securely',
    'C++ memory pool allocator for a game engine with zero fragmentation',
    'Node.js REST API with rate limiting, auth middleware, and SQL injection prevention',
    'Rust async web scraper with retry logic and proxy rotation',
  ],
  json_extract: [
    'Paste an email here to extract sender, recipients, action items, and deadlines',
    'Paste a contract to extract parties, obligations, payment terms, and clauses',
    'Paste meeting notes to extract decisions, action items, owners, and dates',
    'Paste a job posting to extract requirements, salary, location, and responsibilities',
  ],
  quantum: [
    'Variational Quantum Eigensolver (VQE) for H2 molecule ground state energy',
    'Grover\'s algorithm for searching an unsorted database of 8 elements',
    'Quantum Key Distribution (BB84 protocol) for secure communication',
    'Quantum Approximate Optimization Algorithm (QAOA) for Max-Cut problem',
  ],
  adversarial: [
    'Customer service chatbot that handles refund requests and complaints',
    'AI code reviewer that checks for security vulnerabilities',
    'Dating app matchmaking algorithm that filters inappropriate profiles',
    'Financial advisor AI that recommends investment strategies',
  ],
  ceo_explain: [
    'Why quantum computing will break current encryption and what we should do',
    'How AI is about to eliminate 40% of white-collar jobs in 5 years',
    'Why every company needs a blockchain strategy before 2027',
    'The real business risk of not having AI in your product by end of 2025',
  ],
  clarify_first: [
    'Build me a recommendation system',
    'Create a dashboard for my business',
    'I need an AI chatbot for my website',
    'Build a mobile app for my music label',
  ],
};

// ── RENDER PROMPT ENGINE ──────────────────────────────────────
function renderPromptEngine(container) {
  container.innerHTML = `
    <div class="pe-panel">
      <!-- Header -->
      <div class="pe-banner">
        <div class="pe-banner-left">
          <div class="pe-banner-icon">🧠</div>
          <div>
            <div class="pe-banner-title">GOAT Power Prompting Engine</div>
            <div class="pe-banner-sub">ReAct • Chain-of-Thought • Quantum Engineering • Senior Dev Review • Adversarial Testing • CEO Mode</div>
          </div>
        </div>
        <div class="pe-stats">
          <span class="pe-stat">${peState.sessionHistory.length} sessions</span>
          <span class="pe-stat">${PROMPT_MODES.length} modes</span>
        </div>
      </div>

      <!-- Mode Selector -->
      <div class="pe-modes-grid">
        ${PROMPT_MODES.map(m => `
          <div class="pe-mode-card ${peState.activeMode === m.id ? 'active' : ''}"
               onclick="setPEMode('${m.id}')"
               style="${peState.activeMode === m.id ? `border-color:${m.color};background:${m.color}15` : ''}">
            <div class="pe-mode-header">
              <span class="pe-mode-icon">${m.icon}</span>
              <span class="pe-mode-badge" style="background:${m.color}25;color:${m.color}">${m.badge}</span>
            </div>
            <div class="pe-mode-label" style="${peState.activeMode === m.id ? `color:${m.color}` : ''}">${m.label}</div>
            <div class="pe-mode-desc">${m.desc}</div>
          </div>
        `).join('')}
      </div>

      <!-- Active Mode Panel -->
      ${renderPEActiveMode()}

      <!-- Session History -->
      ${peState.sessionHistory.length > 0 ? `
        <div class="pe-history-section">
          <div class="pe-section-title">📋 Session History</div>
          <div class="pe-history-list">
            ${peState.sessionHistory.slice(-5).reverse().map((s, i) => `
              <div class="pe-history-item" onclick="loadPESession(${peState.sessionHistory.length - 1 - i})">
                <span class="pe-hist-icon">${PROMPT_MODES.find(m=>m.id===s.mode)?.icon || '🧠'}</span>
                <span class="pe-hist-mode">${PROMPT_MODES.find(m=>m.id===s.mode)?.label || s.mode}</span>
                <span class="pe-hist-preview">${s.input.slice(0, 60)}...</span>
                <span class="pe-hist-time">${new Date(s.timestamp).toLocaleTimeString()}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ── ACTIVE MODE PANEL ─────────────────────────────────────────
function renderPEActiveMode() {
  const mode = PROMPT_MODES.find(m => m.id === peState.activeMode);
  if (!mode) return '';
  const presets = QUICK_PRESETS[mode.id] || [];

  return `
    <div class="pe-active-panel" style="border-color:${mode.color}40">
      <!-- Mode Title -->
      <div class="pe-active-header" style="background:${mode.color}12">
        <span class="pe-active-icon">${mode.icon}</span>
        <div>
          <div class="pe-active-title" style="color:${mode.color}">${mode.label}</div>
          <div class="pe-active-desc">${mode.desc}</div>
        </div>
        <span class="pe-active-badge" style="background:${mode.color}25;color:${mode.color};border:1px solid ${mode.color}50">${mode.badge}</span>
      </div>

      <!-- Quick Presets -->
      <div class="pe-presets">
        <div class="pe-presets-label">Quick Presets:</div>
        <div class="pe-preset-btns">
          ${presets.map(p => `
            <button class="pe-preset-btn" onclick="loadPEPreset(${JSON.stringify(p).replace(/'/g, '&#39;')})"
                    style="border-color:${mode.color}40;color:${mode.color}">
              ${p.slice(0, 55)}${p.length > 55 ? '...' : ''}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Input Area -->
      <div class="pe-input-section">
        <textarea id="peMainInput" class="pe-textarea"
          placeholder="${mode.placeholder}"
          rows="5"
          style="border-color:${mode.color}40"></textarea>

        <!-- Mode-specific Options -->
        ${renderModeOptions(mode)}

        <!-- Action Buttons -->
        <div class="pe-actions">
          <button class="pe-btn-execute" onclick="executePEMode()"
                  style="background:linear-gradient(135deg,${mode.color},${mode.color}cc)"
                  ${peState.isProcessing ? 'disabled' : ''}>
            ${peState.isProcessing ? '⏳ Processing...' : `${mode.icon} Execute ${mode.label}`}
          </button>
          <button class="pe-btn-clear" onclick="clearPEInput()">🗑 Clear</button>
          <button class="pe-btn-copy" onclick="copyPEOutput()" ${!peState.currentOutput ? 'disabled' : ''}>📋 Copy Output</button>
          <button class="pe-btn-send" onclick="sendPEToChat()" ${!peState.currentOutput ? 'disabled' : ''}>💬 Send to Chat</button>
        </div>
      </div>

      <!-- Output Area -->
      ${peState.currentOutput ? `
        <div class="pe-output-section">
          <div class="pe-output-header">
            <span class="pe-output-title">🎯 ${mode.label} Output</span>
            <div class="pe-output-actions">
              ${peState.activeMode === 'react' ? `<span class="pe-confidence">Confidence: ${peState.confidenceScore}/100</span>` : ''}
              <button class="pe-btn-xs" onclick="copyPEOutput()">📋</button>
              <button class="pe-btn-xs" onclick="downloadPEOutput()">⬇️</button>
              <button class="pe-btn-xs" onclick="sendPEToChat()">💬</button>
            </div>
          </div>
          <div class="pe-output-content" id="peOutputContent">
            ${typeof renderMarkdown === 'function' ? renderMarkdown(peState.currentOutput) : peState.currentOutput.replace(/\n/g,'<br>')}
          </div>
        </div>
      ` : ''}

      <!-- ReAct Progress (for react mode) -->
      ${peState.activeMode === 'react' && peState.reactHistory.length > 0 ? `
        <div class="pe-react-progress">
          <div class="pe-section-title">🔄 Research Iterations</div>
          ${peState.reactHistory.map((iter, i) => `
            <div class="pe-react-iter">
              <div class="pe-iter-header">
                <span class="pe-iter-num">Iteration ${i + 1}</span>
                <span class="pe-iter-conf" style="color:${iter.confidence > 75 ? '#22c55e' : iter.confidence > 50 ? '#f59e0b' : '#ef4444'}">
                  ${iter.confidence}/100 confidence
                </span>
              </div>
              <div class="pe-iter-query">🔍 Query: ${iter.query}</div>
              <div class="pe-iter-status">${iter.sufficient ? '✅ Sufficient' : '🔄 Needs refinement'}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Subtask Progress (for architect mode) -->
      ${peState.activeMode === 'architect' && peState.subtasks.length > 0 ? `
        <div class="pe-subtask-progress">
          <div class="pe-section-title">🏗️ Subtask Progress</div>
          <div class="pe-subtasks-list">
            ${peState.subtasks.map((task, i) => `
              <div class="pe-subtask ${i < peState.currentSubtask ? 'done' : i === peState.currentSubtask ? 'active' : ''}">
                <span class="pe-st-num">${i + 1}</span>
                <span class="pe-st-name">${task}</span>
                <span class="pe-st-status">${i < peState.currentSubtask ? '✅' : i === peState.currentSubtask ? '⚙️' : '⏳'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ── MODE-SPECIFIC OPTIONS ─────────────────────────────────────
function renderModeOptions(mode) {
  switch (mode.id) {
    case 'senior_dev':
      return `
        <div class="pe-mode-options">
          <label class="pe-option-label">Language:</label>
          <select id="peCodeLang" class="pe-select">
            <option value="python">Python</option>
            <option value="javascript">JavaScript/Node.js</option>
            <option value="typescript">TypeScript</option>
            <option value="cpp">C++</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="lua">Lua (FiveM)</option>
            <option value="hlsl">HLSL (Shader)</option>
          </select>
          <label class="pe-option-label">Focus:</label>
          <select id="peReviewFocus" class="pe-select">
            <option value="security">Security-First</option>
            <option value="performance">Performance-First</option>
            <option value="maintainability">Maintainability</option>
            <option value="all">All Issues</option>
          </select>
        </div>`;
    case 'quantum':
      return `
        <div class="pe-mode-options">
          <label class="pe-option-label">Framework:</label>
          <select id="peQuantumFW" class="pe-select">
            <option value="qiskit">Qiskit (IBM)</option>
            <option value="pennylane">PennyLane (Xanadu)</option>
            <option value="both">Both Qiskit + PennyLane</option>
            <option value="cudaqq">CUDA-Q (NVIDIA)</option>
          </select>
          <label class="pe-option-label">Gate Types:</label>
          <select id="peGateTypes" class="pe-select">
            <option value="standard">Standard (H, CNOT, RZ, etc.)</option>
            <option value="variational">Variational (RY, RZ, RX)</option>
            <option value="fault_tolerant">Fault-Tolerant (Clifford+T)</option>
            <option value="native">Hardware Native Gates</option>
          </select>
        </div>`;
    case 'json_extract':
      return `
        <div class="pe-mode-options">
          <label class="pe-option-label">Document Type (auto-detect):</label>
          <select id="peDocType" class="pe-select">
            <option value="auto">Auto-Detect</option>
            <option value="email">Email</option>
            <option value="contract">Legal Contract</option>
            <option value="meeting">Meeting Notes</option>
            <option value="invoice">Invoice/Financial</option>
            <option value="code">Source Code</option>
            <option value="article">Article/Blog</option>
            <option value="resume">Resume/CV</option>
          </select>
        </div>`;
    case 'react':
      return `
        <div class="pe-mode-options">
          <label class="pe-option-label">Iterations:</label>
          <select id="peReactIter" class="pe-select">
            <option value="3">3 (Standard)</option>
            <option value="5">5 (Deep Research)</option>
            <option value="7">7 (Maximum Depth)</option>
          </select>
          <label class="pe-option-label">Minimum Confidence:</label>
          <select id="peMinConf" class="pe-select">
            <option value="70">70% — Fast</option>
            <option value="85">85% — Balanced</option>
            <option value="95">95% — Maximum</option>
          </select>
        </div>`;
    default:
      return '';
  }
}

// ── EXECUTE MODE ──────────────────────────────────────────────
function executePEMode() {
  const input = document.getElementById('peMainInput')?.value?.trim();
  if (!input) { showPEAlert('Please enter your request first!', 'warning'); return; }

  peState.isProcessing = true;
  peState.currentOutput = '';
  peState.userGoal = input;

  // Build the full prompt
  const promptBuilder = PROMPT_TEMPLATES[peState.activeMode];
  if (!promptBuilder) { showPEAlert('Mode not found!', 'error'); return; }

  // Add mode-specific options to prompt
  let finalPrompt = promptBuilder(input);

  // Append language/framework context
  switch (peState.activeMode) {
    case 'senior_dev': {
      const lang = document.getElementById('peCodeLang')?.value || 'python';
      const focus = document.getElementById('peReviewFocus')?.value || 'all';
      finalPrompt += `\n\nLanguage: ${lang.toUpperCase()}\nReview Focus: ${focus}`;
      break;
    }
    case 'quantum': {
      const fw = document.getElementById('peQuantumFW')?.value || 'both';
      const gates = document.getElementById('peGateTypes')?.value || 'standard';
      finalPrompt += `\n\nQuantum Framework: ${fw}\nGate Type Preference: ${gates}`;
      break;
    }
    case 'react': {
      const iter = document.getElementById('peReactIter')?.value || '3';
      const conf = document.getElementById('peMinConf')?.value || '85';
      finalPrompt += `\n\nRequired iterations: ${iter}\nMinimum confidence threshold: ${conf}%`;
      // Simulate iteration tracking
      peState.reactHistory = [
        { query: `Initial: ${input.slice(0, 50)}...`, confidence: 45, sufficient: false },
        { query: `Refined: specific aspects of ${input.slice(0, 30)}...`, confidence: 72, sufficient: false },
        { query: `Final verification: ${input.slice(0, 30)} current state...`, confidence: 91, sufficient: true },
      ];
      peState.confidenceScore = 91;
      break;
    }
    case 'architect': {
      // Simulate subtask generation
      peState.subtasks = [
        'Requirements Analysis & Architecture Design',
        'Core Data Model & API Design',
        'Frontend UI & Component Structure',
        'Backend Logic & Integration',
        'Testing, Security & Deployment',
      ];
      peState.currentSubtask = 0;
      // Animate through subtasks
      let st = 0;
      const stInterval = setInterval(() => {
        st++;
        peState.currentSubtask = st;
        const panel = document.getElementById('toolPanelContent');
        if (panel && st <= 5) renderPromptEngine(panel);
        if (st >= 5) clearInterval(stInterval);
      }, 1200);
      break;
    }
  }

  // Save to session history
  peState.sessionHistory.push({
    mode: peState.activeMode,
    input: input,
    prompt: finalPrompt,
    timestamp: Date.now(),
  });

  // Send to main chat
  sendPEPromptToChat(finalPrompt);

  peState.isProcessing = false;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderPromptEngine(panel);
}

// ── SEND TO CHAT ──────────────────────────────────────────────
function sendPEPromptToChat(prompt) {
  const input = document.getElementById('message-input');
  if (input) {
    input.value = prompt;
    // Auto-resize
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 300) + 'px';
    // Focus
    input.focus();
    showPEAlert('✅ Power prompt loaded into chat! Press Enter or click Send to execute.', 'success');
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(prompt);
    showPEAlert('📋 Power prompt copied to clipboard! Paste into chat.', 'info');
  }
}

function sendPEToChat() {
  if (peState.currentOutput) {
    const input = document.getElementById('message-input');
    if (input) {
      input.value = `Continue working on this output:\n\n${peState.currentOutput.slice(0, 500)}...`;
      input.focus();
    }
  }
}

// ── HELPERS ───────────────────────────────────────────────────
function setPEMode(mode) {
  peState.activeMode = mode;
  peState.currentOutput = '';
  peState.reactHistory = [];
  peState.subtasks = [];
  peState.currentSubtask = 0;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderPromptEngine(panel);
}

function loadPEPreset(preset) {
  const el = document.getElementById('peMainInput');
  if (el) {
    el.value = preset;
    el.focus();
  }
}

function clearPEInput() {
  const el = document.getElementById('peMainInput');
  if (el) el.value = '';
  peState.currentOutput = '';
  peState.reactHistory = [];
  peState.subtasks = [];
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderPromptEngine(panel);
}

function copyPEOutput() {
  const content = document.getElementById('peOutputContent');
  if (content) {
    navigator.clipboard.writeText(content.innerText || content.textContent);
    showPEAlert('📋 Output copied to clipboard!', 'success');
  } else if (peState.currentOutput) {
    navigator.clipboard.writeText(peState.currentOutput);
    showPEAlert('📋 Output copied!', 'success');
  }
}

function downloadPEOutput() {
  if (!peState.currentOutput) return;
  const mode = PROMPT_MODES.find(m => m.id === peState.activeMode);
  const blob = new Blob([peState.currentOutput], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `goat-${mode?.id || 'prompt'}-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function loadPESession(index) {
  const session = peState.sessionHistory[index];
  if (!session) return;
  peState.activeMode = session.mode;
  const el = document.getElementById('peMainInput');
  if (el) el.value = session.input;
  const panel = document.getElementById('toolPanelContent');
  if (panel) renderPromptEngine(panel);
  setTimeout(() => {
    const inputEl = document.getElementById('peMainInput');
    if (inputEl) inputEl.value = session.input;
  }, 100);
}

function showPEAlert(msg, type = 'info') {
  const colors = { info: '#3b82f6', success: '#22c55e', warning: '#f59e0b', error: '#ef4444' };
  const existing = document.getElementById('peAlert');
  if (existing) existing.remove();
  const alert = document.createElement('div');
  alert.id = 'peAlert';
  alert.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:${colors[type]};color:#fff;padding:12px 20px;
    border-radius:10px;font-size:13px;font-weight:600;
    box-shadow:0 4px 20px rgba(0,0,0,0.4);max-width:420px;
    animation:slideInRight 0.3s ease;
  `;
  alert.textContent = msg;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 4500);
}

// ── EXPORTS ───────────────────────────────────────────────────
window.renderPromptEngine = renderPromptEngine;
window.setPEMode = setPEMode;
window.loadPEPreset = loadPEPreset;
window.clearPEInput = clearPEInput;
window.copyPEOutput = copyPEOutput;
window.downloadPEOutput = downloadPEOutput;
window.sendPEToChat = sendPEToChat;
window.executePEMode = executePEMode;
window.loadPESession = loadPESession;