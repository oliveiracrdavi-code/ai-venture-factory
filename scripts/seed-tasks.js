#!/usr/bin/env node
'use strict';
/**
 * seed-tasks.js - cria as primeiras TASKs do projeto piloto (app-001).
 * Usado na PARTE 5. Idempotente: nao sobrescreve TASK existente sem --force.
 *
 *   node scripts/seed-tasks.js
 *   node scripts/seed-tasks.js --force
 *   node scripts/seed-tasks.js --with-idea "texto curto da ideia do piloto"
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

var FORCE = process.argv.indexOf('--force') !== -1;
var ideaArgIdx = process.argv.indexOf('--with-idea');
var IDEA = ideaArgIdx !== -1 ? (process.argv[ideaArgIdx + 1] || '') : '';
var PROJECT = 'app-001';
var TODAY = new Date().toISOString().slice(0, 10);

// fila inicial do piloto: G1 (pesquisa) + G2 (viabilidade)
var SEED = [
  { id: 'TASK-0001', agent: 'A01', gate: 'G1', prio: 4, dep: [], title: 'pesquisa de mercado (TAM/SAM/SOM, disposicao a pagar)',
    out: 'secoes 5 e 7 de company/projects/app-001/brief.md + tabela de fontes' },
  { id: 'TASK-0002', agent: 'A02', gate: 'G1', prio: 4, dep: [], title: 'analise de concorrencia (matriz, precos, fraquezas)',
    out: 'secao 6 de company/projects/app-001/brief.md + matriz 2x2' },
  { id: 'TASK-0003', agent: 'A03', gate: 'G1', prio: 3, dep: [], title: 'sinais de demanda e tendencias',
    out: 'company/projects/app-001/trend-signals.md' },
  { id: 'TASK-0004', agent: 'A04', gate: 'G1', prio: 4, dep: [], title: 'dores reais, personas, jobs-to-be-done',
    out: 'secoes 1-3 de company/projects/app-001/brief.md + personas.md' },
  { id: 'TASK-0005', agent: 'A08', gate: 'G1', prio: 3, dep: ['TASK-0001', 'TASK-0002', 'TASK-0003', 'TASK-0004'],
    title: 'consolidar brief.md e despachar G2', out: 'company/projects/app-001/brief.md consolidado' },
  { id: 'TASK-0006', agent: 'A05', gate: 'G2', prio: 3, dep: ['TASK-0005'], title: 'modelo financeiro + notas do score',
    out: 'financial-model + linhas de A05 em score.md' },
  { id: 'TASK-0007', agent: 'A06', gate: 'G2', prio: 3, dep: ['TASK-0005'], title: 'parecer de viabilidade tecnica + notas do score',
    out: 'secao 9 do brief + linhas de A06 em score.md + tech-risks.md' },
  { id: 'TASK-0008', agent: 'A10', gate: 'G2', prio: 3, dep: ['TASK-0005'], title: 'riscos legais/LGPD + notas do score',
    out: 'company/projects/app-001/risk-report.md + linhas de A10 em score.md' },
];

function taskMd(t) {
  return [
    '---',
    'id: ' + t.id,
    'agent: ' + t.agent,
    'status: queued',
    'priority: ' + t.prio,
    'gate: ' + t.gate,
    'project: ' + PROJECT,
    'depends_on: [' + t.dep.join(', ') + ']',
    'created: ' + TODAY,
    'updated: ' + TODAY,
    '---',
    '',
    '# ' + t.id + ' - ' + t.title,
    '',
    '## Agente responsavel',
    t.agent,
    '',
    '## Objetivo',
    t.title + '.',
    '',
    '## Contexto',
    'Projeto piloto ' + PROJECT + '. Gate ' + t.gate + '. Ver company/projects/' + PROJECT + '/idea.md.',
    '',
    '## Saida esperada',
    '- ' + t.out,
    '',
    '## Criterio de aceite',
    '- [ ] artefato criado no caminho indicado',
    '- [ ] acao registrada em company/logs/events.jsonl (com model e effort)',
    '- [ ] nao aprova o proprio trabalho',
    '',
  ].join('\n');
}

function main() {
  var projDir = path.join(L.P.projectsDir, PROJECT);
  fs.mkdirSync(projDir, { recursive: true });

  var ideaPath = path.join(projDir, 'idea.md');
  if (!fs.existsSync(ideaPath) || FORCE) {
    var ideaBody = IDEA
      ? IDEA
      : 'PENDENTE - a ideia do piloto sera definida na PARTE 5 (A01-A04 propoem 3 nichos, humano escolhe).';
    fs.writeFileSync(ideaPath, [
      '# Ideia - ' + PROJECT,
      '',
      '## Problema / publico / hipotese',
      ideaBody,
      '',
      '## Status G0 (intake)',
      IDEA ? 'definida' : 'pendente (PARTE 5)',
      '',
    ].join('\n'));
    console.log((IDEA ? 'idea.md gravada' : 'idea.md placeholder criado') + ': ' + ideaPath);
  } else {
    console.log('idea.md ja existe (use --force para sobrescrever)');
  }

  var created = 0, skipped = 0;
  SEED.forEach(function (t) {
    var fp = path.join(L.P.tasksDir, t.id + '.md');
    if (fs.existsSync(fp) && !FORCE) { skipped++; return; }
    fs.writeFileSync(fp, taskMd(t));
    created++;
  });

  L.appendEvent({
    agent: 'seed-tasks', task: null, type: 'seed', tool: 'seed-tasks.js',
    summary: 'piloto ' + PROJECT + ': ' + created + ' TASK(s) criadas, ' + skipped + ' ja existiam' +
      (IDEA ? ' | idea definida' : ' | idea pendente'),
    model: 'claude-sonnet-5', effort: 'medium',
  });

  console.log('seed-tasks: ' + created + ' criada(s), ' + skipped + ' ignorada(s).');
  console.log('Proximo: node scripts/orchestrator.js tick');
}

main();
