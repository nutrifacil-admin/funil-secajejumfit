// Ícones próprios da área v2 (traço fino; herdam a cor do texto em volta), usados por todas as telas
(function () {
  // Ícones próprios (traço fino, cor do texto em volta) no lugar dos emojis
  window.ICONES = {
    jejum: '<path d="M6 3h12M6 21h12M7.5 3c0 4.5 4.5 6 4.5 9s-4.5 4.5-4.5 9M16.5 3c0 4.5-4.5 6-4.5 9s4.5 4.5 4.5 9"/><path d="M10 18.5h4" stroke-width="2.4"/>',
    comer: '<circle cx="12" cy="12" r="5.5"/><path d="M3 3.5v5a1.8 1.8 0 0 0 1.8 1.8M4.8 3.5v17M21 3.5c-1.6.9-2.2 3-2.2 6.5h2.2v10.5"/>',
    agua: '<path d="M12 3.2s6.2 6.6 6.2 11.2a6.2 6.2 0 0 1-12.4 0C5.8 9.8 12 3.2 12 3.2z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    lua: '<path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1z"/>',
    cadeado: '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7M12 14.5v2.2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    raio: '<path d="M13.2 2.5L4.8 13.6h6.4l-1 7.9 8.4-11.1h-6.4l1-7.9z"/>',
    chama: '<path d="M12 21.5c3.9 0 6.8-2.8 6.8-6.6 0-4.6-4.3-6.6-4.6-11.4-2.8 1.8-4.6 4.6-4.4 7.6-1.1-.6-2-1.8-2.2-3.4C5.9 9.6 5.2 12.2 5.2 14.9c0 3.8 2.9 6.6 6.8 6.6z"/>',
    copo: '<path d="M6 3.5h12l-1.6 16.2a1.6 1.6 0 0 1-1.6 1.3H9.2a1.6 1.6 0 0 1-1.6-1.3L6 3.5z"/><path d="M6.7 9.5h10.6"/>',
    dica: '<path d="M9.2 18h5.6M10.2 21h3.6M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    livro: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 7.5h8M8 11h5"/>',
    baixar: '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M5 19.5h14"/>',
    voltar: '<path d="M15 6l-6 6 6 6"/>',
    presente: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8.5h14V12M12 8v12.5M12 8S10.8 3.5 8.2 3.5a2.2 2.2 0 0 0 0 4.5H12zM12 8s1.2-4.5 3.8-4.5a2.2 2.2 0 0 1 0 4.5H12z"/>',
    agenda: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3M8 17h6"/>',
    relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2M4 4.5L2.5 6M20 4.5L21.5 6"/>',
    seta: '<path d="M9.5 6l6 6-6 6"/>'
  };
  window.ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.ICONES[n]}</svg>`;
})();
