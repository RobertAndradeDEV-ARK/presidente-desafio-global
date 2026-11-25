import { getCountryById } from '../data/countries.js';
import { formatQuarterLabel } from './economicEngine.js';

/**
 * Generates balanced end-of-term Legacy Report computed strictly from actual campaign data.
 */
export function buildLegacyReport(state) {
  const country = getCountryById(state.countryId);
  const init = state.initialIndicators;
  const fin = state.indicators;
  const hist = state.history || [];

  const avg = (key) => {
    if (!hist.length) return fin[key];
    return hist.reduce((acc, h) => acc + h.indicators[key], 0) / hist.length;
  };

  // Economy deltas
  const fxStart = init.exchangeRate;
  const fxEnd = fin.exchangeRate;
  const fxChangePct = ((fxEnd - fxStart) / fxStart) * 100;
  const avgInflation = avg('inflation');
  const avgGdp = avg('gdpGrowth');
  const unempDelta = fin.unemployment - init.unemployment;
  const debtDelta = fin.publicDebt - init.publicDebt;

  // Social deltas
  const eduDelta = fin.education - init.education;
  const healthDelta = fin.health - init.health;
  const povertyDelta = fin.poverty - init.poverty;
  const ineqDelta = fin.inequality - init.inequality;
  const qolDelta = fin.qualityOfLife - init.qualityOfLife;

  // Balanced multi-pillar score (0-100), explicitly NOT judging by exchange rate alone!
  const econScore =
    50 +
    (avgGdp - 1.5) * 6 +
    (init.inflation - fin.inflation) * (country.id === 'AR' ? 0.35 : 2.2) -
    unempDelta * 3.0 -
    Math.max(0, debtDelta - 5) * 0.7 +
    (fin.investorConfidence - init.investorConfidence) * 0.4;

  const socialScore =
    50 +
    eduDelta * 2.2 +
    healthDelta * 2.2 -
    povertyDelta * 2.4 -
    ineqDelta * 2.0 +
    qolDelta * 2.0;

  const politicalScore =
    50 +
    (fin.approval - 45) * 0.7 +
    (fin.politicalStability - 50) * 0.6 +
    (fin.parliamentSupport - 45) * 0.4;

  const overallScore = Math.max(0, Math.min(100, (econScore * 0.38 + socialScore * 0.38 + politicalScore * 0.24)));

  let classification = 'Governo Equilibrado';
  let classificationDesc = 'Conduziu o país com estabilidade razoável, alternando avanços importantes e desafios estruturais.';
  if (overallScore >= 68) {
    classification = 'Governo de Destaque';
    classificationDesc = 'Alcançou sólida combinação de progresso social, credibilidade econômica e estabilidade institucional.';
  } else if (overallScore < 42) {
    classification = 'Governo em Crise';
    classificationDesc = 'Enfrentou severa deterioração econômica, social ou de governabilidade ao final do mandato.';
  } else if (overallScore < 54) {
    classification = 'Governo com Dificuldades';
    classificationDesc = 'Registrou desequilíbrios relevantes em indicadores-chave apesar de tentativas de resposta.';
  }

  // Compute real achievements and mistakes from actual indicator changes & decisions
  const achievements = [];
  const mistakes = [];

  if (eduDelta > 1.5) achievements.push(`Avanço expressivo na Educação (+${eduDelta.toFixed(1)} pontos no índice educacional).`);
  if (healthDelta > 1.5) achievements.push(`Fortalecimento da Saúde pública (+${healthDelta.toFixed(1)} pontos).`);
  if (povertyDelta < -0.5) achievements.push(`Redução da pobreza em ${Math.abs(povertyDelta).toFixed(1)} pontos percentuais.`);
  if (unempDelta < -0.3) achievements.push(`Queda do desemprego de ${init.unemployment.toFixed(1)}% para ${fin.unemployment.toFixed(1)}%.`);
  if (fin.fiscalBalance > init.fiscalBalance + 0.4) achievements.push(`Melhora das contas públicas (saldo fiscal de ${init.fiscalBalance.toFixed(1)}% para ${fin.fiscalBalance.toFixed(1)}% do PIB).`);
  if (fin.tradeBalance > init.tradeBalance + 5) achievements.push(`Expansão da balança comercial (+US$ ${(fin.tradeBalance - init.tradeBalance).toFixed(1)} bi).`);
  if (fin.investorConfidence > init.investorConfidence + 3) achievements.push(`Elevação da confiança dos investidores (${Math.round(init.investorConfidence)} → ${Math.round(fin.investorConfidence)}).`);
  if (fin.infrastructure > init.infrastructure + 2) achievements.push(`Modernização da infraestrutura (+${(fin.infrastructure - init.infrastructure).toFixed(1)} pontos).`);

  if (fin.inflation > init.inflation + 1.5) mistakes.push(`Pressão inflacionária elevada durante o mandato (${init.inflation.toFixed(1)}% → ${fin.inflation.toFixed(1)}%).`);
  if (debtDelta > 5) mistakes.push(`Crescimento expressivo da dívida pública (+${debtDelta.toFixed(1)} p.p. do PIB).`);
  if (unempDelta > 0.5) mistakes.push(`Aumento do desemprego (+${unempDelta.toFixed(1)} p.p.), afetando renda das famílias.`);
  if (fin.approval < 40) mistakes.push(`Desgaste na aprovação popular, encerrando em ${Math.round(fin.approval)}%.`);
  if (fin.investorConfidence < init.investorConfidence - 4) mistakes.push(`Perda de confiança dos mercados (${Math.round(init.investorConfidence)} → ${Math.round(fin.investorConfidence)}).`);
  if (healthDelta < -0.5 || eduDelta < -0.5) mistakes.push(`Defasagem em serviços essenciais (Saúde/Educação) durante ajustes fiscais.`);
  if (fin.security < init.security - 1) mistakes.push(`Recuo nos indicadores de segurança pública.`);
  if (povertyDelta > 0.5) mistakes.push(`Aumento da pobreza (+${povertyDelta.toFixed(1)} p.p.).`);

  // Ensure up to 5 items grounded in actual state
  if (achievements.length === 0) achievements.push('Manutenção da continuidade institucional durante todo o mandato.');
  if (mistakes.length === 0) mistakes.push('Margem de manobra limitada impediu avanços ainda maiores em produtividade.');

  const externalShocksList = state.usedHistoricalIds.length || state.recentEventIds.length
    ? state.causalLog
        .filter(c => c.externalContributors && c.externalContributors.some(e => e.includes('Evento')))
        .map(c => c.summary)
        .slice(0, 5)
    : [`Oscilação internacional de juros americanos (até ${state.externalScenario.fedRate.toFixed(2)}%) e petróleo (US$ ${Math.round(state.externalScenario.oilPrice)}).`];

  const treatiesCount = state.diplomacy.reduce((acc, p) => acc + (p.treaties?.length || 0), 0);

  return {
    country,
    overallScore: Math.round(overallScore),
    classification,
    classificationDesc,
    economy: {
      fxStart,
      fxEnd,
      fxChangePct,
      fxMin: state.fxStats.minRate,
      fxMinLabel: formatQuarterLabel(state.fxStats.minQuarter, state.startYear),
      fxMax: state.fxStats.maxRate,
      fxMaxLabel: formatQuarterLabel(state.fxStats.maxQuarter, state.startYear),
      avgInflation,
      avgGdp,
      unempStart: init.unemployment,
      unempEnd: fin.unemployment,
      debtStart: init.publicDebt,
      debtEnd: fin.publicDebt,
      tradeStart: init.tradeBalance,
      tradeEnd: fin.tradeBalance,
      fdiEnd: fin.foreignInvestment
    },
    society: {
      education: fin.education,
      eduDelta,
      health: fin.health,
      healthDelta,
      poverty: fin.poverty,
      povertyDelta,
      inequality: fin.inequality,
      ineqDelta,
      qualityOfLife: fin.qualityOfLife,
      qolDelta,
      approval: fin.approval
    },
    politics: {
      parliamentSupport: fin.parliamentSupport,
      politicalStability: fin.politicalStability,
      totalDecisions: state.decisionsLog.length,
      treatiesCount
    },
    achievements: achievements.slice(0, 5),
    mistakes: mistakes.slice(0, 5),
    keyDecisions: state.decisionsLog.slice(0, 6),
    externalShocks: externalShocksList
  };
}
