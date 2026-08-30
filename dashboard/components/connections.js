/* connections.js — aba "Conexões": pedidos de API/credencial feitos pelos
   agentes, com tutorial super detalhado pro fundador preencher e enviar.
   O valor da chave NUNCA aparece de volta na tela nem em log — só um preview
   mascarado (****1234) depois de enviada. */
'use strict';
window.Connections = (function () {
  function esc(s) { return window.AVF.esc(s); }

  function tutorial() {
    return '<div class="sh-card" style="margin-bottom:var(--space-4)">' +
      '<div class="sh-card-head">Tutorial — como conseguir e preencher uma API key (do zero)</div>' +
      '<div class="sh-card-body">' +
      '<ol style="margin:0;padding-left:20px;line-height:1.9">' +
      '<li><b>Crie uma conta grátis</b> no site do serviço pedido (link do próprio pedido, quando o agente já pesquisou).</li>' +
      '<li>Procure no menu por <b>"API Keys"</b>, <b>"Developers"</b>, <b>"Settings → API"</b> ou <b>"Credenciais"</b> — quase todo serviço tem uma dessas páginas.</li>' +
      '<li>Clique em algo como <b>"Create key"</b> / <b>"Generate new key"</b> / <b>"Gerar chave"</b>.</li>' +
      '<li><b>Copie o valor completo</b> — geralmente uma string longa de letras e números (às vezes começa com <span class="mono">sk-</span>, <span class="mono">pk_</span>, <span class="mono">AIza</span>, etc). Copie assim que aparecer: muitos serviços só mostram uma vez.</li>' +
      '<li>Cole no campo do pedido abaixo e clique em <b>"Enviar pro agente"</b>.</li>' +
      '</ol>' +
      '<p class="notice" style="padding:0;margin-top:var(--space-3)">🔒 A chave é salva só localmente em <span class="mono">company/secrets/</span> (fora do git, nunca sobe pro GitHub) e nunca aparece de novo na tela nem em nenhum log — só um preview tipo <span class="mono">****ab12</span>.</p>' +
      '</div></div>';
  }

  function reqCard(r) {
    var a = window.AVF.agentById(r.agent);
    var who = a ? (window.AVF.displayName(a) + ' (' + r.agent + ')') : r.agent;
    var linkHtml = r.signup_url ? ('<a href="' + esc(r.signup_url) + '" target="_blank" rel="noopener">' + esc(r.signup_url) + '</a>') : '<span class="muted">agente ainda não achou um link — pesquise "' + esc(r.api_name) + ' free API" </span>';
    return '<div class="cred-card sh-card" style="margin-bottom:var(--space-3)">' +
      '<div class="sh-card-body">' +
      '<div style="display:flex;justify-content:space-between;gap:var(--space-3);flex-wrap:wrap">' +
      '<div><b>' + esc(r.api_name) + '</b><div class="muted" style="font-size:var(--text-sm)">pedido por ' + esc(who) + '</div></div>' +
      '<span class="sh-tag">' + esc(r.env_key || r.api_name) + '</span>' +
      '</div>' +
      '<p style="margin:var(--space-2) 0"><b>Por quê:</b> ' + esc(r.why || '—') + '</p>' +
      '<p style="margin:0 0 4px"><b>Onde conseguir (grátis):</b> ' + linkHtml + '</p>' +
      (r.free_tier_note ? ('<p class="muted" style="margin:0 0 var(--space-2);font-size:var(--text-sm)">plano grátis: ' + esc(r.free_tier_note) + '</p>') : '') +
      '<div style="display:flex;gap:var(--space-2);margin-top:var(--space-3)">' +
      '<input type="password" class="cred-input" data-id="' + esc(r.id) + '" placeholder="cole a chave aqui" style="flex:1;background:var(--bg-app);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-1);padding:8px 10px;font-family:var(--font-mono)">' +
      '<button class="sh-btn primary cred-send" data-id="' + esc(r.id) + '">Enviar pro agente</button>' +
      '</div></div></div>';
  }

  function filledRow(f) {
    return '<tr><td>' + esc(f.api_name) + '</td><td class="mono">' + esc(f.preview) + '</td>' +
      '<td>' + esc(f.agent) + '</td><td class="mono">' + esc(f.env_file) + '</td>' +
      '<td class="mono">' + esc(window.AVF.shortTs(f.ts)) + '</td></tr>';
  }

  function render(main) {
    var S = window.AVF, cr = S.state.credentialRequests || { pending: [], filled: [] };
    var pending = cr.pending || [], filled = cr.filled || [];

    var html = '<h1 class="h1">Conexões</h1>' +
      '<p class="muted">Aqui os agentes pedem as APIs/credenciais que precisam pra trabalhar. Você aprova preenchendo — nada é chamado sem a chave estar aqui.</p>' +
      tutorial() +
      '<p class="h2">Pedidos pendentes (' + pending.length + ')</p>' +
      (pending.length ? pending.map(reqCard).join('') : '<p class="empty">nenhum pedido agora. Quando um agente precisar de uma API, aparece aqui.</p>') +
      '<p class="h2">Já conectadas (' + filled.length + ')</p>' +
      (filled.length ? ('<div class="sh-scroll"><table class="sh-table"><tr><th>API</th><th>preview</th><th>agente</th><th>arquivo</th><th>quando</th></tr>' +
        filled.slice().reverse().map(filledRow).join('') + '</table></div>')
        : '<p class="empty">nenhuma credencial preenchida ainda.</p>');

    S.put(main, html);

    main.querySelectorAll('.cred-send').forEach(function (btn) {
      btn.onclick = function () {
        if (S.HOSTED) { alert('Modo monitor (hospedado). Preencha pela sessão local do Claude.'); return; }
        var id = btn.getAttribute('data-id');
        var input = main.querySelector('.cred-input[data-id="' + id + '"]');
        var value = input ? input.value.trim() : '';
        if (!value) { alert('cole a chave antes de enviar'); return; }
        btn.disabled = true; btn.textContent = 'enviando…';
        S.post('/api/credential-request/fill', { id: id, value: value }).then(function (j) {
          if (j && j.ok) { if (input) input.value = ''; alert('Enviado! O agente foi avisado e pode continuar a tarefa.'); }
          else { alert('erro: ' + (j && j.error)); btn.disabled = false; btn.textContent = 'Enviar pro agente'; }
        }).catch(function () { alert('sem backend (modo monitor)'); btn.disabled = false; btn.textContent = 'Enviar pro agente'; });
      };
    });
  }

  return { render: render };
})();
