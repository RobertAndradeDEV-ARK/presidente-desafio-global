import { EarthScene } from './three/EarthScene.js';
import { createInitialState } from './engine/economicEngine.js';
import { loadGame, saveGame, clearSavedGame, loadPrefs, savePrefs } from './engine/storage.js';
import { CountrySelectView } from './ui/CountrySelectView.js';
import { AcademyView } from './ui/AcademyView.js';
import { CommandCenterView } from './ui/CommandCenterView.js';
import { LegacyView } from './ui/LegacyView.js';
import { getCountryById } from './data/countries.js';

class App {
  constructor() {
    this.root = document.getElementById('app');
    this.prefs = loadPrefs();
    this.activeView = null;
    this.earthScene = null;
    this.gameState = null;

    this.applyMotionClass();
    this.showStartScreen();
  }

  applyMotionClass() {
    document.body.classList.toggle('reduced-motion', !!this.prefs.reducedMotion);
  }

  disposeActive() {
    if (this.earthScene) {
      this.earthScene.dispose();
      this.earthScene = null;
    }
    if (this.activeView && typeof this.activeView.dispose === 'function') {
      this.activeView.dispose();
    }
    this.activeView = null;
  }

  showStartScreen() {
    this.disposeActive();
    const saved = loadGame();
    const savedCountry = saved?.state ? getCountryById(saved.state.countryId) : null;

    this.root.innerHTML = `
      <div class="scene-bg" id="startEarthBg" aria-hidden="true"></div>
      <main class="start-screen">
        <header class="start-topbar">
          <div class="brand-mark">
            <span class="badge badge-gold">Simulação Estratégica 3D</span>
            <span>PRESIDENTE: O DESAFIO GLOBAL</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-sm" id="btnToggleLite">${this.prefs.liteMode ? 'Gráficos 3D: Modo Leve' : 'Gráficos 3D: Completo'}</button>
            <button class="btn btn-sm" id="btnToggleMotion">${this.prefs.reducedMotion ? 'Animações: Reduzidas' : 'Animações: Normais'}</button>
          </div>
        </header>

        <section class="start-hero" aria-labelledby="heroTitle">
          <span class="badge badge-cyan">Centro de Operações Globais</span>
          <h1 id="heroTitle">VOCÊ ESTÁ PRESTES A GOVERNAR UMA NAÇÃO.</h1>
          <p>
            "Suas decisões podem transformar economias, fortalecer países, provocar crises e mudar o equilíbrio mundial. Você está preparado para assumir essa responsabilidade?"
          </p>
          <div class="start-actions">
            <button class="btn btn-primary" id="btnStartExp">INICIAR EXPERIÊNCIA</button>
            <button class="btn btn-cyan" id="btnLearnEcon">APRENDER SOBRE ECONOMIA</button>
            <button class="btn" id="btnContinue" ${saved && saved.state ? '' : 'disabled'}>
              ${saved && saved.state && savedCountry
                ? `CONTINUAR MINHA PRESIDÊNCIA (${savedCountry.name} • T${saved.state.quarter})`
                : 'CONTINUAR MINHA PRESIDÊNCIA (Sem partida salva)'}
            </button>
          </div>
        </section>

        <footer style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:0.78rem;color:var(--text-muted);">
          <span>Base econômica educativa inspirada em dados de Banco Mundial, FMI e Bancos Centrais.</span>
          <span>Controles acessíveis por teclado • Reconhecimento de voz opcional (quando suportado pelo navegador)</span>
        </footer>
      </main>
    `;

    const bgEl = this.root.querySelector('#startEarthBg');
    this.earthScene = new EarthScene(bgEl, {
      liteMode: this.prefs.liteMode,
      reducedMotion: this.prefs.reducedMotion
    });

    this.root.querySelector('#btnStartExp').addEventListener('click', () => this.showCountrySelect());
    this.root.querySelector('#btnLearnEcon').addEventListener('click', () => this.showAcademy(() => this.showStartScreen()));
    this.root.querySelector('#btnContinue').addEventListener('click', () => {
      if (saved && saved.state) {
        this.gameState = saved.state;
        if (this.gameState.finished) {
          this.showLegacy();
        } else {
          this.showCommandCenter();
        }
      }
    });

    this.root.querySelector('#btnToggleLite').addEventListener('click', () => {
      this.prefs.liteMode = !this.prefs.liteMode;
      savePrefs(this.prefs);
      this.showStartScreen();
    });
    this.root.querySelector('#btnToggleMotion').addEventListener('click', () => {
      this.prefs.reducedMotion = !this.prefs.reducedMotion;
      savePrefs(this.prefs);
      this.applyMotionClass();
      this.showStartScreen();
    });
  }

  showCountrySelect() {
    this.disposeActive();
    const view = new CountrySelectView(this.root, this.prefs, {
      onBack: () => this.showStartScreen(),
      onStartCampaign: (countryId, config) => {
        this.gameState = createInitialState(countryId, config);
        saveGame(this.gameState);
        this.showCommandCenter();
      }
    });
    this.activeView = view;
    view.mount();
  }

  showAcademy(returnFn) {
    this.disposeActive();
    const view = new AcademyView(this.root, returnFn);
    this.activeView = view;
    view.render();
  }

  showCommandCenter() {
    this.disposeActive();
    const view = new CommandCenterView(this.root, this.gameState, this.prefs, {
      onStateChange: (st) => {
        this.gameState = st;
        saveGame(st);
      },
      onFinishCampaign: (st) => {
        this.gameState = st;
        saveGame(st);
        this.showLegacy();
      },
      onOpenAcademy: () => this.showAcademy(() => this.showCommandCenter()),
      onExitToHome: () => this.showStartScreen(),
      onTogglePrefs: (nextPrefs) => {
        this.prefs = nextPrefs;
        savePrefs(nextPrefs);
        this.applyMotionClass();
        this.showCommandCenter();
      }
    });
    this.activeView = view;
    view.mount();
  }

  showLegacy() {
    this.disposeActive();
    const view = new LegacyView(this.root, this.gameState, {
      onNewGame: () => {
        clearSavedGame();
        this.showCountrySelect();
      },
      onReviveTimeline: () => {
        // Restore a playable reviewable snapshot or return to command center in read/replay view
        this.gameState.finished = false;
        this.gameState.quarter = this.gameState.config.totalQuarters;
        this.showCommandCenter();
      }
    });
    this.activeView = view;
    view.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__presidenteApp = new App();
});
