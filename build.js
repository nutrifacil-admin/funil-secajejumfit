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
