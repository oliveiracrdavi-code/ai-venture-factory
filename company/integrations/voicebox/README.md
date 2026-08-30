# A7 — voicebox (síntese de voz local)

**Repo:** `jamiepine/voicebox` · **Agente:** A44 (content-producer)
**Estado:** stub — TTS local, sem serviço externo.

## Para quê
Narração para os vídeos de marketing (A5 hyperframes / A6 openmontage).

## Uso
```
node scripts/voicebox-runner.js --text "roteiro..." --voice open-neutral-ptbr --out company/marketing/videos/app-001/scene-01.wav
```
- Usa Voicebox se instalado; senão registra fallback (A44 entrega o texto da
  narração + marca `[TTS pendente]`).

## Regras (rígidas)
- **Nunca** clonar voz de pessoa real sem permissão explícita e por escrito.
- Usar apenas: vozes fictícias geradas, ou vozes de **licença aberta**.
- Voz de figura pública / do fundador = proibido sem autorização.
- Guardar em `company/marketing/videos/.../voices/` com a licença ao lado.

## Fallback
`integration_fallback: "voicebox"` → `narration.txt` por cena, TTS feito depois.
