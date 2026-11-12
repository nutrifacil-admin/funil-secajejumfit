/* Base do servidor (Vercel Functions): banco Upstash Redis, sessão por cookie e configuração dos produtos. */
const crypto = require("crypto");

// Ofertas da Cakto (código do link de checkout) → o que cada uma libera
const OFERTAS = {
  fk5jcvn: { libera: "front", venda: "front", nome: "Seca Jejum (front)" },
  "35ocedw": { libera: "cha", venda: "upsell", nome: "Chá Turbo Seca (upsell R$47)" },
  muqb3ft: { libera: "cha", venda: "downsell", nome: "Chá Turbo Seca (downsell R$23)" }
};
const PASTA_PDF = "/e-368c4e0875/";           // pasta dos PDFs no site (só chega lá quem passa pelo login)
const PDFS = {
  "SJF-01": { arquivo: "SJF-01-metodo-seca-jejum.pdf", precisa: "front" },
  "SJF-02": { arquivo: "SJF-02-receitas-para-quebrar-o-jejum.pdf", precisa: "front" },
  "SJF-03": { arquivo: "SJF-03-protocolo-anti-efeito-sanfona.pdf", precisa: "front" },
  "SJF-04": { arquivo: "SJF-04-bonus-reset-intestinal-48h.pdf", precisa: "front" },
  "CTS-01": { arquivo: "CTS-01-cha-turbo-seca.pdf", precisa: "cha" },
  "CTS-02": { arquivo: "CTS-02-bebidas-anti-fome.pdf", precisa: "cha" },
  "CTS-03": { arquivo: "CTS-03-queima-noturna.pdf", precisa: "cha" },
  "CTS-04": { arquivo: "CTS-04-guia-do-corpo-leve.pdf", precisa: "cha" },
  "CTS-05": { arquivo: "CTS-05-bonus-libido-em-alta.pdf", precisa: "cha" },
  "CTS-06": { arquivo: "CTS-06-bonus-7-dias-para-secar.pdf", precisa: "cha" },
  "CTS-07": { arquivo: "CTS-07-bonus-definicao-de-metas.pdf", precisa: "cha" },
  "CTS-08": { arquivo: "CTS-08-bonus-antiprocrastinacao.pdf", precisa: "cha" }
};

/* ---------- Banco (Upstash Redis pela API REST; sem banco configurado usa memória, só para teste local) ---------- */
const URL_DB = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_DB = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const memoria = global.__SJF_MEM || (global.__SJF_MEM = new Map());

async function cmd(...args) {
  if (!URL_DB) {                                   // teste local
    const [c, k, v] = args;
    if (c === "GET") return memoria.has(k) ? memoria.get(k) : null;
    if (c === "SET") { memoria.set(k, v); return "OK"; }
    if (c === "LPUSH") { const l = memoria.get(k) || []; l.unshift(v); memoria.set(k, l); return l.length; }
    if (c === "LTRIM") { const l = memoria.get(k) || []; memoria.set(k, l.slice(args[2], args[3] + 1)); return "OK"; }
    if (c === "LRANGE") return (memoria.get(k) || []).slice(args[2], args[3] + 1);
    return null;
  }
  const r = await fetch(URL_DB, { method: "POST", headers: { Authorization: "Bearer " + TOKEN_DB, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
// Vários comandos numa ida só (pipeline do Upstash). Sem banco: executa um a um na memória.
async function pipeline(lista) {
  if (!lista.length) return [];
  if (!URL_DB) {
    const out = [];
    for (const [c, k, f, v] of lista) {
      if (c === "HINCRBY") { const h = memoria.get(k) || {}; h[f] = (Number(h[f]) || 0) + Number(v); memoria.set(k, h); out.push(h[f]); }
      else if (c === "HGETALL") { const h = memoria.get(k) || {}; out.push(Object.entries(h).flat().map(String)); }
      else if (c === "SET") { if (v === "NX" && memoria.has(k)) out.push(null); else { memoria.set(k, f); out.push("OK"); } }
      else out.push(await cmd(c, k, f, v));
    }
    return out;
  }
  const r = await fetch(URL_DB.replace(/\/$/, "") + "/pipeline", { method: "POST", headers: { Authorization: "Bearer " + TOKEN_DB, "Content-Type": "application/json" }, body: JSON.stringify(lista) });
  const j = await r.json();
  return j.map((x) => (x.error ? null : x.result));
}
// Data de hoje no horário de Brasília (AAAA-MM-DD)
function hojeBR(d) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(d || new Date());
}
const PRE = "sjf:";
const normEmail = (e) => String(e || "").trim().toLowerCase();
async function lerCliente(email) {
  const v = await cmd("GET", PRE + "c:" + normEmail(email));
  return v ? JSON.parse(v) : null;
}
async function salvarCliente(email, dados) {
  await cmd("SET", PRE + "c:" + normEmail(email), JSON.stringify(dados));
}
async function config(nome, gerar) {
  let v = await cmd("GET", PRE + "cfg:" + nome);
  if (!v && gerar) { v = gerar(); await cmd("SET", PRE + "cfg:" + nome, v); }
  return v;
}

/* ---------- Sessão: cookie assinado com o e-mail ---------- */
const COOKIE = "sjf_s";
async function segredo() {
  return process.env.SESSION_SECRET || config("segredo_sessao", () => crypto.randomBytes(32).toString("hex"));
}
function b64(s) { return Buffer.from(s).toString("base64url"); }
async function criarSessao(res, email) {
  const e = b64(normEmail(email));
  const sig = crypto.createHmac("sha256", await segredo()).update(e).digest("base64url");
  res.setHeader("Set-Cookie", COOKIE + "=" + e + "." + sig + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + 60 * 60 * 24 * 180);
}
function sairSessao(res) {
  res.setHeader("Set-Cookie", COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
}
async function emailDaSessao(req) {
  const m = String(req.headers.cookie || "").match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)"));
  if (!m) return null;
  const [e, sig] = m[1].split(".");
  if (!e || !sig) return null;
  const certo = crypto.createHmac("sha256", await segredo()).update(e).digest("base64url");
  if (sig.length !== certo.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(certo))) return null;
  return Buffer.from(e, "base64url").toString();
}

function json(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}
async function corpo(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  return new Promise((ok) => {
    let d = ""; req.on("data", (c) => (d += c));
    req.on("end", () => { try { ok(JSON.parse(d || "{}")); } catch (e) { ok({}); } });
  });
}

module.exports = { segredo, pipeline, hojeBR, OFERTAS, PDFS, PASTA_PDF, cmd, PRE, normEmail, lerCliente, salvarCliente, config, criarSessao, sairSessao, emailDaSessao, json, corpo };
