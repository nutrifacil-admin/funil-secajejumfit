/* API da área de membros (/membros/). As páginas chamam api/<acao>.php e o vercel.json manda para cá:
   login | estado | respostas | concluir-funil | sair | arquivo
   Quem identifica a pessoa é o cookie de sessão; o e-mail só é enviado no login. */
const crypto = require("crypto");
const { normEmail, lerCliente, salvarCliente, criarSessao, sairSessao, emailDaSessao, json, corpo, pipeline, hojeBR } = require("./_lib");
// Painel: cliente único que acessou a área no dia (HyperLogLog com um hash do e-mail, nunca o e-mail)
function contarAcesso(email) { pipeline([["PFADD", "an:jejum:clientes:" + hojeBR(), crypto.createHash("sha256").update("sjf|" + email).digest("hex").slice(0, 24)]]).catch(() => {}); }

const PASTA = "/e-368c4e0875/";
// E-books: id do módulo → PDF (as páginas ficam em /e-368c4e0875/p/<id>/pagina-001.jpg …)
const EBOOKS = {
  front: {
    "01-metodo-seca-jejum": "SJF-01-metodo-seca-jejum.pdf",
    "03-receitas-para-quebrar-o-jejum": "SJF-02-receitas-para-quebrar-o-jejum.pdf",
    "04-protocolo-anti-efeito-sanfona": "SJF-03-protocolo-anti-efeito-sanfona.pdf",
    "05-bonus-reset-intestinal-48h": "SJF-04-bonus-reset-intestinal-48h.pdf"
  },
  upsell: {
    "01-cha-turbo-seca": "CTS-01-cha-turbo-seca.pdf",
    "02-bebidas-anti-fome": "CTS-02-bebidas-anti-fome.pdf",
    "03-queima-noturna": "CTS-03-queima-noturna.pdf",
    "04-guia-do-corpo-leve": "CTS-04-guia-do-corpo-leve.pdf",
    "05-bonus-libido-em-alta": "CTS-05-bonus-libido-em-alta.pdf",
    "06-bonus-7-dias-para-secar": "CTS-06-bonus-7-dias-para-secar.pdf",
    "07-bonus-definicao-de-metas": "CTS-07-bonus-definicao-de-metas.pdf",
    "08-bonus-antiprocrastinacao": "CTS-08-bonus-antiprocrastinacao.pdf"
  }
};

const tentativas = new Map();     // limite simples por IP (por instância)
function limitado(req) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0] || "x";
  const agora = Date.now(), t = (tentativas.get(ip) || []).filter((x) => agora - x < 10 * 60 * 1000);
  t.push(agora); tentativas.set(ip, t);
  return t.length > 20;
}
const destinoDe = (c) => (c.funil || c.cha ? "membros" : "quiz");

// Respostas do quiz (o servidor confere cada campo). Horários em minutos desde a meia-noite, ou "pula".
function validar(r) {
  const n = (v, a, b) => { v = Number(v); return Number.isFinite(v) && v >= a && v <= b ? Math.round(v) : null; };
  const hora = (v) => (typeof v === "string" && /^\d{1,2}:\d{2}$/.test(v) ? (() => { const [h, m] = v.split(":").map(Number); return h * 60 + m; })() : n(v, 0, 1439));
  const o = {};
  o.genero = ["mulher", "homem"].includes(r.genero) ? r.genero : null;
  o.idade = n(r.idade, 18, 99); o.altura = n(r.altura, 120, 230); o.peso = n(r.peso, 35, 300);
  o.saude = ["gravida", "amamentando", "diabetes", "nenhuma"].includes(r.saude) ? r.saude : "nenhuma";
  o.acorda = hora(r.acorda); o.dorme = hora(r.dorme);
  for (const k of ["cafe", "almoco", "lanche", "janta"]) { const h = r[k] === "pula" ? "pula" : hora(r[k]); o[k] = h == null ? "pula" : h; }
  o.restricoes = Array.isArray(r.restricoes) ? r.restricoes.filter((x) => ["lactose", "gluten", "vegetariana"].includes(x)) : [];
  o.fome = ["cafe", "almoco", "lanche", "janta"].includes(r.fome) ? r.fome : null;
  o.pausaFds = r.pausaFds === true;
  if (!o.idade || !o.altura || !o.peso || o.acorda == null || o.dorme == null) return null;
  let dif = o.dorme - o.acorda; if (dif <= 0) dif += 1440;
  if (dif < 6 * 60) return null;                    // acordar e dormir perto demais
  return o;
}

function ir(res, url) {
  res.statusCode = 302; res.setHeader("Location", url); res.setHeader("Cache-Control", "no-store"); res.end();
}
function texto(res, status, t) {
  res.statusCode = status; res.setHeader("Content-Type", "text/plain; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(t);
}

module.exports = async (req, res) => {
  const q = new URL(req.url, "http://x").searchParams;
  const acao = String((req.query && req.query.acao) || q.get("acao") || "");

  if (acao === "login") {
    if (req.method !== "POST") return json(res, 405, { ok: false });
    if (limitado(req)) return json(res, 429, { ok: false, erro: "limite" });
    const b = await corpo(req);
    const email = normEmail(b.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(res, 400, { ok: false, erro: "invalido" });
    const c = await lerCliente(email);
    if (!c || !(c.front || c.cha)) return json(res, 404, { ok: false, erro: "nao_encontrado" });
    await criarSessao(res, email);
    return json(res, 200, { ok: true, destino: destinoDe(c) });
  }

  if (acao === "sair") { sairSessao(res); return json(res, 200, { ok: true }); }

  const email = await emailDaSessao(req);
  const c = email ? await lerCliente(email) : null;
  if (!c) {
    if (acao === "estado") return json(res, 200, { destino: "login", front: false, upsell: false });
    if (acao === "arquivo") return texto(res, 403, "Faça login para ver este conteúdo.");
    return json(res, 401, { ok: false, semLogin: true });
  }

  if (acao === "estado") { await contarAcesso(email); return json(res, 200, { destino: destinoDe(c), front: !!c.front, upsell: !!c.cha }); }

  if (acao === "respostas") {
    if (req.method === "GET") {
      await contarAcesso(email);
      const r = c.respostas && typeof c.respostas.acorda === "number" ? c.respostas : (c.respostas ? validar(c.respostas) : null);
      return json(res, 200, { ok: true, respostas: r || null });
    }
    const b = await corpo(req);
    const r = validar(Object.assign({}, b.respostas || {}));
    if (!r) return json(res, 400, { ok: false, erro: "respostas" });
    c.respostas = r; c.respondidoEm = new Date().toISOString();
    await salvarCliente(email, c);
    return json(res, 200, { ok: true });
  }

  if (acao === "concluir-funil") {                  // respondeu a oferta: o funil não aparece mais
    if (!c.funil) { c.funil = true; c.funilEm = new Date().toISOString(); await salvarCliente(email, c); }
    return json(res, 200, { ok: true });
  }

  if (acao === "arquivo") {
    const produto = q.get("produto"), modulo = q.get("modulo"), arquivo = q.get("arquivo") || "";
    const pdf = EBOOKS[produto] && EBOOKS[produto][modulo];
    if (!pdf) return texto(res, 404, "Arquivo não encontrado.");
    if (produto === "upsell" && !c.cha) return texto(res, 403, "Conteúdo bloqueado.");
    if (/^pagina-\d{3}\.jpg$/.test(arquivo)) return ir(res, PASTA + "p/" + modulo + "/" + arquivo);
    if (arquivo === pdf) return ir(res, PASTA + (q.get("baixar") ? "baixar/" : "") + pdf);
    return texto(res, 404, "Arquivo não encontrado.");
  }

  return json(res, 404, { ok: false });
};
