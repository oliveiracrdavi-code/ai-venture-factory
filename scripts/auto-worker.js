#!/usr/bin/env node
'use strict';
/**
 * auto-worker.js -- fallback acionado por DETECCAO REAL de limite, reagindo
 * na hora e sem parar de processar as TASKs enquanto o limite estiver ativo.
 *
 *   node scripts/auto-worker.js       -- roda uma vez (chamado a cada tick da VM)
 *
 * Como funciona (janela de limite, nao throttle fixo por TASK):
 *  - Sem limite conhecido ativo: tenta `claude -p` de verdade na 1a TASK da
 *    fila (scripts/claude-headless.js). Se vier a assinatura REAL de limite
 *    ("usage limit", "out of extra usage" etc), isso ja vale pro lote
 *    inteiro -- nao precisa testar TASK por TASK. Aciona xKiro NA HORA pro
 *    resto do lote, sem esperar.
 *  - Enquanto o limite estiver "ativo" (guardado em
 *    company/state/auto-worker-throttle.json), os proximos ticks NAO tentam
 *    `claude -p` de novo -- vao direto pro fallback, tick a tick, sem parar
 *    de trabalhar as TASKs.
 *  - Depois de LIMIT_WINDOW_MINUTES (default 30), tenta o Claude real de
 *    novo sozinho. Se voltou, usa Claude normal outra vez; se ainda
 *    bloqueado, detecta o mesmo sinal e estende a janela.
 *
 * IMPORTANTE (cota compartilhada): `claude -p` usa a MESMA conta/cota das
 * suas sessoes interativas (Claude Code, Claude.ai, Desktop, Cowork
 * compartilham o limite de 5h/semanal). So testa 1x por rodada (nao 1x por
 * TASK) -- o resto do lote usa o resultado desse unico teste. Geracao de
 * imagem (Pollinations/Gemini) NAO usa cota do Claude, nunca fica bloqueada
 * por isso.
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
var router = require('./model-router');
var genImage = require('./generate-image').generateImage;

var LIMIT_WINDOW_MINUTES = 30;
var STATE_FILE = path.join(L.P.stateDir, 'auto-worker-throttle.json');

function minutesSince(iso) {
  if (!iso) return Infinity;
  var d = new Date(iso).getTime();
  if (isNaN(d)) return Infinity;
  return (Date.now() - d) / 60000;
}

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

function promptFor(agent, t) {
  return 'Voce e o agente ' + agent + ' da AI Venture Factory. TASK ' + t.id + ':' +
    '\n\n' + t.body.slice(0, 4000) +
    '\n\nProduza um rascunho direto do proximo passo ou resultado parcial. Sem enrolar.';
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

  var textTasks = running.filter(function (t) { return !looksLikeImageRequest(t.body); });
  var imageTasks = running.filter(function (t) { return looksLikeImageRequest(t.body); });
  var imageChain = imageTasks.reduce(function (c, t) { return c.then(function () { return processImage(t); }); }, Promise.resolve());

  var st = L.readJSON(STATE_FILE, { limitSince: null });
  var hadStoredLimit = !!st.limitSince;
  var inWindow = hadStoredLimit && minutesSince(st.limitSince) < LIMIT_WINDOW_MINUTES;
  if (inWindow) console.log('auto-worker: janela de limite ativa (detectado ha ' + Math.round(minutesSince(st.limitSince)) + 'min) -- indo direto pro xKiro, sem testar Claude de novo.');

  var chain = textTasks.reduce(function (c, t) {
    return c.then(function () {
      var agent = t.agent || 'A08';
      var work = inWindow
        ? router.callModel(agent, [{ role: 'user', content: promptFor(agent, t) }]).then(function (fb) {
          return fb.ok ? { ok: true, text: fb.text, via: 'xkiro-fallback', reason: 'limite-ativo (janela)', model: fb.model } : { ok: false, via: 'xkiro-fallback', error: fb.error };
        })
        : claudeOrFallback(agent, promptFor(agent, t));

      return work.then(function (r) {
        if (r.via === 'xkiro-fallback' && !inWindow) {
          st.limitSince = new Date().toISOString();
          L.writeJSON(STATE_FILE, st);
          inWindow = true;
          console.log('auto-worker: LIMITE detectado agora (TASK ' + t.id + ') -- resto do lote vai direto pro fallback, sem parar.');
        }
        return finish(t, agent, r);
      });
    });
  }, Promise.resolve());

  return chain.then(function () {
    if (!inWindow && hadStoredLimit) { st.limitSince = null; L.writeJSON(STATE_FILE, st); console.log('auto-worker: limite liberado -- Claude respondeu normal de novo.'); }
    return imageChain;
  });
}

function processImage(t) {
  var agent = t.agent || 'A44';
  logChat(agent, 'A44', 'TASK ' + t.id + ' precisa de imagem -- acionando gerador', t.id);
  return genImage(agent, ('imagem de apoio para ' + t.id + ': ' + t.body.slice(0, 200)).replace(/\s+/g, ' '), 'flux', t.id)
    .then(function (r) { return finish(t, agent, r.ok ? { ok: true, text: 'Imagem gerada: ' + r.path + ' (via ' + r.provider + ')', via: r.provider } : { ok: false, error: r.error, via: 'image-gen' }); });
}

function finish(t, agent, r) {
  if (!r.ok) {
    var motivo = r.reason || r.error || 'falha desconhecida';
    logChat('auto-worker', agent, 'TASK ' + t.id + ' nao avancou (' + (r.via || 'erro') + '): ' + motivo, t.id);
    L.appendEvent({ agent: agent, task: t.id, type: 'auto-worker-skip', tool: 'auto-worker.js', summary: (r.via || 'erro') + ': ' + motivo, model: 'n/a', effort: 'n/a' });
    return;
  }
  var viaLabel = r.via === 'xkiro-fallback' ? 'FALLBACK AUTOMATICO -- limite do Claude detectado, usado xKiro'
    : r.via === 'claude' ? 'Claude (headless, nao-interativo)' : ('gerador de imagem -- ' + r.via);
  L.appendTaskNote(t, '**[' + viaLabel + ', requer revisao]**\n\n' + r.text);
  L.writeTaskField(t, { status: 'review' });
  logChat('auto-worker', agent, 'TASK ' + t.id + ' avancou via ' + (r.via || '?') + ' -- status = review', t.id);
  L.appendEvent({ agent: agent, task: t.id, type: 'auto-worker-draft', tool: 'auto-worker.js', summary: 'rascunho via ' + (r.via || '?') + ', status=review', model: r.model || r.via || 'n/a', effort: 'n/a' });
}

if (require.main === module) {
  main().then(function () { process.exit(0); }).catch(function (e) { console.error(String(e && e.message || e)); process.exit(1); });
}

module.exports = { main: main };
