# A5 — hyperframes (vídeo a partir de HTML)

**Repo:** `heygen-com/hyperframes` · **Agente:** A44 (content-producer)
**Estado:** desligada — precisa de conta/API HeyGen (serviço pago).

## Para quê
A44 escreve HTML/CSS/JS (uma "cena") e renderiza em MP4 para marketing —
explainers, ads curtos, teasers de feature.

## Uso (quando ligar)
1. A13 (ui-designer) fornece tokens/identidade; A44 monta a cena HTML em
   `company/marketing/videos/app-XXX/scene-NN/`.
2. `hyperframes render` (CLI local do skill) ou API HeyGen (`HEYGEN_TOKEN` via A30).
3. Saída: `company/marketing/videos/app-XXX/scene-NN.mp4` + entrada em
   `company/marketing/posts.jsonl` quando publicado.

## Regras
- Serviço pago → só com aprovação humana de gasto (N5) por render.
- Sem voz/rosto de pessoa real sem permissão (ver A7 voicebox p/ narração).
- Guardar o HTML fonte junto do MP4 (reprodutível, versionado).

## Fallback
Desligada → A44 entrega **storyboard** (HTML estático + descrição de cena por
frame) em `company/marketing/videos/` para render manual depois.
`integration_fallback: "hyperframes"`.
