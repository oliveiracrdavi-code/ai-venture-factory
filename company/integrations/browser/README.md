# A3 — browser (automação de navegador)

**Repos:** `pinchtab/pinchtab` + `browser-use/browser-use`
**Agentes:** A29 (desktop-operator), A44 (content-producer), A39 (e2e-tester)
**Estado:** stub — com whitelist de domínios.

## Para quê
| Agente | Uso |
|---|---|
| A29 | tarefas locais no navegador (preencher form, scraping de fonte pública) |
| A44 | publicar conteúdo em rede social via automação (quando `method: "browser"`) |
| A39 | testes E2E de fluxos complexos que o playwright-skill não cobre |

## Whitelist
`company/integrations/browser/whitelist.json` (criar):
```json
{ "enabled": false, "domains": ["127.0.0.1", "localhost"], "allow_login_flows": false }
```
Qualquer domínio fora da lista = ação recusada + log.

## Regras
- **Nunca** interage com site de produção/terceiro sem aprovação humana (N5).
- Sem CAPTCHA, sem criar conta, sem inserir credencial (isso é do humano).
- A44: 1º post de cada canal por browser = gate humano, igual à regra de
  marketing da spec.
- Toda sessão de browser gera log imutável (URL, ação, timestamp).

## Fallback
Sem pinchtab/browser-use instalados: A39 usa `playwright-skill`; A44 cai para
`method: "manual"` → `company/marketing/outbox/`; A29 usa `filesystem`/`Bash`
restrito. Registrar `integration_fallback: "browser"`.
