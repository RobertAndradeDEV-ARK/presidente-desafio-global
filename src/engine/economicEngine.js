import { getCountryById } from '../data/countries.js';
import { DILEMMAS } from '../data/decisions.js';
import { HISTORICAL_EVENTS, CONTEXTUAL_EVENTS } from '../data/events.js';
import { GLOBAL_PARTNERS } from '../data/diplomacy.js';

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function round(val, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}

/**
 * Deterministic pseudo-variation based strictly on game state hash (never unexplainable random).
 */
function deterministicFactor(countryId, quarter, salt = 0) {
  let h = 2166136261;
  const str = `${countryId}:${quarter}:${salt}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000 - 0.5; // [-0.5, 0.5)
}

export function formatQuarterLabel(quarter, startYear = 2025) {
  const yearOffset = Math.floor((quarter - 1) / 4);
  const q = ((quarter - 1) % 4) + 1;
  const names = ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre'];
  return `${names[q - 1]} de ${startYear + yearOffset}`;
}

export function createInitialState(countryId, config = {}) {
  const country = getCountryById(countryId);
  const totalQuarters = config.totalQuarters || country.government.termQuarters;
  const isCustomDuration = totalQuarters !== country.government.termQuarters;

  const indicators = { ...country.initialIndicators };
  const initialSnapshot = {
    quarter: 1,
    label: formatQuarterLabel(1),
    indicators: { ...indicators },
    drivers: ['Estado inicial baseado em dados econômicos de referência (' + country.baselineMeta.referencePeriod + ').']
  };

  const diplomacy = GLOBAL_PARTNERS
    .filter(p => p.id !== country.id)
    .map(partner => {
      const existing = country.internationalRelations.find(r => r.partnerId === partner.id);
      return {
        ...partner,
        relation: existing ? existing.relation : 60,
        tradeWeight: existing ? existing.tradeWeight : 0.08,
        note: existing ? existing.note : partner.strength,
        treaties: []
      };
    });

  const state = {
    version: 1,
    countryId: country.id,
    config: {
      difficulty: config.difficulty || 'normal', // facil | normal | dificil
      mode: config.mode || 'guiada', // guiada | historica | livre
      totalQuarters,
      isCustomDuration,
      complexity: config.complexity || 'completo' // simplificado | completo
    },
    quarter: 1,
    startYear: 2025,
    finished: false,
    indicators,
    initialIndicators: { ...indicators },
    fxStats: {
      minRate: indicators.exchangeRate,
      maxRate: indicators.exchangeRate,
      minQuarter: 1,
      maxQuarter: 1
    },
    externalScenario: {
      oilPrice: 78, // USD/barrel
      fedRate: 4.75,
      globalTension: 28, // 0-100
      commodityCycle: 0.0
    },
    history: [initialSnapshot],
    indicatorContributors: {}, // key -> [{ quarter, label, delta }]
    pendingEffects: [], // [{ dueQuarter, label, source, effects }]
    decisionsLog: [],
    usedDilemmaIds: [],
    usedHistoricalIds: [],
    recentEventIds: [],
    cooldowns: {}, // actionId -> lastQuarterUsed
    causalLog: [
      {
        quarter: 1,
        title: 'Posse no Centro de Comando',
        summary: `Você assumiu como ${country.government.headOfGovernmentTitle} em ${country.name}.`,
        decisionText: 'Início do mandato com base macroeconômica real de referência.',
        mechanism: 'Expectativas iniciais refletem o equilíbrio atual entre contas públicas, inflação, reservas e apoio parlamentar.',
        fxReason: `Cotação inicial de 1 USD = ${country.currency.symbol} ${indicators.exchangeRate.toFixed(country.currency.decimals)}.`,
        externalFactors: 'Cenário global estável no início do período (petróleo a US$ 78/barril; juros dos EUA em 4,75%).',
        futureConsequences: 'Decisões tomadas hoje podem gerar custos fiscais imediatos e efeitos estruturais nos trimestres seguintes.',
        chain: [
          'POSSE DO GOVERNO',
          'AVALIAÇÃO FISCAL E INSTITUCIONAL',
          'CONFIANÇA DOS INVESTIDORES',
          'ESTABILIDADE CAMBIAL INICIAL',
          'PAINEL DE INDICADORES'
        ],
        internalContributors: ['Condições iniciais herdadas do mandato anterior'],
        externalContributors: ['Preços internacionais de energia e taxa de juros americana']
      }
    ],
    newsLog: [
      {
        id: 'news_init_1',
        quarter: 1,
        dateLabel: formatQuarterLabel(1),
        category: 'Política Nacional',
        scope: 'Nacional',
        headline: `${country.government.headOfGovernmentTitle} assume o comando em ${country.capital} sob olhar dos mercados`,
        summary: country.politicalSituation,
        relatedIndicators: ['Aprovação Popular', 'Confiança dos Investidores', 'Câmbio'],
        consequences: 'Primeiras medidas fiscais e articulação com o Parlamento definirão a direção da moeda e dos investimentos.'
      },
      {
        id: 'news_init_2',
        quarter: 1,
        dateLabel: formatQuarterLabel(1),
        category: 'Economia Global',
        scope: 'Internacional',
        headline: `Mercados monitoram juros globais em 4,75% e cotação inicial de ${country.currency.code}`,
        summary: `Investidores acompanham inflação inicial de ${indicators.inflation.toFixed(1)}% e trajetória da dívida pública de ${indicators.publicDebt.toFixed(1)}% do PIB.`,
        relatedIndicators: ['Câmbio', 'Taxa de Juros', 'Inflação'],
        consequences: 'Diferencial de juros e credibilidade fiscal influenciarão o fluxo de dólares nas próximas semanas.'
      }
    ],
    nationalEvents: buildNationalEvents(country, indicators, 1),
    diplomacy,
    activeDilemma: null,
    activeEvent: null,
    crisisAlert: null
  };

  state.activeDilemma = pickNextDilemma(state);
  return state;
}

export function buildNationalEvents(country, ind, quarter) {
  const events = [];
  const regions = country.regions || [];
  if (!regions.length) return events;

  // Capital always shows legislative/governance status
  events.push({
    id: `nat_gov_${quarter}`,
    regionId: regions[0].id,
    regionName: regions[0].name,
    x: regions[0].x,
    y: regions[0].y,
    type: ind.parliamentSupport >= 50 ? 'agreement' : 'debate',
    severity: ind.parliamentSupport >= 50 ? 'positive' : 'medium',
    title: ind.parliamentSupport >= 50
      ? 'Base parlamentar alinhada no Legislativo'
      : 'Debates tensos e resistência no Parlamento',
    detail: `Apoio parlamentar atual: ${Math.round(ind.parliamentSupport)}%.`
  });

  // Economic hub shows growth or slowdown
  if (regions[1]) {
    events.push({
      id: `nat_econ_${quarter}`,
      regionId: regions[1].id,
      regionName: regions[1].name,
      x: regions[1].x,
      y: regions[1].y,
      type: ind.gdpGrowth >= 2.0 ? 'growth' : 'slowdown',
      severity: ind.gdpGrowth >= 2.0 ? 'positive' : 'medium',
      title: ind.gdpGrowth >= 2.0
        ? 'Expansão industrial e geração de empregos'
        : 'Desaceleração da atividade e cautela empresarial',
      detail: `PIB em ${ind.gdpGrowth.toFixed(1)}% ao ano e confiança em ${Math.round(ind.investorConfidence)}/100.`
    });
  }

  // Protests or strikes when approval is low or inflation high
  if (ind.approval < 45 || ind.inflation > 7.0) {
    const target = regions[Math.min(2, regions.length - 1)];
    events.push({
      id: `nat_protest_${quarter}`,
      regionId: target.id,
      regionName: target.name,
      x: target.x,
      y: target.y,
      type: 'protest',
      severity: 'high',
      title: ind.inflation > 7.0 ? 'Manifestações contra alta do custo de vida' : 'Protestos populares e pressão sindical',
      detail: `Aprovação popular em ${Math.round(ind.approval)}% e inflação de ${ind.inflation.toFixed(1)}%.`
    });
  }

  // Infrastructure works
  if (regions[3]) {
    events.push({
      id: `nat_infra_${quarter}`,
      regionId: regions[3].id,
      regionName: regions[3].name,
      x: regions[3].x,
      y: regions[3].y,
      type: ind.infrastructure >= 55 ? 'works' : 'supply',
      severity: ind.infrastructure >= 55 ? 'positive' : 'medium',
      title: ind.infrastructure >= 55
        ? 'Obras de infraestrutura e energia em andamento'
        : 'Gargalos logísticos exigem modernização',
      detail: `Índice de infraestrutura: ${Math.round(ind.infrastructure)}/100.`
    });
  }

  return events;
}

function recordContributor(state, indicatorKey, label, delta) {
  if (!delta || Math.abs(delta) < 0.001) return;
  if (!state.indicatorContributors[indicatorKey]) {
    state.indicatorContributors[indicatorKey] = [];
  }
  state.indicatorContributors[indicatorKey].push({
    quarter: state.quarter,
    dateLabel: formatQuarterLabel(state.quarter, state.startYear),
    label,
    delta: round(delta, 3)
  });
}

/**
 * Applies a policy or event delta vector with real contextual multipliers.
 */
export function applyEffectsToState(state, rawEffects, meta = {}) {
  const country = getCountryById(state.countryId);
  const ind = state.indicators;
  const diffMult = state.config.difficulty === 'dificil' ? 1.2 : state.config.difficulty === 'facil' ? 0.85 : 1.0;

  // Context multipliers
  const fiscalStress = ind.fiscalBalance < -3.5 || ind.publicDebt > 85 ? 1.45 : 1.0;
  const lowParliament = ind.parliamentSupport < 40 ? 0.78 : 1.0;
  const prevFx = ind.exchangeRate;

  const applied = {};
  const addDelta = (key, delta, min = -9999, max = 9999) => {
    if (!delta) return;
    const before = ind[key];
    ind[key] = clamp(before + delta, min, max);
    const actual = ind[key] - before;
    applied[key] = (applied[key] || 0) + actual;
    recordContributor(state, key, meta.title || 'Decisão governamental', actual);
  };

  // Fiscal balance
  if (rawEffects.fiscalBalance) {
    const d = rawEffects.fiscalBalance * (rawEffects.fiscalBalance < 0 ? diffMult : 1.0);
    addDelta('fiscalBalance', d, -18, 10);
    // Fiscal deficit feeds public debt
    addDelta('publicDebt', -d * 0.9, 10, 320);
  }

  // GDP Growth (moderated by low parliamentary implementation capacity if positive)
  if (rawEffects.gdpGrowth) {
    const d = rawEffects.gdpGrowth * (rawEffects.gdpGrowth > 0 ? lowParliament : diffMult);
    addDelta('gdpGrowth', d, -12, 12);
  }

  // Inflation (amplified if currency is weak or country has high inflation inertia)
  if (rawEffects.inflation) {
    const inertia = ind.inflation > 10 ? 1.35 : 1.0;
    addDelta('inflation', rawEffects.inflation * inertia, -2, 220);
  }

  // Investor confidence (penalized extra if fiscal stress is high and spending rises)
  if (rawEffects.investorConfidence) {
    const mult = rawEffects.investorConfidence < 0 ? fiscalStress : 1.0;
    addDelta('investorConfidence', rawEffects.investorConfidence * mult, 5, 98);
  }

  if (rawEffects.foreignInvestment) {
    addDelta('foreignInvestment', rawEffects.foreignInvestment, 1, 600);
  }
  if (rawEffects.tradeBalance) {
    addDelta('tradeBalance', rawEffects.tradeBalance, -1200, 400);
  }
  if (rawEffects.reserves) {
    addDelta('reserves', rawEffects.reserves, 5, 2500);
  }
  if (rawEffects.unemployment) {
    addDelta('unemployment', rawEffects.unemployment, 1.5, 35);
  }
  if (rawEffects.purchasingPower) {
    addDelta('purchasingPower', rawEffects.purchasingPower, 10, 99);
  }
  if (rawEffects.approval) {
    addDelta('approval', rawEffects.approval, 8, 95);
  }
  if (rawEffects.education) {
    addDelta('education', rawEffects.education, 15, 99);
  }
  if (rawEffects.health) {
    addDelta('health', rawEffects.health, 15, 99);
  }
  if (rawEffects.inequality) {
    addDelta('inequality', rawEffects.inequality, 18, 75);
  }
  if (rawEffects.poverty) {
    addDelta('poverty', rawEffects.poverty, 2, 75);
  }
  if (rawEffects.qualityOfLife) {
    addDelta('qualityOfLife', rawEffects.qualityOfLife, 20, 99);
  }
  if (rawEffects.jobCreation) {
    addDelta('jobCreation', rawEffects.jobCreation, 10, 98);
  }
  if (rawEffects.security) {
    addDelta('security', rawEffects.security, 10, 98);
  }
  if (rawEffects.infrastructure) {
    addDelta('infrastructure', rawEffects.infrastructure, 15, 99);
  }
  if (rawEffects.parliamentSupport) {
    addDelta('parliamentSupport', rawEffects.parliamentSupport, 10, 92);
  }
  if (rawEffects.politicalStability) {
    addDelta('politicalStability', rawEffects.politicalStability, 10, 96);
  }
  if (rawEffects.countryRiskDelta) {
    addDelta('countryRisk', rawEffects.countryRiskDelta, 20, 3500);
  }

  // Derived FX reaction from confidence/fiscal/trade/direct pressure
  let fxShiftPct = rawEffects.fxPressure || 0;
  if (applied.investorConfidence) {
    fxShiftPct += -applied.investorConfidence * 0.0028; // confidence rise strengthens local currency (lower USD=X)
  }
  if (applied.fiscalBalance && applied.fiscalBalance < -0.5) {
    fxShiftPct += Math.abs(applied.fiscalBalance) * 0.009 * fiscalStress;
  }
  if (applied.tradeBalance) {
    fxShiftPct += -applied.tradeBalance * 0.0005;
  }

  // For USA (global reserve currency measured as 1 USD = X EUR), invert direction so stronger US confidence raises X EUR
  if (country.currency.isGlobalReserve && country.id === 'US') {
    fxShiftPct = -fxShiftPct * 0.65;
  }

  if (Math.abs(fxShiftPct) > 0.0001) {
    const newFx = clamp(prevFx * (1 + fxShiftPct), prevFx * 0.72, prevFx * 1.45);
    const fxDelta = newFx - prevFx;
    ind.exchangeRate = round(newFx, country.currency.decimals);
    recordContributor(state, 'exchangeRate', meta.title || 'Reação cambial', fxDelta);
    applied.exchangeRate = fxDelta;

    // Pass-through to inflation & purchasing power (if local currency weakened)
    const weakened = country.id === 'US' ? fxDelta < 0 : fxDelta > 0;
    const fxAbsPct = Math.abs(fxDelta / prevFx);
    if (fxAbsPct > 0.004) {
      const passThrough = fxAbsPct * 18 * country.structuralProfile.importDependence * (weakened ? 1 : -0.6);
      addDelta('inflation', passThrough, -2, 220);
      addDelta('purchasingPower', -passThrough * 0.9, 10, 99);
    }
  }

  // Queue delayed effects
  if (Array.isArray(rawEffects.delayed)) {
    for (const d of rawEffects.delayed) {
      state.pendingEffects.push({
        dueQuarter: state.quarter + (d.delayQuarters || 2),
        label: d.label,
        source: meta.title || 'Política anterior',
        effects: d.effects
      });
    }
  }

  updateFxBounds(state);
  return applied;
}

function updateFxBounds(state) {
  const rate = state.indicators.exchangeRate;
  if (rate < state.fxStats.minRate) {
    state.fxStats.minRate = rate;
    state.fxStats.minQuarter = state.quarter;
  }
  if (rate > state.fxStats.maxRate) {
    state.fxStats.maxRate = rate;
    state.fxStats.maxQuarter = state.quarter;
  }
}

/**
 * Executes a Dilemma choice, Ministry Lever, Event Option, or Custom Command Proposal.
 */
export function executeDecision(state, payload) {
  const country = getCountryById(state.countryId);
  const { kind, title, area, optionLabel, effects, explanation, sourceId } = payload;

  const beforeFx = state.indicators.exchangeRate;
  const beforeConf = state.indicators.investorConfidence;
  const beforeFiscal = state.indicators.fiscalBalance;

  const applied = applyEffectsToState(state, effects, { title: `${title}: ${optionLabel}` });

  const fxDelta = state.indicators.exchangeRate - beforeFx;
  const fxDir = country.id === 'US'
    ? (fxDelta >= 0 ? 'valorizou o dólar frente ao euro' : 'enfraqueceu o dólar frente ao euro')
    : (fxDelta > 0 ? `pressionou o dólar para cima (+${fxDelta.toFixed(country.currency.decimals)})` : fxDelta < 0 ? `ajudou a valorizar a moeda local (${fxDelta.toFixed(country.currency.decimals)})` : 'manteve o câmbio estável');

  // Record in decision log
  state.decisionsLog.unshift({
    id: `dec_${state.quarter}_${state.decisionsLog.length + 1}`,
    quarter: state.quarter,
    dateLabel: formatQuarterLabel(state.quarter, state.startYear),
    kind: kind || 'Decisão Presidencial',
    area: area || 'Governo',
    title,
    choice: optionLabel,
    explanation: explanation || '',
    appliedEffects: applied,
    snapshotAfter: { ...state.indicators }
  });

  if (kind === 'Dilema' && sourceId) {
    state.usedDilemmaIds.push(sourceId);
    state.activeDilemma = null;
  }
  if (kind === 'Evento' && sourceId) {
    state.activeEvent = null;
    state.crisisAlert = null;
  }
  if (kind === 'Ministério' && sourceId) {
    state.cooldowns[sourceId] = state.quarter;
  }

  // Update causal explanation immediately so "Por que isso aconteceu?" is always fresh!
  const mechanismParts = [];
  if (Math.abs(state.indicators.fiscalBalance - beforeFiscal) > 0.05) {
    mechanismParts.push(
      state.indicators.fiscalBalance < beforeFiscal
        ? 'Expansão do déficit fiscal elevou a necessidade de financiamento do Tesouro.'
        : 'Melhora no saldo fiscal reduziu necessidade de emissão de dívida.'
    );
  }
  if (Math.abs(state.indicators.investorConfidence - beforeConf) >= 0.5) {
    mechanismParts.push(
      state.indicators.investorConfidence > beforeConf
        ? 'Confiança dos investidores subiu diante da maior previsibilidade econômica.'
        : 'Investidores reagiram com cautela e exigiram maior prêmio de risco.'
    );
  }
  if (!mechanismParts.length) {
    mechanismParts.push('A medida alterou diretamente indicadores setoriais e expectativas econômicas de médio prazo.');
  }

  state.causalLog.unshift({
    quarter: state.quarter,
    title: `Decisão em ${area || 'Governo'}: ${title}`,
    summary: `Escolha executada: "${optionLabel}".`,
    decisionText: `${title} → ${optionLabel}`,
    mechanism: mechanismParts.join(' '),
    fxReason: `No mercado de câmbio, a combinação de confiança e saldo fiscal ${fxDir}.`,
    externalFactors: `Cenário externo atual: petróleo a US$ ${Math.round(state.externalScenario.oilPrice)} e juros dos EUA em ${state.externalScenario.fedRate.toFixed(2)}%.`,
    futureConsequences: Array.isArray(effects.delayed) && effects.delayed.length
      ? `Efeitos defasados previstos: ${effects.delayed.map(d => `${d.label} (em ${d.delayQuarters} trimestres)`).join('; ')}.`
      : 'Impactos continuarão interagindo com inflação, juros e arrecadação nos próximos períodos.',
    chain: [
      'DECISÃO DO GOVERNO',
      Math.abs(state.indicators.fiscalBalance - beforeFiscal) > 0.05 ? 'IMPACTO FISCAL' : 'AJUSTE SETORIAL',
      'EXPECTATIVAS DOS INVESTIDORES',
      'PRESSÃO CAMBIAL',
      'ALTERAÇÃO DOS INDICADORES'
    ],
    internalContributors: [`Decisão executada no ${formatQuarterLabel(state.quarter, state.startYear)}: ${optionLabel}`],
    externalContributors: [`Petróleo US$ ${Math.round(state.externalScenario.oilPrice)} | Juros EUA ${state.externalScenario.fedRate.toFixed(2)}%`]
  });

  // Generate immediate news item
  state.newsLog.unshift({
    id: `news_dec_${Date.now()}_${state.decisionsLog.length}`,
    quarter: state.quarter,
    dateLabel: formatQuarterLabel(state.quarter, state.startYear),
    category: area || 'Política Econômica',
    scope: 'Nacional',
    headline: `Governo anuncia: ${optionLabel}`,
    summary: mechanismParts.join(' '),
    relatedIndicators: Object.keys(applied).slice(0, 4).map(humanIndicatorName),
    consequences: explanation || 'Analistas acompanham os efeitos nos próximos trimestres.'
  });

  state.nationalEvents = buildNationalEvents(country, state.indicators, state.quarter);
  return applied;
}

/**
 * Advances simulation by one quarter deterministically.
 */
export function advanceQuarter(state) {
  if (state.finished) return state;

  const country = getCountryById(state.countryId);
  state.quarter += 1;

  if (state.quarter > state.config.totalQuarters) {
    state.finished = true;
    return state;
  }

  const ind = state.indicators;
  const before = { ...ind };
  const internalCauses = [];
  const externalCauses = [];

  // 1. Mature delayed effects from earlier decisions
  const dueNow = state.pendingEffects.filter(p => p.dueQuarter === state.quarter);
  state.pendingEffects = state.pendingEffects.filter(p => p.dueQuarter > state.quarter);
  for (const item of dueNow) {
    applyEffectsToState(state, item.effects, { title: `Efeito defasado: ${item.label}` });
    internalCauses.push(`Efeito defasado de "${item.source}": ${item.label}`);
  }

  // 2. Deterministic external macro drift (oil, Fed rate, global tension)
  const noiseA = deterministicFactor(country.id, state.quarter, 1);
  const noiseB = deterministicFactor(country.id, state.quarter, 2);

  state.externalScenario.oilPrice = clamp(state.externalScenario.oilPrice + noiseA * 5.5, 48, 135);
  state.externalScenario.globalTension = clamp(state.externalScenario.globalTension + noiseB * 4.0, 10, 90);
  if (state.quarter % 2 === 0 && Math.abs(noiseA) > 0.22) {
    const fedStep = noiseA > 0 ? 0.25 : -0.25;
    state.externalScenario.fedRate = clamp(state.externalScenario.fedRate + fedStep, 2.0, 6.25);
    externalCauses.push(`Federal Reserve ajustou juros americanos para ${state.externalScenario.fedRate.toFixed(2)}%`);
  }

  // 3. Central Bank Autonomous Reaction Function (Taylor-style rule)
  const cb = country.government.centralBank;
  const targetInflation = country.id === 'AR' ? 12.0 : 3.0;
  if (cb.autonomous || country.id === 'AR') {
    const inflGap = ind.inflation - targetInflation;
    const growthGap = ind.gdpGrowth - 2.2;
    let desiredRate = targetInflation + 2.0 + inflGap * 0.45 + growthGap * 0.2;
    if (country.id === 'JP') desiredRate = clamp(desiredRate * 0.35, 0.1, 4.0);
    if (cb.supranational) {
      // ECB tracks Eurozone baseline (~2.6% inflation) more than France alone
      desiredRate = 3.1 + (ind.inflation - 2.3) * 0.25;
    }
    const maxStep = country.id === 'AR' ? 4.0 : 0.75;
    const rateDelta = clamp(desiredRate - ind.interestRate, -maxStep, maxStep);
    if (Math.abs(rateDelta) >= 0.1) {
      ind.interestRate = round(clamp(ind.interestRate + rateDelta, 0.1, 65), 2);
      recordContributor(state, 'interestRate', `${cb.name} ajustou juros`, rateDelta);
      internalCauses.push(`${cb.name} ${rateDelta > 0 ? 'elevou' : 'reduziu'} a taxa básica para ${ind.interestRate.toFixed(2)}%`);
    }
  }

  // 4. Macroeconomic Interdependencies
  // High real interest rate cools inflation and GDP; boosts FX stability
  const realRate = ind.interestRate - ind.inflation;
  const rateCooling = clamp(realRate * 0.055, -0.35, 0.55);

  // Oil shock impact on inflation & trade
  const oilDeltaFromBase = (state.externalScenario.oilPrice - 78) / 78;
  const oilInflation = oilDeltaFromBase * (country.structuralProfile.commodityExporter ? 0.4 : 0.9);
  if (Math.abs(oilDeltaFromBase) > 0.08) {
    externalCauses.push(`Petróleo internacional em US$ ${Math.round(state.externalScenario.oilPrice)}/barril`);
  }

  // GDP Growth evolves from confidence, infrastructure, education, real interest rate & fiscal impulse
  const infraBoost = (ind.infrastructure - 55) * 0.012;
  const eduBoost = (ind.education - 60) * 0.01;
  const confBoost = (ind.investorConfidence - 55) * 0.02;
  const gdpChange = confBoost + infraBoost + eduBoost - rateCooling * 0.55 + noiseA * 0.18;
  ind.gdpGrowth = round(clamp(ind.gdpGrowth * 0.78 + (2.0 + gdpChange) * 0.22, -9, 10), 2);
  recordContributor(state, 'gdpGrowth', 'Dinâmica macroeconômica trimestral', ind.gdpGrowth - before.gdpGrowth);

  // Okun's law: GDP growth drives unemployment & job creation
  const okunDelta = -(ind.gdpGrowth - 2.0) * 0.14;
  ind.unemployment = round(clamp(ind.unemployment + okunDelta, 1.8, 30), 2);
  ind.jobCreation = round(clamp(ind.jobCreation + (ind.gdpGrowth - 1.5) * 1.1, 10, 98), 1);
  recordContributor(state, 'unemployment', 'Resposta do mercado de trabalho ao PIB', ind.unemployment - before.unemployment);

  // Inflation dynamics (inertia + demand + oil + FX pass-through)
  const demandPull = Math.max(0, ind.gdpGrowth - 3.0) * 0.22;
  const inflStep = -rateCooling * 0.45 + demandPull + oilInflation * 0.35 + noiseB * 0.12;
  const inflDecay = country.id === 'AR' && ind.fiscalBalance >= 0 ? -ind.inflation * 0.08 : 0;
  ind.inflation = round(clamp(ind.inflation + inflStep + inflDecay, 0.2, 220), 2);
  recordContributor(state, 'inflation', 'Inércia, juros reais e oferta global', ind.inflation - before.inflation);

  // Fiscal balance & public debt compounding
  const growthTaxRevenue = (ind.gdpGrowth - 1.8) * 0.12;
  const debtInterestCost = (ind.publicDebt * Math.max(0.5, ind.interestRate) * 0.00045);
  ind.fiscalBalance = round(clamp(ind.fiscalBalance + growthTaxRevenue - debtInterestCost * 0.25, -18, 8), 2);
  ind.publicDebt = round(clamp(ind.publicDebt - ind.fiscalBalance * 0.22 - ind.gdpGrowth * 0.18, 10, 320), 1);

  // Country Risk & Investor Confidence
  const riskPressure = (-ind.fiscalBalance - 3.0) * 12 + (ind.publicDebt - 80) * 0.6 - (ind.politicalStability - 55) * 1.5;
  ind.countryRisk = Math.round(clamp(ind.countryRisk * 0.8 + (country.initialIndicators.countryRisk + riskPressure) * 0.2, 20, 3500));
  const confDrift = (ind.politicalStability - 52) * 0.06 + (ind.fiscalBalance + 3.0) * 0.35 - Math.max(0, ind.inflation - 6) * 0.15;
  ind.investorConfidence = round(clamp(ind.investorConfidence + confDrift, 5, 98), 1);

  // Exchange Rate equilibrium movement (interest differential vs Fed + risk + trade + inflation differential)
  const interestDiff = (ind.interestRate - state.externalScenario.fedRate) * 0.0025;
  const inflDiff = (ind.inflation - 2.8) * 0.0018;
  const confFactor = (55 - ind.investorConfidence) * 0.0008;
  const tradeFactor = -(ind.tradeBalance / 300) * 0.004;
  let fxDrift = inflDiff + confFactor + tradeFactor - interestDiff + (state.externalScenario.globalTension - 30) * 0.00025;
  if (country.id === 'US') fxDrift = -fxDrift * 0.5;
  fxDrift = clamp(fxDrift, -0.055, 0.065);

  ind.exchangeRate = round(clamp(ind.exchangeRate * (1 + fxDrift), country.initialIndicators.exchangeRate * 0.55, country.initialIndicators.exchangeRate * 2.8), country.currency.decimals);
  recordContributor(state, 'exchangeRate', 'Fluxo de capitais, diferencial de juros e inflação', ind.exchangeRate - before.exchangeRate);
  updateFxBounds(state);

  // Social & Popular Approval synthesis
  const purchasingDelta = (ind.gdpGrowth * 0.35) - Math.max(0, ind.inflation - 4.0) * 0.28 - (ind.unemployment - 5.0) * 0.12;
  ind.purchasingPower = round(clamp(ind.purchasingPower + purchasingDelta, 10, 99), 1);
  ind.qualityOfLife = round(clamp((ind.education * 0.28 + ind.health * 0.28 + ind.security * 0.22 + ind.purchasingPower * 0.22), 20, 99), 1);
  ind.poverty = round(clamp(ind.poverty - (ind.gdpGrowth - 1.5) * 0.22 + Math.max(0, ind.inflation - 6) * 0.08, 2, 75), 1);

  const approvalTarget = clamp(
    45 +
    (ind.purchasingPower - 55) * 0.42 +
    (ind.gdpGrowth - 1.5) * 2.2 -
    Math.max(0, ind.inflation - 4.5) * 0.8 -
    Math.max(0, ind.unemployment - 6.0) * 1.4 +
    (ind.health + ind.education + ind.security - 170) * 0.12,
    10,
    92
  );
  ind.approval = round(ind.approval * 0.72 + approvalTarget * 0.28, 1);
  recordContributor(state, 'approval', 'Percepção popular de custo de vida, emprego e serviços', ind.approval - before.approval);

  // Parliamentary support moves slowly toward approval & stability
  ind.parliamentSupport = round(clamp(ind.parliamentSupport * 0.86 + (ind.approval * 0.7 + ind.politicalStability * 0.3) * 0.14, 10, 92), 1);

  // 5. Intelligent Event System (Historical in historical mode or key turns + Contextual triggers)
  state.activeEvent = pickNextEvent(state);
  if (state.activeEvent) {
    const ev = state.activeEvent;
    state.recentEventIds.push(ev.id);
    if (state.recentEventIds.length > 4) state.recentEventIds.shift();
    if (ev.isHistorical) state.usedHistoricalIds.push(ev.id);

    if (ev.externalShocks) {
      if (ev.externalShocks.oilPriceDelta) state.externalScenario.oilPrice = clamp(state.externalScenario.oilPrice + ev.externalShocks.oilPriceDelta, 40, 145);
      if (ev.externalShocks.fedRateDelta) state.externalScenario.fedRate = clamp(state.externalScenario.fedRate + ev.externalShocks.fedRateDelta, 0.5, 6.75);
      if (ev.externalShocks.globalTension) state.externalScenario.globalTension = clamp(state.externalScenario.globalTension + ev.externalShocks.globalTension, 10, 98);
      applyEffectsToState(state, {
        investorConfidence: ev.externalShocks.investorConfidenceDelta || 0,
        foreignInvestment: ev.externalShocks.foreignInvestmentDelta || 0,
        gdpGrowth: ev.externalShocks.gdpGrowthDelta || 0,
        tradeBalance: ev.externalShocks.tradeBalanceDelta || 0,
        inflation: ev.externalShocks.inflationDelta || 0,
        health: ev.externalShocks.healthDelta || 0,
        unemployment: ev.externalShocks.unemploymentDelta || 0,
        purchasingPower: ev.externalShocks.purchasingPowerDelta || 0,
        politicalStability: ev.externalShocks.politicalStabilityDelta || 0,
        reserves: ev.externalShocks.reservesDelta || 0,
        jobCreation: ev.externalShocks.jobCreationDelta || 0,
        infrastructure: ev.externalShocks.infrastructureDelta || 0,
        approval: ev.externalShocks.approvalDelta || 0,
        countryRiskDelta: ev.externalShocks.countryRiskDelta || 0,
        fxPressure: ev.externalShocks.fxPressure || 0
      }, { title: ev.title });
    }

    externalCauses.push(`${ev.isHistorical ? '[Evento Histórico]' : '[Evento]'} ${ev.title}`);
    state.crisisAlert = {
      title: ev.title,
      severity: ev.severity,
      isHistorical: ev.isHistorical,
      coords: ev.affectedRegionCoords || null
    };

    state.newsLog.unshift({
      id: `news_ev_${state.quarter}_${ev.id}`,
      quarter: state.quarter,
      dateLabel: formatQuarterLabel(state.quarter, state.startYear),
      category: ev.category,
      scope: ev.isHistorical || ev.affectedRegionCoords ? 'Internacional' : 'Nacional',
      headline: ev.title,
      summary: ev.summary,
      relatedIndicators: ['Câmbio', 'PIB', 'Confiança', 'Aprovação'],
      consequences: ev.isHistorical ? ev.historicalRef : 'Exige posicionamento imediato do governo.'
    });
  } else {
    state.crisisAlert = null;
  }

  // 6. Pick next dilemma if none active
  if (!state.activeDilemma) {
    state.activeDilemma = pickNextDilemma(state);
  }

  // 7. Quarterly News coherent with real indicator shifts
  const fxDelta = ind.exchangeRate - before.exchangeRate;
  const fxPct = (fxDelta / before.exchangeRate) * 100;
  let autoHeadline = `Economia fecha ${formatQuarterLabel(state.quarter, state.startYear)} com PIB em ${ind.gdpGrowth.toFixed(1)}%`;
  let autoCat = 'Economia';
  if (Math.abs(fxPct) >= 1.2) {
    autoHeadline = fxDelta > 0
      ? `Dólar avança ${fxPct.toFixed(1)}% e pressiona preços domésticos em ${country.name}`
      : `Moeda nacional se fortalece ${Math.abs(fxPct).toFixed(1)}% com melhora de confiança e fluxo externo`;
    autoCat = 'Câmbio';
  } else if (ind.approval < 43) {
    autoHeadline = `Desgaste social leva manifestações às ruas e pressiona agenda de ${country.capital}`;
    autoCat = 'Situação Social';
  } else if (ind.tradeBalance > before.tradeBalance + 3) {
    autoHeadline = `Exportações crescem e reforçam entrada de divisas no país`;
    autoCat = 'Comércio Exterior';
  }

  state.newsLog.unshift({
    id: `news_q_${state.quarter}`,
    quarter: state.quarter,
    dateLabel: formatQuarterLabel(state.quarter, state.startYear),
    category: autoCat,
    scope: 'Nacional',
    headline: autoHeadline,
    summary: `Inflação anual em ${ind.inflation.toFixed(1)}%, juros em ${ind.interestRate.toFixed(2)}% e aprovação popular em ${Math.round(ind.approval)}%.`,
    relatedIndicators: ['Câmbio', 'Inflação', 'PIB', 'Aprovação Popular'],
    consequences: ind.fiscalBalance < -3.5
      ? 'Déficit fiscal elevado mantém atenção redobrada dos investidores.'
      : 'Equilíbrio das contas favorece estabilidade nos próximos períodos.'
  });

  // 8. Record Causal Log for "POR QUE ISSO ACONTECEU?"
  const fxSummary = country.id === 'US'
    ? (fxDelta >= 0 ? `Dólar ganhou força frente ao euro (+${fxPct.toFixed(2)}%).` : `Dólar cedeu ${Math.abs(fxPct).toFixed(2)}% frente ao euro.`)
    : (fxDelta > 0 ? `Dólar subiu ${fxPct.toFixed(2)}% (de ${before.exchangeRate.toFixed(country.currency.decimals)} para ${ind.exchangeRate.toFixed(country.currency.decimals)}).`
      : fxDelta < 0 ? `Moeda local valorizou ${Math.abs(fxPct).toFixed(2)}% (dólar caiu para ${ind.exchangeRate.toFixed(country.currency.decimals)}).`
      : 'Câmbio permaneceu praticamente estável.');

  state.causalLog.unshift({
    quarter: state.quarter,
    title: `Balanço de ${formatQuarterLabel(state.quarter, state.startYear)}`,
    summary: state.activeEvent
      ? `Período marcado por: ${state.activeEvent.title}.`
      : `Avanço trimestral com ajustes macroeconômicos e reação monetária de ${cb.name}.`,
    decisionText: internalCauses.length ? internalCauses.join(' | ') : 'Sem novas decisões imediatas neste avanço; atuaram inércia e políticas anteriores.',
    mechanism: `Juro real de ${(ind.interestRate - ind.inflation).toFixed(1)}%, saldo fiscal de ${ind.fiscalBalance.toFixed(1)}% do PIB e confiança em ${Math.round(ind.investorConfidence)}/100.`,
    fxReason: fxSummary,
    externalFactors: externalCauses.length ? externalCauses.join(' | ') : `Cenário externo moderado (Petróleo US$ ${Math.round(state.externalScenario.oilPrice)}, Juros EUA ${state.externalScenario.fedRate.toFixed(2)}%).`,
    futureConsequences: state.pendingEffects.length
      ? `Há ${state.pendingEffects.length} efeito(s) defasado(s) programado(s) para os próximos trimestres.`
      : 'Mantenha atenção à inflação acumulada e à aprovação popular.',
    chain: [
      internalCauses.length ? 'POLÍTICAS E DEFASAGENS' : 'CENÁRIO ANTERIOR',
      'REAÇÃO MONETÁRIA E FISCAL',
      'FLUXO DE CAPITAIS',
      'TAXA DE CÂMBIO',
      'INFLAÇÃO, EMPREGO E APROVAÇÃO'
    ],
    internalContributors: internalCauses.length ? internalCauses : ['Continuidade das políticas em vigor'],
    externalContributors: externalCauses.length ? externalCauses : [`Petróleo US$ ${Math.round(state.externalScenario.oilPrice)} e juros americanos em ${state.externalScenario.fedRate.toFixed(2)}%`]
  });

  // 9. Snapshot History & Regions
  state.nationalEvents = buildNationalEvents(country, ind, state.quarter);
  state.history.push({
    quarter: state.quarter,
    label: formatQuarterLabel(state.quarter, state.startYear),
    indicators: { ...ind },
    drivers: [...internalCauses, ...externalCauses]
  });

  // Keep news & causal logs bounded for fast storage
  if (state.newsLog.length > 60) state.newsLog.length = 60;
  if (state.causalLog.length > 40) state.causalLog.length = 40;

  return state;
}

function pickNextDilemma(state) {
  const candidates = DILEMMAS.filter(d => !state.usedDilemmaIds.includes(d.id) && d.triggerCondition(state));
  if (candidates.length > 0) return candidates[0];
  // Recycle older dilemmas only if all have been answered in long campaigns
  const fallback = DILEMMAS.filter(d => d.triggerCondition(state));
  if (fallback.length > 0) {
    return fallback[(state.quarter - 1) % fallback.length];
  }
  return DILEMMAS[0];
}

function pickNextEvent(state) {
  // Historical mode triggers real historical shocks at milestone quarters
  if (state.config.mode === 'historica') {
    if (state.quarter === 3 && !state.usedHistoricalIds.includes('hist_2008')) return HISTORICAL_EVENTS[0];
    if (state.quarter === 6 && !state.usedHistoricalIds.includes('hist_2022_energy')) return HISTORICAL_EVENTS[2];
    if (state.quarter === 9 && !state.usedHistoricalIds.includes('hist_2020')) return HISTORICAL_EVENTS[1];
  } else {
    // In guided/free modes, historical shock can still occur deterministically on key quarters
    if (state.quarter === 5 && !state.usedHistoricalIds.includes('hist_2022_energy')) return HISTORICAL_EVENTS[2];
    if (state.quarter === 10 && !state.usedHistoricalIds.includes('hist_2008')) return HISTORICAL_EVENTS[0];
  }

  const contextual = CONTEXTUAL_EVENTS.find(e => e.condition(state));
  return contextual || null;
}

export function humanIndicatorName(key) {
  const map = {
    exchangeRate: 'Cotação do Dólar',
    inflation: 'Inflação',
    interestRate: 'Taxa de Juros',
    gdpGrowth: 'Crescimento do PIB',
    unemployment: 'Desemprego',
    publicDebt: 'Dívida Pública',
    fiscalBalance: 'Saldo Fiscal',
    tradeBalance: 'Balança Comercial',
    reserves: 'Reservas Internacionais',
    investorConfidence: 'Confiança dos Investidores',
    foreignInvestment: 'Investimento Estrangeiro',
    purchasingPower: 'Poder de Compra',
    approval: 'Aprovação Popular',
    education: 'Educação',
    health: 'Saúde',
    inequality: 'Desigualdade',
    poverty: 'Pobreza',
    qualityOfLife: 'Qualidade de Vida',
    jobCreation: 'Geração de Empregos',
    security: 'Segurança',
    infrastructure: 'Infraestrutura',
    parliamentSupport: 'Apoio Parlamentar',
    politicalStability: 'Estabilidade Política',
    countryRisk: 'Risco-País'
  };
  return map[key] || key;
}
