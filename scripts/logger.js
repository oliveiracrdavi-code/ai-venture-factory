#!/usr/bin/env node
'use strict';
/**
 * logger.js - grava eventos em company/logs/events.jsonl com mascaramento
 * obrigatorio de secrets. Usado pelos hooks PostToolUse e Stop do Claude Code
 * (wiring em .claude/settings.json) e tambem em modo de teste.
 *
 *   echo '<json do hook>' | node scripts/logger.js PostToolUse
 *   echo '<json do hook>' | node scripts/logger.js Stop
 *   node scripts/logger.js --test "linha com sk-test123 e Bearer abc.def"
 *
 * NUNCA lanca excecao para o hook: qualquer erro e engolido e sai 0.
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

function readStdin() {
  try {
    var buf = fs.readFileSync(0, 'utf8');
    return buf || '';
  } catch (_) { return ''; }
}

function detectModel() {
  var envM = process.env.AVF_MODEL || process.env.CLAUDE_MODEL || process.env.ANTHROPIC_MODEL;
  if (envM) return envM;
  try {
    var s = JSON.parse(fs.readFileSync(path.join(L.ROOT, '.claude', 'settings.json'), 'utf8'));
    if (s && s.model) return s.model;
  } catch (_) {}
  return 'claude-sonnet-5';
}
function detectEffort() {
  return process.env.AVF_EFFORT || process.env.CLAUDE_EFFORT || 'unknown';
}

function short(v, n) {
  try {
    var s = typeof v === 'string' ? v : JSON.stringify(v);
    if (!s) return '';
    n = n || 240;
    return s.length > n ? s.slice(0, n) + '...' : s;
  } catch (_) { return ''; }
}

function runTest() {
  var input = process.argv.slice(3).join(' ') || readStdin() ||
    'exemplo: OPENAI sk-test123456789ABCDEF, GitHub ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ012345, ' +
    'Authorization: Bearer eyJhbGciOi.payloadpayload.sigsig, AWS AKIAIOSFODNN7EXAMPLE';
  var masked = L.maskSecrets(input);
  console.log('--- ENTRADA (com secrets FALSOS) ---');
  console.log(input);
  console.log('--- SAIDA (mascarada, o que iria para o log) ---');
  console.log(masked);
  var leaked = /sk-[A-Za-z0-9]|ghp_[A-Za-z0-9]|AKIA[0-9A-Z]|Bearer\s+[A-Za-z0-9]/.test(masked);
  console.log('--- VEREDITO: ' + (leaked ? 'FALHOU (secret vazou)' : 'OK (nenhum secret no output)') + ' ---');
  process.exit(leaked ? 1 : 0);
}

function main() {
  var arg = process.argv[2] || 'PostToolUse';
  if (arg === '--test' || arg === 'test') return runTest();

  var raw = readStdin();
  var payload = {};
  try { payload = raw ? JSON.parse(raw) : {}; } catch (_) { payload = {}; }

  var evtType = payload.hook_event_name || arg || 'hook';
  var tool = payload.tool_name || null;
  var summary;
  if (evtType === 'Stop') {
    summary = 'sessao parou (stop_hook_active=' + (payload.stop_hook_active ? 'true' : 'false') + ')';
  } else if (tool) {
    summary = tool + ' - ' + short(payload.tool_input);
  } else {
    summary = evtType + ' - ' + short(payload);
  }

  L.appendEvent({
    agent: 'claude-code',
    task: process.env.AVF_TASK || null,
    type: evtType,
    tool: tool,
    summary: summary,           // maskDeep dentro de appendEvent ja mascara
    model: detectModel(),
    effort: detectEffort(),
  });
  process.exit(0);
}

try { main(); } catch (_) { process.exit(0); }
