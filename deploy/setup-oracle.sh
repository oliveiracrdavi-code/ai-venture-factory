#!/usr/bin/env bash
###############################################################################
# AI VENTURE FACTORY - setup na VM (Oracle Cloud Always Free, ou qualquer
# Linux com systemd). Deixa o PAINEL sempre no ar, 24/7, de graca.
#
# Uso (na VM, como usuario normal com sudo):
#   curl -fsSL https://raw.githubusercontent.com/oliveiracrdavi-code/ai-venture-factory/main/deploy/setup-oracle.sh | bash
#
# NAO mexe no que ja roda na VM (Claude Code etc). Cria so:
#   - ~/ai-venture-factory            (clone do repo)
#   - /etc/systemd/system/avf-*.{service,timer}
#   - porta 8080 no loopback (AVF_PORT= para trocar)
#
# Servicos criados:
#   avf-dashboard  -> node scripts/server.js  (o painel)
#   avf-tunnel     -> cloudflared  (URL publica; escreve em company/state/tunnel.txt)
#   avf-tick.timer -> a cada 3 min: git pull + orchestrator tick + publish-state
#                     (tambem mantem a CPU nao-ociosa: mata o reclaim do Oracle)
###############################################################################
set -euo pipefail

REPO_URL="${AVF_REPO_URL:-https://github.com/oliveiracrdavi-code/ai-venture-factory.git}"
DIR="${AVF_DIR:-$HOME/ai-venture-factory}"
PORT="${AVF_PORT:-8080}"
BRANCH="${AVF_BRANCH:-main}"
USER_NAME="$(id -un)"
TICK_SEC="${AVF_TICK_SEC:-180}"

say() { printf '\n\033[1;33m== %s\033[0m\n' "$*"; }

###############################################################################
say "1/7  pacotes base (git, curl)"
if command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y git curl >/dev/null 2>&1 || true
elif command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update -y >/dev/null 2>&1 || true
  sudo apt-get install -y git curl ca-certificates >/dev/null 2>&1 || true
fi

###############################################################################
say "2/7  Node.js (>=18)"
NODE_BIN="$(command -v node || true)"
NODE_OK=0
if [ -n "$NODE_BIN" ]; then
  V="$("$NODE_BIN" -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  [ "${V:-0}" -ge 18 ] && NODE_OK=1
fi
if [ "$NODE_OK" -ne 1 ]; then
  echo "instalando Node via nvm (nao mexe no node do sistema)..."
  export NVM_DIR="$HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  nvm install 22 >/dev/null
  NODE_BIN="$(nvm which 22)"
fi
echo "node = $NODE_BIN ($("$NODE_BIN" -v))"

###############################################################################
say "3/7  cloudflared"
if ! command -v cloudflared >/dev/null 2>&1; then
  case "$(uname -m)" in
    aarch64|arm64) CF_ARCH=arm64 ;;
    x86_64|amd64)  CF_ARCH=amd64 ;;
    *) CF_ARCH=amd64 ;;
  esac
  sudo curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CF_ARCH}" \
    -o /usr/local/bin/cloudflared
  sudo chmod +x /usr/local/bin/cloudflared
fi
echo "cloudflared = $(command -v cloudflared) ($(cloudflared --version 2>/dev/null | head -n1))"

###############################################################################
say "4/7  clonar / atualizar o repo em $DIR"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" fetch --all -q || true
  git -C "$DIR" checkout "$BRANCH" -q || true
  git -C "$DIR" pull --ff-only -q || true
else
  git clone -q --branch "$BRANCH" "$REPO_URL" "$DIR"
fi
chmod +x "$DIR/deploy/tunnel-wrap.sh" || true

###############################################################################
say "5/7  bootstrap (activate.js: pastas de estado, 49 sprites, snapshot)"
( cd "$DIR" && "$NODE_BIN" scripts/activate.js ) || true

###############################################################################
say "6/7  systemd: avf-dashboard, avf-tunnel, avf-tick"
NODE_DIR="$(dirname "$NODE_BIN")"

sudo tee /etc/systemd/system/avf-dashboard.service >/dev/null <<EOF
[Unit]
Description=AI Venture Factory - dashboard (node server.js)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${USER_NAME}
WorkingDirectory=${DIR}
Environment=PATH=${NODE_DIR}:/usr/local/bin:/usr/bin:/bin
ExecStart=${NODE_BIN} ${DIR}/scripts/server.js ${PORT}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/avf-tunnel.service >/dev/null <<EOF
[Unit]
Description=AI Venture Factory - cloudflared tunnel (URL publica)
After=avf-dashboard.service network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${USER_NAME}
WorkingDirectory=${DIR}
Environment=AVF_DIR=${DIR}
Environment=AVF_PORT=${PORT}
Environment=PATH=${NODE_DIR}:/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/bin/env bash ${DIR}/deploy/tunnel-wrap.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/avf-tick.service >/dev/null <<EOF
[Unit]
Description=AI Venture Factory - tick (pull + orchestrator + publish-state)

[Service]
Type=oneshot
User=${USER_NAME}
WorkingDirectory=${DIR}
Environment=PATH=${NODE_DIR}:/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/bin/env bash ${DIR}/deploy/vm-tick.sh
EOF

sudo tee /etc/systemd/system/avf-tick.timer >/dev/null <<EOF
[Unit]
Description=AI Venture Factory - tick a cada ${TICK_SEC}s

[Timer]
OnBootSec=60
OnUnitActiveSec=${TICK_SEC}
AccuracySec=15

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
# restart (nao so enable --now): enable --now NAO reinicia servico ja rodando,
# entao codigo novo do git pull nunca seria carregado sem isto.
sudo systemctl enable avf-dashboard.service avf-tunnel.service avf-tick.timer
sudo systemctl restart avf-dashboard.service
sudo systemctl restart avf-tunnel.service
sudo systemctl restart avf-tick.timer

###############################################################################
say "7/7  aguardando a URL do tunel..."
URLFILE="$DIR/company/state/tunnel.txt"
for i in $(seq 1 30); do
  [ -s "$URLFILE" ] && break
  sleep 2
done

echo
echo "============================================================"
if [ -s "$URLFILE" ]; then
  echo "  PAINEL NO AR (24/7):  $(cat "$URLFILE")"
else
  echo "  Tunel ainda subindo. Rode:  cat $URLFILE   daqui a pouco"
  echo "  ou:  journalctl -u avf-tunnel -n 30 --no-pager"
fi
echo "============================================================"
echo "  status:   systemctl status avf-dashboard avf-tunnel avf-tick.timer"
echo "  logs:     journalctl -u avf-dashboard -f"
echo "  parar:    sudo systemctl disable --now avf-dashboard avf-tunnel avf-tick.timer"
echo
echo "  URL fixa (opcional): 'cloudflared tunnel login' + named tunnel,"
echo "  depois exporte AVF_TUNNEL_HOSTNAME/AVF_TUNNEL_NAME e reinicie avf-tunnel."
echo "  Push do estado p/ GitHub Pages: rode com  AVF_GIT_PUSH=1  e configure"
echo "  um remote com token. Ver deploy/README.md."
echo
