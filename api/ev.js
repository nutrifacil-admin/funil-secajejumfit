/* Contador de retenção: cada tela do funil avisa aqui "um visitante chegou" (uma vez por visitante, por tela, por dia;
   quem garante isso é o rastro.js no navegador). Grava só números por dia, sem dado pessoal:
   an:<funil>:<grupo>:<dia>        → { passo: quantos }
   an:<funil>:<grupo>:<dia>:camp   → { "campanha|passo": quantos } */
const { pipeline, hojeBR, corpo } = require("./_lib");

const FUNIS = ["jejum"], GRUPOS = ["front", "pos", "vsl"];
const horaBR = () => new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false }).format(new Date()).padStart(2, "0");
const limpa = (s, max) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.statusCode = 204; return res.end(); }
  try {
    let b = await corpo(req);
    if (typeof b === "string") try { b = JSON.parse(b); } catch (e) { b = {}; }
    // presença ao vivo (Flowex): quem está com a página aberta agora; cada visita some sozinha em 2 minutos
    if (b.vivo && FUNIS.includes(b.f) && ["funil", "pos", "area"].includes(b.vivo)) {
      const sid = limpa(b.s, 16), k = "an:" + b.f + ":vivo:" + b.vivo, agora = Date.now();
      if (sid) await pipeline([["ZADD", k, agora, sid], ["ZREMRANGEBYSCORE", k, 0, agora - 120000], ["EXPIRE", k, 900]]);
      res.statusCode = 204; return res.end();
    }
    const f = FUNIS.includes(b.f) ? b.f : null, g = GRUPOS.includes(b.g) ? b.g : null;
    const lista = (Array.isArray(b.p) ? b.p : [b.p]).map((x) => limpa(x, 40)).filter(Boolean).slice(0, 30);
    if (f && g && lista.length) {
      const dia = hojeBR(), base = "an:" + f + ":" + g + ":" + dia, camp = limpa(b.c, 60);
      const cmds = [];
      lista.forEach((p) => {
        cmds.push(["HINCRBY", base, p, 1]);
        if (camp) cmds.push(["HINCRBY", base + ":camp", camp + "|" + p, 1]);
      });
      // por hora (Brasília), só os passos usados no comparativo "ontem até esta hora" do Flowex
      const hora = horaBR();
      lista.forEach((p) => { if (g === "front" && (p === "01" || p === "checkout")) cmds.push(["HINCRBY", base + ":h", hora + "|" + p, 1]); });
      cmds.push(["SET", "an:" + f + ":ultimo-ev", String(Date.now())]);   // Diagnóstico do Flowex: hora do último registro
      await pipeline(cmds);
    }
  } catch (e) { /* contador nunca atrapalha o funil */ }
  res.statusCode = 204; res.end();
};
