#!/usr/bin/env node
'use strict';
/**
 * propose-opportunity.js — um agente de pesquisa registra uma oportunidade
 * (app/solução que valeria a pena construir e vender) encontrada em pesquisa
 * profunda. NÃO chega no fundador sozinho: fica em company/opportunities/
 * como "proposta" até o A07 (CEO) decidir encaminhar ou arquivar
 * (scripts/ceo-forward.js). Essa é a ÚNICA porta de entrada para o painel
 * de aprovações do fundador — nenhum outro script escreve em approvals.json.
 *
 *   node scripts/propose-opportunity.js <agente> "<titulo>" "<resumo>" "<evidencia/fontes>" [custo_estimado]
 *
 * Exemplo:
 *   node scripts/propose-opportunity.js A03 "App de agenda para tatuadores" \
 *     "Tatuadores autonomos usam WhatsApp p/ agendar e perdem horario. App simples de agenda+deposito." \
 *     "grupo FB 'Tatuadores do Brasil' 40k membros; nenhum concorrente direto achado" 0
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

var ROOT = path.resolve(__dirname, '..');
var OPP_DIR = path.join(ROOT, 'company', 'opportunities');

function nextOppId() {
  try { fs.mkdirSync(OPP_DIR, { recursive: true }); } catch (_) {}
  var files = fs.readdirSync(OPP_DIR).filter(function (f) { return /^OPP-\d+\.md$/.test(f); });
  var max = 0;
  files.forEach(function (f) { var n = parseInt(f.slice(4, 8), 10); if (n > max) max = n; });
  var next = max + 1;
  return 'OPP-' + String(next).padStart(4, '0');
}

function main() {
  var args = process.argv.slice(2);
  if (args.length < 4) {
    console.log('uso: node scripts/propose-opportunity.js <agente> "<titulo>" "<resumo>" "<evidencia>" [custo_estimado]');
    process.exit(1);
  }
  var agent = String(args[0]).toUpperCase();
  var title = L.maskSecrets(args[1]);
  var summary = L.maskSecrets(args[2]);
  var evidence = L.maskSecrets(args[3]);
  var cost = args[4] || '0 (sem custo — free-tier/gratis)';

  if (!/^A\d{2}$/.test(agent)) { console.error('agente invalido: ' + agent); process.exit(2); }

  var id = nextOppId();
  var today = new Date().toISOString().slice(0, 10);
  var md = [
    '---',
    'id: ' + id,
    'agent: ' + agent,
    'status: proposta',
    'created: ' + today,
    '---',
    '',
    '# ' + id + ' — ' + title,
    '',
    '## Resumo',
    summary,
    '',
    '## Evidência / fontes',
    evidence,
    '',
    '## Custo estimado',
    cost,
    '',
    '## Regra',
    'Esta proposta NÃO é visível ao fundador ainda. Só chega no Chatbot Humano',
    'se o A07 (CEO) rodar `node scripts/ceo-forward.js ' + id + ' encaminhar` —',
    'única porta de entrada do painel de aprovações. Ver company/decisions/.',
    ''
  ].join('\n');

  fs.mkdirSync(OPP_DIR, { recursive: true });
  fs.writeFileSync(path.join(OPP_DIR, id + '.md'), md);

  L.appendEvent({
    agent: agent, task: null, type: 'opportunity-proposed', tool: 'propose-opportunity.js',
    summary: agent + ' propôs oportunidade ' + id + ': ' + title.slice(0, 100) + ' (aguardando triagem do CEO)',
    model: 'claude-sonnet-5', effort: 'medium'
  });

  console.log(id + ' criada em company/opportunities/' + id + '.md');
  console.log('Próximo passo: A07 decide com `node scripts/ceo-forward.js ' + id + ' encaminhar|arquivar "motivo"`');
}

main();
