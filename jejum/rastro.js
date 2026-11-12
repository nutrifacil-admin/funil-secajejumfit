/* Contador de retenção do painel (/painel). Cada tela chama SJ_RASTRO("front" | "pos", "nome-do-passo").
   Conta 1 vez por visitante, por passo, por dia. Não manda dado pessoal; se falhar, o funil segue normal. */
(function () {
  "use strict";
  var FUNIL = "jejum";
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

  window.SJ_RASTRO = function (grupo, passo) {
    try {
      if (!passo) return;
      var dia = hoje(), vistos;
      try { vistos = JSON.parse(ler("sjr_vistos") || "{}"); } catch (e) { vistos = {}; }
      if (vistos.dia !== dia) vistos = { dia: dia, p: {} };
      var chave = grupo + ":" + passo;
      if (vistos.p[chave]) return;
      vistos.p[chave] = 1;
      gravar("sjr_vistos", JSON.stringify(vistos));
      var corpo = JSON.stringify({ f: FUNIL, g: grupo, p: passo, c: ler("sjr_camp") || "" });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/ev", new Blob([corpo], { type: "text/plain" }));
      else fetch("/api/ev", { method: "POST", body: corpo, keepalive: true }).catch(function () {});
    } catch (e) {}
  };
})();
