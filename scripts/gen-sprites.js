#!/usr/bin/env node
'use strict';
/**
 * gen-sprites.js - gera os 49 sprites pixel-art da AI Venture Factory.
 * Escreve dashboard/sprites/sprite-A01.svg ... sprite-A49.svg
 *
 *   node scripts/gen-sprites.js
 *
 * Regras: grade 24x24, shape-rendering="crispEdges" (SEM anti-aliasing),
 * mesmo esqueleto de "aranha-pixel" terracota em todos; diferenca por
 * ACESSORIO + COR DE FUNDO do card (conforme company/spec-anexo-b.md).
 */
var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var OUT = path.join(ROOT, 'dashboard', 'sprites');
fs.mkdirSync(OUT, { recursive: true });

// paleta base
var C = {
  body: '#C96F4A',      // terracota (aranha)
  bodyDark: '#A85838',
  bodyLite: '#E08E68',
  eye: '#12100E',
  white: '#F4E9DF',
  yellow: '#E6B422',
  purple: '#6B3FA0',
  blue: '#3E7CB1',
  green: '#4C9A5B',
  red: '#C7443B',
  gold: '#D9A520',
  steel: '#8A9BA8',
  ink: '#1B2430',
};

// fundo do card por bloco (1..8)
var BLOCK_BG = {
  1: '#16283f', 2: '#3a2416', 3: '#2f1840', 4: '#173a2c',
  5: '#3a3a16', 6: '#3f1626', 7: '#163a3a', 8: '#3a2d16',
};

function px(x, y, w, h, fill) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>';
}

// ---- esqueleto comum (aranha-pixel) -------------------------------------
function skeleton() {
  var r = [];
  // 8 perninhas pixel (4 de cada lado), cor body escuro
  var legRows = [10, 12, 15, 17];
  for (var i = 0; i < legRows.length; i++) {
    var y = legRows[i];
    r.push(px(3, y, 5, 1, C.bodyDark));   // perna esquerda
    r.push(px(2, y + 1, 1, 1, C.bodyDark)); // pe esquerdo
    r.push(px(16, y, 5, 1, C.bodyDark));  // perna direita
    r.push(px(21, y + 1, 1, 1, C.bodyDark)); // pe direito
  }
  // abdome (corpo grande)
  r.push(px(8, 12, 8, 7, C.body));
  r.push(px(9, 19, 6, 1, C.body));
  r.push(px(7, 13, 1, 5, C.body));
  r.push(px(16, 13, 1, 5, C.body));
  // brilho no abdome
  r.push(px(9, 13, 2, 2, C.bodyLite));
  // cabeca (cefalotorax)
  r.push(px(9, 7, 6, 5, C.body));
  r.push(px(10, 6, 4, 1, C.body));
  // olhos pretos quadrados
  r.push(px(10, 8, 2, 2, C.eye));
  r.push(px(13, 8, 2, 2, C.eye));
  // reflexo dos olhos
  r.push(px(10, 8, 1, 1, C.white));
  r.push(px(13, 8, 1, 1, C.white));
  return r;
}

// ---- acessorios (cada um retorna array de <rect>) ----------------------
var ACC = {
  none: function () { return []; },

  zzz: function () { // idle "Z z"
    return [
      px(17, 3, 3, 1, C.white), px(19, 4, 1, 1, C.white), px(17, 5, 3, 1, C.white),
      px(20, 6, 2, 1, C.white), px(21, 7, 1, 1, C.white), px(20, 8, 2, 1, C.white),
    ];
  },

  tie_shades: function () { // CEO: gravata + oculos escuros
    return [
      px(9, 8, 6, 2, C.ink),            // barra dos oculos
      px(9, 9, 2, 2, C.ink), px(13, 9, 2, 2, C.ink),
      px(11, 12, 2, 1, C.red),          // no da gravata
      px(11, 13, 2, 4, C.red), px(11, 17, 2, 1, C.red),
    ];
  },

  magnifier: function () { // pesquisa: lupa
    return [
      px(16, 10, 3, 3, C.steel), px(17, 11, 1, 1, C.blue),
      px(19, 13, 1, 1, C.steel), px(20, 14, 2, 2, C.ink),
    ];
  },

  bulb: function () { // PM: lampada
    return [
      px(11, 2, 2, 3, C.yellow), px(10, 3, 1, 1, C.yellow), px(13, 3, 1, 1, C.yellow),
      px(11, 5, 2, 1, C.white), px(11, 1, 2, 1, C.gold),
    ];
  },

  helmet_wrench: function () { // devs: capacete amarelo + chave inglesa
    return [
      px(9, 5, 6, 2, C.yellow), px(8, 6, 8, 1, C.yellow), px(11, 4, 2, 1, C.yellow),
      px(17, 12, 2, 2, C.steel), px(18, 14, 1, 3, C.steel), px(17, 16, 2, 2, C.steel),
    ];
  },

  plug: function () { // conectores: plugue/cabo
    return [
      px(17, 9, 2, 1, C.gold), px(17, 11, 2, 1, C.gold),
      px(18, 8, 2, 5, C.ink), px(20, 10, 2, 1, C.gold), px(20, 6, 1, 4, C.gold),
    ];
  },

  hood_bolt: function () { // red-team: capuz roxo + raio
    return [
      px(8, 5, 8, 4, C.purple), px(7, 7, 1, 4, C.purple), px(16, 7, 1, 4, C.purple),
      px(9, 6, 6, 2, C.ink),
      px(18, 10, 2, 2, C.yellow), px(17, 12, 2, 2, C.yellow), px(19, 12, 1, 2, C.yellow),
    ];
  },

  shield: function () { // blue-team: escudo
    return [
      px(16, 9, 5, 1, C.blue), px(16, 10, 5, 4, C.blue), px(17, 14, 3, 2, C.blue),
      px(18, 16, 1, 1, C.blue), px(18, 10, 1, 4, C.white),
    ];
  },

  clipboard_check: function () { // QA: prancheta + check
    return [
      px(16, 8, 5, 7, C.white), px(17, 7, 3, 1, C.steel),
      px(17, 9, 3, 1, C.ink), px(17, 11, 3, 1, C.ink),
      px(17, 13, 1, 1, C.green), px(18, 14, 1, 1, C.green), px(19, 12, 1, 1, C.green),
    ];
  },

  coin: function () { // finance: moeda / $
    return [
      px(16, 9, 4, 4, C.gold), px(15, 10, 1, 2, C.gold), px(20, 10, 1, 2, C.gold),
      px(17, 9, 2, 1, C.ink), px(17, 10, 1, 3, C.ink), px(18, 12, 1, 1, C.ink), px(17, 8, 1, 1, C.ink),
    ];
  },

  megaphone: function () { // marketing: megafone
    return [
      px(15, 10, 1, 3, C.red), px(16, 9, 1, 5, C.red), px(17, 8, 2, 7, C.red),
      px(19, 7, 1, 9, C.gold), px(20, 6, 1, 11, C.gold),
      px(13, 11, 2, 1, C.white),
    ];
  },

  pulse: function () { // monitor: grafico de pulso
    return [
      px(15, 12, 1, 1, C.green), px(16, 12, 1, 1, C.green), px(17, 9, 1, 1, C.green),
      px(18, 15, 1, 1, C.green), px(19, 12, 1, 1, C.green), px(20, 12, 2, 1, C.green),
      px(15, 13, 1, 3, C.green), px(20, 8, 1, 4, C.green),
    ];
  },

  lock: function () { // secrets: cadeado
    return [
      px(17, 9, 3, 2, C.gold), px(16, 10, 1, 1, C.gold), px(20, 10, 1, 1, C.gold),
      px(16, 11, 5, 5, C.yellow), px(18, 12, 1, 2, C.ink),
    ];
  },

  palette: function () { // UX/UI: pincel / palette
    return [
      px(15, 9, 5, 4, C.white), px(16, 10, 1, 1, C.red), px(18, 10, 1, 1, C.blue), px(17, 11, 1, 1, C.green),
      px(20, 13, 1, 4, C.bodyDark), px(20, 17, 1, 1, C.yellow),
    ];
  },

  ruler: function () { // arquiteto: regua / compasso
    return [
      px(15, 8, 2, 9, C.gold), px(16, 9, 1, 1, C.ink), px(16, 11, 1, 1, C.ink),
      px(16, 13, 1, 1, C.ink), px(16, 15, 1, 1, C.ink),
      px(18, 8, 1, 6, C.steel), px(19, 13, 1, 3, C.steel), px(18, 15, 3, 1, C.steel),
    ];
  },

  phone: function () { // mobile: smartphone
    return [
      px(16, 7, 4, 10, C.ink), px(17, 8, 2, 7, C.blue), px(17, 15, 2, 1, C.steel),
    ];
  },

  card: function () { // payments: cartao
    return [
      px(14, 10, 8, 5, C.blue), px(14, 11, 8, 1, C.ink), px(15, 13, 3, 1, C.gold),
    ];
  },

  brackets: function () { // dev frontend/backend code < >
    return [
      px(15, 9, 1, 1, C.green), px(14, 10, 1, 1, C.green), px(15, 11, 1, 1, C.green),
      px(19, 9, 1, 1, C.green), px(20, 10, 1, 1, C.green), px(19, 11, 1, 1, C.green),
      px(17, 8, 1, 6, C.steel),
    ];
  },

  gear: function () { // devops / backend: engrenagem
    return [
      px(16, 9, 4, 4, C.steel), px(18, 8, 1, 1, C.steel), px(18, 13, 1, 1, C.steel),
      px(15, 10, 1, 2, C.steel), px(20, 10, 1, 2, C.steel), px(17, 10, 2, 2, C.ink),
    ];
  },

  cylinder: function () { // database
    return [
      px(15, 8, 6, 2, C.gold), px(15, 10, 6, 5, C.yellow), px(15, 15, 6, 1, C.gold),
      px(15, 12, 6, 1, C.gold),
    ];
  },

  key: function () { // auth: chave
    return [
      px(15, 9, 3, 3, C.gold), px(16, 10, 1, 1, C.ink),
      px(18, 10, 4, 1, C.gold), px(21, 11, 1, 1, C.gold), px(20, 11, 1, 1, C.gold),
    ];
  },

  spark: function () { // ai-integrations: brilho/estrela
    return [
      px(18, 7, 1, 7, C.yellow), px(15, 10, 7, 1, C.yellow),
      px(16, 8, 1, 1, C.white), px(20, 12, 1, 1, C.white),
    ];
  },

  gauge: function () { // performance / reliability: manometro
    return [
      px(15, 10, 6, 4, C.white), px(15, 13, 6, 1, C.ink),
      px(18, 11, 1, 2, C.red), px(17, 12, 3, 1, C.red),
    ];
  },

  scale: function () { // risk/compliance/legal: balanca
    return [
      px(17, 7, 1, 8, C.gold), px(14, 9, 7, 1, C.gold),
      px(14, 10, 1, 2, C.steel), px(20, 10, 1, 2, C.steel),
      px(13, 12, 3, 1, C.steel), px(19, 12, 3, 1, C.steel),
    ];
  },

  route: function () { // ux/e2e: fluxo/rota
    return [
      px(15, 8, 2, 2, C.blue), px(19, 15, 2, 2, C.blue),
      px(16, 10, 1, 3, C.white), px(16, 13, 4, 1, C.white), px(19, 13, 1, 2, C.white),
    ];
  },

  box: function () { // dependency: pacote
    return [
      px(15, 9, 6, 6, C.bodyDark), px(15, 9, 6, 1, C.gold), px(17, 9, 2, 6, C.gold),
    ];
  },

  loop: function () { // regression: ciclo
    return [
      px(16, 9, 4, 1, C.green), px(15, 10, 1, 3, C.green), px(20, 10, 1, 3, C.green),
      px(16, 13, 4, 1, C.green), px(15, 8, 2, 1, C.green), px(19, 13, 2, 1, C.green),
    ];
  },

  siren: function () { // incident-responder
    return [
      px(16, 8, 4, 2, C.red), px(17, 6, 2, 2, C.red), px(15, 10, 6, 1, C.ink),
      px(14, 7, 1, 1, C.yellow), px(21, 7, 1, 1, C.yellow),
    ];
  },

  funnel: function () { // funnel-experimenter
    return [
      px(15, 8, 6, 1, C.steel), px(16, 9, 4, 1, C.steel), px(17, 10, 2, 1, C.steel),
      px(18, 11, 1, 4, C.blue),
    ];
  },

  heart: function () { // onboarding-cs
    return [
      px(15, 9, 2, 2, C.red), px(18, 9, 2, 2, C.red), px(15, 11, 5, 2, C.red),
      px(16, 13, 3, 1, C.red), px(17, 14, 1, 1, C.red),
    ];
  },

  globe: function () { // seo
    return [
      px(15, 9, 5, 5, C.blue), px(17, 9, 1, 5, C.white), px(15, 11, 5, 1, C.white),
    ];
  },

  star_lead: function () { // lead: estrela pequena (sobre outro acessorio)
    return [px(11, 3, 2, 1, C.gold), px(10, 4, 4, 1, C.gold), px(11, 5, 2, 1, C.gold)];
  },
};

// ---- mapa: agente -> { bloco, acc: [lista de acessorios] } ------------
var MAP = {
  A01: [1, ['magnifier']], A02: [1, ['magnifier']], A03: [1, ['magnifier', 'globe']],
  A04: [1, ['magnifier', 'heart']], A05: [1, ['coin']], A06: [1, ['ruler', 'gear']],
  A07: [2, ['tie_shades']], A08: [2, ['clipboard_check', 'route']], A09: [2, ['ruler', 'clipboard_check']],
  A10: [2, ['scale']],
  A11: [3, ['bulb']], A12: [3, ['route']], A13: [3, ['palette']], A14: [3, ['palette', 'brackets']],
  A15: [3, ['brackets', 'plug']], A16: [3, ['ruler']],
  A17: [4, ['helmet_wrench', 'star_lead']], A18: [4, ['helmet_wrench', 'brackets']],
  A19: [4, ['phone']], A20: [4, ['helmet_wrench', 'gear']], A21: [4, ['cylinder']],
  A22: [4, ['card']], A23: [4, ['key']], A24: [4, ['spark']], A25: [4, ['gear', 'loop']],
  A26: [4, ['gauge']],
  A27: [5, ['plug', 'star_lead']], A28: [5, ['plug']], A29: [5, ['plug', 'gear']], A30: [5, ['lock']],
  A31: [6, ['shield', 'star_lead']], A32: [6, ['hood_bolt']], A33: [6, ['shield']],
  A34: [6, ['magnifier', 'box']], A35: [6, ['lock']], A36: [6, ['siren']],
  A37: [7, ['clipboard_check', 'star_lead']], A38: [7, ['clipboard_check']], A39: [7, ['clipboard_check', 'route']],
  A40: [7, ['gauge']], A41: [7, ['clipboard_check', 'palette']], A42: [7, ['loop']],
  A43: [8, ['megaphone', 'star_lead']], A44: [8, ['megaphone']], A45: [8, ['globe', 'magnifier']],
  A46: [8, ['funnel']], A47: [8, ['heart']], A48: [8, ['coin']], A49: [8, ['pulse']],
};

function buildSvg(id) {
  var cfg = MAP[id];
  if (!cfg) throw new Error('sem mapa para ' + id);
  var bloco = cfg[0];
  var accs = cfg[1];
  var bg = BLOCK_BG[bloco] || '#20242c';
  var parts = [];
  parts.push('<rect width="24" height="24" fill="' + bg + '"/>');
  parts.push('<rect x="1" y="1" width="22" height="22" fill="none" stroke="' + C.bodyDark + '" stroke-width="1"/>');
  parts = parts.concat(skeleton());
  for (var i = 0; i < accs.length; i++) {
    var fn = ACC[accs[i]] || ACC.none;
    parts = parts.concat(fn());
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96" ' +
    'shape-rendering="crispEdges" role="img" aria-label="sprite ' + id + '">\n  ' +
    parts.join('\n  ') + '\n</svg>\n';
}

var made = [];
for (var n = 1; n <= 49; n++) {
  var id = 'A' + String(n).padStart(2, '0');
  var svg = buildSvg(id);
  fs.writeFileSync(path.join(OUT, 'sprite-' + id + '.svg'), svg);
  made.push(id);
}
console.log('sprites gerados: ' + made.length + ' -> dashboard/sprites/sprite-A01.svg .. sprite-A49.svg');
