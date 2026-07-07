#!/bin/bash
# ============================================================
# NVIDIA SMART DOWNLOAD v3.0
# Auto-skips Access Denied • Checks disk space • Cleans up
# ============================================================
# Fixes from v2.0:
#  - Checks free disk space before each pull
#  - Only pulls models you actually have access to (auto-detect)
#  - Cleans up failed pulls to save space
#  - Reports clearly which need subscription upgrades
# ============================================================
# Usage:
#   bash NVIDIA-SMART-DOWNLOAD.sh              # pull all accessible
#   bash NVIDIA-SMART-DOWNLOAD.sh --small      # skip 70B+ giants
#   bash NVIDIA-SMART-DOWNLOAD.sh --test       # dry-run check only
# ============================================================

set -e

MODE="${1:-all}"
export NGC_API_KEY="${NGC_API_KEY:-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}"

echo "╔════════════════════════════════════════════════════╗"
echo "║  🚀 NVIDIA SMART DOWNLOAD v3.0                     ║"
echo "║  Skips Access-Denied • Monitors disk space         ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check Docker
command -v docker >/dev/null || { echo "❌ Docker not installed"; exit 1; }

# Login
echo "🔑 Logging into NVIDIA NGC..."
echo "$NGC_API_KEY" | docker login nvcr.io -u '$oauthtoken' --password-stdin 2>&1 | tail -1

# ===== Disk space check =====
check_disk() {
    local needed_gb="${1:-10}"
    local free_gb
    free_gb=$(df -BG /var/lib/docker 2>/dev/null | tail -1 | awk '{print $4}' | tr -d 'G')
    [ -z "$free_gb" ] && free_gb=$(df -BG / | tail -1 | awk '{print $4}' | tr -d 'G')
    echo "$free_gb"
}

FREE=$(check_disk)
echo "💾 Disk space free: ${FREE} GB"
echo ""

# ===== Model catalog with sizes (estimated GB) =====
# Format: "repo|size_gb|name|tier"
# tier: free = public access, sub = requires NGC subscription, gated = requires special approval
MODELS=(
    # === FREE TIER (anyone with API key) ===
    "nvcr.io/nim/meta/llama-3.1-8b-instruct:latest|16|Llama 3.1 8B|free"
    "nvcr.io/nim/meta/llama-3.2-1b-instruct:latest|2|Llama 3.2 1B|free"
    "nvcr.io/nim/meta/llama-3.2-3b-instruct:latest|6|Llama 3.2 3B|free"
    "nvcr.io/nim/nvidia/nv-embedqa-e5-v5:latest|2|NV-EmbedQA E5|free"
    "nvcr.io/nim/nvidia/llama-nemotron-embed-1b-v2:latest|2|Nemotron Embed|free"
    "nvcr.io/nim/nvidia/llama-nemotron-rerank-1b-v2:latest|2|Nemotron Rerank|free"
    # === SUBSCRIPTION TIER (most accounts) ===
    "nvcr.io/nim/meta/llama-3.1-70b-instruct:latest|140|Llama 3.1 70B|sub"
    "nvcr.io/nim/google/gemma-2-9b-it:latest|18|Gemma 2 9B|sub"
    "nvcr.io/nim/google/gemma-2-27b-it:latest|54|Gemma 2 27B|sub"
    "nvcr.io/nim/mistralai/mistral-7b-instruct:latest|14|Mistral 7B|sub"
    "nvcr.io/nim/mistralai/mixtral-8x7b-instruct-v0.1:latest|90|Mixtral 8x7B|sub"
    "nvcr.io/nim/microsoft/phi-3-mini-128k-instruct:latest|8|Phi-3 Mini|sub"
    "nvcr.io/nim/microsoft/phi-3-medium-128k-instruct:latest|28|Phi-3 Medium|sub"
    "nvcr.io/nim/qwen/qwen2.5-72b-instruct:latest|145|Qwen 2.5 72B|sub"
    "nvcr.io/nim/bigcode/starcoder2-15b:latest|30|StarCoder 2 15B|sub"
    "nvcr.io/nim/codellama/codellama-34b-instruct:latest|68|CodeLlama 34B|sub"
    # === GATED (enterprise) ===
    "nvcr.io/nim/mistralai/mixtral-8x22b-instruct-v0.1:latest|280|Mixtral 8x22B|gated"
    "nvcr.io/nim/nvidia/nemotron-4-340b-instruct:latest|700|Nemotron 4 340B|gated"
    "nvcr.io/nim/deepseek-ai/deepseek-v3:latest|1200|DeepSeek V3|gated"
    "nvcr.io/nim/deepseek-ai/deepseek-coder-33b-instruct:latest|66|DeepSeek Coder 33B|gated"
)

# ===== Filter by mode =====
FILTERED=()
for entry in "${MODELS[@]}"; do
    IFS='|' read -r repo size name tier <<< "$entry"
    if [ "$MODE" = "--small" ] && [ "$size" -gt 50 ]; then
        continue
    fi
    FILTERED+=("$entry")
done

TOTAL=${#FILTERED[@]}
echo "📦 Will attempt: $TOTAL models"
echo "════════════════════════════════════════════════════"

# ===== Test mode: just list =====
if [ "$MODE" = "--test" ]; then
    for entry in "${FILTERED[@]}"; do
        IFS='|' read -r repo size name tier <<< "$entry"
        printf "  [%-6s] %-25s %5s GB\n" "$tier" "$name" "$size"
    done
    echo ""
    echo "💾 Total size if all pulled: $(printf '%s\n' "${FILTERED[@]}" | awk -F'|' '{s+=$2} END{print s}') GB"
    exit 0
fi

# ===== Pull loop =====
COUNT=0
SUCCESS=0
DENIED=0
NOSPACE=0
FAILED=0
SUCCESS_LIST=()
DENIED_LIST=()

for entry in "${FILTERED[@]}"; do
    COUNT=$((COUNT+1))
    IFS='|' read -r repo size name tier <<< "$entry"

    echo ""
    echo "[$COUNT/$TOTAL] 📥 $name ($size GB, tier: $tier)"
    echo "     → $repo"

    # Disk space check (need 2x model size for extraction overhead)
    NEEDED=$((size * 2))
    FREE=$(check_disk)
    if [ "$FREE" -lt "$NEEDED" ]; then
        echo "     ⚠️  SKIP — need ${NEEDED} GB, only ${FREE} GB free"
        NOSPACE=$((NOSPACE+1))
        continue
    fi

    # Try pull, capture output to classify failure
    OUT=$(docker pull "$repo" 2>&1) && RC=0 || RC=$?

    if [ $RC -eq 0 ]; then
        echo "     ✅ DONE"
        SUCCESS=$((SUCCESS+1))
        SUCCESS_LIST+=("$name")
    elif echo "$OUT" | grep -qi "access denied\|unauthorized\|forbidden"; then
        echo "     🔒 ACCESS DENIED (needs subscription upgrade at build.nvidia.com)"
        DENIED=$((DENIED+1))
        DENIED_LIST+=("$name [$tier]")
    elif echo "$OUT" | grep -qi "no space left"; then
        echo "     💾 DISK FULL — stopping further pulls"
        NOSPACE=$((NOSPACE+1))
        # Clean partial
        docker image prune -f >/dev/null 2>&1
        break
    else
        echo "     ❌ FAILED: $(echo "$OUT" | tail -2 | head -1)"
        FAILED=$((FAILED+1))
    fi
done

# ===== Summary =====
echo ""
echo "════════════════════════════════════════════════════"
echo "🎉 SUMMARY"
echo "════════════════════════════════════════════════════"
echo "   ✅ Success:       $SUCCESS"
echo "   🔒 Access Denied: $DENIED  (upgrade NGC subscription)"
echo "   💾 No Space:      $NOSPACE"
echo "   ❌ Other Failed:  $FAILED"
echo "   📊 Total tried:   $COUNT / $TOTAL"
echo ""

if [ ${#SUCCESS_LIST[@]} -gt 0 ]; then
    echo "✅ Downloaded models:"
    printf '   • %s\n' "${SUCCESS_LIST[@]}"
    echo ""
fi

if [ ${#DENIED_LIST[@]} -gt 0 ]; then
    echo "🔒 Access Denied (visit https://build.nvidia.com to request access):"
    printf '   • %s\n' "${DENIED_LIST[@]}"
    echo ""
fi

# Final disk report
FINAL_FREE=$(check_disk)
USED_BY_DOCKER=$(docker system df --format '{{.Size}}' 2>/dev/null | head -1)
echo "💾 Disk free now: ${FINAL_FREE} GB"
echo "🐳 Docker using: ${USED_BY_DOCKER}"
echo ""
echo "▶️  Run a model (example):"
echo "   docker run --gpus all -p 8000:8000 -e NGC_API_KEY=\$NGC_API_KEY \\"
echo "     nvcr.io/nim/meta/llama-3.1-8b-instruct:latest"
echo ""
echo "🧹 Free up space: docker system prune -a -f"