/**
 * International Diplomacy partners, multilateral organizations, and actionable treaties.
 */

export const GLOBAL_PARTNERS = [
  {
    id: 'US',
    name: 'Estados Unidos',
    bloc: 'América do Norte / G7',
    coordinates: { lat: 38.9, lon: -77.04 },
    strength: 'Maior mercado financeiro e tecnológico global',
    economicWeight: 1.0
  },
  {
    id: 'CN',
    name: 'China',
    bloc: 'Ásia / BRICS+',
    coordinates: { lat: 39.9, lon: 116.4 },
    strength: 'Maior comprador de commodities e potência manufatureira',
    economicWeight: 0.92
  },
  {
    id: 'EU',
    name: 'União Europeia',
    bloc: 'Europa / Zona do Euro',
    coordinates: { lat: 50.85, lon: 4.35 },
    strength: 'Bloco comercial de alto valor agregado e padrões ambientais',
    economicWeight: 0.86
  },
  {
    id: 'JP',
    name: 'Japão',
    bloc: 'Indo-Pacífico / G7',
    coordinates: { lat: 35.68, lon: 139.69 },
    strength: 'Financiamento de infraestrutura, robótica e semicondutores',
    economicWeight: 0.62
  },
  {
    id: 'BR',
    name: 'Brasil',
    bloc: 'Mercosul / BRICS+',
    coordinates: { lat: -15.79, lon: -47.88 },
    strength: 'Alimentos, energia renovável, minerais e mercado sul-americano',
    economicWeight: 0.48
  },
  {
    id: 'AR',
    name: 'Argentina',
    bloc: 'Mercosul',
    coordinates: { lat: -34.6, lon: -58.38 },
    strength: 'Agroindústria, lítio e gás natural',
    economicWeight: 0.28
  },
  {
    id: 'MX',
    name: 'México',
    bloc: 'USMCA / América Latina',
    coordinates: { lat: 19.43, lon: -99.13 },
    strength: 'Manufatura integrada e cadeia automotiva',
    economicWeight: 0.42
  }
];

export const DIPLOMATIC_ACTIONS = [
  {
    id: 'trade_agreement',
    title: 'Negociar Acordo Comercial Bilateral',
    category: 'Comércio',
    description: 'Reduz tarifas aduaneiras e abre cotas de exportação e importação com o país parceiro.',
    minRelation: 50,
    parliamentCost: 4,
    effects: {
      relationDelta: 12,
      tradeBalanceDelta: 8.5,
      gdpGrowthDelta: 0.35,
      foreignInvestmentDelta: 5.5,
      investorConfidenceDelta: 4,
      fxPressure: -0.018, // strengthens local currency
      delayedTradeBonus: 6.0
    },
    riskNote: 'Setores industriais domésticos pouco competitivos podem protestar contra concorrência externa.'
  },
  {
    id: 'investment_summit',
    title: 'Cúpula de Atração de Investimentos (IED)',
    category: 'Investimentos',
    description: 'Oferece garantias regulatórias e parcerias público-privadas para capital produtivo estrangeiro.',
    minRelation: 45,
    parliamentCost: 2,
    effects: {
      relationDelta: 7,
      foreignInvestmentDelta: 9.0,
      infrastructureDelta: 2.2,
      jobCreationDelta: 2.5,
      investorConfidenceDelta: 5,
      fxPressure: -0.015
    },
    riskNote: 'Exige previsibilidade fiscal e jurídica nos trimestres seguintes para manter os aportes.'
  },
  {
    id: 'climate_pact',
    title: 'Acordo Ambiental e Transição Verde',
    category: 'Meio Ambiente',
    description: 'Compromisso multilateral de descarbonização com acesso a fundos verdes e financiamento climático.',
    minRelation: 40,
    parliamentCost: 3,
    effects: {
      relationDelta: 10,
      investorConfidenceDelta: 3,
      foreignInvestmentDelta: 4.0,
      energyCleanBonus: 2.5,
      fiscalDelta: -0.25,
      approvalDelta: 1.5
    },
    riskNote: 'Pode gerar atrito temporário com setores intensivos em carbono.'
  },
  {
    id: 'multilateral_summit',
    title: 'Participar de Cúpula Multilateral (G20 / OMC / ONU)',
    category: 'Diplomacia',
    description: 'Reforça presença institucional, reduz risco diplomático e alinha regras comerciais.',
    minRelation: 0,
    parliamentCost: 0,
    effects: {
      relationDelta: 6,
      investorConfidenceDelta: 2.5,
      politicalStabilityDelta: 2.0,
      fxPressure: -0.006
    },
    riskNote: 'Baixo risco; fortalece imagem externa e reduz prêmio de risco.'
  },
  {
    id: 'trade_sanctions_review',
    title: 'Rever Relações e Barreiras Comerciais (Protecionismo)',
    category: 'Proteção',
    description: 'Impõe salvaguardas tarifárias contra produtos do parceiro para proteger indústria local.',
    minRelation: 0,
    parliamentCost: -2,
    effects: {
      relationDelta: -14,
      tradeBalanceDelta: 2.5,
      inflationDelta: 0.45,
      investorConfidenceDelta: -3.5,
      foreignInvestmentDelta: -4.0,
      fxPressure: 0.012
    },
    riskNote: 'Pode provocar retaliação comercial e encarecer insumos importados.'
  }
];
