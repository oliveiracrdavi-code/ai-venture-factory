# Score de viabilidade — app-001 · "Recibo Certo"

Saída de G2. Calculado por A05 + A06 + A10. Insumo do gate do CEO (G3).
Total = 100. **Quem calculou o score não decide** — a decisão é do A07.

| Critério | Peso | Nota | Justificativa (evidência) |
|---|---:|---:|---|
| Dor do usuário | 20 | **17** | Dor recorrente **mensal**, com perda financeira direta (cobrança esquecida, score 9/10 no brief). Não é dor "nice to have". Tira 3 porque o autônomo **convive** com a dor há anos usando planilha — inércia é real. |
| Disposição a pagar | 20 | **14** | Existe âncora de mercado acima (Organizze R$ 35–45) e o público paga DAS de R$ 81/mês, então tem hábito de custo fixo do negócio. Mas há **alternativa grátis** (Balancinho/GestãoMEI) e o público é sensível a preço. R$ 24/mês é plausível, não garantido. |
| Tamanho de mercado | 15 | **13** | 15,7 mi de MEIs ativos (fonte A), SAM ~5,5 mi prestadores de serviço. Mercado grande e **crescendo** (12,9 mi → 15,7 mi). Tira 2 porque o SAM é estimativa derivada (fonte C), não medida. |
| Concorrência | 10 | **7** | A brecha existe e é clara (ninguém cobre "mais que planilha, menos que gateway"). Mas o espaço é **movimentado**: grátis de um lado, Organizze do outro. Diferenciação é de fluxo, não de tecnologia — copiável. |
| Viabilidade técnica | 15 | **14** | HTML/JS + Node + SQLite resolvem 100% do MVP. Sem API paga, sem gateway (paywall simulado), sem dado sensível. O único item não trivial é PDF no cliente — resolvido com biblioteca local ou impressão do navegador. |
| Risco legal / segurança | 10 | **8** | PII comum (nome/valor), **sem dado de saúde**, **sem movimentar dinheiro** ⇒ fora de PSP/BCB. Exige LGPD básica (minimização, retenção, exclusão de conta). Tira 2 pelo dever de deixar explícito na UI que não é nota fiscal nem meio de pagamento. |
| Potencial de distribuição | 10 | **5** | **Ponto fraco.** Sem verba de mídia, o canal é orgânico (conteúdo/SEO/comunidade) contra concorrentes com marca. Não há efeito de rede nem viralidade natural: o app é de uso solo. |
| **TOTAL** | **100** | **78 / 100** | |

## Riscos críticos abertos
**Nenhum.** Não há risco crítico de segurança, legal ou regulatório aberto.
Riscos altos (não críticos): (a) distribuição sem verba; (b) concorrente grátis
adicionar cobrança/recibo.

## Faixa de decisão (referência para o CEO)
- **>= 85 e zero risco crítico** → candidato a APROVADO
- **70–84** → CONDICIONADO: volta ao bloco anterior com condições ← **caímos aqui (78)**
- **< 70** → REPROVADO: arquiva com aprendizados

## Leitura honesta dos assinantes (A05)
| Cenário | Assinantes 12m | MRR 12m | LTV/CAC | Break-even |
|---|---:|---:|---:|---|
| bear | 60 | R$ 1.440 | 3,4 | não atinge |
| **base** | **180** | **R$ 4.320** | **6,8** | mês 9 |
| bull | 420 | R$ 10.080 | 9,1 | mês 5 |

Premissas: preço R$ 24/mês; churn 8%/mês (base), 12% (bear), 5% (bull);
CAC orgânico R$ 35 (base); custo de infra ≈ R$ 0 (local/VM já paga);
LTV = 24 / 0,08 = **R$ 300** bruto, **R$ 240** líquido de margem 80%.
Método: coorte simples mensal, sem verba de aquisição paga.

## Assinaturas
- **A05 financial-viability** — 2026-08-30 · notas: pagar 14/20, mercado 13/15, distribuição 5/10
- **A06 tech-feasibility** — 2026-08-30 · nota: viabilidade técnica 14/15 · ver `tech-risks.md`
- **A10 risk-compliance** — 2026-08-30 · nota: risco legal/seg 8/10 · **zero risco crítico** · ver `risk-report.md`

_O CEO (A07) decide em `company/decisions/ceo-app-001.md`._
