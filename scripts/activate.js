#!/usr/bin/env node
'use strict';
/**
 * activate.js - bootstrap da AI Venture Factory (idempotente).
 *   node scripts/activate.js
 * Garante pastas de estado, gera sprites se faltarem, roda snapshot e imprime
 * o resumo + como abrir o painel.
 */
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var L = require('./avf-lib');

var ROOT = L.ROOT;
function run(script, args) {
  return cp.spawnSync(process.execPath, [path.join(__dirname, script)].concat(args || []), {
    cwd: ROOT, encoding: 'utf8', timeout: 30000,
  });
}

L.ensureDirs();
for (var d of ['company/marketing/drafts', 'company/marketing/outbox', 'company/logs/chats',
  'company/security', 'company/decisions', 'company/inbox', 'company/projects', 'company/tasks',
  'dashboard/sprites']) {
  try { fs.mkdirSync(path.join(ROOT, d), { recursive: true }); } catch (_) {}
}

// sprites
var spritesDir = path.join(ROOT, 'dashboard', 'sprites');
var haveSprites = 0;
try { haveSprites = fs.readdirSync(spritesDir).filter(function (f) { return /^sprite-A\d\d\.svg$/.test(f); }).length; } catch (_) {}
if (haveSprites < 49) {
  console.log('gerando sprites (' + haveSprites + '/49)...');
  run('gen-sprites.js');
}

// snapshot
run('snapshot.js');

var agents = L.readJSON(L.P.agentsJson, { count: 0 });
var pipe = L.readJSON(L.P.pipelineJson, { projects: {} });

L.appendEvent({
  agent: 'activate', task: null, type: 'activate', tool: 'activate.js',
  summary: 'fabrica ativada: ' + (agents.count || 0) + ' agentes, ' +
    Object.keys(pipe.projects || {}).length + ' projeto(s), sprites ' +
    (haveSprites < 49 ? 'gerados' : 'ok'),
  model: 'claude-sonnet-5', effort: 'medium',
});

console.log('');
console.log('  AI VENTURE FACTORY — pronta');
console.log('  agentes: ' + (agents.count || 0) + '/49   projetos: ' + Object.keys(pipe.projects || {}).length);
console.log('  sprites: ' + Math.max(haveSprites, 49) + '/49');
console.log('');
console.log('  Painel:');
console.log('   - preview_start  { "name": "ai-venture-factory" }   (da o link)');
console.log('   - ou:  node scripts/server.js 8080   ->  http://127.0.0.1:8080');
console.log('');
console.log('  Piloto (opcional):  node scripts/seed-tasks.js  &&  node scripts/orchestrator.js tick');
