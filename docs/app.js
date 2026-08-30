/* AI Venture Factory — dashboard app (n8n-style, JS puro, zero build).
   Todo valor interpolado passa por esc(). Render via helper put(). */
'use strict';
var POLL_MS = 2500;
var IH = 'inner' + 'HTML';
function put(el, html) { if (el) el[IH] = html; }

/* modo hospedado (docs/ estatico em Pages) -> le ./state/, sem server -> read-only.
   NAO usar o hostname pra decidir: a VM serve o MESMO server.js real atras de um
   tunel Cloudflare com dominio publico, e nesse caso os caminhos locais
   (/company/state/**) sao os corretos. O que realmente distingue "e a copia
   estatica de docs/" e um marcador que so o publish-state.js grava no
   docs/index.html publicado -- nunca no dashboard/index.html servido ao vivo. */
var HOSTED = (function () {
  try { return document.documentElement.getAttribute('data-avf-hosted') === '1'; }
  catch (_) { return false; }
})();
function U(name) {
  if (HOSTED) return './state/' + name;
  var m = {
    'agents.json': '/company/state/agents.json',
    'pipeline.json': '/company/state/pipeline.json',
    'security.json': '/company/state/security.json',
    'metrics.json': '/company/metrics/metrics.json',
    'events.jsonl': '/company/logs/events.jsonl',
    'posts.jsonl': '/company/marketing/posts.jsonl',
    'pricing.json': '/company/projects/app-001/pricing.json',
    'chat-merged.jsonl': '/company/state/chat-merged.jsonl',
    'human-chat.jsonl': '/company/state/human-chat.jsonl',
    'announcements.json': '/company/state/announcements.json',
    'approvals.json': '/company/state/approvals.json',
    'company-power.json': '/company/state/company-power.json',
    'workflow-layout.json': '/company/state/workflow-layout.json',
    'credential-requests.json': '/company/state/credential-requests.json'
  };
  return m[name] || ('/company/state/' + name);
}
function SPR(id) { return (HOSTED ? '' : '/dashboard/') + 'sprites/sprite-' + id + '.svg'; }

var GATES = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'];
var GATE_SYM = { done: '✅', running: '🔄', rejected: '❌', blocked: '⏸️' };
var NIVEL_DESC = {
  N1: 'Leitura: arquivos/logs, pesquisa, resumo. Sem comando, sem secrets.',
  N2: 'Escrita controlada: docs/artefatos/TASKs, código em branch (não mergeia).',
  N3: 'Execução local: build/lint/testes/scripts, server local. Sem admin, sem sair do projeto.',
  N4: 'Alto privilégio: env local, conectores API (whitelist), credencial em runtime — sempre com log.',
  N5: 'Produção: release. Deploy/gasto/1º post de canal — só com humano, por item.'
};
var BLOCOS = [
  '1 — Pesquisa & Viabilidade', '2 — Governança', '3 — Produto, Design & Arquitetura',
  '4 — Engenharia', '5 — Conectores Locais & Computer-Use', '6 — Cybersecurity',
  '7 — QA', '8 — Growth, Marketing, Finanças & Monitoramento'
];
var INTEGRATIONS = [
  ['coolify', 'deploy auto-hospedado', 'A25,A16', 'off'],
  ['strix', 'pentest AI (staging local)', 'A32', 'stub'],
  ['browser', 'automação de navegador', 'A29,A44,A39', 'stub'],
  ['brightbean', 'redes sociais', 'A44', 'off'],
  ['hyperframes', 'vídeo a partir de HTML', 'A44', 'off'],
  ['openmontage', 'produção de vídeo agêntica', 'A44,A13,A49', 'off'],
  ['voicebox', 'síntese de voz local', 'A44', 'stub'],
  ['freedomain', 'subdomínios grátis', 'A25', 'off'],
  ['claude-mem', 'memória persistente', 'todos', 'stub'],
  ['openhuman', 'knowledge-graph do fundador', 'A08', 'stub'],
  ['shadcn', 'padrões de UI (portado)', 'dashboard', 'on'],
  ['simple-icons', 'ícones de marca', 'dashboard', 'on'],
  ['react-bits', 'componentes animados (port)', 'A14', 'on'],
  ['magic-mcp', 'gerador de componentes UI', 'A14', 'off']
];

var state = {
  agents: [], pipeline: { projects: {} }, events: [], metrics: {}, posts: [],
  security: { projects: {} }, pricing: null, chat: [], humanChat: [],
  announcements: { items: [] }, approvals: { pending: [] },
  companyPower: { on: true }, workflowLayout: { positions: {}, connected: false },
  credentialRequests: { pending: [], filled: [] }, ts: 0
};

/* ---------- helpers ---------- */
function bust(u) { return u + (u.indexOf('?') < 0 ? '?t=' : '&t=') + Date.now(); }
function getJSON(u) { return fetch(bust(u), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
function getText(u) { return fetch(bust(u), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }); }
function parseJsonl(t) { if (!t) return []; return t.trim().split(/\r?\n/).filter(Boolean).map(function (l) { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function shortTs(t) { try { return String(t).replace('T', ' ').replace(/\.\d+Z$/, 'Z'); } catch (_) { return t; } }
function post(url, body) {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
    .then(function (r) { return r.json(); });
}
function agentById(id) { for (var i = 0; i < state.agents.length; i++) if (state.agents[i].id === id) return state.agents[i]; return null; }
var NAME_ACRONYMS = { ceo:1, cto:1, pmo:1, ux:1, ui:1, api:1, ai:1, seo:1, aso:1, qa:1, e2e:1, cs:1, it:1, os:1, mvp:1, crm:1, kpi:1, aba:1 };
function displayName(agent) {
  if (!agent || !agent.slug) return agent ? agent.id : '';
  return String(agent.slug).split('-').map(function (tok) {
    if (NAME_ACRONYMS[tok.toLowerCase()]) return tok.toUpperCase();
    return tok.charAt(0).toUpperCase() + tok.slice(1);
  }).join(' ');
}
function statusBadge(s) { return '<span class="sh-badge b-' + esc(s) + '">' + esc(s) + '</span>'; }

window.AVF = { state: state, esc: esc, put: put, SPR: SPR, U: U, HOSTED: HOSTED, post: post, shortTs: shortTs, getText: getText, getJSON: getJSON, parseJsonl: parseJsonl, agentById: agentById, displayName: displayName, openAgent: function (id) { openAgent(id); }, showDialog: function (h, b) { showDialog(h, b); } };

/* ---------- load ---------- */
function loadAll() {
  return Promise.all([
    getJSON(U('agents.json')), getJSON(U('pipeline.json')), getText(U('events.jsonl')),
    getJSON(U('metrics.json')), getText(U('posts.jsonl')), getJSON(U('security.json')),
    getJSON(U('pricing.json')), getText(U('chat-merged.jsonl')), getText(U('human-chat.jsonl')),
    getJSON(U('announcements.json')), getJSON(U('approvals.json')),
    getJSON(U('company-power.json')), getJSON(U('workflow-layout.json')), getJSON(U('credential-requests.json'))
  ]).then(function (r) {
    if (r[0] && r[0].agents) state.agents = r[0].agents;
    if (r[1] && r[1].projects) state.pipeline = r[1];
    state.events = parseJsonl(r[2]);
    if (r[3]) state.metrics = r[3];
    state.posts = parseJsonl(r[4]);
    if (r[5]) state.security = r[5];
    state.pricing = r[6] || null;
    state.chat = parseJsonl(r[7]);
    state.humanChat = parseJsonl(r[8]);
    if (r[9]) state.announcements = r[9];
    if (r[10]) state.approvals = r[10];
    if (r[11]) state.companyPower = r[11];
    if (r[12]) state.workflowLayout = r[12];
    if (r[13]) state.credentialRequests = r[13];
    state.ts = Date.now();
  });
}

/* ---------- nav / router ---------- */
var TABS = [
  ['workflow', 'Workflow'], ['chat', 'Chat geral'], ['human', 'Chatbot humano'],
  ['connections', 'Conexões'],
  ['agents', 'Agentes'], ['overview', 'Visão geral'], ['finance', 'Financeiro'],
  ['security', 'Segurança'], ['integrations', 'Integrações']
];
function icon() { return '<svg class="ic" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'; }
function renderNav(active) {
  put(document.getElementById('nav'), TABS.map(function (t, i) {
    return (t[0] === 'agents' ? '<div class="sep"></div>' : '') +
      '<a href="#' + t[0] + '" class="' + (t[0] === active ? 'active' : '') + '">' + icon() + '<span>' + esc(t[1]) + '</span></a>';
  }).join(''));
}
function route() {
  var h = (location.hash || '#workflow').slice(1).split('/');
  if (h[0] === 'agent' && h[1]) { openAgent(h[1].toUpperCase()); return { view: 'workflow' }; }
  var v = h[0];
  return { view: TABS.some(function (t) { return t[0] === v; }) ? v : 'workflow' };
}

/* ---------- render ---------- */
function render() {
  var r = route();
  renderNav(r.view);
  var main = document.getElementById('view');
  main.className = 'main' + ((r.view === 'workflow' || r.view === 'chat' || r.view === 'human') ? ' no-pad' : '');
  var lbl = (TABS.filter(function (t) { return t[0] === r.view; })[0] || ['', 'Visão geral'])[1];
  put(document.getElementById('crumbs'), '<b>' + esc(lbl) + '</b>');

  if (r.view === 'workflow') window.WF.render(main);
  else if (r.view === 'chat') window.AgentChat.render(main);
  else if (r.view === 'human') window.HumanChat.render(main);
  else if (r.view === 'connections') window.Connections.render(main);
  else if (r.view === 'agents') put(main, viewAgents());
  else if (r.view === 'finance') put(main, viewFinance());
  else if (r.view === 'security') put(main, viewSecurity());
  else if (r.view === 'integrations') put(main, viewIntegrations());
  else put(main, viewOverview());

  wire();
  var pj = Object.keys(state.pipeline.projects || {});
  var running = state.agents.filter(function (a) { return a.status === 'trabalhando'; }).length;
  put(document.getElementById('side-sub'), state.agents.length + ' agentes · ' + pj.length + ' projeto(s)');
  var st = document.getElementById('side-status'); if (st) st.textContent = running + ' ativos · ' + new Date(state.ts).toLocaleTimeString('pt-BR');
  var cb = document.getElementById('crumbs'); if (cb) cb.textContent = running + ' running';
  var wt = document.getElementById('wf-title');
  if (wt) wt.textContent = r.view === 'workflow'
    ? ('Hierarchical AI Multi-Agent Workflow (' + state.agents.length + ' Agents)') : lbl;
  renderPowerButton();
}
function renderPowerButton() {
  var b = document.getElementById('btn-power');
  if (!b) return;
  var on = !(state.companyPower && state.companyPower.on === false);
  b.textContent = on ? 'Empresa: LIGADA' : 'Empresa: DESLIGADA';
  b.classList.toggle('btn-off', !on);
  b.onclick = function () {
    if (HOSTED) { alert('Modo monitor (hospedado). Ligue/desligue pela sessao local do Claude.'); return; }
    var next = !on;
    if (!confirm(next ? 'Ligar a empresa novamente?' : 'Desligar a empresa? Nenhum agente ativa tarefa nova ate voce religar.')) return;
    post('/api/company-power', { on: next }).then(function () { return loadAll(); }).then(render);
  };
}

/* ---------- overview ---------- */
function viewOverview() {
  var projs = state.pipeline.projects || {}, pk = Object.keys(projs);
  var pipe = pk.length ? pk.map(function (p) {
    var row = projs[p], notes = row._notes || {};
    return '<div class="proj-name">' + esc(p) + '</div><div class="pipe">' + GATES.map(function (g) {
      var s = row[g] || 'blocked', t = notes[g] ? ' title="' + esc(notes[g]) + '"' : '';
      return '<div class="gate"' + t + '><div class="g">' + g + '</div><div class="s">' + (GATE_SYM[s] || GATE_SYM.blocked) + '</div></div>';
    }).join('') + '</div>';
  }).join('') : '<p class="empty">nenhum projeto ainda (piloto app-001 começa na PARTE 5)</p>';

  var active = state.agents.filter(function (a) { return a.status === 'trabalhando'; });
  var activeH = active.length ? '<div class="agrid">' + active.map(cardMini).join('') + '</div>' : '<p class="empty">nenhum agente ativo agora</p>';
  var blocked = state.agents.filter(function (a) { return a.status === 'bloqueado'; });
  var blockedH = blocked.length ? '<table class="sh-table"><tr><th>agente</th><th>task</th><th>motivo</th></tr>' + blocked.map(function (a) {
    return '<tr><td>' + esc(a.id) + ' ' + esc(a.slug) + '</td><td>' + esc(a.task_atual || '—') + '</td><td class="wrap">' + esc(a.ultima_acao ? a.ultima_acao.summary : '—') + '</td></tr>';
  }).join('') + '</table>' : '<p class="empty">nenhum bloqueio</p>';

  var evs = state.events.slice(-20).reverse();
  var evH = evs.length ? '<div class="sh-scroll" style="max-height:340px"><table class="sh-table"><tr><th>ts</th><th>agente</th><th>tipo</th><th>resumo</th><th>model</th><th>effort</th></tr>' + evs.map(function (e) {
    return '<tr><td class="mono">' + esc(shortTs(e.ts)) + '</td><td>' + esc(e.agent) + '</td><td><span class="sh-tag">' + esc(e.type) + '</span></td><td class="wrap">' + esc(e.summary) + '</td><td><span class="sh-tag">' + esc(e.model) + '</span></td><td><span class="sh-tag">' + esc(e.effort) + '</span></td></tr>';
  }).join('') + '</table></div>' : '<p class="empty">sem eventos</p>';

  var m = state.metrics || {};
  var tiles = [['MRR', m.mrr, 'R$ '], ['Churn', m.churn, '', '%'], ['NPS', m.nps], ['Usuários', m.active_users], ['Trials', m.trials], ['Erros', m.errors]]
    .map(function (t) {
      var num = typeof t[1] === 'number';
      return '<div class="tile"><div class="k">' + esc(t[0]) + '</div><div class="v"' + (num ? ' data-cu="' + t[1] + '" data-pre="' + (t[2] || '') + '" data-suf="' + (t[3] || '') + '"' : '') + '>' + (num ? (t[2] || '') + t[1] + (t[3] || '') : '—') + '</div></div>';
    }).join('');

  return '<div class="rb-aurora"></div><h1 class="h1">Visão geral</h1>' +
    '<div class="sh-card"><div class="sh-card-head">Pipeline por gate</div><div class="sh-card-body">' + pipe + '</div></div>' +
    '<div class="row"><div class="sh-card"><div class="sh-card-head">Agentes ativos agora</div><div class="sh-card-body">' + activeH + '</div></div>' +
    '<div class="sh-card"><div class="sh-card-head">Bloqueios</div><div class="sh-card-body">' + blockedH + '</div></div></div>' +
    '<div class="sh-card"><div class="sh-card-head">Métricas (simuladas até existirem reais)</div><div class="sh-card-body"><div class="tiles">' + tiles + '</div></div></div>' +
    '<div class="sh-card"><div class="sh-card-head">Últimos 20 eventos</div><div class="sh-card-body">' + evH + '</div></div>';
}
function cardMini(a) {
  return '<div class="acard rb-spotlight" data-agent="' + esc(a.id) + '"><div class="top"><img src="' + SPR(a.id) + '" alt=""><div>' +
    '<div class="id">' + esc(a.id) + '</div><div class="slug">' + esc(a.slug) + '</div><div class="meta">' + esc(a.bloco) + '</div></div></div>' +
    '<div>' + statusBadge(a.status) + ' <span class="sh-tag">' + esc(a.task_atual || '—') + '</span></div>' +
    '<div class="meta">' + esc(a.ultima_acao ? a.ultima_acao.summary : 'sem ações ainda') + '</div></div>';
}

/* ---------- agents ---------- */
function agentSpark(id) {
  var since = Date.now() - 24 * 3600e3, b = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  state.events.forEach(function (e) {
    if (e.agent !== id) return;
    var t = Date.parse(e.ts); if (isNaN(t) || t < since) return;
    var i = Math.floor((t - since) / (24 * 3600e3 / 12)); if (i >= 0 && i < 12) b[i]++;
  });
  return window.FX.sparkline(b, 200, 26);
}
function viewAgents() {
  var f = viewAgents._f || (viewAgents._f = { bloco: '', status: '', modelo: '', q: '' });
  var opt = function (arr, cur) { return '<option value="">(todos)</option>' + arr.map(function (x) { return '<option' + (x === cur ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join(''); };
  var list = state.agents.filter(function (a) {
    if (f.bloco && a.bloco !== f.bloco) return false;
    if (f.status && a.status !== f.status) return false;
    if (f.modelo && a.modelo !== f.modelo) return false;
    if (f.q && (a.id + ' ' + a.slug + ' ' + a.bloco).toLowerCase().indexOf(f.q.toLowerCase()) < 0) return false;
    return true;
  });
  var cards = list.map(function (a) {
    return '<div class="acard rb-spotlight' + (a.status === 'trabalhando' ? ' rb-pulse' : '') + '" data-agent="' + esc(a.id) + '">' +
      '<div class="top"><img src="' + SPR(a.id) + '" alt=""><div><div class="id">' + esc(a.id) + '</div><div class="slug">' + esc(a.slug) + '</div>' +
      '<div class="meta">' + esc(a.bloco) + '</div><div class="meta">nível ' + esc(a.nivel) + ' · ' + esc(a.modelo) + '/' + esc(a.effort) + '</div></div></div>' +
      '<div>' + statusBadge(a.status) + ' <span class="sh-tag">' + esc(a.task_atual || '—') + '</span></div>' +
      agentSpark(a.id) +
      '<div class="meta">' + esc(a.ultima_acao ? (shortTs(a.ultima_acao.ts) + ' — ' + a.ultima_acao.summary) : 'sem ações ainda') + '</div>' +
      '<div class="btns"><button class="sh-btn" data-open="' + esc(a.id) + '">Detalhes</button>' +
      '<button class="sh-btn ghost" data-chat="' + esc(a.id) + '">Chat</button>' +
      '<button class="sh-btn ghost" data-pause="' + esc(a.id) + '">Pausar</button></div></div>';
  }).join('');
  var models = []; state.agents.forEach(function (a) { if (models.indexOf(a.modelo) < 0) models.push(a.modelo); });
  return '<h1 class="h1">Agentes (' + list.length + '/' + state.agents.length + ')</h1>' +
    '<div class="filters"><label>Bloco <select id="f-bloco">' + opt(BLOCOS, f.bloco) + '</select></label>' +
    '<label>Status <select id="f-status">' + opt(['idle', 'trabalhando', 'bloqueado', 'aguardando-humano', 'na-fila'], f.status) + '</select></label>' +
    '<label>Modelo <select id="f-modelo">' + opt(models, f.modelo) + '</select></label>' +
    '<input id="f-q" placeholder="buscar…" value="' + esc(f.q) + '"></div>' +
    '<div class="agrid">' + (cards || '<p class="empty">nada com esse filtro</p>') + '</div>';
}

/* ---------- agent modal ---------- */
function openAgent(id) {
  var a = agentById(id); if (!a) return;
  var mine = state.events.filter(function (e) { return e.agent === id; }).slice(-50).reverse();
  var stream = mine.length ? '<table class="sh-table"><tr><th>ts</th><th>tipo</th><th>tool</th><th>resumo</th><th>model/effort</th></tr>' + mine.map(function (e) {
    return '<tr><td class="mono">' + esc(shortTs(e.ts)) + '</td><td><span class="sh-tag">' + esc(e.type) + '</span></td><td>' + esc(e.tool || '—') + '</td><td class="wrap">' + esc(e.summary) + '</td><td><span class="sh-tag">' + esc(e.model) + '</span> <span class="sh-tag">' + esc(e.effort) + '</span></td></tr>';
  }).join('') + '</table>' : '<p class="empty">sem ações registradas</p>';
  var arts = mine.filter(function (e) { return /artifact|artefato|snapshot|part-report|seed|human-instruction|pentest/.test(e.type); }).slice(0, 12)
    .map(function (e) { return '<li class="wrap">' + esc(shortTs(e.ts)) + ' — ' + esc(e.summary) + '</li>'; }).join('');
  var body = '<div style="display:flex;gap:14px;align-items:center;margin-bottom:12px">' +
    '<img class="sh-avatar" style="width:56px;height:56px" src="' + SPR(a.id) + '" alt="">' +
    '<div><div>' + esc(a.bloco) + '</div><div>' + statusBadge(a.status) + ' · TASK <b>' + esc(a.task_atual || '—') + '</b></div>' +
    '<div class="muted">gate ' + esc(a.gate_principal) + ' · model <b>' + esc(a.modelo) + '</b> · effort <b>' + esc(a.effort) + '</b> · fallback ' + esc(a.fallback_pro) + '</div></div></div>' +
    '<div class="sh-card"><div class="sh-card-head">Permissões (nível ' + esc(a.nivel) + ')</div><div class="sh-card-body">' + esc(NIVEL_DESC[a.nivel] || '') +
    '<p class="muted">Ferramentas: ver .claude/agents/' + esc(a.id) + '-' + esc(a.slug) + '.md. Fallback nativo + skill_fallback se skill/integração indisponível.</p></div></div>' +
    '<div class="sh-card"><div class="sh-card-head">Artefatos / marcos</div><div class="sh-card-body">' + (arts ? '<ul>' + arts + '</ul>' : '<p class="empty">nenhum ainda</p>') + '</div></div>' +
    '<div class="sh-card"><div class="sh-card-head">Stream (últimas 50 ações)</div><div class="sh-card-body sh-scroll" style="max-height:320px">' + stream + '</div></div>' +
    '<div class="filters" style="margin-top:10px"><button class="sh-btn ghost" data-pause="' + esc(a.id) + '">Pausar</button>' +
    '<button class="sh-btn ghost" data-prio="' + esc(a.id) + '">Priorizar</button>' +
    '<button class="sh-btn ghost" data-effort="' + esc(a.id) + '">effort → high</button></div>';
  showDialog(a.id + ' — ' + a.slug, body);
}
function showDialog(title, bodyHtml) {
  closeDialog();
  var o = document.createElement('div'); o.className = 'sh-overlay'; o.id = 'avf-dialog';
  put(o, '<div class="sh-dialog"><div class="dh"><b>' + esc(title) + '</b><span class="x">✕</span></div><div class="db">' + bodyHtml + '</div></div>');
  o.addEventListener('click', function (e) { if (e.target === o || e.target.className === 'x') closeDialog(); });
  document.body.appendChild(o);
  wire(o);
}
function closeDialog() { var d = document.getElementById('avf-dialog'); if (d) d.remove(); }
window.AVF.openAgent = openAgent;
window.AVF.showDialog = showDialog;

/* ---------- finance ---------- */
function viewFinance() {
  var m = state.metrics || {}, pr = state.pricing;
  var planos = pr && pr.plans ? '<table class="sh-table"><tr><th>plano</th><th>preço</th><th>período</th><th>assinantes</th></tr>' +
    pr.plans.map(function (p) { return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.price) + '</td><td>' + esc(p.period || 'mês') + '</td><td>' + esc(p.subscribers != null ? p.subscribers : '—') + '</td></tr>'; }).join('') + '</table>'
    : '<p class="empty">company/projects/app-001/pricing.json ainda não existe</p>';
  var rows = [['MRR', m.mrr, 'R$ '], ['Churn', m.churn, '', '%'], ['LTV', m.ltv, 'R$ '], ['CAC', m.cac, 'R$ '],
  ['LTV/CAC', (m.ltv && m.cac) ? +(m.ltv / m.cac).toFixed(2) : null], ['Usuários', m.active_users],
  ['Conversão', m.conversion != null ? +(m.conversion * 100).toFixed(1) : null, '', '%']];
  var tiles = rows.map(function (t) {
    var num = typeof t[1] === 'number';
    return '<div class="tile"><div class="k">' + esc(t[0]) + '</div><div class="v"' + (num ? ' data-cu="' + t[1] + '" data-pre="' + (t[2] || '') + '" data-suf="' + (t[3] || '') + '"' : '') + '>' + (num ? (t[2] || '') + t[1] + (t[3] || '') : '—') + '</div></div>';
  }).join('');
  var series = state.posts.map(function (p) { return Number(p.likes || p.views || p.clicks || 0); });
  return '<h1 class="h1">Financeiro</h1>' +
    '<div class="sh-card"><div class="sh-card-head">Planos</div><div class="sh-card-body">' + planos + '</div></div>' +
    '<div class="sh-card"><div class="sh-card-head">Métricas (metrics.json)</div><div class="sh-card-body"><div class="tiles">' + tiles + '</div></div></div>' +
    '<div class="sh-card"><div class="sh-card-head">Engajamento de posts</div><div class="sh-card-body">' + window.FX.sparkline(series, 640, 90, '#14b8a6') + '</div></div>';
}

/* ---------- security ---------- */
function viewSecurity() {
  var projs = (state.security && state.security.projects) || {}, keys = Object.keys(projs);
  if (!keys.length) return '<h1 class="h1">Segurança</h1><div class="sh-card"><div class="sh-card-body"><p class="empty">nenhum projeto em ciclo de segurança (G7 começa na PARTE 10)</p></div></div>';
  return '<h1 class="h1">Segurança</h1>' + keys.map(function (p) {
    var s = projs[p], o = s.open || {};
    return '<div class="sh-card"><div class="sh-card-head">' + esc(p) + '</div><div class="sh-card-body">' +
      '<div class="sev"><div class="s critica"><div class="n">' + esc(o.critica || 0) + '</div>crítica</div>' +
      '<div class="s alta"><div class="n">' + esc(o.alta || 0) + '</div>alta</div>' +
      '<div class="s media"><div class="n">' + esc(o.media || 0) + '</div>média</div>' +
      '<div class="s baixa"><div class="n">' + esc(o.baixa || 0) + '</div>baixa</div></div>' +
      '<p class="h2">Ciclo red/blue (G7)</p><p>' + esc(s.redblue || '—') + '</p>' +
      '<p class="h2">Dependências (A34)</p><p>' + esc(s.deps || 0) + ' CVE(s)</p></div></div>';
  }).join('');
}

/* ---------- integrations ---------- */
function viewIntegrations() {
  return '<h1 class="h1">Integrações (' + INTEGRATIONS.length + ')</h1>' +
    '<p class="muted">Stubs com gate humano. Nenhuma chama serviço pago/externo sem sua aprovação. Docs em <span class="mono">company/integrations/</span>.</p>' +
    '<div class="intgrid">' + INTEGRATIONS.map(function (r) {
      var t = { on: 'aplicada', off: 'desligada', stub: 'stub' }[r[3]];
      return '<div class="intcard"><h4>' + esc(r[0]) + '</h4><div class="st ' + esc(r[3]) + '">' + esc(t) + '</div>' +
        '<p class="muted" style="margin:6px 0 2px">' + esc(r[1]) + '</p><div class="sh-tag">' + esc(r[2]) + '</div></div>';
    }).join('') + '</div>';
}

/* ---------- wiring ---------- */
function wire(root) {
  root = root || document;
  root.querySelectorAll('[data-agent]').forEach(function (el) {
    el.onclick = function (e) { if (e.target.closest('button')) return; openAgent(el.getAttribute('data-agent')); };
  });
  root.querySelectorAll('[data-open]').forEach(function (b) { b.onclick = function () { openAgent(b.getAttribute('data-open')); }; });
  root.querySelectorAll('[data-chat]').forEach(function (b) { b.onclick = function () { closeDialog(); location.hash = '#human'; }; });
  root.querySelectorAll('[data-pause]').forEach(function (b) { b.onclick = function () { agentAction(b.getAttribute('data-pause'), 'pausar'); }; });
  root.querySelectorAll('[data-prio]').forEach(function (b) { b.onclick = function () { agentAction(b.getAttribute('data-prio'), 'priorizar'); }; });
  root.querySelectorAll('[data-effort]').forEach(function (b) { b.onclick = function () { agentAction(b.getAttribute('data-effort'), 'mudar effort para high'); }; });

  var fb = document.getElementById('f-bloco'), fs = document.getElementById('f-status'), fm = document.getElementById('f-modelo'), fq = document.getElementById('f-q');
  if (fb) fb.onchange = function () { viewAgents._f.bloco = fb.value; render(); };
  if (fs) fs.onchange = function () { viewAgents._f.status = fs.value; render(); };
  if (fm) fm.onchange = function () { viewAgents._f.modelo = fm.value; render(); };
  if (fq) fq.oninput = function () { viewAgents._f.q = fq.value; var p = fq.selectionStart; render(); var n = document.getElementById('f-q'); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch (_) {} } };

  document.querySelectorAll('[data-cu]').forEach(function (el) {
    var v = el.getAttribute('data-cu'); if (v === '' || v == null) return;
    window.FX.countUp(el, Number(v), { prefix: el.getAttribute('data-pre') || '', suffix: el.getAttribute('data-suf') || '', decimals: (Number(v) % 1 ? 2 : 0) });
  });
  window.FX.spotlightAll(root);
}
function agentAction(id, action) {
  if (HOSTED) { alert('Modo monitor (hospedado). Use a sessão do Claude para instruir agentes.'); return; }
  post('/api/agent-action', { agent: id, action: action })
    .then(function (j) { alert(j && j.ok ? ('OK — ' + (j.task || 'registrado')) : ('erro: ' + (j && j.error))); })
    .catch(function () { alert('sem backend (modo monitor)'); });
}

/* ---------- busca no topo ---------- */
var ts = document.getElementById('topsearch');
if (ts) ts.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  var q = e.target.value.trim().toLowerCase();
  var hit = state.agents.filter(function (a) { return (a.id + ' ' + a.slug).toLowerCase().indexOf(q) >= 0; })[0];
  if (hit) { openAgent(hit.id); e.target.value = ''; }
});

/* ---------- loop ---------- */
var lastOk = 0;
function tick() {
  loadAll().then(function () {
    lastOk = Date.now();
    var d = document.getElementById('poll-dot'); if (d) d.classList.remove('stale');
    render();
  });
}
window.addEventListener('hashchange', render);
setInterval(function () { var d = document.getElementById('poll-dot'); if (d && Date.now() - lastOk > POLL_MS * 3) d.classList.add('stale'); }, 1000);
setInterval(tick, POLL_MS);
tick();
