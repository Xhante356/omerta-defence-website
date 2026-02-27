/* ===================================================
   OMERTA DEFENCE — Admin Catalogs
   Per-category product catalog management
   v2: Multi-language support in item modal
   =================================================== */

const AdminCatalogs = (() => {
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

    function resolveName(item) {
        if (typeof item.name === 'object') return item.name.en || Object.values(item.name).find(v => v) || '';
        return item.name || '';
    }

    function resolveField(field, lang) {
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && field !== null) return field[lang || 'en'] || field.en || '';
        return '';
    }

    // ── Catalog Overview ──
    function renderOverview(container) {
        const counts = AdminStore.getAllCatalogCounts();
        const cats = AdminStore.CATALOG_CATEGORIES;

        container.innerHTML = `
            <div class="page-header">
                <p class="page-breadcrumb">CATALOGS</p>
                <h1 class="page-title">Product Catalogs</h1>
                <p class="page-subtitle">Manage products across five defence domains</p>
            </div>
            <div class="grid-5">
                ${Object.keys(cats).map(slug => `
                    <a href="#/catalogs/${slug}" class="catalog-card">
                        <div class="catalog-card-icon">${cats[slug].icon}</div>
                        <div class="catalog-card-title">${cats[slug].label}</div>
                        <div class="catalog-card-count">${counts[slug] || 0}</div>
                        <div class="catalog-card-count-label">items</div>
                    </a>
                `).join('')}
            </div>`;
    }

    // ── Single Category View ──
    function renderCategory(container, params) {
        const slug = params.slug;
        const cat = AdminStore.CATALOG_CATEGORIES[slug];
        if (!cat) { container.innerHTML = '<p>Category not found.</p>'; return; }

        let items = AdminStore.getCatalog(slug);
        let viewMode = 'table';
        let filterStatus = 'all';
        let searchQuery = '';

        function draw() {
            let filtered = items;
            if (filterStatus !== 'all') filtered = filtered.filter(i => i.status === filterStatus);
            if (searchQuery) filtered = filtered.filter(i => resolveName(i).toLowerCase().includes(searchQuery.toLowerCase()));

            container.innerHTML = `
                <div class="page-header">
                    <p class="page-breadcrumb"><a href="#/catalogs">CATALOGS</a> / ${cat.label.toUpperCase()}</p>
                    <h1 class="page-title">${cat.icon} ${cat.label}</h1>
                    <p class="page-subtitle">${items.length} item(s) total</p>
                </div>
                <div class="flex-between mb-16">
                    <div class="filter-bar" style="margin-bottom:0;">
                        <div class="search-input">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input class="form-input" id="catSearch" placeholder="Search items..." value="${escHtml(searchQuery)}">
                        </div>
                        <select class="form-select" id="catStatusFilter">
                            <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>All Status</option>
                            <option value="active" ${filterStatus === 'active' ? 'selected' : ''}>Active</option>
                            <option value="draft" ${filterStatus === 'draft' ? 'selected' : ''}>Draft</option>
                            <option value="archived" ${filterStatus === 'archived' ? 'selected' : ''}>Archived</option>
                        </select>
                        <div class="btn-group">
                            <button class="btn-icon ${viewMode === 'table' ? 'active' : ''}" id="viewTable" title="Table view">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                            </button>
                            <button class="btn-icon ${viewMode === 'grid' ? 'active' : ''}" id="viewGrid" title="Grid view">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            </button>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-sm" id="addItemBtn">+ Add Item</button>
                </div>
                <div id="catalogItemsContainer">
                    ${filtered.length === 0 ? renderEmpty() : (viewMode === 'table' ? renderTable(filtered) : renderGrid(filtered))}
                </div>`;

            bindEvents(container, slug);
        }

        draw();

        function bindEvents(c, slug) {
            c.querySelector('#catSearch')?.addEventListener('input', (e) => { searchQuery = e.target.value; draw(); });
            c.querySelector('#catStatusFilter')?.addEventListener('change', (e) => { filterStatus = e.target.value; draw(); });
            c.querySelector('#viewTable')?.addEventListener('click', () => { viewMode = 'table'; draw(); });
            c.querySelector('#viewGrid')?.addEventListener('click', () => { viewMode = 'grid'; draw(); });
            c.querySelector('#addItemBtn')?.addEventListener('click', () => openItemModal(slug, null, () => { items = AdminStore.getCatalog(slug); draw(); }));

            c.addEventListener('click', (e) => {
                const target = e.target.closest('[data-action]');
                if (!target) return;
                const action = target.dataset.action;
                const id = target.dataset.id;

                if (action === 'edit') {
                    const item = items.find(i => i.id === id);
                    openItemModal(slug, item, () => { items = AdminStore.getCatalog(slug); draw(); });
                } else if (action === 'duplicate') {
                    AdminStore.duplicateCatalogItem(slug, id);
                    items = AdminStore.getCatalog(slug); toast('Item duplicated', 'success'); draw();
                } else if (action === 'archive') {
                    AdminStore.updateCatalogItem(slug, id, { status: 'archived' });
                    items = AdminStore.getCatalog(slug); toast('Item archived', 'info'); draw();
                } else if (action === 'delete') {
                    if (confirm('Delete this item permanently?')) {
                        AdminStore.deleteCatalogItem(slug, id);
                        items = AdminStore.getCatalog(slug); toast('Item deleted', 'warning'); draw();
                    }
                } else if (action === 'toggle-featured') {
                    const item = items.find(i => i.id === id);
                    if (item) { AdminStore.updateCatalogItem(slug, id, { featured: !item.featured }); items = AdminStore.getCatalog(slug); draw(); }
                } else if (action === 'move-up') {
                    const idx = items.findIndex(i => i.id === id);
                    if (idx > 0) { [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]]; AdminStore.setCatalog(slug, items); draw(); }
                } else if (action === 'move-down') {
                    const idx = items.findIndex(i => i.id === id);
                    if (idx < items.length - 1) { [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]]; AdminStore.setCatalog(slug, items); draw(); }
                }
            });
        }
    }

    function renderEmpty() {
        return `<div class="empty-state"><div class="empty-state-icon">&#128230;</div><p class="empty-state-title">NO ITEMS YET</p><p class="empty-state-text">Add your first product to this catalog.</p></div>`;
    }

    function renderTable(items) {
        const rows = items.map(item => `
            <tr>
                <td>${item.imageUrl ? `<img src="${escHtml(item.imageUrl)}" class="table-thumbnail" alt="">` : '-'}</td>
                <td><strong>${escHtml(resolveName(item))}</strong></td>
                <td class="truncate" style="max-width:200px">${escHtml(resolveField(item.shortDescription, 'en'))}</td>
                <td><span class="badge badge-${item.status}">${item.status}</span></td>
                <td><button class="star-toggle ${item.featured ? 'active' : ''}" data-action="toggle-featured" data-id="${item.id}" title="Toggle featured">&#9733;</button></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" data-action="move-up" data-id="${item.id}" title="Move up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg></button>
                        <button class="btn-icon" data-action="move-down" data-id="${item.id}" title="Move down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
                        <button class="btn-icon" data-action="edit" data-id="${item.id}" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button class="btn-icon" data-action="duplicate" data-id="${item.id}" title="Duplicate"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                        <button class="btn-icon" data-action="archive" data-id="${item.id}" title="Archive"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/></svg></button>
                        <button class="btn-icon" data-action="delete" data-id="${item.id}" title="Delete" style="color:var(--danger)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                </td>
            </tr>`).join('');

        return `<div class="table-wrapper"><table class="admin-table">
            <thead><tr><th>Image</th><th>Name</th><th>Description</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>${rows}</tbody>
        </table></div>`;
    }

    function renderGrid(items) {
        const cards = items.map(item => `
            <div class="card" style="padding:0;overflow:hidden;">
                <img src="${item.imageUrl || 'https://via.placeholder.com/300x180/1a1a1a/888?text=No+Image'}" style="width:100%;height:150px;object-fit:cover;" alt="">
                <div style="padding:16px;">
                    <div class="flex-between mb-16">
                        <strong>${escHtml(resolveName(item))}</strong>
                        <button class="star-toggle ${item.featured ? 'active' : ''}" data-action="toggle-featured" data-id="${item.id}">&#9733;</button>
                    </div>
                    <p class="text-muted" style="font-size:0.8rem;margin-bottom:12px;">${escHtml(resolveField(item.shortDescription, 'en')).substring(0, 80)}...</p>
                    <span class="badge badge-${item.status}">${item.status}</span>
                    <div class="table-actions mt-16">
                        <button class="btn-icon" data-action="edit" data-id="${item.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button class="btn-icon" data-action="duplicate" data-id="${item.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                        <button class="btn-icon" data-action="delete" data-id="${item.id}" style="color:var(--danger)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                </div>
            </div>`).join('');

        return `<div class="grid-3">${cards}</div>`;
    }

    // ── Item Add/Edit Modal with lang tabs ──
    function openItemModal(slug, existingItem, onSave) {
        const isEdit = !!existingItem;
        const item = existingItem ? JSON.parse(JSON.stringify(existingItem)) : {
            name: { en: '', tr: '', fr: '', ar: '' },
            shortDescription: { en: '', tr: '', fr: '', ar: '' },
            fullDescription: { en: '', tr: '', fr: '', ar: '' },
            imageUrl: '', specs: [], featured: false, status: 'active'
        };

        // Ensure v2 format for lang fields
        ['name', 'shortDescription', 'fullDescription'].forEach(f => {
            if (typeof item[f] === 'string') {
                const val = item[f];
                item[f] = { en: val, tr: '', fr: '', ar: '' };
            }
        });

        let activeLang = 'en';
        const modal = document.getElementById('modalContent');
        const overlay = document.getElementById('modalOverlay');

        function drawModal() {
            const langVal = (field) => (item[field] || {})[activeLang] || '';

            const specsRows = ((item.specs && item.specs.length > 0) ? item.specs : [{ label: { en: '' }, value: { en: '' } }]).map((s, i) => {
                const lbl = typeof s.label === 'object' ? (s.label[activeLang] || s.label.en || '') : (s.label || '');
                const val = typeof s.value === 'object' ? (s.value[activeLang] || s.value.en || '') : (s.value || '');
                return `<div class="specs-row" data-idx="${i}">
                    <input class="spec-label" placeholder="Label" value="${escHtml(lbl)}">
                    <input class="spec-value" placeholder="Value" value="${escHtml(val)}">
                    <button type="button" class="btn-icon spec-remove" title="Remove">&times;</button>
                </div>`;
            }).join('');

            modal.innerHTML = `
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'EDIT ITEM' : 'ADD NEW ITEM'}</h3>
                    <button class="modal-close" id="modalClose">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="lang-tabs" id="modalLangTabs">
                        ${LANGS.map(l => `<button type="button" class="lang-tab ${l === activeLang ? 'active' : ''}" data-lang="${l}">${LANG_LABELS[l]}</button>`).join('')}
                    </div>
                    <div class="form-group"><label class="form-label">Name (${LANG_LABELS[activeLang]})</label><input class="form-input" id="itemName" value="${escHtml(langVal('name'))}"></div>
                    <div class="form-group"><label class="form-label">Short Description (${LANG_LABELS[activeLang]})</label><textarea class="form-textarea" id="itemShortDesc" rows="2">${escHtml(langVal('shortDescription'))}</textarea></div>
                    <div class="form-group"><label class="form-label">Full Description (${LANG_LABELS[activeLang]})</label><textarea class="form-textarea" id="itemFullDesc" rows="4">${escHtml(langVal('fullDescription'))}</textarea></div>
                    <div class="form-group"><label class="form-label">Image URL (shared)</label><input class="form-input" id="itemImage" value="${escHtml(item.imageUrl || '')}">
                        ${item.imageUrl ? `<img class="form-image-preview mt-16" src="${item.imageUrl}" id="itemImgPreview" alt="">` : '<img class="form-image-preview mt-16" src="" id="itemImgPreview" alt="" style="display:none">'}
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select class="form-select" id="itemStatus">
                                <option value="active" ${item.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="draft" ${item.status === 'draft' ? 'selected' : ''}>Draft</option>
                                <option value="archived" ${item.status === 'archived' ? 'selected' : ''}>Archived</option>
                            </select>
                        </div>
                        <div class="form-group" style="display:flex;align-items:end;padding-bottom:16px;">
                            <label class="form-check"><input type="checkbox" id="itemFeatured" ${item.featured ? 'checked' : ''}> Featured on main site</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Technical Specs (${LANG_LABELS[activeLang]})</label>
                        <div class="specs-editor" id="specsEditor">${specsRows}</div>
                        <button type="button" class="btn btn-ghost btn-sm mt-16" id="addSpecBtn">+ Add Spec Row</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="modalCancel">Cancel</button>
                    <button class="btn btn-primary" id="modalSave">${isEdit ? 'Save Changes' : 'Add Item'}</button>
                </div>`;

            // Bind lang tabs
            modal.querySelector('#modalLangTabs').addEventListener('click', (e) => {
                const btn = e.target.closest('.lang-tab');
                if (!btn) return;
                saveCurrentLang();
                activeLang = btn.dataset.lang;
                drawModal();
            });

            // Image preview
            const imgInput = document.getElementById('itemImage');
            const imgPreview = document.getElementById('itemImgPreview');
            imgInput.addEventListener('input', () => {
                if (imgInput.value) { imgPreview.src = imgInput.value; imgPreview.style.display = 'block'; }
                else { imgPreview.style.display = 'none'; }
            });

            // Specs
            document.getElementById('addSpecBtn').addEventListener('click', () => {
                const editor = document.getElementById('specsEditor');
                const row = document.createElement('div');
                row.className = 'specs-row';
                row.innerHTML = `<input class="spec-label" placeholder="Label"><input class="spec-value" placeholder="Value"><button type="button" class="btn-icon spec-remove">&times;</button>`;
                editor.appendChild(row);
            });
            document.getElementById('specsEditor').addEventListener('click', (e) => {
                if (e.target.closest('.spec-remove')) e.target.closest('.specs-row').remove();
            });

            // Close
            const close = () => { overlay.style.display = 'none'; };
            document.getElementById('modalClose').addEventListener('click', close);
            document.getElementById('modalCancel').addEventListener('click', close);

            // Save
            document.getElementById('modalSave').addEventListener('click', () => {
                saveCurrentLang();
                const enName = (item.name.en || '').trim();
                if (!enName) { toast('English name is required', 'error'); return; }

                item.imageUrl = document.getElementById('itemImage').value;
                item.status = document.getElementById('itemStatus').value;
                item.featured = document.getElementById('itemFeatured').checked;

                if (isEdit) {
                    AdminStore.updateCatalogItem(slug, existingItem.id, item);
                    toast('Item updated', 'success');
                } else {
                    AdminStore.addCatalogItem(slug, item);
                    toast('Item added', 'success');
                }
                close();
                if (onSave) onSave();
            });
        }

        function saveCurrentLang() {
            const el = (id) => document.getElementById(id);
            if (!el('itemName')) return;
            item.name[activeLang] = el('itemName').value;
            item.shortDescription[activeLang] = el('itemShortDesc').value;
            item.fullDescription[activeLang] = el('itemFullDesc').value;

            // Save specs for current lang
            const specLabels = document.querySelectorAll('.spec-label');
            const specValues = document.querySelectorAll('.spec-value');
            const newSpecs = [];
            specLabels.forEach((l, i) => {
                if (l.value.trim() || specValues[i].value.trim()) {
                    const existingSpec = item.specs[i] || {};
                    const label = typeof existingSpec.label === 'object' ? { ...existingSpec.label } : { en: existingSpec.label || '' };
                    const value = typeof existingSpec.value === 'object' ? { ...existingSpec.value } : { en: existingSpec.value || '' };
                    label[activeLang] = l.value.trim();
                    value[activeLang] = specValues[i].value.trim();
                    newSpecs.push({ label, value });
                }
            });
            item.specs = newSpecs;
        }

        overlay.style.display = 'flex';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.style.display = 'none'; };
        drawModal();
    }

    return { renderOverview, renderCategory };
})();
