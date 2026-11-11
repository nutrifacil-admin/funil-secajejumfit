/* Área de membros — Seca Jejum
   Login por e-mail → 1º acesso: avaliação + upsell (VSL) + downsell → início, agenda e e-books. */
(function () {
  "use strict";
  var C = window.M_CFG, app = document.getElementById("m-app");
  // O motor de telas é usado só para a VSL; sem botão nativo para esconder aqui.
  window.SJ_AVANCAR = function () {};
  window.SJ_CFG = { cor: "#0d9488", texto: "#030712", vsl: C.vsl };
  window.SJ_TELAS = window.SJ_TELAS || {};
  window.SJ_TELAS.UP = [{ tipo: "video" }];

  var ST = { estado: null, respostas: null };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function api(a, dados) {
    var op = { credentials: "same-origin", cache: "no-store" };
    if (dados !== undefined) { op.method = "POST"; op.headers = { "Content-Type": "application/json" }; op.body = JSON.stringify(dados); }
    return fetch("/api/m?a=" + a, op).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); })
      .catch(function () { return { _status: 0 }; });
  }
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem("sjf_m_" + k)); localStorage.setItem("sjf_m_" + k, JSON.stringify(v)); } catch (e) { return null; } }
  function fbq() { if (window.fbq) window.fbq.apply(null, arguments); }
  function rodape() {
    return '<a class="m-suporte" href="https://wa.me/' + C.suporteWhats + '" target="_blank" rel="noopener">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.3z"/></svg>' +
      "Suporte: " + C.suporteWhatsTexto + "</a>";
  }

  /* =================== Rotas =================== */
  function ir(hash) { if (location.hash === hash) rota(); else location.hash = hash; }
  window.addEventListener("hashchange", rota);
  function rota() {
    var h = location.hash.replace("#", "") || "inicio";
    window.scrollTo(0, 0);
    if (!ST.estado || ST.estado._status === 401) return telaLogin();
    if (h === "avaliacao" || (ST.estado.destino === "quiz" && h !== "refazer")) return Quiz.iniciar("completo");
    if (h === "refazer") return Quiz.iniciar("perguntas");
    if (!ST.estado.temRespostas && h !== "conteudo-metodo" && h !== "conteudo-cha") return Quiz.iniciar("perguntas");
    if (h === "agenda") return Agenda.mostrar();
    if (h === "conteudo-metodo") return telaConteudo("metodo");
    if (h === "conteudo-cha") return telaConteudo("cha");
    return telaInicio();
  }
  function carregarEstado() {
    return api("estado").then(function (e) { ST.estado = e; return e; });
  }

  /* =================== Login =================== */
  function telaLogin(msg) {
    document.body.className = "m";
    app.innerHTML =
      '<main class="m-entrada">' +
      '<div class="m-marca"><span>🔥</span> ' + esc(C.marca.toUpperCase()) + "</div>" +
      '<h1>Acesso à área de membros</h1>' +
      '<form class="m-card m-form" id="f" novalidate>' +
      '<label for="email">Coloque seu e-mail de compra</label>' +
      '<p class="m-dica">Use o mesmo e-mail que você informou no pagamento.</p>' +
      '<input id="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="seuemail@exemplo.com" required>' +
      '<div id="msg" class="m-msg" hidden></div>' +
      '<button class="m-btn" id="b" type="submit">Entrar</button>' +
      "</form>" +
      '<p class="m-rodape-txt">Não precisa de senha. Basta o e-mail usado na compra.</p>' + rodape() +
      "</main>";
    var f = $("#f"), campo = $("#email"), b = $("#b"), m = $("#msg");
    var ultimo = ls("email"); if (ultimo) campo.value = ultimo;
    function aviso(tipo, html) { m.className = "m-msg " + tipo; m.innerHTML = html; m.hidden = !html; }
    if (msg) aviso("erro", msg);
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = campo.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return aviso("erro", "Esse e-mail parece incompleto. Confira se digitou certo (ex.: maria@gmail.com).");
      b.disabled = true; b.innerHTML = '<span class="m-gira"></span>Verificando…'; aviso("", "");
      api("login", { email: email }).then(function (r) {
        b.disabled = false; b.textContent = "Entrar";
        if (r.ok) {
          ls("email", email);
          aviso("ok", "Acesso liberado! Entrando…");
          return carregarEstado().then(function () { ir(r.destino === "quiz" ? "#avaliacao" : "#inicio"); });
        }
        if (r.erro === "nao_encontrado") return aviso("erro destaque",
          "<strong>Não encontramos este e-mail na nossa lista de clientes.</strong>" +
          "<span>Você digitou: <b>" + esc(email) + "</b></span>" +
          "<span>Use <b>exatamente o mesmo e-mail que você preencheu na compra</b>. Uma letra diferente já impede o acesso.</span>" +
          "<span>Pagou agora no Pix? A liberação pode levar 1 ou 2 minutos. Tente de novo em seguida.</span>");
        if (r.erro === "limite") return aviso("erro", "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.");
        aviso("erro", "Não conseguimos verificar seu acesso agora. Tente de novo em alguns instantes.");
      });
    });
  }

  /* =================== Início (Meus planos) =================== */
  function telaInicio() {
    document.body.className = "m";
    var cha = ST.estado.cha, p = ST.respostas ? Plano.calcular(ST.respostas, new Date()) : null;
    var agora = p ? Plano.status(p, new Date()) : null;
    app.innerHTML =
      '<main class="m-pagina">' +
      '<p class="m-topo"><b>' + esc(C.marca) + "</b> " + esc(C.subtitulo) + "</p>" +
      "<h1>Meus planos</h1>" +
      '<a class="m-card m-card-agenda" href="#agenda">' +
      '<div class="m-card-cab"><span class="m-ic">📅</span><div><h2>Sua agenda de jejum</h2><p>Seu plano de jejum personalizado</p></div></div>' +
      '<span class="m-btn">Acessar meu plano <b>›</b></span>' +
      (agora ? '<p class="m-agora"><i class="' + (agora.comendo ? "c" : "j") + '"></i>Agora: ' + esc(agora.curto) + "</p>" : "") +
      "</a>" +
      cartao("metodo", true) + cartao("cha", cha) +
      '<a class="m-card m-linha" href="#refazer"><span class="m-ic">🔄</span><div><h3>Refazer meus horários</h3><p>Mudou a rotina? Responda de novo e a sua agenda é refeita.</p></div></a>' +
      '<button class="m-sair" id="sair" type="button">Sair</button>' + rodape() +
      "</main>";
    $("#sair").onclick = function () { api("sair", {}).then(function () { ST.estado = null; location.hash = ""; telaLogin(); }); };
  }
  function cartao(area, liberado) {
    var a = C[area];
    return '<a class="m-card m-produto m-produto-' + area + (liberado ? "" : " bloqueado") + '" href="#conteudo-' + area + '">' +
      '<div class="m-produto-capa"><span>' + (area === "cha" ? "🍵" : "⏱️") + "</span><b>" + esc(area === "cha" ? "CHÁ TURBO SECA" : "SECA JEJUM TURBO") + "</b>" +
      (liberado ? "" : '<em class="m-selo">🔒 Bloqueado</em>') + "</div>" +
      '<div class="m-produto-txt"><div><h3>' + esc(a.titulo) + "</h3><p>" + esc(a.sub) + "</p></div><b>›</b></div></a>";
  }

  /* =================== Conteúdo (e-books) =================== */
  function telaConteudo(area) {
    document.body.className = "m";
    var a = C[area], liberado = area === "metodo" ? ST.estado.front || ST.estado.cha : ST.estado.cha;
    app.innerHTML =
      '<main class="m-pagina">' +
      '<a class="m-voltar" href="#inicio">‹ Início</a>' +
      "<h1>" + esc(a.titulo) + '</h1><p class="m-sub">' + a.livros.length + " e-books</p>" +
      (liberado ? "" :
        '<div class="m-card m-desbloquear"><span class="m-etq">Acelere 10x a queima de gordura</span>' +
        "<h2>Desbloqueie o Chá Turbo Seca</h2>" +
        "<p>As receitas de chás que ativam a queima de gordura desde a primeira hora do jejum, as Bebidas Anti Fome, a Queima Noturna e todos os bônus.</p>" +
        '<a class="m-btn m-btn-ouro" href="' + C.upsell.checkout + '" id="desb">Desbloquear agora</a>' +
        '<p class="m-nota">Pagamento seguro · Garantia de 30 dias · Use o mesmo e-mail da sua compra: o acesso libera aqui assim que o pagamento for aprovado.</p></div>') +
      '<div class="m-livros">' +
      a.livros.map(function (l) {
        return '<a class="m-livro' + (liberado ? "" : " bloqueado") + '" ' + (liberado ? 'href="/api/m?a=pdf&id=' + l[0] + '" target="_blank" rel="noopener"' : 'href="#conteudo-cha"') + ">" +
          '<span class="m-livro-ic">' + (liberado ? "📘" : "🔒") + "</span><span>" + esc(l[1]) + "</span><b>" + (liberado ? "Abrir" : "") + "</b></a>";
      }).join("") + "</div>" + rodape() + "</main>";
    var d = $("#desb"); if (d) d.addEventListener("click", function () { fbq("track", "InitiateCheckout", { content_name: "Chá Turbo Seca (área)" }); });
  }

  /* =================== Plano do dia (cálculo da agenda) =================== */
  var Plano = (function () {
    var COPO = 200;
    function min(h) { if (h == null || h === "pula") return null; var a = String(h).split(":"); return +a[0] * 60 + (+a[1] || 0); }
    function hora(m) { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
    function q(m) { return Math.round(m / 15) * 15; }
    var NOMES = { cafe: "Café da manhã", almoco: "Almoço", lanche: "Lanche", janta: "Jantar" };
    function nomePelaHora(m) { var h = (((m % 1440) + 1440) % 1440) / 60; return h < 11 ? "cafe" : h < 15 ? "almoco" : h < 18 ? "lanche" : "janta"; }
    function horasJejum(p, d) {
      var imc = p.peso / Math.pow(p.altura / 100, 2), fds = d.getDay() === 0 || d.getDay() === 6, h;
      if (p.saude && p.saude !== "nenhuma") h = 12;          // gestante, amamentando, diabetes: jejum leve
      else if (imc < 25 || p.idade >= 60) h = 14;
      else h = 16;
      var fdsPausa = p.pausaFds && fds && h > 12; if (fdsPausa) h = 12;
      return { horas: h, imc: imc, fds: fdsPausa };
    }
    function calcular(p, d) {
      var j = horasJejum(p, d), acorda = min(p.acorda), dorme = min(p.dorme);
      if (dorme <= acorda) dorme += 1440;
      var depois = function (m) { return m == null ? null : m < acorda ? m + 1440 : m; };
      var dela = ["cafe", "almoco", "lanche", "janta"].map(function (k) { return [k, depois(min(p[k]))]; })
        .filter(function (x) { return x[1] != null; }).sort(function (a, b) { return a[1] - b[1]; });
      var ultimaDela = dela.length ? dela[dela.length - 1][1] : dorme - 180;
      var fecha = q(Math.min(ultimaDela + 30, dorme - 120)), abre = fecha - (24 - j.horas) * 60;
      if (abre < acorda + 30) abre = q(acorda + 30);
      var ultima = fecha - 30;
      var perto = dela.filter(function (x) { return Math.abs(x[1] - abre) <= 60; })[0];
      var tipoQuebra = perto ? perto[0] : nomePelaHora(abre), ref;
      var naJanela = dela.filter(function (x) { return x[1] >= abre && x[1] <= ultima; });
      if (p[tipoQuebra] === "pula" && naJanela.length) {
        ref = naJanela.map(function (x, i) { return { hora: x[1], tipo: x[0], quebra: i === 0 }; });
      } else {
        ref = [{ hora: abre, tipo: tipoQuebra, quebra: true }];
        dela.forEach(function (x) { if (x[1] >= abre + 120 && x[1] <= ultima) ref.push({ hora: x[1], tipo: x[0] }); });
      }
      if (dela.length && ultimaDela > ultima && ref[ref.length - 1].hora < ultima - 120) ref.push({ hora: ultima, tipo: dela[dela.length - 1][0] });
      var temLanche = ref.some(function (r) { return r.tipo === "lanche"; });
      if (p.lanche !== "pula" && !temLanche) {
        for (var i = ref.length - 1; i > 0; i--) {
          if (ref[i].hora - ref[i - 1].hora >= 300) { ref.splice(i, 0, { hora: q((ref[i].hora + ref[i - 1].hora) / 2), tipo: "lanche" }); break; }
        }
      }
      ref.forEach(function (r) { r.nome = NOMES[r.tipo]; });
      var ml = Math.min(3500, Math.max(2000, Math.round(p.peso * 35))), n = Math.ceil(ml / COPO);
      var fimAgua = dorme - 60, passo = (fimAgua - acorda) / (n - 1), copos = [];
      for (var k = 0; k < n; k++) copos.push(q(acorda + k * passo));
      return { horas: j.horas, fds: j.fds, imc: j.imc, acorda: acorda, dorme: dorme, abre: abre, fecha: fecha, refeicoes: ref, agua: { ml: ml, copos: copos } };
    }
    // Situação agora (comendo ou em jejum) e quanto falta
    function status(pl, d) {
      var m = d.getHours() * 60 + d.getMinutes(); if (m < pl.acorda - 180) m += 1440;
      var comendo = m >= pl.abre && m < pl.fecha, alvo = comendo ? pl.fecha : (m < pl.abre ? pl.abre : pl.abre + 1440);
      var falta = alvo - m, hh = Math.floor(falta / 60), mm = falta % 60;
      var faltaTxt = String(hh).padStart(2, "0") + "h" + String(mm).padStart(2, "0");
      return { comendo: comendo, falta: faltaTxt, alvo: hora(alvo), agoraMin: m,
        curto: comendo ? "pode comer até as " + hora(pl.fecha) : "em jejum até as " + hora(m < pl.abre ? pl.abre : pl.abre) };
    }
    return { calcular: calcular, status: status, hora: hora, min: min };
  })();

  /* =================== Agenda =================== */
  var Agenda = (function () {
    var dia = 0;
    function mostrar() {
      document.body.className = "m";
      var p = ST.respostas, base = new Date(); base.setHours(12, 0, 0, 0);
      var d = new Date(base.getTime() + dia * 864e5), pl = Plano.calcular(p, d), hoje = dia === 0;
      var st = hoje ? Plano.status(pl, new Date()) : null, H = Plano.hora;
      var chaveDia = d.toISOString().slice(0, 10), marcados = ls("feito_" + chaveDia) || {};
      var cha = ST.estado.cha;
      var DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      var seletor = "";
      for (var i = 0; i < 7; i++) {
        var di = new Date(base.getTime() + i * 864e5), w = di.getDay();
        seletor += '<button type="button" class="m-dia' + (i === dia ? " ativo" : "") + '" data-d="' + i + '"><small>' + (i === 0 ? "Hoje" : DIAS[w]) + "</small><b>" + di.getDate() + "</b>" + (p.pausaFds && (w === 0 || w === 6) ? "<i></i>" : "") + "</button>";
      }
      // linha do tempo
      var itens = [];
      function add(t, html, cls) { itens.push({ t: t, html: html, cls: cls || "" }); }
      add(pl.acorda - 1, '<div class="m-sec j">Em jejum até as ' + H(pl.abre) + "<small>Não coma nada. Só água, café e chá sem açúcar.</small></div>");
      add(pl.acorda, item(pl.acorda, "☀️", "Acordar", "Comece o dia com 1 copo de água"));
      pl.agua.copos.forEach(function (t, k) { add(t + 0.1, copo(t, k)); });
      add(pl.abre - 0.5, '<div class="m-sec c">Pode comer · das ' + H(pl.abre) + " às " + H(pl.fecha) + (hoje && st.comendo ? "<em>VOCÊ ESTÁ AQUI</em>" : "") + "<small>Este é o seu horário de comer. Faça as refeições abaixo.</small></div>");
      pl.refeicoes.forEach(function (r, k) {
        var id = "r" + k, feito = !!marcados[id];
        add(r.hora, '<div class="m-item refeicao' + (feito ? " feito" : "") + '"><time>' + H(r.hora) + "</time><div><h4>" + r.nome +
          '<button type="button" class="m-feito" data-id="' + id + '">' + (feito ? "✓ Feito" : "Feito") + "</button></h4>" +
          (r.quebra ? "<p>Quebra do jejum · comece pela proteína e coma devagar</p>" : "") +
          '<a class="m-receitas" href="/api/m?a=pdf&id=SJF-02" target="_blank" rel="noopener">Ver receitas</a></div></div>');
      });
      add(pl.abre + 0.2, extra(pl.abre, "Acelere 10x a queima de gordura", "Chá Turbo Seca", "Seu corpo entrou no modo de limpeza: hora do chá.", "CTS-01"));
      var ultimaRef = pl.refeicoes[pl.refeicoes.length - 1].hora;
      add(ultimaRef + 15, extra(ultimaRef + 15, "Atravesse o jejum sem passar fome", "Bebidas Anti Fome", "A última coisa do dia, logo depois da última refeição.", "CTS-02"));
      add(pl.fecha, '<div class="m-sec j">Jejum de novo a partir das ' + H(pl.fecha) + "<small>A janela fechou. Só água, café e chá sem açúcar.</small></div>");
      add(pl.dorme - 45, extra(pl.dorme - 45, "Emagreça enquanto dorme", "Queima Noturna", "O ritual de 5 minutos antes de deitar.", "CTS-03"));
      add(pl.dorme, '<div class="m-sec s">Dormindo · das ' + H(pl.dorme) + " às " + H(pl.acorda) + "<small>O jejum continua enquanto você dorme.</small></div>");
      itens.sort(function (a, b) { return a.t - b.t; });

      function item(t, ic, tit, txt) { return '<div class="m-item"><time>' + H(t) + "</time><div><h4>" + ic + " " + tit + "</h4><p>" + txt + "</p></div></div>"; }
      function copo(t, k) {
        var feito = !!marcados["a" + k];
        return '<div class="m-item agua' + (feito ? " feito" : "") + '"><time>' + H(t) + '</time><div><h4>💧 Copo de água (200 ml)<button type="button" class="m-feito" data-id="a' + k + '">' + (feito ? "✓" : "Bebi") + "</button></h4></div></div>";
      }
      function extra(t, etq, tit, txt, id) {
        return '<a class="m-item extra' + (cha ? "" : " bloqueado") + '" href="' + (cha ? "/api/m?a=pdf&id=" + id : "#conteudo-cha") + '"' + (cha ? ' target="_blank" rel="noopener"' : "") + "><time>" + H(t) + "</time><div><small>" + etq + "</small><h4>" + tit + (cha ? "" : " <em>🔒 Desbloquear</em>") + "</h4><p>" + txt + "</p></div></a>";
      }
      var bebidos = pl.agua.copos.filter(function (_, k) { return marcados["a" + k]; }).length;
      var comendo = st && st.comendo;
      app.innerHTML =
        (hoje ? '<div class="m-faixa ' + (comendo ? "c" : "j") + '"><b>' + (comendo ? "🍽 Você pode comer até as " + H(pl.fecha) : "⏳ Em jejum até as " + st.alvo) + "</b>" +
          "<span>Faltam " + st.falta + ". " + (comendo ? "Depois, jejum até " + H(pl.abre) + " de amanhã." : "Aí abre a sua janela de comer.") + "</span></div>" : "") +
        '<main class="m-pagina">' +
        '<a class="m-voltar" href="#inicio">‹ Início</a>' +
        '<p class="m-topo"><b>' + esc(C.marca) + "</b> " + esc(C.subtitulo) + "</p>" +
        "<h1>Seu plano " + (hoje ? "de hoje" : "do dia") + "</h1>" +
        '<div class="m-dias">' + seletor + "</div>" +
        anel(pl, st) +
        '<div class="m-janelas"><div class="m-janela c"><small>🍽 Pode comer</small><b>' + H(pl.abre) + " às " + H(pl.fecha) + "</b><span>" + Math.round((pl.fecha - pl.abre) / 60) + " h para as refeições</span></div>" +
        '<div class="m-janela j"><small>⏳ Jejum</small><b>' + H(pl.fecha) + " às " + H(pl.abre) + "</b><span>" + (24 - Math.round((pl.fecha - pl.abre) / 60)) + " h, contando o sono</span></div></div>" +
        '<div class="m-card m-agua">💧 <span>Água do dia</span><b>' + (pl.agua.ml / 1000).toFixed(1).replace(".", ",") + " L</b><small>" + bebidos + " de " + pl.agua.copos.length + " copos de 200 ml</small></div>" +
        '<p class="m-calc">Calculado pelo seu peso e altura: jejum de ' + pl.horas + " h." + (pl.fds ? " Pausa de fim de semana ativa." : "") + "</p>" +
        '<label class="m-card m-pausa"><div><b>Pausa no fim de semana</b><small>Sábado e domingo com jejum de 12 h</small></div><input type="checkbox" id="pausa"' + (p.pausaFds ? " checked" : "") + "><i></i></label>" +
        '<h2 class="m-h2">Sua agenda</h2><div class="m-linha-tempo">' + itens.map(function (x) { return x.html; }).join("") + "</div>" +
        '<a class="m-card m-linha" href="#refazer"><span class="m-ic">🔄</span><div><h3>Refazer meus horários</h3><p>Mudou a rotina? Responda de novo e a sua agenda é refeita.</p></div></a>' +
        rodape() + "</main>";
      $$(".m-dia").forEach(function (b) { b.onclick = function () { dia = +b.dataset.d; mostrar(); }; });
      $$(".m-feito").forEach(function (b) {
        b.onclick = function (ev) { ev.preventDefault(); marcados[b.dataset.id] = !marcados[b.dataset.id]; ls("feito_" + chaveDia, marcados); mostrar(); };
      });
      $("#pausa").onchange = function () {
        var v = this.checked;
        api("respostas", { respostas: { pausaFds: v } }).then(function (r) { if (r.ok) ST.respostas = r.respostas; mostrar(); });
      };
    }
    // Relógio de 24 h: janela de comer (âmbar), jejum acordado e sono (verde), ponteiro "agora"
    function anel(pl, st) {
      var R = 100, C0 = 130, L = 26;
      function pt(m, r) { var a = (m / 1440) * 2 * Math.PI - Math.PI / 2; return [C0 + r * Math.cos(a), C0 + r * Math.sin(a)]; }
      function arco(a, b, cor, txt) {
        if (b <= a) b += 1440;
        var p1 = pt(a, R), p2 = pt(b, R), grande = b - a > 720 ? 1 : 0;
        return '<path d="M' + p1[0] + " " + p1[1] + " A" + R + " " + R + " 0 " + grande + " 1 " + p2[0] + " " + p2[1] + '" stroke="' + cor + '" stroke-width="' + L + '" fill="none"/>';
      }
      var H = Plano.hora, marca = function (m, t, cor) { var p = pt(m, R + 28); return '<text x="' + p[0] + '" y="' + p[1] + '" fill="' + cor + '" font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="middle">' + t + "</text>"; };
      var svg = '<svg viewBox="0 0 260 260" class="m-anel-svg">' +
        arco(pl.fecha, pl.dorme, "#0f766e") + arco(pl.dorme, pl.acorda, "#0d9488") + arco(pl.acorda, pl.abre, "#0f766e") + arco(pl.abre, pl.fecha, "#f5a524") +
        marca(pl.abre, H(pl.abre), "#f5a524") + marca(pl.fecha, H(pl.fecha), "#f5a524") + marca(pl.dorme, H(pl.dorme), "#5eead4") + marca(pl.acorda, H(pl.acorda), "#5eead4");
      if (st) { var a = pt(st.agoraMin, R); svg += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="9" fill="#fff" stroke="#0b1215" stroke-width="3"/>'; }
      svg += "</svg>";
      var centro = st ? '<small class="' + (st.comendo ? "c" : "j") + '">' + (st.comendo ? "PODE COMER" : "EM JEJUM") + "</small><b>" + st.falta + "</b><span>" + (st.comendo ? "até fechar, às " + H(pl.fecha) : "até abrir, às " + st.alvo) + "</span>"
        : "<small>JANELA</small><b>" + H(pl.abre) + "</b><span>até " + H(pl.fecha) + "</span>";
      return '<div class="m-anel">' + svg + '<div class="m-anel-centro">' + centro + "</div></div>";
    }
    return { mostrar: mostrar };
  })();

  /* =================== Avaliação (quiz) + upsell + downsell =================== */
  var Quiz = (function () {
    var NOTA = "Confirme com atenção: é a partir daqui que o seu plano é montado.";
    var PERGUNTAS = [
      { id: "genero", tipo: "opcoes", titulo: "Qual o seu gênero?", nota: NOTA, opcoes: [["mulher", "Mulher", "♀"], ["homem", "Homem", "♂"]] },
      { id: "idade", tipo: "numero", titulo: "Confirme sua idade", nota: NOTA, min: 18, max: 99, ini: 35, un: "anos" },
      { id: "altura", tipo: "numero", titulo: "Confirme sua altura", nota: NOTA, min: 140, max: 220, ini: 165, un: "cm" },
      { id: "peso", tipo: "numero", titulo: "Confirme seu peso", nota: NOTA, min: 40, max: 250, ini: 75, un: "kg", imc: true },
      { id: "saude", tipo: "opcoes", titulo: "Você está em alguma dessas situações?", nota: "Isso deixa o seu jejum mais seguro: nesses casos, o seu plano usa um jejum mais leve.",
        opcoes: [["gravida", "Estou grávida"], ["amamentando", "Estou amamentando"], ["diabetes", "Tenho diabetes e tomo remédio"], ["nenhuma", "Nenhuma dessas"]] },
      { id: "acorda", tipo: "hora", titulo: "Que horas você acorda?", ini: "07:00" },
      { id: "dorme", tipo: "hora", titulo: "Que horas você dorme?", ini: "23:00" },
      { id: "cafe", tipo: "hora", titulo: "Que horas você toma café da manhã?", ini: "08:00", pular: "Pulo o café da manhã" },
      { id: "almoco", tipo: "hora", titulo: "Que horas você almoça?", ini: "12:00", pular: "Pulo o almoço" },
      { id: "lanche", tipo: "hora", titulo: "Que horas você lancha?", ini: "16:00", pular: "Pulo o lanche" },
      { id: "janta", tipo: "hora", titulo: "Que horas você janta?", ini: "20:00", pular: "Pulo a janta" },
      { id: "restricoes", tipo: "multi", titulo: "Você tem alguma restrição alimentar?", nota: "Pode marcar mais de uma.",
        opcoes: [["lactose", "Sem lactose"], ["gluten", "Sem glúten"], ["vegetariana", "Sou vegetariana(o)"]], nenhuma: "Não tenho restrição" },
      { id: "fome", tipo: "opcoes", titulo: "Qual horário você sente mais fome?", opcoes: [["cafe", "Café da manhã", "☕"], ["almoco", "Almoço", "🍽️"], ["lanche", "Lanche", "🥪"], ["janta", "Jantar", "🌙"]] }
    ];
    var telas, i, r, modo;
    function iniciar(m) {
      modo = m; i = 0;
      r = Object.assign({}, ST.respostas || {}, (m === "completo" && ls("quiz")) || {});
      telas = m === "completo"
        ? [{ tipo: "boas" }, { tipo: "apres" }].concat(PERGUNTAS, [{ tipo: "salvar" }, { tipo: "acelerar" }, { tipo: "oferta" }, { tipo: "downsell" }])
        : [{ tipo: "abertura" }].concat(PERGUNTAS, [{ tipo: "fim" }]);
      if (m === "completo" && ls("quiz_passo") != null) i = Math.min(ls("quiz_passo"), telas.length - 1);
      desenhar();
    }
    function guardar() { if (modo === "completo") { ls("quiz", r); ls("quiz_passo", i); } }
    function avancar() { i = Math.min(telas.length - 1, i + 1); guardar(); desenhar(); window.scrollTo(0, 0); }
    function voltar() { i = Math.max(0, i - 1); guardar(); desenhar(); }
    function pularPara(tipo) { i = telas.map(function (t) { return t.tipo; }).indexOf(tipo); guardar(); desenhar(); window.scrollTo(0, 0); }
    function desenhar() {
      document.body.className = "m m-quiz";
      var t = telas[i], n = PERGUNTAS.indexOf(t), total = PERGUNTAS.length;
      var cab = n >= 0 ? '<div class="q-cab"><button type="button" class="q-voltar" id="qv">‹</button><div class="q-barra"><i style="width:' + Math.round((n + 1) / total * 100) + '%"></i></div><span>' + (n + 1) + "/" + total + "</span></div>" : "";
      app.innerHTML = cab + '<main class="q-tela" id="qt"></main>';
      if ($("#qv")) $("#qv").onclick = voltar;
      var el = $("#qt");
      ({ boas: tBoas, apres: tApres, abertura: tAbertura, opcoes: tOpcoes, numero: tNumero, hora: tHora, multi: tMulti, salvar: tSalvar, fim: tFim, acelerar: tAcelerar, oferta: tOferta, downsell: tDownsell })[t.tipo](el, t);
    }
    function nota(t) { return t.nota ? '<p class="q-nota">' + t.nota + "</p>" : ""; }
    function botao(txt, id) { return '<button class="m-btn q-btn" type="button" id="' + (id || "q-ok") + '">' + txt + "</button>"; }
    function tBoas(el) {
      el.innerHTML = '<div class="q-ilustra">🥗⏱️</div><h1>Seja bem-vindo(a)!</h1><h2>Faça sua avaliação física</h2>' +
        "<p>Precisamos confirmar mais algumas informações para <strong>personalizar ainda mais o seu plano de jejum.</strong> Leva 1 minuto e ele é gerado na hora!</p>" + botao("Fazer minha avaliação");
      $("#q-ok").onclick = avancar; fbq("trackCustom", "AvaliacaoInicio");
    }
    function tApres(el) {
      el.innerHTML = '<div class="m-card q-apres"><span class="m-etq">⚡ ' + PERGUNTAS.length + ' etapas rápidas</span><h1>Avaliação Física ' + esc(C.marca) + "</h1>" +
        "<p>Responda com atenção. É a partir dessas respostas que terminamos de personalizar o seu plano.</p>" +
        '<ul class="q-chips"><li>📏 Corpo</li><li>⏰ Rotina</li><li>🔥 Seu plano</li></ul>' + botao("Começar") + "</div>";
      $("#q-ok").onclick = avancar;
    }
    function tAbertura(el) {
      el.innerHTML = '<div class="m-card q-apres"><span class="m-etq">🔄 Refazer meus horários</span><h1>Confirme as suas respostas</h1>' +
        "<p>Mude o que for preciso. <strong>A sua agenda de jejum vai ser refeita com os novos horários.</strong></p>" + botao("Começar") +
        '<a class="q-pular" href="#inicio">Cancelar e voltar</a></div>';
      $("#q-ok").onclick = avancar;
    }
    function tOpcoes(el, t) {
      el.innerHTML = "<h1>" + t.titulo + "</h1>" + nota(t) + '<div class="q-opcoes">' + t.opcoes.map(function (o) {
        return '<button type="button" class="q-opcao' + (r[t.id] === o[0] ? " marcada" : "") + '" data-v="' + o[0] + '">' + (o[2] ? "<i>" + o[2] + "</i>" : "") + "<span>" + o[1] + "</span><b>›</b></button>";
      }).join("") + "</div>";
      $$(".q-opcao", el).forEach(function (b) { b.onclick = function () { r[t.id] = b.dataset.v; b.classList.add("marcada"); setTimeout(avancar, 250); }; });
    }
    function tNumero(el, t) {
      var v = r[t.id] != null ? r[t.id] : t.ini;
      el.innerHTML = "<h1>" + t.titulo + "</h1>" + nota(t) +
        '<div class="q-num"><button type="button" data-d="-1">−</button><output><b id="qn"></b> ' + t.un + '</output><button type="button" data-d="1">+</button></div>' +
        '<input class="q-faixa" type="range" min="' + t.min + '" max="' + t.max + '" value="' + v + '">' +
        '<p class="q-dica">Arraste ou toque em − / +</p>' + (t.imc ? '<p class="q-imc" id="qimc"></p>' : "") + botao("Continuar");
      var faixa = $(".q-faixa", el);
      function mostra() {
        $("#qn").textContent = v; faixa.value = v; faixa.style.setProperty("--p", ((v - t.min) / (t.max - t.min) * 100) + "%");
        if (t.imc) {
          var alt = (r.altura || 165) / 100, imc = v / (alt * alt);
          var cat = imc < 18.5 ? ["Abaixo do peso", "a"] : imc < 25 ? ["Peso normal", "n"] : imc < 30 ? ["Sobrepeso", "s"] : ["Obesidade", "o"];
          $("#qimc").className = "q-imc " + cat[1]; $("#qimc").innerHTML = "Seu IMC: <b>" + imc.toFixed(1).replace(".", ",") + "</b> · " + cat[0];
        }
      }
      faixa.oninput = function () { v = +faixa.value; mostra(); };
      $$(".q-num button", el).forEach(function (b) { b.onclick = function () { v = Math.max(t.min, Math.min(t.max, v + +b.dataset.d)); mostra(); }; });
      $("#q-ok").onclick = function () { r[t.id] = v; avancar(); };
      mostra();
    }
    function tHora(el, t) {
      var v = r[t.id] && r[t.id] !== "pula" ? r[t.id] : t.ini, m = Plano.min(v);
      el.innerHTML = "<h1>" + t.titulo + "</h1>" + nota(t) +
        '<div class="q-relogio"><button type="button" data-d="-60">−1h</button><button type="button" data-d="-15">−15</button><output id="qh"></output><button type="button" data-d="15">+15</button><button type="button" data-d="60">+1h</button></div>' +
        botao("Continuar") + (t.pular ? '<button type="button" class="q-pular" id="qp">' + t.pular + "</button>" : "");
      function mostra() { $("#qh").textContent = Plano.hora(m); }
      $$(".q-relogio button", el).forEach(function (b) { b.onclick = function () { m = (m + +b.dataset.d + 1440) % 1440; mostra(); }; });
      $("#q-ok").onclick = function () { r[t.id] = Plano.hora(m); avancar(); };
      if ($("#qp")) $("#qp").onclick = function () { r[t.id] = "pula"; avancar(); };
      mostra();
    }
    function tMulti(el, t) {
      var sel = Array.isArray(r[t.id]) ? r[t.id].slice() : [];
      function des() {
        el.innerHTML = "<h1>" + t.titulo + "</h1>" + nota(t) + '<div class="q-opcoes">' + t.opcoes.map(function (o) {
          return '<button type="button" class="q-opcao multi' + (sel.indexOf(o[0]) >= 0 ? " marcada" : "") + '" data-v="' + o[0] + '"><span>' + o[1] + "</span><em></em></button>";
        }).join("") + '<button type="button" class="q-opcao multi' + (Array.isArray(r[t.id]) && !sel.length ? " marcada" : "") + '" data-v=""><span>' + t.nenhuma + "</span><em></em></button></div>" + botao("Continuar");
        $$(".q-opcao", el).forEach(function (b) {
          b.onclick = function () {
            var v = b.dataset.v;
            if (!v) { sel = []; r[t.id] = []; } else { var k = sel.indexOf(v); if (k >= 0) sel.splice(k, 1); else sel.push(v); r[t.id] = sel.slice(); }
            des();
          };
        });
        $("#q-ok").onclick = function () { r[t.id] = sel.slice(); avancar(); };
      }
      des();
    }
    function enviar() { return api("respostas", { respostas: r }); }
    function tSalvar(el) {                     // depois da última pergunta: grava e segue (nunca trava)
      el.innerHTML = '<h1>Montando o seu plano…</h1><p class="q-gerando"><i></i>salvando as suas respostas…</p>';
      enviar().then(function (x) {
        if (x._status === 400) {
          el.innerHTML = "<h1>Confira os seus horários</h1><p>O horário de acordar e o de dormir ficaram muito perto um do outro. Volte e confira.</p>" + botao("Conferir os horários");
          $("#q-ok").onclick = function () { i = telas.map(function (t) { return t.id; }).indexOf("acorda"); guardar(); desenhar(); };
          return;
        }
        if (x.ok) { ST.respostas = x.respostas; ST.estado.temRespostas = true; }
        avancar();
      });
    }
    function tFim(el) {
      el.innerHTML = '<h1>Montando a sua agenda…</h1><p class="q-gerando"><i></i>salvando os seus horários…</p>';
      enviar().then(function (x) {
        if (x.ok) {
          ST.respostas = x.respostas; ST.estado.temRespostas = true;
          el.innerHTML = '<div class="q-ilustra">✅</div><h1>Pronto! Sua agenda foi atualizada</h1><p>Os seus horários de jejum e das refeições já estão no seu plano.</p><a class="m-btn q-btn" href="#agenda">Ver minha agenda</a>';
        } else if (x._status === 400) {
          el.innerHTML = "<h1>Confira os seus horários</h1><p>O horário de acordar e o de dormir ficaram muito perto um do outro. Volte e confira.</p>" + botao("Conferir os horários");
          $("#q-ok").onclick = function () { i = telas.map(function (t) { return t.id; }).indexOf("acorda"); desenhar(); };
        } else {
          el.innerHTML = "<h1>Não conseguimos salvar agora</h1><p>Verifique a sua internet e tente de novo. As suas respostas continuam aqui.</p>" + botao("Tentar de novo");
          $("#q-ok").onclick = function () { tFim(el); };
        }
      });
    }
    function tAcelerar(el) {
      el.innerHTML = "<h1>Você gostaria de acelerar em 10x a sua queima de gordura com o Jejum?</h1>" +
        '<div class="q-ilustra grande">🔥</div>' +
        "<p>De acordo com as suas respostas, identificamos que a sua <strong>janela metabólica de jejum</strong> pode acelerar em até <mark>10x</mark> o seu emagrecimento.</p>" +
        '<div class="q-opcoes">' + [["com-certeza", "Com certeza!!"], ["sim", "Sim!"], ["saber-mais", "Gostaria de saber mais…"]].map(function (o) {
          return '<button type="button" class="q-opcao" data-v="' + o[0] + '"><span>' + o[1] + "</span><b>›</b></button>";
        }).join("") + "</div>";
      $$(".q-opcao", el).forEach(function (b) { b.onclick = function () { r.acelerar = b.dataset.v; b.classList.add("marcada"); setTimeout(avancar, 250); }; });
    }
    function garantia() {
      return '<div class="m-card q-garantia"><div class="q-selo">30<small>DIAS</small></div><h3>30 dias de GARANTIA</h3>' +
        "<p>Se não atender às suas expectativas nos primeiros 30 dias após a compra, <strong>devolvemos 100% do valor pago, sem perguntas.</strong></p>" +
        "<p>Basta enviar um e-mail para o suporte: <strong>" + esc(C.suporteEmail) + "</strong></p></div>";
    }
    function concluirE(url) {
      var espera = new Promise(function (ok) { setTimeout(ok, 3000); });
      Promise.race([api("concluir", {}), espera]).then(function () {
        try { localStorage.removeItem("sjf_m_quiz"); localStorage.removeItem("sjf_m_quiz_passo"); } catch (e) {}
        ST.estado.destino = "membros";
        if (url) location.href = url; else ir("#inicio");
      });
    }
    function tOferta(el) {
      document.body.classList.add("q-escuro");
      el.innerHTML = '<section class="q-oferta"><h1>Processando a sua avaliação física…</h1><p class="q-gerando"><i></i>gerando seu plano…</p>' +
        '<p class="q-sub">Enquanto isso,</p><h2><mark>Assista à primeira aula do ' + esc(C.marca) + "</mark></h2>" +
        '<div class="sj-tela3" data-tela="UP"></div>' +
        '<div class="sj-pos-vsl q-botoes"><button type="button" class="q-quero" id="quero">QUERO EMAGRECER 10X MAIS RÁPIDO</button>' +
        '<p class="q-mesmo">Use o mesmo e-mail da sua compra para liberar o acesso aqui na área.</p>' +
        '<button type="button" class="q-recusa" id="nao">Não quero</button>' + garantia() + "</div></section>";
      if (window.__SJ3) window.__SJ3();
      // se o vídeo não carregar (bloqueador, internet ruim), os botões aparecem no tempo do CTA mesmo assim
      var t0 = Date.now(), seg = +C.vsl.cta || 0;
      var vig = setInterval(function () {
        if (!document.body.contains(el)) return clearInterval(vig);
        var v = $(".sj-vp video"), tocando = v && v.currentTime > 0;
        if (!tocando && Date.now() - t0 > seg * 1000) { document.body.classList.add("vsl-cta"); clearInterval(vig); }
      }, 1000);
      $("#quero").onclick = function () { fbq("track", "InitiateCheckout", { content_name: "Chá Turbo Seca (upsell)" }); concluirE(C.upsell.checkout); };
      $("#nao").onclick = function () { pularPara("downsell"); };
    }
    function tDownsell(el) {
      document.body.classList.remove("q-escuro");
      var itens = [
        ["🔥", "Chá Turbo Seca", "Receitas de chás naturais, com ingredientes simples, que ligam o modo de queima de gordura desde a primeira hora do jejum."],
        ["🥤", "Bebidas Anti Fome", "Bebidas para tomar junto com a última refeição, que seguram a energia e diminuem muito a fome durante o jejum."],
        ["🌙", "Protocolo Queima Noturna", "Um ritual de 5 minutos antes de dormir para o corpo continuar queimando gordura enquanto você dorme."],
        ["🌞", "Guia do Corpo Leve", "Uma rotina de 5 minutos ao acordar que ativa a circulação, a energia e o humor para o dia todo."]
      ];
      el.innerHTML = '<div class="q-alerta">🚨 Última chance! Não perca essa oferta especial!</div>' +
        '<section class="q-down"><h1>Acabei de liberar <mark>50% de DESCONTO</mark> pra você no Chá Turbo Seca + Bônus!</h1><h2>Você recebe acesso imediato a:</h2>' +
        '<div class="q-entregas">' + itens.map(function (x) { return '<div class="m-card"><span>' + x[0] + "</span><h3>" + x[1] + "</h3><p>" + x[2] + "</p></div>"; }).join("") + "</div>" +
        '<div class="q-preco"><div>50% de desconto! SOMENTE NESSA PÁGINA!!</div><strong>Chá Turbo Seca + Bônus</strong><p><s>De ' + C.downsell.precoDe + "</s> por <b>" + C.downsell.precoPor + "</b></p></div>" +
        '<button type="button" class="q-quero" id="quero">QUERO DESBLOQUEAR TUDO COM 50% OFF</button>' +
        '<p class="q-mesmo">Use o mesmo e-mail da sua compra para liberar o acesso aqui na área.</p>' +
        '<button type="button" class="q-recusa" id="nao">Não, quero seguir sem o desconto</button>' + garantia() + "</section>";
      $("#quero").onclick = function () { fbq("track", "InitiateCheckout", { content_name: "Chá Turbo Seca (downsell)" }); concluirE(C.downsell.checkout); };
      $("#nao").onclick = function () { concluirE(null); };
    }
    return { iniciar: iniciar };
  })();

  /* =================== Início =================== */
  carregarEstado().then(function (e) {
    if (e._status === 401 || !e.ok) { var h = location.hash; telaLogin(); if (h && h !== "#") history.replaceState(null, "", location.pathname); return; }
    return api("respostas").then(function (x) { ST.respostas = x.respostas || null; rota(); });
  });
  // depois do login, carrega as respostas antes de rotear
  var carregarEstadoOriginal = carregarEstado;
  carregarEstado = function () { return carregarEstadoOriginal().then(function (e) { return api("respostas").then(function (x) { ST.respostas = x.respostas || null; return e; }); }); };
})();
