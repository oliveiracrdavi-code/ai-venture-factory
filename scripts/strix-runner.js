#!/usr/bin/env node
'use strict';
/**
 * strix-runner.js - STUB do A2 (usestrix/strix). Invoca o Strix se instalado,
 * senao registra fallback. SO ataca 127.0.0.1/localhost.
 *
 *   node scripts/strix-runner.js --target http://127.0.0.1:8090 --project app-001
 */
var cp = require('child_process');
var path = require('path');
var fs = require('fs');
var L = require('./avf-lib');

function arg(name, def) {
  var i = process.argv.indexOf(name);
  return i !== -1 ? (process.argv[i + 1] || def) : def;
}
var target = arg('--target', '');
var project = arg('--project', 'app-001');

// guarda-corpo: so alvo local
var okHost = /^https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(target);
if (!target || !okHost) {
  console.error('ERRO: --target deve ser 127.0.0.1/localhost. Recebido: ' + JSON.stringify(target));
  process.exit(2);
}

var outFile = path.join(L.P.securityDir, 'strix-' + project + '.md');
fs.mkdirSync(L.P.securityDir, { recursive: true });

var hasStrix = false;
try { hasStrix = cp.spawnSync('strix', ['--version'], { encoding: 'utf8' }).status === 0; } catch (_) {}

var header = '# Strix — ' + project + ' (' + new Date().toISOString() + ')\n\n' +
  'Alvo: ' + target + '  (staging local)\n\n';

if (hasStrix) {
  console.log('rodando strix contra ' + target + ' ...');
  var r = cp.spawnSync('strix', ['scan', '--url', target, '--format', 'md'], { encoding: 'utf8', timeout: 20 * 60000 });
  fs.writeFileSync(outFile, header + (r.stdout || '') + '\n\n<!-- stderr -->\n' + (r.stderr || ''));
  L.appendEvent({ agent: 'A32', task: null, type: 'pentest', tool: 'strix',
    summary: 'strix scan ' + project + ' -> ' + outFile, model: 'claude-opus-5', effort: 'high' });
} else {
  fs.writeFileSync(outFile, header +
    '> Strix nao instalado nesta maquina. Fallback: A32 executa o checklist manual\n' +
    '> (webapp-testing, curl, static-analysis, metaharness_redblue) e preenche este arquivo.\n\n' +
    '## Achados (preencher A32)\n| ID | Classe | Severidade | Endpoint | Evidencia | Reproducao | Correcao |\n|---|---|---|---|---|---|---|\n');
  L.appendEvent({ agent: 'A32', task: null, type: 'pentest', tool: 'strix-runner',
    summary: 'strix ausente; fallback manual para ' + project,
    model: 'claude-opus-5', effort: 'high' });
  console.log('strix ausente -> stub gravado em ' + outFile + ' (integration_fallback: strix)');
}
