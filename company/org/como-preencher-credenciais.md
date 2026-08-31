# Como preencher as credenciais (sem colar no chat)

1. Crie o arquivo `company/secrets/.env` (não existe ainda — você cria).
   Esse caminho já está no `.gitignore`, nunca vai pro GitHub.
2. Cole o bloco abaixo dentro dele, **substituindo só os valores** depois do `=`:

```env
XKIRO_API_KEY=cole_aqui_a_chave_nova_da_xkiro
POLLINATIONS_API_KEY=cole_aqui_a_chave_da_pollinations
GEMINI_API_KEY=cole_aqui_a_chave_do_gemini
```

3. Rode (no PowerShell, dentro da pasta do projeto):

```powershell
node scripts/apply-env.js
```

Isso divide o `.env` em `company/secrets/XKIRO_API_KEY.env`,
`POLLINATIONS_API_KEY.env` e `GEMINI_API_KEY.env` — exatamente o formato que
`scripts/model-router.js` e `scripts/generate-image.js` já leem — e marca os
pedidos correspondentes (`CRQ-MTGIRCV1`, `CRQ-MTGIRCX3`) como preenchidos na
aba Conexões do dashboard. Nada é impresso na tela nem gravado em log — só
um preview mascarado tipo `****ab12`.

Não precisa preencher os três de uma vez — o script só processa a chave que
encontrar no arquivo; pode rodar de novo depois que adicionar mais uma.

**Se você já rodou algo assim antes com as chaves antigas** (que apareceram
em texto puro aqui no chat): gera uma chave **nova** nos sites antes de
colar — a antiga deve ser tratada como comprometida.
