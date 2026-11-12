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
      if (r.ok) { galaxia.ativa = false; abrirPainel(); return; }
      erro.textContent = r.erro || "Não conseguimos entrar agora. Tente de novo."; erro.hidden = false;
    });
  });

  /* ===================== Painel ===================== */
  var S = { f: "jejum", g: "front", p: "hoje", de: "", ate: "", c: "", hoje: "", timer: null };
  var fmt = function (n) { return Number(n || 0).toLocaleString("pt-BR"); };
  var pct = function (a, b) { return b ? a / b * 100 : 0; };
  var pctTxt = function (v) { return (v >= 10 || v === 0 ? Math.round(v) : v.toFixed(1).replace(".", ",")) + "%"; };
  var reais = function (c) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  var ICO_EDITAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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

  function abrirPainel() {
    api("eu").then(function (eu) {
      if (eu._status === 401) return telaEntrada();
      $("entrada").hidden = true; $("painel").hidden = false;
      S.hoje = eu.hoje;
      $("u-nome").textContent = eu.nome; $("u-avatar").textContent = (eu.nome || "?").charAt(0);
      $("f-funil").innerHTML = Object.keys(eu.funis).map(function (k) { return '<option value="' + k + '">' + esc(eu.funis[k]) + "</option>"; }).join("");
      try { var g = sessionStorage.getItem("painel_g"); if (g) S.g = g; var p = sessionStorage.getItem("painel_p"); if (p) S.p = p; } catch (e) {}
      marcarFiltros();
      carregar();
    });
  }

  function marcarFiltros() {
    document.querySelectorAll(".abas button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.g === S.g ? "true" : "false"); });
    document.querySelectorAll(".periodo > button").forEach(function (b) { b.classList.toggle("ativo", b.dataset.p === S.p); });
    var p = periodo(); $("f-de").value = p[0]; $("f-ate").value = p[1]; $("f-de").max = $("f-ate").max = S.hoje;
  }

  function carregar() {
    var p = periodo(), bt = $("f-atualizar");
    bt.classList.add("girando");
    api("dados", { f: S.f, g: S.g, de: p[0], ate: p[1], c: S.c }).then(function (d) {
      bt.classList.remove("girando");
      if (d._status === 401) return telaEntrada();
      if (!d.ok) { $("linhas").innerHTML = '<div class="vazio">' + esc(d.erro || "Não conseguimos carregar os dados agora.") + "</div>"; return; }
      $("f-hora").textContent = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      var sel = $("f-camp"), atual = S.c;
      sel.innerHTML = '<option value="">Todas as campanhas</option>' + d.campanhas.map(function (c) { return '<option value="' + esc(c) + '"' + (c === atual ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("");
      if (atual && d.campanhas.indexOf(atual) < 0) sel.insertAdjacentHTML("beforeend", '<option value="' + esc(atual) + '" selected>' + esc(atual) + "</option>");
      desenhar(d);
    });
    clearInterval(S.timer);
    if (S.p === "hoje") S.timer = setInterval(carregar, 60000);   // hoje: atualiza sozinho a cada minuto
  }

  function desenhar(d) {
    var passos = (MAPA[S.f] || {})[S.g] || [], v = d.passos, vd = d.vendas;
    var base = 0;
    for (var i = 0; i < passos.length; i++) if (!passos[i].evento && v[passos[i].id]) { base = v[passos[i].id]; break; }

    // Linhas: retenção sobre a 1ª tela; queda sobre a linha anterior
    var linhas = [], anterior = null;
    passos.forEach(function (p) {
      var n = v[p.id] || 0, queda = anterior != null && anterior > 0 ? 1 - n / anterior : null;
      linhas.push({ p: p, n: n, ret: pct(n, base), queda: queda });
      anterior = n;
    });
    var maiores = linhas.filter(function (l) { return l.queda != null && l.queda > 0.05 && !l.p.evento; })
      .sort(function (a, b) { return b.queda - a.queda; }).slice(0, 3).map(function (l) { return l.p.id; });

    $("t-titulo").textContent = S.g === "front" ? "Retenção por tela · Front" : "Retenção por tela · Pós-venda";
    $("linhas").innerHTML = base ? linhas.map(function (l) {
      var alta = maiores.indexOf(l.p.id) >= 0;
      return '<div class="linha' + (l.p.evento ? " evento" : "") + '" role="row">' +
        '<span class="n">' + esc(l.p.n) + "</span>" +
        '<span class="tela-nome"><strong>' + esc(l.p.nome) + (l.p.evento ? '<span class="etiqueta">evento</span>' : "") + "</strong><small>" + esc(l.p.titulo) + "</small></span>" +
        '<span class="trilho" data-dica="' + esc(l.p.nome) + "|" + fmt(l.n) + " visualizações · " + pctTxt(l.ret) + ' da 1ª tela"><i style="width:' + Math.min(100, l.ret).toFixed(1) + '%"></i></span>' +
        '<span class="num vis">' + fmt(l.n) + "</span>" +
        '<span class="num pct">' + pctTxt(l.ret) + "</span>" +
        '<span class="num queda' + (alta ? " alta" : "") + '">' + (l.queda == null ? "—" : (alta ? "<b>▼ " + pctTxt(l.queda * 100) + "</b>" : (l.queda > 0 ? "−" + pctTxt(l.queda * 100) : "+" + pctTxt(-l.queda * 100)))) + "</span>" +
        '<a class="editar" href="' + esc(l.p.editar) + '" target="_blank" rel="noopener">' + ICO_EDITAR + "Editar</a>" +
        "</div>";
    }).join("") : '<div class="vazio">Ainda não há visitas neste período' + (S.c ? " nesta campanha" : "") + ".</div>";

    // Resumo
    var k = [];
    if (S.g === "front") {
      var oferta = v["34"] || 0, ck = v.checkout || 0, vf = vd.front || 0;
      k.push(["Visitantes", fmt(base), "entraram na 1ª tela", true]);
      k.push(["Chegaram à oferta", fmt(oferta), pctTxt(pct(oferta, base)) + " dos visitantes"]);
      k.push(["Cliques no checkout", fmt(ck), pctTxt(pct(ck, oferta)) + " de quem viu a oferta"]);
      k.push(["Vendas front", fmt(vf), pctTxt(pct(vf, base)) + " dos visitantes" + (vd["front-reembolso"] ? " · " + vd["front-reembolso"] + " reemb." : "")]);
      k.push(["Receita front", reais(vd["front-centavos"] || 0), vf ? "ticket " + reais((vd["front-centavos"] || 0) / vf) : "Cakto"]);
    } else {
      var compras = vd.front || 0, entrou = v["login-ok"] || 0, viu = v.oferta || 0, up = vd.upsell || 0, dn = vd.downsell || 0;
      k.push(["Compras front", fmt(compras), "base do pós-venda", true]);
      k.push(["Entraram na área", fmt(entrou), pctTxt(pct(entrou, compras)) + " das compras"]);
      k.push(["Viram a oferta", fmt(viu), pctTxt(pct(viu, entrou)) + " de quem entrou"]);
      k.push(["Vendas upsell", fmt(up), pctTxt(pct(up, compras)) + " das compras front"]);
      k.push(["Vendas downsell", fmt(dn), pctTxt(pct(dn, compras)) + " das compras front"]);
      k.push(["Receita pós", reais((vd["upsell-centavos"] || 0) + (vd["downsell-centavos"] || 0)), "upsell + downsell"]);
    }
    $("kpis").innerHTML = k.map(function (x) { return '<div class="kpi' + (x[3] ? " destaque" : "") + '"><small>' + x[0] + "</small><strong>" + x[1] + "</strong><span>" + x[2] + "</span></div>"; }).join("");

    grafico(d, passos);
  }

  // Colunas por dia: visitantes da 1ª tela (front) ou compras front (pós)
  function grafico(d, passos) {
    var bloco = $("bloco-dia");
    if (d.porDia.length < 2) { bloco.hidden = true; return; }
    bloco.hidden = false;
    var primeiro = (passos.find(function (p) { return !p.evento; }) || {}).id;
    var serie = d.porDia.map(function (x) { return { dia: x.dia, n: S.g === "front" ? (x.passos[primeiro] || 0) : (x.passos["login-ok"] || 0) }; });
    $("dia-legenda").textContent = S.g === "front" ? "Visitantes na 1ª tela por dia" : "Pessoas que entraram na área por dia";
    var max = Math.max(1, Math.max.apply(null, serie.map(function (s) { return s.n; })));
    var W = 1000, H = 140, larg = W / serie.length, col = Math.max(2, Math.min(28, larg - 4));
    var passo = Math.ceil(serie.length / 10);
    var svg = '<svg viewBox="0 0 ' + W + " " + (H + 18) + '" preserveAspectRatio="none" role="img" aria-label="' + esc($("dia-legenda").textContent) + '">';
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
  document.querySelectorAll(".abas button").forEach(function (b) { b.addEventListener("click", function () { S.g = b.dataset.g; try { sessionStorage.setItem("painel_g", S.g); } catch (e) {} marcarFiltros(); carregar(); }); });
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

  abrirPainel();
})();
