#!/usr/bin/env node
'use strict';
/**
 * auto-worker.js -- fallback acionado por DETECCAO REAL de limite (nao mais
 * heuristica de "task parada"). Pra cada TASK status=running, tenta
 * `claude -p` de verdade (scripts/claude-headless.js); so escala pro xKiro
 * quando a saida do proprio CLI bate com a assinatura real de limite
 * ("usage limit", "out of extra usage" etc). Qualquer outra falha (rede,
 * claude nao configurado) NAO aciona fallback -- fica so registrada.
 *
 *   node scripts/auto-worker.js       -- roda uma vez (chamado a cada tick da VM)
 *
 * Seguranca:
 *  - So mexe em TASK com status=running (nunca cria trabalho novo sozinho).
 *  - So marca status=review (nunca done) -- alguem tem que olhar antes de
 *    virar final, mesma logica do resto do pipeline.
 *  - Todo rascunho marcado com o motivo exato (via: claude | xkiro-fallback).
 *  - Publica pedido/resultado no Chat Geral (regra de todo agente).
 *  - Respeita o interruptor liga/desliga da empresa.
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');
var claudeOrFallback = require('./claude-headless').runWithRealFallback;
var genImage = require('./generate-image').generateImage;

function logChat(from, to, content, taskRef) {
  try {
    var chatsDir = path.join(L.P.logsDir, 'chats');
    fs.mkdirSync(chatsDir, { recursive: true });
    var rec = { ts: new Date().toISOString(), from: from, to: to, content: L.maskSecrets(content), task_ref: taskRef || null };
    fs.appendFileSync(path.join(chatsDir, from + '.jsonl'), JSON.stringify(rec) + '\n');
  } catch (_) {}
}

function looksLikeImageRequest(text) {
  return /\bimagem\b|\bimage\b|\bthumbnail\b|\bhero\b|\bilustra[cç][aã]o\b/i.test(text || '');
}

function main() {
  var power = L.readJSON(path.join(L.P.stateDir, 'company-power.json'), { on: true });
  if (power && power.on === false) {
    console.log('auto-worker: empresa desligada, nao faz nada.');
    return Promise.resolve();
  }

  var tasks = L.readTasks();
  var running = tasks.filter(function (t) { return t.status === 'running'; });

  if (!running.length) {
    console.log('auto-worker: nenhuma TASK running. Nada a fazer.');
    return Promise.resolve();
  }

  console.log('auto-worker: verificando ' + running.length + ' TASK(s) running -- tenta Claude real primeiro, so cai pro xKiro se detectar limite de verdade.');

  return running.reduce(function (chain, t) {
    return chain.then(function () { return processOne(t); });
  }, Promise.resolve());
}

function processOne(t) {
  var agent = t.agent || 'A08';
  var prompt = 'Voce e o agente ' + agent + ' da AI Venture Factory. TASK ' + t.id + ':\n\n' +
    t.body.slice(0, 4000) +
    '\n\nProduza um rascunho direto do proximo passo ou resultado parcial. Sem enrolar.';

  if (looksLikeImageRequest(t.body)) {
    logChat(agent, 'A44', 'TASK ' + t.id + ' precisa de imagem -- acionando gerador', t.id);
    return genImage(agent, ('imagem de apoio para ' + t.id + ': ' + t.body.slice(0, 200)).replace(/\s+/g, ' '), 'flux', t.id)
      .then(function (r) { return finish(t, agent, r.ok ? { ok: true, text: 'Imagem gerada: ' + r.path + ' (via ' + r.provider + ')', via: r.provider } : { ok: false, error: r.error, via: 'image-gen' }); });
  }

  return claudeOrFallback(agent, prompt).then(function (r) { return finish(t, agent, r); });
}

function finish(t, agent, r) {
  if (!r.ok) {
    var motivo = r.reason || r.error || 'falha desconhecida';
    logChat('auto-worker', agent, 'TASK ' + t.id + ' nao avancou (' + (r.via || 'erro') + '): ' + motivo, t.id);
    L.appendEvent({ agent: agent, task: t.id, type: 'auto-worker-skip', tool: 'auto-worker.js', summary: (r.via || 'erro') + ': ' + motivo, model: 'n/a', effort: 'n/a' });
    return;
  }
  var viaLabel = r.via === 'xkiro-fallback' ? 'FALLBACK AUTOMATICO — limite do Claude detectado, usado xKiro'
    : r.via === 'claude' ? 'Claude (headless, nao-interativo)' : ('gerador de imagem — ' + r.via);
  L.appendTaskNote(t, '**[' + viaLabel + ', requer revisao]**\n\n' + r.text);
  L.writeTaskField(t, { status: 'review' });
  logChat('auto-worker', agent, 'TASK ' + t.id + ' avancou via ' + (r.via || '?') + ' -- status = review', t.id);
  L.appendEvent({ agent: agent, task: t.id, type: 'auto-worker-draft', tool: 'auto-worker.js', summary: 'rascunho via ' + (r.via || '?') + ', status=review', model: r.model || r.via || 'n/a', effort: 'n/a' });
}

if (require.main === module) {
  main().then(function () { process.exit(0); }).catch(function (e) { console.error(String(e && e.message || e)); process.exit(1); });
}

module.exports = { main: main };
