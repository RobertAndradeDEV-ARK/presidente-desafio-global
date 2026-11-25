import { buildLegacyReport } from '../engine/legacyEngine.js';
import { renderFlagSvg, renderLineChartSvg } from './components.js';

/**
 * End-of-Term Legacy Report View: Economy, Society, Politics, Achievements, Mistakes & Replay options.
 */
export class LegacyView {
  constructor(root, state, callbacks) {
    this.root = root;
    this.state = state;
    this.onNewGame = callbacks.onNewGame;
    this.onReviveTimeline = callbacks.onReviveTimeline;
    this.showDecisionsDrawer = false;
  }

  render() {
    const report = buildLegacyReport(this.state);
    const c = report.country;
    const dec = c.currency.decimals;
    const gradeBadge = report.classification === 'Governo de Destaque'
      ? 'badge-green'
      : report.classification === 'Governo Equilibrado'
      ? 'badge-cyan'
      : report.classification === 'Governo com Dificuldades'
      ? 'badge-amber'
      : 'badge-red';

    this.root.innerHTML = `
      <div class="legacy-screen">
        <div class="glass-panel gold-edge" style="padding:26px;text-align:center;">
          <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin-bottom:10px;">
            ${renderFlagSvg(c.id, 46, 32)}
            <span class="badge ${gradeBadge}" style="font-size:0.9rem;padding:6px 14px;">${report.classification}</span>
          </div>
          <h1 style="margin:6px 0;font-size:2rem;">SEU LEGADO — ${c.name.toUpperCase()}</h1>
          <p class="text-secondary" style="max-width:720px;margin:0 auto 14px;">${report.classificationDesc}</p>
          <div style="display:inline-flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;">
            <span class="badge badge-gold">Índice Geral Equilibrado: ${report.overallScore} / 100</span>
            <span class="badge badge-cyan">Avaliação multifatorial (economia + sociedade + estabilidade)</span>
          </div>
        </div>

        <div class="cards-grid">
          <div class="glass-panel cyan-edge" style="padding:18px;">
            <h2 style="margin-top:0;font-size:1.15rem;" class="text-gold">Economia do Mandato</h2>
            <div class="kpi-mini-grid">
              <div class="kpi-mini-box"><div class="lbl">Câmbio Inicial → Final</div><div class="val">${report.economy.fxStart.toFixed(dec)} → ${report.economy.fxEnd.toFixed(dec)}</div></div>
              <div class="kpi-mini-box"><div class="lbl">Menor / Maior Cotação</div><div class="val">${report.economy.fxMin.toFixed(dec)} / ${report.economy.fxMax.toFixed(dec)}</div></div>
              <div class="kpi-mini-box"><div class="lbl">Inflação Média</div><div class="val">${report.economy.avgInflation.toFixed(1)}%</div></div>
              <div class="kpi-mini-box"><div class="lbl">PIB Médio Anual</div><div class="val">${report.economy.avgGdp.toFixed(1)}%</div></div>
              <div class="kpi-mini-box"><div class="lbl">Desemprego (Início → Fim)</div><div class="val">${report.economy.unempStart.toFixed(1)}% → ${report.economy.unempEnd.toFixed(1)}%</div></div>
              <div class="kpi-mini-box"><div class="lbl">Dívida Pública / PIB</div><div class="val">${report.economy.debtStart.toFixed(1)}% → ${report.economy.debtEnd.toFixed(1)}%</div></div>
              <div class="kpi-mini-box"><div class="lbl">Balança Comercial</div><div class="val">US$ ${report.economy.tradeEnd.toFixed(1)} bi</div></div>
              <div class="kpi-mini-box"><div class="lbl">Invest. Estrangeiro (IED)</div><div class="val">US$ ${report.economy.fdiEnd.toFixed(1)} bi</div></div>
            </div>
          </div>

          <div class="glass-panel cyan-edge" style="padding:18px;">
            <h2 style="margin-top:0;font-size:1.15rem;" class="text-gold">Sociedade & Política</h2>
            <div class="kpi-mini-grid">
              <div class="kpi-mini-box"><div class="lbl">Educação</div><div class="val">${Math.round(report.society.education)}/100 (${report.society.eduDelta >= 0 ? '+' : ''}${report.society.eduDelta.toFixed(1)})</div></div>
              <div class="kpi-mini-box"><div class="lbl">Saúde</div><div class="val">${Math.round(report.society.health)}/100 (${report.society.healthDelta >= 0 ? '+' : ''}${report.society.healthDelta.toFixed(1)})</div></div>
              <div class="kpi-mini-box"><div class="lbl">Pobreza</div><div class="val">${report.society.poverty.toFixed(1)}% (${report.society.povertyDelta >= 0 ? '+' : ''}${report.society.povertyDelta.toFixed(1)})</div></div>
              <div class="kpi-mini-box"><div class="lbl">Desigualdade</div><div class="val">${report.society.inequality.toFixed(1)} (${report.society.ineqDelta >= 0 ? '+' : ''}${report.society.ineqDelta.toFixed(1)})</div></div>
              <div class="kpi-mini-box"><div class="lbl">Qualidade de Vida</div><div class="val">${Math.round(report.society.qualityOfLife)}/100</div></div>
              <div class="kpi-mini-box"><div class="lbl">Aprovação Final</div><div class="val">${Math.round(report.society.approval)}%</div></div>
              <div class="kpi-mini-box"><div class="lbl">Apoio Parlamentar</div><div class="val">${Math.round(report.politics.parliamentSupport)}%</div></div>
              <div class="kpi-mini-box"><div class="lbl">Decisões / Acordos</div><div class="val">${report.politics.totalDecisions} / ${report.politics.treatiesCount}</div></div>
            </div>
          </div>
        </div>

        <div class="glass-panel" style="padding:18px;">
          <h3 style="margin:0 0 10px;">Trajetória da Cotação Cambial ao Longo do Mandato</h3>
          ${renderLineChartSvg(this.state.history, 'exchangeRate', dec)}
        </div>

        <div class="cards-grid">
          <div class="glass-panel" style="padding:18px;border-color:rgba(16,185,129,0.45);">
            <h3 style="margin-top:0;" class="text-green">Maiores Acertos & Conquistas</h3>
            <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;">
              ${report.achievements.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
          <div class="glass-panel" style="padding:18px;border-color:rgba(239,68,68,0.45);">
            <h3 style="margin-top:0;" class="text-red">Principais Desafios e Erros</h3>
            <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;">
              ${report.mistakes.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>
          <div class="glass-panel" style="padding:18px;border-color:rgba(245,158,11,0.45);">
            <h3 style="margin-top:0;" class="text-gold">Fatores Fora do Controle do Governo</h3>
            <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;">
              ${report.externalShocks.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>

        ${this.showDecisionsDrawer ? `
          <div class="glass-panel gold-edge" style="padding:18px;">
            <h3 style="margin-top:0;">Revisão Cronológica das Decisões (${this.state.decisionsLog.length})</h3>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${this.state.decisionsLog.map(d => `
                <div class="kpi-mini-box">
                  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                    <strong>${d.title}</strong>
                    <span class="badge badge-cyan">${d.dateLabel}</span>
                  </div>
                  <div class="text-gold" style="font-size:0.86rem;margin-top:4px;">Escolha: ${d.choice}</div>
                  ${d.explanation ? `<div class="text-muted" style="font-size:0.8rem;margin-top:2px;">${d.explanation}</div>` : ''}
                </div>
              `).join('') || '<p class="text-muted">Nenhuma decisão registrada.</p>'}
            </div>
          </div>
        ` : ''}

        <div style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:8px;">
          <button class="btn btn-cyan" id="btnRevivePresidency">REVIVER MINHA PRESIDÊNCIA</button>
          <button class="btn" id="btnReviewDecisions">${this.showDecisionsDrawer ? 'OCULTAR DECISÕES' : 'REVISAR MINHAS DECISÕES'}</button>
          <button class="btn btn-primary" id="btnNewGovernment">COMEÇAR UM NOVO GOVERNO</button>
        </div>
      </div>
    `;

    this.root.querySelector('#btnNewGovernment').addEventListener('click', () => this.onNewGame());
    this.root.querySelector('#btnRevivePresidency').addEventListener('click', () => this.onReviveTimeline());
    this.root.querySelector('#btnReviewDecisions').addEventListener('click', () => {
      this.showDecisionsDrawer = !this.showDecisionsDrawer;
      this.render();
    });
  }
}
