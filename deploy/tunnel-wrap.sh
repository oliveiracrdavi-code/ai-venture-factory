#!/usr/bin/env bash
# tunnel-wrap.sh - roda o cloudflared e grava a URL publica atual em
# company/state/tunnel.txt (para o painel/monitor mostrarem o link).
# Named tunnel se AVF_TUNNEL_HOSTNAME estiver setado e houver login; senao
# quick tunnel (*.trycloudflare.com, efemera, sem conta).
set -u
DIR="${AVF_DIR:-$HOME/ai-venture-factory}"
PORT="${AVF_PORT:-8080}"
STATE="$DIR/company/state"
mkdir -p "$STATE"
URLFILE="$STATE/tunnel.txt"

writer() {
  # le stdin, extrai a primeira URL https e grava
  while IFS= read -r line; do
    echo "$line"
    u=$(printf '%s\n' "$line" | grep -oE 'https://[a-zA-Z0-9._-]+\.(trycloudflare\.com|cfargotunnel\.com)[^ ]*' | head -n1)
    if [ -n "${u:-}" ]; then
      printf '%s\n' "$u" > "$URLFILE"
    fi
  done
}

if [ -n "${AVF_TUNNEL_HOSTNAME:-}" ] && [ -f "$HOME/.cloudflared/cert.pem" ]; then
  # named tunnel -> hostname estavel
  cloudflared tunnel run --url "http://127.0.0.1:${PORT}" "${AVF_TUNNEL_NAME:-avf}" 2>&1 | writer
  echo "https://${AVF_TUNNEL_HOSTNAME}" > "$URLFILE"
else
  exec 3>&1
  cloudflared tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate 2>&1 | writer
fi
