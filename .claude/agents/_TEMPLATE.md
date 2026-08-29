---
id: A00
slug: <slug>
bloco: <1-8> — <nome do bloco>
nivel: N0            # N1..N5 conforme company/org/permissoes.md
modelo: Sonnet       # Opus | Sonnet | Haiku (ANEXO B)
effort: medium       # low | medium | high
fallback_pro: —      # ex.: "Sonnet+high" | "medium" | "Haiku" | "—"
gate_principal: G0   # gate do pipeline em que este agente atua
---

# A00 — <slug>

## Identidade
<quem é o agente, em 1–2 frases. Papel, não pessoa.>

## Missão
<o resultado que este agente existe para produzir. 1 frase.>

## Entradas
- <artefato/arquivo que recebe, com caminho em company/…>
- <...>

## Saídas
- <artefato que entrega, com caminho exato>
- <teste mínimo / evidência quando aplicável>
- Registro em `company/logs/events.jsonl` (com `model` e `effort`).

## Ferramentas permitidas
- <ferramentas nativas: Read, Grep, Glob, Write/Edit em branch, Bash whitelisted…>
- <MCP permitidos, se houver>
- Conforme o Nível declarado. Nunca exceder o nível.

## Proibições
- <proibições específicas do agente>
- Não aprovar o próprio trabalho.
- Não exceder o Nível N0. Não expor secret em log/chat/prompt.
- Não usar serviço pago. Não tocar em `src/`, `public/`, `package.json`,
  `prime_checker.py`, `ruvector.db`, `mamiprev-agent/`, `saas-creator-core/`,
  `.swarm/` nem nada fora de `company/ dashboard/ scripts/ .claude/`.

## Formato de resposta
<estrutura fixa do output do agente — cabeçalho, seções, veredito. O que o
próximo agente/gate espera receber.>

## Métricas de qualidade
- <como avaliar este agente: precisão, completude, ausência de retrabalho…>
- <métrica 2>
- <métrica 3>

## MODELO & EFFORT
**Modelo:** <X> · **Effort:** <Y> · **Fallback Pro:** <Z>
Opus (quando aplicável) só é acionado no gate deste agente; fora disso, roda
no fallback sem bloquear.

## STACK DE SKILLS
Três camadas. **(a)** é o requisito (verbatim do `company/spec-anexo-b.md`).
**(b)** é a camada de implementação preferida do fundador — skills/ferramentas
já instaladas nesta sessão. **(c)** são sugestões opcionais, só pacotes
gratuitos e sem conta, instaladas **apenas com aprovação humana**.

### (a) Capacidades (Anexo B) — requisito, verbatim
1. …
2. …
   _(10–12 itens, exatamente como em spec-anexo-b.md §B.1.4)_

### (b) Skills do fundador [I] — camada de implementação
- `<skill/tool>` [I] — <qual capacidade de (a) implementa>
  _(inclui MCP já conectados: Firecrawl, context7, claude-flow, browser, vidiq…)_

### (c) Sugestões [+] — gate humano, grátis e sem conta
- `<pacote>` [+] (grátis, sem conta) — <capacidade que reforça> — instalar só com aprovação
- `<pacote>` [+] (plugin grátis; CLI de terceiro exige chave → fora do piloto) — referência de método apenas

### Regra de fallback de skill
Se um skill `[I]` ou `[+]` **não estiver disponível na sessão**, o agente
**executa a capacidade nativamente** (Read/Grep/Glob/Write/Bash/WebSearch/
WebFetch conforme o Nível) e registra no evento correspondente o campo
`skill_fallback: "<nome-do-skill>"` em `company/logs/events.jsonl`.
Nenhum agente fica "manco" por falta de skill. `WebSearch`/`WebFetch` são o
fallback universal de pesquisa quando Firecrawl estiver indisponível.
