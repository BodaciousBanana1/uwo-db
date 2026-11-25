// Small-screen helpers, loaded on every page (templates/base.html). The layout itself is
// in the "Mobile" section at the end of static/css/style.css; this only adds what CSS can't:
//   - the menu button that slides the sidebar in,
//   - a "Filters" button that opens/closes each list page's filter panel,
//   - a column label on every table cell, so list and multi-column tables can show as cards
//     (rows added later by the list scripts get labelled too),
//   - a scroll wrapper round other tables, so wide ones scroll instead of breaking the page.
(() => {
  const small = window.matchMedia('(max-width: 768px)');

  // --- menu drawer ---
  function initMenu() {
    const btn = document.getElementById('menu-toggle');
    const backdrop = document.getElementById('nav-backdrop');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    const isOpen = () => document.body.classList.contains('nav-open');
    // off-screen menu links stay out of the tab order and the accessibility tree (WCAG 2.4.3)
    const syncInert = () => { sidebar.inert = small.matches && !isOpen(); };
    const set = (open, { restoreFocus = false } = {}) => {
      const was = isOpen();
      document.body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open);
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (backdrop) backdrop.hidden = !open;
      syncInert();
      if (open && !was) (sidebar.querySelector('.nav-item.active') || sidebar.querySelector('a')).focus();
      if (!open && was && restoreFocus) btn.focus();
    };
    btn.addEventListener('click', () => set(!isOpen(), { restoreFocus: true }));
    if (backdrop) backdrop.addEventListener('click', () => set(false, { restoreFocus: true }));
    sidebar.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) set(false, { restoreFocus: true }); });
    // keep Tab inside the open drawer and its button
    document.addEventListener('focusin', e => {
      if (small.matches && isOpen() && !sidebar.contains(e.target) && e.target !== btn) set(false);
    });
    small.addEventListener('change', () => set(false));
    syncInert();
    // highlight the current section in the menu
    const path = location.pathname.replace(/\/+$/, '/');
    let best = null;
    for (const a of sidebar.querySelectorAll('.nav-item')) {
      const p = new URL(a.href, location.href).pathname.replace(/\/+$/, '/');
      if (path.startsWith(p) && (!best || p.length > best.p.length)) best = { a, p };
    }
    if (best) {
      best.a.classList.add('active');
      best.a.setAttribute('aria-current', best.p === path ? 'page' : 'true');
    }
  }

  // --- filter panels ---
  function initFilters() {
    document.querySelectorAll('.filter-panel').forEach(panel => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-toggle';
      if (!panel.id) panel.id = 'filter-panel-' + document.querySelectorAll('.filter-toggle').length;
      btn.setAttribute('aria-controls', panel.id);
      const label = panel.dataset.toggleLabel || 'Filters';
      const count = document.getElementById('visible-count');
      const render = () => {
        const open = panel.classList.contains('is-open');
        btn.setAttribute('aria-expanded', open);
        const n = count ? count.textContent.trim() : '';
        btn.innerHTML = `<span>${open ? 'Hide ' + label.toLowerCase() : label}</span>`
          + (n ? `<span class="filter-toggle-count">${/^\d+$/.test(n) ? n + ' shown' : n}</span>` : '')
          + `<span class="filter-toggle-arrow" aria-hidden="true">${open ? '▴' : '▾'}</span>`;
      };
      btn.addEventListener('click', () => {
        panel.classList.toggle('is-open');
        render();
        if (!panel.classList.contains('is-open')) btn.scrollIntoView({ block: 'nearest' });
      });
      if (count) new MutationObserver(render).observe(count, { childList: true, characterData: true, subtree: true });
      if (panel.dataset.toggleOpen !== undefined) panel.classList.add('is-open');
      render();
      panel.before(btn);
    });
  }

  // --- tables ---
  // labels: column headings; title: the column shown as the card's heading
  function labelRows(table, labels, title) {
    for (const tr of table.tBodies[0] ? table.tBodies[0].rows : []) {
      if (tr.cells.length === 1) continue;           // "no results" style rows
      [...tr.cells].forEach((td, i) => {
        const l = labels[i];
        if (l && td.dataset.label !== l) td.dataset.label = l;
        if (i === title) td.classList.add('cell-title');
        const t = td.textContent.trim();
        td.classList.toggle('cell-empty', (t === '' || t === '-' || t === '—') && !td.querySelector('input, img, button'));
      });
    }
  }
  function initTables() {
    // list tables, and detail tables with 3+ headed columns, show as cards on phones
    document.querySelectorAll('table.data-table, table.detail-table').forEach(table => {
      if (!table.classList.contains('data-table') && !(table.tHead && table.tHead.rows[0].cells.length >= 3)) return;
      table.classList.add('card-table');
      const ths = table.tHead ? [...table.tHead.rows[0].cells] : [];
      const labels = ths.map(th => th.textContent.trim());
      // title column: marked with data-card-title, else the first that isn't a tick-box column
      let title = ths.findIndex(th => th.hasAttribute('data-card-title'));
      if (title < 0) title = Math.max(0, ths.findIndex(th => !th.classList.contains('found-col')));
      labelRows(table, labels, title);
      // list scripts re-render rows (or the whole tbody) as filters change
      let queued = false;
      new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; labelRows(table, labels, title); });
      }).observe(table, { childList: true, subtree: true });
    });
    document.querySelectorAll('table:not(.card-table)').forEach(table => {
      if (table.parentElement.classList.contains('table-scroll')) return;
      const wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      table.before(wrap);
      wrap.appendChild(table);
    });
  }

  const start = () => { initMenu(); initFilters(); initTables(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
