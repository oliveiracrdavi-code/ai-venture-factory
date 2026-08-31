#!/usr/bin/env node
'use strict';
/**
 * apply-env.js -- le company/secrets/.env (um arquivo so, formato padrao
 * KEY=value, NUNCA versionado) e distribui cada chave conhecida pro arquivo
 * individual que scripts/model-router.js e scripts/generate-image.js ja
 * esperam (company/secrets/<NOME>.env). Tambem marca o pedido correspondente
 * como preenchido em company/state/credential-requests.json, do mesmo jeito
 * que a aba Conexoes faz.
 *
 * Nunca imprime o valor real -- so um preview mascarado (****ab12).
 *
 *   node scripts/apply-env.js
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

var ROOT = path.resolve(__dirname, '..');
var SECRETS_DIR = path.join(ROOT, 'company', 'secrets');
var SRC = path.join(SECRETS_DIR, '.env');
var CRED_REQUESTS = path.join(L.P.stateDir, 'credential-requests.json');

// nomes reconhecidos -- qualquer outra chave no .env e ignorada (nao gravada
// em nenhum lugar) ate ser adicionada aqui, pra nao espalhar segredo nao
// mapeado por engano.
var KNOWN = ['XKIRO_API_KEY', 'POLLINATIONS_API_KEY', 'GEMINI_API_KEY'];

function main() {
  if (!fs.existsSync(SRC)) {
    console.log('company/secrets/.env nao existe ainda -- crie primeiro (ver company/org/como-preencher-credenciais.md)');
    process.exit(1);
  }
  var raw = fs.readFileSync(SRC, 'utf8');
  var found = {};
  raw.split(/\r?\n/).forEach(function (line) {
    var m = line.match(/^([A-Z0-9_]+)=(.+)$/);
    if (m) found[m[1]] = m[2].trim();
  });

  var st = L.readJSON(CRED_REQUESTS, { pending: [], filled: [] });
  if (!st.pending) st.pending = [];
  if (!st.filled) st.filled = [];
  var applied = [];

  KNOWN.forEach(function (name) {
    var value = found[name];
    if (!value || /^cole_aqui/.test(value)) return; // placeholder nao preenchido, ignora
    fs.writeFileSync(path.join(SECRETS_DIR, name + '.env'), name + '=' + value + '\n', { mode: 0o600 });
    var preview = value.length > 4 ? ('****' + value.slice(-4)) : '****';
    applied.push({ name: name, preview: preview });

    var item = null;
    st.pending = st.pending.filter(function (p) { if (p.env_key === name || p.api_name === name) { item = p; return false; } return true; });
    st.filled.push({
      id: (item && item.id) || ('MANUAL-' + name), agent: (item && item.agent) || 'A08',
      api_name: (item && item.api_name) || name, env_key: name,
      env_file: 'company/secrets/' + name + '.env', preview: preview, ts: new Date().toISOString()
    });
  });

  L.writeJSON(CRED_REQUESTS, st);
  L.appendEvent({
    agent: 'founder', task: null, type: 'credentials-applied', tool: 'apply-env.js',
    summary: 'Fundador aplicou via .env local: ' + applied.map(function (a) { return a.name + ' (' + a.preview + ')'; }).join(', ') || '(nenhuma chave nova encontrada)',
    model: 'human', effort: 'n/a'
  });

  if (!applied.length) { console.log('nenhuma chave nova encontrada em company/secrets/.env (ja aplicadas antes, ou placeholder ainda nao preenchido)'); return; }
  console.log('aplicado(s):');
  applied.forEach(function (a) { console.log('  ' + a.name + ' -> ' + a.preview); });
  console.log('pronto -- scripts/model-router.js e scripts/generate-image.js ja podem usar.');
}

main();
