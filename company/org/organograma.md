# Organograma — AI VENTURE FACTORY

49 agentes em 8 blocos funcionais. IDs `A01`–`A49` são estáveis; o arquivo de
cada um é `.claude/agents/AXX-<slug>.md`.

```
Founder / Humano (você)
   │
   ├── BLOCO 2 — GOVERNANÇA
   │     A07 ceo ................. aprova/reprova projetos (score >= 85)
   │     A08 chief-of-staff ...... ORQUESTRADOR da fila (máx. 5 ativos)
   │     A09 pmo ................. cronograma, milestones, dependências
   │     A10 risk-compliance ..... risco legal, privacidade, LGPD, termos
   │
   ├── BLOCO 1 — PESQUISA & VIABILIDADE
   │     A01 market-researcher ... nichos, mercado, disposição a pagar
   │     A02 competitor-analyst .. concorrentes, preços, reviews, fraquezas
   │     A03 trend-scout ......... tendências, keywords, sinais de demanda
   │     A04 user-pain-analyst ... dores reais, personas, jobs-to-be-done
   │     A05 financial-viability . modelo financeiro, preço, LTV/CAC, churn
   │     A06 tech-feasibility .... viabilidade técnica, esforço, riscos
   │
   ├── BLOCO 3 — PRODUTO, DESIGN & ARQUITETURA
   │     A11 product-manager ..... PRD, user stories, MVP, critérios de aceite
   │     A12 ux-researcher ....... jornadas, fluxos, usabilidade
   │     A13 ui-designer ......... telas, identidade, design tokens
   │     A14 frontend-design-engineer  componentes, estados, responsividade, a11y
   │     A15 backend-api-designer . contratos de API, schemas, regras
   │     A16 solution-architect .. arquitetura, banco, auth, deploy, limites
   │
   ├── BLOCO 4 — ENGENHARIA
   │     A17 tech-lead ........... quebra tarefas, revisa; ÚNICO que mergeia
   │     A18 frontend-web-dev .... interface web (landing, dashboards, app)
   │     A19 mobile-dev .......... app mobile / PWA
   │     A20 backend-dev ......... APIs e regras de negócio
   │     A21 database-dev ........ schema, migrations, índices
   │     A22 payments-dev ........ assinatura/checkout/paywall (SIMULADO)
   │     A23 auth-dev ............ login, sessão, permissões (SIMULADO)
   │     A24 ai-integrations-dev . funcionalidades de IA do produto
   │     A25 devops .............. build, lint, testes, CI local, deploy grátis
   │     A26 reliability-engineer  performance, cache, estabilidade
   │
   ├── BLOCO 5 — CONECTORES LOCAIS & COMPUTER-USE
   │     A27 local-integration-lead  plano de integrações com menor privilégio
   │     A28 api-connector ....... APIs externas/webhooks/OAuth com whitelist
   │     A29 desktop-operator .... automações locais CONTROLADAS
   │     A30 secrets-keeper ...... .env/credenciais; injeta só em runtime
   │
   ├── BLOCO 6 — CYBERSECURITY (escopo: staging local próprio)
   │     A31 appsec-lead ......... threat model, checklist
   │     A32 red-team ............ ataques autorizados no staging
   │     A33 blue-team ........... corrige e endurece
   │     A34 dependency-auditor .. dependências, CVEs, licenças
   │     A35 privacy-officer ..... coleta mínima, retenção, LGPD
   │     A36 incident-responder .. playbooks + patches
   │
   ├── BLOCO 7 — QA
   │     A37 qa-lead ............. plano de testes; veredito final
   │     A38 functional-tester ... testes por critério de aceite
   │     A39 e2e-tester .......... jornadas completas (conta → paga → usa)
   │     A40 performance-tester .. latência, carga leve, consumo
   │     A41 accessibility-tester  WCAG básico, contraste, idiomas
   │     A42 regression-tester ... garante que correções não quebram o resto
   │
   └── BLOCO 8 — GROWTH, MARKETING, FINANÇAS & MONITORAMENTO
         A43 growth-strategist ... posicionamento, ICP, canais, funil
         A44 content-producer .... GERA E POSTA conteúdo + calendário
         A45 seo-aso-agent ....... landing pages, titles, keywords
         A46 funnel-experimenter . hipóteses, A/B de copy/CTA/oferta
         A47 onboarding-cs ....... ativação, retenção, suporte, churn
         A48 finance-ops ......... MRR, churn, LTV, CAC; NUNCA gasta dinheiro
         A49 product-monitor ..... satisfação, erros, uso de features, NPS
```

## Coordenação

- **A08 chief-of-staff** é o orquestrador: mantém a fila, despacha no máximo
  5 agentes, resolve conflitos, atualiza `company/state/`.
- Mensagens entre agentes vão para `company/inbox/<agente>.md` e são logadas
  em `company/logs/chats/<agente>.jsonl`.
- O feedback do G10 (A47–A49) volta para **A11 (produto)** e **A07 (CEO)**.
