# Padrões da empresa — como o trabalho é feito

Convenções fixas para todos os agentes. Complementa `principios.md`.

## Estado e arquivos

- **1 writer por arquivo.** Cada agente escreve apenas nos artefatos do seu
  bloco. Conflito de escrita = erro de processo.
- **Código do app-001:** cada dev do BLOCO 4 trabalha em branch/worktree
  próprio; **A17 tech-lead é o único que faz merge**.
- Nada de estado só em contexto. Persistir em `company/`.
- Artefato do projeto vive em `company/projects/app-XXX/`.

## TASK (`company/tasks/TASK-XXXX.md`)

Frontmatter obrigatório: `id, agent, status, priority, gate, input, output,
acceptance`. `status ∈ {queued, running, blocked, review, done, rejected}`.
Template em `company/templates/TASK.md`.

## Fila / orquestrador

- `node scripts/orchestrator.js tick` avança **um passo** e imprime o diff.
  `tick` é o padrão; `--watch` só sob pedido explícito do humano.
- Máx. **5** TASKs `running` simultâneas.
- Ordem: `priority` (desc) → `id` (asc).
- Instrução do humano pelo chat do dashboard vira TASK nova com
  `priority: high`.

## Gates (ordem obrigatória)

| Gate | Libera quando |
|---|---|
| G0 intake | `idea.md` existe, é legal, custo ≈ 0 → cria TASKs de G1 |
| G1 pesquisa | `brief.md` com dor + público + concorrência/demanda |
| G2 viabilidade | `score.md` com total calculado (A05 + A06 + A10) |
| G3 CEO | `decisions/ceo-*.md` = APROVADO (>=85, zero risco crítico) |
| G4 blueprint | `blueprint.md` completo (PRD + API + arquitetura + telas) |
| G5 conectores | checklist de privilégios aprovado pelo humano |
| G6 engenharia | build ok + testes básicos + zero secret no código |
| G7 segurança | zero falha crítica após ciclo red→blue→reteste |
| G8 QA | `qa-report.md` = release-ready (fluxo, auth, pagamento simulado) |
| G9 marketing | 1 semana de conteúdo gerada + pacotes em `outbox/` |
| G10 monitor | `metrics.json` inicializado + primeiro `daily-report.md` |

Reprovou num gate → TASK nova para o bloco anterior com anotações;
`company/state/pipeline.json` marca `❌` naquele gate.

## Logs

- **`company/logs/events.jsonl`** — uma linha JSON por ação:
  `{ts, agent, task, type, tool, summary, model, effort}`.
  `model` e `effort` são **obrigatórios** (auditoria de consumo do plano).
  `type` inclui, entre outros: `bootstrap`, `task-start`, `task-done`,
  `gate-pass`, `gate-fail`, `chat`, `part-report`.
- **`company/logs/chats/<agente>.jsonl`** — `{ts, from, to, content, task_ref}`.
- **Relatório de parte** = evento `type: "part-report"` em `events.jsonl`,
  com `summary` = o que foi criado/testado. É o marcador para retomar a
  sessão na parte certa.
- **Mascaramento de secret (logger + hook), antes de gravar:**
  `sk-[A-Za-z0-9]{16,}`, `ghp_[A-Za-z0-9]{20,}`, `AKIA[0-9A-Z]{12,}`,
  `Bearer\s+\S+`, qualquer linha vinda de arquivo `.env`. Substituir por
  `«MASKED»`. Nunca logar valor de credencial.

## Código (BLOCO 4)

Todo código entregue vem com: **teste mínimo + doc curta + changelog**.
Sem isso, A17 não faz merge. `app-001`: HTML/JS + servidor Node local;
SQLite só se necessário. **Auth e paywall SIMULADOS** até o humano aprovar
gateway real — regra permanente.

## Marketing (BLOCO 8)

- `channels.json`: todo canal nasce `method: "manual"`, `enabled: false`,
  `daily_limit: 3`, `credentials_ref` = nome lógico (nunca o valor).
- Ciclo diário: A43 ângulo → A45 landing/SEO → A44 pacote em `drafts/` →
  A46 varia p/ A/B → publicador (`manual` → `outbox/` + "AGUARDANDO CLIQUE
  HUMANO"; `api` → posta via A28 c/ credencial injetada por A30, grava
  `posts.jsonl`).
- **O ciclo termina com A49** capturando métricas dos posts: números reais
  da API quando `method=api`; estimativa manual registrada quando
  `method=manual`. Grava em `posts.jsonl` e alimenta o próximo ciclo de
  A43 e A46.
- 1º post de cada canal novo = aprovação humana. Proibido spam, compra de
  seguidores, review falso, promessa irreal. Respeitar termos e rate limits.
  Toda publicação gera log imutável.

## Permissões

5 níveis N1–N5 descritos em `company/org/permissoes.md`. **Cada** arquivo
`.md` de agente declara seu nível no cabeçalho (campo `Nível`).

## Modelo / effort / skills por agente (ANEXO B)

`company/spec-anexo-b.md` define, para os 49 agentes: modelo (8 Opus · 38
Sonnet · 3 Haiku), effort, fallback Pro (Sonnet+high quando não há folga de
Opus) e **STACK DE SKILLS REAIS** (10 por agente, `[I]` já instalada / `[+]`
instalar). Cada `.md` de agente carrega as seções `MODELO & EFFORT` e
`STACK DE SKILLS` verbatim do Anexo B.

- Opus só é acionado no gate do próprio agente (A07 nas partes 6/reavaliação;
  A13/A14 nas partes 4/7; A16 na 7; A31/A32 na 10; A44 na 12). Fora disso,
  fallback.
- Marketplaces a registrar 1× (custo zero): `obra/superpowers-marketplace`,
  `coreyhaines31/marketingskills`, `alirezarezvani/claude-skills`,
  `npx skills add anthropics/skills`. Skills que exigem CLI de terceiro
  (Ahrefs, GA4, Meta/Google Ads) NÃO rodam no piloto — marketing para no
  `outbox/`.

## Dashboard — card do agente (PARTE 4)

O card de cada um dos 49 agentes exibe: **modelo · effort · nível de
permissão (N1–N5)** + status + TASK atual + última ação + skill em uso.

## Missão única (fixada 2026-08-30)

A empresa inteira existe para **uma coisa só**: pesquisar → decidir um
app/solução prático do dia a dia → construir → vender pro cliente. Nenhum
agente propõe trabalho fora disso (infra interna, ferramenta pra uso próprio
etc. só se servir diretamente esse funil).

## Pesquisa de APIs/serviços grátis (obrigatório antes de pedir credencial)

Antes de qualquer agente rodar `scripts/request-credential.js`, ele precisa
ter pesquisado e registrado (no `TASK` ou no `brief.md`/`blueprint.md` do
projeto) **pelo menos 1 alternativa gratuita ou free-tier** para a
necessidade, com evidência (nome do serviço, limite do plano grátis, link).
Só depois disso o pedido de credencial é legítimo. Fallback: se não achar
nada grátis, registrar isso explicitamente como risco/custo antes de pedir
uma chave paga — nunca pedir "porque sim".

## Gate do CEO para oportunidades (fundador só vê o que passou por A07)

Quando pesquisa profunda encontra uma oportunidade nova que vale a pena
construir (fora do fluxo normal de app-XXX já em andamento):

1. O agente que encontrou registra com
   `node scripts/propose-opportunity.js <agente> "<titulo>" "<resumo>" "<evidencia>"`.
   Isso cria `company/opportunities/OPP-XXXX.md` com `status: proposta`.
2. **A proposta NÃO é visível ao fundador ainda.**
3. O A07 (CEO) analisa e decide com
   `node scripts/ceo-forward.js <OPP-ID> encaminhar` (só então vira item
   pendente no Chatbot Humano / `approvals.json`) ou
   `node scripts/ceo-forward.js <OPP-ID> arquivar "motivo"` (fica só no
   histórico, nunca chega ao fundador).
4. **Regra dura de arquitetura:** `scripts/ceo-forward.js` é o **único**
   script do repositório autorizado a escrever em
   `company/state/approvals.json`. Nenhum outro agente/script tem esse
   caminho. Isso é o que garante, em código (não só em convenção), que só
   chega ao fundador o que o CEO validou.

## Padrão mínimo de design (fixado 2026-08-30)

`company/design/DESIGN-STANDARD.md` + `company/design/bom-gosto-design-reference.pdf`
definem o **piso mínimo aceitável** de qualidade visual pra qualquer front-end
do projeto (dashboard, apps-XXX, landings). Nada abaixo desse nível é
aceitável. Toda entrega de design/front-end termina com auditoria contra esse
checklist antes de ser dada como pronta.

`company/design/VIDEO-DESIGN-STANDARD.md` +
`company/design/padrao-minimo-video-divulgacao.pdf` fazem o mesmo pra vídeo de
divulgação (BLOCO 8 — A44/A45/A46): piso mínimo obrigatório, checklist na
última página do PDF, reprovação automática com 3+ itens falhos.

## Roteador de modelo gratuito (fallback, fixado 2026-08-30)

`company/org/model-router-fallback.md` documenta a 4ª camada de fallback
(abaixo do `fallback_pro` do Anexo B): xKiro como gateway free-tier, com
delegação por bloco/agente (modelo + temperatura/top_p/frequência/presença)
e a especialidade de cada família de modelo. **Pendente de ativação** até a
chave (rotacionada, nunca colada em chat) ser preenchida em Conexões
(`CRQ-MTGIKNZF`). Nenhuma chamada real acontece antes disso.

## Chat Geral é o canal único (fixado 2026-08-30)

Toda comunicação entre agentes — pedido, resposta, "estou fazendo X",
raciocínio relevante pra decisão — passa por
`node scripts/agent-chat-post.js <de> <para> "<mensagem>" [task_ref]`, que
grava em `company/logs/chats/<de>.jsonl`. É o mesmo arquivo que a aba
**Chat geral** do dashboard mescla e mostra ao fundador como espectador.
**Nenhum agente troca informação "por fora"** — se aconteceu, tem que
aparecer lá. Isso vale em especial pra pedido de recurso entre agentes (ex.:
alguém pedindo imagem pro A44 — ver `company/org/model-router-fallback.md`).

Isso complementa, não substitui, `company/logs/events.jsonl` (que registra
AÇÃO/resultado com model/effort, pra auditoria de consumo) — o chat registra
a CONVERSA entre agentes; o events.jsonl registra o que foi feito.

## Fallback automático de limite (fixado 2026-08-31)

`scripts/auto-worker.js` roda a cada tick da VM (via `deploy/vm-tick.sh`).
Não existe sinal de "limite do Claude atingido" que um script capte
diretamente (é a plataforma travando a sessão, não um erro de API) — o proxy
usado é: **TASK `running` sem nenhum evento novo há mais de 15 minutos**
(nenhuma sessão do Claude está mexendo nela). Nesse caso, processa via
xKiro/Pollinations (`scripts/model-router.js` / `scripts/generate-image.js`)
e deixa um rascunho — **nunca marca `done` sozinho**, sempre `review`. Todo
pedido/resultado do fallback é registrado no Chat Geral
(`scripts/agent-chat-post.js`), nunca só no `events.jsonl`.
