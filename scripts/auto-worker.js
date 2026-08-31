#!/usr/bin/env node
'use strict';
/**
 * auto-worker.js -- fallback REAL de "Claude bateu o limite / nenhuma sessao
 * viva no momento". Nao existe sinal de "limite do Claude atingido" que um
 * script consiga captar (isso e' a plataforma travando a sessao, nao um erro
 * de API) -- entao o proxy usado e': TASK com status=running ha muito tempo
 * sem NENHUM evento novo (nenhuma sessao do Claude esta mexendo nela).
 * Quando isso acontece, processa via xKiro (scripts/model-router.js) no
 * lugar, deixando um rascunho pra revisao -- NUNCA marca como "done" sozinho.
 *
 *   node scripts/auto-worker.js            -- roda uma vez (cron/timer chama assim)
 *   node scripts/auto-worker.js --minutes 20   -- ajusta o limiar de "parado"
 *
 * Seguranca:
 *  - So mexe em TASK com status=running (nunca cria trabalho novo sozinho).
 *  - So marca status=review (nunca done) -- alguem (voce ou eu, quando
 *    voltar) tem que olhar antes de virar final. Mesma logica do resto do
 *    pipeline (CEO so aprova o que passou por gate).
 *  - Todo rascunho fica marcado claramente como skill_fallback: xkiro-auto-worker.
 *  - Publica pedido/resultado no Chat Geral (mesma regra de todo agente).
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');
var router = require('./model-router');
var genImage = require('./generate-image').generateImage;

var STALE_MINUTES_DEFAULT = 15;

function logChat(from, to, content, taskRef) {
  try {
    var chatsDir = path.join(L.P.logsDir, 'chats');
    fs.mkdirSync(chatsDir, { recursive: true });
    var rec = { ts: new Date().toISOString(), from: from, to: to, content: L.maskSecrets(content), task_ref: taskRef || null };
    fs.appendFileSync(path.join(chatsDir, from + '.jsonl'), JSON.stringify(rec) + '\n');
  } catch (_) {}
}

function lastEventTs(events, taskId, agent) {
  var last = null;
  events.forEach(function (e) {
    if (e && (e.task === taskId || e.agent === agent)) {
      if (!last || String(e.ts) > String(last)) last = e.ts;
    }
  });
  return last;
}

function minutesSince(iso) {
  if (!iso) return Infinity;
  var d = new Date(iso).getTime();
  if (isNaN(d)) return Infinity;
  return (Date.now() - d) / 60000;
}

function looksLikeImageRequest(text) {
  return /\bimagem\b|\bimage\b|\bthumbnail\b|\bhero\b|\bilustra[cç][aã]o\b/i.test(text || '');
}

function main() {
  var args = process.argv.slice(2);
  var mIdx = args.indexOf('--minutes');
  var staleMinutes = mIdx !== -1 && args[mIdx + 1] ? Number(args[mIdx + 1]) : STALE_MINUTES_DEFAULT;

  var power = L.readJSON(path.join(L.P.stateDir, 'company-power.json'), { on: true });
  if (power && power.on === false) {
    console.log('auto-worker: empresa desligada, nao faz nada.');
    return Promise.resolve();
  }

  var tasks = L.readTasks();
  var events = L.readEvents();
  var running = tasks.filter(function (t) { return t.status === 'running'; });
  var stale = running.filter(function (t) { return minutesSince(lastEventTs(events, t.id, t.agent)) >= staleMinutes; });

  if (!stale.length) {
    console.log('auto-worker: nenhuma TASK parada ha mais de ' + staleMinutes + 'min. Nada a fazer.');
    return Promise.resolve();
  }

  console.log('auto-worker: ' + stale.length + ' TASK(s) parada(s) -- acionando fallback xKiro/Pollinations.');

  return stale.reduce(function (chain, t) {
    return chain.then(function () { return processOne(t); });
  }, Promise.resolve());
}

function processOne(t) {
  var agent = t.agent || 'A08';
  var prompt = 'Voce e o agente ' + agent + ' da AI Venture Factory. Uma TASK ficou parada ' +
    '(nenhuma sessao do Claude disponivel no momento -- fallback automatico via modelo gratuito). ' +
    'Baseado no conteudo abaixo, produza um rascunho do proximo passo ou resultado parcial. ' +
    'Seja direto, sem enrolar. Deixe claro que e um rascunho pra revisao humana/Claude depois.\n\n' +
    '--- TASK ' + t.id + ' ---\n' + t.body.slice(0, 4000);

  logChat(agent, 'auto-worker', 'TASK ' + t.id + ' parada ha tempo -- pedindo rascunho via fallback', t.id);

  var work = looksLikeImageRequest(t.body)
    ? genImage(agent, ('imagem de apoio para ' + t.id + ': ' + t.body.slice(0, 200)).replace(/\s+/g, ' '), 'flux', t.id)
      .then(function (r) { return r.ok ? { ok: true, text: 'Imagem gerada: ' + r.path + ' (via ' + r.provider + ')' } : { ok: false, error: r.error }; })
    : router.callModel(agent, [{ role: 'user', content: prompt }]);

  return work.then(function (r) {
    if (!r.ok) {
      logChat('auto-worker', agent, 'fallback tambem falhou pra ' + t.id + ': ' + r.error, t.id);
      L.appendEvent({ agent: agent, task: t.id, type: 'auto-worker-failed', tool: 'auto-worker.js', summary: r.error, model: 'n/a', effort: 'n/a', skill_fallback: 'xkiro-auto-worker' });
      return;
    }
    L.appendTaskNote(t, '**[FALLBACK AUTOMATICO — xKiro/Pollinations, requer revisao]**\n\n' + r.text);
    L.writeTaskField(t, { status: 'review' });
    logChat('auto-worker', agent, 'rascunho pronto pra ' + t.id + ' via fallback -- status = review (precisa de revisao antes de virar done)', t.id);
    L.appendEvent({ agent: agent, task: t.id, type: 'auto-worker-draft', tool: 'auto-worker.js', summary: 'rascunho via fallback, status=review', model: r.model || 'fallback', effort: 'n/a', skill_fallback: 'xkiro-auto-worker' });
  });
}

if (require.main === module) {
  main().then(function () { process.exit(0); }).catch(function (e) { console.error(String(e && e.message || e)); process.exit(1); });
}

module.exports = { main: main };
