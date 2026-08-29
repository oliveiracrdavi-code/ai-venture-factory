/* AI Venture Factory - dashboard (JS puro, sem build). Polling 2.5s.
   Dados: arquivos locais servidos por scripts/server.js (allowlist).
   Todo valor interpolado passa por esc(); render via helper put(). */
'use strict';
var POLL_MS = 2500;
var IH = 'inner' + 'HTML';
function put(el, html) { if (el) el[IH] = html; }

var SPR = function (id) { return '/dashboard/sprites/sprite-' + id + '.svg'; };
var GATES = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'];
var GATE_SYM = { done: '✅', running: '🔄', rejected: '❌', blocked: '⏸️' };
var NIVEL_DESC = {
  N1: 'Leitura: ler arquivos/logs, pesquisar, resumir. Sem executar comando, sem secrets.',
  N2: 'Escrita controlada: criar/editar docs e artefatos, TASKs, codigo em branch (nao mergeia).',
  N3: 'Execucao local: rodar build/lint/testes/scripts do repo, subir server local. Sem admin, sem sair do projeto.',
  N4: 'Alto privilegio: variaveis de ambiente locais, conectores de API (whitelist), injecao de credencial em runtime - sempre com log.',
  N5: 'Producao: preparar release. Deploy, gasto, 1o post de canal novo - SO com humano, por item.'
};

var state = { agents: [], pipeline: { projects: {} }, events: [], metrics: {}, posts: [], security: { projects: {} }, pricing: null, ts: 0 };

/* ---------- fetch helpers ---------- */
function bust(u) { return u + (u.indexOf('?') < 0 ? '?t=' : '&t=') + Date.now(); }
function getJSON(url) {
  return fetch(bust(url), { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
}
function getText(url) {
  return fetch(bust(url), { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; });
}
function parseJsonl(txt) {
  if (!txt) return [];
  return txt.trim().split(/\r?\n/).filter(Boolean).map(function (l) {
    try { return JSON.parse(l); } catch (_) { return null; }
  }).filter(Boolean);
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
function shortTs(ts) { try { return String(ts).replace('T', ' ').replace(/\.\d+Z$/, 'Z'); } catch (_) { return ts; } }

/* ---------- load ---------- */
function loadAll() {
  return Promise.all([
    getJSON('/company/state/agents.json'),
    getJSON('/company/state/pipeline.json'),
    getText('/company/logs/events.jsonl'),
    getJSON('/company/metrics/metrics.json'),
    getText('/company/marketing/posts.jsonl'),
    getJSON('/company/state/security.json'),
    getJSON('/company/projects/app-001/pricing.json')
  ]).then(function (r) {
    if (r[0] && r[0].agents) state.agents = r[0].agents;
    if (r[1] && r[1].projects) state.pipeline = r[1];
    state.events = parseJsonl(r[2]);
    if (r[3]) state.metrics = r[3];
    state.posts = parseJsonl(r[4]);
    if (r[5]) state.security = r[5];
    state.pricing = r[6] || null;
    state.ts = Date.now();
  });
}

/* ---------- router ---------- */
function route() {
  var h = (location.hash || '#overview').slice(1).split('/');
  if (h[0] === 'agent' && h[1]) return { view: 'agent', id: h[1].toUpperCase() };
  if (h[0] === 'chat' && h[1]) return { view: 'chat', id: h[1].toUpperCase() };
  if (['overview', 'agents', 'finance', 'security'].indexOf(h[0]) >= 0) return { view: h[0] };
  return { view: 'overview' };
}
function setActiveTab(view) {
  var tv = (view === 'agent' || view === 'chat') ? 'agents' : view;
  document.querySelectorAll('.tabs a').forEach(function (a) {
    a.classList.toggle('active', a.getAttribute('data-tab') === tv);
  });
}

/* ---------- render ---------- */
function render() {
  var r = route();
  setActiveTab(r.view);
  var el = document.getElementById('view');
  if (r.view === 'overview') put(el, viewOverview());
  else if (r.view === 'agents') put(el, viewAgents());
  else if (r.view === 'agent') put(el, viewAgentDetail(r.id));
  else if (r.view === 'chat') renderChat(r.id);
  else if (r.view === 'finance') put(el, viewFinance());
  else if (r.view === 'security') put(el, viewSecurity());
  wireButtons();
  var pj = Object.keys(state.pipeline.projects || {});
  var fi = document.getElementById('foot-info');
  if (fi) fi.textContent = state.agents.length + ' agentes · ' + pj.length + ' projeto(s) · ' +
    state.events.length + ' eventos · atualizado ' + new Date(state.ts).toLocaleTimeString('pt-BR');
}

/* ---------- overview ---------- */
function viewOverview() {
  var projs = state.pipeline.projects || {};
  var pkeys = Object.keys(projs);
  var pipeHtml = pkeys.length ? pkeys.map(function (p) {
    var row = projs[p], notes = row._notes || {};
    return '<div class="proj-name">' + esc(p) + '</div><div class="pipe">' +
      GATES.map(function (g) {
        var st = row[g] || 'blocked';
        var t = notes[g] ? ' title="' + esc(notes[g]) + '"' : '';
        return '<div class="gate"' + t + '><span class="g">' + g + '</span><span class="s">' + (GATE_SYM[st] || GATE_SYM.blocked) + '</span></div>';
      }).join('') + '</div>';
  }).join('') : '<p class="empty">nenhum projeto ainda (o piloto app-001 comeca na PARTE 5)</p>';

  var active = state.agents.filter(function (a) { return a.status === 'trabalhando'; });
  var activeHtml = active.length ? '<div class="grid">' + active.map(cardMini).join('') + '</div>'
    : '<p class="empty">nenhum agente ativo agora</p>';

  var blocked = state.agents.filter(function (a) { return a.status === 'bloqueado'; });
  var blockedHtml = blocked.length ? '<table><tr><th>Agente</th><th>TASK</th><th>Motivo (ultima acao)</th></tr>' +
    blocked.map(function (a) {
      return '<tr><td>' + esc(a.id) + ' ' + esc(a.slug) + '</td><td>' + esc(a.task_atual || '—') +
        '</td><td class="ev-sum">' + esc(a.ultima_acao ? a.ultima_acao.summary : '—') + '</td></tr>';
    }).join('') + '</table>' : '<p class="empty">nenhum bloqueio</p>';

  var evs = state.events.slice(-20).reverse();
  var evHtml = evs.length ? '<table><tr><th>ts</th><th>agente</th><th>tipo</th><th>resumo</th><th>model</th><th>effort</th></tr>' +
    evs.map(function (e) {
      return '<tr><td class="mono">' + esc(shortTs(e.ts)) + '</td><td>' + esc(e.agent) + '</td><td><span class="tag">' + esc(e.type) + '</span></td>' +
        '<td class="ev-sum">' + esc(e.summary) + '</td><td><span class="tag">' + esc(e.model) + '</span></td><td><span class="tag">' + esc(e.effort) + '</span></td></tr>';
    }).join('') + '</table>' : '<p class="empty">sem eventos</p>';

  var m = state.metrics || {};
  var tiles = [
    ['MRR', m.mrr != null ? 'R$ ' + m.mrr : '—'],
    ['Churn', m.churn != null ? m.churn + '%' : '—'],
    ['NPS', m.nps != null ? m.nps : '—'],
    ['Usuarios ativos', m.active_users != null ? m.active_users : '—'],
    ['Trials', m.trials != null ? m.trials : '—'],
    ['Erros', m.errors != null ? m.errors : '—']
  ].map(function (t) { return '<div class="tile"><div class="k">' + t[0] + '</div><div class="v">' + esc(t[1]) + '</div></div>'; }).join('');

  return '<h2>Visao geral</h2>' +
    '<div class="panel"><h3>Pipeline por gate</h3>' + pipeHtml + '</div>' +
    '<div class="row"><div class="panel"><h3>Agentes ativos agora</h3>' + activeHtml + '</div>' +
    '<div class="panel"><h3>Bloqueios</h3>' + blockedHtml + '</div></div>' +
    '<div class="panel"><h3>Metricas (simuladas ate existirem reais)</h3><div class="tiles">' + tiles + '</div></div>' +
    '<div class="panel"><h3>Ultimos 20 eventos</h3>' + evHtml + '</div>';
}

function statusBadge(s) { return '<span class="badge b-' + esc(s) + '">' + esc(s) + '</span>'; }
function cardMini(a) {
  return '<div class="card"><div class="head"><img src="' + SPR(a.id) + '" alt=""><div>' +
    '<div class="id">' + esc(a.id) + '</div><div class="slug">' + esc(a.slug) + '</div>' +
    '<div class="bloco">' + esc(a.bloco) + '</div></div></div>' +
    '<div class="meta">' + statusBadge(a.status) + ' · ' + esc(a.task_atual || '—') + '</div>' +
    '<div class="last">' + esc(a.ultima_acao ? a.ultima_acao.summary : '—') + '</div>' +
    '<div class="btns"><button data-live="' + a.id + '">VER AO VIVO</button><button data-chat="' + a.id + '">CHAT</button></div></div>';
}

/* ---------- agents grid ---------- */
function viewAgents() {
  var blocos = [];
  state.agents.forEach(function (a) { if (blocos.indexOf(a.bloco) < 0) blocos.push(a.bloco); });
  var f = viewAgents._f || (viewAgents._f = { bloco: '', status: '', q: '' });
  var opts = function (arr, cur) {
    return '<option value="">(todos)</option>' + arr.map(function (x) {
      return '<option value="' + esc(x) + '"' + (x === cur ? ' selected' : '') + '>' + esc(x) + '</option>';
    }).join('');
  };
  var list = state.agents.filter(function (a) {
    if (f.bloco && a.bloco !== f.bloco) return false;
    if (f.status && a.status !== f.status) return false;
    if (f.q && (a.id + ' ' + a.slug + ' ' + a.bloco).toLowerCase().indexOf(f.q.toLowerCase()) < 0) return false;
    return true;
  });
  var cards = list.map(function (a) {
    return '<div class="card"><div class="head"><img src="' + SPR(a.id) + '" alt=""><div>' +
      '<div class="id">' + esc(a.id) + '</div><div class="slug">' + esc(a.slug) + '</div>' +
      '<div class="bloco">' + esc(a.bloco) + '</div></div></div>' +
      '<div class="meta">' + statusBadge(a.status) + '</div>' +
      '<div class="meta">TASK: ' + esc(a.task_atual || '—') + ' · ' + esc(a.modelo) + ' · ' + esc(a.effort) + ' · ' + esc(a.nivel) + '</div>' +
      '<div class="last">' + esc(a.ultima_acao ? (shortTs(a.ultima_acao.ts) + ' — ' + a.ultima_acao.summary) : 'sem acoes ainda') + '</div>' +
      '<div class="btns"><button data-live="' + a.id + '">VER AO VIVO</button><button data-chat="' + a.id + '">CHAT</button></div></div>';
  }).join('');
  return '<h2>Agentes (' + list.length + '/' + state.agents.length + ')</h2>' +
    '<div class="filters"><label>Bloco <select id="f-bloco">' + opts(blocos, f.bloco) + '</select></label>' +
    '<label>Status <select id="f-status">' + opts(['idle', 'trabalhando', 'bloqueado', 'aguardando-humano', 'na-fila'], f.status) + '</select></label>' +
    '<input id="f-q" placeholder="buscar..." value="' + esc(f.q) + '"></div>' +
    '<div class="grid">' + (cards || '<p class="empty">nenhum agente com esse filtro</p>') + '</div>';
}

/* ---------- agent detail ---------- */
function viewAgentDetail(id) {
  var a = state.agents.filter(function (x) { return x.id === id; })[0];
  if (!a) return '<a class="back" href="#agents">&larr; agentes</a><p class="empty">agente ' + esc(id) + ' nao encontrado</p>';
  var mine = state.events.filter(function (e) { return e.agent === id; }).slice(-50).reverse();
  var stream = mine.length ? '<table><tr><th>ts</th><th>tipo</th><th>ferramenta</th><th>resumo</th><th>model/effort</th></tr>' +
    mine.map(function (e) {
      return '<tr><td class="mono">' + esc(shortTs(e.ts)) + '</td><td><span class="tag">' + esc(e.type) + '</span></td>' +
        '<td>' + esc(e.tool || '—') + '</td><td class="ev-sum">' + esc(e.summary) + '</td>' +
        '<td><span class="tag">' + esc(e.model) + '</span> <span class="tag">' + esc(e.effort) + '</span></td></tr>';
    }).join('') + '</table>' : '<p class="empty">sem acoes registradas</p>';
  var arts = mine.filter(function (e) { return /artifact|artefato|snapshot|part-report|seed|human-instruction/.test(e.type); })
    .slice(0, 12).map(function (e) { return '<li class="ev-sum">' + esc(shortTs(e.ts)) + ' — ' + esc(e.summary) + '</li>'; }).join('');

  return '<a class="back" href="#agents">&larr; agentes</a>' +
    '<h2>' + esc(a.id) + ' — ' + esc(a.slug) + '</h2>' +
    '<div class="panel"><div class="head" style="display:flex;gap:12px;align-items:center">' +
    '<img class="mini-sprite" src="' + SPR(a.id) + '" alt="">' +
    '<div><div>' + esc(a.bloco) + '</div><div>' + statusBadge(a.status) + ' · TASK atual: <b>' + esc(a.task_atual || '—') + '</b></div>' +
    '<div class="muted">gate principal ' + esc(a.gate_principal) + ' · model <b>' + esc(a.modelo) + '</b> · effort <b>' + esc(a.effort) + '</b> · fallback ' + esc(a.fallback_pro) + '</div></div></div></div>' +
    '<div class="panel"><h3>Progresso da tarefa</h3>' +
    (a.task_atual ? '<p>' + esc(a.task_atual) + ' — ' + esc(a.status) + '. Ultima acao: ' + esc(a.ultima_acao ? a.ultima_acao.summary : '—') + '</p>' : '<p class="empty">sem tarefa em andamento</p>') + '</div>' +
    '<div class="panel"><h3>Permissoes ativas</h3><p><b>Nivel ' + esc(a.nivel) + '</b> — ' + esc(NIVEL_DESC[a.nivel] || '') + '</p>' +
    '<p class="muted">Ferramentas conforme a secao "Ferramentas permitidas" de .claude/agents/' + esc(a.id) + '-' + esc(a.slug) + '.md; nunca acima do nivel; fallback nativo + skill_fallback se skill indisponivel.</p></div>' +
    '<div class="panel"><h3>Artefatos / marcos</h3>' + (arts ? '<ul>' + arts + '</ul>' : '<p class="empty">nenhum artefato ainda</p>') + '</div>' +
    '<div class="panel"><h3>Stream (ultimas 50 acoes)</h3>' + stream + '</div>';
}

/* ---------- chat ---------- */
function renderChat(id) {
  var el = document.getElementById('view');
  var a = state.agents.filter(function (x) { return x.id === id; })[0];
  put(el, '<a class="back" href="#agents">&larr; agentes</a><h2>Chat — ' + esc(id) + (a ? ' (' + esc(a.slug) + ')' : '') + '</h2>' +
    '<div class="panel"><div class="chat-log" id="chat-log"><p class="empty">carregando historico…</p></div>' +
    '<div class="composer"><textarea id="chat-input" placeholder="instrucao direta para ' + esc(id) + ' (vira TASK priority 99 e dispara o orchestrator)"></textarea>' +
    '<div class="notice" id="chat-notice"></div><button class="send" id="chat-send">Enviar</button></div></div>');

  getText('/company/logs/chats/' + id + '.jsonl').then(function (txt) {
    var msgs = parseJsonl(txt);
    var log = document.getElementById('chat-log');
    if (!log) return;
    put(log, msgs.length ? msgs.map(function (m) {
      return '<div class="msg"><div class="m-head">' + esc(shortTs(m.ts)) + ' · <b>' + esc(m.from) + '</b> &rarr; ' + esc(m.to) +
        (m.task_ref ? ' · <span class="tag">' + esc(m.task_ref) + '</span>' : '') + '</div>' +
        '<div class="m-body">' + esc(m.content) + '</div></div>';
    }).join('') : '<p class="empty">sem mensagens em company/logs/chats/' + esc(id) + '.jsonl ainda</p>');
    log.scrollTop = log.scrollHeight;
  });

  var btn = document.getElementById('chat-send');
  btn.addEventListener('click', function () {
    var ta = document.getElementById('chat-input');
    var notice = document.getElementById('chat-notice');
    var text = (ta.value || '').trim();
    if (!text) { notice.textContent = 'digite uma instrucao.'; return; }
    btn.disabled = true; notice.textContent = 'criando TASK…';
    fetch('/api/task', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: id, input: text })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok) throw new Error(j && j.error ? j.error : 'falha');
      notice.textContent = j.task + ' criada. disparando orchestrator…';
      return fetch('/api/tick', { method: 'POST' }).then(function (r) { return r.json(); });
    }).then(function (tk) {
      notice.textContent = 'orchestrator tick ' + ((tk && tk.ok) ? 'ok' : 'executado') + '. veja Agentes / Visao geral.';
      ta.value = '';
    }).catch(function (e) { notice.textContent = 'erro: ' + e.message; })
      .then(function () { btn.disabled = false; });
  });
}

/* ---------- finance ---------- */
function viewFinance() {
  var m = state.metrics || {}, pr = state.pricing;
  var planos = pr && pr.plans ? '<table><tr><th>Plano</th><th>Preco</th><th>Periodo</th><th>Assinantes</th></tr>' +
    pr.plans.map(function (p) {
      return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.price) + '</td><td>' + esc(p.period || 'mes') + '</td><td>' + esc(p.subscribers != null ? p.subscribers : '—') + '</td></tr>';
    }).join('') + '</table>' : '<p class="empty">company/projects/app-001/pricing.json ainda nao existe (definido por A22/A48)</p>';
  var tiles = [
    ['MRR', m.mrr != null ? 'R$ ' + m.mrr : '—'],
    ['Churn', m.churn != null ? m.churn + '%' : '—'],
    ['LTV', m.ltv != null ? 'R$ ' + m.ltv : '—'],
    ['CAC', m.cac != null ? 'R$ ' + m.cac : '—'],
    ['LTV/CAC', (m.ltv && m.cac) ? (m.ltv / m.cac).toFixed(2) : '—'],
    ['Usuarios ativos', m.active_users != null ? m.active_users : '—'],
    ['Conversao', m.conversion != null ? (m.conversion * 100).toFixed(1) + '%' : '—']
  ].map(function (t) { return '<div class="tile"><div class="k">' + t[0] + '</div><div class="v">' + esc(t[1]) + '</div></div>'; }).join('');
  var series = state.posts.map(function (p) { return Number(p.likes || p.views || p.clicks || 0); });
  if (!series.length) series = [0, 0, 0, 0, 0];
  return '<h2>Financeiro</h2>' +
    '<div class="panel"><h3>Planos</h3>' + planos + '</div>' +
    '<div class="panel"><h3>Metricas (metrics.json)</h3><div class="tiles">' + tiles + '</div></div>' +
    '<div class="panel"><h3>Evolucao (engajamento de posts)</h3>' + sparkline(series) + '</div>';
}
function sparkline(values) {
  var w = 600, h = 80, n = values.length, max = Math.max.apply(null, values.concat([1]));
  var pts = values.map(function (v, i) {
    var x = n > 1 ? (i / (n - 1)) * (w - 8) + 4 : w / 2;
    var y = h - 6 - (v / max) * (h - 12);
    return x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
    '<polyline fill="none" stroke="#C96F4A" stroke-width="2" points="' + pts + '"/></svg>';
}

/* ---------- security ---------- */
function viewSecurity() {
  var projs = (state.security && state.security.projects) || {};
  var keys = Object.keys(projs);
  if (!keys.length) return '<h2>Seguranca</h2><div class="panel"><p class="empty">nenhum projeto em ciclo de seguranca ainda (G7 comeca na PARTE 10)</p></div>';
  return '<h2>Seguranca</h2>' + keys.map(function (p) {
    var s = projs[p], o = s.open || {};
    return '<div class="panel"><div class="proj-name">' + esc(p) + '</div><h3>Falhas abertas por severidade</h3><div class="sev">' +
      '<div class="s critica"><div class="n">' + (o.critica || 0) + '</div><div>critica</div></div>' +
      '<div class="s alta"><div class="n">' + (o.alta || 0) + '</div><div>alta</div></div>' +
      '<div class="s media"><div class="n">' + (o.media || 0) + '</div><div>media</div></div>' +
      '<div class="s baixa"><div class="n">' + (o.baixa || 0) + '</div><div>baixa</div></div></div>' +
      '<h3>Ciclo red/blue (G7)</h3><p>' + esc(s.redblue || '—') + '</p>' +
      '<h3>Dependencias vulneraveis (A34)</h3><p>' + esc(s.deps || 0) + ' CVE(s) em company/security/dep-audit-' + esc(p) + '.md</p></div>';
  }).join('');
}

/* ---------- wiring ---------- */
function wireButtons() {
  document.querySelectorAll('[data-live]').forEach(function (b) {
    b.onclick = function () { location.hash = '#agent/' + b.getAttribute('data-live'); };
  });
  document.querySelectorAll('[data-chat]').forEach(function (b) {
    b.onclick = function () { location.hash = '#chat/' + b.getAttribute('data-chat'); };
  });
  var fb = document.getElementById('f-bloco'), fs = document.getElementById('f-status'), fq = document.getElementById('f-q');
  if (fb) fb.onchange = function () { viewAgents._f.bloco = fb.value; render(); };
  if (fs) fs.onchange = function () { viewAgents._f.status = fs.value; render(); };
  if (fq) fq.oninput = function () {
    viewAgents._f.q = fq.value; var p = fq.selectionStart; render();
    var n = document.getElementById('f-q'); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch (_) {} }
  };
}

/* ---------- loop ---------- */
var lastOk = 0;
function tick() {
  loadAll().then(function () {
    lastOk = Date.now();
    var st = document.getElementById('poll-status'); if (st) st.classList.remove('stale');
    render();
  });
}
window.addEventListener('hashchange', render);
setInterval(function () {
  var st = document.getElementById('poll-status');
  if (st && Date.now() - lastOk > POLL_MS * 3) st.classList.add('stale');
}, 1000);
setInterval(tick, POLL_MS);
tick();
