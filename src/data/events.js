/**
 * Historical Events (real references clearly tagged) & Intelligent Contextual Simulation Events.
 */

export const HISTORICAL_EVENTS = [
  {
    id: 'hist_2008',
    isHistorical: true,
    historicalRef: 'Crise Financeira Global de 2008 (EUA/Mundo — Lehman Brothers, Set/2008)',
    category: 'Crise Financeira Global',
    severity: 'high',
    title: 'CHOQUE FINANCEIRO GLOBAL — INSPIRADO NA CRISE DE 2008',
    summary: 'Grandes instituições financeiras internacionais enfrentam crise de liquidez. O crédito global seca rapidamente e investidores fogem para ativos seguros.',
    context: 'Baseado na crise de 2008, quando o colapso do mercado subprime nos EUA se espalhou para bolsas, bancos e moedas de todo o planeta.',
    affectedRegionCoords: { lat: 40.71, lon: -74.0 },
    externalShocks: {
      globalTension: 18,
      fedRateDelta: -0.75,
      oilPriceDelta: -18,
      investorConfidenceDelta: -12,
      foreignInvestmentDelta: -14,
      gdpGrowthDelta: -1.35,
      tradeBalanceDelta: -12,
      fxPressure: 0.065
    },
    options: [
      {
        id: 'A',
        label: 'Pacote anticíclico temporário de liquidez bancária e crédito produtivo',
        effects: { fiscalBalance: -1.2, gdpGrowth: 0.55, investorConfidence: 4.5, unemployment: -0.35, approval: 2.0 },
        explanation: 'Inspirado nas respostas keynesianas de 2008-2009: evita colapso do crédito, ao custo de maior déficit temporário.'
      },
      {
        id: 'B',
        label: 'Austeridade imediata para proteger reservas internacionais e câmbio',
        effects: { fiscalBalance: 0.6, investorConfidence: 3.0, gdpGrowth: -0.5, unemployment: 0.7, approval: -4.0 },
        explanation: 'Prioriza solvência externa e câmbio, mas aprofunda a contração econômica no curto prazo.'
      },
      {
        id: 'C',
        label: 'Coordenação com G20 e linhas de swap cambial com bancos centrais',
        effects: { reserves: 18, investorConfidence: 5.5, fxPressure: -0.025, politicalStability: 2.0 },
        explanation: 'Cooperação internacional reduz pânico financeiro sem sobrecarregar sozinha a dívida pública.'
      }
    ]
  },
  {
    id: 'hist_2020',
    isHistorical: true,
    historicalRef: 'Pandemia Global de 2020 (COVID-19 — OMS, Mar/2020)',
    category: 'Crise Sanitária e Logística',
    severity: 'high',
    title: 'EMERGÊNCIA SANITÁRIA GLOBAL — INSPIRADA NA PANDEMIA DE 2020',
    summary: 'Surtos respiratórios paralisam cadeias de suprimentos internacionais, reduzem mobilidade urbana e pressionam drasticamente o sistema hospitalar.',
    context: 'Baseado na pandemia de 2020, que exigiu decisões difíceis entre proteção à saúde, auxílio emergencial, cadeias globais e sustentabilidade da dívida.',
    affectedRegionCoords: { lat: 30.59, lon: 114.3 },
    externalShocks: {
      globalTension: 22,
      oilPriceDelta: -22,
      gdpGrowthDelta: -1.8,
      healthDelta: -6.0,
      unemploymentDelta: 1.4,
      investorConfidenceDelta: -10,
      fxPressure: 0.055
    },
    options: [
      {
        id: 'A',
        label: 'Auxílio emergencial amplo às famílias, empresas e reforço hospitalar',
        effects: { fiscalBalance: -2.1, health: 5.5, poverty: -1.5, gdpGrowth: 0.7, approval: 5.0, inflation: 0.65 },
        explanation: 'Protege vidas, renda e empresas na crise aguda, mas eleva significativamente a dívida pública e pressões inflacionárias posteriores.'
      },
      {
        id: 'B',
        label: 'Foco estrito em vacinas/hospitais com auxílio focalizado apenas nos vulneráveis',
        effects: { fiscalBalance: -0.9, health: 4.5, poverty: -0.6, investorConfidence: 2.5, approval: 1.5 },
        explanation: 'Equilibra proteção sanitária com menor deterioração fiscal.'
      },
      {
        id: 'C',
        label: 'Minimizar gastos públicos e manter atividade econômica sem restrições',
        effects: { fiscalBalance: 0.2, health: -4.5, qualityOfLife: -3.5, approval: -6.0, politicalStability: -4.0 },
        explanation: 'Evita gasto imediato, mas colapso sanitário reduz confiança e produtividade.'
      }
    ]
  },
  {
    id: 'hist_2022_energy',
    isHistorical: true,
    historicalRef: 'Choque Energético e Inflacionário Global de 2022 (Guerra na Ucrânia / Oferta Global)',
    category: 'Geopolítica & Energia',
    severity: 'high',
    title: 'CONFLITO INTERNACIONAL E CHOQUE DE ENERGIA — INSPIRADO EM 2022',
    summary: 'Um conflito armado envolvendo grandes exportadores de energia e grãos dispara os preços do petróleo, gás e fertilizantes no mercado mundial.',
    context: 'Baseado no choque de 2022, quando tensões geopolíticas provocaram inflação global de alimentos/energia e aperto monetário nos EUA e Europa.',
    affectedRegionCoords: { lat: 50.45, lon: 30.52 },
    externalShocks: {
      globalTension: 25,
      oilPriceDelta: 28,
      fedRateDelta: 0.75,
      inflationDelta: 1.8,
      purchasingPowerDelta: -3.5,
      investorConfidenceDelta: -6,
      fxPressure: 0.04
    },
    options: [
      {
        id: 'A',
        label: 'Reduzir temporariamente impostos sobre combustíveis e alimentos básicos',
        effects: { fiscalBalance: -0.7, inflation: -0.8, purchasingPower: 2.5, approval: 3.5, investorConfidence: -2.0 },
        explanation: 'Alivia o bolso do cidadão agora, mas reduz arrecadação.'
      },
      {
        id: 'B',
        label: 'Manter preços alinhados ao mercado e criar vale-energia só para baixa renda',
        effects: { fiscalBalance: -0.25, poverty: -0.9, investorConfidence: 3.0, approval: 0.5 },
        explanation: 'Evita distorções fiscais amplas e protege os mais vulneráveis.'
      },
      {
        id: 'C',
        label: 'Acelerar transição energética e acordos alternativos de suprimento',
        effects: { fiscalBalance: -0.45, infrastructure: 2.0, foreignInvestment: 4.0, delayed: [{ delayQuarters: 2, label: 'Menor dependência energética externa', effects: { tradeBalance: 5.5, inflation: -0.4 } }] },
        explanation: 'Não resolve imediatamente o preço na bomba, mas blinda o país no médio prazo.'
      }
    ]
  }
];

export const CONTEXTUAL_EVENTS = [
  {
    id: 'ev_confidence_crisis',
    isHistorical: false,
    category: 'Mercado Financeiro',
    severity: 'high',
    title: 'CRISE DE CONFIANÇA NOS TÍTULOS PÚBLICOS',
    summary: 'A combinação de déficit elevado e dívida crescente levou investidores a exigir juros maiores para financiar o governo, pressionando fortemente a moeda local.',
    condition: (s) => s.indicators.fiscalBalance < -4.2 && s.indicators.investorConfidence < 50 && !s.recentEventIds.includes('ev_confidence_crisis'),
    externalShocks: {
      investorConfidenceDelta: -8,
      foreignInvestmentDelta: -7,
      countryRiskDelta: 85,
      fxPressure: 0.048
    },
    options: [
      {
        id: 'A',
        label: 'Apresentar pacote crível de contenção de despesas e metas fiscais',
        effects: { fiscalBalance: 0.9, investorConfidence: 7.5, approval: -2.5, fxPressure: -0.025 },
        explanation: 'Reverte a percepção de risco e estabiliza o câmbio.'
      },
      {
        id: 'B',
        label: 'Usar parte das reservas internacionais para conter volatilidade e dialogar com o mercado',
        effects: { reserves: -12, investorConfidence: 2.5, fxPressure: -0.015 },
        explanation: 'Compra tempo, mas não resolve a raiz fiscal.'
      },
      {
        id: 'C',
        label: 'Ignorar pressões de mercado e manter expansão de gastos',
        effects: { investorConfidence: -6.0, inflation: 0.9, fxPressure: 0.04, approval: -1.5 },
        explanation: 'Agrava a saída de capitais e corrói o poder de compra.'
      }
    ]
  },
  {
    id: 'ev_popular_protests',
    isHistorical: false,
    category: 'Situação Social',
    severity: 'high',
    title: 'MANIFESTAÇÕES POPULARES NAS PRINCIPAIS CIDADES',
    summary: 'Cidadãos foram às ruas protestar contra perda do poder de compra, custo de vida elevado e insatisfação com serviços públicos.',
    condition: (s) => (s.indicators.approval < 43 || s.indicators.inflation > 7.5) && !s.recentEventIds.includes('ev_popular_protests'),
    triggerProtest: true,
    externalShocks: {
      politicalStabilityDelta: -6,
      investorConfidenceDelta: -3
    },
    options: [
      {
        id: 'A',
        label: 'Abrir mesa de negociação com representantes e anunciar medidas sociais focalizadas',
        effects: { approval: 5.5, politicalStability: 4.5, fiscalBalance: -0.4, purchasingPower: 1.5 },
        explanation: 'Reduz tensões sociais e recompõe parte da legitimidade do governo.'
      },
      {
        id: 'B',
        label: 'Rever medidas impopulares recentes e convocar pronunciamento nacional transparente',
        effects: { approval: 4.0, politicalStability: 3.5, parliamentSupport: 2.0 },
        explanation: 'Demonstra sensibilidade democrática, ainda que exija recalibrar a agenda.'
      },
      {
        id: 'C',
        label: 'Manter integralmente a política econômica e justificar seus benefícios futuros',
        effects: { investorConfidence: 2.5, approval: -3.5, politicalStability: -3.0 },
        explanation: 'Agrada mercados pela firmeza, mas amplia desgaste político no curto prazo.'
      }
    ]
  },
  {
    id: 'ev_export_boom',
    isHistorical: false,
    category: 'Comércio Exterior (Positivo)',
    severity: 'positive',
    title: 'SAFRA RECORDE E EXPANSÃO DAS EXPORTAÇÕES',
    summary: 'Boas condições produtivas e demanda externa aquecida elevaram fortemente os embarques nacionais, aumentando a entrada de dólares no país.',
    condition: (s) => (s.indicators.tradeBalance > 10 || s.indicators.infrastructure > 55) && s.quarter % 3 === 0,
    externalShocks: {
      tradeBalanceDelta: 11.0,
      reservesDelta: 9.0,
      gdpGrowthDelta: 0.45,
      fxPressure: -0.024,
      approvalDelta: 2.0
    },
    options: [
      {
        id: 'A',
        label: 'Canalizar parte do superávit para fundo soberano / redução da dívida',
        effects: { fiscalBalance: 0.45, publicDebt: -1.0, investorConfidence: 4.0 },
        explanation: 'Fortalece o colchão fiscal contra crises futuras.'
      },
      {
        id: 'B',
        label: 'Reinvestir receitas em logística portuária e pesquisa tecnológica',
        effects: { infrastructure: 2.8, education: 1.5, gdpGrowth: 0.25 },
        explanation: 'Transforma ciclo favorável em ganhos estruturais.'
      }
    ]
  },
  {
    id: 'ev_tech_breakthrough',
    isHistorical: false,
    category: 'Inovação & Investimentos (Positivo)',
    severity: 'positive',
    title: 'POLO DE INOVAÇÃO ATRAI ONDA DE INVESTIMENTOS ESTRANGEIROS',
    summary: 'Empresas globais de tecnologia, semicondutores e energia limpa anunciaram novos centros de produção e pesquisa no território nacional.',
    condition: (s) => s.indicators.investorConfidence >= 60 && s.indicators.education >= 54 && !s.recentEventIds.includes('ev_tech_breakthrough'),
    externalShocks: {
      foreignInvestmentDelta: 12.0,
      gdpGrowthDelta: 0.5,
      jobCreationDelta: 4.0,
      fxPressure: -0.02
    },
    options: [
      {
        id: 'A',
        label: 'Vincular incentivos à transferência tecnológica e universidades locais',
        effects: { education: 3.0, infrastructure: 2.0, qualityOfLife: 2.0, approval: 3.0 },
        explanation: 'Multiplica o impacto científico e salarial do investimento externo.'
      },
      {
        id: 'B',
        label: 'Agilizar licenciamentos para acelerar geração imediata de empregos',
        effects: { jobCreation: 3.5, unemployment: -0.45, gdpGrowth: 0.3 },
        explanation: 'Acelera contratações já nos próximos trimestres.'
      }
    ]
  },
  {
    id: 'ev_climate_drought',
    isHistorical: false,
    category: 'Desastre Climático',
    severity: 'medium',
    title: 'ESTIAGEM SEVERA AFETA RESERVATÓRIOS E PRODUÇÃO AGRÍCOLA',
    summary: 'Seca prolongada em regiões produtivas pressiona preços de energia e alimentos e exige resposta coordenada.',
    condition: (s) => s.quarter >= 3 && s.quarter % 5 === 0,
    externalShocks: {
      inflationDelta: 0.75,
      gdpGrowthDelta: -0.35,
      infrastructureDelta: -1.5,
      purchasingPowerDelta: -1.5
    },
    options: [
      {
        id: 'A',
        label: 'Plano emergencial de irrigação, crédito rural e segurança hídrica',
        effects: { fiscalBalance: -0.45, approval: 2.5, infrastructure: 2.0, inflation: -0.2 },
        explanation: 'Mitiga perdas futuras e apoia produtores e famílias afetadas.'
      },
      {
        id: 'B',
        label: 'Importar alimentos temporariamente com tarifa zero para conter preços',
        effects: { inflation: -0.5, tradeBalance: -3.5, purchasingPower: 1.5, approval: 1.5 },
        explanation: 'Segura a inflação alimentar rapidamente, com leve impacto na balança comercial.'
      }
    ]
  },
  {
    id: 'ev_green_discovery',
    isHistorical: false,
    category: 'Recursos & Energia (Positivo)',
    severity: 'positive',
    title: 'DESCOBERTA DE RESERVAS ESTRATÉGICAS DE ENERGIA E MINERAIS CRÍTICOS',
    summary: 'Estudos geológicos confirmam novo potencial para minerais de transição energética e fontes limpas com alta demanda global.',
    condition: (s) => s.quarter >= 4 && !s.recentEventIds.includes('ev_green_discovery'),
    externalShocks: {
      investorConfidenceDelta: 4.5,
      foreignInvestmentDelta: 8.5,
      reservesDelta: 6.0,
      fxPressure: -0.016
    },
    options: [
      {
        id: 'A',
        label: 'Criar marco regulatório transparente com royalties para educação e ciência',
        effects: { education: 2.5, investorConfidence: 3.5, approval: 3.0, delayed: [{ delayQuarters: 3, label: 'Receitas de royalties em operação', effects: { fiscalBalance: 0.65, tradeBalance: 7.0 } }] },
        explanation: 'Evita a "maldição dos recursos" convertendo riqueza natural em capital humano.'
      },
      {
        id: 'B',
        label: 'Licitar rapidamente para maximizar entrada imediata de divisas',
        effects: { foreignInvestment: 7.0, tradeBalance: 4.0, fxPressure: -0.015 },
        explanation: 'Acelera entrada de dólares, embora exija vigilância ambiental.'
      }
    ]
  }
];
