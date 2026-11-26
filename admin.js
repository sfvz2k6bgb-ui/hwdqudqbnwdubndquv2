(() => {
  if (!FWStore.isAdminAuthorized()) {
    location.replace('./index.html');
    return;
  }

  const form = document.getElementById('configForm');
  const listEl = document.getElementById('articleList');
  let list = [];

  const renderArticles = () => {
    listEl.innerHTML = '';
    list.forEach((a, i) => {
      const row = document.createElement('div');
      row.className = 'art-row';
      if (a.separator) {
        row.innerHTML = '<hr>';
      } else {
        row.innerHTML =
          `<input data-f="name" placeholder="Name" value="${(a.name || '').replace(/"/g, '&quot;')}">` +
          `<input data-f="price" type="number" step="0.01" min="0" placeholder="Preis" value="${a.price ?? ''}">` +
          `<input data-f="pfand" type="number" step="0.01" min="0" placeholder="Pfand" value="${a.pfand ?? 0}">`;
        row.querySelectorAll('input').forEach(inp =>
          inp.addEventListener('input', () => {
            const f = inp.dataset.f;
            a[f] = f === 'name' ? inp.value : parseFloat(inp.value) || 0;
          })
        );
      }
      const mk = (txt, fn) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = txt;
        b.addEventListener('click', fn);
        row.appendChild(b);
      };
      mk('↑', () => move(i, -1));
      mk('↓', () => move(i, 1));
      mk('✕', () => { list.splice(i, 1); renderArticles(); });
      listEl.appendChild(row);
    });

    const bar = document.createElement('div');
    bar.className = 'art-bar';
    const addBtn = (txt, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = txt;
      b.addEventListener('click', fn);
      bar.appendChild(b);
    };
    addBtn('+ Artikel', () => { list.push({ name: '', price: 0, pfand: 0 }); renderArticles(); });
    addBtn('+ Trennlinie', () => { list.push({ separator: true }); renderArticles(); });
    addBtn('Vorlage laden', () => {
      if (confirm('Liste auf Vorlage (articles.js) zurücksetzen?')) {
        list = FWStore.getTemplate();
        renderArticles();
      }
    });
    listEl.appendChild(bar);
  };

  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    renderArticles();
  };

  // Direkt beim Laden befüllen
  const cfg = FWStore.getConfig();
  form.adminPin.value = cfg.adminPin;
  list = FWStore.getArticles();
  renderArticles();

  document.getElementById('backLink').addEventListener('click', () => FWStore.logout());

  form.addEventListener('submit', e => {
    e.preventDefault();
    FWStore.saveConfig({
      adminPin: form.adminPin.value
    });
    FWStore.saveArticles(list.filter(a => a.separator || (a.name && a.name.trim())));
    alert('Gespeichert.');
  });
})();
