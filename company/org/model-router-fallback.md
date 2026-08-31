# Roteador de modelo gratuito — camada de fallback (fixado 2026-08-30)

**Status: PENDENTE de ativação.** Este documento define QUEM usaria QUAL
modelo e com quais parâmetros — mas nenhuma chamada real acontece até a chave
estar preenchida na aba **Conexões** do dashboard (pedido `CRQ-MTGIKNZF` já
registrado, aguardando o fundador colar a chave **nova e rotacionada**).

## Por que isto é uma 4ª camada, não substitui o Anexo B

O `spec-anexo-b.md` já define modelo/effort/fallback pra cada um dos 49
agentes (Opus/Sonnet/Haiku da Anthropic, campo `fallback_pro`). Este roteador
é o degrau **abaixo** do `fallback_pro`: só entra em cena se **nem o modelo
principal nem o fallback_pro Anthropic** estiverem disponíveis (limite de
plano estourado, indisponibilidade temporária). Nunca troca Claude por conta
de preferência — só por indisponibilidade real, e sempre logado como
`skill_fallback` (regra já existente em `padroes.md`).

## Provedores considerados

| Provedor | O que é | Decisão |
|---|---|---|
| **xKiro** | Gateway real (xkiro.com), compatível OpenAI/Anthropic, free-tier 100k tokens/dia, 35+ modelos grátis | ✅ Aprovado como fallback — pedido de credencial já registrado (`CRQ-MTGIKNZF`) |
| **OmniRoute** | Gateway open-source (MIT) self-hosted, `diegosouzapw/OmniRoute` | Documentado como alternativa; não instalado ainda — sem credencial pendente porque é self-hosted (precisa rodar localmente) |
| **free-claude-code** | Reroteador que faz o Claude Code chamar outros provedores free-tier | Documentado; **não instalado** — muda o comportamento do Claude Code globalmente, decisão fora do escopo deste repo |
| **Draftify** (`dfy_...`) | **Não verificado** — nenhuma fonte confirma o que este serviço faz | ❌ Não integrado até o fundador confirmar o que é |
| **9Router** | Sem imagem/link recebido | ❌ Não integrado — falta informação |

## Especialidade de cada família de modelo (estudo)

- **Mistral Large/Medium** — raciocínio geral forte, bom custo-benefício pra análise e planejamento.
- **Codestral / Devstral 2** — especializados em código: Codestral é forte em completion/FIM (preenchimento de código), Devstral 2 é otimizado pra uso agêntico (ferramentas, múltiplos passos) — ideal pra dev que executa comandos, não só escreve trecho.
- **Ministral 3B/8B/14B** — modelos pequenos e rápidos, pra tarefa simples e de alto volume (classificação, formatação, resposta curta).
- **MiniMax M2.x (+ Highspeed)** — conhecido por contexto longo e uso agêntico/tool-use; variante Highspeed troca um pouco de qualidade por latência menor — boa pra tarefa repetitiva de alto volume.
- **DeepSeek V4/V3.x** — raciocínio e código fortes, tradicionalmente competitivo com modelos de ponta em benchmarks de lógica; Pro = mais capaz, Flash = mais rápido/barato.
- **SenseNova Flash-Lite** — modelo leve, pra tarefa de baixa complexidade e alto volume (monitoramento, triagem).
- **Qwen Max/Plus** — geral forte (Max = mais capaz); **Qwen3 Coder Plus** = especializado em código; **Qwen3 VL Plus** = visão-linguagem (entende imagem, não gera); **Qwen3 Omni Flash** = multimodal (texto+áudio+imagem de entrada).

**Geração de imagem (corrigido 2026-08-30 — antes era uma lacuna real):**
Nenhum modelo da lista xKiro acima gera imagem de verdade (Qwen VL/Omni só
*entendem* imagem). O fundador definiu dois provedores reais e verificados:

- **Pollinations.ai** — gateway real e bem documentado (`gen.pollinations.ai`),
  compatível OpenAI. Modelos de imagem disponíveis: `flux`, `nanobanana`,
  `nanobanana-2`, `seedream5`, `gptimage`, `ideogram-v4`, entre outros —
  ver `GET /image/models` pra lista viva. **Provedor primário** de imagem.
  Pedido de credencial: `CRQ-MTGIRCV1` (aguardando o fundador colar em Conexões).
- **Gemini API** (Google, nativo) — **provedor secundário**, usado quando
  Pollinations não atender ou para geração multimodal nativa. Pedido de
  credencial: `CRQ-MTGIRCX3`.

**Dono operacional:** A44 content-producer (BLOCO 8) é quem pede imagem pros
dois provedores — qualquer outro agente que precisar de uma imagem **pede pro
A44 via Chat Geral** (nunca direto pelo provedor), e a resposta (link do
asset) também vai pro Chat Geral. Ver regra completa em `padroes.md` §
"Chat Geral é o canal único".

## Delegação por bloco (fallback, com temperatura/top_p/frequency/presence)

| Bloco | Agentes | Modelo fallback ideal | temp | top_p | freq. pen. | pres. pen. | Por quê |
|---|---|---|---:|---:|---:|---:|---|
| 1 — Pesquisa | A01, A05 (análise pesada) | DeepSeek V4 Pro | 0.4 | 0.9 | 0.1 | 0.1 | raciocínio/análise forte |
| 1 — Pesquisa | A02–A04, A06 (apoio) | Mistral Medium 3.5 | 0.5 | 0.9 | 0.1 | 0.1 | custo-benefício em análise geral |
| 2 — Governança | A07 CEO (fallback do fallback) | Mistral Large 3 | 0.2 | 0.85 | 0 | 0 | decisão crítica exige baixa criatividade |
| 2 — Governança | A08 orquestrador (alta frequência) | MiniMax M2.5 Highspeed | 0.3 | 0.9 | 0.1 | 0 | rotina de coordenação, latência importa |
| 2 — Governança | A09, A10 | Mistral Medium 3.5 | 0.3 | 0.9 | 0 | 0 | compliance = precisão |
| 3 — Produto/Design | A13, A14 (visual) | Qwen3 VL Plus | 0.4 | 0.9 | 0.1 | 0.2 | única família com leitura de imagem — útil pra revisar design |
| 3 — Produto/Design | A11, A12, A15, A16 | Mistral Medium 3.5 | 0.5 | 0.9 | 0.1 | 0.2 | produto/arquitetura = raciocínio geral |
| 4 — Engenharia | A17 tech-lead, A25 devops | Devstral 2 | 0.3 | 0.9 | 0.1 | 0.1 | agêntico, múltiplos passos/ferramentas |
| 4 — Engenharia | A18–A24 (devs) | Qwen3 Coder Plus / Codestral | 0.25 | 0.9 | 0.1 | 0 | código pede baixa temperatura, alta precisão |
| 4 — Engenharia | A26 reliability | DeepSeek V4 Flash | 0.3 | 0.9 | 0.1 | 0 | iteração rápida |
| 5 — Conectores | A27–A30 | MiniMax M2.7 | 0.3 | 0.9 | 0.1 | 0.1 | tool-use/agêntico é o ponto forte |
| 6 — Cybersecurity | A31, A33 (defesa) | DeepSeek V4 Pro | 0.15 | 0.85 | 0 | 0 | precisão máxima, zero criatividade |
| 6 — Cybersecurity | A32 red-team | DeepSeek V4 Pro | 0.5 | 0.9 | 0.2 | 0.3 | brainstorm de vetor de ataque precisa de alguma variação |
| 6 — Cybersecurity | A34–A36 | Mistral Medium 3.5 | 0.2 | 0.85 | 0 | 0 | auditoria = determinístico |
| 7 — QA | A37–A42 | Mistral Small 4 / Ministral 14B | 0.2 | 0.85 | 0 | 0 | teste é repetitivo, precisa consistência, custo baixo |
| 8 — Growth/Marketing | A44 copy, A45 seo | MiniMax M2.7 | 0.8 | 0.95 | 0.35 | 0.4 | criatividade — penalidades altas evitam repetir frase |
| 8 — Growth/Marketing | A43 estratégia, A46 experimentos | Mistral Medium 3.5 | 0.6 | 0.92 | 0.2 | 0.2 | meio-termo estratégia+variação |
| 8 — Growth/Marketing | A47 onboarding/CS | Qwen Plus | 0.5 | 0.9 | 0.2 | 0.2 | tom humano, ainda controlado |
| 8 — Growth/Marketing | A48 finance-ops | Mistral Medium 3.5 | 0.1 | 0.85 | 0 | 0 | número não aceita criatividade |
| 8 — Growth/Marketing | A49 product-monitor | SenseNova Flash-Lite | 0.2 | 0.85 | 0 | 0 | monitoramento = alto volume, baixa complexidade |

## Regra de ativação

1. Fundador cola a chave nova (pós-rotação) em **Conexões** → pedido `CRQ-MTGIKNZF`.
2. `orchestrator.js` só usa este roteador se o Anexo B `fallback_pro` também
   falhar (a implementar quando a chave existir — hoje é só documentação).
3. Todo uso real deste fallback vira evento `type: "model-fallback-router"`
   em `events.jsonl`, com modelo usado e motivo — nunca silencioso.
