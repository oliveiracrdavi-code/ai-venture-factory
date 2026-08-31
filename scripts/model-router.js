#!/usr/bin/env node
'use strict';
/**
 * model-router.js -- 4a camada de fallback (abaixo do fallback_pro do Anexo
 * B). So entra em uso quando Claude (principal + fallback_pro) esta
 * indisponivel. Chama a xKiro (gateway OpenAI-compativel,
 * https://docs.xkiro.com/) com o modelo/temperatura ideais por agente,
 * definidos em company/org/model-router-fallback.md.
 *
 * A chave NUNCA fica neste arquivo nem em nenhum outro do repo -- vem de
 * company/secrets/XKIRO_API_KEY.env (preenchida via aba Conexoes do
 * dashboard, nunca colada em chat/log).
 *
 * Uso como CLI (teste manual):
 *   node scripts/model-router.js A44 "escreva uma frase de teste"
 *
 * Uso como modulo:
 *   var router = require('./model-router');
 *   var r = await router.callModel('A44', [{role:'user', content:'...'}]);
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

var ROOT = path.resolve(__dirname, '..');
var SECRETS_DIR = path.join(ROOT, 'company', 'secrets');
var XKIRO_BASE = 'https://api.xkiro.com/v1';

// mapa por agente -> { wanted: nome aproximado do modelo (casado contra
// GET /v1/models em tempo real), temperature, top_p, frequency_penalty,
// presence_penalty. Fonte do raciocinio: company/org/model-router-fallback.md
var AGENT_PARAMS = {
  A01: { wanted: 'deepseek v4 pro', temperature: 0.4, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A02: { wanted: 'mistral medium 3.5', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A03: { wanted: 'mistral medium 3.5', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A04: { wanted: 'mistral medium 3.5', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A05: { wanted: 'deepseek v4 pro', temperature: 0.4, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A06: { wanted: 'mistral medium 3.5', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A07: { wanted: 'mistral large 3', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A08: { wanted: 'minimax m2.5 highspeed', temperature: 0.3, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0 },
  A09: { wanted: 'mistral medium 3.5', temperature: 0.3, top_p: 0.9, frequency_penalty: 0, presence_penalty: 0 },
  A10: { wanted: 'mistral medium 3.5', temperature: 0.3, top_p: 0.9, frequency_penalty: 0, presence_penalty: 0 },
  A11: { wanted: 'mistral medium 3.5', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.2 },
  A12: { wanted: 'mistral medium 3.5', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.2 },
  A13: { wanted: 'qwen3 vl plus', temperature: 0.4, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.2 },
  A14: { wanted: 'qwen3 vl plus', temperature: 0.4, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.2 },
  A15: { wanted: 'mistral medium 3.5', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.2 },
  A16: { wanted: 'mistral medium 3.5', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.2 },
  A17: { wanted: 'devstral 2', temperature: 0.3, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A18: { wanted: 'qwen3 coder plus', temperature: 0.25, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0 },
  A19: { wanted: 'qwen3 coder plus', temperature: 0.25, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0 },
  A20: { wanted: 'qwen3 coder plus', temperature: 0.25, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0 },
  A21: { wanted: 'qwen3 coder plus', temperature: 0.25, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0 },
  A22: { wanted: 'qwen3 coder plus', temperature: 0.2, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0 },
  A23: { wanted: 'qwen3 coder plus', temperature: 0.2, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0 },
  A24: { wanted: 'codestral', temperature: 0.25, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0 },
  A25: { wanted: 'devstral 2', temperature: 0.3, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A26: { wanted: 'deepseek v4 flash', temperature: 0.3, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0 },
  A27: { wanted: 'minimax m2.7', temperature: 0.3, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A28: { wanted: 'minimax m2.7', temperature: 0.3, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A29: { wanted: 'minimax m2.7', temperature: 0.3, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 },
  A30: { wanted: 'mistral small 4', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A31: { wanted: 'deepseek v4 pro', temperature: 0.15, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A32: { wanted: 'deepseek v4 pro', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.2, presence_penalty: 0.3 },
  A33: { wanted: 'deepseek v4 pro', temperature: 0.15, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A34: { wanted: 'mistral medium 3.5', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A35: { wanted: 'mistral medium 3.5', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A36: { wanted: 'mistral medium 3.5', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A37: { wanted: 'mistral small 4', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A38: { wanted: 'ministral 3 14b', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A39: { wanted: 'ministral 3 14b', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A40: { wanted: 'mistral small 4', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A41: { wanted: 'ministral 3 14b', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A42: { wanted: 'mistral small 4', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A43: { wanted: 'mistral medium 3.5', temperature: 0.6, top_p: 0.92, frequency_penalty: 0.2, presence_penalty: 0.2 },
  A44: { wanted: 'minimax m2.7', temperature: 0.8, top_p: 0.95, frequency_penalty: 0.35, presence_penalty: 0.4 },
  A45: { wanted: 'minimax m2.7', temperature: 0.8, top_p: 0.95, frequency_penalty: 0.35, presence_penalty: 0.4 },
  A46: { wanted: 'mistral medium 3.5', temperature: 0.6, top_p: 0.92, frequency_penalty: 0.2, presence_penalty: 0.2 },
  A47: { wanted: 'qwen plus 0728', temperature: 0.5, top_p: 0.9, frequency_penalty: 0.2, presence_penalty: 0.2 },
  A48: { wanted: 'mistral medium 3.5', temperature: 0.1, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 },
  A49: { wanted: 'sensenova 6.8 flash-lite', temperature: 0.2, top_p: 0.85, frequency_penalty: 0, presence_penalty: 0 }
};

function readKey() {
  try {
    var raw = fs.readFileSync(path.join(SECRETS_DIR, 'XKIRO_API_KEY.env'), 'utf8');
    var m = raw.match(/XKIRO_API_KEY=(.+)/);
    return m ? m[1].trim() : null;
  } catch (_) { return null; }
}

var _modelsCache = null;
function listModels(key) {
  if (_modelsCache) return Promise.resolve(_modelsCache);
  return fetch(XKIRO_BASE + '/models', { headers: { Authorization: 'Bearer ' + key } })
    .then(function (r) { if (!r.ok) throw new Error('GET /models -> ' + r.status); return r.json(); })
    .then(function (j) { _modelsCache = (j && j.data) || []; return _modelsCache; });
}

function fuzzyMatch(wanted, models) {
  var w = wanted.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ');
  var best = null, bestScore = -1;
  models.forEach(function (m) {
    var id = String(m.id || '').toLowerCase();
    var score = w.reduce(function (acc, tok) { return acc + (id.indexOf(tok) !== -1 ? 1 : 0); }, 0);
    if (score > bestScore) { bestScore = score; best = m.id; }
  });
  return bestScore > 0 ? best : null;
}

/**
 * callModel(agentId, messages) -> Promise<{ok, text, model, error}>
 * Nunca lanca excecao pro chamador -- retorna {ok:false, error} pra que o
 * agente registre skill_fallback e continue (regra: nenhum agente trava por
 * integracao faltando).
 */
function callModel(agentId, messages) {
  var key = readKey();
  if (!key) return Promise.resolve({ ok: false, error: 'XKIRO_API_KEY nao configurada (ver aba Conexoes)' });
  var params = AGENT_PARAMS[agentId] || { wanted: 'mistral medium 3.5', temperature: 0.4, top_p: 0.9, frequency_penalty: 0.1, presence_penalty: 0.1 };

  return listModels(key).then(function (models) {
    var modelId = fuzzyMatch(params.wanted, models) || (models[0] && models[0].id);
    if (!modelId) throw new Error('nenhum modelo encontrado em GET /v1/models');
    return fetch(XKIRO_BASE + '/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId, messages: messages,
        temperature: params.temperature, top_p: params.top_p,
        frequency_penalty: params.frequency_penalty, presence_penalty: params.presence_penalty
      })
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('POST /chat/completions -> ' + r.status + ' ' + t.slice(0, 200)); });
      return r.json();
    }).then(function (j) {
      var text = (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
      L.appendEvent({
        agent: agentId, task: null, type: 'model-fallback-router', tool: 'xkiro',
        summary: 'fallback xKiro usado (' + modelId + ') -- Claude indisponivel no momento',
        model: modelId, effort: 'n/a'
      });
      return { ok: true, text: text, model: modelId };
    });
  }).catch(function (e) {
    return { ok: false, error: L.maskSecrets(String(e.message || e)) };
  });
}

if (require.main === module) {
  var agentId = String(process.argv[2] || '').toUpperCase();
  var prompt = process.argv[3];
  if (!agentId || !prompt) { console.log('uso: node scripts/model-router.js <agente> "<prompt>"'); process.exit(1); }
  callModel(agentId, [{ role: 'user', content: prompt }]).then(function (r) {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 2);
  });
}

module.exports = { callModel: callModel, AGENT_PARAMS: AGENT_PARAMS };
