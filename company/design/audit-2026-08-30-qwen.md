# Auditoria de design — referência Qwen (chat UI), 2026-08-30 (2ª rodada)

Complementa `audit-2026-08-30.md`. O fundador apontou o site do Qwen como
padrão de "design de respeito" e pediu redesign + auditoria comparando com
as imagens enviadas (2 screenshots: estado vazio e conversa em andamento).

## O que foi extraído das imagens (específico, não "clean minimal" genérico)

| # | Observado no Qwen | Onde bate na AVF |
|---|---|---|
| 1 | Só a bolha do usuário é colorida; a resposta da IA é texto solto, sem caixa | Chat Geral + Chatbot Humano (ambos tinham bolha nos dois lados) |
| 2 | Nenhum rótulo "Você" acima da própria bolha — só a cor/alinhamento já identifica | Chatbot Humano mostrava "Você · timestamp" em cima da própria mensagem |
| 3 | Estado vazio ("Como posso ajudar?") centralizado na tela toda, bastante espaço | `.empty` era só texto pequeno no topo, sem centralização vertical |
| 4 | Indicador de status = ponto pequeno, sem caixa/borda/maiúscula | `.sh-badge` era uma pílula com borda e texto em CAIXA ALTA |
| 5 | Composer em formato pílula bem arredondado + botão de envio destacado | Composer tinha cantos de 8px (quase reto) |
| 6 | Um único elemento vivo/brilhante por tela (botão de enviar) | Já resolvido na rodada anterior (removido o 2º botão "Saved") |

## Mudanças aplicadas

1. **Bolha assimétrica** (`dashboard/styles.css`, `.msg`/`.msg.me`/`.msg.system`):
   mensagem do fundador = única com bolha (roxa, cantos generosos, sem rótulo
   "Você"); mensagem de agente/sistema = texto solto com avatar+nome pequenos
   acima, sem caixa. Testado ao vivo: mandei uma mensagem de teste no Chatbot
   Humano e confirmei via `getComputedStyle` que `.msg.me` tem fundo roxo e
   `.msg.system` tem fundo transparente.
2. **Badge de status silencioso**: removida a borda/caixa/maiúscula de
   `.sh-badge` — agora é só ponto colorido + texto normal, testado na aba
   Agentes (49 cards, status legível sem gritar).
3. **Estado vazio generoso**: `.empty` ganhou padding maior, largura máxima
   478px centralizada, fonte maior; `.chat-log:has(> .empty)` centraliza
   verticalmente também — testado no Chat Geral e Chatbot Humano vazios.
4. **Composer em pílula**: `border-radius` do textarea subiu pra
   `--radius-lg` (18px) e o botão Enviar virou `--radius-pill` (totalmente
   arredondado), com mais padding.

## O que NÃO foi copiado literalmente (e por quê)

- Qwen não tem avatar nem nome em NENHUMA mensagem (é um chat 1:1 com um
  único assistente). A AVF é multi-agente (49 agentes) — saber QUEM está
  falando é informação essencial, não decorativa. Mantive avatar+nome nas
  mensagens de terceiros (não removi como o Qwen faz), só tirei a CAIXA ao
  redor.
- Qwen não tem sidebar com canvas/grafo — não existe equivalente lá pro
  Workflow. A aba Workflow continua com o tratamento de nó/canvas da
  auditoria anterior (não é uma tela de "chat", os princípios de bolha não
  se aplicam a ela).

## Resultado

4 de 6 observações do Qwen exigiam mudança real na AVF; todas as 4 foram
aplicadas e verificadas ao vivo no navegador (não só no código). As outras 2
já estavam corretas pela rodada de auditoria anterior (PDF).
