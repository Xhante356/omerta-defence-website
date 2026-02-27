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
            'about.title': 'Defining the Standard in Defence Innovation',
            'about.stats.years': 'Years Experience',
            'about.stats.countries': 'Countries Served',
            'about.stats.solutions': 'Solutions Deployed',
            // Products
            'products.label': 'WHAT WE DELIVER',
            'products.title': 'Our Capabilities',
            'products.subtitle': 'Comprehensive defence solutions across five critical domains',
            'products.learnMore': 'Learn More',
            // Product Cards
            'card.smallArms.title': 'Small Arms & Ammunition',
            'card.smallArms.text': 'Precision-engineered firearms and munitions designed for reliability in the most demanding operational environments.',
            'card.heavyOrdnance.title': 'Heavy Ordnance',
            'card.heavyOrdnance.text': 'Armoured vehicles, artillery systems, and heavy weapons platforms built for decisive force projection.',
            'card.launchers.title': 'Launchers',
            'card.launchers.text': 'Advanced rocket and missile launch systems providing strategic strike capability with pinpoint accuracy.',
            'card.drones.title': 'Drones & UAVs',
            'card.drones.text': 'Autonomous and remotely piloted systems for surveillance, reconnaissance, and precision strike operations.',
            'card.cyber.title': 'Cyber Security',
            'card.cyber.text': 'Military-grade cyber defence solutions protecting critical infrastructure against evolving digital threats.',
            // Cyber
            'cyber.label': 'DIGITAL WARFARE',
            'cyber.title': 'Cyber Security Division',
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
            'footer.smallArms': 'Small Arms & Ammunition',
            'footer.heavyOrdnance': 'Heavy Ordnance',
            'footer.launchers': 'Launchers',
            'footer.drones': 'Drones & UAVs',
            'footer.cyber': 'Cyber Security',
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
            'about.title': 'Savunma İnovasyonunda Standardı Belirliyoruz',
            'about.stats.years': 'Yıllık Deneyim',
            'about.stats.countries': 'Ülkeye Hizmet',
            'about.stats.solutions': 'Çözüm Sunuldu',
            'products.label': 'SUNDUKLARIMIZ',
            'products.title': 'Yeteneklerimiz',
            'products.subtitle': 'Beş kritik alanda kapsamlı savunma çözümleri',
            'products.learnMore': 'Daha Fazla',
            'card.smallArms.title': 'Hafif Silahlar & Mühimmat',
            'card.smallArms.text': 'En zorlu operasyonel ortamlarda güvenilirlik için tasarlanmış hassas mühendislik ateşli silahlar ve mühimmat.',
            'card.heavyOrdnance.title': 'Ağır Silahlar',
            'card.heavyOrdnance.text': 'Kararlı güç projeksiyonu için inşa edilmiş zırhlı araçlar, topçu sistemleri ve ağır silah platformları.',
            'card.launchers.title': 'Fırlatıcılar',
            'card.launchers.text': 'Nokta atışı doğruluğuyla stratejik vuruş kabiliyeti sağlayan gelişmiş roket ve füze fırlatma sistemleri.',
            'card.drones.title': 'Dronlar & İHA\'lar',
            'card.drones.text': 'Gözetleme, keşif ve hassas vuruş operasyonları için otonom ve uzaktan kumandalı sistemler.',
            'card.cyber.title': 'Siber Güvenlik',
            'card.cyber.text': 'Gelişen dijital tehditlere karşı kritik altyapıyı koruyan askeri düzeyde siber savunma çözümleri.',
            'cyber.label': 'DİJİTAL SAVAŞ',
            'cyber.title': 'Siber Güvenlik Birimi',
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
            'footer.smallArms': 'Hafif Silahlar & Mühimmat',
            'footer.heavyOrdnance': 'Ağır Silahlar',
            'footer.launchers': 'Fırlatıcılar',
            'footer.drones': 'Dronlar & İHA\'lar',
            'footer.cyber': 'Siber Güvenlik',
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
            'about.title': "Définir la Norme en Innovation de Défense",
            'about.stats.years': "Ans d'Expérience",
            'about.stats.countries': 'Pays Desservis',
            'about.stats.solutions': 'Solutions Déployées',
            'products.label': 'CE QUE NOUS OFFRONS',
            'products.title': 'Nos Capacités',
            'products.subtitle': 'Solutions de défense complètes dans cinq domaines critiques',
            'products.learnMore': 'En Savoir Plus',
            'card.smallArms.title': 'Armes Légères & Munitions',
            'card.smallArms.text': "Armes à feu et munitions de précision conçues pour la fiabilité dans les environnements opérationnels les plus exigeants.",
            'card.heavyOrdnance.title': 'Armement Lourd',
            'card.heavyOrdnance.text': "Véhicules blindés, systèmes d'artillerie et plateformes d'armes lourdes construits pour une projection de force décisive.",
            'card.launchers.title': 'Lanceurs',
            'card.launchers.text': "Systèmes de lancement de roquettes et de missiles avancés offrant une capacité de frappe stratégique avec une précision chirurgicale.",
            'card.drones.title': 'Drones & UAV',
            'card.drones.text': "Systèmes autonomes et pilotés à distance pour la surveillance, la reconnaissance et les opérations de frappe de précision.",
            'card.cyber.title': 'Cybersécurité',
            'card.cyber.text': "Solutions de cyberdéfense de niveau militaire protégeant les infrastructures critiques contre les menaces numériques évolutives.",
            'cyber.label': 'GUERRE NUMÉRIQUE',
            'cyber.title': 'Division Cybersécurité',
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
            'footer.smallArms': 'Armes Légères & Munitions',
            'footer.heavyOrdnance': 'Armement Lourd',
            'footer.launchers': 'Lanceurs',
            'footer.drones': 'Drones & UAV',
            'footer.cyber': 'Cybersécurité',
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
            'about.title': 'تحديد المعيار في ابتكار الدفاع',
            'about.stats.years': 'سنوات خبرة',
            'about.stats.countries': 'دولة تم خدمتها',
            'about.stats.solutions': 'حلول تم نشرها',
            'products.label': 'ما نقدمه',
            'products.title': 'قدراتنا',
            'products.subtitle': 'حلول دفاعية شاملة عبر خمسة مجالات حيوية',
            'products.learnMore': 'اعرف المزيد',
            'card.smallArms.title': 'الأسلحة الخفيفة والذخيرة',
            'card.smallArms.text': 'أسلحة نارية وذخائر مصممة بدقة هندسية للموثوقية في أكثر البيئات التشغيلية تطلبًا.',
            'card.heavyOrdnance.title': 'الأسلحة الثقيلة',
            'card.heavyOrdnance.text': 'مركبات مدرعة وأنظمة مدفعية ومنصات أسلحة ثقيلة مصممة لإسقاط القوة الحاسمة.',
            'card.launchers.title': 'القاذفات',
            'card.launchers.text': 'أنظمة إطلاق صواريخ متقدمة توفر قدرة ضربات استراتيجية بدقة متناهية.',
            'card.drones.title': 'الطائرات المسيرة',
            'card.drones.text': 'أنظمة مستقلة وموجهة عن بعد للمراقبة والاستطلاع وعمليات الضربات الدقيقة.',
            'card.cyber.title': 'الأمن السيبراني',
            'card.cyber.text': 'حلول دفاع سيبراني بمستوى عسكري تحمي البنية التحتية الحيوية من التهديدات الرقمية المتطورة.',
            'cyber.label': 'الحرب الرقمية',
            'cyber.title': 'قسم الأمن السيبراني',
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
            'footer.smallArms': 'الأسلحة الخفيفة والذخيرة',
            'footer.heavyOrdnance': 'الأسلحة الثقيلة',
            'footer.launchers': 'القاذفات',
            'footer.drones': 'الطائرات المسيرة',
            'footer.cyber': 'الأمن السيبراني',
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
