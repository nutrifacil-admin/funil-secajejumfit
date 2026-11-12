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
  var S = { f: "jejum", g: "front", p: "hoje", de: "", ate: "", c: "", hoje: "", timer: null, visao: "lista", d: null, ant: null };
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
    var a = anterior();
    Promise.all([api("dados", { f: S.f, g: S.g, de: p[0], ate: p[1], c: S.c }), api("dados", { f: S.f, g: S.g, de: a[0], ate: a[1], c: S.c })]).then(function (r) {
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

  function baseDe(passos, v) {
    for (var i = 0; i < passos.length; i++) if (!passos[i].evento && v[passos[i].id]) return v[passos[i].id];
    return 0;
  }
  // Linhas: retenção sobre a 1ª tela; queda sobre a linha anterior; comparativo com o período anterior (em pontos de %)
  function calcular(d) {
    var passos = (MAPA[S.f] || {})[S.g] || [], v = d.passos, base = baseDe(passos, v);
    var va = S.ant ? S.ant.passos : null, baseA = va ? baseDe(passos, va) : 0;
    var linhas = [], anterior = null;
    passos.forEach(function (p) {
      var n = v[p.id] || 0, queda = anterior != null && anterior > 0 ? 1 - n / anterior : null;
      var ret = pct(n, base), retA = baseA ? pct(va[p.id] || 0, baseA) : null;
      linhas.push({ p: p, n: n, ret: ret, queda: queda, dif: base && retA != null ? ret - retA : null });
      anterior = n;
    });
    var maiores = linhas.filter(function (l) { return l.queda != null && l.queda > 0.05 && !l.p.evento; })
      .sort(function (a, b) { return b.queda - a.queda; }).slice(0, 3).map(function (l) { return l.p.id; });
    return { passos: passos, base: base, linhas: linhas, maiores: maiores };
  }
  function difTxt(l) {
    if (l.dif == null) return { txt: "sem dados " + rotuloAnterior().replace("vs ", "de "), cls: "" };
    var v = Math.abs(l.dif) < 0.05 ? 0 : l.dif;
    return { txt: (v > 0 ? "+" : v < 0 ? "−" : "±") + pctTxt(Math.abs(v)) + " " + rotuloAnterior(), cls: v > 0 ? "sobe" : v < 0 ? "desce" : "" };
  }

  function desenhar(d) {
    var c = calcular(d), passos = c.passos, base = c.base, linhas = c.linhas, maiores = c.maiores, v = d.passos, vd = d.vendas;

    $("t-titulo").textContent = S.g === "front" ? "Retenção por tela · Front" : "Retenção por tela · Pós-venda";
    $("linhas").innerHTML = base ? linhas.map(function (l) {
      var alta = maiores.indexOf(l.p.id) >= 0;
      return '<div class="linha' + (l.p.evento ? " evento" : "") + '" role="row">' +
        '<span class="n">' + esc(l.p.n) + "</span>" +
        '<span class="tela-nome"><strong>' + esc(l.p.nome) + (l.p.evento ? '<span class="etiqueta">evento</span>' : "") + "</strong><small>" + esc(l.p.titulo) + "</small></span>" +
        '<span class="trilho" data-dica="' + esc(l.p.nome) + "|" + fmt(l.n) + " visualizações · " + pctTxt(l.ret) + ' da 1ª tela"><i style="width:' + Math.min(100, l.ret).toFixed(1) + '%"></i></span>' +
        '<span class="num vis">' + fmt(l.n) + "</span>" +
        '<span class="num pct">' + pctTxt(l.ret) + (l === linhas[0] || l.dif == null ? "" : '<span class="delta ' + difTxt(l).cls + '">' + esc(difTxt(l).txt.replace(/ vs .*/, "")) + "</span>") + "</span>" +
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

    /* ===================== Visão Flow (telas num campo, ligadas por setas) ===================== */
  var flow = (function () {
    var caixa = $("flow"), mundo = $("flow-mundo"), lig = $("flow-ligacoes"), nosEl = $("flow-nos");
    var vista = { x: 40, y: 40, k: 0.8 }, pos = {}, carregadoDe = null, salvarT = null, primeiraVez = true;
    var LARG = 236, PASSO_X = 300;

    function aplicar() { mundo.style.transform = "translate(" + vista.x + "px," + vista.y + "px) scale(" + vista.k + ")"; }
    function padrao(passos) {
      var p = {};
      passos.forEach(function (x, i) { p[x.id] = [i * PASSO_X, 0]; });     // uma linha só: 1 → 2 → 3 …
      return p;
    }
    function chave() { return S.f + ":" + S.g; }
    function carregarLayout(cb) {
      if (carregadoDe === chave()) return cb();
      api("layout", { f: S.f, g: S.g }).then(function (r) {
        carregadoDe = chave(); pos = (r && r.pos) || {}; primeiraVez = true; cb();
      });
    }
    function salvar() {
      clearTimeout(salvarT);
      salvarT = setTimeout(function () { api("layout", { f: S.f, g: S.g }, { pos: pos }); }, 600);
    }

    function desenhar() {
      if (!S.d) return;
      carregarLayout(function () {
        var c = calcular(S.d), padr = padrao(c.passos);
        c.passos.forEach(function (p) { if (!pos[p.id]) pos[p.id] = padr[p.id]; });
        nosEl.innerHTML = c.linhas.map(function (l) {
          var dt = difTxt(l), alta = c.maiores.indexOf(l.p.id) >= 0, xy = pos[l.p.id];
          return '<div class="no' + (l.p.evento ? " evento" : "") + (alta ? " alta" : "") + '" data-id="' + esc(l.p.id) + '" style="left:' + xy[0] + "px;top:" + xy[1] + 'px;width:' + LARG + 'px">' +
            '<div class="no-dados"><span class="r">Retenção</span><span class="v">' + (c.base ? pctTxt(l.ret) : "—") + '</span>' +
            '<span class="r">Visualizações</span><span class="v">' + fmt(l.n) + "</span>" +
            '<span class="cmp ' + dt.cls + '">' + esc(dt.txt) + "</span></div>" +
            '<div class="no-corpo"><div class="topo-no"><span class="num-no">' + (l.p.evento ? "ev" : esc(l.p.n)) + "</span><strong>" + esc(l.p.nome) + "</strong></div>" +
            "<p>" + esc(l.p.titulo) + "</p>" +
            '<div class="barra-no"><i style="width:' + Math.min(100, l.ret).toFixed(1) + '%"></i></div>' +
            '<a href="' + esc(l.p.editar) + '" target="_blank" rel="noopener">' + ICO_EDITAR + "Editar</a></div></div>";
        }).join("");
        ligar(c);
        if (primeiraVez) { primeiraVez = false; inicio(c.passos); }
      });
    }

    // Setas: cada tela liga na seguinte; no meio da seta, quanto caiu de uma para a outra
    function ancora(id, lado) {
      var n = nosEl.querySelector('.no[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
      if (!n) return null;
      var x = n.offsetLeft, y = n.offsetTop, corpo = n.querySelector(".no-corpo");
      var cy = y + corpo.offsetTop + corpo.offsetHeight / 2;
      return lado === "saida" ? [x + n.offsetWidth, cy] : [x, cy];
    }
    var ultimo = null;
    function ligar(c) {
      c = c || ultimo; ultimo = c;
      var html = '<defs><marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#4a5e8c"/></marker></defs>';
      for (var i = 1; i < c.linhas.length; i++) {
        var a = ancora(c.linhas[i - 1].p.id, "saida"), b = ancora(c.linhas[i].p.id, "entrada");
        if (!a || !b) continue;
        var dx = Math.max(60, Math.abs(b[0] - a[0]) * 0.45);
        var d = "M" + a[0] + " " + a[1] + " C" + (a[0] + dx) + " " + a[1] + " " + (b[0] - dx) + " " + b[1] + " " + b[0] + " " + b[1];
        html += '<path class="' + (c.linhas[i].p.evento ? "evento" : "") + '" d="' + d + '" marker-end="url(#seta)"/>';
        var q = c.linhas[i].queda;
        if (q != null && q > 0.0005) {
          var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, t = "−" + pctTxt(q * 100), w = t.length * 7 + 12;
          html += '<g class="rotulo' + (c.maiores.indexOf(c.linhas[i].p.id) >= 0 ? " alta" : "") + '"><rect x="' + (mx - w / 2) + '" y="' + (my - 10) + '" width="' + w + '" height="20" rx="6"/><text x="' + mx + '" y="' + (my + 4) + '" text-anchor="middle">' + t + "</text></g>";
        }
      }
      lig.innerHTML = html;
    }

    // Abre mostrando o começo do funil em tamanho de leitura
    function inicio(passos) {
      var p0 = pos[passos[0].id] || [0, 0], n0 = nosEl.querySelector(".no"), h = n0 ? n0.offsetHeight : 230;
      vista.k = caixa.clientWidth < 700 ? 0.7 : 0.9;
      vista.x = 40 - p0[0] * vista.k; vista.y = caixa.clientHeight / 2 - (p0[1] + h / 2) * vista.k;
      aplicar();
    }
    function ajustar() {
      var nos = nosEl.querySelectorAll(".no"); if (!nos.length) return;
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      nos.forEach(function (n) { x0 = Math.min(x0, n.offsetLeft); y0 = Math.min(y0, n.offsetTop); x1 = Math.max(x1, n.offsetLeft + n.offsetWidth); y1 = Math.max(y1, n.offsetTop + n.offsetHeight); });
      var W = caixa.clientWidth, H = caixa.clientHeight, m = 40;
      vista.k = Math.max(0.2, Math.min(1.1, Math.min((W - m * 2) / (x1 - x0), (H - m * 2) / (y1 - y0))));
      vista.x = m - x0 * vista.k + ((W - m * 2) - (x1 - x0) * vista.k) / 2; vista.y = m - y0 * vista.k;
      aplicar();
    }
    function zoom(f, cx, cy) {
      var r = caixa.getBoundingClientRect(); cx = cx == null ? r.width / 2 : cx; cy = cy == null ? r.height / 2 : cy;
      var k = Math.max(0.2, Math.min(2, vista.k * f));
      vista.x = cx - (cx - vista.x) * (k / vista.k); vista.y = cy - (cy - vista.y) * (k / vista.k); vista.k = k; aplicar();
    }

    // Arrastar: o fundo navega; a tela muda de lugar
    var arr = null;
    caixa.addEventListener("pointerdown", function (e) {
      if (e.target.closest("a, .flow-ferramentas")) return;
      var no = e.target.closest(".no");
      arr = { no: no, x: e.clientX, y: e.clientY, ox: no ? pos[no.dataset.id][0] : vista.x, oy: no ? pos[no.dataset.id][1] : vista.y, mexeu: false };
      if (no) no.classList.add("solto"); else caixa.classList.add("arrastando");
      caixa.setPointerCapture(e.pointerId);
    });
    caixa.addEventListener("pointermove", function (e) {
      if (!arr) return;
      var dx = e.clientX - arr.x, dy = e.clientY - arr.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) arr.mexeu = true;
      if (arr.no) {
        var id = arr.no.dataset.id, nx = Math.round(arr.ox + dx / vista.k), ny = Math.round(arr.oy + dy / vista.k);
        pos[id] = [nx, ny]; arr.no.style.left = nx + "px"; arr.no.style.top = ny + "px"; ligar();
      } else { vista.x = arr.ox + dx; vista.y = arr.oy + dy; aplicar(); }
    });
    function soltar() {
      if (!arr) return;
      if (arr.no) { arr.no.classList.remove("solto"); if (arr.mexeu) salvar(); }
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
    $("fl-organizar").addEventListener("click", function () {
      if (!confirmarOrganizar()) return;
      pos = {}; api("layout", { f: S.f, g: S.g }, { pos: {}, limpar: true }); primeiraVez = true; desenhar();
    });
    function confirmarOrganizar() { return window.confirm("Voltar todas as telas para a posição original? A organização atual será perdida para toda a equipe."); }

    return { desenhar: desenhar, trocou: function () { carregadoDe = null; } };
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
    if (S.visao === "flow") flow.desenhar();
  }
  try { S.visao = localStorage.getItem("flowex_visao") === "flow" ? "flow" : "lista"; } catch (e) {}
  mostrarVisao();

  abrirPainel();
})();
