/* Quiz da área v2 (quiz.html), copiado do quiz do upsell da v1 (site-membros/js/quiz.js) com 3 perguntas novas
   (que horas dorme, saúde, restrição alimentar). As respostas montam a agenda: vão para api/respostas.php logo depois
   da última pergunta, antes da oferta (quem sair na oferta já tem a agenda).
   Dois modos:
   - completo (1º acesso): boas-vindas → perguntas → acelerar → oferta (vídeo) → downsell, como na v1;
   - perguntas (quiz.html?refazer=1, "Refazer meus horários", ou quem entrou sem respostas): só as perguntas,
     já preenchidas com as respostas atuais, sem o break nem as VSLs do upsell; no fim, volta para a agenda.
   Textos e links ficam aqui e em config.js (objeto QUIZ). */
(function () {
  'use strict';

  var NOTA = 'Muita gente marca errado no primeiro teste. Queremos garantir que suas informações estão corretas.';

  var TELAS = [
    { id: 'boas-vindas', tipo: 'boas-vindas' },
    { id: 'apresentacao', tipo: 'apresentacao' },
    { id: 'genero', etapa: 1, tipo: 'opcoes', titulo: 'Qual o seu gênero?', nota: NOTA,
      opcoes: [
        { v: 'homem',  t: 'Homem',  icone: '♂' },
        { v: 'mulher', t: 'Mulher', icone: '♀' }
      ] },
    { id: 'idade',  etapa: 2, tipo: 'barra', titulo: 'Confirme sua idade',  nota: NOTA, min: 18, max: 99,  ini: 18,  unidade: 'anos' },
    { id: 'altura', etapa: 3, tipo: 'regua', titulo: 'Confirme sua altura', nota: NOTA, min: 140, max: 220, ini: 160, unidade: 'cm',   marcaCada: 10 },
    { id: 'peso',   etapa: 4, tipo: 'regua', titulo: 'Confirme seu peso',   nota: NOTA, min: 40, max: 300, ini: 70,  unidade: 'kg',   marcaCada: 10, imc: true },
    { id: 'saude',  etapa: 5, tipo: 'opcoes', titulo: 'Você está em alguma dessas situações?',
      nota: 'Isso deixa o seu jejum mais seguro: nesses casos, o seu plano usa um jejum mais leve.',
      opcoes: [
        { v: 'gravida',     t: 'Estou grávida' },
        { v: 'amamentando', t: 'Estou amamentando' },
        { v: 'diabetes',    t: 'Tenho diabetes e tomo remédio' },
        { v: 'nenhuma',     t: 'Nenhuma dessas' }
      ] },
    { id: 'acorda', etapa: 6, tipo: 'relogio', titulo: 'Que horas você acorda?', ini: 7 },
    { id: 'dorme',  etapa: 7, tipo: 'relogio', titulo: 'Que horas você dorme?',  ini: 23 },
    { id: 'cafe',   etapa: 8, tipo: 'relogio', titulo: 'Que horas você toma café da manhã?', ini: 8,  pular: 'Pulo o café da manhã' },
    { id: 'almoco', etapa: 9, tipo: 'relogio', titulo: 'Que horas você almoça?',             ini: 12, pular: 'Pulo o almoço' },
    { id: 'lanche', etapa: 10, tipo: 'relogio', titulo: 'Que horas você lancha?',            ini: 16, pular: 'Pulo o lanche' },
    { id: 'janta',  etapa: 11, tipo: 'relogio', titulo: 'Que horas você janta?',             ini: 20, pular: 'Pulo a janta' },
    { id: 'restricoes', etapa: 12, tipo: 'multi', titulo: 'Você tem alguma restrição alimentar?',
      nota: 'Pode marcar mais de uma. As receitas do seu plano vão respeitar isso.',
      opcoes: [
        { v: 'lactose',     t: 'Sem lactose' },
        { v: 'gluten',      t: 'Sem glúten' },
        { v: 'vegetariana', t: 'Sou vegetariana(o)' }
      ],
      nenhuma: 'Não tenho restrição' },
    { id: 'fome', etapa: 13, tipo: 'opcoes', titulo: 'Qual horário você sente mais fome?',
      opcoes: [
        { v: 'cafe',   t: 'Café da manhã', icone: '☕' },
        { v: 'almoco', t: 'Almoço',        icone: '🍽️' },
        { v: 'lanche', t: 'Lanche',        icone: '🥪' },
        { v: 'janta',  t: 'Jantar',        icone: '🌙' }
      ] },
    { id: 'acelerar', etapa: 14, tipo: 'acelerar', titulo: 'Você gostaria de acelerar em 10x a sua queima de gordura com o Jejum?',
      opcoes: [
        { v: 'com-certeza', t: 'Com certeza!!' },
        { v: 'sim',         t: 'Sim!' },
        { v: 'saber-mais',  t: 'Gostaria de saber mais…' }
      ] },
    { id: 'oferta', etapa: 15, tipo: 'oferta' },
    { id: 'downsell', tipo: 'downsell' }
  ];
  var TOTAL_ETAPAS = 15;
  var CHAVE = 'quizSJTv2';
  var ULTIMA_PERGUNTA = 'fome';     // depois dela, as respostas vão para o servidor

  // Modo "só as perguntas": tira as boas-vindas, o break e o upsell; entra uma abertura e um fim próprios.
  var MODO = 'completo';
  function modoPerguntas(motivo) {
    MODO = 'perguntas';
    var perguntas = TELAS.filter(function (t) { return t.etapa && ['acelerar', 'oferta'].indexOf(t.tipo) < 0; });
    TELAS = [{ id: 'abertura', tipo: 'abertura', motivo: motivo }].concat(perguntas, [{ id: 'fim', tipo: 'fim' }]);
    TOTAL_ETAPAS = perguntas.length;
  }

  var el = {
    quiz: document.getElementById('quiz'),
    voltar: document.getElementById('quiz-voltar'),
    progresso: document.getElementById('quiz-progresso'),
    barra: document.getElementById('quiz-barra-cheia'),
    etapa: document.getElementById('quiz-etapa')
  };

  var estado = { passo: 0, respostas: {} };
  function retomar() {   // só o modo completo retoma do ponto onde parou (o de perguntas começa das respostas salvas)
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (salvo && typeof salvo.passo === 'number' && salvo.respostas) estado = salvo;
    } catch (e) { /* sem armazenamento: começa do zero */ }
  }
  function salvar() { if (MODO === 'completo') try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {} }

  /* ---------- Respostas no servidor (montam a agenda) ----------
     Manda só os campos do quiz; quem identifica a pessoa é o cookie. O servidor confere cada campo. */
  var CAMPOS = ['genero', 'idade', 'altura', 'peso', 'saude', 'acorda', 'dorme', 'cafe', 'almoco', 'lanche', 'janta', 'restricoes', 'fome'];
  var pausaFdsAtual = false;      // a pausa do fim de semana é um botão da agenda: refazer o quiz não mexe nela
  function enviarRespostas() {
    var r = { pausaFds: pausaFdsAtual };
    CAMPOS.forEach(function (k) { if (estado.respostas[k] != null) r[k] = estado.respostas[k]; });
    if (!r.restricoes) r.restricoes = [];
    return fetch('api/respostas.php', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ respostas: r })
    }).then(function (x) { return x.status; }).catch(function () { return 0; });   // 200 = gravou; 400 = recusou; 0 = sem internet
  }

  /* ---------- Fim do funil ----------
     Avisa o servidor que a pessoa deu a resposta final da oferta (api/concluir-funil.php).
     Quem identifica a pessoa é o cookie; o e-mail nunca é enviado daqui.
     Se o servidor não responder, a pessoa segue mesmo assim (nunca trava o comprador). */
  function concluirFunil() {
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    var espera = new Promise(function (ok) { setTimeout(ok, 4000); });
    var pedido = fetch('api/concluir-funil.php', { method: 'POST', credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false }; });
    return Promise.race([pedido, espera]);
  }

  /* ---------- Painel de retenção ----------
     Conta cada tela do 1º acesso (o "Refazer meus horários" não entra na conta). */
  function rastro(passo) { if (MODO === 'completo' && window.SJ_RASTRO) window.SJ_RASTRO('pos', passo); }
  window.addEventListener('vsl:pitch', function () { rastro('oferta-pitch'); });
  window.addEventListener('vsl:cta', function () { rastro('oferta-cta'); });

  /* ---------- Navegação ---------- */
  function irPara(i) {
    estado.passo = Math.max(0, Math.min(TELAS.length - 1, i));
    salvar();
    desenhar();
    window.scrollTo(0, 0);
  }
  function avancar() {
    var t = TELAS[estado.passo];
    // Modo completo: depois da última pergunta grava e segue para a oferta mesmo se falhar
    // (sem respostas, a área manda a pessoa responder de novo). No modo perguntas, quem grava é a tela de fim.
    if (t.id === ULTIMA_PERGUNTA && MODO === 'completo') { enviarRespostas().then(function () { irPara(estado.passo + 1); }); return; }
    irPara(estado.passo + 1);
  }
  el.voltar.addEventListener('click', function () { irPara(estado.passo - 1); });

  function hh(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function desenhar() {
    var t = TELAS[estado.passo];
    el.voltar.hidden = (t.tipo === 'boas-vindas' || t.tipo === 'downsell' || t.tipo === 'abertura' || t.tipo === 'fim');
    el.progresso.hidden = !t.etapa;
    if (t.etapa) {
      var n = MODO === 'perguntas' ? estado.passo : t.etapa;     // no modo perguntas a numeração é a da lista curta
      el.barra.style.width = (n / TOTAL_ETAPAS * 100) + '%';
      el.etapa.textContent = n + ' de ' + TOTAL_ETAPAS;
    }
    document.body.classList.toggle('quiz-modo-downsell', t.tipo === 'downsell');
    rastro(t.id);
    ({
      'boas-vindas': telaBoasVindas,
      'apresentacao': telaApresentacao,
      'opcoes': telaOpcoes,
      'multi': telaMulti,
      'abertura': telaAbertura,
      'fim': telaFim,
      'regua': telaRegua,
      'barra': telaBarra,
      'relogio': telaRelogio,
      'acelerar': telaAcelerar,
      'oferta': telaOferta,
      'downsell': telaDownsell
    })[t.tipo](t);
  }

  function nota(t) { return t.nota ? '<p class="quiz-nota">' + t.nota + '</p>' : ''; }

  /* ---------- Telas ---------- */
  function telaBoasVindas() {
    el.quiz.innerHTML =
      '<section class="quiz-tela quiz-centro">' +
        '<img class="quiz-capa" src="assets/quiz/plano-personalizado.jpg" width="512" height="512" alt="Seu plano de jejum personalizado">' +
        '<h1 class="quiz-titulo">Seja bem-vindo(a)!!</h1>' +
        '<h2 class="quiz-subtitulo">Faça sua avaliação física</h2>' +
        '<p class="quiz-texto">Precisamos apenas confirmar mais algumas informações para <strong>personalizar ainda mais o seu plano de jejum.</strong> Leva 1 minuto e ele é gerado imediatamente!</p>' +
        '<button class="btn quiz-btn" type="button" data-acao="avancar">Fazer minha avaliação</button>' +
      '</section>';
    ligarAvancar();
  }

  function telaApresentacao() {
    el.quiz.innerHTML =
      '<section class="quiz-tela quiz-centro">' +
       '<div class="quiz-card">' +
        '<span class="quiz-etiqueta">⚡ 12 etapas rápidas</span>' +
        '<h1 class="quiz-titulo">Avaliação Física Seca Jejum</h1>' +
        '<p class="quiz-texto">Responda com atenção. É a partir dessas respostas que vamos terminar de personalizar seu plano.</p>' +
        '<ul class="quiz-passos" aria-hidden="true">' +
          '<li><span>📏</span>Corpo</li><li><span>⏰</span>Rotina</li><li><span>🔥</span>Seu plano</li>' +
        '</ul>' +
        '<button class="btn quiz-btn" type="button" data-acao="avancar">Começar</button>' +
       '</div>' +
      '</section>';
    ligarAvancar();
  }

  // Abertura do modo perguntas
  function telaAbertura(t) {
    var refazer = t.motivo === 'refazer';
    el.quiz.innerHTML =
      '<section class="quiz-tela quiz-centro">' +
       '<div class="quiz-card">' +
        '<h1 class="quiz-titulo">' + (refazer ? 'Refazer meus horários' : 'Falta pouco para o seu plano') + '</h1>' +
        '<p class="quiz-texto">' + (refazer
          ? 'Confirme as suas respostas e mude o que for preciso. <strong>A sua agenda de jejum vai ser refeita com os novos horários.</strong>'
          : 'Responda algumas perguntas rápidas para <strong>montarmos a sua agenda de jejum.</strong>') + '</p>' +
        '<button class="btn quiz-btn" type="button" data-acao="avancar">Começar</button>' +
        (refazer ? '<a class="quiz-pular" href="./">Cancelar e voltar</a>' : '') +
       '</div>' +
      '</section>';
    ligarAvancar();
  }

  // Fim do modo perguntas: grava e leva para a agenda
  function telaFim() {
    el.quiz.innerHTML =
      '<section class="quiz-tela quiz-centro"><div class="quiz-card">' +
        '<h1 class="quiz-titulo">Montando a sua agenda…</h1>' +
        '<p class="gerando"><span class="gerando-ponto"></span>salvando os seus horários…</p>' +
      '</div></section>';
    enviarRespostas().then(function (status) {
      if (status === 200) {
        el.quiz.innerHTML =
          '<section class="quiz-tela quiz-centro"><div class="quiz-card">' +
            '<h1 class="quiz-titulo">Pronto! Sua agenda foi atualizada</h1>' +
            '<p class="quiz-texto">Os seus horários de jejum e das refeições já estão no seu plano.</p>' +
            '<a class="btn quiz-btn" href="agenda.html">Ver minha agenda</a>' +
          '</div></section>';
        return;
      }
      if (status === 400) {   // o servidor recusou: quase sempre acordar e dormir quase na mesma hora
        el.quiz.innerHTML =
          '<section class="quiz-tela quiz-centro"><div class="quiz-card">' +
            '<h1 class="quiz-titulo">Confira os seus horários</h1>' +
            '<p class="quiz-texto">O horário de acordar e o de dormir ficaram muito perto um do outro. Volte e confira.</p>' +
            '<button class="btn quiz-btn" type="button" id="conferir">Conferir os horários</button>' +
          '</div></section>';
        document.getElementById('conferir').addEventListener('click', function () {
          irPara(TELAS.map(function (t) { return t.id; }).indexOf('acorda'));
        });
        return;
      }
      el.quiz.innerHTML =
        '<section class="quiz-tela quiz-centro"><div class="quiz-card">' +
          '<h1 class="quiz-titulo">Não conseguimos salvar agora</h1>' +
          '<p class="quiz-texto">Verifique a sua internet e tente de novo. As suas respostas continuam aqui.</p>' +
          '<button class="btn quiz-btn" type="button" id="tentar">Tentar de novo</button>' +
        '</div></section>';
      document.getElementById('tentar').addEventListener('click', telaFim);
    });
  }

  // Várias opções (restrição alimentar): marca e desmarca; "não tenho" limpa as outras
  function telaMulti(t) {
    var marcadas = Array.isArray(estado.respostas[t.id]) ? estado.respostas[t.id].slice() : [];
    var nenhuma = Array.isArray(estado.respostas[t.id]) && marcadas.length === 0;
    function desenharMulti() {
      el.quiz.innerHTML =
        '<section class="quiz-tela">' +
          '<h1 class="quiz-titulo">' + t.titulo + '</h1>' +
          '<div class="quiz-opcoes">' +
          t.opcoes.map(function (o) {
            return '<button type="button" class="quiz-opcao' + (marcadas.indexOf(o.v) >= 0 ? ' marcada' : '') + '" data-v="' + o.v + '"><span>' + o.t + '</span></button>';
          }).join('') +
          '<button type="button" class="quiz-opcao' + (nenhuma ? ' marcada' : '') + '" data-v=""><span>' + t.nenhuma + '</span></button>' +
          '</div>' +
          '<button class="btn quiz-btn" type="button" id="continuar"' + (marcadas.length || nenhuma ? '' : ' disabled') + '>Continuar</button>' +
          nota(t) +
        '</section>';
      Array.prototype.forEach.call(el.quiz.querySelectorAll('.quiz-opcao'), function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-v');
          if (!v) { marcadas = []; nenhuma = true; }
          else {
            nenhuma = false;
            var i = marcadas.indexOf(v);
            if (i >= 0) marcadas.splice(i, 1); else marcadas.push(v);
          }
          desenharMulti();
        });
      });
      document.getElementById('continuar').addEventListener('click', function () {
        estado.respostas[t.id] = marcadas; salvar(); avancar();
      });
    }
    desenharMulti();
  }

  function ligarAvancar() {
    var b = el.quiz.querySelector('[data-acao="avancar"]');
    if (b) b.addEventListener('click', avancar);
  }

  function telaOpcoes(t) {
    var atual = estado.respostas[t.id];
    el.quiz.innerHTML =
      '<section class="quiz-tela">' +
        '<h1 class="quiz-titulo">' + t.titulo + '</h1>' +
        '<div class="quiz-opcoes' + (t.opcoes.length === 2 ? ' duas' : '') + '">' +
        t.opcoes.map(function (o) {
          return '<button type="button" class="quiz-opcao' + (atual === o.v ? ' marcada' : '') + '" data-v="' + o.v + '">' +
                   (o.icone ? '<span class="quiz-opcao-icone" aria-hidden="true">' + o.icone + '</span>' : '') +
                   '<span>' + o.t + '</span>' +
                 '</button>';
        }).join('') +
        '</div>' + nota(t) +
      '</section>';
    ligarOpcoes(t);
  }

  function ligarOpcoes(t) {
    Array.prototype.forEach.call(el.quiz.querySelectorAll('.quiz-opcao'), function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(el.quiz.querySelectorAll('.quiz-opcao'), function (x) { x.classList.remove('marcada'); });
        b.classList.add('marcada');
        estado.respostas[t.id] = b.getAttribute('data-v');
        salvar();
        setTimeout(avancar, 280);
      });
    });
  }

  /* ---------- Régua (idade, altura, peso) ---------- */
  var PASSO_PX = 14;

  function telaRegua(t) {
    var v = estado.respostas[t.id] != null ? estado.respostas[t.id] : t.ini;
    var marcas = '';
    for (var n = t.min; n <= t.max; n++) {
      var grande = n % t.marcaCada === 0;
      marcas += '<span class="regua-marca' + (grande ? ' grande' : (n % 5 === 0 ? ' media' : '')) + '">' + (grande ? '<b>' + n + '</b>' : '') + '</span>';
    }
    el.quiz.innerHTML =
      '<section class="quiz-tela">' +
        '<h1 class="quiz-titulo">' + t.titulo + '</h1>' +
        '<div class="regua">' +
          '<div class="regua-valor">' +
            '<button type="button" class="regua-mais-menos" data-d="-1" aria-label="Diminuir">−</button>' +
            '<output id="regua-num" aria-live="polite"></output>' +
            '<button type="button" class="regua-mais-menos" data-d="1" aria-label="Aumentar">+</button>' +
          '</div>' +
          (t.imc ? '<div id="imc" class="imc"></div>' : '') +
          '<div class="regua-moldura">' +
            '<div class="regua-trilho" tabindex="0" role="slider" aria-label="' + t.titulo + '" aria-valuemin="' + t.min + '" aria-valuemax="' + t.max + '">' +
              '<div class="regua-faixa">' + marcas + '</div>' +
            '</div>' +
            '<div class="regua-ponteiro"></div>' +
          '</div>' +
          '<p class="regua-dica">← Arraste a régua para ajustar →</p>' +
        '</div>' +
        '<button class="btn quiz-btn" type="button" id="continuar">Continuar</button>' +
        nota(t) +
      '</section>';

    var trilho = el.quiz.querySelector('.regua-trilho');
    var saida = document.getElementById('regua-num');
    var imc = document.getElementById('imc');
    var valor = v, timerFim = null, arrastando = false;

    function mostrar() {
      saida.innerHTML = valor + '<small>' + t.unidade + '</small>';
      trilho.setAttribute('aria-valuenow', valor);
      if (imc) {
        var alt = (estado.respostas.altura || 160) / 100;
        var i = valor / (alt * alt);
        var cat = i < 18.5 ? ['Abaixo do peso', 'baixo'] : i < 25 ? ['Peso normal', 'ok'] : i < 30 ? ['Sobrepeso', 'atencao'] : ['Obesidade', 'alto'];
        imc.className = 'imc ' + cat[1];
        imc.innerHTML = 'Seu IMC: <strong>' + i.toFixed(1).replace('.', ',') + '</strong> · ' + cat[0];
      }
    }
    function posicionar(suave) {
      trilho.scrollTo({ left: (valor - t.min) * PASSO_PX, behavior: suave ? 'smooth' : 'auto' });
    }
    function definir(novo, suave) {
      valor = Math.max(t.min, Math.min(t.max, novo));
      mostrar(); posicionar(suave);
    }
    trilho.addEventListener('scroll', function () {
      var novo = Math.max(t.min, Math.min(t.max, t.min + Math.round(trilho.scrollLeft / PASSO_PX)));
      if (novo !== valor) { valor = novo; mostrar(); }
      clearTimeout(timerFim);
      if (!arrastando) timerFim = setTimeout(function () { posicionar(true); }, 140); // encaixa na marca
    });
    // Arrastar com o mouse (no celular o próprio dedo já rola a régua).
    var inicioX = 0, inicioScroll = 0;
    trilho.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      arrastando = true; inicioX = e.clientX; inicioScroll = trilho.scrollLeft;
      trilho.setPointerCapture(e.pointerId); trilho.classList.add('arrastando');
    });
    trilho.addEventListener('pointermove', function (e) {
      if (arrastando) trilho.scrollLeft = inicioScroll - (e.clientX - inicioX);
    });
    function soltar() {
      if (!arrastando) return;
      arrastando = false; trilho.classList.remove('arrastando'); posicionar(true);
    }
    trilho.addEventListener('pointerup', soltar);
    trilho.addEventListener('pointercancel', soltar);
    trilho.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { definir(valor - 1, true); e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { definir(valor + 1, true); e.preventDefault(); }
    });
    Array.prototype.forEach.call(el.quiz.querySelectorAll('.regua-mais-menos'), function (b) {
      b.addEventListener('click', function () { definir(valor + Number(b.getAttribute('data-d')), true); });
    });
    document.getElementById('continuar').addEventListener('click', function () {
      estado.respostas[t.id] = valor; salvar(); avancar();
    });
    mostrar();
    requestAnimationFrame(function () { posicionar(false); });
  }

  /* ---------- Barra simples (idade) ---------- */
  function telaBarra(t) {
    var v = estado.respostas[t.id] != null ? estado.respostas[t.id] : t.ini;
    el.quiz.innerHTML =
      '<section class="quiz-tela">' +
        '<h1 class="quiz-titulo">' + t.titulo + '</h1>' +
        '<div class="barra">' +
          '<output id="barra-num" class="barra-valor" aria-live="polite"></output>' +
          '<input id="barra-input" class="barra-input" type="range" min="' + t.min + '" max="' + t.max + '" step="1" value="' + v + '" aria-label="' + t.titulo + '">' +
          '<div class="barra-limites"><span>' + t.min + '</span><span>' + t.max + '</span></div>' +
        '</div>' +
        '<button class="btn quiz-btn" type="button" id="continuar">Continuar</button>' +
        nota(t) +
      '</section>';
    var input = document.getElementById('barra-input'), saida = document.getElementById('barra-num');
    function mostrar() {
      saida.innerHTML = input.value + '<small>' + t.unidade + '</small>';
      input.style.setProperty('--cheio', ((input.value - t.min) / (t.max - t.min) * 100) + '%');
    }
    input.addEventListener('input', mostrar);
    document.getElementById('continuar').addEventListener('click', function () {
      estado.respostas[t.id] = Number(input.value); salvar(); avancar();
    });
    mostrar();
  }

  /* ---------- Relógio de 24 horas ---------- */
  var PASSO_MIN = 30;

  function periodo(min) {
    var h = min / 60;
    if (h < 5)  return { icone: '🌙', nome: 'Madrugada' };
    if (h < 12) return { icone: '🌅', nome: 'Manhã' };
    if (h < 18) return { icone: '☀️', nome: 'Tarde' };
    return { icone: '🌙', nome: 'Noite' };
  }

  function telaRelogio(t) {
    var r = estado.respostas[t.id];
    var v = (typeof r === 'number') ? r : t.ini * 60;
    var C = 150, R_ANEL = 133, R_NUM = 98;
    var svg = '';
    for (var h = 0; h < 24; h++) {
      var a = h / 24 * 2 * Math.PI;
      var principal = h % 3 === 0;
      var x1 = C + Math.sin(a) * 114, y1 = C - Math.cos(a) * 114;
      var x2 = C + Math.sin(a) * (principal ? 106 : 109), y2 = C - Math.cos(a) * (principal ? 106 : 109);
      svg += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="relogio-traco' + (principal ? ' forte' : '') + '"/>';
      if (principal) {
        svg += '<text x="' + (C + Math.sin(a) * R_NUM).toFixed(1) + '" y="' + (C - Math.cos(a) * R_NUM).toFixed(1) + '" class="relogio-num">' + h + 'h</text>';
      }
    }
    el.quiz.innerHTML =
      '<section class="quiz-tela">' +
        '<h1 class="quiz-titulo">' + t.titulo + '</h1>' +
        '<div class="relogio" role="slider" tabindex="0" aria-label="' + t.titulo + '">' +
          '<div class="relogio-anel"></div>' +
          '<svg viewBox="0 0 300 300" aria-hidden="true">' + svg +
            '<line id="ponteiro" x1="150" y1="150" x2="150" y2="17" class="relogio-ponteiro"/>' +
            '<circle id="botao-relogio" cx="150" cy="17" r="15" class="relogio-botao"/>' +
          '</svg>' +
          '<div class="relogio-centro">' +
            '<span id="rel-icone" class="relogio-icone"></span>' +
            '<output id="rel-hora" class="relogio-hora"></output>' +
            '<span id="rel-periodo" class="relogio-periodo"></span>' +
          '</div>' +
        '</div>' +
        '<div class="relogio-ajuste">' +
          '<button type="button" class="regua-mais-menos" data-d="-' + PASSO_MIN + '" aria-label="Menos 30 minutos">−</button>' +
          '<span>Gire o ponteiro ou use − / +</span>' +
          '<button type="button" class="regua-mais-menos" data-d="' + PASSO_MIN + '" aria-label="Mais 30 minutos">+</button>' +
        '</div>' +
        '<button class="btn quiz-btn" type="button" id="continuar">Continuar</button>' +
        (t.pular ? '<button class="quiz-pular' + (r === 'pula' ? ' marcada' : '') + '" type="button" id="pular">' + t.pular + '</button>' : '') +
        nota(t) +
      '</section>';

    var relogio = el.quiz.querySelector('.relogio');
    var valor = v;

    function mostrar() {
      var a = valor / 1440 * 2 * Math.PI;
      var x = C + Math.sin(a) * R_ANEL, y = C - Math.cos(a) * R_ANEL;
      var bot = document.getElementById('botao-relogio'), pont = document.getElementById('ponteiro');
      bot.setAttribute('cx', x.toFixed(1)); bot.setAttribute('cy', y.toFixed(1));
      pont.setAttribute('x2', x.toFixed(1)); pont.setAttribute('y2', y.toFixed(1));
      // O ponteiro começa fora da área do horário, para não passar por cima do texto.
      pont.setAttribute('x1', (C + Math.sin(a) * 82).toFixed(1)); pont.setAttribute('y1', (C - Math.cos(a) * 82).toFixed(1));
      var p = periodo(valor);
      document.getElementById('rel-hora').textContent = hh(valor);
      document.getElementById('rel-icone').textContent = p.icone;
      document.getElementById('rel-periodo').textContent = p.nome;
      relogio.setAttribute('aria-valuetext', hh(valor));
    }
    function definir(novo) { valor = ((novo % 1440) + 1440) % 1440; mostrar(); }
    function pelaPosicao(e) {
      var caixa = relogio.getBoundingClientRect();
      var dx = e.clientX - (caixa.left + caixa.width / 2), dy = e.clientY - (caixa.top + caixa.height / 2);
      var graus = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
      definir(Math.round(graus / 360 * 1440 / PASSO_MIN) * PASSO_MIN);
    }
    var rodando = false;
    relogio.addEventListener('pointerdown', function (e) {
      rodando = true; relogio.setPointerCapture(e.pointerId); relogio.classList.add('rodando'); pelaPosicao(e); e.preventDefault();
    });
    relogio.addEventListener('pointermove', function (e) { if (rodando) pelaPosicao(e); });
    function parar() { rodando = false; relogio.classList.remove('rodando'); }
    relogio.addEventListener('pointerup', parar);
    relogio.addEventListener('pointercancel', parar);
    relogio.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { definir(valor - PASSO_MIN); e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { definir(valor + PASSO_MIN); e.preventDefault(); }
    });
    Array.prototype.forEach.call(el.quiz.querySelectorAll('.relogio-ajuste .regua-mais-menos'), function (b) {
      b.addEventListener('click', function () { definir(valor + Number(b.getAttribute('data-d'))); });
    });
    document.getElementById('continuar').addEventListener('click', function () {
      estado.respostas[t.id] = valor; salvar(); avancar();
    });
    var pular = document.getElementById('pular');
    if (pular) pular.addEventListener('click', function () {
      pular.classList.add('marcada');
      estado.respostas[t.id] = 'pula'; salvar(); setTimeout(avancar, 250);
    });
    mostrar();
  }

  /* ---------- Etapa 11 ---------- */
  function telaAcelerar(t) {
    el.quiz.innerHTML =
      '<section class="quiz-tela">' +
        '<h1 class="quiz-titulo">' + t.titulo + '</h1>' +
        '<img class="quiz-imagem" src="assets/quiz/queima.jpg" width="720" height="720" alt="">' +
        '<p class="quiz-texto">De acordo com as suas respostas, identificamos que sua <strong>janela metabólica de jejum</strong> pode acelerar em até <strong class="destaque-amarelo">10x</strong> o seu emagrecimento.</p>' +
        '<div class="quiz-opcoes">' +
        t.opcoes.map(function (o) {
          return '<button type="button" class="quiz-opcao' + (estado.respostas[t.id] === o.v ? ' marcada' : '') + '" data-v="' + o.v + '"><span>' + o.t + '</span></button>';
        }).join('') +
        '</div>' +
      '</section>';
    ligarOpcoes(t);
  }

  /* ---------- Etapa 12: processando + vídeo + oferta ---------- */
  function garantia() {
    return '<div class="garantia">' +
             '<img src="assets/quiz/selo-garantia.png" width="194" height="194" alt="Selo de garantia de 30 dias">' +
             '<h3>30 dias de GARANTIA</h3>' +
             '<p>Se não atender às suas expectativas nos primeiros 30 dias após a compra, <strong>reembolsaremos 100% do valor pago, sem fazer perguntas.</strong></p>' +
             '<p>E você ainda poderá ficar com todo o material <strong>de graça.</strong></p>' +
             '<p>Basta enviar um e-mail para o suporte em: <strong>' + QUIZ.emailSuporte + '</strong></p>' +
           '</div>';
  }

  function irCheckout(url) {
    rastro(url === QUIZ.checkoutUpsell ? 'oferta-quero' : 'downsell-quero');
    try { if (window.fbq) fbq('track', 'InitiateCheckout'); } catch (e) {}
    concluirFunil().then(function () { location.href = url; });
  }

  function telaOferta() {
    el.quiz.innerHTML =
      '<section class="quiz-tela quiz-oferta">' +
        '<h1 class="quiz-titulo">Processando a sua avaliação física…</h1>' +
        '<p class="gerando"><span class="gerando-ponto"></span>gerando seu plano…</p>' +
        '<div class="chamada-video">' +
          '<span class="quiz-subtitulo">Enquanto isso,</span>' +
          '<h2><mark>Assista a primeira aula do Seca Jejum</mark></h2>' +
        '</div>' +
        '<div class="video"></div>' +
        '<div class="esconder">' +
          '<div class="oferta-botoes">' +
            '<button type="button" class="btn-oferta" id="quero">QUERO EMAGRECER 10X MAIS RÁPIDO</button>' +
            '<button type="button" class="btn-recusa" id="nao-quero">Não quero</button>' +
          '</div>' +
          garantia() +
        '</div>' +
      '</section>';

    document.getElementById('quero').addEventListener('click', function () { irCheckout(QUIZ.checkoutUpsell); });
    document.getElementById('nao-quero').addEventListener('click', function () { irPara(TELAS.length - 1); });
    ligarVideo();
  }

  // Vídeo (player próprio do site, motor.js) + atraso dos botões: no tempo do atraso o player põe "vsl-cta" no body e
  // mostra tudo com a classe esconder (e lembra para quem volta). Se o vídeo não carregar (bloqueador, internet ruim),
  // os botões aparecem no mesmo tempo do mesmo jeito, para ninguém ficar preso.
  var vsl = { liberada: false, abertoEm: 0, timer: null };

  function ligarVideo() {
    var caixa = el.quiz.querySelector('.video');
    var bloco = el.quiz.querySelector('.esconder');
    if (!vsl.abertoEm) vsl.abertoEm = Date.now();
    var v = QUIZ.vsl;
    window.SJ_AVANCAR = function () {};
    window.SJ_CFG = { cor: v.cor, texto: '#ffffff', vsl: { id: 'upsell', src: v.src, capa: v.capa, pitch: v.pitch, cta: QUIZ.atrasoOfertaSegundos,
      autoplayTitulo: v.titulo, autoplayTexto: v.texto, pixelEvento: v.pixelEvento } };
    window.SJ_TELAS = window.SJ_TELAS || {};
    window.SJ_TELAS.UP = [{ tipo: 'video' }];
    caixa.innerHTML = '<div class="sj-tela3" data-tela="UP"></div>';
    if (window.__SJ3) window.__SJ3();

    // Se os botões já tinham aparecido antes, aparecem de novo na hora.
    if (vsl.liberada) bloco.style.display = 'block';

    clearInterval(vsl.timer);
    vsl.timer = setInterval(function () {
      var b = el.quiz.querySelector('.esconder');
      if (!b || TELAS[estado.passo].tipo !== 'oferta') { clearInterval(vsl.timer); return; }
      if (document.body.classList.contains('vsl-cta') || getComputedStyle(b).display !== 'none') { b.style.display = 'block'; vsl.liberada = true; clearInterval(vsl.timer); return; }
      var video = el.quiz.querySelector('.video video'), tocou = video && video.currentTime > 0;
      if (!tocou && Date.now() - vsl.abertoEm > QUIZ.atrasoOfertaSegundos * 1000) {
        b.style.display = 'block'; vsl.liberada = true; clearInterval(vsl.timer);
      }
    }, 1000);
  }

  /* ---------- Downsell ---------- */
  function telaDownsell() {
    var itens = [
      ['🔥', 'Chá Turbo Seca', 'Receitas de chás naturais, com ingredientes que provavelmente você já tem em casa, que ativam o modo de queima de gordura desde a primeira hora do jejum. É como apertar o botão do modo turbo do corpo.'],
      ['🥤', 'Bebidas Anti Fome', 'Receitas de bebidas naturais para consumir antes do jejum, junto com a última refeição, que ajudam a manter a energia elevada durante todo o jejum e a reduzir significativamente a sensação de fome.'],
      ['🌙', 'Protocolo Queima Noturna', 'Uma rotina simples de 5 minutos, antes de dormir, que ativa o metabolismo para que seu corpo continue queimando gordura mesmo enquanto você dorme.'],
      ['🌞', 'Guia do Corpo Leve', 'Uma rotina matinal de apenas 5 minutos que ativa a circulação, a mobilidade, a energia e melhora o humor logo ao acordar.']
    ];
    el.quiz.innerHTML =
      '<div class="alerta-downsell">🚨 Última chance! Não perca essa oferta especial!</div>' +
      '<section class="quiz-tela quiz-downsell">' +
        '<h1 class="quiz-titulo">Eu acabei de liberar <mark>50% de DESCONTO</mark> pra você no Chá Turbo Seca + Bônus!</h1>' +
        '<h2 class="quiz-subtitulo">Você recebe acesso imediato a:</h2>' +
        '<div class="entregaveis">' +
        itens.map(function (i) {
          return '<div class="entregavel"><span class="entregavel-icone" aria-hidden="true">' + i[0] + '</span><h3>' + i[1] + '</h3><p>' + i[2] + '</p></div>';
        }).join('') +
        '</div>' +
        '<div class="preco">' +
          '<div class="preco-faixa">50% de desconto! SOMENTE NESSA PÁGINA!!</div>' +
          '<div class="preco-corpo">' +
            '<strong class="preco-produto">' + QUIZ.downsellProduto + '</strong>' +
            '<div class="preco-valor"><s>De ' + QUIZ.downsellPrecoDe + '</s> por<strong>' + QUIZ.downsellPrecoPor + '</strong></div>' +
          '</div>' +
        '</div>' +
        '<ul class="selos">' +
          '<li><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><span>Compra<br><b>SEGURA</b></span></li>' +
          '<li><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1 9 4H5v4l-3 3 3 3v4h4l3 3 3-3h4v-4l3-3-3-3V4h-4l-3-3zm-1 15-4-4 1.4-1.4 2.6 2.6 5.6-5.6L18 9l-7 7z"/></svg><span>Satisfação<br><b>GARANTIDA</b></span></li>' +
          '<li><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z"/></svg><span>Privacidade<br><b>PROTEGIDA</b></span></li>' +
        '</ul>' +
        '<div class="oferta-botoes">' +
          '<button type="button" class="btn-oferta" id="quero">QUERO DESBLOQUEAR TUDO COM 50% OFF</button>' +
          '<button type="button" class="btn-recusa" id="nao-quero">Não quero essa última oportunidade</button>' +
        '</div>' +
        garantia() +
      '</section>';

    document.getElementById('quero').addEventListener('click', function () { irCheckout(QUIZ.checkoutDownsell); });
    document.getElementById('nao-quero').addEventListener('click', function () {
      rastro('downsell-nao');
      concluirFunil().then(function () { location.href = './'; });
    });
  }

  // Quem entra em cada modo:
  // - ?refazer=1 ("Refazer meus horários"): só as perguntas, com as respostas atuais;
  // - quem ainda não concluiu o funil e não tem o upsell: o quiz completo, como na v1;
  // - quem já concluiu (ou tem o upsell) mas não tem respostas salvas: só as perguntas (a agenda precisa delas);
  // - quem já concluiu e tem respostas: vai para a área. Sem login: vai ao login.
  function pegar(url, padrao) {
    return fetch(url, { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : padrao; })
      .catch(function () { return padrao; });
  }
  Promise.all([pegar('api/estado.php', { destino: 'login' }), pegar('api/respostas.php', { erro: true })])
    .then(function (x) {
      var s = x[0], salvas = x[1].respostas || null;
      if (s.destino === 'login') { location.replace('entrar.html'); return; }
      // Falha ao ler as respostas: não abre as perguntas vazias (gravaria por cima das que existem)
      if (x[1].erro && s.destino !== 'quiz') {
        el.quiz.innerHTML = '<section class="quiz-tela quiz-centro"><div class="quiz-card">' +
          '<h1 class="quiz-titulo">Não conseguimos carregar agora</h1>' +
          '<p class="quiz-texto">Verifique a sua internet e recarregue a página.</p></div></section>';
        return;
      }
      if (salvas) { pausaFdsAtual = salvas.pausaFds === true; estado.respostas = Object.assign({}, salvas); }
      var refazer = new URLSearchParams(location.search).get('refazer') === '1';
      if (refazer) modoPerguntas('refazer');
      else if (s.destino === 'quiz') retomar();
      else if (!salvas) modoPerguntas('faltam');
      else { location.replace('./'); return; }
      desenhar();
    });
})();
