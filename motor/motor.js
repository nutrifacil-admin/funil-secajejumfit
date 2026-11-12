(function () {
  "use strict";
  // Versão do motor. Cada versão tem seu próprio marcador, CSS e vigia: se uma etapa anterior carregou um motor
  // mais velho (o XQuiz não recarrega a página entre etapas), ele não consegue pegar as telas desta versão.
  var VER = "3";
  if (window["__SJ" + VER]) { window["__SJ" + VER](); return; }
  var CFG = window.SJ_CFG || {};
  var COR = CFG.cor || "#0d9488";
  var IMG = CFG.imgBase || "";
    var PRE = "sj_";                      // prefixo das respostas no localStorage

  /* ---------- respostas (localStorage, sobrevive à troca de etapa) ---------- */
  function ler(k) { try { return localStorage.getItem(PRE + k); } catch (e) { return window["__" + PRE + k] || null; } }
  function gravar(k, v) { try { localStorage.setItem(PRE + k, String(v)); } catch (e) { window["__" + PRE + k] = String(v); } }
  function vars() {
    var v = {}, k;
    ["genero", "altura", "pesoAtual", "pesoDesejado", "imc", "imcFaixa", "imcPct", "porque"].forEach(function (n) { v[n] = ler(n); });
    v.produto = (window.SJ_CFG || {}).produto || "";
    return v;
  }
  function trocaVars(s) {
    var v = vars();
    return String(s).replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, n) { return v[n] != null ? v[n] : ""; });
  }
  // IMC real: mesma fórmula, faixas e posição da barra (15 a 40) do original
  function calcular() {
    var a = parseFloat(ler("alturaBase")), p = parseFloat(ler("pesoAtualBase"));
    if (!a || !p) return;
    var imc = p / Math.pow(a / 100, 2);
    gravar("imc", imc.toFixed(1).replace(".", ","));
    gravar("imcFaixa", imc >= 30 ? "obesidade" : imc >= 25 ? "sobrepeso" : "normal");
    gravar("imcPct", Math.round(Math.max(0, Math.min(100, (imc - 15) / 25 * 100))));
  }
  function visivel(b) {
    if (b.se) return (ler("genero") || "Mulher") === (b.se === "F" ? "Mulher" : "Homem");
    if (b.cond) { var val = ler(b.cond[0]); return b.cond[1] === "igual" ? val === b.cond[2] : val !== b.cond[2]; }
    return true;
  }

  /* ---------- botão nativo do XQuiz (quem realmente avança a etapa) ---------- */
  // Se o XQuiz rodar o Script dentro de um iframe, trabalha na página de fora (mesma origem).
  var TOP = window;
  try { if (window.frameElement && window.parent.document) TOP = window.parent; } catch (e) { TOP = window; }
  var DOC = TOP.document;
  function norm(t) { return (t || "").replace(/\s+/g, " ").trim().toUpperCase(); }
  function textos() {
    var c = (window.SJ_CFG || {}).botaoNativo;
    var l = Array.isArray(c) ? c : c ? [c] : [];
    return l.concat(["PROXIMO", "PRÓXIMO", "CONTINUE", "CONTINUAR"]).map(norm);
  }
  // acha o elemento cujo texto é exatamente um dos textos acima, fora do nosso script
  function nativos() {
    var alvo = textos(), m = [];
    Array.prototype.forEach.call(DOC.querySelectorAll("button, a, [role=button], div, span"), function (el) {
      if (el.closest(".sj") || el.querySelector(".sj")) return;
      if (alvo.indexOf(norm(el.textContent)) >= 0) m.push(el);
    });
    // fica com o mais interno de cada grupo e clica no botão de verdade que o contém
    var achados = [];
    m.filter(function (el) { return !m.some(function (o) { return o !== el && el.contains(o); }); }).forEach(function (el) {
      var clic = el.closest("button, a, [role=button]") || el;
      if (achados.indexOf(clic) < 0) achados.push(clic);
    });
    return achados;
  }
  // sobe até a "caixa" do elemento Botão (a que só contém o botão) para não sobrar espaço vazio
  function caixaDe(btn) {
    var t = norm(btn.textContent), c = btn;
    while (c.parentElement && c.parentElement !== DOC.body && c.parentElement.children.length === 1 && norm(c.parentElement.textContent) === t) c = c.parentElement;
    return c;
  }
  function esconderNativos() {
    if (typeof window.SJ_AVANCAR === "function") return;                     // site próprio: não há botão nativo
    nativos().forEach(function (b) {
      var c = caixaDe(b);
      if (c.getAttribute("data-sj-oculto")) return;
      c.setAttribute("data-sj-oculto", "1");
      c.style.setProperty("display", "none", "important");
    });
  }
  function avancar() {
    if (typeof window.SJ_AVANCAR === "function") return window.SJ_AVANCAR();   // site próprio: navegação interna
    var n = nativos();
    if (n.length) { n[n.length - 1].click(); return; }
    console.warn("[SJ] Botão nativo não encontrado nesta etapa. Textos aceitos: " + textos().join(", "));
  }
  function irCheckout() {
    var url = (window.SJ_CFG || {}).checkout || "";
    if (!url) { console.warn("[SJ] Defina o checkout no SJ_CFG."); return; }
    try { TOP.dispatchEvent(new CustomEvent("sj:checkout")); } catch (e) {}
    var q = TOP.location.search.replace(/^\?/, "");
    TOP.location.href = url + (q ? (url.indexOf("?") >= 0 ? "&" : "?") + q : "");
  }
  // Dentro de iframe: a altura acompanha o conteúdo (senão o XQuiz corta e o botão fixo cobre o texto)
  function ajustarIframe() {
    if (TOP === window) return;
    try {
      var f = window.frameElement, h = document.documentElement.scrollHeight;
      document.documentElement.classList.add("sj-no-iframe");
      if (f && Math.abs(f.offsetHeight - h) > 2) {
        f.style.setProperty("height", h + "px", "important");
        f.style.setProperty("width", "100%", "important");
        f.style.setProperty("border", "0", "important");
        f.setAttribute("scrolling", "no");
      }
    } catch (e) {}
  }

  /* ---------- helpers ---------- */
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function rico(e, h) { e.innerHTML = trocaVars(h); return e; }
  function src(n) { return /^https?:/.test(n) ? n : IMG + n; }
  var SETA = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
  function tremer(e) { e.classList.remove("sj-tremer"); void e.offsetWidth; e.classList.add("sj-tremer"); }

  /* ---------- blocos ---------- */
  var R = {};
  R.texto = function (b) { return rico(el("div", "sj-rico" + (b.esq ? " sj-esq" : "")), b.html); };
  R.espaco = function (b) { var e = el("div"); e.style.height = (b.altura || 24) + "px"; return e; };
  R.imagem = function (b) {
    var im = el("img", "sj-img"); im.src = src(b.arquivo); im.alt = "";
    if (b.largura) im.style.width = b.largura + "%";
    if (b.arredondar) im.style.borderRadius = "16px";
    return im;
  };
  R.lista = function (b) {
    var e = el("ul", "sj-lista" + (b.caixa ? " sj-lista-caixa" : ""));
    if (b.caixa) { e.style.background = b.caixa.fundo; e.style.borderColor = b.caixa.borda; e.style.color = b.caixa.texto; }
    b.itens.forEach(function (it) {
      var li = el("li");
      if (b.icone !== "") li.appendChild(el("span", "sj-lista-ic", b.icone || "✓"));
      li.appendChild(rico(el("div", "sj-rico"), it));
      e.appendChild(li);
    });
    return e;
  };
  R.botao = function (b, ctx) {
    var bt = el("button", "sj-botao" + (b.pulsar ? " sj-pulsar" : "") + (b.halo ? " sj-halo" : "") + (b.relevo ? " sj-3d" : ""), b.texto);
    bt.type = "button";
    bt.onclick = function () {
      if (b.acao === "checkout") return irCheckout();
      if (ctx.multi) {                                   // tela de múltipla escolha: exige 1 marcada
        var m = ctx.multi.filter(function (x) { return x.sel.length; })[0];
        if (!m) { ctx.multi.forEach(function (x) { tremer(x.caixa); }); return; }
        gravar(m.variavel, m.sel.join(", "));
      }
      if (ctx.regua) ctx.regua();
      avancar();
    };
    if (!b.fixo) return bt;
    var w = el("div", "sj-fixo"); w.appendChild(bt);
    if (TOP === window) flutuar(w, b, bt.onclick);
    return w;
  };
  // Botão flutuante: começa preso no rodapé da tela e, ao rolar até o lugar dele no fim da página,
  // "encaixa" ali. Feito com position:fixed no <body> porque o XQuiz quebra o position:sticky.
  function flutuar(lugar, b, acao) {
    var barra = el("div", "sj sj-flut"), dentro = el("div"), bt = el("button", "sj-botao" + (b.pulsar ? " sj-pulsar" : "") + (b.halo ? " sj-halo" : "") + (b.relevo ? " sj-3d" : ""), b.texto);
    bt.type = "button"; bt.onclick = acao; dentro.appendChild(bt); barra.appendChild(dentro);
    var visto = false;
    (function quadro() {
      if (!lugar.isConnected) { if (visto) { barra.remove(); return; } requestAnimationFrame(quadro); return; }
      visto = true;
      if (!barra.isConnected) document.body.appendChild(barra);
      var r = lugar.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      var encaixou = r.bottom <= vh;                      // o lugar do botão já apareceu na tela
      barra.style.display = encaixou ? "none" : "block";
      lugar.style.visibility = encaixou ? "visible" : "hidden";
      if (!encaixou && r.width) { barra.style.left = r.left + "px"; barra.style.width = r.width + "px"; }
      requestAnimationFrame(quadro);
    })();
  }
  R.opcoes = function (b, ctx) {
    var caixa = el("div", "sj-opcoes sj-op-" + b.layout), sel = [];
    if (b.multipla) { ctx.multi = ctx.multi || []; ctx.multi.push({ variavel: b.variavel, sel: sel, caixa: caixa }); }
    b.opcoes.forEach(function (o) {
      var bt = el("button", "sj-opcao" + (o.imagem ? " sj-tem-img" : "")); bt.type = "button";
      if (o.imagem) { var im = el("img", "sj-opcao-img"); im.src = src(o.imagem); im.alt = ""; bt.appendChild(im); }
      else if (o.emoji) bt.appendChild(el("span", "sj-opcao-emoji", o.emoji));
      bt.appendChild(el("span", "sj-opcao-txt", o.texto));
      if (b.multipla) bt.appendChild(el("span", "sj-check"));
      else if (b.indicador === "seta") { var s = el("span", "sj-seta"); s.innerHTML = SETA; bt.appendChild(s); }
      var valor = o.valor || o.texto;
      bt.onclick = function () {
        if (b.multipla) {
          var k = sel.indexOf(valor);
          if (k >= 0) sel.splice(k, 1); else sel.push(valor);
          bt.classList.toggle("sj-marcada", k < 0);
          return;
        }
        bt.classList.add("sj-marcada");
        gravar(b.variavel, valor);
        setTimeout(avancar, 250);
      };
      caixa.appendChild(bt);
    });
    if (b.multipla && !ctx.temBotao) {
      ctx.temBotao = true;
      var w = el("div"); w.appendChild(caixa); w.appendChild(R.botao({ texto: "Continuar", relevo: true }, ctx)); return w;
    }
    return caixa;
  };
  var MEDIDAS = {
    altura: { unidades: ["cm", "pol"], fator: 1 / 2.54 },
    peso: { unidades: ["kg", "lb"], fator: 2.2046 }
  };
  var PX = 12;
  R.regua = function (b, ctx) {
    var m = MEDIDAS[b.medida], nome = b.variavel;
    var un = ler(nome + "Unidade") || m.unidades[0];
    var base = ler(nome + "Base") != null ? parseFloat(ler(nome + "Base")) : b.valor;     // sempre em cm/kg
    var e = el("div", "sj-reg"), pilula = el("div", "sj-reg-unid");
    var visor = el("div", "sj-reg-num"), num = el("b"), unTxt = el("span");
    visor.appendChild(num); visor.appendChild(unTxt);
    var trilho = el("div", "sj-reg-trilho"), faixa = el("div", "sj-reg-faixa"), ponteiro = el("div", "sj-reg-ponteiro");
    trilho.appendChild(faixa); trilho.appendChild(ponteiro);
    function conv(v) { return un === m.unidades[0] ? v : v * m.fator; }
    function desenhar() {
      faixa.textContent = "";
      var a = Math.round(conv(b.min)), z = Math.round(conv(b.max));
      for (var v = a; v <= z; v++) {
        var r = el("div", "sj-tick" + (v % 10 === 0 ? " sj-tick-g" : v % 5 === 0 ? " sj-tick-m" : ""));
        r.style.left = (v - a) * PX + "px";
        if (v % 10 === 0) r.appendChild(el("span", null, String(v)));
        faixa.appendChild(r);
      }
      faixa.style.width = (z - a) * PX + "px"; faixa.dataset.a = a;
    }
    function salvar() {
      gravar(nome, Math.round(conv(base))); gravar(nome + "Unidade", un); gravar(nome + "Base", base);
      // o IMC e o gráfico usam kg/cm
      if (nome !== "altura") gravar(nome, Math.round(base));
      calcular();
    }
    function atualizar() {
      var v = Math.round(conv(base));
      num.textContent = v; unTxt.textContent = un;
      faixa.style.transform = "translateX(" + (-(v - faixa.dataset.a) * PX) + "px)";
      Array.prototype.forEach.call(pilula.children, function (c) { c.classList.toggle("ativo", c.textContent === un); });
      salvar();
    }
    m.unidades.forEach(function (u) {
      var bt = el("button", null, u); bt.type = "button";
      bt.onclick = function () { if (un !== u) { un = u; desenhar(); atualizar(); } };
      pilula.appendChild(bt);
    });
    e.appendChild(pilula); e.appendChild(visor); e.appendChild(trilho); e.appendChild(el("div", "sj-reg-dica", "Arraste para ajustar"));
    desenhar(); atualizar();
    var x0 = null, b0 = 0;
    trilho.addEventListener("pointerdown", function (ev) { x0 = ev.clientX; b0 = base; trilho.setPointerCapture(ev.pointerId); });
    trilho.addEventListener("pointermove", function (ev) {
      if (x0 == null) return;
      var novo = Math.round(conv(b0)) + Math.round((x0 - ev.clientX) / PX);
      novo = Math.max(Math.round(conv(b.min)), Math.min(Math.round(conv(b.max)), novo));
      base = un === m.unidades[0] ? novo : novo / m.fator;
      atualizar();
    });
    trilho.addEventListener("pointerup", function () { x0 = null; });
    trilho.addEventListener("pointercancel", function () { x0 = null; });
    ctx.regua = salvar;
    return e;
  };
  R.nivel = function (b) {
    var e = el("div", "sj-nivel"), tr = el("div", "sj-nivel-trilho"), ch = el("div", "sj-nivel-cheio"), bola = el("div", "sj-nivel-bola");
    ch.style.background = b.cor; tr.appendChild(ch); tr.appendChild(bola); e.appendChild(tr);
    var nv = ler(b.variavel) != null ? ler(b.variavel) : b.percentual;
    if (b.mostrarPct) e.appendChild(el("div", "sj-nivel-pct", nv + "%"));
    var pct = Math.max(0, Math.min(100, Number(nv) || 0)) + "%";
    ch.style.width = bola.style.left = "0%";
    setTimeout(function () { ch.style.width = bola.style.left = pct; }, 300);   // enche ao aparecer
    return e;
  };
  R.carregamento = function (b) {
    var e = el("div", "sj-load");
    e.appendChild(el("h2", "sj-load-tit", b.titulo));
    var pct = el("div", "sj-load-pct", "0%"), tr = el("div", "sj-load-barra"), enche = el("div");
    tr.appendChild(enche); e.appendChild(pct); e.appendChild(tr);
    e.appendChild(el("p", "sj-load-desc", b.descricao));
    var ms = (b.segundos || 7) * 1000, t0 = Date.now(), foi = false;
    setTimeout(function passo() {
      if (e.isConnected) foi = true; else if (foi) return;      // saiu da tela: para
      var p = Math.max(0, Math.min(1, (Date.now() - t0) / ms));
      enche.style.setProperty("width", p * 100 + "%", "important");
      pct.textContent = Math.round(p * 100) + "%";
      if (p < 1) setTimeout(passo, 50); else setTimeout(avancar, 400);
    }, 0);
    return e;
  };
  R.carrossel = function (b) {
    var e = el("div", "sj-car"), janela = el("div", "sj-car-janela"), trilho = el("div", "sj-car-trilho"), pontos = el("div", "sj-car-pontos"), i = 0;
    b.itens.forEach(function (n, k) {
      var s = el("div", "sj-car-item"), im = el("img");
      im.src = src(n); im.alt = ""; im.draggable = false; im.style.aspectRatio = b.proporcao || "1/1";
      s.appendChild(im); trilho.appendChild(s);
      var p = el("button", "sj-car-ponto"); p.type = "button"; p.onclick = function () { ir(k); }; pontos.appendChild(p);
    });
    janela.appendChild(trilho); e.appendChild(janela); e.appendChild(pontos);
    function pos() { var w = janela.clientWidth, s = trilho.firstChild ? trilho.firstChild.offsetWidth : 0; return (w - s) / 2 - i * (s + 8); }
    function ir(k, semAnim) {
      i = Math.max(0, Math.min(b.itens.length - 1, k));
      trilho.style.transition = semAnim ? "none" : "transform .3s ease";
      trilho.style.transform = "translateX(" + pos() + "px)";
      Array.prototype.forEach.call(pontos.children, function (p, n) { p.classList.toggle("ativo", n === i); });
    }
    var x0 = null, base = 0;
    janela.addEventListener("pointerdown", function (ev) { x0 = ev.clientX; base = pos(); trilho.style.transition = "none"; janela.setPointerCapture(ev.pointerId); });
    janela.addEventListener("pointermove", function (ev) { if (x0 != null) trilho.style.transform = "translateX(" + (base + ev.clientX - x0) + "px)"; });
    function solta(ev) { if (x0 == null) return; var dx = ev.clientX - x0; x0 = null; ir(dx < -40 ? i + 1 : dx > 40 ? i - 1 : i); }
    janela.addEventListener("pointerup", solta); janela.addEventListener("pointercancel", solta);
    setTimeout(function () { ir(0, true); }, 30);
    window.addEventListener("resize", function () { ir(i, true); });
    return e;
  };
  R.grafico = function (b) {
    var ps = b.pontos, e = el("div", "sj-graf");
    var W = 340, H = 210, M = { l: 22, r: 22, t: 40, b: 26 }, gw = W - M.l - M.r, gh = H - M.t - M.b, cores = b.cores;
    var xy = ps.map(function (p, k) { return [M.l + gw * k / (ps.length - 1), M.t + gh * (1 - p.valor / 100)]; });
    var d = "M" + xy[0][0] + "," + xy[0][1];
    for (var k = 0; k < xy.length - 1; k++) {
      var p0 = xy[k - 1] || xy[k], p1 = xy[k], p2 = xy[k + 1], p3 = xy[k + 2] || p2;
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6) + "," + (p1[1] + (p2[1] - p0[1]) / 6) + " " + (p2[0] - (p3[0] - p1[0]) / 6) + "," + (p2[1] - (p3[1] - p1[1]) / 6) + " " + p2[0] + "," + p2[1];
    }
    var gid = "sjg" + Math.random().toString(16).slice(2, 8);
    var stops = cores.map(function (c, n) { return '<stop offset="' + (n / (cores.length - 1)) + '" stop-color="' + c + '"/>'; }).join("");
    var grade = "";
    for (var g = 0; g <= 4; g++) grade += '<line x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + (M.t + gh * g / 4) + '" y2="' + (M.t + gh * g / 4) + '"/>';
    xy.forEach(function (p) { grade += '<line x1="' + p[0] + '" x2="' + p[0] + '" y1="' + M.t + '" y2="' + (M.t + gh) + '"/>'; });
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg"><defs>' +
      '<linearGradient id="' + gid + '" x1="0" x2="1" y1="0" y2="0">' + stops + "</linearGradient>" +
      '<linearGradient id="' + gid + 'a" x1="0" x2="1" y1="0" y2="0">' + stops.replace(/"\/>/g, '" stop-opacity=".55"/>') + "</linearGradient></defs>" +
      '<g class="sj-graf-grade">' + grade + "</g>" +
      '<path d="' + d + " L" + xy[xy.length - 1][0] + "," + (M.t + gh) + " L" + xy[0][0] + "," + (M.t + gh) + ' Z" fill="url(#' + gid + 'a)"/>' +
      '<path d="' + d + '" fill="none" stroke="url(#' + gid + ')" stroke-width="3.5" stroke-linecap="round"/>';
    function corDe(n) { return cores[Math.round(n / (xy.length - 1) * (cores.length - 1))]; }
    xy.forEach(function (p, n) { svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="#000" opacity=".08"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + corDe(n) + '"/>'; });
    e.innerHTML = svg + "</svg>";
    xy.forEach(function (p, n) {
      if (!ps[n].rotulo) return;
      var pil = el("span", "sj-graf-rot" + (ps[n].destaque ? " destaque" : ""), trocaVars(ps[n].rotulo));
      if (ps[n].destaque) pil.style.background = corDe(n);
      pil.style.left = (p[0] / W * 100) + "%"; pil.style.top = (p[1] / H * 100) + "%";
      e.appendChild(pil);
    });
    var ei = el("span", "sj-graf-eixo", b.eixoIni); ei.style.left = (M.l / W * 100) + "%"; e.appendChild(ei);
    var ef = el("span", "sj-graf-eixo", b.eixoFim); ef.style.right = (M.r / W * 100) + "%"; e.appendChild(ef);
    return e;
  };
  R.argumentos = function (b) {
    var e = el("div", "sj-args"); e.style.gridTemplateColumns = "repeat(" + b.colunas + ", 1fr)";
    b.itens.forEach(function (h) { e.appendChild(rico(el("div", "sj-arg sj-rico"), h)); });
    return e;
  };
  R.timer = function (b) {
    var e = el("div", "sj-timer"), rel = el("div", "sj-timer-rel"), seg = b.minutos * 60, fim = 0, foi = false;
    e.appendChild(el("div", "sj-timer-txt", b.texto)); e.appendChild(rel);
    function mostra(f) { rel.textContent = String(Math.floor(f / 60)).padStart(2, "0") + ":" + String(f % 60).padStart(2, "0"); }
    mostra(seg);
    (function passo() {                                   // só começa a contar quando aparece na tela
      if (e.isConnected) foi = true; else if (foi) return;
      if (!fim && e.offsetParent !== null && e.getBoundingClientRect().height) fim = Date.now() + seg * 1000;
      if (fim) mostra(Math.max(0, Math.ceil((fim - Date.now()) / 1000)));
      if (!fim || fim > Date.now()) setTimeout(passo, 500);
    })();
    return e;
  };

  /* ---------- VSL (player próprio no padrão vTurb smartplayer) ---------- */
  var IC = {
    play: '<svg viewBox="2 2 20 20"><path d="M7.5 6.9Q7.5 5.1 9.05 6.03L17.2 10.97Q18.9 12 17.2 13.03L9.05 17.97Q7.5 18.9 7.5 17.1Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    pausa: '<svg viewBox="2 2 20 20"><rect x="6.5" y="5.5" width="4" height="13" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="13.5" y="5.5" width="4" height="13" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    recomecar: '<svg viewBox="2 2 20 20"><path d="M5.5 12a6.5 6.5 0 1 0 2-4.7L5.5 9.3M5.5 5v4.3h4.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tela: '<svg viewBox="0 0 24 24"><path d="M4 9V7a3 3 0 0 1 3-3h2M15 4h2a3 3 0 0 1 3 3v2M20 15v2a3 3 0 0 1-3 3h-2M9 20H7a3 3 0 0 1-3-3v-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    // alto-falante com ondas, cortado por uma barra (som desligado)
    mudo: '<svg viewBox="0 0 140 100"><path d="M18 38h18l26-20v64L36 62H18z" fill="#fff"/><path d="M74 36q10 14 0 28M86 26q18 24 0 48M98 16q26 34 0 68" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M98 16q26 34 0 68" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="7" stroke-linecap="round"/><path d="M14 10l104 82" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>'
  };
  function hexA(c, a) { return c + Math.round(a * 255).toString(16).padStart(2, "0"); }
  function liberarCta() {
    var novo = !document.body.classList.contains("vsl-cta");
    document.body.classList.add("vsl-cta"); DOC.body.classList.add("vsl-cta");
    if (novo) try { TOP.dispatchEvent(new CustomEvent("vsl:cta")); } catch (e) {}
  }
  function carregarHls(cb) {
    if (window.Hls) return cb();
    var s = el("script"); s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.light.min.js";
    s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }
  R.video = function (b) {
    var V = (window.SJ_CFG || {}).vsl || {};
    var src = V.src || "", cor = V.cor || COR, pitch = +V.pitch || 0, cta = +(V.cta != null ? V.cta : V.pitch) || 0;
    var w = el("div", "sj-vsl"), p = el("div", "sj-vp in-pause");
    p.style.setProperty("--vc", cor); p.style.setProperty("--vc80", hexA(cor, 0.8)); p.style.setProperty("--vcr", hexA(cor, 0.93));
    var prop = (V.proporcao || "9/16").split("/"); p.style.paddingTop = (prop[1] / prop[0] * 100) + "%";
    p.innerHTML = '<video playsinline webkit-playsinline muted preload="auto" disablepictureinpicture x-webkit-airplay="deny"></video>' +
      (V.capa ? '<img class="vp-capa" alt="" src="' + V.capa + '">' : "") +
      '<div class="vp-big">' + IC.play + '</div><span class="vp-bezel"></span><span class="vp-load"></span>' +
      '<div class="vp-ctrl"><button type="button" class="vp-b-play">' + IC.play + '</button><button type="button" class="vp-b-tela">' + IC.tela + "</button></div>" +
      '<div class="vp-fake"></div>' +
      '<div class="vp-auto"><div class="vp-rich"><div class="vp-caixa"></div><span class="vp-t1"></span><div class="vp-ic">' + IC.mudo + '</div><span class="vp-t2"></span></div></div>' +
      '<div class="vp-resume"><div class="vp-res-c"><div class="vp-res-t"></div><div class="vp-res-a">' +
      '<div class="vp-res-play"><span class="vp-res-ic">' + IC.play + '</span><span class="vp-res-tx">Continuar de onde parou</span></div>' +
      '<div class="vp-res-rew"><span class="vp-res-ic">' + IC.recomecar + '</span><span class="vp-res-tx">Recomeçar do início</span></div></div></div></div>';
    w.appendChild(p);
    var $ = function (s) { return p.querySelector(s); };
    $(".vp-t1").textContent = V.autoplayTitulo || "Seu plano já começou";
    $(".vp-t2").textContent = V.autoplayTexto || "Toque para ouvir";
    $(".vp-caixa").style.background = hexA(cor, 0.95);
    if (!src) { p.classList.add("sem-src"); $(".vp-t1").textContent = "Cole o link do vídeo"; $(".vp-t2").textContent = "SJ_CFG.vsl.src"; p.classList.add("show-auto"); return w; }

    var v = $("video"), fake = $(".vp-fake"), bezel = $(".vp-bezel");
    // escala da caixa do autoplay (desenhada em 1080 px de largura) e tamanho da fonte por faixa, como a vTurb
    function medir() {
      var lw = p.getBoundingClientRect().width || 1;
      p.style.fontSize = (lw <= 360 ? 10 : lw <= 480 ? 11 : lw <= 550 ? 12 : 13) + "px";
      $(".vp-rich").style.transform = "scale(" + lw / 1080 + ")";
    }
    medir(); if (window.ResizeObserver) new ResizeObserver(medir).observe(p);

    var chave = "vsl:" + src, mem = {};
    try { mem = JSON.parse(localStorage.getItem(chave) || "{}"); } catch (e) {}
    function guardar() { try { localStorage.setItem(chave, JSON.stringify(mem)); } catch (e) {} }
    if (mem.cta) liberarCta();

    // fonte: hls.js (começa leve, trava em 480p depois de 3 pedaços); HLS nativo só no iPhone
    var hls = null;
    function iniciarFonte() {
      var nativo = v.canPlayType("application/vnd.apple.mpegurl"), ehHls = /\.m3u8(\?|$)/.test(src);
      if (ehHls && window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ startLevel: 0, capLevelToPlayerSize: false, abrBandWidthUpFactor: 0.5, maxBufferLength: 20, maxMaxBufferLength: 30, backBufferLength: 30,
          fragLoadingMaxRetry: 6, manifestLoadingMaxRetry: 6, levelLoadingMaxRetry: 6 });
        var max = -1, ped = 0, tent = 0;
        hls.on(window.Hls.Events.MANIFEST_PARSED, function (ev, d) { d.levels.forEach(function (n, i) { if (n.height <= 854) max = i; }); hls.autoLevelCapping = 0; });
        hls.on(window.Hls.Events.FRAG_BUFFERED, function () { if (++ped === 3 && max >= 0) hls.autoLevelCapping = max; });
        hls.on(window.Hls.Events.ERROR, function (ev, d) {
          if (!d.fatal) return;
          if (d.type === window.Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else if (/manifest/i.test(d.details) && tent++ < 3) setTimeout(function () { hls.loadSource(src); }, 1000 * tent);
          else setTimeout(function () { hls.startLoad(v.currentTime); }, 1000);
        });
        hls.loadSource(src); hls.attachMedia(v);
      } else if (!ehHls || nativo) v.src = src;
      comecarTela();
    }

    var comSom = false, ocultar = null, ultimoToque = 0;
    function cl(c, sim) { p.classList.toggle(c, !!sim); }
    function piscar(ic) { bezel.innerHTML = ic; bezel.classList.remove("on"); void bezel.offsetWidth; bezel.classList.add("on"); }
    function mostrarCtrl() {
      if (!comSom) return;
      cl("show-ctrl", true); clearTimeout(ocultar);
      if (!v.paused) ocultar = setTimeout(function () { if (!v.paused) cl("show-ctrl", false); }, 2500);
    }
    function tocar() { var pr = v.play(); if (pr && pr.catch) pr.catch(function () { cl("carregando", false); }); }
    function tocarComSom(desde) {
      comSom = true; v.muted = false; ultimoToque = Date.now();
      cl("show-auto", false); cl("in-resume", false); cl("ja-tocou", true);
      var ir = function () { if (desde != null && Math.abs(v.currentTime - desde) > 0.5) v.currentTime = desde; tocar(); };
      if (v.readyState >= 1) ir(); else v.addEventListener("loadedmetadata", ir, { once: true });
      mostrarCtrl();
    }
    // vigia: tocando mas parado esperando há mais de 6 s → pede os pedaços de novo
    var esperando = 0;
    setInterval(function () {
      if (!comSom || v.paused || v.readyState >= 3) { esperando = 0; return; }
      if (!esperando) { esperando = Date.now(); return; }
      if (Date.now() - esperando > 6000) { esperando = 0; if (hls) hls.startLoad(v.currentTime); else v.load(); }
    }, 1000);
    v.addEventListener("loadeddata", function () { var c = $(".vp-capa"); if (c) c.remove(); });
    v.addEventListener("playing", function () { cl("carregando", false); });
    v.addEventListener("waiting", function () { if (comSom) cl("carregando", true); });
    v.addEventListener("play", function () { cl("in-pause", false); $(".vp-b-play").innerHTML = IC.pausa; mostrarCtrl(); });
    v.addEventListener("pause", function () { cl("in-pause", true); cl("carregando", false); $(".vp-b-play").innerHTML = IC.play; if (comSom) { cl("show-ctrl", true); clearTimeout(ocultar); } });

    function comecarTela() {
      if (mem.t > 5) {                                       // já começou antes: pergunta se continua
        var acabou = mem.fim;
        $(".vp-res-t").textContent = acabou ? "Você já assistiu a este vídeo!" : "Você já começou a assistir esse vídeo";
        if (acabou) { $(".vp-res-play").remove(); $(".vp-res-rew .vp-res-tx").textContent = "Assistir novamente"; }
        cl("in-resume", true);
        v.addEventListener("loadedmetadata", function () { if (!comSom && !acabou) v.currentTime = mem.t; }, { once: true });
        if ($(".vp-res-play")) $(".vp-res-play").addEventListener("click", function (e) { e.stopPropagation(); tocarComSom(mem.t); });
        $(".vp-res-rew").addEventListener("click", function (e) { e.stopPropagation(); mem.fim = 0; tocarComSom(0); });
      } else {                                                // autoplay mudo com a caixa pulsando
        cl("show-auto", true);
        var pr = v.play(); if (pr && pr.catch) pr.catch(function () { cl("show-auto", true); });
      }
    }
    $(".vp-auto").addEventListener("click", function (e) { e.stopPropagation(); tocarComSom(0); });
    $(".vp-big").addEventListener("click", function (e) { e.stopPropagation(); if (!comSom) tocarComSom(0); else { tocar(); piscar(IC.play); } });
    $(".vp-b-play").addEventListener("click", function (e) { e.stopPropagation(); if (v.paused) { tocar(); piscar(IC.play); } else { v.pause(); piscar(IC.pausa); } });
    $(".vp-b-tela").addEventListener("click", function (e) {
      e.stopPropagation();
      if (v.webkitEnterFullscreen && !p.requestFullscreen) return v.webkitEnterFullscreen();
      if (document.fullscreenElement) document.exitFullscreen(); else if (p.requestFullscreen) p.requestFullscreen(); else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });
    p.addEventListener("click", function () {
      if (p.classList.contains("in-resume")) return;
      if (!comSom) return tocarComSom(0);
      if (Date.now() - ultimoToque < 600) return;
      if (v.paused) { tocar(); piscar(IC.play); } else { v.pause(); piscar(IC.pausa); }
    });
    p.addEventListener("mousemove", mostrarCtrl);
    p.addEventListener("mouseleave", function () { if (!v.paused) cl("show-ctrl", false); });

    // barra falsa (conta da vTurb, alpha 2): 100·√(1−(x−1)²) — dispara no começo e quase para no fim
    var ultimo = 0, pitchFeito = !!mem.pitch, ctaFeito = !!mem.cta;
    v.addEventListener("timeupdate", function () {
      var dur = v.duration || 0; if (!dur || !isFinite(dur)) return;
      var x = Math.min(1, v.currentTime / dur) - 1;
      fake.style.width = 100 * Math.sqrt(1 - x * x) + "%";
      // botão pelo tempo do vídeo, com ou sem som (quem assiste mudo lendo legenda também chega na oferta)
      if (cta && !ctaFeito && v.currentTime >= cta) { ctaFeito = true; mem.cta = 1; guardar(); liberarCta(); }
      if (!comSom) return;
      if (Math.abs(v.currentTime - ultimo) >= 1) { ultimo = v.currentTime; mem.t = v.currentTime; guardar(); }
      if (pitch && !pitchFeito && v.currentTime >= pitch) {
        pitchFeito = true; mem.pitch = 1; guardar();
        var fbq = TOP.fbq || window.fbq;
        if (fbq) { if (V.pixelId) fbq("trackSingleCustom", V.pixelId, V.pixelEvento || "PitchVSL"); else fbq("trackCustom", V.pixelEvento || "PitchVSL"); }
        try { TOP.dispatchEvent(new CustomEvent("vsl:pitch")); } catch (e) {}
      }
    });
    v.addEventListener("ended", function () { mem.fim = 1; guardar(); });
    if (/\.m3u8(\?|$)/.test(src) && !v.canPlayType("application/vnd.apple.mpegurl")) carregarHls(iniciarFonte); else iniciarFonte();
    return w;
  };

  /* ---------- estilo (o mesmo visual do original) ---------- */
  function css() {
    if (document.getElementById("sj-css" + VER)) return;
    var s = el("style"); s.id = "sj-css" + VER;
    s.textContent = window.SJ_CSS.replace(/__COR__/g, COR).replace(/__TEXTO__/g, CFG.texto || "#030712");
    document.head.appendChild(s);
  }

  /* ---------- montagem (à prova do React do V2) ---------- */
  function montar(alvo) {
    var tela = window.SJ_TELAS[alvo.getAttribute("data-tela")];
    if (!tela) { alvo.textContent = "[SJ] tela não encontrada"; return; }
    alvo.setAttribute("data-sj-ok", "1");
    alvo.textContent = "";
    var corpo = el("div", "sj"), ctx = {}, aposVsl = false;
    tela.forEach(function (b) {
      if (!visivel(b)) return;
      var n = R[b.tipo] && R[b.tipo](b, ctx);
      if (!n) return;
      if (aposVsl) { var c = el("div", "sj-pos-vsl"); c.appendChild(n); n = c; }   // aparece só no segundo do CTA
      if (b.tipo === "video" && +(((window.SJ_CFG || {}).vsl || {}).cta) > 0) aposVsl = true;
      corpo.appendChild(n);
    });
    alvo.appendChild(corpo);
  }
  var t0 = Date.now(), rodando = false;
  function passo() {
    css();
    esconderNativos();
    ajustarIframe();
    Array.prototype.forEach.call(document.querySelectorAll(".sj-tela" + VER + ":not([data-sj-ok])"), montar);
  }
  window["__SJ" + VER] = function () { t0 = Date.now(); passo(); if (!rodando) vigiar(); };
  function vigiar() {
    rodando = true;
    passo();
    setTimeout(vigiar, Date.now() - t0 < 60000 ? 120 : 600);   // React pode trocar o HTML: continua vigiando
  }
  vigiar();
})();
