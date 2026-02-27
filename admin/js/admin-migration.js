/* ===================================================
   OMERTA DEFENCE — v1 → v2 Data Migration
   Runs on every admin boot (idempotent).
   Wraps flat content into { _v:2, _shared:{}, en:{} } envelope.
   =================================================== */

const AdminMigration = (() => {
    'use strict';

    const LANGS = ['en', 'tr', 'fr', 'ar'];

    // Define which fields are translatable vs shared per section
    const SCHEMA = {
        od_content_hero: {
            translatable: ['preheading', 'title', 'subtitle', 'btn1Text', 'btn2Text'],
            shared: ['backgroundImage', 'btn1Link', 'btn2Link']
        },
        od_content_about: {
            translatable: ['sectionLabel', 'title', 'paragraph1', 'paragraph2'],
            shared: ['imageUrl'],
            statTranslatable: ['label'],
            statShared: ['number', 'suffix']
        },
        od_content_products: {
            translatable: ['sectionLabel', 'title', 'subtitle'],
            shared: []
        },
        od_content_cyber: {
            translatable: ['sectionLabel', 'title', 'description', 'ctaText'],
            shared: ['backgroundImage', 'ctaLink'],
            featureTranslatable: ['title', 'text'],
            featureShared: ['icon']
        },
        od_content_contact: {
            translatable: ['heading', 'description'],
            shared: ['headquarters', 'email', 'phone', 'hours']
        },
        od_content_footer: {
            translatable: ['tagline', 'text', 'copyright'],
            shared: []
        },
        od_settings_seo: {
            translatable: ['pageTitle', 'metaDescription'],
            shared: []
        }
    };

    function get(key) {
        try { return JSON.parse(localStorage.getItem(key)); }
        catch { return null; }
    }

    function set(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    }

    // Migrate a single content key
    function migrateContent(key) {
        const data = get(key);
        if (!data) return;
        if (data._v === 2) return; // Already migrated

        const schema = SCHEMA[key];
        if (!schema) return;

        const envelope = { _v: 2, _shared: {} };
        const enLang = {};

        // Copy shared fields
        schema.shared.forEach(f => {
            if (data[f] !== undefined) envelope._shared[f] = data[f];
        });

        // Copy translatable fields to EN
        schema.translatable.forEach(f => {
            if (data[f] !== undefined) enLang[f] = data[f];
        });

        // Handle stats array (about section)
        if (schema.statTranslatable && data.stats && Array.isArray(data.stats)) {
            const sharedStats = [];
            const enStats = [];
            data.stats.forEach(s => {
                const shared = {};
                const trans = {};
                schema.statShared.forEach(f => { if (s[f] !== undefined) shared[f] = s[f]; });
                schema.statTranslatable.forEach(f => { if (s[f] !== undefined) trans[f] = s[f]; });
                sharedStats.push(shared);
                enStats.push(trans);
            });
            envelope._shared.stats = sharedStats;
            enLang.stats = enStats;
        }

        // Handle features array (cyber section)
        if (schema.featureTranslatable && data.features && Array.isArray(data.features)) {
            const sharedFeatures = [];
            const enFeatures = [];
            data.features.forEach(f => {
                const shared = {};
                const trans = {};
                schema.featureShared.forEach(k => { if (f[k] !== undefined) shared[k] = f[k]; });
                schema.featureTranslatable.forEach(k => { if (f[k] !== undefined) trans[k] = f[k]; });
                sharedFeatures.push(shared);
                enFeatures.push(trans);
            });
            envelope._shared.features = sharedFeatures;
            enLang.features = enFeatures;
        }

        // Set EN, initialize other langs as empty objects
        envelope.en = enLang;
        LANGS.filter(l => l !== 'en').forEach(l => { envelope[l] = {}; });

        set(key, envelope);
    }

    // Migrate catalog items
    function migrateCatalogs() {
        const categories = ['small-arms', 'heavy-ordnance', 'launchers', 'drones', 'cyber'];
        categories.forEach(cat => {
            const key = 'od_catalog_' + cat;
            const items = get(key);
            if (!items || !Array.isArray(items)) return;

            let changed = false;
            items.forEach(item => {
                if (item._v === 2) return;

                // Convert translatable string fields to lang objects
                ['name', 'shortDescription', 'fullDescription'].forEach(field => {
                    if (typeof item[field] === 'string') {
                        const val = item[field];
                        item[field] = { en: val, tr: '', fr: '', ar: '' };
                    }
                });

                // Convert specs labels/values
                if (item.specs && Array.isArray(item.specs)) {
                    item.specs.forEach(spec => {
                        if (typeof spec.label === 'string') {
                            spec.label = { en: spec.label, tr: '', fr: '', ar: '' };
                        }
                        if (typeof spec.value === 'string') {
                            spec.value = { en: spec.value, tr: '', fr: '', ar: '' };
                        }
                    });
                }

                item._v = 2;
                changed = true;
            });

            if (changed) set(key, items);
        });
    }

    // Ensure i18n settings key exists
    function ensureI18nSettings() {
        const existing = get('od_i18n');
        if (existing && existing.version === 2) return;

        set('od_i18n', {
            currentLang: 'en',
            availableLangs: LANGS,
            version: 2
        });
    }

    // Run full migration
    function run() {
        // Migrate all content keys
        Object.keys(SCHEMA).forEach(key => migrateContent(key));

        // Migrate catalogs
        migrateCatalogs();

        // Ensure settings
        ensureI18nSettings();
    }

    return { run, LANGS, SCHEMA };
})();
