---
id: TASK-0000
agent: A00
status: queued        # queued | running | blocked | review | done | rejected
priority: 3           # 1 (baixa) .. 5 (alta). Instrução humana entra como 5.
gate: G0              # G0..G10
project: app-001
depends_on: []        # lista de TASK-IDs que precisam estar done
created: 2026-08-29
updated: 2026-08-29
---

# TASK-0000 — <título curto>

## Agente responsável
A00 <slug> — Nível NX

## Objetivo
<uma frase: o que precisa existir ao final>

## Contexto
<projeto, parte do pipeline, decisão anterior relevante — só o necessário>

## Entradas
- <arquivo/artefato 1>
- <arquivo/artefato 2>

## Saída esperada
- <artefato a criar, com caminho exato em company/…>
- <teste mínimo / evidência, quando aplicável>

## Restrições
- <proibições específicas desta tarefa>
- Não usar serviço pago. Não expor secret. Não exceder o nível NX.

## Critério de aceite
- [ ] <condição objetiva 1>
- [ ] <condição objetiva 2>
- [ ] Ação registrada em company/logs/events.jsonl (com model e effort)

## Resultado
<preenchido pelo agente ao concluir: link para artefatos + resumo. Quem
aprova NÃO é quem produziu.>
