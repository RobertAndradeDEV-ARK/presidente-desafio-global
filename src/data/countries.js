/**
 * Registry of playable countries with institutional accuracy, historical reference baselines,
 * regional cities for 3D/2D national maps, and geopolitical profiles.
 * Architecture allows adding new countries simply by appending to COUNTRIES.
 */

export const COUNTRIES = [
  {
    id: 'BR',
    name: 'Brasil',
    officialName: 'República Federativa do Brasil',
    capital: 'Brasília',
    population: '212,6 milhões',
    continent: 'América do Sul',
    coordinates: { lat: -15.79, lon: -47.88 },
    themeColor: '#10b981',
    languages: ['Português'],
    currency: {
      code: 'BRL',
      symbol: 'R$',
      name: 'Real brasileiro',
      isGlobalReserve: false,
      decimals: 2,
      exchangeExplanation: '1 USD = X reais (BRL). Quando o número sobe, o real se desvalorizou frente ao dólar.'
    },
    government: {
      system: 'Presidencialismo Federalista',
      headOfGovernmentTitle: 'Presidente da República',
      headOfStateNote: 'Acumula as funções de Chefe de Estado e Chefe de Governo.',
      legislatureName: 'Congresso Nacional (Câmara dos Deputados e Senado Federal)',
      termYears: 4,
      termQuarters: 16,
      centralBank: {
        name: 'Banco Central do Brasil (BCB)',
        autonomous: true,
        supranational: false,
        policyNote: 'Autônomo por lei (LC 179/2021). O presidente indica dirigentes com aval do Senado, mas não decreta a taxa Selic diretamente.'
      },
      executiveConstraints: 'Leis orçamentárias, reformas tributárias e gastos estruturais dependem de aprovação do Congresso Nacional e controle constitucional do STF.'
    },
    baselineMeta: {
      referencePeriod: 'Base histórica 2024 (referência educativa)',
      sources: ['Banco Mundial', 'FMI', 'Banco Central do Brasil (BCB)', 'IBGE'],
      note: 'Valores iniciais calibrados com base em indicadores macroeconômicos de 2024; a evolução na partida é uma simulação educativa e não prevê cotações reais.'
    },
    initialIndicators: {
      exchangeRate: 5.45,
      inflation: 4.5,
      interestRate: 11.25,
      gdpGrowth: 3.0,
      unemployment: 6.8,
      publicDebt: 76.5,
      fiscalBalance: -2.4,
      tradeBalance: 74.0,
      reserves: 355.0,
      investorConfidence: 58,
      foreignInvestment: 64.0,
      purchasingPower: 56,
      approval: 51,
      education: 52,
      health: 55,
      inequality: 51.8, // Gini-scaled 0-100 (higher = more unequal)
      poverty: 27.4,
      qualityOfLife: 64,
      jobCreation: 60,
      security: 44,
      infrastructure: 49,
      parliamentSupport: 48,
      politicalStability: 56,
      countryRisk: 215 // EMBI-like bps
    },
    structuralProfile: {
      commodityExporter: true,
      energyCleanShare: 0.84,
      manufacturingShare: 0.21,
      importDependence: 0.28,
      debtForeignShare: 0.14,
      taxBurden: 32.5,
      publicSpending: 35.0
    },
    politicalSituation: 'Coalizão parlamentar fragmentada exige negociação constante com o Congresso para aprovação de reformas fiscais e investimentos.',
    challenges: [
      'Equilibrar responsabilidade fiscal com demandas sociais e infraestrutura',
      'Reduzir a taxa estrutural de juros e destravar produtividade',
      'Elevar qualidade da educação básica e segurança pública',
      'Aproveitar a transição energética e conter o desmatamento'
    ],
    internationalRelations: [
      { partnerId: 'US', name: 'Estados Unidos', relation: 68, tradeWeight: 0.18, note: 'Segundo maior parceiro comercial e grande investidor.' },
      { partnerId: 'CN', name: 'China', relation: 76, tradeWeight: 0.31, note: 'Principal destino de soja, minério e petróleo.' },
      { partnerId: 'EU', name: 'União Europeia / França', relation: 64, tradeWeight: 0.17, note: 'Negociações comerciais e agenda ambiental.' },
      { partnerId: 'AR', name: 'Argentina', relation: 66, tradeWeight: 0.12, note: 'Parceiro estratégico industrial no Mercosul.' }
    ],
    regions: [
      { id: 'bsb', name: 'Brasília (DF)', x: 0.56, y: 0.48, role: 'Capital Federal e Sede dos Três Poderes', weight: 0.12 },
      { id: 'spo', name: 'São Paulo (SE)', x: 0.58, y: 0.67, role: 'Polo financeiro e industrial', weight: 0.34 },
      { id: 'rio', name: 'Rio de Janeiro (SE)', x: 0.66, y: 0.66, role: 'Energia offshore, serviços e turismo', weight: 0.16 },
      { id: 'mao', name: 'Manaus (N)', x: 0.33, y: 0.24, role: 'Amazônia, bioeconomia e Zona Franca', weight: 0.12 },
      { id: 'rec', name: 'Recife / Salvador (NE)', x: 0.80, y: 0.37, role: 'Energias renováveis e polo regional', weight: 0.14 },
      { id: 'poa', name: 'Porto Alegre (S)', x: 0.51, y: 0.83, role: 'Agronegócio e indústria sulista', weight: 0.12 }
    ],
    svgOutline: 'M 42,10 L 66,14 L 84,32 L 80,50 L 68,68 L 56,82 L 48,92 L 42,76 L 34,62 L 22,42 L 24,22 Z'
  },
  {
    id: 'US',
    name: 'Estados Unidos',
    officialName: 'United States of America',
    capital: 'Washington, D.C.',
    population: '336,0 milhões',
    continent: 'América do Norte',
    coordinates: { lat: 38.9, lon: -77.04 },
    themeColor: '#38bdf8',
    languages: ['Inglês'],
    currency: {
      code: 'EUR*',
      symbol: '€ / DXY',
      name: 'Dólar Americano (USD — Moeda Âncora)',
      isGlobalReserve: true,
      decimals: 3,
      exchangeExplanation: 'Como o USD é a moeda de reserva mundial, exibimos 1 USD = X EUR (e o poder relativo do dólar). Quando X sobe, o dólar se valorizou frente ao euro.'
    },
    government: {
      system: 'Presidencialismo Federal Constitucional',
      headOfGovernmentTitle: 'Presidente dos Estados Unidos',
      headOfStateNote: 'Chefe de Estado, Chefe de Governo e Comandante-em-Chefe.',
      legislatureName: 'Congresso dos EUA (Câmara dos Representantes e Senado)',
      termYears: 4,
      termQuarters: 16,
      centralBank: {
        name: 'Federal Reserve (Fed)',
        autonomous: true,
        supranational: false,
        policyNote: 'Independente. O Presidente nomeia o Chair do Fed (com confirmação do Senado), mas o FOMC decide os juros sem interferência direta.'
      },
      executiveConstraints: 'O orçamento federal, teto da dívida e tratados internacionais dependem fortemente da aprovação do Congresso dividido.'
    },
    baselineMeta: {
      referencePeriod: 'Base histórica 2024 (referência educativa)',
      sources: ['FMI', 'Banco Mundial', 'Federal Reserve', 'BEA / BLS'],
      note: 'Os EUA emitem a principal moeda de reserva global; déficits elevados ainda geram debate sobre dívida, mas há forte demanda global por títulos do Tesouro.'
    },
    initialIndicators: {
      exchangeRate: 0.925, // 1 USD = 0.925 EUR (higher = stronger USD)
      inflation: 2.9,
      interestRate: 4.75,
      gdpGrowth: 2.7,
      unemployment: 4.1,
      publicDebt: 121.0,
      fiscalBalance: -6.4,
      tradeBalance: -780.0,
      reserves: 242.0,
      investorConfidence: 79,
      foreignInvestment: 295.0,
      purchasingPower: 82,
      approval: 46,
      education: 74,
      health: 66,
      inequality: 41.5,
      poverty: 11.5,
      qualityOfLife: 84,
      jobCreation: 74,
      security: 68,
      infrastructure: 69,
      parliamentSupport: 46,
      politicalStability: 64,
      countryRisk: 42
    },
    structuralProfile: {
      commodityExporter: false,
      energyCleanShare: 0.41,
      manufacturingShare: 0.18,
      importDependence: 0.34,
      debtForeignShare: 0.24,
      taxBurden: 27.7,
      publicSpending: 34.1
    },
    politicalSituation: 'Forte polarização partidária no Congresso dificulta consensos fiscais e acordos sobre teto da dívida, saúde e imigração.',
    challenges: [
      'Conter a trajetória da dívida pública e do déficit fiscal de 6,4% do PIB',
      'Equilibrar combate à inflação sem provocar recessão',
      'Modernizar infraestrutura e ampliar acesso à saúde sem explodir custos',
      'Gerenciar tensões comerciais e tecnológicas globais'
    ],
    internationalRelations: [
      { partnerId: 'CN', name: 'China', relation: 42, tradeWeight: 0.22, note: 'Competição tecnológica, tarifas e interdependência comercial.' },
      { partnerId: 'EU', name: 'União Europeia / França', relation: 79, tradeWeight: 0.24, note: 'Aliança estratégica OTAN e comércio transatlântico.' },
      { partnerId: 'MX', name: 'México', relation: 72, tradeWeight: 0.21, note: 'Principal parceiro no USMCA e cadeias produtivas.' },
      { partnerId: 'JP', name: 'Japão', relation: 86, tradeWeight: 0.14, note: 'Aliado-chave no Indo-Pacífico e tecnologia.' }
    ],
    regions: [
      { id: 'dc', name: 'Washington, D.C.', x: 0.77, y: 0.45, role: 'Capital Federal e Tesouro', weight: 0.12 },
      { id: 'nyc', name: 'Nova York (NE)', x: 0.82, y: 0.36, role: 'Centro financeiro global (Wall Street)', weight: 0.26 },
      { id: 'tx', name: 'Texas (Sul)', x: 0.48, y: 0.69, role: 'Energia, manufatura e tecnologia', weight: 0.20 },
      { id: 'ca', name: 'Califórnia (Oeste)', x: 0.15, y: 0.48, role: 'Big Tech, inovação e portos do Pacífico', weight: 0.24 },
      { id: 'il', name: 'Chicago (Centro-Oeste)', x: 0.61, y: 0.38, role: 'Indústria, logística e commodities agrícolas', weight: 0.18 }
    ],
    svgOutline: 'M 10,25 L 88,22 L 92,38 L 78,66 L 68,78 L 54,70 L 42,78 L 26,65 L 10,55 Z'
  },
  {
    id: 'AR',
    name: 'Argentina',
    officialName: 'República Argentina',
    capital: 'Buenos Aires',
    population: '46,7 milhões',
    continent: 'América do Sul',
    coordinates: { lat: -34.6, lon: -58.38 },
    themeColor: '#60a5fa',
    languages: ['Espanhol'],
    currency: {
      code: 'ARS',
      symbol: '$',
      name: 'Peso argentino',
      isGlobalReserve: false,
      decimals: 1,
      exchangeExplanation: '1 USD = X pesos argentinos (ARS). Elevações fortes indicam perda de poder de compra do peso.'
    },
    government: {
      system: 'Presidencialismo Federal',
      headOfGovernmentTitle: 'Presidente da Nação Argentina',
      headOfStateNote: 'Chefe de Estado e de Governo, eleito por voto direto com possível segundo turno.',
      legislatureName: 'Congresso da Nação (Câmara dos Deputados e Senado)',
      termYears: 4,
      termQuarters: 16,
      centralBank: {
        name: 'Banco Central de la República Argentina (BCRA)',
        autonomous: false,
        supranational: false,
        policyNote: 'Autonomia limitada na prática; historicamente sujeito a financiamento do Tesouro e controles cambiais, embora o governo possa buscar maior disciplina.'
      },
      executiveConstraints: 'Decretos de necessidade e urgência (DNU) podem ser derrubados pelo Congresso; governadores provinciais exercem forte peso político.'
    },
    baselineMeta: {
      referencePeriod: 'Base histórica 2024 (referência educativa)',
      sources: ['FMI', 'Banco Mundial', 'INDEC', 'BCRA'],
      note: 'Partida inicia em cenário de desinflação desafiadora, reservas baixas e forte tensão social após ajuste fiscal.'
    },
    initialIndicators: {
      exchangeRate: 980.0,
      inflation: 117.8,
      interestRate: 35.0,
      gdpGrowth: -1.8,
      unemployment: 7.6,
      publicDebt: 85.0,
      fiscalBalance: 0.3,
      tradeBalance: 18.0,
      reserves: 29.0,
      investorConfidence: 36,
      foreignInvestment: 11.0,
      purchasingPower: 34,
      approval: 44,
      education: 64,
      health: 61,
      inequality: 42.0,
      poverty: 46.5,
      qualityOfLife: 61,
      jobCreation: 39,
      security: 52,
      infrastructure: 53,
      parliamentSupport: 34,
      politicalStability: 42,
      countryRisk: 1120
    },
    structuralProfile: {
      commodityExporter: true,
      energyCleanShare: 0.32,
      manufacturingShare: 0.22,
      importDependence: 0.36,
      debtForeignShare: 0.62,
      taxBurden: 28.5,
      publicSpending: 28.2
    },
    politicalSituation: 'Governo sem maioria própria no Congresso enfrenta resistência sindical e pressão social diante da queda do poder aquisitivo.',
    challenges: [
      'Derrubar a inflação crônica e recompor reservas internacionais líquidas',
      'Retomar o crescimento econômico sem reabrir déficit fiscal insustentável',
      'Reduzir a pobreza elevada e conter conflitos sociais',
      'Destravar exportações de agroindústria, lítio e energia (Vaca Muerta)'
    ],
    internationalRelations: [
      { partnerId: 'BR', name: 'Brasil', relation: 66, tradeWeight: 0.25, note: 'Maior parceiro comercial sul-americano.' },
      { partnerId: 'US', name: 'Estados Unidos', relation: 64, tradeWeight: 0.16, note: 'Peso decisivo nas negociações junto ao FMI.' },
      { partnerId: 'CN', name: 'China', relation: 62, tradeWeight: 0.18, note: 'Swap cambial e comprador relevante de grãos.' },
      { partnerId: 'EU', name: 'União Europeia', relation: 60, tradeWeight: 0.14, note: 'Investimentos e acordo Mercosul-UE.' }
    ],
    regions: [
      { id: 'bue', name: 'Buenos Aires', x: 0.62, y: 0.42, role: 'Capital, porto e grande concentração urbana', weight: 0.42 },
      { id: 'cor', name: 'Córdoba / Rosário', x: 0.48, y: 0.32, role: 'Cinturão agroexportador e industrial', weight: 0.24 },
      { id: 'nqn', name: 'Neuquén (Vaca Muerta)', x: 0.36, y: 0.56, role: 'Polo de gás, petróleo e energia', weight: 0.14 },
      { id: 'mdz', name: 'Mendoza / Norte', x: 0.34, y: 0.26, role: 'Mineração (lítio) e vitivinicultura', weight: 0.12 },
      { id: 'pat', name: 'Patagônia Sul', x: 0.42, y: 0.80, role: 'Pesca, turismo e energia eólica', weight: 0.08 }
    ],
    svgOutline: 'M 42,8 L 62,16 L 68,36 L 60,55 L 48,74 L 44,92 L 34,88 L 32,62 L 30,36 L 34,16 Z'
  },
  {
    id: 'MX',
    name: 'México',
    officialName: 'Estados Unidos Mexicanos',
    capital: 'Cidade do México',
    population: '129,7 milhões',
    continent: 'América do Norte',
    coordinates: { lat: 19.43, lon: -99.13 },
    themeColor: '#34d399',
    languages: ['Espanhol'],
    currency: {
      code: 'MXN',
      symbol: '$',
      name: 'Peso mexicano',
      isGlobalReserve: false,
      decimals: 2,
      exchangeExplanation: '1 USD = X pesos mexicanos (MXN). Moeda muito líquida nos mercados globais e sensível à relação com os EUA.'
    },
    government: {
      system: 'Presidencialismo Federal (Sexenio)',
      headOfGovernmentTitle: 'Presidente do México',
      headOfStateNote: 'Mandato único de 6 anos (sexênio), sem reeleição.',
      legislatureName: 'Congresso da União (Câmara dos Deputados e Senado)',
      termYears: 6,
      termQuarters: 24,
      centralBank: {
        name: 'Banco de México (Banxico)',
        autonomous: true,
        supranational: false,
        policyNote: 'Constitucionalmente autônomo desde 1994, focado exclusivamente na estabilidade do poder aquisitivo.'
      },
      executiveConstraints: 'Reformas constitucionais exigem maioria qualificada de 2/3 no Congresso e aprovação da maioria dos congressos estaduais.'
    },
    baselineMeta: {
      referencePeriod: 'Base histórica 2024 (referência educativa)',
      sources: ['Banco Mundial', 'FMI', 'INEGI', 'Banxico'],
      note: 'Forte integração industrial ao mercado norte-americano (nearshoring), com desafios de déficit fiscal, energia e segurança.'
    },
    initialIndicators: {
      exchangeRate: 19.6,
      inflation: 4.6,
      interestRate: 10.25,
      gdpGrowth: 1.6,
      unemployment: 2.7,
      publicDebt: 51.4,
      fiscalBalance: -4.9,
      tradeBalance: -8.0,
      reserves: 226.0,
      investorConfidence: 60,
      foreignInvestment: 36.0,
      purchasingPower: 55,
      approval: 61,
      education: 56,
      health: 54,
      inequality: 43.5,
      poverty: 36.3,
      qualityOfLife: 65,
      jobCreation: 64,
      security: 35,
      infrastructure: 54,
      parliamentSupport: 62,
      politicalStability: 59,
      countryRisk: 195
    },
    structuralProfile: {
      commodityExporter: false,
      energyCleanShare: 0.25,
      manufacturingShare: 0.34,
      importDependence: 0.42,
      debtForeignShare: 0.22,
      taxBurden: 17.5,
      publicSpending: 22.4
    },
    politicalSituation: 'Ampla base governista no Congresso permite avançar pautas sociais, mas mercados vigiam segurança jurídica e déficit fiscal.',
    challenges: [
      'Aproveitar o nearshoring garantindo energia elétrica e água para indústrias',
      'Reduzir violência e fortalecer o Estado de direito',
      'Consolidar o déficit fiscal de quase 5% do PIB sem cortar investimentos essenciais',
      'Ampliar arrecadação tributária baixa em relação ao PIB'
    ],
    internationalRelations: [
      { partnerId: 'US', name: 'Estados Unidos', relation: 72, tradeWeight: 0.65, note: 'Mais de 80% das exportações mexicanas vão para os EUA via USMCA.' },
      { partnerId: 'CN', name: 'China', relation: 58, tradeWeight: 0.12, note: 'Fornecedor de insumos industriais sob escrutínio dos EUA.' },
      { partnerId: 'BR', name: 'Brasil', relation: 68, tradeWeight: 0.06, note: 'Parceria latino-americana e indústria automotiva.' },
      { partnerId: 'EU', name: 'União Europeia', relation: 69, tradeWeight: 0.09, note: 'Acordo comercial modernizado e investimentos.' }
    ],
    regions: [
      { id: 'cdmx', name: 'Cidade do México', x: 0.56, y: 0.62, role: 'Capital política, financeira e serviços', weight: 0.28 },
      { id: 'mty', name: 'Monterrey (Norte)', x: 0.52, y: 0.34, role: 'Motor industrial e nearshoring', weight: 0.25 },
      { id: 'gdl', name: 'Guadalajara / Bajío', x: 0.42, y: 0.54, role: 'Eletrônicos, automotivo e tecnologia', weight: 0.20 },
      { id: 'tij', name: 'Fronteira Norte (Tijuana/Juárez)', x: 0.24, y: 0.18, role: 'Maquiladoras e comércio com EUA', weight: 0.16 },
      { id: 'cun', name: 'Sudeste / Golfo', x: 0.78, y: 0.68, role: 'Petróleo, portos e turismo', weight: 0.11 }
    ],
    svgOutline: 'M 14,14 L 44,18 L 62,36 L 68,54 L 84,60 L 88,72 L 72,78 L 54,70 L 38,52 L 22,36 Z'
  },
  {
    id: 'FR',
    name: 'França',
    officialName: 'République Française',
    capital: 'Paris',
    population: '68,4 milhões',
    continent: 'Europa',
    coordinates: { lat: 48.86, lon: 2.35 },
    themeColor: '#818cf8',
    languages: ['Francês'],
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro (Zona do Euro)',
      isGlobalReserve: true,
      decimals: 3,
      exchangeExplanation: '1 USD = X euros (EUR). Como a França integra a Zona do Euro, o câmbio e a taxa básica dependem do Banco Central Europeu e da confiança na região.'
    },
    government: {
      system: 'República Semipresidencialista',
      headOfGovernmentTitle: 'Presidente da França (com Primeiro-Ministro)',
      headOfStateNote: 'O Presidente conduz defesa e política externa e nomeia o Primeiro-Ministro, mas o governo precisa sobreviver à Assembleia Nacional.',
      legislatureName: 'Parlamento Francês (Assembleia Nacional e Senado)',
      termYears: 5,
      termQuarters: 20,
      centralBank: {
        name: 'Banco Central Europeu (BCE / Eurosistema)',
        autonomous: true,
        supranational: true,
        policyNote: 'Supranacional e independente! Nem o Presidente francês nem o Parlamento controlam a taxa de juros do euro ou a emissão de moeda.'
      },
      executiveConstraints: 'Regras fiscais da União Europeia limitam déficits excessivos; Assembleia Nacional fragmentada pode derrubar o gabinete via moção de censura.'
    },
    baselineMeta: {
      referencePeriod: 'Base histórica 2024 (referência educativa)',
      sources: ['Eurostat', 'INSEE', 'FMI', 'Banco Central Europeu'],
      note: 'Economia avançada com matriz nuclear limpa, mas pressionada por déficit fiscal acima da meta europeia e forte debate previdenciário.'
    },
    initialIndicators: {
      exchangeRate: 0.925,
      inflation: 2.3,
      interestRate: 3.25,
      gdpGrowth: 1.1,
      unemployment: 7.4,
      publicDebt: 112.0,
      fiscalBalance: -5.8,
      tradeBalance: -82.0,
      reserves: 258.0,
      investorConfidence: 67,
      foreignInvestment: 58.0,
      purchasingPower: 76,
      approval: 38,
      education: 80,
      health: 86,
      inequality: 31.5,
      poverty: 14.4,
      qualityOfLife: 87,
      jobCreation: 54,
      security: 66,
      infrastructure: 84,
      parliamentSupport: 41,
      politicalStability: 52,
      countryRisk: 78
    },
    structuralProfile: {
      commodityExporter: false,
      energyCleanShare: 0.89,
      manufacturingShare: 0.19,
      importDependence: 0.35,
      debtForeignShare: 0.52,
      taxBurden: 43.8,
      publicSpending: 49.6
    },
    politicalSituation: 'Assembleia Nacional dividida em três blocos cria risco permanente de bloqueio orçamentário e mobilizações sociais.',
    challenges: [
      'Reduzir o déficit público sem provocar forte reação sindical e popular',
      'Reindustrializar setores estratégicos e melhorar a balança comercial',
      'Sustentar o sistema de proteção social com envelhecimento populacional',
      'Coordenar políticas energéticas e de defesa dentro da União Europeia'
    ],
    internationalRelations: [
      { partnerId: 'US', name: 'Estados Unidos', relation: 78, tradeWeight: 0.22, note: 'Parceria estratégica e tensões comerciais por subsídios.' },
      { partnerId: 'CN', name: 'China', relation: 54, tradeWeight: 0.14, note: 'Mercado relevante para aeronáutica e luxo; atritos em veículos elétricos.' },
      { partnerId: 'BR', name: 'Brasil', relation: 64, tradeWeight: 0.05, note: 'Cooperação na Amazônia e divergências agrícolas no Mercosul-UE.' },
      { partnerId: 'JP', name: 'Japão', relation: 79, tradeWeight: 0.07, note: 'Parceria tecnológica e segurança no Indo-Pacífico.' }
    ],
    regions: [
      { id: 'par', name: 'Paris / Île-de-France', x: 0.54, y: 0.28, role: 'Capital, finanças e pesquisa', weight: 0.32 },
      { id: 'lyo', name: 'Lyon (Ródano-Alpes)', x: 0.66, y: 0.56, role: 'Indústria química, energia e tecnologia', weight: 0.20 },
      { id: 'mrs', name: 'Marselha (Mediterrâneo)', x: 0.68, y: 0.78, role: 'Principal porto sul e comércio marítimo', weight: 0.16 },
      { id: 'tls', name: 'Toulouse (Sudoeste)', x: 0.44, y: 0.74, role: 'Polo aeroespacial europeu', weight: 0.16 },
      { id: 'lil', name: 'Lille / Norte', x: 0.56, y: 0.14, role: 'Logística e corredor industrial europeu', weight: 0.16 }
    ],
    svgOutline: 'M 48,10 L 66,18 L 80,32 L 76,56 L 78,76 L 56,86 L 34,78 L 28,52 L 16,38 L 32,22 Z'
  },
  {
    id: 'JP',
    name: 'Japão',
    officialName: 'Estado do Japão (Nippon)',
    capital: 'Tóquio',
    population: '124,0 milhões',
    continent: 'Ásia',
    coordinates: { lat: 35.68, lon: 139.69 },
    themeColor: '#f472b6',
    languages: ['Japonês'],
    currency: {
      code: 'JPY',
      symbol: '¥',
      name: 'Iene japonês',
      isGlobalReserve: true,
      decimals: 1,
      exchangeExplanation: '1 USD = X ienes (JPY). Um valor maior significa iene mais fraco frente ao dólar (favorece exportadores, mas encarece energia importada).'
    },
    government: {
      system: 'Monarquia Constitucional Parlamentarista',
      headOfGovernmentTitle: 'Primeiro-Ministro do Japão',
      headOfStateNote: 'O Imperador é símbolo constitucional sem poder executivo; o Primeiro-Ministro governa com apoio da Dieta Nacional.',
      legislatureName: 'Dieta Nacional (Câmara dos Representantes e Câmara dos Conselheiros)',
      termYears: 4,
      termQuarters: 16,
      centralBank: {
        name: 'Banco do Japão (Bank of Japan — BoJ)',
        autonomous: true,
        supranational: false,
        policyNote: 'Independente. Saiu recentemente de décadas de juros negativos; normalizar juros exige cautela por causa da altíssima dívida pública.'
      },
      executiveConstraints: 'Se perder maioria na Câmara dos Representantes, o Primeiro-Ministro enfrenta voto de desconfiança ou dissolução antecipada da Dieta.'
    },
    baselineMeta: {
      referencePeriod: 'Base histórica 2024 (referência educativa)',
      sources: ['FMI', 'Banco Mundial', 'Bank of Japan', 'Statistics Bureau of Japan'],
      note: 'Terceira/quarta maior economia global: dívida pública superior a 250% do PIB, porém financiada majoritariamente em ienes por poupança doméstica.'
    },
    initialIndicators: {
      exchangeRate: 152.0,
      inflation: 2.6,
      interestRate: 0.25,
      gdpGrowth: 0.9,
      unemployment: 2.5,
      publicDebt: 251.0,
      fiscalBalance: -3.8,
      tradeBalance: -36.0,
      reserves: 1230.0,
      investorConfidence: 74,
      foreignInvestment: 44.0,
      purchasingPower: 75,
      approval: 40,
      education: 88,
      health: 91,
      inequality: 32.9,
      poverty: 15.4,
      qualityOfLife: 89,
      jobCreation: 68,
      security: 92,
      infrastructure: 90,
      parliamentSupport: 47,
      politicalStability: 68,
      countryRisk: 38
    },
    structuralProfile: {
      commodityExporter: false,
      energyCleanShare: 0.30,
      manufacturingShare: 0.29,
      importDependence: 0.48,
      debtForeignShare: 0.13,
      taxBurden: 33.4,
      publicSpending: 37.2
    },
    politicalSituation: 'Coalizão parlamentar busca recompor confiança pública diante da perda de poder de compra com iene fraco e envelhecimento demográfico.',
    challenges: [
      'Enfrentar o declínio demográfico e escassez de mão de obra',
      'Reduzir dependência de combustíveis fósseis importados',
      'Equilibrar normalização gradual dos juros sem desestabilizar a dívida de 251% do PIB',
      'Aumentar salários reais e competitividade em semicondutores e IA'
    ],
    internationalRelations: [
      { partnerId: 'US', name: 'Estados Unidos', relation: 86, tradeWeight: 0.24, note: 'Pilar de segurança regional e principal destino de investimentos.' },
      { partnerId: 'CN', name: 'China', relation: 48, tradeWeight: 0.26, note: 'Maior parceiro comercial, porém com tensões geopolíticas no Leste Asiático.' },
      { partnerId: 'EU', name: 'União Europeia / França', relation: 79, tradeWeight: 0.14, note: 'Acordo de Parceria Econômica (EPA).' },
      { partnerId: 'BR', name: 'Brasil', relation: 74, tradeWeight: 0.05, note: 'Fornecedor de alimentos e minerais; laços históricos.' }
    ],
    regions: [
      { id: 'tyo', name: 'Tóquio (Kanto)', x: 0.62, y: 0.56, role: 'Capital, finanças e alta tecnologia', weight: 0.38 },
      { id: 'osa', name: 'Osaka / Nagoya (Kansai/Chubu)', x: 0.46, y: 0.64, role: 'Manufatura automotiva, robótica e comércio', weight: 0.28 },
      { id: 'fuk', name: 'Fukuoka (Kyushu)', x: 0.24, y: 0.76, role: 'Polo emergente de semicondutores', weight: 0.14 },
      { id: 'spk', name: 'Sapporo (Hokkaido)', x: 0.76, y: 0.18, role: 'Agricultura e energias renováveis', weight: 0.10 },
      { id: 'sdj', name: 'Sendai (Tohoku)', x: 0.68, y: 0.40, role: 'Reconstrução, energia e indústria', weight: 0.10 }
    ],
    svgOutline: 'M 70,12 L 82,20 L 76,34 L 68,48 L 64,62 L 46,68 L 30,72 L 20,82 L 16,74 L 28,60 L 46,56 L 56,42 L 62,24 Z'
  }
];

export function getCountryById(id) {
  return COUNTRIES.find(c => c.id === id) || COUNTRIES[0];
}
