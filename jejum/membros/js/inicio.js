// Tela inicial da área v2 (3 cartões) + lista de e-books de cada área + leitura do e-book (mesmo padrão da v1).
// Os e-books são os da v1 (js/modulos.js, copiado de site-membros) e vêm por api/arquivo.php, que confere o login no servidor.
// As respostas do quiz (api/respostas.php) dão o status da agenda; "comprou o upsell" vem de api/estado.php.
(function () {
  const P = window.Plano, ic = window.ic;
  const CHECKOUT_UPSELL = 'https://pay.cakto.com.br/35ocedw'; // o mesmo de site-membros/js/config.js

  // As 2 áreas de conteúdo. Método: e-books de jejum da v1, menos o "Seu Plano Personalizado" (agora é a agenda);
  // o Reset Intestinal 48h fica como presente extra (Marx, 27/10). Chá: o upsell inteiro, como na v1.
  const AREAS = {
    metodo: {
      produto: 'front', nome: 'Método Seca Jejum', descricao: 'Método Seca Jejum Completo',
      modulos: ['01-metodo-seca-jejum', '03-receitas-para-quebrar-o-jejum', '04-protocolo-anti-efeito-sanfona', '05-bonus-reset-intestinal-48h']
    },
    cha: {
      produto: 'upsell', nome: 'Chá Turbo Seca + Bônus', descricao: 'Plano para emagrecer 10x mais rápido com jejum',
      modulos: null
    }
  };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = document.getElementById('app');
  const param = n => new URLSearchParams(location.search).get(n);
  let estado = { upsell: false }, respostas = null;   // preenchidos na abertura (fim do arquivo)
  const liberado = chave => chave === 'metodo' || estado.upsell === true;
  const pegar = (url, padrao) => fetch(url, { credentials: 'same-origin', cache: 'no-store' })
    .then(r => (r.ok ? r.json() : padrao)).catch(() => padrao);
  const postar = (url, corpo) => fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });

  function modulosDa(chave) {
    const a = AREAS[chave], todos = window.MODULOS[a.produto].modulos;
    return a.modulos ? a.modulos.map(id => todos.find(m => m.id === id)).filter(Boolean) : todos;
  }
  const arquivoUrl = (produto, modulo, arquivo, extra = '') =>
    'api/arquivo.php?produto=' + encodeURIComponent(produto) + '&modulo=' + encodeURIComponent(modulo) + '&arquivo=' + encodeURIComponent(arquivo) + extra;
  const voltar = (href, rotulo) => `<a class="voltar" href="${href}">${ic('voltar')}${rotulo}</a>`;

  // ---------- Tela inicial: os 3 cartões ----------
  function inicio() {
    if (window.SJ_RASTRO) window.SJ_RASTRO('pos', 'area');
    let status = '';
    if (respostas) {
      const hoje = new Date(), plano = P.calcular(respostas, hoje);
      const agora = hoje.getHours() * 60 + hoje.getMinutes();
      const mod = m => ((m % 1440) + 1440) % 1440;
      status = mod(agora - plano.abre) < plano.fecha - plano.abre
        ? `<span class="st comer">Agora: pode comer até as ${P.hora(plano.fecha)}</span>`
        : `<span class="st jejum">Agora: em jejum até as ${P.hora(plano.abre)}</span>`;
    }
    const banner = chave => window.MODULOS[AREAS[chave].produto];
    const chaLivre = liberado('cha');

    app.innerHTML = `
      <header class="inicio-topo">
        <div class="marca">Seca Jejum <span>o seu Jejum com Água</span></div>
        <h1>Meus planos</h1>
      </header>

      <a class="card-area card-agenda" href="agenda.html">
        <span class="ca-linha"><span class="ca-ic">${ic('agenda')}</span>
          <span class="ca-txt"><strong>Sua agenda de jejum</strong><small>Seu plano de jejum personalizado</small></span></span>
        <span class="ca-btn">Acessar meu plano${ic('seta')}</span>
        ${status}
      </a>

      <a class="card-area card-banner" href="conteudo.html?area=metodo">
        <img src="${banner('metodo').banner}" width="${banner('metodo').bannerLargura}" height="${banner('metodo').bannerAltura}" alt="">
        <span class="cb-info"><span><strong>${AREAS.metodo.nome}</strong><small>${AREAS.metodo.descricao}</small></span><span class="ca-seta">${ic('seta')}</span></span>
      </a>

      <a class="card-area card-banner card-cha${chaLivre ? '' : ' trancado'}" href="conteudo.html?area=cha">
        <span class="cb-midia"><img src="${banner('cha').banner}" width="${banner('cha').bannerLargura}" height="${banner('cha').bannerAltura}" alt="">
          ${chaLivre ? '' : `<span class="cb-selo">${ic('cadeado')}Bloqueado</span>`}</span>
        <span class="cb-info"><span><strong>${AREAS.cha.nome}</strong><small>${AREAS.cha.descricao}</small></span><span class="ca-seta">${ic('seta')}</span></span>
      </a>

      <a class="card-area card-refazer" href="quiz.html?refazer=1">
        <span class="cr-ic">${ic('relogio')}</span>
        <span class="ca-txt"><strong>Refazer meus horários</strong><small>Mudou a rotina? Responda de novo e a sua agenda é refeita.</small></span>
        <span class="ca-seta">${ic('seta')}</span>
      </a>
      <button type="button" class="sair" id="sair">Sair</button>
      ${TESTE ? `<div class="teste-upsell"><strong>Só no teste do PC</strong>
        <label><input type="checkbox" id="t-upsell" ${estado.upsell ? 'checked' : ''}> Ela comprou o Chá Turbo Seca</label>
        <button type="button" id="t-zerar">Começar do zero (apagar respostas e refazer o quiz completo)</button></div>` : ''}`;
    document.getElementById('sair').addEventListener('click', () =>
      postar('api/sair.php', {}).catch(() => {}).then(() => { location.href = 'entrar.html'; }));
    if (TESTE) {
      document.getElementById('t-upsell').addEventListener('change', e => postar('api/_dev.php', { upsell: e.target.checked }).then(abrir));
      document.getElementById('t-zerar').addEventListener('click', () => postar('api/_dev.php', { zerar: true }).then(() => { location.href = 'quiz.html'; }));
    }
  }

  // ---------- Lista de e-books de uma área ----------
  function conteudo() {
    const chave = param('area');
    if (!AREAS[chave]) { app.innerHTML = '<p class="aviso-simples">Página não encontrada. <a href="./">Voltar ao início</a></p>'; return; }
    const a = AREAS[chave], d = window.MODULOS[a.produto], livre = liberado(chave), lista = modulosDa(chave);
    document.title = a.nome + ' · Seca Jejum';
    app.innerHTML = `
      <div class="topo-simples">${voltar('./', 'Início')}</div>
      <header class="area-hero">
        <img src="${d.banner}" width="${d.bannerLargura}" height="${d.bannerAltura}" alt="">
        <h1>${a.nome}</h1><small>${lista.length} e-books</small>
      </header>
      ${livre ? '' : `<section class="oferta-premium">
        <span class="bl-selo">Acelere 10x a queima de gordura</span>
        <h2>Desbloqueie o Chá Turbo Seca</h2>
        <p>As receitas de chás que ativam a queima de gordura desde a primeira hora do jejum, as Bebidas Anti Fome, a Queima Noturna e os bônus.</p>
        <a class="bl-btn" href="${CHECKOUT_UPSELL}" target="_blank" rel="noopener">${ic('cadeado')}Desbloquear agora</a>
        <small>Pagamento seguro · Garantia de 30 dias · Acesso liberado aqui assim que o pagamento for aprovado</small>
      </section>`}
      <div class="ebooks">
        ${lista.map(m => `<a class="ebook-capa${livre ? '' : ' trancado'}" href="modulo.html?area=${chave}&m=${encodeURIComponent(m.id)}">
          <span class="ec-img"><img src="${m.capa}" width="${m.capaLargura}" height="${m.capaAltura}" alt="" loading="lazy">${livre ? '' : `<span class="ec-cad">${ic('cadeado')}</span>`}</span>
          <strong>${esc(m.titulo)}</strong></a>`).join('')}
      </div>`;
  }

  // ---------- Leitura de um e-book ----------
  function modulo() {
    const chave = param('area'), a = AREAS[chave];
    const m = a && modulosDa(chave).find(x => x.id === param('m'));
    if (!m) { app.innerHTML = '<p class="aviso-simples">Página não encontrada. <a href="./">Voltar ao início</a></p>'; return; }
    document.title = m.titulo + ' · Seca Jejum';
    const topo = `<div class="topo-simples">${voltar('conteudo.html?area=' + chave, a.nome)}</div><h1 class="ebook-titulo">${esc(m.titulo)}</h1>`;
    if (!liberado(chave)) {
      // nada do e-book entra na página
      app.innerHTML = topo + `<section class="oferta-premium">
        <span class="bl-selo">${ic('cadeado')}Conteúdo bloqueado</span>
        <h2>Este e-book faz parte do Chá Turbo Seca</h2>
        <p>Desbloqueie para ler aqui e baixar o PDF.</p>
        <a class="bl-btn" href="${CHECKOUT_UPSELL}" target="_blank" rel="noopener">${ic('cadeado')}Desbloquear agora</a></section>`;
      return;
    }
    app.innerHTML = topo +
      `<a class="btn-baixar" href="${esc(arquivoUrl(a.produto, m.id, m.pdf, '&baixar=1'))}">${ic('baixar')}Baixar o PDF</a>
      <div class="paginas">${m.paginas.map((t, n) => `<img class="pagina" data-src="${esc(arquivoUrl(a.produto, m.id, 'pagina-' + String(n + 1).padStart(3, '0') + '.jpg'))}" width="${t[0]}" height="${t[1]}" style="aspect-ratio:${t[0]}/${t[1]}" alt="Página ${n + 1}">`).join('')}</div>`;
    // cada página só baixa quando chega perto da tela (como na v1)
    const obs = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.src = e.target.dataset.src; obs.unobserve(e.target); }
    }), { rootMargin: '1500px 0px' });
    document.querySelectorAll('.pagina').forEach(img => obs.observe(img));
  }

  // Abertura: confere o login e a compra (api/estado.php) e as respostas; sem login vai ao login; sem respostas, ao quiz.
  const TESTE = location.hostname === '127.0.0.1';      // os controles de teste só aparecem no PC
  function abrir() {
    // Falha ao ler as respostas (internet, servidor) não é "não tem respostas": a tela abre sem o status, sem mandar ao quiz
    Promise.all([pegar('api/estado.php', { destino: 'login', upsell: false }), pegar('api/respostas.php', { erro: true })])
      .then(([e, r]) => {
        estado = e; respostas = r.respostas || null;
        const pagina = document.body.dataset.pagina;
        if (e.destino === 'login') { location.replace('entrar.html'); return; }
        if (pagina === 'inicio' && e.destino === 'quiz') { location.replace('quiz.html'); return; }     // 1º acesso: o funil antes
        if (pagina === 'inicio' && !r.erro && !respostas && e.destino === 'membros') { location.replace('quiz.html'); return; }
        ({ inicio, conteudo, modulo })[pagina]();
      });
  }
  abrir();
})();
