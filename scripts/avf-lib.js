'use strict';
/**
 * avf-lib.js - utilitarios compartilhados da AI Venture Factory.
 * Node puro, sem dependencias. Usado por orchestrator/logger/snapshot/seed-tasks.
 */
var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var P = {
  root: ROOT,
  agentsDir: path.join(ROOT, '.claude', 'agents'),
  tasksDir: path.join(ROOT, 'company', 'tasks'),
  projectsDir: path.join(ROOT, 'company', 'projects'),
  decisionsDir: path.join(ROOT, 'company', 'decisions'),
  securityDir: path.join(ROOT, 'company', 'security'),
  marketingDir: path.join(ROOT, 'company', 'marketing'),
  reportsDir: path.join(ROOT, 'company', 'reports'),
  stateDir: path.join(ROOT, 'company', 'state'),
  metricsDir: path.join(ROOT, 'company', 'metrics'),
  logsDir: path.join(ROOT, 'company', 'logs'),
  events: path.join(ROOT, 'company', 'logs', 'events.jsonl'),
  agentsJson: path.join(ROOT, 'company', 'state', 'agents.json'),
  pipelineJson: path.join(ROOT, 'company', 'state', 'pipeline.json'),
  envFile: path.join(ROOT, '.env'),
};

// ---------------------------------------------------------------------------
// Mascaramento de secrets - OBRIGATORIO antes de qualquer escrita em log.
// ---------------------------------------------------------------------------
var SECRET_PATTERNS = [
  /sk-ant-[A-Za-z0-9_\-]{6,}/g,
  /sk-[A-Za-z0-9_\-]{6,}/g,
  /ghp_[A-Za-z0-9]{16,}/g,
  /gho_[A-Za-z0-9]{16,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /AKIA[0-9A-Z]{12,}/g,
  /ASIA[0-9A-Z]{12,}/g,
  /AIza[0-9A-Za-z_\-]{20,}/g,
  /xox[abprs]-[A-Za-z0-9\-]{10,}/g,
  /Bearer\s+[A-Za-z0-9._\-]{8,}/gi,
  /eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{6,}/g,
];
var MASK = '«MASKED»';

function envSecretValues() {
  var vals = [];
  try {
    if (!fs.existsSync(P.envFile)) return vals;
    var txt = fs.readFileSync(P.envFile, 'utf8');
    var lines = txt.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var m = lines[i].match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (!m) continue;
      var v = m[2].replace(/^['"]|['"]$/g, '');
      if (v.length >= 4) vals.push(v);
    }
  } catch (_) { /* nunca falha por causa disso */ }
  return vals;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function maskSecrets(str, extraValues) {
  if (str == null) return str;
  var out = String(str);
  for (var i = 0; i < SECRET_PATTERNS.length; i++) out = out.replace(SECRET_PATTERNS[i], MASK);
  var vals = envSecretValues().concat(Array.isArray(extraValues) ? extraValues : []);
  for (var j = 0; j < vals.length; j++) {
    var v = vals[j];
    if (!v || String(v).length < 4) continue;
    out = out.replace(new RegExp(escapeRe(String(v)), 'g'), MASK);
  }
  out = out.replace(/^(\s*[A-Z][A-Z0-9_]{2,}\s*=\s*)\S.*$/gm, '$1' + MASK);
  return out;
}

function maskDeep(obj, extraValues) {
  if (obj == null) return obj;
  if (typeof obj === 'string') return maskSecrets(obj, extraValues);
  if (Array.isArray(obj)) return obj.map(function (x) { return maskDeep(x, extraValues); });
  if (typeof obj === 'object') {
    var o = {};
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) o[keys[i]] = maskDeep(obj[keys[i]], extraValues);
    return o;
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Frontmatter (YAML simples: "chave: valor", listas "[a, b]")
// ---------------------------------------------------------------------------
function parseFrontmatter(text) {
  var m = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  var data = {};
  var lines = m[1].split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].replace(/\s+#.*$/, '').trim();
    if (!line || line.charAt(0) === '#') continue;
    var mm = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!mm) continue;
    var key = mm[1];
    var val = mm[2].trim();
    if (val.charAt(0) === '[' && val.charAt(val.length - 1) === ']') {
      val = val.slice(1, -1).split(',').map(function (s) {
        return s.trim().replace(/^['"]|['"]$/g, '');
      }).filter(Boolean);
    } else {
      val = val.replace(/^['"]|['"]$/g, '');
    }
    data[key] = val;
  }
  return { data: data, body: m[2] };
}

function listFiles(dir, re) {
  try {
    return fs.readdirSync(dir).filter(function (f) { return re.test(f); })
      .map(function (f) { return path.join(dir, f); });
  } catch (_) { return []; }
}

function readAgents() {
  return listFiles(P.agentsDir, /^A\d{2}-.*\.md$/).map(function (fp) {
    var d = parseFrontmatter(fs.readFileSync(fp, 'utf8')).data;
    return {
      file: fp,
      id: d.id || path.basename(fp).slice(0, 3),
      slug: d.slug || '',
      bloco: d.bloco || '',
      nivel: d.nivel || '',
      modelo: d.modelo || 'Sonnet',
      effort: d.effort || 'medium',
      fallback_pro: d.fallback_pro || '—',
      gate_principal: d.gate_principal || '',
    };
  }).sort(function (a, b) { return a.id.localeCompare(b.id); });
}

function readTasks() {
  return listFiles(P.tasksDir, /^TASK-\d{4}.*\.md$/).map(function (fp) {
    var parsed = parseFrontmatter(fs.readFileSync(fp, 'utf8'));
    var d = parsed.data;
    return {
      file: fp,
      id: d.id || path.basename(fp).replace(/\.md$/, ''),
      agent: d.agent || '',
      status: d.status || 'queued',
      priority: Number(d.priority || 3),
      gate: d.gate || 'G0',
      project: d.project || 'app-001',
      depends_on: Array.isArray(d.depends_on) ? d.depends_on : (d.depends_on ? [d.depends_on] : []),
      created: d.created || '',
      updated: d.updated || '',
      body: parsed.body,
    };
  }).sort(function (a, b) { return a.id.localeCompare(b.id); });
}

function writeTaskField(task, updates) {
  var txt = fs.readFileSync(task.file, 'utf8');
  var keys = Object.keys(updates);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i], v = updates[k];
    var re = new RegExp('^(' + k + '\\s*:\\s*).*$', 'm');
    if (re.test(txt)) txt = txt.replace(re, '$1' + v);
    else txt = txt.replace(/^---\s*\r?\n/, function (h) { return h + k + ': ' + v + '\n'; });
  }
  fs.writeFileSync(task.file, txt);
}

function appendTaskNote(task, note) {
  fs.appendFileSync(task.file, '\n\n> [orchestrator ' + new Date().toISOString() + '] ' + note + '\n');
}

function nextTaskId() {
  var nums = readTasks().map(function (t) {
    return parseInt(String(t.id).replace(/[^\d]/g, ''), 10);
  }).filter(function (n) { return !isNaN(n); });
  var n = (nums.length ? Math.max.apply(null, nums) : 0) + 1;
  return 'TASK-' + String(n).padStart(4, '0');
}

function ensureDirs() {
  var dirs = [P.stateDir, P.logsDir, P.reportsDir, path.join(P.logsDir, 'chats')];
  for (var i = 0; i < dirs.length; i++) {
    try { fs.mkdirSync(dirs[i], { recursive: true }); } catch (_) {}
  }
}

function appendEvent(evt) {
  ensureDirs();
  var e = Object.assign({
    ts: new Date().toISOString(),
    agent: 'system', task: null, type: 'info', tool: null,
    summary: '', model: 'unknown', effort: 'unknown',
  }, evt || {});
  var safe = maskDeep(e);
  try { fs.appendFileSync(P.events, JSON.stringify(safe) + '\n'); } catch (_) {}
  return safe;
}

function readEvents() {
  try {
    return fs.readFileSync(P.events, 'utf8').trim().split(/\r?\n/).filter(Boolean)
      .map(function (l) { try { return JSON.parse(l); } catch (_) { return null; } })
      .filter(Boolean);
  } catch (_) { return []; }
}

function readJSON(fp, fallback) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (_) { return fallback; }
}
function writeJSON(fp, obj) {
  ensureDirs();
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + '\n');
}

module.exports = {
  P: P, ROOT: ROOT,
  maskSecrets: maskSecrets, maskDeep: maskDeep, envSecretValues: envSecretValues,
  parseFrontmatter: parseFrontmatter, readAgents: readAgents, readTasks: readTasks,
  writeTaskField: writeTaskField, appendTaskNote: appendTaskNote, nextTaskId: nextTaskId,
  appendEvent: appendEvent, readEvents: readEvents, readJSON: readJSON, writeJSON: writeJSON,
  ensureDirs: ensureDirs, listFiles: listFiles,
};
