/* Monta o site de um funil em dist/: copia a pasta do funil e junta o motor compartilhado (motor/).
   Uso: node build.js jejum        (na Vercel: Build Command = node build.js jejum · Output = dist) */
const fs = require("fs"), path = require("path");
const funil = process.argv[2];
if (!funil || !fs.existsSync(funil)) { console.error("Informe a pasta do funil. Ex.: node build.js jejum"); process.exit(1); }
const dist = path.join(__dirname, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(path.join(__dirname, funil), dist, { recursive: true });
const css = fs.readFileSync(path.join(__dirname, "motor/estilo.css"), "utf8").replace(/\s*\n\s*/g, "");
const motor = fs.readFileSync(path.join(__dirname, "motor/motor.js"), "utf8");
fs.writeFileSync(path.join(dist, "motor.js"), "window.SJ_CSS = " + JSON.stringify(css) + ";\n" + motor);
console.log("Funil \"" + funil + "\" montado em dist/");

/* Mapa do funil para o Flowex (flowex.site): a lista de passos de cada etapa do funil, com o título e o arquivo/linha onde editar.
   É gerado a cada publicação, então o botão "Editar" sempre aponta para a linha certa. */
{
  const REPO = "https://github.com/nutrifacil-admin/funil-secajejumfit/blob/main/";
  const ler = (f) => fs.readFileSync(path.join(__dirname, f), "utf8");
  const linha = (f, busca) => { const l = ler(f).split("\n"); const i = l.findIndex((x) => x.indexOf(busca) >= 0); return i < 0 ? 1 : i + 1; };
  const link = (f, busca) => REPO + f + "#L" + linha(f, busca);
  const semTag = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

  // Front: as etapas na ordem do telas.js
  const ctx = { window: {} };
  new Function("window", ler(funil + "/telas.js"))(ctx.window);
  const front = ctx.window.SJ_ETAPAS.map((e, i) => {
    const blocos = ctx.window.SJ_TELAS[e.id] || [];
    const txt = blocos.find((b) => b.tipo === "texto");
    return { id: e.id, n: i + 1, nome: e.nome, titulo: semTag(txt && txt.html).slice(0, 120), editar: link(funil + "/telas.js", '"' + e.id + '": [') };
  });
  front.push({ id: "vsl-pitch", n: "", nome: "VSL: chegou no pitch (com som)", titulo: "Evento do player no segundo do pitch", editar: link(funil + "/config.js", "vsl:"), evento: true });
  front.push({ id: "vsl-cta", n: "", nome: "VSL: botão de compra apareceu", titulo: "Evento do player no segundo do CTA", editar: link(funil + "/config.js", "vsl:"), evento: true });
  front.push({ id: "checkout", n: "", nome: "Clicou em comprar (checkout)", titulo: "Saiu para o checkout da Cakto", editar: link(funil + "/config.js", "checkout:"), evento: true });

  // Pós-venda: obrigado → login → avaliação → oferta → downsell → área
  const Q = funil + "/membros/js/quiz.js";
  const pq = (id) => link(Q, "id: '" + id + "'");
  const pos = [
    { id: "obrigado", nome: "Página de obrigado", titulo: "Seu plano de jejum personalizado está quase pronto", editar: link(funil + "/obrigado.html", "<h1>") },
    { id: "entrar", nome: "Tela de login", titulo: "Acesso à área de membros", editar: link(funil + "/membros/entrar.html", "<h1>") },
    { id: "login-ok", nome: "Entrou com o e-mail", titulo: "Login aceito", editar: link(funil + "/membros/js/entrada.js", "ESTADOS"), evento: true },
    { id: "boas-vindas", nome: "Boas-vindas", titulo: "Seja bem-vindo(a)!! Faça sua avaliação física", editar: link(Q, "function telaBoasVindas") },
    { id: "apresentacao", nome: "Apresentação", titulo: "Avaliação Física Seca Jejum", editar: link(Q, "function telaApresentacao") },
    ["genero", "Gênero"], ["idade", "Idade"], ["altura", "Altura"], ["peso", "Peso"], ["saude", "Saúde"], ["acorda", "Que horas acorda"],
    ["dorme", "Que horas dorme"], ["cafe", "Café da manhã"], ["almoco", "Almoço"], ["lanche", "Lanche"], ["janta", "Janta"],
    ["restricoes", "Restrição alimentar"], ["fome", "Horário de mais fome"], ["acelerar", "Acelerar 10x"],
    { id: "oferta", nome: "Oferta: vídeo do upsell", titulo: "Processando a sua avaliação física… Assista a primeira aula", editar: link(Q, "function telaOferta") },
    { id: "oferta-pitch", nome: "Vídeo: chegou no pitch (com som)", titulo: "Evento do player no segundo do pitch", editar: link(funil + "/membros/js/config.js", "pitch:"), evento: true },
    { id: "oferta-cta", nome: "Vídeo: botões apareceram", titulo: "Botões da oferta liberados", editar: link(funil + "/membros/js/config.js", "atrasoOfertaSegundos"), evento: true },
    { id: "oferta-quero", nome: "Clicou: quero o upsell", titulo: "QUERO EMAGRECER 10X MAIS RÁPIDO", editar: link(Q, "QUERO EMAGRECER"), evento: true },
    { id: "downsell", nome: "Downsell (50% OFF)", titulo: "Eu acabei de liberar 50% de DESCONTO pra você", editar: link(Q, "function telaDownsell") },
    { id: "downsell-quero", nome: "Clicou: quero o downsell", titulo: "QUERO DESBLOQUEAR TUDO COM 50% OFF", editar: link(Q, "QUERO DESBLOQUEAR"), evento: true },
    { id: "downsell-nao", nome: "Recusou o downsell", titulo: "Não quero essa última oportunidade", editar: link(Q, "Não quero essa última"), evento: true },
    { id: "area", nome: "Entrou na área de membros", titulo: "Meus planos", editar: link(funil + "/membros/js/inicio.js", "function inicio") },
    { id: "agenda", nome: "Abriu a agenda de jejum", titulo: "Seu plano de hoje", editar: link(funil + "/membros/agenda.html", "Seu plano de hoje") },
    { id: "conteudo", nome: "Abriu a lista de e-books", titulo: "Método Seca Jejum / Chá Turbo Seca", editar: link(funil + "/membros/js/inicio.js", "function conteudo") },
    { id: "ebook", nome: "Abriu um e-book", titulo: "Leitura do e-book (páginas)", editar: link(funil + "/membros/js/modulos.js", "window.MODULOS") },
    { id: "baixar", nome: "Baixou o PDF", titulo: "Botão Baixar o PDF", editar: link(funil + "/membros/js/inicio.js", "Baixar o PDF"), evento: true }
  ].map((x, i) => {
    if (Array.isArray(x)) {
      const linhaQ = ler(Q).split("\n").find((l) => l.indexOf("id: '" + x[0] + "'") >= 0) || "";
      const t = (linhaQ.match(/titulo: '([^']+)'/) || [])[1] || "";
      x = { id: x[0], nome: x[1], titulo: t, editar: pq(x[0]) };
    }
    return Object.assign({ n: x.evento ? "" : i + 1 }, x);
  });
  let n = 0; pos.forEach((p) => { if (!p.evento) p.n = ++n; });
  // publicado em https://<domínio>/flowex-mapa.js — o Flowex (flowex.site) carrega e junta com os mapas dos outros produtos
  fs.writeFileSync(path.join(dist, "flowex-mapa.js"), "window.PAINEL_MAPA = Object.assign(window.PAINEL_MAPA || {}, " + JSON.stringify({ jejum: { nome: "Seca Jejum", front, pos } }) + ");\n");
  console.log("Mapa do painel: " + front.length + " passos no front, " + pos.length + " no pós-venda");
}

/* Lista de verificação do Flowex (botão "Verificar agora" do Diagnóstico): tudo o que este produto precisa no ar —
   páginas, arquivos do site, checkouts, vídeos, área de membros, e-books e rastreamento. Gerada a cada publicação a partir
   dos próprios arquivos de configuração, então um checkout ou vídeo trocado já entra na verificação sozinho.
   Fica na pasta privada dos e-books (o Flowex sabe o endereço; não é indexada). */
{
  const REPO = "https://github.com/nutrifacil-admin/funil-secajejumfit/blob/main/";
  const ler = (f) => fs.readFileSync(path.join(__dirname, f), "utf8");
  const editar = (f, busca) => { const l = ler(f).split("\n"); const i = busca ? l.findIndex((x) => x.indexOf(busca) >= 0) : -1; return REPO + f + (i >= 0 ? "#L" + (i + 1) : ""); };
  const w = {}; new Function("window", ler(funil + "/config.js"))(w);
  const CFG = w.SJ_CFG;
  const M = new Function(ler(funil + "/membros/js/config.js") + "; return { QUIZ: QUIZ, SUPORTE_WHATSAPP: SUPORTE_WHATSAPP };")();
  const wm = {}; new Function("window", ler(funil + "/membros/js/modulos.js"))(wm);
  const PASTA = "/e-368c4e0875/";
  const pixel = (ler(funil + "/index.html").match(/fbq\('init',\s*'(\d+)'/) || [])[1] || "";
  const itens = [];
  const add = (g, nome, url, tipo, extra) => itens.push(Object.assign({ g, nome, url, tipo }, extra || {}));

  add("Páginas", "Front (quiz + VSL)", "/", "pagina", { contem: "motor.js", editar: editar(funil + "/index.html") });
  add("Páginas", "Página de obrigado", "/obrigado", "pagina", { contem: "/membros", editar: editar(funil + "/obrigado.html") });
  add("Páginas", "Login da área de membros", "/membros/entrar", "pagina", { contem: "entrada.js", editar: editar(funil + "/membros/entrar.html") });
  add("Páginas", "Avaliação e oferta do upsell", "/membros/quiz", "pagina", { contem: "quiz.js", editar: editar(funil + "/membros/quiz.html") });
  add("Páginas", "Meus planos (início da área)", "/membros/", "pagina", { contem: "inicio.js", editar: editar(funil + "/membros/index.html") });
  add("Páginas", "Agenda de jejum", "/membros/agenda", "pagina", { editar: editar(funil + "/membros/agenda.html") });
  add("Páginas", "Lista de e-books", "/membros/conteudo", "pagina", { editar: editar(funil + "/membros/conteudo.html") });
  add("Páginas", "Leitor de e-book", "/membros/modulo", "pagina", { editar: editar(funil + "/membros/modulo.html") });

  add("Checkouts", "Checkout do front", CFG.checkout, "checkout", { editar: editar(funil + "/config.js", "checkout:") });
  add("Checkouts", "Checkout do upsell", M.QUIZ.checkoutUpsell, "checkout", { editar: editar(funil + "/membros/js/config.js", "checkoutUpsell") });
  add("Checkouts", "Checkout do downsell", M.QUIZ.checkoutDownsell, "checkout", { editar: editar(funil + "/membros/js/config.js", "checkoutDownsell") });

  add("Vídeos", "VSL do front", CFG.vsl.src, "video", { editar: editar(funil + "/config.js", "src:") });
  add("Vídeos", "VSL do upsell", M.QUIZ.vsl.src, "video", { editar: editar(funil + "/membros/js/config.js", "src:") });

  add("Área de membros", "Sistema de login e acesso", "/membros/api/estado.php", "api", { contem: "destino", editar: editar("api/membros.js") });
  add("Área de membros", "Suporte no WhatsApp", "https://wa.me/" + M.SUPORTE_WHATSAPP.numero, "link", { editar: editar(funil + "/membros/js/config.js", "SUPORTE_WHATSAPP =") });
  Object.keys(wm.MODULOS).forEach((prod) => {
    wm.MODULOS[prod].modulos.forEach((m) => {
      const n = (m.paginas || []).length, pag = (i) => PASTA + "p/" + m.id + "/pagina-" + String(i).padStart(3, "0") + ".jpg";
      add("E-books", m.titulo + (prod === "upsell" ? " (upsell)" : ""), PASTA + m.pdf, "ebook",
        { paginas: n ? [pag(1), pag(n)] : [], editar: editar(funil + "/membros/js/modulos.js", '"id": "' + m.id + '"') });
    });
  });

  add("Arquivos do site", "Motor do funil (motor.js)", "/motor.js", "script", { contem: "SJ_", editar: editar("motor/motor.js") });
  add("Arquivos do site", "Configuração do front (config.js)", "/config.js", "script", { contem: "SJ_CFG", editar: editar(funil + "/config.js") });
  add("Arquivos do site", "Telas do quiz (telas.js)", "/telas.js", "script", { contem: "SJ_TELAS", editar: editar(funil + "/telas.js") });
  add("Arquivos do site", "Configuração da área (membros)", "/membros/js/config.js", "script", { contem: "QUIZ", editar: editar(funil + "/membros/js/config.js") });

  add("Rastreamento", "Pixel do Meta no front", "/", "pagina", { contem: pixel ? "fbq('init', '" + pixel + "')" : "fbq('init'", detalhe: pixel ? "Pixel " + pixel : "", editar: editar(funil + "/index.html", "fbq('init'") });
  add("Rastreamento", "Pixel do Meta no obrigado", "/obrigado", "pagina", { contem: pixel ? "fbq('init', '" + pixel + "')" : "fbq('init'", detalhe: pixel ? "Pixel " + pixel : "", editar: editar(funil + "/obrigado.html", "fbq('init'") });
  add("Rastreamento", "Contador do Flowex (rastro.js)", "/rastro.js", "script", { contem: "SJ_RASTRO", editar: editar(funil + "/rastro.js") });
  add("Rastreamento", "Recebimento das visitas (api/ev)", "/api/ev", "api", { metodo: "POST", status: [204], editar: editar("api/ev.js") });
  add("Rastreamento", "Webhook de vendas da Cakto", "/api/cakto", "api", { contem: "webhook", editar: editar("api/cakto.js") });

  fs.writeFileSync(path.join(dist, "e-368c4e0875", "flowex-check.json"), JSON.stringify({ produto: funil, gerado: new Date().toISOString(), itens }));
  console.log("Verificação do Flowex: " + itens.length + " itens");
}
