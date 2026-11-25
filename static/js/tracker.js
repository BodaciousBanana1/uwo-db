// Discoveries you have found, kept in this browser (localStorage); no account needed.
// Used by discovery pages (Mark as found), the Discoveries list (column, filter,
// progress, export/import) and the Skill Planner (hide found).
const UWOTracker = (() => {
  const KEY = 'uwo-found-discoveries';
  const listeners = [];
  let found = new Set();

  function load() {
    try { found = new Set(JSON.parse(localStorage.getItem(KEY) || '[]').map(String)); }
    catch (e) { found = new Set(); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify([...found].sort())); } catch (e) { /* private mode */ }
    listeners.forEach(fn => fn());
  }
  load();
  // keep other open tabs in sync
  window.addEventListener('storage', e => { if (e.key === KEY) { load(); listeners.forEach(fn => fn()); } });

  return {
    has: id => found.has(String(id)),
    size: () => found.size,
    all: () => [...found],
    toggle(id, on) {
      id = String(id);
      if (on === undefined) on = !found.has(id);
      on ? found.add(id) : found.delete(id);
      save();
      return on;
    },
    onChange(fn) { listeners.push(fn); },
    exportText: () => JSON.stringify({ format: 'uwo-wiki-discoveries', version: 1, found: [...found].sort() }),
    // accepts this export format or a plain JSON array of ids; merges by default
    importText(text, replace = false) {
      const data = JSON.parse(text);
      const ids = Array.isArray(data) ? data : (data && data.found) || [];
      if (!Array.isArray(ids)) throw new Error('No discovery list found');
      if (replace) found = new Set();
      const before = found.size;
      ids.forEach(id => /^\d{8}$/.test(String(id)) && found.add(String(id)));
      save();
      return found.size - before;
    },
  };
})();
