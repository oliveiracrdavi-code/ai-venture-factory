#!/usr/bin/env node
'use strict';
/**
 * claude-headless.js -- deteccao REAL de limite do Claude (nao heuristica de
 * "task parada"). Chama `claude -p` (modo nao-interativo do proprio CLI) e
 * le a saida de verdade. So aciona o fallback quando o texto bate com as
 * assinaturas REAIS que o Claude Code emite quando o limite estoura --
 * confirmadas em issues do proprio repo anthropics/claude-code, nao chutadas:
 *   "usage limit", "out of extra usage", "usage_limit_reached"
 *
 * Qualquer OUTRA falha (claude nao instalado, rede, etc.) NAO aciona
 * fallback -- fica registrada como erro comum, porque o pedido do fundador
 * foi especificamente "olhar se o limite bateu ou nao", nao "qualquer falha".
 *
 * Nao existe hook/API que exponha "quanto do limite ja foi usado" antes de
 * tentar (confirmado: issue anthropics/claude-code#38380, ainda em aberto)
 * -- entao a unica forma real e' tentar e ler a resposta.
 */
var cp = require('child_process');
var L = require('./avf-lib');
var router = require('./model-router');

var LIMIT_SIGNATURES = [
  /usage limit/i,
  /out of extra usage/i,
  /usage_limit_reached/i,
  /limit will reset at/i
];

function isLimitSignal(text) {
  return LIMIT_SIGNATURES.some(function (re) { return re.test(text || ''); });
}

/**
 * tryClaude(prompt, timeoutMs) -> Promise<{ok, text, raw}>
 * Chama `claude -p "<prompt>"` sem ferramentas (so texto), com timeout.
 */
function tryClaude(prompt, timeoutMs) {
  return new Promise(function (resolve) {
    var child;
    try {
      child = cp.spawn('claude', ['-p', prompt], { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      resolve({ ok: false, spawnError: true, text: String(e.message || e) });
      return;
    }
    var out = '', err = '';
    var done = false;
    var timer = setTimeout(function () {
      if (done) return; done = true;
      try { child.kill('SIGKILL'); } catch (_) {}
      resolve({ ok: false, timedOut: true, text: out + err });
    }, timeoutMs || 45000);

    child.stdout.on('data', function (d) { out += d.toString(); });
    child.stderr.on('data', function (d) { err += d.toString(); });
    child.on('error', function (e) {
      if (done) return; done = true; clearTimeout(timer);
      resolve({ ok: false, spawnError: true, text: String(e.message || e) });
    });
    child.on('close', function (code) {
      if (done) return; done = true; clearTimeout(timer);
      resolve({ ok: code === 0 && out.trim().length > 0, text: out, err: err, code: code });
    });
  });
}

/**
 * runWithRealFallback(agentId, prompt) -> Promise<{ok, text, via, reason}>
 * via: 'claude' | 'xkiro-fallback' | none
 * reason (quando via=xkiro-fallback): 'limite-detectado' | so aciona nisso.
 * Qualquer outra falha do claude (nao-limite) NAO aciona xKiro -- fica
 * {ok:false, via:'claude-error', reason:'<motivo>'} pra revisao humana.
 */
function runWithRealFallback(agentId, prompt) {
  return tryClaude(prompt, 45000).then(function (r) {
    if (r.ok) return { ok: true, text: r.text, via: 'claude' };

    var combined = (r.text || '') + ' ' + (r.err || '');
    if (isLimitSignal(combined)) {
      L.appendEvent({
        agent: agentId, task: null, type: 'claude-limit-detected', tool: 'claude-headless.js',
        summary: 'limite real do Claude detectado (assinatura confirmada na saida do CLI) -- acionando fallback xKiro',
        model: 'n/a', effort: 'n/a'
      });
      return router.callModel(agentId, [{ role: 'user', content: prompt }]).then(function (fb) {
        return fb.ok
          ? { ok: true, text: fb.text, via: 'xkiro-fallback', reason: 'limite-detectado', model: fb.model }
          : { ok: false, via: 'xkiro-fallback', reason: 'limite-detectado-mas-fallback-tambem-falhou', error: fb.error };
      });
    }

    // falha que NAO e limite (claude nao instalado, rede, etc.) -- nao aciona
    // fallback, so registra. Pedido explicito: fallback e' so pra limite real.
    var reason = r.spawnError ? 'claude-cli-indisponivel' : r.timedOut ? 'timeout' : 'erro-desconhecido';
    return { ok: false, via: 'claude-error', reason: reason, text: combined.slice(0, 300) };
  });
}

if (require.main === module) {
  var agentId = String(process.argv[2] || '').toUpperCase();
  var prompt = process.argv[3];
  if (!agentId || !prompt) { console.log('uso: node scripts/claude-headless.js <agente> "<prompt>"'); process.exit(1); }
  runWithRealFallback(agentId, prompt).then(function (r) {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 2);
  });
}

module.exports = { runWithRealFallback: runWithRealFallback, isLimitSignal: isLimitSignal, tryClaude: tryClaude };
