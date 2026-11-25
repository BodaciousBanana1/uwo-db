// Accessibility helpers, loaded on every page (templates/base.html), for patterns that repeat
// across many templates:
//   - names for filter controls from their section heading (WCAG 1.3.1, 4.1.2),
//   - a polite screen-reader announcement when a list's result count changes (4.1.3),
//   - the ARIA tab pattern, with arrow keys, for city tabs and comment tabs (4.1.2, 2.1.1),
//   - column scope on table headings, and hiding decorative SVG icons.
(() => {
  const titleCase = s => s.toLowerCase().replace(/(^|[\s(/-])\p{L}/gu, m => m.toUpperCase());
  const hasName = el => el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') ||
    (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest('label');
  let uid = 0;
  const idFor = (el, prefix) => el.id || (el.id = `${prefix}-${++uid}`);

  // --- decorative icons ---
  function hideIcons(root = document) {
    root.querySelectorAll('svg:not([aria-hidden]):not([role]):not([aria-label])').forEach(svg => {
      if (!svg.querySelector('title')) { svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); }
    });
  }

  // --- filter panels: group each section under its heading, name its controls ---
  function labelFilters() {
    document.querySelectorAll('.filter-section').forEach(section => {
      const header = section.querySelector('.filter-section-header');
      if (!header) return;
      // the heading text without hints such as "incl. pull skill"
      const clone = header.cloneNode(true);
      clone.querySelectorAll('.filter-hint').forEach(n => n.remove());
      const name = titleCase(clone.textContent.trim());
      if (!name) return;
      header.setAttribute('role', 'heading');
      header.setAttribute('aria-level', '2');
      section.setAttribute('role', 'group');
      section.setAttribute('aria-label', name);
      section.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(el => {
        if (hasName(el)) return;
        if (el.classList.contains('range-lower')) el.setAttribute('aria-label', `${name} minimum`);
        else if (el.classList.contains('range-upper')) el.setAttribute('aria-label', `${name} maximum`);
        // "Search" alone doesn't say what is searched: "Search: Ship name"
        else if (name === 'Search' && el.placeholder) el.setAttribute('aria-label', `Search: ${el.placeholder.replace(/(\.\.\.|…)$/, '')}`);
        else el.setAttribute('aria-label', name);
      });
    });
    const panel = document.querySelector('.filter-panel');
    if (panel && !panel.hasAttribute('aria-label')) panel.setAttribute('aria-label', 'Filters');
    // anything still unnamed (search boxes outside a filter panel): use its placeholder
    document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea').forEach(el => {
      if (hasName(el)) return;
      // <label>Text</label><select> written next to each other without for=
      const prev = el.previousElementSibling;
      if (prev && prev.tagName === 'LABEL' && !prev.htmlFor && !prev.querySelector('input,select,textarea')) {
        prev.htmlFor = idFor(el, 'field');
      } else if (el.placeholder) {
        el.setAttribute('aria-label', el.placeholder.replace(/(\.\.\.|…)$/, ''));
      }
    });
  }

  // --- result counts: announce "12 of 300 vessels" once typing pauses ---
  function announceCounts() {
    const counts = ['visible-count', 'quest-count', 'results-count']
      .map(id => document.getElementById(id)).filter(Boolean);
    if (!counts.length) return;
    const status = document.createElement('div');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    document.body.appendChild(status);
    counts.forEach(el => {
      const context = el.closest('.page-subtitle, .results-summary, .section-count, p, div') || el;
      if (context.matches('[role=status]')) return;  // already a live region
      let timer, last = context.textContent.trim().replace(/\s+/g, ' ');
      new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const text = context.textContent.trim().replace(/\s+/g, ' ');
          if (text && text !== last) { last = text; status.textContent = text; }
        }, 700);
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  // --- tabs ---
  function initTabs(listSel, tabSel, panelFor) {
    document.querySelectorAll(listSel).forEach(list => {
      const tabs = [...list.querySelectorAll(tabSel)];
      if (!tabs.length) return;
      list.setAttribute('role', 'tablist');
      tabs.forEach(tab => {
        const panel = panelFor(tab);
        tab.setAttribute('role', 'tab');
        idFor(tab, 'tab');
        if (panel) {
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', tab.id);
          if (!panel.hasAttribute('tabindex')) panel.tabIndex = 0;
          tab.setAttribute('aria-controls', panel.id);
        }
      });
      // the page's own click handlers move the "active" class; mirror it into ARIA
      const sync = () => tabs.forEach(t => {
        const on = t.classList.contains('active');
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
      });
      tabs.forEach(t => new MutationObserver(sync).observe(t, { attributes: true, attributeFilter: ['class'] }));
      sync();
      list.addEventListener('keydown', e => {
        const i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        const t = tabs[(next + tabs.length) % tabs.length];
        t.focus();
        t.click();
      });
    });
  }

  // --- tables: header cells in <thead> label their columns ---
  function scopeTables() {
    document.querySelectorAll('thead th:not([scope])').forEach(th => th.setAttribute('scope', 'col'));
  }

  const start = () => {
    hideIcons();
    labelFilters();
    announceCounts();
    initTabs('.tab-buttons', '.tab-btn', t => document.getElementById(`${t.dataset.tab}-tab`));
    initTabs('.comments-tabs', '.comment-tab', t => document.getElementById(`${t.dataset.tab}-panel`));
    scopeTables();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
