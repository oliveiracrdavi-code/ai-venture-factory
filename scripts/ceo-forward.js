#!/usr/bin/env node
'use strict';
/**
 * ceo-forward.js — GATE DO CEO (A07). Decide se uma oportunidade proposta por
 * um agente de pesquisa (company/opportunities/OPP-XXXX.md) chega ou não ao
 * Chatbot Humano do fundador.
 *
 * REGRA DURA: este é o ÚNICO script do repositório que escreve em
 * company/state/approvals.json (pending). Nenhum outro agente ou processo
 * pode empurrar algo pro painel do fundador sem passar por aqui.
 *
 *   node scripts/ceo-forward.js <OPP-ID> encaminhar
 *   node scripts/ceo-forward.js <OPP-ID> arquivar "motivo da rejeicao"
 */
var fs = require('fs');
var path = require('path');
var L = require('./avf-lib');

var ROOT = path.resolve(__dirname, '..');
var OPP_DIR = path.join(ROOT, 'company', 'opportunities');
var APPROVALS = path.join(L.P.stateDir, 'approvals.json');

function main() {
  var args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('uso: node scripts/ceo-forward.js <OPP-ID> encaminhar|arquivar ["motivo"]');
    process.exit(1);
  }
  var id = String(args[0]).toUpperCase();
  var action = args[1];
  var reason = L.maskSecrets(args[2] || '');
  var file = path.join(OPP_DIR, id + '.md');

  if (!fs.existsSync(file)) { console.error('oportunidade nao encontrada: ' + file); process.exit(2); }
  if (action !== 'encaminhar' && action !== 'arquivar') { console.error('acao invalida (use encaminhar ou arquivar)'); process.exit(2); }

  var content = fs.readFileSync(file, 'utf8');
  var agentMatch = content.match(/^agent:\s*(\S+)/m);
  var titleMatch = content.match(/^#\s*OPP-\d+\s*—\s*(.+)$/m);
  var agent = agentMatch ? agentMatch[1] : 'A0?';
  var title = titleMatch ? titleMatch[1] : id;

  if (action === 'arquivar') {
    content = content.replace(/^status:\s*.*/m, 'status: arquivada');
    content += '\n## Decisão do CEO\nARQUIVADA. Motivo: ' + (reason || '(não informado)') + '\n';
    fs.writeFileSync(file, content);
    L.appendEvent({
      agent: 'A07', task: id, type: 'opportunity-archived', tool: 'ceo-forward.js',
      summary: 'CEO ARQUIVOU ' + id + ' (' + title + '). Motivo: ' + (reason || '—') + '. NÃO chega ao fundador.',
      model: 'claude-sonnet-5', effort: 'high'
    });
    console.log(id + ' arquivada. Não foi enviada ao fundador.');
    return;
  }

  content = content.replace(/^status:\s*.*/m, 'status: encaminhada');
  content += '\n## Decisão do CEO\nENCAMINHADA ao fundador em ' + new Date().toISOString() + '.\n';
  fs.writeFileSync(file, content);

  var st = L.readJSON(APPROVALS, { pending: [], history: [] });
  if (!st.pending) st.pending = [];
  st.pending.push({
    id: id, agent: 'A07', task: id,
    request: '[Oportunidade — ' + agent + '] ' + title + ' — o CEO validou e recomenda aprovar a construção deste app/solução. Ver company/opportunities/' + id + '.md para o detalhe completo.',
    ts: new Date().toISOString()
  });
  L.writeJSON(APPROVALS, st);

  L.appendEvent({
    agent: 'A07', task: id, type: 'opportunity-forwarded', tool: 'ceo-forward.js',
    summary: 'CEO ENCAMINHOU ' + id + ' (' + title + ', originada de ' + agent + ') ao fundador para aprovação.',
    model: 'claude-sonnet-5', effort: 'high'
  });
  console.log(id + ' encaminhada ao Chatbot Humano do fundador (approvals.json).');
}

main();
