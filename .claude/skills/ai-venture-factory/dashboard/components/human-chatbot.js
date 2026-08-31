/* human-chatbot.js — aba CHATBOT HUMANO (você interage).
   Você pergunta, pede métrica, dá instrução, faz anúncio; e aprova/nega
   pedidos dos agentes. POST /api/human-message e /api/approve. */
'use strict';
window.HumanChat = (function () {
  var busy = false;

  function esc(s) { return window.AVF.esc(s); }

  function render(main) {
    var S = window.AVF;
    var msgs = S.state.humanChat.slice(-200);
    var pend = (S.state.approvals && S.state.approvals.pending) || [];
    var anns = (S.state.announcements && S.state.announcements.items) || [];

    var body = msgs.length ? msgs.map(function (m) {
      var me = m.from === 'human' || m.from === 'founder';
      var sys = m.type === 'system' || m.from === 'system';
      var who = me ? 'Você' : m.from;
      var av = me ? '' : '<img src="' + S.SPR(m.from) + '" alt="">';
      return '<div class="msg' + (me ? ' me' : '') + (sys ? ' system' : '') + '">' + av +
        '<div class="bubble"><div class="mh"><b>' + esc(who) + '</b> · ' + esc(S.shortTs(m.ts)) +
        (m.task_ref ? ' · <span class="sh-tag">' + esc(m.task_ref) + '</span>' : '') + '</div>' +
        '<div class="mb">' + esc(m.content) + '</div></div></div>';
    }).join('') : '<p class="empty">Nenhuma conversa ainda. Pergunte algo, peça uma métrica, dê uma instrução ou faça um anúncio (📢).</p>';

    var approvals = pend.map(function (p) {
      return '<div class="approval"><div class="aq">⚠️ ' + esc(p.agent || '?') + ' solicita: ' + esc(p.request) + '</div>' +
        (p.detail ? '<div class="muted" style="margin-bottom:8px">' + esc(p.detail) + '</div>' : '') +
        '<div class="ab"><button class="sh-btn primary" data-appr="' + esc(p.id) + '">Aprovar</button>' +
        '<button class="sh-btn bad" data-deny="' + esc(p.id) + '">Negar</button>' +
        '<button class="sh-btn ghost" data-ask="' + esc(p.id) + '">Perguntar mais</button></div></div>';
    }).join('');

    var annBar = anns.length ? '<div class="notice">📢 último anúncio: ' + esc(anns[anns.length - 1].text || '') + '</div>' : '';

    var hint = S.HOSTED
      ? '<div class="notice">Modo monitor (hospedado, somente leitura). Para instruir, use o painel local/túnel ou a sessão do Claude.</div>'
      : '';

    S.put(main,
      '<div class="chatwrap"><div class="chat-toolbar">' +
      '<b>Chatbot humano</b><span class="muted">fale com a fábrica (roteia para A08 chief-of-staff)</span>' +
      '<span style="flex:1"></span>' +
      '<button class="sh-btn ghost" data-q="Qual o status do app-001?">status</button>' +
      '<button class="sh-btn ghost" data-q="Qual o MRR atual e quantos bugs criticos estao abertos?">métricas</button>' +
      '<button class="sh-btn ghost" data-q="📢 ">anúncio</button>' +
      '</div>' + annBar + approvals +
      '<div class="chat-log" id="h-log">' + body + '</div>' + hint +
      '<div class="notice" id="h-notice"></div>' +
      '<div class="composer"><textarea id="h-input" placeholder="pergunte, peça métrica, dê instrução, ou comece com 📢 para anunciar…"' +
      (S.HOSTED ? ' disabled' : '') + '></textarea>' +
      '<button class="sh-btn primary" id="h-send"' + (S.HOSTED ? ' disabled' : '') + '>Enviar</button></div></div>');

    var log = document.getElementById('h-log'); if (log) log.scrollTop = log.scrollHeight;

    document.querySelectorAll('[data-q]').forEach(function (b) {
      b.onclick = function () {
        var ta = document.getElementById('h-input');
        if (!ta) return; ta.value = b.getAttribute('data-q'); ta.focus();
      };
    });
    document.querySelectorAll('[data-appr]').forEach(function (b) { b.onclick = function () { decide(b.getAttribute('data-appr'), 'approve', main); }; });
    document.querySelectorAll('[data-deny]').forEach(function (b) { b.onclick = function () { decide(b.getAttribute('data-deny'), 'deny', main); }; });
    document.querySelectorAll('[data-ask]').forEach(function (b) {
      b.onclick = function () {
        var ta = document.getElementById('h-input');
        if (ta) { ta.value = 'Sobre a solicitação ' + b.getAttribute('data-ask') + ': me explique melhor o que exatamente vai acessar/fazer e por quê.'; ta.focus(); }
      };
    });

    var send = document.getElementById('h-send');
    if (send) send.onclick = function () { doSend(main); };
    var ta = document.getElementById('h-input');
    if (ta) ta.onkeydown = function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) doSend(main); };
  }

  function doSend(main) {
    var S = window.AVF;
    var ta = document.getElementById('h-input'), notice = document.getElementById('h-notice');
    var btn = document.getElementById('h-send');
    var text = (ta && ta.value || '').trim();
    if (!text || busy) return;
    busy = true; btn.disabled = true;
    if (notice) notice.textContent = 'enviando…';
    S.post('/api/human-message', { text: text }).then(function (j) {
      if (!j || !j.ok) throw new Error(j && j.error ? j.error : 'falha');
      if (notice) notice.textContent = j.kind === 'announcement'
        ? ('anúncio registrado em ' + j.file)
        : ('recebido' + (j.task ? (' — ' + j.task + ' criada para ' + j.agent) : ''));
      ta.value = '';
    }).catch(function (e) {
      if (notice) notice.textContent = 'erro: ' + e.message + ' (sem backend? modo monitor)';
    }).then(function () { busy = false; btn.disabled = false; });
  }

  function decide(id, action, main) {
    var S = window.AVF, notice = document.getElementById('h-notice');
    S.post('/api/approve', { id: id, action: action }).then(function (j) {
      if (notice) notice.textContent = (j && j.ok) ? ('solicitação ' + id + ' → ' + action) : ('erro: ' + (j && j.error));
    }).catch(function () { if (notice) notice.textContent = 'sem backend (modo monitor)'; });
  }

  return { render: render };
})();
