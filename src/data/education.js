/**
 * 5 Interactive Educational Modules + Quick Knowledge Quiz
 */

export const EDUCATION_MODULES = [
  {
    id: 'mod1',
    number: 'Módulo 1',
    title: 'O que é o dólar e por que ele importa?',
    subtitle: 'A moeda âncora do comércio global e das reservas internacionais.',
    summary: 'O dólar americano (USD) funciona como a principal unidade de conta e reserva de valor do planeta. Grande parte do petróleo, grãos, minérios, fretes marítimos e contratos internacionais é precificada em dólar.',
    keyPoints: [
      {
        label: 'Moeda de reserva mundial',
        detail: 'Bancos centrais de quase todos os países mantêm dólares em suas reservas internacionais para garantir importações essenciais e estabilizar crises.'
      },
      {
        label: 'Comércio internacional',
        detail: 'Mesmo quando o Brasil vende soja para a China ou o Japão compra gás natural, os contratos costumam usar o dólar como referência de preço.'
      },
      {
        label: 'Relação cambial (1 USD = X)',
        detail: 'Quando dizemos que 1 USD passou de R$ 5,00 para R$ 5,80, significa que são necessários mais reais para comprar 1 dólar — ou seja, o real se desvalorizou.'
      }
    ],
    interactiveType: 'dollar-flow',
    interactiveTitle: 'Simulador Visual: Fluxo Global do Dólar'
  },
  {
    id: 'mod2',
    number: 'Módulo 2',
    title: 'Por que as moedas valorizam e desvalorizam?',
    subtitle: 'Entenda a dinâmica entre inflação, juros, dívida, confiança e comércio.',
    summary: 'A taxa de câmbio é o preço de uma moeda em relação a outra. Como todo preço em mercado flutuante, ele reage à oferta e demanda de dólares no país e às expectativas sobre o futuro.',
    keyPoints: [
      { label: 'Inflação', detail: 'Inflação alta corrói o poder de compra da moeda local e pressiona o câmbio para cima (desvalorização).' },
      { label: 'Taxas de juros', detail: 'Juros mais altos atraem capital estrangeiro em busca de rendimento, aumentando a entrada de dólares e valorizando a moeda local (mas esfriando a economia).' },
      { label: 'Dívida pública e gastos', detail: 'Se investidores temem que o governo não consiga pagar a dívida sem imprimir dinheiro ou dar calote, exigem prêmio maior e fogem da moeda local.' },
      { label: 'Balança comercial e reservas', detail: 'Superávits comerciais trazem dólares pela exportação; reservas robustas dão segurança contra ataques especulativos.' },
      { label: 'Cenário mundial', detail: 'Quando os EUA sobem juros ou ocorre uma guerra/crise global, investidores correm para a segurança do dólar ("flight to safety").' }
    ],
    interactiveType: 'fx-sandbox',
    interactiveTitle: 'Laboratório Cambial Interativo: Mova os Fatores'
  },
  {
    id: 'mod3',
    number: 'Módulo 3',
    title: 'Como a economia afeta o dia a dia da população?',
    subtitle: 'Do preço do combustível à vaga de emprego e ao orçamento da escola.',
    summary: 'Indicadores macroeconômicos não são números abstratos: câmbio, juros e inflação determinam o custo de vida das famílias e a capacidade do Estado prestar serviços.',
    keyPoints: [
      { label: 'Combustíveis e Alimentação', detail: 'Como petróleo e grãos têm preço internacional em dólar, uma desvalorização cambial encarece gasolina, frete e alimentos nos supermercados.' },
      { label: 'Empregos e Moradia', detail: 'Juros muito altos encarecem financiamentos imobiliários e reduzem investimentos das empresas, desacelerando a geração de empregos.' },
      { label: 'Produtos importados e Eletrônicos', detail: 'Componentes de celulares, máquinas industriais e medicamentos importados ficam imediatamente mais caros quando a moeda local perde valor.' },
      { label: 'Saúde e Educação', detail: 'Contas públicas equilibradas sustentam investimentos contínuos em hospitais e escolas; crises fiscais forçam cortes ou inflação corrosiva.' }
    ],
    interactiveType: 'household-basket',
    interactiveTitle: 'Impacto na Vida Real: Simule Inflação e Câmbio na Cesta Familiar'
  },
  {
    id: 'mod4',
    number: 'Módulo 4',
    title: 'O que um presidente realmente controla?',
    subtitle: 'Separação de poderes, parlamento e independência dos bancos centrais.',
    summary: 'Em democracias modernas, o chefe do Executivo não é um monarca absoluto. Entender limites institucionais evita erros graves de política econômica.',
    keyPoints: [
      { label: 'Poder Executivo', detail: 'Propõe o orçamento, executa políticas públicas, gerencia ministérios, negocia diplomacia e envia projetos de lei.' },
      { label: 'Poder Legislativo (Congresso / Parlamento)', detail: 'Aprova ou rejeita impostos, orçamentos, reformas constitucionais e acordos comerciais. Sem base parlamentar, o governo trava.' },
      { label: 'Poder Judiciário', detail: 'Garante a Constituição, contratos e segurança jurídica — essencial para confiança de investidores.' },
      { label: 'Banco Central', detail: 'Na maioria das grandes economias (Brasil, EUA, Zona do Euro, Japão, México), o BC tem autonomia para definir juros e controlar a inflação. O presidente não fixa o dólar por decreto.' }
    ],
    interactiveType: 'powers-matrix',
    interactiveTitle: 'Matriz Institucional: Quem Decide o Quê?'
  },
  {
    id: 'mod5',
    number: 'Módulo 5',
    title: 'Economia mundial e choques externos',
    subtitle: 'Por que uma guerra distante ou uma decisão do Fed afeta o seu país.',
    summary: 'Nenhum país é uma ilha econômica. Guerras, pandemias, choques de petróleo e decisões das grandes potências propagam-se em cadeia por comércio, finanças e expectativas.',
    keyPoints: [
      { label: 'Guerras e Crises Energéticas', detail: 'Conflitos em regiões produtoras disparam o barril de petróleo, elevam custos globais de transporte e geram inflação importada.' },
      { label: 'Crises Financeiras (ex.: 2008)', detail: 'Quebras bancárias nos centros financeiros secam o crédito internacional e provocam fuga de capitais de mercados emergentes.' },
      { label: 'Pandemias e Cadeias Globais', detail: 'Paralisações logísticas reduzem oferta de insumos, enquanto governos enfrentam o dilema entre auxílio emergencial e dívida.' },
      { label: 'Decisões de Grandes Economias', detail: 'Alta de juros nos EUA ou desaceleração na China alteram fluxos de capitais e preços de commodities no mundo todo.' }
    ],
    interactiveType: 'global-shock',
    interactiveTitle: 'Simulador de Choques Mundiais: Teste Cenários Externos'
  }
];

export const EDUCATION_QUIZ = [
  {
    id: 'q1',
    question: 'Se a cotação no Brasil passar de 1 USD = R$ 5,10 para 1 USD = R$ 5,70, o que aconteceu?',
    options: [
      'O real se valorizou frente ao dólar',
      'O real se desvalorizou frente ao dólar',
      'A inflação brasileira caiu automaticamente',
      'O Banco Central eliminou a dívida pública'
    ],
    correctIndex: 1,
    explanation: 'São necessários mais reais (R$ 5,70 em vez de R$ 5,10) para comprar 1 dólar. Logo, o real perdeu valor relativo.'
  },
  {
    id: 'q2',
    question: 'Em países com Banco Central autônomo (como Brasil, EUA e Zona do Euro), quem define a taxa básica de juros?',
    options: [
      'O Presidente, por decreto imediato',
      'O Congresso Nacional, por votação semanal',
      'O Comitê de Política Monetária do Banco Central',
      'As bolsas de valores privadas'
    ],
    correctIndex: 2,
    explanation: 'Bancos centrais autônomos definem a taxa básica para perseguir a meta de inflação, protegendo a moeda de pressões eleitorais de curto prazo.'
  },
  {
    id: 'q3',
    question: 'Por que um aumento abrupto de gastos públicos sem fonte de financiamento pode pressionar o dólar para cima?',
    options: [
      'Porque investidores temem aumento da dívida e risco fiscal, retirando capital do país',
      'Porque o dólar é impresso dentro do país que gastou mais',
      'Porque o desemprego desaparece no mesmo dia',
      'Porque as exportações dobram instantaneamente'
    ],
    correctIndex: 0,
    explanation: 'Quando o mercado duvida da sustentabilidade da dívida pública, a confiança cai, há saída de divisas e o dólar sobe frente à moeda local.'
  },
  {
    id: 'q4',
    question: 'Qual é o efeito colateral típico de subir muito a taxa básica de juros para conter a inflação?',
    options: [
      'Aumento imediato da construção civil e do crédito barato',
      'Desaceleração econômica, crédito mais caro e possível aumento do desemprego',
      'Queda automática dos impostos sobre consumo',
      'Eliminação da balança comercial'
    ],
    correctIndex: 1,
    explanation: 'Juros altos contêm a demanda e ajudam a segurar preços e câmbio, mas encarecem empréstimos para empresas e famílias.'
  },
  {
    id: 'q5',
    question: 'Na França (Zona do Euro), por que o presidente francês não pode imprimir euros ou mudar os juros da moeda?',
    options: [
      'Porque o euro não tem banco central',
      'Porque a política monetária é supranacional, conduzida pelo Banco Central Europeu (BCE)',
      'Porque a França usa apenas ouro no comércio',
      'Porque o parlamento britânico decide pelo euro'
    ],
    correctIndex: 1,
    explanation: 'Os países da Zona do Euro compartilham uma moeda única administrada pelo BCE de forma independente para todo o bloco.'
  },
  {
    id: 'q6',
    question: 'Como uma alta internacional do petróleo tende a afetar um país importador de energia?',
    options: [
      'Reduz o custo dos fretes e alimentos',
      'Pressiona a inflação, piora a balança comercial e reduz o poder de compra',
      'Valoriza automaticamente a moeda local',
      'Não causa nenhum impacto econômico'
    ],
    correctIndex: 1,
    explanation: 'Combustível mais caro encarece o transporte de mercadorias e aumenta a conta de importações em dólar.'
  },
  {
    id: 'q7',
    question: 'Por que avaliar um governo apenas pela cotação do dólar é um erro?',
    options: [
      'Porque o dólar nunca muda de valor',
      'Porque a moeda pode estar valorizada às custas de juros altíssimos, recessão ou cortes graves em saúde e educação',
      'Porque nenhum produto depende do comércio exterior',
      'Porque o câmbio só afeta turistas'
    ],
    correctIndex: 1,
    explanation: 'Um país equilibrado considera bem-estar social, emprego, inflação, sustentabilidade fiscal, instituições e cenário externo.'
  },
  {
    id: 'q8',
    question: 'No Japão, qual é a função de quem vence as eleições para comandar o governo na Dieta Nacional?',
    options: [
      'Presidente Executivo com mandato fixo sem parlamento',
      'Primeiro-Ministro, chefe de governo em sistema parlamentarista',
      'Governador do Banco do Japão',
      'Imperador Executivo'
    ],
    correctIndex: 1,
    explanation: 'O Japão é uma monarquia constitucional parlamentarista: o Primeiro-Ministro depende da confiança da Câmara dos Representantes.'
  }
];
