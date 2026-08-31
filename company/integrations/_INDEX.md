# Integrações externas — AI Venture Factory

Cada pasta = um repositório/serviço externo, com README (contrato de uso) e,
quando faz sentido, um script *stub*. **Nenhuma chama serviço pago ou externo
sem gate humano.** Estado de cada uma: `desligada` até você habilitar.

| # | Integração | Função | Agente(s) | Estado |
|---|---|---|---|---|
| A1 | `coolify/` | deploy auto-hospedado dos apps | A25, A16 | desligada (precisa servidor) |
| A2 | `strix/` | pentest AI autônomo (staging local) | A32 | stub (rodável local) |
| A3 | `browser/` | automação de navegador (pinchtab + browser-use) | A29, A44, A39 | stub (whitelist) |
| A4 | `brightbean/` | gestão/agendamento de redes sociais | A44 | desligada (precisa conta) |
| A5 | `hyperframes/` | vídeo a partir de HTML (HeyGen) | A44 | desligada (precisa conta/API) |
| A6 | `openmontage/` | produção de vídeo agêntica | A44+A13+A49 | desligada |
| A7 | `voicebox/` | síntese/clonagem de voz local | A44 | stub (TTS local) |
| A8 | `freedomain/` | subdomínios gratuitos | A25 | desligada (só em produção) |
| A9 | `claude-mem/` | memória persistente entre sessões | todos | **ligável** (plugin local) |
| A10 | `openhuman/` | assistente/knowledge-graph do fundador | A08 | stub (grafo local) |
| A11 | `shadcn/` | padrões de UI (portados p/ CSS puro) | dashboard | **aplicada** (port) |
| A12 | `simple-icons/` | ícones de marca (subset local) | dashboard | **aplicada** (subset) |
| A13 | `component-store/react-bits.md` | loja de componentes animados (port React→vanilla) | A14 | **aplicada** (port) |
| A14 | `component-store/magic-mcp.md` | MCP que gera componentes UI | A14 | desligada (gate: aprovar MCP) |
| A15 | `pollinations/` | geração de imagem/vídeo/áudio (flux, nanobanana, seedream...) | A44 | codigo pronto, aguarda credencial `CRQ-MTGIRCV1` |

## Regras transversais
- Integração `desligada` → o agente usa o **fallback nativo** e registra
  `integration_fallback: "<nome>"` em `company/logs/events.jsonl`.
- Credenciais: só via `A30 secrets-keeper`, nome lógico, nunca valor no repo.
- 1º uso com efeito externo (post, deploy, registro de domínio) = aprovação
  humana no dashboard (aba Chatbot Humano → botão Aprovar/Negar).
