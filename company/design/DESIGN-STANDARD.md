# Padrão mínimo de design — AI Venture Factory

**Fonte:** `company/design/bom-gosto-design-reference.pdf` (20 referências
curadas no Dribbble.com pelo fundador, 2026-08-30).

## Regra permanente

O PDF acima é o **piso mínimo aceitável** de qualidade visual pra qualquer
front-end deste projeto — o dashboard da AVF, qualquer app-XXX que o BLOCO 3/4
construir, e qualquer landing/material de marketing do BLOCO 8. **Nada abaixo
do nível do PDF é aceitável.** O PDF foi escrito em cima de exemplos de editor
de vídeo mobile — a AVF é um dashboard de workflow desktop, então os
princípios abaixo são a **tradução** das 20 referências pro nosso contexto,
não uma cópia literal de componente (não temos timeline de vídeo; temos o
canvas de workflow — o princípio "o componente central do domínio recebe o
maior capricho" se aplica a ELE).

**Toda vez que um design for dado como pronto, rodar a auditoria da seção
final antes de declarar concluído** (não é opcional — é o mesmo checklist que
o PDF exige pras 20 telas dele).

## Checklist — traduzido pro nosso contexto (dashboard desktop, não app mobile)

| # | Regra do PDF (original) | Tradução pra AVF |
|---|---|---|
| 1 | Fundo quase-preto (#0B0B0C–#171717), nunca preto puro nem cinza médio | `--bg-app`/`--bg-canvas` devem ficar nessa faixa, com leve temperatura (não cinza neutro morto) |
| 2 | Uma única cor de destaque, resto grayscale | Auditar que só `--accent` carrega energia (CTA, estado ativo, badge); cores de bloco (`--b1..b8`) são categorização, não “destaque” — devem ficar discretas/translúcidas, nunca competir com o accent |
| 3 | Cantos arredondados generosos (16–28px), bordas 1px quase invisíveis | Cards/painéis/botões com raio generoso consistente; borda só um tom mais clara que o fundo |
| 4 | Máx. 3 pesos tipográficos por tela, títulos curtos | Auditar cada view (Overview, Agentes, Financeiro...) por pesos de fonte soltos e título verboso |
| 5 | Componente-domínio (timeline) = mais crítico da UI | Pra nós: o **canvas do Workflow** é o componente-domínio — é onde o capricho extra tem que aparecer |
| 6 | Dock inferior fixo, ícones outline consistentes, 5–7 itens | Sidebar/topbar da AVF: ícones consistentes (mesmo estilo, outline), nunca misturar outline+filled |
| 7 | "IA trabalhando" = % grande + etapas com checkmark, nunca spinner genérico | Pipeline de gates (G0–G10) e status de tick devem comunicar progresso real, não só ⏳ |
| 8 | Caixa de prompt grande + chips de sugestão + botão "Generate" mais chamativo | Composer do Chatbot Humano e formulário de credencial nas Conexões |
| 9 | Mockups flutuantes/rotacionados só em marketing, nunca na UI real | Vale só se o BLOCO 8 gerar landing page pra algum app-XXX |
| 10 | Espaço em branco generoso, densidade média-baixa | Auditar padding/gap de cada view — "se parece apertado, está errado" |
| 11 | Saudação pessoal + avatar no topo, nunca header corporativo genérico | Sidebar já tem "Fundador"; considerar saudação pessoal na Visão Geral também |
| 12 | Conteúdo do usuário é a estrela, UI é moldura discreta | Pra nós: os DADOS reais (agentes, tasks, métricas) são a estrela — chrome deve ser discreto |

## Anti-padrões (nunca fazer, do PDF, valem aqui também)

- Nunca mais de 1 família tipográfica por tela.
- Nunca sombra dura/pesada — só suave e quase imperceptível.
- Nunca misturar ícone outline + filled na mesma tela.
- Nunca dois botões do mesmo peso visual competindo — só 1 CTA "mais importante" por tela.
- Nunca gradiente múltiplo/barulhento na UI de trabalho (reservado pra hero/marketing).

## Processo obrigatório

1. Qualquer trabalho de design/front-end (dashboard, app-XXX, landing) usa
   este documento como referência antes de começar.
2. Ao terminar, rodar auditoria visual item a item contra a tabela acima +
   contra as imagens do PDF, registrando o resultado (o que passou, o que não
   passou e foi corrigido, o que ficou como exceção justificada).
3. Só é considerado "pronto" quando a auditoria fecha com tudo ✓ ou com
   exceções explicitamente justificadas pro fundador.

## Padrões irmãos

- **Vídeo de divulgação** (BLOCO 8 — A44/A45/A46): ver
  `company/design/VIDEO-DESIGN-STANDARD.md` +
  `company/design/padrao-minimo-video-divulgacao.pdf` (fixado 2026-08-30).
- Pendente: fundador ainda pode enviar referência de **posts estáticos/imagem**
  (feed, carrossel) — quando chegar, mesmo tratamento.
