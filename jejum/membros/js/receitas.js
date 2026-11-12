// Banco de receitas sugeridas da área v2 (base: as 20 do PDF "Receitas para quebrar o jejum", reescritas e ampliadas).
// tipo: cafe | almoco | lanche | jantar. Restrições: g = tem glúten, l = tem lactose, c = tem carne, frango ou peixe.
// Quando um ingrediente é opcional ou tem troca, a troca está escrita no próprio ingrediente.
window.RECEITAS = [
  // ---------------- CAFÉ ----------------
  {
    id: 'omelete-queijo-tomate', tipo: 'cafe', nome: 'Omelete de queijo e tomate', tempo: '10 min', rende: '1 porção', g: 0, l: 1, c: 0,
    ingredientes: ['2 ovos', '1 fatia de queijo minas (ou muçarela) picada', '½ tomate sem sementes picado', '1 colher (sopa) de cebola picada', 'Sal, pimenta-do-reino e orégano a gosto', '1 fio de azeite'],
    passos: ['Bata os ovos com um garfo até a gema e a clara se misturarem bem. Tempere com sal e pimenta.', 'Aqueça uma frigideira antiaderente com o fio de azeite em fogo médio e refogue a cebola por 1 minuto.', 'Despeje os ovos e deixe firmar por cerca de 2 minutos, sem mexer.', 'Espalhe o tomate e o queijo em metade da omelete, salpique orégano e dobre ao meio.', 'Tampe a frigideira por 1 minuto para o queijo derreter e sirva.'],
    dica: 'Sem lactose: troque o queijo por espinafre ou cogumelo refogado.',
    porque: 'O ovo é proteína pura: dá saciedade por várias horas e ajuda a não beliscar depois da quebra do jejum.'
  },
  {
    id: 'ovos-mexidos-legumes', tipo: 'cafe', nome: 'Ovos mexidos cremosos com legumes', tempo: '10 min', rende: '1 porção', g: 0, l: 0, c: 0,
    ingredientes: ['2 ovos', '½ abobrinha pequena ralada (ou cenoura ralada)', '½ tomate picado', '1 colher (sopa) de cebola picada', 'Cheiro-verde, sal e pimenta a gosto', '1 fio de azeite'],
    passos: ['Refogue a cebola no azeite em fogo médio até ficar transparente.', 'Junte a abobrinha e o tomate e refogue por 3 minutos, até murcharem e soltarem o líquido.', 'Abaixe o fogo, junte os ovos batidos e mexa devagar com uma espátula, sempre do fundo para cima.', 'Desligue o fogo quando ainda estiverem um pouco molhados: eles terminam de cozinhar no calor da panela e ficam cremosos.', 'Finalize com cheiro-verde.'],
    dica: 'Fogo baixo é o segredo do ovo mexido cremoso. Fogo alto deixa o ovo seco e borrachudo.',
    porque: 'Os legumes dão volume ao prato com poucas calorias; você come um prato cheio e fica satisfeita.'
  },
  {
    id: 'tapioca-ovo-queijo', tipo: 'cafe', nome: 'Tapioca recheada com ovo e queijo', tempo: '10 min', rende: '1 porção', g: 0, l: 1, c: 0,
    ingredientes: ['3 colheres (sopa) de goma de tapioca hidratada', '1 ovo', '1 fatia de queijo minas ou coalho', 'Sal e orégano a gosto'],
    passos: ['Peneire a goma direto na frigideira fria, espalhando bem até cobrir o fundo.', 'Leve ao fogo médio. Quando a goma se unir e soltar das bordas (cerca de 2 minutos), vire.', 'Enquanto isso, prepare o ovo mexido ou frito em outra frigideira, com uma pitada de sal.', 'Recheie a tapioca com o ovo e o queijo, salpique orégano e dobre ao meio.', 'Deixe mais 1 minuto no fogo para o queijo amolecer.'],
    dica: 'Não use óleo na frigideira: a tapioca solta sozinha. Sem lactose: só o ovo com tomate.',
    porque: 'A tapioca não tem glúten e é leve para a primeira refeição; com o ovo, fica completa e segura a fome.'
  },
  {
    id: 'cuscuz-ovo', tipo: 'cafe', nome: 'Cuscuz nordestino com ovo', tempo: '15 min', rende: '1 porção', g: 0, l: 0, c: 0,
    ingredientes: ['½ xícara de flocão de milho', '¼ de xícara de água', '1 pitada de sal', '1 ovo', '1 fio de azeite (ou 1 colher de chá de manteiga, se consumir lactose)'],
    passos: ['Misture o flocão com o sal e vá molhando com a água aos poucos, mexendo com as mãos até ficar úmido e soltinho, sem empapar.', 'Deixe descansar 5 minutos para hidratar.', 'Coloque na cuscuzeira com água no fundo e cozinhe no vapor por 8 a 10 minutos, até o vapor sair por cima.', 'Enquanto isso, frite ou cozinhe o ovo.', 'Sirva o cuscuz com o fio de azeite e o ovo por cima.'],
    dica: 'Sem cuscuzeira: use uma peneira de metal tampada sobre uma panela com água fervendo.',
    porque: 'O milho dá energia para a manhã e o ovo garante a proteína que segura a fome até a próxima refeição.'
  },
  {
    id: 'pao-ovo-queijo', tipo: 'cafe', nome: 'Pão com ovo e queijo branco', tempo: '8 min', rende: '1 porção', g: 1, l: 1, c: 0,
    ingredientes: ['1 pão francês sem miolo (ou 2 fatias de pão integral)', '1 ovo', '1 fatia de queijo branco', '1 rodela de tomate', 'Sal e orégano a gosto'],
    passos: ['Abra o pão e tire parte do miolo, para ficar mais leve.', 'Frite o ovo numa frigideira antiaderente com uma gota de azeite, com a gema mole ou dura, como preferir.', 'Aqueça o pão na mesma frigideira por 1 minuto de cada lado.', 'Monte com o queijo, o ovo e o tomate, e tempere com sal e orégano.'],
    dica: 'Tirar o miolo do pão francês corta quase metade do pão sem mudar o sabor do sanduíche.',
    porque: 'É o café da manhã de sempre, só que montado do jeito certo: com proteína, para você não ter fome uma hora depois.'
  },
  {
    id: 'iogurte-chia-banana', tipo: 'cafe', nome: 'Iogurte com chia, banana e aveia', tempo: '5 min', rende: '1 porção', g: 0, l: 1, c: 0,
    ingredientes: ['1 pote (170 g) de iogurte natural integral, sem açúcar', '1 colher (sopa) de chia', '½ banana em rodelas', '1 colher (sopa) de aveia em flocos', 'Canela a gosto'],
    passos: ['Misture a chia no iogurte e deixe descansar 5 minutos (ou deixe pronto na geladeira na noite anterior).', 'Por cima, coloque a banana e a aveia.', 'Polvilhe canela e coma devagar.'],
    dica: 'Aveia comum pode ter traço de glúten: se você evita glúten, use a aveia com selo "sem glúten".',
    porque: 'A chia incha com o líquido e forma um gel que aumenta a saciedade; a banana adoça sem açúcar.'
  },
  {
    id: 'mingau-aveia', tipo: 'cafe', nome: 'Mingau de aveia com canela e banana', tempo: '10 min', rende: '1 porção', g: 0, l: 1, c: 0,
    ingredientes: ['3 colheres (sopa) de aveia em flocos', '1 copo (200 ml) de leite (ou bebida vegetal)', '½ banana amassada', 'Canela a gosto'],
    passos: ['Coloque a aveia, o leite e a banana amassada numa panela pequena.', 'Leve ao fogo baixo, mexendo sempre, por 5 a 7 minutos, até engrossar.', 'Desligue, polvilhe canela e espere amornar antes de comer.'],
    dica: 'A banana amassada adoça o mingau inteiro: não precisa de açúcar. Sem lactose: use bebida vegetal ou leite sem lactose.',
    porque: 'Quentinho e fácil de digerir, é uma quebra de jejum suave para quem acorda sem muita fome.'
  },
  {
    id: 'crepioca-frango', tipo: 'cafe', nome: 'Crepioca de frango', tempo: '12 min', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['1 ovo', '2 colheres (sopa) de goma de tapioca', '3 colheres (sopa) de frango cozido e desfiado', '1 colher (sopa) de tomate picado', 'Sal e cheiro-verde a gosto'],
    passos: ['Bata o ovo com a goma de tapioca e uma pitada de sal até virar uma massa lisa.', 'Despeje numa frigideira antiaderente untada com uma gota de azeite, em fogo médio, espalhando bem.', 'Quando firmar embaixo (cerca de 2 minutos), vire com cuidado.', 'Recheie com o frango, o tomate e o cheiro-verde, e dobre ao meio.'],
    dica: 'Deixe frango desfiado pronto na geladeira: ele serve para o café, o lanche e o jantar da semana.',
    porque: 'Junta a proteína do ovo e do frango numa massa leve, sem glúten: sustenta bem até o almoço.'
  },
  {
    id: 'panqueca-banana', tipo: 'cafe', nome: 'Panqueca de banana e aveia', tempo: '10 min', rende: '1 porção (2 panquecas)', g: 0, l: 0, c: 0,
    ingredientes: ['1 banana madura', '1 ovo', '2 colheres (sopa) de aveia em flocos', 'Canela a gosto'],
    passos: ['Amasse bem a banana com um garfo.', 'Junte o ovo, a aveia e a canela e misture até ficar uniforme.', 'Aqueça uma frigideira antiaderente em fogo baixo e despeje metade da massa.', 'Quando aparecerem bolhinhas por cima (cerca de 2 minutos), vire e doure o outro lado.', 'Repita com o resto da massa.'],
    dica: 'Fogo baixo para não queimar por fora e ficar crua por dentro. Fica ótima com uma colher de iogurte por cima.',
    porque: 'Mata a vontade de doce do jeito certo: doce da fruta, com a proteína do ovo junto.'
  },
  {
    id: 'pao-abacate-ovo', tipo: 'cafe', nome: 'Torrada com abacate e ovo', tempo: '10 min', rende: '1 porção', g: 1, l: 0, c: 0,
    ingredientes: ['1 fatia de pão integral', '2 colheres (sopa) de abacate amassado', 'Gotas de limão', '1 ovo cozido ou pochê', 'Sal, pimenta e um fio de azeite'],
    passos: ['Toste o pão na frigideira ou na torradeira.', 'Amasse o abacate com o limão, o sal e a pimenta.', 'Espalhe sobre a torrada.', 'Coloque o ovo fatiado (ou o pochê inteiro) por cima e finalize com o azeite.'],
    dica: 'Ovo cozido no ponto: 9 minutos depois que a água ferver, e direto para a água fria.',
    porque: 'A gordura boa do abacate mais a proteína do ovo deixam a fome longe por muitas horas.'
  },

  // ---------------- ALMOÇO ----------------
  {
    id: 'bife-acebolado', tipo: 'almoco', nome: 'Arroz, feijão, bife acebolado e salada', tempo: '25 min', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['1 bife de patinho ou alcatra (cerca de 120 g)', '1 cebola média em rodelas', '1 dente de alho amassado', '3 colheres (sopa) de arroz cozido', '1 concha pequena de feijão', 'Alface, tomate e pepino à vontade', 'Sal, pimenta, limão e azeite'],
    passos: ['Tempere o bife com o alho, o sal e a pimenta e deixe 5 minutos.', 'Aqueça bem uma frigideira com um fio de azeite e grelhe o bife por 2 a 3 minutos de cada lado. Reserve.', 'Na mesma frigideira, refogue a cebola com uma pitada de sal até dourar. Se grudar, pingue um pouco de água e raspe o fundo: isso vira o molho.', 'Volte o bife à frigideira por 1 minuto para pegar o sabor da cebola.', 'Monte o prato pela regra: metade de salada temperada com limão e azeite, o bife, e o arroz com feijão.'],
    dica: 'Frigideira bem quente antes do bife: ele sela por fora e fica suculento, sem soltar água.',
    porque: 'É o prato de todo dia, na proporção certa. Arroz com feijão juntos formam uma proteína completa e dão saciedade.'
  },
  {
    id: 'frango-pure-abobora', tipo: 'almoco', nome: 'Frango grelhado com purê de abóbora', tempo: '30 min', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['1 filé de peito de frango (cerca de 120 g)', '1 xícara de abóbora cabotiá em cubos', '2 dentes de alho', 'Suco de ½ limão', 'Sal, pimenta, páprica e cheiro-verde', 'Salada de folhas para acompanhar'],
    passos: ['Tempere o frango com 1 alho amassado, o limão, o sal, a pimenta e a páprica.', 'Cozinhe a abóbora em água com sal por 12 a 15 minutos, até desmanchar no garfo. Escorra.', 'Amasse a abóbora com um garfo. Doure o outro alho num fio de azeite, junte o purê, acerte o sal e mexa por 2 minutos.', 'Grelhe o frango em frigideira bem quente, 4 a 5 minutos de cada lado, até não ficar rosado por dentro.', 'Sirva com o purê e metade do prato de salada.'],
    dica: 'Abra o filé ao meio (como um livro) antes de temperar: ele cozinha mais rápido e fica macio.',
    porque: 'O purê de abóbora tem a cremosidade do purê de batata com bem menos calorias.'
  },
  {
    id: 'carne-panela-legumes', tipo: 'almoco', nome: 'Carne de panela com legumes', tempo: '50 min (panela de pressão)', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['120 g de acém ou músculo em cubos', '½ cebola picada', '1 dente de alho', '1 tomate picado', '½ cenoura em rodelas', '½ chuchu em cubos', '1 batata pequena em cubos', 'Sal, pimenta, louro e cheiro-verde'],
    passos: ['Tempere a carne com sal, pimenta e alho.', 'Na panela de pressão, doure a carne aos poucos num fio de azeite, sem amontoar, para não cozinhar no vapor.', 'Junte a cebola e o tomate e refogue até desmancharem.', 'Cubra com água quente, coloque o louro, tampe e cozinhe por 30 minutos depois de pegar pressão.', 'Tire a pressão, junte a cenoura, o chuchu e a batata, tampe de novo e cozinhe mais 5 minutos na pressão.', 'Finalize com cheiro-verde. Sirva com arroz e salada, pela regra do prato.'],
    dica: 'Quer deixar pronto para a semana? Multiplique a receita por 4, separe em potes de 1 porção e congele. Dura até 3 meses no freezer.',
    porque: 'Carne magra cozida bem macia e muito legume no mesmo prato: sustenta e ajuda você a comer menos arroz.'
  },
  {
    id: 'frango-molho-tomate', tipo: 'almoco', nome: 'Frango ao molho de tomate com brócolis', tempo: '30 min', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['120 g de peito de frango em cubos', '¼ de cebola picada', '1 dente de alho', '2 tomates maduros picados', '1 xícara de brócolis em buquês', 'Sal, pimenta, orégano e manjericão'],
    passos: ['Tempere o frango com sal e pimenta e doure numa panela com um fio de azeite. Reserve.', 'Na mesma panela, refogue a cebola e o alho e junte o tomate e meio copo de água.', 'Cozinhe com tampa por 10 minutos, amassando os tomates com a colher até virar molho.', 'Volte o frango, junte o orégano e cozinhe mais 8 minutos.', 'Cozinhe o brócolis no vapor por 5 minutos, até ficar verde vivo e macio.', 'Sirva o frango com o brócolis e uma porção pequena de arroz.'],
    dica: 'Uma pitada de açúcar ou uma cenoura ralada no molho tira a acidez do tomate.',
    porque: 'Molho caseiro, sem os pós prontos (que têm muito sal e incham). O brócolis completa o prato com fibra.'
  },
  {
    id: 'tilapia-assada', tipo: 'almoco', nome: 'Tilápia assada com batata e legumes', tempo: '35 min', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['1 filé de tilápia (cerca de 130 g)', '1 batata pequena em rodelas finas', '½ cebola em rodelas', '½ tomate em rodelas', '¼ de pimentão em tiras', 'Suco de ½ limão, alho, sal, pimenta e azeite'],
    passos: ['Tempere a tilápia com o limão, o alho, o sal e a pimenta. Deixe 10 minutos.', 'Numa assadeira pequena com um fio de azeite, faça uma camada de batata e tempere com sal.', 'Coloque o filé por cima e cubra com a cebola, o tomate e o pimentão.', 'Regue com azeite, cubra com papel-alumínio e asse a 200 °C por 20 minutos.', 'Tire o papel e asse mais 10 minutos para dourar.'],
    dica: 'Rodelas finas de batata cozinham no mesmo tempo do peixe; rodelas grossas ficam cruas.',
    porque: 'Peixe é proteína leve e rápida de preparar; tudo sai numa assadeira só, sem fritura.'
  },
  {
    id: 'strogonoff-frango-leve', tipo: 'almoco', nome: 'Strogonoff de frango leve', tempo: '25 min', rende: '1 porção', g: 0, l: 1, c: 1,
    ingredientes: ['120 g de peito de frango em cubos', '¼ de cebola picada', '1 dente de alho', '½ tomate picado', '1 colher (chá) de mostarda', '1 colher (sopa) de extrato de tomate', '3 colheres (sopa) de iogurte natural integral', 'Champignon (opcional), sal e pimenta'],
    passos: ['Doure o frango temperado com sal e pimenta num fio de azeite.', 'Junte a cebola, o alho e o tomate e refogue até murchar.', 'Acrescente o extrato de tomate, a mostarda, o champignon e ¼ de copo de água. Cozinhe por 5 minutos.', 'Desligue o fogo e só então misture o iogurte: no fogo alto ele talha.', 'Sirva com arroz e salada verde, pela regra do prato.'],
    dica: 'O iogurte no lugar do creme de leite deixa o molho cremoso e mais leve.',
    porque: 'Dá para comer o prato preferido da família sem sair do plano.'
  },
  {
    id: 'picadinho-abobrinha', tipo: 'almoco', nome: 'Picadinho de carne com abobrinha', tempo: '30 min', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['120 g de patinho em cubos pequenos', '½ abobrinha em cubos', '¼ de cebola picada', '1 dente de alho', '½ tomate picado', 'Sal, pimenta, colorau e cheiro-verde'],
    passos: ['Tempere a carne com sal, pimenta e colorau.', 'Doure a carne em panela pequena bem quente, com um fio de azeite.', 'Junte a cebola, o alho e o tomate e refogue até formar um molhinho.', 'Coloque meio copo de água, tampe e cozinhe por 15 minutos, até a carne amaciar.', 'Junte a abobrinha e cozinhe mais 5 minutos, sem deixar desmanchar.', 'Finalize com cheiro-verde e sirva com arroz, feijão e salada.'],
    dica: 'A abobrinha entra no fim para ficar firme. Chuchu também funciona.',
    porque: 'O legume dentro da panela aumenta o prato sem aumentar as calorias.'
  },
  {
    id: 'escondidinho-mandioca', tipo: 'almoco', nome: 'Escondidinho de mandioca com carne moída', tempo: '45 min', rende: '1 porção', g: 0, l: 1, c: 1,
    ingredientes: ['1 pedaço médio de mandioca descascada (cerca de 120 g)', '100 g de carne moída magra (patinho)', '¼ de cebola picada', '1 dente de alho', '½ tomate picado', '3 colheres (sopa) de leite (ou da água do cozimento)', '1 colher (sopa) de queijo ralado', 'Sal, pimenta e cheiro-verde'],
    passos: ['Cozinhe a mandioca em água com sal até ficar bem macia (na pressão, 15 minutos). Tire os fiapos do meio.', 'Amasse a mandioca ainda quente com o leite até virar um purê liso. Acerte o sal.', 'Refogue a cebola e o alho, junte a carne moída e mexa até soltar e mudar de cor. Junte o tomate e cozinhe 10 minutos.', 'Num refratário pequeno, coloque a carne embaixo e cubra com o purê.', 'Polvilhe o queijo e leve ao forno a 200 °C por 15 minutos, até dourar.', 'Sirva com bastante salada.'],
    dica: 'Sem lactose: faça o purê com a água do cozimento e um fio de azeite, e tire o queijo.',
    porque: 'Comida de conforto, em porção certa e com salada. Ajuda a seguir o plano nos dias de vontade.'
  },
  {
    id: 'arroz-lentilha-ovo', tipo: 'almoco', nome: 'Arroz com lentilha, cebola dourada e ovo', tempo: '35 min', rende: '1 porção', g: 0, l: 0, c: 0,
    ingredientes: ['3 colheres (sopa) de lentilha', '3 colheres (sopa) de arroz', '½ cebola em tiras finas', '1 dente de alho', '1 ovo', 'Sal, cominho e azeite'],
    passos: ['Cozinhe a lentilha em água por 10 minutos (fica meio cozida). Escorra.', 'Numa panela pequena, doure o alho, junte o arroz e a lentilha e refogue por 1 minuto.', 'Cubra com ¾ de xícara de água quente, tempere com sal e cominho e cozinhe com tampa em fogo baixo por 15 minutos.', 'Enquanto isso, doure a cebola com azeite em fogo baixo, mexendo de vez em quando, por 15 minutos.', 'Sirva o arroz com a cebola por cima, o ovo frito ou cozido e salada.'],
    dica: 'A cebola bem dourada, sem pressa, é o que dá o sabor do prato.',
    porque: 'Opção sem carne e completa: a lentilha com o arroz e o ovo garantem a proteína do almoço.'
  },
  {
    id: 'omelete-forno-legumes', tipo: 'almoco', nome: 'Omelete de forno com legumes', tempo: '30 min', rende: '1 porção', g: 0, l: 1, c: 0,
    ingredientes: ['2 ovos', '¼ de abobrinha ralada', '¼ de cenoura ralada', '½ tomate picado', '1 colher (sopa) de cebola picada', '1 colher (sopa) de queijo ralado', 'Sal, pimenta e cheiro-verde'],
    passos: ['Bata os ovos com o sal e a pimenta.', 'Misture todos os legumes e o cheiro-verde.', 'Despeje num refratário pequeno (ou forminha) untado com azeite e polvilhe o queijo.', 'Asse a 180 °C por 20 minutos, até firmar no meio (espete um palito: deve sair limpo).', 'Sirva com salada e uma porção pequena de arroz e feijão.'],
    dica: 'Esprema a abobrinha ralada num pano antes: tira a água e a omelete não fica molenga.',
    porque: 'Um prato sem carne, cheio de proteína, que vai ao forno e não precisa de atenção.'
  },

  // ---------------- LANCHE ----------------
  {
    id: 'iogurte-fruta', tipo: 'lanche', nome: 'Iogurte natural com fruta picada', tempo: '3 min', rende: '1 porção', g: 0, l: 1, c: 0,
    ingredientes: ['1 pote (170 g) de iogurte natural integral, sem açúcar', '½ xícara de fruta picada (morango, mamão ou maçã)', '1 colher (chá) de mel (opcional)', '1 colher (sopa) de castanha ou amendoim picado (opcional)'],
    passos: ['Coloque o iogurte numa tigela.', 'Junte a fruta picada e, se quiser, o mel e a castanha por cima.', 'Coma devagar, com colher pequena.'],
    dica: 'Prefira o iogurte natural ao iogurte de "sabor": o de sabor costuma ter muito açúcar.',
    porque: 'Lanche rápido que junta proteína e fruta: segura a fome até a próxima refeição.'
  },
  {
    id: 'queijo-fruta', tipo: 'lanche', nome: 'Queijo branco com fruta', tempo: '2 min', rende: '1 porção', g: 0, l: 1, c: 0,
    ingredientes: ['2 fatias de queijo minas frescal', '1 fruta média (maçã, pera ou 1 fatia de mamão)'],
    passos: ['Corte a fruta em fatias.', 'Sirva com o queijo e coma alternando um e outro.'],
    dica: 'Queijo com goiabada é o "Romeu e Julieta"; no dia a dia, troque a goiabada pela fruta.',
    porque: 'O doce da fruta com a proteína do queijo mata a vontade de doce sem pico de fome depois.'
  },
  {
    id: 'ovo-cozido-fruta', tipo: 'lanche', nome: 'Ovos cozidos com fruta', tempo: '12 min', rende: '1 porção', g: 0, l: 0, c: 0,
    ingredientes: ['2 ovos', '1 fruta (banana, maçã ou laranja)', 'Sal e orégano'],
    passos: ['Coloque os ovos numa panela com água fria e leve ao fogo.', 'Quando a água ferver, conte 9 minutos.', 'Passe os ovos para a água gelada por 2 minutos: a casca sai fácil.', 'Descasque, tempere com sal e orégano e coma com a fruta.'],
    dica: 'Cozinhe 6 ovos de uma vez: na geladeira, com casca, eles duram até 5 dias.',
    porque: 'É o lanche mais prático para levar na bolsa: proteína pronta, sem cozinhar no dia.'
  },
  {
    id: 'creme-abacate', tipo: 'lanche', nome: 'Creme de abacate com limão', tempo: '5 min', rende: '1 porção', g: 0, l: 0, c: 0,
    ingredientes: ['¼ de abacate maduro', 'Suco de ½ limão', '1 colher (chá) de mel (opcional)', 'Cacau em pó (opcional)'],
    passos: ['Amasse o abacate com o garfo até ficar liso (ou bata no mixer).', 'Misture o limão e, se quiser, o mel.', 'Polvilhe cacau por cima e coma gelado.'],
    dica: 'Versão salgada: abacate amassado com sal, limão e tomate picado.',
    porque: 'A gordura boa do abacate dá saciedade e reduz a vontade de doce no fim da tarde.'
  },
  {
    id: 'banana-aveia-quente', tipo: 'lanche', nome: 'Banana quente com aveia e canela', tempo: '3 min', rende: '1 porção', g: 0, l: 0, c: 0,
    ingredientes: ['1 banana', '1 colher (sopa) de aveia em flocos', 'Canela a gosto', '1 colher (chá) de pasta de amendoim (opcional)'],
    passos: ['Amasse a banana numa tigela que vá ao micro-ondas.', 'Misture a aveia e a canela.', 'Aqueça por 1 minuto no micro-ondas.', 'Se quiser, finalize com a pasta de amendoim.'],
    dica: 'Tem gosto de sobremesa: é uma boa saída para a vontade de doce à noite, dentro da janela.',
    porque: 'Doce de verdade, sem açúcar, com fibra da aveia para não dar fome logo depois.'
  },
  {
    id: 'pipoca-panela', tipo: 'lanche', nome: 'Pipoca de panela', tempo: '8 min', rende: '1 porção', g: 0, l: 0, c: 0,
    ingredientes: ['3 colheres (sopa) de milho de pipoca', '1 colher (chá) de azeite ou óleo', 'Sal a gosto', 'Páprica ou orégano (opcional)'],
    passos: ['Coloque o milho e o azeite na panela e mexa para cobrir todos os grãos.', 'Tampe e leve ao fogo médio.', 'Quando começar a estourar, balance a panela de vez em quando.', 'Desligue quando os estouros ficarem espaçados (2 segundos entre um e outro).', 'Tempere com sal e páprica.'],
    dica: 'Fuja da pipoca de micro-ondas de pacote: tem muita gordura e sal.',
    porque: 'Dá um pote grande com poucas calorias, e o volume engana a fome.'
  },
  {
    id: 'torrada-amendoim', tipo: 'lanche', nome: 'Torrada com pasta de amendoim e banana', tempo: '5 min', rende: '1 porção', g: 1, l: 0, c: 0,
    ingredientes: ['1 fatia de pão integral', '1 colher (sopa) de pasta de amendoim integral', '½ banana em rodelas', 'Canela a gosto'],
    passos: ['Toste o pão.', 'Espalhe a pasta de amendoim.', 'Cubra com a banana e polvilhe canela.'],
    dica: 'A pasta boa tem só amendoim na lista de ingredientes, sem açúcar.',
    porque: 'A gordura e a proteína do amendoim fazem uma fatia de pão segurar a fome por horas.'
  },
  {
    id: 'sanduiche-natural', tipo: 'lanche', nome: 'Sanduíche natural de frango', tempo: '10 min', rende: '1 porção', g: 1, l: 1, c: 1,
    ingredientes: ['2 fatias de pão integral', '3 colheres (sopa) de frango cozido e desfiado', '1 colher (sopa) de requeijão light ou iogurte natural', '1 colher (sopa) de cenoura ralada', 'Alface e tomate', 'Sal, pimenta e cheiro-verde'],
    passos: ['Misture o frango com o requeijão (ou o iogurte), a cenoura, o cheiro-verde, o sal e a pimenta.', 'Espalhe no pão e complete com a alface e o tomate.', 'Feche e corte ao meio.'],
    dica: 'O recheio dura 3 dias na geladeira em pote fechado.',
    porque: 'Um lanche que vale como refeição nos dias corridos, com proteína e salada juntos.'
  },

  // ---------------- JANTAR ----------------
  {
    id: 'sopa-legumes-frango', tipo: 'jantar', nome: 'Sopa de legumes com frango desfiado', tempo: '35 min', rende: '1 porção (1 prato fundo)', g: 0, l: 0, c: 1,
    ingredientes: ['100 g de peito de frango', '½ cenoura em cubos', '½ chuchu em cubos', '½ batata pequena em cubos', '1 fatia de abóbora em cubos', '¼ de cebola picada', '1 dente de alho', 'Sal, pimenta, louro e cheiro-verde'],
    passos: ['Cozinhe o peito de frango em água com sal e louro por 20 minutos. Desfie e guarde o caldo.', 'Numa panela, refogue a cebola e o alho num fio de azeite.', 'Junte os legumes e cubra com o caldo do frango.', 'Cozinhe por 15 minutos, até os legumes ficarem macios.', 'Volte o frango desfiado, acerte o sal e finalize com cheiro-verde.'],
    dica: 'Quer mais cremosa? Bata 2 conchas da sopa no liquidificador e devolva à panela.',
    porque: 'Jantar leve e quentinho: deixa você satisfeita e dormindo bem, e o jejum da noite começa tranquilo.'
  },
  {
    id: 'caldo-verde-leve', tipo: 'jantar', nome: 'Caldo verde leve', tempo: '30 min', rende: '1 porção (1 prato fundo)', g: 0, l: 0, c: 1,
    ingredientes: ['1 batata média', '2 folhas de couve em tiras bem finas', '¼ de cebola', '1 dente de alho', '30 g de linguiça calabresa em rodelas finas (ou 80 g de peito de frango em cubos)', 'Sal, pimenta e azeite'],
    passos: ['Cozinhe a batata com a cebola e o alho em 1 copo e meio de água com sal, até desmancharem.', 'Bata tudo no liquidificador com a água do cozimento.', 'Numa frigideira, doure a calabresa (ou o frango) e tire o excesso de gordura com papel-toalha.', 'Volte o creme à panela, junte a calabresa e a couve e cozinhe só 3 minutos, para a couve ficar verde.', 'Sirva com um fio de azeite.'],
    dica: 'Pouca calabresa já dá o sabor: ela é tempero aqui, não o prato principal.',
    porque: 'Sacia muito e mata a vontade de comida de conforto à noite.'
  },
  {
    id: 'omelete-espinafre', tipo: 'jantar', nome: 'Omelete recheada de espinafre e queijo', tempo: '12 min', rende: '1 porção', g: 0, l: 1, c: 0,
    ingredientes: ['2 ovos', '1 xícara de espinafre (ou couve) picado', '1 fatia de queijo muçarela ou minas', '1 dente de alho', 'Sal, pimenta e noz-moscada (opcional)'],
    passos: ['Refogue o alho e o espinafre num fio de azeite por 2 minutos, até murchar. Reserve.', 'Bata os ovos com o sal, a pimenta e uma pitada de noz-moscada.', 'Despeje na frigideira em fogo médio e deixe firmar.', 'Coloque o espinafre e o queijo de um lado e dobre.', 'Sirva com uma salada de folhas e tomate.'],
    dica: 'Espinafre murcha muito: 1 xícara cru vira 2 colheres refogado. Pode exagerar.',
    porque: 'Jantar pronto em 10 minutos, com proteína e verdura, para os dias sem tempo.'
  },
  {
    id: 'wrap-frango', tipo: 'jantar', nome: 'Wrap de frango com salada', tempo: '10 min', rende: '1 porção', g: 1, l: 1, c: 1,
    ingredientes: ['1 pão folha (tipo rap10) integral', '4 colheres (sopa) de frango desfiado', '1 colher (sopa) de requeijão light', 'Alface, tomate e cenoura ralada', 'Sal, pimenta e orégano'],
    passos: ['Aqueça o pão folha na frigideira por 30 segundos de cada lado.', 'Espalhe o requeijão no centro.', 'Coloque o frango temperado, a alface, o tomate e a cenoura.', 'Dobre as laterais para dentro e enrole bem apertado.', 'Volte à frigideira com a emenda para baixo por 1 minuto, para fechar.'],
    dica: 'Sem glúten: use 2 crepiocas no lugar do pão folha.',
    porque: 'Tem jeito de lanche, mas é uma refeição completa e leve para a noite.'
  },
  {
    id: 'tilapia-frigideira', tipo: 'jantar', nome: 'Tilápia na frigideira com legumes salteados', tempo: '20 min', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['1 filé de tilápia', '½ abobrinha em meia-lua', '½ cenoura em palitos finos', '½ cebola em tiras', 'Suco de ½ limão, alho, sal e pimenta'],
    passos: ['Tempere o peixe com o limão, o sal e a pimenta.', 'Em frigideira bem quente com um fio de azeite, salteie a cebola, a cenoura e a abobrinha por 4 minutos, mexendo. Reserve.', 'Na mesma frigideira, coloque o filé e não mexa por 3 minutos.', 'Vire com cuidado e doure mais 2 minutos.', 'Sirva com os legumes.'],
    dica: 'Seque o filé com papel-toalha antes: ele doura em vez de cozinhar no próprio líquido.',
    porque: 'Peixe à noite é leve, fácil de digerir e não pesa na hora de dormir.'
  },
  {
    id: 'crepioca-atum', tipo: 'jantar', nome: 'Crepioca de atum', tempo: '10 min', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['1 ovo', '2 colheres (sopa) de goma de tapioca', '½ lata de atum em água, escorrido', '1 colher (sopa) de tomate e cebola picados', 'Sal, limão e cheiro-verde'],
    passos: ['Misture o atum com o tomate, a cebola, o limão e o cheiro-verde.', 'Bata o ovo com a tapioca e o sal.', 'Faça a massa em frigideira antiaderente em fogo médio, virando quando firmar.', 'Recheie com o atum e dobre ao meio.'],
    dica: 'Prefira o atum em água ao atum em óleo.',
    porque: 'Atum em lata é proteína barata e pronta: um jantar sem fogão sujo.'
  },
  {
    id: 'sopa-lentilha', tipo: 'jantar', nome: 'Sopa de lentilha com legumes', tempo: '35 min', rende: '1 porção (1 prato fundo)', g: 0, l: 0, c: 0,
    ingredientes: ['¼ de xícara de lentilha', '½ cenoura em cubos', '½ tomate picado', '¼ de cebola picada', '1 dente de alho', '1 copo e meio de água (300 ml)', 'Sal, cominho, páprica e cheiro-verde'],
    passos: ['Refogue a cebola e o alho num fio de azeite.', 'Junte o tomate, a cenoura e a lentilha e refogue por 2 minutos.', 'Cubra com a água, tempere com sal, cominho e páprica e cozinhe por 25 minutos, até a lentilha ficar macia.', 'Amasse um pouco da lentilha com a concha para engrossar.', 'Finalize com cheiro-verde.'],
    dica: 'Fica ainda melhor no dia seguinte. Quer deixar pronto? Multiplique a receita e congele em potes de 1 porção.',
    porque: 'Opção sem carne que sustenta: a lentilha tem proteína e muita fibra.'
  },
  {
    id: 'abobrinha-recheada', tipo: 'jantar', nome: 'Abobrinha recheada com carne moída', tempo: '35 min', rende: '1 porção', g: 0, l: 1, c: 1,
    ingredientes: ['1 abobrinha média', '100 g de carne moída magra', '½ tomate picado', '¼ de cebola picada', '1 dente de alho', '1 colher (sopa) de queijo ralado', 'Sal, pimenta e orégano'],
    passos: ['Corte a abobrinha ao meio no comprimento e tire o miolo com uma colher, formando barquinhas. Pique o miolo.', 'Refogue a cebola e o alho, junte a carne e mexa até soltar.', 'Junte o tomate e o miolo picado e cozinhe 8 minutos. Acerte o sal.', 'Recheie as barquinhas, polvilhe o queijo e o orégano.', 'Asse a 200 °C por 20 minutos, até a abobrinha ficar macia.'],
    dica: 'Sem lactose: tire o queijo e finalize com um fio de azeite.',
    porque: 'A abobrinha faz o papel da massa: você come o recheio que gosta com uma fração das calorias.'
  },
  {
    id: 'escondidinho-abobora-frango', tipo: 'jantar', nome: 'Escondidinho de abóbora com frango', tempo: '40 min', rende: '1 porção', g: 0, l: 1, c: 1,
    ingredientes: ['1 xícara de abóbora cabotiá em cubos', '½ xícara de frango cozido e desfiado (cerca de 100 g)', '¼ de cebola picada', '½ tomate picado', '1 colher (sopa) de requeijão light (opcional)', 'Sal, pimenta e cheiro-verde'],
    passos: ['Cozinhe a abóbora até ficar macia e amasse com sal.', 'Refogue a cebola, junte o tomate e o frango e cozinhe 5 minutos. Misture o requeijão e o cheiro-verde.', 'Coloque o frango num refratário pequeno e cubra com o purê de abóbora.', 'Asse a 200 °C por 15 minutos.'],
    dica: 'Quer o jantar da semana pronto? Multiplique a receita e monte em potes de 1 porção: é só esquentar.',
    porque: 'Leve, quentinho e cremoso: segura a fome até a hora de dormir.'
  },
  {
    id: 'salada-morna-frango', tipo: 'jantar', nome: 'Salada morna de frango com legumes', tempo: '20 min', rende: '1 porção', g: 0, l: 0, c: 1,
    ingredientes: ['1 filé de frango em tiras', '½ xícara de brócolis', '½ cenoura em rodelas', 'Folhas verdes à vontade', '1 tomate', 'Limão, azeite, mostarda, sal e pimenta'],
    passos: ['Cozinhe o brócolis e a cenoura no vapor por 5 minutos.', 'Grelhe as tiras de frango temperadas em frigideira bem quente.', 'Misture 1 colher de azeite, 1 de limão e ½ de mostarda para fazer o molho.', 'Monte as folhas, o tomate, os legumes e o frango por cima, ainda morno.', 'Regue com o molho.'],
    dica: 'O frango morno por cima das folhas faz a salada parecer refeição de verdade.',
    porque: 'Um prato grande e colorido com poucas calorias, para fechar o dia leve.'
  },

  // ---------------- BEBIDAS ANTI FOME (upsell; última coisa da janela, logo depois do jantar) ----------------
  // Dose pequena (ela acabou de jantar), poucas calorias e muita saciedade: fibra que incha (chia, psyllium) ou proteína.
  {
    id: 'agua-chia-limao', tipo: 'bebida', nome: 'Água de chia com limão e canela', tempo: '15 min (5 de preparo)', rende: '1 copo pequeno (150 ml)', g: 0, l: 0, c: 0,
    ingredientes: ['150 ml de água', '1 colher (chá) de chia', 'Suco de ½ limão', '1 pitada de canela'],
    passos: ['Misture a chia na água e mexa bem por 30 segundos, para não empelotar.', 'Deixe descansar 10 minutos, mexendo uma vez no meio: a chia forma um gel.', 'Junte o limão e a canela e beba devagar.'],
    dica: 'Prepare antes de jantar: quando terminar a refeição, já está no ponto.',
    porque: 'A chia incha no estômago e forma um gel que dá sensação de barriga cheia por horas, com quase nenhuma caloria.'
  },
  {
    id: 'cacau-psyllium', tipo: 'bebida', nome: 'Cacau cremoso com psyllium', tempo: '5 min', rende: '1 xícara pequena (150 ml)', g: 0, l: 1, c: 0,
    ingredientes: ['150 ml de leite desnatado (ou bebida de amêndoas sem açúcar)', '1 colher (chá) de cacau em pó 100%', '1 colher (chá) rasa de psyllium', 'Canela e 2 gotas de adoçante (opcional)'],
    passos: ['Aqueça o leite sem deixar ferver.', 'Misture o cacau e a canela com um pouco do leite, até virar uma pasta sem grumos.', 'Junte o resto do leite e o psyllium e bata com um garfo por 20 segundos.', 'Espere 2 minutos: engrossa e fica cremoso. Beba morno.'],
    dica: 'Sem lactose: use a bebida de amêndoas. O psyllium vende em farmácia e loja de produtos naturais.',
    porque: 'Tem gosto de sobremesa e mata a vontade de doce depois do jantar; o psyllium é fibra que segura a fome a noite toda.'
  },
  {
    id: 'caldo-gengibre', tipo: 'bebida', nome: 'Caldo morno de legumes com gengibre', tempo: '20 min', rende: '1 caneca pequena (150 ml)', g: 0, l: 0, c: 0,
    ingredientes: ['300 ml de água', '¼ de cenoura', '1 pedaço de salsão ou ½ chuchu', '1 rodela fina de gengibre', '1 pitada de sal e cheiro-verde'],
    passos: ['Ferva todos os ingredientes por 15 minutos, até a água reduzir pela metade.', 'Coe e sirva só o caldo, morno.', 'Beba devagar, em goles pequenos.'],
    dica: 'Faça 1 litro de uma vez e guarde na geladeira: dura 4 dias. É só aquecer 1 caneca pequena.',
    porque: 'Bebida quente e salgada dá saciedade e fecha o paladar, o sinal de que a janela acabou, com menos de 20 calorias.'
  },
  {
    id: 'iogurte-batido-canela', tipo: 'bebida', nome: 'Iogurte batido com canela', tempo: '3 min', rende: '1 copo pequeno (150 ml)', g: 0, l: 1, c: 0,
    ingredientes: ['100 g de iogurte natural desnatado', '50 ml de água gelada', '1 pitada generosa de canela', '1 colher (chá) de chia (opcional)'],
    passos: ['Bata o iogurte, a água e a canela com um garfo ou no mixer, até ficar líquido e espumoso.', 'Se quiser mais saciedade, misture a chia e espere 5 minutos.', 'Beba gelado.'],
    dica: 'Prefira o iogurte desnatado sem açúcar: o de sabor tem muito açúcar e dá fome mais rápido.',
    porque: 'Proteína em dose pequena: é a última coisa do dia e segura a fome até a manhã seguinte.'
  },
  {
    id: 'cha-hibisco-chia', tipo: 'bebida', nome: 'Chá gelado de hibisco com chia', tempo: '15 min', rende: '1 copo pequeno (150 ml)', g: 0, l: 0, c: 0,
    ingredientes: ['150 ml de água', '1 colher (sopa) de flor de hibisco seca (ou 1 sachê)', '1 colher (chá) de chia', 'Gelo e rodelas de limão'],
    passos: ['Ferva a água, desligue o fogo e junte o hibisco. Tampe e deixe 5 minutos.', 'Coe e misture a chia. Espere 10 minutos, mexendo uma vez.', 'Sirva com gelo e limão.'],
    dica: 'Gestantes não devem tomar hibisco. Nesse caso, troque pelo chá de canela.',
    porque: 'Refrescante, sem calorias, e a chia dá o volume que tira a vontade de beliscar à noite.'
  },
  {
    id: 'leite-dourado-leve', tipo: 'bebida', nome: 'Leite dourado leve', tempo: '5 min', rende: '1 xícara pequena (120 ml)', g: 0, l: 1, c: 0,
    ingredientes: ['120 ml de leite desnatado (ou bebida vegetal sem açúcar)', '1 pitada de cúrcuma (açafrão-da-terra)', '1 pitada de canela', '1 pitada de pimenta-do-reino', '1 rodela fina de gengibre (opcional)'],
    passos: ['Aqueça o leite com o gengibre em fogo baixo.', 'Desligue antes de ferver e misture a cúrcuma, a canela e a pimenta.', 'Coe o gengibre e beba morno, em goles pequenos.'],
    dica: 'A pitada de pimenta-do-reino faz o corpo aproveitar melhor a cúrcuma.',
    porque: 'Morno e cremoso, acalma e prepara o corpo para dormir sem fome, em dose pequena.'
  }
];
