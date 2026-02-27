/* ===================================================
   OMERTA DEFENCE — Admin Panel i18n
   ~120 UI translation keys for the admin command center
   =================================================== */

const AdminI18n = (() => {
    'use strict';

    const STORAGE_KEY = 'od_admin_lang';
    const LANGS = ['en', 'tr', 'fr', 'ar'];
    const RTL_LANGS = ['ar'];

    const DICT = {
        en: {
            // Sidebar groups
            'sidebar.overview': 'OVERVIEW',
            'sidebar.content': 'CONTENT',
            'sidebar.catalogs': 'CATALOGS',
            'sidebar.operations': 'OPERATIONS',
            'sidebar.system': 'SYSTEM',
            'sidebar.pages': 'PAGES',
            // Sidebar links
            'sidebar.dashboard': 'Dashboard',
            'sidebar.hero': 'Hero',
            'sidebar.about': 'About',
            'sidebar.productsOverview': 'Products Overview',
            'sidebar.cyberSection': 'Cyber Section',
            'sidebar.contact': 'Contact',
            'sidebar.footer': 'Footer',
            'sidebar.allCatalogs': 'All Catalogs',
            'sidebar.smallArms': 'Small Arms',
            'sidebar.heavyOrdnance': 'Heavy Ordnance',
            'sidebar.launchers': 'Launchers',
            'sidebar.drones': 'Drones & UAVs',
            'sidebar.cyberSecurity': 'Cyber Security',
            'sidebar.mediaLibrary': 'Media Library',
            'sidebar.inquiries': 'Inquiries',
            'sidebar.rfqTracker': 'RFQ Tracker',
            'sidebar.auditLog': 'Audit Log',
            'sidebar.settings': 'Settings',
            'sidebar.allPages': 'All Pages',
            'sidebar.newPage': 'New Page',
            // Topbar
            'topbar.commandCenter': 'COMMAND CENTER',
            'topbar.logout': 'Logout',
            // Common
            'common.save': 'Save Changes',
            'common.discard': 'Discard',
            'common.reset': 'Reset to Default',
            'common.cancel': 'Cancel',
            'common.delete': 'Delete',
            'common.edit': 'Edit',
            'common.add': 'Add',
            'common.search': 'Search...',
            'common.filter': 'Filter',
            'common.export': 'Export',
            'common.import': 'Import',
            'common.preview': 'Preview',
            'common.publish': 'Publish',
            'common.draft': 'Draft',
            'common.active': 'Active',
            'common.archived': 'Archived',
            'common.featured': 'Featured',
            'common.actions': 'Actions',
            'common.status': 'Status',
            'common.name': 'Name',
            'common.description': 'Description',
            'common.image': 'Image',
            'common.yes': 'Yes',
            'common.no': 'No',
            'common.confirm': 'Confirm',
            'common.close': 'Close',
            // Content editors
            'editor.heroSection': 'Hero Section Editor',
            'editor.aboutSection': 'About Section Editor',
            'editor.productsOverview': 'Products Overview Editor',
            'editor.cyberSection': 'Cyber Section Editor',
            'editor.contactSection': 'Contact Section Editor',
            'editor.footerSection': 'Footer Editor',
            'editor.preheading': 'Pre-heading',
            'editor.title': 'Title',
            'editor.subtitle': 'Subtitle',
            'editor.backgroundImage': 'Background Image URL',
            'editor.sectionLabel': 'Section Label',
            'editor.paragraph': 'Paragraph',
            'editor.imageUrl': 'Image URL',
            'editor.statistics': 'Statistics',
            'editor.features': 'Features',
            'editor.ctaButton': 'CTA Button',
            // Catalog
            'catalog.productCatalogs': 'Product Catalogs',
            'catalog.addItem': '+ Add Item',
            'catalog.editItem': 'EDIT ITEM',
            'catalog.addNewItem': 'ADD NEW ITEM',
            'catalog.shortDesc': 'Short Description',
            'catalog.fullDesc': 'Full Description',
            'catalog.technicalSpecs': 'Technical Specs',
            'catalog.addSpecRow': '+ Add Spec Row',
            'catalog.featuredOnSite': 'Featured on main site',
            'catalog.items': 'items',
            // Pages
            'pages.title': 'Pages',
            'pages.subtitle': 'Create and manage custom pages',
            'pages.newPage': 'New Page',
            'pages.editPage': 'Edit Page',
            'pages.noPages': 'No pages created yet.',
            'pages.slug': 'Slug',
            'pages.blocks': 'Blocks',
            'pages.addBlock': '+ Add Block',
            'pages.blockPalette': 'Block Palette',
            'pages.aiDesign': 'AI Design',
            // Settings
            'settings.title': 'Settings',
            'settings.seo': 'SEO Settings',
            'settings.branding': 'Branding',
            'settings.dataManagement': 'Data Management',
            'settings.aiIntegration': 'AI Integration',
            'settings.language': 'Language Preferences',
            'settings.pageTitle': 'Page Title',
            'settings.metaDesc': 'Meta Description',
            'settings.serpPreview': 'SERP Preview',
            'settings.logoUrl': 'Logo URL',
            'settings.primaryColor': 'Primary Color',
            'settings.accentColor': 'Accent Color',
            'settings.storageUsage': 'LocalStorage Usage',
            'settings.exportAll': 'Export All (JSON)',
            'settings.importJson': 'Import (JSON)',
            'settings.clearAll': 'Clear All Data',
            'settings.groqApiKey': 'Groq API Key',
            'settings.aiModel': 'AI Model',
            'settings.enableAi': 'Enable AI Features',
            'settings.testConnection': 'Test Connection',
            // Login
            'login.authorizedOnly': 'AUTHORIZED PERSONNEL ONLY',
            'login.commandCenter': 'COMMAND CENTER',
            'login.enterPassword': 'Enter Password',
            'login.access': 'ACCESS',
            'login.firstTimeSetup': 'First-time setup. Choose your admin password.',
            'login.setPassword': 'SET PASSWORD'
        },
        tr: {
            'sidebar.overview': 'GENEL BAKIŞ',
            'sidebar.content': 'İÇERİK',
            'sidebar.catalogs': 'KATALOGLAR',
            'sidebar.operations': 'OPERASYONLAR',
            'sidebar.system': 'SİSTEM',
            'sidebar.pages': 'SAYFALAR',
            'sidebar.dashboard': 'Kontrol Paneli',
            'sidebar.hero': 'Hero',
            'sidebar.about': 'Hakkında',
            'sidebar.productsOverview': 'Ürünlere Genel Bakış',
            'sidebar.cyberSection': 'Siber Bölüm',
            'sidebar.contact': 'İletişim',
            'sidebar.footer': 'Altbilgi',
            'sidebar.allCatalogs': 'Tüm Kataloglar',
            'sidebar.smallArms': 'Hafif Silahlar',
            'sidebar.heavyOrdnance': 'Ağır Silahlar',
            'sidebar.launchers': 'Fırlatıcılar',
            'sidebar.drones': 'Dronlar',
            'sidebar.cyberSecurity': 'Siber Güvenlik',
            'sidebar.mediaLibrary': 'Medya Kütüphanesi',
            'sidebar.inquiries': 'Sorular',
            'sidebar.rfqTracker': 'Teklif Takibi',
            'sidebar.auditLog': 'Denetim Kaydı',
            'sidebar.settings': 'Ayarlar',
            'sidebar.allPages': 'Tüm Sayfalar',
            'sidebar.newPage': 'Yeni Sayfa',
            'topbar.commandCenter': 'KOMUTA MERKEZİ',
            'topbar.logout': 'Çıkış',
            'common.save': 'Değişiklikleri Kaydet',
            'common.discard': 'Vazgeç',
            'common.reset': 'Varsayılana Sıfırla',
            'common.cancel': 'İptal',
            'common.delete': 'Sil',
            'common.edit': 'Düzenle',
            'common.add': 'Ekle',
            'common.search': 'Ara...',
            'common.preview': 'Önizleme',
            'common.publish': 'Yayınla',
            'common.draft': 'Taslak',
            'common.active': 'Aktif',
            'common.archived': 'Arşivlendi',
            'common.featured': 'Öne Çıkan',
            'common.actions': 'İşlemler',
            'common.status': 'Durum',
            'common.name': 'Ad',
            'common.description': 'Açıklama',
            'common.image': 'Görsel',
            'common.confirm': 'Onayla',
            'common.close': 'Kapat',
            'catalog.productCatalogs': 'Ürün Katalogları',
            'catalog.addItem': '+ Ürün Ekle',
            'catalog.items': 'ürün',
            'pages.title': 'Sayfalar',
            'pages.subtitle': 'Özel sayfalar oluşturun ve yönetin',
            'pages.newPage': 'Yeni Sayfa',
            'pages.noPages': 'Henüz sayfa oluşturulmadı.',
            'settings.title': 'Ayarlar',
            'settings.aiIntegration': 'AI Entegrasyonu',
            'settings.language': 'Dil Tercihleri'
        },
        fr: {
            'sidebar.overview': 'APERÇU',
            'sidebar.content': 'CONTENU',
            'sidebar.catalogs': 'CATALOGUES',
            'sidebar.operations': 'OPÉRATIONS',
            'sidebar.system': 'SYSTÈME',
            'sidebar.pages': 'PAGES',
            'sidebar.dashboard': 'Tableau de Bord',
            'topbar.commandCenter': 'CENTRE DE COMMANDE',
            'topbar.logout': 'Déconnexion',
            'common.save': 'Enregistrer',
            'common.discard': 'Annuler',
            'common.cancel': 'Annuler',
            'common.delete': 'Supprimer',
            'common.edit': 'Modifier',
            'common.add': 'Ajouter',
            'common.search': 'Rechercher...',
            'common.preview': 'Aperçu',
            'common.publish': 'Publier',
            'catalog.productCatalogs': 'Catalogues de Produits',
            'catalog.addItem': '+ Ajouter un Article',
            'pages.title': 'Pages',
            'pages.newPage': 'Nouvelle Page',
            'settings.title': 'Paramètres',
            'settings.aiIntegration': 'Intégration IA'
        },
        ar: {
            'sidebar.overview': 'نظرة عامة',
            'sidebar.content': 'المحتوى',
            'sidebar.catalogs': 'الكتالوجات',
            'sidebar.operations': 'العمليات',
            'sidebar.system': 'النظام',
            'sidebar.pages': 'الصفحات',
            'sidebar.dashboard': 'لوحة التحكم',
            'topbar.commandCenter': 'مركز القيادة',
            'topbar.logout': 'تسجيل الخروج',
            'common.save': 'حفظ التغييرات',
            'common.cancel': 'إلغاء',
            'common.delete': 'حذف',
            'common.edit': 'تعديل',
            'common.add': 'إضافة',
            'common.search': 'بحث...',
            'common.preview': 'معاينة',
            'common.publish': 'نشر',
            'catalog.productCatalogs': 'كتالوجات المنتجات',
            'pages.title': 'الصفحات',
            'pages.newPage': 'صفحة جديدة',
            'settings.title': 'الإعدادات'
        }
    };

    let currentLang = 'en';

    function getLang() { return currentLang; }

    function setLang(lang) {
        if (!LANGS.includes(lang)) return;
        currentLang = lang;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch {}

        // Toggle RTL
        if (RTL_LANGS.includes(lang)) {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
        document.documentElement.lang = lang;

        // Update data-i18n elements
        document.querySelectorAll('[data-admin-i18n]').forEach(el => {
            const key = el.getAttribute('data-admin-i18n');
            el.textContent = t(key);
        });

        window.dispatchEvent(new CustomEvent('adminlangchange', { detail: { lang } }));
    }

    function t(key, fallback) {
        const dict = DICT[currentLang] || DICT.en;
        return dict[key] || DICT.en[key] || fallback || key;
    }

    function init() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && LANGS.includes(stored)) currentLang = stored;
        } catch {}

        // Apply current language (RTL, DOM updates)
        setLang(currentLang);

        // Wire up admin lang switcher buttons
        const switcher = document.getElementById('adminLangSwitcher');
        if (switcher) {
            switcher.querySelectorAll('button[data-lang]').forEach(btn => {
                btn.addEventListener('click', () => {
                    switcher.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    setLang(btn.getAttribute('data-lang'));
                });
                // Set initial active state
                if (btn.getAttribute('data-lang') === currentLang) {
                    switcher.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        }
    }

    return { LANGS, RTL_LANGS, getLang, setLang, t, init, DICT };
})();
