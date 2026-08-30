#!/usr/bin/env node
'use strict';
/**
 * request-credential.js — um agente pede uma API/credencial que precisa pra
 * uma tarefa. Antes de pedir, o agente deve ter pesquisado se existe uma
 * alternativa gratuita/free-tier (regra em company/memory/padroes.md).
 * O pedido aparece na aba "Conexões" do dashboard com tutorial pro fundador
 * preencher a chave. O valor NUNCA passa por aqui nem por chat/log.
 *
 *   node scripts/request-credential.js <agente> "<nome_da_api>" "<motivo>" ["<url_cadastro>"] ["<nota_free_tier>"] [task_id]
 *
 * Exemplo:
 *   node scripts/request-credential.js A24 "Resend" "enviar e-mail transacional de recibo" \
 *     "https://resend.com/docs/dashboard/api-keys/introduction" "gratis ate 3000 emails/mes" TASK-0012
 */
var path = require('path');
var L = require('./avf-lib');

var CRED_REQUESTS = path.join(L.P.stateDir, 'credential-requests.json');

function main() {
  var args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('uso: node scripts/request-credential.js <agente> "<nome_da_api>" "<motivo>" ["<url>"] ["<nota_free_tier>"] [task_id]');
    process.exit(1);
  }
  var agent = String(args[0]).toUpperCase();
  var api_name = L.maskSecrets(args[1]);
  var why = L.maskSecrets(args[2]);
  var signup_url = args[3] || '';
  var free_tier_note = args[4] ? L.maskSecrets(args[4]) : '';
  var task = args[5] || null;

  if (!/^A\d{2}$/.test(agent)) { console.error('agente invalido: ' + agent); process.exit(2); }

  var id = 'CRQ-' + Date.now().toString(36).toUpperCase();
  var envKey = api_name.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

  var st = L.readJSON(CRED_REQUESTS, { pending: [], filled: [] });
  if (!st.pending) st.pending = [];
  st.pending.push({ id: id, agent: agent, api_name: api_name, env_key: envKey, why: why, signup_url: signup_url, free_tier_note: free_tier_note, task: task, ts: new Date().toISOString() });
  L.writeJSON(CRED_REQUESTS, st);

  L.appendEvent({
    agent: agent, task: task, type: 'credential-requested', tool: 'request-credential.js',
    summary: agent + ' pediu credencial "' + api_name + '" (' + (why || '').slice(0, 80) + ')',
    model: 'claude-sonnet-5', effort: 'medium'
  });

  console.log(id + ' — pedido de "' + api_name + '" criado. Aparece na aba Conexões do dashboard.');
}

main();
