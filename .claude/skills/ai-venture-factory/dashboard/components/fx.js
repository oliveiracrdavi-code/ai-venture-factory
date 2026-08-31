/* fx.js — efeitos portados do react-bits (DavidHDev/react-bits) para vanilla.
   Sem dependencias. Expõe window.FX. */
'use strict';
window.FX = (function () {

  // Count Up — anima um numero de 0 (ou valor atual) ate `to`.
  function countUp(el, to, opts) {
    if (!el) return;
    opts = opts || {};
    var dur = opts.dur || 700, dp = opts.decimals || 0, pre = opts.prefix || '', suf = opts.suffix || '';
    var from = Number(el.getAttribute('data-v') || 0);
    to = Number(to) || 0;
    if (from === to) { el.textContent = pre + to.toFixed(dp) + suf; return; }
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = from + (to - from) * e;
      el.textContent = pre + val.toFixed(dp) + suf;
      if (p < 1) requestAnimationFrame(step);
      else el.setAttribute('data-v', String(to));
    }
    requestAnimationFrame(step);
  }

  // Spotlight — halo que segue o mouse dentro de um elemento .rb-spotlight
  function spotlight(el) {
    if (!el || el._sp) return; el._sp = 1;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }
  function spotlightAll(root) {
    (root || document).querySelectorAll('.rb-spotlight').forEach(spotlight);
  }

  // Typewriter — escreve `text` dentro de el.
  function typewriter(el, text, speed) {
    if (!el) return;
    speed = speed || 28; el.textContent = ''; el.classList.add('rb-typewriter');
    var i = 0;
    clearInterval(el._tw);
    el._tw = setInterval(function () {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(el._tw); }
    }, speed);
  }

  // sparkline SVG simples (string) — usado nos cards de agente
  function sparkline(values, w, h, stroke) {
    w = w || 180; h = h || 26; stroke = stroke || '#2dd4bf';
    values = (values && values.length) ? values : [0, 0, 0, 0];
    var max = Math.max.apply(null, values.concat([1]));
    var n = values.length;
    var pts = values.map(function (v, i) {
      var x = n > 1 ? (i / (n - 1)) * (w - 4) + 2 : w / 2;
      var y = h - 3 - (v / max) * (h - 6);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<polyline fill="none" stroke="' + stroke + '" stroke-width="1.6" points="' + pts + '"/></svg>';
  }

  return { countUp: countUp, spotlight: spotlight, spotlightAll: spotlightAll, typewriter: typewriter, sparkline: sparkline };
})();
