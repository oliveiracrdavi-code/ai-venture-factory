# Inventário de Skills do Fundador `[I]`

Skills/ferramentas **já instaladas nesta sessão** que formam a camada (b) de
implementação dos 49 agentes. São a camada preferida — não desvio. Se um item
não estiver disponível em runtime, o agente executa a capacidade nativamente e
registra `skill_fallback: "<nome>"` em `company/logs/events.jsonl`.

Colunas: **Skill/Tool** · **Origem** · **Para que serve na fábrica** · **Agentes que usam**.

## Pesquisa / síntese / conhecimento

| Skill | Origem | Uso | Agentes |
|---|---|---|---|
| `enterprise-search:search-strategy` | plugin enterprise-search | planejar consulta multi-fonte antes de pesquisar | A01, A03, A45 |
| `enterprise-search:search` | plugin enterprise-search | varredura dirigida de páginas/reviews/termos | A02, A10, A35, A41, A47 |
| `enterprise-search:knowledge-synthesis` | plugin enterprise-search | fundir achados de N fontes num bloco só | A01, A02, A04, A47 |
| `enterprise-search:source-management` | plugin enterprise-search | catalogar e graduar confiabilidade de fonte | A01 |
| `enterprise-search:digest` | plugin enterprise-search | condensar varredura em digest curto | A03, A49 |
| `product-management:synthesize-research` | plugin product-management | notas cruas → insight priorizado | A01, A02, A04, A07, A11, A47 |
| `product-management:competitive-brief` | plugin product-management | panorama de mercado / matriz de players | A01, A02, A16?, A43 |
| `reasoningbank-intelligence` | plugin reasoningbank | memória de padrões entre projetos | A03, A07, A09, A36, A42, A46, A49 |

## Produto / planejamento

| Skill | Origem | Uso | Agentes |
|---|---|---|---|
| `product-management:write-spec` | plugin product-management | PRD com user stories e critérios de aceite | A11, A15 |
| `product-management:product-brainstorming` | plugin product-management | gerar e filtrar opções de escopo | A11 |
| `product-management:sprint-planning` | plugin product-management | montar/priorizar a fila; RICE/MoSCoW | A08, A09, A11 |
| `product-management:roadmap-update` | plugin product-management | milestones, fases, checkpoints | A09 |
| `product-management:metrics-review` | plugin product-management | ler métricas vs threshold sem viés | A07, A09, A11, A37, A46, A47, A49 |
| `product-management:stakeholder-update` | plugin product-management | memo executivo curto | A07, A08, A09, A11 |
| `superpowers:brainstorming` | obra/superpowers `[I]` via install | refinar ideia por perguntas antes de escrever | A06, A07, A11 |
| `superpowers:writing-plans` | obra/superpowers | caminho crítico, ADRs, fatiamento | A06, A08, A09, A16, A25, A27, A46 |

## Design / frontend

| Skill | Origem | Uso | Agentes |
|---|---|---|---|
| `design` | plugin design | identidade, tokens, logo, sistema visual | A13 |
| `design-system` | plugin design-system | arquitetura de tokens primitivo→semântico→componente | A13 |
| `ui-ux-pro-max` | plugin ui-ux-pro-max | 67 estilos, 161 paletas, 57 pares tipográficos | A13 |
| `theme-factory` (`f17010c9bb48:theme-factory`) | plugin anthropic-skills | tema dark/light consistente a partir de paleta | A13 |
| `f17010c9bb48:canvas-design` | plugin anthropic-skills | composição de telas / mockups / pôsteres | A13 |
| `f17010c9bb48:algorithmic-art` | plugin anthropic-skills | grade de pixels p/ sprites pixel-art | A13, A14 |
| `banner-design` | plugin banner-design | heros/criativos com direção de arte | A13, A44 |
| `f17010c9bb48:brand-guidelines` | plugin anthropic-skills | guia visual formal | A13, A44 |
| `f17010c9bb48:frontend-design` | plugin anthropic-skills | decomposição de componentes, distinção visual | A12, A14, A18 |
| `impeccable` | plugin impeccable | carga cognitiva, hierarquia, motion, estados | A12, A14 |
| `ui-styling` | plugin ui-styling | Tailwind + componentes acessíveis, dark mode | A14, A18, A19 |
| `f17010c9bb48:web-artifacts-builder` | plugin anthropic-skills | página self-contained com CSP estrita | A14, A18, A19, A45 |
| `artifact-diagramming` | plugin (artifact) | SVG inline legível nos dois temas | A14, A16 |
| `design:design-critique` | plugin design | avaliação heurística / auditoria de fricção | A04, A12 |
| `design:accessibility-review` | plugin design | a11y de fluxo e componente | A12, A41 |
| `design:design-handoff` | plugin design | entregar tokens + specs | A13, A14 |
| `design:user-research` | plugin design | protocolo e roteiro de pesquisa de usuário | A04, A12 |
| `design:research-synthesis` | plugin design | clusterizar reclamações em temas | A04, A12 |
| `design:ux-copy` | plugin design | microcopy, CTA, avisos, macros | A10, A12, A35, A44, A47 |
| `figma:figma-generate-design` | plugin figma | materializar telas com o design system | A13 |
| `figma:figma-generate-diagram` | plugin figma | diagrama de jornada/fluxo em FigJam | A12 |

## Engenharia

| Skill | Origem | Uso | Agentes |
|---|---|---|---|
| `engineering:architecture` | plugin engineering | arquitetura geral, limites, deploy | A06, A16 |
| `engineering:system-design` | plugin engineering | modos de falha, escala, regras de negócio | A06, A15, A16, A26, A31 |
| `engineering:code-review` | plugin engineering | review rigoroso pré-merge | A16, A17, A23, A33, A37 |
| `engineering:debug` | plugin engineering | tratamento e rastreio de erro | A20, A38 |
| `engineering:tech-debt` | plugin engineering | triagem de dívida, build-vs-refactor | A06, A09, A17 |
| `engineering:testing-strategy` | plugin engineering | estratégia e planejamento por risco | A11, A37 |
| `engineering:deploy-checklist` | plugin engineering | checklist build/deploy local | A25 |
| `engineering:incident-response` | plugin engineering | contenção, rollback, playbook | A21, A25, A26, A27, A29, A30, A36 |
| `engineering:documentation` | plugin engineering | doc de contrato/endpoint + changelog | A15, A17, A18, A19, A20, A21, A22, A23, A24, A26 |
| `engineering:standup` | plugin engineering | rollup diário de status | A08, A09 |
| `code-review` | skill nativa | revisão de diff/branch com severidade | A17 |
| `simplify` | skill nativa | reuso e simplificação (sem caçar bug) | A17 |
| `zero-hallucination-coder` | plugin | claim amarrado a fonte/requisito | A01?, A06, A15, A17, A24 |
| `agentic-bundle-full-stack-developer:api-patterns` | plugin agentic-bundle | contratos REST, paginação, versionamento | A15, A20 |
| `agentic-bundle-full-stack-developer:auth-implementation-patterns` | plugin agentic-bundle | sessão, RBAC, recuperação de conta | A15, A23 |
| `agentic-bundle-full-stack-developer:backend-dev-guidelines` | plugin agentic-bundle | roteamento Node, middleware, erros | A20 |
| `agentic-bundle-full-stack-developer:database-design` | plugin agentic-bundle | normalização, constraints, versionamento | A16, A21 |
| `agentic-bundle-full-stack-developer:frontend-developer` | plugin agentic-bundle | fetch, estado de cliente, roteamento | A18, A19 |
| `agentic-bundle-full-stack-developer:e2e-testing-patterns` | plugin agentic-bundle | padrões de teste ponta a ponta | A39 |
| `agentic-bundle-full-stack-developer:senior-fullstack` | plugin agentic-bundle | julgamento de esforço realista | A06 |
| `agentic-bundle-full-stack-developer:stripe-integration` | plugin agentic-bundle | webhooks e máquina de estados (simulado) | A22 |
| `superpowers:test-driven-development` | obra/superpowers | RED-GREEN-REFACTOR | A18, A19, A20, A21, A22, A23, A24, A35, A38, A39 |
| `superpowers:systematic-debugging` | obra/superpowers | debug/root-cause por método | A18, A19, A26, A32, A36, A40 |
| `superpowers:verification-before-completion` | obra/superpowers | só "pronto" com evidência | A20, A22, A23, A36, A37, A38, A39 |
| `superpowers:condition-based-waiting` | obra/superpowers | espera determinística (mata flaky) | A24, A28, A38, A39, A42 |
| `superpowers:receiving-code-review` | obra/superpowers | aplicar feedback de review com disciplina | A17 |
| `superpowers:subagent-driven-development` | obra/superpowers | paralelizar build/lint/test | A25 |
| `superpowers:defense-in-depth` | obra/superpowers | sanitização/mascaramento em camadas | A29, A30, A33 |
| `docker-development` | plugin docker-development | containeriza só se valer a pena | A16, A25 |
| `run` | skill nativa | sobe app/dashboard p/ validar | A25 |
| `context7:query-docs` / `resolve-library-id` | MCP context7 (do fundador) | doc/versão real de lib, sem alucinar | A06, A15, A16, A20, A28, A34 |

## Segurança / privacidade / conectores

| Skill | Origem | Uso | Agentes |
|---|---|---|---|
| `security-guidance` | plugin security-guidance | checklist de risco por gate, defaults seguros | A10, A16, A20, A22, A23, A27, A30, A31, A33, A34, A35, A36 |
| `security-review` | skill nativa | revisão de design seguro por PR | A31 |
| `prompt-governance` | plugin prompt-governance | guardrail anti prompt-injection / uso de PII | A07, A10, A24, A30 |
| `a11y-audit` | plugin a11y-audit | WCAG na implementação | A14, A18, A19, A41 |
| `aidefence_scan` / `aidefence_analyze` / `aidefence_has_pii` / `aidefence_learn` | MCP claude-flow (do fundador) | PII, secret leak, prompt-injection, aprendizado de defesa | A10, A23, A30, A32, A33, A35 |
| `metaharness_threat_model` | MCP claude-flow | threat model STRIDE | A27, A31 |
| `metaharness_redblue` | MCP claude-flow | orquestra exercício red/blue | A31, A32 |
| `metaharness_oia_audit` | MCP claude-flow | timeline observe-infer-act de incidente | A36 |
| `transfer_detect-pii` | MCP claude-flow | PII/secret antes de qualquer transferência | A30, A35 |
| `policy_evaluate` | MCP claude-flow | nega ação fora do escopo permitido | A27, A29 |
| `analyze_diff` / `analyze_diff-risk` | MCP claude-flow | impacto de mudança / commit que regrediu | A36, A42 |
| `desktop-commander:terminal` | plugin desktop-commander | comando da whitelist com log | A29 |
| `desktop-commander:computer-health-check` | plugin desktop-commander | inventário do que a automação toca | A27, A29 |
| `filesystem:*` | MCP filesystem (do fundador) | operações de arquivo com diretório permitido | A29 |
| `hooks:pre-task` / `pre-command` / `post-command` / `pre-edit` / `post-edit` | plugin hooks / claude-flow | gate + log + checksum em torno de ação | A25, A29, A30, A33 |
| `hooks:route` | plugin hooks | roteia TASK para agente/skill certo | A08 |

## Growth / marketing / finanças / monitoramento

| Skill | Origem | Uso | Agentes |
|---|---|---|---|
| `agentic-bundle-aas-saas-launch-revenue:launch-strategy` | plugin agentic-bundle | sequenciamento de lançamento | A43 |
| `agentic-bundle-aas-saas-launch-revenue:micro-saas-launcher` | plugin agentic-bundle | playbook de canal e funil | A43 |
| `agentic-bundle-aas-saas-launch-revenue:referral-program` | plugin agentic-bundle | loops de growth, coeficiente viral | A43 |
| `agentic-bundle-aas-saas-launch-revenue:monetization` | plugin agentic-bundle | modelos de receita, packaging | A05, A22 |
| `agentic-bundle-aas-saas-launch-revenue:pricing-strategy` | plugin agentic-bundle | ladder de preço, experimento de preço | A05, A22, A48 |
| `agentic-bundle-aas-saas-launch-revenue:monetization`… | — | — | — |
| `agentic-bundle-aas-saas-launch-revenue:seo-audit` | plugin agentic-bundle | auditoria on-page da landing | A45 |
| `agentic-bundle-aas-saas-launch-revenue:email-sequence` | plugin agentic-bundle | ativação e win-back | A47 |
| `agentic-bundle-aas-saas-launch-revenue:analytics-product` | plugin agentic-bundle | instrumentação de produto/eventos | A46?, A49 |
| `brand` | plugin brand | tom de voz consistente | A44 |
| `f17010c9bb48:slack-gif-creator` | plugin anthropic-skills | micro-animações para posts | A44 |
| `vidiq_keyword_research` / `vidiq_score_title` / `vidiq_trending_videos` | MCP vidiq (do fundador) | volume/intenção de keyword, score de título | A03, A45 |
| `data:analyze` | plugin data | KPIs e uso de features a partir de logs | A49 |
| `data:explore-data` | plugin data | clusteriza feedback, lê coortes | A02, A04, A21, A35, A47, A49 |
| `data:build-dashboard` | plugin data | painéis (funil, perf, financeiro, saúde) | A05, A09, A26, A43, A46, A47, A48 |
| `data:create-viz` / `dataviz` | plugin data / dataviz | gráficos (tendência, dor, break-even, pulso) | A01, A03, A04, A05, A34, A40, A46, A48, A49 |
| `data:statistical-analysis` | plugin data | significância, sensibilidade, anomalia | A01, A05, A26, A40, A46, A48 |
| `data:sql-queries` / `data:write-query` | plugin data | extrair assinaturas/coortes de SQLite | A05, A21, A48 |
| `data:validate-data` | plugin data | integridade de dados/eventos | A03, A15, A20, A21, A23, A34, A38, A39, A42, A46 |
| `product-management:metrics-review` | (ver acima) | metas vs realizado, alerta | A46, A49 |
| `monitoring:real-time-view` / `monitoring:status` | plugin monitoring | uptime local, gargalos, escalonação | A08, A26, A49 |
| `optimization:cache-manage` | plugin optimization | camadas de cache e invalidação | A26, A40 |
| `ruflo-cost-tracker:cost-report` / `cost-session` | plugin ruflo-cost-tracker | custo real de tokens (margem, auditoria do plano) | A08, A25, A48 |
| `llm-cost-optimizer` | plugin llm-cost-optimizer | teto de custo por feature de IA / orçamento de contexto | A06, A08, A24 |
| `agentdb-vector-search` / `agentdb-optimization` | plugin agentdb | cache semântico / RAG local / HNSW | A24, A26 |
| `reasoningbank-agentdb` | plugin reasoningbank | harness de avaliação com trajetórias/verdict | A24 |

## Documentos (transversal)

| Skill | Origem | Uso | Agentes |
|---|---|---|---|
| `f17010c9bb48:docx` | plugin anthropic-skills | brief/relatório/persona/threat model navegável | A02, A04, A06, A10, A32, A34, A35, A36, A42, A46 |
| `f17010c9bb48:xlsx` | plugin anthropic-skills | modelo financeiro / plano em planilha | A05, A09, A48 |
| `f17010c9bb48:pdf` | plugin anthropic-skills | ler PDF de regulação/termos e extrair obrigações | A10 |
| `f17010c9bb48:internal-comms` | plugin anthropic-skills | memo interno, "não" do CEO, daily-report, loop de feedback | A07, A08, A27, A36, A43, A45, A47, A49 |
| `f17010c9bb48:mcp-builder` | plugin anthropic-skills | schema rígido de tool/endpoint | A15, A24 |
| `webapp-testing` (`f17010c9bb48:webapp-testing`) | plugin anthropic-skills | smoke/a11y/CRUD no navegador | A18, A19, A32, A35, A38, A39, A41 |
| `playwright-skill` | plugin | testes dirigindo o navegador | A38, A39, A42 |
| `claude-api` | plugin | model ids, pricing, tool use, caching corretos | A24 |
| `mcp-registry` / `context7` / `firecrawl` / browser MCP | MCP do fundador | doc, scraping, automação de navegador | vários |

---

## Regras de consistência (para os 49 arquivos)

1. **Mesmo nome sempre.** Um skill aparece com string idêntica em todos os
   agentes que o usam (ver colunas acima).
2. **`[I]` = camada (b).** Nunca vira "sugestão". Sugestão `[+]` é só pacote
   gratuito e sem conta, e só entra com aprovação humana.
3. **MCP do fundador conta como `[I]`** (Firecrawl, context7, claude-flow,
   browser, vidiq, filesystem, desktop-commander).
4. **Fallback obrigatório.** Todo `.md` de agente traz a "Regra de fallback de
   skill"; ausência de skill → execução nativa + `skill_fallback` no log.
5. **`?` no inventário** = uso plausível mas secundário; o agente decide em
   runtime, sem quebrar a regra 1.
