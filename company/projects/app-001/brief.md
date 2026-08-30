# Opportunity Brief — app-001 · "Recibo Certo"

Saída do BLOCO 1 (G1). Produzido por A01–A04, com insumo de A05/A06/A10.
Nenhum autor aprova o próprio brief — decisão é do A07 (CEO) em G3.

**Grau de fonte:** A = dado oficial/primário · B = imprensa/setorial · C = estimativa derivada (método explícito).

---

## 1. Problema (A04)
O MEI/autônomo prestador de serviço fatura por trabalho avulso e controla isso
no improviso: recibo em bloco de papel ou print de WhatsApp, cobrança "quando
lembra", e uma planilha que ele para de atualizar em fevereiro. Três
consequências concretas e mensais:

1. **Recibo que some** — cliente pede comprovante depois e ele não acha.
2. **Cobrança esquecida** — serviço entregue, cobrança nunca enviada ou nunca
   seguida; o dinheiro simplesmente não entra.
3. **Faturamento cego** — não sabe quanto faturou no ano, e o limite do MEI
   (R$ 81 mil/ano, com DAS de R$ 81,05/mês em 2026 — fonte A, Agência Brasil)
   vira surpresa em vez de controle.

## 2. Público / persona (A04)
- **Quem:** MEI ou autônomo **prestador de serviço**, trabalha sozinho, 1–40
  clientes/mês, ticket R$ 80–R$ 1.500 por serviço. Celular é o escritório.
  Não tem contador mensal (ou tem só o obrigatório anual).
- **JTBD:** _"quando eu termino um serviço, quero registrar e cobrar em menos de
  1 minuto pelo celular, para eu não perder dinheiro nem tempo depois."_
- **Onde já se reúne:** grupos de WhatsApp/Facebook de MEI, comunidades do
  Sebrae, TikTok/YouTube de "dicas para MEI", app store buscando "controle MEI".

## 3. Dor priorizada (A04)
| Dor | Frequência | Intensidade | Score | Evidência |
|---|---|---|---|---|
| Cobrança entregue e nunca cobrada/seguida | alta (semanal) | alta (perda direta de R$) | **9** | dor central que apps de cobrança (Asaas) atacam com "controle de inadimplência" — fonte B |
| Recibo/comprovante perdido | alta (mensal) | média-alta | **7** | motivo recorrente de busca por "app recibo MEI" nas lojas — fonte C |
| Não saber o faturamento vs. limite MEI | mensal | alta (risco de desenquadramento) | **7** | limite e DAS são regra dura do regime — fonte A |
| Misturar dinheiro pessoal e do negócio | contínua | média | **5** | é o problema que o Organizze vende resolver ("separar finanças pessoais das empresariais") — fonte B |

## 4. Solução proposta (hipótese de MVP)
App web/PWA local-first: **cliente → serviço → recibo (PDF/link) → cobrança com
status (enviada/vista/paga) → lembrete de pendente → painel do mês + barra do
limite MEI**. O MVP testa uma hipótese só: *o autônomo paga para não perder
cobrança*.

## 5. Mercado (A01)
- **TAM** — 15,7 mi de MEIs ativos no Brasil (Portal do Empreendedor, 2026 — fonte A).
  A R$ 24/mês, o teto teórico é irrelevante como número; serve só de contexto.
- **SAM** — MEIs **prestadores de serviço** com cobrança avulsa recorrente.
  Método: recorte conservador de ~35% da base (comércio e outros perfis ficam de
  fora) ⇒ **~5,5 mi** (fonte C, derivada de A).
- **SOM (12 meses)** — canal orgânico + conteúdo, sem verba de mídia.
  Método: 0,02% do SAM ⇒ **~1.100 assinantes** como teto otimista do 1º ano
  (fonte C). O cenário-base do A05 usa uma fração disso.
- **Sinais de demanda (A03):** categoria com concorrência ativa e conteúdo
  constante ("5 aplicativos que ajudam o MEI a organizar as finanças" — imprensa,
  fev/2026, fonte B); base de MEIs cresceu de 12,9 mi (out/2025) para 15,7 mi
  (2026) — fonte A/B. **Classificação: tendência estrutural, não modinha** — o
  crescimento é do próprio regime MEI, não de um hype.

## 6. Concorrência (A02)
| Concorrente | Preço | Forças | Fraquezas (evidência) | Nossa diferenciação |
|---|---|---|---|---|
| **Planilha / caderno** (o real) | R$ 0 | grátis, familiar | não cobra ninguém, não lembra, quebra | automatiza o **follow-up**, que a planilha nunca faz |
| **Organizze** | R$ 35 manual / R$ 45 conectado (fonte B) | maduro, sincroniza banco | é **finanças pessoais** adaptado; não emite recibo nem persegue cobrança | nasce no fluxo *serviço→recibo→cobrança* |
| **Balancinho / GestãoMEI** | grátis (fonte B) | grátis, foco MEI, DAS | monetização indireta; foco em caixa/estoque, não em cobrar cliente | cobra menos que Organizze e faz o que o grátis não faz |
| **Asaas** e afins | taxa por transação | cobrança robusta, boleto/pix | é **gateway** (KYC, taxa, compliance pesado) | não movimenta dinheiro: só registra e lembra ⇒ zero risco regulatório |
| **Contabilizei** | R$ 195/mês (fonte B) | contabilidade completa | 8× mais caro; outro problema | complementar, não concorrente |

**Brecha:** ninguém ocupa bem o meio-termo *"mais que planilha, menos que
gateway/contador"* pelo preço de um lanche. Sinal de churn nos concorrentes
(fonte C): reclamação recorrente de que app de finanças pessoais "não serve pra
quem emite recibo".

**Diferenciação concreta vs. concorrente grátis (condição 3 do CEO, A02):**
Balancinho e GestãoMEI resolvem *caixa* (entrada/saída, estoque, DAS) — não
resolvem *cobrança*. Nenhum dos dois tem **link público de recibo com status
de leitura** (enviado → visto → pago) nem **lembrete automático de cobrança
parada**. É exatamente a dor #1 do brief (score 9/10: "cobrança entregue e
nunca cobrada/seguida") que o app gratuito não ataca porque nasceu para
controle de caixa, não para relacionamento com o cliente que deve. Essa é a
única funcionalidade que justifica cobrar acima de zero.

## 7. Disposição a pagar (A01)
Faixa plausível: **R$ 19–29/mês**. Base: Organizze cobra R$ 35–45 para um
problema adjacente (fonte B); o público-alvo é mais sensível a preço que o de
finanças pessoais; existe alternativa grátis (Balancinho), então o preço precisa
ficar **abaixo** do Organizze e o valor precisa ser o que o grátis não entrega.
**Preço-âncora sugerido: R$ 24/mês** (ou R$ 228/ano).

## 8. Viabilidade financeira (A05) — resumo
Preço R$ 24/mês, churn base 8%/mês, CAC orgânico ~R$ 35. LTV ≈ R$ 240,
LTV/CAC ≈ 6,8. Detalhe e cenários em `score.md` e `financial-model.md`.

## 9. Viabilidade técnica (A06) — resumo
**Fácil/médio.** HTML+JS (PWA) + Node local + SQLite. Sem dependência paga:
recibo em PDF gerado no cliente, "cobrança" = link público + lembrete, **auth e
paywall simulados** (regra permanente até gateway aprovado). Riscos em
`tech-risks.md`.

## 10. Riscos (A10)
- **Legal/LGPD:** dado de cliente (nome, CPF opcional, valor) = PII comum, não
  sensível. Exige minimização, retenção e exclusão de conta. **Sem dado de saúde.**
- **Financeiro/regulatório:** o app **não** movimenta dinheiro, não emite nota
  fiscal e não é meio de pagamento ⇒ fora do escopo de PSP/BCB. Precisa deixar
  isso explícito na UI para não induzir o usuário ao erro.
- **Termos de plataforma:** distribuição por PWA/web, sem loja no MVP.
- **Risco crítico aberto:** **nenhum.**

## 11. Recomendação do bloco
**Seguir para G2 (viabilidade).** Dor forte e recorrente, público grande e
crescente, concorrência que não cobre a brecha, execução barata e risco legal
baixo. O ponto fraco honesto é **distribuição** (canal orgânico, sem verba) —
é o que mais derruba a nota no score.

---
*A01 market-researcher · A02 competitor-analyst · A03 trend-scout · A04 user-pain-analyst — consolidado por A08 chief-of-staff.*

**Fontes:** [Agência Brasil — DAS 2026](https://agenciabrasil.ebc.com.br/economia/noticia/2026-01/recolhimento-do-mei-sobe-para-r-8105-em-2026) · [Sebrae RS — MEI 2026](https://digital.sebraers.com.br/blog/mei/mei-2026-o-futuro-dos-pequenos-negocios/) · [EM — 5 apps para MEI](https://www.em.com.br/trends/2026/02/7359268-5-aplicativos-que-ajudam-o-mei-a-organizar-as-financas-do-negocio.html) · [Organizze — planos](https://www.organizze.com.br/planos/) · [Balancinho](https://www.balancinho.com.br/) · [GestãoMEI](https://gestaomei.app.br/) · [Contabilizei — preços](https://contabilidade.com/blog/quanto-custa-a-contabilidade-online-em-2026-guia-de-precos-e-o-que-esta-incluso/)
