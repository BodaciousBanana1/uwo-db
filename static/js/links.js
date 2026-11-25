// Link game-data names (items, ships, ports, skills, ...) to their pages from
// client-rendered lists. Same lookup as templates/macros/link.html: the page
// embeds the needed data/links/<section>.json files via
// templates/partials/link_index.html as window.UWO_LINK_INDEX.
const UWO = (() => {
  const index = window.UWO_LINK_INDEX || {};
  const base = window.UWO_BASE_URL || '';
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
  // Zola's slugify: ASCII-fold, lowercase, runs of other characters -> '-'
  const slugify = s => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  // some data strings carry HTML entities ("Karnak &amp; Luxor"); decode the common ones
  const UNESC = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'" };
  const unesc = s => String(s ?? '').replace(/&(amp|lt|gt|quot|#39|#x27);/g, m => UNESC[m]);
  const DIRS = { lp_maps: 'maps', map_ids: 'maps' };

  // URL of the page for `name` (or `slug`/`key`) in the first section that has it, else null
  function url(secs, name, { slug = '', key = '' } = {}) {
    name = unesc(name);
    const ks = slugify(slug), kn = slugify(name);
    for (const sec of secs.split(',')) {
      const idx = index[sec];
      if (!idx) continue;
      const hit = (key && idx[key]) || (ks && idx[ks]) || (kn && idx[kn]);
      if (hit) return `${base}/${DIRS[sec] || sec}/${hit}/`;
    }
    return null;
  }

  // <a> to the page; names with no page link to a site search (class "unlinked")
  function link(secs, name, { slug = '', key = '', cls = '', label } = {}) {
    name = unesc(name);
    const text = esc(unesc(label ?? name));
    if (!name && !key) return text;
    const u = url(secs, name, { slug, key });
    if (u) return `<a href="${esc(u)}" class="xref${cls ? ' ' + esc(cls) : ''}">${text}</a>`;
    return `<a href="${esc(base)}/?q=${encodeURIComponent(name)}" class="xref unlinked${cls ? ' ' + esc(cls) : ''}" title="No page for this yet: search the site">${text}</a>`;
  }

  return { esc, slugify, url, link };
})();
