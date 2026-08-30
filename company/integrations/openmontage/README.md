# A6 — openmontage (produção de vídeo agêntica)

**Repo:** `calesthio/OpenMontage` · **Agentes:** A44 (roteiro) + A13 (visual) + A49 (trilha)
**Estado:** desligada.

## Para quê
Vídeos de marketing mais complexos, montados por um pipeline multi-agente:
roteiro → cenas visuais → narração (A7 voicebox) → trilha → corte final.

## Pipeline
1. **A44** — roteiro em `company/marketing/videos/app-XXX/script.md` (cenas, fala, CTA).
2. **A13** — direção visual por cena (tokens, layout, motion) em `visual.md`.
3. **A7 voicebox** — narração `.wav` por cena.
4. **A49** — sugere trilha (licença aberta) + pontos de corte.
5. **OpenMontage** monta → `final.mp4`. Sem OpenMontage: A44 entrega EDL
   (lista de decisão de edição) + assets para montagem manual.

## Regras
- Só assets de licença aberta ou criados pela fábrica. Nada de trecho de
  música/vídeo com direitos.
- Aprovação humana antes de publicar qualquer vídeo final.

## Fallback
`integration_fallback: "openmontage"` → entrega `script.md` + `visual.md` +
assets + EDL em `company/marketing/videos/app-XXX/`.
