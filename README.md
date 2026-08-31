# AI VENTURE FACTORY

Startup **simulada** de **49 agentes de IA** que pesquisam ideias de apps,
validam, constroem, protegem, testam, divulgam (gerando **e** postando
conteúdo), monetizam por assinatura e monitoram — tudo com **pipeline de gates**
e **estado em arquivos**.

100% local, **zero dependência** (`node` puro ≥ 18), **zero custo** além do seu
plano do Claude. Nada de nuvem paga, nada de `npm install`.

---

## ⚡ Ativar numa sessão do Claude (nuvem ou local, em QUALQUER projeto)

A skill é **portátil**: pode ser usada dentro deste repositório OU dentro de
**qualquer outro projeto seu**. Numa sessão do Claude Code em qualquer
projeto, mande o link deste repositório e diga:

> **ative o ai venture factory**

Se a skill ainda não estiver no projeto atual, a sessão clona este
repositório para dentro dele em `.claude/skills/ai-venture-factory/` (não
mexe em mais nada) e a partir daí:

1. roda `node .claude/skills/ai-venture-factory/scripts/activate.js`
   (bootstrap idempotente: pastas de estado do projeto atual, hooks de log e
   `launch.json` instalados automaticamente, 49 sprites, `snapshot`);
2. sobe o painel via `preview_start` (config `ai-venture-factory`, porta
   **8080**);
3. te devolve **o link do painel** — numa sessão na nuvem o preview vira um
   link compartilhável; local, é `http://127.0.0.1:8080`.
4. se o projeto atual já tiver código (README/`package.json`), a fábrica
   detecta e **integra o pipeline a esse projeto real** — pesquisa o nicho
   dele e, a partir do gate G6, constrói/mergeia código de verdade na raiz
   desse repositório (não numa simulação à parte).

Depois, se quiser rodar o piloto:

> **começar o piloto** — (roda `seed-tasks.js` + `orchestrator.js tick`)

Veja o passo a passo completo em
[`.claude/skills/ai-venture-factory/SKILL.md`](.claude/skills/ai-venture-factory/SKILL.md).

---

## Rodar à mão (sem a skill)

```bash
node .claude/skills/ai-venture-factory/scripts/activate.js   # bootstrap
node .claude/skills/ai-venture-factory/scripts/server.js 8080 # painel em http://127.0.0.1:8080
```

Ou pelos scripts do `package.json`: `npm run activate`, `npm run serve`,
`npm run tick`, `npm run snapshot`, `npm run seed`, `npm run sprites`.

### Orquestrador (fila de tarefas)

```bash
node .claude/skills/ai-venture-factory/scripts/orchestrator.js tick
```

`tick` = avança a fila **um passo** e imprime o que mudou (modo padrão).
`--watch` só se você pedir. No máximo **5** tarefas `running`; ordena por
`priority` depois `id`; aplica os gates G0→G10; gate reprovado cria uma TASK de
volta ao bloco anterior. Ao ativar um agente, imprime o `model`/`effort`
**recomendado** (do frontmatter do agente) para você ajustar `/model` e
`/effort` na sessão. Roda `snapshot` ao final.

---

## Painel (6 páginas, polling 2,5s)

Servido por `scripts/server.js` da skill — escuta **só** em `127.0.0.1`, serve
**só** uma allowlist (dashboard da skill, `company/state/`, `company/metrics/`,
`company/logs/events.jsonl`, `company/marketing/posts.jsonl`,
`company/logs/chats/`, `company/projects/`); tudo mais → **403**.

1. **Visão geral** — pipeline por gate (✅🔄⏸️❌), agentes ativos, bloqueios,
   últimos 20 eventos (com `model`/`effort`), métricas.
2. **Agentes** — 49 cards (sprite, status, TASK, última ação, `[VER AO VIVO]`
   `[CHAT]`), filtros por bloco/status/texto.
3. **Detalhe ao vivo** (`#agent/<id>`) — stream das últimas 50 ações, progresso,
   artefatos, permissões (nível N1–N5).
4. **Chat** (`#chat/<id>`) — histórico de `company/logs/chats/<id>.jsonl` +
   caixa que grava `TASK-XXXX.md` (priority 99) e dispara o orchestrator
   (`POST /api/task` → `POST /api/tick`).
5. **Financeiro** — planos (`company/projects/app-XXX/pricing.json`), MRR,
   churn, LTV/CAC, sparkline.
6. **Segurança** — falhas abertas por severidade, ciclo red/blue (G7),
   CVEs do A34 — de `company/state/security.json`.

---

## Pipeline (gates obrigatórios)

```
G0 intake → G1 pesquisa → G2 viabilidade → G3 CEO → G4 blueprint →
G5 conectores → G6 engenharia → G7 segurança → G8 QA → G9 marketing →
G10 monitoramento  ──(feedback)──▶ A11 (produto) + A07 (CEO)
```

Score do CEO (100): dor 20 · disposição a pagar 20 · mercado 15 · concorrência
10 · viabilidade técnica 15 · risco legal/segurança 10 · distribuição 10.
Aprova **só** com `>= 85` **e zero risco crítico**.

---

## Estrutura

```
.claude/
  skills/ai-venture-factory/     a SKILL PORTATIL — auto-contida, clonavel em
                                  qualquer projeto (git clone <este repo>
                                  .claude/skills/ai-venture-factory)
    SKILL.md                     ativação (instala, integra, roda o pipeline)
    agents/     A01..A49-<slug>.md  + _TEMPLATE.md   (49 agentes)
    reference/  spec.md, spec-anexo-b.md, org/, templates/  (specs, só leitura)
    dashboard/  index.html · styles.css · app.js · sprites/ (49 SVG)
    scripts/    activate · server · orchestrator · snapshot · logger ·
                seed-tasks · gen-sprites · publish-state · avf-lib
  launch.json                    (preview do painel, instalado por activate.js)
  settings.json                  (hooks de log, instalado por activate.js)
company/                         ESTADO DO PROJETO ATUAL (nunca da skill)
  memory/                 principios.md, padroes.md, aprendizados.md
  projects/<slug>/        idea, brief, score, blueprint, ..., postmortem
  tasks/                  TASK-XXXX.md  (frontmatter: id/agent/status/priority/gate)
  decisions/ inbox/ security/ marketing/{drafts,outbox} reports/
  logs/                   events.jsonl (+ model/effort) · chats/<id>.jsonl
  metrics/metrics.json    state/{agents,pipeline,security}.json  (gerado)
```

`scripts/avf-lib.js` resolve dois "roots": `SKILL_ROOT` (código/agentes/painel,
dentro da skill, só leitura) e `PROJECT_ROOT` (o `company/` do projeto onde a
sessão está rodando — pode ser este repositório ou qualquer outro).

---

## Regras permanentes

- Estado em **arquivos**, nunca só no contexto. Nenhum agente aprova o próprio
  trabalho. Segurança e QA podem **bloquear** o pipeline.
- **Auth e paywall são SIMULADOS** até você aprovar um gateway real.
- Marketing publica em `method: "manual"` → `company/marketing/outbox/`
  ("AGUARDANDO CLIQUE HUMANO"); `method: "api"` só depois de você habilitar o
  canal. 1º post de canal novo = aprovação humana.
- O logger mascara `sk-…`, `ghp_…`, `AKIA…`, `Bearer …`, linhas de `.env` antes
  de gravar. Nenhum secret em log/chat/prompt. `.env` está no `.gitignore`.
- Conectores/desktop-operator operam com **menor privilégio**, escopo travado ao
  repositório. Red-team só ataca o staging local.

---

## Publicar num repositório GitHub

```bash
git init && git add -A && git commit -m "AI Venture Factory: infraestrutura completa"
gh repo create ai-venture-factory --private --source=. --push
# ou:  git remote add origin <URL> && git push -u origin main
```

> Feito com [Claude Code](https://claude.com/claude-code).
