# project-sensitive-files

Command: cd "$ROOT" && find . -maxdepth 4 -type f \( -iname "*.env" -o -iname "auth.json" -o -iname "*token*" -o -iname "*secret*" -o -iname "*credential*" -o -iname "*.key" -o -iname "id_*" -o -iname "*.sqlite" -o -iname "*.sqlite-wal" -o -iname "*.sqlite-shm" \) ! -path "./Deploy/ubuntu-goat-agent-007/build/*" ! -path "./Deploy/build/*" -print | sort | sed -n "1,260p"

```text
./Archive/20260612-AGENT007-CLEANUP/01-Legacy-AGENT-007-Raspy/agent-007-image-runtimes.env
./BackupVault/Money-Penny-Home/GOAT-LOCAL-SECRET-SCAN-20260526.md
./Duplicates-Review/Archive-Bundles/AGENT-007-THOR-ONE-FOLDER/.agent-007-one-folder.env
./GOAT-App/goat-royalty-portable-2.0.0/web-app/goat-token-swap.html
./GOAT-Royalty-App2-GOAT-APP/SUPABASE_CREDENTIALS_HELPER.md
./LM-Studio-0.4.15-2-arm64/Black History ebooks/Black_History_eBooks_Pack_62_Black Secret Societies pt1.rar
./LM-Studio-0.4.15-2-arm64/Black History ebooks/Black_History_eBooks_Pack_62_Black Secret Societies pt2.rar
./LM-Studio-0.4.15-2-arm64/Black History ebooks/Black_History_eBooks_Pack_62_Black Secret Societies pt3.rar
./LM-Studio-0.4.15-2-arm64/lmstudio-community/ERNIE-4.5-21B-A3B-MLX-4bit/added_tokens.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/ERNIE-4.5-21B-A3B-MLX-4bit/special_tokens_map.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/ERNIE-4.5-21B-A3B-MLX-4bit/tokenizer.model
./LM-Studio-0.4.15-2-arm64/lmstudio-community/ERNIE-4.5-21B-A3B-MLX-4bit/tokenizer_config.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/GLM-4.6V-Flash-MLX-4bit/special_tokens_map.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/GLM-4.6V-Flash-MLX-4bit/tokenizer.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/GLM-4.6V-Flash-MLX-4bit/tokenizer_config.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/NVIDIA-Nemotron-3-Nano-30B-A3B-MLX-4bit/tokenizer.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/NVIDIA-Nemotron-3-Nano-30B-A3B-MLX-4bit/tokenizer_config.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/Qwen2.5-Coder-14B-Instruct-MLX-4bit/added_tokens.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/Qwen2.5-Coder-14B-Instruct-MLX-4bit/special_tokens_map.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/Qwen2.5-Coder-14B-Instruct-MLX-4bit/tokenizer.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/Qwen2.5-Coder-14B-Instruct-MLX-4bit/tokenizer_config.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/Qwen2.5-Coder-32B-Instruct-MLX-4bit/added_tokens.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/Qwen2.5-Coder-32B-Instruct-MLX-4bit/special_tokens_map.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/Qwen2.5-Coder-32B-Instruct-MLX-4bit/tokenizer.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/Qwen2.5-Coder-32B-Instruct-MLX-4bit/tokenizer_config.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/gemma-4-26B-A4B-it-QAT-MLX-4bit/tokenizer.json
./LM-Studio-0.4.15-2-arm64/lmstudio-community/gemma-4-26B-A4B-it-QAT-MLX-4bit/tokenizer_config.json
./LM-Studio-0.4.15-2-arm64/mlx-community/gpt-oss-20b-MXFP4-Q8/special_tokens_map.json
./LM-Studio-0.4.15-2-arm64/mlx-community/gpt-oss-20b-MXFP4-Q8/tokenizer.json
./LM-Studio-0.4.15-2-arm64/mlx-community/gpt-oss-20b-MXFP4-Q8/tokenizer_config.json
./LM-Studio-0.4.15-2-arm64/rar/secret_garden_pack_000447 1.rar
./LM-Studio-0.4.15-2-arm64/rar/secret_garden_pack_000447 2.rar
./LM-Studio-0.4.15-2-arm64/sources/dlmanifests/credential-manager-dl.man
./OSCAR-THOR-ONE-FOLDER/GOAT-Royalty-App.mac-backup-20260602/.env
./OSCAR-THOR-ONE-FOLDER/GOAT-Royalty-App.mac-backup-20260602/goat-token-swap.html
./OSCAR-THOR-ONE-FOLDER/oscar-image-runtimes.env
./Portable-AI-USB-main/anythingllm_data/storage/.env
./Portable-AI-USB-main/nextjs-commerce-main/.env
./Python314/Lib/__pycache__/token.cpython-314.pyc
./Python314/Lib/__pycache__/tokenize.cpython-314.pyc
./Python314/Lib/secrets.py
./Python314/Lib/test/test_secrets.py
./Python314/Lib/test/test_tokenize.py
./Python314/Lib/token.py
./Python314/Lib/tokenize.py
./Python314/include/internal/pycore_token.h
./Shared/.codex/auth.json
./Shared/.codex/goals_1.sqlite
./Shared/.codex/goals_1.sqlite-shm
./Shared/.codex/goals_1.sqlite-wal
./Shared/.codex/logs_2.sqlite
./Shared/.codex/logs_2.sqlite-shm
./Shared/.codex/logs_2.sqlite-wal
./Shared/.codex/memories_1.sqlite
./Shared/.codex/memories_1.sqlite-shm
./Shared/.codex/memories_1.sqlite-wal
./Shared/.codex/state_5.sqlite
./Shared/.codex/state_5.sqlite-shm
./Shared/.codex/state_5.sqlite-wal
./Shared/.grok/auth.json
./Shared/.grok/sessions/session_search.sqlite
./Shared/.hermes/.env
./Shared/.ollama-runtime/.ollama/id_ed25519
./Shared/.ollama-runtime/.ollama/id_ed25519.pub
./Shared/.ollama/id_ed25519
./Shared/.ollama/id_ed25519.pub
./Training/Fine-Tune-LLMs/5. Token cost calculation.mp4
./Training/Fine-Tune-LLMs/Fine Tune LLMs OPENAI/5. Token cost calculation.mp4
./config/agent-007-fkd1.env
./config/agent-007.env
./goat-royalty-portable-2.0.0/web-app/goat-token-swap.html
./image-runtimes/stable-diffusion-webui-forge/javascript/token-counters.js
./image-runtimes/stable-diffusion-webui/javascript/token-counters.js

```
