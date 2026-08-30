# deploy/ — AI Venture Factory sempre no ar (24/7, grátis)

Sobe o **painel** numa VM Linux com `systemd` (Oracle Cloud Always Free é o
alvo, mas serve qualquer uma). Não mexe no que já roda na VM.

## Instalação (1 comando, na VM)

```bash
curl -fsSL https://raw.githubusercontent.com/oliveiracrdavi-code/ai-venture-factory/main/deploy/setup-oracle.sh | bash
```

O script:
1. instala `git`, Node ≥18 (via `nvm`, sem tocar no Node do sistema), `cloudflared`;
2. clona o repo em `~/ai-venture-factory`;
3. roda `scripts/activate.js` (pastas de estado, 49 sprites, snapshot);
4. cria 3 unidades `systemd`:

| Unidade | O que faz |
|---|---|
| `avf-dashboard.service` | `node scripts/server.js 8080` — o painel |
| `avf-tunnel.service` | `cloudflared` — URL pública; grava em `company/state/tunnel.txt` |
| `avf-tick.timer` | a cada 3 min: `git pull` + `orchestrator.js tick` + `publish-state.js`. Também mantém a CPU não-ociosa → **mata o reclaim por ociosidade do Oracle** |

No fim ele imprime a **URL do painel**. Abra no celular/desktop — polling
2,5 s, 6 páginas, e o **chat funciona** (server real atrás do túnel).

### Variáveis (opcionais, antes do comando)

```bash
AVF_PORT=8090            # se 8080 já estiver em uso na VM
AVF_TICK_SEC=120         # intervalo do tick
AVF_GIT_PUSH=1           # publish-state faz git push (precisa remote com token, ver abaixo)
AVF_BRANCH=main
```

## Coexistência com o Claude Code que já roda na VM

Zero conflito: dir própria (`~/ai-venture-factory`), unidades `avf-*`, porta
8080 só no loopback, Node isolado por `nvm`. O Claude Code segue intacto.
Para o Claude Code **fazer o trabalho dos 49 agentes**, rode uma sessão nele
(ou uma routine) apontando pra `~/ai-venture-factory` com o prompt
_"ative o ai venture factory e rode o piloto"_ — ele escreve em `company/**`
e dá commit/push; o `avf-tick` puxa e o painel reflete em até 3 min.

## URL FIXA (em vez da `*.trycloudflare.com` que troca a cada restart)

Túnel nomeado da Cloudflare (grátis, precisa de um domínio na sua conta CF):

```bash
cloudflared tunnel login                     # abre o navegador, 1 vez
cloudflared tunnel create avf
cloudflared tunnel route dns avf painel.seudominio.com
# depois:
export AVF_TUNNEL_NAME=avf
export AVF_TUNNEL_HOSTNAME=painel.seudominio.com
sudo systemctl restart avf-tunnel
```

Sem domínio? Alternativa: deixe `AVF_GIT_PUSH=1`. O `publish-state.js` publica
`docs/` (dashboard + estado + `tunnel.txt`) no repo → ligue **GitHub Pages**
(repo público) ou **Cloudflare Pages** apontando pra pasta `docs/`. Aí você
tem uma **URL de monitor fixa** (`docs/`), e `docs/state/tunnel.txt` sempre
tem o link vivo do momento.

### Remote com token para o push (só se AVF_GIT_PUSH=1)

```bash
cd ~/ai-venture-factory
git remote set-url origin https://<SEU_GITHUB_PAT>@github.com/oliveiracrdavi-code/ai-venture-factory.git
```
Use um PAT fine-grained com permissão de **Contents: read/write** só nesse repo.

## Operar

```bash
systemctl status avf-dashboard avf-tunnel avf-tick.timer
journalctl -u avf-dashboard -f
journalctl -u avf-tunnel -n 40 --no-pager      # ver a URL
cat ~/ai-venture-factory/company/state/tunnel.txt

sudo systemctl restart avf-tunnel              # nova URL (quick tunnel)
sudo systemctl disable --now avf-dashboard avf-tunnel avf-tick.timer   # parar tudo
```

## Remoção total

```bash
sudo systemctl disable --now avf-dashboard avf-tunnel avf-tick.timer avf-tick.service
sudo rm /etc/systemd/system/avf-*.{service,timer}
sudo systemctl daemon-reload
rm -rf ~/ai-venture-factory
```
