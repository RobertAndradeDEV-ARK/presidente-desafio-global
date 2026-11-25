import { getCountryById } from '../data/countries.js';
import { MINISTRY_ACTIONS } from '../data/decisions.js';
import { DIPLOMATIC_ACTIONS } from '../data/diplomacy.js';
import {
  advanceQuarter,
  executeDecision,
  applyEffectsToState,
  formatQuarterLabel
} from '../engine/economicEngine.js';
import { parsePresidentialCommand } from '../engine/commandParser.js';
import { CommandCenterScene } from '../three/CommandCenterScene.js';
import {
  renderFlagSvg,
  renderLineChartSvg,
  renderTerritoryMapSvg,
  renderWorldDiplomacySvg,
  renderIndicatorModal,
  renderExplainerModal
} from './components.js';

export const MENU_SECTIONS = [
  { id: 'economia', label: '1. Economia' },
  { id: 'cambio', label: '2. Valor do dólar e câmbio' },
  { id: 'politica', label: '3. Política interna' },
  { id: 'educacao', label: '4. Educação' },
  { id: 'saude', label: '5. Saúde' },
  { id: 'infraestrutura', label: '6. Infraestrutura' },
  { id: 'seguranca', label: '7. Segurança' },
  { id: 'comercio', label: '8. Comércio internacional' },
  { id: 'relacoes', label: '9. Relações internacionais' },
  { id: 'impostos', label: '10. Impostos' },
  { id: 'gastos', label: '11. Gastos públicos' },
  { id: 'meio_ambiente', label: '12. Meio ambiente' },
  { id: 'energia', label: '13. Energia' },
  { id: 'defesa', label: '14. Defesa' },
  { id: 'noticias', label: '15. Notícias' },
  { id: 'social', label: '16. Situação social' },
  { id: 'historico', label: '17. Histórico de decisões' }
];

export class CommandCenterView {
  constructor(root, state, prefs, callbacks) {
    this.root = root;
    this.state = state;
    this.prefs = prefs;
    this.onStateChange = callbacks.onStateChange;
    this.onFinishCampaign = callbacks.onFinishCampaign;
    this.onOpenAcademy = callbacks.onOpenAcademy;
    this.onExitToHome = callbacks.onExitToHome;
    this.onTogglePrefs = callbacks.onTogglePrefs;

    this.activeSection = 'economia';
    this.modal = null; // { type: 'indicator' | 'explainer' | 'command', key? }
    this.commandInput = '';
    this.commandResult = null;
    this.voiceStatus = '';
    this.isListening = false;
    this.toastMessage = null;

    // Time transition state
    this.transitioning = false;
    this.transitionPaused = false;
    this.transitionTimer = null;
    this.transitionProgress = 0;
    this.scene3d = null;
  }

  mount() {
    const country = getCountryById(this.state.countryId);
    this.root.innerHTML = `
      <div class="scene-bg" id="command3dBg" aria-hidden="true"></div>
      <div class="command-shell" id="commandShell"></div>
      <div id="modalRoot"></div>
      <div id="transitionRoot"></div>
    `;

    const bg = this.root.querySelector('#command3dBg');
    this.scene3d = new CommandCenterScene(bg, country, {
      liteMode: this.prefs.liteMode,
      reducedMotion: this.prefs.reducedMotion
    });
    this.scene3d.updateTelemetry(this.state);
    this.renderShell();
  }

  notify(msg) {
    this.toastMessage = msg;
    this.renderShell();
    setTimeout(() => {
      if (this.toastMessage === msg) {
        this.toastMessage = null;
        const t = this.root.querySelector('#toastBanner');
        if (t) t.remove();
      }
    }, 3600);
  }

  renderShell() {
    const country = getCountryById(this.state.countryId);
    const ind = this.state.indicators;
    const dec = country.currency.decimals;
    const shell = this.root.querySelector('#commandShell');
    if (!shell) return;

    shell.innerHTML = `
      <header class="command-topbar">
        <div class="topbar-row">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            ${renderFlagSvg(country.id, 38, 26)}
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <strong style="font-size:1.05rem;">${country.name}</strong>
                <span class="badge badge-gold">${country.government.headOfGovernmentTitle}</span>
                <span class="badge badge-cyan">${formatQuarterLabel(this.state.quarter, this.state.startYear)} (${this.state.quarter}/${this.state.config.totalQuarters})</span>
                ${this.state.config.isCustomDuration ? '<span class="badge badge-amber">Campanha Fictícia</span>' : ''}
              </div>
              <div class="text-muted" style="font-size:0.76rem;">
                ${country.government.system} • ${country.government.centralBank.name} • Dificuldade: ${this.state.config.difficulty.toUpperCase()}
              </div>
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <button class="btn btn-sm btn-cyan" id="btnWhyHappened" aria-label="Por que isso aconteceu?">POR QUE ISSO ACONTECEU?</button>
            <button class="btn btn-sm" id="btnOpenCommand">COMANDO PRESIDENCIAL</button>
            <button class="btn btn-sm" id="btnOpenAcademy">Academia</button>
            <button class="btn btn-sm" id="btnToggleLiteCmd">${this.prefs.liteMode ? 'Modo 3D: Leve' : 'Modo 3D: Completo'}</button>
            <button class="btn btn-sm" id="btnHomeCmd">Início</button>
            <button class="btn btn-primary" id="btnAdvanceQuarter">AVANÇAR PARA O PRÓXIMO PERÍODO</button>
          </div>
        </div>

        <div class="topbar-kpis">
          ${this.renderKpiChip('exchangeRate', 'Dólar / Câmbio', `1 USD = ${country.currency.symbol} ${ind.exchangeRate.toFixed(dec)}`)}
          ${this.renderKpiChip('inflation', 'Inflação', `${ind.inflation.toFixed(1)}%`)}
          ${this.renderKpiChip('interestRate', 'Juros (BC)', `${ind.interestRate.toFixed(2)}%`)}
          ${this.renderKpiChip('gdpGrowth', 'PIB Anual', `${ind.gdpGrowth.toFixed(1)}%`, ind.gdpGrowth >= 1.5 ? 'text-green' : ind.gdpGrowth < 0 ? 'text-red' : '')}
          ${this.renderKpiChip('unemployment', 'Desemprego', `${ind.unemployment.toFixed(1)}%`)}
          ${this.renderKpiChip('fiscalBalance', 'Saldo Fiscal', `${ind.fiscalBalance.toFixed(1)}% PIB`, ind.fiscalBalance >= 0 ? 'text-green' : 'text-red')}
          ${this.renderKpiChip('approval', 'Aprovação Popular', `${Math.round(ind.approval)}%`, ind.approval >= 52 ? 'text-green' : ind.approval < 40 ? 'text-red' : '')}
          ${this.renderKpiChip('parliamentSupport', 'Parlamento', `${Math.round(ind.parliamentSupport)}%`)}
        </div>
        ${this.toastMessage ? `<div id="toastBanner" class="badge badge-gold" style="align-self:flex-start;">${this.toastMessage}</div>` : ''}
      </header>

      <div class="command-body">
        <nav class="glass-panel nav-rail" aria-label="Áreas do Governo">
          ${MENU_SECTIONS.map(sec => `
            <button class="nav-item ${this.activeSection === sec.id ? 'active' : ''}" data-section="${sec.id}">
              <span>${sec.label}</span>
              ${sec.id === 'noticias' ? `<span class="badge badge-cyan" style="font-size:0.65rem;">${this.state.newsLog.length}</span>` : ''}
            </button>
          `).join('')}
        </nav>

        <main class="workspace-main">
          ${this.renderActiveEventBanner(country)}
          ${this.renderActiveDilemmaCard()}
          <section class="glass-panel cyan-edge" style="padding:20px;">
            ${this.renderSectionContent(country)}
          </section>
        </main>
      </div>
    `;

    this.bindShellEvents();
    this.renderModal();
  }

  renderKpiChip(key, label, value, colorClass = '') {
    return `
      <button class="kpi-chip" data-inspect-key="${key}" title="Clique para ver histórico e causas de ${label}">
        <div>
          <div class="k-name">${label}</div>
          <div class="k-val ${colorClass}">${value}</div>
        </div>
      </button>
    `;
  }

  renderActiveEventBanner(country) {
    const ev = this.state.activeEvent;
    if (!ev) return '';
    const isPos = ev.severity === 'positive';
    return `
      <article class="glass-panel event-banner ${isPos ? 'positive' : ''}" aria-live="polite">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span class="badge ${ev.isHistorical ? 'badge-gold' : isPos ? 'badge-green' : 'badge-red'}">
              ${ev.isHistorical ? 'EVENTO HISTÓRICO (REFERÊNCIA REAL)' : 'EVENTO DA SIMULAÇÃO (FICTÍCIO)'}
            </span>
            <span class="badge badge-cyan">${ev.category}</span>
          </div>
        </div>
        <h2 style="margin:8px 0 6px;font-size:1.2rem;">${ev.title}</h2>
        <p style="margin:0 0 6px;">${ev.summary}</p>
        ${ev.historicalRef ? `<p class="text-gold" style="font-size:0.82rem;margin:0 0 8px;">Referência histórica: ${ev.historicalRef}</p>` : ''}
        ${ev.context ? `<p class="text-muted" style="font-size:0.82rem;margin:0 0 8px;">${ev.context}</p>` : ''}

        <div class="options-grid">
          ${ev.options.map(opt => `
            <button class="option-btn" data-event-opt="${opt.id}">
              <strong class="text-gold">Resposta ${opt.id}: ${opt.label}</strong>
              <span class="text-muted" style="font-size:0.8rem;">${opt.explanation}</span>
            </button>
          `).join('')}
        </div>
      </article>
    `;
  }

  renderActiveDilemmaCard() {
    const d = this.state.activeDilemma;
    if (!d) {
      return `
        <div class="glass-panel dilemma-card">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
              <span class="badge badge-green">Pauta Principal Resolvida neste Trimestre</span>
              <p class="text-secondary" style="margin:6px 0 0;">Você já respondeu ao dilema principal deste período. Explore os ministérios abaixo, dê ordens via Comando Presidencial ou avance para o próximo trimestre.</p>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <article class="glass-panel dilemma-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <span class="badge badge-gold">Decisão Presidencial • ${d.area}</span>
          ${this.state.config.mode === 'guiada' ? '<span class="badge badge-cyan">Dica Guiada: avalie risco fiscal vs popularidade</span>' : ''}
        </div>
        <h2 style="margin:8px 0;">${d.title}</h2>
        <div class="cards-grid" style="margin-bottom:8px;">
          <div class="kpi-mini-box"><div class="lbl">Situação</div><div style="font-size:0.86rem;margin-top:3px;">${d.situation}</div></div>
          <div class="kpi-mini-box"><div class="lbl">Contexto</div><div style="font-size:0.86rem;margin-top:3px;">${d.context}</div></div>
          <div class="kpi-mini-box"><div class="lbl">Objetivo</div><div style="font-size:0.86rem;margin-top:3px;">${d.objective}</div></div>
        </div>
        <div class="options-grid">
          ${d.alternatives.map(alt => `
            <button class="option-btn" data-dilemma-opt="${alt.id}">
              <strong class="text-gold">Alternativa ${alt.id} — ${alt.label}</strong>
              <span class="text-secondary" style="font-size:0.8rem;">${alt.risksBenefits}</span>
            </button>
          `).join('')}
        </div>
      </article>
    `;
  }

  renderSectionContent(country) {
    const ind = this.state.indicators;
    const dec = country.currency.decimals;
    const levers = MINISTRY_ACTIONS.filter(a => a.section === this.activeSection);

    const renderLevers = () => {
      if (!levers.length) return '';
      return `
        <div style="margin-top:18px;">
          <h3 style="margin:0 0 10px;font-size:1rem;" class="text-gold">Ações Executivas deste Setor</h3>
          <div class="cards-grid">
            ${levers.map(lv => {
              const usedThisQ = this.state.cooldowns[lv.id] === this.state.quarter;
              return `
                <div class="kpi-mini-box" style="display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
                  <div>
                    <strong class="text-cyan">${lv.title}</strong>
                    <div class="text-gold" style="font-size:0.76rem;margin:3px 0;">${lv.costLabel}</div>
                    <p class="text-secondary" style="font-size:0.82rem;margin:4px 0 0;">${lv.description}</p>
                  </div>
                  <button class="btn btn-sm ${usedThisQ ? '' : 'btn-cyan'}" data-ministry-act="${lv.id}" ${usedThisQ ? 'disabled' : ''}>
                    ${usedThisQ ? 'Executada neste trimestre' : 'Executar Medida'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    };

    const renderIndCard = (key, label, valueStr, desc) => `
      <div class="glass-panel indicator-card" data-inspect-key="${key}" tabindex="0" role="button">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="text-muted" style="font-size:0.78rem;text-transform:uppercase;">${label}</span>
          <span class="badge badge-cyan" style="font-size:0.68rem;">Ver gráfico</span>
        </div>
        <div style="font-size:1.35rem;font-weight:800;margin:6px 0 2px;">${valueStr}</div>
        <div class="text-secondary" style="font-size:0.78rem;">${desc}</div>
      </div>
    `;

    switch (this.activeSection) {
      case 'economia':
        return `
          <h2 style="margin-top:0;">1. Painel Macroeconômico Geral</h2>
          <p class="text-secondary">Clique em qualquer indicador para abrir sua curva histórica e descobrir quais decisões e eventos o alteraram.</p>
          <div class="cards-grid">
            ${renderIndCard('gdpGrowth', 'Crescimento do PIB', `${ind.gdpGrowth.toFixed(2)}% a.a.`, 'Ritmo de expansão da atividade econômica')}
            ${renderIndCard('inflation', 'Inflação Anual', `${ind.inflation.toFixed(2)}%`, 'Pressão geral sobre preços ao consumidor')}
            ${renderIndCard('unemployment', 'Desemprego', `${ind.unemployment.toFixed(1)}%`, 'Percentual da força de trabalho desocupada')}
            ${renderIndCard('investorConfidence', 'Confiança dos Investidores', `${Math.round(ind.investorConfidence)} / 100`, 'Percepção de previsibilidade e risco')}
            ${renderIndCard('foreignInvestment', 'Investimento Estrangeiro (IED)', `US$ ${ind.foreignInvestment.toFixed(1)} bi`, 'Capital produtivo entrando no país')}
            ${renderIndCard('purchasingPower', 'Poder de Compra', `${Math.round(ind.purchasingPower)} / 100`, 'Capacidade real de consumo das famílias')}
          </div>
          <div style="margin-top:18px;">
            <h3 style="margin:0 0 8px;font-size:1rem;">Evolução do PIB ao longo do mandato</h3>
            ${renderLineChartSvg(this.state.history, 'gdpGrowth', 2)}
          </div>
        `;

      case 'cambio':
        return `
          <h2 style="margin-top:0;">2. Valor do Dólar, Câmbio e Política Monetária</h2>
          <div class="kpi-mini-box" style="border-color:var(--border-gold);margin-bottom:14px;">
            <strong class="text-gold">1 USD = ${country.currency.symbol} ${ind.exchangeRate.toFixed(dec)} (${country.currency.name})</strong>
            <p class="text-secondary" style="font-size:0.86rem;margin:6px 0 4px;">${country.currency.exchangeExplanation}</p>
            <p class="text-cyan" style="font-size:0.84rem;margin:0;">
              <strong>Instituição Monetária — ${country.government.centralBank.name}:</strong> ${country.government.centralBank.policyNote}
            </p>
          </div>
          <div class="cards-grid">
            ${renderIndCard('exchangeRate', 'Cotação Atual', `${country.currency.symbol} ${ind.exchangeRate.toFixed(dec)}`, 'Relação frente ao dólar americano')}
            ${renderIndCard('interestRate', 'Taxa Básica de Juros', `${ind.interestRate.toFixed(2)}%`, `Diferencial vs Fed (${this.state.externalScenario.fedRate.toFixed(2)}%)`)}
            ${renderIndCard('reserves', 'Reservas Internacionais', `US$ ${ind.reserves.toFixed(1)} bi`, 'Colchão de liquidez em moeda forte')}
            ${renderIndCard('countryRisk', 'Risco-País', `${ind.countryRisk} pts`, 'Prêmio de risco exigido sobre títulos')}
          </div>
          <div style="margin-top:16px;">
            <h3 style="margin:0 0 8px;font-size:1rem;">Histórico Cambial (1 USD = X)</h3>
            ${renderLineChartSvg(this.state.history, 'exchangeRate', dec)}
          </div>
          ${renderLevers()}
        `;

      case 'politica':
        return `
          <h2 style="margin-top:0;">3. Política Interna & Acontecimentos Nacionais</h2>
          <p class="text-secondary">${country.government.executiveConstraints}</p>
          <div class="cards-grid" style="margin-bottom:16px;">
            ${renderIndCard('parliamentSupport', 'Apoio Parlamentar', `${Math.round(ind.parliamentSupport)}%`, country.government.legislatureName)}
            ${renderIndCard('politicalStability', 'Estabilidade Política', `${Math.round(ind.politicalStability)} / 100`, 'Coesão institucional e governabilidade')}
            ${renderIndCard('approval', 'Aprovação Popular', `${Math.round(ind.approval)}%`, 'Avaliação geral dos cidadãos')}
          </div>
          <div class="country-grid" style="grid-template-columns: 1fr 1.2fr;">
            <div>
              <h3 style="margin-top:0;font-size:1rem;" class="text-gold">Mapa de Acontecimentos no Território</h3>
              ${renderTerritoryMapSvg(country, this.state.nationalEvents)}
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <h3 style="margin-top:0;font-size:1rem;" class="text-cyan">Boletim Regional em Tempo Real</h3>
              ${this.state.nationalEvents.map(ne => `
                <div class="kpi-mini-box" style="border-left:3px solid ${ne.severity === 'high' ? 'var(--red)' : ne.severity === 'positive' ? 'var(--green)' : 'var(--amber)'};">
                  <strong>${ne.regionName}: ${ne.title}</strong>
                  <div class="text-muted" style="font-size:0.8rem;margin-top:2px;">${ne.detail}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ${renderLevers()}
        `;

      case 'educacao':
        return `
          <h2 style="margin-top:0;">4. Educação & Capital Humano</h2>
          <p class="text-secondary">Investimentos educacionais elevam a produtividade e reduzem a desigualdade nos trimestres seguintes.</p>
          <div class="cards-grid">
            ${renderIndCard('education', 'Índice Educacional', `${Math.round(ind.education)} / 100`, 'Qualidade básica, técnica e superior')}
            ${renderIndCard('jobCreation', 'Geração de Empregos', `${Math.round(ind.jobCreation)} / 100`, 'Capacidade de absorção produtiva')}
          </div>
          ${renderLevers()}
        `;

      case 'saude':
        return `
          <h2 style="margin-top:0;">5. Saúde Pública</h2>
          <div class="cards-grid">
            ${renderIndCard('health', 'Índice de Saúde', `${Math.round(ind.health)} / 100`, 'Capacidade hospitalar e atenção primária')}
            ${renderIndCard('qualityOfLife', 'Qualidade de Vida', `${Math.round(ind.qualityOfLife)} / 100`, 'Bem-estar geral da população')}
          </div>
          ${renderLevers()}
        `;

      case 'infraestrutura':
        return `
          <h2 style="margin-top:0;">6. Infraestrutura & Logística</h2>
          <div class="cards-grid">
            ${renderIndCard('infrastructure', 'Infraestrutura Nacional', `${Math.round(ind.infrastructure)} / 100`, 'Portos, ferrovias, rodovias e conectividade')}
            ${renderIndCard('gdpGrowth', 'Crescimento do PIB', `${ind.gdpGrowth.toFixed(2)}%`, 'Beneficiado por logística eficiente')}
          </div>
          ${renderLevers()}
        `;

      case 'seguranca':
        return `
          <h2 style="margin-top:0;">7. Segurança Pública</h2>
          <div class="cards-grid">
            ${renderIndCard('security', 'Segurança Interna', `${Math.round(ind.security)} / 100`, 'Prevenção criminal e segurança jurídica')}
            ${renderIndCard('politicalStability', 'Estabilidade Institucional', `${Math.round(ind.politicalStability)} / 100`, 'Ambiente seguro para cidadãos e investimentos')}
          </div>
          ${renderLevers()}
        `;

      case 'comercio':
        return `
          <h2 style="margin-top:0;">8. Comércio Internacional</h2>
          <div class="cards-grid">
            ${renderIndCard('tradeBalance', 'Balança Comercial', `US$ ${ind.tradeBalance.toFixed(1)} bi`, 'Exportações menos importações anualizadas')}
            ${renderIndCard('foreignInvestment', 'Investimento Estrangeiro', `US$ ${ind.foreignInvestment.toFixed(1)} bi`, 'Integração às cadeias globais')}
            ${renderIndCard('reserves', 'Reservas Internacionais', `US$ ${ind.reserves.toFixed(1)} bi`, 'Divisas acumuladas')}
          </div>
          ${renderLevers()}
        `;

      case 'relacoes':
        return `
          <h2 style="margin-top:0;">9. Relações Internacionais & Diplomacia</h2>
          <p class="text-secondary">Negocie acordos comerciais, cúpulas de investimento e pactos climáticos. Suas escolhas alteram exportações, câmbio e confiança externa.</p>
          <div style="margin-bottom:16px;">
            ${renderWorldDiplomacySvg(country, this.state.diplomacy, this.state.crisisAlert)}
          </div>
          <div class="cards-grid">
            ${this.state.diplomacy.map(partner => `
              <div class="kpi-mini-box">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong class="text-gold">${partner.name}</strong>
                  <span class="badge ${partner.relation >= 65 ? 'badge-green' : partner.relation >= 48 ? 'badge-cyan' : 'badge-red'}">${Math.round(partner.relation)}%</span>
                </div>
                <div class="text-muted" style="font-size:0.76rem;margin:3px 0 8px;">${partner.bloc} • ${partner.note}</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                  ${DIPLOMATIC_ACTIONS.map(da => `
                    <button class="btn btn-sm" data-diplo-partner="${partner.id}" data-diplo-action="${da.id}" title="${da.description}">
                      ${da.category}
                    </button>
                  `).join('')}
                </div>
                ${partner.treaties.length ? `<div class="text-green" style="font-size:0.74rem;margin-top:6px;">Acordos ativos: ${partner.treaties.join(', ')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `;

      case 'impostos':
        return `
          <h2 style="margin-top:0;">10. Política Tributária (Impostos)</h2>
          <div class="cards-grid">
            ${renderIndCard('fiscalBalance', 'Saldo Fiscal', `${ind.fiscalBalance.toFixed(2)}% PIB`, 'Resultado entre arrecadação e despesas')}
            ${renderIndCard('purchasingPower', 'Poder de Compra', `${Math.round(ind.purchasingPower)} / 100`, 'Impactado por tributos sobre consumo e renda')}
          </div>
          ${renderLevers()}
        `;

      case 'gastos':
        return `
          <h2 style="margin-top:0;">11. Gastos Públicos & Dívida</h2>
          <div class="cards-grid">
            ${renderIndCard('publicDebt', 'Dívida Pública / PIB', `${ind.publicDebt.toFixed(1)}%`, 'Endividamento bruto do setor público')}
            ${renderIndCard('fiscalBalance', 'Déficit / Superávit Fiscal', `${ind.fiscalBalance.toFixed(2)}% PIB`, 'Trajetória trimestral anualizada')}
          </div>
          ${renderLevers()}
        `;

      case 'meio_ambiente':
        return `
          <h2 style="margin-top:0;">12. Meio Ambiente & Sustentabilidade</h2>
          <p class="text-secondary">Preservação ambiental e mercados de carbono influenciam acesso a financiamento verde e acordos comerciais.</p>
          <div class="kpi-mini-box">
            <div class="lbl">Participação de Energia Limpa Estrutural</div>
            <div class="val text-green">${Math.round(country.structuralProfile.energyCleanShare * 100)}% da matriz</div>
          </div>
          ${renderLevers()}
        `;

      case 'energia':
        return `
          <h2 style="margin-top:0;">13. Energia & Preços Globais</h2>
          <div class="cards-grid">
            <div class="kpi-mini-box"><div class="lbl">Petróleo Internacional (Brent)</div><div class="val text-gold">US$ ${Math.round(this.state.externalScenario.oilPrice)} / barril</div></div>
            ${renderIndCard('infrastructure', 'Redes e Geração', `${Math.round(ind.infrastructure)} / 100`, 'Capacidade logística e elétrica')}
          </div>
          ${renderLevers()}
        `;

      case 'defesa':
        return `
          <h2 style="margin-top:0;">14. Defesa Nacional & Infraestrutura Crítica</h2>
          <div class="cards-grid">
            <div class="kpi-mini-box"><div class="lbl">Tensão Geopolítica Global</div><div class="val ${this.state.externalScenario.globalTension > 55 ? 'text-red' : 'text-cyan'}">${Math.round(this.state.externalScenario.globalTension)} / 100</div></div>
            ${renderIndCard('security', 'Prontidão & Segurança', `${Math.round(ind.security)} / 100`, 'Proteção cibernética e territorial')}
          </div>
          ${renderLevers()}
        `;

      case 'noticias':
        return `
          <h2 style="margin-top:0;">15. Diário Nacional & Global (Notícias Dinâmicas)</h2>
          <p class="text-secondary">Manchetes geradas em tempo real a partir do estado econômico, decisões e eventos da sua partida.</p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${this.state.newsLog.map(n => `
              <article class="kpi-mini-box">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:4px;">
                  <div>
                    <span class="badge badge-cyan">${n.scope}</span>
                    <span class="badge badge-gold">${n.category}</span>
                  </div>
                  <span class="text-muted" style="font-size:0.78rem;">${n.dateLabel}</span>
                </div>
                <h3 style="margin:4px 0;font-size:1.02rem;">${n.headline}</h3>
                <p class="text-secondary" style="font-size:0.86rem;margin:4px 0;">${n.summary}</p>
                <div class="text-muted" style="font-size:0.78rem;"><strong>Indicadores:</strong> ${n.relatedIndicators.join(', ')} • <strong>Consequências:</strong> ${n.consequences}</div>
              </article>
            `).join('')}
          </div>
        `;

      case 'social':
        return `
          <h2 style="margin-top:0;">16. Situação Social e Bem-Estar</h2>
          <div class="cards-grid">
            ${renderIndCard('poverty', 'Taxa de Pobreza', `${ind.poverty.toFixed(1)}%`, 'Parcela da população em vulnerabilidade')}
            ${renderIndCard('inequality', 'Desigualdade (Gini x100)', `${ind.inequality.toFixed(1)}`, 'Quanto menor, melhor a distribuição')}
            ${renderIndCard('qualityOfLife', 'Qualidade de Vida', `${Math.round(ind.qualityOfLife)} / 100`, 'Síntese de saúde, educação, renda e segurança')}
            ${renderIndCard('approval', 'Aprovação Popular', `${Math.round(ind.approval)}%`, 'Apoio social ao governo')}
          </div>
          ${renderLevers()}
        `;

      case 'historico':
        return `
          <h2 style="margin-top:0;">17. Histórico de Decisões & Efeitos Programados</h2>
          ${this.state.pendingEffects.length ? `
            <div class="kpi-mini-box" style="border-color:var(--border-cyan);margin-bottom:14px;">
              <strong class="text-cyan">Efeitos Defasados em Curso (${this.state.pendingEffects.length})</strong>
              <ul style="margin:6px 0 0;padding-left:18px;font-size:0.84rem;">
                ${this.state.pendingEffects.map(p => `<li><strong>T${p.dueQuarter}:</strong> ${p.label} (origem: ${p.source})</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${this.state.decisionsLog.map(d => `
              <div class="kpi-mini-box">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                  <strong>${d.title}</strong>
                  <span class="badge badge-gold">${d.dateLabel} • ${d.kind}</span>
                </div>
                <div class="text-cyan" style="font-size:0.86rem;margin-top:4px;">Escolha: ${d.choice}</div>
                ${d.explanation ? `<div class="text-muted" style="font-size:0.8rem;margin-top:2px;">${d.explanation}</div>` : ''}
              </div>
            `).join('') || '<p class="text-muted">Nenhuma decisão executada ainda. Escolha uma alternativa acima ou dê uma ordem no Comando Presidencial.</p>'}
          </div>
        `;

      default:
        return '';
    }
  }

  renderModal() {
    const modalRoot = this.root.querySelector('#modalRoot');
    if (!modalRoot) return;
    if (!this.modal) {
      modalRoot.innerHTML = '';
      return;
    }

    const country = getCountryById(this.state.countryId);
    if (this.modal.type === 'indicator') {
      modalRoot.innerHTML = renderIndicatorModal(this.state, country, this.modal.key);
    } else if (this.modal.type === 'explainer') {
      modalRoot.innerHTML = renderExplainerModal(this.state);
    } else if (this.modal.type === 'command') {
      modalRoot.innerHTML = this.renderCommandModal();
    }

    modalRoot.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || el.tagName === 'BUTTON') {
          this.modal = null;
          this.renderModal();
        }
      });
    });

    if (this.modal.type === 'command') {
      this.bindCommandModalEvents(modalRoot);
    }
  }

  renderCommandModal() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceSupported = !!SpeechRec;
    const res = this.commandResult;

    return `
      <div class="modal-backdrop" data-close-modal="1">
        <div class="modal-box" role="dialog" aria-modal="true" aria-label="Comando Presidencial">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;">
            <div>
              <span class="badge badge-gold">Ordem Direta por Texto ou Voz</span>
              <h2 style="margin:6px 0 0;">COMANDO PRESIDENCIAL</h2>
            </div>
            <button class="btn btn-sm" data-close-modal="1">Fechar</button>
          </div>
          <p class="text-secondary" style="font-size:0.88rem;">
            Escreva ou fale o que deseja determinar ao governo. O sistema interpretará sua intenção, verificará limites constitucionais e apresentará a proposta para confirmação.
          </p>

          <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;">
            <input type="text" id="cmdTextInput" class="input-text" style="flex:1;min-width:240px;" placeholder="Ex.: Quero reduzir os impostos sobre pequenas empresas" value="${this.commandInput.replace(/"/g, '&quot;')}" aria-label="Digite sua ordem presidencial" />
            <button class="btn btn-cyan" id="btnInterpretCmd">Interpretar Ordem</button>
            <button class="btn ${this.isListening ? 'btn-danger' : ''}" id="btnVoiceCmd" ${voiceSupported ? '' : 'disabled'}>
              ${this.isListening ? 'Ouvindo...' : 'Falar Ordem (Voz)'}
            </button>
          </div>

          <div class="text-muted" style="font-size:0.78rem;margin-bottom:12px;">
            ${voiceSupported
              ? (this.voiceStatus || 'Reconhecimento de voz suportado neste navegador (pt-BR).')
              : 'Reconhecimento de voz não suportado por este navegador — utilize normalmente o campo de texto acima.'}
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
            <button class="btn btn-sm" data-cmd-sample="Quero reduzir os impostos sobre pequenas empresas">Reduzir impostos PMEs</button>
            <button class="btn btn-sm" data-cmd-sample="Quero aumentar os investimentos em educação">Investir em educação</button>
            <button class="btn btn-sm" data-cmd-sample="Quero negociar um acordo comercial com os Estados Unidos">Acordo com EUA</button>
            <button class="btn btn-sm" data-cmd-sample="Quero diminuir o déficit público">Diminuir déficit</button>
            <button class="btn btn-sm" data-cmd-sample="Quero aumentar os investimentos em energia renovável">Energia renovável</button>
          </div>

          ${res ? this.renderCommandProposal(res) : ''}
        </div>
      </div>
    `;
  }

  renderCommandProposal(res) {
    if (res.status === 'ambiguous') {
      return `
        <div class="kpi-mini-box" style="border-color:var(--amber);">
          <strong class="text-gold">Esclarecimento Necessário</strong>
          <p style="font-size:0.88rem;margin:6px 0;">${res.message}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${res.suggestions.map(s => `<button class="btn btn-sm" data-cmd-sample="${s}">${s}</button>`).join('')}
          </div>
        </div>
      `;
    }

    if (res.status === 'restricted') {
      return `
        <div class="kpi-mini-box" style="border-color:var(--red);">
          <span class="badge badge-red">Limite Institucional</span>
          <h3 style="margin:8px 0 4px;">${res.title}</h3>
          <p style="font-size:0.88rem;margin:4px 0;">${res.legalConstraint}</p>
          <p class="text-cyan" style="font-size:0.86rem;margin:6px 0;">${res.clarificationPrompt}</p>
          ${res.alternativeProposal ? `
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-subtle);">
              <strong class="text-gold">Proposta Alternativa Válida: ${res.alternativeProposal.title}</strong>
              <p class="text-secondary" style="font-size:0.84rem;">${res.alternativeProposal.explanation}</p>
              <button class="btn btn-primary btn-sm" id="btnConfirmAltCmd">Executar Proposta Alternativa</button>
            </div>
          ` : ''}
        </div>
      `;
    }

    return `
      <div class="kpi-mini-box" style="border-color:var(--green);">
        <span class="badge badge-green">Proposta Pronta para Execução • ${res.area}</span>
        <h3 style="margin:8px 0 4px;">${res.title}</h3>
        <p style="font-size:0.88rem;margin:4px 0;"><strong>Plano interpretado:</strong> ${res.interpretation}</p>
        <p class="text-amber" style="font-size:0.84rem;margin:4px 0;"><strong>Riscos e custos:</strong> ${res.risks}</p>
        <p class="text-muted" style="font-size:0.8rem;margin:4px 0 12px;"><strong>Trâmite legal:</strong> ${res.legalConstraint}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="btnConfirmCmd">Confirmar e Executar Ordem</button>
          <button class="btn" id="btnClearCmd">Alterar Texto</button>
        </div>
      </div>
    `;
  }

  bindCommandModalEvents(modalRoot) {
    const input = modalRoot.querySelector('#cmdTextInput');
    input?.addEventListener('input', (e) => { this.commandInput = e.target.value; });

    const interpret = () => {
      this.commandInput = input?.value || this.commandInput;
      this.commandResult = parsePresidentialCommand(this.commandInput, this.state);
      this.renderModal();
    };

    modalRoot.querySelector('#btnInterpretCmd')?.addEventListener('click', interpret);
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') interpret(); });

    modalRoot.querySelectorAll('[data-cmd-sample]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.commandInput = btn.dataset.cmdSample;
        this.commandResult = parsePresidentialCommand(this.commandInput, this.state);
        this.renderModal();
      });
    });

    modalRoot.querySelector('#btnVoiceCmd')?.addEventListener('click', () => {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) return;
      const rec = new SpeechRec();
      rec.lang = 'pt-BR';
      rec.interimResults = false;
      this.isListening = true;
      this.voiceStatus = 'Microfone ativo — fale sua ordem presidencial...';
      this.renderModal();

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        this.commandInput = transcript;
        this.voiceStatus = `Voz captada: "${transcript}"`;
        this.commandResult = parsePresidentialCommand(transcript, this.state);
        this.renderModal();
      };
      rec.onerror = () => {
        this.isListening = false;
        this.voiceStatus = 'Não foi possível captar áudio. Você pode digitar sua ordem normalmente.';
        this.renderModal();
      };
      rec.onend = () => {
        this.isListening = false;
      };
      try { rec.start(); } catch { this.isListening = false; }
    });

    modalRoot.querySelector('#btnConfirmCmd')?.addEventListener('click', () => {
      const r = this.commandResult;
      executeDecision(this.state, {
        kind: 'Comando Presidencial',
        area: r.area,
        title: r.title,
        optionLabel: r.optionLabel,
        effects: r.effects,
        explanation: r.explanation
      });
      this.modal = null;
      this.commandResult = null;
      this.commandInput = '';
      this.onStateChange(this.state);
      this.scene3d?.updateTelemetry(this.state);
      this.notify(`Ordem executada: ${r.title}`);
    });

    modalRoot.querySelector('#btnConfirmAltCmd')?.addEventListener('click', () => {
      const alt = this.commandResult.alternativeProposal;
      executeDecision(this.state, {
        kind: 'Comando Presidencial',
        area: alt.area,
        title: alt.title,
        optionLabel: alt.optionLabel,
        effects: alt.effects,
        explanation: alt.explanation
      });
      this.modal = null;
      this.commandResult = null;
      this.commandInput = '';
      this.onStateChange(this.state);
      this.scene3d?.updateTelemetry(this.state);
      this.notify(`Proposta alternativa executada: ${alt.title}`);
    });

    modalRoot.querySelector('#btnClearCmd')?.addEventListener('click', () => {
      this.commandResult = null;
      this.renderModal();
    });
  }

  bindShellEvents() {
    this.root.querySelectorAll('[data-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSection = btn.dataset.section;
        this.renderShell();
      });
    });

    this.root.querySelectorAll('[data-inspect-key]').forEach(el => {
      el.addEventListener('click', () => {
        this.modal = { type: 'indicator', key: el.dataset.inspectKey };
        this.renderModal();
      });
    });

    this.root.querySelector('#btnWhyHappened')?.addEventListener('click', () => {
      this.modal = { type: 'explainer' };
      this.renderModal();
    });

    this.root.querySelector('#btnOpenCommand')?.addEventListener('click', () => {
      this.modal = { type: 'command' };
      this.renderModal();
    });

    this.root.querySelector('#btnOpenAcademy')?.addEventListener('click', () => {
      this.dispose();
      this.onOpenAcademy();
    });

    this.root.querySelector('#btnHomeCmd')?.addEventListener('click', () => {
      this.dispose();
      this.onExitToHome();
    });

    this.root.querySelector('#btnToggleLiteCmd')?.addEventListener('click', () => {
      this.dispose();
      this.onTogglePrefs({ ...this.prefs, liteMode: !this.prefs.liteMode });
    });

    this.root.querySelector('#btnAdvanceQuarter')?.addEventListener('click', () => {
      this.startQuarterTransition();
    });

    // Dilemma options
    this.root.querySelectorAll('[data-dilemma-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = this.state.activeDilemma;
        if (!d) return;
        const opt = d.alternatives.find(a => a.id === btn.dataset.dilemmaOpt);
        if (!opt) return;
        executeDecision(this.state, {
          kind: 'Dilema',
          sourceId: d.id,
          area: d.area,
          title: d.title,
          optionLabel: opt.label,
          effects: opt.effects,
          explanation: opt.risksBenefits
        });
        this.onStateChange(this.state);
        this.scene3d?.updateTelemetry(this.state);
        this.notify(`Decisão aplicada: Alternativa ${opt.id}`);
      });
    });

    // Event options
    this.root.querySelectorAll('[data-event-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ev = this.state.activeEvent;
        if (!ev) return;
        const opt = ev.options.find(o => o.id === btn.dataset.eventOpt);
        if (!opt) return;
        executeDecision(this.state, {
          kind: 'Evento',
          sourceId: ev.id,
          area: ev.category,
          title: ev.title,
          optionLabel: opt.label,
          effects: opt.effects,
          explanation: opt.explanation
        });
        this.onStateChange(this.state);
        this.scene3d?.updateTelemetry(this.state);
        this.notify(`Resposta ao evento registrada.`);
      });
    });

    // Ministry direct levers
    this.root.querySelectorAll('[data-ministry-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = MINISTRY_ACTIONS.find(a => a.id === btn.dataset.ministryAct);
        if (!act) return;
        executeDecision(this.state, {
          kind: 'Ministério',
          sourceId: act.id,
          area: act.section,
          title: act.title,
          optionLabel: act.title,
          effects: { ...act.effects, delayed: act.delayed },
          explanation: act.description
        });
        this.onStateChange(this.state);
        this.scene3d?.updateTelemetry(this.state);
        this.notify(`Medida executada: ${act.title}`);
      });
    });

    // Diplomacy actions
    this.root.querySelectorAll('[data-diplo-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const partner = this.state.diplomacy.find(p => p.id === btn.dataset.diploPartner);
        const action = DIPLOMATIC_ACTIONS.find(a => a.id === btn.dataset.diploAction);
        if (!partner || !action) return;

        if (partner.relation < action.minRelation) {
          this.notify(`Relação mínima de ${action.minRelation}% necessária com ${partner.name}.`);
          return;
        }
        partner.relation = Math.max(5, Math.min(99, partner.relation + (action.effects.relationDelta || 0)));
        if (!partner.treaties.includes(action.category) && action.effects.relationDelta > 0) {
          partner.treaties.push(action.category);
        }

        executeDecision(this.state, {
          kind: 'Diplomacia',
          area: 'Relações Internacionais',
          title: `${action.title} (${partner.name})`,
          optionLabel: `${action.title} com ${partner.name}`,
          effects: {
            tradeBalance: action.effects.tradeBalanceDelta || 0,
            gdpGrowth: action.effects.gdpGrowthDelta || 0,
            foreignInvestment: action.effects.foreignInvestmentDelta || 0,
            investorConfidence: action.effects.investorConfidenceDelta || 0,
            inflation: action.effects.inflationDelta || 0,
            fiscalBalance: action.effects.fiscalDelta || 0,
            approval: action.effects.approvalDelta || 0,
            politicalStability: action.effects.politicalStabilityDelta || 0,
            infrastructure: action.effects.infrastructureDelta || 0,
            jobCreation: action.effects.jobCreationDelta || 0,
            fxPressure: action.effects.fxPressure || 0
          },
          explanation: action.riskNote
        });
        this.onStateChange(this.state);
        this.scene3d?.updateTelemetry(this.state);
        this.notify(`Ação diplomática concluída com ${partner.name}.`);
      });
    });
  }

  /**
   * Slow cinematic time passage between quarters with Pause / Accelerate / Skip.
   */
  startQuarterTransition() {
    if (this.transitioning) return;
    const trRoot = this.root.querySelector('#transitionRoot');
    if (this.prefs.reducedMotion) {
      this.finishQuarterStep();
      return;
    }

    this.transitioning = true;
    this.transitionPaused = false;
    this.transitionProgress = 0;

    const nextQ = this.state.quarter + 1;
    const nextLabel = nextQ > this.state.config.totalQuarters
      ? 'Encerramento do Mandato — Compilando Legado'
      : `Avançando para ${formatQuarterLabel(nextQ, this.state.startYear)}`;

    const renderOverlay = () => {
      trRoot.innerHTML = `
        <div class="time-overlay">
          <div class="time-card">
            <span class="badge badge-gold">Passagem de Período</span>
            <h2 style="margin:10px 0 6px;">${nextLabel}</h2>
            <p class="text-secondary" style="font-size:0.88rem;">Processando câmbio, inflação, reação do Banco Central, efeitos defasados e cenário internacional...</p>
            <div class="progress-track" style="height:10px;margin:16px 0;">
              <div class="progress-fill" id="timeProgFill" style="width:${this.transitionProgress}%;"></div>
            </div>
            <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
              <button class="btn btn-sm" id="btnTimePause">${this.transitionPaused ? 'Retomar' : 'Pausar'}</button>
              <button class="btn btn-sm btn-cyan" id="btnTimeSkip">Pular Animação</button>
            </div>
          </div>
        </div>
      `;
      trRoot.querySelector('#btnTimePause')?.addEventListener('click', () => {
        this.transitionPaused = !this.transitionPaused;
        renderOverlay();
      });
      trRoot.querySelector('#btnTimeSkip')?.addEventListener('click', () => {
        clearInterval(this.transitionTimer);
        this.transitioning = false;
        trRoot.innerHTML = '';
        this.finishQuarterStep();
      });
    };

    renderOverlay();
    this.transitionTimer = setInterval(() => {
      if (this.transitionPaused) return;
      this.transitionProgress += 8;
      const bar = trRoot.querySelector('#timeProgFill');
      if (bar) bar.style.width = `${Math.min(100, this.transitionProgress)}%`;
      if (this.transitionProgress >= 100) {
        clearInterval(this.transitionTimer);
        this.transitioning = false;
        trRoot.innerHTML = '';
        this.finishQuarterStep();
      }
    }, 95); // ~1.2s slow deliberate transition
  }

  finishQuarterStep() {
    advanceQuarter(this.state);
    this.onStateChange(this.state);
    if (this.state.finished) {
      this.dispose();
      this.onFinishCampaign(this.state);
      return;
    }
    this.scene3d?.updateTelemetry(this.state);
    this.renderShell();
  }

  dispose() {
    if (this.transitionTimer) clearInterval(this.transitionTimer);
    if (this.scene3d) {
      this.scene3d.dispose();
      this.scene3d = null;
    }
  }
}
