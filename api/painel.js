/* API do painel de retenção (/painel). Login por e-mail e senha; os números vêm dos contadores do api/ev.js
   e das vendas contadas no webhook da Cakto.
   ?acao=login | sair | eu | dados | senha */
const crypto = require("crypto");
const { segredo, pipeline, hojeBR, cmd, json, corpo } = require("./_lib");

// Quem entra no painel. A senha inicial é a mesma para todos (guardada só como hash);
// cada um pode trocar a sua dentro do painel (a nova fica no banco e passa a valer no lugar da inicial).
const USUARIOS = {
  "asmcholding@gmail.com": { nome: "Attila" },
  "wanderverdigital@gmail.com": { nome: "Gleidson" },
  "portalsistemas4@gmail.com": { nome: "Murillo" }
};
const SENHA_INICIAL = "9e126aaec183217919ae366dd0896afa:4251fbc9f9c7f3d1d75b66cd11c91826ecf965022b08448041d18134940d99a1";
const FUNIS = { jejum: "Seca Jejum" };

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

  if (acao === "eu") return json(res, 200, { ok: true, nome: USUARIOS[email].nome, email, funis: FUNIS, hoje: hojeBR() });

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

  if (acao === "dados") {
    const f = FUNIS[q.get("f")] ? q.get("f") : "jejum";
    const g = q.get("g") === "pos" ? "pos" : "front";
    const lista = dias(q.get("de") || hojeBR(), q.get("ate") || hojeBR());
    if (!lista) return json(res, 400, { ok: false, erro: "Período inválido." });
    const camp = String(q.get("c") || "");
    const cmds = [];
    lista.forEach((d) => {
      cmds.push(["HGETALL", "an:" + f + ":" + g + ":" + d]);
      cmds.push(["HGETALL", "an:" + f + ":" + g + ":" + d + ":camp"]);
      cmds.push(["HGETALL", "an:" + f + ":vendas:" + d]);
    });
    const r = await pipeline(cmds);
    const passos = {}, vendas = {}, campanhas = {}, porDia = [];
    lista.forEach((d, i) => {
      const geral = objeto(r[i * 3]), porCamp = objeto(r[i * 3 + 1]), v = objeto(r[i * 3 + 2]);
      let doDia = geral;
      if (camp) {
        doDia = {};
        Object.entries(porCamp).forEach(([k, n]) => { const [c, p] = k.split("|"); if (c === camp) doDia[p] = (doDia[p] || 0) + n; });
      }
      Object.entries(porCamp).forEach(([k, n]) => { const [c] = k.split("|"); campanhas[c] = (campanhas[c] || 0) + n; });
      Object.entries(doDia).forEach(([p, n]) => (passos[p] = (passos[p] || 0) + n));
      Object.entries(v).forEach(([k, n]) => (vendas[k] = (vendas[k] || 0) + n));
      porDia.push({ dia: d, passos: doDia, vendas: v });
    });
    return json(res, 200, { ok: true, f, g, de: lista[0], ate: lista[lista.length - 1], campanha: camp || null,
      passos, vendas, campanhas: Object.keys(campanhas).sort((a, b) => campanhas[b] - campanhas[a]), porDia });
  }
  return json(res, 404, { ok: false });
};
