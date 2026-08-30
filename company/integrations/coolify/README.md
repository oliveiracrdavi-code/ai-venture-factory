# A1 — coolify (deploy auto-hospedado)

**Repo:** `coollabsio/coolify` · **Agentes:** A25 (devops), A16 (solution-architect)
**Estado:** desligada — precisa de um servidor Coolify acessível.

## Para quê
Deploy dos apps que a fábrica constrói (`app-001`, `app-002`, …) quando
passarem no G8 (QA) e no gate humano de produção (N5).

## Uso
1. A16 declara o alvo de deploy no `blueprint.md` (`deploy: coolify | local`).
2. A25 gera `company/projects/app-XXX/deploy.md` com: build command, porta,
   env vars (referências do A30), healthcheck.
3. Com Coolify disponível: A25 chama a API do Coolify (`COOLIFY_URL`,
   `COOLIFY_TOKEN` via A30) para criar app + deploy.
4. Sem Coolify: **fallback** = `node server.js` local (o mesmo do dashboard),
   registrado como `integration_fallback: "coolify"`.

## Regras
- Só deploya app com `qa-report.md = RELEASE-READY` **e** aprovação humana N5.
- Nunca expõe secret; env vars entram pelo A30 em runtime.
- Deploy local é o padrão até o fundador habilitar um servidor Coolify.

## Config (quando ligar)
`company/integrations/coolify/config.json` (criar):
```json
{ "enabled": false, "url_ref": "COOLIFY_URL", "token_ref": "COOLIFY_TOKEN", "default_target": "local" }
```
