# A8 — freedomain (subdomínios gratuitos)

**Repo:** `DigitalPlatDev/FreeDomain` · **Agente:** A25 (devops)
**Estado:** desligada — só quando um app entra em produção.

## Para quê
Registrar um subdomínio grátis para o app publicado (ex.:
`app-001.dpdns.org`), via pull request no repositório FreeDomain.

## Uso (quando ligar)
1. App passou G8 + aprovação humana N5 + tem deploy ativo (A1 coolify ou local+túnel).
2. A25 preenche `company/projects/app-XXX/domain.md`:
   - subdomínio desejado, tipo de registro (CNAME/A), alvo (URL do deploy).
3. A25 abre PR no `DigitalPlatDev/FreeDomain` com o JSON do subdomínio
   (via A28, GitHub). **PR = ação externa → aprovação humana.**
4. Ao mesclar: registro em `domain.md` (subdomínio, alvo, data, link do PR).

## Regras
- Só registra domínio de app **em produção** e aprovado.
- Um subdomínio por app. Sem squatting, sem registrar em massa.
- Alvo do DNS sempre um deploy real e sob nosso controle.

## Fallback
Desligada → o app usa a URL do túnel (`*.trycloudflare.com`) ou
`127.0.0.1:<porta>` local. `integration_fallback: "freedomain"`.
