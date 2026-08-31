# ANEXO B — Modelos & Stacks de Skills por Agente

Anexo da `.claude/skills/ai-venture-factory/reference/spec.md`. Duas partes:

- **PARTE B.1** — verbatim do "Anexo de Inteligência" (metodologia de escolha de
  modelo, clusters, tabela dos 49, effort, fallback Pro, e as capacidades
  conceituais por agente).
- **PARTE B.2 (COMPLEMENTO)** — **STACK DE SKILLS REAIS**: 10 skills reais por
  agente, cada uma pesquisada e atribuída por função. `[I]` = já disponível
  nesta sessão; `[+]` = instalar (comando indicado). Este complemento NÃO
  substitui a PARTE B.1 — os dois convivem no `.md` de cada agente.

---
---

# PARTE B.1 — Anexo de Inteligência (verbatim)

## 1. METODOLOGIA — como o modelo foi escolhido

Cada agente foi avaliado em 4 eixos:

| Eixo | Pesa para Opus | Pesa para Sonnet | Pesa para Haiku |
|---|---|---|---|
| **Carga visual/criativa** (design, sprites, copy criativa) | Alta | Média | — |
| **Risco da decisão** (CEO, legal, segurança, arquitetura) | Alta | Média | — |
| **Volume/repetição** (logs, triagem, varredura) | — | Média | Alta |
| **Reversibilidade** (erro barato de desfazer) | — | Alta | Alta |

**Regra de ouro:** Opus = onde o erro custa caro OU onde criatividade visual é o produto. Sonnet = execução qualificada. Haiku = volume e triagem.

## 2. CLUSTERS DE MODELO

- **CLUSTER OPUS — VISUAL/CRIATIVO:** A13, A14, A44 (+ geração dos 49 sprites).
- **CLUSTER OPUS — DECISÃO CRÍTICA:** A07 (CEO), A16 (arquitetura), A31/A32 (segurança ofensiva/defensiva crítica), A10 (legal).
- **CLUSTER SONNET — EXECUÇÃO:** todos os devs, QA executável, pesquisa, produto, conectores, growth, finanças.
- **CLUSTER HAIKU — VOLUME:** A34 (varredura de dependências), A42 (triagem/regressão), A49 (monitoramento contínuo).

## 3. TABELA-RESUMO DOS 49

| # | Agente | Modelo | Effort | Fallback Pro |
|---|---|---|---|---|
| A01 | market-researcher | Sonnet | medium | — |
| A02 | competitor-analyst | Sonnet | medium | — |
| A03 | trend-scout | Sonnet | low | Haiku |
| A04 | user-pain-analyst | Sonnet | high | medium |
| A05 | financial-viability | Sonnet | high | medium |
| A06 | tech-feasibility | Sonnet | high | medium |
| A07 | ceo | **Opus** | high | Sonnet+high |
| A08 | chief-of-staff | Sonnet | medium | — |
| A09 | pmo | Sonnet | medium | — |
| A10 | risk-compliance | **Opus** | high | Sonnet+high |
| A11 | product-manager | Sonnet | high | medium |
| A12 | ux-researcher | Sonnet | high | medium |
| A13 | ui-designer | **Opus** | high | Sonnet+high |
| A14 | frontend-design-engineer | **Opus** | high | Sonnet+high |
| A15 | backend-api-designer | Sonnet | high | medium |
| A16 | solution-architect | **Opus** | high | Sonnet+high |
| A17 | tech-lead | Sonnet | high | medium |
| A18 | frontend-web-dev | Sonnet | medium | — |
| A19 | mobile-dev | Sonnet | medium | — |
| A20 | backend-dev | Sonnet | high | medium |
| A21 | database-dev | Sonnet | medium | — |
| A22 | payments-dev | Sonnet | high | medium |
| A23 | auth-dev | Sonnet | high | medium |
| A24 | ai-integrations-dev | Sonnet | high | medium |
| A25 | devops | Sonnet | medium | — |
| A26 | reliability-engineer | Sonnet | high | medium |
| A27 | local-integration-lead | Sonnet | high | medium |
| A28 | api-connector | Sonnet | medium | — |
| A29 | desktop-operator | Sonnet | medium | — |
| A30 | secrets-keeper | Sonnet | high | medium |
| A31 | appsec-lead | **Opus** | high | Sonnet+high |
| A32 | red-team | **Opus** | high | Sonnet+high |
| A33 | blue-team | Sonnet | high | medium |
| A34 | dependency-auditor | **Haiku** | medium | Sonnet low |
| A35 | privacy-officer | Sonnet | high | medium |
| A36 | incident-responder | Sonnet | high | medium |
| A37 | qa-lead | Sonnet | high | medium |
| A38 | functional-tester | Sonnet | medium | — |
| A39 | e2e-tester | Sonnet | high | medium |
| A40 | performance-tester | Sonnet | medium | — |
| A41 | accessibility-tester | Sonnet | medium | — |
| A42 | regression-tester | **Haiku** | medium | Sonnet low |
| A43 | growth-strategist | Sonnet | high | medium |
| A44 | content-producer | **Opus** | high | Sonnet+high |
| A45 | seo-aso-agent | Sonnet | medium | — |
| A46 | funnel-experimenter | Sonnet | high | medium |
| A47 | onboarding-cs | Sonnet | medium | — |
| A48 | finance-ops | Sonnet | high | medium |
| A49 | product-monitor | **Haiku** | medium | Sonnet low |

**Contagem:** 8 Opus · 38 Sonnet · 3 Haiku.

## 4. CAPACIDADES CONCEITUAIS POR AGENTE (mín. 10)

_(mantido como referência de competência; o mapeamento de skills reais está na PARTE B.2)_

### BLOCO 1 — PESQUISA & VIABILIDADE
- **A01 market-researcher** · Sonnet/medium — TAM/SAM/SOM; triangulação de fontes; demanda por keywords; mapeamento de nichos; benchmark de pricing; síntese executiva; grading de fonte; tendência vs modinha; mercado saturado; escrita de Opportunity Brief.
- **A02 competitor-analyst** · Sonnet/medium — teardown de concorrente; matriz de features; engenharia reversa de pricing; mineração de reviews; SWOT; mapeamento de lacunas; posicionamento; leitura de app store; sinais de churn em reviews; brief competitivo.
- **A03 trend-scout** · Sonnet/low (fb Haiku) — social listening; velocidade de keywords; hashtags; comunidades/fóruns; curvas de tendência; sinal vs ruído; sinais fracos; estágio do ciclo; triangulação multi-plataforma; digest de sinais.
- **A04 user-pain-analyst** · Sonnet/high — JTBD; extração de dores de reviews; personas; mapa de empatia; clusterização de reclamações; score frequência×severidade; roteiro de entrevista; necessidades não atendidas; pontos de fricção; insights acionáveis.
- **A05 financial-viability** · Sonnet/high — unit economics; LTV/CAC; sensibilidade de churn; ladder de preços; margem; break-even; coortes; benchmarks; cenários bull/base/bear; memo com veredito.
- **A06 tech-feasibility** · Sonnet/high — seleção de stack; T-shirt sizing; risco de dependências; auditoria de APIs; build vs buy; restrições local-first/zero-custo; fatiamento de MVP; registro de riscos; PoC rápida; veredito.

### BLOCO 2 — GOVERNANÇA
- **A07 ceo** · Opus/high — tese de investimento; critérios de kill; gating por score; detecção de vieses; portfólio; apetite a risco; segunda ordem; condições de aprovação; memos finais; dizer "não" com justificativa; custo de oportunidade; longo prazo vs caixa.
- **A08 chief-of-staff** · Sonnet/medium — decomposição de tarefas; fila; ordenação por dependência; arbitragem de conflitos; rollup de status; gargalos; SLA interno; escalonação; orçamento de contexto; relatório diário.
- **A09 pmo** · Sonnet/medium — milestones; caminho crítico; dependências; buffers; checkpoints; scope creep; cronograma ajustado a risco; retrospectivas; re-baselining; status executivo.
- **A10 risk-compliance** · Opus/high — LGPD/GDPR; minimização de dados; termos de plataformas; política de privacidade; conteúdo sensível/etário; compliance de pagamentos; dados de menores; responsabilidade; registro de riscos legais; checklist por gate.

### BLOCO 3 — PRODUTO, DESIGN & ARQUITETURA
- **A11 product-manager** · Sonnet/high — PRD; user stories; critérios de aceite; escopo de MVP; RICE/MoSCoW; edge cases; north-star; alinhamento entre agentes; corte de escopo; planejamento de release.
- **A12 ux-researcher** · Sonnet/high — jornada; avaliação heurística; fluxos; carga cognitiva; primeiro uso; psicologia de onboarding; teste de usabilidade; auditoria de fricção; arquitetura de informação; recomendações priorizadas.
- **A13 ui-designer** · Opus/high — teoria da cor em UI; pairing tipográfico; grid 8pt; hierarquia visual; sprites/pixel-art; design tokens; identidade de marca; theming dark/light; iconografia; composição de telas; moodboard→spec; microcopy visual.
- **A14 frontend-design-engineer** · Opus/high — decomposição de componentes; estados (vazio/carregando/erro); breakpoints; arquitetura de CSS; micro-interações; WCAG na implementação; fidelidade design→código; SVG pixel-art; cross-browser; UI performance-aware; regressão visual; tokens.
- **A15 backend-api-designer** · Sonnet/high — contratos REST; schemas; idempotência; paginação/filtros; taxonomia de erros; versionamento; authn/authz; webhooks; rate limits; spec tipo OpenAPI.
- **A16 solution-architect** · Opus/high — decomposição de sistemas; local-first; seleção de banco; cache; modos de falha; caminhos de escala; security-by-design; custo zero; mapeamento de integrações; ADRs; trade-offs; revisão de arquitetura de outros agentes.

### BLOCO 4 — ENGENHARIA
- **A17 tech-lead** · Sonnet/high — quebra técnica; code review rigoroso; refatoração; convenções; estratégia de merge; dívida técnica; sanidade de estimativas; higiene de branches; mentoria; guardrails de arquitetura; changelog; build vs refactor.
- **A18 frontend-web-dev** · Sonnet/medium — HTML semântico; CSS moderno; JS vanilla/DOM; fetch/estado cliente; validação de formulários; localStorage seguro; roteamento hash/history; responsivo; a11y básica; debug sistemático; lazy loading; cross-browser.
- **A19 mobile-dev** · Sonnet/medium — PWA manifest; service workers; cache offline; UX touch; viewport/safe areas; prompt de instalação; alternativas a push; imagens responsivas; budget de perf mobile; matriz de dispositivos.
- **A20 backend-dev** · Sonnet/high — roteamento Node; validação de entrada; tratamento de erros; middleware; REST fiel à spec; logs estruturados; config por env; testes unitários; headers de segurança; acesso a dados; JSON consistente; versionamento.
- **A21 database-dev** · Sonnet/medium — normalização; SQLite pragmas/perf; migrations seguras; indexação; otimização de queries; backup/restore; seed; constraints; versionamento de schema; prevenção de N+1.
- **A22 payments-dev** · Sonnet/high — máquina de estados de assinatura; paywall; trial; webhooks idempotentes (simulados); proration; dunning; recibos; zero dados de cartão; catálogo de planos; churn-save.
- **A23 auth-dev** · Sonnet/high — hashing de senha; sessão; rotação de tokens; RBAC; rate limit de login; recuperação de conta; CSRF; cookies seguros; logout global; auditoria de auth.
- **A24 ai-integrations-dev** · Sonnet/high — design de prompts; orçamento de tokens; parsing/validação de saída; retry/backoff; cache de respostas LLM; teto de custo; fallback; UX de streaming; anti prompt-injection; harness de avaliação.
- **A25 devops** · Sonnet/medium — CI local por scripts; build; lint; test runner; ambientes; deploy local sem downtime; rotação de logs; backup; setup reproduzível; alertas de falha.
- **A26 reliability-engineer** · Sonnet/high — profiling; cache; load test local; error budgets; chaos-lite; timeouts/retries; memory leaks; degradação graciosa; hooks de monitoramento; regressão de perf.

### BLOCO 5 — CONECTORES
- **A27 local-integration-lead** · Sonnet/high — auditoria de privilégios; menor privilégio; whitelists; threat modeling de automações; checklist de aprovação humana; blast radius; rollback; documentação; dry-run; escopo de incidentes locais.
- **A28 api-connector** · Sonnet/medium — OAuth; consumo REST; webhooks; retry/backoff; mapeamento de schemas; rate limits; higiene de credenciais; erros de API; testes de contrato; documentação de conectores.
- **A29 desktop-operator** · Sonnet/medium — operações de arquivo seguras; sanitização de paths; whitelist de comandos; sandbox; scripts idempotentes; log de toda ação; undo/rollback; checksum; higiene de temporários; gating humano.
- **A30 secrets-keeper** · Sonnet/high — .env; mascaramento; higiene de credenciais; rotação; injeção só em runtime; auditoria de acesso; scan de vazamento; vault local; need-to-know; resposta a vazamento.

### BLOCO 6 — CYBERSECURITY
- **A31 appsec-lead** · Opus/high — STRIDE; superfície de ataque; requisitos de segurança; casos de abuso; revisão de design seguro; scoring de risco; arquitetura segura; compliance; gates de segurança; escopo de red-team; priorização de correções; comunicação não-técnica.
- **A32 red-team** · Opus/high — bypass de auth; injeção; XSS; CSRF; IDOR; abuso de lógica de negócio; ataques de upload; evasão de rate limit; encadeamento de vulns; PoC; evidência; ética/escopo estrito (só staging próprio).
- **A33 blue-team** · Sonnet/high — patches; sanitização de entrada; encoding de saída; CSP; headers de hardening; defaults seguros; logging/alertas; regras tipo WAF; revisão de config; correções sem regressão.
- **A34 dependency-auditor** · Haiku/medium — CVEs; licenças; pinning; supply chain; transitivas; impacto de update; SBOM; pacote malicioso; deprecação; relatório de auditoria.
- **A35 privacy-officer** · Sonnet/high — inventário de dados; minimização; retenção; consentimento; direitos LGPD; aviso de privacidade; cookies/trackers; terceiros; DPIA; casos de teste de privacidade.
- **A36 incident-responder** · Sonnet/high — triagem; contenção; preservação de evidência; causa raiz; comunicação; correções pós-incidente; timeline; severidade; validação de recuperação; postmortem.

### BLOCO 7 — QA
- **A37 qa-lead** · Sonnet/high — estratégia de testes; planejamento por risco; cobertura; gating de release; taxonomia de defeitos; rastreabilidade; métricas de QA; escopo de regressão; verificação de aceite; relatório com veredito.
- **A38 functional-tester** · Sonnet/medium — casos de teste; valores-limite; particionamento de equivalência; testes negativos; transição de estados; formulários; mensagens de erro; persistência; CRUD; bug reports.
- **A39 e2e-tester** · Sonnet/high — roteirização de jornadas; happy/sad path; consistência de dados entre fluxos; sessão; paywall; onboarding; recuperação de interrupção; multi-dispositivo; evidência por screenshots; defeitos de jornada.
- **A40 performance-tester** · Sonnet/medium — carga local; percentis de latência; profiling de recursos; gargalos; hit de cache; tamanho de payload; tempo de startup; concorrência; baselines; relatório de performance.
- **A41 accessibility-tester** · Sonnet/medium — WCAG 2.1; teclado; leitor de tela; contraste; foco; alt text; rótulos de formulário; alvos de toque; idioma/locale; bug reports de a11y.
- **A42 regression-tester** · Haiku/medium — impacto de mudança; leitura de diffs; seleção de suite; testes flaky; triagem de bugs; dedup de reports; re-scoring de severidade; checklist de regressão; comparação de resultados; relatório de triagem.

### BLOCO 8 — GROWTH, MARKETING, FINANÇAS & MONITORAMENTO
- **A43 growth-strategist** · Sonnet/high — ICP; posicionamento; canais; funil; loops de growth; CAC; coeficiente viral; sequenciamento de launch; portfólio de experimentos; memo de growth.
- **A44 content-producer** · Opus/high — hooks; frameworks de copy (AIDA/PAS); threads/roteiros; hashtags; direção de arte (descrição visual); tom de voz; calendário; formatos nativos por plataforma; variação de CTA; localização pt-BR/EN; storytelling de produto; repurposing.
- **A45 seo-aso-agent** · Sonnet/medium — keywords; titles/metas; ASO; estrutura de landing; linkagem interna; schema markup; snippets; mapeamento de keywords; gaps de conteúdo; intenção de busca.
- **A46 funnel-experimenter** · Sonnet/high — A/B; hipóteses; tamanho amostral; métrica primária+guardrail; ICE; significância; confundidores; documentação; iterações; insights.
- **A47 onboarding-cs** · Sonnet/medium — onboarding; ativação; macros de suporte; escrita empática; sinais de churn; win-back; FAQ; síntese de feedback; saúde do usuário; plays de retenção.
- **A48 finance-ops** · Sonnet/high — MRR/ARR; churn; LTV/CAC; projeção de caixa; custos; experimentos de preço; reembolsos; margem; dashboard financeiro; anomalias em receita.
- **A49 product-monitor** · Haiku/medium — KPIs; scan de logs de erro; NPS; uso de features; alertas de anomalia; digest diário; clusterização de feedback; coortes de retenção; uptime local; escalonação.

## 5. REGRAS DE ORÇAMENTO PRO

1. **Opus só no momento do gate dele** — A13 não fica "ligado" fora da Parte 4/7; A07 só nas Partes 6 e reavaliações.
2. **Fallback automático:** se o `/model` não mostrar Opus com folga, o agente roda em **Sonnet+high** sem reclamar.
3. **Haiku em modo contínuo:** A34/A42/A49 são os únicos que rodam todo dia sem dó do limite.
4. **Sprites = Opus uma vez só:** os 49 SVGs são gerados 1 vez na Parte 4; depois cache eterno.
5. **Toda task registra `model` e `effort` no events.jsonl** — o dashboard mostra o consumo por cluster.

---
---

# PARTE B.2 — COMPLEMENTO: STACK DE SKILLS REAIS (10 por agente)

Skills reais atribuídas por função. Nenhuma de enchimento — cada uma resolve
uma parte concreta do trabalho do agente.

## Legenda
- `[I]` — já disponível nesta sessão (plugin/skill entre parênteses).
- `[+]` — instalar. Comandos: ver "Marketplaces a registrar" abaixo.
- `(MCP)` — não é skill, é servidor MCP já conectado nesta sessão; incluído
  quando é a melhor ferramenta para aquela função.

## Marketplaces a registrar uma vez (custo zero)

```text
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace

/plugin marketplace add coreyhaines31/marketingskills
/plugin install marketingskills@marketingskills

/plugin marketplace add alirezarezvani/claude-skills
/plugin install <bundle>@claude-code-skills      # bundles: engineering, product, marketing, compliance, finance, research

# skills de times oficiais (índice VoltAgent / anthropics):
npx skills add anthropics/skills
npx skills add <org>/<repo>                       # ex.: trailofbits/skills, testmuai/skills
```

Fontes: obra/superpowers (~40k★) · coreyhaines31/marketingskills (~30k★) ·
alirezarezvani/claude-skills (~25k★) · VoltAgent/awesome-agent-skills (~33k★) ·
anthropics/skills (oficial) · hesreallyhim/awesome-claude-code (~28k★).

---

## BLOCO 1 — PESQUISA & VIABILIDADE

### A01 market-researcher
1. `enterprise-search:search-strategy` [I] — planeja consulta multi-fonte antes de sair pesquisando, corta ruído.
2. `enterprise-search:knowledge-synthesis` [I] — funde achados dispersos num único bloco de evidência para o brief.
3. `enterprise-search:source-management` [I] — cataloga cada fonte e classifica confiabilidade (grading que a spec exige).
4. `product-management:competitive-brief` [I] — estrutura panorama de mercado e players num formato consumível pelo CEO.
5. `product-management:synthesize-research` [I] — transforma notas cruas em insight priorizado com nível de confiança.
6. `market-research` (AR bundle `research`) [+] — sizing formal TAM/SAM/SOM e segmentação com método explícito.
7. `competitors` (VA · Corey Haines) [+] — mapeia alternativas e posicionamento do mercado-alvo.
8. `data:statistical-analysis` [I] — valida estimativas de demanda com estatística, não com chute.
9. `dataviz` [I] — gera o gráfico de tamanho/tendência de mercado que vai no `brief.md`.
10. `firecrawl_search` / `firecrawl_scrape` (MCP) — coleta páginas públicas de pricing, fóruns e relatórios sob demanda.

### A02 competitor-analyst
1. `competitors` (VA · Corey Haines) [+] — teardown estruturado de concorrente + página de comparação.
2. `product-management:competitive-brief` [I] — matriz de features e posicionamento lado a lado.
3. `enterprise-search:search` [I] — varredura dirigida de pricing pages, changelogs e reviews.
4. `firecrawl_scrape` (MCP) — extrai pricing tables e listagens de app store como dado estruturado.
5. `firecrawl_extract` (MCP) — puxa reviews e ratings em massa para mineração.
6. `data:explore-data` [I] — clusteriza reclamações e detecta sinais de churn nos reviews coletados.
7. `enterprise-search:knowledge-synthesis` [I] — consolida forças/fraquezas de N concorrentes num SWOT único.
8. `product-management:synthesize-research` [I] — converte o SWOT em oportunidades de diferenciação acionáveis.
9. `dataviz` [I] — matriz visual de features e mapa de posicionamento (2x2).
10. `f17010c9bb48:docx` [I] — empacota o brief competitivo num documento navegável.

### A03 trend-scout
1. `enterprise-search:search-strategy` [I] — define as fontes e keywords-seed antes da varredura.
2. `firecrawl_search` (MCP) — varre fóruns, Reddit-like e comunidades públicas por sinais.
3. `vidiq_keyword_research` (MCP) — volume e velocidade de busca de keywords (sinal de demanda).
4. `vidiq_trending_videos` / `vidiq_trend_categories` (MCP) — o que está subindo por categoria agora.
5. `ai-seo` (CH · marketingskills) [+] — o que os motores de resposta de IA já citam sobre o tema (demanda emergente).
6. `data:create-viz` [I] — plota a curva da tendência e marca o estágio do ciclo.
7. `data:validate-data` [I] — filtra sinal de ruído antes de reportar (evita "modinha").
8. `enterprise-search:digest` [I] — condensa a varredura num digest curto de sinais.
9. `reasoningbank-intelligence` [I] — guarda padrões de "tendência que deu certo/errado" entre projetos.
10. `firecrawl_map` (MCP) — enumera páginas de um site/comunidade para varredura ampla e barata.

### A04 user-pain-analyst
1. `design:user-research` [I] — protocolo de pesquisa de usuário, roteiro de entrevista, análise.
2. `ux-researcher` (AR bundle `product`) [+] — JTBD, personas e validação estruturada.
3. `design:research-synthesis` [I] — clusteriza reclamações e extrai temas de dor recorrentes.
4. `firecrawl_extract` (MCP) — puxa reviews/threads em massa para minerar dor real.
5. `data:explore-data` [I] — score frequência×severidade sobre o corpus de reclamações.
6. `product-management:synthesize-research` [I] — vira insight priorizado e acionável para o PRD.
7. `design:design-critique` [I] — mapeia pontos de fricção na experiência atual dos concorrentes.
8. `enterprise-search:knowledge-synthesis` [I] — funde entrevistas + reviews + fóruns numa persona só.
9. `dataviz` [I] — mapa de calor de dores (frequência × severidade).
10. `f17010c9bb48:docx` [I] — empacota personas e mapa de empatia num documento.

### A05 financial-viability
1. `financial-analyst` (AR bundle `finance`) [+] — DCF, budgeting, modelagem de cenário.
2. `saas-metrics-coach` (AR bundle `finance`) [+] — MRR, churn, LTV/CAC com fórmulas corretas.
3. `agentic-bundle-aas-saas-launch-revenue:pricing-strategy` [I] — desenho de ladder de preços e planos.
4. `agentic-bundle-aas-saas-launch-revenue:monetization` [I] — modelos de receita e trade-offs de packaging.
5. `data:statistical-analysis` [I] — sensibilidade de churn e intervalos, não ponto único.
6. `data:build-dashboard` [I] — planilha/painel de unit economics com cenários bull/base/bear.
7. `data:write-query` [I] — extrai coortes de benchmark de dados locais.
8. `f17010c9bb48:xlsx` [I] — entrega o modelo financeiro como planilha auditável.
9. `dataviz` [I] — gráfico de break-even e curva LTV/CAC.
10. `cfo-advisor` (AR bundle `c-level`) [+] — sanity-check executivo do memo antes de ir ao CEO.

### A06 tech-feasibility
1. `engineering:system-design` [I] — avalia se o escopo cabe em HTML/JS + Node local.
2. `engineering:architecture` [I] — esboça a arquitetura mínima e aponta riscos estruturais.
3. `senior-architect` (AR bundle `engineering`) [+] — seleção de stack e trade-offs documentados.
4. `engineering:tech-debt` [I] — antecipa dívida que o MVP vai gerar.
5. `agentic-bundle-full-stack-developer:senior-fullstack` [I] — julgamento de esforço realista (T-shirt sizing).
6. `context7:query-docs` (MCP) — checa APIs/libs candidatas contra a doc real, sem alucinar versão.
7. `superpowers:writing-plans` [+] — quebra o MVP em fatias entregáveis com critério de pronto.
8. `zero-hallucination-coder` [I] — PoC rápida com afirmações amarradas a fonte.
9. `llm-cost-optimizer` [I] — estima custo de qualquer parte que use LLM antes de commitar.
10. `f17010c9bb48:docx` [I] — parecer de viabilidade (fácil/médio/difícil + riscos) em documento.

---

## BLOCO 2 — GOVERNANÇA

### A07 ceo
1. `superpowers:brainstorming` [+] — força perguntas e revela premissas fracas antes de decidir.
2. `product-management:synthesize-research` [I] — comprime o dossiê (brief+score+risco) no essencial.
3. `cto-advisor` (AR bundle `c-level`) [+] — segunda opinião técnica sobre viabilidade e risco.
4. `cfo-advisor` (AR bundle `c-level`) [+] — segunda opinião sobre monetização e caixa.
5. `ciso-advisor` (AR bundle `c-level`) [+] — segunda opinião sobre risco de segurança/legal.
6. `product-management:stakeholder-update` [I] — formato de memo decisório curto e final.
7. `data:metrics-review` (`product-management:metrics-review`) [I] — lê o score contra thresholds sem viés.
8. `prompt-governance` [I] — checa se a decisão não está sendo enviesada por hype no material.
9. `reasoningbank-intelligence` [I] — recupera decisões passadas parecidas e seus desfechos.
10. `f17010c9bb48:internal-comms` [I] — redige o "não" com justificativa clara e sem ambiguidade.

### A08 chief-of-staff
1. `superpowers:writing-plans` [+] — decompõe épicos em TASKs com dependência explícita.
2. `product-management:sprint-planning` [I] — monta a fila e ordena por prioridade/dependência.
3. `engineering:standup` [I] — rollup diário de status dos agentes ativos.
4. `agents:orchestrate` (`coordination:orchestrate`) [I] — despacha no máximo 5 agentes e coordena handoffs.
5. `agents:pool` [I] — controla quantos agentes estão "ativos" ao mesmo tempo.
6. `monitoring:status` [I] — detecta gargalos e TASKs travadas na fila.
7. `hooks:route` (`hooks_route`) [I] — roteia cada TASK para o agente/skill certo.
8. `llm-cost-optimizer` [I] — disciplina de orçamento de contexto por bloco de trabalho.
9. `ruflo-cost-tracker:cost-session` [I] — número real de consumo por sessão para o relatório.
10. `f17010c9bb48:internal-comms` [I] — escreve o `daily-report.md` de operação.

### A09 pmo
1. `product-management:roadmap-update` [I] — milestones, fases e checkpoints.
2. `superpowers:writing-plans` [+] — caminho crítico e mapa de dependências.
3. `product-management:sprint-planning` [I] — quebra milestone em entregas com buffer.
4. `engineering:tech-debt` [I] — antecipa scope creep e re-baselining necessário.
5. `product-management:metrics-review` [I] — acompanha progresso vs plano.
6. `data:build-dashboard` [I] — Gantt/burndown simples em HTML.
7. `engineering:standup` [I] — coleta status para o rollup do PMO.
8. `product-management:stakeholder-update` [I] — status executivo curto.
9. `reasoningbank-intelligence` [I] — lições de cronograma de projetos anteriores.
10. `f17010c9bb48:xlsx` [I] — plano com fases/datas/donos em planilha.

### A10 risk-compliance
1. `gdpr-auditor` (AR bundle `compliance`) [+] — mapeia LGPD/GDPR e faz avaliação tipo DPIA.
2. `soc2-advisor` (AR bundle `compliance`) [+] — mapeamento de controles e evidência.
3. `security-guidance` [I] — checklist de risco de segurança por gate.
4. `design:ux-copy` [I] — redige política de privacidade e avisos em linguagem clara.
5. `prompt-governance` [I] — revisa uso de dados/PII em qualquer parte que use LLM.
6. `aidefence_has_pii` / `aidefence_scan` (MCP claude-flow) [I] — detecta PII e conteúdo sensível nos fluxos.
7. `enterprise-search:search` [I] — puxa termos de uso das plataformas-alvo (X, IG, TikTok…).
8. `ciso-advisor` (AR bundle `c-level`) [+] — enquadramento de responsabilidade e risco legal.
9. `f17010c9bb48:pdf` [I] — lê PDFs de regulação/termos e extrai obrigações.
10. `f17010c9bb48:docx` [I] — entrega o registro de riscos legais e o checklist por gate.

---

## BLOCO 3 — PRODUTO, DESIGN & ARQUITETURA

### A11 product-manager
1. `product-manager` (AR bundle `product`) [+] — discovery, estratégia, roadmap.
2. `product-management:write-spec` [I] — PRD com user stories e critérios de aceite.
3. `product-management:product-brainstorming` [I] — gera e filtra opções de escopo do MVP.
4. `superpowers:brainstorming` [+] — refina a ideia por perguntas antes de escrever o PRD.
5. `product-management:sprint-planning` [I] — priorização RICE/MoSCoW e planejamento de release.
6. `product-management:synthesize-research` [I] — puxa dores do brief para user stories.
7. `product-management:metrics-review` [I] — define north-star e métricas de sucesso.
8. `engineering:testing-strategy` [I] — critérios de aceite testáveis desde o PRD.
9. `product-management:stakeholder-update` [I] — alinhamento entre os agentes dos blocos.
10. `f17010c9bb48:docx` [I] — PRD navegável em `blueprint.md`.

### A12 ux-researcher
1. `ux-researcher` (AR bundle `product`) [+] — jornadas, fluxos, validação.
2. `design:user-research` [I] — protocolo e roteiro de teste de usabilidade.
3. `design:research-synthesis` [I] — consolida achados em recomendações priorizadas.
4. `design:design-critique` [I] — avaliação heurística e auditoria de fricção.
5. `impeccable` [I] — revisão de carga cognitiva, hierarquia e IA de interface.
6. `design:accessibility-review` [I] — a11y considerada já no fluxo, não só no fim.
7. `f17010c9bb48:frontend-design` [I] — traduz jornada em wireframe de fluxo.
8. `figma:figma-generate-diagram` [I] — diagrama de jornada/fluxo em FigJam.
9. `design:ux-copy` [I] — microcopy de onboarding e estados.
10. `f17010c9bb48:docx` [I] — mapa de jornada + recomendações em documento.

### A13 ui-designer · Opus
1. `design` [I] — identidade de marca, design tokens, logo, sistema visual.
2. `design-system` [I] — arquitetura de tokens (primitivo→semântico→componente).
3. `ui-ux-pro-max` [I] — 67 estilos, 161 paletas, 57 pares tipográficos como referência.
4. `theme-factory` (`f17010c9bb48:theme-factory`) [I] — gera tema dark/light consistente a partir de uma paleta.
5. `f17010c9bb48:canvas-design` [I] — composição de telas e pôsteres/mockups.
6. `f17010c9bb48:algorithmic-art` [I] — grade de pixels para os sprites pixel-art (sem anti-aliasing).
7. `banner-design` [I] — heros/criativos com direção de arte.
8. `f17010c9bb48:brand-guidelines` [I] — formaliza o guia visual da AI Venture Factory.
9. `figma:figma-generate-design` [I] — materializa telas usando o design system.
10. `design:design-handoff` [I] — entrega tokens + specs prontos para o A14.

### A14 frontend-design-engineer · Opus
1. `f17010c9bb48:frontend-design` [I] — decomposição de componentes e distinção visual.
2. `impeccable` [I] — estados (vazio/carregando/erro), motion, micro-interações, hierarquia.
3. `ui-styling` [I] — Tailwind + componentes acessíveis (Radix-like), dark mode.
4. `frontend-developer` (AR bundle `engineering`) [+] — implementação fiel design→código.
5. `f17010c9bb48:web-artifacts-builder` [I] — página self-contained (o dashboard) com CSP estrita.
6. `f17010c9bb48:algorithmic-art` [I] — geração dos 49 SVG pixel-art em grade.
7. `artifact-diagramming` [I] — SVG inline legível em tema claro/escuro.
8. `a11y-audit` [I] — WCAG na implementação, foco, teclado, contraste.
9. `design:design-handoff` [I] — consome tokens do A13 sem perda de fidelidade.
10. `next.js-best-practices` / `gsap-skills` (VA) [+] — padrões de perf e animação (referência, mesmo em vanilla).

### A15 backend-api-designer
1. `agentic-bundle-full-stack-developer:api-patterns` [I] — contratos REST, paginação, filtros, versionamento.
2. `engineering:system-design` [I] — regras de negócio e fronteiras de serviço.
3. `agentic-bundle-full-stack-developer:auth-implementation-patterns` [I] — fluxos authn/authz no contrato.
4. `stripe-best-practices` (VA · Stripe) [+] — modela webhooks idempotentes (mesmo simulados).
5. `mcp-builder` (`f17010c9bb48:mcp-builder`) [I] — disciplina de definir schema de tool/endpoint com rigor.
6. `context7:query-docs` (MCP) — confere convenções REST/OpenAPI reais.
7. `zero-hallucination-coder` [I] — cada regra do contrato amarrada a requisito do PRD.
8. `data:validate-data` [I] — define taxonomia de erros e validação de entrada.
9. `f17010c9bb48:docx` [I] — spec de API tipo OpenAPI legível.
10. `engineering:documentation` [I] — doc de contrato versionada junto do código.

### A16 solution-architect · Opus
1. `senior-architect` (AR bundle `engineering`) [+] — decomposição de sistema e seleção de stack.
2. `engineering:architecture` [I] — arquitetura geral, limites, deploy.
3. `engineering:system-design` [I] — modos de falha e caminhos de escala.
4. `agentic-bundle-full-stack-developer:database-design` [I] — escolha de banco e modelagem (SQLite local-first).
5. `security-guidance` [I] — security-by-design desde o diagrama.
6. `docker-development` [I] — avalia containerização vs. simples Node local (custo zero).
7. `superpowers:writing-plans` [+] — ADRs e sequência de implementação.
8. `artifact-diagramming` [I] — diagrama de arquitetura que funciona nos dois temas.
9. `context7:query-docs` (MCP) — valida limites reais das libs escolhidas.
10. `engineering:code-review` [I] — revisa a arquitetura proposta por outros agentes.

---

## BLOCO 4 — ENGENHARIA

### A17 tech-lead
1. `engineering:code-review` [I] — review rigoroso antes de qualquer merge.
2. `code-review` (skill nativa) [I] — revisão de diff/branch com severidade.
3. `simplify` [I] — aponta reuso e simplificação sem caçar bug.
4. `named-persona-adversarial-review` (AR bundle `engineering`) [+] — review por múltiplas filosofias de engenharia.
5. `superpowers:receiving-code-review` [+] — protocolo de aplicar feedback de review com disciplina.
6. `engineering:tech-debt` [I] — triagem de dívida e decisão build-vs-refactor.
7. `github:pr-manager` [I] — estratégia de branch/merge (A17 é o único que mergeia).
8. `superpowers:writing-plans` [+] — quebra técnica de tarefas para os devs.
9. `engineering:documentation` [I] — padrão de changelog e doc curta por entrega.
10. `zero-hallucination-coder` [I] — exige que claim de "funciona" venha com evidência.

### A18 frontend-web-dev
1. `frontend-developer` (AR bundle `engineering`) [+] — HTML semântico, CSS moderno, JS/DOM.
2. `f17010c9bb48:frontend-design` [I] — implementa componentes conforme spec do A14.
3. `ui-styling` [I] — utilitários e componentes acessíveis.
4. `agentic-bundle-full-stack-developer:frontend-developer` [I] — fetch, estado de cliente, roteamento hash/history.
5. `f17010c9bb48:web-artifacts-builder` [I] — build de página self-contained (dashboard).
6. `superpowers:test-driven-development` [+] — RED-GREEN-REFACTOR no JS do cliente.
7. `webapp-testing` (`f17010c9bb48:webapp-testing`) [I] — smoke test da UI no navegador.
8. `a11y-audit` [I] — a11y básica (rótulos, foco, contraste).
9. `superpowers:systematic-debugging` [+] — debug de DOM/estado por método, não por chute.
10. `engineering:documentation` [I] — doc curta + changelog do componente.

### A19 mobile-dev
1. `agentic-bundle-full-stack-developer:frontend-developer` [I] — base de UI reaproveitada no PWA.
2. `expo-building-native-ui` (VA · Expo) [+] — padrões de UI touch e animação (referência PWA).
3. `react-native-best-practices` (VA · CallStack) [+] — budget de performance mobile.
4. `f17010c9bb48:web-artifacts-builder` [I] — shell do PWA self-contained.
5. `ui-styling` [I] — layout responsivo, safe areas, alvos de toque.
6. `superpowers:test-driven-development` [+] — TDD do service worker / cache offline.
7. `webapp-testing` [I] — testa manifest, install prompt e offline no navegador.
8. `a11y-audit` [I] — a11y em telas touch.
9. `superpowers:systematic-debugging` [+] — debug de cache/SW.
10. `engineering:documentation` [I] — doc + changelog do PWA.

### A20 backend-dev
1. `agentic-bundle-full-stack-developer:backend-dev-guidelines` [I] — roteamento Node, middleware, erros.
2. `agentic-bundle-full-stack-developer:api-patterns` [I] — implementa REST fiel à spec do A15.
3. `superpowers:test-driven-development` [+] — testes unitários primeiro.
4. `neon-postgres` / `duckdb-skills` (VA) [+] — padrões de acesso a dados (referência; app usa SQLite).
5. `security-guidance` [I] — headers de segurança e validação de entrada.
6. `data:validate-data` [I] — validação de payload nas bordas.
7. `engineering:debug` [I] — tratamento e rastreio de erros estruturado.
8. `superpowers:verification-before-completion` [+] — só marca pronto após provar que roda.
9. `context7:query-docs` (MCP) — confere API de libs Node reais.
10. `engineering:documentation` [I] — doc de endpoints + changelog.

### A21 database-dev
1. `agentic-bundle-full-stack-developer:database-design` [I] — normalização, constraints, versionamento de schema.
2. `data:sql-queries` [I] — queries e índices.
3. `data:write-query` [I] — otimização e prevenção de N+1.
4. `duckdb-skills` (VA · DuckDB) [+] — padrões de query engine (referência de perf).
5. `neon-postgres` (VA · Neon) [+] — boas práticas de migrations seguras (adaptar a SQLite).
6. `superpowers:test-driven-development` [+] — testes de migration antes de aplicar.
7. `data:validate-data` [I] — integridade de dados e seeds.
8. `data:explore-data` [I] — checa distribuição/plano de query.
9. `engineering:incident-response` [I] — playbook de backup/restore.
10. `engineering:documentation` [I] — doc de schema + changelog de migration.

### A22 payments-dev
1. `agentic-bundle-aas-saas-launch-revenue:stripe-integration` [I] — assinatura, checkout, planos (modo simulado).
2. `agentic-bundle-full-stack-developer:stripe-integration` [I] — webhooks e máquina de estados.
3. `stripe-best-practices` (VA · Stripe) [+] — idempotência de webhook e proration corretos.
4. `churn-prevention` (CH · marketingskills) [+] — dunning, save offers, health scoring no paywall.
5. `agentic-bundle-aas-saas-launch-revenue:monetization` [I] — catálogo de planos e packaging.
6. `agentic-bundle-aas-saas-launch-revenue:pricing-strategy` [I] — trial e ladder de preço no código.
7. `security-guidance` [I] — garante zero dado de cartão tocando o app.
8. `superpowers:test-driven-development` [+] — testa transições de assinatura (trial→ativo→cancelado).
9. `superpowers:verification-before-completion` [+] — prova o fluxo simulado ponta a ponta.
10. `engineering:documentation` [I] — doc do fluxo de billing + changelog.

### A23 auth-dev
1. `agentic-bundle-full-stack-developer:auth-implementation-patterns` [I] — sessão, RBAC, recuperação de conta.
2. `better-auth-skills` (VA · Better Auth) [+] — padrões de setup de auth e providers.
3. `security-guidance` [I] — hashing, cookies seguros, CSRF, rate limit de login.
4. `auth0-skills` (VA · Auth0) [+] — modelo de identidade e rotação de token (referência).
5. `superpowers:test-driven-development` [+] — testes de sessão, logout global, expiração.
6. `aidefence_scan` (MCP claude-flow) [I] — varre o código de auth por padrões inseguros.
7. `engineering:code-review` [I] — auto-checklist antes de mandar pro A17.
8. `superpowers:verification-before-completion` [+] — prova bypass-resistência antes de "pronto".
9. `data:validate-data` [I] — validação de entrada nos endpoints de auth.
10. `engineering:documentation` [I] — doc de auth + log de auditoria + changelog.

### A24 ai-integrations-dev
1. `claude-api` [I] — model ids, pricing, params, tool use, caching corretos.
2. `mcp-builder` (`f17010c9bb48:mcp-builder`) [I] — expõe recurso de IA como tool com schema rígido.
3. `llm-cost-optimizer` [I] — orçamento de tokens e teto de custo por feature.
4. `prompt-governance` [I] — guardrails anti prompt-injection na entrada do usuário.
5. `zero-hallucination-coder` [I] — validação e parsing estrito da saída do modelo.
6. `superpowers:condition-based-waiting` [+] — retry com backoff e espera por condição, não sleep fixo.
7. `agentdb-vector-search` [I] — cache semântico de respostas / RAG local.
8. `reasoningbank-agentdb` [I] — harness de avaliação com trajetórias e verdict.
9. `superpowers:test-driven-development` [+] — testes de contrato da saída de IA.
10. `engineering:documentation` [I] — doc de prompts + fallback chain + changelog.

### A25 devops
1. `engineering:deploy-checklist` [I] — checklist de build/deploy local sem downtime.
2. `docker-development` [I] — containeriza só se valer a pena (custo zero primeiro).
3. `github:workflow-automation` [I] — CI local por scripts + gates.
4. `superpowers:subagent-driven-development` [+] — paraleliza build/lint/test por sub-rotina.
5. `hooks:setup` [I] — hooks de pre/post task (lint, format, log).
6. `ci/cd-pipelines` (VA · TestMu AI) [+] — gera pipeline local reproduzível.
7. `engineering:incident-response` [I] — alertas de falha de build e rollback.
8. `ruflo-cost-tracker:cost-report` [I] — custo de sessão no pipeline (auditoria do plano).
9. `run` (skill nativa) [I] — sobe o app/dashboard para validar a mudança.
10. `engineering:documentation` [I] — runbook do ambiente + changelog.

### A26 reliability-engineer
1. `k6-performance` / `performance-testing` (VA · TestMu AI) [+] — load test local e percentis.
2. `engineering:system-design` [I] — timeouts, retries, degradação graciosa.
3. `data:statistical-analysis` [I] — baselines de latência e detecção de regressão.
4. `superpowers:systematic-debugging` [+] — caça a memory leak e gargalo por método.
5. `agentdb-optimization` [I] — quantização/HNSW se houver busca vetorial no produto.
6. `data:build-dashboard` [I] — painel de perf (latência, cache hit, startup).
7. `monitoring:real-time-view` [I] — hooks de monitoramento contínuo.
8. `engineering:incident-response` [I] — chaos-lite e playbook de degradação.
9. `optimization:cache-manage` [I] — camadas de cache e invalidação.
10. `engineering:documentation` [I] — relatório de performance + changelog.

---

## BLOCO 5 — CONECTORES

### A27 local-integration-lead
1. `security-guidance` [I] — princípio de menor privilégio e superfície de ataque.
2. `metaharness_threat_model` (MCP claude-flow) [I] — threat model das automações locais.
3. `superpowers:writing-plans` [+] — plano de integração com blast radius e rollback.
4. `differential-review` (VA · Trail of Bits) [+] — revisa cada mudança de automação contra o histórico.
5. `engineering:incident-response` [I] — escopo e playbook de incidente local.
6. `policy_evaluate` (MCP claude-flow) [I] — checa a ação contra a política antes de rodar.
7. `f17010c9bb48:internal-comms` [I] — redige o checklist de privilégios para aprovação humana.
8. `desktop-commander:computer-health-check` [I] — inventário do que a automação vai tocar.
9. `hooks:pre-task` [I] — gate de aprovação antes de qualquer automação executar.
10. `engineering:documentation` [I] — registro de integrações e permissões concedidas.

### A28 api-connector
1. `composio-skills` (VA · Composio) [+] — padrão de conectar agente a apps externos com escopo.
2. `courier-skills` (VA · Courier) [+] — notificação multicanal (email/SMS/push) como referência.
3. `agentic-bundle-full-stack-developer:api-patterns` [I] — consumo REST, paginação, erros.
4. `superpowers:condition-based-waiting` [+] — retry/backoff e respeito a rate limit.
5. `zapier` (MCP dd53865d…) — 9.000+ apps via Zapier com ações somente-leitura/escrita explícitas.
6. `n8n-mcp:search_nodes` (MCP) — descobre nós/integrações para webhooks e OAuth.
7. `context7:query-docs` (MCP) — confere contrato real da API de terceiro.
8. `data:validate-data` [I] — mapeamento e validação de schema de resposta.
9. `superpowers:test-driven-development` [+] — testes de contrato do conector.
10. `engineering:documentation` [I] — doc do conector + taxonomia de erros.

### A29 desktop-operator
1. `desktop-commander:terminal` [I] — execução de comando da whitelist com log.
2. `desktop-commander:desktop-commander-overview` [I] — limites e capacidades do operador local.
3. `insecure-defaults` (VA · Trail of Bits) [+] — detecta path traversal / comando perigoso antes de rodar.
4. `superpowers:defense-in-depth` [+] — sanitização de path em camadas.
5. `hooks:pre-command` [I] — gate + log antes de cada comando.
6. `hooks:post-command` [I] — checksum e verificação de efeito após o comando.
7. `policy_evaluate` (MCP claude-flow) [I] — nega ação fora de `company/ dashboard/ scripts/ .claude/`.
8. `filesystem:*` (MCP) [I] — operações de arquivo com diretório permitido explícito.
9. `engineering:incident-response` [I] — undo/rollback de operação que deu errado.
10. `engineering:documentation` [I] — log auditável de toda ação executada.

### A30 secrets-keeper
1. `insecure-defaults` (VA · Trail of Bits) [+] — encontra secret hardcoded e crypto fraca.
2. `aidefence_scan` (MCP claude-flow) [I] — scan de vazamento de credencial em código e logs.
3. `transfer_detect-pii` (MCP claude-flow) [I] — detecta PII/secret antes de qualquer transferência.
4. `security-guidance` [I] — need-to-know, rotação, injeção só em runtime.
5. `prompt-governance` [I] — impede secret de entrar em prompt/contexto.
6. `superpowers:defense-in-depth` [+] — mascaramento em múltiplas camadas (logger + hook + review).
7. `hooks:pre-edit` [I] — bloqueia commit de `.env` e chaves.
8. `engineering:incident-response` [I] — playbook de resposta a vazamento de secret.
9. `differential-review` (VA · Trail of Bits) [+] — revisa diffs procurando secret introduzido.
10. `engineering:documentation` [I] — inventário de secrets (nomes lógicos, nunca valores).

---

## BLOCO 6 — CYBERSECURITY

### A31 appsec-lead · Opus
1. `security-guidance` [I] — checklist de segurança e gates.
2. `metaharness_threat_model` (MCP claude-flow) [I] — threat model STRIDE do app-001.
3. `security-threat-model` (VA · OpenAI) [+] — threat model específico do repositório.
4. `security-ownership-map` (VA · OpenAI) [+] — mapa de ownership e bus factor da superfície de ataque.
5. `ciso-advisor` (AR bundle `c-level`) [+] — scoring de risco e comunicação não-técnica.
6. `security-review` (skill nativa) [I] — revisão de design seguro por PR.
7. `static-analysis` (VA · Trail of Bits) [+] — toolkit CodeQL/Semgrep/SARIF para baseline.
8. `metaharness_redblue` (MCP claude-flow) [I] — define o escopo do exercício red/blue.
9. `engineering:system-design` [I] — casos de abuso e requisitos de segurança na arquitetura.
10. `f17010c9bb48:docx` [I] — threat model + checklist em documento para o gate G7.

### A32 red-team · Opus
1. `metaharness_redblue` (MCP claude-flow) [I] — orquestra o ataque autorizado no staging.
2. `semgrep-rule-creator` (VA · Trail of Bits) [+] — cria regra para caçar a classe de vuln alvo.
3. `static-analysis` (VA · Trail of Bits) [+] — CodeQL/Semgrep para achar injeção, XSS, secret exposto.
4. `insecure-defaults` (VA · Trail of Bits) [+] — hardcoded secrets, crypto fraca, config perigosa.
5. `constant-time-analysis` (VA · Trail of Bits) [+] — timing side-channel em comparação de token/senha.
6. `security-best-practices` (VA · OpenAI) [+] — checklist de vuln por linguagem para guiar o probing.
7. `aidefence_analyze` (MCP claude-flow) [I] — testa prompt-injection nas features de IA.
8. `webapp-testing` (`f17010c9bb48:webapp-testing`) [I] — dirige o navegador para reproduzir XSS/CSRF/IDOR.
9. `superpowers:systematic-debugging` [+] — encadeia vulnerabilidades por método, com PoC.
10. `f17010c9bb48:docx` [I] — relatório de evidência + reprodução em `company/security/`.

### A33 blue-team
1. `differential-review` (VA · Trail of Bits) [+] — revisa o patch contra o histórico, sem regressão.
2. `blue-team` remediation (`security-auditor` AR bundle `engineering`) [+] — escreve correção e hardening.
3. `security-guidance` [I] — defaults seguros, headers, CSP.
4. `superpowers:defense-in-depth` [+] — sanitização de entrada + encoding de saída em camadas.
5. `static-analysis` (VA · Trail of Bits) [+] — confirma que a classe de vuln sumiu após o patch.
6. `aidefence_learn` (MCP claude-flow) [I] — atualiza regras de defesa com o achado do red-team.
7. `superpowers:test-driven-development` [+] — teste de regressão que falha sem o patch.
8. `engineering:code-review` [I] — revisão do próprio patch antes do reteste.
9. `hooks:post-edit` [I] — roda scan automático após cada correção.
10. `engineering:documentation` [I] — changelog de segurança e config endurecida.

### A34 dependency-auditor · Haiku
1. `dependency-auditor` (`security-auditor` AR bundle `engineering`) [+] — CVE lookup e risco de supply chain.
2. `transfer_plugin-info` / `transfer_store-info` (MCP claude-flow) [I] — metadados e reputação de pacote.
3. `static-analysis` (VA · Trail of Bits) [+] — SBOM e árvore de dependências transitivas.
4. `context7:resolve-library-id` (MCP) — versão real e status de deprecação de cada lib.
5. `data:validate-data` [I] — cruza lockfile com base de CVE e licenças.
6. `security-guidance` [I] — política de pinning e critério de update.
7. `differential-review` (VA · Trail of Bits) [+] — analisa o diff de um bump de versão.
8. `aidefence_scan` (MCP claude-flow) [I] — padrões de pacote malicioso (typosquat, script pós-install).
9. `data:create-viz` [I] — grafo de dependências com nós de risco destacados.
10. `f17010c9bb48:docx` [I] — relatório de auditoria de dependências.

### A35 privacy-officer
1. `gdpr-auditor` (AR bundle `compliance`) [+] — inventário de dados, DPIA, direitos LGPD.
2. `transfer_detect-pii` (MCP claude-flow) [I] — mapeia onde PII entra, trafega e fica.
3. `aidefence_has_pii` (MCP claude-flow) [I] — varre logs/telemetria por PII vazada.
4. `security-guidance` [I] — minimização de dados e retenção.
5. `design:ux-copy` [I] — fluxo de consentimento e aviso de privacidade claros.
6. `webapp-testing` [I] — audita cookies/trackers carregados pela landing.
7. `data:explore-data` [I] — revisa o que é realmente coletado vs. necessário.
8. `enterprise-search:search` [I] — política de compartilhamento com terceiros (APIs usadas).
9. `superpowers:test-driven-development` [+] — casos de teste de privacidade (ex.: expurgo de conta).
10. `f17010c9bb48:docx` [I] — relatório de privacidade e casos de teste.

### A36 incident-responder
1. `engineering:incident-response` [I] — triagem, contenção, comunicação.
2. `metaharness_oia_audit` (MCP claude-flow) [I] — reconstrói timeline observe-infer-act do incidente.
3. `superpowers:root-cause-tracing` (`systematic-debugging`) [+] — causa raiz até a origem.
4. `security-guidance` [I] — classificação de severidade e critério de contenção.
5. `analyze_diff-risk` (MCP claude-flow) [I] — identifica o commit que introduziu a regressão.
6. `differential-review` (VA · Trail of Bits) [+] — confirma o patch pós-incidente.
7. `superpowers:verification-before-completion` [+] — valida recuperação antes de fechar.
8. `f17010c9bb48:internal-comms` [I] — templates de comunicação de incidente.
9. `reasoningbank-intelligence` [I] — guarda o padrão do incidente para prevenção futura.
10. `f17010c9bb48:docx` [I] — postmortem estruturado.

---

## BLOCO 7 — QA

### A37 qa-lead
1. `engineering:testing-strategy` [I] — estratégia de teste e planejamento por risco.
2. `qa-lead` (`playwright-pro` AR bundle `engineering`) [+] — plano de teste e gating de release.
3. `product-management:metrics-review` [I] — métricas de QA e critério de aceite.
4. `engineering:code-review` [I] — rastreabilidade teste↔requisito.
5. `superpowers:verification-before-completion` [+] — veredito só com evidência.
6. `test-framework-migration` (VA · TestMu AI) [+] — escolhe/padroniza o runner do projeto.
7. `data:build-dashboard` [I] — painel de cobertura e defeitos por severidade.
8. `hooks:coverage-gaps` (`hooks_coverage-gaps`) [I] — aponta o que não está testado.
9. `github:issue-tracker` [I] — abre TASKs de bug com taxonomia consistente.
10. `f17010c9bb48:docx` [I] — `qa-report.md` com veredito release-ready.

### A38 functional-tester
1. `playwright-skill` [I] — casos funcionais dirigindo o navegador.
2. `playwright-pro` (AR bundle `engineering`) [+] — geração de teste e correção de flaky.
3. `webapp-testing` (`f17010c9bb48:webapp-testing`) [I] — CRUD, formulários, mensagens de erro.
4. `jest`/`vitest` skills (VA · TestMu AI) [+] — testes unitários de regras de negócio.
5. `superpowers:test-driven-development` [+] — valores-limite e particionamento de equivalência.
6. `engineering:debug` [I] — reproduz e isola o defeito.
7. `data:validate-data` [I] — checa persistência e integridade após operação.
8. `superpowers:condition-based-waiting` [+] — espera determinística (mata flaky).
9. `github:issue-tracker` [I] — bug reports padronizados.
10. `superpowers:verification-before-completion` [+] — confirma o fix antes de fechar.

### A39 e2e-tester
1. `playwright-skill` [I] — jornada completa conta→paywall→uso.
2. `cypress`/`playwright` e2e (VA · TestMu AI) [+] — happy/sad path e recuperação de interrupção.
3. `webapp-testing` [I] — walkthrough multi-página com evidência por screenshot.
4. `agentic-bundle-full-stack-developer:e2e-testing-patterns` [I] — padrões de teste de fluxo ponta a ponta.
5. `superpowers:condition-based-waiting` [+] — sincronização de passos sem sleep fixo.
6. `mcp__claude-in-chrome__*` (MCP) — sessão logada real para fluxos que dependem de estado.
7. `data:validate-data` [I] — consistência de dados entre telas do fluxo.
8. `resize_window` (browser MCP) [I] — jornada em mobile/desktop e dark mode.
9. `github:issue-tracker` [I] — defeitos de jornada com repro.
10. `superpowers:verification-before-completion` [+] — jornada verde antes do veredito.

### A40 performance-tester
1. `k6-performance` (VA · TestMu AI) [+] — geração de carga local e percentis de latência.
2. `data:statistical-analysis` [I] — p50/p95/p99 e comparação com baseline.
3. `mcp__Claude_Browser__read_network_requests` (MCP) [I] — auditoria de tamanho de payload e waterfall.
4. `mcp__Claude_Browser__preview_logs` (MCP) [I] — tempo de startup e erros de servidor sob carga.
5. `optimization:cache-manage` [I] — verifica hit ratio de cache.
6. `superpowers:systematic-debugging` [+] — isola o gargalo por método.
7. `data:create-viz` [I] — gráfico de latência × carga.
8. `smartui-visual-regression` (VA · TestMu AI) [+] — detecta regressão visual sob perf tuning.
9. `performance_benchmark` (MCP claude-flow) [I] — baseline versionado por commit.
10. `f17010c9bb48:docx` [I] — relatório de performance.

### A41 accessibility-tester
1. `a11y-audit` [I] — checagem WCAG 2.1 estruturada.
2. `design:accessibility-review` [I] — revisão de a11y de fluxo e componente.
3. `frontend-design-review` (VA · Microsoft) [+] — revisão de interface incluindo a11y.
4. `webapp-testing` [I] — navegação só por teclado e ordem de foco.
5. `mcp__Claude_Browser__read_page` (MCP) [I] — árvore de acessibilidade (roles/labels) da página.
6. `mcp__Claude_Browser__javascript_tool` (MCP) [I] — mede contraste computado real.
7. `resize_window` + `colorScheme` (browser MCP) [I] — testa dark mode e zoom.
8. `design:ux-copy` [I] — revisa alt text e rótulos de formulário.
9. `enterprise-search:search` [I] — checa requisitos de idioma/locale (pt-BR/EN).
10. `github:issue-tracker` [I] — bug reports de a11y priorizados.

### A42 regression-tester · Haiku
1. `analyze_diff` / `analyze_diff-risk` (MCP claude-flow) [I] — impacto de mudança a partir do diff.
2. `hooks:coverage-route` (`hooks_coverage-route`) [I] — seleciona a suite de regressão certa para o diff.
3. `playwright-skill` [I] — roda a suite selecionada e compara resultados.
4. `superpowers:condition-based-waiting` [+] — elimina flakiness antes de acusar regressão.
5. `github:issue-triage` [I] — triagem e dedup de bug reports.
6. `data:validate-data` [I] — compara saída atual vs. baseline.
7. `regression-tester` (`playwright-pro` AR bundle) [+] — checklist de regressão e re-scoring de severidade.
8. `test-framework-migration` (VA · TestMu AI) [+] — detecta teste quebrado por mudança de framework.
9. `reasoningbank-intelligence` [I] — lembra regressões recorrentes por área do código.
10. `f17010c9bb48:docx` [I] — relatório de triagem e matriz de regressão.

---

## BLOCO 8 — GROWTH, MARKETING, FINANÇAS & MONITORAMENTO

### A43 growth-strategist
1. `agentic-bundle-aas-saas-launch-revenue:launch-strategy` [I] — sequenciamento de lançamento.
2. `agentic-bundle-aas-saas-launch-revenue:micro-saas-launcher` [I] — playbook de canal e funil para micro-SaaS.
3. `cmo-advisor` (AR bundle `c-level`) [+] — GTM, posicionamento e ICP.
4. `content-strategy` (CH · marketingskills) [+] — mapa de temas e formatos por canal.
5. `agentic-bundle-aas-saas-launch-revenue:referral-program` [I] — loops de growth e coeficiente viral.
6. `cro` (CH · marketingskills) [+] — hipóteses de funil e prioridade.
7. `analytics-setup` (CH · marketingskills) [+] — instrumentação de funil (GA4/PostHog) para medir CAC.
8. `product-management:competitive-brief` [I] — posicionamento vs. concorrência.
9. `data:build-dashboard` [I] — painel de funil (visita→trial→pago).
10. `f17010c9bb48:internal-comms` [I] — memo de growth para o CEO.

### A44 content-producer · Opus
1. `ad-creative` (CH · marketingskills) [+] — variações de headline/descrição em massa (Google/Meta/LinkedIn/X).
2. `content-strategy` (CH · marketingskills) [+] — calendário editorial semanal.
3. `cold-email` (CH · marketingskills) [+] — sequência de outreach quando aplicável.
4. `brand` [I] — tom de voz consistente da AI Venture Factory.
5. `f17010c9bb48:brand-guidelines` [I] — aderência ao guia visual nas peças.
6. `banner-design` [I] — direção de arte e descrição visual do criativo do dia.
7. `social-publishing` (VA · EveryFeed) [+] — formatos nativos e agendamento por canal (35+).
8. `design:ux-copy` [I] — CTAs e legendas afiadas.
9. `f17010c9bb48:slack-gif-creator` [I] — micro-animações para posts.
10. `enterprise-search:search` [I] — checa termos de cada plataforma antes de publicar (guarda-corpo).

### A45 seo-aso-agent
1. `ai-seo` (CH · marketingskills) [+] — conteúdo citável por Google AI Overviews / ChatGPT / Perplexity.
2. `seo-aeo-manager` (AR bundle `marketing`) [+] — auditoria E-E-A-T e tracking de citação.
3. `agentic-bundle-aas-saas-launch-revenue:seo-audit` [I] — auditoria on-page da landing.
4. `vidiq_keyword_research` (MCP) — volume, dificuldade e intenção de busca.
5. `vidiq_score_title` (MCP) — pontua títulos/metas antes de publicar.
6. `f17010c9bb48:web-artifacts-builder` [I] — estrutura da landing (headings, schema markup).
7. `local-seo-manager` (AR bundle `marketing`) [+] — perfil e listagens locais quando fizer sentido.
8. `enterprise-search:search-strategy` [I] — mapeamento de keywords e gaps de conteúdo.
9. `data:create-viz` [I] — mapa de keywords × intenção × dificuldade.
10. `f17010c9bb48:internal-comms` [I] — plano de SEO para o A43/A44.

### A46 funnel-experimenter
1. `cro` (CH · marketingskills) [+] — desenho de A/B de copy/CTA/oferta.
2. `cro-specialist` (AR bundle `marketing`) [+] — priorização ICE e leitura de significância.
3. `data:statistical-analysis` [I] — tamanho amostral, significância, detecção de confundidor.
4. `analytics-setup` (CH · marketingskills) [+] — métrica primária + guardrail instrumentadas.
5. `product-management:metrics-review` [I] — acompanhamento do experimento vs. baseline.
6. `data:build-dashboard` [I] — painel de resultado do experimento.
7. `data:validate-data` [I] — checa integridade dos eventos antes de concluir.
8. `superpowers:writing-plans` [+] — documentação do experimento e plano de iteração.
9. `reasoningbank-intelligence` [I] — banco de hipóteses e o que já funcionou.
10. `f17010c9bb48:docx` [I] — memo de resultado e próximo passo.

### A47 onboarding-cs
1. `agentic-bundle-aas-saas-launch-revenue:email-sequence` [I] — sequência de ativação e win-back.
2. `churn-prevention` (CH · marketingskills) [+] — health scoring e save offers.
3. `design:ux-copy` [I] — mensagens de onboarding e macros de suporte empáticas.
4. `product-management:synthesize-research` [I] — síntese de feedback de suporte em ação.
5. `data:explore-data` [I] — detecta sinais de churn no comportamento.
6. `product-management:metrics-review` [I] — métricas de ativação (aha-moment).
7. `f17010c9bb48:docx` [I] — FAQ e base de conhecimento.
8. `enterprise-search:knowledge-synthesis` [I] — consolida tickets recorrentes em artigos.
9. `data:build-dashboard` [I] — painel de saúde do usuário e retenção D1/D7/D30.
10. `f17010c9bb48:internal-comms` [I] — plays de retenção para o A43.

### A48 finance-ops
1. `saas-metrics-coach` (AR bundle `finance`) [+] — MRR/ARR, churn, LTV/CAC corretos.
2. `financial-analyst` (AR bundle `finance`) [+] — projeção de caixa e análise de margem.
3. `cfo-advisor` (AR bundle `c-level`) [+] — leitura executiva e detecção de anomalia em receita.
4. `data:build-dashboard` [I] — dashboard financeiro (página 5 do painel).
5. `data:sql-queries` [I] — extrai assinaturas/reembolsos de `metrics.json`/SQLite.
6. `data:statistical-analysis` [I] — anomalia em receita e coortes.
7. `agentic-bundle-aas-saas-launch-revenue:pricing-strategy` [I] — análise de experimento de preço.
8. `f17010c9bb48:xlsx` [I] — modelo financeiro e reconciliação em planilha.
9. `ruflo-cost-tracker:cost-report` [I] — custo real de operação (tokens) na conta de margem.
10. `dataviz` [I] — gráficos de MRR, churn e LTV/CAC.

### A49 product-monitor · Haiku
1. `data:analyze` [I] — KPIs e uso de features a partir dos logs.
2. `mcp__Claude_Browser__preview_logs` (MCP) [I] — scan de logs de erro em produção local.
3. `mcp__Claude_Browser__read_console_messages` (MCP) [I] — erros de cliente no app.
4. `data:explore-data` [I] — clusteriza feedback e lê coortes de retenção.
5. `enterprise-search:digest` [I] — digest diário curto (o `daily-report.md`).
6. `product-management:metrics-review` [I] — compara KPIs vs. meta, dispara alerta.
7. `data:create-viz` [I] — gráfico de pulso (uso, erros, NPS) para o card do agente.
8. `monitoring:real-time-view` [I] — uptime local e escalonação.
9. `reasoningbank-intelligence` [I] — reconhece padrões de anomalia recorrente.
10. `f17010c9bb48:internal-comms` [I] — alimenta o loop de feedback para A11 e A07.

---

## Notas de uso

- Skills `[+]` que exigem CLI externo (Ahrefs, Semrush, GA4, Meta/Google Ads via
  coreyhaines31) **não são chamadas no piloto** — o marketing do app-001 roda
  `method: "manual"` e para no `outbox/`. As skills entram como referência de
  método; APIs reais só após aprovação humana do canal.
- Skills de segurança ofensiva (`static-analysis`, `semgrep-rule-creator`,
  `metaharness_redblue`) operam **somente** no staging local do app-001.
- Todo uso de skill/tool é registrado em `company/logs/events.jsonl` com
  `model` e `effort`.
- No dashboard (PARTE 4), o card de cada agente exibe: **modelo · effort ·
  nível de permissão (N1–N5)** — além da skill em uso no momento.
