/* Contador de retenção do Flowex (/painel). Cada tela chama SJ_RASTRO("front" | "pos" | "vsl", "nome-do-passo").
   Conta 1 vez por visitante, por passo, por dia. Junta os avisos e manda de uma vez (a cada 3 s, ou na hora em que a pessoa
   sai da página). Não manda dado pessoal; se falhar, o funil segue normal. Abrir o quiz com ?etapa=N (teste) não conta. */
(function () {
  "use strict";
  var FUNIL = "jejum";
  var TESTE = /[?&]etapa=/.test(location.search);
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function hoje() {
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  // Campanha do anúncio (utm_campaign): guarda a da primeira visita, para o pós-venda também saber de onde a pessoa veio
  try {
    var c = new URLSearchParams(location.search).get("utm_campaign");
    if (c) gravar("sjr_camp", c.slice(0, 80));
  } catch (e) {}

  var fila = {}, timer = null;
  function enviar() {
    clearTimeout(timer); timer = null;
    Object.keys(fila).forEach(function (g) {
      var lista = fila[g]; delete fila[g];
      for (var i = 0; i < lista.length; i += 30) {
        var corpo = JSON.stringify({ f: FUNIL, g: g, p: lista.slice(i, i + 30), c: ler("sjr_camp") || "" });
        try {
          if (navigator.sendBeacon) navigator.sendBeacon("/api/ev", new Blob([corpo], { type: "text/plain" }));
          else fetch("/api/ev", { method: "POST", body: corpo, keepalive: true }).catch(function () {});
        } catch (e) {}
      }
    });
  }
  window.addEventListener("pagehide", enviar);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") enviar(); });
  window.addEventListener("sj:checkout", enviar);

  // Presença ao vivo (Flowex): com a página aberta e visível, avisa a cada 40 s "tem alguém aqui".
  // Vai só um código aleatório desta visita (nenhum dado pessoal); o servidor esquece em 2 minutos.
  (function () {
    if (TESTE) return;
    var sid = null;
    try { sid = sessionStorage.getItem("fx_sid"); if (!sid) { sid = Math.random().toString(36).slice(2, 12); sessionStorage.setItem("fx_sid", sid); } } catch (e) { sid = Math.random().toString(36).slice(2, 12); }
    var pg = location.pathname, zona = /^\/membros/.test(pg) ? "area" : /^\/(obrigado|oferta)/.test(pg) ? "pos" : "funil";
    function bate() {
      if (document.visibilityState !== "visible") return;
      var c = JSON.stringify({ f: FUNIL, vivo: zona, s: sid });
      try { if (navigator.sendBeacon) navigator.sendBeacon("/api/ev", new Blob([c], { type: "text/plain" })); else fetch("/api/ev", { method: "POST", body: c, keepalive: true }).catch(function () {}); } catch (e) {}
    }
    bate(); setInterval(bate, 40000);
    document.addEventListener("visibilitychange", bate);
  })();

  window.SJ_RASTRO = function (grupo, passo) {
    try {
      if (!passo || TESTE) return;
      var dia = hoje(), vistos;
      try { vistos = JSON.parse(ler("sjr_vistos") || "{}"); } catch (e) { vistos = {}; }
      if (vistos.dia !== dia) vistos = { dia: dia, p: {} };
      var chave = grupo + ":" + passo;
      if (vistos.p[chave]) return;
      vistos.p[chave] = 1;
      gravar("sjr_vistos", JSON.stringify(vistos));
      (fila[grupo] = fila[grupo] || []).push(passo);
      if (!timer) timer = setTimeout(enviar, 3000);
    } catch (e) {}
  };
  window.SJ_RASTRO_ENVIAR = enviar;
})();
