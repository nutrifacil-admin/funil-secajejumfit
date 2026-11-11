/* =====================================================================
   CONFIGURAÇÃO DO FUNIL — Seca Jejum (secajejum.fit)
   ===================================================================== */
window.SJ_CFG = {
  cor: "#0d9488",                  // cor principal (botões, setas, barras)
  texto: "#030712",                // cor do texto
  logoTexto: "SECA JEJUM",         // logo em texto (troque por logoImagem quando tiver a sua)
  logoImagem: "",                  // ex.: "img/logo.png"
  imgBase: "img/",              // suas imagens (pasta jejum/img)
  checkout: "https://pay.cakto.com.br/fk5jcvn",
  produto: "Seca Jejum Turbo",     // aparece na etapa 7 ("escolheram o …")
  vsl: {
    src: "https://vz-fc9df7e8-845.b-cdn.net/d826a593-fa31-4b6f-9aa0-45c29e6b5fe1/playlist.m3u8",
    capa: "",
    autoplayTitulo: "Seu plano já começou",
    autoplayTexto: "Toque para ouvir",
    pitch: 175,                    // segundo do pitch → evento no pixel (só com som)
    cta: 164,                      // segundo em que aparecem timer + botão + selos
    pixelId: "",
    pixelEvento: "PitchVSL"
  }
};
