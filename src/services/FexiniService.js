const FALLBACK_URLS = ['https://fexini.net/', 'https://fexini.tv/'];
const DOMAIN_PATTERNS = [/https:\/\/fexini\.(net|tv)/, /https?:\/\/[a-zA-Z0-9.-]+fexini[a-zA-Z0-9.-]+\.[a-z]+/];

function d(s) {
  if (!s) return '';
  return s.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/');
}

function extractItems(html) {
  const items = [];
  const seen = new Map();
  const re = /<a[^>]*href="\/programme\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const slug = m[1];
    const inner = m[2];

    let poster = null;
    const pm = inner.match(/src="(https?:\/\/[^"]+)"[^>]*>/i);
    if (pm) {
      const u = pm[1];
      if (!/logo|icon|favicon|avatar|banner|skeleton/i.test(u)) poster = u;
    }

    const ym = inner.match(/>(\d{4})</);
    const year = ym ? ym[1] : '';
    const rm = inner.match(/Note ([\d.]+) sur 10/);
    const rating = rm ? rm[1] : null;
    const tp = inner.match(/>(Film|Série|Serie|Anime|Animé)</);
    let type = '';
    if (tp) {
      const t = tp[1];
      if (t === 'Série') type = 'Serie';
      else if (t === 'Animé') type = 'Anime';
      else type = t;
    }

    if (seen.has(slug)) {
      const idx = seen.get(slug);
      const e = items[idx];
      if (poster && !e.poster) e.poster = poster;
      if (year && !e.year) e.year = year;
      if (rating && !e.rating) e.rating = rating;
      if (type && !e.type) e.type = type;
      if (!e.title || e.title === slug.replace(/-/g, ' ')) {
        const tm2 = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
        if (tm2) e.title = d(tm2[1].replace(/<[^>]*>/g, '').trim());
      }
      continue;
    }

    const tm = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const ta = m[0].match(/title="([^"]+)"/);
    const al = m[0].match(/aria-label="Decouvrir ([^"]+)"/);
    let title = '';
    if (tm) title = d(tm[1].replace(/<[^>]*>/g, '').trim());
    else if (ta) title = d(ta[1]);
    else if (al) title = d(al[1]);
    else title = slug.replace(/-/g, ' ');

    seen.set(slug, items.length);
    items.push({ slug, poster, title, year, rating, type });
  }
  return items;
}

export async function discoverMainDomain(discUrl) {
  const urls = discUrl && !FALLBACK_URLS.includes(discUrl) ? [discUrl, ...FALLBACK_URLS] : FALLBACK_URLS;
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await r.text();
      for (const p of DOMAIN_PATTERNS) {
        const match = html.match(p);
        if (match) {
          const domain = (match[1]?.startsWith('http') ? match[1] : match[0]).replace(/\/+$/, '');
          return domain;
        }
      }
    } catch {}
  }
  throw new Error('Aucun serveur trouvé');
}

export async function fetchPage(base, path = '') {
  try {
    const r = await fetch(base + path, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    return await r.text();
  } catch { return ''; }
}

export async function fetchHomepage(base) {
  const html = await fetchPage(base, '/');
  return extractItems(html);
}

export async function fetchCategory(base, cat, page = 1) {
  const html = await fetchPage(base, `/${cat}${page > 1 ? `?page=${page}` : ''}`);
  return extractItems(html);
}

export async function searchContent(base, q) {
  const html = await fetchPage(base, `/search?q=${encodeURIComponent(q)}`);
  return extractItems(html);
}

export async function fetchContentDetail(base, slug) {
  try {
    const r = await fetch(`${base}/programme/${slug}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await r.text();

    const tm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const title = tm ? d(tm[1].replace(/<[^>]*>/g, '').trim()) : slug.replace(/-/g, ' ');

    const dm = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    const desc = dm ? d(dm[1]) : '';

    const pm = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*>/i);
    const poster = pm ? pm[1] : null;

    const yr = html.match(/"datePublished":\s*"(\d{4})/);
    const year = yr ? yr[1] : (html.match(/\b(19\d{2}|20\d{2})\b/) || [''])[0];

    const rt = html.match(/"ratingValue":\s*([\d.]+)/);
    const rating = rt ? rt[1] : null;

    const tp = html.match(/"@type":\s*"(Movie|TVSeries|TVEpisode)"/);
    let type = '';
    if (tp) {
      if (tp[1] === 'Movie') type = 'Film';
      else if (tp[1] === 'TVSeries') type = 'Serie';
    }
    if (!type) {
      const tt = html.match(/>(Film|Série|Serie|Anime|Animé)</);
      if (tt) {
        const t = tt[1];
        if (t === 'Série') type = 'Serie';
        else if (t === 'Animé') type = 'Anime';
        else type = t;
      }
    }

    const eps = [];
    const links = html.match(/href="\/(watch|programme)\/([^"\\]+?\/episodes[^"]*|[^"]+)"[^>]*>/gi);
    if (links) {
      const seen = new Set();
      for (const l of links) {
        const es = l.match(/href="\/(?:watch|programme)\/([^"]+)"/);
        if (es) {
          const epSlug = es[1];
          if (seen.has(epSlug) || epSlug === slug) continue;
          seen.add(epSlug);
          const epTitle = epSlug.split('/').pop().replace(/-/g, ' ');
          eps.push({ slug: epSlug, title: d(epTitle) });
        }
      }
    }

    return { title, description: desc, poster, year, rating, type, slug, episodes: eps };
  } catch { return null; }
}

export async function fetchWatchPage(base, slug) {
  const sources = [];
  try {
    const r = await fetch(`${base}/watch/${slug}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await r.text();

    const im = html.match(/<iframe[^>]*src="([^"]+)"[^>]*>/i);
    if (im) sources.push({ type: 'iframe', url: im[1].startsWith('http') ? im[1] : base + im[1] });

    const vs = html.match(/<source[^>]*src="([^"]+)"[^>]*>/gi);
    if (vs) {
      for (const v of vs) {
        const sm = v.match(/src="([^"]+)"/i);
        if (sm && !sources.find(s => s.url === sm[1])) sources.push({ type: 'video', url: sm[1] });
      }
    }

    const dm = html.match(/(https?:\/\/[^"'\s]+\.(mp4|m3u8)[^"'\s]*)/i);
    if (dm && !sources.find(s => s.url === dm[1])) sources.push({ type: 'direct', url: dm[1] });

    const embeds = html.match(/https?:\/\/([a-z0-9-]+\.)+[a-z]+\/(embed|e|player)\/[a-zA-Z0-9_-]+/gi);
    if (embeds) {
      for (const e of embeds) {
        if (!sources.find(s => s.url === e)) sources.push({ type: 'iframe', url: e });
      }
    }

    const dataSrc = html.match(/data-video-src="([^"]+)"/i) || html.match(/data-src="([^"]+\.(mp4|m3u8)[^"]*)"/i);
    if (dataSrc && !sources.find(s => s.url === dataSrc[1])) sources.push({ type: 'direct', url: dataSrc[1] });

    const scriptUrls = html.match(/["'](https?:\/\/[^"']+player[^"']*\.php[^"']*)["']/i);
    if (scriptUrls && !sources.find(s => s.url === scriptUrls[1])) sources.push({ type: 'player', url: scriptUrls[1] });

    const configUrls = html.match(/url["' ]*:["' ]*(https?:\/\/[^"']+\.(mp4|m3u8)[^"']*)/i);
    if (configUrls) {
      const u = configUrls[1].replace(/["',;\s]+$/, '').trim();
      if (!sources.find(s => s.url === u)) sources.push({ type: 'direct', url: u });
    }

    if (sources.length === 0) {
      sources.push({ type: 'page', url: `${base}/watch/${slug}` });
    }

    return { sources, title: '' };
  } catch {
    return { sources: [{ type: 'page', url: `${base}/watch/${slug}` }], title: '' };
  }
}
