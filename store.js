(() => {
  const CFG_KEY = 'fw-kasse-config';
  const ART_KEY = 'fw-kasse-articles';
  const SESSION_KEY = 'fw-admin-ok';
  const defaults = { adminPin: '' };

  const getConfig = () => {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(CFG_KEY) || '{}') };
    } catch {
      return { ...defaults };
    }
  };
  const saveConfig = cfg => localStorage.setItem(CFG_KEY, JSON.stringify(cfg));

  // localStorage hat Vorrang, articles.js ist die Vorlage
  const TEMPLATE = typeof articles !== 'undefined' ? JSON.parse(JSON.stringify(articles)) : [];
  const getTemplate = () => JSON.parse(JSON.stringify(TEMPLATE));
  const getArticles = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(ART_KEY) || 'null');
      if (Array.isArray(stored)) return stored;
    } catch { /* ignorieren */ }
    return getTemplate();
  };
  const saveArticles = list => localStorage.setItem(ART_KEY, JSON.stringify(list));
  const resetArticles = () => localStorage.removeItem(ART_KEY);

  const openAdmin = () => {
    const cfg = getConfig();
    if (cfg.adminPin) {
      const input = prompt('Admin-PIN eingeben:');
      if (input === null) return;
      if (input !== cfg.adminPin) {
        alert('Falsche PIN.');
        return;
      }
    } else {
      const pin = prompt('Noch keine PIN vorhanden. Neue PIN festlegen (leer = keine PIN):');
      if (pin === null) return;
      if (pin) {
        cfg.adminPin = pin;
        saveConfig(cfg);
      }
    }
    sessionStorage.setItem(SESSION_KEY, '1');
    location.href = './admin.html';
  };

  const isAdminAuthorized = () =>
    !getConfig().adminPin || sessionStorage.getItem(SESSION_KEY) === '1';

  window.FWStore = {
    getConfig, saveConfig, getArticles, saveArticles,
    getTemplate, resetArticles, openAdmin, isAdminAuthorized,
    logout: () => sessionStorage.removeItem(SESSION_KEY)
  };

  // Globale Liste mit gespeicherten Artikeln überschreiben (falls vorhanden)
  window.articles = getArticles();
})();
