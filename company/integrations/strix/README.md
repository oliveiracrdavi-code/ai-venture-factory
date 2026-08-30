# A2 — strix (pentest AI autônomo)

**Repo:** `usestrix/strix` · **Agente:** A32 (red-team)
**Estado:** stub — rodável localmente contra o staging do próprio app.

## Para quê
A32 executa varredura ofensiva real (auth bypass, injeção, XSS, CSRF, IDOR,
upload malicioso, ausência de rate limit) contra o **staging local** do
`app-XXX` no gate G7.

## Uso
```
node scripts/strix-runner.js --target http://127.0.0.1:<porta-staging> --project app-001
```
- `strix-runner.js` valida que o alvo é `127.0.0.1`/`localhost` (recusa qualquer
  outro host), invoca o Strix se instalado, e grava:
  `company/security/strix-app-XXX.md` (vuln, severidade, evidência, reprodução, correção).
- Sem Strix instalado: fallback = checklist manual do A32 (`webapp-testing`,
  `curl`, `static-analysis`) + `integration_fallback: "strix"` no log.

## Regras (rígidas)
- **SÓ** ataca `127.0.0.1`/`localhost`/staging próprio. Alvo externo = abortar.
- Sem credencial real de produção. Sem exfiltração. Sem ataque destrutivo.
- Todo achado alimenta o ciclo red→blue→reteste (G7) até a invasão falhar.

## Instalação (opcional, local)
Ver repo `usestrix/strix`. O `strix-runner.js` funciona como stub sem ele.
