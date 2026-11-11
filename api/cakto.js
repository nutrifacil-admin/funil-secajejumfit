/* Webhook da Cakto: cada compra aprovada libera o produto para o e-mail; reembolso/chargeback tira.
   Configurado na Cakto como "SJF + CTS · secajejum.fit". */
const { OFERTAS, cmd, PRE, normEmail, lerCliente, salvarCliente, config, json, corpo } = require("./_lib");

const LIBERA = ["purchase_approved"];
const TIRA = ["refund", "chargeback", "purchase_refunded", "purchase_chargeback"];

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 200, { ok: true, info: "webhook SJF ativo" });
  const b = await corpo(req);
  const secret = String(b.secret || "");

  // A Cakto manda o mesmo "secret" em toda entrega deste webhook. O 1º que chega fica gravado
  // (ou o da variável CAKTO_SECRET, se existir); entrega com outro secret é recusada.
  const esperado = process.env.CAKTO_SECRET || (secret ? await config("cakto_secret", () => secret) : null);
  if (!secret || secret !== esperado) return json(res, 401, { ok: false, erro: "secret" });

  const d = Array.isArray(b.data) ? b.data[0] : b.data || {};
  const email = normEmail(d.customer && d.customer.email);
  const evento = String(b.event || "");
  const bruto = JSON.stringify(d);
  const codigo = Object.keys(OFERTAS).find((c) => bruto.indexOf(c) >= 0);
  const registro = { em: new Date().toISOString(), evento, oferta: codigo || null, ok: false };

  if (email && codigo && (LIBERA.includes(evento) || TIRA.includes(evento))) {
    const c = (await lerCliente(email)) || { criadoEm: registro.em };
    const campo = OFERTAS[codigo].libera;
    c[campo] = LIBERA.includes(evento);
    c.historico = (c.historico || []).concat({ em: registro.em, evento, oferta: codigo }).slice(-20);
    if (d.customer && d.customer.name && !c.nome) c.nome = String(d.customer.name).split(" ")[0];
    await salvarCliente(email, c);
    registro.ok = true;
    registro.libera = campo;
  }
  // Últimas 50 entregas, sem dados pessoais (para conferir se o webhook está chegando)
  await cmd("LPUSH", PRE + "log", JSON.stringify(registro));
  await cmd("LTRIM", PRE + "log", 0, 49);
  return json(res, 200, { ok: true, processado: registro.ok });
};
