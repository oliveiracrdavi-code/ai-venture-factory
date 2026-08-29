# AI VENTURE FACTORY

Startup **simulada** de **49 agentes de IA** que pesquisam ideias de apps,
validam, constroem, protegem, testam, divulgam (gerando **e** postando
conteúdo), monetizam por assinatura e monitoram — tudo com **pipeline de gates**
e **estado em arquivos**.

100% local, **zero dependência** (`node` puro ≥ 18), **zero custo** além do seu
plano do Claude. Nada de nuvem paga, nada de `npm install`.

---

## ⚡ Ativar numa sessão do Claude (nuvem ou local)

Abra este repositório numa sessão do **Claude Code** e diga:

> **ative o ai venture factory**

A skill [`.claude/skills/ai-venture-factory`](.claude/skills/ai-venture-factory/SKILL.md)
faz o resto:

1. roda `node scripts/activate.js` (bootstrap idempotente: pastas de estado,
   49 sprites, `snapshot`);
2. sobe o painel via `preview_start` (config `ai-venture-factory` em
   [`.claude/launch.json`](.claude/launch.json), porta **8080**);
3. te devolve **o link do painel** — numa sessão na nuvem o preview vira um
   link compartilhável; local, é `http://127.0.0.1:8080`.

Depois, se quiser rodar o projeto piloto:

> **começar o piloto** — (roda `seed-tasks.js` + `orchestrator.js tick`)

---

## Rodar à mão (sem a skill)

```bash
node scripts/activate.js        # bootstrap
node scripts/server.js 8080     # painel em http://127.0.0.1:8080
```

Ou pelos scripts do `package.json`: `npm run activate`, `npm run serve`,
`npm run tick`, `npm run snapshot`, `npm run seed`, `npm run sprites`.

### Orquestrador (fila de tarefas)

```bash
node scripts/orchestrator.js tick
```

`tick` = avança a fila **um passo** e imprime o que mudou (modo padrão).
`--watch` só se você pedir. No máximo **5** tarefas `running`; ordena por
`priority` depois `id`; aplica os gates G0→G10; gate reprovado cria uma TASK de
volta ao bloco anterior. Ao ativar um agente, imprime o `model`/`effort`
**recomendado** (do frontmatter do agente) para você ajustar `/model` e
`/effort` na sessão. Roda `snapshot` ao final.

---

## Painel (6 páginas, polling 2,5s)

Servido por `scripts/server.js` — escuta **só** em `127.0.0.1`, serve **só** uma
allowlist (`dashboard/`, `company/state/`, `company/metrics/`,
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
  agents/     A01..A49-<slug>.md  + _TEMPLATE.md   (49 agentes)
  skills/ai-venture-factory/SKILL.md               (ativação)
  launch.json                                      (preview do painel)
  settings.json                                    (hooks de log, portável)
company/
  spec.md                 especificação verbatim (14 partes)
  spec-anexo-b.md          modelo/effort/fallback + stack de skills dos 49
  memory/                 principios.md, padroes.md, aprendizados.md
  org/                    organograma.md, permissoes.md (N1–N5), skills-fundador.md
  templates/              TASK.md, brief.md, score.md
  projects/app-XXX/       brief, score, blueprint, ..., postmortem
  tasks/                  TASK-XXXX.md  (frontmatter: id/agent/status/priority/gate)
  decisions/ inbox/ security/ marketing/{drafts,outbox} reports/
  logs/                   events.jsonl (+ model/effort) · chats/<id>.jsonl
  metrics/metrics.json    state/{agents,pipeline,security}.json  (gerado)
dashboard/                index.html · styles.css · app.js · sprites/ (49 SVG)
scripts/                  activate · server · orchestrator · snapshot · logger · seed-tasks · gen-sprites
```

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
