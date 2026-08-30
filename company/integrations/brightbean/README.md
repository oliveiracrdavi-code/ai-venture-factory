# A4 — brightbean-studio (gestão de redes sociais)

**Repo:** `brightbeanxyz/brightbean-studio` · **Agente:** A44 (content-producer)
**Estado:** desligada — precisa de conta BrightBean + credenciais dos canais.

## Para quê
A44 agenda/publica o pacote diário em múltiplas plataformas por uma API só,
em vez de N integrações separadas.

## Uso (quando ligar)
1. `config.json` (criar) — 1 entrada por canal, `credentials_ref` do A30:
```json
{ "enabled": false, "api_ref": "BRIGHTBEAN_TOKEN",
  "channels": [ { "platform": "x", "handle_ref": "X_HANDLE", "method": "manual" } ] }
```
2. A44 gera `company/marketing/drafts/YYYY-MM-DD.md`, A46 varia p/ A/B.
3. Publicador: se `enabled` e canal `method: "api"` → chama BrightBean via A28
   com credencial injetada pelo A30 → grava `company/marketing/posts.jsonl`.

## Regras
- Canais nascem `method: "manual"` → `outbox/`. Viram `api` só com o fundador.
- **1º post de cada canal = aprovação humana** (dashboard → Aprovar/Negar).
- Proibido spam, compra de seguidores, review falso, promessa irreal.
- Respeitar `daily_limit` (default 3) e rate limits da plataforma.

## Fallback
Desligada → A44 usa o fluxo `manual` da spec (`outbox/` + "AGUARDANDO CLIQUE
HUMANO" no dashboard). `integration_fallback: "brightbean"`.
