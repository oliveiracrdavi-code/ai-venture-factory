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
  { prefix: '/company/state/', base: path.join(ROOT, 'company', 'state') },
  { prefix: '/company/metrics/', base: path.join(ROOT, 'company', 'metrics') },
  { prefix: '/company/logs/chats/', base: path.join(ROOT, 'company', 'logs', 'chats') },
  { prefix: '/company/projects/', base: path.join(ROOT, 'company', 'projects') },
];
var FILE_ROUTES = {
  '/': path.join(ROOT, 'dashboard', 'index.html'),
  '/index.html': path.join(ROOT, 'dashboard', 'index.html'),
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

var server = http.createServer(function (req, res) {
  var urlPath;
  try { urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]); }
  catch (_) { return send(res, 400, 'bad request'); }

  if (urlPath.indexOf('\0') !== -1 || urlPath.indexOf('..') !== -1) {
    return send(res, 403, '403 Forbidden (path)');
  }

  if (req.method === 'POST') {
    if (urlPath !== '/api/task' && urlPath !== '/api/tick') return send(res, 403, '403 Forbidden');
    var chunks = '';
    req.on('data', function (c) { chunks += c; if (chunks.length > 20000) req.destroy(); });
    req.on('end', function () {
      if (urlPath === '/api/task') return apiCreateTask(chunks, res);
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
