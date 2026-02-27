/* ===================================================
   OMERTA DEFENCE — Admin Media Library
   Photo library with add, swap, pick, delete, usage tracking
   =================================================== */

const AdminMedia = (() => {
    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    function toast(msg, type) {
        if (window.AdminApp) AdminApp.toast(msg, type);
    }

    // Image usage locations
    const USAGE_TARGETS = [
        { key: 'od_content_hero', field: 'backgroundImage', label: 'Hero Background' },
        { key: 'od_content_about', field: 'imageUrl', label: 'About Image' },
        { key: 'od_content_cyber', field: 'backgroundImage', label: 'Cyber Background' }
    ];

    function getUsage(url) {
        const usages = [];
        USAGE_TARGETS.forEach(t => {
            const data = AdminStore.get(t.key);
            if (data && data[t.field] === url) usages.push(t.label);
        });
        // Check catalog items
        Object.keys(AdminStore.CATALOG_CATEGORIES).forEach(slug => {
            const items = AdminStore.getCatalog(slug);
            items.forEach(item => {
                if (item.imageUrl === url) usages.push(`Catalog: ${item.name}`);
            });
        });
        return usages;
    }

    function render(container) {
        let media = AdminStore.getMedia();
        let searchQuery = '';

        function draw() {
            let filtered = media;
            if (searchQuery) {
                filtered = filtered.filter(m =>
                    m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    getUsage(m.url).join(' ').toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            container.innerHTML = `
                <div class="page-header">
                    <p class="page-breadcrumb">OPERATIONS</p>
                    <h1 class="page-title">Media Library</h1>
                    <p class="page-subtitle">${media.length} image(s)</p>
                </div>

                <div class="flex-between mb-24">
                    <div class="filter-bar" style="margin-bottom:0;">
                        <div class="search-input">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input class="form-input" id="mediaSearch" placeholder="Search by label or usage..." value="${escHtml(searchQuery)}">
                        </div>
                    </div>
                    <button class="btn btn-primary btn-sm" id="addMediaBtn">+ Add Image</button>
                </div>

                ${filtered.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">&#128247;</div>
                        <p class="empty-state-title">NO IMAGES</p>
                        <p class="empty-state-text">Add images by URL to build your media library.</p>
                    </div>
                ` : `
                    <div class="media-grid" id="mediaGrid">
                        ${filtered.map(m => {
                            const usage = getUsage(m.url);
                            return `
                                <div class="media-item" data-id="${m.id}">
                                    <img class="media-item-img" src="${escHtml(m.url)}" alt="${escHtml(m.label)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 150%22><rect fill=%22%231a1a1a%22 width=%22200%22 height=%22150%22/><text fill=%22%23888%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2214%22>Error</text></svg>'">
                                    <div class="media-item-info">
                                        <p class="media-item-label">${escHtml(m.label)}</p>
                                        <p class="media-item-usage">${usage.length > 0 ? 'Used in: ' + usage.join(', ') : 'Not in use'}</p>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                `}`;

            // Bind
            container.querySelector('#mediaSearch')?.addEventListener('input', (e) => { searchQuery = e.target.value; draw(); });
            container.querySelector('#addMediaBtn')?.addEventListener('click', () => openAddModal(() => { media = AdminStore.getMedia(); draw(); }));

            container.querySelector('#mediaGrid')?.addEventListener('click', (e) => {
                const item = e.target.closest('.media-item');
                if (!item) return;
                const id = item.dataset.id;
                const mediaItem = media.find(m => m.id === id);
                if (mediaItem) openDetailModal(mediaItem, () => { media = AdminStore.getMedia(); draw(); });
            });
        }

        draw();
    }

    function openAddModal(onDone) {
        const modal = document.getElementById('modalContent');
        const overlay = document.getElementById('modalOverlay');

        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">ADD IMAGE</h3>
                <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group"><label class="form-label">Image URL</label><input class="form-input" id="mediaUrl" placeholder="https://images.unsplash.com/..."></div>
                <div class="form-group"><label class="form-label">Label</label><input class="form-input" id="mediaLabel" placeholder="e.g. AK-47 Product Photo"></div>
                <img id="mediaPreview" class="form-image-preview mt-16" src="" alt="" style="display:none;">
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" id="modalCancel">Cancel</button>
                <button class="btn btn-primary" id="modalSave">Add to Library</button>
            </div>`;

        overlay.style.display = 'flex';

        document.getElementById('mediaUrl').addEventListener('input', (e) => {
            const preview = document.getElementById('mediaPreview');
            if (e.target.value) { preview.src = e.target.value; preview.style.display = 'block'; }
            else { preview.style.display = 'none'; }
        });

        const close = () => { overlay.style.display = 'none'; };
        document.getElementById('modalClose').addEventListener('click', close);
        document.getElementById('modalCancel').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        document.getElementById('modalSave').addEventListener('click', () => {
            const url = document.getElementById('mediaUrl').value.trim();
            const label = document.getElementById('mediaLabel').value.trim();
            if (!url) { toast('URL is required', 'error'); return; }
            AdminStore.addMedia({ url, label: label || 'Untitled' });
            toast('Image added to library', 'success');
            close();
            if (onDone) onDone();
        });
    }

    function openDetailModal(mediaItem, onDone) {
        const modal = document.getElementById('modalContent');
        const overlay = document.getElementById('modalOverlay');
        const usage = getUsage(mediaItem.url);

        const targetOptions = USAGE_TARGETS.map(t => `<option value="${t.key}|${t.field}">${t.label}</option>`).join('');

        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">IMAGE DETAILS</h3>
                <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${escHtml(mediaItem.url)}" style="width:100%;max-height:300px;object-fit:cover;border-radius:8px;margin-bottom:16px;" alt="">
                <p><strong>Label:</strong> ${escHtml(mediaItem.label)}</p>
                <p><strong>URL:</strong> <span class="text-muted" style="word-break:break-all;font-size:0.8rem;">${escHtml(mediaItem.url)}</span></p>
                <p><strong>Added:</strong> ${new Date(mediaItem.addedAt).toLocaleDateString()}</p>
                <p><strong>Used in:</strong> ${usage.length > 0 ? usage.join(', ') : 'Not currently in use'}</p>

                <div class="form-group mt-24">
                    <label class="form-label">Swap — Use this image in:</label>
                    <div class="flex-gap">
                        <select class="form-select" id="swapTarget" style="max-width:250px;">
                            <option value="">Select location...</option>
                            ${targetOptions}
                        </select>
                        <button class="btn btn-primary btn-sm" id="swapBtn">Apply</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger btn-sm" id="deleteMediaBtn">Delete Image</button>
                <button class="btn btn-outline" id="modalCancel">Close</button>
            </div>`;

        overlay.style.display = 'flex';

        const close = () => { overlay.style.display = 'none'; };
        document.getElementById('modalClose').addEventListener('click', close);
        document.getElementById('modalCancel').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        document.getElementById('swapBtn').addEventListener('click', () => {
            const target = document.getElementById('swapTarget').value;
            if (!target) { toast('Select a location first', 'warning'); return; }
            const [key, field] = target.split('|');
            const data = AdminStore.getContent(key);
            if (data) {
                data[field] = mediaItem.url;
                AdminStore.setContent(key, data);
                toast('Image swapped successfully!', 'success');
                close();
                if (onDone) onDone();
            }
        });

        document.getElementById('deleteMediaBtn').addEventListener('click', () => {
            if (usage.length > 0) {
                if (!confirm('This image is currently in use! Delete anyway?')) return;
            }
            if (confirm('Delete this image from the library?')) {
                AdminStore.deleteMedia(mediaItem.id);
                toast('Image deleted', 'warning');
                close();
                if (onDone) onDone();
            }
        });
    }

    // Picker modal (used by content editors)
    function openPicker(callback) {
        const media = AdminStore.getMedia();
        const modal = document.getElementById('modalContent');
        const overlay = document.getElementById('modalOverlay');

        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">SELECT IMAGE</h3>
                <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="modal-body">
                ${media.length === 0 ? '<p class="text-muted">No images in library. Add images first.</p>' : `
                    <div class="media-grid">
                        ${media.map(m => `
                            <div class="media-item" data-url="${escHtml(m.url)}" style="cursor:pointer;">
                                <img class="media-item-img" src="${escHtml(m.url)}" alt="">
                                <div class="media-item-info"><p class="media-item-label">${escHtml(m.label)}</p></div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" id="modalCancel">Cancel</button>
            </div>`;

        overlay.style.display = 'flex';

        const close = () => { overlay.style.display = 'none'; };
        document.getElementById('modalClose').addEventListener('click', close);
        document.getElementById('modalCancel').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        modal.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                close();
                if (callback) callback(url);
            });
        });
    }

    return { render, openPicker };
})();
