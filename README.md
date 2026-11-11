# funil-secajejumfit

Sistema de funis próprio (sem XQuiz). Um motor compartilhado + uma pasta por funil.

```
motor/      telas, player de VSL (padrão vTurb), régua, IMC, gráfico, timer — código único de todos os funis
jejum/      funil Seca Jejum (secajejum.fit)
  config.js   ← o que você edita: cor, logo, imagens, checkout, VSL (link Bunny, pitch, cta)
  telas.js    ← as 34 telas (textos, opções, condições Homem/Mulher)
  index.html  ← pixel do Meta + UTMify + cabeçalho
  img/        ← suas imagens (troque imgBase no config.js para "img/")
build.js    junta o motor com o funil em dist/ (a Vercel roda sozinha)
```

## Publicar na Vercel
1. Vercel → **Add New → Project** → importe `funil-secajejumfit`.
2. Não mude nada (o `vercel.json` já diz: build `node build.js jejum`, saída `dist`). **Deploy.**
3. Projeto → **Settings → Domains** → adicione `secajejum.fit` e `www.secajejum.fit`.
   A Vercel mostra os registros DNS que precisa (normalmente **A `@` → 76.76.21.21** e **CNAME `www` → cname.vercel-dns.com**).

## Domínio na Hostinger
hPanel → **Domínios → secajejum.fit → DNS / Nameservers → Registros DNS**:
- apague o registro **A** `@` que já existe (estacionamento da Hostinger) e o **CNAME** `www` se houver;
- adicione os registros exatamente como a Vercel mostrou.
Em 5–30 min a Vercel marca o domínio como válido e liga o HTTPS sozinha.

## Bunny
Stream → biblioteca → **Security → Allowed domains**: adicione `secajejum.fit`.

## Testar
- `secajejum.fit/?etapa=34` abre direto numa etapa (1 a 34).
- Pixel: PageView ao abrir, `EtapaQuiz` a cada etapa (com número e nome), `PitchVSL` no pitch (só com som).

## Novo funil
Copie `jejum/` para outra pasta (ex.: `dieta-ovo/`), troque `config.js` e `telas.js`, crie outro projeto
na Vercel apontando para o mesmo repositório com Build Command `node build.js dieta-ovo`.
