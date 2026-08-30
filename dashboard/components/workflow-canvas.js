/* workflow-canvas.js — aba WORKFLOW (canvas SVG estilo n8n).
   49 nós em 8 colunas (1 por bloco), arestas animadas bloco→bloco + feedback.
   Pan (drag), zoom (wheel), reset, toggle conexões, tooltip, click = modal. */
'use strict';
window.WF = (function () {
  var COL_W = 210, NODE_W = 158, NODE_H = 52, ROW_H = 74, PAD_X = 60, PAD_Y = 64;
  var view = { x: 0, y: 0, k: 1 }, showEdges = true, dragging = null;

  function blocoIndex(b) {
    var m = String(b || '').match(/^(\d)/);
    return m ? (Number(m[1]) - 1) : 7;
  }
  function esc(s) { return window.AVF.esc(s); }

  function layout(agents) {
    var cols = [[], [], [], [], [], [], [], []];
    agents.forEach(function (a) { cols[blocoIndex(a.bloco)].push(a); });
    var pos = {};
    cols.forEach(function (list, ci) {
      list.forEach(function (a, ri) {
        pos[a.id] = { x: PAD_X + ci * COL_W, y: PAD_Y + ri * ROW_H, col: ci, row: ri, a: a };
      });
    });
    var maxRows = Math.max.apply(null, cols.map(function (c) { return c.length; }).concat([1]));
    return { pos: pos, cols: cols, w: PAD_X * 2 + 8 * COL_W, h: PAD_Y * 2 + maxRows * ROW_H };
  }

  function edgePath(a, b) {
    var x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
    var mx = (x1 + x2) / 2;
    return 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2;
  }
  function feedbackPath(a, b, h) {
    var x1 = a.x + NODE_W / 2, y1 = a.y + NODE_H, x2 = b.x + NODE_W / 2, y2 = b.y + NODE_H;
    var yy = h - 18;
    return 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + yy + ' ' + x2 + ',' + yy + ' ' + x2 + ',' + y2;
  }

  function build(L) {
    var parts = [], edges = [];
    for (var c = 0; c < 7; c++) {
      var from = L.cols[c], to = L.cols[c + 1];
      if (!from.length || !to.length) continue;
      var target = L.pos[to[0].id];
      from.forEach(function (a) { edges.push({ d: edgePath(L.pos[a.id], target), fb: false }); });
    }
    if (L.cols[7].length && L.cols[1].length) edges.push({ d: feedbackPath(L.pos[L.cols[7][0].id], L.pos[L.cols[1][0].id], L.h), fb: true });
    if (L.cols[7].length && L.cols[2].length) edges.push({ d: feedbackPath(L.pos[L.cols[7][0].id], L.pos[L.cols[2][0].id], L.h), fb: true });

    parts.push('<g id="wf-edges"' + (showEdges ? '' : ' style="display:none"') + '>' +
      edges.map(function (e) { return '<path class="wf-edge' + (e.fb ? ' feedback' : '') + '" d="' + e.d + '"/>'; }).join('') + '</g>');

    L.cols.forEach(function (list, ci) {
      if (!list.length) return;
      parts.push('<text class="wf-col-label" x="' + (PAD_X + ci * COL_W) + '" y="' + (PAD_Y - 22) + '">BLOCO ' + (ci + 1) + '</text>');
    });

    Object.keys(L.pos).forEach(function (id) {
      var p = L.pos[id], a = p.a;
      parts.push(
        '<g class="wf-node s-' + esc(a.status) + (a.status === 'trabalhando' ? ' active' : '') + '" data-node="' + esc(id) + '" transform="translate(' + p.x + ',' + p.y + ')">' +
        '<rect class="card" width="' + NODE_W + '" height="' + NODE_H + '" rx="8"/>' +
        '<image href="' + window.AVF.SPR(id) + '" x="7" y="8" width="36" height="36" style="image-rendering:pixelated"/>' +
        '<text class="nid" x="52" y="23">' + esc(id) + '</text>' +
        '<text class="nslug" x="52" y="38">' + esc(String(a.slug || '').slice(0, 18)) + '</text>' +
        '</g>');
    });
    return parts.join('');
  }

  function applyView() {
    var g = document.getElementById('wf-root');
    if (g) g.setAttribute('transform', 'translate(' + view.x + ',' + view.y + ') scale(' + view.k + ')');
  }

  function render(main) {
    var S = window.AVF, agents = S.state.agents;
    if (!agents.length) { S.put(main, '<p class="empty">sem agentes ainda</p>'); return; }
    var L = layout(agents);

    S.put(main,
      '<div id="wf-wrap"><div class="rb-dotgrid"></div>' +
      '<svg id="wf-svg" viewBox="0 0 ' + L.w + ' ' + L.h + '" preserveAspectRatio="xMidYMid meet">' +
      '<g id="wf-root">' + build(L) + '</g></svg>' +
      '<div id="wf-legend"><b>status</b> · <span style="color:#22c55e">■</span> trabalhando · ' +
      '<span style="color:#eab308">■</span> aguardando humano · <span style="color:#ef4444">■</span> bloqueado · ' +
      '<span style="color:#38bdf8">■</span> na fila · <span style="color:#64748b">■</span> idle</div>' +
      '<div id="wf-controls">' +
      '<button class="sh-btn" id="wf-in">+</button><button class="sh-btn" id="wf-out">−</button>' +
      '<button class="sh-btn" id="wf-reset">reset</button>' +
      '<button class="sh-btn" id="wf-edges-t">conexões</button></div></div>');

    var svg = document.getElementById('wf-svg');
    applyView();

    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      view.k = Math.max(0.3, Math.min(3, view.k * f));
      applyView();
    }, { passive: false });

    svg.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.wf-node')) return;
      dragging = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
      svg.classList.add('dragging');
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
    });
    svg.addEventListener('pointermove', function (e) {
      var tip = document.getElementById('wf-tip');
      if (dragging) {
        view.x = dragging.vx + (e.clientX - dragging.x);
        view.y = dragging.vy + (e.clientY - dragging.y);
        applyView(); return;
      }
      var n = e.target.closest('.wf-node');
      if (n) {
        var a = window.AVF.agentById(n.getAttribute('data-node'));
        if (a) {
          window.AVF.put(tip, '<b>' + esc(a.id) + ' ' + esc(a.slug) + '</b><br>' + esc(a.bloco) +
            '<br>model <b>' + esc(a.modelo) + '</b> · effort <b>' + esc(a.effort) + '</b> · ' + esc(a.nivel) +
            '<br>status: ' + esc(a.status) + ' · TASK: ' + esc(a.task_atual || '—'));
          tip.style.display = 'block';
          tip.style.left = (e.clientX + 14) + 'px';
          tip.style.top = (e.clientY + 14) + 'px';
        }
      } else if (tip) { tip.style.display = 'none'; }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      svg.addEventListener(ev, function () {
        dragging = null; svg.classList.remove('dragging');
        var t = document.getElementById('wf-tip'); if (t) t.style.display = 'none';
      });
    });
    svg.addEventListener('click', function (e) {
      var n = e.target.closest('.wf-node');
      if (n) window.AVF.openAgent(n.getAttribute('data-node'));
    });

    document.getElementById('wf-in').onclick = function () { view.k = Math.min(3, view.k * 1.2); applyView(); };
    document.getElementById('wf-out').onclick = function () { view.k = Math.max(0.3, view.k / 1.2); applyView(); };
    document.getElementById('wf-reset').onclick = function () { view = { x: 0, y: 0, k: 1 }; applyView(); };
    document.getElementById('wf-edges-t').onclick = function () {
      showEdges = !showEdges;
      var g = document.getElementById('wf-edges'); if (g) g.style.display = showEdges ? '' : 'none';
    };
  }

  return { render: render };
})();
