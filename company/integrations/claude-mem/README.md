# A9 — claude-mem (memória persistente)

**Repo:** `thedotmack/claude-mem` · **Agentes:** todos
**Estado:** ligável — plugin local do Claude Code, sem serviço externo.

## Para quê
Manter contexto entre sessões: decisões, aprendizados, padrões que deram
certo/errado — para os agentes não redescobrirem tudo a cada sessão.

## Uso
- Instalar o plugin `claude-mem` no Claude Code (marketplace / `npx`).
- Armazena em `company/memory/claude-mem/` (JSON/SQLite local).
- Convive com a memória em arquivo da fábrica (`company/memory/*.md`): o `.md`
  é a fonte canônica curada; o claude-mem é o índice recuperável rápido.
- No fim de cada bloco de trabalho, o agente resume o que aprendeu →
  `company/memory/aprendizados.md` **e** claude-mem.

## Regras
- **Nunca** armazenar secret, `.env`, token, PII na memória.
- O que é histórico temporário (tarefas do dia) NÃO vai para memória
  persistente — fica no `events.jsonl`.
- Memória enxuta: só fato não-derivável do código/git.

## Fallback
Sem o plugin → os agentes usam só `company/memory/*.md` +
`reasoningbank-intelligence`. `integration_fallback: "claude-mem"`.
