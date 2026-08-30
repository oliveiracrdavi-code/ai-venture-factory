# Riscos técnicos — app-001 (A06 tech-feasibility)

Stack proposta: **PWA (HTML/CSS/JS puro) + Node local + SQLite**. Zero dependência
paga, zero API externa no MVP. Auth e paywall **simulados** (regra permanente).

## Esforço
T-shirt: **M**. Fatias entregáveis do MVP:
1. cliente (CRUD) + serviço/recibo → PDF/print · critério: recibo abre e imprime
2. cobrança com link público + status (enviada/vista/paga) · critério: status muda
3. lembrete de pendente (fila local) · critério: pendente aparece no painel
4. painel do mês + barra do limite MEI · critério: soma bate com os recibos
5. auth simulada + paywall simulado · critério: rota protegida bloqueia

## Riscos
| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Geração de PDF no cliente ficar feia/quebrada | média | médio | usar `window.print()` com CSS `@media print` primeiro; biblioteca só se necessário |
| "Link público" do recibo vazar dado de cliente | média | **alto** | token aleatório longo por recibo, sem enumeração, expiração opcional; A31/A32 testam IDOR no G7 |
| SQLite concorrente (várias abas/dispositivos) | baixa | médio | escrita serializada no Node; WAL; sem multi-device no MVP |
| PWA offline dessincronizar dados | média | médio | offline só leitura no MVP; escrita exige rede |
| Escopo inchar para "virar contador" | **alta** | alto | MVP trava em: registrar, cobrar, lembrar, somar. NF-e e conciliação bancária ficam **fora**. |
| Confundir usuário achando que é meio de pagamento | média | alto (legal) | aviso explícito na UI (exigência do A10) |

## Veredito
**Construível agora**, local-first, sem custo. Nota para o score: **14/15**.
