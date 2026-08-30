/* workflow-canvas.js — aba WORKFLOW no estilo n8n (imagem de referência).
   Fluxo top-down: WH00 (intake) → A08 orquestrador → 8 seções coloridas
   empilhadas (fileiras de nós) → saída final (Slack/monitor).
   Nós = card com sprite + id + slug + badge de status + portas.
   Bezier vertical com labels; sub-caixa vermelha "CICLO RED→BLUE" no bloco 6.
   Pan (drag), zoom (wheel/botões), fit/reset, tooltip, click = modal. */
'use strict';
window.WF = (function () {
  var NODE_W = 150, NODE_H = 54, GAP_X = 24, ROW_GAP = 20;
  var SEC_PAD = 18, SEC_LABEL = 26, SEC_GAP = 30, TOP_GAP = 34;
  var view = { x: 0, y: 0, k: 1 }, showEdges = true, dragging = null, guideOpen = false;
  var _fitted = false, _lastN = -1;
  var BLOCO_NAMES = ['Pesquisa & Viabilidade', 'Governança', 'Produto/Design/Arquitetura',
    'Engenharia', 'Conectores & Computer-Use', 'Cybersecurity', 'QA', 'Growth/Marketing/Finanças'];

  function esc(s) { return window.AVF.esc(s); }
  function bi(b) { var m = String(b || '').match(/^(\d)/); return m ? (Number(m[1]) - 1) : 7; }
  function badgeClass(st) {
    return st === 'trabalhando' ? 'nn-badge-run' : st === 'bloqueado' ? 'nn-badge-err'
      : st === 'aguardando-humano' ? 'nn-badge-wait' : st === 'na-fila' ? 'nn-badge-run' : 'nn-badge-ok';
  }
  function badgeGlyph(st) {
    return st === 'bloqueado' ? '!' : st === 'aguardando-humano' ? '…' : st === 'trabalhando' ? '' : '✓';
  }

  function layout(agents) {
    var cols = [[], [], [], [], [], [], [], []];
    agents.forEach(function (a) { cols[bi(a.bloco)].push(a); });
    cols.forEach(function (l) { l.sort(function (a, b) { return a.id.localeCompare(b.id); }); });

    // largura de cada seção = maior fileira; cap de colunas p/ não ficar gigante
    var MAXC = 8;
    var secW = function (n) { var c = Math.min(n, MAXC) || 1; return SEC_PAD * 2 + c * NODE_W + (c - 1) * GAP_X; };
    var canvasW = Math.max.apply(null, cols.map(function (c) { return secW(c.length); }).concat([secW(MAXC)])) + 120;
    var cx = canvasW / 2;

    var pos = {}, sections = [], y = TOP_GAP;
    // WH00
    var wh = { x: cx - NODE_W / 2, y: y, id: 'WH00', slug: 'intake / webhook', kind: 'io' };
    y += NODE_H + 40;
    // A08 orquestrador logo abaixo (se existir)
    var orch = null;
    var a08 = agents.filter(function (a) { return a.id === 'A08'; })[0];
    if (a08) { orch = { x: cx - NODE_W / 2, y: y, a: a08 }; pos[a08.id] = orch; y += NODE_H + 40; }

    cols.forEach(function (list, ci) {
      if (!list.length) return;
      var c = Math.min(list.length, MAXC);
      var rows = Math.ceil(list.length / MAXC);
      var w = secW(list.length);
      var h = SEC_LABEL + SEC_PAD + rows * NODE_H + (rows - 1) * ROW_GAP + SEC_PAD;
      var sx = cx - w / 2, sy = y;
      sections.push({ ci: ci, x: sx, y: sy, w: w, h: h, n: list.length });
      list.forEach(function (a, i) {
        if (a.id === 'A08' && orch) return; // orquestrador já colocado no topo
        var r = Math.floor(i / MAXC), cc = i % MAXC;
        var nx = sx + SEC_PAD + cc * (NODE_W + GAP_X);
        var ny = sy + SEC_LABEL + SEC_PAD + r * (NODE_H + ROW_GAP);
        pos[a.id] = { x: nx, y: ny, a: a };
      });
      y += h + SEC_GAP;
    });

    // saída final
    var out = { x: cx - NODE_W / 2, y: y + 6, id: 'OUT', slug: 'saída final (marketing/monitor)', kind: 'io' };
    var H = y + NODE_H + 60;
    return { pos: pos, cols: cols, sections: sections, wh: wh, orch: orch, out: out, w: canvasW, h: H, cx: cx };
  }

  function vbez(x1, y1, x2, y2) {
    var dy = Math.max(24, Math.abs(y2 - y1) * 0.4);
    return 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + (y1 + dy) + ' ' + x2 + ',' + (y2 - dy) + ' ' + x2 + ',' + y2;
  }
  function ioNode(n) {
    var teal = n.id === 'WH00' ? '#2dd4bf' : '#a78bfa';
    return '<g class="nn-node" transform="translate(' + n.x + ',' + n.y + ')">' +
      '<rect class="nn-card" width="' + NODE_W + '" height="' + NODE_H + '" rx="10"/>' +
      '<rect x="10" y="9" width="36" height="36" rx="8" fill="' + teal + '" opacity="0.18"/>' +
      '<text x="28" y="32" text-anchor="middle" font-size="18" fill="' + teal + '">' + (n.id === 'WH00' ? '⬇' : '★') + '</text>' +
      '<text class="nn-title" x="' + ((NODE_W + 46) / 2 + 6) + '" y="24">' + esc(n.id) + '</text>' +
      '<text class="nn-sub" x="' + ((NODE_W + 46) / 2 + 6) + '" y="40">' + esc(n.slug.slice(0, 20)) + '</text>' +
      '</g>';
  }
  function agentNode(id, p) {
    var a = p.a, st = a.status || 'idle';
    var glyph = badgeGlyph(st);
    return '<g class="nn-node s-' + esc(st) + '" data-node="' + esc(id) + '" transform="translate(' + p.x + ',' + p.y + ')">' +
      '<rect class="nn-card" width="' + NODE_W + '" height="' + NODE_H + '" rx="10"/>' +
      '<image href="' + window.AVF.SPR(id) + '" x="9" y="9" width="36" height="36" style="image-rendering:pixelated"/>' +
      '<text class="nn-title" x="' + (54 + (NODE_W - 54) / 2) + '" y="24">' + esc(id) + '</text>' +
      '<text class="nn-sub" x="' + (54 + (NODE_W - 54) / 2) + '" y="40">' + esc(String(a.slug || '').slice(0, 14)) + '</text>' +
      '<circle class="nn-port" cx="' + (NODE_W / 2) + '" cy="0" r="4"/>' +
      '<circle class="nn-port" cx="' + (NODE_W / 2) + '" cy="' + NODE_H + '" r="4"/>' +
      '<circle class="' + badgeClass(st) + '" cx="' + (NODE_W - 12) + '" cy="12" r="7"/>' +
      (glyph ? '<text x="' + (NODE_W - 12) + '" y="16" text-anchor="middle" font-size="10" fill="#191919" font-weight="700">' + glyph + '</text>' : '') +
      '</g>';
  }

  function build(L) {
    var parts = [], edges = [];
    function botC(o) { return { x: o.x + NODE_W / 2, y: o.y + NODE_H }; }
    function topC(o) { return { x: o.x + NODE_W / 2, y: o.y }; }

    // seções coloridas (atrás dos nós)
    L.sections.forEach(function (s) {
      parts.push('<g class="wf-section b' + (s.ci + 1) + '">' +
        '<rect x="' + s.x + '" y="' + s.y + '" width="' + s.w + '" height="' + s.h + '" rx="10"/>' +
        '<text x="' + (s.x + SEC_PAD) + '" y="' + (s.y + 18) + '">BLOCO ' + (s.ci + 1) + ' · ' + esc(BLOCO_NAMES[s.ci]) + '</text></g>');
    });
    // sub-caixa vermelha CICLO RED→BLUE no bloco 6 (envolve A32/A33 se presentes)
    var a32 = L.pos.A32, a33 = L.pos.A33;
    if (a32 && a33) {
      var rx = Math.min(a32.x, a33.x) - 8, ry = Math.min(a32.y, a33.y) - 8;
      var rw = Math.max(a32.x, a33.x) + NODE_W + 8 - rx, rh = Math.max(a32.y, a33.y) + NODE_H + 8 - ry;
      parts.push('<g class="wf-redbox"><rect x="' + rx + '" y="' + ry + '" width="' + rw + '" height="' + rh + '" rx="8"/>' +
        '<text x="' + (rx + 6) + '" y="' + (ry - 4) + '">⚔ CICLO RED→BLUE</text></g>');
    }

    // arestas: WH → orquestrador → lead do bloco1; spine entre blocos; chain intra-bloco; feedback
    function leadOf(ci) { var l = L.cols[ci].filter(function (a) { return a.id !== 'A08'; })[0] || L.cols[ci][0]; return l ? L.pos[l.id] : null; }
    var prev = null;
    if (L.orch) { edges.push({ d: vbez(botC(L.wh).x, botC(L.wh).y, topC(L.orch).x, topC(L.orch).y), lbl: 'intake' }); prev = L.orch; }
    else { prev = L.wh; }
    for (var ci = 0; ci < 8; ci++) {
      var lead = leadOf(ci); if (!lead) continue;
      edges.push({ d: vbez(botC(prev).x, botC(prev).y, topC(lead).x, topC(lead).y), lbl: 'G' + (ci) });
      // chain intra-bloco (fileira)
      var members = L.cols[ci].filter(function (a) { return a.id !== 'A08'; });
      for (var i = 0; i + 1 < members.length; i++) {
        var p1 = L.pos[members[i].id], p2 = L.pos[members[i + 1].id];
        if (!p1 || !p2) continue;
        if (Math.abs(p1.y - p2.y) < 2) {
          // mesma fileira: aresta horizontal curta
          edges.push({ d: 'M' + (p1.x + NODE_W) + ',' + (p1.y + NODE_H / 2) + ' C' + (p1.x + NODE_W + 12) + ',' + (p1.y + NODE_H / 2) + ' ' + (p2.x - 12) + ',' + (p2.y + NODE_H / 2) + ' ' + p2.x + ',' + (p2.y + NODE_H / 2), lbl: '' });
        } else {
          edges.push({ d: vbez(botC(p1).x, botC(p1).y, topC(p2).x, topC(p2).y), lbl: '' });
        }
      }
      prev = lead;
    }
    // saída final
    edges.push({ d: vbez(botC(prev).x, botC(prev).y, topC(L.out).x, topC(L.out).y), lbl: 'publica' });
    // feedback B8 -> B2 e B8 -> B3 (dashed)
    var l8 = leadOf(7), l2 = leadOf(1), l3 = leadOf(2);
    function sidePath(a, b) {
      var x1 = a.x, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2, off = 70 + Math.abs(a.ci || 0) * 10;
      return 'M' + x1 + ',' + y1 + ' C' + (x1 - off) + ',' + y1 + ' ' + (x2 - off) + ',' + y2 + ' ' + x2 + ',' + y2;
    }
    if (l8 && l2) edges.push({ d: sidePath(l8, l2), lbl: 'feedback', cls: 'feedback' });
    if (l8 && l3) edges.push({ d: sidePath(l8, l3), lbl: 'feedback', cls: 'feedback' });

    parts.unshift('<g id="wf-edges"' + (showEdges ? '' : ' style="display:none"') + '>' +
      edges.map(function (e) {
        var mid = e.d.match(/M([\d.]+),([\d.]+)/);
        var lblEl = e.lbl && mid ? '<text class="wf-elabel" x="' + (Number(mid[1]) + 6) + '" y="' + (Number(mid[2]) - 4) + '">' + esc(e.lbl) + '</text>' : '';
        return '<path class="wf-edge ' + (e.cls || '') + '" d="' + e.d + '"/>' + lblEl;
      }).join('') + '</g>');

    // nós
    parts.push(ioNode(L.wh));
    if (L.orch) parts.push(agentNode(L.orch.a.id, L.orch));
    Object.keys(L.pos).forEach(function (id) { if (L.orch && id === L.orch.a.id) return; parts.push(agentNode(id, L.pos[id])); });
    parts.push(ioNode(L.out));
    return parts.join('');
  }

  function applyView() { var g = document.getElementById('wf-root'); if (g) g.setAttribute('transform', 'translate(' + view.x + ',' + view.y + ') scale(' + view.k + ')'); }
  function fit(L, svg) {
    var r = svg.getBoundingClientRect();
    var k = Math.min(r.width / L.w, r.height / L.h) * 0.94;
    k = Math.max(0.3, Math.min(1.4, k));
    view.k = k; view.x = (r.width - L.w * k) / 2; view.y = 14; applyView();
  }

  function render(main) {
    var S = window.AVF, agents = S.state.agents;
    if (!agents.length) { S.put(main, '<p class="empty">sem agentes ainda</p>'); return; }
    var L = layout(agents);
    var running = agents.filter(function (a) { return a.status === 'trabalhando'; }).length;

    S.put(main,
      '<div id="wf-wrap">' +
      '<svg id="wf-svg" viewBox="0 0 ' + L.w + ' ' + L.h + '"><g id="wf-root">' + build(L) + '</g></svg>' +
      '<div id="wf-guide"><div class="gt" id="wf-gt">ℹ Como ler este workflow ▸</div>' +
      '<div class="gc collapsed" id="wf-gc"><b>Fluxo</b><br>WH00 intake → A08 orquestrador → blocos 1→8 → saída.<br>' +
      '<b>Nós</b><br>✓ verde ok · teal pulsando = trabalhando · ! vermelho = bloqueado · … amarelo = aguardando humano.<br>' +
      '<b>Linhas</b><br>sólida = handoff · tracejada = feedback (B8→B2/B3).</div></div>' +
      '<div id="wf-runind"><span class="g"></span> ' + running + ' de ' + agents.length + ' nós ativos</div>' +
      '<div id="wf-controls">' +
      '<button class="control-btn" id="wf-fit" title="fit">⊡</button>' +
      '<button class="control-btn" id="wf-in" title="zoom in">+</button>' +
      '<button class="control-btn" id="wf-out" title="zoom out">−</button>' +
      '<button class="control-btn" id="wf-reset" title="reset">↺</button>' +
      '<button class="control-btn" id="wf-edges-t" title="conexões">⇄</button></div></div>');

    var svg = document.getElementById('wf-svg');
    // só ajusta a câmera na 1ª vez ou quando muda a contagem de nós; senão
    // preserva o pan/zoom do usuário entre os re-renders do polling.
    if (!_fitted || _lastN !== agents.length) { fit(L, svg); _fitted = true; _lastN = agents.length; }
    else applyView();

    svg.addEventListener('wheel', function (e) { e.preventDefault(); var f = e.deltaY < 0 ? 1.12 : 1 / 1.12; view.k = Math.max(0.3, Math.min(3, view.k * f)); applyView(); }, { passive: false });
    svg.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.nn-node[data-node]')) return;
      dragging = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
      svg.classList.add('dragging'); try { svg.setPointerCapture(e.pointerId); } catch (_) {}
    });
    svg.addEventListener('pointermove', function (e) {
      var tip = document.getElementById('wf-tip');
      if (dragging) { view.x = dragging.vx + (e.clientX - dragging.x); view.y = dragging.vy + (e.clientY - dragging.y); applyView(); return; }
      var n = e.target.closest('.nn-node[data-node]');
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
    svg.addEventListener('click', function (e) { var n = e.target.closest('.nn-node[data-node]'); if (n) window.AVF.openAgent(n.getAttribute('data-node')); });

    document.getElementById('wf-fit').onclick = function () { fit(L, svg); };
    document.getElementById('wf-in').onclick = function () { view.k = Math.min(3, view.k * 1.2); applyView(); };
    document.getElementById('wf-out').onclick = function () { view.k = Math.max(0.3, view.k / 1.2); applyView(); };
    document.getElementById('wf-reset').onclick = function () { view = { x: 0, y: 0, k: 1 }; applyView(); };
    document.getElementById('wf-edges-t').onclick = function () { showEdges = !showEdges; var g = document.getElementById('wf-edges'); if (g) g.style.display = showEdges ? '' : 'none'; };
    document.getElementById('wf-gt').onclick = function () {
      guideOpen = !guideOpen; var c = document.getElementById('wf-gc');
      if (c) c.classList.toggle('collapsed', !guideOpen);
      document.getElementById('wf-gt').textContent = 'ℹ Como ler este workflow ' + (guideOpen ? '▾' : '▸');
    };
  }

  return { render: render };
})();
