/* ===================================================
   OMERTA DEFENCE — Site i18n Engine
   Provides I18n.t(key), setLang(), getLang(), RTL toggle
   ~80 UI strings for main site
   =================================================== */

const I18n = (() => {
    'use strict';

    const LANGS = ['en', 'tr', 'fr', 'ar'];
    const RTL_LANGS = ['ar'];
    const STORAGE_KEY = 'od_site_lang';

    const DICT = {
        en: {
            // Nav
            'nav.home': 'Home',
            'nav.about': 'About',
            'nav.products': 'Products',
            'nav.cyber': 'Cyber Security',
            'nav.contact': 'Contact',
            'nav.quote': 'Request Quote',
            // Hero defaults
            'hero.preheading': 'PRECISION. POWER. PROTECTION.',
            'hero.btn1': 'Explore Capabilities',
            'hero.btn2': 'Contact Us',
            // About
            'about.label': 'WHO WE ARE',
            'about.stats.years': 'Years Experience',
            'about.stats.countries': 'Countries Served',
            'about.stats.solutions': 'Solutions Deployed',
            // Products
            'products.label': 'WHAT WE DELIVER',
            'products.title': 'Our Capabilities',
            'products.subtitle': 'Comprehensive defence solutions across five critical domains',
            'products.learnMore': 'Learn More',
            // Cyber
            'cyber.label': 'DIGITAL WARFARE',
            'cyber.cta': 'Secure Your Infrastructure',
            // Contact
            'contact.label': 'GET IN TOUCH',
            'contact.title': 'Contact Us',
            'contact.heading': "Let's Discuss Your Requirements",
            'contact.hq': 'Headquarters',
            'contact.email': 'Email',
            'contact.phone': 'Phone',
            'contact.hours': 'Business Hours',
            'contact.name': 'Full Name',
            'contact.emailField': 'Email Address',
            'contact.company': 'Company / Organization',
            'contact.subject': 'Subject',
            'contact.message': 'Your Message',
            'contact.send': 'Send Message',
            'contact.sending': 'Sending...',
            'contact.success': 'Message sent successfully. We\'ll respond within 24 hours.',
            // Contact subjects
            'subject.smallArms': 'Small Arms & Ammunition',
            'subject.heavyOrdnance': 'Heavy Ordnance',
            'subject.launchers': 'Launchers',
            'subject.drones': 'Drones & UAVs',
            'subject.cyber': 'Cyber Security',
            'subject.general': 'General Inquiry',
            // Footer
            'footer.quickLinks': 'Quick Links',
            'footer.productsHeading': 'Products',
            // Catalog pages
            'catalog.back': 'Back to Products',
            'catalog.items': 'items',
            'catalog.requestInfo': 'Request Information',
            'catalog.specs': 'Technical Specifications',
            'catalog.noProducts': 'No products found in this category.',
            // Loading
            'loading.text': 'INITIALIZING SYSTEMS',
            // Language names
            'lang.en': 'English',
            'lang.tr': 'Türkçe',
            'lang.fr': 'Français',
            'lang.ar': 'العربية'
        },
        tr: {
            'nav.home': 'Ana Sayfa',
            'nav.about': 'Hakkımızda',
            'nav.products': 'Ürünler',
            'nav.cyber': 'Siber Güvenlik',
            'nav.contact': 'İletişim',
            'nav.quote': 'Teklif İste',
            'hero.preheading': 'HASSASIYET. GÜÇ. KORUMA.',
            'hero.btn1': 'Yetenekleri Keşfedin',
            'hero.btn2': 'Bize Ulaşın',
            'about.label': 'BİZ KİMİZ',
            'about.stats.years': 'Yıllık Deneyim',
            'about.stats.countries': 'Ülkeye Hizmet',
            'about.stats.solutions': 'Çözüm Sunuldu',
            'products.label': 'SUNDUKLARIMIZ',
            'products.title': 'Yeteneklerimiz',
            'products.subtitle': 'Beş kritik alanda kapsamlı savunma çözümleri',
            'products.learnMore': 'Daha Fazla',
            'cyber.label': 'DİJİTAL SAVAŞ',
            'cyber.cta': 'Altyapınızı Güvenli Kılın',
            'contact.label': 'İLETİŞİM',
            'contact.title': 'Bize Ulaşın',
            'contact.heading': 'Gereksinimlerinizi Konuşalım',
            'contact.hq': 'Genel Merkez',
            'contact.email': 'E-posta',
            'contact.phone': 'Telefon',
            'contact.hours': 'Çalışma Saatleri',
            'contact.name': 'Ad Soyad',
            'contact.emailField': 'E-posta Adresi',
            'contact.company': 'Şirket / Kurum',
            'contact.subject': 'Konu',
            'contact.message': 'Mesajınız',
            'contact.send': 'Mesaj Gönder',
            'contact.sending': 'Gönderiliyor...',
            'contact.success': 'Mesajınız başarıyla gönderildi. 24 saat içinde yanıt vereceğiz.',
            'subject.smallArms': 'Hafif Silahlar ve Mühimmat',
            'subject.heavyOrdnance': 'Ağır Silahlar',
            'subject.launchers': 'Fırlatıcılar',
            'subject.drones': 'Dronlar ve İHA\'lar',
            'subject.cyber': 'Siber Güvenlik',
            'subject.general': 'Genel Soru',
            'footer.quickLinks': 'Hızlı Linkler',
            'footer.productsHeading': 'Ürünler',
            'catalog.back': 'Ürünlere Dön',
            'catalog.items': 'ürün',
            'catalog.requestInfo': 'Bilgi Talep Et',
            'catalog.specs': 'Teknik Özellikler',
            'catalog.noProducts': 'Bu kategoride ürün bulunamadı.',
            'loading.text': 'SİSTEMLER BAŞLATILIYOR',
            'lang.en': 'English',
            'lang.tr': 'Türkçe',
            'lang.fr': 'Français',
            'lang.ar': 'العربية'
        },
        fr: {
            'nav.home': 'Accueil',
            'nav.about': 'À propos',
            'nav.products': 'Produits',
            'nav.cyber': 'Cybersécurité',
            'nav.contact': 'Contact',
            'nav.quote': 'Demander un Devis',
            'hero.preheading': 'PRÉCISION. PUISSANCE. PROTECTION.',
            'hero.btn1': 'Explorer les Capacités',
            'hero.btn2': 'Contactez-nous',
            'about.label': 'QUI SOMMES-NOUS',
            'about.stats.years': "Ans d'Expérience",
            'about.stats.countries': 'Pays Desservis',
            'about.stats.solutions': 'Solutions Déployées',
            'products.label': 'CE QUE NOUS OFFRONS',
            'products.title': 'Nos Capacités',
            'products.subtitle': 'Solutions de défense complètes dans cinq domaines critiques',
            'products.learnMore': 'En Savoir Plus',
            'cyber.label': 'GUERRE NUMÉRIQUE',
            'cyber.cta': 'Sécurisez Votre Infrastructure',
            'contact.label': 'CONTACTEZ-NOUS',
            'contact.title': 'Nous Contacter',
            'contact.heading': 'Discutons de Vos Besoins',
            'contact.hq': 'Siège Social',
            'contact.email': 'E-mail',
            'contact.phone': 'Téléphone',
            'contact.hours': "Heures d'Ouverture",
            'contact.name': 'Nom Complet',
            'contact.emailField': 'Adresse E-mail',
            'contact.company': 'Société / Organisation',
            'contact.subject': 'Sujet',
            'contact.message': 'Votre Message',
            'contact.send': 'Envoyer le Message',
            'contact.sending': 'Envoi en cours...',
            'contact.success': 'Message envoyé avec succès. Nous répondrons sous 24 heures.',
            'subject.smallArms': 'Armes Légères et Munitions',
            'subject.heavyOrdnance': 'Armement Lourd',
            'subject.launchers': 'Lanceurs',
            'subject.drones': 'Drones et UAV',
            'subject.cyber': 'Cybersécurité',
            'subject.general': 'Demande Générale',
            'footer.quickLinks': 'Liens Rapides',
            'footer.productsHeading': 'Produits',
            'catalog.back': 'Retour aux Produits',
            'catalog.items': 'articles',
            'catalog.requestInfo': "Demander des Informations",
            'catalog.specs': 'Spécifications Techniques',
            'catalog.noProducts': 'Aucun produit trouvé dans cette catégorie.',
            'loading.text': 'INITIALISATION DES SYSTÈMES',
            'lang.en': 'English',
            'lang.tr': 'Türkçe',
            'lang.fr': 'Français',
            'lang.ar': 'العربية'
        },
        ar: {
            'nav.home': 'الرئيسية',
            'nav.about': 'من نحن',
            'nav.products': 'المنتجات',
            'nav.cyber': 'الأمن السيبراني',
            'nav.contact': 'اتصل بنا',
            'nav.quote': 'طلب عرض سعر',
            'hero.preheading': 'الدقة. القوة. الحماية.',
            'hero.btn1': 'استكشف القدرات',
            'hero.btn2': 'اتصل بنا',
            'about.label': 'من نحن',
            'about.stats.years': 'سنوات خبرة',
            'about.stats.countries': 'دولة تم خدمتها',
            'about.stats.solutions': 'حلول تم نشرها',
            'products.label': 'ما نقدمه',
            'products.title': 'قدراتنا',
            'products.subtitle': 'حلول دفاعية شاملة عبر خمسة مجالات حيوية',
            'products.learnMore': 'اعرف المزيد',
            'cyber.label': 'الحرب الرقمية',
            'cyber.cta': 'أمّن بنيتك التحتية',
            'contact.label': 'تواصل معنا',
            'contact.title': 'اتصل بنا',
            'contact.heading': 'لنناقش متطلباتكم',
            'contact.hq': 'المقر الرئيسي',
            'contact.email': 'البريد الإلكتروني',
            'contact.phone': 'الهاتف',
            'contact.hours': 'ساعات العمل',
            'contact.name': 'الاسم الكامل',
            'contact.emailField': 'البريد الإلكتروني',
            'contact.company': 'الشركة / المؤسسة',
            'contact.subject': 'الموضوع',
            'contact.message': 'رسالتك',
            'contact.send': 'إرسال الرسالة',
            'contact.sending': 'جارِ الإرسال...',
            'contact.success': 'تم إرسال الرسالة بنجاح. سنرد خلال 24 ساعة.',
            'subject.smallArms': 'الأسلحة الخفيفة والذخيرة',
            'subject.heavyOrdnance': 'الأسلحة الثقيلة',
            'subject.launchers': 'القاذفات',
            'subject.drones': 'الطائرات المسيرة',
            'subject.cyber': 'الأمن السيبراني',
            'subject.general': 'استفسار عام',
            'footer.quickLinks': 'روابط سريعة',
            'footer.productsHeading': 'المنتجات',
            'catalog.back': 'العودة للمنتجات',
            'catalog.items': 'عنصر',
            'catalog.requestInfo': 'طلب معلومات',
            'catalog.specs': 'المواصفات الفنية',
            'catalog.noProducts': 'لا توجد منتجات في هذه الفئة.',
            'loading.text': 'جارِ تهيئة الأنظمة',
            'lang.en': 'English',
            'lang.tr': 'Türkçe',
            'lang.fr': 'Français',
            'lang.ar': 'العربية'
        }
    };

    let currentLang = 'en';

    function getLang() {
        return currentLang;
    }

    function setLang(lang) {
        if (!LANGS.includes(lang)) return;
        currentLang = lang;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch {}

        // Update HTML dir & lang
        document.documentElement.lang = lang;
        if (RTL_LANGS.includes(lang)) {
            document.documentElement.dir = 'rtl';
            loadRTLStylesheet();
        } else {
            document.documentElement.dir = 'ltr';
            removeRTLStylesheet();
        }

        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = t(key);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translated;
            } else if (el.tagName === 'OPTION') {
                el.textContent = translated;
            } else {
                el.textContent = translated;
            }
        });

        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
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
        setLang(currentLang);

        // Wire up site lang switcher buttons
        const switcher = document.getElementById('langSwitcher');
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

    function loadRTLStylesheet() {
        if (document.getElementById('rtl-stylesheet')) return;
        const link = document.createElement('link');
        link.id = 'rtl-stylesheet';
        link.rel = 'stylesheet';
        link.href = 'css/rtl.css';
        document.head.appendChild(link);
    }

    function removeRTLStylesheet() {
        const existing = document.getElementById('rtl-stylesheet');
        if (existing) existing.remove();
    }

    // Resolve a lang-aware field: if string return directly, if object return lang version
    function resolveLangField(field, lang) {
        if (field === null || field === undefined) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object') {
            return field[lang || currentLang] || field.en || '';
        }
        return String(field);
    }

    return { LANGS, RTL_LANGS, getLang, setLang, t, init, resolveLangField, DICT };
})();

// Auto-init on DOM ready
if (typeof I18n !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { I18n.init(); });
    } else {
        I18n.init();
    }
}
