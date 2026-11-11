/* Telas do funil (gerado a partir da estrutura do quiz). Cada tela = lista de blocos. */
window.SJ_TELAS = {
 "10": [
  {
   "tipo": "texto",
   "html": "<h2>Faz quanto tempo que você se sentiu na sua melhor forma?</h2>"
  },
  {
   "tipo": "imagem",
   "arquivo": "e10-melhor-forma-mulher.webp",
   "arredondar": true,
   "largura": 50,
   "se": "F"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "melhorForma",
   "opcoes": [
    {
     "texto": "0 a 6 meses atrás"
    },
    {
     "texto": "7 a 12 meses atrás"
    },
    {
     "texto": "1 a 3 anos atrás"
    },
    {
     "texto": "Mais de 3 anos atrás"
    }
   ],
   "se": "F"
  },
  {
   "tipo": "imagem",
   "arquivo": "e10-melhor-forma-homem.webp",
   "arredondar": true,
   "largura": 39,
   "se": "M"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "melhorForma",
   "opcoes": [
    {
     "texto": "0 a 6 meses atrás"
    },
    {
     "texto": "7 a 12 meses atrás"
    },
    {
     "texto": "1 a 3 anos atrás"
    },
    {
     "texto": "Mais de 3 anos atrás"
    }
   ],
   "se": "M"
  }
 ],
 "11": [
  {
   "tipo": "texto",
   "html": "<h2>O que mais te descreve?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "descricao",
   "opcoes": [
    {
     "texto": "Tenho dificuldade em ganhar músculos",
     "emoji": "🙄"
    },
    {
     "texto": "Eu ganho e perco sem esforço",
     "emoji": "💪"
    },
    {
     "texto": "Eu ganho peso facilmente, mas tenho dificuldade para perder",
     "emoji": "😬"
    }
   ]
  }
 ],
 "12": [
  {
   "tipo": "texto",
   "html": "<h2>Algum desses acontecimentos fez você ganhar peso nos últimos anos?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "",
   "variavel": "causas",
   "opcoes": [
    {
     "texto": "Casamento ou relacionamento",
     "emoji": "👰"
    },
    {
     "texto": "Rotina corrida com trabalho ou família",
     "emoji": "😓"
    },
    {
     "texto": "Dificuldades financeiras",
     "emoji": "💰"
    },
    {
     "texto": "Lesão ou incapacidade",
     "emoji": "🏥"
    },
    {
     "texto": "Estresse ou problemas de saúde mental",
     "emoji": "😖"
    },
    {
     "texto": "Nenhuma das acima",
     "emoji": "❌"
    }
   ],
   "multipla": true
  }
 ],
 "13": [
  {
   "tipo": "texto",
   "html": "<h2>Você tem algum desses hábitos que podem estar atrapalhando sua vida?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "",
   "variavel": "habitos",
   "opcoes": [
    {
     "texto": "Eu como tarde da noite",
     "emoji": "💤"
    },
    {
     "texto": "Não consigo parar de comer doces",
     "emoji": "🍫"
    },
    {
     "texto": "Eu amo refrigerantes",
     "emoji": "🥤"
    },
    {
     "texto": "Eu adoro alimentos gordurosos ou salgados",
     "emoji": "🧂"
    },
    {
     "texto": "Nenhuma das acima",
     "emoji": "❌"
    }
   ],
   "multipla": true
  }
 ],
 "14": [
  {
   "tipo": "texto",
   "html": "<h2>Por que você acha que ficou mais difícil perder peso, com a idade?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "porque",
   "opcoes": [
    {
     "texto": "Porque eu como mais do que antes",
     "emoji": "🍕"
    },
    {
     "texto": "Porque eu parei de fazer atividade física",
     "emoji": "🏋️‍♂️",
     "valor": "Porque eu me mexo menos"
    },
    {
     "texto": "Porque o meu metabolismo ficou mais lento",
     "emoji": "🐢"
    },
    {
     "texto": "Não faço ideia",
     "emoji": "🤷"
    }
   ]
  }
 ],
 "15": [
  {
   "tipo": "texto",
   "html": "<h2>Você acertou! 🎯 <span style=\"color: rgb(13, 148, 136);\">É o seu metabolismo.</span></h2>",
   "cond": [
    "porque",
    "igual",
    "Porque o meu metabolismo ficou mais lento"
   ]
  },
  {
   "tipo": "texto",
   "html": "<h2>Não é culpa sua. <span style=\"color: rgb(13, 148, 136);\">É o seu metabolismo.</span></h2>",
   "cond": [
    "porque",
    "diferente",
    "Porque o meu metabolismo ficou mais lento"
   ]
  },
  {
   "tipo": "imagem",
   "arquivo": "e15-mecanismo-2-revelacao.webp"
  },
  {
   "tipo": "texto",
   "html": "<p>Com os anos, o corpo passa a <strong>guardar gordura em vez de queimar</strong>, mesmo comendo igual.</p>"
  },
  {
   "tipo": "botao",
   "texto": "E como eu volto a queimar? 👉",
   "acao": "proxima",
   "relevo": true,
   "halo": true
  }
 ],
 "16": [
  {
   "tipo": "texto",
   "html": "<h2>O <span style=\"color: rgb(0, 0, 0);\">Jejum com Água</span> &nbsp;é o <span style=\"color: rgb(13, 148, 136);\">jeito mais rápido e barato</span> de ligar o seu MODO QUEIMA</h2>"
  },
  {
   "tipo": "espaco",
   "altura": 12
  },
  {
   "tipo": "imagem",
   "arquivo": "e16-mecanismo-3-jejum-com-agua.webp"
  },
  {
   "tipo": "espaco",
   "altura": 11
  },
  {
   "tipo": "lista",
   "rico": true,
   "icone": "✅",
   "itens": [
    "<p><strong>Tempo certo sem comer:</strong> o corpo se limpa por dentro e volta a queimar gordura</p>",
    "<p><strong>Água certa:</strong> controla a fome e desincha a barriga</p>",
    "<p><strong>No seu horário:</strong>&nbsp;e sem cortar o que você gosta de comer</p>"
   ]
  },
  {
   "tipo": "espaco",
   "altura": 11
  },
  {
   "tipo": "botao",
   "texto": "Calcular os meus números",
   "acao": "proxima",
   "relevo": true,
   "halo": true
  }
 ],
 "17": [
  {
   "tipo": "texto",
   "html": "<h2>Quando você costuma tomar seu café da manhã?</h2>"
  },
  {
   "tipo": "texto",
   "html": "<p>O seu plano vai respeitar os horários que você já tem.</p>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "cafe",
   "opcoes": [
    {
     "texto": "Entre 6 e 8 da manhã",
     "imagem": "e17-entre-6-e-8-da-manha.webp"
    },
    {
     "texto": "Entre 8 e 10 da manhã",
     "imagem": "e17-entre-8-e-10-da-manha.webp"
    },
    {
     "texto": "Entre 10h e meio-dia",
     "imagem": "e17-entre-10h-e-meio-dia.webp"
    },
    {
     "texto": "Eu costumo pular o café da manhã",
     "imagem": "e17-eu-costumo-pular-o-cafe-da-m.webp"
    }
   ]
  }
 ],
 "18": [
  {
   "tipo": "texto",
   "html": "<h2>Quando você costuma almoçar?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "almoco",
   "opcoes": [
    {
     "texto": "Entre 10h e 12h",
     "imagem": "e18-entre-10h-e-12h.webp"
    },
    {
     "texto": "Entre 12h e 14h",
     "imagem": "e18-entre-12h-e-14h.webp"
    },
    {
     "texto": "Entre 14h e 16h",
     "imagem": "e18-entre-14h-e-16h.webp"
    },
    {
     "texto": "Eu costumo pular o almoço",
     "imagem": "e18-eu-costumo-pular-o-almoco.webp"
    }
   ]
  }
 ],
 "19": [
  {
   "tipo": "texto",
   "html": "<h2>Quando você janta?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "jantar",
   "opcoes": [
    {
     "texto": "Entre 16h e 18h",
     "imagem": "e19-entre-16h-e-18h.webp"
    },
    {
     "texto": "Entre 18h e 20h",
     "imagem": "e19-entre-18h-e-20h.webp"
    },
    {
     "texto": "Entre 20h e 22h",
     "imagem": "e19-entre-20h-e-22h.webp"
    },
    {
     "texto": "Eu costumo pular o jantar",
     "imagem": "e18-eu-costumo-pular-o-almoco.webp"
    }
   ]
  }
 ],
 "20": [
  {
   "tipo": "texto",
   "html": "<h2>Você precisa de uma pausa no Jejum para o final de semana?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "fimDeSemana",
   "opcoes": [
    {
     "texto": "Claro que sim! Final de semana é para curtir",
     "emoji": "👌"
    },
    {
     "texto": "Não paro nem no fim de semana!",
     "emoji": "💪"
    }
   ]
  }
 ],
 "21": [
  {
   "tipo": "texto",
   "html": "<h2>Qual é a sua ingestão diária de água?</h2>"
  },
  {
   "tipo": "imagem",
   "arquivo": "e21-agua-mulher.webp",
   "arredondar": true,
   "largura": 50,
   "se": "F"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "agua",
   "opcoes": [
    {
     "texto": "Eu só tomo café ou chá"
    },
    {
     "texto": "Cerca de 2 copos"
    },
    {
     "texto": "2 a 6 copos"
    },
    {
     "texto": "Mais de 6 copos"
    }
   ],
   "se": "F"
  },
  {
   "tipo": "imagem",
   "arquivo": "e21-agua-homem.webp",
   "arredondar": true,
   "largura": 32,
   "se": "M"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "agua",
   "opcoes": [
    {
     "texto": "Eu só tomo café ou chá"
    },
    {
     "texto": "Cerca de 2 copos"
    },
    {
     "texto": "2 a 6 copos"
    },
    {
     "texto": "Mais de 6 copos"
    }
   ],
   "se": "M"
  }
 ],
 "22": [
  {
   "tipo": "texto",
   "html": "<h2>Com que frequência você se exercita?</h2>"
  },
  {
   "tipo": "imagem",
   "arquivo": "e22-exercicio-mulher.webp",
   "arredondar": true,
   "largura": 50,
   "se": "F"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "exercicio",
   "opcoes": [
    {
     "texto": "Quase todos os dias"
    },
    {
     "texto": "Várias vezes por semana"
    },
    {
     "texto": "Várias vezes por mês"
    },
    {
     "texto": "Nunca"
    }
   ],
   "se": "F"
  },
  {
   "tipo": "imagem",
   "arquivo": "e22-exercicio-homem.webp",
   "arredondar": true,
   "largura": 36,
   "se": "M"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "exercicio",
   "opcoes": [
    {
     "texto": "Quase todos os dias"
    },
    {
     "texto": "Várias vezes por semana"
    },
    {
     "texto": "Várias vezes por mês"
    },
    {
     "texto": "Nunca"
    }
   ],
   "se": "M"
  }
 ],
 "23": [
  {
   "tipo": "texto",
   "html": "<h2>Você fica sem fôlego depois de subir um lance de escadas?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "folego",
   "opcoes": [
    {
     "texto": "Fico tão sem fôlego que não consigo falar",
     "emoji": "🥵"
    },
    {
     "texto": "Fico um pouco sem fôlego, mas consigo falar",
     "emoji": "💨"
    },
    {
     "texto": "Fico bem depois de um lance de escadas",
     "emoji": "🙂"
    },
    {
     "texto": "Eu consigo subir alguns lances de escada facilmente",
     "emoji": "🚀"
    }
   ]
  }
 ],
 "24": [
  {
   "tipo": "texto",
   "html": "<h2>Quantas horas você costuma dormir?</h2>"
  },
  {
   "tipo": "imagem",
   "arquivo": "e24-sono-mulher.webp",
   "arredondar": true,
   "largura": 50,
   "se": "F"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "sono",
   "opcoes": [
    {
     "texto": "Durmo pouco (menos de 5 horas)"
    },
    {
     "texto": "Eu consigo dormir um pouco (5-6 horas)"
    },
    {
     "texto": "Eu durmo muito e bem (7-8 horas)"
    },
    {
     "texto": "Gosto de dormir até mais tarde (mais de 8 horas)"
    }
   ],
   "se": "F"
  },
  {
   "tipo": "imagem",
   "arquivo": "e24-sono-homem.webp",
   "arredondar": true,
   "largura": 43,
   "se": "M"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "sono",
   "opcoes": [
    {
     "texto": "Durmo pouco (menos de 5 horas)"
    },
    {
     "texto": "Eu consigo dormir um pouco (5-6 horas)"
    },
    {
     "texto": "Eu durmo muito e bem (7-8 horas)"
    },
    {
     "texto": "Gosto de dormir até mais tarde (mais de 8 horas)"
    }
   ],
   "se": "M"
  }
 ],
 "25": [
  {
   "tipo": "texto",
   "html": "<h2>Não é só o seu corpo! Veja como o Jejum pode mudar o seu rosto!</h2>"
  },
  {
   "tipo": "imagem",
   "arquivo": "e25-rosto-quebra-mulher.webp",
   "se": "F"
  },
  {
   "tipo": "imagem",
   "arquivo": "e25-rosto-quebra-homem.webp",
   "se": "M"
  },
  {
   "tipo": "texto",
   "html": "<p>Perder peso através do jejum ajuda a reduzir gordura e inchaço no rosto, principalmente ao redor dos olhos, queixo e mandíbula, deixando sua pele com aparência mais jovem e saudável.</p>"
  },
  {
   "tipo": "botao",
   "texto": "Continuar",
   "acao": "proxima",
   "relevo": true
  }
 ],
 "26": [
  {
   "tipo": "texto",
   "html": "<h2>Quão motivado você está para perder peso?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "motivacao",
   "opcoes": [
    {
     "texto": "Estou tentando fazer o jejum apenas por curiosidade",
     "emoji": "🤔"
    },
    {
     "texto": "Estou determinado a diminuir um ou dois tamanhos",
     "emoji": "🤘"
    },
    {
     "texto": "Eu não vou parar até atingir meu peso ideal",
     "emoji": "🔥"
    }
   ]
  }
 ],
 "27": [
  {
   "tipo": "texto",
   "html": "<h2>Qual é a sua altura?</h2>"
  },
  {
   "tipo": "regua",
   "medida": "altura",
   "variavel": "altura",
   "valor": 165,
   "min": 120,
   "max": 220
  },
  {
   "tipo": "botao",
   "texto": "Continuar",
   "acao": "proxima",
   "relevo": true
  }
 ],
 "28": [
  {
   "tipo": "texto",
   "html": "<h2>Qual é o seu peso atual?</h2>"
  },
  {
   "tipo": "regua",
   "medida": "peso",
   "variavel": "pesoAtual",
   "valor": 80,
   "min": 40,
   "max": 250
  },
  {
   "tipo": "botao",
   "texto": "Continuar",
   "acao": "proxima",
   "relevo": true
  }
 ],
 "29": [
  {
   "tipo": "texto",
   "html": "<h2>Qual é o seu peso desejado?</h2>"
  },
  {
   "tipo": "regua",
   "medida": "peso",
   "variavel": "pesoDesejado",
   "valor": 70,
   "min": 40,
   "max": 250
  },
  {
   "tipo": "botao",
   "texto": "Continuar",
   "acao": "proxima",
   "relevo": true
  }
 ],
 "30": [
  {
   "tipo": "texto",
   "html": "<h2>Resumo do seu nível de condicionamento físico</h2>"
  },
  {
   "tipo": "texto",
   "html": "<p><strong>Índice de massa corporal (IMC)</strong></p><p><span style=\"color: rgb(107, 114, 128);\">O seu IMC: <strong>{{imc}}</strong> · Normal: entre 18,5 e 25</span></p>",
   "esq": true
  },
  {
   "tipo": "nivel",
   "percentual": 83,
   "cor": "#ef4444",
   "mostrarPct": true,
   "variavel": "imcPct"
  },
  {
   "tipo": "texto",
   "html": "<p><span style=\"color: rgb(107, 114, 128);\">Abaixo · Normal · Obesidade</span></p>",
   "esq": true
  },
  {
   "tipo": "imagem",
   "arquivo": "e30-imc-mulher.webp",
   "largura": 44,
   "se": "F"
  },
  {
   "tipo": "imagem",
   "arquivo": "e30-imc-homem.webp",
   "largura": 60,
   "se": "M"
  },
  {
   "tipo": "lista",
   "rico": true,
   "icone": "",
   "caixa": {
    "fundo": "#fef6e4",
    "borda": "#fde9c0",
    "texto": "#ca8a04"
   },
   "cond": [
    "imcFaixa",
    "igual",
    "normal"
   ],
   "itens": [
    "<p>Seu peso está na faixa normal, mas a sua barriga mostra que o <span style=\"font-weight: bold;\">seu corpo ainda não está no modo de queima.</span></p><p>Parabéns por dar o primeiro passo. Vamos criar um plano personalizado para acelerar seu metabolismo, aumentar sua força e melhorar sua saúde.</p>"
   ]
  },
  {
   "tipo": "lista",
   "rico": true,
   "icone": "",
   "caixa": {
    "fundo": "#fef6e4",
    "borda": "#fde9c0",
    "texto": "#ca8a04"
   },
   "cond": [
    "imcFaixa",
    "igual",
    "sobrepeso"
   ],
   "itens": [
    "<p>O seu IMC indica <strong>sobrepeso</strong>. O seu corpo está <span style=\"font-weight: bold;\">segurando gordura e líquido</span>, principalmente na barriga.</p><p>Parabéns por dar o primeiro passo. Vamos criar um plano personalizado para acelerar seu metabolismo, aumentar sua força e melhorar sua saúde.</p>"
   ]
  },
  {
   "tipo": "lista",
   "rico": true,
   "icone": "",
   "caixa": {
    "fundo": "#fef6e4",
    "borda": "#fde9c0",
    "texto": "#ca8a04"
   },
   "cond": [
    "imcFaixa",
    "igual",
    "obesidade"
   ],
   "itens": [
    "<p><strong>Sua situação é preocupante!</strong> O seu IMC indica <strong>obesidade</strong>. O seu metabolismo <span style=\"font-weight: bold;\">desligou o modo de limpeza e queima</span>, e é por isso que o peso não sai.</p><p>Parabéns por dar o primeiro passo. Vamos criar um plano personalizado para acelerar seu metabolismo, aumentar sua força e melhorar sua saúde.</p>"
   ]
  },
  {
   "tipo": "botao",
   "texto": "Continuar",
   "acao": "proxima",
   "relevo": true
  }
 ],
 "31": [
  {
   "tipo": "texto",
   "html": "<h2>Você tem algum evento importante chegando?</h2>"
  },
  {
   "tipo": "texto",
   "html": "<p>Ter algo para esperar pode ser uma grande motivação para alcançar o seu objetivo!</p>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "evento",
   "opcoes": [
    {
     "texto": "Férias",
     "emoji": "✈️"
    },
    {
     "texto": "Casamento",
     "emoji": "👰"
    },
    {
     "texto": "Feriado",
     "emoji": "🏖️"
    },
    {
     "texto": "Evento esportivo",
     "emoji": "🏆"
    },
    {
     "texto": "Encontro de amigos",
     "emoji": "🎂"
    },
    {
     "texto": "Aniversário",
     "emoji": "🥳"
    },
    {
     "texto": "Outro",
     "emoji": "🤷"
    },
    {
     "texto": "Não tenho nenhum evento",
     "emoji": "❌"
    }
   ]
  }
 ],
 "32": [
  {
   "tipo": "carregamento",
   "titulo": "Criando o seu Plano Personalizado de Jejum",
   "descricao": "Estamos preparando o seu plano exclusivo e personalizado..",
   "segundos": 7
  },
  {
   "tipo": "texto",
   "html": "<h1>+50 mil pessoas</h1><p>nos escolheram, veja o que eles falaram sobre nós...</p>"
  },
  {
   "tipo": "carrossel",
   "proporcao": "1/1",
   "itens": [
    "e32-depoimento-1.webp",
    "e32-depoimento-2.webp",
    "e32-depoimento-3.webp",
    "e32-depoimento-4.webp"
   ]
  }
 ],
 "33": [
  {
   "tipo": "texto",
   "html": "<h2>O seu Plano Personalizado de Jejum está pronto!</h2>"
  },
  {
   "tipo": "texto",
   "html": "<p>De acordo com as suas respostas, você pode chegar a:</p>"
  },
  {
   "tipo": "texto",
   "html": "<h2><strong style=\"color: rgb(13, 148, 136);\">{{pesoDesejado}} kg em 21 dias</strong></h2>"
  },
  {
   "tipo": "grafico",
   "cores": [
    "#dc2626",
    "#fbbf24",
    "#22c55e"
   ],
   "eixoIni": "Hoje",
   "eixoFim": "21d",
   "pontos": [
    {
     "rotulo": "{{pesoAtual}}kg",
     "valor": 100
    },
    {
     "valor": 90
    },
    {
     "valor": 75
    },
    {
     "valor": 32
    },
    {
     "valor": 15
    },
    {
     "rotulo": "{{pesoDesejado}}kg",
     "valor": 8,
     "destaque": true
    }
   ]
  },
  {
   "tipo": "imagem",
   "arquivo": "e33-projecao-mulher.webp",
   "se": "F"
  },
  {
   "tipo": "imagem",
   "arquivo": "e33-projecao-homem.webp",
   "se": "M"
  },
  {
   "tipo": "argumentos",
   "colunas": 2,
   "itens": [
    "<p><strong>Hoje</strong></p><p>Nível de gordura: <strong style=\"color: rgb(220, 38, 38);\">Alto</strong></p><p>Nível de energia: <strong style=\"color: rgb(220, 38, 38);\">Baixo</strong></p><p>Metabolismo: <strong style=\"color: rgb(220, 38, 38);\">Lento</strong></p>",
    "<p><strong>Em 21 dias</strong></p><p>Nível de gordura: <strong style=\"color: rgb(22, 163, 74);\">Baixo</strong></p><p>Nível de energia: <strong style=\"color: rgb(22, 163, 74);\">Alto</strong></p><p>Metabolismo: <strong style=\"color: rgb(22, 163, 74);\">No modo de queima</strong></p>"
   ]
  },
  {
   "tipo": "botao",
   "texto": "Ver o meu plano",
   "acao": "proxima",
   "relevo": true
  }
 ],
 "34": [
  {
   "tipo": "texto",
   "html": "<h2>Veja como vai funcionar o seu <span style=\"color: rgb(42, 187, 165);\">Plano de 21 Dias 👇</span></h2>"
  },
  {
   "tipo": "video"
  },
  {
   "tipo": "timer",
   "texto": "⏰ O seu desconto expira em",
   "minutos": 10
  },
  {
   "tipo": "botao",
   "texto": "QUERO O MEU PLANO",
   "acao": "checkout",
   "relevo": true,
   "pulsar": true,
   "halo": true
  },
  {
   "tipo": "imagem",
   "arquivo": "e34-oferta-vsl.webp"
  }
 ],
 "01": [
  {
   "tipo": "texto",
   "html": "<h2>Esse <strong style=\"color: rgb(0, 0, 0);\">método de</strong><strong style=\"color: rgb(13, 148, 136);\"> Jejum Com Água</strong> está ajudando Homens e Mulheres a <strong style=\"color: rgb(161, 0, 0);\">eliminar até 10kg em 21 dias</strong> sem passar fome</h2>"
  },
  {
   "tipo": "espaco",
   "altura": 14
  },
  {
   "tipo": "imagem",
   "arquivo": "e01-capa.webp"
  },
  {
   "tipo": "texto",
   "html": "<h3>Faça o teste <strong style=\"color: rgb(20, 184, 166);\">gratuito de 1 minuto</strong>&nbsp;e receba:</h3>"
  },
  {
   "tipo": "lista",
   "rico": true,
   "icone": "✅",
   "itens": [
    "<p><strong>A sua janela de jejum</strong> de acordo com seu peso</p>",
    "<p>Quais horários seu corpo <strong>mais queima gordura</strong></p>",
    "<p>Quanto<span style=\"font-weight: bold;\"> <span style=\"color: rgb(182, 43, 43);\">peso você pode perder</span></span> em 21 dias com jejum</p>",
    "<p>O seu <strong style=\"color: rgb(48, 181, 161);\">plano personalizado</strong> de 21 dias</p>"
   ]
  },
  {
   "tipo": "botao",
   "texto": "QUERO MEU HORÁRIO DE JEJUM!",
   "acao": "proxima",
   "relevo": true,
   "pulsar": true,
   "fixo": true,
   "halo": true
  }
 ],
 "02": [
  {
   "tipo": "texto",
   "html": "<h2>Jejum para:</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "grade",
   "indicador": "seta",
   "variavel": "genero",
   "opcoes": [
    {
     "texto": "Mulher",
     "imagem": "e02-mulher.webp"
    },
    {
     "texto": "Homem",
     "imagem": "e02-homem.webp"
    }
   ]
  }
 ],
 "03": [
  {
   "tipo": "texto",
   "html": "<h2>Ajuste o seu plano de acordo com a sua idade</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "idade",
   "opcoes": [
    {
     "texto": "18 a 25 anos",
     "imagem": "e03-18-a-25-anos-mulher.webp"
    },
    {
     "texto": "26 a 35 anos",
     "imagem": "e03-26-a-35-anos-mulher.webp"
    },
    {
     "texto": "36 a 45 anos",
     "imagem": "e03-36-a-45-anos-mulher.webp"
    },
    {
     "texto": "+46 anos",
     "imagem": "e03-46-anos-mulher.webp"
    }
   ],
   "se": "F"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "idade",
   "opcoes": [
    {
     "texto": "18 a 25 anos",
     "imagem": "e03-18-a-25-anos-homem.webp"
    },
    {
     "texto": "26 a 35 anos",
     "imagem": "e03-26-a-35-anos-homem.webp"
    },
    {
     "texto": "36 a 45 anos",
     "imagem": "e03-36-a-45-anos-homem.webp"
    },
    {
     "texto": "+46 anos",
     "imagem": "e03-46-anos-homem.webp"
    }
   ],
   "se": "M"
  }
 ],
 "04": [
  {
   "tipo": "texto",
   "html": "<h2>Ligue o <span style=\"color: rgb(43, 156, 139);\"><strong>modo de limpeza e queima de gordura</strong></span> do seu corpo TODOS OS DIAS</h2>"
  },
  {
   "tipo": "imagem",
   "arquivo": "e04-one-belief-mulher.webp",
   "largura": 85,
   "se": "F"
  },
  {
   "tipo": "imagem",
   "arquivo": "e04-one-belief-homem.webp",
   "largura": 85,
   "se": "M"
  },
  {
   "tipo": "espaco",
   "altura": 10
  },
  {
   "tipo": "texto",
   "html": "<p>O <strong>Jejum com Água&nbsp;</strong>calcula as horas certas de jejum para o seu corpo, para <span style=\"font-weight: bold; color: rgb(44, 160, 143);\">acelerar o metabolismo</span> e sem passar fome.</p>"
  },
  {
   "tipo": "espaco",
   "altura": 14
  },
  {
   "tipo": "botao",
   "texto": "Quero descobrir os meus números",
   "acao": "proxima",
   "relevo": true,
   "halo": true
  }
 ],
 "05": [
  {
   "tipo": "texto",
   "html": "<h2>Qual é o seu objetivo principal?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "objetivo",
   "opcoes": [
    {
     "texto": "Perder peso",
     "imagem": "e05-perder-peso-mulher.webp"
    },
    {
     "texto": "Ficar em forma",
     "imagem": "e05-ficar-em-forma-mulher.webp"
    },
    {
     "texto": "Melhorar a saúde do coração",
     "imagem": "e05-melhorar-a-saude-do-coracao-mulher.webp"
    },
    {
     "texto": "Aliviar o estresse",
     "imagem": "e05-aliviar-o-estresse-mulher.webp"
    }
   ],
   "se": "F"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "objetivo",
   "opcoes": [
    {
     "texto": "Perder peso",
     "emoji": "🤘"
    },
    {
     "texto": "Ficar em forma",
     "emoji": "👌"
    },
    {
     "texto": "Melhorar a saúde do coração",
     "emoji": "🫀"
    },
    {
     "texto": "Aliviar o estresse",
     "emoji": "💆"
    }
   ],
   "se": "M"
  }
 ],
 "06": [
  {
   "tipo": "texto",
   "html": "<h2>Como você descreveria seu físico?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "fisico",
   "opcoes": [
    {
     "texto": "Magra",
     "imagem": "e06-magra-mulher.webp"
    },
    {
     "texto": "Falsa magra",
     "imagem": "e06-falsa-magra-mulher.webp"
    },
    {
     "texto": "Sobrepeso",
     "imagem": "e06-sobrepeso-mulher.webp"
    },
    {
     "texto": "Obesa",
     "imagem": "e06-obesa-mulher.webp"
    }
   ],
   "se": "F"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "fisico",
   "opcoes": [
    {
     "texto": "Magro",
     "imagem": "e06-magro-homem.webp"
    },
    {
     "texto": "Flácido",
     "imagem": "e06-flacido-homem.webp"
    },
    {
     "texto": "Uns quilinhos a mais",
     "imagem": "e06-uns-quilinhos-a-mais-homem.webp"
    },
    {
     "texto": "Obeso",
     "imagem": "e06-obeso-homem.webp"
    }
   ],
   "se": "M"
  }
 ],
 "07": [
  {
   "tipo": "texto",
   "html": "<h2>Sabemos como mantê-la em forma e saudável a longo prazo</h2>",
   "se": "F"
  },
  {
   "tipo": "texto",
   "html": "<h2>Sabemos como mantê-lo em forma e saudável a longo prazo</h2>",
   "se": "M"
  },
  {
   "tipo": "imagem",
   "arquivo": "e07-prova-social-50-mil.webp"
  },
  {
   "tipo": "texto",
   "html": "<h1>+50 mil pessoas</h1><h3>escolheram o {{produto}}</h3>"
  },
  {
   "tipo": "imagem",
   "arquivo": "e07-prova-social-50-mil-mulher.webp",
   "largura": 57,
   "se": "F"
  },
  {
   "tipo": "imagem",
   "arquivo": "e07-prova-social-50-mil-homem.webp",
   "largura": 61,
   "se": "M"
  },
  {
   "tipo": "botao",
   "texto": "Continuar",
   "acao": "proxima",
   "relevo": true,
   "halo": true
  }
 ],
 "08": [
  {
   "tipo": "texto",
   "html": "<h2>Qual corpo você deseja alcançar?</h2>",
   "se": "F"
  },
  {
   "tipo": "texto",
   "html": "<h2>Qual é o seu objetivo corporal?</h2>",
   "se": "M"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "corpoDesejado",
   "opcoes": [
    {
     "texto": "Curvilínea",
     "imagem": "e08-curvilinea-mulher.webp"
    },
    {
     "texto": "Magra",
     "imagem": "e08-magra-mulher.webp"
    },
    {
     "texto": "Normal",
     "imagem": "e08-normal-mulher.webp"
    },
    {
     "texto": "Em forma",
     "imagem": "e05-ficar-em-forma-mulher.webp"
    },
    {
     "texto": "Cheia",
     "imagem": "e08-cheia-mulher.webp"
    }
   ],
   "se": "F"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "seta",
   "variavel": "corpoDesejado",
   "opcoes": [
    {
     "texto": "Magro",
     "imagem": "e08-magro-homem.webp"
    },
    {
     "texto": "Em forma",
     "imagem": "e06-magro-homem.webp"
    },
    {
     "texto": "Definido",
     "imagem": "e08-definido-homem.webp"
    },
    {
     "texto": "Rasgado",
     "imagem": "e08-rasgado-homem.webp"
    }
   ],
   "se": "M"
  }
 ],
 "09": [
  {
   "tipo": "texto",
   "html": "<h2>Quais áreas do corpo você quer focar?</h2>"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "",
   "variavel": "areas",
   "opcoes": [
    {
     "texto": "Barriga",
     "imagem": "e09-barriga-mulher.webp"
    },
    {
     "texto": "Bunda",
     "imagem": "e09-bunda-mulher.webp"
    },
    {
     "texto": "Peito",
     "imagem": "e09-peito-mulher.webp"
    },
    {
     "texto": "Pernas",
     "imagem": "e09-pernas-mulher.webp"
    }
   ],
   "multipla": true,
   "se": "F"
  },
  {
   "tipo": "opcoes",
   "layout": "lista",
   "indicador": "",
   "variavel": "areas",
   "opcoes": [
    {
     "texto": "Braços",
     "imagem": "e09-bracos-homem.webp"
    },
    {
     "texto": "Peito",
     "imagem": "e09-peito-homem.webp"
    },
    {
     "texto": "Barriga",
     "imagem": "e09-barriga-homem.webp"
    },
    {
     "texto": "Pernas",
     "imagem": "e09-pernas-homem.webp"
    },
    {
     "texto": "Costas",
     "imagem": "e09-costas-homem.webp"
    }
   ],
   "multipla": true,
   "se": "M"
  }
 ]
};
window.SJ_ETAPAS = [
 {
  "id": "01",
  "nome": "Capa",
  "progresso": false
 },
 {
  "id": "02",
  "nome": "Gênero",
  "progresso": true
 },
 {
  "id": "03",
  "nome": "Idade",
  "progresso": true
 },
 {
  "id": "04",
  "nome": "One Belief",
  "progresso": true
 },
 {
  "id": "05",
  "nome": "Objetivo",
  "progresso": true
 },
 {
  "id": "06",
  "nome": "Físico atual",
  "progresso": true
 },
 {
  "id": "07",
  "nome": "Prova social +50 mil",
  "progresso": true
 },
 {
  "id": "08",
  "nome": "Corpo desejado",
  "progresso": true
 },
 {
  "id": "09",
  "nome": "Áreas do corpo",
  "progresso": true
 },
 {
  "id": "10",
  "nome": "Melhor forma",
  "progresso": true
 },
 {
  "id": "11",
  "nome": "O que mais te descreve",
  "progresso": true
 },
 {
  "id": "12",
  "nome": "Causas",
  "progresso": true
 },
 {
  "id": "13",
  "nome": "Hábitos",
  "progresso": true
 },
 {
  "id": "14",
  "nome": "Mecanismo 1 (pergunta)",
  "progresso": true
 },
 {
  "id": "15",
  "nome": "Mecanismo 2 (revelação)",
  "progresso": true
 },
 {
  "id": "16",
  "nome": "Mecanismo 3 (Jejum com Água)",
  "progresso": true
 },
 {
  "id": "17",
  "nome": "Café da manhã",
  "progresso": true
 },
 {
  "id": "18",
  "nome": "Almoço",
  "progresso": true
 },
 {
  "id": "19",
  "nome": "Jantar",
  "progresso": true
 },
 {
  "id": "20",
  "nome": "Fim de semana",
  "progresso": true
 },
 {
  "id": "21",
  "nome": "Água",
  "progresso": true
 },
 {
  "id": "22",
  "nome": "Exercício",
  "progresso": true
 },
 {
  "id": "23",
  "nome": "Fôlego",
  "progresso": true
 },
 {
  "id": "24",
  "nome": "Sono",
  "progresso": true
 },
 {
  "id": "25",
  "nome": "Rosto (quebra)",
  "progresso": true
 },
 {
  "id": "26",
  "nome": "Motivação",
  "progresso": true
 },
 {
  "id": "27",
  "nome": "Altura",
  "progresso": true
 },
 {
  "id": "28",
  "nome": "Peso atual",
  "progresso": true
 },
 {
  "id": "29",
  "nome": "Peso desejado",
  "progresso": true
 },
 {
  "id": "30",
  "nome": "IMC",
  "progresso": true
 },
 {
  "id": "31",
  "nome": "Evento",
  "progresso": true
 },
 {
  "id": "32",
  "nome": "Carregamento + prova social",
  "progresso": true
 },
 {
  "id": "33",
  "nome": "Projeção",
  "progresso": true
 },
 {
  "id": "34",
  "nome": "Oferta (VSL)",
  "progresso": false
 }
];
