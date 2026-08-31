# A44 — pollinations (geração de imagem/vídeo/áudio)

**Repo/API:** `gen.pollinations.ai` (pollinations/pollinations no GitHub) ·
**Agente dono:** A44 content-producer · **Estado:** código pronto (`scripts/generate-image.js`) — aguardando credencial.

## Para quê
Gerar imagem, vídeo, áudio e embeddings sob demanda pra material de
marketing (posts, thumbnails, hero de vídeo — ver
`company/design/VIDEO-DESIGN-STANDARD.md` pro padrão de qualidade exigido).
API compatível com OpenAI SDK, um único endpoint pra múltiplos modelos.

## Uso
- Qualquer agente que precisar de imagem **pede pro A44 via Chat Geral**
  (`node scripts/agent-chat-post.js <de> A44 "<pedido>" [task_ref]`) —
  nunca chama o provedor direto. Ver regra "Chat Geral é o canal único" em
  `padroes.md`.
- A44 gera via `GET https://gen.pollinations.ai/image/{prompt}?model=flux`
  (ou `nanobanana`, `seedream5`, `gptimage` — ver `GET /image/models` pra
  lista viva) e responde no Chat Geral com o link do asset.
- Chave: pedido de credencial `CRQ-MTGIRCV1`, preenchida em **Conexões**.
  Vai pra `company/secrets/POLLINATIONS_API_KEY.env`.
- **Fallback:** se Pollinations não atender, usa Gemini API nativo
  (`CRQ-MTGIRCX3`) — ver `company/org/model-router-fallback.md`.

## Regras
- Nunca gerar imagem com conteúdo do checklist reprovado em
  `VIDEO-DESIGN-STANDARD.md`/`DESIGN-STANDARD.md`.
- Todo pedido e toda resposta de geração passam pelo Chat Geral — nunca só
  no log de eventos.
- Custo: Pollinations cobra por uso além do free-tier — qualquer geração em
  volume alto precisa de aprovação humana (regra de gasto já existente).
- `skill_fallback: "gemini-api"` se Pollinations estiver fora do ar.
