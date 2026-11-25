import { getCountryById } from '../data/countries.js';

/**
 * Deterministic Semantic Presidential Command Parser (Text & Voice).
 * Never executes ambiguous orders blindly and respects institutional constraints (like Central Bank independence).
 */

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const INTENT_RULES = [
  {
    id: 'lower_interest_direct',
    keywords: ['baixar juros', 'reduzir juros', 'cortar juros', 'diminuir a selic', 'cortar taxa de juros', 'baixar a taxa de juros', 'imprimir dinheiro', 'fixar dolar', 'tabelar dolar'],
    status: 'restricted',
    area: 'Política Monetária e Câmbio',
    buildProposal: (country) => ({
      title: 'Limitação Institucional Identificada',
      interpretation: `Você solicitou intervenção direta na taxa de juros ou na cotação oficial pelo Executivo.`,
      legalConstraint: country.government.centralBank.autonomous
        ? `${country.government.centralBank.name} possui autonomia legal. Em ${country.name}, o ${country.government.headOfGovernmentTitle} NÃO pode baixar juros ou fixar o dólar por decreto.`
        : `Embora haja menor autonomia formal, forçar queda artificial de juros sem controle inflacionário gera fuga de capitais e disparo do dólar.`,
      clarificationPrompt: 'Alternativa institucional válida: o governo pode melhorar o equilíbrio fiscal para abrir espaço para o Banco Central reduzir os juros naturalmente.',
      alternativeProposal: {
        title: 'Plano de Ancoragem Fiscal para Viabilizar Queda Futura de Juros',
        area: 'Economia & Câmbio',
        optionLabel: 'Compromisso de meta fiscal e diálogo técnico com o Banco Central',
        effects: { fiscalBalance: 0.45, investorConfidence: 4.0, inflation: -0.25, countryRiskDelta: -15, fxPressure: -0.012 },
        explanation: 'Credibilidade fiscal reduz inflação esperada e cria condições reais para corte de juros nas próximas reuniões do Banco Central.'
      }
    })
  },
  {
    id: 'tax_cut_sme',
    keywords: ['reduzir impostos', 'diminuir impostos', 'cortar impostos', 'baixar impostos', 'desonerar', 'pequenas empresas', 'imposto menor'],
    area: 'Impostos',
    title: 'Programa de Desoneração Tributária para Pequenas Empresas',
    interpretation: 'Reduzir a carga tributária sobre pequenos e médios negócios para estimular formalização, emprego e atividade econômica.',
    risks: 'Renúncia fiscal inicial reduz arrecadação no curto prazo; exige acompanhamento do déficit público.',
    effects: {
      fiscalBalance: -0.55,
      gdpGrowth: 0.45,
      jobCreation: 3.6,
      unemployment: -0.35,
      investorConfidence: 3.5,
      approval: 3.0,
      delayed: [{ delayQuarters: 2, label: 'Ampliação da base formal de contribuintes', effects: { fiscalBalance: 0.35, gdpGrowth: 0.2 } }]
    },
    explanation: 'Alivia custos empresariais e incentiva contratações, com custo fiscal inicial parcialmente compensado pelo crescimento.'
  },
  {
    id: 'tax_increase_rich',
    keywords: ['aumentar impostos', 'elevar impostos', 'tributar grandes fortunas', 'cobrar mais imposto', 'subir tributos'],
    area: 'Impostos',
    title: 'Revisão Tributária com Aumento de Arrecadação',
    interpretation: 'Elevar a arrecadação tributária para reforçar o orçamento público e reduzir o déficit.',
    risks: 'Desgaste popular e parlamentar; possível retração de investimentos privados dependendo do desenho.',
    effects: {
      fiscalBalance: 0.85,
      gdpGrowth: -0.25,
      approval: -2.8,
      parliamentSupport: -3.0,
      investorConfidence: 1.0
    },
    explanation: 'Melhora o caixa do Tesouro e contém a dívida, ao custo de menor consumo e atrito político.'
  },
  {
    id: 'education_invest',
    keywords: ['educacao', 'escolas', 'universidades', 'professores', 'ensino', 'bolsas'],
    directionRequired: true,
    area: 'Educação',
    title: 'Plano Nacional de Investimento em Educação e Qualificação',
    interpretation: 'Ampliar recursos para escolas públicas, ensino técnico, formação docente e pesquisa.',
    risks: 'Exige financiamento sustentável; os maiores ganhos no PIB surgem após alguns trimestres.',
    effects: {
      fiscalBalance: -0.5,
      education: 4.5,
      qualityOfLife: 2.0,
      approval: 3.0,
      inequality: -1.0,
      delayed: [{ delayQuarters: 3, label: 'Ganho de produtividade do capital humano', effects: { gdpGrowth: 0.4, jobCreation: 2.5 } }]
    },
    explanation: 'Fortalece o capital humano e reduz desigualdades estruturais com retorno econômico progressivo.'
  },
  {
    id: 'health_invest',
    keywords: ['saude', 'hospitais', 'sus', 'medicos', 'vacina', 'atendimento medico'],
    area: 'Saúde',
    title: 'Expansão da Rede Pública de Saúde e Atendimento Hospitalar',
    interpretation: 'Ampliar leitos, contratação de equipes de saúde e fornecimento de medicamentos.',
    risks: 'Aumenta despesas correntes permanentes no orçamento.',
    effects: {
      fiscalBalance: -0.5,
      health: 4.5,
      qualityOfLife: 2.5,
      approval: 3.8,
      poverty: -0.6
    },
    explanation: 'Melhora diretamente o bem-estar da população e a aprovação social, exigindo espaço fiscal.'
  },
  {
    id: 'trade_us_partner',
    keywords: ['acordo comercial', 'comercio exterior', 'exportacoes', 'exportar', 'estados unidos', 'china', 'uniao europeia', 'parceria comercial'],
    area: 'Comércio & Relações Internacionais',
    title: 'Missão Diplomática para Novo Acordo Comercial e Exportações',
    interpretation: 'Negociar redução de tarifas, abertura de mercados e facilitação aduaneira com parceiros estratégicos.',
    risks: 'Setores domésticos menos competitivos podem pedir salvaguardas; depende de aprovação legislativa.',
    effects: {
      tradeBalance: 8.5,
      foreignInvestment: 5.0,
      investorConfidence: 4.0,
      gdpGrowth: 0.35,
      fxPressure: -0.018,
      delayed: [{ delayQuarters: 2, label: 'Entrada ampliada de divisas exportadoras', effects: { reserves: 7.0, tradeBalance: 5.0 } }]
    },
    explanation: 'Amplia fluxo de dólares comerciais, fortalece reservas e estimula setores exportadores.'
  },
  {
    id: 'deficit_cut',
    keywords: ['diminuir o deficit', 'reduzir deficit', 'cortar gastos', 'ajuste fiscal', 'equilibrar contas', 'reduzir divida', 'controlar gastos'],
    area: 'Gastos Públicos & Fiscal',
    title: 'Pacote de Consolidação Fiscal e Controle de Despesas',
    interpretation: 'Conter despesas não obrigatórias e revisar subsídios para reduzir o déficit e estabilizar a dívida pública.',
    risks: 'Desaceleração econômica no curto prazo e desgaste de popularidade.',
    effects: {
      fiscalBalance: 1.05,
      gdpGrowth: -0.3,
      investorConfidence: 5.8,
      inflation: -0.3,
      approval: -3.0,
      fxPressure: -0.02,
      countryRiskDelta: -25
    },
    explanation: 'Sinaliza responsabilidade fiscal, reduz prêmio de risco e alivia pressão sobre o dólar.'
  },
  {
    id: 'renewable_energy',
    keywords: ['energia renovavel', 'energia limpa', 'solar', 'eolica', 'hidrogenio', 'energia verde', 'descarbonizacao', 'meio ambiente'],
    area: 'Energia & Meio Ambiente',
    title: 'Programa de Expansão de Energia Renovável e Transição Verde',
    interpretation: 'Investir em geração solar, eólica e redes de transmissão sustentáveis com atração de capital verde.',
    risks: 'Exige aporte público inicial ou garantias regulatórias de longo prazo.',
    effects: {
      fiscalBalance: -0.4,
      infrastructure: 2.8,
      foreignInvestment: 5.5,
      investorConfidence: 3.0,
      approval: 2.0,
      delayed: [{ delayQuarters: 2, label: 'Energia mais barata e competitiva', effects: { inflation: -0.3, gdpGrowth: 0.3 } }]
    },
    explanation: 'Reduz vulnerabilidade a choques de combustíveis fósseis e atrai investidores internacionais.'
  },
  {
    id: 'jobs_program',
    keywords: ['geracao de empregos', 'gerar empregos', 'criar empregos', 'desemprego', 'trabalhadores', 'qualificacao', 'infraestrutura', 'obras'],
    area: 'Emprego & Infraestrutura',
    title: 'Programa Nacional de Empregos e Obras Estratégicas',
    interpretation: 'Estimular contratações via obras de infraestrutura logística e qualificação profissional.',
    risks: 'Eleva gastos públicos; se a economia já estiver aquecida, pode gerar pressão inflacionária.',
    effects: {
      fiscalBalance: -0.65,
      jobCreation: 4.5,
      unemployment: -0.55,
      infrastructure: 3.0,
      gdpGrowth: 0.45,
      approval: 3.5,
      inflation: 0.25
    },
    explanation: 'Combate o desemprego diretamente e melhora infraestrutura, com impacto fiscal moderado.'
  },
  {
    id: 'security_action',
    keywords: ['seguranca', 'policia', 'criminalidade', 'violencia', 'fronteiras', 'defesa'],
    area: 'Segurança & Defesa',
    title: 'Plano Integrado de Segurança Pública e Inteligência',
    interpretation: 'Reforçar policiamento integrado, tecnologia de prevenção e proteção de fronteiras.',
    risks: 'Custo orçamentário adicional e necessidade de coordenação com governos regionais.',
    effects: {
      fiscalBalance: -0.35,
      security: 4.2,
      politicalStability: 2.2,
      approval: 2.8
    },
    explanation: 'Reduz insegurança e melhora o ambiente institucional e a qualidade de vida urbana.'
  }
];

export function parsePresidentialCommand(rawInput, state) {
  const country = getCountryById(state.countryId);
  const text = normalize(rawInput);

  if (!text || text.length < 6) {
    return {
      status: 'ambiguous',
      rawInput,
      message: 'Comando muito curto. Especifique qual área e direção deseja seguir (ex.: "reduzir impostos sobre pequenas empresas" ou "investir em educação").',
      suggestions: [
        'Quero reduzir os impostos sobre pequenas empresas',
        'Quero aumentar os investimentos em educação',
        'Quero negociar um acordo comercial com os Estados Unidos',
        'Quero diminuir o déficit público'
      ]
    };
  }

  // Ambiguous standalone words without verb/direction
  const vagueTerms = ['impostos', 'economia', 'gastos', 'saude', 'educacao', 'dolar', 'mudar', 'melhorar'];
  const wordCount = text.split(/\s+/).length;
  if (wordCount <= 2 && vagueTerms.some(t => text.includes(t))) {
    return {
      status: 'ambiguous',
      rawInput,
      message: `Sua ordem "${rawInput}" está ambígua. Você deseja expandir/investir ou conter/cortar nessa área?`,
      suggestions: [
        'Quero diminuir o déficit público',
        'Quero aumentar os investimentos em educação',
        'Quero reduzir os impostos sobre pequenas empresas',
        'Quero aumentar os investimentos em energia renovável'
      ]
    };
  }

  // Check matches
  for (const rule of INTENT_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      if (rule.status === 'restricted') {
        const proposal = rule.buildProposal(country);
        return {
          status: 'restricted',
          rawInput,
          ...proposal
        };
      }

      // Check if user wanted "reduzir" vs "aumentar" for tax/spending ambiguity
      if (rule.id === 'tax_cut_sme' && (text.includes('aumentar') || text.includes('subir'))) {
        continue;
      }

      const fiscalNote = state.indicators.fiscalBalance < -3.5 && (rule.effects.fiscalBalance || 0) < 0
        ? 'Atenção: o déficit fiscal atual já está pressionado; novos gastos podem elevar juros e dólar.'
        : 'Impacto compatível com a margem orçamentária atual, sujeito à reação dos mercados.';

      return {
        status: 'ready',
        rawInput,
        area: rule.area,
        title: rule.title,
        interpretation: rule.interpretation,
        risks: `${rule.risks} ${fiscalNote}`,
        legalConstraint: `Sujeito aos trâmites de ${country.government.legislatureName} (apoio atual: ${Math.round(state.indicators.parliamentSupport)}%).`,
        effects: rule.effects,
        explanation: rule.explanation,
        optionLabel: rawInput.trim()
      };
    }
  }

  // Unrecognized / ambiguous intent
  return {
    status: 'ambiguous',
    rawInput,
    message: 'Não foi possível identificar com precisão a política pública desejada. Escolha uma das interpretações ou reformule especificando o setor e a ação (aumentar, reduzir, negociar, criar programa).',
    suggestions: [
      'Quero criar um programa de geração de empregos',
      'Quero aumentar os investimentos em energia renovável',
      'Quero negociar um acordo comercial com os Estados Unidos',
      'Quero diminuir o déficit público'
    ]
  };
}
