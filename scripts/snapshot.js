#!/usr/bin/env node
'use strict';
/**
 * snapshot.js - gera o estado que o dashboard consome (polling).
 *
 *   node scripts/snapshot.js
 *
 * Saidas:
 *   company/state/agents.json    -> os 49 agentes (frontmatter + tasks + events)
 *   company/state/pipeline.json  -> status G0..G10 por projeto
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

function hasFile(fp) { try { return fs.existsSync(fp) && fs.statSync(fp).size > 0; } catch (_) { return false; } }
function fileHas(fp, needle) { try { return fs.readFileSync(fp, 'utf8').indexOf(needle) !== -1; } catch (_) { return false; } }
function proj(p, f) { return path.join(L.P.projectsDir, p, f); }

// status de um gate para um projeto
function gateOutputOk(gate, p) {
  switch (gate) {
    case 'G0': return hasFile(proj(p, 'idea.md'));
    case 'G1': return hasFile(proj(p, 'brief.md'));
    case 'G2': {
      var sf = proj(p, 'score.md');
      if (!hasFile(sf)) return false;
      try { return /\b\d{1,3}\s*\/\s*100\b/.test(fs.readFileSync(sf, 'utf8')); } catch (_) { return false; }
    }
    case 'G3': return hasFile(path.join(L.P.decisionsDir, 'ceo-' + p + '.md')) &&
      fileHas(path.join(L.P.decisionsDir, 'ceo-' + p + '.md'), 'APROVADO');
    case 'G4': return hasFile(proj(p, 'blueprint.md'));
    case 'G5': {
      var f = proj(p, 'privilege-checklist.md');
      return hasFile(f) && (fileHas(f, '[x]') || fileHas(f, 'APROVADO'));
    }
    case 'G6': return hasFile(proj(p, 'CHANGELOG.md'));
    case 'G7': {
      var b = path.join(L.P.securityDir, 'blue-team-' + p + '.md');
      return hasFile(b) && (fileHas(b, 'invasao falha') || fileHas(b, 'invasão falha') ||
        fileHas(b, '0 abertos') || fileHas(b, 'zero critico') || fileHas(b, 'zero crítico'));
    }
    case 'G8': return hasFile(proj(p, 'qa-report.md')) && fileHas(proj(p, 'qa-report.md'), 'RELEASE-READY');
    case 'G9': {
      var cal = L.listFiles(L.P.marketingDir, /^calendar-.*\.md$/);
      var out = L.listFiles(path.join(L.P.marketingDir, 'outbox'), /\.md$/);
      return cal.length > 0 || out.length > 0;
    }
    case 'G10': return hasFile(path.join(L.P.reportsDir, 'daily-report.md')) &&
      hasFile(path.join(L.P.metricsDir, 'metrics.json'));
    default: return false;
  }
}

function listProjects() {
  try {
    return fs.readdirSync(L.P.projectsDir).filter(function (d) {
      try { return fs.statSync(path.join(L.P.projectsDir, d)).isDirectory() && /^app-\d+/.test(d); }
      catch (_) { return false; }
    });
  } catch (_) { return []; }
}

function buildAgents(tasks, events) {
  var agents = L.readAgents();
  // ultima acao por agente
  var lastByAgent = {};
  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    if (e && e.agent) lastByAgent[e.agent] = e;
  }
  return agents.map(function (a) {
    var mine = tasks.filter(function (t) { return t.agent === a.id; });
    var run = mine.filter(function (t) { return t.status === 'running'; })[0];
    var rev = mine.filter(function (t) { return t.status === 'review'; })[0];
    var blk = mine.filter(function (t) { return t.status === 'blocked'; })[0];
    var q = mine.filter(function (t) { return t.status === 'queued'; })[0];
    var status = 'idle', taskAtual = null;
    if (run) { status = 'trabalhando'; taskAtual = run.id; }
    else if (blk) { status = 'bloqueado'; taskAtual = blk.id; }
    else if (rev) { status = 'aguardando-humano'; taskAtual = rev.id; }
    else if (q) { status = 'na-fila'; taskAtual = q.id; }
    var la = lastByAgent[a.id];
    return {
      id: a.id, slug: a.slug, bloco: a.bloco, nivel: a.nivel,
      modelo: a.modelo, effort: a.effort, fallback_pro: a.fallback_pro,
      gate_principal: a.gate_principal,
      status: status,
      task_atual: taskAtual,
      ultima_acao: la ? { ts: la.ts, type: la.type, summary: la.summary } : null,
    };
  });
}

function buildPipeline(tasks) {
  var projects = listProjects();
  var gates = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'];
  var out = { generated_at: new Date().toISOString(), projects: {} };
  projects.forEach(function (p) {
    var row = {};
    gates.forEach(function (g) {
      var running = tasks.some(function (t) { return t.project === p && t.gate === g && t.status === 'running'; });
      var blocked = tasks.some(function (t) { return t.project === p && t.gate === g && t.status === 'blocked'; });
      if (gateOutputOk(g, p)) row[g] = 'done';       // ✅
      else if (running) row[g] = 'running';           // 🔄
      else if (blocked) row[g] = 'rejected';          // ❌
      else row[g] = 'blocked';                        // ⏸️  (aguardando)
    });
    out.projects[p] = row;
  });
  return out;
}

function countMatches(txt, re) { var m = txt.match(re); return m ? m.length : 0; }

function buildSecurity(projects) {
  var out = { generated_at: new Date().toISOString(), projects: {} };
  projects.forEach(function (p) {
    var redF = path.join(L.P.securityDir, 'red-team-' + p + '.md');
    var blueF = path.join(L.P.securityDir, 'blue-team-' + p + '.md');
    var depF = path.join(L.P.securityDir, 'dep-audit-' + p + '.md');
    var red = ''; var blue = ''; var dep = '';
    try { red = fs.readFileSync(redF, 'utf8'); } catch (_) {}
    try { blue = fs.readFileSync(blueF, 'utf8'); } catch (_) {}
    try { dep = fs.readFileSync(depF, 'utf8'); } catch (_) {}
    var closed = /invas[aã]o falha|0 abertos|zero cr[ií]tic/i.test(blue);
    var redblue = !hasFile(redF) ? 'nao iniciado' : (closed ? 'fechado (0 criticas)' : 'em ciclo red/blue');
    out.projects[p] = {
      open: {
        critica: closed ? 0 : countMatches(red, /cr[ií]tic[ao]/gi),
        alta: closed ? 0 : countMatches(red, /\balta\b/gi),
        media: closed ? 0 : countMatches(red, /m[eé]dia/gi),
        baixa: countMatches(red, /\bbaixa\b/gi),
      },
      redblue: redblue,
      deps: countMatches(dep, /CVE-\d{4}-\d+/g),
    };
  });
  return out;
}

function main() {
  L.ensureDirs();
  var tasks = L.readTasks();
  var events = L.readEvents();

  var agentsOut = { generated_at: new Date().toISOString(), count: 0, agents: buildAgents(tasks, events) };
  agentsOut.count = agentsOut.agents.length;
  L.writeJSON(L.P.agentsJson, agentsOut);

  var pipe = buildPipeline(tasks);
  L.writeJSON(L.P.pipelineJson, pipe);

  var sec = buildSecurity(Object.keys(pipe.projects));
  L.writeJSON(path.join(L.P.stateDir, 'security.json'), sec);

  // chat-merged.jsonl: agrega company/logs/chats/*.jsonl por ts (ult. 500)
  var chatsDir = path.join(L.P.logsDir, 'chats');
  var merged = [];
  try {
    fs.readdirSync(chatsDir).filter(function (f) { return /\.jsonl$/.test(f); }).forEach(function (f) {
      var from = f.replace(/\.jsonl$/, '');
      fs.readFileSync(path.join(chatsDir, f), 'utf8').trim().split(/\r?\n/).filter(Boolean).forEach(function (l) {
        try { var o = JSON.parse(l); if (!o.from) o.from = from; merged.push(o); } catch (_) {}
      });
    });
  } catch (_) {}
  merged.sort(function (a, b) { return String(a.ts).localeCompare(String(b.ts)); });
  merged = merged.slice(-500);
  fs.writeFileSync(path.join(L.P.stateDir, 'chat-merged.jsonl'),
    merged.map(function (m) { return JSON.stringify(L.maskDeep(m)); }).join('\n') + (merged.length ? '\n' : ''));

  // human-chat.jsonl -> copia mascarada para state/
  try {
    var hc = fs.readFileSync(path.join(L.P.logsDir, 'human-chat.jsonl'), 'utf8').trim().split(/\r?\n/).filter(Boolean).slice(-300);
    fs.writeFileSync(path.join(L.P.stateDir, 'human-chat.jsonl'),
      hc.map(function (l) { try { return JSON.stringify(L.maskDeep(JSON.parse(l))); } catch (_) { return ''; } }).filter(Boolean).join('\n') + (hc.length ? '\n' : ''));
  } catch (_) { try { fs.writeFileSync(path.join(L.P.stateDir, 'human-chat.jsonl'), ''); } catch (__) {} }

  // approvals.json -> garante que existe em state/
  if (!L.readJSON(path.join(L.P.stateDir, 'approvals.json'), null))
    L.writeJSON(path.join(L.P.stateDir, 'approvals.json'), { pending: [], history: [] });

  // announcements.json: consolida company/announcements/*.md
  var annDir = path.join(L.ROOT, 'company', 'announcements');
  var items = [];
  try {
    fs.readdirSync(annDir).filter(function (f) { return /\.md$/.test(f); }).sort().forEach(function (f) {
      fs.readFileSync(path.join(annDir, f), 'utf8').split(/\r?\n/).forEach(function (line) {
        var m = line.match(/^-\s*(\S+)\s+—\s+(.*)$/);
        if (m) items.push({ ts: m[1], text: m[2] });
      });
    });
  } catch (_) {}
  L.writeJSON(path.join(L.P.stateDir, 'announcements.json'), { items: items.slice(-50) });

  L.appendEvent({
    agent: 'snapshot', task: null, type: 'snapshot', tool: 'snapshot.js',
    summary: 'agents.json (' + agentsOut.count + ') e pipeline.json (' +
      Object.keys(pipe.projects).length + ' projeto(s)) regenerados',
    model: 'claude-sonnet-5', effort: 'medium',
  });

  console.log('snapshot ok:');
  console.log('  company/state/agents.json   -> ' + agentsOut.count + ' agentes');
  console.log('  company/state/pipeline.json -> ' + Object.keys(pipe.projects).length + ' projeto(s): ' +
    (Object.keys(pipe.projects).join(', ') || '(nenhum)'));
}

main();
