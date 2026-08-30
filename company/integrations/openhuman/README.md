# A10 — openhuman (assistente pessoal / knowledge-graph)

**Repo:** `tinyhumansai/openhuman` · **Agente:** A08 (chief-of-staff)
**Estado:** stub — grafo local.

## Para quê
Memória de longo prazo do A08 sobre o **fundador** e a operação: decisões
estratégicas, padrões de sucesso/falha por tipo de app, preferências
(o que aprovar rápido, o que sempre reprovar), restrições declaradas.

## Uso
- Saída: `company/memory/openhuman/knowledge-graph.json`
  ```json
  { "nodes": [ { "id": "founder.pref.pricing", "type": "preference",
      "value": "assinatura mensal barata > vitalícia" } ],
    "edges": [ { "from": "app-001", "rel": "decided_by", "to": "founder" } ] }
  ```
- A08 consulta antes de despachar a fila e antes de levar algo ao A07.
- Atualiza quando o fundador dá uma diretriz nova (via aba Chatbot Humano)
  ou quando um projeto fecha (aprendizado).

## Regras
- Só fatos operacionais/preferências. **Nada de PII sensível, nada de secret.**
- O fundador pode pedir "esquece X" → nó removido e registrado.

## Fallback
`integration_fallback: "openhuman"` → A08 usa `company/memory/aprendizados.md`
+ `reasoningbank-intelligence`.
