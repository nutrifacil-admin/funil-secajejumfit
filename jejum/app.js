/* Navegação do funil no site próprio: uma etapa por vez, com histórico (botão voltar do celular funciona),
   cabeçalho (voltar + logo + progresso) e a mesma montagem de telas do motor. */
(function () {
  "use strict";
  var CFG = window.SJ_CFG, ETAPAS = window.SJ_ETAPAS;
  var tela = document.getElementById("tela"), voltar = document.querySelector(".voltar");
  var barra = document.querySelector(".progresso"), cheio = barra.firstElementChild, logo = document.querySelector(".logo");
  document.documentElement.style.setProperty("--cor", CFG.cor);

  logo.innerHTML = CFG.logoImagem ? '<img src="' + CFG.logoImagem + '" alt="">' : "<span>🔥</span><span>" + CFG.logoTexto + "</span>";

  var atual = -1;
  function mostrar(i, empilhar) {
    i = Math.max(0, Math.min(ETAPAS.length - 1, i));
    atual = i;
    var e = ETAPAS[i];
    voltar.hidden = i === 0;
    barra.hidden = !e.progresso;
    cheio.style.width = Math.round(((i + 1) / ETAPAS.length) * 100) + "%";
    tela.innerHTML = '<div class="sj-tela3" data-tela="' + e.id + '"></div>';
    window.scrollTo(0, 0);
    if (window.__SJ3) window.__SJ3();                  // motor monta a tela nova
    if (empilhar) history.pushState({ etapa: i }, "", location.pathname + location.search);
    if (window.fbq) window.fbq("trackCustom", "EtapaQuiz", { etapa: i + 1, nome: e.nome });
  }
  window.SJ_AVANCAR = function () { mostrar(atual + 1, true); };
  voltar.addEventListener("click", function () { history.back(); });
  window.addEventListener("popstate", function (ev) {
    var i = ev.state && typeof ev.state.etapa === "number" ? ev.state.etapa : 0;
    mostrar(i, false);
  });

  // ?etapa=N abre direto numa etapa (para testar). Sem parâmetro: começa do início.
  var pedida = parseInt(new URLSearchParams(location.search).get("etapa"), 10);
  var ini = pedida >= 1 && pedida <= ETAPAS.length ? pedida - 1 : 0;
  history.replaceState({ etapa: ini }, "", location.pathname + location.search);
  mostrar(ini, false);
})();
