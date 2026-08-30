/* workflow-canvas.js — canvas n8n (ground-truth = screenshot do n8n).
   Estrutura: painel "Nodes" à esquerda, canvas com grid de pontos, overlay
   "Active / N Running Nodes", controles à direita, barra de status embaixo.
   Layout em ÁRVORE: WH00 → A08 (orquestrador) → 4 ramos (hubs) → grades de
   nós por bloco → convergem em SET → OUT.
   Nó = quadrado arredondado com ícone; id acima; nome/sub ABAIXO; badge ✓/Error. */
'use strict';
window.WF = (function () {
  /* geometria (px do viewBox) */
  var SQ = 62, ICON = 34, COL = 116, ROW = 104, GRID_W = 3;
  var Y_WH = 46, Y_ORCH = 176, Y_HUB = 312, Y_GRID = 452;
  var BRANCH_GAP = 74, PAD = 90;

  var view = { x: 0, y: 0, k: 1 }, dragging = null, showEdges = true, guideOpen = false;
  var _fitted = false, _lastN = -1;

  var BLOCOS = ['Pesquisa & Viabilidade', 'Governança', 'Produto & Arquitetura', 'Engenharia',
    'Conectores', 'Cybersecurity', 'QA', 'Growth & Finanças'];
  /* 4 ramos, cada um com 2 blocos (índices 0..7) — espelha o fan-out da referência */
  var BRANCHES = [[0, 1], [2, 3], [4, 5], [6, 7]];

  function esc(s) { return window.AVF.esc(s); }
  function bi(b) { var m = String(b || '').match(/^(\d)/); return m ? (Number(m[1]) - 1) : 7; }
  function tint(ci) { return ['#7c5cff', '#f59e0b', '#3b82f6', '#f97316', '#06b6d4', '#ef4444', '#22c55e', '#ec4899'][ci] || '#7c5cff'; }

  /* ---------- layout em árvore ---------- */
  function layout(agents) {
    var byBloco = [[], [], [], [], [], [], [], []];
    agents.forEach(function (a) { byBloco[bi(a.bloco)].push(a); });
    byBloco.forEach(function (l) { l.sort(function (a, b) { return a.id.localeCompare(b.id); }); });

    var orchA = agents.filter(function (a) { return a.id === 'A08'; })[0] || null;

    /* largura de cada ramo = GRID_W colunas */
    var branchW = GRID_W * COL;
    var totalW = BRANCHES.length * branchW + (BRANCHES.length - 1) * BRANCH_GAP;
    var W = totalW + PAD * 2;
    var cx = W / 2;

    var pos = {}, sections = [], hubs = [], maxY = Y_GRID;

    BRANCHES.forEach(function (blocos, bIdx) {
      var bx = PAD + bIdx * (branchW + BRANCH_GAP);         /* x esquerdo do ramo */
      var bcx = bx + branchW / 2;                            /* centro do ramo */
      var y = Y_GRID;

      /* hub do ramo: 1º agente do 1º bloco (fora A08) */
      var first = byBloco[blocos[0]].filter(function (a) { return a.id !== 'A08'; })[0];
      var hub = null;
      if (first) {
        hub = { x: bcx - SQ / 2, y: Y_HUB, a: first, ci: blocos[0] };
        pos[first.id] = hub; hubs.push(hub);
      }

      blocos.forEach(function (ci) {
        var list = byBloco[ci].filter(function (a) { return a.id !== 'A08' && !(hub && a.id === hub.a.id); });
        if (!list.length && !(hub && hub.ci === ci)) return;
        var rows = Math.max(1, Math.ceil(list.length / GRID_W));
        var secY = y - 26;
        var secH = 26 + rows * ROW - (ROW - SQ) + 34;
        sections.push({ ci: ci, x: bx - 14, y: secY, w: branchW + 28, h: secH });
        list.forEach(function (a, i) {
          var r = Math.floor(i / GRID_W), c = i % GRID_W;
          var n = Math.min(GRID_W, list.length - r * GRID_W);
          var rowW = n * COL;
          var sx = bcx - rowW / 2 + c * COL + (COL - SQ) / 2;
          pos[a.id] = { x: sx, y: y + r * ROW, a: a, ci: ci };
        });
        y += rows * ROW + 26;
        if (y > maxY) maxY = y;
      });
    });

    var wh = { x: cx - SQ / 2, y: Y_WH, id: 'WH00', name: 'Webhook', sub: 'intake / G0', kind: 'io' };
    var orch = orchA ? { x: cx - SQ / 2, y: Y_ORCH, a: orchA, ci: 1, isOrch: true } : null;
    if (orch) pos[orchA.id] = orch;
    var setN = { x: cx - SQ / 2, y: maxY + 30, id: 'SET', name: 'Set', sub: 'consolida artefatos', kind: 'io' };
    var out = { x: cx - SQ / 2, y: maxY + 30 + ROW, id: 'OUT', name: 'Publicação', sub: 'marketing · monitor', kind: 'io' };
    var H = out.y + SQ + 96;
    return { pos: pos, sections: sections, hubs: hubs, wh: wh, orch: orch, set: setN, out: out, w: W, h: H, cx: cx, byBloco: byBloco };
  }

  /* ---------- caminhos ortogonais arredondados (estilo n8n) ---------- */
  function vpath(x1, y1, x2, y2, r) {
    r = r || 12;
    if (Math.abs(x1 - x2) < 1.5) return 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
    var my = (y1 + y2) / 2, d = x2 > x1 ? 1 : -1;
    var rr = Math.min(r, Math.abs(x2 - x1) / 2, Math.abs(my - y1), Math.abs(y2 - my));
    return 'M' + x1 + ',' + y1 +
      ' L' + x1 + ',' + (my - rr) +
      ' Q' + x1 + ',' + my + ' ' + (x1 + rr * d) + ',' + my +
      ' L' + (x2 - rr * d) + ',' + my +
      ' Q' + x2 + ',' + my + ' ' + x2 + ',' + (my + rr) +
      ' L' + x2 + ',' + y2;
  }
  function hpath(x1, y1, x2, y2) { /* lado→lado na mesma fileira */
    if (Math.abs(y1 - y2) < 1.5) return 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
    var mx = (x1 + x2) / 2, rr = 10, d = y2 > y1 ? 1 : -1;
    return 'M' + x1 + ',' + y1 + ' L' + (mx - rr) + ',' + y1 +
      ' Q' + mx + ',' + y1 + ' ' + mx + ',' + (y1 + rr * d) +
      ' L' + mx + ',' + (y2 - rr * d) + ' Q' + mx + ',' + y2 + ' ' + (mx + rr) + ',' + y2 + ' L' + x2 + ',' + y2;
  }

  /* ---------- nós ---------- */
  function ioNode(n) {
    var c = n.id === 'WH00' ? '#7c5cff' : n.id === 'SET' ? '#64748b' : '#22c55e';
    var glyph = n.id === 'WH00' ? '⚡' : n.id === 'SET' ? '≡' : '✈';
    return '<g class="n8-node" transform="translate(' + n.x + ',' + n.y + ')">' +
      '<text class="nid" x="' + (SQ + 8) + '" y="12">' + esc(n.id) + '</text>' +
      '<rect class="sq" width="' + SQ + '" height="' + SQ + '" rx="14"/>' +
      '<rect class="tint" x="12" y="12" width="' + (SQ - 24) + '" height="' + (SQ - 24) + '" rx="10" fill="' + c + '"/>' +
      '<text x="' + (SQ / 2) + '" y="' + (SQ / 2 + 8) + '" text-anchor="middle" font-size="20" fill="' + c + '">' + glyph + '</text>' +
      '<circle class="n8-port" cx="' + (SQ / 2) + '" cy="0" r="3.5"/>' +
      '<circle class="n8-port" cx="' + (SQ / 2) + '" cy="' + SQ + '" r="3.5"/>' +
      '<text class="nname" x="' + (SQ / 2) + '" y="' + (SQ + 20) + '">' + esc(n.name) + '</text>' +
      '<text class="nsub" x="' + (SQ / 2) + '" y="' + (SQ + 34) + '">' + esc(n.sub) + '</text>' +
      '</g>';
  }
  function agentNode(id, p) {
    var a = p.a, st = a.status || 'idle', c = tint(p.ci);
    var ok = st === 'idle' || st === 'trabalhando';
    var badge = st === 'bloqueado'
      ? '<circle cx="8" cy="' + (SQ - 6) + '" r="5.5" fill="#ef4444"/><text class="nerr" x="17" y="' + (SQ - 2) + '">Error</text>'
      : st === 'aguardando-humano'
        ? '<circle cx="8" cy="' + (SQ - 6) + '" r="5.5" fill="#f59e0b"/><text x="8" y="' + (SQ - 2.5) + '" text-anchor="middle" font-size="8" fill="#120c26" font-weight="700">!</text>'
        : '<circle cx="8" cy="' + (SQ - 6) + '" r="5.5" fill="#22c55e"/><text x="8" y="' + (SQ - 3) + '" text-anchor="middle" font-size="8" fill="#06210f" font-weight="700">✓</text>';
    var mi = st === 'trabalhando' ? '<circle cx="' + (SQ - 8) + '" cy="8" r="4" fill="#7c5cff"/>' : '';
    return '<g class="n8-node s-' + esc(st) + '" data-node="' + esc(id) + '" transform="translate(' + p.x + ',' + p.y + ')">' +
      '<text class="nid" x="' + (SQ + 8) + '" y="12">' + esc(id) + '</text>' +
      '<rect class="sq" width="' + SQ + '" height="' + SQ + '" rx="14"/>' +
      '<rect class="tint" x="11" y="11" width="' + (SQ - 22) + '" height="' + (SQ - 22) + '" rx="10" fill="' + c + '"/>' +
      '<image href="' + window.AVF.SPR(id) + '" x="' + ((SQ - ICON) / 2) + '" y="' + ((SQ - ICON) / 2) + '" width="' + ICON + '" height="' + ICON + '"/>' +
      '<circle class="n8-port" cx="' + (SQ / 2) + '" cy="0" r="3.5"/>' +
      '<circle class="n8-port" cx="' + (SQ / 2) + '" cy="' + SQ + '" r="3.5"/>' +
      '<circle class="n8-port" cx="0" cy="' + (SQ / 2) + '" r="3.5"/>' +
      '<circle class="n8-port" cx="' + SQ + '" cy="' + (SQ / 2) + '" r="3.5"/>' +
      badge + mi +
      '<text class="nname" x="' + (SQ / 2) + '" y="' + (SQ + 20) + '">AI Agent</text>' +
      '<text class="nsub" x="' + (SQ / 2) + '" y="' + (SQ + 34) + '">' + esc(id + ': ' + String(a.slug || '').slice(0, 17)) + '</text>' +
      '</g>';
  }

  /* ---------- montagem do SVG ---------- */
  function build(L) {
    var edges = [], nodes = [], secs = [];
    var bot = function (o) { return { x: o.x + SQ / 2, y: o.y + SQ }; };
    var top = function (o) { return { x: o.x + SQ / 2, y: o.y }; };
    var lft = function (o) { return { x: o.x, y: o.y + SQ / 2 }; };
    var rgt = function (o) { return { x: o.x + SQ, y: o.y + SQ / 2 }; };

    L.sections.forEach(function (s) {
      secs.push('<g class="n8-sec b' + (s.ci + 1) + '"><rect x="' + s.x + '" y="' + s.y + '" width="' + s.w + '" height="' + s.h + '" rx="12"/>' +
        '<text x="' + (s.x + 12) + '" y="' + (s.y + 15) + '">BLOCO ' + (s.ci + 1) + ' · ' + esc(BLOCOS[s.ci].toUpperCase()) + '</text></g>');
    });

    /* caixa red/blue no bloco 6 */
    var a32 = L.pos.A32, a33 = L.pos.A33;
    if (a32 && a33) {
      var rx = Math.min(a32.x, a33.x) - 10, ry = Math.min(a32.y, a33.y) - 10;
      var rw = Math.max(a32.x, a33.x) + SQ + 10 - rx, rh = Math.max(a32.y, a33.y) + SQ + 40 - ry;
      secs.push('<g class="n8-redbox"><rect x="' + rx + '" y="' + ry + '" width="' + rw + '" height="' + rh + '" rx="10"/>' +
        '<text x="' + (rx + 6) + '" y="' + (ry - 5) + '">⚔ CICLO RED → BLUE</text></g>');
    }

    /* WH → orquestrador */
    var head = L.orch || null;
    if (head) edges.push({ d: vpath(bot(L.wh).x, bot(L.wh).y, top(head).x, top(head).y), lbl: 'intake' });

    /* orquestrador → hubs (fan-out) */
    L.hubs.forEach(function (h, i) {
      var from = head ? bot(head) : bot(L.wh);
      edges.push({ d: vpath(from.x, from.y, top(h).x, top(h).y), lbl: 'G' + (i + 1) });
    });

    /* dentro de cada ramo: hub → 1ª linha; encadeamento por fileira.
       O "pai" da 1ª fileira é o hub DO PRÓPRIO ramo (mesmo centro x), para as
       linhas descerem retas em vez de cruzar ramos vizinhos. */
    L.sections.forEach(function (s) {
      var list = L.byBloco[s.ci].filter(function (a) { return L.pos[a.id] && !L.pos[a.id].isOrch && L.hubs.indexOf(L.pos[a.id]) === -1; });
      if (!list.length) return;
      var rows = {};
      list.forEach(function (a) { var p = L.pos[a.id]; (rows[p.y] = rows[p.y] || []).push(p); });
      var keys = Object.keys(rows).sort(function (a, b) { return a - b; });
      var secCx = s.x + s.w / 2;
      var hub = null, best = 1e9;
      L.hubs.forEach(function (h) {
        var d = Math.abs((h.x + SQ / 2) - secCx);
        if (d < best) { best = d; hub = h; }
      });
      keys.forEach(function (yk, ri) {
        var row = rows[yk].sort(function (a, b) { return a.x - b.x; });
        var parent = ri > 0 ? rows[keys[ri - 1]][0] : hub;
        if (parent) edges.push({ d: vpath(bot(parent).x, bot(parent).y, top(row[0]).x, top(row[0]).y) });
        for (var i = 0; i + 1 < row.length; i++) {
          edges.push({ d: hpath(rgt(row[i]).x, rgt(row[i]).y, lft(row[i + 1]).x, lft(row[i + 1]).y) });
        }
      });
    });

    /* convergência: último nó de cada ramo → SET → OUT */
    L.hubs.forEach(function (h, i) {
      var blocos = BRANCHES[i] || [];
      var last = null;
      blocos.forEach(function (ci) {
        L.byBloco[ci].forEach(function (a) {
          var p = L.pos[a.id]; if (!p || p.isOrch) return;
          if (!last || p.y > last.y || (p.y === last.y && p.x > last.x)) last = p;
        });
      });
      if (last) edges.push({ d: vpath(bot(last).x, bot(last).y, top(L.set).x, top(L.set).y) });
    });
    edges.push({ d: vpath(bot(L.set).x, bot(L.set).y, top(L.out).x, top(L.out).y), lbl: 'publica' });

    /* feedback (tracejado): bloco 8 → orquestrador */
    var fb = null;
    L.byBloco[7].forEach(function (a) { var p = L.pos[a.id]; if (p && (!fb || p.y > fb.y)) fb = p; });
    if (fb && head) {
      var x1 = rgt(fb).x, y1 = rgt(fb).y, x2 = rgt(head).x, y2 = rgt(head).y, off = 58;
      edges.push({
        cls: 'dash', lbl: 'feedback',
        d: 'M' + x1 + ',' + y1 + ' L' + (x1 + off) + ',' + y1 + ' L' + (x1 + off) + ',' + y2 + ' L' + x2 + ',' + y2
      });
    }

    nodes.push(ioNode(L.wh));
    if (L.orch) nodes.push(agentNode(L.orch.a.id, L.orch));
    Object.keys(L.pos).forEach(function (id) { if (L.orch && id === L.orch.a.id) return; nodes.push(agentNode(id, L.pos[id])); });
    nodes.push(ioNode(L.set)); nodes.push(ioNode(L.out));

    var edgeSvg = '<g id="wf-edges"' + (showEdges ? '' : ' style="display:none"') + '>' +
      edges.map(function (e) {
        var m = e.d.match(/M([\d.-]+),([\d.-]+)/);
        var lbl = (e.lbl && m) ? '<text class="n8-elabel" x="' + (Number(m[1]) + 7) + '" y="' + (Number(m[2]) + 14) + '">' + esc(e.lbl) + '</text>' : '';
        return '<path class="n8-edge ' + (e.cls || '') + '" d="' + e.d + '" marker-end="url(#n8arrow)"/>' + lbl;
      }).join('') + '</g>';

    /* ordem de pintura: seções (fundo) → arestas → nós (frente).
       As seções ficam atrás para nenhuma linha desaparecer sob elas. */
    return '<defs><marker id="n8arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">' +
      '<polygon points="0 0, 8 3, 0 6" fill="#5b5578"/></marker></defs>' +
      '<g class="n8-secs">' + secs.join('') + '</g>' + edgeSvg + '<g class="n8-nodes-g">' + nodes.join('') + '</g>';
  }

  /* ---------- painel Nodes (esquerda) ---------- */
  function nodesPanel(agents) {
    var pick = ['A07', 'A08', 'A13', 'A17', 'A32', 'A37', 'A44', 'A48'];
    var chips = pick.map(function (id) {
      var a = window.AVF.agentById(id); if (!a) return '';
      var c = tint(bi(a.bloco));
      return '<div class="n8-chip" data-open="' + esc(id) + '">' +
        '<div class="sq" style="background:' + c + '22;border-color:' + c + '55"><img src="' + window.AVF.SPR(id) + '" alt=""></div>' +
        '<div class="cl"><b>' + esc(a.slug) + '</b>' + esc(id) + '</div></div>';
    }).join('');
    return '<aside class="n8-nodes">' +
      '<div class="nh">Nodes<span>‹</span></div>' +
      '<div class="n8-tabs"><div class="on">Agentes</div><div>Histórico</div></div>' +
      '<div class="n8-search"><span class="mag">⌕</span><input id="n8-q" placeholder="Buscar nós…"></div>' +
      '<div class="n8-list" id="n8-list">' + chips + '</div></aside>';
  }

  function applyView() { var g = document.getElementById('wf-root'); if (g) g.setAttribute('transform', 'translate(' + view.x + ',' + view.y + ') scale(' + view.k + ')'); }
  function fit(L, svg) {
    var r = svg.getBoundingClientRect();
    /* prioriza legibilidade: nunca abaixo de 0.62 (nó fica ilegível antes disso).
       Se não couber, ancora no topo e o usuário rola/arrasta — igual n8n. */
    var k = Math.min(r.width / L.w, r.height / L.h) * 0.94;
    view.k = Math.max(0.62, Math.min(1.1, k));
    view.x = (r.width - L.w * view.k) / 2; view.y = 12; applyView();
  }

  function render(main) {
    var S = window.AVF, agents = S.state.agents;
    if (!agents.length) { S.put(main, '<p class="empty">sem agentes ainda</p>'); return; }
    var L = layout(agents);
    var running = agents.filter(function (a) { return a.status === 'trabalhando'; }).length;
    var blocked = agents.filter(function (a) { return a.status === 'bloqueado'; }).length;

    S.put(main,
      '<div class="n8">' + nodesPanel(agents) +
      '<div class="n8-canvas">' +
      '<svg id="wf-svg" viewBox="0 0 ' + L.w + ' ' + L.h + '"><g id="wf-root">' + build(L) + '</g></svg>' +
      '<div class="n8-guide"><div class="gt" id="wf-gt">ℹ Como ler este workflow ▸</div>' +
      '<div class="gc collapsed" id="wf-gc"><b>Fluxo</b><br>WH00 → A08 orquestrador → 4 ramos (8 blocos) → Set → Publicação.<br><br>' +
      '<b>Nós</b><br>✓ verde = ok · roxo pulsando = trabalhando · Error = bloqueado · ! âmbar = aguarda humano.<br><br>' +
      '<b>Linhas</b><br>sólida = handoff · tracejada = feedback (B8 → orquestrador).</div></div>' +
      '<div class="n8-active"><div class="ah"><span>Active</span><span class="x">✕</span></div>' +
      '<div class="ab"><span class="g"></span>' + agents.length + ' Running Nodes</div></div>' +
      '<div class="n8-ctl"><button id="wf-fit" title="fit">⤢</button><button id="wf-in" title="zoom in">+</button>' +
      '<button id="wf-out" title="zoom out">−</button><button id="wf-edges-t" title="conexões">⇄</button></div>' +
      '</div>' +
      '<div class="n8-status"><span class="on">● Active</span><span>' + agents.length + ' Running Nodes</span>' +
      '<span class="sp"></span><span>' + running + ' trabalhando · ' + blocked + ' bloqueado(s)</span><span>AI Venture Factory</span></div>' +
      '</div>');

    var svg = document.getElementById('wf-svg');
    if (!_fitted || _lastN !== agents.length) { fit(L, svg); _fitted = true; _lastN = agents.length; }
    else applyView();

    svg.addEventListener('wheel', function (e) { e.preventDefault(); var f = e.deltaY < 0 ? 1.12 : 1 / 1.12; view.k = Math.max(0.2, Math.min(3, view.k * f)); applyView(); }, { passive: false });
    svg.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.n8-node[data-node]')) return;
      dragging = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
      svg.classList.add('dragging'); try { svg.setPointerCapture(e.pointerId); } catch (_) {}
    });
    svg.addEventListener('pointermove', function (e) {
      var tip = document.getElementById('wf-tip');
      if (dragging) { view.x = dragging.vx + (e.clientX - dragging.x); view.y = dragging.vy + (e.clientY - dragging.y); applyView(); return; }
      var n = e.target.closest('.n8-node[data-node]');
      if (n && tip) {
        var a = window.AVF.agentById(n.getAttribute('data-node'));
        if (a) {
          window.AVF.put(tip, '<b>' + esc(a.id) + ' ' + esc(a.slug) + '</b><br>' + esc(a.bloco) +
            '<br>model <b>' + esc(a.modelo) + '</b> · effort <b>' + esc(a.effort) + '</b> · ' + esc(a.nivel) +
            '<br>status: ' + esc(a.status) + ' · TASK: ' + esc(a.task_atual || '—'));
          tip.style.display = 'block'; tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 14) + 'px';
        }
      } else if (tip) tip.style.display = 'none';
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      svg.addEventListener(ev, function () { dragging = null; svg.classList.remove('dragging'); var t = document.getElementById('wf-tip'); if (t) t.style.display = 'none'; });
    });
    svg.addEventListener('click', function (e) { var n = e.target.closest('.n8-node[data-node]'); if (n) window.AVF.openAgent(n.getAttribute('data-node')); });
    document.querySelectorAll('.n8-chip[data-open]').forEach(function (c) { c.onclick = function () { window.AVF.openAgent(c.getAttribute('data-open')); }; });

    document.getElementById('wf-fit').onclick = function () { fit(L, svg); };
    document.getElementById('wf-in').onclick = function () { view.k = Math.min(3, view.k * 1.2); applyView(); };
    document.getElementById('wf-out').onclick = function () { view.k = Math.max(0.2, view.k / 1.2); applyView(); };
    document.getElementById('wf-edges-t').onclick = function () { showEdges = !showEdges; var g = document.getElementById('wf-edges'); if (g) g.style.display = showEdges ? '' : 'none'; };
    document.getElementById('wf-gt').onclick = function () {
      guideOpen = !guideOpen;
      document.getElementById('wf-gc').classList.toggle('collapsed', !guideOpen);
      document.getElementById('wf-gt').textContent = 'ℹ Como ler este workflow ' + (guideOpen ? '▾' : '▸');
    };
    var q = document.getElementById('n8-q');
    if (q) q.oninput = function () {
      var v = q.value.toLowerCase();
      document.querySelectorAll('.n8-chip').forEach(function (c) {
        c.style.display = (!v || c.textContent.toLowerCase().indexOf(v) >= 0) ? '' : 'none';
      });
    };
  }

  return { render: render };
})();
