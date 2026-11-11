/* API da área de membros. /api/m?a=login | estado | respostas | concluir | pdf | sair */
const { PDFS, PASTA_PDF, normEmail, lerCliente, salvarCliente, criarSessao, sairSessao, emailDaSessao, json, corpo, cmd, PRE } = require("./_lib");

const tentativas = new Map();     // limite simples por IP (por instância)
function limitado(req) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0] || "x";
  const agora = Date.now(), t = (tentativas.get(ip) || []).filter((x) => agora - x < 10 * 60 * 1000);
  t.push(agora); tentativas.set(ip, t);
  return t.length > 20;
}
const destinoDe = (c) => (c.funil ? "membros" : "quiz");

// Respostas aceitas (o servidor confere cada uma)
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
function validar(r) {
  const o = {};
  if (["mulher", "homem"].includes(r.genero)) o.genero = r.genero;
  const n = (v, a, b) => { v = Number(v); return Number.isFinite(v) && v >= a && v <= b ? Math.round(v) : null; };
  o.idade = n(r.idade, 18, 99); o.altura = n(r.altura, 120, 230); o.peso = n(r.peso, 35, 300);
  o.saude = ["gravida", "amamentando", "diabetes", "nenhuma"].includes(r.saude) ? r.saude : "nenhuma";
  for (const k of ["acorda", "dorme"]) o[k] = HORA.test(r[k]) ? r[k] : null;
  for (const k of ["cafe", "almoco", "lanche", "janta"]) o[k] = r[k] === "pula" ? "pula" : HORA.test(r[k]) ? r[k] : "pula";
  o.restricoes = Array.isArray(r.restricoes) ? r.restricoes.filter((x) => ["lactose", "gluten", "vegetariana"].includes(x)) : [];
  o.fome = ["cafe", "almoco", "lanche", "janta"].includes(r.fome) ? r.fome : null;
  o.pausaFds = r.pausaFds === true;
  if (!o.idade || !o.altura || !o.peso || !o.acorda || !o.dorme) return null;
  const m = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
  let dif = m(o.dorme) - m(o.acorda); if (dif <= 0) dif += 1440;
  if (dif < 8 * 60) return null;                    // acordar e dormir perto demais
  return o;
}

module.exports = async (req, res) => {
  const a = String((req.query && req.query.a) || new URL(req.url, "http://x").searchParams.get("a") || "");

  if (a === "login") {
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

  if (a === "sair") { sairSessao(res); return json(res, 200, { ok: true }); }

  const email = await emailDaSessao(req);
  const c = email ? await lerCliente(email) : null;
  if (!c) {
    if (a === "pdf") { res.statusCode = 302; res.setHeader("Location", "/membros"); return res.end(); }
    return json(res, 401, { ok: false, destino: "login" });
  }

  if (a === "estado") {
    return json(res, 200, { ok: true, destino: destinoDe(c), nome: c.nome || "", front: !!c.front, cha: !!c.cha, temRespostas: !!c.respostas });
  }

  if (a === "respostas") {
    if (req.method === "GET") return json(res, 200, { ok: true, respostas: c.respostas || null, cha: !!c.cha });
    const b = await corpo(req);
    const r = validar(Object.assign({}, c.respostas || {}, b.respostas || {}));
    if (!r) return json(res, 400, { ok: false, erro: "respostas" });
    c.respostas = r; c.respondidoEm = new Date().toISOString();
    await salvarCliente(email, c);
    return json(res, 200, { ok: true, respostas: r });
  }

  if (a === "concluir") {                            // respondeu a oferta: o funil não aparece mais
    if (!c.funil) { c.funil = true; c.funilEm = new Date().toISOString(); await salvarCliente(email, c); }
    return json(res, 200, { ok: true });
  }

  if (a === "pdf") {
    const id = String((req.query && req.query.id) || new URL(req.url, "http://x").searchParams.get("id") || "");
    const p = PDFS[id];
    if (!p) return json(res, 404, { ok: false });
    if (!c[p.precisa]) { res.statusCode = 302; res.setHeader("Location", "/membros#conteudo-cha"); return res.end(); }
    res.statusCode = 302; res.setHeader("Location", PASTA_PDF + p.arquivo); res.setHeader("Cache-Control", "no-store");
    return res.end();
  }

  if (a === "log") {                                 // conferência do webhook (só para quem está logado)
    const l = await cmd("LRANGE", PRE + "log", 0, 19);
    return json(res, 200, { ok: true, ultimas: (l || []).map((x) => JSON.parse(x)) });
  }
  return json(res, 404, { ok: false });
};
