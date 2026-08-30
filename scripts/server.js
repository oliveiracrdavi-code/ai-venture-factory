#!/usr/bin/env node
'use strict';
/**
 * server.js - servidor LOCAL do dashboard da AI Venture Factory.
 *
 *   node scripts/server.js            -> http://127.0.0.1:8080
 *   node scripts/server.js 8090       -> porta alternativa
 *
 * Seguranca:
 *  - Escuta APENAS em 127.0.0.1 (localhost). Nunca 0.0.0.0.
 *  - GET: serve SOMENTE a allowlist abaixo. Todo o resto -> 403.
 *  - POST: apenas /api/task e /api/tick (localhost), payload sanitizado.
 *  - Protecao contra path traversal (resolve real + verifica prefixo).
 */
var http = require('http');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var L = require('./avf-lib');

var ROOT = path.resolve(__dirname, '..');
var HOST = '127.0.0.1';
var PORT = parseInt(process.argv[2], 10) || 8080;

var DIR_ROUTES = [
  { prefix: '/dashboard/', base: path.join(ROOT, 'dashboard') },
  // rotas raiz -> dashboard/ (index.html usa caminhos relativos; funciona local e hospedado)
  { prefix: '/components/', base: path.join(ROOT, 'dashboard', 'components') },
  { prefix: '/sprites/', base: path.join(ROOT, 'dashboard', 'sprites') },
  { prefix: '/icons/', base: path.join(ROOT, 'dashboard', 'icons') },
  { prefix: '/company/state/', base: path.join(ROOT, 'company', 'state') },
  { prefix: '/company/metrics/', base: path.join(ROOT, 'company', 'metrics') },
  { prefix: '/company/logs/chats/', base: path.join(ROOT, 'company', 'logs', 'chats') },
  { prefix: '/company/projects/', base: path.join(ROOT, 'company', 'projects') },
];
var FILE_ROUTES = {
  '/': path.join(ROOT, 'dashboard', 'index.html'),
  '/index.html': path.join(ROOT, 'dashboard', 'index.html'),
  '/styles.css': path.join(ROOT, 'dashboard', 'styles.css'),
  '/app.js': path.join(ROOT, 'dashboard', 'app.js'),
  '/company/logs/events.jsonl': path.join(ROOT, 'company', 'logs', 'events.jsonl'),
  '/company/marketing/posts.jsonl': path.join(ROOT, 'company', 'marketing', 'posts.jsonl'),
};

var MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jsonl': 'application/x-ndjson; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function send(res, code, body, type) {
  res.writeHead(code, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}
function sendJson(res, code, obj) { send(res, code, JSON.stringify(obj), 'application/json; charset=utf-8'); }

function within(base, target) {
  var rel = path.relative(base, target);
  return rel === '' || (rel.indexOf('..') !== 0 && !path.isAbsolute(rel));
}
function resolveTarget(urlPath) {
  if (Object.prototype.hasOwnProperty.call(FILE_ROUTES, urlPath)) return FILE_ROUTES[urlPath];
  for (var i = 0; i < DIR_ROUTES.length; i++) {
    var r = DIR_ROUTES[i];
    if (urlPath.indexOf(r.prefix) === 0) {
      var abs = path.resolve(r.base, urlPath.slice(r.prefix.length));
      return within(r.base, abs) ? abs : null;
    }
  }
  return null;
}

// --- POST /api/task : cria company/tasks/TASK-XXXX.md (priority 99) -------
function apiCreateTask(body, res) {
  var data = {};
  try { data = JSON.parse(body || '{}'); } catch (_) { return sendJson(res, 400, { error: 'json invalido' }); }
  var agent = String(data.agent || '').trim().toUpperCase();
  var input = String(data.input || '').trim();
  if (!/^A\d{2}$/.test(agent)) return sendJson(res, 400, { error: 'agent deve ser A01..A49' });
  if (!input) return sendJson(res, 400, { error: 'input vazio' });
  if (input.length > 4000) input = input.slice(0, 4000);
  // sanitiza: sem quebra do frontmatter, sem secrets
  input = L.maskSecrets(input).replace(/\r/g, '').replace(/^---\s*$/gm, '- - -');

  var id = L.nextTaskId();
  var today = new Date().toISOString().slice(0, 10);
  var md = [
    '---', 'id: ' + id, 'agent: ' + agent, 'status: queued', 'priority: 99',
    'gate: G0', 'project: app-001', 'depends_on: []',
    'created: ' + today, 'updated: ' + today, '---', '',
    '# ' + id + ' - instrucao humana direta para ' + agent, '',
    '## Objetivo', 'Instrucao enviada pelo fundador via dashboard (prioridade maxima).', '',
    '## Input', input, '',
    '## Criterio de aceite',
    '- [ ] atender a instrucao acima',
    '- [ ] acao registrada em company/logs/events.jsonl (com model e effort)', '',
  ].join('\n');
  try { fs.writeFileSync(path.join(L.P.tasksDir, id + '.md'), md); }
  catch (e) { return sendJson(res, 500, { error: 'falha ao gravar TASK' }); }

  L.appendEvent({
    agent: agent, task: id, type: 'human-instruction', tool: 'dashboard',
    summary: 'instrucao humana: ' + input.slice(0, 160), model: 'human', effort: 'n/a',
  });
  sendJson(res, 200, { ok: true, task: id });
}

// --- POST /api/tick : roda o orchestrator (sem shell) --------------------
function apiTick(res) {
  var r = cp.spawnSync(process.execPath, [path.join(__dirname, 'orchestrator.js'), 'tick'], {
    cwd: ROOT, timeout: 20000, encoding: 'utf8',
  });
  sendJson(res, 200, {
    ok: r.status === 0,
    stdout: (r.stdout || '').slice(-6000),
    stderr: (r.stderr || '').slice(-2000),
  });
}

// ---------------------------------------------------------------------------
// Chatbot humano
// ---------------------------------------------------------------------------
var HUMAN_CHAT = path.join(L.P.logsDir, 'human-chat.jsonl');
var ANN_DIR = path.join(ROOT, 'company', 'announcements');
var APPROVALS = path.join(L.P.stateDir, 'approvals.json');

function appendHumanChat(msg) {
  try {
    fs.mkdirSync(L.P.logsDir, { recursive: true });
    fs.appendFileSync(HUMAN_CHAT, JSON.stringify(L.maskDeep(msg)) + '\n');
  } catch (_) {}
}

/** roteia o texto: menção AXX -> aquele agente; senão A08 (chief-of-staff). */
function routeAgent(text) {
  var m = String(text).toUpperCase().match(/\bA([0-4]\d)\b/);
  if (m) {
    var n = Number(m[1]);
    if (n >= 1 && n <= 49) return 'A' + m[1];
  }
  return 'A08';
}

function writeTask(agent, input, kind) {
  var id = L.nextTaskId();
  var today = new Date().toISOString().slice(0, 10);
  var safe = L.maskSecrets(String(input)).replace(/\r/g, '').replace(/^---\s*$/gm, '- - -').slice(0, 4000);
  var md = [
    '---', 'id: ' + id, 'agent: ' + agent, 'status: queued', 'priority: 99',
    'gate: G0', 'project: app-001', 'depends_on: []',
    'created: ' + today, 'updated: ' + today, '---', '',
    '# ' + id + ' - ' + (kind || 'instrucao humana') + ' para ' + agent, '',
    '## Objetivo', 'Mensagem do fundador via dashboard (prioridade maxima).', '',
    '## Input', safe, '',
    '## Criterio de aceite',
    '- [ ] responder/atender a mensagem acima',
    '- [ ] registrar a resposta em company/logs/human-chat.jsonl (from: <agente>, to: human)',
    '- [ ] acao registrada em company/logs/events.jsonl (com model e effort)', '',
  ].join('\n');
  fs.writeFileSync(path.join(L.P.tasksDir, id + '.md'), md);
  return id;
}

// POST /api/human-message  { text }
function apiHumanMessage(body, res) {
  var data = {};
  try { data = JSON.parse(body || '{}'); } catch (_) { return sendJson(res, 400, { error: 'json invalido' }); }
  var text = String(data.text || '').trim();
  if (!text) return sendJson(res, 400, { error: 'texto vazio' });
  if (text.length > 8000) text = text.slice(0, 8000);

  var isAnn = /^\s*(📢|\[?an[uú]ncio\]?[:\s])/i.test(text);
  appendHumanChat({ ts: new Date().toISOString(), from: 'human', to: isAnn ? 'todos' : routeAgent(text), content: text, task_ref: null });

  if (isAnn) {
    fs.mkdirSync(ANN_DIR, { recursive: true });
    var day = new Date().toISOString().slice(0, 10);
    var file = path.join(ANN_DIR, day + '.md');
    var line = '- ' + new Date().toISOString() + ' — ' + L.maskSecrets(text.replace(/^\s*📢\s*/, '')) + '\n';
    if (!fs.existsSync(file)) fs.writeFileSync(file, '# Anuncios — ' + day + '\n\n');
    fs.appendFileSync(file, line);
    L.appendEvent({ agent: 'founder', task: null, type: 'announcement', tool: 'dashboard',
      summary: text.slice(0, 180), model: 'human', effort: 'n/a' });
    appendHumanChat({ ts: new Date().toISOString(), from: 'system', to: 'human', type: 'system',
      content: 'Anuncio registrado em company/announcements/' + day + '.md — todos os agentes leem no proximo tick.' });
    return sendJson(res, 200, { ok: true, kind: 'announcement', file: 'company/announcements/' + day + '.md' });
  }

  var agent = routeAgent(text);
  var id;
  try { id = writeTask(agent, text, 'mensagem humana'); }
  catch (e) { return sendJson(res, 500, { error: 'falha ao gravar TASK' }); }

  L.appendEvent({ agent: agent, task: id, type: 'human-instruction', tool: 'dashboard',
    summary: 'mensagem humana: ' + text.slice(0, 160), model: 'human', effort: 'n/a' });
  appendHumanChat({ ts: new Date().toISOString(), from: 'system', to: 'human', type: 'system',
    content: 'Roteado para ' + agent + ' como ' + id + ' (priority 99). A resposta aparece aqui quando o agente processar.', task_ref: id });

  cp.spawnSync(process.execPath, [path.join(__dirname, 'orchestrator.js'), 'tick'], { cwd: ROOT, timeout: 20000 });
  sendJson(res, 200, { ok: true, kind: 'message', agent: agent, task: id });
}

// POST /api/approve  { id, action: approve|deny }
function apiApprove(body, res) {
  var data = {};
  try { data = JSON.parse(body || '{}'); } catch (_) { return sendJson(res, 400, { error: 'json invalido' }); }
  var id = String(data.id || '').slice(0, 64);
  var action = data.action === 'approve' ? 'approve' : 'deny';
  if (!id) return sendJson(res, 400, { error: 'id vazio' });

  var st = L.readJSON(APPROVALS, { pending: [], history: [] });
  if (!st.pending) st.pending = [];
  if (!st.history) st.history = [];
  var item = null;
  st.pending = st.pending.filter(function (p) { if (p.id === id) { item = p; return false; } return true; });
  st.history.push({ id: id, action: action, ts: new Date().toISOString(), request: item ? item.request : null, agent: item ? item.agent : null });
  L.writeJSON(APPROVALS, st);

  L.appendEvent({ agent: (item && item.agent) || 'founder', task: (item && item.task) || null,
    type: 'human-approval', tool: 'dashboard',
    summary: action.toUpperCase() + ' — ' + (item ? item.request : id), model: 'human', effort: 'n/a' });
  appendHumanChat({ ts: new Date().toISOString(), from: 'human', to: (item && item.agent) || 'todos',
    content: (action === 'approve' ? 'APROVADO' : 'NEGADO') + ': ' + (item ? item.request : id), task_ref: item && item.task });
  sendJson(res, 200, { ok: true, id: id, action: action });
}

// POST /api/agent-action { agent, action }
function apiAgentAction(body, res) {
  var data = {};
  try { data = JSON.parse(body || '{}'); } catch (_) { return sendJson(res, 400, { error: 'json invalido' }); }
  var agent = String(data.agent || '').toUpperCase();
  var action = String(data.action || '').slice(0, 200);
  if (!/^A\d{2}$/.test(agent) || !action) return sendJson(res, 400, { error: 'agent/action invalido' });
  var id;
  try { id = writeTask('A08', 'Pedido do fundador sobre ' + agent + ': ' + action + '.', 'acao de coordenacao'); }
  catch (e) { return sendJson(res, 500, { error: 'falha ao gravar TASK' }); }
  L.appendEvent({ agent: 'A08', task: id, type: 'human-instruction', tool: 'dashboard',
    summary: action + ' (' + agent + ')', model: 'human', effort: 'n/a' });
  sendJson(res, 200, { ok: true, task: id });
}

var server = http.createServer(function (req, res) {
  var urlPath;
  try { urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]); }
  catch (_) { return send(res, 400, 'bad request'); }

  if (urlPath.indexOf('\0') !== -1 || urlPath.indexOf('..') !== -1) {
    return send(res, 403, '403 Forbidden (path)');
  }

  if (req.method === 'POST') {
    var POST_ROUTES = ['/api/task', '/api/tick', '/api/human-message', '/api/approve', '/api/agent-action'];
    if (POST_ROUTES.indexOf(urlPath) === -1) return send(res, 403, '403 Forbidden');
    var chunks = '';
    req.on('data', function (c) { chunks += c; if (chunks.length > 20000) req.destroy(); });
    req.on('end', function () {
      if (urlPath === '/api/task') return apiCreateTask(chunks, res);
      if (urlPath === '/api/human-message') return apiHumanMessage(chunks, res);
      if (urlPath === '/api/approve') return apiApprove(chunks, res);
      if (urlPath === '/api/agent-action') return apiAgentAction(chunks, res);
      return apiTick(res);
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method not allowed');

  var target = resolveTarget(urlPath);
  if (!target) return send(res, 403, '403 Forbidden: ' + urlPath + ' nao esta na allowlist do servidor local');

  fs.stat(target, function (err, st) {
    if (err || !st.isFile()) return send(res, 404, '404 Not Found: ' + urlPath);
    fs.readFile(target, function (e2, buf) {
      if (e2) return send(res, 500, '500');
      send(res, 200, buf, MIME[path.extname(target).toLowerCase()] || 'application/octet-stream');
    });
  });
});

server.listen(PORT, HOST, function () {
  console.log('AI Venture Factory dashboard server');
  console.log('  http://' + HOST + ':' + PORT + '  (LOCALHOST ONLY)');
  console.log('  GET allowlist: / /index.html /dashboard/** /company/state/** /company/metrics/**');
  console.log('                 /company/logs/events.jsonl /company/marketing/posts.jsonl');
  console.log('  POST: /api/task (cria TASK priority 99)  /api/tick (roda orchestrator)');
  console.log('  tudo o mais -> 403');
});
