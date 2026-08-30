#!/usr/bin/env node
'use strict';
/**
 * publish-state.js - prepara e (opcional) publica o painel estatico.
 *
 *   node scripts/publish-state.js            -> so atualiza docs/
 *   node scripts/publish-state.js --push     -> atualiza docs/ e da git commit+push
 *
 * O que faz:
 *  - roda snapshot (garante company/state/*.json atuais)
 *  - copia dashboard/{index.html,styles.css,app.js,sprites/} para docs/
 *  - copia o ESTADO (company/state/*.json, metrics.json, tail de events.jsonl
 *    e posts.jsonl, tunnel.txt) para docs/state/
 *  - com --push: git add docs/ company/state + commit + push (branch atual)
 *
 * docs/ e' servido de graca por GitHub Pages / Cloudflare Pages -> URL fixa,
 * somente leitura, 24/7, sem sessao nenhuma.
 */
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var L = require('./avf-lib');

var ROOT = L.ROOT;
var DOCS = path.join(ROOT, 'docs');
var DOCS_STATE = path.join(DOCS, 'state');
var PUSH = process.argv.indexOf('--push') !== -1;

function sh(cmd, args) {
  return cp.spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
}
function copy(src, dst) {
  try { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); return true; }
  catch (_) { return false; }
}
function copyDir(src, dst) {
  try {
    fs.mkdirSync(dst, { recursive: true });
    fs.readdirSync(src).forEach(function (f) {
      var s = path.join(src, f), d = path.join(dst, f);
      if (fs.statSync(s).isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
    });
  } catch (_) {}
}
function tail(file, n) {
  try {
    var lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).filter(Boolean);
    return lines.slice(-n).join('\n') + '\n';
  } catch (_) { return ''; }
}

// 1. snapshot fresco
sh(process.execPath, [path.join(__dirname, 'snapshot.js')]);

// 2. dashboard -> docs/
fs.mkdirSync(DOCS_STATE, { recursive: true });
['index.html', 'styles.css', 'app.js'].forEach(function (f) {
  copy(path.join(ROOT, 'dashboard', f), path.join(DOCS, f));
});
copyDir(path.join(ROOT, 'dashboard', 'sprites'), path.join(DOCS, 'sprites'));
// .nojekyll para o GitHub Pages nao ignorar pastas com _underscore etc
try { fs.writeFileSync(path.join(DOCS, '.nojekyll'), ''); } catch (_) {}

// 3. estado -> docs/state/
['agents.json', 'pipeline.json', 'security.json'].forEach(function (f) {
  copy(path.join(L.P.stateDir, f), path.join(DOCS_STATE, f));
});
copy(path.join(L.P.metricsDir, 'metrics.json'), path.join(DOCS_STATE, 'metrics.json'));
copy(path.join(L.P.marketingDir, 'channels.json'), path.join(DOCS_STATE, 'channels.json'));
fs.writeFileSync(path.join(DOCS_STATE, 'events.jsonl'), tail(L.P.events, 500));
fs.writeFileSync(path.join(DOCS_STATE, 'posts.jsonl'),
  tail(path.join(L.P.marketingDir, 'posts.jsonl'), 500));
// pricing do piloto, se existir
copy(path.join(L.P.projectsDir, 'app-001', 'pricing.json'),
  path.join(DOCS_STATE, 'pricing.json'));
// URL do tunel atual, se existir
copy(path.join(L.P.stateDir, 'tunnel.txt'), path.join(DOCS_STATE, 'tunnel.txt'));

// carimbo
fs.writeFileSync(path.join(DOCS_STATE, 'published_at.txt'), new Date().toISOString() + '\n');

L.appendEvent({
  agent: 'publish-state', task: null, type: 'publish', tool: 'publish-state.js',
  summary: 'docs/ atualizado (dashboard + estado) ' + (PUSH ? '+ push' : '(sem push)'),
  model: 'system', effort: 'n/a',
});

console.log('docs/ atualizado.');

// 4. push opcional
if (PUSH) {
  sh('git', ['add', 'docs', 'company/state', 'company/logs/events.jsonl']);
  var st = sh('git', ['status', '--porcelain']);
  if ((st.stdout || '').trim()) {
    var c = sh('git', ['-c', 'user.name=avf-vm', '-c', 'user.email=avf-vm@local',
      'commit', '-m', 'state: painel ' + new Date().toISOString()]);
    var p = sh('git', ['push']);
    console.log((c.stdout || '') + (c.stderr || ''));
    console.log((p.stdout || '') + (p.stderr || ''));
  } else {
    console.log('nada mudou, nada a commitar.');
  }
}
