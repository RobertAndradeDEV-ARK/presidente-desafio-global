import { getCountryById } from '../data/countries.js';
import { createInitialState, executeDecision, advanceQuarter } from '../engine/economicEngine.js';
import { parsePresidentialCommand } from '../engine/commandParser.js';
import { buildLegacyReport } from '../engine/legacyEngine.js';
import { saveGame, loadGame, clearSavedGame } from '../engine/storage.js';
import { EarthScene } from '../three/EarthScene.js';
import { GlobeSelectorScene } from '../three/GlobeSelectorScene.js';
import { CommandCenterScene } from '../three/CommandCenterScene.js';
import { CountrySelectView } from '../ui/CountrySelectView.js';
import { AcademyView } from '../ui/AcademyView.js';
import { CommandCenterView, MENU_SECTIONS } from '../ui/CommandCenterView.js';
import { LegacyView } from '../ui/LegacyView.js';
import { COUNTRIES } from '../data/countries.js';

const results = [];
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function runTest(name, fn) {
  try {
    fn();
    results.push({ name, pass: true });
  } catch (err) {
    results.push({ name, pass: false, error: err.message });
  }
}

// Teste 1 — Seleção de país (Brasil vs Japão vs França)
runTest('Teste 1 — Seleção de país e precisão institucional', () => {
  const br = getCountryById('BR');
  const jp = getCountryById('JP');
  const fr = getCountryById('FR');
  assert(br.currency.code === 'BRL' && br.government.headOfGovernmentTitle.includes('Presidente'), 'Brasil inválido');
  assert(jp.currency.code === 'JPY' && jp.government.headOfGovernmentTitle.includes('Primeiro-Ministro'), 'Japão inválido');
  assert(fr.government.centralBank.supranational === true, 'BCE supranacional na França inválido');

  const stBr = createInitialState('BR');
  const stJp = createInitialState('JP');
  assert(stBr.indicators.exchangeRate !== stJp.indicators.exchangeRate, 'Câmbio deve mudar entre países');
  assert(stBr.config.totalQuarters === 16 && stJp.config.totalQuarters === 16, 'Mandato padrão incorreto');
});

// Teste 2 — Decisões e persistência de efeitos nos períodos seguintes
runTest('Teste 2 — Decisões alteram indicadores e permanecem após avançar período', () => {
  const st = createInitialState('BR', { totalQuarters: 8 });
  const beforeEdu = st.indicators.education;
  const beforeFiscal = st.indicators.fiscalBalance;
  executeDecision(st, {
    kind: 'Dilema',
    sourceId: 'education_reform',
    area: 'Educação',
    title: 'Reforma Educacional',
    optionLabel: 'Plano amplo',
    effects: {
      fiscalBalance: -0.65,
      education: 5.5,
      delayed: [{ delayQuarters: 2, label: 'Produtividade', effects: { gdpGrowth: 0.45 } }]
    }
  });
  assert(st.indicators.education > beforeEdu, 'Educação não subiu');
  assert(st.indicators.fiscalBalance < beforeFiscal, 'Saldo fiscal não refletiu gasto');
  assert(st.pendingEffects.length === 1, 'Efeito defasado não agendado');

  advanceQuarter(st);
  assert(st.indicators.education > beforeEdu, 'Ganho educacional não permaneceu no T2');
  advanceQuarter(st);
  assert(st.pendingEffects.length === 0, 'Efeito defasado deveria ter maturado no T3');
});

// Teste 3 — Explicações ("Por que isso aconteceu?")
runTest('Teste 3 — Botão explicativo registra decisão e cadeia causal real', () => {
  const st = createInitialState('MX');
  executeDecision(st, {
    kind: 'Ministério',
    sourceId: 'spending_audit',
    area: 'Gastos',
    title: 'Auditoria de Eficiência',
    optionLabel: 'Corte de desperdícios',
    effects: { fiscalBalance: 0.5, investorConfidence: 3.0 }
  });
  const latest = st.causalLog[0];
  assert(latest.title.includes('Auditoria de Eficiência'), 'CausalLog não registrou decisão');
  assert(Array.isArray(latest.chain) && latest.chain.length >= 4, 'Cadeia causal ausente');
});

// Teste 4 — Eventos externos
runTest('Teste 4 — Eventos externos afetam o país sem decisão direta', () => {
  const st = createInitialState('BR', { mode: 'historica', totalQuarters: 12 });
  const initGdp = st.indicators.gdpGrowth;
  advanceQuarter(st); // T2
  advanceQuarter(st); // T3 -> triggers hist_2008
  assert(st.activeEvent && st.activeEvent.id === 'hist_2008', 'Evento histórico de 2008 não disparou no T3');
  assert(st.activeEvent.isHistorical === true, 'Evento deve ser marcado como histórico');
  assert(st.indicators.gdpGrowth < initGdp, 'Choque externo deveria reduzir PIB');
});

// Teste 5 & 6 — Comando Presidencial por texto (e ambiguidade / limite institucional) + hook de voz
runTest('Teste 5 & 6 — Comando por texto, ambiguidade, limite institucional e execução', () => {
  const st = createInitialState('BR');
  const ambig = parsePresidentialCommand('impostos', st);
  assert(ambig.status === 'ambiguous', 'Comando ambíguo deveria pedir esclarecimento');

  const restr = parsePresidentialCommand('Quero baixar a taxa de juros agora', st);
  assert(restr.status === 'restricted', 'Ordem de baixar juros no BCB autônomo deveria sinalizar limite');

  const valid = parsePresidentialCommand('Quero reduzir os impostos sobre pequenas empresas', st);
  assert(valid.status === 'ready', 'Comando válido deveria gerar proposta pronta');

  const beforeJob = st.indicators.jobCreation;
  executeDecision(st, {
    kind: 'Comando Presidencial',
    area: valid.area,
    title: valid.title,
    optionLabel: valid.optionLabel,
    effects: valid.effects
  });
  assert(st.indicators.jobCreation > beforeJob, 'Comando confirmado não alterou simulação');
});

// Teste 7 — Passagem do tempo e determinismo
runTest('Teste 7 — Passagem do tempo determinística atualiza indicadores, notícias e histórico', () => {
  const a = createInitialState('JP', { totalQuarters: 8 });
  const b = createInitialState('JP', { totalQuarters: 8 });
  advanceQuarter(a);
  advanceQuarter(b);
  assert(a.quarter === 2 && a.history.length === 2, 'Trimestre e histórico não avançaram');
  assert(a.indicators.exchangeRate === b.indicators.exchangeRate, 'Motor deve ser determinístico');
  assert(a.newsLog.length > 2, 'Notícias não foram atualizadas');
});

// Teste 8 — Salvamento e restauração
runTest('Teste 8 — Salvamento automático e restauração no localStorage', () => {
  clearSavedGame();
  const st = createInitialState('FR', { totalQuarters: 8 });
  advanceQuarter(st);
  const ok = saveGame(st);
  assert(ok, 'saveGame retornou false');
  const loaded = loadGame();
  assert(loaded && loaded.state.countryId === 'FR' && loaded.state.quarter === 2, 'Restauração falhou');
  clearSavedGame();
});

// Teste 9 — Final da campanha & Relatório de Legado real
runTest('Teste 9 — Final da campanha gera Legado baseado nos dados da partida', () => {
  const st = createInitialState('BR', { totalQuarters: 4 });
  executeDecision(st, {
    kind: 'Dilema',
    area: 'Educação',
    title: 'Plano Educacional',
    optionLabel: 'Investir',
    effects: { education: 8.0, health: 4.0, fiscalBalance: -0.4 }
  });
  while (!st.finished) advanceQuarter(st);
  const report = buildLegacyReport(st);
  assert(report.country.id === 'BR', 'Relatório de país incorreto');
  assert(report.society.eduDelta > 0, 'Relatório não refletiu avanço educacional real');
  assert(report.achievements.length > 0 && report.mistakes.length > 0, 'Relatório incompleto');
});

// Teste 10 — Experiência 3D e fallback
runTest('Teste 10 — Inicialização das cenas 3D e Modo Leve', () => {
  const stage = document.getElementById('test-stage');
  const earth = new EarthScene(stage, { liteMode: false });
  earth.dispose();
  const globe = new GlobeSelectorScene(stage, COUNTRIES, { liteMode: false });
  globe.focusCountry('JP');
  globe.dispose();
  const cmd = new CommandCenterScene(stage, getCountryById('BR'), { liteMode: false });
  cmd.updateTelemetry(createInitialState('BR'));
  cmd.dispose();
  const lite = new EarthScene(stage, { liteMode: true });
  lite.dispose();
  assert(true, 'Cenas 3D montadas');
});

// Teste 11 — Fluxo completo de UI (Seleção -> Academia -> Centro de Comando 17 seções -> Explicador -> Comando -> Legado)
runTest('Teste 11 — Fluxo completo de UI interativa no DOM', () => {
  const stage = document.getElementById('test-stage');
  const prefs = { liteMode: false, reducedMotion: true, animSpeed: 1 };

  // Academy
  const acad = new AcademyView(stage, () => {});
  acad.render();
  assert(stage.textContent.includes('APRENDER SOBRE ECONOMIA'), 'Academia não renderizou');
  stage.querySelector('#btnShowQuiz').click();
  assert(stage.textContent.includes('Teste Rápido'), 'Quiz não abriu');

  // Country Select
  let launchedState = null;
  const csel = new CountrySelectView(stage, prefs, {
    onBack: () => {},
    onStartCampaign: (cid, cfg) => { launchedState = createInitialState(cid, cfg); }
  });
  csel.mount();
  stage.querySelector('[data-cid="JP"]').click();
  assert(stage.textContent.includes('Primeiro-Ministro do Japão'), 'Seleção do Japão não atualizou dossiê');
  stage.querySelector('#btnAssumeGovernment').click();
  assert(launchedState && launchedState.countryId === 'JP', 'Assumir governo não iniciou partida');

  // Command Center across all 17 sections + modals
  const cmd = new CommandCenterView(stage, launchedState, prefs, {
    onStateChange: () => {},
    onFinishCampaign: () => {},
    onOpenAcademy: () => {},
    onExitToHome: () => {},
    onTogglePrefs: () => {}
  });
  cmd.mount();
  assert(stage.querySelectorAll('.nav-item').length === 17, 'Faltam seções no menu principal');
  for (const sec of MENU_SECTIONS) {
    stage.querySelector(`[data-section="${sec.id}"]`).click();
    assert(stage.querySelector('.workspace-main').textContent.length > 50, `Seção ${sec.id} vazia`);
  }
  stage.querySelector('#btnWhyHappened').click();
  assert(stage.textContent.includes('POR QUE ISSO ACONTECEU?'), 'Modal explicativo não abriu');
  stage.querySelector('#btnOpenCommand').click();
  assert(stage.textContent.includes('COMANDO PRESIDENCIAL'), 'Modal de Comando não abriu');
  cmd.dispose();

  // Legacy
  while (!launchedState.finished) advanceQuarter(launchedState);
  const leg = new LegacyView(stage, launchedState, { onNewGame: () => {}, onReviveTimeline: () => {} });
  leg.render();
  assert(stage.textContent.includes('SEU LEGADO'), 'Relatório de legado não renderizou');
});

const passed = results.filter(r => r.pass).length;
const out = document.getElementById('test-output');
out.textContent = JSON.stringify({ total: results.length, passed, failed: results.length - passed, results }, null, 2);
document.title = passed === results.length ? 'ALL_TESTS_PASSED' : 'TESTS_FAILED';
