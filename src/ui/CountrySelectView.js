import { COUNTRIES, getCountryById } from '../data/countries.js';
import { GlobeSelectorScene } from '../three/GlobeSelectorScene.js';
import { renderFlagSvg } from './components.js';

export class CountrySelectView {
  constructor(root, prefs, callbacks) {
    this.root = root;
    this.prefs = prefs;
    this.onBack = callbacks.onBack;
    this.onStartCampaign = callbacks.onStartCampaign;
    this.selectedId = 'BR';
    this.searchQuery = '';
    this.config = {
      difficulty: 'normal',
      mode: 'guiada',
      durationType: 'oficial',
      customQuarters: 12,
      complexity: 'completo'
    };
    this.globeScene = null;
  }

  mount() {
    this.renderShell();
    const globeContainer = this.root.querySelector('#globeContainer');
    this.globeScene = new GlobeSelectorScene(globeContainer, COUNTRIES, {
      selectedId: this.selectedId,
      liteMode: this.prefs.liteMode,
      reducedMotion: this.prefs.reducedMotion,
      onSelect: (cid) => {
        this.selectedId = cid;
        this.updateCountryListHighlight();
        this.renderDossier();
      }
    });
  }

  renderShell() {
    this.root.innerHTML = `
      <div class="country-screen">
        <div class="glass-panel screen-header gold-edge">
          <div>
            <span class="badge badge-gold">Etapa 1 — Escolha da Nação</span>
            <h1 style="margin:4px 0 0;font-size:1.38rem;">SELEÇÃO GLOBAL DE PAÍS E CONFIGURAÇÃO DO MANDATO</h1>
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <span class="badge badge-cyan">${this.prefs.liteMode ? 'Modo Leve Ativo' : 'Globo 3D Interativo'}</span>
            <button class="btn btn-sm" id="btnCountryBack">Tela Inicial</button>
          </div>
        </div>

        <div class="country-grid">
          <div class="globe-column">
            <div class="globe-box" id="globeContainer" aria-label="Globo 3D interativo para seleção de país">
              <div class="globe-hint">
                <span>Arraste para girar • Role para zoom • Clique em um marcador</span>
              </div>
            </div>

            <div class="glass-panel" style="padding:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
                <strong class="text-gold">Lista Direta de Países (${COUNTRIES.length})</strong>
                <input type="search" id="countrySearch" class="input-text" placeholder="Pesquisar país ou sistema..." value="${this.searchQuery}" style="padding:6px 10px;font-size:0.84rem;min-width:210px;" aria-label="Pesquisar país" />
              </div>
              <div class="country-list-cards" id="countryCardsList"></div>
            </div>
          </div>

          <div class="glass-panel dossier-panel gold-edge" id="countryDossier"></div>
        </div>
      </div>
    `;

    this.root.querySelector('#btnCountryBack').addEventListener('click', () => {
      this.dispose();
      this.onBack();
    });
    this.root.querySelector('#countrySearch').addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderCountryList();
    });

    this.renderCountryList();
    this.renderDossier();
  }

  renderCountryList() {
    const listEl = this.root.querySelector('#countryCardsList');
    const q = this.searchQuery.trim().toLowerCase();
    const filtered = COUNTRIES.filter(c =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.continent.toLowerCase().includes(q) ||
      c.government.system.toLowerCase().includes(q) ||
      c.currency.code.toLowerCase().includes(q)
    );

    listEl.innerHTML = filtered.map(c => `
      <button class="country-card-mini ${c.id === this.selectedId ? 'active' : ''}" data-cid="${c.id}">
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderFlagSvg(c.id, 28, 19)}
          <div>
            <div style="font-weight:700;font-size:0.95rem;">${c.name}</div>
            <div class="text-muted" style="font-size:0.74rem;">${c.currency.code} • ${c.government.headOfGovernmentTitle.split(' ')[0]}</div>
          </div>
        </div>
      </button>
    `).join('') || '<p class="text-muted">Nenhum país encontrado.</p>';

    listEl.querySelectorAll('[data-cid]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedId = btn.dataset.cid;
        this.globeScene?.focusCountry(this.selectedId);
        this.updateCountryListHighlight();
        this.renderDossier();
      });
    });
  }

  updateCountryListHighlight() {
    this.root.querySelectorAll('.country-card-mini').forEach(el => {
      el.classList.toggle('active', el.dataset.cid === this.selectedId);
    });
  }

  renderDossier() {
    const c = getCountryById(this.selectedId);
    const ind = c.initialIndicators;
    const totalQuarters = this.config.durationType === 'oficial'
      ? c.government.termQuarters
      : Number(this.config.customQuarters);

    const dossier = this.root.querySelector('#countryDossier');
    dossier.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:14px;">
          ${renderFlagSvg(c.id, 52, 36)}
          <div>
            <span class="badge badge-cyan">${c.continent}</span>
            <h2 style="margin:4px 0 2px;font-size:1.55rem;">${c.name} <small class="text-muted" style="font-size:0.85rem;font-weight:400;">(${c.officialName})</small></h2>
            <div class="text-secondary" style="font-size:0.85rem;">Capital: <strong>${c.capital}</strong> • População: <strong>${c.population}</strong> • Idioma: <strong>${c.languages.join(', ')}</strong></div>
          </div>
        </div>
      </div>

      <div class="kpi-mini-box" style="border-color:var(--border-gold);">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div>
            <div class="lbl">Sistema de Governo & Cargo Assumido</div>
            <div style="font-weight:700;color:var(--gold-bright);font-size:1rem;">${c.government.headOfGovernmentTitle} — ${c.government.system}</div>
          </div>
          <span class="badge badge-gold">Mandato Padrão: ${c.government.termYears} anos (${c.government.termQuarters} trim.)</span>
        </div>
        <p class="text-secondary" style="font-size:0.84rem;margin:6px 0 4px;">${c.government.headOfStateNote} <strong>Legislativo:</strong> ${c.government.legislatureName}.</p>
        <p class="text-cyan" style="font-size:0.82rem;margin:0;"><strong>Banco Central (${c.government.centralBank.name}):</strong> ${c.government.centralBank.policyNote}</p>
      </div>

      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
          <strong class="text-gold">Indicadores Econômicos Iniciais</strong>
          <span class="text-muted" style="font-size:0.76rem;">${c.baselineMeta.referencePeriod} • Fontes: ${c.baselineMeta.sources.join(', ')}</span>
        </div>
        <div class="kpi-mini-grid">
          <div class="kpi-mini-box">
            <div class="lbl">Câmbio (${c.currency.name})</div>
            <div class="val text-gold">1 USD = ${c.currency.symbol} ${ind.exchangeRate.toFixed(c.currency.decimals)}</div>
          </div>
          <div class="kpi-mini-box">
            <div class="lbl">Inflação Anual</div>
            <div class="val">${ind.inflation.toFixed(1)}%</div>
          </div>
          <div class="kpi-mini-box">
            <div class="lbl">Taxa Básica de Juros</div>
            <div class="val">${ind.interestRate.toFixed(2)}%</div>
          </div>
          <div class="kpi-mini-box">
            <div class="lbl">Crescimento do PIB</div>
            <div class="val ${ind.gdpGrowth >= 0 ? 'text-green' : 'text-red'}">${ind.gdpGrowth.toFixed(1)}%</div>
          </div>
          <div class="kpi-mini-box">
            <div class="lbl">Dívida Pública / PIB</div>
            <div class="val">${ind.publicDebt.toFixed(1)}%</div>
          </div>
          <div class="kpi-mini-box">
            <div class="lbl">Desemprego</div>
            <div class="val">${ind.unemployment.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div class="cards-grid">
        <div class="kpi-mini-box">
          <div class="lbl">Situação Política & Desafios</div>
          <p class="text-secondary" style="font-size:0.82rem;margin:6px 0;">${c.politicalSituation}</p>
          <ul style="margin:0;padding-left:18px;font-size:0.8rem;color:var(--text-secondary);">
            ${c.challenges.map(ch => `<li>${ch}</li>`).join('')}
          </ul>
        </div>
        <div class="kpi-mini-box">
          <div class="lbl">Relações Internacionais Relevantes</div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;">
            ${c.internationalRelations.map(r => `
              <div style="font-size:0.8rem;">
                <strong>${r.name}</strong> (<span class="text-cyan">${r.relation}%</span>): <span class="text-muted">${r.note}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div>
        <strong class="text-gold" style="display:block;margin-bottom:8px;">Preparação da Presidência / Chefia de Governo</strong>
        <div class="setup-grid">
          <div class="form-field">
            <label for="cfgDifficulty">Dificuldade</label>
            <select id="cfgDifficulty">
              <option value="facil" ${this.config.difficulty === 'facil' ? 'selected' : ''}>Fácil (Margem fiscal maior)</option>
              <option value="normal" ${this.config.difficulty === 'normal' ? 'selected' : ''}>Normal (Realista)</option>
              <option value="dificil" ${this.config.difficulty === 'dificil' ? 'selected' : ''}>Difícil (Choques intensos)</option>
            </select>
          </div>
          <div class="form-field">
            <label for="cfgMode">Modo de Jogo</label>
            <select id="cfgMode">
              <option value="guiada" ${this.config.mode === 'guiada' ? 'selected' : ''}>Campanha Guiada</option>
              <option value="historica" ${this.config.mode === 'historica' ? 'selected' : ''}>Campanha Histórica (Crises Reais)</option>
              <option value="livre" ${this.config.mode === 'livre' ? 'selected' : ''}>Modo Livre</option>
            </select>
          </div>
          <div class="form-field">
            <label for="cfgDuration">Duração da Simulação</label>
            <select id="cfgDuration">
              <option value="oficial" ${this.config.durationType === 'oficial' ? 'selected' : ''}>Mandato Oficial (${c.government.termYears} anos / ${c.government.termQuarters} trim.)</option>
              <option value="custom_8" ${this.config.durationType === 'custom' && this.config.customQuarters === 8 ? 'selected' : ''}>Personalizada: 8 trimestres (Fictícia)</option>
              <option value="custom_12" ${this.config.durationType === 'custom' && this.config.customQuarters === 12 ? 'selected' : ''}>Personalizada: 12 trimestres (Fictícia)</option>
              <option value="custom_24" ${this.config.durationType === 'custom' && this.config.customQuarters === 24 ? 'selected' : ''}>Personalizada: 24 trimestres (Fictícia)</option>
            </select>
          </div>
          <div class="form-field">
            <label for="cfgComplexity">Complexidade Econômica</label>
            <select id="cfgComplexity">
              <option value="completo" ${this.config.complexity === 'completo' ? 'selected' : ''}>Completa (Realista)</option>
              <option value="simplificado" ${this.config.complexity === 'simplificado' ? 'selected' : ''}>Simplificada (Educativa)</option>
            </select>
          </div>
        </div>
        ${this.config.durationType !== 'oficial' ? `
          <p class="text-amber" style="font-size:0.8rem;margin:8px 0 0;">Aviso institucional: duração personalizada selecionada — esta campanha utilizará um período fictício de ${totalQuarters} trimestres (o mandato oficial em ${c.name} é de ${c.government.termYears} anos).</p>
        ` : ''}
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px;">
        <span class="text-muted" style="font-size:0.78rem;">${c.baselineMeta.note}</span>
        <button class="btn btn-primary" id="btnAssumeGovernment" style="padding:13px 26px;font-size:1rem;">
          ASSUMIR GOVERNO EM ${c.name.toUpperCase()}
        </button>
      </div>
    `;

    dossier.querySelector('#cfgDifficulty').addEventListener('change', (e) => { this.config.difficulty = e.target.value; });
    dossier.querySelector('#cfgMode').addEventListener('change', (e) => { this.config.mode = e.target.value; });
    dossier.querySelector('#cfgComplexity').addEventListener('change', (e) => { this.config.complexity = e.target.value; });
    dossier.querySelector('#cfgDuration').addEventListener('change', (e) => {
      const v = e.target.value;
      if (v === 'oficial') {
        this.config.durationType = 'oficial';
      } else {
        this.config.durationType = 'custom';
        this.config.customQuarters = Number(v.split('_')[1]);
      }
      this.renderDossier();
    });

    dossier.querySelector('#btnAssumeGovernment').addEventListener('click', () => {
      const chosenQuarters = this.config.durationType === 'oficial'
        ? c.government.termQuarters
        : this.config.customQuarters;
      this.dispose();
      this.onStartCampaign(c.id, {
        difficulty: this.config.difficulty,
        mode: this.config.mode,
        totalQuarters: chosenQuarters,
        complexity: this.config.complexity
      });
    });
  }

  dispose() {
    if (this.globeScene) {
      this.globeScene.dispose();
      this.globeScene = null;
    }
  }
}
