/* ===================================================
   OMERTA DEFENCE — Admin Content Editors
   Hero, About, Products, Cyber, Contact, Footer editors
   v2: Language tabs for all editors
   =================================================== */

const AdminContent = (() => {
    const LANGS = ['en', 'tr', 'fr', 'ar'];
    const LANG_LABELS = { en: 'EN', tr: 'TR', fr: 'FR', ar: 'AR' };

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    function toast(msg, type) {
        if (window.AdminApp) AdminApp.toast(msg, type);
    }

    // ── Language Tabs Component ──
    function langTabs(activeTab) {
        return `<div class="lang-tabs" id="langTabs" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            ${LANGS.map(l => `<button type="button" class="lang-tab ${l === activeTab ? 'active' : ''}" data-lang="${l}">${LANG_LABELS[l]}</button>`).join('')}
            <button type="button" class="btn btn-outline btn-sm" id="translateAllBtn" style="margin-left:auto;font-size:0.75rem;padding:4px 12px;">
                Translate to All Languages
            </button>
            <span id="translateStatus" style="font-size:0.75rem;color:var(--text-muted);"></span>
        </div>`;
    }

    function bindLangTabs(container, onChange) {
        const tabs = container.querySelector('#langTabs');
        if (!tabs) return;
        tabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-tab');
            if (!btn) return;
            tabs.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            onChange(btn.dataset.lang);
        });
    }

    // ── Translation Engine ──
    const LANG_NAMES = { en: 'English', tr: 'Turkish', fr: 'French', ar: 'Arabic' };

    async function translateToAllLangs(data, activeLang, saveCurrent, draw) {
        // Check if AI module exists
        if (typeof AIProviderManager === 'undefined') {
            toast('AI Provider module not loaded.', 'error');
            return;
        }

        // Check if any provider has an API key
        const statuses = AIProviderManager.getProviderStatuses();
        const hasAnyKey = statuses.some(s => s.hasKey);
        if (!hasAnyKey) {
            toast('No AI API key configured. Go to Settings → AI Integration to add a key.', 'error');
            return;
        }

        saveCurrent();

        const sourceLangData = data[activeLang];
        if (!sourceLangData || Object.keys(sourceLangData).length === 0) {
            toast('No content to translate in current language.', 'error');
            return;
        }

        const targetLangs = LANGS.filter(l => l !== activeLang);
        const statusEl = document.getElementById('translateStatus');
        const btn = document.getElementById('translateAllBtn');

        if (btn) { btn.disabled = true; btn.textContent = 'Translating...'; }

        let successCount = 0;
        const errors = [];

        for (const targetLang of targetLangs) {
            if (statusEl) statusEl.textContent = `→ ${LANG_NAMES[targetLang]}...`;

            try {
                const systemPrompt = `You are a professional translator. Translate the given JSON object's string values from ${LANG_NAMES[activeLang]} to ${LANG_NAMES[targetLang]}.

CRITICAL RULES:
- Return a JSON object with the EXACT SAME keys/structure as the input.
- Only translate the string values, never change key names.
- Keep HTML tags like <br>, &copy; etc. unchanged.
- Keep brand names like "OMERTA", "DEFENCE" unchanged.
- If values are inside arrays of objects, translate each object's string values.
- For Arabic: use proper Arabic text.
- Return ONLY the JSON object. No explanation, no markdown, no code fences.`;

                const userPrompt = `Translate this JSON from ${LANG_NAMES[activeLang]} to ${LANG_NAMES[targetLang]}:\n${JSON.stringify(sourceLangData, null, 1)}`;
                const response = await AIProviderManager.send(systemPrompt, userPrompt);
                const result = response.result;

                if (result && typeof result === 'object') {
                    data[targetLang] = result;
                    successCount++;
                } else {
                    errors.push(`${LANG_NAMES[targetLang]}: Invalid response format`);
                }
            } catch (err) {
                const msg = err.message || 'Unknown error';
                errors.push(`${LANG_NAMES[targetLang]}: ${msg}`);
                console.error(`Translation to ${targetLang} failed:`, msg);
            }
        }

        if (btn) { btn.disabled = false; btn.textContent = 'Translate to All Languages'; }
        if (statusEl) statusEl.textContent = '';

        if (successCount > 0) {
            toast(`Translated to ${successCount} language(s)!`, 'success');
            draw();
        }
        if (errors.length > 0) {
            errors.forEach(e => toast(e, 'error'));
        }
    }

    // ── Generic editor builder ──
    function editorShell(breadcrumb, title, fieldsHtml) {
        return `
            <div class="page-header">
                <p class="page-breadcrumb"><a href="#/dashboard">CONTENT</a> / ${breadcrumb}</p>
                <h1 class="page-title">${title}</h1>
            </div>
            <form class="form-section" id="contentEditorForm">
                ${fieldsHtml}
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <button type="button" class="btn btn-outline" id="discardBtn">Discard</button>
                    <div class="form-actions-right">
                        <button type="button" class="btn btn-ghost" id="resetBtn">Reset to Default</button>
                    </div>
                </div>
            </form>`;
    }

    function bindEditorActions(container, storageKey, loadFn) {
        const discardBtn = container.querySelector('#discardBtn');
        const resetBtn = container.querySelector('#resetBtn');

        if (discardBtn) {
            discardBtn.addEventListener('click', () => { loadFn(container); toast('Changes discarded', 'info'); });
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset to default values? This will overwrite your changes.')) {
                    AdminStore.resetContent(storageKey);
                    loadFn(container);
                    toast('Reset to defaults', 'warning');
                }
            });
        }
    }

    function imagePreviewBind(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (input && preview) {
            input.addEventListener('input', () => { preview.src = input.value || ''; });
        }
    }

    // ══════════════════════════════════════
    //  HERO EDITOR (v2 with lang tabs)
    // ══════════════════════════════════════
    function renderHero(container) {
        const key = AdminStore.KEYS.CONTENT_HERO;
        let data = AdminStore.getContent(key);
        if (!data || data._v !== 2) data = AdminStore.getDefault(key);
        let activeLang = 'en';

        function draw() {
            const shared = data._shared || {};
            const langData = data[activeLang] || {};

            container.innerHTML = editorShell('HERO', 'Hero Section Editor', `
                ${langTabs(activeLang)}
                <div class="form-section-title">Hero Content (${LANG_LABELS[activeLang]})</div>
                <div class="form-group">
                    <label class="form-label">Pre-heading</label>
                    <input class="form-input" id="heroPreheading" value="${escHtml(langData.preheading || '')}">
                </div>
                <div class="form-group">
                    <label class="form-label">Title (HTML allowed for &lt;br&gt;)</label>
                    <input class="form-input" id="heroTitle" value="${escHtml(langData.title || '')}">
                </div>
                <div class="form-group">
                    <label class="form-label">Subtitle (HTML allowed)</label>
                    <textarea class="form-textarea" id="heroSubtitle" rows="3">${escHtml(langData.subtitle || '')}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Button 1 Text</label>
                        <input class="form-input" id="heroBtn1Text" value="${escHtml(langData.btn1Text || '')}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Button 2 Text</label>
                        <input class="form-input" id="heroBtn2Text" value="${escHtml(langData.btn2Text || '')}">
                    </div>
                </div>
                <div class="form-section-title mt-24">Shared Settings (all languages)</div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Button 1 Link</label>
                        <input class="form-input" id="heroBtn1Link" value="${escHtml(shared.btn1Link || '')}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Button 2 Link</label>
                        <input class="form-input" id="heroBtn2Link" value="${escHtml(shared.btn2Link || '')}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Background Image URL</label>
                    <input class="form-input" id="heroBg" value="${escHtml(shared.backgroundImage || '')}">
                    <img id="heroBgPreview" class="form-image-preview mt-16" src="${shared.backgroundImage || ''}" alt="Preview">
                </div>
            `);

            imagePreviewBind('heroBg', 'heroBgPreview');
            bindLangTabs(container, (lang) => { saveCurrent(); activeLang = lang; draw(); });
            document.getElementById('translateAllBtn')?.addEventListener('click', () => {
                translateToAllLangs(data, activeLang, saveCurrent, draw).catch(e => { console.error('Translate error:', e); toast('Translation failed: ' + e.message, 'error'); });
            });

            container.querySelector('#contentEditorForm').addEventListener('submit', (e) => {
                e.preventDefault();
                saveCurrent();
                AdminStore.setContent(key, data);
                toast('Hero section saved!', 'success');
            });

            bindEditorActions(container, key, renderHero);
        }

        function saveCurrent() {
            const el = (id) => document.getElementById(id);
            if (!el('heroPreheading')) return;
            data[activeLang] = {
                preheading: el('heroPreheading').value,
                title: el('heroTitle').value,
                subtitle: el('heroSubtitle').value,
                btn1Text: el('heroBtn1Text').value,
                btn2Text: el('heroBtn2Text').value
            };
            data._shared = {
                ...(data._shared || {}),
                btn1Link: el('heroBtn1Link').value,
                btn2Link: el('heroBtn2Link').value,
                backgroundImage: el('heroBg').value
            };
        }

        draw();
    }

    // ══════════════════════════════════════
    //  ABOUT EDITOR (v2)
    // ══════════════════════════════════════
    function renderAbout(container) {
        const key = AdminStore.KEYS.CONTENT_ABOUT;
        let data = AdminStore.getContent(key);
        if (!data || data._v !== 2) data = AdminStore.getDefault(key);
        let activeLang = 'en';

        function draw() {
            const shared = data._shared || {};
            const langData = data[activeLang] || {};
            const langStats = langData.stats || [];

            const statsHtml = (shared.stats || []).map((s, i) => `
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Stat ${i + 1} Number</label><input class="form-input stat-num" type="number" value="${s.number || 0}"></div>
                    <div class="form-group"><label class="form-label">Suffix</label><input class="form-input stat-suf" value="${escHtml(s.suffix || '')}"></div>
                    <div class="form-group"><label class="form-label">Label (${LANG_LABELS[activeLang]})</label><input class="form-input stat-lbl" value="${escHtml((langStats[i] || {}).label || '')}"></div>
                </div>
            `).join('');

            container.innerHTML = editorShell('ABOUT', 'About Section Editor', `
                ${langTabs(activeLang)}
                <div class="form-section-title">About Content (${LANG_LABELS[activeLang]})</div>
                <div class="form-group"><label class="form-label">Section Label</label><input class="form-input" id="aboutLabel" value="${escHtml(langData.sectionLabel || '')}"></div>
                <div class="form-group"><label class="form-label">Title (HTML allowed)</label><input class="form-input" id="aboutTitle" value="${escHtml(langData.title || '')}"></div>
                <div class="form-group"><label class="form-label">Paragraph 1</label><textarea class="form-textarea" id="aboutP1" rows="4">${escHtml(langData.paragraph1 || '')}</textarea></div>
                <div class="form-group"><label class="form-label">Paragraph 2</label><textarea class="form-textarea" id="aboutP2" rows="4">${escHtml(langData.paragraph2 || '')}</textarea></div>
                <div class="form-section-title mt-24">Shared Settings</div>
                <div class="form-group"><label class="form-label">Image URL</label><input class="form-input" id="aboutImg" value="${escHtml(shared.imageUrl || '')}">
                    <img id="aboutImgPreview" class="form-image-preview mt-16" src="${shared.imageUrl || ''}" alt="Preview">
                </div>
                <div class="form-section-title mt-24">Statistics</div>
                ${statsHtml}
            `);

            imagePreviewBind('aboutImg', 'aboutImgPreview');
            bindLangTabs(container, (lang) => { saveCurrent(); activeLang = lang; draw(); });
            document.getElementById('translateAllBtn')?.addEventListener('click', () => { translateToAllLangs(data, activeLang, saveCurrent, draw).catch(e => { console.error('Translate error:', e); toast('Translation failed: ' + e.message, 'error'); }); });
            container.querySelector('#contentEditorForm').addEventListener('submit', (e) => {
                e.preventDefault(); saveCurrent(); AdminStore.setContent(key, data); toast('About section saved!', 'success');
            });
            bindEditorActions(container, key, renderAbout);
        }

        function saveCurrent() {
            const el = (id) => document.getElementById(id);
            if (!el('aboutLabel')) return;
            const nums = container.querySelectorAll('.stat-num');
            const sufs = container.querySelectorAll('.stat-suf');
            const lbls = container.querySelectorAll('.stat-lbl');
            const sharedStats = []; const langStats = [];
            nums.forEach((n, i) => {
                sharedStats.push({ number: parseInt(n.value) || 0, suffix: sufs[i].value });
                langStats.push({ label: lbls[i].value });
            });
            data[activeLang] = {
                sectionLabel: el('aboutLabel').value, title: el('aboutTitle').value,
                paragraph1: el('aboutP1').value, paragraph2: el('aboutP2').value,
                stats: langStats
            };
            data._shared = { ...(data._shared || {}), imageUrl: el('aboutImg').value, stats: sharedStats };
        }

        draw();
    }

    // ══════════════════════════════════════
    //  PRODUCTS OVERVIEW EDITOR (v2)
    // ══════════════════════════════════════
    function renderProducts(container) {
        const key = AdminStore.KEYS.CONTENT_PRODUCTS;
        let data = AdminStore.getContent(key);
        if (!data || data._v !== 2) data = AdminStore.getDefault(key);
        let activeLang = 'en';

        function draw() {
            const langData = data[activeLang] || {};
            const allCounts = AdminStore.getAllCatalogCounts();
            const featured = AdminStore.getFeaturedItems();
            const totalFeatured = Object.values(featured).reduce((a, b) => a + b.length, 0);

            container.innerHTML = editorShell('PRODUCTS', 'Products Overview Editor', `
                ${langTabs(activeLang)}
                <div class="form-section-title">Section Text (${LANG_LABELS[activeLang]})</div>
                <div class="form-group"><label class="form-label">Section Label</label><input class="form-input" id="prodLabel" value="${escHtml(langData.sectionLabel || '')}"></div>
                <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="prodTitle" value="${escHtml(langData.title || '')}"></div>
                <div class="form-group"><label class="form-label">Subtitle</label><input class="form-input" id="prodSubtitle" value="${escHtml(langData.subtitle || '')}"></div>
                <div class="form-section-title mt-24">Featured Products</div>
                <p class="text-muted mb-16">${totalFeatured} item(s) marked as featured.</p>
                <div class="grid-5">
                    ${Object.keys(AdminStore.CATALOG_CATEGORIES).map(slug => {
                        const cat = AdminStore.CATALOG_CATEGORIES[slug];
                        const fc = (featured[slug] || []).length;
                        return `<a href="#/catalogs/${slug}" class="catalog-card" style="padding:20px 16px;">
                            <div class="catalog-card-icon">${cat.icon}</div>
                            <div class="catalog-card-title" style="font-size:0.75rem;">${cat.label}</div>
                            <div class="catalog-card-count">${fc}</div>
                            <div class="catalog-card-count-label">featured</div>
                        </a>`;
                    }).join('')}
                </div>
            `);

            bindLangTabs(container, (lang) => { saveCurrent(); activeLang = lang; draw(); });
            document.getElementById('translateAllBtn')?.addEventListener('click', () => { translateToAllLangs(data, activeLang, saveCurrent, draw).catch(e => { console.error('Translate error:', e); toast('Translation failed: ' + e.message, 'error'); }); });
            container.querySelector('#contentEditorForm').addEventListener('submit', (e) => {
                e.preventDefault(); saveCurrent(); AdminStore.setContent(key, data); toast('Products overview saved!', 'success');
            });
            bindEditorActions(container, key, renderProducts);
        }

        function saveCurrent() {
            const el = (id) => document.getElementById(id);
            if (!el('prodLabel')) return;
            data[activeLang] = { sectionLabel: el('prodLabel').value, title: el('prodTitle').value, subtitle: el('prodSubtitle').value };
        }

        draw();
    }

    // ══════════════════════════════════════
    //  CYBER EDITOR (v2)
    // ══════════════════════════════════════
    function renderCyber(container) {
        const key = AdminStore.KEYS.CONTENT_CYBER;
        let data = AdminStore.getContent(key);
        if (!data || data._v !== 2) data = AdminStore.getDefault(key);
        let activeLang = 'en';
        const iconOptions = ['alert-circle', 'lock', 'zap', 'shield', 'cpu', 'eye', 'crosshair', 'radio'];

        function draw() {
            const shared = data._shared || {};
            const langData = data[activeLang] || {};
            const sharedFeatures = shared.features || [];
            const langFeatures = langData.features || [];

            const featuresHtml = sharedFeatures.map((sf, i) => {
                const lf = langFeatures[i] || {};
                return `<div class="card mb-16" style="padding:16px;">
                    <div class="form-row">
                        <div class="form-group"><label class="form-label">Feature ${i + 1} Title (${LANG_LABELS[activeLang]})</label><input class="form-input cf-title" value="${escHtml(lf.title || '')}"></div>
                        <div class="form-group"><label class="form-label">Icon</label>
                            <select class="form-select cf-icon">${iconOptions.map(ic => `<option value="${ic}" ${ic === sf.icon ? 'selected' : ''}>${ic}</option>`).join('')}</select>
                        </div>
                    </div>
                    <div class="form-group"><label class="form-label">Text (${LANG_LABELS[activeLang]})</label><textarea class="form-textarea cf-text" rows="2">${escHtml(lf.text || '')}</textarea></div>
                </div>`;
            }).join('');

            container.innerHTML = editorShell('CYBER', 'Cyber Section Editor', `
                ${langTabs(activeLang)}
                <div class="form-section-title">Cyber Content (${LANG_LABELS[activeLang]})</div>
                <div class="form-group"><label class="form-label">Section Label</label><input class="form-input" id="cyberLabel" value="${escHtml(langData.sectionLabel || '')}"></div>
                <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="cyberTitle" value="${escHtml(langData.title || '')}"></div>
                <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="cyberDesc" rows="3">${escHtml(langData.description || '')}</textarea></div>
                <div class="form-group"><label class="form-label">CTA Button Text</label><input class="form-input" id="cyberCtaText" value="${escHtml(langData.ctaText || '')}"></div>
                <div class="form-section-title mt-24">Shared Settings</div>
                <div class="form-group"><label class="form-label">Background Image URL</label><input class="form-input" id="cyberBg" value="${escHtml(shared.backgroundImage || '')}">
                    <img id="cyberBgPreview" class="form-image-preview mt-16" src="${shared.backgroundImage || ''}" alt="Preview">
                </div>
                <div class="form-group"><label class="form-label">CTA Link</label><input class="form-input" id="cyberCtaLink" value="${escHtml(shared.ctaLink || '')}"></div>
                <div class="form-section-title mt-24">Features (4 cards)</div>
                ${featuresHtml}
            `);

            imagePreviewBind('cyberBg', 'cyberBgPreview');
            bindLangTabs(container, (lang) => { saveCurrent(); activeLang = lang; draw(); });
            document.getElementById('translateAllBtn')?.addEventListener('click', () => { translateToAllLangs(data, activeLang, saveCurrent, draw).catch(e => { console.error('Translate error:', e); toast('Translation failed: ' + e.message, 'error'); }); });
            container.querySelector('#contentEditorForm').addEventListener('submit', (e) => {
                e.preventDefault(); saveCurrent(); AdminStore.setContent(key, data); toast('Cyber section saved!', 'success');
            });
            bindEditorActions(container, key, renderCyber);
        }

        function saveCurrent() {
            const el = (id) => document.getElementById(id);
            if (!el('cyberLabel')) return;
            const titles = container.querySelectorAll('.cf-title');
            const icons = container.querySelectorAll('.cf-icon');
            const texts = container.querySelectorAll('.cf-text');
            const sharedFeatures = []; const langFeatures = [];
            titles.forEach((t, i) => {
                sharedFeatures.push({ icon: icons[i].value });
                langFeatures.push({ title: t.value, text: texts[i].value });
            });
            data[activeLang] = {
                sectionLabel: el('cyberLabel').value, title: el('cyberTitle').value,
                description: el('cyberDesc').value, ctaText: el('cyberCtaText').value,
                features: langFeatures
            };
            data._shared = { ...(data._shared || {}), backgroundImage: el('cyberBg').value, ctaLink: el('cyberCtaLink').value, features: sharedFeatures };
        }

        draw();
    }

    // ══════════════════════════════════════
    //  CONTACT EDITOR (v2)
    // ══════════════════════════════════════
    function renderContact(container) {
        const key = AdminStore.KEYS.CONTENT_CONTACT;
        let data = AdminStore.getContent(key);
        if (!data || data._v !== 2) data = AdminStore.getDefault(key);
        let activeLang = 'en';

        function draw() {
            const shared = data._shared || {};
            const langData = data[activeLang] || {};

            container.innerHTML = editorShell('CONTACT', 'Contact Section Editor', `
                ${langTabs(activeLang)}
                <div class="form-section-title">Contact Content (${LANG_LABELS[activeLang]})</div>
                <div class="form-group"><label class="form-label">Heading</label><input class="form-input" id="contactHeading" value="${escHtml(langData.heading || '')}"></div>
                <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="contactDesc" rows="3">${escHtml(langData.description || '')}</textarea></div>
                <div class="form-section-title mt-24">Shared Contact Info</div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Headquarters</label><input class="form-input" id="contactHQ" value="${escHtml(shared.headquarters || '')}"></div>
                    <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="contactEmail" value="${escHtml(shared.email || '')}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="contactPhone" value="${escHtml(shared.phone || '')}"></div>
                    <div class="form-group"><label class="form-label">Business Hours</label><input class="form-input" id="contactHours" value="${escHtml(shared.hours || '')}"></div>
                </div>
            `);

            bindLangTabs(container, (lang) => { saveCurrent(); activeLang = lang; draw(); });
            document.getElementById('translateAllBtn')?.addEventListener('click', () => { translateToAllLangs(data, activeLang, saveCurrent, draw).catch(e => { console.error('Translate error:', e); toast('Translation failed: ' + e.message, 'error'); }); });
            container.querySelector('#contentEditorForm').addEventListener('submit', (e) => {
                e.preventDefault(); saveCurrent(); AdminStore.setContent(key, data); toast('Contact section saved!', 'success');
            });
            bindEditorActions(container, key, renderContact);
        }

        function saveCurrent() {
            const el = (id) => document.getElementById(id);
            if (!el('contactHeading')) return;
            data[activeLang] = { heading: el('contactHeading').value, description: el('contactDesc').value };
            data._shared = { ...(data._shared || {}), headquarters: el('contactHQ').value, email: el('contactEmail').value, phone: el('contactPhone').value, hours: el('contactHours').value };
        }

        draw();
    }

    // ══════════════════════════════════════
    //  FOOTER EDITOR (v2)
    // ══════════════════════════════════════
    function renderFooter(container) {
        const key = AdminStore.KEYS.CONTENT_FOOTER;
        let data = AdminStore.getContent(key);
        if (!data || data._v !== 2) data = AdminStore.getDefault(key);
        let activeLang = 'en';

        function draw() {
            const langData = data[activeLang] || {};

            container.innerHTML = editorShell('FOOTER', 'Footer Editor', `
                ${langTabs(activeLang)}
                <div class="form-section-title">Footer Content (${LANG_LABELS[activeLang]})</div>
                <div class="form-group"><label class="form-label">Tagline</label><input class="form-input" id="footerTagline" value="${escHtml(langData.tagline || '')}"></div>
                <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="footerText" rows="2">${escHtml(langData.text || '')}</textarea></div>
                <div class="form-group"><label class="form-label">Copyright Text (HTML)</label><input class="form-input" id="footerCopy" value="${escHtml(langData.copyright || '')}"></div>
            `);

            bindLangTabs(container, (lang) => { saveCurrent(); activeLang = lang; draw(); });
            document.getElementById('translateAllBtn')?.addEventListener('click', () => { translateToAllLangs(data, activeLang, saveCurrent, draw).catch(e => { console.error('Translate error:', e); toast('Translation failed: ' + e.message, 'error'); }); });
            container.querySelector('#contentEditorForm').addEventListener('submit', (e) => {
                e.preventDefault(); saveCurrent(); AdminStore.setContent(key, data); toast('Footer saved!', 'success');
            });
            bindEditorActions(container, key, renderFooter);
        }

        function saveCurrent() {
            const el = (id) => document.getElementById(id);
            if (!el('footerTagline')) return;
            data[activeLang] = { tagline: el('footerTagline').value, text: el('footerText').value, copyright: el('footerCopy').value };
        }

        draw();
    }

    return { renderHero, renderAbout, renderProducts, renderCyber, renderContact, renderFooter };
})();
