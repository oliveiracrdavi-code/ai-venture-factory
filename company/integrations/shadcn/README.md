# A11 — shadcn/ui (padrões de UI)

**Repo:** `shadcn-ui/ui` · **Alvo:** dashboard · **Estado:** aplicada (portada).

## Decisão
shadcn/ui é **React + Tailwind + Radix** — incompatível com o requisito
"zero-build, HTML/CSS/JS puro". Portanto **não instalamos React**. Em vez
disso, portamos os *padrões* (tokens, anatomia, estados) para CSS puro em
`dashboard/styles.css`, classe `.sh-*`.

## Portado (em `styles.css`)
| shadcn | classe CSS | onde é usado |
|---|---|---|
| Button | `.sh-btn`, `.sh-btn.primary`, `.sh-btn.ghost` | ações, toolbar |
| Card | `.sh-card`, `.sh-card-head`, `.sh-card-body` | painéis, cards de agente |
| Tabs | `.sh-tabs`, `.sh-tab[aria-selected]` | navegação da sidebar/topo |
| Dialog | `.sh-dialog`, `.sh-overlay` | modal de detalhe do agente |
| Table | `.sh-table` | eventos, matriz de segurança |
| ScrollArea | `.sh-scroll` (overflow + scrollbar fina) | chat, streams |
| Avatar | `.sh-avatar` (sprite pixel-art) | cards e chat |
| Badge | `.sh-badge`, variantes de status | status dos agentes/gates |

## Tokens (design system, `:root` no `styles.css`)
`--bg #0f172a` · `--panel #1e293b` · `--panel-2 #0b1220` · `--border #334155`
· `--fg #e2e8f0` · `--muted #94a3b8` · `--accent #14b8a6` (teal) ·
`--ok #22c55e` · `--warn #eab308` · `--bad #ef4444` · raio 6px · grid 8px ·
transições 200ms ease.

## Regra
Ao evoluir o dashboard, usar as classes `.sh-*`; não reintroduzir React.
