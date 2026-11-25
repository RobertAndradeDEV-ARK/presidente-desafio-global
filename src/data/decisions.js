/**
 * Presidential / Prime Ministerial Dilemmas & Direct Ministry Policy Levers.
 * Every choice feeds real simulation mechanisms with immediate and delayed effects.
 */

export const DILEMMAS = [
  {
    id: 'fiscal_crossroads',
    area: 'Gastos Públicos & Fiscal',
    title: 'CRISE FISCAL — PRESSÃO SOBRE AS CONTAS PÚBLICAS',
    situation: 'O orçamento nacional enfrenta aumento das despesas obrigatórias enquanto a população cobra melhorias urgentes em saúde, educação e infraestrutura.',
    context: 'Agências de risco e investidores observam atentamente a trajetória da dívida pública e a capacidade de negociação com o Legislativo.',
    objective: 'Definir a estratégia fiscal do governo equilibrando sustentabilidade da dívida, serviços públicos e crescimento.',
    triggerCondition: (state) => state.quarter === 1 || state.indicators.fiscalBalance < -3.0 || state.indicators.publicDebt > 75,
    alternatives: [
      {
        id: 'A',
        label: 'Aumentar investimentos públicos em infraestrutura e programas sociais',
        risksBenefits: 'Benefício: estimula emprego e demanda no curto prazo. Risco: amplia déficit, pode assustar investidores e pressionar dólar e inflação se o risco fiscal já for alto.',
        effects: {
          fiscalBalance: -1.1,
          gdpGrowth: 0.65,
          jobCreation: 3.5,
          infrastructure: 3.0,
          approval: 3.5,
          investorConfidence: -5.5,
          inflation: 0.45,
          delayed: [
            { delayQuarters: 2, label: 'Retorno de produtividade da infraestrutura', effects: { gdpGrowth: 0.35, infrastructure: 1.5 } },
            { delayQuarters: 2, label: 'Pressão acumulada do endividamento', effects: { investorConfidence: -2.0 } }
          ]
        }
      },
      {
        id: 'B',
        label: 'Reduzir despesas governamentais não essenciais de forma imediata',
        risksBenefits: 'Benefício: melhora confiança dos mercados e alivia pressão sobre câmbio e juros. Risco: desacelera atividade econômica e reduz aprovação popular.',
        effects: {
          fiscalBalance: 1.25,
          gdpGrowth: -0.45,
          investorConfidence: 6.5,
          inflation: -0.35,
          approval: -4.0,
          health: -1.0,
          infrastructure: -1.0,
          delayed: [
            { delayQuarters: 2, label: 'Alívio estrutural de juros e risco-país', effects: { gdpGrowth: 0.25, foreignInvestment: 3.0 } }
          ]
        }
      },
      {
        id: 'C',
        label: 'Aumentar a arrecadação por meio de impostos sobre renda e consumo',
        risksBenefits: 'Benefício: reforça receitas do Tesouro. Risco: reduz poder de compra, encontra resistência no Parlamento e pode inibir investimento privado.',
        effects: {
          fiscalBalance: 0.9,
          gdpGrowth: -0.3,
          purchasingPower: -2.5,
          approval: -3.5,
          parliamentSupport: -4.0,
          investorConfidence: 1.5,
          inflation: 0.2
        }
      },
      {
        id: 'D',
        label: 'Criar plano gradual de ajuste fiscal preservando investimentos estratégicos',
        risksBenefits: 'Benefício: equilibra previsibilidade fiscal e proteção social. Risco: exige alto capital político no Parlamento para ser aprovado integralmente.',
        requiresParliament: 42,
        effects: {
          fiscalBalance: 0.55,
          gdpGrowth: 0.15,
          investorConfidence: 4.0,
          approval: 1.0,
          parliamentSupport: -2.0,
          infrastructure: 1.2,
          delayed: [
            { delayQuarters: 3, label: 'Consolidação da credibilidade fiscal', effects: { investorConfidence: 3.5, foreignInvestment: 4.5, gdpGrowth: 0.3 } }
          ]
        }
      }
    ]
  },
  {
    id: 'education_reform',
    area: 'Educação & Produtividade',
    title: 'REFORMA EDUCACIONAL E QUALIFICAÇÃO TECNOLÓGICA',
    situation: 'Empresas relatam falta de mão de obra qualificada enquanto indicadores de aprendizagem básica estagnaram.',
    context: 'A modernização do ensino exige investimentos contínuos, cujo retorno produtivo leva vários trimestres para aparecer na economia.',
    objective: 'Elevar a qualificação da força de trabalho sem desorganizar o orçamento de curto prazo.',
    triggerCondition: (state) => state.quarter >= 2,
    alternatives: [
      {
        id: 'A',
        label: 'Plano amplo de ensino integral, formação docente e escolas técnicas',
        risksBenefits: 'Benefício: forte ganho em educação, redução da desigualdade e PIB futuro. Risco: custo fiscal imediato elevado.',
        effects: {
          fiscalBalance: -0.65,
          education: 5.5,
          qualityOfLife: 2.0,
          approval: 3.0,
          investorConfidence: 1.0,
          delayed: [
            { delayQuarters: 3, label: 'Ganhos de produtividade da força de trabalho', effects: { gdpGrowth: 0.45, jobCreation: 3.5, inequality: -1.5 } },
            { delayQuarters: 5, label: 'Maturação tecnológica e redução da pobreza', effects: { poverty: -1.4, foreignInvestment: 4.0 } }
          ]
        }
      },
      {
        id: 'B',
        label: 'Parcerias público-privadas focadas em capacitação digital e industrial',
        risksBenefits: 'Benefício: baixo custo fiscal e resposta rápida ao mercado de trabalho. Risco: menor alcance nas regiões mais pobres.',
        effects: {
          fiscalBalance: -0.2,
          education: 3.0,
          jobCreation: 2.8,
          investorConfidence: 2.5,
          inequality: 0.5,
          delayed: [
            { delayQuarters: 2, label: 'Absorção de mão de obra pelo setor produtivo', effects: { gdpGrowth: 0.25, unemployment: -0.35 } }
          ]
        }
      },
      {
        id: 'C',
        label: 'Manter orçamento atual e priorizar apenas gestão administrativa',
        risksBenefits: 'Benefício: preserva o caixa público no curto prazo. Risco: estagnação educacional e perda de competitividade futura.',
        effects: {
          fiscalBalance: 0.1,
          education: -0.5,
          approval: -1.5,
          delayed: [
            { delayQuarters: 3, label: 'Defasagem de capital humano', effects: { gdpGrowth: -0.2 } }
          ]
        }
      }
    ]
  },
  {
    id: 'tax_overhaul',
    area: 'Impostos',
    title: 'REFORMA TRIBUTÁRIA E AMBIENTE DE NEGÓCIOS',
    situation: 'O sistema tributário atual é criticado por complexidade, custos operacionais e distorções sobre consumo e pequenas empresas.',
    context: 'Setores produtivos pressionam por desoneração, enquanto governadores e parlamentares temem perda de arrecadação.',
    objective: 'Simplificar impostos e estimular o crescimento preservando a saúde fiscal do Estado.',
    triggerCondition: (state) => state.quarter >= 2,
    alternatives: [
      {
        id: 'A',
        label: 'Reduzir impostos sobre pequenas empresas e simplificar tributos sobre consumo',
        risksBenefits: 'Benefício: impulsiona empregos, confiança empresarial e formalização. Risco: queda inicial de receita antes da retomada.',
        effects: {
          fiscalBalance: -0.5,
          gdpGrowth: 0.45,
          jobCreation: 3.5,
          investorConfidence: 4.5,
          approval: 3.0,
          delayed: [
            { delayQuarters: 2, label: 'Expansão da base de contribuintes', effects: { fiscalBalance: 0.4, gdpGrowth: 0.3 } }
          ]
        }
      },
      {
        id: 'B',
        label: 'Tributar mais altas rendas e dividendos para desonerar itens essenciais',
        risksBenefits: 'Benefício: reduz desigualdade e aumenta poder de compra popular. Risco: atrito com mercado financeiro e fuga parcial de capitais.',
        effects: {
          inequality: -2.2,
          poverty: -1.2,
          purchasingPower: 2.5,
          approval: 4.0,
          investorConfidence: -4.0,
          foreignInvestment: -3.5,
          parliamentSupport: -3.5
        }
      },
      {
        id: 'C',
        label: 'Reforma neutra de simplificação com transição de longo prazo',
        risksBenefits: 'Benefício: melhora produtividade sem choque fiscal imediato. Risco: resultados demoram e exigem intensa articulação política.',
        effects: {
          investorConfidence: 3.5,
          parliamentSupport: -1.5,
          delayed: [
            { delayQuarters: 3, label: 'Eficiência produtiva da simplificação tributária', effects: { gdpGrowth: 0.45, tradeBalance: 4.0, foreignInvestment: 3.5 } }
          ]
        }
      }
    ]
  },
  {
    id: 'energy_transition',
    area: 'Energia & Meio Ambiente',
    title: 'SEGURANÇA ENERGÉTICA E TRANSIÇÃO VERDE',
    situation: 'O crescimento da demanda elétrica e as exigências climáticas internacionais colocam a matriz energética no centro da agenda nacional.',
    context: 'Investidores globais premiam energia limpa, mas o país precisa garantir fornecimento barato e estável agora.',
    objective: 'Expandir a geração de energia equilibrando custo tarifário, emissões e segurança do sistema.',
    triggerCondition: (state) => state.quarter >= 3,
    alternatives: [
      {
        id: 'A',
        label: 'Acelerar investimentos em energia solar, eólica, hidrogênio verde e redes',
        risksBenefits: 'Benefício: atrai capital verde, reduz custos futuros e melhora imagem externa. Risco: exigência fiscal inicial.',
        effects: {
          fiscalBalance: -0.55,
          infrastructure: 2.5,
          foreignInvestment: 5.5,
          investorConfidence: 3.0,
          approval: 2.0,
          delayed: [
            { delayQuarters: 3, label: 'Energia limpa e redução de custo industrial', effects: { gdpGrowth: 0.35, inflation: -0.35, tradeBalance: 4.0 } }
          ]
        }
      },
      {
        id: 'B',
        label: 'Priorizar expansão rápida de combustíveis fósseis para baixar preços hoje',
        risksBenefits: 'Benefício: alívio rápido no preço de combustíveis e produção. Risco: retaliação ambiental e perda de fundos verdes.',
        effects: {
          inflation: -0.45,
          gdpGrowth: 0.3,
          purchasingPower: 1.5,
          foreignInvestment: -3.0,
          investorConfidence: -1.5,
          approval: 1.0
        }
      },
      {
        id: 'C',
        label: 'Plano híbrido: modernizar rede existente com metas graduais de descarbonização',
        risksBenefits: 'Benefício: menor choque econômico e boa aceitação técnica. Risco: avanços mais modestos no curto prazo.',
        effects: {
          fiscalBalance: -0.25,
          infrastructure: 1.8,
          investorConfidence: 2.0,
          foreignInvestment: 2.5
        }
      }
    ]
  },
  {
    id: 'health_security_pact',
    area: 'Saúde & Segurança',
    title: 'PRESSÃO SOBRE HOSPITAIS E SEGURANÇA URBANA',
    situation: 'Filas no sistema de saúde e aumento de ocorrências de criminalidade nas metrópoles geram cobrança direta da opinião pública.',
    context: 'Prefeitos e governadores pedem repasses federais emergenciais, mas o teto fiscal limita gastos simultâneos.',
    objective: 'Responder às demandas essenciais da população mantendo governabilidade e equilíbrio financeiro.',
    triggerCondition: (state) => state.quarter >= 2,
    alternatives: [
      {
        id: 'A',
        label: 'Pacote integrado de atenção básica em saúde e inteligência policial',
        risksBenefits: 'Benefício: melhora saúde, segurança e aprovação popular. Risco: aumenta despesa corrente permanente.',
        effects: {
          fiscalBalance: -0.75,
          health: 4.5,
          security: 4.0,
          qualityOfLife: 2.5,
          approval: 4.5,
          investorConfidence: -2.0
        }
      },
      {
        id: 'B',
        label: 'Focar em mutirões de saúde e prevenção social sem ampliar despesas fixas',
        risksBenefits: 'Benefício: melhora rápida na saúde com controle fiscal. Risco: impacto limitado na segurança pública.',
        effects: {
          fiscalBalance: -0.3,
          health: 3.5,
          approval: 2.0,
          security: 0.5
        }
      },
      {
        id: 'C',
        label: 'Priorizar endurecimento policial e integração de fronteiras com orçamento realocado',
        risksBenefits: 'Benefício: resposta direta à segurança sem elevar déficit total. Risco: desgaste na área da saúde e críticas de entidades civis.',
        effects: {
          security: 4.2,
          health: -1.2,
          politicalStability: 1.5,
          approval: 1.2
        }
      }
    ]
  },
  {
    id: 'pension_labor_reform',
    area: 'Previdência & Trabalho',
    title: 'SUSTENTABILIDADE PREVIDENCIÁRIA E EMPREGO',
    situation: 'O envelhecimento populacional eleva o gasto previdenciário, enquanto o mercado de trabalho pede regras mais modernas para contratação.',
    context: 'Sindicatos ameaçam paralisações caso direitos sejam reduzidos de forma abrupta; investidores cobram previsibilidade de longo prazo.',
    objective: 'Garantir sustentabilidade de longo prazo sem provocar convulsão social.',
    triggerCondition: (state) => state.quarter >= 4,
    alternatives: [
      {
        id: 'A',
        label: 'Reforma abrangente da previdência com transição suave e proteção aos mais pobres',
        risksBenefits: 'Benefício: melhora forte nas contas futuras e confiança internacional. Risco: desgaste popular e risco de protestos.',
        effects: {
          investorConfidence: 7.5,
          foreignInvestment: 6.0,
          approval: -4.5,
          parliamentSupport: -3.0,
          politicalStability: -2.5,
          delayed: [
            { delayQuarters: 3, label: 'Alívio estrutural na trajetória da dívida', effects: { fiscalBalance: 0.9, publicDebt: -1.8 } }
          ]
        }
      },
      {
        id: 'B',
        label: 'Programa nacional de incentivo à formalização e qualificação profissional',
        risksBenefits: 'Benefício: reduz desemprego e amplia contribuintes sem conflito social. Risco: custo inicial e efeito fiscal mais lento.',
        effects: {
          fiscalBalance: -0.4,
          jobCreation: 4.5,
          unemployment: -0.6,
          approval: 3.5,
          poverty: -1.0
        }
      },
      {
        id: 'C',
        label: 'Adiar reformas estruturais e criar mesa de diálogo tripartite',
        risksBenefits: 'Benefício: preserva paz social no curto prazo. Risco: frustra expectativas de ajuste e eleva prêmio de risco.',
        effects: {
          politicalStability: 2.0,
          investorConfidence: -3.5,
          delayed: [
            { delayQuarters: 2, label: 'Aumento gradual do gasto previdenciário', effects: { fiscalBalance: -0.45 } }
          ]
        }
      }
    ]
  },
  {
    id: 'industrial_export_push',
    area: 'Comércio & Indústria',
    title: 'ESTRATÉGIA DE EXPORTAÇÃO E INDÚSTRIA NACIONAL',
    situation: 'A economia precisa diversificar sua pauta exportadora e agregar valor tecnológico para não depender apenas de ciclos externos.',
    context: 'Linhas de crédito subsidiado podem acelerar fábricas, mas geram debate sobre eficiência fiscal e regras da OMC.',
    objective: 'Fortalecer exportações e balança comercial ampliando entrada de divisas.',
    triggerCondition: (state) => state.quarter >= 3,
    alternatives: [
      {
        id: 'A',
        label: 'Financiar exportações de alto valor agregado e modernizar portos/logística',
        risksBenefits: 'Benefício: fortalece balança comercial, PIB e entrada de dólares. Risco: investimento público inicial.',
        effects: {
          fiscalBalance: -0.45,
          tradeBalance: 8.0,
          infrastructure: 2.5,
          gdpGrowth: 0.4,
          delayed: [
            { delayQuarters: 2, label: 'Expansão das receitas de exportação', effects: { tradeBalance: 7.0, reserves: 8.0, fxPressure: -0.02 } }
          ]
        }
      },
      {
        id: 'B',
        label: 'Desregulamentar comércio exterior e cortar tarifas de importação de máquinas',
        risksBenefits: 'Benefício: barateia modernização industrial e reduz inflação. Risco: pressiona balança comercial no curto prazo.',
        effects: {
          tradeBalance: -4.0,
          inflation: -0.35,
          investorConfidence: 4.0,
          gdpGrowth: 0.3,
          delayed: [
            { delayQuarters: 3, label: 'Ganho de competitividade com máquinas importadas', effects: { gdpGrowth: 0.4, tradeBalance: 5.0 } }
          ]
        }
      },
      {
        id: 'C',
        label: 'Aumentar barreiras protecionistas para proteger fabricantes locais',
        risksBenefits: 'Benefício: alívio temporário à indústria doméstica. Risco: inflação mais alta, menor produtividade e atrito comercial.',
        effects: {
          inflation: 0.65,
          purchasingPower: -2.0,
          investorConfidence: -3.0,
          jobCreation: 1.5,
          tradeBalance: 1.5
        }
      }
    ]
  }
];

/**
 * Direct Ministry Policy Levers available inside the 17 Command Center sections.
 * Cooldown prevents spamming the exact same lever every click within the same quarter.
 */
export const MINISTRY_ACTIONS = [
  {
    id: 'infra_corridors',
    section: 'infraestrutura',
    title: 'Lançar Programa de Concessões e Logística',
    costLabel: 'Impacto fiscal moderado + parcerias privadas',
    description: 'Investe em portos, ferrovias e rodovias para reduzir o custo de transporte no país.',
    effects: { fiscalBalance: -0.45, infrastructure: 3.5, jobCreation: 2.5, gdpGrowth: 0.25, investorConfidence: 2.5 },
    delayed: [{ delayQuarters: 2, label: 'Redução de custos logísticos', effects: { tradeBalance: 4.5, inflation: -0.25 } }]
  },
  {
    id: 'edu_stem',
    section: 'educacao',
    title: 'Ampliar Bolsas Técnicas e Conectividade Escolar',
    costLabel: 'Custo fiscal leve',
    description: 'Expande laboratórios, ensino técnico e formação de professores na rede pública.',
    effects: { fiscalBalance: -0.35, education: 3.5, approval: 2.0, inequality: -0.8 },
    delayed: [{ delayQuarters: 3, label: 'Aumento de produtividade', effects: { gdpGrowth: 0.3, jobCreation: 2.0 } }]
  },
  {
    id: 'health_network',
    section: 'saude',
    title: 'Modernizar Hospitais e Atenção Primária',
    costLabel: 'Custo fiscal moderado',
    description: 'Compra equipamentos, amplia equipes médicas e reduz filas de atendimento.',
    effects: { fiscalBalance: -0.45, health: 4.0, qualityOfLife: 2.0, approval: 2.8 }
  },
  {
    id: 'security_intel',
    section: 'seguranca',
    title: 'Integração de Inteligência e Policiamento Comunitário',
    costLabel: 'Custo fiscal leve',
    description: 'Reforça centros integrados de segurança, monitoramento e combate ao crime organizado.',
    effects: { fiscalBalance: -0.3, security: 3.8, politicalStability: 1.5, approval: 2.2 }
  },
  {
    id: 'tax_simplify',
    section: 'impostos',
    title: 'Simplificar Obrigações Tributárias para PMEs',
    costLabel: 'Renúncia fiscal inicial leve',
    description: 'Reduz burocracia e alíquotas iniciais para pequenas e médias empresas.',
    effects: { fiscalBalance: -0.25, jobCreation: 2.8, investorConfidence: 3.0, gdpGrowth: 0.25 }
  },
  {
    id: 'tax_compliance',
    section: 'impostos',
    title: 'Combater Sonegação e Revisar Subsídios Ineficientes',
    costLabel: 'Melhora arrecadação sem elevar alíquota geral',
    description: 'Fecha brechas tributárias e revisa isenções sem retorno social comprovado.',
    effects: { fiscalBalance: 0.55, investorConfidence: 2.0, parliamentSupport: -1.5, approval: 1.0 }
  },
  {
    id: 'spending_audit',
    section: 'gastos',
    title: 'Auditoria de Eficiência e Corte de Privilégios',
    costLabel: 'Redução de despesa corrente',
    description: 'Digitaliza compras públicas e elimina desperdícios administrativos.',
    effects: { fiscalBalance: 0.5, investorConfidence: 3.0, approval: 1.8 }
  },
  {
    id: 'social_safety',
    section: 'social',
    title: 'Reforçar Rede de Proteção Social Focalizada',
    costLabel: 'Custo fiscal moderado',
    description: 'Amplia transferência de renda condicionada à frequência escolar e vacinação.',
    effects: { fiscalBalance: -0.45, poverty: -1.8, inequality: -1.4, purchasingPower: 2.0, approval: 3.2, education: 1.0 }
  },
  {
    id: 'env_conservation',
    section: 'meio_ambiente',
    title: 'Combate ao Desmatamento e Pagamento por Serviços Ambientais',
    costLabel: 'Custo leve + atrai fundos verdes',
    description: 'Amplia fiscalização ambiental e certificação sustentável para exportações.',
    effects: { fiscalBalance: -0.2, foreignInvestment: 3.2, investorConfidence: 2.0, approval: 1.5 }
  },
  {
    id: 'energy_grid',
    section: 'energia',
    title: 'Leilão de Energia Renovável e Armazenamento',
    costLabel: 'Parceria público-privada',
    description: 'Expande parques solares, eólicos e linhas de transmissão.',
    effects: { fiscalBalance: -0.25, infrastructure: 2.2, foreignInvestment: 3.8, investorConfidence: 2.2 },
    delayed: [{ delayQuarters: 2, label: 'Maior oferta energética', effects: { inflation: -0.25, gdpGrowth: 0.2 } }]
  },
  {
    id: 'defense_cyber',
    section: 'defesa',
    title: 'Modernizar Defesa Cibernética e Infraestrutura Crítica',
    costLabel: 'Custo fiscal leve',
    description: 'Protege redes elétricas, sistemas bancários e fronteiras estratégicas.',
    effects: { fiscalBalance: -0.25, security: 2.0, politicalStability: 1.8 }
  },
  {
    id: 'trade_facilitation',
    section: 'comercio',
    title: 'Desburocratizar Alfândegas e Abrir Novos Mercados',
    costLabel: 'Custo administrativo mínimo',
    description: 'Reduz tempo de liberação portuária e promove missões exportadoras.',
    effects: { tradeBalance: 5.0, gdpGrowth: 0.25, investorConfidence: 2.5, fxPressure: -0.01 }
  },
  {
    id: 'parliament_coalition',
    section: 'politica',
    title: 'Rodada de Articulação Institucional com o Parlamento',
    costLabel: 'Negociação de pautas prioritárias',
    description: 'Constrói consensos com líderes partidários para destravar reformas estruturais.',
    effects: { parliamentSupport: 6.5, politicalStability: 2.5, fiscalBalance: -0.15 }
  },
  {
    id: 'fx_transparency',
    section: 'cambio',
    title: 'Sinalizar Compromisso Fiscal e Respeito à Autonomia Monetária',
    costLabel: 'Sem custo orçamentário direto',
    description: 'Reforça publicamente a previsibilidade institucional e o respeito às metas fiscais e ao Banco Central.',
    effects: { investorConfidence: 4.0, countryRiskDelta: -18, fxPressure: -0.014 }
  }
];
