/* Central de Retenção: entrada com a galáxia de dados + painel com a retenção de cada tela do funil. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var MAPA = window.PAINEL_MAPA || {};
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var api = function (acao, params, corpo) {
    var url = "/api/painel?acao=" + acao + (params ? "&" + new URLSearchParams(params).toString() : "");
    return fetch(url, corpo ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo), credentials: "same-origin" } : { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); })
      .catch(function () { return { _status: 0 }; });
  };

  /* ===================== Galáxia (tela de entrada) ===================== */
  var galaxia = { ativa: false };
  function iniciarGalaxia() {
    var cv = $("galaxia"), ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    var W, H, cx, cy, estrelas = [], fluxo = [], nos = [], mouse = { x: -1e4, y: -1e4 }, t0 = performance.now();
    var CORES = ["#ffffff", "#cfe3ff", "#9cc6ff", "#b9a8ff", "#7dd3fc"];
    function medir() {
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2;
      var R = Math.hypot(W, H) * 0.55, n = Math.min(2600, Math.round(W * H / 380));
      estrelas = [];
      for (var i = 0; i < n; i++) {
        // galáxia espiral: 3 braços + halo
        var braco = i % 3, r = Math.pow(Math.random(), 1.7) * R, ang = braco * (Math.PI * 2 / 3) + r / R * 5.2 + (Math.random() - 0.5) * (0.9 - r / R * 0.5);
        if (Math.random() < 0.22) { ang = Math.random() * Math.PI * 2; r = Math.random() * R; }
        estrelas.push({ r: r, a: ang, s: Math.random() * 1.3 + 0.2, c: CORES[(Math.random() * CORES.length) | 0], tw: Math.random() * 6.28, v: 0.00004 + (1 - r / R) * 0.00016 });
      }
      nos = [];
      for (var k = 0; k < 46; k++) nos.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18 });
      fluxo = [];
    }
    function quadro(agora) {
      if (!galaxia.ativa) return;
      var t = agora - t0;
      ctx.clearRect(0, 0, W, H);
      // núcleo
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.32);
      g.addColorStop(0, "rgba(190,215,255,.30)"); g.addColorStop(0.25, "rgba(120,150,255,.12)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // estrelas girando (inclinação de 0.55 = vista em perspectiva)
      for (var i = 0; i < estrelas.length; i++) {
        var e = estrelas[i], a = e.a + t * e.v;
        var x = cx + Math.cos(a) * e.r, y = cy + Math.sin(a) * e.r * 0.55;
        var brilho = 0.55 + 0.45 * Math.sin(t * 0.002 + e.tw);
        ctx.globalAlpha = brilho; ctx.fillStyle = e.c;
        ctx.fillRect(x, y, e.s, e.s);
      }
      // rede de dados (constelação que reage ao mouse)
      ctx.globalAlpha = 1;
      for (var a1 = 0; a1 < nos.length; a1++) {
        var p = nos[a1]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        for (var b1 = a1 + 1; b1 < nos.length; b1++) {
          var q = nos[b1], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 150) { ctx.strokeStyle = "rgba(125,211,252," + (0.16 * (1 - d / 150)) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        var dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 200) { ctx.strokeStyle = "rgba(167,139,250," + (0.5 * (1 - dm / 200)) + ")"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        ctx.fillStyle = "rgba(200,225,255,.85)"; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.28); ctx.fill();
      }
      // fluxo de informação: partículas caindo em espiral para o núcleo
      if (fluxo.length < 70 && Math.random() < 0.5) {
        var ang = Math.random() * 6.28, rr = Math.hypot(W, H) * 0.5;
        fluxo.push({ a: ang, r: rr, v: 1.2 + Math.random() * 2.2, txt: Math.random() < 0.35 ? String((Math.random() * 100) | 0) + "%" : (Math.random() < 0.5 ? "1" : "0") });
      }
      ctx.font = "10px JetBrains Mono, monospace";
      for (var f = fluxo.length - 1; f >= 0; f--) {
        var o = fluxo[f]; o.r -= o.v; o.a += 0.012;
        if (o.r < 18) { fluxo.splice(f, 1); continue; }
        var fx = cx + Math.cos(o.a) * o.r, fy = cy + Math.sin(o.a) * o.r * 0.55, al = Math.min(1, o.r / 400) * 0.7;
        ctx.fillStyle = "rgba(125,211,252," + al + ")"; ctx.fillText(o.txt, fx, fy);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(quadro);
    }
    medir();
    window.addEventListener("resize", function () { if (galaxia.ativa) medir(); });
    window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    galaxia.ativa = true;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(quadro);
    else { galaxia.ativa = true; quadro(performance.now()); galaxia.ativa = false; }
  }

  /* ===================== Salto para a dobra espacial (depois do login) =====================
     A nave acelera pela galáxia: as estrelas viram riscos de luz e, no meio delas, passam números de resultado. */
  function dobra(nome, fim) {
    var cv = $("galaxia"), ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = cv.clientWidth, H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cx = W / 2, cy = H / 2, F = Math.max(W, H) * 0.55, DUR = 2600;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return fim();

    $("form-login").classList.add("decolando");
    var hud = document.createElement("div"); hud.className = "hud-dobra";
    hud.innerHTML = '<span class="hud-linha">BEM-VINDO, ' + esc(String(nome || "").toUpperCase()) + '</span><strong>Entrando no Flowex</strong><span class="hud-carga"><i></i></span><span class="hud-pct">sincronizando dados · <b>0%</b></span>';
    $("entrada").appendChild(hud);

    // estrelas em 3D (x, y, z): quanto menor o z, mais perto da nave
    var CORES = ["#ffffff", "#cfe3ff", "#7dd3fc", "#a78bfa", "#9db0ff"];
    var TEXTOS = ["+R$ 1.290", "+R$ 847", "+R$ 3.420", "+R$ 29", "+R$ 47", "+R$ 12.780", "+18%", "+32%", "+7,4%", "ROI 3,8x", "ROI 5,1x", "+214 vendas", "86%", "92%", "CTR 4,2%", "+R$ 23", "LTV +40%", "+1.048 leads"];
    function nova(longe) { return { x: (Math.random() - 0.5) * W * 2.4, y: (Math.random() - 0.5) * H * 2.4, z: longe ? F * (0.4 + Math.random() * 1.6) : Math.random() * F * 2, pz: 0, c: CORES[(Math.random() * CORES.length) | 0] }; }
    var estrelas = []; for (var i = 0; i < 900; i++) { var e = nova(false); e.pz = e.z; estrelas.push(e); }
    var numeros = [];
    function novoNumero() {
      var ang = Math.random() * 6.283, raio = 0.12 + Math.random() * 0.5;   // perto do eixo: passam pela frente da nave
      var n = { x: Math.cos(ang) * W * raio, y: Math.sin(ang) * H * raio, z: F * (0.9 + Math.random() * 0.9) };
      n.txt = TEXTOS[(Math.random() * TEXTOS.length) | 0]; n.verde = n.txt.charAt(0) === "+" || n.txt.indexOf("ROI") === 0; n.pz = n.z; return n;
    }

    var t0 = performance.now(), pct = hud.querySelector("b"), barra = hud.querySelector(".hud-carga i");
    function quadro(agora) {
      var t = Math.min(1, (agora - t0) / DUR);
      // acelera devagar, explode no meio e segura no fim (curva de "salto")
      var vel = 4 + Math.pow(t, 2.2) * 120;
      ctx.fillStyle = "rgba(5,7,13," + (0.32 - t * 0.18) + ")"; ctx.fillRect(0, 0, W, H);
      // brilho no ponto de fuga
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, F * (0.25 + t * 0.6));
      g.addColorStop(0, "rgba(160,200,255," + (0.08 + t * 0.35) + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.lineCap = "round";
      for (var i = 0; i < estrelas.length; i++) {
        var s = estrelas[i]; s.pz = s.z; s.z -= vel;
        if (s.z < 1) { estrelas[i] = nova(true); continue; }
        var x = cx + s.x / s.z * F * 0.5, y = cy + s.y / s.z * F * 0.5, px = cx + s.x / s.pz * F * 0.5, py = cy + s.y / s.pz * F * 0.5;
        if (x < -50 || x > W + 50 || y < -50 || y > H + 50) { estrelas[i] = nova(true); continue; }
        var perto = 1 - s.z / (F * 2);
        ctx.strokeStyle = s.c; ctx.globalAlpha = Math.min(1, 0.25 + perto);
        ctx.lineWidth = 0.6 + perto * 2.4;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      }
      // números de resultado passando pela nave
      if (numeros.length < 22 && Math.random() < 0.22 + t * 0.3) numeros.push(novoNumero());
      for (var k = numeros.length - 1; k >= 0; k--) {
        var n = numeros[k]; n.pz = n.z; n.z -= 3 + vel * 0.35;
        if (n.z < 8) { numeros.splice(k, 1); continue; }
        var nx = cx + n.x / n.z * F * 0.5, ny = cy + n.y / n.z * F * 0.5, tam = Math.min(78, 5200 / n.z);
        if (nx < -200 || nx > W + 200 || ny < -100 || ny > H + 100) { numeros.splice(k, 1); continue; }
        ctx.globalAlpha = Math.max(0, Math.min(1, (1 - n.z / (F * 1.8)) * 1.6));
        ctx.font = "600 " + tam.toFixed(1) + "px JetBrains Mono, monospace";
        ctx.fillStyle = n.verde ? "#5eead4" : "#c4b5fd";
        ctx.shadowColor = n.verde ? "rgba(52,211,153,.8)" : "rgba(167,139,250,.8)"; ctx.shadowBlur = 12;
        ctx.textAlign = "center"; ctx.fillText(n.txt, nx, ny); ctx.textAlign = "start";
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
      var p = Math.min(100, Math.round(Math.pow(t, 0.8) * 100));
      pct.textContent = p + "%"; barra.style.width = p + "%";
      if (t < 1) return requestAnimationFrame(quadro);
      // clarão de chegada e entra no painel
      var luz = document.createElement("div"); luz.className = "clarao"; document.body.appendChild(luz);
      setTimeout(function () {
        hud.remove(); $("form-login").classList.remove("decolando");
        fim();
        setTimeout(function () { luz.classList.add("some"); setTimeout(function () { luz.remove(); }, 700); }, 60);
      }, 260);
    }
    ctx.fillStyle = "#05070d"; ctx.fillRect(0, 0, W, H);
    requestAnimationFrame(quadro);
  }

  function telaEntrada() {
    $("painel").hidden = true; $("entrada").hidden = false;
    iniciarGalaxia();
    setTimeout(function () { $("l-email").focus(); }, 300);
  }
  $("form-login").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var b = $("l-botao"), erro = $("l-erro");
    erro.hidden = true; b.disabled = true; b.firstElementChild.textContent = "Verificando…";
    api("login", null, { email: $("l-email").value, senha: $("l-senha").value }).then(function (r) {
      b.disabled = false; b.firstElementChild.textContent = "Entrar no painel";
      if (r.ok) { galaxia.ativa = false; dobra(r.nome, abrirPainel); return; }
      erro.textContent = r.erro || "Não conseguimos entrar agora. Tente de novo."; erro.hidden = false;
    });
  });

  /* ===================== Painel ===================== */
  var S = { f: "jejum", v: "front", p: "hoje", de: "", ate: "", c: "", hoje: "", timer: null, visao: "lista", d: null, ant: null };
  var fmt = function (n) { return Number(n || 0).toLocaleString("pt-BR"); };
  var pct = function (a, b) { return b ? a / b * 100 : 0; };
  var pctTxt = function (v) { return (v >= 10 || v === 0 ? Math.round(v) : v.toFixed(1).replace(".", ",")) + "%"; };
  var reais = function (c) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  var ICO_EDITAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- As 4 visões do funil ----------
     front: quiz + VSL · ofertas: avaliação + upsell + downsell · entrega: acesso e uso da área · completo: tudo, do anúncio ao fim.
     As vendas da Cakto entram como passos ("venda") no lugar certo do caminho. */
  var VENDAS = {
    "venda-front": { id: "venda-front", venda: "front", nome: "Compra aprovada · front", titulo: "Pagamento aprovado na Cakto (Plano de Jejum)" },
    "venda-upsell": { id: "venda-upsell", venda: "upsell", nome: "Compra aprovada · upsell", titulo: "Pagamento aprovado na Cakto (Chá Turbo R$47)" },
    "venda-downsell": { id: "venda-downsell", venda: "downsell", nome: "Compra aprovada · downsell", titulo: "Pagamento aprovado na Cakto (Chá Turbo R$23)" }
  };
  var VISOES = {
    front: { nome: "Front", titulo: "Retenção por tela · Front" },
    ofertas: { nome: "Upsell e Downsell", titulo: "Retenção por tela · Upsell e Downsell" },
    entrega: { nome: "Entrega", titulo: "Entrega · acesso e uso da área de membros" },
    completo: { nome: "Funil completo", titulo: "Funil completo · do anúncio à área de membros" }
  };
  var OFERTAS_IDS = ["boas-vindas", "apresentacao", "genero", "idade", "altura", "peso", "saude", "acorda", "dorme", "cafe", "almoco", "lanche", "janta", "restricoes", "fome", "acelerar", "oferta", "oferta-pitch", "oferta-cta", "oferta-quero", "venda-upsell", "downsell", "downsell-quero", "venda-downsell", "downsell-nao"];
  var ENTREGA_IDS = ["venda-front", "obrigado", "entrar", "login-ok", "area", "agenda", "conteudo", "ebook", "baixar"];
  function passosDaVisao(v) {
    var M = MAPA[S.f] || { front: [], pos: [] }, porId = {};
    M.front.concat(M.pos).forEach(function (p) { porId[p.id] = p; });
    Object.keys(VENDAS).forEach(function (k) { porId[k] = VENDAS[k]; });
    var ids;
    if (v === "front") ids = M.front.map(function (p) { return p.id; });
    else if (v === "ofertas") ids = OFERTAS_IDS;
    else if (v === "entrega") ids = ENTREGA_IDS;
    else ids = M.front.map(function (p) { return p.id; }).concat(["venda-front", "obrigado", "entrar", "login-ok"], OFERTAS_IDS, ["area", "agenda", "conteudo", "ebook", "baixar"]);
    var n = 0;
    return ids.filter(function (id) { return porId[id]; }).map(function (id) {
      var p = Object.assign({}, porId[id]);
      if (!p.evento && !p.venda) p.n = ++n; else p.n = "";
      return p;
    });
  }
  function valor(p, d) { return p.venda ? (d.vendas[p.venda] || 0) : (d.passos[p.id] || 0); }

  function somaDias(iso, n) { var d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function periodo() {
    var h = S.hoje;
    if (S.p === "hoje") return [h, h];
    if (S.p === "ontem") return [somaDias(h, -1), somaDias(h, -1)];
    if (S.p === "7") return [somaDias(h, -6), h];
    if (S.p === "30") return [somaDias(h, -29), h];
    if (S.p === "mes") return [h.slice(0, 8) + "01", h];
    return [S.de || h, S.ate || h];
  }
  // Período anterior do mesmo tamanho (hoje → ontem; 7 dias → os 7 antes) para o comparativo
  function anterior() {
    var p = periodo(), n = Math.round((new Date(p[1] + "T12:00:00Z") - new Date(p[0] + "T12:00:00Z")) / 864e5) + 1;
    return [somaDias(p[0], -n), somaDias(p[0], -1)];
  }
  function rotuloAnterior() { return S.p === "hoje" ? "vs ontem" : S.p === "ontem" ? "vs anteontem" : "vs período anterior"; }

  function abrirPainel() {
    api("eu").then(function (eu) {
      if (eu._status === 401) return telaEntrada();
      $("entrada").hidden = true; $("painel").hidden = false;
      S.hoje = eu.hoje;
      $("u-nome").textContent = eu.nome; $("u-avatar").textContent = (eu.nome || "?").charAt(0);
      $("f-funil").innerHTML = Object.keys(eu.funis).map(function (k) { return '<option value="' + k + '">' + esc(eu.funis[k]) + "</option>"; }).join("");
      try { var v = sessionStorage.getItem("painel_v"); if (VISOES[v]) S.v = v; var p = sessionStorage.getItem("painel_p"); if (p) S.p = p; } catch (e) {}
      marcarFiltros();
      carregar();
    });
  }

  function marcarFiltros() {
    document.querySelectorAll(".abas button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.aba === S.v ? "true" : "false"); });
    document.querySelectorAll(".periodo > button").forEach(function (b) { b.classList.toggle("ativo", b.dataset.p === S.p); });
    var p = periodo(); $("f-de").value = p[0]; $("f-ate").value = p[1]; $("f-de").max = $("f-ate").max = S.hoje;
  }

  function carregar() {
    var p = periodo(), bt = $("f-atualizar"), a = anterior();
    bt.classList.add("girando");
    Promise.all([api("dados", { f: S.f, g: "todos", de: p[0], ate: p[1], c: S.c }), api("dados", { f: S.f, g: "todos", de: a[0], ate: a[1], c: S.c })]).then(function (r) {
      var d = r[0]; S.ant = r[1] && r[1].ok ? r[1] : null;
      bt.classList.remove("girando");
      if (d._status === 401) return telaEntrada();
      if (!d.ok) { $("linhas").innerHTML = '<div class="vazio">' + esc(d.erro || "Não conseguimos carregar os dados agora.") + "</div>"; return; }
      $("f-hora").textContent = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      var sel = $("f-camp"), atual = S.c;
      sel.innerHTML = '<option value="">Todas as campanhas</option>' + d.campanhas.map(function (c) { return '<option value="' + esc(c) + '"' + (c === atual ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("");
      if (atual && d.campanhas.indexOf(atual) < 0) sel.insertAdjacentHTML("beforeend", '<option value="' + esc(atual) + '" selected>' + esc(atual) + "</option>");
      S.d = d;
      desenhar(d);
      if (S.visao === "flow") flow.desenhar();
    });
    clearInterval(S.timer);
    if (S.p === "hoje") S.timer = setInterval(carregar, 60000);   // hoje: atualiza sozinho a cada minuto
  }
  function trocarVisao() { marcarFiltros(); if (S.d) { desenhar(S.d); if (S.visao === "flow") flow.desenhar(); } }

  function baseDe(passos, d) {
    for (var i = 0; i < passos.length; i++) if (!passos[i].evento && valor(passos[i], d)) return valor(passos[i], d);
    return 0;
  }
  // Linhas: retenção sobre o 1º passo; evasão sobre o passo anterior; comparativo com o período anterior (em pontos de %)
  function calcular(d) {
    var passos = passosDaVisao(S.v), base = baseDe(passos, d);
    var A = S.ant, baseA = A ? baseDe(passos, A) : 0;
    var linhas = [], anterior = null;
    passos.forEach(function (p) {
      var n = valor(p, d), queda = anterior != null && anterior > 0 ? 1 - n / anterior : null;
      var ret = pct(n, base), retA = baseA ? pct(valor(p, A), baseA) : null;
      linhas.push({ p: p, n: n, ret: ret, queda: queda, dif: base && retA != null ? ret - retA : null });
      anterior = n;
    });
    var maiores = linhas.filter(function (l) { return l.queda != null && l.queda > 0.05 && !l.p.evento && !l.p.venda; })
      .sort(function (a, b) { return b.queda - a.queda; }).slice(0, 3).map(function (l) { return l.p.id; });
    return { passos: passos, base: base, linhas: linhas, maiores: maiores };
  }
  function difTxt(l) {
    if (l.dif == null) return { txt: "sem dados " + rotuloAnterior().replace("vs ", "de "), cls: "" };
    var v = Math.abs(l.dif) < 0.05 ? 0 : l.dif;
    return { txt: (v > 0 ? "+" : v < 0 ? "−" : "±") + pctTxt(Math.abs(v)) + " " + rotuloAnterior(), cls: v > 0 ? "sobe" : v < 0 ? "desce" : "" };
  }
  function etiqueta(p) { return p.venda ? '<span class="etiqueta venda">venda · Cakto</span>' : p.evento ? '<span class="etiqueta">evento</span>' : ""; }

  function desenhar(d) {
    var c = calcular(d), passos = c.passos, base = c.base, linhas = c.linhas, maiores = c.maiores, v = d.passos, vd = d.vendas;

    $("t-titulo").textContent = VISOES[S.v].titulo;
    $("linhas").innerHTML = base ? linhas.map(function (l) {
      var alta = maiores.indexOf(l.p.id) >= 0;
      return '<div class="linha' + (l.p.evento ? " evento" : "") + (l.p.venda ? " venda" : "") + '" role="row">' +
        '<span class="n">' + esc(l.p.n) + "</span>" +
        '<span class="tela-nome"><strong>' + esc(l.p.nome) + etiqueta(l.p) + "</strong><small>" + esc(l.p.titulo) + "</small></span>" +
        '<span class="trilho" data-dica="' + esc(l.p.nome) + "|" + fmt(l.n) + (l.p.venda ? " vendas" : " visualizações") + " · " + pctTxt(l.ret) + ' do 1º passo"><i style="width:' + Math.min(100, l.ret).toFixed(1) + '%"></i></span>' +
        '<span class="num vis">' + fmt(l.n) + "</span>" +
        '<span class="num pct">' + pctTxt(l.ret) + (l === linhas[0] || l.dif == null ? "" : '<span class="delta ' + difTxt(l).cls + '">' + esc(difTxt(l).txt.replace(/ vs .*/, "")) + "</span>") + "</span>" +
        '<span class="num queda' + (alta ? " alta" : "") + '">' + (l.queda == null ? "—" : (alta ? "<b>▼ " + pctTxt(l.queda * 100) + "</b>" : (l.queda > 0 ? "−" + pctTxt(l.queda * 100) : "+" + pctTxt(-l.queda * 100)))) + "</span>" +
        (l.p.editar ? '<a class="editar" href="' + esc(l.p.editar) + '" target="_blank" rel="noopener">' + ICO_EDITAR + "Editar</a>" : "<span></span>") +
        "</div>";
    }).join("") : '<div class="vazio">Ainda não há dados neste período' + (S.c ? " nesta campanha" : "") + ".</div>";

    // Resumo de cada visão
    var k = [], receita = function (t) { return vd[t + "-centavos"] || 0; };
    var front = vd.front || 0, up = vd.upsell || 0, dn = vd.downsell || 0, visit = v["01"] || 0;
    if (S.v === "front") {
      var oferta = v["34"] || 0, ck = v.checkout || 0;
      k.push(["Visitantes", fmt(visit), "entraram na 1ª tela", true]);
      k.push(["Chegaram à oferta", fmt(oferta), pctTxt(pct(oferta, visit)) + " dos visitantes"]);
      k.push(["Cliques no checkout", fmt(ck), pctTxt(pct(ck, oferta)) + " de quem viu a oferta"]);
      k.push(["Vendas front", fmt(front), pctTxt(pct(front, visit)) + " dos visitantes" + (vd["front-reembolso"] ? " · " + vd["front-reembolso"] + " reemb." : "")]);
      k.push(["Receita front", reais(receita("front")), front ? "ticket " + reais(receita("front") / front) : "Cakto"]);
    } else if (S.v === "ofertas") {
      var viu = v.oferta || 0, viuD = v.downsell || 0;
      k.push(["Viram a oferta", fmt(viu), pctTxt(pct(viu, v["boas-vindas"] || 0)) + " de quem começou a avaliação", true]);
      k.push(["Vendas upsell", fmt(up), pctTxt(pct(up, viu)) + " de quem viu a oferta"]);
      k.push(["Vendas downsell", fmt(dn), pctTxt(pct(dn, viuD)) + " de quem viu o downsell"]);
      k.push(["Take rate", pctTxt(pct(up + dn, front)), "compras front que levaram upsell ou downsell"]);
      k.push(["Receita pós", reais(receita("upsell") + receita("downsell")), front ? reais((receita("upsell") + receita("downsell")) / front) + " a mais por cliente" : "upsell + downsell"]);
    } else if (S.v === "entrega") {
      var entrou = v["login-ok"] || 0, dias = d.porDia.length;
      k.push(["Compras front", fmt(front), "clientes novos no período", true]);
      k.push(["Acessaram a área", fmt(entrou), pctTxt(pct(entrou, front)) + " das compras do período"]);
      k.push(["Clientes únicos na área", fmt(d.clientes), "pessoas diferentes que usaram a área"]);
      k.push(["Média por dia", fmt(Math.round(d.porDia.reduce(function (s, x) { return s + (x.clientes || 0); }, 0) / Math.max(1, dias))), "clientes únicos por dia"]);
      k.push(["Abriram e-books", fmt(v.ebook || 0), fmt(v.baixar || 0) + " baixaram o PDF"]);
      k.push(["Usaram a agenda", fmt(v.agenda || 0), "abriram o plano de jejum"]);
    } else {
      var total = receita("front") + receita("upsell") + receita("downsell");
      k.push(["Visitantes", fmt(visit), "entraram no quiz", true]);
      k.push(["Compraram o front", fmt(front), pctTxt(pct(front, visit)) + " dos visitantes"]);
      k.push(["Upsell + downsell", fmt(up + dn), pctTxt(pct(up + dn, front)) + " das compras front"]);
      k.push(["Receita total", reais(total), "front + upsell + downsell"]);
      k.push(["Receita por visitante", reais(visit ? total / visit : 0), "quanto cada visita rende"]);
      k.push(["Ticket por cliente", reais(front ? total / front : 0), "média com upsell e downsell"]);
    }
    $("kpis").innerHTML = k.map(function (x) { return '<div class="kpi' + (x[3] ? " destaque" : "") + '"><small>' + x[0] + "</small><strong>" + x[1] + "</strong><span>" + x[2] + "</span></div>"; }).join("");

    decisoes(d);
    grafico(d, passos);
  }

  // Upsell e Downsell: quem aceitou, recusou ou saiu sem responder (barra empilhada + compras aprovadas)
  function decisoes(d) {
    var bloco = $("decisoes");
    if (S.v !== "ofertas") { bloco.hidden = true; return; }
    bloco.hidden = false;
    var v = d.passos, vd = d.vendas;
    function cartao(nome, viram, aceitou, recusou, compras, rotA, rotR) {
      var sem = Math.max(0, viram - aceitou - recusou), pa = pct(aceitou, viram), pr = pct(recusou, viram), ps = pct(sem, viram);
      return '<div class="decisao"><div class="decisao-topo"><h3>' + nome + "</h3><span>" + fmt(viram) + " viram</span></div>" +
        '<div class="empilhada" role="img" aria-label="' + nome + ": " + pctTxt(pa) + " aceitaram, " + pctTxt(pr) + " recusaram, " + pctTxt(ps) + ' sem resposta">' +
          '<i class="aceita" style="width:' + pa.toFixed(1) + '%" data-dica="Aceitaram (' + rotA + ')|' + fmt(aceitou) + " · " + pctTxt(pa) + '"></i>' +
          '<i class="recusa" style="width:' + pr.toFixed(1) + '%" data-dica="Recusaram (' + rotR + ')|' + fmt(recusou) + " · " + pctTxt(pr) + '"></i>' +
          '<i class="sem" style="width:' + ps.toFixed(1) + '%" data-dica="Saíram sem responder|' + fmt(sem) + " · " + pctTxt(ps) + '"></i></div>' +
        '<ul class="decisao-leg"><li><b class="aceita"></b>Aceitaram <strong>' + pctTxt(pa) + "</strong> <small>" + fmt(aceitou) + '</small></li>' +
        '<li><b class="recusa"></b>Recusaram <strong>' + pctTxt(pr) + "</strong> <small>" + fmt(recusou) + '</small></li>' +
        '<li><b class="sem"></b>Sem resposta <strong>' + pctTxt(ps) + "</strong> <small>" + fmt(sem) + "</small></li></ul>" +
        '<p class="decisao-venda">Compras aprovadas: <strong>' + fmt(compras) + "</strong> · " + pctTxt(pct(compras, viram)) + " de quem viu" + (aceitou ? " · " + pctTxt(pct(compras, aceitou)) + " de quem clicou" : "") + "</p></div>";
    }
    bloco.innerHTML = cartao("Upsell · Chá Turbo R$47", v.oferta || 0, v["oferta-quero"] || 0, v.downsell || 0, vd.upsell || 0, "clicou em quero", "foi para o downsell") +
      cartao("Downsell · Chá Turbo R$23", v.downsell || 0, v["downsell-quero"] || 0, v["downsell-nao"] || 0, vd.downsell || 0, "clicou em quero", "clicou em não quero");
  }

  // Colunas por dia: a métrica principal de cada visão
  function grafico(d, passos) {
    var bloco = $("bloco-dia");
    if (d.porDia.length < 2) { bloco.hidden = true; return; }
    bloco.hidden = false;
    var F = {
      front: ["Visitantes na 1ª tela por dia", function (x) { return x.passos["01"] || 0; }],
      ofertas: ["Pessoas que viram a oferta do upsell por dia", function (x) { return x.passos.oferta || 0; }],
      entrega: ["Clientes únicos que acessaram a área por dia", function (x) { return x.clientes || 0; }],
      completo: ["Visitantes na 1ª tela por dia", function (x) { return x.passos["01"] || 0; }]
    }[S.v];
    var serie = d.porDia.map(function (x) { return { dia: x.dia, n: F[1](x) }; });
    $("dia-legenda").textContent = F[0];
    var max = Math.max(1, Math.max.apply(null, serie.map(function (s) { return s.n; })));
    var W = 1000, H = 140, larg = W / serie.length, col = Math.max(2, Math.min(28, larg - 4));
    var passo = Math.ceil(serie.length / 10);
    var svg = '<svg viewBox="0 0 ' + W + " " + (H + 18) + '" preserveAspectRatio="none" role="img" aria-label="' + esc(F[0]) + '">';
    [0.5, 1].forEach(function (f) { var y = H - H * f; svg += '<line class="grade" x1="0" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text class="eixo" x="0" y="' + (y - 3) + '">' + fmt(Math.round(max * f)) + "</text>"; });
    serie.forEach(function (s, i) {
      var h = s.n / max * (H - 6), x = i * larg + (larg - col) / 2;
      var dica = s.dia.split("-").reverse().join("/") + "|" + fmt(s.n);
      svg += '<rect class="alvo" x="' + i * larg + '" y="0" width="' + larg + '" height="' + H + '" data-dica="' + dica + '"/>';
      svg += '<rect class="coluna" x="' + x.toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + col.toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" rx="3"/>';
      if (i % passo === 0) svg += '<text class="eixo" x="' + (i * larg + larg / 2) + '" y="' + (H + 14) + '" text-anchor="middle">' + s.dia.slice(8) + "/" + s.dia.slice(5, 7) + "</text>";
    });
    $("grafico").innerHTML = svg + "</svg>";
  }

  // Dica ao passar o mouse (barras de retenção e colunas do gráfico)
  var tip = $("tooltip");
  document.addEventListener("pointermove", function (e) {
    var alvo = e.target.closest && e.target.closest("[data-dica]");
    if (!alvo) { tip.hidden = true; return; }
    var partes = alvo.getAttribute("data-dica").split("|");
    tip.innerHTML = esc(partes[0]) + "<br><b>" + esc(partes[1]) + "</b>";
    tip.hidden = false;
    var x = Math.min(window.innerWidth - tip.offsetWidth - 8, e.clientX + 14), y = e.clientY + 16;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  });

  // Filtros
  document.querySelectorAll(".abas button").forEach(function (b) { b.addEventListener("click", function () { S.v = b.dataset.aba; try { sessionStorage.setItem("painel_v", S.v); } catch (e) {} trocarVisao(); }); });
  document.querySelectorAll(".periodo > button").forEach(function (b) { b.addEventListener("click", function () { S.p = b.dataset.p; try { sessionStorage.setItem("painel_p", S.p); } catch (e) {} marcarFiltros(); carregar(); }); });
  ["f-de", "f-ate"].forEach(function (id) { $(id).addEventListener("change", function () { S.p = "custom"; S.de = $("f-de").value; S.ate = $("f-ate").value; if (S.de > S.ate) { var t = S.de; S.de = S.ate; S.ate = t; } marcarFiltros(); carregar(); }); });
  $("f-camp").addEventListener("change", function () { S.c = this.value; carregar(); });
  $("f-funil").addEventListener("change", function () { S.f = this.value; S.c = ""; carregar(); });
  $("f-atualizar").addEventListener("click", carregar);

  // Menu do usuário
  var menu = $("u-menu");
  $("u-botao").addEventListener("click", function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; this.setAttribute("aria-expanded", String(!menu.hidden)); });
  document.addEventListener("click", function () { menu.hidden = true; });
  $("u-sair").addEventListener("click", function () { api("sair", null, {}).then(function () { clearInterval(S.timer); $("l-senha").value = ""; telaEntrada(); }); });
  $("u-senha").addEventListener("click", function () { $("s-msg").hidden = true; $("form-senha").reset(); $("d-senha").showModal(); });
  $("s-cancelar").addEventListener("click", function () { $("d-senha").close(); });
  $("form-senha").addEventListener("submit", function (ev) {
    ev.preventDefault();
    api("senha", null, { atual: $("s-atual").value, nova: $("s-nova").value }).then(function (r) {
      var m = $("s-msg");
      if (r.ok) { m.className = "erro"; m.style.cssText = "color:#bbf7d0;background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.35)"; m.textContent = "Senha trocada."; m.hidden = false; setTimeout(function () { $("d-senha").close(); m.style.cssText = ""; }, 1200); return; }
      m.style.cssText = ""; m.textContent = r.erro || "Não foi possível trocar agora."; m.hidden = false;
    });
  });

  /* ===================== Visão Flow =====================
     As telas num campo, ligadas por setas. A espessura da ligação e as partículas que correm por ela mostram
     quantas pessoas passam; o número no meio da seta é quanto caiu. Mapa, tela cheia, gargalo e a nave do dia. */
  var flow = (function () {
    var caixa = $("flow"), mundo = $("flow-mundo"), lig = $("flow-ligacoes"), nosEl = $("flow-nos");
    var fx = $("flow-fx"), fxc = fx.getContext("2d"), mapa = $("flow-mapa"), mapc = mapa.getContext("2d"), hud = $("flow-hud");
    var vista = { x: 40, y: 40, k: 0.8 }, pos = {}, carregadoDe = null, salvarT = null, primeiraVez = true, focado = null;
    var LARG = 236, PASSO_X = 300, calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var pulsos = true; try { pulsos = localStorage.getItem("flowex_pulsos") !== "0"; } catch (e) {}
    $("fl-pulsos").classList.toggle("ligado", pulsos);

    function aplicar() { mundo.style.transform = "translate(" + vista.x + "px," + vista.y + "px) scale(" + vista.k + ")"; desenharMapa(); }
    function padrao(passos) { var p = {}; passos.forEach(function (x, i) { p[x.id] = [i * PASSO_X, 0]; }); return p; }
    function chave() { return S.f + ":" + S.v; }
    function carregarLayout(cb) {
      if (carregadoDe === chave()) return cb();
      api("layout", { f: S.f, g: S.v }).then(function (r) { carregadoDe = chave(); pos = (r && r.pos) || {}; primeiraVez = true; cb(); });
    }
    function salvar() { clearTimeout(salvarT); salvarT = setTimeout(function () { api("layout", { f: S.f, g: S.v }, { pos: pos }); }, 600); }
    function elNo(id) { return nosEl.querySelector('.no[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); }

    var ultimo = null;
    function desenhar() {
      if (!S.d) return;
      carregarLayout(function () {
        var c = calcular(S.d), padr = padrao(c.passos); ultimo = c;
        c.passos.forEach(function (p) { if (!pos[p.id]) pos[p.id] = padr[p.id]; });
        nosEl.innerHTML = c.linhas.map(function (l, i) {
          var dt = difTxt(l), alta = c.maiores.indexOf(l.p.id) >= 0, xy = pos[l.p.id];
          // saúde da tela pela queda em relação à anterior: verde até 5%, amarelo até 12%, vermelho acima
          var saude = l.queda == null || l.p.evento || l.p.venda ? "" : l.queda > 0.12 ? " critica" : l.queda > 0.05 ? " atencao" : " boa";
          return '<div class="no' + (l.p.evento ? " evento" : "") + (l.p.venda ? " venda" : "") + (alta ? " alta" : "") + saude + '" data-id="' + esc(l.p.id) + '" data-i="' + i + '" style="left:' + xy[0] + "px;top:" + xy[1] + 'px;width:' + LARG + 'px">' +
            '<div class="no-dados"><span class="r">Retenção</span><span class="v">' + (c.base ? pctTxt(l.ret) : "—") + '</span>' +
            '<span class="r">' + (l.p.venda ? "Vendas" : "Visualizações") + '</span><span class="v">' + fmt(l.n) + "</span>" +
            '<span class="cmp ' + dt.cls + '">' + esc(dt.txt) + "</span></div>" +
            '<div class="no-corpo"><div class="topo-no"><span class="num-no">' + (l.p.venda ? "R$" : l.p.evento ? "ev" : esc(l.p.n)) + "</span><strong>" + esc(l.p.nome) + "</strong>" +
            (l.queda != null && !l.p.evento && !l.p.venda ? '<span class="selo-saude">' + (l.queda > 0.12 ? "▼ crítica" : l.queda > 0.05 ? "atenção" : "ok") + "</span>" : "") + "</div>" +
            "<p>" + esc(l.p.titulo) + "</p>" +
            '<div class="barra-no"><i style="width:' + Math.min(100, l.ret).toFixed(1) + '%"></i></div>' +
            (l.p.editar ? '<a href="' + esc(l.p.editar) + '" target="_blank" rel="noopener">' + ICO_EDITAR + "Editar</a>" : '<span class="sem-editar">dado da Cakto</span>') + "</div></div>";
        }).join("");
        ligar();
        desenharHud(c);
        if (focado) focar(focado, true);
        if (primeiraVez) { primeiraVez = false; inicio(); setTimeout(talvezNave, 700); }
        desenharMapa();
      });
    }

    // Ligações: espessura pelo volume, partículas correndo (quanto mais gente, mais partículas), queda no meio
    function ancora(id, lado) {
      var n = elNo(id); if (!n) return null;
      var corpo = n.querySelector(".no-corpo"), cy = n.offsetTop + corpo.offsetTop + corpo.offsetHeight / 2;
      return lado === "saida" ? [n.offsetLeft + n.offsetWidth, cy] : [n.offsetLeft, cy];
    }
    function curva(a, b) {
      var dx = Math.max(60, Math.abs(b[0] - a[0]) * 0.45);
      return "M" + a[0] + " " + a[1] + " C" + (a[0] + dx) + " " + a[1] + " " + (b[0] - dx) + " " + b[1] + " " + b[0] + " " + b[1];
    }
    function ligar() {
      var c = ultimo; if (!c) return;
      var html = '<defs><marker id="seta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#5b74ad"/></marker>' +
        '<linearGradient id="fio" x1="0" x2="1"><stop offset="0" stop-color="#3d6fe0"/><stop offset="1" stop-color="#8b7bff"/></linearGradient></defs>';
      var top = Math.max(1, c.base);
      for (var i = 1; i < c.linhas.length; i++) {
        var a = ancora(c.linhas[i - 1].p.id, "saida"), b = ancora(c.linhas[i].p.id, "entrada");
        if (!a || !b) continue;
        var l = c.linhas[i], d = curva(a, b), larg = 1.5 + 5 * Math.min(1, l.n / top);
        var marcado = focado != null && i <= focado;
        html += '<path id="lg' + i + '" class="fio' + (l.p.evento ? " evento" : "") + (marcado ? " marcado" : "") + '" d="' + d + '" style="stroke-width:' + larg.toFixed(1) + '" marker-end="url(#seta)"/>';
        if (pulsos && !calmo && l.n > 0) {
          var qtd = Math.max(1, Math.min(5, Math.round(1 + 4 * l.n / top))), dur = (2.6 - 1.2 * Math.min(1, l.n / top)).toFixed(2);
          for (var k = 0; k < qtd; k++) html += '<circle class="pulso-fio" r="' + (2 + larg * 0.35).toFixed(1) + '"><animateMotion dur="' + dur + 's" repeatCount="indefinite" begin="-' + (k * dur / qtd).toFixed(2) + 's"><mpath href="#lg' + i + '"/></animateMotion></circle>';
        }
        var q = l.queda;
        if (q != null && q > 0.0005) {
          var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, t = "−" + pctTxt(q * 100), w = t.length * 7.4 + 14;
          html += '<g class="rotulo' + (c.maiores.indexOf(l.p.id) >= 0 ? " alta" : "") + '"><rect x="' + (mx - w / 2) + '" y="' + (my - 11) + '" width="' + w + '" height="22" rx="7"/><text x="' + mx + '" y="' + (my + 4) + '" text-anchor="middle">' + t + "</text></g>";
        }
      }
      lig.innerHTML = html;
    }

    // Barra de comando no topo: as conversões da visão e o ponto de maior evasão, com atalho para ir até ele
    function desenharHud(c) {
      var v = S.d.passos, vd = S.d.vendas, h = [], visit = v["01"] || 0, front = vd.front || 0;
      if (S.v === "front") h.push(["Entraram", fmt(visit)], ["Chegaram à oferta", pctTxt(pct(v["34"] || 0, visit))], ["Checkout", pctTxt(pct(v.checkout || 0, visit))], ["Vendas", fmt(front) + " · " + pctTxt(pct(front, visit))]);
      else if (S.v === "ofertas") h.push(["Viram a oferta", fmt(v.oferta || 0)], ["Upsell aceito", pctTxt(pct(v["oferta-quero"] || 0, v.oferta || 0))], ["Downsell aceito", pctTxt(pct(v["downsell-quero"] || 0, v.downsell || 0))], ["Vendas", fmt((vd.upsell || 0) + (vd.downsell || 0))]);
      else if (S.v === "entrega") h.push(["Compras", fmt(front)], ["Acessaram", pctTxt(pct(v["login-ok"] || 0, front))], ["Clientes únicos", fmt(S.d.clientes)], ["Abriram e-book", fmt(v.ebook || 0)]);
      else h.push(["Visitantes", fmt(visit)], ["Compraram", pctTxt(pct(front, visit))], ["Upsell/downsell", pctTxt(pct((vd.upsell || 0) + (vd.downsell || 0), front))], ["Na área", fmt(v["login-ok"] || 0)]);
      var pior = null; c.linhas.forEach(function (l, i) { if (!l.p.evento && !l.p.venda && l.queda != null && (!pior || l.queda > pior.l.queda)) pior = { l: l, i: i }; });
      hud.innerHTML = h.map(function (x, i) { return (i ? '<span class="hud-seta">→</span>' : "") + '<span class="hud-item"><small>' + x[0] + "</small><b>" + x[1] + "</b></span>"; }).join("") +
        (pior && pior.l.queda > 0 ? '<button type="button" class="hud-gargalo" data-i="' + pior.i + '" title="Tela onde mais pessoas abandonam o funil"><span class="ponto-queda"></span>Maior evasão: <b>' + esc((pior.l.p.n ? pior.l.p.n + " · " : "") + pior.l.p.nome) + "</b> −" + pctTxt(pior.l.queda * 100) + "<em>ver</em></button>" : "");
      var g = hud.querySelector(".hud-gargalo");
      if (g) g.addEventListener("click", function () { irPara(Number(g.dataset.i)); });
    }
    function irPara(i, semFocar) {
      var n = nosEl.querySelector('.no[data-i="' + i + '"]'); if (!n) return;
      var alvo = { k: Math.max(vista.k, 0.85) };
      alvo.x = caixa.clientWidth / 2 - (n.offsetLeft + n.offsetWidth / 2) * alvo.k; alvo.y = caixa.clientHeight / 2 - (n.offsetTop + n.offsetHeight / 2) * alvo.k;
      animarVista(alvo, 650);
      if (!semFocar) focar(i);
      n.classList.remove("piscar"); void n.offsetWidth; n.classList.add("piscar");
    }
    // Clique numa tela: destaca o caminho do começo até ela
    function focar(i, manter) {
      focado = manter ? focado : (focado === i ? null : i);
      nosEl.querySelectorAll(".no").forEach(function (n) { n.classList.toggle("apagado", focado != null && Number(n.dataset.i) > focado); n.classList.toggle("focado", Number(n.dataset.i) === focado); });
      ligar();
    }
    function animarVista(alvo, ms, fim) {
      var de = { x: vista.x, y: vista.y, k: vista.k }, t0 = performance.now();
      (function passo(agora) {
        var t = Math.min(1, (agora - t0) / ms), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        vista.x = de.x + (alvo.x - de.x) * e; vista.y = de.y + (alvo.y - de.y) * e; vista.k = de.k + (alvo.k - de.k) * e; aplicar();
        if (t < 1) requestAnimationFrame(passo); else if (fim) fim();
      })(t0);
    }

    function alvoInicio() {
      var n0 = nosEl.querySelector(".no"); if (!n0) return null;
      var k = caixa.clientWidth < 700 ? 0.7 : 0.9;
      return { k: k, x: 60 - n0.offsetLeft * k, y: caixa.clientHeight / 2 - (n0.offsetTop + n0.offsetHeight / 2) * k + 20 };
    }
    function inicio() { var a = alvoInicio(); if (!a) return; vista.x = a.x; vista.y = a.y; vista.k = a.k; aplicar(); }
    function limites() {
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      nosEl.querySelectorAll(".no").forEach(function (n) { x0 = Math.min(x0, n.offsetLeft); y0 = Math.min(y0, n.offsetTop); x1 = Math.max(x1, n.offsetLeft + n.offsetWidth); y1 = Math.max(y1, n.offsetTop + n.offsetHeight); });
      return x0 > x1 ? null : [x0, y0, x1, y1];
    }
    function ajustar() {
      var L = limites(); if (!L) return;
      var W = caixa.clientWidth, H = caixa.clientHeight, m = 60, k = Math.max(0.15, Math.min(1.1, Math.min((W - m * 2) / (L[2] - L[0]), (H - m * 2 - 60) / (L[3] - L[1]))));
      animarVista({ k: k, x: m - L[0] * k + ((W - m * 2) - (L[2] - L[0]) * k) / 2, y: m + 40 - L[1] * k + ((H - m * 2 - 60) - (L[3] - L[1]) * k) / 2 }, 500);
    }
    function zoom(f, cx, cy) {
      var r = caixa.getBoundingClientRect(); cx = cx == null ? r.width / 2 : cx; cy = cy == null ? r.height / 2 : cy;
      var k = Math.max(0.15, Math.min(2, vista.k * f));
      vista.x = cx - (cx - vista.x) * (k / vista.k); vista.y = cy - (cy - vista.y) * (k / vista.k); vista.k = k; aplicar();
    }

    // Mapa do fluxo (canto): todas as telas em miniatura e o pedaço que está na tela
    var escalaMapa = null;
    function desenharMapa() {
      var L = limites(), w = mapa.width, h = mapa.height; mapc.clearRect(0, 0, w, h);
      if (!L || caixa.hidden) return;
      var pad = 8, k = Math.min((w - pad * 2) / (L[2] - L[0]), (h - pad * 2) / (L[3] - L[1]));
      var ox = pad + ((w - pad * 2) - (L[2] - L[0]) * k) / 2 - L[0] * k, oy = pad + ((h - pad * 2) - (L[3] - L[1]) * k) / 2 - L[1] * k;
      escalaMapa = { k: k, ox: ox, oy: oy };
      nosEl.querySelectorAll(".no").forEach(function (n) {
        mapc.fillStyle = n.classList.contains("critica") ? "#f87171" : n.classList.contains("evento") ? "#4a5674" : "#4f8cff";
        mapc.fillRect(ox + n.offsetLeft * k, oy + n.offsetTop * k, Math.max(2, n.offsetWidth * k), Math.max(2, n.offsetHeight * k));
      });
      var vx = (-vista.x / vista.k), vy = (-vista.y / vista.k), vw = caixa.clientWidth / vista.k, vh = caixa.clientHeight / vista.k;
      mapc.strokeStyle = "rgba(125,211,252,.9)"; mapc.lineWidth = 1.5; mapc.strokeRect(ox + vx * k, oy + vy * k, vw * k, vh * k);
    }
    function mapaIr(e) {
      if (!escalaMapa) return;
      var r = mapa.getBoundingClientRect(), mx = (e.clientX - r.left) * (mapa.width / r.width), my = (e.clientY - r.top) * (mapa.height / r.height);
      var wx = (mx - escalaMapa.ox) / escalaMapa.k, wy = (my - escalaMapa.oy) / escalaMapa.k;
      vista.x = caixa.clientWidth / 2 - wx * vista.k; vista.y = caixa.clientHeight / 2 - wy * vista.k; aplicar();
    }
    var arrMapa = false;
    mapa.addEventListener("pointerdown", function (e) { e.stopPropagation(); arrMapa = true; mapa.setPointerCapture(e.pointerId); mapaIr(e); });
    mapa.addEventListener("pointermove", function (e) { if (arrMapa) mapaIr(e); });
    mapa.addEventListener("pointerup", function () { arrMapa = false; });

    // Arrastar: o fundo navega; a tela muda de lugar; um clique (sem arrastar) numa tela destaca o caminho até ela
    var arr = null;
    caixa.addEventListener("pointerdown", function (e) {
      if (e.target.closest("a, button, .flow-ferramentas, .flow-mapa, .flow-hud")) return;
      if (nave.ativa) nave.parar();
      var no = e.target.closest(".no");
      arr = { no: no, x: e.clientX, y: e.clientY, ox: no ? pos[no.dataset.id][0] : vista.x, oy: no ? pos[no.dataset.id][1] : vista.y, mexeu: false };
      if (no) no.classList.add("solto"); else caixa.classList.add("arrastando");
      caixa.setPointerCapture(e.pointerId);
    });
    caixa.addEventListener("pointermove", function (e) {
      if (!arr) return;
      var dx = e.clientX - arr.x, dy = e.clientY - arr.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) arr.mexeu = true;
      if (!arr.mexeu) return;
      if (arr.no) {
        var id = arr.no.dataset.id, nx = Math.round(arr.ox + dx / vista.k), ny = Math.round(arr.oy + dy / vista.k);
        pos[id] = [nx, ny]; arr.no.style.left = nx + "px"; arr.no.style.top = ny + "px"; ligar(); desenharMapa();
      } else { vista.x = arr.ox + dx; vista.y = arr.oy + dy; aplicar(); }
    });
    function soltar() {
      if (!arr) return;
      if (arr.no) { arr.no.classList.remove("solto"); if (arr.mexeu) salvar(); else focar(Number(arr.no.dataset.i)); }
      caixa.classList.remove("arrastando"); arr = null;
    }
    caixa.addEventListener("pointerup", soltar);
    caixa.addEventListener("pointercancel", soltar);
    caixa.addEventListener("wheel", function (e) {
      e.preventDefault(); var r = caixa.getBoundingClientRect();
      zoom(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    $("fl-mais").addEventListener("click", function () { zoom(1.2); });
    $("fl-menos").addEventListener("click", function () { zoom(1 / 1.2); });
    $("fl-ajustar").addEventListener("click", ajustar);
    $("fl-cheia").addEventListener("click", function () {
      if (document.fullscreenElement) document.exitFullscreen(); else if (caixa.requestFullscreen) caixa.requestFullscreen();
    });
    document.addEventListener("fullscreenchange", function () { setTimeout(function () { medirFx(); desenharMapa(); }, 80); });
    $("fl-pulsos").addEventListener("click", function () {
      pulsos = !pulsos; this.classList.toggle("ligado", pulsos); try { localStorage.setItem("flowex_pulsos", pulsos ? "1" : "0"); } catch (e) {} ligar();
    });
    $("fl-nave").addEventListener("click", function () { nave.voar(); });
    $("fl-organizar").addEventListener("click", function () {
      if (!window.confirm("Voltar todas as telas para a posição original? A organização atual será perdida para toda a equipe.")) return;
      pos = {}; focado = null; api("layout", { f: S.f, g: S.v }, { pos: {}, limpar: true }); primeiraVez = true; desenhar();
    });
    window.addEventListener("resize", function () { if (!caixa.hidden) { medirFx(); desenharMapa(); } });

    /* ---------- A nave do Flowex: 1 vez por dia percorre o fluxo inteiro e some na última tela ---------- */
    function medirFx() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      fx.width = caixa.clientWidth * dpr; fx.height = caixa.clientHeight * dpr; fxc.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function talvezNave() {
      if (calmo || caixa.hidden) return;
      var hoje = S.hoje, ja = null; try { ja = localStorage.getItem("flowex_nave"); } catch (e) {}
      if (ja === hoje) return;
      try { localStorage.setItem("flowex_nave", hoje); } catch (e) {}
      nave.voar();
    }
    var nave = (function () {
      var api_ = { ativa: false }, rota = null, total = 0, t0 = 0, dur = 0, rastro = [], cauda = [], raf = 0;
      function montarRota() {
        var c = ultimo; if (!c || c.linhas.length < 2) return false;
        var d = "", ini = ancora(c.linhas[0].p.id, "entrada"), s0 = ancora(c.linhas[0].p.id, "saida");
        if (!ini) return false;
        d += "M" + (ini[0] - 160) + " " + (ini[1] - 40) + " Q" + (ini[0] - 40) + " " + ini[1] + " " + ini[0] + " " + ini[1] + " L" + s0[0] + " " + s0[1];
        for (var i = 1; i < c.linhas.length; i++) {
          var a = ancora(c.linhas[i - 1].p.id, "saida"), b = ancora(c.linhas[i].p.id, "entrada"), s = ancora(c.linhas[i].p.id, "saida");
          if (!a || !b) continue;
          var dx = Math.max(60, Math.abs(b[0] - a[0]) * 0.45);
          d += " C" + (a[0] + dx) + " " + a[1] + " " + (b[0] - dx) + " " + b[1] + " " + b[0] + " " + b[1];
          if (i < c.linhas.length - 1) d += " L" + s[0] + " " + s[1];
          else d += " L" + (b[0] + LARG / 2) + " " + b[1];          // termina no meio da última tela
        }
        rota = document.createElementNS("http://www.w3.org/2000/svg", "path"); rota.setAttribute("d", d);
        rota.setAttribute("fill", "none"); rota.setAttribute("stroke", "none"); lig.appendChild(rota);
        total = rota.getTotalLength();
        return total > 0;
      }
      function tela(p) { return [vista.x + p.x * vista.k, vista.y + p.y * vista.k]; }
      function quadro(agora) {
        var t = Math.min(1, (agora - t0) / dur), e = t < 0.12 ? (t * t) / 0.24 : t - 0.06;   // arranque suave, depois velocidade de cruzeiro
        var dist = Math.min(total, e / 0.94 * total), p = rota.getPointAtLength(dist), q = rota.getPointAtLength(Math.min(total, dist + 6));
        var ang = Math.atan2(q.y - p.y, q.x - p.x);
        // câmera acompanha a nave
        var kAlvo = caixa.clientWidth < 700 ? 0.55 : 0.7;
        vista.k += (kAlvo - vista.k) * 0.06;
        var ax = caixa.clientWidth * 0.42 - p.x * vista.k, ay = caixa.clientHeight * 0.5 - p.y * vista.k;
        vista.x += (ax - vista.x) * 0.12; vista.y += (ay - vista.y) * 0.12; aplicar();
        // rastro turbo (partículas que saem do motor)
        var s = tela(p), tras = [s[0] - Math.cos(ang) * 16, s[1] - Math.sin(ang) * 16];
        if (t < 1) for (var k = 0; k < 4; k++) rastro.push({ wx: p.x - Math.cos(ang) * 16 / vista.k, wy: p.y - Math.sin(ang) * 16 / vista.k,
          vx: -Math.cos(ang) * (1 + Math.random() * 2) + (Math.random() - 0.5) * 1.2, vy: -Math.sin(ang) * (1 + Math.random() * 2) + (Math.random() - 0.5) * 1.2, vida: 1, cor: Math.random() < 0.5 ? "125,211,252" : "167,139,250" });
        fxc.clearRect(0, 0, caixa.clientWidth, caixa.clientHeight);
        fxc.globalCompositeOperation = "lighter";
        // cauda de luz (o caminho recente da nave)
        if (t < 1) cauda.push([p.x, p.y]); if (cauda.length > 34 || (t >= 1 && cauda.length)) cauda.shift();
        for (var c2 = 1; c2 < cauda.length; c2++) {
          var a1 = tela({ x: cauda[c2 - 1][0], y: cauda[c2 - 1][1] }), a2 = tela({ x: cauda[c2][0], y: cauda[c2][1] }), f = c2 / cauda.length;
          fxc.strokeStyle = "rgba(" + (f > 0.5 ? "125,211,252" : "167,139,250") + "," + (f * 0.75) + ")"; fxc.lineWidth = 1 + f * 7; fxc.lineCap = "round";
          fxc.beginPath(); fxc.moveTo(a1[0], a1[1]); fxc.lineTo(a2[0], a2[1]); fxc.stroke();
        }
        for (var i = rastro.length - 1; i >= 0; i--) {
          var r = rastro[i]; r.vida -= 0.035; if (r.vida <= 0) { rastro.splice(i, 1); continue; }
          r.wx += r.vx / vista.k; r.wy += r.vy / vista.k;
          var rp = tela({ x: r.wx, y: r.wy });
          fxc.fillStyle = "rgba(" + r.cor + "," + (r.vida * 0.85) + ")"; fxc.beginPath(); fxc.arc(rp[0], rp[1], 1 + r.vida * 3.2, 0, 6.283); fxc.fill();
        }
        // chama do motor
        var fim = Math.max(0, (t - 0.94) / 0.06), alfa = 1 - fim;
        var g = fxc.createRadialGradient(tras[0], tras[1], 0, tras[0], tras[1], 26);
        g.addColorStop(0, "rgba(200,235,255," + 0.9 * alfa + ")"); g.addColorStop(0.4, "rgba(125,211,252," + 0.45 * alfa + ")"); g.addColorStop(1, "rgba(125,211,252,0)");
        fxc.fillStyle = g; fxc.beginPath(); fxc.arc(tras[0], tras[1], 26, 0, 6.283); fxc.fill();
        fxc.globalCompositeOperation = "source-over";
        // a nave (marca Flowex: ponta em flecha, asas com gradiente azul → lilás)
        fxc.save(); fxc.translate(s[0], s[1]); fxc.rotate(ang); fxc.globalAlpha = alfa; var esc_ = (1 - fim * 0.6) * 1.45; fxc.scale(esc_, esc_);
        var gr = fxc.createLinearGradient(-18, 0, 20, 0); gr.addColorStop(0, "#a78bfa"); gr.addColorStop(1, "#7dd3fc");
        fxc.shadowColor = "rgba(125,211,252,.9)"; fxc.shadowBlur = 18;
        fxc.fillStyle = gr; fxc.beginPath(); fxc.moveTo(22, 0); fxc.lineTo(-12, -13); fxc.lineTo(-6, 0); fxc.lineTo(-12, 13); fxc.closePath(); fxc.fill();
        fxc.shadowBlur = 0; fxc.fillStyle = "#e6f6ff"; fxc.beginPath(); fxc.ellipse(6, 0, 5, 2.6, 0, 0, 6.283); fxc.fill();
        fxc.fillStyle = "rgba(4,16,31,.6)"; fxc.beginPath(); fxc.moveTo(-6, 0); fxc.lineTo(-11, -9); fxc.lineTo(-9, 0); fxc.lineTo(-11, 9); fxc.closePath(); fxc.fill();
        fxc.restore();
        // telas acendem quando a nave passa
        nosEl.querySelectorAll(".no").forEach(function (n) {
          var cx = n.offsetLeft + n.offsetWidth / 2, cy = n.offsetTop + n.offsetHeight / 2;
          if (!n.dataset.aceso && Math.abs(p.x - cx) < n.offsetWidth / 2 && Math.abs(p.y - cy) < n.offsetHeight) { n.dataset.aceso = "1"; n.classList.add("acesa"); setTimeout(function () { n.classList.remove("acesa"); delete n.dataset.aceso; }, 900); }
        });
        if (t < 1 || rastro.length || cauda.length) { raf = requestAnimationFrame(quadro); return; }
        terminar();
      }
      function terminar() {
        var estava = api_.ativa;
        api_.ativa = false; cancelAnimationFrame(raf); fxc.clearRect(0, 0, caixa.clientWidth, caixa.clientHeight); rastro = []; cauda = [];
        if (rota) { rota.remove(); rota = null; }
        // ao chegar na última tela, ela dá um brilho
        var ultimoNo = nosEl.querySelector(".no:last-child"); if (ultimoNo) { ultimoNo.classList.remove("chegada"); void ultimoNo.offsetWidth; ultimoNo.classList.add("chegada"); }
        caixa.classList.remove("em-voo");
        if (estava && !parado) setTimeout(function () { var a = alvoInicio(); if (a) animarVista(a, 1400); }, 1100);   // depois do voo, volta ao começo do fluxo
        parado = false;
      }
      var parado = false;
      api_.voar = function () {
        if (api_.ativa || caixa.hidden) return;
        medirFx(); if (!montarRota()) return;
        api_.ativa = true; caixa.classList.add("em-voo"); rastro = []; cauda = [];
        dur = Math.min(11000, Math.max(5000, total / 1.9)); t0 = performance.now();
        raf = requestAnimationFrame(quadro);
      };
      api_.parar = function () { parado = true; terminar(); };
      return api_;
    })();

    return { desenhar: desenhar, mapa: desenharMapa, medir: medirFx };
  })();

  // Lista | Flow
  document.querySelectorAll(".visao button").forEach(function (b) {
    b.addEventListener("click", function () {
      S.visao = b.dataset.v; try { localStorage.setItem("flowex_visao", S.visao); } catch (e) {}
      mostrarVisao();
    });
  });
  function mostrarVisao() {
    document.querySelectorAll(".visao button").forEach(function (b) { b.classList.toggle("ativo", b.dataset.v === S.visao); });
    $("tabela").hidden = S.visao === "flow"; $("flow").hidden = S.visao !== "flow";
    if (S.visao === "flow") { flow.medir(); flow.desenhar(); }
  }
  try { S.visao = localStorage.getItem("flowex_visao") === "flow" ? "flow" : "lista"; } catch (e) {}
  mostrarVisao();

  abrirPainel();
})();
