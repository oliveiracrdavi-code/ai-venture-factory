/* agent-chat.js — aba CHAT GERAL (você é ESPECTADOR).
   Timeline das conversas entre agentes (company/logs/chats/*.jsonl agregados
   por snapshot.js em company/state/chat-merged.jsonl). Filtros + ao vivo/replay. */
'use strict';
window.AgentChat = (function () {
  var f = { agent: '', bloco: '', project: '', live: true, replay: 100 };
  var lastCount = -1;

  function esc(s) { return window.AVF.esc(s); }

  function render(main) {
    var S = window.AVF, msgs = S.state.chat.slice();
    var agents = S.state.agents;

    var filtered = msgs.filter(function (m) {
      if (f.agent && m.from !== f.agent && m.to !== f.agent) return false;
      if (f.project && String(m.task_ref || '').indexOf(f.project) < 0 && m.project !== f.project) return false;
      if (f.bloco) {
        var a = S.agentById(m.from);
        if (!a || String(a.bloco).indexOf(f.bloco) !== 0) return false;
      }
      return true;
    });
    if (!f.live) filtered = filtered.slice(0, Math.max(1, Math.round(filtered.length * f.replay / 100)));

    var recent = msgs.filter(function (m) { return Date.now() - Date.parse(m.ts || 0) < 5 * 60000; });
    var talking = {};
    recent.forEach(function (m) { talking[m.from] = 1; });
    var nTalk = Object.keys(talking).length;

    var opts = function (arr, cur) {
      return '<option value="">(todos)</option>' + arr.map(function (x) {
        return '<option value="' + esc(x) + '"' + (x === cur ? ' selected' : '') + '>' + esc(x) + '</option>';
      }).join('');
    };
    var agentIds = agents.map(function (a) { return a.id; });
    var projects = Object.keys(S.state.pipeline.projects || {});
    var blocos = ['1', '2', '3', '4', '5', '6', '7', '8'];

    var body = filtered.length ? filtered.map(function (m) {
      return '<div class="msg"><img src="' + S.SPR(m.from) + '" alt="">' +
        '<div class="bubble"><div class="mh"><b>' + esc(m.from) + '</b> → ' + esc(m.to) + ' · ' + esc(S.shortTs(m.ts)) +
        (m.task_ref ? ' · <span class="sh-tag">' + esc(m.task_ref) + '</span>' : '') + '</div>' +
        '<div class="mb">' + esc(m.content) + '</div></div></div>';
    }).join('') :
      '<p class="empty">sem mensagens entre agentes ainda.<br><span class="muted">Elas aparecem em company/logs/chats/&lt;agente&gt;.jsonl quando o piloto rodar.</span></p>';

    var marquee = msgs.slice(-8).map(function (m) { return esc(m.from) + '→' + esc(m.to) + ': ' + esc(String(m.content).slice(0, 60)); }).join('   ·   ');

    S.put(main,
      '<div class="chatwrap"><div class="chat-toolbar">' +
      '<b>Chat geral</b><span class="muted">você é espectador</span>' +
      '<label>Agente <select id="c-agent">' + opts(agentIds, f.agent) + '</select></label>' +
      '<label>Bloco <select id="c-bloco">' + opts(blocos, f.bloco) + '</select></label>' +
      '<label>Projeto <select id="c-proj">' + opts(projects, f.project) + '</select></label>' +
      '<button class="sh-btn' + (f.live ? ' primary' : '') + '" id="c-live">' + (f.live ? 'ao vivo' : 'replay') + '</button>' +
      (f.live ? '' : '<input type="range" id="c-slider" min="5" max="100" value="' + f.replay + '">') +
      '<span class="spacer" style="flex:1"></span>' +
      (nTalk ? '<span class="live" id="c-talking"></span>' : '<span class="muted">sem atividade recente</span>') +
      '</div>' +
      '<div class="chat-log" id="c-log">' + body + '</div>' +
      (marquee ? '<div class="rb-marquee" style="border-top:1px solid var(--border);padding:6px 0;font-size:11px;color:var(--muted)"><span class="track">' + marquee + '</span></div>' : '') +
      '</div>');

    if (nTalk) window.FX.typewriter(document.getElementById('c-talking'), nTalk + ' agente(s) conversando agora', 22);

    var log = document.getElementById('c-log');
    if (f.live && log && filtered.length !== lastCount) { log.scrollTop = log.scrollHeight; lastCount = filtered.length; }

    var ga = document.getElementById('c-agent'), gb = document.getElementById('c-bloco'), gp = document.getElementById('c-proj');
    if (ga) ga.onchange = function () { f.agent = ga.value; render(main); };
    if (gb) gb.onchange = function () { f.bloco = gb.value; render(main); };
    if (gp) gp.onchange = function () { f.project = gp.value; render(main); };
    var lv = document.getElementById('c-live');
    if (lv) lv.onclick = function () { f.live = !f.live; render(main); };
    var sl = document.getElementById('c-slider');
    if (sl) sl.oninput = function () { f.replay = Number(sl.value); render(main); };
  }

  return { render: render };
})();
