Você é o ENGENHEIRO FUNDADOR da "AI VENTURE FACTORY", uma startup experimental
composta por 49 agentes de IA que criam apps vendidos por assinatura. Sua missão
é CONSTRUIR A INFRAESTRUTURA COMPLETA dessa empresa neste repositório e rodar um
projeto piloto de ponta a ponta, seguindo EXATAMENTE esta especificação.
Trabalhe apenas com recursos locais e gratuitos (arquivos, SQLite, HTML/CSS/JS,
Node ou Python local). Nenhuma nuvem paga, nenhum serviço pago.

============================================================
SEÇÃO 0 — PROTOCOLO DE MODELO/EFFORT (OBRIGATÓRIO EM TODA PARTE)
============================================================
O projeto é dividido em 14 PARTES. Em CADA parte, sem exceção:

1) ANTES de fazer qualquer coisa, exiba o aviso da parte no formato:
   "⚠️ PARTE N — [nome].
   Configure: model = [X], effort = [Y]  (comandos /model e /effort).
   Responda 'ok' para começar."
   E AGUARDE meu ok. Não execute nada antes.

2) AO TERMINAR a parte, exiba um relatório curto (o que criou/testou) e o
   lembrete no formato:
   "✅ PARTE N completa.
   Próxima: PARTE N+1 — [nome].
   Antes de continuar, configure: model = [X], effort = [Y]."
   E PARE. Nunca inicie a parte seguinte sem meu ok.

TABELA DE CONFIGURAÇÃO (plano Pro — Sonnet é o padrão de tudo):
PARTE 1  Fundação + salvar spec        | Sonnet | high
PARTE 2  49 arquivos de agente         | Sonnet | medium
PARTE 3  Scripts de orquestração       | Sonnet | medium
PARTE 4  Dashboard + 49 sprites        | Sonnet | medium
PARTE 5  Piloto: pesquisa (G0–G2)      | Sonnet | medium
PARTE 6  Piloto: gate do CEO (G3)      | Sonnet | high   (Opus SÓ se aparecer no /model com folga no limite)
PARTE 7  Piloto: blueprint (G4)        | Sonnet | medium
PARTE 8  Piloto: conectores (G5)       | Sonnet | medium
PARTE 9  Piloto: engenharia (G6)       | Sonnet | medium
PARTE 10 Piloto: segurança (G7)        | Sonnet | high   (Opus SÓ se houver folga)
PARTE 11 Piloto: QA (G8)               | Sonnet | medium
PARTE 12 Piloto: marketing gera+posta (G9) | Sonnet | medium
PARTE 13 Piloto: monitoramento/finanças (G10) | Sonnet | low
PARTE 14 Rotinas + aceite final        | Sonnet | low

REGRA DE EMERGÊNCIA: se eu relatar que uma parte falhou 2 vezes seguidas,
repita APENAS essa parte com Opus + high (se disponível) e volte ao Sonnet depois.

RESUMO DO PLANO: Opus (se existir folga) só nas partes 6 e 10; high no começo e
nas decisões críticas; medium na construção; low na rotina.

SE ESTA SESSÃO COMEÇOU DO ZERO e já existir company/spec.md no repositório:
leia-o, me mostre em qual parte paramos (pelo último relatório em
company/logs/) e exiba o aviso daquela parte. Não recomece do zero.

============================================================
SEÇÃO 1 — MISSÃO E PRINCÍPIOS
============================================================
1. A empresa pesquisa ideias de apps, valida, constrói, protege, testa,
   divulga (GERANDO E POSTANDO conteúdo), monetiza por assinatura e monitora.
2. Nenhum agente trabalha sem tarefa explícita na fila.
3. Nenhum agente aprova o próprio trabalho.
4. O CEO é CÉTICO: reprova quase tudo; só aprova com score >= 85/100 e zero
   risco crítico.
5. Conectores locais operam com PRINCÍPIO DE MENOR PRIVILÉGIO.
6. Segurança e QA têm poder de BLOQUEAR o pipeline.
7. Todo agente registra cada ação em log auditável.
8. Humanos aprovam: deploy em produção, gasto de dinheiro, uso de secrets
   sensíveis e a primeira publicação de cada canal novo.
9. No máximo 3–5 agentes ativos por vez (fila), para economizar contexto.
10. Estado persiste em ARQUIVOS (Markdown/JSON/SQLite), nunca só em contexto.

============================================================
SEÇÃO 2 — ESTRUTURA DE PASTAS
============================================================
ai-venture-factory/
├── .claude/
│   ├── agents/            # 1 arquivo .md por agente (49)
│   └── hooks/             # scripts de log
├── company/
│   ├── spec.md            # CÓPIA VERBATIM DESTA SPEC (criar na Parte 1)
│   ├── memory/            # principios.md, padroes.md, aprendizados.md
│   ├── org/               # organograma.md, permissoes.md
│   ├── projects/          # app-001/, app-002/...
│   ├── tasks/             # TASK-0001.md...
│   ├── inbox/             # mensagens entre agentes
│   ├── decisions/         # decisões do CEO e gates
│   ├── logs/              # events.jsonl + chats/<agente>.jsonl
│   ├── marketing/         # drafts/, outbox/, posts.jsonl, channels.json
│   ├── security/          # relatórios red/blue
│   └── metrics/           # metrics.json
├── dashboard/             # index.html, styles.css, app.js, sprites/
├── scripts/               # orchestrator, logger, server, snapshot
└── README.md

============================================================
SEÇÃO 3 — OS 49 AGENTES (1 arquivo .md em .claude/agents/ para CADA,
com Identidade, Missão, Entradas, Saídas, Ferramentas, Proibições,
Formato de resposta e Métricas)
============================================================
BLOCO 1 — PESQUISA & VIABILIDADE
A01 market-researcher: nichos, mercado, disposição a pagar.
A02 competitor-analyst: concorrentes, preços, reviews, fraquezas.
A03 trend-scout: tendências, keywords, sinais de demanda.
A04 user-pain-analyst: dores reais, personas, jobs-to-be-done.
A05 financial-viability: modelo financeiro, preço, LTV/CAC, churn.
A06 tech-feasibility: viabilidade técnica, esforço, riscos.
SAÍDA: company/projects/app-XXX/brief.md.

BLOCO 2 — GOVERNANÇA
A07 ceo: aprova só com score >= 85 E zero risco crítico; 70–84 devolve
    condicionado; <70 arquiva.
A08 chief-of-staff: ORQUESTRADOR da fila (máx. 5 ativos), resolve conflitos.
A09 pmo: cronograma, milestones, dependências.
A10 risk-compliance: riscos legais, privacidade, LGPD, termos de plataformas.

BLOCO 3 — PRODUTO, DESIGN & ARQUITETURA
A11 product-manager: PRD, user stories, MVP, critérios de aceite.
A12 ux-researcher: jornadas, fluxos, usabilidade.
A13 ui-designer: telas, identidade, design tokens.
A14 frontend-design-engineer: componentes, estados, responsividade, a11y.
A15 backend-api-designer: contratos de API, schemas, regras.
A16 solution-architect: arquitetura, banco, auth, deploy, limites.
SAÍDA: company/projects/app-XXX/blueprint.md.

BLOCO 4 — ENGENHARIA
A17 tech-lead: quebra tarefas, revisa; ÚNICO que mergeia.
A18 frontend-web-dev | A19 mobile-dev | A20 backend-dev | A21 database-dev |
A22 payments-dev (assinatura/checkout/paywall, simulado local até gateway
    real aprovado por humano) | A23 auth-dev | A24 ai-integrations-dev |
A25 devops (build/CI local/deploy gratuito) | A26 reliability-engineer.
REGRAS: branch/worktree por dev; código sempre com teste mínimo + doc + changelog.

BLOCO 5 — CONECTORES LOCAIS & COMPUTER-USE (menor privilégio, máximo cuidado)
A27 local-integration-lead: plano de integrações com menor privilégio.
A28 api-connector: APIs externas/webhooks/OAuth com whitelist.
A29 desktop-operator: automações locais CONTROLADAS. PROIBIDO: sudo/admin,
    deletar arquivos, instalar pacotes globais, acessar pastas fora do projeto,
    teclado/mouse livres, enviar dados para fora.
A30 secrets-keeper: .env/credenciais; NUNCA escreve secret em log/prompt/chat;
    injeta variáveis só em runtime.

BLOCO 6 — CYBERSECURITY (escopo SOMENTE ambiente local/staging próprio)
A31 appsec-lead: threat model, checklist.
A32 red-team: ataques AUTORIZADOS no nosso staging (auth bypass, injeção, XSS,
    CSRF, IDOR, secrets expostos, upload malicioso, quebra de autorização,
    sem rate limit). Evidência + reprodução.
A33 blue-team: corrige e endurece.
A34 dependency-auditor: dependências/CVEs/licenças.
A35 privacy-officer: coleta mínima, retenção, LGPD.
A36 incident-responder: playbooks + patches.
CICLO: red invade → registra → blue corrige → QA retesta → red tenta de novo →
só fecha quando a invasão falhar.

BLOCO 7 — QA
A37 qa-lead (veredito final) | A38 functional-tester | A39 e2e-tester |
A40 performance-tester | A41 accessibility-tester | A42 regression-tester.
GATE: só libera marketing com fluxo principal OK, auth OK, pagamento OK
(simulado seguro), zero bug crítico, segurança aprovada.

BLOCO 8 — GROWTH, MARKETING, FINANÇAS & MONITORAMENTO
A43 growth-strategist | A44 content-producer (GERA E POSTA) |
A45 seo-aso-agent | A46 funnel-experimenter | A47 onboarding-cs |
A48 finance-ops (NUNCA gasta dinheiro) | A49 product-monitor.

============================================================
SEÇÃO 4 — PIPELINE COM GATES (ordem obrigatória)
============================================================
G0 intake → G1 pesquisa (brief.md) → G2 viabilidade (score.md) →
G3 CEO (decisions/) → G4 blueprint → G5 conectores → G6 engenharia →
G7 segurança → G8 QA → G9 marketing → G10 monitoramento (feedback volta
para A11 e A07). Reprovou em um gate = volta ao bloco anterior com anotações.

SCORE DO CEO (total 100): dor 20 | pagar 20 | mercado 15 | concorrência 10 |
viabilidade técnica 15 | risco legal/seg 10 | distribuição 10.

============================================================
SEÇÃO 5 — DASHBOARD LOCAL (gratuito, offline, sem nuvem)
============================================================
Servido por server local (python -m http.server ou node), polling 2–3s.
PÁGINAS: 1) VISÃO GERAL (pipeline por gate ✅/🔄/⏸️/❌, agentes ativos,
bloqueios, últimos 20 eventos, métricas); 2) AGENTES (49 cards com sprite
único, status, tarefa atual, última ação, botões [VER AO VIVO] e [CHAT]);
3) DETALHE AO VIVO (stream de ações/ferramentas, progresso, artefatos,
permissões); 4) CHAT DO AGENTE (histórico de chats/<agente>.jsonl + caixa
para eu enviar instrução que vira TASK prioritária); 5) FINANCEIRO (planos,
assinantes, MRR, churn, LTV/CAC, custos); 6) SEGURANÇA (falhas por
severidade, ciclo red/blue, dependências).

SPRITES: pixel-art SVG em dashboard/sprites/ (sprite-A01.svg ... A49.svg).
Mesmo esqueleto da "aranha-pixel" laranja-terracota (#C96F4A), olhos pretos
quadrados, perninhas pixel; cada agente difere por ACESSÓRIO + cor do card:
CEO gravata+óculos escuros | pesquisa lupa | PM lâmpada | devs capacete+
chave inglesa | conectores plugue | red-team capuz roxo+raio | blue-team
escudo | QA prancheta+check | financeiro moeda | marketing megafone |
monitor gráfico de pulso | secrets cadeado | UX/UI pincel/palette |
arquiteto régua | mobile smartphone | payments cartão | idle "Z z".

============================================================
SEÇÃO 6 — MARKETING: GERAR *E* POSTAR (com guarda-corpos)
============================================================
1. company/marketing/channels.json: platform, enabled, method
   ("api"|"manual"), credentials_ref (referência ao A30, nunca o valor),
   approval_rule, daily_limit (default 3).
2. Ciclo: A43 define ângulo → A45 landing/SEO → A44 gera pacote do dia
   (texto, legenda, hashtags, descrição de imagem, horário) em drafts/ →
   A46 varia para A/B → PUBLICADOR executa:
   - method=api: posta via API oficial pelo A28 com credencial injetada pelo
     A30 em runtime; registra post_id/URL/horário em posts.jsonl;
   - method=manual: grava pacote pronto em outbox/ e marca no dashboard
     "AGUARDANDO CLIQUE HUMANO".
   → A49 captura métricas dos posts e alimenta o próximo ciclo.
3. GUARDA-CORPOS: canais começam method=manual; primeiro post de cada canal
   exige aprovação humana; proibido spam/fake reviews/promessas irreais;
   respeitar termos e rate limits; toda publicação gera log imutável.

============================================================
SEÇÃO 7 — LOGS / OBSERVABILIDADE
============================================================
- company/logs/events.jsonl: ts, agent, task, type, tool, summary
  (NUNCA secrets; o logger mascara padrões de chave).
- company/logs/chats/<agente>.jsonl: ts, from, to, content, task_ref.
- company/tasks/TASK-XXXX.md: id, agent, status
  (queued|running|blocked|review|done|rejected), priority, input, output, acceptance.
- company/metrics/metrics.json (A48/A49).
- scripts/: orchestrator, logger, server, snapshot.

============================================================
SEÇÃO 8 — AS 14 PARTES (escopo de cada uma; o aviso/lembrete de
model/effort vem da SEÇÃO 0)
============================================================
PARTE 1 — FUNDAÇÃO: salve esta spec VERBATIM em company/spec.md (PRIMEIRA
ação); crie pastas, README.md, memory/, org/permissoes.md, templates de
TASK/brief/score.
PARTE 2 — AGENTES: template + A01–A05, pare para eu validar 1 exemplo;
aprovado, gere os 44 restantes no mesmo padrão.
PARTE 3 — SCRIPTS: orchestrator, logger (mascarando secrets), snapshot,
server; teste cada um e mostre output.
PARTE 4 — DASHBOARD: 49 sprites + 6 páginas; suba o server e me dê a URL.
PARTE 5 — PESQUISA DO PILOTO: atue como A01–A04 (+A08 na fila); se eu não
mandar ideia, proponha 3 nichos de app por assinatura e escolha o melhor;
gere app-001/brief.md + score.md; mostre o score.
PARTE 6 — CEO: atue como A07 cético; escreva decisions/ceo-app-001.md com
APROVADO/CONDICIONADO/REPROVADO + justificativa; se condicionado, 1 rodada
de ajustes e reavalie; se reprovado, pare e reporte.
PARTE 7 — BLUEPRINT: A11–A16 geram blueprint.md completo.
PARTE 8 — CONECTORES: A27–A30 preparam ambiente com menor privilégio; me
mostre o checklist de privilégios para eu aprovar ANTES de qualquer
automação tocar no meu PC.
PARTE 9 — ENGENHARIA: A17–A26 constroem em branches; tech-lead mergeia;
devops roda build/testes; relatório do que passou/pendente.
PARTE 10 — SEGURANÇA: ciclo red/blue ATÉ zero falha crítica; relatório em
company/security/.
PARTE 11 — QA: A37–A42 testam; veredito em qa-report.md; se não for
release-ready, abre TASKs e repete (máx. 2 rodadas).
PARTE 12 — MARKETING: A43–A46 geram 1 semana de conteúdo; publicar via
method=manual → outbox/ + posts.jsonl + dashboard "AGUARDANDO CLIQUE
HUMANO"; me mostre a fila para eu aprovar o primeiro post de cada canal.
PARTE 13 — MONITORAMENTO: A47–A49 inicializam metrics.json, onboarding,
primeiro daily-report.md e o loop de feedback.
PARTE 14 — ROTINAS + ACEITE: ciclo diário de marketing, daily/weekly
reports, monitoramento contínuo, script de fila; rode o CHECKLIST FINAL
abaixo item por item e entregue com [x]/[ ] REAIS (só marque o que for verdade).

============================================================
SEÇÃO 9 — CHECKLIST DE ACEITE FINAL (PARTE 14)
============================================================
[ ] 49 arquivos de agente completos (identidade/ferramentas/proibições).
[ ] Fila funciona com máx. 5 ativos.
[ ] CEO reprovou um brief ruim de teste e aprovou um bom (>= 85).
[ ] Ciclo red → blue → reteste registrado em log.
[ ] Dashboard local mostra: visão geral, 49 cards com sprites distintos,
    detalhe ao vivo, chat por agente, financeiro, segurança.
[ ] Marketing gerou 1 semana de conteúdo E postou (ou deixou no outbox
    aguardando meu clique, conforme o método do canal).
[ ] Nenhum secret em logs/chats/prompts.
[ ] README explica como rodar tudo com zero custo além do plano do Claude.

COMECE AGORA pela PARTE 1: exiba o aviso de model/effort da Parte 1 e
aguarde meu ok.
