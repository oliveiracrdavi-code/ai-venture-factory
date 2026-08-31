#!/usr/bin/env bash
# vm-tick.sh — 1 tick da VM (chamado pelo avf-tick.timer a cada N s).
# Sincroniza o CÓDIGO com origin/main de forma robusta (reset --hard, que
# NÃO remove arquivos de runtime não-versionados: state/*.json, human-chat,
# TASK-*.md novos, tunnel.txt), roda o orchestrator e publica o estado.
set -u
DIR="${AVF_DIR:-$HOME/ai-venture-factory}"
NODE="$(command -v node || echo /usr/local/bin/node)"
cd "$DIR" || exit 0

# 1) sincroniza código (idempotente, nunca aborta o tick)
git config --global --add safe.directory "$DIR" 2>/dev/null || true
git fetch -q origin main 2>/dev/null || true
git reset --hard -q origin/main 2>/dev/null || git pull --ff-only -q 2>/dev/null || true

# 2) avança a fila 1 passo (gera company/state via snapshot embutido)
"$NODE" "$DIR/.claude/skills/ai-venture-factory/scripts/orchestrator.js" tick 2>/dev/null || true

# 3) publica o estado para docs/ (+ push se AVF_GIT_PUSH setado no ambiente)
if [ -n "${AVF_GIT_PUSH:-}" ]; then
  "$NODE" "$DIR/.claude/skills/ai-venture-factory/scripts/publish-state.js" --push 2>/dev/null || true
else
  "$NODE" "$DIR/.claude/skills/ai-venture-factory/scripts/publish-state.js" 2>/dev/null || true
fi
