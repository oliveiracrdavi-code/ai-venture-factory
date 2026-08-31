#!/usr/bin/env node
'use strict';
/**
 * activate.js - bootstrap da AI Venture Factory (idempotente).
 *   node .claude/skills/ai-venture-factory/scripts/activate.js
 *
 * Roda em QUALQUER projeto onde a skill esteja clonada em
 * .claude/skills/ai-venture-factory/. Garante pastas de estado do projeto
 * ALVO (cwd, ou AVF_PROJECT_ROOT), garante os hooks de log no
 * .claude/settings.json desse projeto, gera sprites se faltarem (uma vez,
 * compartilhados por todos os projetos), roda snapshot e imprime o resumo.
 */
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var L = require('./avf-lib');

var SKILL_ROOT = L.P.skillRoot;
var PROJECT_ROOT = L.P.projectRoot;

function run(script, args) {
  return cp.spawnSync(process.execPath, [path.join(__dirname, script)].concat(args || []), {
    cwd: PROJECT_ROOT, encoding: 'utf8', timeout: 30000,
  });
}

L.ensureDirs();
for (var d of ['company/marketing/drafts', 'company/marketing/outbox', 'company/logs/chats',
  'company/security', 'company/decisions', 'company/inbox', 'company/projects', 'company/tasks',
  'company/memory', 'company/metrics', 'company/reports']) {
  try { fs.mkdirSync(path.join(PROJECT_ROOT, d), { recursive: true }); } catch (_) {}
}

// ---------------------------------------------------------------------------
// Hooks de log: precisam viver no .claude/settings.json do projeto ALVO (o
// dono do hook e sempre o projeto da sessao, nunca a skill). Merge
// idempotente: nunca sobrescreve chaves que ja existirem no settings.json.
// ---------------------------------------------------------------------------
function relLoggerPath() {
  // caminho do logger.js relativo ao PROJECT_ROOT, sempre com '/' (JSON/shell)
  return path.relative(PROJECT_ROOT, path.join(__dirname, 'logger.js')).split(path.sep).join('/');
}
function wireHooks() {
  var loggerPath = relLoggerPath();
  var settings = L.readJSON(L.P.settingsFile, null) || {};
  var changed = false;
  if (!settings.hooks) { settings.hooks = {}; changed = true; }
  ['PostToolUse', 'Stop'].forEach(function (evt) {
    var already = JSON.stringify(settings.hooks[evt] || '').indexOf(loggerPath) !== -1;
    if (already) return;
    var entry = { hooks: [{ type: 'command', command: 'node ' + loggerPath + ' ' + evt, timeout: 5000 }] };
    if (!Array.isArray(settings.hooks[evt])) settings.hooks[evt] = [];
    settings.hooks[evt].push(entry);
    changed = true;
  });
  if (!settings.permissions) settings.permissions = {};
  if (!Array.isArray(settings.permissions.allow)) settings.permissions.allow = [];
  var allowGlob = 'Bash(node ' + path.join('.claude', 'skills', 'ai-venture-factory', 'scripts').split(path.sep).join('/') + '/*.js:*)';
  if (settings.permissions.allow.indexOf(allowGlob) === -1) { settings.permissions.allow.push(allowGlob); changed = true; }
  if (changed) {
    fs.mkdirSync(path.dirname(L.P.settingsFile), { recursive: true });
    fs.writeFileSync(L.P.settingsFile, JSON.stringify(settings, null, 2) + '\n');
  }
  return changed;
}
var hooksChanged = wireHooks();

// ---------------------------------------------------------------------------
// launch.json: config nomeada para o preview_start do host (quando existir)
// abrir o painel com um clique. Merge idempotente, nao mexe em outras entries.
// ---------------------------------------------------------------------------
function wireLaunchConfig() {
  var launchFile = path.join(PROJECT_ROOT, '.claude', 'launch.json');
  var serverRel = path.relative(PROJECT_ROOT, path.join(__dirname, 'server.js')).split(path.sep).join('/');
  var cfg = L.readJSON(launchFile, null);
  var changed = false;
  if (!cfg) { cfg = { version: '0.0.1', configurations: [] }; changed = true; }
  if (!Array.isArray(cfg.configurations)) { cfg.configurations = []; changed = true; }
  var has = cfg.configurations.some(function (c) { return c && c.name === 'ai-venture-factory'; });
  if (!has) {
    cfg.configurations.push({
      name: 'ai-venture-factory', runtimeExecutable: 'node',
      runtimeArgs: [serverRel, '8080'], port: 8080,
    });
    changed = true;
  }
  if (changed) {
    fs.mkdirSync(path.dirname(launchFile), { recursive: true });
    fs.writeFileSync(launchFile, JSON.stringify(cfg, null, 2) + '\n');
  }
  return changed;
}
var launchChanged = wireLaunchConfig();

// sprites (compartilhados: ficam dentro da skill, nao do projeto)
var spritesDir = path.join(L.P.dashboardDir, 'sprites');
var haveSprites = 0;
try { fs.mkdirSync(spritesDir, { recursive: true }); } catch (_) {}
try { haveSprites = fs.readdirSync(spritesDir).filter(function (f) { return /^sprite-A\d\d\.svg$/.test(f); }).length; } catch (_) {}
if (haveSprites < 49) {
  console.log('gerando sprites (' + haveSprites + '/49)...');
  run('gen-sprites.js');
}

// snapshot (escreve em company/state/ do PROJECT_ROOT)
run('snapshot.js');

var agents = L.readJSON(L.P.agentsJson, { count: 0 });
var pipe = L.readJSON(L.P.pipelineJson, { projects: {} });

L.appendEvent({
  agent: 'activate', task: null, type: 'activate', tool: 'activate.js',
  summary: 'fabrica ativada: ' + (agents.count || 0) + ' agentes, ' +
    Object.keys(pipe.projects || {}).length + ' projeto(s), sprites ' +
    (haveSprites < 49 ? 'gerados' : 'ok') + (hooksChanged ? ', hooks instalados' : '') +
    (launchChanged ? ', launch.json instalado' : ''),
  model: 'claude-sonnet-5', effort: 'medium',
});

console.log('');
console.log('  AI VENTURE FACTORY — pronta');
console.log('  skill:   ' + SKILL_ROOT);
console.log('  projeto: ' + PROJECT_ROOT);
console.log('  agentes: ' + (agents.count || 0) + '/49   projetos: ' + Object.keys(pipe.projects || {}).length);
console.log('  sprites: ' + Math.max(haveSprites, 49) + '/49');
console.log('  hooks:   ' + (hooksChanged ? 'instalados agora em .claude/settings.json' : 'ja configurados'));
console.log('  launch:  ' + (launchChanged ? 'instalado agora em .claude/launch.json' : 'ja configurado'));
console.log('');
console.log('  Painel:');
console.log('   - preview_start  { "name": "ai-venture-factory" }   (se disponivel na sessao)');
console.log('   - ou:  node ' + path.relative(PROJECT_ROOT, path.join(__dirname, 'server.js')) + ' 8080   ->  http://127.0.0.1:8080');
console.log('');
console.log('  Piloto (opcional):');
console.log('   node ' + path.relative(PROJECT_ROOT, path.join(__dirname, 'seed-tasks.js')) +
  '  &&  node ' + path.relative(PROJECT_ROOT, path.join(__dirname, 'orchestrator.js')) + ' tick');
