#!/usr/bin/env node
'use strict';
/**
 * agent-chat-post.js — TODA comunicacao entre agentes (pedido, resposta,
 * raciocinio relevante, "estou fazendo X") passa por aqui, gravando em
 * company/logs/chats/<from>.jsonl -- o mesmo arquivo que alimenta a aba
 * "Chat geral" do dashboard (snapshot.js mescla todos e mostra ao fundador
 * como espectador). Regra fixada 2026-08-30: nenhum agente troca informacao
 * "por fora" -- se aconteceu, aparece aqui.
 *
 *   node scripts/agent-chat-post.js <de> <para> "<mensagem>" [task_ref]
 *
 * Exemplo (A44 pede imagem pro gerador, que responde):
 *   node scripts/agent-chat-post.js A44 image-gen "preciso de um hero 1080x1080 para o post do app-001, estilo flat, cor de marca" TASK-0012
 *   node scripts/agent-chat-post.js image-gen A44 "gerado via pollinations/flux: https://media.pollinations.ai/abc123" TASK-0012
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

function main() {
  var args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('uso: node scripts/agent-chat-post.js <de> <para> "<mensagem>" [task_ref]');
    process.exit(1);
  }
  var from = String(args[0]).toUpperCase();
  var to = String(args[1]).toUpperCase();
  var content = L.maskSecrets(args[2]);
  var taskRef = args[3] || null;

  var chatsDir = path.join(L.P.logsDir, 'chats');
  fs.mkdirSync(chatsDir, { recursive: true });
  var file = path.join(chatsDir, from + '.jsonl');
  var rec = { ts: new Date().toISOString(), from: from, to: to, content: content, task_ref: taskRef };
  fs.appendFileSync(file, JSON.stringify(rec) + '\n');

  console.log('registrado em company/logs/chats/' + from + '.jsonl (aparece no Chat geral apos o proximo snapshot)');
}

main();
