#!/usr/bin/env node
'use strict';
/**
 * orchestrator.js - despacha a fila de TASKs da AI Venture Factory.
 *
 *   node scripts/orchestrator.js            -> tick (padrao)
 *   node scripts/orchestrator.js tick
 *   node scripts/orchestrator.js --watch    -> loop (SO sob pedido explicito)
 *
 * Regras:
 *  - Fila = TASK-*.md com status "queued", ordenada por priority (desc) e id (asc).
 *  - No maximo 5 TASKs "running" ao mesmo tempo.
 *  - Cada gate G0..G10 e uma funcao que checa o artefato do bloco anterior
 *    (spec SEcao 4). Se a pre-condicao falhar: cria uma TASK de volta para o
 *    bloco anterior com anotacoes, marca pipeline.json e bloqueia a TASK atual.
 *  - Para cada agente ativado, imprime id, TASK e o model/effort RECOMENDADO
 *    (lido do frontmatter do agente).
 *  - Toda transicao e registrada em company/logs/events.jsonl (com model/effort).
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

var MAX_RUNNING = 5;

// --- artefatos por projeto -------------------------------------------------
function proj(dir, p) { return path.join(L.P.projectsDir, p, dir); }
function hasFile(fp) { try { return fs.existsSync(fp) && fs.statSync(fp).size > 0; } catch (_) { return false; } }
function fileHas(fp, needle) {
  try { return fs.readFileSync(fp, 'utf8').indexOf(needle) !== -1; } catch (_) { return false; }
}

// Pre-condicao de cada gate: o artefato do bloco ANTERIOR precisa existir.
var PRECOND = {
  G0: function () { return { ok: true, missing: '' }; },
  G1: function (p) {
    var f = proj('idea.md', p);
    return { ok: hasFile(f), missing: 'company/projects/' + p + '/idea.md (G0 intake)' };
  },
  G2: function (p) {
    var f = proj('brief.md', p);
    return { ok: hasFile(f), missing: 'company/projects/' + p + '/brief.md (G1 pesquisa)' };
  },
  G3: function (p) {
    var f = proj('score.md', p);
    var ok = false;
    try { ok = hasFile(f) && /\b\d{1,3}\s*\/\s*100\b/.test(fs.readFileSync(f, 'utf8')); } catch (_) {}
    return { ok: ok, missing: 'company/projects/' + p + '/score.md com total /100 (G2)' };
  },
  G4: function (p) {
    var f = path.join(L.P.decisionsDir, 'ceo-' + p + '.md');
    var ok = false;
    try { ok = hasFile(f) && /verdict:.*APROVADO/i.test(fs.readFileSync(f, 'utf8')); } catch (_) {}
    return { ok: ok, missing: 'company/decisions/ceo-' + p + '.md = APROVADO (G3 CEO)' };
  },
  G5: function (p) {
    var f = proj('blueprint.md', p);
    return { ok: hasFile(f), missing: 'company/projects/' + p + '/blueprint.md (G4)' };
  },
  G6: function (p) {
    var f = proj('privilege-checklist.md', p);
    var ok = hasFile(f) && (fileHas(f, '[x]') || fileHas(f, 'APROVADO'));
    return { ok: ok, missing: 'company/projects/' + p + '/privilege-checklist.md aprovado (G5)' };
  },
  G7: function (p) {
    var f = proj('CHANGELOG.md', p);
    return { ok: hasFile(f), missing: 'company/projects/' + p + '/CHANGELOG.md (G6 engenharia)' };
  },
  G8: function (p) {
    var f = path.join(L.P.securityDir, 'blue-team-' + p + '.md');
    var ok = hasFile(f) && (fileHas(f, 'invasao falha') || fileHas(f, 'invasão falha') ||
      fileHas(f, '0 abertos') || fileHas(f, 'zero critico') || fileHas(f, 'zero crítico'));
    return { ok: ok, missing: 'company/security/blue-team-' + p + '.md sem falha critica (G7)' };
  },
  G9: function (p) {
    var f = proj('qa-report.md', p);
    var ok = hasFile(f) && fileHas(f, 'RELEASE-READY');
    return { ok: ok, missing: 'company/projects/' + p + '/qa-report.md = RELEASE-READY (G8 QA)' };
  },
  G10: function (p) {
    var cal = L.listFiles(L.P.marketingDir, /^calendar-.*\.md$/);
    var out = L.listFiles(path.join(L.P.marketingDir, 'outbox'), /\.md$/);
    var ok = cal.length > 0 || out.length > 0;
    return { ok: ok, missing: 'company/marketing/ (calendar-*.md ou outbox/*.md) (G9)' };
  },
};

// dono do bloco anterior, para onde a TASK volta quando o gate reprova
var BOUNCE_TO = {
  G1: 'A08', G2: 'A01', G3: 'A05', G4: 'A07', G5: 'A11',
  G6: 'A27', G7: 'A17', G8: 'A33', G9: 'A37', G10: 'A44',
};
var PREV_GATE = {
  G1: 'G0', G2: 'G1', G3: 'G2', G4: 'G3', G5: 'G4',
  G6: 'G5', G7: 'G6', G8: 'G7', G9: 'G8', G10: 'G9',
};

function agentById(agents, id) {
  for (var i = 0; i < agents.length; i++) if (agents[i].id === id) return agents[i];
  return null;
}

function markPipeline(project, gate, symbol, reason) {
  var pj = L.readJSON(L.P.pipelineJson, { generated_at: '', projects: {} });
  if (!pj.projects) pj.projects = {};
  if (!pj.projects[project]) pj.projects[project] = {};
  pj.projects[project][gate] = symbol;
  if (reason) {
    if (!pj.projects[project]._notes) pj.projects[project]._notes = {};
    pj.projects[project]._notes[gate] = reason;
  }
  pj.generated_at = new Date().toISOString();
  L.writeJSON(L.P.pipelineJson, pj);
}

function createBounceTask(fromTask, targetAgentId, missing) {
  var id = L.nextTaskId();
  var fp = path.join(L.P.tasksDir, id + '-bounce.md');
  var prevGate = PREV_GATE[fromTask.gate] || 'G0';
  var now = new Date().toISOString().slice(0, 10);
  var md = [
    '---',
    'id: ' + id,
    'agent: ' + targetAgentId,
    'status: queued',
    'priority: 5',
    'gate: ' + prevGate,
    'project: ' + fromTask.project,
    'depends_on: []',
    'created: ' + now,
    'updated: ' + now,
    '---',
    '',
    '# ' + id + ' - correcao de gate (bounce de ' + fromTask.id + ')',
    '',
    '## Objetivo',
    'O gate ' + fromTask.gate + ' reprovou por artefato ausente/incompleto. Produzir o que falta.',
    '',
    '## Contexto',
    'TASK de origem: ' + fromTask.id + ' (agente ' + fromTask.agent + ').',
    'Faltando: ' + missing,
    '',
    '## Saida esperada',
    '- ' + missing,
    '',
    '## Criterio de aceite',
    '- [ ] artefato existe e passa na pre-condicao do gate ' + fromTask.gate,
    '- [ ] acao registrada em company/logs/events.jsonl (com model e effort)',
    '',
  ].join('\n');
  fs.writeFileSync(fp, md);
  return id;
}

// --- tick ----------------------------------------------------------------
function tick() {
  L.ensureDirs();

  // interruptor mestre: se a empresa estiver desligada, nao ativa nada.
  // (company/state/company-power.json -- POST /api/company-power no dashboard)
  var power = L.readJSON(path.join(L.P.stateDir, 'company-power.json'), { on: true });
  if (power && power.on === false) {
    console.log('== orchestrator tick @ ' + new Date().toISOString() + ' ==');
    console.log('EMPRESA DESLIGADA (company-power.json: on=false) -- nenhuma tarefa ativada neste tick.');
    return;
  }

  var agents = L.readAgents();
  var tasks = L.readTasks();

  var running = tasks.filter(function (t) { return t.status === 'running'; });
  var queued = tasks.filter(function (t) { return t.status === 'queued'; })
    .sort(function (a, b) {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.id.localeCompare(b.id);
    });

  var doneIds = {};
  tasks.forEach(function (t) { if (t.status === 'done') doneIds[t.id] = true; });

  var capacity = MAX_RUNNING - running.length;
  var activated = [];
  var bounced = [];
  var blockedByDep = [];

  console.log('== orchestrator tick @ ' + new Date().toISOString() + ' ==');
  console.log('running: ' + running.length + '/' + MAX_RUNNING + '  |  queued: ' + queued.length);

  for (var i = 0; i < queued.length; i++) {
    if (capacity <= 0) break;
    var t = queued[i];

    // dependencias
    var unmet = (t.depends_on || []).filter(function (d) { return d && !doneIds[d]; });
    if (unmet.length) {
      blockedByDep.push({ id: t.id, on: unmet.join(', ') });
      continue;
    }

    // pre-condicao do gate
    var check = (PRECOND[t.gate] || PRECOND.G0)(t.project);
    if (!check.ok) {
      var target = BOUNCE_TO[t.gate] || 'A08';
      var newId = createBounceTask(t, target, check.missing);
      L.writeTaskField(t, { status: 'blocked', updated: new Date().toISOString().slice(0, 10) });
      L.appendTaskNote(t, 'gate ' + t.gate + ' reprovou: falta ' + check.missing + '. Criada ' + newId + ' para ' + target + '.');
      markPipeline(t.project, t.gate, 'rejected', 'falta ' + check.missing + ' (bounce ' + newId + ')');
      L.appendEvent({
        agent: 'orchestrator', task: t.id, type: 'gate-fail', tool: 'orchestrator',
        summary: 'gate ' + t.gate + ' reprovou (' + check.missing + '); bounce ' + newId + ' -> ' + target,
        model: 'claude-sonnet-5', effort: 'medium',
      });
      bounced.push({ id: t.id, gate: t.gate, newId: newId, target: target, missing: check.missing });
      continue;
    }

    // ativa
    var ag = agentById(agents, t.agent);
    var modelo = ag ? ag.modelo : '?';
    var effort = ag ? ag.effort : '?';
    var fb = ag ? ag.fallback_pro : '—';
    L.writeTaskField(t, { status: 'running', updated: new Date().toISOString().slice(0, 10) });
    markPipeline(t.project, t.gate, 'running', 'em andamento: ' + t.id);
    L.appendEvent({
      agent: t.agent, task: t.id, type: 'task-start', tool: 'orchestrator',
      summary: 'ativada no gate ' + t.gate + ' (' + t.project + ')',
      model: (String(modelo).toLowerCase().indexOf('opus') !== -1 ? 'claude-opus-5'
        : String(modelo).toLowerCase().indexOf('haiku') !== -1 ? 'claude-haiku-4-5-20251001'
          : 'claude-sonnet-5'),
      effort: effort,
    });
    activated.push({ id: t.agent, slug: ag ? ag.slug : '', task: t.id, gate: t.gate, modelo: modelo, effort: effort, fb: fb });
    capacity--;
  }

  // --- relatorio ---
  console.log('');
  if (!activated.length && !bounced.length && !blockedByDep.length) {
    console.log('nada a fazer neste tick (fila vazia ou sem itens elegiveis).');
  }
  if (activated.length) {
    console.log('ATIVADOS (ajuste /model e /effort na sessao conforme abaixo):');
    activated.forEach(function (a) {
      console.log('  ' + a.id + ' ' + a.slug + '  ' + a.task + '  gate ' + a.gate +
        '  ->  model=' + a.modelo + '  effort=' + a.effort + '  (fallback: ' + a.fb + ')');
    });
  }
  if (bounced.length) {
    console.log('BOUNCES (gate reprovado):');
    bounced.forEach(function (b) {
      console.log('  ' + b.id + ' gate ' + b.gate + ' -> nova ' + b.newId + ' para ' + b.target + '  | falta: ' + b.missing);
    });
  }
  if (blockedByDep.length) {
    console.log('AGUARDANDO DEPENDENCIA:');
    blockedByDep.forEach(function (d) { console.log('  ' + d.id + ' depende de: ' + d.on); });
  }
  console.log('');
  console.log('running agora: ' + (running.length + activated.length) + '/' + MAX_RUNNING);
}

// regenera company/state/*.json apos o tick (sem shell)
function refreshSnapshot() {
  try {
    require('child_process').spawnSync(process.execPath, [path.join(__dirname, 'snapshot.js')], {
      cwd: L.ROOT, timeout: 15000, stdio: 'ignore',
    });
  } catch (_) {}
}

// --- main ---------------------------------------------------------------
var mode = process.argv[2] || 'tick';
if (mode === '--watch' || mode === 'watch') {
  console.log('modo --watch: tick a cada 5s (Ctrl+C para sair)');
  var loop = function () { tick(); refreshSnapshot(); };
  loop();
  setInterval(loop, 5000);
} else {
  tick();
  refreshSnapshot();
}
