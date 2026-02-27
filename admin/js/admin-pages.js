/* ===================================================
   OMERTA DEFENCE — Admin Pages (Page Builder)
   List + visual block-based editor with drag-and-drop,
   multi-language support, and optional AI layout generation
   =================================================== */

var AdminPages = (function () {
    'use strict';

    // ── Constants ──────────────────────────────────────
    var LANGS = (AdminStore && AdminStore.AVAILABLE_LANGS) || ['en', 'tr', 'fr', 'ar'];
    var LANG_LABELS = { en: 'EN', tr: 'TR', fr: 'FR', ar: 'AR' };

    var BLOCK_TYPES = {
        hero:            { label: 'Hero',             icon: '\u2B50' },
        text:            { label: 'Text',             icon: '\u270F' },
        image:           { label: 'Image',            icon: '\uD83D\uDDBC' },
        gallery:         { label: 'Gallery',          icon: '\uD83D\uDCF7' },
        featuresGrid:    { label: 'Features Grid',    icon: '\u2726' },
        specsTable:      { label: 'Specs Table',      icon: '\uD83D\uDCCB' },
        cta:             { label: 'Call to Action',    icon: '\uD83D\uDCE2' },
        productShowcase: { label: 'Product Showcase',  icon: '\uD83D\uDECD' },
        spacer:          { label: 'Spacer',           icon: '\u2195' },
        divider:         { label: 'Divider',          icon: '\u2500' },
        video:           { label: 'Video',            icon: '\u25B6' }
    };

    // Field schemas per block type.
    // translatable: fields that differ per language
    // shared:       fields that are language-independent
    var BLOCK_SCHEMAS = {
        hero: {
            translatable: [
                { key: 'title',    label: 'Title',    type: 'text' },
                { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
                { key: 'btnText',  label: 'Button Text', type: 'text' }
            ],
            shared: [
                { key: 'backgroundImage', label: 'Background Image URL', type: 'text' },
                { key: 'btnLink',         label: 'Button Link',          type: 'text' },
                { key: 'fullHeight',      label: 'Full Height',          type: 'checkbox' },
                { key: 'overlayOpacity',  label: 'Overlay Opacity (0-1)', type: 'number', step: 0.1, min: 0, max: 1 }
            ]
        },
        text: {
            translatable: [
                { key: 'heading', label: 'Heading', type: 'text' },
                { key: 'body',    label: 'Body',    type: 'textarea' }
            ],
            shared: [
                { key: 'alignment', label: 'Alignment (left/center/right)', type: 'text' },
                { key: 'maxWidth',  label: 'Max Width (e.g. 800px)',        type: 'text' }
            ]
        },
        image: {
            translatable: [
                { key: 'caption', label: 'Caption', type: 'text' },
                { key: 'alt',     label: 'Alt Text', type: 'text' }
            ],
            shared: [
                { key: 'src',         label: 'Image Source URL',             type: 'text' },
                { key: 'aspectRatio', label: 'Aspect Ratio (e.g. 16/9)',    type: 'text' },
                { key: 'rounded',     label: 'Rounded Corners',             type: 'checkbox' }
            ]
        },
        gallery: {
            translatable: [],
            shared: [
                { key: 'images',  label: 'Images (JSON array: [{src, alt}])', type: 'textarea' },
                { key: 'columns', label: 'Columns',                           type: 'number', min: 1, max: 6 },
                { key: 'gap',     label: 'Gap (px)',                           type: 'number', min: 0 }
            ]
        },
        featuresGrid: {
            translatable: [
                { key: 'heading', label: 'Section Heading', type: 'text' }
            ],
            shared: [
                { key: 'columns', label: 'Columns', type: 'number', min: 1, max: 6 }
            ],
            hasItems: true,
            itemTranslatable: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'text',  label: 'Text',  type: 'textarea' }
            ],
            itemShared: [
                { key: 'icon', label: 'Icon', type: 'text' }
            ]
        },
        specsTable: {
            translatable: [
                { key: 'heading', label: 'Table Heading', type: 'text' }
            ],
            shared: [],
            hasRows: true,
            rowFields: [
                { key: 'label', label: 'Label', type: 'text' },
                { key: 'value', label: 'Value', type: 'text' }
            ]
        },
        cta: {
            translatable: [
                { key: 'heading',    label: 'Heading',    type: 'text' },
                { key: 'subheading', label: 'Subheading', type: 'text' },
                { key: 'btnText',    label: 'Button Text', type: 'text' }
            ],
            shared: [
                { key: 'btnLink',         label: 'Button Link',      type: 'text' },
                { key: 'backgroundColor', label: 'Background Color', type: 'text' }
            ]
        },
        productShowcase: {
            translatable: [],
            shared: [
                { key: 'catalogCategory',  label: 'Catalog Category Slug', type: 'text' },
                { key: 'maxItems',         label: 'Max Items',             type: 'number', min: 1 },
                { key: 'showFeaturedOnly', label: 'Featured Only',         type: 'checkbox' }
            ]
        },
        spacer: {
            translatable: [],
            shared: [
                { key: 'height', label: 'Height (px)', type: 'number', min: 0 }
            ]
        },
        divider: {
            translatable: [],
            shared: [
                { key: 'style', label: 'Style (solid/dashed/dotted)', type: 'text' },
                { key: 'width', label: 'Width (e.g. 100%, 80%)',     type: 'text' }
            ]
        },
        video: {
            translatable: [
                { key: 'caption', label: 'Caption', type: 'text' }
            ],
            shared: [
                { key: 'url',         label: 'Video URL',                  type: 'text' },
                { key: 'aspectRatio', label: 'Aspect Ratio (e.g. 16/9)',   type: 'text' },
                { key: 'autoplay',    label: 'Autoplay',                   type: 'checkbox' }
            ]
        }
    };

    // ── Utility helpers ───────────────────────────────
    function escHtml(str) {
        var d = document.createElement('div');
        d.textContent = (str == null) ? '' : String(str);
        return d.innerHTML;
    }

    function toast(msg, type) {
        if (window.AdminApp && AdminApp.toast) AdminApp.toast(msg, type || 'info');
    }

    function navigate(route) {
        if (window.AdminRouter && AdminRouter.navigate) AdminRouter.navigate(route);
    }

    function t(key, fallback) {
        if (typeof AdminI18n !== 'undefined' && AdminI18n.t) return AdminI18n.t(key, fallback);
        return fallback || key;
    }

    function generateBlockId() {
        return 'blk-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function formatDate(iso) {
        if (!iso) return '-';
        try {
            var d = new Date(iso);
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            return iso;
        }
    }

    function slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function hasAI() {
        return typeof AdminAI !== 'undefined' && AdminAI && typeof AdminAI.isAvailable === 'function' && AdminAI.isAvailable();
    }

    // ── Create a blank block ──────────────────────────
    function createBlankBlock(type) {
        var schema = BLOCK_SCHEMAS[type];
        if (!schema) return null;

        var data = { _shared: {} };

        // Initialize shared fields
        schema.shared.forEach(function (f) {
            if (f.type === 'checkbox') data._shared[f.key] = false;
            else if (f.type === 'number') data._shared[f.key] = (f.key === 'overlayOpacity') ? 0.5 : 0;
            else data._shared[f.key] = '';
        });

        // Initialize translatable fields per language
        LANGS.forEach(function (lang) {
            data[lang] = {};
            schema.translatable.forEach(function (f) {
                data[lang][f.key] = '';
            });
        });

        // Items-based blocks (featuresGrid)
        if (schema.hasItems) {
            data._shared.items = [];
            LANGS.forEach(function (lang) {
                data[lang].items = [];
            });
        }

        // Row-based blocks (specsTable)
        if (schema.hasRows) {
            LANGS.forEach(function (lang) {
                data[lang].rows = [];
            });
        }

        return {
            id: generateBlockId(),
            type: type,
            data: data
        };
    }

    // ══════════════════════════════════════════════════
    //  PAGE LIST  (renderList)
    // ══════════════════════════════════════════════════
    function renderList(container) {
        var pages = AdminStore.getPages();

        var rows = '';
        if (pages.length === 0) {
            rows = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">' +
                   t('pages.noPages', 'No pages created yet.') + '</td></tr>';
        } else {
            pages.forEach(function (page) {
                var titleEn = (page.title && page.title.en) ? page.title.en : (page.slug || '(untitled)');
                var statusClass = page.status === 'published' ? 'status-active' : 'status-draft';
                var statusLabel = page.status === 'published' ? 'Published' : 'Draft';

                rows += '<tr>' +
                    '<td><strong>' + escHtml(titleEn) + '</strong></td>' +
                    '<td><code>' + escHtml(page.slug || '') + '</code></td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>' +
                    '<td>' + formatDate(page.updatedAt) + '</td>' +
                    '<td>' +
                        '<div class="table-actions">' +
                            '<button class="btn btn-sm btn-outline" data-action="edit-page" data-id="' + page.id + '">' + t('common.edit', 'Edit') + '</button> ' +
                            '<button class="btn btn-sm btn-danger" data-action="delete-page" data-id="' + page.id + '">' + t('common.delete', 'Delete') + '</button>' +
                        '</div>' +
                    '</td>' +
                '</tr>';
            });
        }

        container.innerHTML =
            '<div class="page-header">' +
                '<p class="page-breadcrumb">' + t('sidebar.pages', 'PAGES') + '</p>' +
                '<h1 class="page-title">' + t('pages.title', 'Pages') + '</h1>' +
                '<p class="page-subtitle">' + t('pages.subtitle', 'Create and manage custom pages') + '</p>' +
            '</div>' +
            '<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">' +
                '<button class="btn btn-primary" id="newPageBtn">+ ' + t('pages.newPage', 'New Page') + '</button>' +
            '</div>' +
            '<div class="table-wrapper">' +
                '<table class="data-table admin-table">' +
                    '<thead><tr>' +
                        '<th>Title</th><th>Slug</th><th>Status</th><th>Updated</th><th>Actions</th>' +
                    '</tr></thead>' +
                    '<tbody>' + rows + '</tbody>' +
                '</table>' +
            '</div>';

        // ── Bind events ──
        container.querySelector('#newPageBtn').addEventListener('click', function () {
            navigate('pages/new');
        });

        container.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-action]');
            if (!btn) return;
            var action = btn.dataset.action;
            var id = btn.dataset.id;

            if (action === 'edit-page') {
                navigate('pages/edit/' + id);
            } else if (action === 'delete-page') {
                if (confirm('Delete this page permanently? This cannot be undone.')) {
                    AdminStore.deletePage(id);
                    toast('Page deleted', 'warning');
                    renderList(container);
                }
            }
        });
    }

    // ══════════════════════════════════════════════════
    //  PAGE EDITOR  (renderEditor)
    // ══════════════════════════════════════════════════
    function renderEditor(container, pageId) {
        var isNew = !pageId;
        var page;

        if (isNew) {
            page = {
                id: null,
                slug: '',
                title: {},
                metaDescription: {},
                status: 'draft',
                blocks: []
            };
            LANGS.forEach(function (l) {
                page.title[l] = '';
                page.metaDescription[l] = '';
            });
        } else {
            page = AdminStore.getPage(pageId);
            if (!page) {
                container.innerHTML =
                    '<div class="page-header"><h1 class="page-title">Page Not Found</h1></div>' +
                    '<p>The requested page could not be loaded.</p>' +
                    '<a href="#/pages" class="btn btn-outline">Back to Pages</a>';
                return;
            }
            page = deepClone(page);
        }

        var activeLang = 'en';
        var expandedShared = {};   // blockId -> bool (is shared/settings panel open)
        var dragState = {
            dragging: null,        // block id being dragged
            overIndex: -1          // drop target index
        };

        // ── Draw the full editor ──────────────────────
        function draw() {
            container.innerHTML = buildEditorHTML();
            bindEditorEvents();
        }

        // ── Build editor HTML ─────────────────────────
        function buildEditorHTML() {
            var titleVal = (page.title && page.title[activeLang]) || '';
            var metaVal = (page.metaDescription && page.metaDescription[activeLang]) || '';

            // Language tabs
            var langTabsHtml = '<div class="lang-tabs" id="pageLangTabs">';
            LANGS.forEach(function (l) {
                langTabsHtml += '<button type="button" class="lang-tab' + (l === activeLang ? ' active' : '') + '" data-lang="' + l + '">' + LANG_LABELS[l] + '</button>';
            });
            langTabsHtml += '</div>';

            // Block palette
            var paletteHtml = '<div class="block-palette">' +
                '<h3 style="margin:0 0 12px 0;font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);">' + t('pages.blockPalette', 'Block Palette') + '</h3>';
            Object.keys(BLOCK_TYPES).forEach(function (type) {
                var bt = BLOCK_TYPES[type];
                paletteHtml += '<button class="btn btn-outline btn-sm" style="width:100%;margin-bottom:6px;justify-content:flex-start;" data-add-block="' + type + '">' +
                    '<span style="margin-right:8px;">' + bt.icon + '</span>' + bt.label +
                '</button>';
            });
            // AI button
            if (hasAI()) {
                paletteHtml += '<hr style="border-color:var(--border-color);margin:12px 0;">' +
                    '<button class="btn btn-primary btn-sm" style="width:100%;" id="aiDesignBtn">' +
                    '\uD83E\uDD16 ' + t('pages.aiDesign', 'AI Design') +
                    '</button>';
            }
            paletteHtml += '</div>';

            // Canvas (block list)
            var canvasHtml = '<div class="block-canvas" id="blockCanvas">';
            if (page.blocks.length === 0) {
                canvasHtml += '<div style="text-align:center;padding:48px 24px;color:var(--text-muted);">' +
                    '<p style="font-size:1.1rem;margin-bottom:8px;">No blocks yet</p>' +
                    '<p style="font-size:0.85rem;">Click a block type in the palette to add one.</p>' +
                '</div>';
            } else {
                page.blocks.forEach(function (block, idx) {
                    canvasHtml += renderBlockCard(block, idx);
                });
            }
            canvasHtml += '</div>';

            // Footer buttons
            var footerHtml = '<div style="display:flex;gap:12px;padding:16px 0;justify-content:flex-end;">' +
                '<button class="btn btn-outline" id="saveDraftBtn">Save Draft</button>' +
                '<button class="btn btn-primary" id="publishBtn">Publish</button>' +
            '</div>';

            return '<div class="page-header">' +
                '<p class="page-breadcrumb"><a href="#/pages">PAGES</a> / ' + (isNew ? 'NEW PAGE' : 'EDIT') + '</p>' +
                '<h1 class="page-title">' + (isNew ? t('pages.newPage', 'New Page') : t('pages.editPage', 'Edit Page')) + '</h1>' +
            '</div>' +
            langTabsHtml +
            '<div class="card" style="padding:20px;margin-bottom:16px;">' +
                '<div class="form-field" style="margin-bottom:12px;">' +
                    '<label class="field-label">Page Title (' + LANG_LABELS[activeLang] + ')</label>' +
                    '<input class="form-input" id="pageTitle" value="' + escHtml(titleVal) + '" placeholder="Enter page title...">' +
                '</div>' +
                '<div style="display:flex;gap:12px;">' +
                    '<div class="form-field" style="flex:1;">' +
                        '<label class="field-label">Slug</label>' +
                        '<input class="form-input" id="pageSlug" value="' + escHtml(page.slug || '') + '" placeholder="page-url-slug">' +
                    '</div>' +
                    '<div class="form-field" style="flex:1;">' +
                        '<label class="field-label">Meta Description (' + LANG_LABELS[activeLang] + ')</label>' +
                        '<input class="form-input" id="pageMeta" value="' + escHtml(metaVal) + '" placeholder="SEO description...">' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="page-builder-layout">' +
                paletteHtml +
                '<div style="flex:1;min-width:0;">' +
                    canvasHtml +
                    footerHtml +
                '</div>' +
            '</div>';
        }

        // ── Render a single block card ────────────────
        function renderBlockCard(block, idx) {
            var bt = BLOCK_TYPES[block.type] || { label: block.type, icon: '?' };
            var schema = BLOCK_SCHEMAS[block.type];
            var isSharedOpen = !!expandedShared[block.id];

            var html = '<div class="block-card" data-block-id="' + block.id + '" data-block-index="' + idx + '" draggable="true">';

            // Header row: drag handle, type label, actions
            html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
                '<span class="block-drag-handle" title="Drag to reorder">\u2261</span>' +
                '<span class="block-type-label">' + bt.icon + ' ' + bt.label + '</span>' +
                '<div class="block-actions" style="margin-left:auto;display:flex;gap:4px;">' +
                    '<button class="btn-icon" data-action="toggle-shared" data-block-id="' + block.id + '" title="Settings" style="font-size:1rem;">\u2699</button>' +
                    '<button class="btn-icon" data-action="move-block-up" data-block-id="' + block.id + '" title="Move Up" style="font-size:0.9rem;">\u25B2</button>' +
                    '<button class="btn-icon" data-action="move-block-down" data-block-id="' + block.id + '" title="Move Down" style="font-size:0.9rem;">\u25BC</button>' +
                    '<button class="btn-icon" data-action="delete-block" data-block-id="' + block.id + '" title="Delete" style="color:var(--danger);font-size:1rem;">\u2715</button>' +
                '</div>' +
            '</div>';

            // Translatable fields
            if (schema && schema.translatable.length > 0) {
                html += '<div class="block-fields">';
                html += renderTranslatableFields(block, schema);
                html += '</div>';
            }

            // Items-based (featuresGrid)
            if (schema && schema.hasItems) {
                html += renderItemsEditor(block, schema);
            }

            // Row-based (specsTable)
            if (schema && schema.hasRows) {
                html += renderRowsEditor(block, schema);
            }

            // Shared / settings fields (collapsible)
            if (schema && schema.shared.length > 0) {
                html += '<div class="block-shared-fields" style="' + (isSharedOpen ? '' : 'display:none;') + '" data-shared-panel="' + block.id + '">';
                html += '<div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin:8px 0 6px 0;">Shared Settings</div>';
                html += renderSharedFields(block, schema);
                html += '</div>';
            }

            html += '</div>';
            return html;
        }

        // ── Translatable field rendering ──────────────
        function renderTranslatableFields(block, schema) {
            var langData = (block.data && block.data[activeLang]) || {};
            var html = '';

            schema.translatable.forEach(function (f) {
                var val = langData[f.key] || '';
                var fieldId = 'bf-' + block.id + '-' + f.key;
                html += '<div class="form-field" style="margin-bottom:8px;">';
                html += '<label class="field-label" style="font-size:0.75rem;">' + f.label + ' (' + LANG_LABELS[activeLang] + ')</label>';
                if (f.type === 'textarea') {
                    html += '<textarea class="form-textarea" id="' + fieldId + '" data-block-id="' + block.id + '" data-field-key="' + f.key + '" data-field-scope="lang" rows="2">' + escHtml(val) + '</textarea>';
                } else {
                    html += '<input class="form-input" type="text" id="' + fieldId + '" data-block-id="' + block.id + '" data-field-key="' + f.key + '" data-field-scope="lang" value="' + escHtml(val) + '">';
                }
                html += '</div>';
            });

            return html;
        }

        // ── Shared field rendering ────────────────────
        function renderSharedFields(block, schema) {
            var shared = (block.data && block.data._shared) || {};
            var html = '';

            schema.shared.forEach(function (f) {
                var val = shared[f.key];
                var fieldId = 'bs-' + block.id + '-' + f.key;

                html += '<div class="form-field" style="margin-bottom:8px;">';
                html += '<label class="field-label" style="font-size:0.75rem;">' + f.label + '</label>';

                if (f.type === 'checkbox') {
                    html += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">' +
                        '<input type="checkbox" id="' + fieldId + '" data-block-id="' + block.id + '" data-field-key="' + f.key + '" data-field-scope="shared"' + (val ? ' checked' : '') + '>' +
                        '<span style="font-size:0.85rem;color:var(--text-muted);">Enabled</span>' +
                    '</label>';
                } else if (f.type === 'number') {
                    var numVal = (val !== undefined && val !== null && val !== '') ? val : '';
                    var extra = '';
                    if (f.step !== undefined) extra += ' step="' + f.step + '"';
                    if (f.min !== undefined) extra += ' min="' + f.min + '"';
                    if (f.max !== undefined) extra += ' max="' + f.max + '"';
                    html += '<input class="form-input" type="number" id="' + fieldId + '" data-block-id="' + block.id + '" data-field-key="' + f.key + '" data-field-scope="shared" value="' + escHtml(String(numVal)) + '"' + extra + '>';
                } else if (f.type === 'textarea') {
                    var textVal = (typeof val === 'object') ? JSON.stringify(val, null, 2) : (val || '');
                    html += '<textarea class="form-textarea" id="' + fieldId + '" data-block-id="' + block.id + '" data-field-key="' + f.key + '" data-field-scope="shared" rows="3">' + escHtml(textVal) + '</textarea>';
                } else {
                    html += '<input class="form-input" type="text" id="' + fieldId + '" data-block-id="' + block.id + '" data-field-key="' + f.key + '" data-field-scope="shared" value="' + escHtml(val || '') + '">';
                }

                html += '</div>';
            });

            return html;
        }

        // ── Items editor (for featuresGrid) ───────────
        function renderItemsEditor(block, schema) {
            var shared = (block.data && block.data._shared) || {};
            var langData = (block.data && block.data[activeLang]) || {};
            var sharedItems = shared.items || [];
            var langItems = langData.items || [];

            var html = '<div class="block-fields" style="margin-top:8px;">';
            html += '<div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:6px;">Items</div>';

            var count = Math.max(sharedItems.length, langItems.length);
            for (var i = 0; i < count; i++) {
                var si = sharedItems[i] || {};
                var li = langItems[i] || {};
                html += '<div class="card" style="padding:10px;margin-bottom:6px;" data-item-block="' + block.id + '" data-item-index="' + i + '">';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                    '<span style="font-size:0.75rem;color:var(--text-muted);">Item ' + (i + 1) + '</span>' +
                    '<button class="btn-icon" data-action="delete-item" data-block-id="' + block.id + '" data-item-index="' + i + '" title="Remove" style="font-size:0.8rem;color:var(--danger);">\u2715</button>' +
                '</div>';

                // Shared item fields
                schema.itemShared.forEach(function (f) {
                    var val = si[f.key] || '';
                    html += '<div class="form-field" style="margin-bottom:4px;">' +
                        '<label class="field-label" style="font-size:0.7rem;">' + f.label + '</label>' +
                        '<input class="form-input" type="text" data-item-block="' + block.id + '" data-item-index="' + i + '" data-item-field="' + f.key + '" data-item-scope="shared" value="' + escHtml(val) + '">' +
                    '</div>';
                });

                // Translatable item fields
                schema.itemTranslatable.forEach(function (f) {
                    var val = li[f.key] || '';
                    html += '<div class="form-field" style="margin-bottom:4px;">' +
                        '<label class="field-label" style="font-size:0.7rem;">' + f.label + ' (' + LANG_LABELS[activeLang] + ')</label>';
                    if (f.type === 'textarea') {
                        html += '<textarea class="form-textarea" data-item-block="' + block.id + '" data-item-index="' + i + '" data-item-field="' + f.key + '" data-item-scope="lang" rows="2">' + escHtml(val) + '</textarea>';
                    } else {
                        html += '<input class="form-input" type="text" data-item-block="' + block.id + '" data-item-index="' + i + '" data-item-field="' + f.key + '" data-item-scope="lang" value="' + escHtml(val) + '">';
                    }
                    html += '</div>';
                });

                html += '</div>';
            }

            html += '<button class="btn btn-ghost btn-sm" data-action="add-item" data-block-id="' + block.id + '">+ Add Item</button>';
            html += '</div>';
            return html;
        }

        // ── Rows editor (for specsTable) ──────────────
        function renderRowsEditor(block, schema) {
            var langData = (block.data && block.data[activeLang]) || {};
            var rows = langData.rows || [];

            var html = '<div class="block-fields" style="margin-top:8px;">';
            html += '<div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:6px;">Rows (' + LANG_LABELS[activeLang] + ')</div>';

            rows.forEach(function (row, i) {
                html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;" data-row-block="' + block.id + '" data-row-index="' + i + '">';
                schema.rowFields.forEach(function (f) {
                    var val = row[f.key] || '';
                    html += '<input class="form-input" type="text" placeholder="' + f.label + '" data-row-block="' + block.id + '" data-row-index="' + i + '" data-row-field="' + f.key + '" value="' + escHtml(val) + '" style="flex:1;">';
                });
                html += '<button class="btn-icon" data-action="delete-row" data-block-id="' + block.id + '" data-row-index="' + i + '" title="Remove" style="font-size:0.8rem;color:var(--danger);">\u2715</button>';
                html += '</div>';
            });

            html += '<button class="btn btn-ghost btn-sm" data-action="add-row" data-block-id="' + block.id + '">+ Add Row</button>';
            html += '</div>';
            return html;
        }

        // ── Collect current form data back into page ──
        function collectFormData() {
            // Page-level fields
            var titleInput = document.getElementById('pageTitle');
            var slugInput = document.getElementById('pageSlug');
            var metaInput = document.getElementById('pageMeta');

            if (titleInput) page.title[activeLang] = titleInput.value;
            if (slugInput) page.slug = slugInput.value;
            if (metaInput) page.metaDescription[activeLang] = metaInput.value;

            // Block-level translatable fields
            var langFields = container.querySelectorAll('[data-field-scope="lang"]');
            langFields.forEach(function (el) {
                var blockId = el.dataset.blockId;
                var fieldKey = el.dataset.fieldKey;
                var block = findBlock(blockId);
                if (!block) return;
                if (!block.data[activeLang]) block.data[activeLang] = {};
                block.data[activeLang][fieldKey] = el.type === 'checkbox' ? el.checked : el.value;
            });

            // Block-level shared fields
            var sharedFields = container.querySelectorAll('[data-field-scope="shared"]');
            sharedFields.forEach(function (el) {
                var blockId = el.dataset.blockId;
                var fieldKey = el.dataset.fieldKey;
                var block = findBlock(blockId);
                if (!block) return;
                if (!block.data._shared) block.data._shared = {};

                if (el.type === 'checkbox') {
                    block.data._shared[fieldKey] = el.checked;
                } else if (el.type === 'number') {
                    block.data._shared[fieldKey] = el.value === '' ? '' : parseFloat(el.value);
                } else {
                    // Try parse JSON for complex shared fields like gallery images
                    var schema = BLOCK_SCHEMAS[block.type];
                    var fieldDef = schema ? schema.shared.find(function (f) { return f.key === fieldKey; }) : null;
                    if (fieldDef && fieldDef.type === 'textarea' && fieldKey === 'images') {
                        try { block.data._shared[fieldKey] = JSON.parse(el.value); } catch (e) { block.data._shared[fieldKey] = el.value; }
                    } else {
                        block.data._shared[fieldKey] = el.value;
                    }
                }
            });

            // Items (featuresGrid)
            var itemInputs = container.querySelectorAll('[data-item-block]');
            var itemsCollected = {};
            itemInputs.forEach(function (el) {
                if (!el.dataset.itemField) return; // skip containers
                var blockId = el.dataset.itemBlock;
                var itemIdx = parseInt(el.dataset.itemIndex, 10);
                var fieldKey = el.dataset.itemField;
                var scope = el.dataset.itemScope;

                if (!itemsCollected[blockId]) itemsCollected[blockId] = { shared: [], lang: [] };
                var bucket = scope === 'shared' ? itemsCollected[blockId].shared : itemsCollected[blockId].lang;
                if (!bucket[itemIdx]) bucket[itemIdx] = {};
                bucket[itemIdx][fieldKey] = el.value;
            });

            Object.keys(itemsCollected).forEach(function (blockId) {
                var block = findBlock(blockId);
                if (!block) return;
                block.data._shared.items = itemsCollected[blockId].shared.filter(function (x) { return x; });
                if (!block.data[activeLang]) block.data[activeLang] = {};
                block.data[activeLang].items = itemsCollected[blockId].lang.filter(function (x) { return x; });
            });

            // Rows (specsTable)
            var rowInputs = container.querySelectorAll('[data-row-block]');
            var rowsCollected = {};
            rowInputs.forEach(function (el) {
                if (!el.dataset.rowField) return; // skip containers
                var blockId = el.dataset.rowBlock;
                var rowIdx = parseInt(el.dataset.rowIndex, 10);
                var fieldKey = el.dataset.rowField;

                if (!rowsCollected[blockId]) rowsCollected[blockId] = [];
                if (!rowsCollected[blockId][rowIdx]) rowsCollected[blockId][rowIdx] = {};
                rowsCollected[blockId][rowIdx][fieldKey] = el.value;
            });

            Object.keys(rowsCollected).forEach(function (blockId) {
                var block = findBlock(blockId);
                if (!block) return;
                if (!block.data[activeLang]) block.data[activeLang] = {};
                block.data[activeLang].rows = rowsCollected[blockId].filter(function (x) { return x; });
            });
        }

        function findBlock(blockId) {
            for (var i = 0; i < page.blocks.length; i++) {
                if (page.blocks[i].id === blockId) return page.blocks[i];
            }
            return null;
        }

        function findBlockIndex(blockId) {
            for (var i = 0; i < page.blocks.length; i++) {
                if (page.blocks[i].id === blockId) return i;
            }
            return -1;
        }

        // ── Save helper ───────────────────────────────
        function savePage(status) {
            collectFormData();

            // Validation
            var slug = (page.slug || '').trim();
            if (!slug) {
                toast('Please enter a page slug.', 'error');
                return;
            }

            page.status = status;
            page.slug = slug;

            if (isNew) {
                var created = AdminStore.addPage(page);
                if (created) {
                    page.id = created.id;
                    isNew = false;
                }
                toast('Page created!', 'success');
            } else {
                AdminStore.updatePage(page.id, {
                    slug: page.slug,
                    title: page.title,
                    metaDescription: page.metaDescription,
                    status: page.status,
                    blocks: page.blocks
                });
                toast('Page saved!', 'success');
            }

            navigate('pages');
        }

        // ── Bind all editor events ────────────────────
        function bindEditorEvents() {
            // Language tabs
            var langTabs = container.querySelector('#pageLangTabs');
            if (langTabs) {
                langTabs.addEventListener('click', function (e) {
                    var btn = e.target.closest('.lang-tab');
                    if (!btn) return;
                    collectFormData();
                    activeLang = btn.dataset.lang;
                    draw();
                });
            }

            // Auto-generate slug from English title
            var titleInput = container.querySelector('#pageTitle');
            var slugInput = container.querySelector('#pageSlug');
            if (titleInput && slugInput && activeLang === 'en') {
                titleInput.addEventListener('input', function () {
                    if (!page.slug || page.slug === slugify(page.title.en || '')) {
                        slugInput.value = slugify(titleInput.value);
                    }
                });
            }

            // Add block from palette
            container.addEventListener('click', function (e) {
                var addBtn = e.target.closest('[data-add-block]');
                if (addBtn) {
                    collectFormData();
                    var type = addBtn.dataset.addBlock;
                    var newBlock = createBlankBlock(type);
                    if (newBlock) {
                        page.blocks.push(newBlock);
                        draw();
                    }
                    return;
                }

                // Block actions
                var actionBtn = e.target.closest('[data-action]');
                if (!actionBtn) return;
                var action = actionBtn.dataset.action;
                var blockId = actionBtn.dataset.blockId;

                if (action === 'toggle-shared') {
                    collectFormData();
                    expandedShared[blockId] = !expandedShared[blockId];
                    var panel = container.querySelector('[data-shared-panel="' + blockId + '"]');
                    if (panel) {
                        panel.style.display = expandedShared[blockId] ? '' : 'none';
                    }
                    return;
                }

                if (action === 'delete-block') {
                    if (confirm('Remove this block?')) {
                        collectFormData();
                        var idx = findBlockIndex(blockId);
                        if (idx >= 0) {
                            page.blocks.splice(idx, 1);
                            delete expandedShared[blockId];
                        }
                        draw();
                    }
                    return;
                }

                if (action === 'move-block-up') {
                    collectFormData();
                    var upIdx = findBlockIndex(blockId);
                    if (upIdx > 0) {
                        var temp = page.blocks[upIdx];
                        page.blocks[upIdx] = page.blocks[upIdx - 1];
                        page.blocks[upIdx - 1] = temp;
                        draw();
                    }
                    return;
                }

                if (action === 'move-block-down') {
                    collectFormData();
                    var downIdx = findBlockIndex(blockId);
                    if (downIdx >= 0 && downIdx < page.blocks.length - 1) {
                        var tmp = page.blocks[downIdx];
                        page.blocks[downIdx] = page.blocks[downIdx + 1];
                        page.blocks[downIdx + 1] = tmp;
                        draw();
                    }
                    return;
                }

                // Items: add / delete
                if (action === 'add-item') {
                    collectFormData();
                    var block = findBlock(blockId);
                    if (block) {
                        if (!block.data._shared.items) block.data._shared.items = [];
                        var newSharedItem = {};
                        var schema = BLOCK_SCHEMAS[block.type];
                        if (schema && schema.itemShared) {
                            schema.itemShared.forEach(function (f) { newSharedItem[f.key] = ''; });
                        }
                        block.data._shared.items.push(newSharedItem);

                        LANGS.forEach(function (l) {
                            if (!block.data[l]) block.data[l] = {};
                            if (!block.data[l].items) block.data[l].items = [];
                            var newLangItem = {};
                            if (schema && schema.itemTranslatable) {
                                schema.itemTranslatable.forEach(function (f) { newLangItem[f.key] = ''; });
                            }
                            block.data[l].items.push(newLangItem);
                        });
                        draw();
                    }
                    return;
                }

                if (action === 'delete-item') {
                    collectFormData();
                    var dBlock = findBlock(blockId);
                    var dIdx = parseInt(actionBtn.dataset.itemIndex, 10);
                    if (dBlock && !isNaN(dIdx)) {
                        if (dBlock.data._shared.items) dBlock.data._shared.items.splice(dIdx, 1);
                        LANGS.forEach(function (l) {
                            if (dBlock.data[l] && dBlock.data[l].items) dBlock.data[l].items.splice(dIdx, 1);
                        });
                        draw();
                    }
                    return;
                }

                // Rows: add / delete
                if (action === 'add-row') {
                    collectFormData();
                    var rBlock = findBlock(blockId);
                    if (rBlock) {
                        var rowSchema = BLOCK_SCHEMAS[rBlock.type];
                        LANGS.forEach(function (l) {
                            if (!rBlock.data[l]) rBlock.data[l] = {};
                            if (!rBlock.data[l].rows) rBlock.data[l].rows = [];
                            var newRow = {};
                            if (rowSchema && rowSchema.rowFields) {
                                rowSchema.rowFields.forEach(function (f) { newRow[f.key] = ''; });
                            }
                            rBlock.data[l].rows.push(newRow);
                        });
                        draw();
                    }
                    return;
                }

                if (action === 'delete-row') {
                    collectFormData();
                    var rrBlock = findBlock(blockId);
                    var rrIdx = parseInt(actionBtn.dataset.rowIndex, 10);
                    if (rrBlock && !isNaN(rrIdx)) {
                        LANGS.forEach(function (l) {
                            if (rrBlock.data[l] && rrBlock.data[l].rows) rrBlock.data[l].rows.splice(rrIdx, 1);
                        });
                        draw();
                    }
                    return;
                }
            });

            // Save / Publish
            var saveDraftBtn = container.querySelector('#saveDraftBtn');
            var publishBtn = container.querySelector('#publishBtn');
            if (saveDraftBtn) saveDraftBtn.addEventListener('click', function () { savePage('draft'); });
            if (publishBtn) publishBtn.addEventListener('click', function () { savePage('published'); });

            // AI Design button
            var aiBtn = container.querySelector('#aiDesignBtn');
            if (aiBtn) {
                aiBtn.addEventListener('click', function () { openAIModal(); });
            }

            // ── Drag and Drop ─────────────────────────
            bindDragAndDrop();
        }

        // ── HTML5 Drag & Drop ─────────────────────────
        function bindDragAndDrop() {
            var canvas = container.querySelector('#blockCanvas');
            if (!canvas) return;

            var draggedId = null;
            var dropIndicator = null;

            canvas.addEventListener('dragstart', function (e) {
                var card = e.target.closest('.block-card');
                if (!card) return;

                // Only allow drag from the handle
                var handle = e.target.closest('.block-drag-handle');
                if (!handle) {
                    e.preventDefault();
                    return;
                }

                draggedId = card.dataset.blockId;
                card.style.opacity = '0.4';
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', draggedId);
            });

            canvas.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                if (!draggedId) return;

                // Remove old indicator
                removeDropIndicator();

                // Find closest block card
                var cards = canvas.querySelectorAll('.block-card');
                var targetCard = null;
                var insertBefore = true;

                for (var i = 0; i < cards.length; i++) {
                    var rect = cards[i].getBoundingClientRect();
                    var midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        targetCard = cards[i];
                        insertBefore = true;
                        break;
                    }
                    targetCard = cards[i];
                    insertBefore = false;
                }

                if (targetCard && targetCard.dataset.blockId !== draggedId) {
                    dropIndicator = document.createElement('div');
                    dropIndicator.className = 'drop-indicator';
                    if (insertBefore) {
                        targetCard.parentNode.insertBefore(dropIndicator, targetCard);
                    } else {
                        targetCard.parentNode.insertBefore(dropIndicator, targetCard.nextSibling);
                    }
                }
            });

            canvas.addEventListener('dragleave', function (e) {
                // Only remove if leaving the canvas entirely
                if (!canvas.contains(e.relatedTarget)) {
                    removeDropIndicator();
                }
            });

            canvas.addEventListener('drop', function (e) {
                e.preventDefault();
                removeDropIndicator();

                if (!draggedId) return;

                collectFormData();

                var fromIndex = findBlockIndex(draggedId);
                if (fromIndex < 0) return;

                // Determine drop position
                var cards = canvas.querySelectorAll('.block-card');
                var toIndex = page.blocks.length; // default: end

                for (var i = 0; i < cards.length; i++) {
                    var rect = cards[i].getBoundingClientRect();
                    var midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        toIndex = parseInt(cards[i].dataset.blockIndex, 10);
                        break;
                    }
                }

                // Reorder
                if (fromIndex !== toIndex && fromIndex !== toIndex - 1) {
                    var movedBlock = page.blocks.splice(fromIndex, 1)[0];
                    var insertAt = toIndex > fromIndex ? toIndex - 1 : toIndex;
                    if (insertAt < 0) insertAt = 0;
                    if (insertAt > page.blocks.length) insertAt = page.blocks.length;
                    page.blocks.splice(insertAt, 0, movedBlock);
                }

                draggedId = null;
                draw();
            });

            canvas.addEventListener('dragend', function (e) {
                removeDropIndicator();
                draggedId = null;

                // Reset opacity on all cards
                var cards = canvas.querySelectorAll('.block-card');
                for (var i = 0; i < cards.length; i++) {
                    cards[i].style.opacity = '';
                }
            });

            function removeDropIndicator() {
                if (dropIndicator && dropIndicator.parentNode) {
                    dropIndicator.parentNode.removeChild(dropIndicator);
                }
                dropIndicator = null;
                // Also clean up any stray indicators
                var old = canvas.querySelectorAll('.drop-indicator');
                for (var j = 0; j < old.length; j++) {
                    old[j].parentNode.removeChild(old[j]);
                }
            }
        }

        // ── AI Design Modal ───────────────────────────
        function openAIModal() {
            var overlay = document.getElementById('modalOverlay');
            var modalContent = document.getElementById('modalContent');
            if (!overlay || !modalContent) return;

            modalContent.innerHTML =
                '<div class="modal-header">' +
                    '<h3 class="modal-title">\uD83E\uDD16 AI Page Design</h3>' +
                    '<button class="modal-close" id="aiModalClose">&times;</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<div class="form-field" style="margin-bottom:16px;">' +
                        '<label class="field-label">Describe the page you want to create</label>' +
                        '<textarea class="form-textarea" id="aiPromptInput" rows="5" placeholder="e.g. A product landing page for our new tactical drone system, with a hero banner, feature highlights, specifications table, and a call to action..."></textarea>' +
                    '</div>' +
                    '<div id="aiResultArea"></div>' +
                '</div>' +
                '<div class="modal-footer">' +
                    '<button class="btn btn-outline" id="aiModalCancel">Cancel</button>' +
                    '<button class="btn btn-primary" id="aiGenerateBtn">Generate</button>' +
                '</div>';

            overlay.style.display = 'flex';

            // Close handlers
            var close = function () { overlay.style.display = 'none'; };
            document.getElementById('aiModalClose').addEventListener('click', close);
            document.getElementById('aiModalCancel').addEventListener('click', close);
            overlay.onclick = function (e) { if (e.target === overlay) close(); };

            // Generate
            document.getElementById('aiGenerateBtn').addEventListener('click', function () {
                var prompt = document.getElementById('aiPromptInput');
                var desc = prompt ? prompt.value.trim() : '';
                if (!desc) {
                    toast('Please enter a description.', 'error');
                    return;
                }

                var genBtn = document.getElementById('aiGenerateBtn');
                genBtn.disabled = true;
                genBtn.textContent = 'Generating...';

                var resultArea = document.getElementById('aiResultArea');
                resultArea.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Generating layout...</p>';

                // Call AI
                try {
                    var aiPromise = AdminAI.suggestLayout(desc);
                    if (aiPromise && typeof aiPromise.then === 'function') {
                        aiPromise.then(function (result) {
                            showAIResult(result, resultArea, close);
                        }).catch(function (err) {
                            resultArea.innerHTML = '<p style="color:var(--danger);">Error: ' + escHtml(err.message || String(err)) + '</p>';
                            genBtn.disabled = false;
                            genBtn.textContent = 'Generate';
                        });
                    } else {
                        // Synchronous result
                        showAIResult(aiPromise, resultArea, close);
                    }
                } catch (err) {
                    resultArea.innerHTML = '<p style="color:var(--danger);">Error: ' + escHtml(err.message || String(err)) + '</p>';
                    genBtn.disabled = false;
                    genBtn.textContent = 'Generate';
                }
            });
        }

        function showAIResult(result, resultArea, closeModal) {
            if (!result || !result.blocks) {
                resultArea.innerHTML = '<p style="color:var(--danger);">AI did not return a valid layout.</p>';
                var gb = document.getElementById('aiGenerateBtn');
                if (gb) { gb.disabled = false; gb.textContent = 'Generate'; }
                return;
            }

            var blockCount = result.blocks.length;
            resultArea.innerHTML =
                '<div class="card" style="padding:16px;margin-bottom:12px;">' +
                    '<p style="margin:0 0 8px 0;"><strong>Generated Layout</strong></p>' +
                    (result.pageTitle && result.pageTitle.en ? '<p style="margin:0 0 4px 0;font-size:0.85rem;">Title: ' + escHtml(result.pageTitle.en) + '</p>' : '') +
                    (result.pageSlug ? '<p style="margin:0 0 4px 0;font-size:0.85rem;">Slug: <code>' + escHtml(result.pageSlug) + '</code></p>' : '') +
                    '<p style="margin:0;font-size:0.85rem;color:var(--text-muted);">' + blockCount + ' block(s) generated</p>' +
                '</div>' +
                '<div style="display:flex;gap:8px;">' +
                    '<button class="btn btn-primary" id="aiAcceptBtn">Accept &amp; Insert</button>' +
                    '<button class="btn btn-outline" id="aiRejectBtn">Cancel</button>' +
                '</div>';

            document.getElementById('aiAcceptBtn').addEventListener('click', function () {
                collectFormData();

                // Apply page-level fields if present
                if (result.pageTitle) {
                    LANGS.forEach(function (l) {
                        if (result.pageTitle[l]) page.title[l] = result.pageTitle[l];
                    });
                }
                if (result.pageSlug) page.slug = result.pageSlug;

                // Insert blocks
                result.blocks.forEach(function (blk) {
                    if (!blk.id) blk.id = generateBlockId();
                    if (!blk.data) blk.data = { _shared: {} };
                    if (!blk.data._shared) blk.data._shared = {};
                    page.blocks.push(blk);
                });

                closeModal();
                draw();
                toast('AI layout inserted!', 'success');
            });

            document.getElementById('aiRejectBtn').addEventListener('click', function () {
                closeModal();
            });
        }

        // ── Initial draw ──────────────────────────────
        draw();
    }

    // ══════════════════════════════════════════════════
    //  PUBLIC API
    // ══════════════════════════════════════════════════
    return {
        renderList: renderList,
        renderEditor: renderEditor
    };

})();

// Attach to window for global access
window.AdminPages = AdminPages;
