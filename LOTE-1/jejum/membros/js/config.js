/* =====================================================================
   CONFIGURAÇÃO DO SITE — este é o único arquivo que você precisa editar
   ===================================================================== */

// Texto do aviso que aparece ao abrir um módulo bloqueado.
// Pode usar HTML simples (<strong>, <br>, <a href="...">).
var AVISO_BLOQUEIO = {
  titulo: 'Conteúdo bloqueado',
  texto: 'Este conteúdo ainda não está liberado para você.'
};

// Suporte no WhatsApp (aparece no login, em "Meus planos" e nas áreas dos planos; não aparece no quiz nem nos módulos).
// numero: com 55 + DDD, só dígitos. texto: como o número aparece na tela.
var SUPORTE_WHATSAPP = { numero: '5562982393173', texto: '(62) 98239-3173' };

function linkSuporteWhatsApp(classe) {
  return '<a class="suporte-whats ' + (classe || '') + '" href="https://wa.me/' + SUPORTE_WHATSAPP.numero + '" target="_blank" rel="noopener">' +
         '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg>' +
         '<span>Precisa de ajuda? <strong>Suporte no WhatsApp ' + SUPORTE_WHATSAPP.texto + '</strong></span></a>';
}

// Caixa de oferta no topo da área do Chá Turbo Seca, para quem ainda não comprou.
// O botão leva ao checkout do upsell com valor cheio (QUIZ.checkoutUpsell, abaixo).
// Pode usar HTML simples (<strong>, <br>).
var OFERTA_UPSELL = {
  selo: 'Plano bloqueado',
  titulo: 'Você ainda não tem acesso ao Chá Turbo Seca',
  texto: 'Desbloqueie agora as receitas de chás que ativam o <strong>modo de queima de gordura</strong> desde a primeira hora do jejum, junto com os <strong>6 bônus</strong>, e acelere em até 10x os resultados do seu plano.',
  botao: 'Quero desbloquear agora',
  nota: 'Pagamento seguro · Garantia de 30 dias · Acesso liberado aqui assim que o pagamento for aprovado'
};

// Os 2 produtos da página inicial.
var PRODUTOS = [
  {
    id: 'front',
    nome: 'Seca Jejum',
    descricao: 'Seu plano de jejum personalizado'
  },
  {
    id: 'upsell',
    nome: 'Chá Turbo Seca + 6 bônus',
    descricao: 'Seu plano para emagrecer 10x mais rápido com jejum'
  }
];

// Quiz do upsell (/membros/avaliacao).
var QUIZ = {
  checkoutUpsell:   'https://pay.cakto.com.br/35ocedw',   // Chá Turbo Seca (upsell R$47)
  checkoutDownsell: 'https://pay.cakto.com.br/muqb3ft',   // Chá Turbo Seca (downsell R$23)
  // Vídeo da tela de oferta no player próprio (motor.js) e o atraso (em segundos) até aparecerem os botões da oferta.
  vsl: {
    src: 'https://vz-fc9df7e8-845.b-cdn.net/2a5ee7a2-ae5c-4d58-8517-d8129560f54a/playlist.m3u8',
    capa: '',
    cor: '#15a349',
    pitch: 210,
    titulo: 'Sua Aula já começou',
    texto: 'Clique para ouvir',
    pixelEvento: 'PitchUpsell'
  },
  atrasoOfertaSegundos: 249,
  emailSuporte: 'nutrifacilsuporte@gmail.com',
  // Caixa de preço do downsell.
  downsellProduto: 'Chá Turbo Seca + 3 Bônus',
  downsellPrecoDe:  'R$47,00',
  downsellPrecoPor: 'R$23,00'
};
