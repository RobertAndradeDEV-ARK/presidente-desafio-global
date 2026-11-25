import { EDUCATION_MODULES, EDUCATION_QUIZ } from '../data/education.js';

/**
 * Interactive Economics & Politics Learning System (5 visual modules + quick quiz).
 */
export class AcademyView {
  constructor(root, onBack) {
    this.root = root;
    this.onBack = onBack;
    this.activeModuleIdx = 0;
    this.showQuiz = false;

    // Interactive Sandbox State
    this.fxVars = { inflation: 5, interest: 10, fiscalDeficit: 3, tradeSurplus: 20, fedRate: 4.5 };
    this.basketVars = { fxChangePct: 12, inflation: 7 };
    this.shockScenario = 'none';
    this.quizAnswers = {};
    this.quizSubmitted = false;
  }

  render() {
    const mod = EDUCATION_MODULES[this.activeModuleIdx];
    this.root.innerHTML = `
      <div class="academy-screen">
        <div class="glass-panel screen-header gold-edge">
          <div>
            <span class="badge badge-gold">Academia Presidencial</span>
            <h1 style="margin:4px 0 0;font-size:1.45rem;">APRENDER SOBRE ECONOMIA E POLÍTICA</h1>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn ${!this.showQuiz ? 'btn-cyan' : ''}" id="btnShowModules">Módulos Visuais (5)</button>
            <button class="btn ${this.showQuiz ? 'btn-primary' : ''}" id="btnShowQuiz">Teste Rápido (${EDUCATION_QUIZ.length} questões)</button>
            <button class="btn" id="btnAcademyBack">Voltar</button>
          </div>
        </div>

        ${this.showQuiz ? this.renderQuiz() : this.renderModuleView(mod)}
      </div>
    `;
    this.bindEvents();
  }

  renderModuleView(mod) {
    return `
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${EDUCATION_MODULES.map((m, idx) => `
          <button class="btn btn-sm ${idx === this.activeModuleIdx ? 'btn-primary' : ''}" data-mod-idx="${idx}">
            ${m.number}: ${m.title.split('?')[0].slice(0, 30)}
          </button>
        `).join('')}
      </div>

      <div class="glass-panel cyan-edge" style="padding:22px;">
        <span class="badge badge-cyan">${mod.number}</span>
        <h2 style="margin:8px 0 4px;">${mod.title}</h2>
        <p class="text-gold" style="margin:0 0 12px;font-weight:600;">${mod.subtitle}</p>
        <p class="text-secondary">${mod.summary}</p>

        <div class="cards-grid" style="margin:16px 0;">
          ${mod.keyPoints.map(kp => `
            <div class="kpi-mini-box">
              <strong class="text-cyan">${kp.label}</strong>
              <p class="text-secondary" style="font-size:0.86rem;margin:6px 0 0;">${kp.detail}</p>
            </div>
          `).join('')}
        </div>

        <div class="glass-panel gold-edge" style="padding:18px;margin-top:14px;">
          <h3 style="margin:0 0 12px;font-size:1.05rem;">${mod.interactiveTitle}</h3>
          ${this.renderInteractiveWidget(mod.interactiveType)}
        </div>
      </div>
    `;
  }

  renderInteractiveWidget(type) {
    if (type === 'dollar-flow') {
      return `
        <div class="cards-grid">
          <div class="kpi-mini-box">
            <div class="lbl">Exportações trazem dólares (+)</div>
            <p style="font-size:0.86rem;">Quando o país vende soja, petróleo, aviões ou tecnologia, entram dólares na economia, aumentando a oferta de moeda estrangeira.</p>
            <span class="badge badge-green">Pressão de baixa no USD</span>
          </div>
          <div class="kpi-mini-box">
            <div class="lbl">Importações e dívidas levam dólares (-)</div>
            <p style="font-size:0.86rem;">Quando empresas compram máquinas, combustíveis ou remetem lucros ao exterior, há saída de dólares.</p>
            <span class="badge badge-amber">Pressão de alta no USD</span>
          </div>
          <div class="kpi-mini-box">
            <div class="lbl">Reservas Internacionais (Colchão)</div>
            <p style="font-size:0.86rem;">Dólares guardados pelo Banco Central evitam falta de divisas em momentos de pânico financeiro.</p>
            <span class="badge badge-cyan">Estabilidade cambial</span>
          </div>
        </div>
      `;
    }

    if (type === 'fx-sandbox') {
      const { inflation, interest, fiscalDeficit, tradeSurplus, fedRate } = this.fxVars;
      const simulatedRate = Math.max(3.6, Math.min(8.5,
        5.10 + (inflation - 4) * 0.14 - (interest - fedRate - 4) * 0.09 + (fiscalDeficit - 2) * 0.18 - (tradeSurplus - 20) * 0.015
      ));
      return `
        <div class="setup-grid" style="margin-bottom:14px;">
          <div class="form-field">
            <label>Inflação Doméstica: ${inflation}%</label>
            <input type="range" min="1" max="18" step="0.5" value="${inflation}" data-fx-var="inflation"/>
          </div>
          <div class="form-field">
            <label>Juros Locais: ${interest}%</label>
            <input type="range" min="2" max="18" step="0.5" value="${interest}" data-fx-var="interest"/>
          </div>
          <div class="form-field">
            <label>Déficit Fiscal (% PIB): ${fiscalDeficit}%</label>
            <input type="range" min="0" max="10" step="0.5" value="${fiscalDeficit}" data-fx-var="fiscalDeficit"/>
          </div>
          <div class="form-field">
            <label>Saldo Comercial (US$ bi): ${tradeSurplus}</label>
            <input type="range" min="-30" max="90" step="5" value="${tradeSurplus}" data-fx-var="tradeSurplus"/>
          </div>
        </div>
        <div class="kpi-mini-box" style="text-align:center;">
          <div class="lbl">Cotação Educativa Simulada</div>
          <div class="val" style="font-size:1.5rem;color:var(--gold-bright);">1 USD = R$ ${simulatedRate.toFixed(2)}</div>
          <p class="text-muted" style="font-size:0.82rem;margin:4px 0 0;">
            ${simulatedRate > 5.5 ? 'Déficit/inflação altos reduzem confiança e desvalorizam a moeda local.' : 'Juros reais positivos, superávit e controle fiscal atraem divisas e valorizam a moeda.'}
          </p>
        </div>
      `;
    }

    if (type === 'household-basket') {
      const { fxChangePct, inflation } = this.basketVars;
      const fuelImpact = (fxChangePct * 0.55 + inflation * 0.6).toFixed(1);
      const electronicsImpact = (fxChangePct * 0.85 + inflation * 0.3).toFixed(1);
      const foodImpact = (fxChangePct * 0.3 + inflation * 0.85).toFixed(1);
      return `
        <div class="setup-grid" style="margin-bottom:12px;">
          <div class="form-field">
            <label>Alta do Dólar: +${fxChangePct}%</label>
            <input type="range" min="-15" max="40" step="1" value="${fxChangePct}" data-basket-var="fxChangePct"/>
          </div>
          <div class="form-field">
            <label>Inflação Anual: ${inflation}%</label>
            <input type="range" min="1" max="20" step="0.5" value="${inflation}" data-basket-var="inflation"/>
          </div>
        </div>
        <div class="kpi-mini-grid">
          <div class="kpi-mini-box"><div class="lbl">Combustíveis</div><div class="val">${Number(fuelImpact) >= 0 ? '+' : ''}${fuelImpact}%</div></div>
          <div class="kpi-mini-box"><div class="lbl">Eletrônicos & Importados</div><div class="val">${Number(electronicsImpact) >= 0 ? '+' : ''}${electronicsImpact}%</div></div>
          <div class="kpi-mini-box"><div class="lbl">Alimentação</div><div class="val">${Number(foodImpact) >= 0 ? '+' : ''}${foodImpact}%</div></div>
        </div>
      `;
    }

    if (type === 'powers-matrix') {
      return `
        <div class="cards-grid">
          <div class="kpi-mini-box">
            <strong class="text-gold">Executivo (Presidente / PM)</strong>
            <p style="font-size:0.84rem;">Propõe orçamento, gere ministérios, negocia tratados e executa programas sociais e de infraestrutura.</p>
          </div>
          <div class="kpi-mini-box">
            <strong class="text-cyan">Legislativo (Congresso / Dieta)</strong>
            <p style="font-size:0.84rem;">Aprova impostos, teto de gastos, reformas e pode barrar ou aprovar projetos do governo.</p>
          </div>
          <div class="kpi-mini-box">
            <strong class="text-green">Banco Central Autônomo</strong>
            <p style="font-size:0.84rem;">Define a taxa básica de juros para controlar a inflação. Na França, o BCE é supranacional.</p>
          </div>
          <div class="kpi-mini-box">
            <strong class="text-secondary">Judiciário</strong>
            <p style="font-size:0.84rem;">Garante a Constituição, contratos e segurança jurídica — sem ela, investidores fogem.</p>
          </div>
        </div>
      `;
    }

    const shockEffects = {
      none: 'Selecione um choque global abaixo para observar como fatores externos afetam o seu país.',
      oil: 'Choque do Petróleo (+40%): encarece fretes, eleva inflação em 1,5 a 2,5 p.p. e pressiona países importadores de energia.',
      fed: 'Alta de Juros nos EUA (+1,5 p.p.): capital global migra para títulos do Tesouro americano, pressionando moedas emergentes.',
      pandemic: 'Pandemia Global: cadeias logísticas travam, PIB retrai e governos precisam escolher entre auxílio emergencial e controle da dívida.'
    };
    return `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        <button class="btn btn-sm ${this.shockScenario === 'oil' ? 'btn-primary' : ''}" data-shock="oil">Guerra / Choque de Petróleo</button>
        <button class="btn btn-sm ${this.shockScenario === 'fed' ? 'btn-primary' : ''}" data-shock="fed">Alta de Juros nos EUA</button>
        <button class="btn btn-sm ${this.shockScenario === 'pandemic' ? 'btn-primary' : ''}" data-shock="pandemic">Pandemia Logística</button>
      </div>
      <div class="kpi-mini-box">
        <p style="margin:0;font-size:0.92rem;">${shockEffects[this.shockScenario]}</p>
      </div>
    `;
  }

  renderQuiz() {
    const score = EDUCATION_QUIZ.reduce((acc, q) => acc + (this.quizAnswers[q.id] === q.correctIndex ? 1 : 0), 0);
    return `
      <div class="glass-panel cyan-edge" style="padding:22px;">
        <h2 style="margin-top:0;">Teste Rápido de Conhecimentos</h2>
        <p class="text-secondary">Verifique sua compreensão sobre câmbio, bancos centrais, política fiscal e choques globais.</p>
        <div style="display:flex;flex-direction:column;gap:14px;margin-top:14px;">
          ${EDUCATION_QUIZ.map((q, qi) => `
            <div class="kpi-mini-box">
              <div style="font-weight:700;margin-bottom:8px;">${qi + 1}. ${q.question}</div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${q.options.map((opt, oi) => {
                  const selected = this.quizAnswers[q.id] === oi;
                  const isCorrect = q.correctIndex === oi;
                  let cls = '';
                  if (this.quizSubmitted) {
                    if (isCorrect) cls = 'border-color:var(--green);background:rgba(16,185,129,0.16);';
                    else if (selected) cls = 'border-color:var(--red);background:rgba(239,68,68,0.16);';
                  } else if (selected) {
                    cls = 'border-color:var(--gold-bright);background:rgba(212,175,55,0.16);';
                  }
                  return `
                    <button class="btn btn-sm" style="justify-content:flex-start;text-align:left;${cls}" data-quiz-q="${q.id}" data-quiz-o="${oi}">
                      ${opt}
                    </button>
                  `;
                }).join('')}
              </div>
              ${this.quizSubmitted ? `<p class="text-cyan" style="font-size:0.84rem;margin:8px 0 0;">${q.explanation}</p>` : ''}
            </div>
          `).join('')}
        </div>
        <div style="margin-top:18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="btnSubmitQuiz">Corrigir Teste</button>
          ${this.quizSubmitted ? `<span class="badge badge-gold" style="font-size:0.9rem;">Pontuação: ${score} / ${EDUCATION_QUIZ.length}</span>` : ''}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.root.querySelector('#btnAcademyBack')?.addEventListener('click', () => this.onBack());
    this.root.querySelector('#btnShowModules')?.addEventListener('click', () => { this.showQuiz = false; this.render(); });
    this.root.querySelector('#btnShowQuiz')?.addEventListener('click', () => { this.showQuiz = true; this.render(); });

    this.root.querySelectorAll('[data-mod-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeModuleIdx = Number(btn.dataset.modIdx);
        this.render();
      });
    });

    this.root.querySelectorAll('[data-fx-var]').forEach(inp => {
      inp.addEventListener('input', () => {
        this.fxVars[inp.dataset.fxVar] = Number(inp.value);
        this.render();
      });
    });
    this.root.querySelectorAll('[data-basket-var]').forEach(inp => {
      inp.addEventListener('input', () => {
        this.basketVars[inp.dataset.basketVar] = Number(inp.value);
        this.render();
      });
    });
    this.root.querySelectorAll('[data-shock]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.shockScenario = btn.dataset.shock;
        this.render();
      });
    });

    this.root.querySelectorAll('[data-quiz-q]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.quizSubmitted) return;
        this.quizAnswers[btn.dataset.quizQ] = Number(btn.dataset.quizO);
        this.render();
      });
    });
    this.root.querySelector('#btnSubmitQuiz')?.addEventListener('click', () => {
      this.quizSubmitted = true;
      this.render();
    });
  }
}
