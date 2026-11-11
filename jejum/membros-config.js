/* =====================================================================
   CONFIGURAÇÃO DA ÁREA DE MEMBROS — Seca Jejum
   ===================================================================== */
window.M_CFG = {
  marca: "Seca Jejum",
  subtitulo: "o seu Jejum com Água",
  suporteWhats: "5562982393173",
  suporteWhatsTexto: "(62) 98239-3173",
  suporteEmail: "nutrifacilsuporte@gmail.com",

  upsell:   { checkout: "https://pay.cakto.com.br/35ocedw", preco: "R$47,00" },
  downsell: { checkout: "https://pay.cakto.com.br/muqb3ft", precoDe: "R$47,00", precoPor: "R$23,00" },

  // VSL do upsell (tela de oferta da avaliação)
  vsl: {
    src: "https://vz-fc9df7e8-845.b-cdn.net/2a5ee7a2-ae5c-4d58-8517-d8129560f54a/playlist.m3u8",
    capa: "",
    autoplayTitulo: "Sua aula já começou",
    autoplayTexto: "Toque para ouvir",
    pitch: 210,                    // 3:30 → evento PitchUpsell no pixel
    cta: 249,                      // 4:09 → aparecem os botões da oferta
    pixelEvento: "PitchUpsell"
  },

  // E-books (o arquivo fica protegido: abre pelo /api/m?a=pdf&id=…)
  metodo: { titulo: "Método Seca Jejum", sub: "Método Seca Jejum Completo", livros: [
    ["SJF-01", "Método Seca Jejum"], ["SJF-02", "Receitas Para Quebrar o Jejum"],
    ["SJF-03", "Protocolo Anti-efeito Sanfona"], ["SJF-04", "Bônus Reset Intestinal 48h"]] },
  cha: { titulo: "Chá Turbo Seca + Bônus", sub: "Plano para emagrecer 10x mais rápido com jejum", livros: [
    ["CTS-01", "Chá Turbo Seca"], ["CTS-02", "Bebidas Anti Fome"], ["CTS-03", "Queima Noturna"],
    ["CTS-04", "Guia do Corpo Leve"], ["CTS-05", "Bônus Libido em Alta"], ["CTS-06", "Bônus 7 Dias Para Secar"],
    ["CTS-07", "Bônus Definição de Metas"], ["CTS-08", "Bônus Antiprocrastinação"]] }
};
