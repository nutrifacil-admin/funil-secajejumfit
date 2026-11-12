/* Contador de retenção: cada tela do funil avisa aqui "um visitante chegou" (uma vez por visitante, por tela, por dia;
   quem garante isso é o rastro.js no navegador). Grava só números por dia, sem dado pessoal:
   an:<funil>:<grupo>:<dia>        → { passo: quantos }
   an:<funil>:<grupo>:<dia>:camp   → { "campanha|passo": quantos } */
const { pipeline, hojeBR, corpo } = require("./_lib");

const FUNIS = ["jejum"], GRUPOS = ["front", "pos", "vsl"];
const limpa = (s, max) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.statusCode = 204; return res.end(); }
  try {
    let b = await corpo(req);
    if (typeof b === "string") try { b = JSON.parse(b); } catch (e) { b = {}; }
    const f = FUNIS.includes(b.f) ? b.f : null, g = GRUPOS.includes(b.g) ? b.g : null;
    const lista = (Array.isArray(b.p) ? b.p : [b.p]).map((x) => limpa(x, 40)).filter(Boolean).slice(0, 30);
    if (f && g && lista.length) {
      const dia = hojeBR(), base = "an:" + f + ":" + g + ":" + dia, camp = limpa(b.c, 60);
      const cmds = [];
      lista.forEach((p) => {
        cmds.push(["HINCRBY", base, p, 1]);
        if (camp) cmds.push(["HINCRBY", base + ":camp", camp + "|" + p, 1]);
      });
      await pipeline(cmds);
    }
  } catch (e) { /* contador nunca atrapalha o funil */ }
  res.statusCode = 204; res.end();
};
