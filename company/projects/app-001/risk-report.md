# Risco & Compliance — app-001 (A10 risk-compliance)

## Dados coletados x necessidade (minimização)
| Dado | Finalidade | Necessário? | Base legal (LGPD) |
|---|---|---|---|
| nome do usuário (MEI) | identificar conta | sim | execução de contrato |
| e-mail do usuário | login e recuperação | sim | execução de contrato |
| nome do cliente final | emitir recibo | sim | legítimo interesse do titular-usuário |
| CPF/CNPJ do cliente final | recibo formal | **opcional** | consentimento — campo deve ser opcional |
| valor / descrição do serviço | núcleo do produto | sim | execução de contrato |
| telefone do cliente final | enviar cobrança | opcional | consentimento |

**Nenhum dado sensível** (art. 5º, II da LGPD): sem saúde, biometria, origem
racial, opinião política. Isso é o que separa este nicho do de prontuário.

## LGPD
- **Consentimento:** campos opcionais (CPF, telefone) marcados como tal, não pré-preenchidos.
- **Retenção:** dados do recibo por 5 anos (prazo fiscal usual); conta inativa 12 meses → aviso e expurgo.
- **Direitos do titular:** acesso, correção, **exclusão de conta com expurgo real** (não soft-delete) e exportação (CSV/JSON). Testável — vira caso de teste do A38/A39.
- **DPIA:** não obrigatório (baixo risco, sem dado sensível, sem decisão automatizada).

## Regulatório financeiro — o ponto que mais importa
O app **não** movimenta dinheiro, **não** processa pagamento, **não** emite nota
fiscal e **não** custodia recursos. Ele **registra e lembra**. Portanto está
**fora** do escopo de instituição de pagamento (BCB) e fora da obrigação de
emissor de NF-e.

**Exigência bloqueante para o G4/G6:** a UI deve dizer, de forma visível:
> "Este recibo é um comprovante de serviço, não é nota fiscal. O app não recebe
> nem repassa pagamentos."

Sem esse aviso, o A10 **bloqueia** o release no G8.

## Termos de plataforma
MVP distribui por PWA/web — sem regra de loja no piloto. Se for para loja depois,
reavaliar (Apple/Google exigem billing próprio para assinatura digital).

## Risco crítico aberto
**Nenhum.** Nota para o score: **8/10** (tira 2 pela dependência do aviso de
"não é NF/meio de pagamento" e pelo dever de expurgo real testável).

## Checklist de compliance por gate
- [ ] **G4** blueprint declara campos opcionais e política de retenção
- [ ] **G6** UI tem o aviso "não é nota fiscal / não processa pagamento"
- [ ] **G7** A32 testa IDOR no link público do recibo
- [ ] **G8** A38/A39 provam exclusão de conta com expurgo real + exportação
- [ ] **G9** marketing não promete "emite nota fiscal" nem "recebe pagamento"
