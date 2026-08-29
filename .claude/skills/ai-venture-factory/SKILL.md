---
name: ai-venture-factory
description: >-
  Ativa a AI Venture Factory: startup simulada de 49 agentes de IA que pesquisam,
  validam, constroem, protegem, testam, divulgam e monetizam apps por assinatura.
  Sobe o painel local (dashboard) e devolve o link. Use quando o usuario disser
  "ative o ai venture factory", "ativar ai venture factory", "start ai venture
  factory", "abrir o painel da fabrica" ou equivalente.
---

# AI Venture Factory — skill de ativacao

Quando o usuario pedir para **ativar a AI Venture Factory** (ou abrir o painel),
faca EXATAMENTE isto, em ordem, sem pular passo:

## 1. Bootstrap
Rode:

```bash
node scripts/activate.js
```

Isso: garante as pastas de estado, gera os 49 sprites se faltarem, roda o
`snapshot` (`company/state/agents.json` + `pipeline.json` + `security.json`) e
imprime um resumo. Nao falha se algo ja existir (idempotente).

## 2. Suba o painel e pegue o link
Use o preview do proprio Claude Code apontando para a config nomeada
`ai-venture-factory` (definida em `.claude/launch.json`):

- `preview_start` com `{ "name": "ai-venture-factory" }`

Isso executa `node scripts/server.js` na porta **8080** e devolve uma URL.
- Numa sessao **na nuvem / web**, o preview vira um link compartilhavel — **entregue essa URL ao usuario**.
- Numa sessao **local**, a URL sera `http://127.0.0.1:8080`.

Se `preview_start` nao estiver disponivel no ambiente, rode
`node scripts/server.js 8080` em background e informe `http://127.0.0.1:8080`.

## 3. Reporte
Responda ao usuario com:
- a URL do painel;
- que o painel tem 6 paginas (Visao geral, Agentes, Detalhe ao vivo, Chat,
  Financeiro, Seguranca) e faz polling a cada 2,5s;
- que o pipeline ainda esta vazio ate rodar o piloto.

## 4. (Opcional) Enfileirar o projeto piloto
Se o usuario pedir para "comecar o piloto" / "rodar o app-001":

```bash
node scripts/seed-tasks.js
node scripts/orchestrator.js tick
```

`seed-tasks.js` cria `company/projects/app-001/` + `TASK-0001..0008` (pesquisa
G1 + viabilidade G2). `orchestrator.js tick` avanca a fila um passo, respeitando
o teto de **5 agentes ativos**, e imprime o `model`/`effort` recomendado de cada
agente ativado (o usuario ajusta `/model` e `/effort` na sessao).

Passe `--with-idea "texto da ideia"` ao `seed-tasks.js` se o usuario ja tiver
uma ideia; senao a ideia fica pendente e voce (atuando como A01–A04) propoe 3
nichos na fase de pesquisa.

## Regras que valem sempre nesta fabrica
- Estado vive em ARQUIVOS (`company/**`), nunca so no contexto.
- Nenhum agente aprova o proprio trabalho. CEO (A07) so aprova com score >= 85 e
  zero risco critico.
- Seguranca (A31–A36) e QA (A37–A42) podem BLOQUEAR o pipeline.
- Humano aprova: deploy em producao, gasto de dinheiro, uso de secret sensivel,
  1o post de cada canal de marketing.
- Marketing publica em `method: "manual"` -> `company/marketing/outbox/`
  ("AGUARDANDO CLIQUE HUMANO") ate o humano habilitar `method: "api"`.
- O logger (`scripts/logger.js`, ligado por `.claude/settings.json`) mascara
  `sk-…`, `ghp_…`, `AKIA…`, `Bearer …`, linhas de `.env` — nenhum secret entra
  em log/chat/prompt.
- O server so serve uma allowlist (`dashboard/`, `company/state/`,
  `company/metrics/`, `events.jsonl`, `posts.jsonl`, `company/logs/chats/`,
  `company/projects/`); todo o resto -> 403. Escuta so em `127.0.0.1`.

## Mapa rapido
- `company/spec.md` — especificacao verbatim (14 partes, pipeline G0–G10).
- `company/spec-anexo-b.md` — modelo/effort/fallback + stack de skills dos 49.
- `company/org/organograma.md`, `permissoes.md` (niveis N1–N5), `skills-fundador.md`.
- `.claude/agents/A01..A49-*.md` — um arquivo por agente.
- `scripts/` — `activate`, `server`, `orchestrator` (tick), `snapshot`,
  `logger`, `seed-tasks`, `gen-sprites`.
