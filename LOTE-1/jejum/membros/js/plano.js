// Cálculo do plano do dia (regras aprovadas pelo Marx em 27/10; detalhe no LEIA-ME.md).
// Tudo em minutos contados a partir da meia-noite do dia; um horário depois da meia-noite vira > 1440.
(function () {
  const COPO_ML = 200;

  function min(hhmm) { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + (m || 0); }
  function hora(m) { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function r15(m) { return Math.round(m / 15) * 15; }

  // Nome da refeição pela hora em que ela cai
  function nomePorHora(m) {
    const h = (((m % 1440) + 1440) % 1440) / 60;
    if (h < 11) return { tipo: 'cafe', nome: 'Café da manhã' };
    if (h < 15) return { tipo: 'almoco', nome: 'Almoço' };
    if (h < 18) return { tipo: 'lanche', nome: 'Lanche' };
    return { tipo: 'jantar', nome: 'Jantar' };
  }

  function horasDeJejum(p, data) {
    const imc = p.peso / Math.pow(p.altura / 100, 2);
    const fds = data.getDay() === 0 || data.getDay() === 6;
    let horas, motivo;
    if ((p.saude || 'nenhuma') !== 'nenhuma' || p.idade < 18) { horas = 12; motivo = 'cuidado'; }
    else if (imc < 25 || p.idade >= 60) { horas = 14; motivo = imc < 25 ? 'peso' : 'idade'; }
    else { horas = 16; motivo = 'peso'; }
    if (p.pausaFds && fds && horas > 12) { horas = 12; motivo = 'fds'; }
    return { horas, motivo, imc };
  }

  // Horário do quiz: minutos (número), 'HH:MM', ou 'pula'/vazio quando ela pula aquela refeição
  const tempo = v => (v == null || v === 'pula' || v === '') ? null : (typeof v === 'number' ? v : min(v));

  function calcular(p, data) {
    const j = horasDeJejum(p, data);
    const acorda = tempo(p.acorda);
    let dorme = tempo(p.dorme); if (dorme <= acorda) dorme += 1440;
    const depois = m => (m == null ? null : (m < acorda ? m + 1440 : m));   // refeição de madrugada conta no fim do dia
    // As refeições que ela faz (as puladas ficam de fora), na ordem do dia
    const dela = [['cafe', p.cafe], ['almoco', p.almoco], ['lanche', p.lanche], ['jantar', p.janta]]
      .map(([origem, v]) => [origem, depois(tempo(v))]).filter(([, t]) => t != null).sort((a, b) => a[1] - b[1]);
    // Última refeição dela (o jantar, ou a última que ela faz se pula o jantar); sem nenhuma, 3 h antes de dormir
    const ultimaDela = dela.length ? dela[dela.length - 1][1] : dorme - 180;

    // A janela fecha 30 min depois da última refeição dela, e no máximo 2 h antes de dormir
    let fecha = r15(Math.min(ultimaDela + 30, dorme - 120));
    let abre = fecha - (24 - j.horas) * 60;
    let ajusteSono = false;
    // atalho: quem dorme muito pouco teria a janela abrindo antes de acordar; aí a janela encolhe (jejum maior que a meta)
    if (abre < acorda + 30) { abre = r15(acorda + 30); ajusteSono = true; }

    // Refeições: a 1ª é a quebra do jejum, na hora que a janela abre; as dela que cabem depois ficam no horário dela.
    // A quebra leva o nome da refeição dela mais perto (até 1 h); senão, o nome vem da hora.
    // Se ela PULA a refeição daquele horário, não inventamos uma: a quebra é a 1ª refeição que ela faz na janela.
    const ultima = fecha - 30;
    const CAMPO = { cafe: 'cafe', almoco: 'almoco', lanche: 'lanche', jantar: 'janta' };
    const perto = dela.find(([, t]) => Math.abs(t - abre) <= 60);
    const tipoQuebra = perto ? perto[0] : nomePorHora(abre).tipo;
    const naJanela = dela.filter(([, t]) => t >= abre && t <= ultima);
    let refeicoes;
    if (p[CAMPO[tipoQuebra]] === 'pula' && naJanela.length) {
      refeicoes = naJanela.map(([origem, t], i) => ({ hora: t, origem, quebra: i === 0 }));
    } else {
      refeicoes = [{ hora: abre, quebra: true, origem: tipoQuebra }];
      dela.forEach(([origem, t]) => {
        if (t >= abre + 120 && t <= ultima) refeicoes.push({ hora: t, origem });
      });
    }
    // A última refeição dela fica fora da janela (dorme cedo): vai para o último horário possível
    const [origemUltima] = dela.length ? dela[dela.length - 1] : ['jantar'];
    if (dela.length && ultimaDela > ultima && refeicoes[refeicoes.length - 1].hora < ultima - 120) {
      refeicoes.push({ hora: ultima, origem: origemUltima, ajustada: true });
    }
    // Intervalo de 5 h ou mais entre duas refeições ganha um lanche no meio, a não ser que ela pule o lanche
    // ou o lanche dela já esteja na janela
    const temLanche = refeicoes.some(r => r.origem === 'lanche');
    if (p.lanche !== 'pula' && !temLanche) {
      for (let i = refeicoes.length - 1; i > 0; i--) {
        const a = refeicoes[i - 1].hora, b = refeicoes[i].hora;
        if (b - a >= 300) { refeicoes.splice(i, 0, { hora: r15((a + b) / 2), origem: 'lanche' }); break; }
      }
    }
    const NOMES = { cafe: 'Café da manhã', almoco: 'Almoço', jantar: 'Jantar', lanche: 'Lanche' };
    refeicoes.forEach(r => Object.assign(r, { tipo: r.origem, nome: NOMES[r.origem] }));

    // Água: 35 ml por kg, de 2 L a 3,5 L, em copos de 200 ml, do acordar até 1 h antes de dormir
    const ml = Math.min(3500, Math.max(2000, Math.round(p.peso * 35)));
    const nCopos = Math.ceil(ml / COPO_ML);
    const fim = dorme - 60, passo = (fim - acorda) / (nCopos - 1);
    const copos = Array.from({ length: nCopos }, (_, i) => r15(acorda + i * passo));

    return {
      horas: j.horas, motivo: j.motivo, imc: j.imc, ajusteSono,
      jejumReal: 1440 - (fecha - abre),
      acorda, dorme, abre, fecha, refeicoes,
      agua: { ml, copos, copoMl: COPO_ML },
      marcoLimpeza: fecha + 12 * 60 - 1440        // 12 h de jejum desde o fechamento da véspera
    };
  }

  window.Plano = { calcular, hora, min };
})();
