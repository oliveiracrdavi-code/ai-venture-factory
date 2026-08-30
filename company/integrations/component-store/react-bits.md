# A13 — react-bits (loja de componentes animados)

**Repo:** `DavidHDev/react-bits` (165+ componentes) · **Agente:** A14
**Estado:** aplicada — componentes **portados** React→vanilla.

## Como portar (React → vanilla, zero-build)
1. Abrir o componente no repo (`src/content/.../*.jsx` + `.css`).
2. **Extrair o CSS/keyframes** quase inteiro → `dashboard/styles.css` (prefixo `.rb-`).
3. Substituir JSX por: uma função JS que devolve string HTML **ou** cria nós
   via DOM; props viram parâmetros/`data-*`.
4. Hooks: `useEffect`/`requestAnimationFrame` viram um `init(el)` chamado após
   inserir no DOM. `useState` vira variável local.
5. Sem dependências (framer-motion, gsap): reescrever com CSS animation /
   `Web Animations API` / `requestAnimationFrame` puro.
6. Testar no dashboard local antes de commitar. Portar **só o necessário**.

## Componentes portados (uso no dashboard 4.6)
| react-bits | vira | classe/arquivo | onde |
|---|---|---|---|
| Dot Grid / Grid bg | fundo pontilhado com parallax leve | `.rb-dotgrid` + `components/fx.js` | canvas do Workflow, sidebar |
| Aurora / Gradient bg | gradiente animado suave | `.rb-aurora` | header, tela de boas-vindas |
| Glow Text / Gradient Text | texto com brilho/gradiente | `.rb-glow`, `.rb-gradient-text` | títulos, nome do agente ativo |
| Typewriter | efeito máquina de escrever | `.rb-typewriter` + `fx.js:typewriter()` | mensagem "3 agentes conversando..." |
| Count Up | contador animado | `fx.js:countUp(el,to)` | tiles de métrica (MRR, NPS...) |
| Spotlight Card | card com halo que segue o mouse | `.rb-spotlight` + `fx.js:spotlight(el)` | nós do Workflow, cards de agente |
| Marquee | faixa deslizante infinita | `.rb-marquee` | rodapé do Chat Geral (últimas TASKs) |
| Pulsing Border / Glow ring | borda que pulsa | `.rb-pulse` (keyframes) | nó ativo (status running) |

## Regra
Manter zero-build. Nenhum `import` de pacote. CSS + JS puro. Crédito ao
react-bits neste arquivo (feito).
