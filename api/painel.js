/* API do painel de retenção (/painel). Login por e-mail e senha; os números vêm dos contadores do api/ev.js
   e das vendas contadas no webhook da Cakto.
   ?acao=login | sair | eu | dados | senha */
const crypto = require("crypto");
const { segredo, pipeline, hojeBR, cmd, json, corpo } = require("./_lib");

// Quem entra no painel. A senha inicial é a mesma para todos (guardada só como hash);
// cada um pode trocar a sua dentro do painel (a nova fica no banco e passa a valer no lugar da inicial).
const USUARIOS = {
  "asmcholding@gmail.com": { nome: "Attila", papel: "Administrador" },
  "wanderverdigital@gmail.com": { nome: "Gleidson", papel: "Sócio" },
  "portalsistemas4@gmail.com": { nome: "Murillo", papel: "Sócio" }
};
const SENHA_INICIAL = "9e126aaec183217919ae366dd0896afa:4251fbc9f9c7f3d1d75b66cd11c91826ecf965022b08448041d18134940d99a1";
const FUNIS = { jejum: "Seca Jejum" };
// Produtos do Flowex: cada um tem o seu funil (dados) e as suas VSLs. Novo produto = novo item aqui.
const PRODUTOS = {
  jejum: {
    nome: "Seca Jejum", sub: "Jejum com água · infoproduto", dominio: "secajejum.fit", cor: "#22c55e", sigla: "SJ", funil: "jejum",
    vsls: [
      { id: "front", nome: "VSL do front", onde: "Tela 34 do quiz (oferta do Plano de Jejum)", pitch: 175, cta: 164,
        src: "https://vz-fc9df7e8-845.b-cdn.net/d826a593-fa31-4b6f-9aa0-45c29e6b5fe1/playlist.m3u8", clique: "checkout", venda: "front", grupoClique: "front" },
      { id: "upsell", nome: "VSL do upsell", onde: "Oferta do Chá Turbo na área de membros", pitch: 210, cta: 249,
        src: "https://vz-fc9df7e8-845.b-cdn.net/2a5ee7a2-ae5c-4d58-8517-d8129560f54a/playlist.m3u8", clique: "oferta-quero", venda: "upsell", grupoClique: "pos" }
    ]
  }
};
const STATUS_CRIATIVO = ["ideia", "producao", "teste", "aprovado", "escala", "pausado", "reprovado"];

const COOKIE = "sjp_s", DURA = 60 * 60 * 24 * 30;
const hashSenha = (senha, sal) => crypto.scryptSync(String(senha), sal, 32, { N: 16384, r: 8, p: 1 }).toString("hex");
function confere(senha, guardada) {
  const [sal, h] = String(guardada).split(":");
  const a = Buffer.from(hashSenha(senha, sal), "hex"), b = Buffer.from(h, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
async function assinatura(txt) { return crypto.createHmac("sha256", "painel:" + (await segredo())).update(txt).digest("base64url"); }
async function criarSessao(res, email) {
  const txt = Buffer.from(email + "|" + (Date.now() + DURA * 1000)).toString("base64url");
  res.setHeader("Set-Cookie", COOKIE + "=" + txt + "." + (await assinatura(txt)) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + DURA);
}
async function quem(req) {
  const m = String(req.headers.cookie || "").match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)"));
  if (!m) return null;
  const [txt, sig] = m[1].split(".");
  if (!txt || !sig) return null;
  const certo = await assinatura(txt);
  if (sig.length !== certo.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(certo))) return null;
  const [email, ate] = Buffer.from(txt, "base64url").toString().split("|");
  if (!USUARIOS[email] || Number(ate) < Date.now()) return null;
  return email;
}

const tentativas = new Map();
function limitado(req) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0] || "x";
  const agora = Date.now(), t = (tentativas.get(ip) || []).filter((x) => agora - x < 15 * 60 * 1000);
  t.push(agora); tentativas.set(ip, t);
  return t.length > 10;
}

// Lista de dias entre duas datas (no máximo 400)
function dias(de, ate) {
  const ok = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!ok(de) || !ok(ate) || de > ate) return null;
  const out = []; let d = new Date(de + "T12:00:00Z"); const fim = new Date(ate + "T12:00:00Z");
  while (d <= fim && out.length < 400) { out.push(d.toISOString().slice(0, 10)); d = new Date(d.getTime() + 864e5); }
  return out;
}
const objeto = (arr) => { const o = {}; for (let i = 0; arr && i < arr.length; i += 2) o[arr[i]] = Number(arr[i + 1]) || 0; return o; };

module.exports = async (req, res) => {
  const q = new URL(req.url, "http://x").searchParams;
  const acao = String((req.query && req.query.acao) || q.get("acao") || "");

  if (acao === "login") {
    if (req.method !== "POST") return json(res, 405, { ok: false });
    if (limitado(req)) return json(res, 429, { ok: false, erro: "Muitas tentativas. Aguarde 15 minutos." });
    const b = await corpo(req);
    const email = String(b.email || "").trim().toLowerCase();
    const u = USUARIOS[email];
    const guardada = u ? (await cmd("GET", "sjf:painel:senha:" + email)) || SENHA_INICIAL : SENHA_INICIAL;
    const certo = confere(b.senha || "", guardada);          // confere sempre (mesmo tempo para e-mail certo ou errado)
    if (!u || !certo) return json(res, 401, { ok: false, erro: "E-mail ou senha incorretos." });
    await criarSessao(res, email);
    return json(res, 200, { ok: true, nome: u.nome });
  }
  if (acao === "sair") {
    res.setHeader("Set-Cookie", COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    return json(res, 200, { ok: true });
  }

  const email = await quem(req);
  if (!email) return json(res, 401, { ok: false, erro: "login" });

  if (acao === "eu") return json(res, 200, { ok: true, nome: USUARIOS[email].nome, email, funis: FUNIS, produtos: PRODUTOS, hoje: hojeBR(),
    membros: Object.entries(USUARIOS).map(([e, u]) => ({ nome: u.nome, email: e, papel: u.papel })) });

  /* ---------- Criativos (preenchidos à mão pela equipe; ficam no histórico) ---------- */
  if (acao === "criativos" || acao === "criativo" || acao === "cr-excluir" || acao === "cr-img") {
    const prod = PRODUTOS[q.get("p")] ? q.get("p") : null;
    if (!prod) return json(res, 400, { ok: false, erro: "Produto inválido." });
    const CH = "sjf:cr:" + prod, txt = (v, n) => String(v == null ? "" : v).slice(0, n);
    const num = (v) => { const n = Number(String(v).replace(",", ".")); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };
    const lerTodos = async () => { const v = await cmd("GET", CH); try { return v ? JSON.parse(v) : []; } catch (e) { return []; } };
    if (acao === "cr-img") {
      const img = await cmd("GET", CH + ":img:" + txt(q.get("id"), 40));
      if (!img) { res.statusCode = 404; return res.end(); }
      const m = String(img).match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
      if (!m) { res.statusCode = 404; return res.end(); }
      res.statusCode = 200; res.setHeader("Content-Type", m[1]); res.setHeader("Cache-Control", "private, max-age=86400");
      return res.end(Buffer.from(m[2], "base64"));
    }
    if (acao === "criativos") return json(res, 200, { ok: true, lista: await lerTodos() });
    if (req.method !== "POST") return json(res, 405, { ok: false });
    const b = await corpo(req), lista = await lerTodos(), quem = USUARIOS[email].nome, agora = new Date().toISOString();
    if (acao === "cr-excluir") {
      const nova = lista.filter((c) => c.id !== b.id);
      await cmd("SET", CH, JSON.stringify(nova)); await cmd("SET", CH + ":img:" + txt(b.id, 40), "");
      return json(res, 200, { ok: true });
    }
    // salvar (novo ou edição) + opcionalmente uma nova linha de métricas
    let c = lista.find((x) => x.id === b.id);
    if (!c) { c = { id: crypto.randomBytes(6).toString("hex"), criadoEm: agora, criadoPor: quem, metricas: [], historico: [] }; lista.unshift(c); }
    const antes = c.status;
    c.nome = txt(b.nome, 120) || c.nome || "Criativo sem nome";
    c.data = /^\d{4}-\d{2}-\d{2}$/.test(b.data) ? b.data : c.data || hojeBR();
    c.status = STATUS_CRIATIVO.includes(b.status) ? b.status : c.status || "teste";
    c.formato = txt(b.formato, 30) || c.formato || "";
    c.angulo = txt(b.angulo, 160); c.plataforma = txt(b.plataforma, 40) || c.plataforma || "Meta";
    c.link = /^https?:\/\//.test(b.link || "") ? txt(b.link, 400) : ""; c.notas = txt(b.notas, 2000); c.campanha = txt(b.campanha, 80);
    c.atualizadoEm = agora; c.atualizadoPor = quem;
    if (antes && antes !== c.status) c.historico = (c.historico || []).concat({ em: agora, por: quem, de: antes, para: c.status }).slice(-50);
    if (b.imagem && /^data:image\/(jpeg|png|webp);base64,/.test(b.imagem) && b.imagem.length < 900000) {
      await cmd("SET", CH + ":img:" + c.id, b.imagem); c.temImagem = true; c.imgVer = Date.now();
    }
    if (b.metrica) {
      const m = b.metrica, r = { data: /^\d{4}-\d{2}-\d{2}$/.test(m.data) ? m.data : hojeBR(), por: quem };
      ["gasto", "impressoes", "cliques", "ctr", "cpc", "cpm", "vendas", "receita"].forEach((k) => { const v = num(m[k]); if (v != null) r[k] = v; });
      if (r.ctr == null && r.cliques != null && r.impressoes) r.ctr = Math.round(r.cliques / r.impressoes * 10000) / 100;
      if (r.cpc == null && r.gasto != null && r.cliques) r.cpc = Math.round(r.gasto / r.cliques * 100) / 100;
      if (r.cpm == null && r.gasto != null && r.impressoes) r.cpm = Math.round(r.gasto / r.impressoes * 100000) / 100;
      if (r.gasto != null && r.vendas) r.cpa = Math.round(r.gasto / r.vendas * 100) / 100;
      if (r.gasto && r.receita != null) r.roas = Math.round(r.receita / r.gasto * 100) / 100;
      c.metricas = (c.metricas || []).concat(r).sort((a, z) => (a.data < z.data ? -1 : 1)).slice(-200);
    }
    if (b.removerMetrica != null) c.metricas = (c.metricas || []).filter((x, i) => i !== Number(b.removerMetrica));
    await cmd("SET", CH, JSON.stringify(lista.slice(0, 500)));
    return json(res, 200, { ok: true, criativo: c });
  }

  if (acao === "senha") {
    if (req.method !== "POST") return json(res, 405, { ok: false });
    const b = await corpo(req);
    const guardada = (await cmd("GET", "sjf:painel:senha:" + email)) || SENHA_INICIAL;
    if (!confere(b.atual || "", guardada)) return json(res, 400, { ok: false, erro: "A senha atual não confere." });
    if (String(b.nova || "").length < 8) return json(res, 400, { ok: false, erro: "A nova senha precisa ter pelo menos 8 caracteres." });
    const sal = crypto.randomBytes(16).toString("hex");
    await cmd("SET", "sjf:painel:senha:" + email, sal + ":" + hashSenha(b.nova, sal));
    return json(res, 200, { ok: true });
  }

  // Posição das telas na visão Flow (compartilhada pela equipe)
  if (acao === "layout") {
    const f = FUNIS[q.get("f")] ? q.get("f") : "jejum", g = ["front", "pos", "ofertas", "entrega", "completo"].includes(q.get("g")) ? q.get("g") : "front";
    const chave = "sjf:painel:layout:" + f + ":" + g;
    if (req.method === "GET") { const v = await cmd("GET", chave); return json(res, 200, { ok: true, pos: v ? JSON.parse(v) : null }); }
    const b = await corpo(req), pos = {};
    Object.entries(b.pos || {}).slice(0, 200).forEach(([k, v]) => {
      if (/^[a-z0-9-]{1,40}$/.test(k) && Array.isArray(v) && v.length === 2 && v.every((n) => Number.isFinite(n) && Math.abs(n) < 1e5)) pos[k] = [Math.round(v[0]), Math.round(v[1])];
    });
    if (b.limpar) await cmd("SET", chave, ""); else await cmd("SET", chave, JSON.stringify(pos));
    return json(res, 200, { ok: true });
  }

  if (acao === "dados") {
    const f = FUNIS[q.get("f")] ? q.get("f") : "jejum";
    const grupos = q.get("g") === "todos" ? ["front", "pos", "vsl"] : [["pos", "vsl"].includes(q.get("g")) ? q.get("g") : "front"];
    const lista = dias(q.get("de") || hojeBR(), q.get("ate") || hojeBR());
    if (!lista) return json(res, 400, { ok: false, erro: "Período inválido." });
    const camp = String(q.get("c") || "");
    const cmds = [], POR = grupos.length * 2 + 2;
    lista.forEach((d) => {
      grupos.forEach((g) => { cmds.push(["HGETALL", "an:" + f + ":" + g + ":" + d]); cmds.push(["HGETALL", "an:" + f + ":" + g + ":" + d + ":camp"]); });
      cmds.push(["HGETALL", "an:" + f + ":vendas:" + d]);
      cmds.push(["PFCOUNT", "an:" + f + ":clientes:" + d]);
    });
    cmds.push(["PFCOUNT"].concat(lista.map((d) => "an:" + f + ":clientes:" + d)));      // clientes únicos no período inteiro
    const r = await pipeline(cmds);
    const passos = {}, vendas = {}, campanhas = {}, porDia = [];
    lista.forEach((d, i) => {
      const doDia = {}, base = i * POR;
      grupos.forEach((g, gi) => {
        const geral = objeto(r[base + gi * 2]), porCamp = objeto(r[base + gi * 2 + 1]);
        Object.entries(porCamp).forEach(([k, n]) => { const [c, p] = k.split("|"); campanhas[c] = (campanhas[c] || 0) + n; if (camp && c === camp) doDia[p] = (doDia[p] || 0) + n; });
        if (!camp) Object.entries(geral).forEach(([p, n]) => (doDia[p] = (doDia[p] || 0) + n));
      });
      const v = objeto(r[base + grupos.length * 2]), cli = Number(r[base + grupos.length * 2 + 1]) || 0;
      Object.entries(doDia).forEach(([p, n]) => (passos[p] = (passos[p] || 0) + n));
      Object.entries(v).forEach(([k, n]) => (vendas[k] = (vendas[k] || 0) + n));
      porDia.push({ dia: d, passos: doDia, vendas: v, clientes: cli });
    });
    return json(res, 200, { ok: true, f, de: lista[0], ate: lista[lista.length - 1], campanha: camp || null,
      passos, vendas, clientes: Number(r[r.length - 1]) || 0, campanhas: Object.keys(campanhas).sort((a, b) => campanhas[b] - campanhas[a]), porDia });
  }
  return json(res, 404, { ok: false });
};
