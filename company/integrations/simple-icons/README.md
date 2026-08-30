# A12 — simple-icons (ícones de marca)

**Repo:** `simple-icons/simple-icons` · **Alvo:** dashboard · **Estado:** aplicada (subset).

## Decisão
Não baixar os 3400+. Só o subset usado, como SVG `<path>` único, em
`dashboard/icons/`. Licença: CC0 (simple-icons) — uso livre.

## Subset incluído (`dashboard/icons/`)
`x.svg` · `instagram.svg` · `tiktok.svg` · `linkedin.svg` · `youtube.svg` ·
`github.svg` · `cloudflare.svg` · `oracle.svg` · `node-dot-js.svg` ·
`rss.svg` · `discord.svg` · `telegram.svg`

## Uso
- Aba **Marketing/Canais** e cards de integração: ícone da plataforma.
- Header/rodapé: ícones de infra (Oracle, Cloudflare, GitHub).
- Cor: herdada por `currentColor` (o SVG usa `fill="currentColor"`).

## Adicionar um ícone novo
1. Pega o `<path d="...">` em `simpleicons.org/?q=<marca>`.
2. Salva como `dashboard/icons/<slug>.svg` no formato:
   `<svg viewBox="0 0 24 24" xmlns="..."><path fill="currentColor" d="..."/></svg>`
3. Referencia no dashboard por `<img src="/dashboard/icons/<slug>.svg">` ou inline.
