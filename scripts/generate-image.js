#!/usr/bin/env node
'use strict';
/**
 * generate-image.js -- gerador de imagem real (A44 content-producer e o
 * dono operacional; qualquer outro agente pede via Chat Geral, nunca chama
 * direto -- ver padroes.md "Chat Geral e canal unico").
 *
 * Primario: Pollinations.ai (gen.pollinations.ai, doc completa fornecida
 * pelo fundador -- alta confianca no endpoint).
 * Fallback: Gemini API nativo (Google) se Pollinations falhar.
 *
 * Nenhuma chave neste arquivo -- vem de company/secrets/POLLINATIONS_API_KEY.env
 * e company/secrets/GEMINI_API_KEY.env (aba Conexoes, nunca colada em chat).
 *
 *   node scripts/generate-image.js <de> "<prompt>" [model] [task_ref]
 *
 * Exemplo:
 *   node scripts/generate-image.js A44 "hero minimalista para app de recibo, fundo roxo escuro" flux TASK-0012
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

var ROOT = path.resolve(__dirname, '..');
var SECRETS_DIR = path.join(ROOT, 'company', 'secrets');
var ASSETS_DIR = path.join(ROOT, 'company', 'marketing', 'assets');

function readSecret(name) {
  try {
    var raw = fs.readFileSync(path.join(SECRETS_DIR, name + '.env'), 'utf8');
    var m = raw.match(new RegExp(name + '=(.+)'));
    return m ? m[1].trim() : null;
  } catch (_) { return null; }
}

function logChat(from, to, content, taskRef) {
  try {
    var chatsDir = path.join(L.P.logsDir, 'chats');
    fs.mkdirSync(chatsDir, { recursive: true });
    var rec = { ts: new Date().toISOString(), from: from, to: to, content: L.maskSecrets(content), task_ref: taskRef || null };
    fs.appendFileSync(path.join(chatsDir, from + '.jsonl'), JSON.stringify(rec) + '\n');
  } catch (_) {}
}

function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/^-+|-+$/g, ''); }

function viaPollinations(prompt, model) {
  var key = readSecret('POLLINATIONS_API_KEY');
  if (!key) return Promise.resolve({ ok: false, error: 'POLLINATIONS_API_KEY nao configurada (ver aba Conexoes)' });
  var url = 'https://gen.pollinations.ai/image/' + encodeURIComponent(prompt) + '?model=' + encodeURIComponent(model || 'flux');
  return fetch(url, { headers: { Authorization: 'Bearer ' + key } }).then(function (r) {
    if (!r.ok) return r.text().then(function (t) { throw new Error('pollinations -> ' + r.status + ' ' + t.slice(0, 200)); });
    var ct = r.headers.get('content-type') || 'image/jpeg';
    return r.arrayBuffer().then(function (buf) { return { buf: Buffer.from(buf), ct: ct, provider: 'pollinations/' + (model || 'flux') }; });
  }).then(function (r) { return { ok: true, buf: r.buf, ct: r.ct, provider: r.provider }; })
    .catch(function (e) { return { ok: false, error: L.maskSecrets(String(e.message || e)) }; });
}

function viaGemini(prompt) {
  var key = readSecret('GEMINI_API_KEY');
  if (!key) return Promise.resolve({ ok: false, error: 'GEMINI_API_KEY nao configurada (ver aba Conexoes)' });
  // padrao documentado do Gemini pra geracao de imagem (generateContent com
  // responseModalities incluindo IMAGE). Nome exato do modelo pode mudar --
  // ajustar aqui se a Google renomear.
  var model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key;
  return fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'] } })
  }).then(function (r) {
    if (!r.ok) return r.text().then(function (t) { throw new Error('gemini -> ' + r.status + ' ' + t.slice(0, 200)); });
    return r.json();
  }).then(function (j) {
    var parts = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts || [];
    var img = parts.filter(function (p) { return p.inlineData; })[0];
    if (!img) throw new Error('gemini nao retornou imagem (resposta sem inlineData)');
    return { ok: true, buf: Buffer.from(img.inlineData.data, 'base64'), ct: img.inlineData.mimeType || 'image/png', provider: 'gemini/' + model };
  }).catch(function (e) { return { ok: false, error: L.maskSecrets(String(e.message || e)) }; });
}

var EXT_BY_CT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/svg+xml': 'svg', 'image/webp': 'webp' };

/**
 * generateImage(from, prompt, model, taskRef) -> Promise<{ok, path, url, provider, error}>
 * Nunca lanca excecao -- sempre retorna {ok:false, error} em falha, pra que
 * o agente registre skill_fallback e continue.
 */
function generateImage(from, prompt, model, taskRef) {
  logChat(from, 'A44', 'pedido de imagem: "' + prompt + '"' + (model ? (' (modelo: ' + model + ')') : ''), taskRef);

  return viaPollinations(prompt, model).then(function (r) {
    if (r.ok) return r;
    logChat('A44', from, 'Pollinations falhou (' + r.error + ') -- tentando Gemini', taskRef);
    return viaGemini(prompt);
  }).then(function (r) {
    if (!r.ok) {
      logChat('A44', from, 'nao consegui gerar a imagem: ' + r.error, taskRef);
      L.appendEvent({ agent: 'A44', task: taskRef || null, type: 'image-generation-failed', tool: 'generate-image.js', summary: r.error, model: 'n/a', effort: 'n/a' });
      return { ok: false, error: r.error };
    }
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
    var ext = EXT_BY_CT[r.ct] || 'jpg';
    var fname = Date.now() + '-' + slugify(prompt) + '.' + ext;
    var fpath = path.join(ASSETS_DIR, fname);
    fs.writeFileSync(fpath, r.buf);
    var rel = 'company/marketing/assets/' + fname;
    logChat('A44', from, 'imagem gerada via ' + r.provider + ': ' + rel, taskRef);
    L.appendEvent({ agent: 'A44', task: taskRef || null, type: 'image-generated', tool: 'generate-image.js', summary: 'gerado via ' + r.provider + ' -> ' + rel, model: r.provider, effort: 'n/a' });
    return { ok: true, path: rel, provider: r.provider };
  });
}

if (require.main === module) {
  var from = String(process.argv[2] || '').toUpperCase();
  var prompt = process.argv[3];
  var model = process.argv[4];
  var taskRef = process.argv[5];
  if (!from || !prompt) { console.log('uso: node scripts/generate-image.js <de> "<prompt>" [model] [task_ref]'); process.exit(1); }
  generateImage(from, prompt, model, taskRef).then(function (r) {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 2);
  });
}

module.exports = { generateImage: generateImage };
