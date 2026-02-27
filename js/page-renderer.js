/* ===================================================
   OMERTA DEFENCE — Page Renderer
   Renders Page Builder pages on the main site.
   Reads od_pages from localStorage, resolves i18n,
   renders 11 block types into a target container.
   =================================================== */

var PageRenderer = (function () {
    'use strict';

    // ── Helpers ──

    function getLang() {
        if (typeof I18n !== 'undefined' && I18n.getLang) {
            return I18n.getLang();
        }
        return 'en';
    }

    function resolveLangField(field, lang) {
        if (typeof I18n !== 'undefined' && I18n.resolveLangField) {
            return I18n.resolveLangField(field, lang);
        }
        if (field === null || field === undefined) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object') {
            return field[lang] || field.en || '';
        }
        return String(field);
    }

    /**
     * Merge a block's _shared data with the lang-specific data.
     * Returns a flat object with all resolved fields.
     */
    function resolveLang(data, lang) {
        var shared = data._shared || {};
        var langData = data[lang] || data.en || {};
        var result = {};
        var key;

        for (key in shared) {
            if (shared.hasOwnProperty(key)) {
                result[key] = shared[key];
            }
        }
        for (key in langData) {
            if (langData.hasOwnProperty(key)) {
                result[key] = langData[key];
            }
        }

        return result;
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Block Renderers ──

    function sanitizeBackgroundUrl(url) {
        if (!url) return '';
        var clean = String(url).replace(/['"()]/g, '');
        if (/^(https?:\/\/|data:image\/)/.test(clean)) {
            return clean;
        }
        return '';
    }

    function renderHero(block, lang) {
        var d = resolveLang(block.data, lang);
        var bgImage = sanitizeBackgroundUrl(d.backgroundImage || '');
        var overlayOpacity = (d.overlayOpacity !== undefined) ? d.overlayOpacity : 0.5;
        var fullHeight = d.fullHeight ? 'min-height:100vh;' : '';
        var title = d.title || '';
        var subtitle = d.subtitle || '';
        var btnText = d.btnText || '';
        var btnLink = d.btnLink || '#';

        var bgStyle = bgImage ? "background-image:url('" + escapeHTML(bgImage) + "'); " : '';
        var html = '<div class="pb-hero" style="' + bgStyle + fullHeight + '">';
        html += '<div class="pb-hero-overlay" style="opacity:' + overlayOpacity + ';"></div>';
        html += '<div class="pb-hero-content">';
        if (title) html += '<h1>' + escapeHTML(title) + '</h1>';
        if (subtitle) html += '<p>' + escapeHTML(subtitle) + '</p>';
        if (btnText) html += '<a href="' + escapeHTML(btnLink) + '" class="btn btn-primary">' + escapeHTML(btnText) + '</a>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    function renderText(block, lang) {
        var d = resolveLang(block.data, lang);
        var alignment = d.alignment || 'left';
        var maxWidth = d.maxWidth || '';
        var heading = d.heading || '';
        var body = d.body || '';

        var style = 'text-align:' + escapeHTML(alignment) + ';';
        if (maxWidth) style += ' max-width:' + escapeHTML(maxWidth) + '; margin-left:auto; margin-right:auto;';

        var html = '<div class="pb-text" style="' + style + '">';
        if (heading) html += '<h2>' + escapeHTML(heading) + '</h2>';
        if (body) html += '<div>' + escapeHTML(body) + '</div>';
        html += '</div>';
        return html;
    }

    function renderImage(block, lang) {
        var d = resolveLang(block.data, lang);
        var src = d.src || '';
        var alt = d.alt || '';
        var caption = d.caption || '';
        var aspectRatio = d.aspectRatio || '';
        var rounded = d.rounded || false;

        var imgStyle = '';
        if (aspectRatio) imgStyle += 'aspect-ratio:' + escapeHTML(aspectRatio) + '; object-fit:cover;';
        if (rounded) imgStyle += ' border-radius:12px;';

        var html = '<figure class="pb-image">';
        html += '<img src="' + escapeHTML(src) + '" alt="' + escapeHTML(alt) + '"';
        if (imgStyle) html += ' style="' + imgStyle + '"';
        html += '>';
        if (caption) html += '<figcaption>' + escapeHTML(caption) + '</figcaption>';
        html += '</figure>';
        return html;
    }

    function renderGallery(block) {
        var shared = block.data._shared || {};
        var images = shared.images || [];
        var columns = shared.columns || 3;
        var gap = (shared.gap !== undefined) ? shared.gap : 16;

        var style = 'display:grid; grid-template-columns:repeat(' + columns + ',1fr); gap:' + gap + 'px;';
        var html = '<div class="pb-gallery" style="' + style + '">';

        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            html += '<img src="' + escapeHTML(img.src) + '" alt="' + escapeHTML(img.alt || '') + '" loading="lazy">';
        }

        html += '</div>';
        return html;
    }

    function renderFeaturesGrid(block, lang) {
        var shared = block.data._shared || {};
        var langData = block.data[lang] || block.data.en || {};
        var columns = shared.columns || 3;
        var heading = langData.heading || '';
        var sharedItems = shared.items || [];
        var langItems = langData.items || [];

        var html = '';
        if (heading) html += '<h2 style="text-align:center; margin-bottom:32px;">' + escapeHTML(heading) + '</h2>';

        html += '<div class="pb-features-grid" style="display:grid; grid-template-columns:repeat(' + columns + ',1fr); gap:24px;">';

        var count = Math.max(sharedItems.length, langItems.length);
        for (var i = 0; i < count; i++) {
            var si = sharedItems[i] || {};
            var li = langItems[i] || {};
            var icon = si.icon || '';
            var title = li.title || '';
            var text = li.text || '';

            html += '<div class="pb-feature-card">';
            if (icon) html += '<div class="pb-feature-icon">' + escapeHTML(icon) + '</div>';
            if (title) html += '<h3>' + escapeHTML(title) + '</h3>';
            if (text) html += '<p>' + escapeHTML(text) + '</p>';
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    function renderSpecsTable(block, lang) {
        var langData = block.data[lang] || block.data.en || {};
        var heading = langData.heading || '';
        var rows = langData.rows || [];

        var html = '<div class="pb-specs">';
        if (heading) html += '<h3>' + escapeHTML(heading) + '</h3>';

        html += '<table>';
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            html += '<tr>';
            html += '<td>' + escapeHTML(row.label || '') + '</td>';
            html += '<td>' + escapeHTML(row.value || '') + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        html += '</div>';
        return html;
    }

    function renderCTA(block, lang) {
        var d = resolveLang(block.data, lang);
        var heading = d.heading || '';
        var subheading = d.subheading || '';
        var btnText = d.btnText || '';
        var btnLink = d.btnLink || '#';
        var bgColor = d.backgroundColor || '';

        var style = bgColor ? 'background:' + escapeHTML(bgColor) + ';' : '';

        var html = '<div class="pb-cta" style="' + style + '">';
        if (heading) html += '<h2>' + escapeHTML(heading) + '</h2>';
        if (subheading) html += '<p>' + escapeHTML(subheading) + '</p>';
        if (btnText) html += '<a href="' + escapeHTML(btnLink) + '" class="btn btn-primary">' + escapeHTML(btnText) + '</a>';
        html += '</div>';
        return html;
    }

    function renderProductShowcase(block) {
        var shared = block.data._shared || {};
        var category = shared.catalogCategory || '';
        var maxItems = shared.maxItems || 50;
        var showFeaturedOnly = shared.showFeaturedOnly || false;

        if (!category) return '<div class="pb-product-showcase"><p>No category specified.</p></div>';

        var items = [];
        try {
            var raw = localStorage.getItem('od_catalog_' + category);
            if (raw) items = JSON.parse(raw);
        } catch (e) {
            items = [];
        }

        // Filter out archived
        items = items.filter(function (item) {
            return item.status !== 'archived';
        });

        // Filter featured if requested
        if (showFeaturedOnly) {
            items = items.filter(function (item) {
                return item.featured;
            });
        }

        // Limit
        items = items.slice(0, maxItems);

        if (items.length === 0) {
            return '<div class="pb-product-showcase"><p>No products found.</p></div>';
        }

        var lang = getLang();
        var html = '<div class="pb-product-showcase" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:24px;">';

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var name = resolveLangField(item.name, lang) || 'Unnamed';
            var desc = resolveLangField(item.shortDescription, lang) || '';
            var img = item.imageUrl || '';

            html += '<a href="#/product/' + escapeHTML(item.id) + '" class="pb-product-card" style="text-decoration:none; color:inherit;">';
            if (img) html += '<img src="' + escapeHTML(img) + '" alt="' + escapeHTML(name) + '" loading="lazy" style="width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:8px;">';
            html += '<h4 style="margin:12px 0 4px;">' + escapeHTML(name) + '</h4>';
            if (desc) html += '<p style="opacity:0.7; font-size:0.9em;">' + escapeHTML(desc) + '</p>';
            html += '</a>';
        }

        html += '</div>';
        return html;
    }

    function renderSpacer(block) {
        var shared = block.data._shared || {};
        var height = shared.height || 60;
        return '<div class="pb-spacer" style="height:' + height + 'px"></div>';
    }

    function renderDivider(block) {
        var shared = block.data._shared || {};
        var lineStyle = shared.style || 'solid';
        var width = shared.width || '100%';
        return '<hr class="pb-divider" style="border-style:' + escapeHTML(lineStyle) + '; width:' + escapeHTML(width) + ';">';
    }

    function renderVideo(block, lang) {
        var d = resolveLang(block.data, lang);
        var url = d.url || '';
        var aspectRatio = d.aspectRatio || '16/9';
        var autoplay = d.autoplay || false;
        var caption = d.caption || '';

        var embedUrl = convertToEmbed(url, autoplay);

        var html = '<div class="pb-video">';
        html += '<div style="position:relative; width:100%; aspect-ratio:' + escapeHTML(aspectRatio) + ';">';
        html += '<iframe src="' + escapeHTML(embedUrl) + '" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen allow="autoplay"></iframe>';
        html += '</div>';
        if (caption) html += '<p class="pb-caption">' + escapeHTML(caption) + '</p>';
        html += '</div>';
        return html;
    }

    function convertToEmbed(url, autoplay) {
        if (!url) return '';

        var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
        if (ytMatch) {
            var ytId = ytMatch[1];
            return 'https://www.youtube.com/embed/' + ytId + (autoplay ? '?autoplay=1' : '');
        }

        var vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
        if (vimeoMatch) {
            var vimeoId = vimeoMatch[1];
            return 'https://player.vimeo.com/video/' + vimeoId + (autoplay ? '?autoplay=1' : '');
        }

        // Return as-is if not recognized
        return url;
    }

    // ── Block type dispatcher ──

    var BLOCK_RENDERERS = {
        hero:            renderHero,
        text:            renderText,
        image:           renderImage,
        gallery:         renderGallery,
        featuresGrid:    renderFeaturesGrid,
        specsTable:      renderSpecsTable,
        cta:             renderCTA,
        productShowcase: renderProductShowcase,
        spacer:          renderSpacer,
        divider:         renderDivider,
        video:           renderVideo
    };

    function renderBlock(block, lang) {
        var renderer = BLOCK_RENDERERS[block.type];
        if (!renderer) {
            return '<!-- unknown block type: ' + escapeHTML(block.type) + ' -->';
        }
        return renderer(block, lang);
    }

    // ── Main Render ──

    function render(slug, container) {
        var pages = [];
        try {
            var raw = localStorage.getItem('od_pages');
            if (raw) pages = JSON.parse(raw);
        } catch (e) {
            pages = [];
        }

        // Find published page by slug
        var page = null;
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].slug === slug && pages[i].status === 'published') {
                page = pages[i];
                break;
            }
        }

        if (!page) {
            container.innerHTML = '<div class="dynamic-page pb-page">' +
                '<a href="#" class="back-link" onclick="SiteRouter.goHome(event)">\u2190 Back</a>' +
                '<p style="color:var(--text-muted); margin-top:32px;">Page not found.</p>' +
                '</div>';
            return;
        }

        var lang = getLang();
        var blocks = page.blocks || [];
        var blocksHTML = '';

        for (var j = 0; j < blocks.length; j++) {
            blocksHTML += renderBlock(blocks[j], lang);
        }

        var pageTitle = resolveLangField(page.title, lang);

        var html = '<div class="dynamic-page pb-page">';
        html += '<a href="#" class="back-link" onclick="SiteRouter.goHome(event)">\u2190 Back</a>';
        if (pageTitle) html += '<h1 class="pb-page-title">' + escapeHTML(pageTitle) + '</h1>';
        html += blocksHTML;
        html += '</div>';

        container.innerHTML = html;

        // Set meta description if available
        if (page.metaDescription) {
            var desc = resolveLangField(page.metaDescription, lang);
            if (desc) {
                var metaEl = document.querySelector('meta[name="description"]');
                if (metaEl) metaEl.setAttribute('content', desc);
            }
        }
    }

    // ── Public API ──

    return {
        render: render
    };

})();
