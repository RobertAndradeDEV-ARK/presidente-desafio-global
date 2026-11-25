import { humanIndicatorName } from '../engine/economicEngine.js';

/**
 * Crisp inline SVG flags for every country (avoids Windows emoji rendering issues).
 */
export function renderFlagSvg(countryId, width = 34, height = 24) {
  const flags = {
    BR: `<svg width="${width}" height="${height}" viewBox="0 0 36 24" aria-hidden="true"><rect width="36" height="24" rx="3" fill="#009b3a"/><polygon points="18,3 33,12 18,21 3,12" fill="#fedf00"/><circle cx="18" cy="12" r="5" fill="#002776"/><path d="M13.3 11.2 Q18 9.2 22.7 12.2" stroke="#fff" stroke-width="1" fill="none"/></svg>`,
    US: `<svg width="${width}" height="${height}" viewBox="0 0 36 24" aria-hidden="true"><rect width="36" height="24" rx="3" fill="#fff"/><g fill="#b22234"><rect y="0" width="36" height="2.4"/><rect y="4.8" width="36" height="2.4"/><rect y="9.6" width="36" height="2.4"/><rect y="14.4" width="36" height="2.4"/><rect y="19.2" width="36" height="2.4"/></g><rect width="16" height="12.6" fill="#3c3b6e"/><circle cx="4" cy="3.5" r="0.9" fill="#fff"/><circle cx="8" cy="3.5" r="0.9" fill="#fff"/><circle cx="12" cy="3.5" r="0.9" fill="#fff"/><circle cx="6" cy="6.5" r="0.9" fill="#fff"/><circle cx="10" cy="6.5" r="0.9" fill="#fff"/><circle cx="4" cy="9.5" r="0.9" fill="#fff"/><circle cx="8" cy="9.5" r="0.9" fill="#fff"/><circle cx="12" cy="9.5" r="0.9" fill="#fff"/></svg>`,
    AR: `<svg width="${width}" height="${height}" viewBox="0 0 36 24" aria-hidden="true"><rect width="36" height="8" fill="#74acdf"/><rect y="8" width="36" height="8" fill="#fff"/><rect y="16" width="36" height="8" fill="#74acdf"/><circle cx="18" cy="12" r="2.6" fill="#f6b40e"/></svg>`,
    MX: `<svg width="${width}" height="${height}" viewBox="0 0 36 24" aria-hidden="true"><rect width="12" height="24" fill="#006847"/><rect x="12" width="12" height="24" fill="#fff"/><rect x="24" width="12" height="24" fill="#ce1126"/><circle cx="18" cy="12" r="2.7" fill="#8b5a2b"/></svg>`,
    FR: `<svg width="${width}" height="${height}" viewBox="0 0 36 24" aria-hidden="true"><rect width="12" height="24" fill="#0055a4"/><rect x="12" width="12" height="24" fill="#fff"/><rect x="24" width="12" height="24" fill="#ef4135"/></svg>`,
    JP: `<svg width="${width}" height="${height}" viewBox="0 0 36 24" aria-hidden="true"><rect width="36" height="24" rx="3" fill="#fff"/><circle cx="18" cy="12" r="5.6" fill="#bc002d"/></svg>`
  };
  return flags[countryId] || `<span class="badge">${countryId}</span>`;
}

/**
 * Renders an interactive SVG time-series line chart for any indicator across quarters.
 */
export function renderLineChartSvg(history, key, decimals = 2) {
  const values = history.map(h => h.indicators[key]);
  const w = 620;
  const h = 190;
  const padL = 48;
  const padR = 18;
  const padT = 18;
  const padB = 28;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const span = maxVal - minVal || 1;

  const points = values.map((v, i) => {
    const x = values.length === 1
      ? padL + (w - padL - padR) / 2
      : padL + (i / (values.length - 1)) * (w - padL - padR);
    const y = h - padB - ((v - minVal) / span) * (h - padT - padB);
    return { x, y, v, q: history[i].quarter };
  });

  const polyline = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${padL},${h - padB} ${polyline} ${points[points.length - 1].x.toFixed(1)},${h - padB}`;

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;background:rgba(4,10,24,0.75);border-radius:10px;border:1px solid rgba(56,189,248,0.25);">
      <defs>
        <linearGradient id="chartGrad_${key}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h - padB}" stroke="rgba(148,163,184,0.3)"/>
      <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="rgba(148,163,184,0.3)"/>
      <text x="6" y="${padT + 8}" fill="#94a3b8" font-size="11">${maxVal.toFixed(decimals)}</text>
      <text x="6" y="${h - padB}" fill="#94a3b8" font-size="11">${minVal.toFixed(decimals)}</text>
      <polygon points="${area}" fill="url(#chartGrad_${key})" />
      <polyline fill="none" stroke="#f5d061" stroke-width="2.5" points="${polyline}" />
      ${points.map(p => `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#38bdf8" stroke="#040814" stroke-width="1.5">
          <title>T${p.q}: ${p.v.toFixed(decimals)}</title>
        </circle>
        <text x="${p.x.toFixed(1)}" y="${h - 8}" text-anchor="middle" fill="#94a3b8" font-size="10">T${p.q}</text>
      `).join('')}
    </svg>
  `;
}

/**
 * Interactive National Territory Map SVG showing regions & active national events.
 */
export function renderTerritoryMapSvg(country, nationalEvents) {
  return `
    <svg viewBox="0 0 100 100" style="width:100%;max-height:280px;background:radial-gradient(circle,#0b1d42 0%,#040917 100%);border-radius:12px;border:1px solid rgba(56,189,248,0.35);">
      <path d="${country.svgOutline}" fill="rgba(29, 78, 216, 0.28)" stroke="#38bdf8" stroke-width="1.3" />
      ${(country.regions || []).map(r => {
        const ev = nationalEvents.find(e => e.regionId === r.id);
        const color = !ev ? '#f5d061' : ev.severity === 'high' ? '#ef4444' : ev.severity === 'positive' ? '#10b981' : '#f59e0b';
        return `
          <g>
            <circle cx="${r.x * 100}" cy="${r.y * 100}" r="4.5" fill="${color}" fill-opacity="0.25" />
            <circle cx="${r.x * 100}" cy="${r.y * 100}" r="2.2" fill="${color}" stroke="#fff" stroke-width="0.6">
              <title>${r.name}: ${ev ? ev.title : r.role}</title>
            </circle>
            <text x="${r.x * 100 + 3.2}" y="${r.y * 100 + 1}" fill="#e2e8f0" font-size="3.4" font-weight="600">${r.name.split(' ')[0]}</text>
          </g>
        `;
      }).join('')}
    </svg>
  `;
}

/**
 * Interactive Diplomatic World Map SVG showing bilateral relations & crisis hotspots.
 */
export function renderWorldDiplomacySvg(country, diplomacy, crisisAlert) {
  const proj = (lat, lon) => [((lon + 180) / 360) * 600, ((90 - lat) / 180) * 260];
  const [hx, hy] = proj(country.coordinates.lat, country.coordinates.lon);

  return `
    <svg viewBox="0 0 600 260" style="width:100%;height:auto;background:linear-gradient(180deg,#051029,#030816);border-radius:12px;border:1px solid rgba(212,175,55,0.35);">
      <g stroke="rgba(56,189,248,0.12)" stroke-width="1">
        <line x1="0" y1="130" x2="600" y2="130"/>
        <line x1="300" y1="0" x2="300" y2="260"/>
      </g>
      ${diplomacy.map(p => {
        const [px, py] = proj(p.coordinates.lat, p.coordinates.lon);
        const col = p.relation >= 68 ? '#10b981' : p.relation >= 48 ? '#38bdf8' : '#ef4444';
        return `
          <g>
            <path d="M ${hx} ${hy} Q ${(hx + px) / 2} ${Math.min(hy, py) - 25} ${px} ${py}" fill="none" stroke="${col}" stroke-width="1.7" stroke-dasharray="4 3" opacity="0.75"/>
            <circle cx="${px}" cy="${py}" r="6" fill="${col}" stroke="#fff" stroke-width="1.2"/>
            <text x="${px + 9}" y="${py + 4}" fill="#e2e8f0" font-size="11" font-weight="600">${p.name} (${Math.round(p.relation)}%)</text>
          </g>
        `;
      }).join('')}
      ${crisisAlert && crisisAlert.coords ? (() => {
        const [cx, cy] = proj(crisisAlert.coords.lat, crisisAlert.coords.lon);
        return `
          <circle cx="${cx}" cy="${cy}" r="14" fill="rgba(239,68,68,0.25)" stroke="#ef4444" stroke-width="2"/>
          <text x="${cx}" y="${cy - 16}" text-anchor="middle" fill="#fca5a5" font-size="10" font-weight="700">ALERTA GLOBAL</text>
        `;
      })() : ''}
      <circle cx="${hx}" cy="${hy}" r="8" fill="#f5d061" stroke="#040814" stroke-width="2"/>
      <text x="${hx + 11}" y="${hy + 4}" fill="#f5d061" font-size="12" font-weight="800">${country.name} (Sede)</text>
    </svg>
  `;
}

/**
 * Renders the Indicator History Modal ("Clique em cada indicador para visualizar seu histórico e causas").
 */
export function renderIndicatorModal(state, country, key) {
  const val = state.indicators[key];
  const contributors = (state.indicatorContributors[key] || []).slice(-10).reverse();
  const decimals = key === 'exchangeRate' ? country.currency.decimals : (key === 'countryRisk' ? 0 : 2);
  const title = humanIndicatorName(key);

  return `
    <div class="modal-backdrop" data-close-modal="1">
      <div class="modal-box" role="dialog" aria-modal="true" aria-label="Histórico de ${title}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;">
          <div>
            <span class="badge badge-cyan">Evolução Histórica</span>
            <h2 style="margin:6px 0 0;">${title}: <span class="text-gold">${Number(val).toFixed(decimals)}</span></h2>
          </div>
          <button class="btn btn-sm" data-close-modal="1">Fechar</button>
        </div>
        ${renderLineChartSvg(state.history, key, decimals)}
        <h3 style="margin:18px 0 8px;font-size:1rem;">Decisões e fatores que alteraram este indicador</h3>
        ${contributors.length ? `
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${contributors.map(c => `
              <div class="kpi-mini-box" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                <div>
                  <div style="font-weight:600;font-size:0.88rem;">${c.label}</div>
                  <div class="text-muted" style="font-size:0.78rem;">${c.dateLabel}</div>
                </div>
                <span class="badge ${c.delta >= 0 ? 'badge-cyan' : 'badge-amber'}">${c.delta >= 0 ? '+' : ''}${c.delta.toFixed(decimals)}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p class="text-muted">Nenhuma alteração registrada além da linha de base inicial.</p>'}
      </div>
    </div>
  `;
}

/**
 * Renders the "POR QUE ISSO ACONTECEU?" Explanatory Causal Panel.
 */
export function renderExplainerModal(state) {
  const latest = state.causalLog[0];
  const earlier = state.causalLog.slice(1, 5);

  return `
    <div class="modal-backdrop" data-close-modal="1">
      <div class="modal-box" role="dialog" aria-modal="true" aria-label="Por que isso aconteceu?">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;">
          <div>
            <span class="badge badge-gold">Análise Causal da Simulação</span>
            <h2 style="margin:6px 0 0;">POR QUE ISSO ACONTECEU?</h2>
          </div>
          <button class="btn btn-sm" data-close-modal="1">Fechar</button>
        </div>

        ${latest ? `
          <div class="glass-panel cyan-edge" style="padding:16px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
              <strong class="text-gold">${latest.title}</strong>
              <span class="badge badge-cyan">Trimestre ${latest.quarter}</span>
            </div>
            <p style="margin:8px 0;">${latest.summary}</p>

            <div class="causal-chain" aria-label="Cadeia de consequências">
              ${latest.chain.map((node, i) => `
                <span class="chain-node">${node}</span>
                ${i < latest.chain.length - 1 ? '<span class="chain-arrow">→</span>' : ''}
              `).join('')}
            </div>

            <div class="cards-grid" style="margin-top:10px;">
              <div class="kpi-mini-box">
                <div class="lbl">1. Decisão / Evento</div>
                <div style="font-size:0.86rem;margin-top:4px;">${latest.decisionText}</div>
              </div>
              <div class="kpi-mini-box">
                <div class="lbl">2. Mecanismo Econômico</div>
                <div style="font-size:0.86rem;margin-top:4px;">${latest.mechanism}</div>
              </div>
              <div class="kpi-mini-box">
                <div class="lbl">3. Por que o Dólar / Câmbio moveu</div>
                <div style="font-size:0.86rem;margin-top:4px;">${latest.fxReason}</div>
              </div>
              <div class="kpi-mini-box">
                <div class="lbl">4. Fatores Internos vs Externos</div>
                <div style="font-size:0.84rem;margin-top:4px;">
                  <strong>Interno:</strong> ${(latest.internalContributors || []).join('; ')}<br/>
                  <strong>Externo:</strong> ${(latest.externalContributors || []).join('; ')}
                </div>
              </div>
            </div>

            <div class="kpi-mini-box" style="margin-top:10px;border-color:rgba(212,175,55,0.4);">
              <div class="lbl">5. Consequências Futuras Possíveis</div>
              <div style="font-size:0.86rem;margin-top:4px;">${latest.futureConsequences}</div>
            </div>
          </div>
        ` : ''}

        ${earlier.length ? `
          <h3 style="margin:10px 0 8px;font-size:0.95rem;">Registros anteriores</h3>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${earlier.map(c => `
              <div class="kpi-mini-box">
                <div style="display:flex;justify-content:space-between;">
                  <strong>${c.title}</strong>
                  <span class="text-muted">T${c.quarter}</span>
                </div>
                <div class="text-secondary" style="font-size:0.84rem;margin-top:4px;">${c.fxReason}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
