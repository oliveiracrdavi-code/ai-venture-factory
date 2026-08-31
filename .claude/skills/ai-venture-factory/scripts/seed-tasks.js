#!/usr/bin/env node
'use strict';
/**
 * seed-tasks.js - cria as primeiras TASKs do projeto piloto (G1 pesquisa +
 * G2 viabilidade). Idempotente: nao sobrescreve TASK existente sem --force.
 *
 *   node scripts/seed-tasks.js
 *   node scripts/seed-tasks.js --force
 *   node scripts/seed-tasks.js --with-idea "texto curto da ideia do piloto"
 *   node scripts/seed-tasks.js --project meu-slug
 *
 * Sem --with-idea: se o PROJECT_ROOT (cwd) ja for um projeto existente
 * (tem package.json e/ou README.md), a ideia e' pre-preenchida com o
 * contexto real desse projeto ("evoluir o projeto existente X") em vez de
 * ficar pendente - e' assim que a fabrica se integra a sessao do usuario.
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

var FORCE = process.argv.indexOf('--force') !== -1;
var ideaArgIdx = process.argv.indexOf('--with-idea');
var IDEA = ideaArgIdx !== -1 ? (process.argv[ideaArgIdx + 1] || '') : '';
var projectArgIdx = process.argv.indexOf('--project');
var PROJECT_ARG = projectArgIdx !== -1 ? (process.argv[projectArgIdx + 1] || '') : '';
var TODAY = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Deteccao do projeto ALVO (integra a sessao atual em vez de simular no vazio)
// ---------------------------------------------------------------------------
function slugify(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'app-001';
}
function readJsonSafe(fp) { try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (_) { return null; } }
function readTextSafe(fp) { try { return fs.readFileSync(fp, 'utf8'); } catch (_) { return ''; } }

function detectExistingProject() {
  var pkg = readJsonSafe(path.join(L.P.projectRoot, 'package.json'));
  var readme = readTextSafe(path.join(L.P.projectRoot, 'README.md')) || readTextSafe(path.join(L.P.projectRoot, 'readme.md'));
  var readmeIntro = readme
    ? readme.split(/\r?\n/).filter(function (l) { return l.trim() && !/^#/.test(l.trim()); })[0]
    : '';
  var isNewSkillCheckout = fs.existsSync(path.join(L.P.projectRoot, '.claude', 'skills', 'ai-venture-factory')) &&
    !pkg && !readme; // clone vazio ainda sem projeto real dentro
  if (!pkg && !readme) return null;
  var name = (pkg && pkg.name) || path.basename(L.P.projectRoot);
  var desc = (pkg && pkg.description) || readmeIntro || '';
  return { name: name, description: desc, isNewSkillCheckout: isNewSkillCheckout };
}

var detected = detectExistingProject();
var PROJECT = slugify(PROJECT_ARG || (detected && detected.name) || 'app-001');

// fila inicial do piloto: G1 (pesquisa) + G2 (viabilidade)
var SEED = [
  { id: 'TASK-0001', agent: 'A01', gate: 'G1', prio: 4, dep: [], title: 'pesquisa de mercado (TAM/SAM/SOM, disposicao a pagar)',
    out: 'secoes 5 e 7 de company/projects/' + PROJECT + '/brief.md + tabela de fontes' },
  { id: 'TASK-0002', agent: 'A02', gate: 'G1', prio: 4, dep: [], title: 'analise de concorrencia (matriz, precos, fraquezas)',
    out: 'secao 6 de company/projects/' + PROJECT + '/brief.md + matriz 2x2' },
  { id: 'TASK-0003', agent: 'A03', gate: 'G1', prio: 3, dep: [], title: 'sinais de demanda e tendencias',
    out: 'company/projects/' + PROJECT + '/trend-signals.md' },
  { id: 'TASK-0004', agent: 'A04', gate: 'G1', prio: 4, dep: [], title: 'dores reais, personas, jobs-to-be-done',
    out: 'secoes 1-3 de company/projects/' + PROJECT + '/brief.md + personas.md' },
  { id: 'TASK-0005', agent: 'A08', gate: 'G1', prio: 3, dep: ['TASK-0001', 'TASK-0002', 'TASK-0003', 'TASK-0004'],
    title: 'consolidar brief.md e despachar G2', out: 'company/projects/' + PROJECT + '/brief.md consolidado' },
  { id: 'TASK-0006', agent: 'A05', gate: 'G2', prio: 3, dep: ['TASK-0005'], title: 'modelo financeiro + notas do score',
    out: 'financial-model + linhas de A05 em score.md' },
  { id: 'TASK-0007', agent: 'A06', gate: 'G2', prio: 3, dep: ['TASK-0005'], title: 'parecer de viabilidade tecnica + notas do score',
    out: 'secao 9 do brief + linhas de A06 em score.md + tech-risks.md' },
  { id: 'TASK-0008', agent: 'A10', gate: 'G2', prio: 3, dep: ['TASK-0005'], title: 'riscos legais/LGPD + notas do score',
    out: 'company/projects/' + PROJECT + '/risk-report.md + linhas de A10 em score.md' },
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
    'Projeto ' + PROJECT + '. Gate ' + t.gate + '. Ver company/projects/' + PROJECT + '/idea.md.' +
      (detected ? ' Este e' + "'" + ' um projeto EXISTENTE na sessao (' + detected.name + ') - o codigo real vive na raiz do repositorio, fora de company/.' : ''),
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

function ideaBody() {
  if (IDEA) return IDEA;
  if (detected && !detected.isNewSkillCheckout) {
    return 'INTEGRACAO COM PROJETO EXISTENTE: "' + detected.name + '".\n' +
      (detected.description ? 'Descricao atual: ' + detected.description + '\n' : '') +
      '\nA fabrica deve pesquisar o mercado/nicho deste projeto especifico (nao propor um ' +
      'produto do zero) e, a partir do G4, evoluir o codigo REAL deste repositorio ' +
      '(fora de `company/`) - nao um sandbox separado. A08 (chief-of-staff) le o codigo ' +
      'existente (README, package.json, estrutura de pastas) antes de consolidar o brief.';
  }
  return 'PENDENTE - a ideia sera definida por A01-A04 (propoem 3 nichos, humano escolhe).';
}

function main() {
  var projDir = path.join(L.P.projectsDir, PROJECT);
  fs.mkdirSync(projDir, { recursive: true });

  var ideaPath = path.join(projDir, 'idea.md');
  if (!fs.existsSync(ideaPath) || FORCE) {
    var body = ideaBody();
    fs.writeFileSync(ideaPath, [
      '# Ideia - ' + PROJECT,
      '',
      '## Problema / publico / hipotese',
      body,
      '',
      '## Status G0 (intake)',
      (IDEA || (detected && !detected.isNewSkillCheckout)) ? 'definida' : 'pendente',
      '',
    ].join('\n'));
    console.log('idea.md gravada: ' + ideaPath);
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
    summary: 'projeto ' + PROJECT + ': ' + created + ' TASK(s) criadas, ' + skipped + ' ja existiam' +
      (detected ? ' | integrado ao projeto existente "' + detected.name + '"' : ' | idea pendente'),
    model: 'claude-sonnet-5', effort: 'medium',
  });

  console.log('seed-tasks: ' + created + ' criada(s), ' + skipped + ' ignorada(s). projeto=' + PROJECT);
  console.log('Proximo: node ' + path.relative(L.P.projectRoot, path.join(__dirname, 'orchestrator.js')) + ' tick');
}

main();
