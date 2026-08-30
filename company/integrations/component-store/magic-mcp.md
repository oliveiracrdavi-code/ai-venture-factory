# A14 — magic-mcp (21st.dev) — gerador de componentes UI

**Repo:** `21st-dev/magic-mcp` · **Agente:** A14 (frontend-design-engineer)
**Estado:** desligada — **gate humano**: o fundador aprova o MCP no Claude Code.

## Para quê
Quando habilitado, A14 chama o MCP `21st.dev/magic` para buscar/gerar um
componente UI production-ready (card, dialog, background animado, etc.) e o
**porta para o dashboard vanilla** (mesmo processo do react-bits: extrair
CSS/anim, remover JSX).

## Habilitar (fundador)
1. `claude mcp add magic -- npx -y @21st-dev/magic-mcp` (ou via `/mcp`).
2. Confirmar a chave/token do 21st.dev quando pedido (fica com o Claude Code,
   não entra no repo).
3. Marcar aqui: `enabled: true`.

## Uso (A14, quando ligado)
Prompts de exemplo:
- "gere um card com glow teal e borda pulsante para nó ativo do workflow"
- "gere um dialog dark, com overlay blur, para detalhe do agente"
- "gere um background dot-grid com parallax sutil, tema #0f172a"
- "gere um counter animado (count-up) para tiles de métrica"

A14 pega o resultado, porta para `.sh-*` / `.rb-*` em `dashboard/styles.css` +
`dashboard/components/fx.js`, testa local, commita.

## Regra
- Só gera componente **para o dashboard** (não código de produto sem revisão).
- Nada de dependência nova no runtime — sempre portar para vanilla.

## Fallback
Desligada → A14 usa os ports do **react-bits** (A13). `integration_fallback: "magic-mcp"`.
