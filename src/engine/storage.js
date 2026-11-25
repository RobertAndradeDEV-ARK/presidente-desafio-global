const SAVE_KEY = 'presidente_desafio_global_save_v1';
const PREFS_KEY = 'presidente_desafio_global_prefs_v1';

export function saveGame(state) {
  try {
    const payload = {
      savedAt: new Date().toISOString(),
      state
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('Falha ao salvar no localStorage:', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.state ? parsed : null;
  } catch (e) {
    return null;
  }
}

export function clearSavedGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    // ignore
  }
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : { liteMode: false, reducedMotion: false, animSpeed: 1 };
  } catch {
    return { liteMode: false, reducedMotion: false, animSpeed: 1 };
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}
