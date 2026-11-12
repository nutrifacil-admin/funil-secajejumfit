// Tela do plano da área v2: faixa fixa, relógio do jejum, agenda do dia por fase e receitas sugeridas no modal.
// O perfil são as respostas do quiz, guardadas no servidor; os checks do dia (copos, refeições) ficam no navegador.
(function () {
  const P = window.Plano;
  const CHECKOUT_UPSELL = 'https://pay.cakto.com.br/35ocedw'; // o mesmo de site-membros/js/config.js
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const ic = window.ic;

  const ler = (k, padrao) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? padrao : v; } catch (e) { return padrao; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem storage: segue sem lembrar */ } };
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let perfil = null;               // as respostas do quiz, vindas do servidor (api/respostas.php)
  let deslocamento = 0;            // 0 = hoje
  let plano, data;

  const chaveDia = d => 'sjt2:check:' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const checks = () => ler(chaveDia(data), { copos: [], ref: [] });
  const agoraMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
  const mod = m => ((m % 1440) + 1440) % 1440;
  const dur = m => { m = Math.max(0, Math.round(m)); return String(Math.floor(m / 60)).padStart(2, '0') + 'h' + String(m % 60).padStart(2, '0'); };
  const H = m => P.hora(m);
  const emJanela = m => mod(m - plano.abre) < plano.fecha - plano.abre;

  // ---------- Faixa fixa do topo ----------
  function renderFaixa(ehHoje) {
    const p = plano, f = $('faixa');
    if (!ehHoje) {
      f.className = 'faixa-topo';
      f.innerHTML = `<span class="fx-linha">Neste dia: jejum até <b>${H(p.abre)}</b> · pode comer até <b>${H(p.fecha)}</b></span>`;
      return;
    }
    const agora = agoraMin();
    if (emJanela(agora)) {
      f.className = 'faixa-topo comer';
      f.innerHTML = `<span class="fx-linha">${ic('comer')}<span>Você pode comer até as <b>${H(p.fecha)}</b></span></span><small>Faltam ${dur(mod(p.fecha - agora))}. Depois, jejum até ${H(p.abre)} de amanhã.</small>`;
    } else {
      f.className = 'faixa-topo jejum';
      f.innerHTML = `<span class="fx-linha">${ic('jejum')}<span>Você deve ficar de jejum até as <b>${H(p.abre)}</b></span></span><small>Faltam ${dur(mod(p.abre - agora))}. Só água, café e chá sem açúcar.</small>`;
    }
  }

  // ---------- Dias ----------
  function renderDias() {
    const hoje = new Date();
    $('dias').innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
      const fds = d.getDay() === 0 || d.getDay() === 6;
      return `<button class="dia${i === deslocamento ? ' ativo' : ''}${fds ? ' fds' : ''}" data-i="${i}">${i === 0 ? 'Hoje' : DIAS[d.getDay()]}<b>${d.getDate()}</b></button>`;
    }).join('');
  }

  // ---------- Relógio: cada parte do dia com o nome escrito nela ----------
  const C = 150, R = 100, LARG = 30;
  const ponto = (m, r) => { const a = mod(m) / 1440 * 2 * Math.PI - Math.PI / 2; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
  function arco(de, ate, r, invertido) {
    const span = mod(ate - de) || 1440, grande = span > 720 ? 1 : 0;
    const [x0, y0] = ponto(de, r), [x1, y1] = ponto(ate, r);
    return invertido ? `M ${x1} ${y1} A ${r} ${r} 0 ${grande} 0 ${x0} ${y0}` : `M ${x0} ${y0} A ${r} ${r} 0 ${grande} 1 ${x1} ${y1}`;
  }
  function renderRelogio(ehHoje) {
    const p = plano;
    const partes = [
      { de: p.dorme, ate: p.acorda, cor: '#19b38d', tx: '#06261d', rot: mod(p.acorda - p.dorme) >= 360 ? 'DORMINDO · JEJUM' : 'DORMINDO' },
      { de: p.acorda, ate: p.abre, cor: '#19b38d', tx: '#06261d', rot: 'JEJUM' },
      { de: p.abre, ate: p.fecha, cor: '#f2b321', tx: '#3a2900', rot: 'PODE COMER' },
      { de: p.fecha, ate: p.dorme, cor: '#19b38d', tx: '#06261d', rot: 'JEJUM' }
    ];
    let s = '';
    partes.forEach((x, i) => {
      const span = mod(x.ate - x.de);
      if (!span) return;
      s += `<path d="${arco(x.de, x.ate, R)}" fill="none" stroke="${x.cor}" stroke-width="${LARG}"/>`;
      // texto de cabeça para cima: na metade de baixo do relógio o caminho do texto vai ao contrário
      const meio = x.de + span / 2, [, ym] = ponto(meio, R), baixo = ym > C;
      const cabe = span * (2 * Math.PI * R / 1440) > x.rot.length * 7.2 + 10;
      if (cabe) {
        s += `<path id="seg${i}" d="${arco(x.de, x.ate, R, baixo)}" fill="none"/>`;
        s += `<text font-size="11" font-weight="800" letter-spacing=".6" fill="${x.tx}" dominant-baseline="central"><textPath href="#seg${i}" startOffset="50%" text-anchor="middle">${x.rot}</textPath></text>`;
      }
    });
    // divisórias e horários nas pontas de cada parte
    [[p.abre, '#f2b321'], [p.fecha, '#f2b321'], [p.dorme, '#8fe0c6'], [p.acorda, '#8fe0c6']].forEach(([m, cor]) => {
      const [x0, y0] = ponto(m, R - LARG / 2), [x1, y1] = ponto(m, R + LARG / 2), [xt, yt] = ponto(m, R + LARG / 2 + 15);
      s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#181b22" stroke-width="3"/>`;
      s += `<text x="${xt}" y="${yt}" fill="${cor}" font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="middle">${H(m)}</text>`;
    });
    if (ehHoje) {
      const agora = agoraMin(), [x, y] = ponto(agora, R), [xa, ya] = ponto(agora, R - LARG / 2 - 12);
      s += `<circle cx="${x}" cy="${y}" r="10" fill="#fff" stroke="#181b22" stroke-width="3"/>`;
      s += `<text x="${xa}" y="${ya}" fill="#fff" font-size="10" font-weight="700" text-anchor="middle" dominant-baseline="middle">agora</text>`;
    }
    $('relogio').innerHTML = s;

    const est = $('estado');
    if (!ehHoje) {
      est.className = 'estado'; est.textContent = 'Pode comer';
      $('contagem').textContent = H(p.abre) + '–' + H(p.fecha);
      $('sub').textContent = 'jejum de ' + p.horas + ' h';
      return;
    }
    const agora = agoraMin();
    if (emJanela(agora)) {
      est.className = 'estado janela'; est.textContent = 'Pode comer';
      $('contagem').textContent = dur(mod(p.fecha - agora));
      $('sub').textContent = 'até fechar, às ' + H(p.fecha);
    } else {
      est.className = 'estado jejum'; est.textContent = 'Em jejum';
      $('contagem').textContent = dur(mod(p.abre - agora));
      $('sub').textContent = 'para comer, às ' + H(p.abre);
    }
  }

  // ---------- Resumo ----------
  function renderResumo() {
    const p = plano, c = checks();
    const motivos = {
      peso: `Calculado pelo seu peso e altura: jejum de ${p.horas} h.`,
      idade: `Pela sua idade, o seu jejum é de ${p.horas} h, mais leve para o seu corpo.`,
      fds: 'Fim de semana com pausa: jejum mais curto, de 12 h.',
      cuidado: 'Pela sua resposta sobre saúde, o seu jejum é de 12 h. Converse com o seu médico antes de aumentar.'
    };
    let porque = motivos[p.motivo];
    if (p.ajusteSono) porque += ' Como você dorme pouco, o seu horário de comer ficou um pouco menor.';
    const janelaH = (p.fecha - p.abre) / 60;
    $('resumo').innerHTML = `
      <div class="cartao comer"><small>${ic('comer')}Pode comer</small><strong>${H(p.abre)} às ${H(p.fecha)}</strong><small>${janelaH.toLocaleString('pt-BR')} h para as refeições</small></div>
      <div class="cartao jejum"><small>${ic('jejum')}Jejum</small><strong>${H(p.fecha)} às ${H(p.abre)}</strong><small>${(p.jejumReal / 60).toLocaleString('pt-BR')} h, contando o sono</small></div>
      <div class="cartao agua"><small>${ic('agua')}Água do dia</small><strong>${(p.agua.ml / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L</strong><small>${c.copos.length} de ${p.agua.copos.length} copos de 200 ml</small></div>
      <p class="porque${p.motivo === 'cuidado' ? ' aviso' : ''}">${esc(porque)}</p>
      <div class="cartao pausa"><span>Pausa no fim de semana<br><small>Sábado e domingo com jejum de 12 h</small></span>
        <button class="chave" id="chave-pausa" role="switch" aria-checked="${perfil.pausaFds}" aria-label="Pausa no fim de semana"></button></div>`;
  }

  // ---------- Agenda ----------
  const PRATO = `<svg viewBox="0 0 74 74" aria-hidden="true"><circle cx="37" cy="37" r="35" fill="#2a2f3c"/>
    <path d="M37 37 L37 5 A32 32 0 0 1 37 69 Z" fill="#3fbf7f"/><path d="M37 37 L37 69 A32 32 0 0 1 5 37 Z" fill="#e8835a"/>
    <path d="M37 37 L5 37 A32 32 0 0 1 37 5 Z" fill="#f2b321"/></svg>`;
  const MONTAGEM = {
    cafe: 'Monte assim: 1 proteína (ovo, queijo ou iogurte) + 1 fruta ou 1 porção de pão, tapioca ou cuscuz. Café ou chá sem açúcar.',
    lanche: 'Monte assim: 1 proteína ou gordura boa (iogurte, queijo, ovo, castanhas ou abacate) + 1 fruta.'
  };
  // Upsell bloqueado: a etiqueta é o benefício (Marx, 27/10). Bebidas = a última coisa da janela, logo depois do jantar;
  // chá = quando ela completa 12 h de jejum (entrou em autofagia); Queima Noturna = antes de dormir.
  const BLOQUEADOS = {
    bebidas: { selo: 'Atravesse o jejum sem passar fome', nome: 'Bebidas Anti Fome', linha: 'A última coisa do dia, logo depois do jantar.',
      texto: 'Bebidas de poucas calorias, em dose pequena, que enchem o estômago e seguram a fome até a hora de abrir a janela de novo.' },
    cha: { selo: 'Acelere 10x a queima de gordura', nome: 'Chá Turbo Seca', linha: 'Seu corpo entrou em autofagia: hora do chá.',
      texto: 'Seu corpo acabou de entrar em autofagia, o modo de limpeza. É a hora do Chá Turbo Seca: ele aumenta em 10x a sua queima de gordura pelo resto do dia.' },
    queima: { selo: 'Emagreça enquanto dorme', nome: 'Queima Noturna', linha: 'O ritual de 5 minutos antes de deitar.',
      texto: 'O ritual de 5 minutos antes de deitar para o seu corpo continuar queimando gordura enquanto você dorme.' }
  };

  function itensDoDia() {
    const p = plano, rel = m => (m < p.acorda ? m + 1440 : m);
    const it = [{ t: p.acorda, k: 'acordar', o: 0 }];
    p.agua.copos.forEach((t, i) => it.push({ t, k: 'copo', i, o: 2 }));
    p.refeicoes.forEach((r, i) => it.push({ t: r.hora, k: 'refeicao', r, i, o: 1 }));
    // chá nas 12 h de jejum; se as 12 h só chegam na hora de comer (jejum de 12 h), 30 min antes de abrir
    const t12 = rel(mod(p.marcoLimpeza));
    it.push({ t: Math.max(p.acorda + 30, Math.min(t12, p.abre - 30)), k: 'bloq', b: 'cha', o: 3 });
    const ultima = p.refeicoes[p.refeicoes.length - 1].hora;
    it.push({ t: Math.min(ultima + 15, p.fecha - 5), k: 'bloq', b: 'bebidas', o: 3 });
    it.push({ t: p.dorme - 45, k: 'bloq', b: 'queima', o: 3 });
    return it.sort((a, b) => a.t - b.t || a.o - b.o);
  }

  function htmlItem(x, c) {
    const p = plano;
    switch (x.k) {
      case 'acordar': return ['', `<div class="linha">${ic('sol')}Acordar<small>Comece o dia com 1 copo de água</small></div>`];
      case 'copo': {
        const on = c.copos.includes(x.i);
        return ['', `<button class="copo" data-copo="${x.i}" aria-pressed="${on}"><span class="bola">${on ? ic('check') : ''}</span><span>Copo de água (${p.agua.copoMl} ml)</span></button>`];
      }
      case 'bloq': {
        const b = BLOQUEADOS[x.b];
        return ['', `<button class="bloqueado" data-bloq="${x.b}">
          <span class="bl-selo">${b.selo}</span>
          <span class="bl-corpo"><span class="bl-cad">${ic('cadeado')}</span><span><strong>${b.nome}</strong><small>${b.linha}</small></span><span class="bl-seta">${ic('seta')}</span></span></button>`];
      }
      case 'refeicao': {
        const r = x.r, feito = c.ref.includes(x.i);
        return ['refeicao', `<div class="ref">
          <div class="ref-topo"><span class="ref-ic">${ic('comer')}</span><h3>${r.nome}</h3><button class="feito" data-ref="${x.i}" aria-pressed="${feito}">${feito ? ic('check') + 'Feito' : 'Feito'}</button></div>
          ${r.quebra ? '<span class="selo">Quebra do jejum · comece pela proteína e coma devagar</span>' : ''}
          ${r.ajustada ? `<p class="ajuste">Horário ajustado para caber no seu horário de comer.</p>` : ''}
          <button class="btn-receitas" data-receitas="${r.tipo}" data-quebra="${r.quebra ? 1 : ''}">Ver receitas</button></div>`];
      }
    }
  }

  // A agenda é dividida nas fases do dia, cada uma com a sua cor: jejum, pode comer, jejum, dormindo
  function renderAgenda(ehHoje) {
    const p = plano, c = checks(), agora = agoraMin(), agoraRel = agora < p.acorda ? agora + 1440 : agora;
    const fases = [
      { cls: 'jejum', ate: p.abre, ic: 'jejum', tit: `Em jejum até as ${H(p.abre)}`, sub: 'Não coma nada. Só água, café e chá sem açúcar.' },
      { cls: 'comer', ate: p.fecha, ic: 'comer', tit: `Pode comer · das ${H(p.abre)} às ${H(p.fecha)}`, sub: 'Este é o seu horário de comer. Faça as refeições abaixo.' },
      { cls: 'jejum', ate: p.dorme, ic: 'jejum', tit: `Jejum de novo a partir das ${H(p.fecha)}`, sub: 'A janela fechou. Só água, café e chá sem açúcar.' },
      { cls: 'sono', ate: Infinity, ic: 'lua', tit: `Dormindo · das ${H(p.dorme)} às ${H(p.acorda)}`, sub: 'O jejum continua enquanto você dorme.' }
    ];
    const itens = itensDoDia();
    let de = -Infinity;
    $('agenda').innerHTML = fases.map(f => {
      const doGrupo = itens.filter(x => x.t >= de && x.t < f.ate);
      const ini = de; de = f.ate;
      const agoraAqui = ehHoje && agoraRel >= ini && agoraRel < f.ate;
      const lis = doGrupo.map(x => {
        const [cls, corpo] = htmlItem(x, c);
        const passou = ehHoje && x.t < agoraRel && x.k !== 'refeicao' && x.k !== 'bloq';
        return `<li class="item ${cls}${passou ? ' passou' : ''}"><span class="h">${H(x.t)}</span>${corpo}</li>`;
      }).join('');
      return `<section class="fase ${f.cls}${agoraAqui ? ' atual' : ''}">
        <div class="fase-topo"><strong>${ic(f.ic)}${f.tit}</strong>${agoraAqui ? '<span class="voce">você está aqui</span>' : ''}<small>${f.sub}</small></div>
        ${lis ? `<ol>${lis}</ol>` : ''}</section>`;
    }).join('');
  }

  // ---------- Receitas ----------
  const guiaDoPrato = tipo => (tipo === 'almoco' || tipo === 'jantar')
    ? `<div class="prato"><h4>Monte o seu prato assim</h4>${PRATO}<ul>
         <li><i style="background:#3fbf7f"></i><b>50%</b> salada e legumes, à vontade</li>
         <li><i style="background:#e8835a"></i><b>25%</b> proteína: carne, frango, peixe, ovo ou leguminosa</li>
         <li><i style="background:#f2b321"></i><b>25%</b> carboidrato: arroz, feijão, mandioca ou batata</li></ul></div>`
    : `<div class="prato"><h4>Monte assim</h4><p class="montagem">${MONTAGEM[tipo]}</p></div>`;

  function abrirReceitas(tipo, quebra) {
    const r = perfil.restricoes || [];
    const ok = x => !(r.includes('lactose') && x.l) && !(r.includes('gluten') && x.g) && !(r.includes('vegetariana') && x.c);
    const doTipo = window.RECEITAS.filter(x => x.tipo === tipo);
    let lista = doTipo.filter(ok);
    const semFiltro = lista.length === 0;
    if (semFiltro) lista = doTipo;
    // A ordem gira a cada dia: a 1ª é a sugestão do dia
    const giro = Math.floor(data.getTime() / 864e5) % lista.length;
    lista = lista.slice(giro).concat(lista.slice(0, giro));
    const nomes = { cafe: 'café da manhã', almoco: 'almoço', lanche: 'lanche', jantar: 'jantar' };
    $('modal-titulo').textContent = nomes[tipo][0].toUpperCase() + nomes[tipo].slice(1);
    $('modal-nota').hidden = false;
    $('modal-lista').innerHTML = guiaDoPrato(tipo) +
      (quebra ? '<p class="selo">Quebra do jejum · comece pela proteína e coma devagar</p>' : '') +
      '<h4 class="receitas-tit">Receitas sugeridas</h4>' +
      (semFiltro ? '<p class="modal-nota">Nenhuma receita bate com todas as suas restrições; mostrando todas.</p>' : '') +
      lista.map((x, i) => `<details class="receita"${i === 0 ? ' open' : ''}>
        <summary><strong>${esc(x.nome)}${i === 0 ? '<span class="tag-dia">SUGESTÃO DO DIA</span>' : ''}</strong><small>${esc(x.tempo)} · ${esc(x.rende)}</small></summary>
        <div class="corpo">
          <h4>Ingredientes</h4><ul>${x.ingredientes.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
          <h4>Modo de preparo</h4><ol>${x.passos.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
          <h4>Por que ajuda</h4><p>${esc(x.porque)}</p>
          <p class="dica">${ic('dica')}<span>${esc(x.dica)}</span></p>
        </div></details>`).join('');
    $('modal').hidden = false;
  }

  // Upsell aberto: diz o que ele faz e mostra o conteúdo trancado (sem revelar nada), com o botão para liberar
  function abrirBloqueado(chave) {
    const b = BLOQUEADOS[chave];
    $('modal-titulo').textContent = b.nome;
    $('modal-nota').hidden = true;
    $('modal-lista').innerHTML = `<div class="bl-aberto">
        <span class="bl-selo">${b.selo}</span>
        <p class="bl-texto">${b.texto}</p>
        <div class="bl-previa"><div class="bl-tranca"><span class="bl-cad">${ic('cadeado')}</span><span>Conteúdo bloqueado<small>Desbloqueie para liberar o passo a passo aqui no seu plano.</small></span></div>
          <div class="bl-borrado" aria-hidden="true"><i></i><i></i><i></i></div></div>
        <a class="bl-btn" href="${CHECKOUT_UPSELL}" target="_blank" rel="noopener">${ic('cadeado')}Desbloquear agora</a>
      </div>`;
    $('modal').hidden = false;
  }

  // ---------- Tudo ----------
  function render() {
    const hoje = new Date();
    data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + deslocamento);
    plano = P.calcular(perfil, data);
    const ehHoje = deslocamento === 0;
    $('saudacao').textContent = ehHoje ? 'Seu plano de hoje' : 'Seu plano de ' + DIAS[data.getDay()].toLowerCase() + ', ' + data.getDate();
    renderFaixa(ehHoje); renderDias(); renderRelogio(ehHoje); renderResumo(); renderAgenda(ehHoje);
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('button, [data-i]');
    if (!el) return;
    if (el.dataset.i != null) { deslocamento = Number(el.dataset.i); render(); return; }
    if (el.dataset.copo != null || el.dataset.ref != null) {
      const c = checks(), lista = el.dataset.copo != null ? c.copos : c.ref, n = Number(el.dataset.copo ?? el.dataset.ref);
      const pos = lista.indexOf(n); pos >= 0 ? lista.splice(pos, 1) : lista.push(n);
      gravar(chaveDia(data), c); render(); return;
    }
    if (el.dataset.receitas) { abrirReceitas(el.dataset.receitas, !!el.dataset.quebra); return; }
    if (el.dataset.bloq) { abrirBloqueado(el.dataset.bloq); return; }
    if (el.id === 'chave-pausa') { trocarPausa(); return; }
    if (el.id === 'modal-fechar') { $('modal').hidden = true; return; }
  });
  $('modal').addEventListener('click', e => { if (e.target.id === 'modal') $('modal').hidden = true; });

  // Pausa do fim de semana: grava no servidor junto com as outras respostas; se falhar, volta como estava
  function trocarPausa() {
    const novo = Object.assign({}, perfil, { pausaFds: !perfil.pausaFds });
    perfil = novo; render();
    fetch('api/respostas.php', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respostas: novo })
    }).then(r => { if (!r.ok) throw new Error(); })
      .catch(() => { perfil = Object.assign({}, perfil, { pausaFds: !novo.pausaFds }); render(); });
  }

  // Sem login vai ao login; sem respostas, ao quiz (só as perguntas) para montar a agenda.
  fetch('api/respostas.php', { credentials: 'same-origin', cache: 'no-store' })
    .then(r => (r.status === 401 ? { semLogin: true } : r.json()))
    .catch(() => ({ erro: true }))
    .then(d => {
      if (d.semLogin) { location.replace('entrar.html'); return; }
      if (d.erro) { $('saudacao').textContent = 'Não conseguimos carregar o seu plano. Verifique a internet e recarregue a página.'; return; }
      if (!d.respostas) { location.replace('quiz.html'); return; }
      perfil = d.respostas;
      render();
      setInterval(() => { if ($('modal').hidden && deslocamento === 0) render(); }, 30000);
    });
})();
