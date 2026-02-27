/* ===================================================
   OMERTA DEFENCE - Site Router
   Hash-based routing for product detail, category & custom pages
   Routes: #/products/:category, #/product/:id, #/page/:slug
   Plain anchors (#about, #contact) keep normal scroll behaviour
   =================================================== */

var SiteRouter = (function () {
    'use strict';

    var dynamicEl;
    var sectionEls;
    var footerEl;
    var navbarEl;

    // ── Security Helper ──
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    // Route parameter validation
    var VALID_ROUTE_PARAM = /^[a-z0-9-]+$/;
    var VALID_ITEM_ID = /^cat-[a-z0-9]+$/;

    // Category display names (UTF-8 direct)
    var CATEGORY_NAMES = {
        'small-arms': { en: 'Small Arms', tr: 'Hafif Silahlar', fr: 'Armes Légères', ar: 'الأسلحة الخفيفة' },
        'heavy-ordnance': { en: 'Heavy Ordnance', tr: 'Ağır Mühimmat', fr: 'Artillerie Lourde', ar: 'الذخائر الثقيلة' },
        'launchers': { en: 'Launchers', tr: 'Fırlatıcılar', fr: 'Lanceurs', ar: 'القاذفات' },
        'drones': { en: 'Drones & UAVs', tr: 'İHA\'lar', fr: 'Drones & UAV', ar: 'الطائرات بدون طيار' },
        'cyber': { en: 'Cyber Security', tr: 'Siber Güvenlik', fr: 'Cybersécurité', ar: 'الأمن السيبراني' }
    };

    function lang() {
        return (typeof I18n !== 'undefined' && I18n.getLang) ? I18n.getLang() : 'en';
    }

    function resolveLangField(field) {
        if (!field) return '';
        if (typeof field === 'string') return field;
        var l = lang();
        return field[l] || field.en || '';
    }

    function catName(slug) {
        var obj = CATEGORY_NAMES[slug];
        return obj ? resolveLangField(obj) : slug;
    }

    // ---------- Show / Hide ----------
    function showDynamic() {
        if (!dynamicEl) return;
        sectionEls.forEach(function (s) { s.style.display = 'none'; });
        if (footerEl) footerEl.style.display = 'none';
        dynamicEl.style.display = 'block';
        window.scrollTo({ top: 0 });
    }

    function hideDynamic() {
        if (!dynamicEl) return;
        dynamicEl.style.display = 'none';
        dynamicEl.innerHTML = '';
        sectionEls.forEach(function (s) { s.style.display = ''; });
        if (footerEl) footerEl.style.display = '';
    }

    // ---------- Catalog Helpers ----------
    function getCatalogItems(category) {
        try {
            var raw = localStorage.getItem('od_catalog_' + category);
            if (!raw) return [];
            return JSON.parse(raw).filter(function (item) {
                return item.status !== 'archived';
            });
        } catch (e) { return []; }
    }

    function getCatalogItem(itemId) {
        var categories = ['small-arms', 'heavy-ordnance', 'launchers', 'drones', 'cyber'];
        for (var i = 0; i < categories.length; i++) {
            var items = getCatalogItems(categories[i]);
            for (var j = 0; j < items.length; j++) {
                if (items[j].id === itemId) {
                    return { item: items[j], category: categories[i] };
                }
            }
        }
        return null;
    }

    // ---------- Route: Category ----------
    function renderCategory(category) {
        var items = getCatalogItems(category);
        var name = catName(category);
        var l = lang();

        var backText = l === 'tr' ? '← Ürünlere Dön' :
                       l === 'fr' ? '← Retour aux Produits' :
                       l === 'ar' ? '← العودة إلى المنتجات' :
                       '← Back to Products';

        var productText = l === 'tr' ? ' ürün' :
                          l === 'fr' ? ' produits' :
                          l === 'ar' ? ' منتج' :
                          ' products';

        var html = '<div class="dynamic-page">';
        html += '<a href="#products" class="back-link" onclick="SiteRouter.goHome(event)">' + escapeHTML(backText) + '</a>';
        html += '<div class="category-header">';
        html += '<h1>' + escapeHTML(name) + '</h1>';
        html += '<p>' + items.length + escapeHTML(productText) + '</p>';
        html += '</div>';

        if (items.length === 0) {
            var noItems = l === 'tr' ? 'Bu kategoride henüz ürün yok.' :
                          l === 'fr' ? 'Aucun produit dans cette catégorie.' :
                          l === 'ar' ? 'لا توجد منتجات في هذه الفئة.' :
                          'No products in this category yet.';
            html += '<p style="color:var(--text-muted);margin-top:32px;">' + escapeHTML(noItems) + '</p>';
        } else {
            html += '<div class="catalog-grid">';
            items.forEach(function (item) {
                var itemName = resolveLangField(item.name) || 'Unnamed';
                var desc = resolveLangField(item.shortDescription) || '';
                var img = item.imageUrl || 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=400&h=300&fit=crop';

                html += '<a href="#/product/' + escapeHTML(item.id) + '" class="product-card catalog-card">';
                html += '<div class="card-image"><img src="' + escapeHTML(img) + '" alt="' + escapeHTML(itemName) + '" loading="lazy"></div>';
                html += '<div class="card-body">';
                html += '<h3 class="card-title">' + escapeHTML(itemName) + '</h3>';
                if (desc) html += '<p class="card-desc">' + escapeHTML(desc) + '</p>';
                html += '</div></a>';
            });
            html += '</div>';
        }
        html += '</div>';

        dynamicEl.innerHTML = html;
        showDynamic();
    }

    // ---------- Route: Product Detail ----------
    function renderProduct(itemId) {
        var result = getCatalogItem(itemId);
        if (!result) {
            dynamicEl.innerHTML = '<div class="dynamic-page"><p style="color:var(--text-muted);">Product not found.</p><a href="#products" class="back-link" onclick="SiteRouter.goHome(event)">← Back</a></div>';
            showDynamic();
            return;
        }

        var item = result.item;
        var category = result.category;
        var l = lang();

        var itemName = resolveLangField(item.name) || 'Unnamed';
        var fullDesc = resolveLangField(item.fullDescription) || resolveLangField(item.shortDescription) || '';
        var img = item.imageUrl || 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=600&h=400&fit=crop';

        var backText = '← ' + catName(category);

        var requestText = l === 'tr' ? 'Bilgi Talep Et' :
                          l === 'fr' ? 'Demander des Informations' :
                          l === 'ar' ? 'طلب معلومات' :
                          'Request Information';

        var specsLabel = l === 'tr' ? 'Teknik Özellikler' :
                         l === 'fr' ? 'Spécifications' :
                         l === 'ar' ? 'المواصفات' :
                         'Specifications';

        var html = '<div class="dynamic-page">';
        html += '<a href="#/products/' + escapeHTML(category) + '" class="back-link">' + escapeHTML(backText) + '</a>';
        html += '<div class="product-detail-grid">';

        // Image
        html += '<div class="product-detail-image"><img src="' + escapeHTML(img) + '" alt="' + escapeHTML(itemName) + '"></div>';

        // Info
        html += '<div class="product-detail-info">';
        html += '<h1>' + escapeHTML(itemName) + '</h1>';
        if (fullDesc) html += '<div class="description">' + escapeHTML(fullDesc) + '</div>';

        // Specs table
        var specs = item.specs;
        if (specs && specs.length > 0) {
            html += '<h3>' + escapeHTML(specsLabel) + '</h3>';
            html += '<table class="specs-table"><tbody>';
            specs.forEach(function (spec) {
                var label = resolveLangField(spec.label) || spec.label || '';
                var value = resolveLangField(spec.value) || spec.value || '';
                html += '<tr><td>' + escapeHTML(label) + '</td><td>' + escapeHTML(value) + '</td></tr>';
            });
            html += '</tbody></table>';
        }

        // CTA
        html += '<a href="#contact" class="btn btn-primary" onclick="SiteRouter.goHome(event, \'contact\')" style="margin-top:24px;display:inline-block;padding:14px 32px;text-decoration:none;">' + escapeHTML(requestText) + '</a>';

        html += '</div></div></div>';

        dynamicEl.innerHTML = html;
        showDynamic();
    }

    // ---------- Route: Custom Page ----------
    function renderPage(slug) {
        if (typeof PageRenderer !== 'undefined' && PageRenderer.render) {
            PageRenderer.render(slug, dynamicEl);
            showDynamic();
        } else {
            dynamicEl.innerHTML = '<div class="dynamic-page"><p style="color:var(--text-muted);">Page not found.</p></div>';
            showDynamic();
        }
    }

    // ---------- Router Core ----------
    function handleRoute() {
        var hash = window.location.hash || '';

        // Only intercept #/ routes — leave plain anchors (#about, #contact) alone
        if (hash.indexOf('#/') !== 0) {
            hideDynamic();
            return;
        }

        var path = hash.substring(2); // remove #/
        var parts = path.split('/');

        if (parts[0] === 'products' && parts[1]) {
            // Validate category parameter
            if (!VALID_ROUTE_PARAM.test(parts[1])) { hideDynamic(); return; }
            renderCategory(parts[1]);
        } else if (parts[0] === 'product' && parts[1]) {
            // Validate item ID parameter
            if (!VALID_ITEM_ID.test(parts[1])) { hideDynamic(); return; }
            renderProduct(parts[1]);
        } else if (parts[0] === 'page' && parts[1]) {
            // Validate page slug parameter
            if (!VALID_ROUTE_PARAM.test(parts[1])) { hideDynamic(); return; }
            renderPage(parts[1]);
        } else {
            hideDynamic();
        }
    }

    // ---------- Go Home (back to main site) ----------
    function goHome(e, scrollTo) {
        if (e) e.preventDefault();
        window.location.hash = '';
        hideDynamic();
        if (scrollTo) {
            setTimeout(function () {
                var target = document.getElementById(scrollTo);
                if (target) {
                    var navH = navbarEl ? navbarEl.offsetHeight : 70;
                    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
                }
            }, 100);
        }
    }

    // ---------- Init ----------
    function init() {
        dynamicEl = document.getElementById('dynamicContent');
        sectionEls = document.querySelectorAll('main > section, section.hero');
        footerEl = document.querySelector('.footer');
        navbarEl = document.getElementById('navbar');

        if (!dynamicEl) return;

        window.addEventListener('hashchange', handleRoute);
        // Handle initial load with a route hash
        if (window.location.hash.indexOf('#/') === 0) {
            handleRoute();
        }

        // Re-render on language change
        window.addEventListener('langchange', function () {
            if (window.location.hash.indexOf('#/') === 0) {
                handleRoute();
            }
        });
    }

    return {
        init: init,
        goHome: goHome,
        handleRoute: handleRoute
    };

})();
