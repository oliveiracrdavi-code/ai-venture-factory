# Permissões — 5 níveis

Todo arquivo `.md` de agente (bundlado na skill, `agents/`) **declara seu
nível no cabeçalho** (campo `Nível: NX`). Um agente nunca excede o próprio
nível; um agente pode abrir mão de capacidades, nunca adicioná-las.

Regra transversal: nenhuma ação com efeito colateral fora de `company/` (do
projeto ALVO), do `dashboard/`/`scripts/` da skill, e — a partir do G6 —
do **código real do projeto ALVO** (a raiz do repositório onde a sessão
está rodando, fora de `company/`) acontece sem aprovação humana explícita.

**Onde vive o código do "app-XXX":** quando a fábrica é ativada dentro de
um projeto já existente (a skill clonada em `.claude/skills/ai-venture-factory/`
de um repositório com código real), "código do app-XXX" nas seções abaixo
significa **a árvore de arquivos real desse repositório** (src/, package.json,
etc.), nunca uma pasta dentro de `company/`. `company/` é só gestão
(specs, decisões, tasks, logs) — nunca abriga produto. Quando não há
projeto existente (checkout novo e vazio), os agentes de pesquisa propõem
o nicho e o código passa a existir na mesma raiz assim que A16/A17 iniciam
o G5/G6.

---

## N1 — Leitura

**Pode:** ler arquivos do repositório, ler logs, pesquisar em fontes
públicas, resumir, produzir análise em texto para outro agente.
**Não pode:** alterar arquivos do projeto, executar comandos, acessar
secrets, escrever artefato final.
**Agentes:** A01, A02, A03, A04 (pesquisa); A48 em modo leitura; QA em
modo leitura antes de ter ambiente.

## N2 — Escrita controlada

**Pode:** tudo do N1 + criar/editar documentos Markdown e JSON de artefato
(briefs, PRD, blueprint, decisões, relatórios), criar TASKs, escrever código
**em branch** (não mergeia).
**Não pode:** rodar comandos perigosos, tocar em produção, ler/escrever
secrets, fazer merge.
**Agentes:** A05, A06, A07, A08, A09, A10, A11, A12, A13, A14, A15, A16,
A17 (exceto merge, ver nota), A31, A34, A35, A36, A37, A38, A41, A42, A43,
A44, A45, A46, A47, A48, A49.
_Nota A17 tech-lead:_ N2 + direito exclusivo de **merge** no código do
app-001. Nenhum outro agente mergeia.

## N3 — Execução local controlada

**Pode:** tudo do N2 + rodar comandos permitidos (build, lint, testes,
scripts locais do repositório), subir servidores locais, ler saída de
processos.
**Não pode:** deletar dados, acessar pastas fora do repositório, instalar
pacote global, usar admin/sudo, enviar dados para fora.
**Agentes:** A18, A19, A20, A21, A22, A23, A24, A25, A26, A32, A33, A39, A40.
Escopo do red-team (A32) e blue-team (A33): **somente o staging local do
app-001**.

## N4 — Alto privilégio (conectores)

**Pode:** tudo do N3 + gerenciar variáveis de ambiente locais, configurar
conectores de API externos com whitelist, injetar credenciais em runtime.
**Não pode:** agir sem log; agir sem aprovação humana para ação sensível;
acessar pastas fora do repositório; escrever secret em log/chat/prompt;
instalar pacote global; controlar teclado/mouse livremente; deletar
arquivos; enviar dados do usuário para fora sem autorização.
**Agentes:** A27, A28, A29, A30.
- A29 desktop-operator: automações locais **controladas** apenas — ler/mover
  arquivos dentro de pastas permitidas, rodar scripts da whitelist, abrir
  servidores locais. Nada além disso.
- A30 secrets-keeper: nunca escreve o valor de um secret em lugar nenhum
  além do `.env` local; injeta só no momento da execução.

## N5 — Produção (só com humano)

**Pode:** preparar release, sugerir deploy, montar pacote de publicação.
**Não pode, sem aprovação humana explícita e por item:** publicar em
produção, gastar dinheiro, mover fundos, alterar meio de pagamento, postar
o primeiro conteúdo de um canal novo, apagar dados de usuário, habilitar
`method: "api"` num canal de marketing.
**Agentes:** A25 (deploy), A48 (finanças), A44/A43 (publicação), A07 (CEO)
— todos apenas com o gate humano correspondente.

---

## Matriz rápida

| Nível | Lê | Escreve doc | Roda comando | Env/conectores | Produção |
|------:|:--:|:-----------:|:------------:|:--------------:|:--------:|
| N1 | ✅ | — | — | — | — |
| N2 | ✅ | ✅ (branch p/ código) | — | — | — |
| N3 | ✅ | ✅ | ✅ (whitelist local) | — | — |
| N4 | ✅ | ✅ | ✅ | ✅ (com log + gate) | — |
| N5 | ✅ | ✅ | ✅ | ✅ | ✅ **só com humano, por item** |
