/* ===================================================
   OMERTA DEFENCE — Content Loader
   Reads localStorage (od_*) and patches DOM on main site.
   v2: Multi-language support, resolveContent for v1/v2 formats
   =================================================== */

(function () {
    'use strict';

    // ── Security Helpers ──
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    // Allow <br> and &copy; through, escape everything else
    function sanitizeHTML(str) {
        if (!str) return '';
        var safe = escapeHTML(str);
        safe = safe.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
        safe = safe.replace(/&amp;copy;/gi, '&copy;');
        return safe;
    }

    function sanitizeBackgroundUrl(url) {
        if (!url) return '';
        var clean = String(url).replace(/['"()]/g, '');
        if (/^(https?:\/\/|data:image\/)/.test(clean)) {
            return clean;
        }
        return '';
    }

    // ── Helpers ──
    function getLS(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
    function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

    function getLang() {
        if (window.I18n) return I18n.getLang();
        try { return localStorage.getItem('od_site_lang') || 'en'; } catch { return 'en'; }
    }

    // Resolve a field that might be a string (v1) or lang object (v2)
    function resolveLangField(field, lang) {
        if (field === null || field === undefined) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && !Array.isArray(field)) {
            return field[lang] || field.en || '';
        }
        return String(field);
    }

    // Resolve v1/v2 content into flat object for current lang
    function resolveContent(key) {
        const data = getLS(key);
        if (!data) return null;

        // v2 format: merge _shared + lang data
        if (data._v === 2) {
            const lang = getLang();
            const shared = data._shared || {};
            const langData = data[lang] || data.en || {};
            return { ...shared, ...langData, _v: 2, _raw: data };
        }

        // v1 format: return as-is
        return data;
    }

    // SVG icon map (same as cyber section uses)
    const ICONS = {
        'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        'cpu': '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
        'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
        'crosshair': '<circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>',
        'radio': '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>'
    };

    function svgIcon(name) {
        const inner = ICONS[name] || ICONS['shield'];
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
    }

    // ── Patch Functions ──

    function patchHero() {
        const data = resolveContent('od_content_hero');
        if (!data) return;

        if (data.preheading) { const e = qs('.hero-preheading'); if (e) e.textContent = data.preheading; }
        if (data.title) { const e = qs('.hero-title'); if (e) e.innerHTML = sanitizeHTML(data.title); }
        if (data.subtitle) { const e = qs('.hero-subtitle'); if (e) e.innerHTML = sanitizeHTML(data.subtitle); }
        if (data.backgroundImage) { const e = qs('.hero-bg'); const url = sanitizeBackgroundUrl(data.backgroundImage); if (e && url) e.style.backgroundImage = "url('" + url + "')"; }

        const btns = qsa('.hero-buttons .btn');
        if (btns[0] && data.btn1Text) { btns[0].textContent = data.btn1Text; if (data.btn1Link) btns[0].href = data.btn1Link; }
        if (btns[1] && data.btn2Text) { btns[1].textContent = data.btn2Text; if (data.btn2Link) btns[1].href = data.btn2Link; }
    }

    function patchAbout() {
        const raw = getLS('od_content_about');
        if (!raw) return;
        const lang = getLang();

        const section = qs('#about');
        if (!section) return;

        let data;
        if (raw._v === 2) {
            const shared = raw._shared || {};
            const langData = raw[lang] || raw.en || {};
            data = { ...shared, ...langData };

            // Merge stats: shared stats have number/suffix, lang stats have label
            if (shared.stats && langData.stats) {
                data.stats = shared.stats.map((s, i) => ({
                    ...s,
                    ...(langData.stats[i] || {})
                }));
            }
        } else {
            data = raw;
        }

        if (data.sectionLabel) { const e = qs('.section-label', section); if (e) e.textContent = data.sectionLabel; }
        if (data.title) { const e = qs('.section-title', section); if (e) e.innerHTML = sanitizeHTML(data.title); }

        const descs = qsa('.about-description', section);
        if (descs[0] && data.paragraph1) descs[0].textContent = data.paragraph1;
        if (descs[1] && data.paragraph2) descs[1].textContent = data.paragraph2;

        if (data.imageUrl) {
            const img = qs('.about-image img', section);
            if (img) img.src = data.imageUrl;
        }

        if (data.stats && Array.isArray(data.stats)) {
            const stats = qsa('.stat', section);
            data.stats.forEach((s, i) => {
                if (stats[i]) {
                    const num = qs('.stat-number', stats[i]);
                    const suf = qs('.stat-suffix', stats[i]);
                    const lbl = qs('.stat-label', stats[i]);
                    if (num && s.number !== undefined) { num.setAttribute('data-target', s.number); num.textContent = '0'; }
                    if (suf && s.suffix !== undefined) suf.textContent = s.suffix;
                    if (lbl && s.label) lbl.textContent = s.label;
                }
            });
        }
    }

    function patchProducts() {
        const data = resolveContent('od_content_products');
        const section = qs('#products');
        if (!section) return;
        const lang = getLang();

        if (data) {
            if (data.sectionLabel) { const e = qs('.section-label', section); if (e) e.textContent = data.sectionLabel; }
            if (data.title) { const e = qs('.section-title', section); if (e) e.innerHTML = sanitizeHTML(data.title); }
            if (data.subtitle) { const e = qs('.section-subtitle', section); if (e) e.textContent = data.subtitle; }
        }

        // Rebuild product cards from featured catalog items
        const categories = ['small-arms', 'heavy-ordnance', 'launchers', 'drones', 'cyber'];
        let allFeatured = [];
        categories.forEach(cat => {
            const items = getLS('od_catalog_' + cat);
            if (items && Array.isArray(items)) {
                items.filter(i => i.featured && i.status === 'active').forEach(item => {
                    allFeatured.push({ ...item, _category: cat });
                });
            }
        });

        if (allFeatured.length === 0) return; // Keep hardcoded cards

        const grid = qs('.products-grid', section);
        if (!grid) return;

        const learnMoreText = (window.I18n) ? I18n.t('products.learnMore') : 'Learn More';

        grid.innerHTML = '';
        allFeatured.forEach((item, i) => {
            const delay = (i % 4) + 1;
            const card = document.createElement('div');
            card.className = `product-card reveal-up delay-${delay}`;
            const name = resolveLangField(item.name, lang);
            const desc = resolveLangField(item.shortDescription, lang);
            card.innerHTML = `
                <div class="card-image">
                    <img src="${escapeHTML(item.imageUrl || 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&q=80')}" alt="${escapeHTML(name)}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${escapeHTML(name)}</h3>
                    <p class="card-text">${escapeHTML(desc)}</p>
                    <a href="#/products/${escapeHTML(item._category)}" class="card-link">${escapeHTML(learnMoreText)} <span>&rarr;</span></a>
                </div>`;
            grid.appendChild(card);
        });
    }

    function patchCyber() {
        const raw = getLS('od_content_cyber');
        if (!raw) return;
        const lang = getLang();

        const section = qs('#cyber');
        if (!section) return;

        let data;
        if (raw._v === 2) {
            const shared = raw._shared || {};
            const langData = raw[lang] || raw.en || {};
            data = { ...shared, ...langData };
            // Merge features
            if (shared.features && langData.features) {
                data.features = shared.features.map((s, i) => ({
                    ...s,
                    ...(langData.features[i] || {})
                }));
            }
        } else {
            data = raw;
        }

        if (data.sectionLabel) { const e = qs('.section-label', section); if (e) e.textContent = data.sectionLabel; }
        if (data.title) { const e = qs('.section-title', section); if (e) e.innerHTML = sanitizeHTML(data.title); }
        if (data.description) { const e = qs('.cyber-description', section); if (e) e.textContent = data.description; }
        if (data.backgroundImage) { const e = qs('.cyber-bg', section); const url = sanitizeBackgroundUrl(data.backgroundImage); if (e && url) e.style.backgroundImage = "url('" + url + "')"; }

        const ctaBtn = qs('.cyber-panel > .btn', section);
        if (ctaBtn) {
            if (data.ctaText) ctaBtn.textContent = data.ctaText;
            if (data.ctaLink) ctaBtn.href = data.ctaLink;
        }

        if (data.features && Array.isArray(data.features)) {
            const featureEls = qsa('.cyber-feature', section);
            data.features.forEach((f, i) => {
                if (featureEls[i]) {
                    const iconEl = qs('.feature-icon', featureEls[i]);
                    const titleEl = qs('.feature-title', featureEls[i]);
                    const textEl = qs('.feature-text', featureEls[i]);
                    if (iconEl && f.icon) iconEl.innerHTML = svgIcon(f.icon);
                    if (titleEl && f.title) titleEl.textContent = f.title;
                    if (textEl && f.text) textEl.textContent = f.text;
                }
            });
        }
    }

    function patchContact() {
        const data = resolveContent('od_content_contact');
        if (!data) return;

        const section = qs('#contact');
        if (!section) return;

        if (data.heading) { const e = qs('.contact-heading', section); if (e) e.textContent = data.heading; }
        if (data.description) { const e = qs('.contact-description', section); if (e) e.textContent = data.description; }

        const values = qsa('.contact-item-value', section);
        if (values[0] && data.headquarters) values[0].textContent = data.headquarters;
        if (values[1] && data.email) values[1].textContent = data.email;
        if (values[2] && data.phone) values[2].textContent = data.phone;
        if (values[3] && data.hours) values[3].textContent = data.hours;
    }

    function patchFooter() {
        const data = resolveContent('od_content_footer');
        if (!data) return;

        const footer = qs('.footer');
        if (!footer) return;

        if (data.tagline) { const e = qs('.footer-tagline', footer); if (e) e.textContent = data.tagline; }
        if (data.text) { const e = qs('.footer-text', footer); if (e) e.textContent = data.text; }
        if (data.copyright) { const e = qs('.footer-bottom p', footer); if (e) e.innerHTML = sanitizeHTML(data.copyright); }
    }

    function patchSEO() {
        const data = resolveContent('od_settings_seo');
        if (!data) return;

        if (data.pageTitle) document.title = data.pageTitle;
        if (data.metaDescription) {
            const meta = qs('meta[name="description"]');
            if (meta) meta.setAttribute('content', data.metaDescription);
        }
    }

    function patchBranding() {
        const data = getLS('od_settings_branding');
        if (!data) return;

        if (data.logoUrl) {
            qsa('img[alt*="OMERTA"]').forEach(img => { img.src = data.logoUrl; });
        }
    }

    // ── Run All Patches ──
    function patchAll() {
        patchSEO();
        patchBranding();
        patchHero();
        patchAbout();
        patchProducts();
        patchCyber();
        patchContact();
        patchFooter();
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchAll);
    } else {
        patchAll();
    }

    // Cross-tab live sync
    window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('od_')) {
            patchAll();
        }
    });

    // Re-patch on language change
    window.addEventListener('langchange', () => {
        patchAll();
    });

    // Export for router use
    window.ContentLoader = { patchAll, resolveContent, resolveLangField, getLang, escapeHTML, sanitizeHTML };
})();
