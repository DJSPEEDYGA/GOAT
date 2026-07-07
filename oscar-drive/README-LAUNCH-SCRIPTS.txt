Oscar + Crew Agent Manual Launch Scripts
=========================================

These scripts live on the Oscar Drive and are ready to run manually.

Files
-----

launch-ollama-11435.sh          Start the Ollama engine on port 11435
launch-oscar-3333.sh            Start the main Oscar chat server on port 3333
launch-agent-007-3334.sh        Start Agent 007 chat server on port 3334
launch-crew-agents.command      Open the GOAT crew agent web pages
launch-all-oscar-agents.command Start everything + open crew agents

Crew agents
-----------

The main AI crew members are accessed through the web launchers:

  - Oscar (master)      http://localhost:3333
  - Agent 007           http://localhost:3334
  - Money Penny         money-penny-launcher.html
  - Lexicon Lexi        lexicon-lexi-launcher.html
  - Ms Vanessa          ms-vanessa-launcher.html
  - Ms Nexus            ms-nexus-launcher.html
  - Sir Codex           sir-codex-launcher.html

The full agents dashboard is at:

  /Volumes/Oscar/Master-Oscar/goat-royalty-portable-2.0.0/web-app/agents.html

Quick start
-----------

Double-click or run in Terminal:

  /Volumes/Oscar/Master-Oscar/Shared/scripts/launch-all-oscar-agents.command

It starts the Ollama engine, Oscar (3333), Agent 007 (3334), and opens the
crew agent pages in your browser.

Notes
-----

- These scripts check if the service is already running and skip it if so.
- They use the Oscar Drive model store at:
  /Volumes/Oscar/Master-Oscar/Shared/models/ollama_data
- The Ollama engine runs on port 11435 to avoid conflict with the system Ollama.
- You can also launch individual services by running the specific scripts.
