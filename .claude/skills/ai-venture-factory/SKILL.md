---
name: ai-venture-factory
description: >-
  Ativa a AI Venture Factory: startup simulada de 49 agentes de IA que pesquisam,
  validam, constroem, protegem, testam, divulgam e monetizam apps por assinatura.
  Funciona em QUALQUER projeto/sessao (nuvem ou local): instala a skill via git
  clone se ainda nao estiver presente, sobe o painel local (dashboard) e integra
  o pipeline ao projeto da sessao atual. Use quando o usuario disser "ative o ai
  venture factory", "ativar ai venture factory", "start ai venture factory",
  "abrir o painel da fabrica", mandar o link do GitHub da fabrica, ou equivalente.
---

# AI Venture Factory — skill portatil

Esta skill e' **auto-contida**: todo o codigo, os 49 agentes e o painel vivem
dentro dela mesma (`.claude/skills/ai-venture-factory/`). O `company/` (specs,
tasks, decisoes, logs, estado) e' sempre criado **no projeto onde a sessao
esta rodando** (o cwd), nunca dentro da skill. Isso e' o que permite clonar a
mesma skill em N projetos diferentes e cada um ter sua propria fabrica,
operando sobre o SEU proprio codigo.

Quando o usuario pedir para **ativar a AI Venture Factory** (ou abrir o
painel), faca EXATAMENTE isto, em ordem, sem pular passo:

## 0. Garanta que a skill esta instalada NESTE projeto
Verifique se `.claude/skills/ai-venture-factory/scripts/activate.js` existe
no projeto atual (cwd da sessao). Se **nao** existir (primeira vez neste
projeto), clone a skill para dentro dele:

```bash
git clone <URL_QUE_O_USUARIO_MANDOU_OU_A_PADRAO> .claude/skills/ai-venture-factory
```

- Se o usuario mandou uma URL de GitHub da fabrica, use essa.
- Se ele so disse "ative o ai venture factory" sem link, use a URL padrao:
  `https://github.com/oliveiracrdavi-code/ai-venture-factory` (ou pergunte se
  ele tem um fork proprio).
- Nao apague nada do projeto do usuario: clone so em
  `.claude/skills/ai-venture-factory/` (subpasta nova, isolada).
- Se `.claude/skills/ai-venture-factory` ja existir e o usuario pedir para
  **atualizar** a skill, rode `git -C .claude/skills/ai-venture-factory pull`
  em vez de clonar de novo.

Se a sessao atual **e'** o proprio repositorio da fabrica (a skill esta na
raiz por historico, nao em `.claude/skills/`), pule este passo.

## 1. Bootstrap
Rode (caminho relativo ao projeto atual):

```bash
node .claude/skills/ai-venture-factory/scripts/activate.js
```

Isso, **dentro do projeto atual** (`company/` fica aqui, nao na skill):
- garante as pastas de estado (`company/{tasks,projects,decisions,security,
  marketing,reports,state,metrics,logs,inbox,memory}`);
- **instala os hooks de log** no `.claude/settings.json` do projeto atual
  (merge idempotente — nunca sobrescreve o que ja existir), apontando para
  `scripts/logger.js` da skill;
- gera os 49 sprites dentro da skill se faltarem (compartilhados, gerados
  uma vez so, nao por projeto);
- roda o `snapshot` (`company/state/agents.json` + `pipeline.json` +
  `security.json`);
- imprime um resumo (skill root, projeto root, agentes, hooks).

Idempotente: rodar de novo num projeto que ja tem tudo nao quebra nada.

## 2. Integre com o projeto da sessao atual
A fabrica detecta sozinha se o projeto atual ja e' um projeto real (tem
`package.json` e/ou `README.md`) ou um checkout novo/vazio:

- **Projeto existente:** o `seed-tasks.js` (passo 4) usa o nome/descricao
  reais do projeto para preencher a `idea.md` — a pesquisa (A01–A04) e'
  sobre o NICHO desse projeto especifico, nao um produto generico do zero.
  A partir do gate G6 (engenharia), os agentes de build (A17 tech-lead em
  diante) escrevem e mergeiam codigo **na raiz real do repositorio atual**
  (fora de `company/`) — branches, commits, testes, tudo de verdade nesse
  projeto. `company/` fica só com a gestão (brief, blueprint, decisões,
  changelog, logs); o produto em si nunca mora lá dentro.
- **Checkout vazio:** sem projeto real ainda, a fabrica roda no modo
  original — A01–A04 propõem 3 nichos e o humano escolhe qual virar
  `app-001` (ou o slug que você/ele preferir).

Você (a sessão do Claude Code) é quem efetivamente atua como cada agente
ativado pelo `orchestrator.js tick`, seguindo o `.md` dele em `agents/` e
respeitando o nível de permissão (`reference/org/permissoes.md`). Ajuste
`/model` e `/effort` conforme o tick recomenda antes de agir como aquele
agente.

## 3. Suba o painel e pegue o link
**Onde tem link clicavel:**

- **Claude Code local / app Claude Desktop** (roda na maquina do usuario):
  use `preview_start` com `{ "name": "ai-venture-factory" }` se a config
  `.claude/launch.json` da skill estiver disponivel para o preview do host,
  ou rode `node .claude/skills/ai-venture-factory/scripts/server.js 8080`
  em background -> `http://127.0.0.1:8080`. **Entregue essa URL ao usuario.**

- **Sessao na nuvem / web (claude.ai/code):** NAO ha como expor a porta 8080
  para o navegador do usuario — essas sessoes rodam num container sem
  `preview_start` e sem port-forward/ingress. O server SOBE (responde 200 em
  `127.0.0.1:8080` dentro do container) mas fica inacessivel de fora. Seja
  honesto sobre essa limitação — o pipeline multiagente roda normalmente
  (arquivos + orchestrator + PR real no repositorio), só o PAINEL VISUAL é
  que não abre no navegador do usuário nessa sessão. Para ver o painel,
  instrua a rodar localmente:

  ```bash
  # dentro do projeto que ja tem a skill instalada:
  node .claude/skills/ai-venture-factory/scripts/server.js 8080
  # abra http://127.0.0.1:8080
  ```

## 4. Reporte
Responda ao usuario com:
- se a skill foi (re)instalada ou ja existia;
- a URL do painel (ou a limitacao de sessao na nuvem);
- que o painel tem 6 paginas (Visao geral, Agentes, Detalhe ao vivo, Chat,
  Financeiro, Seguranca) e faz polling a cada 2,5s;
- que o pipeline ainda esta vazio ate rodar o piloto (passo 5), e se o
  projeto atual foi detectado como projeto existente ou checkout vazio.

## 5. (Opcional) Enfileirar o piloto e comecar a executar
Se o usuario pedir para "comecar", "rodar o piloto" ou "integrar com meu
projeto":

```bash
node .claude/skills/ai-venture-factory/scripts/seed-tasks.js
node .claude/skills/ai-venture-factory/scripts/orchestrator.js tick
```

`seed-tasks.js` cria `company/projects/<slug>/` + `TASK-0001..0008` (pesquisa
G1 + viabilidade G2), usando o contexto real do projeto quando detectado.
`orchestrator.js tick` avanca a fila um passo, respeitando o teto de **5
agentes ativos**, e imprime o `model`/`effort` recomendado de cada agente
ativado. Depois de rodar o tick, **execute voce mesmo** o trabalho de cada
agente ativado (ler o `.md` dele em `agents/`, produzir o artefato pedido,
registrar em `company/logs/events.jsonl`) antes de rodar o proximo tick —
o orchestrator so agenda, quem trabalha e' voce agindo como aquele papel.
Repita tick -> trabalho -> tick ate o pipeline avancar pelos gates G0..G10.

Passe `--with-idea "texto da ideia"` ao `seed-tasks.js` se o usuario ja tiver
uma ideia especifica (sobrescreve a deteccao automatica); `--project <slug>`
para forcar um nome de projeto; `--force` para regravar TASKs existentes.

## Regras que valem sempre nesta fabrica
- Estado vive em ARQUIVOS (`company/**` do projeto ALVO), nunca so no
  contexto.
- Nenhum agente aprova o proprio trabalho. CEO (A07) so aprova com score >= 85
  e zero risco critico.
- Seguranca (A31–A36) e QA (A37–A42) podem BLOQUEAR o pipeline.
- Humano aprova: deploy em producao, gasto de dinheiro, uso de secret sensivel,
  1o post de cada canal de marketing.
- Marketing publica em `method: "manual"` -> `company/marketing/outbox/`
  ("AGUARDANDO CLIQUE HUMANO") ate o humano habilitar `method: "api"`.
- O logger (`scripts/logger.js` da skill, ligado pelo `.claude/settings.json`
  **do projeto atual** — instalado automaticamente no passo 1) mascara
  `sk-…`, `ghp_…`, `AKIA…`, `Bearer …`, linhas de `.env` — nenhum secret entra
  em log/chat/prompt.
- O server so serve uma allowlist (dashboard da skill, `company/state/`,
  `company/metrics/`, `events.jsonl`, `posts.jsonl`, `company/logs/chats/`,
  `company/projects/` — todos do projeto ATUAL); todo o resto -> 403. Escuta
  so em `127.0.0.1`.
- A partir do G6, "codigo do app" = a raiz real do projeto atual (fora de
  `company/`), nao um sandbox — ver `reference/org/permissoes.md`.

## Mapa rapido (tudo relativo a `.claude/skills/ai-venture-factory/`)
- `reference/spec.md` — especificacao verbatim (14 partes, pipeline G0–G10).
- `reference/spec-anexo-b.md` — modelo/effort/fallback + stack de skills dos 49.
- `reference/org/organograma.md`, `permissoes.md` (niveis N1–N5), `skills-fundador.md`.
- `reference/templates/` — `brief.md`, `score.md`, `TASK.md` (referencia de formato).
- `agents/A01..A49-*.md` — um arquivo por agente.
- `dashboard/` — painel estatico (`index.html`, `app.js`, `styles.css`, `sprites/`).
- `scripts/` — `activate`, `server`, `orchestrator` (tick), `snapshot`,
  `logger`, `seed-tasks`, `gen-sprites`, `publish-state`.

Tudo em `scripts/` resolve dois "roots" automaticamente (`avf-lib.js`):
`SKILL_ROOT` (onde a skill esta instalada — so leitura: agentes, dashboard,
reference) e `PROJECT_ROOT` (o cwd de quem chamou — onde `company/`, `.env` e
`.claude/settings.json` do projeto vivem). Nunca hardcode um dos dois; use
sempre `require('./avf-lib').P`.
