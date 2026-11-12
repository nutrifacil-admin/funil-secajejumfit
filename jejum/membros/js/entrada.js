/* Tela de login da área v2 (entrar.html), cópia da v1 (site-membros/js/entrada.js): envia o e-mail para
   api/login.php, que confere e cria a sessão. O navegador só recebe "pode entrar" ou o motivo do erro. */
(function () {
  'use strict';

  var ICONES = {
    erro:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
    ok:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
  };

  // Textos de cada estado da tela.
  var ESTADOS = {
    normal:          null,
    carregando:      null,
    invalido:        { tipo: 'erro',    icone: 'erro', texto: 'Esse e-mail parece incompleto. Confira se digitou certo (ex.: maria@gmail.com).' },
    // Muita gente compra com um e-mail e tenta entrar com outro: esta mensagem precisa deixar isso claro.
    'nao-encontrado':{ tipo: 'erro destaque', icone: 'erro', texto: function (email) {
      return '<strong class="mensagem-titulo">Não encontramos este e-mail na nossa lista de clientes.</strong>' +
             '<span>Você digitou: <b class="mensagem-email">' + esc(email) + '</b></span>' +
             '<span>Use <b>exatamente o mesmo e-mail que você preencheu na hora da compra</b>. ' +
             'Uma letra diferente ou outro endereço já impedem o acesso.</span>' +
             '<span class="mensagem-dica">💡 Dica: procure na sua caixa de entrada (e no spam) o e-mail de confirmação da sua compra. ' +
             'Ele chegou no endereço certo, é esse que você deve usar aqui.</span>';
    } },
    erro:            { tipo: 'aviso-m', icone: 'erro', texto: 'Não conseguimos verificar seu acesso agora. Tente de novo em alguns instantes.' },
    limite:          { tipo: 'aviso-m', icone: 'erro', texto: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.' },
    sucesso:         { tipo: 'ok',      icone: 'ok',   texto: 'Acesso liberado! Entrando na sua área de membros…' }
  };

  var suporte = document.getElementById('suporte');
  if (suporte && typeof linkSuporteWhatsApp === 'function') suporte.innerHTML = linkSuporteWhatsApp();

  var form = document.getElementById('form-entrada');
  var campo = document.getElementById('email');
  var botao = document.getElementById('botao');
  var msg = document.getElementById('mensagem');

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function mostrar(estado) {
    var e = ESTADOS[estado];
    var ocupado = estado === 'carregando' || estado === 'sucesso';

    campo.disabled = ocupado;
    botao.disabled = ocupado;
    botao.innerHTML = estado === 'carregando'
      ? '<span class="girando" aria-hidden="true"></span>Verificando…'
      : 'Entrar';
    campo.setAttribute('aria-invalid', (estado === 'invalido' || estado === 'nao-encontrado') ? 'true' : 'false');

    if (e) {
      msg.className = 'mensagem ' + e.tipo;
      var texto = typeof e.texto === 'function' ? e.texto(campo.value.trim()) : e.texto;
      msg.innerHTML = ICONES[e.icone] + '<div class="mensagem-corpo">' + texto + '</div>';
      msg.hidden = false;
    } else {
      msg.hidden = true;
      msg.innerHTML = '';
    }
  }

  // Para onde cada destino devolvido pelo servidor leva.
  var DESTINOS = { membros: './', quiz: 'quiz.html' };

  function emailValido(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = campo.value.trim();
    if (!emailValido(email)) { mostrar('invalido'); campo.focus(); return; }
    mostrar('carregando');

    fetch('api/login.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        if (d.ok) {
          mostrar('sucesso');
          if (window.SJ_RASTRO) window.SJ_RASTRO('pos', 'login-ok');
          setTimeout(function () { location.href = DESTINOS[d.destino] || './'; }, 900);
          return;
        }
        var estado = { invalido: 'invalido', nao_encontrado: 'nao-encontrado', limite: 'limite' }[d.erro] || 'erro';
        mostrar(estado);
        if (estado === 'invalido' || estado === 'nao-encontrado') campo.focus();
      })
      .catch(function () { mostrar('erro'); });
  });

  // Ao digitar de novo, some a mensagem de erro.
  campo.addEventListener('input', function () {
    if (campo.getAttribute('aria-invalid') === 'true' || !msg.hidden) mostrar('normal');
  });

})();
