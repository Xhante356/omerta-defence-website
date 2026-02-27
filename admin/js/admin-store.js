/* ===================================================
   OMERTA DEFENCE — Admin Store (localStorage CRUD Layer)
   All default data, CRUD operations, audit logging
   v2: Multi-language support, page CRUD, AI settings
   =================================================== */

const AdminStore = (() => {
    // ── Key constants ──
    const KEYS = {
        AUTH: 'od_auth',
        CONTENT_HERO: 'od_content_hero',
        CONTENT_ABOUT: 'od_content_about',
        CONTENT_PRODUCTS: 'od_content_products',
        CONTENT_CYBER: 'od_content_cyber',
        CONTENT_CONTACT: 'od_content_contact',
        CONTENT_FOOTER: 'od_content_footer',
        CATALOG_SMALL_ARMS: 'od_catalog_small-arms',
        CATALOG_HEAVY_ORDNANCE: 'od_catalog_heavy-ordnance',
        CATALOG_LAUNCHERS: 'od_catalog_launchers',
        CATALOG_DRONES: 'od_catalog_drones',
        CATALOG_CYBER: 'od_catalog_cyber',
        SETTINGS_SEO: 'od_settings_seo',
        SETTINGS_BRANDING: 'od_settings_branding',
        SETTINGS_AI: 'od_settings_ai',
        MEDIA: 'od_media',
        INQUIRIES: 'od_inquiries',
        RFQ: 'od_rfq',
        AUDIT_LOG: 'od_audit_log',
        I18N: 'od_i18n',
        SITE_LANG: 'od_site_lang',
        ADMIN_LANG: 'od_admin_lang',
        PAGES: 'od_pages'
    };

    const CATALOG_CATEGORIES = {
        'small-arms': { key: KEYS.CATALOG_SMALL_ARMS, label: 'Small Arms & Ammunition', icon: '🔫' },
        'heavy-ordnance': { key: KEYS.CATALOG_HEAVY_ORDNANCE, label: 'Heavy Ordnance', icon: '💣' },
        'launchers': { key: KEYS.CATALOG_LAUNCHERS, label: 'Launchers', icon: '🚀' },
        'drones': { key: KEYS.CATALOG_DRONES, label: 'Drones & UAVs', icon: '✈' },
        'cyber': { key: KEYS.CATALOG_CYBER, label: 'Cyber Security', icon: '🛡' }
    };

    const AUDIT_MAX = 500;
    const AVAILABLE_LANGS = ['en', 'tr', 'fr', 'ar'];

    // ── Default Data (v2 format) ──
    const DEFAULTS = {
        [KEYS.CONTENT_HERO]: {
            _v: 2,
            _shared: {
                backgroundImage: 'https://images.unsplash.com/photo-1534642960519-11ad79bc19df?w=1920&q=80',
                btn1Link: '#products',
                btn2Link: '#contact'
            },
            en: {
                preheading: 'PRECISION. POWER. PROTECTION.',
                title: 'OMERTA<br>DEFENCE',
                subtitle: 'Advanced defence solutions engineered for superiority.<br>From tactical systems to cyber warfare — we define the future of security.',
                btn1Text: 'Explore Capabilities',
                btn2Text: 'Contact Us'
            },
            tr: {
                preheading: 'HASSASIYET. GÜÇ. KORUMA.',
                title: 'OMERTA<br>SAVUNMA',
                subtitle: 'Üstünlük için tasarlanmış gelişmiş savunma çözümleri.<br>Taktik sistemlerden siber savaşa — güvenliğin geleceğini biz belirliyoruz.',
                btn1Text: 'Yetenekleri Keşfedin',
                btn2Text: 'Bize Ulaşın'
            },
            fr: {
                preheading: 'PRÉCISION. PUISSANCE. PROTECTION.',
                title: 'OMERTA<br>DÉFENCE',
                subtitle: "Solutions de défense avancées conçues pour la supériorité.<br>Des systèmes tactiques à la cyberguerre — nous définissons l'avenir de la sécurité.",
                btn1Text: 'Explorer les Capacités',
                btn2Text: 'Contactez-nous'
            },
            ar: {
                preheading: 'الدقة. القوة. الحماية.',
                title: 'أومرتا<br>للدفاع',
                subtitle: 'حلول دفاعية متقدمة مصممة للتفوق.<br>من الأنظمة التكتيكية إلى الحرب السيبرانية — نحن نحدد مستقبل الأمن.',
                btn1Text: 'استكشف القدرات',
                btn2Text: 'اتصل بنا'
            }
        },
        [KEYS.CONTENT_ABOUT]: {
            _v: 2,
            _shared: {
                imageUrl: 'https://images.unsplash.com/photo-1579912437766-7896df6d3cd3?w=800&q=80',
                stats: [
                    { number: 25, suffix: '+' },
                    { number: 50, suffix: '+' },
                    { number: 1000, suffix: '+' }
                ]
            },
            en: {
                sectionLabel: 'WHO WE ARE',
                title: 'Defining the Standard<br>in Defence Innovation',
                paragraph1: 'OMERTA DEFENCE stands at the forefront of global security solutions. With decades of expertise in advanced weaponry, unmanned systems, and cyber operations, we deliver uncompromising capability to defence forces and sovereign nations worldwide.',
                paragraph2: 'Our commitment to discretion is matched only by our dedication to precision. Every solution we engineer reflects our core philosophy: silent strength, absolute reliability, and technological dominance on every front.',
                stats: [
                    { label: 'Years Experience' },
                    { label: 'Countries Served' },
                    { label: 'Solutions Deployed' }
                ]
            },
            tr: {
                sectionLabel: 'BİZ KİMİZ',
                title: 'Savunma İnovasyonunda<br>Standardı Belirliyoruz',
                paragraph1: 'OMERTA SAVUNMA, küresel güvenlik çözümlerinin ön safında yer almaktadır. Gelişmiş silah, insansız sistemler ve siber operasyonlardaki onlarca yıllık uzmanlığımızla, dünya genelindeki savunma kuvvetlerine ve egemen devletlere taviz vermeyen yetenek sunuyoruz.',
                paragraph2: 'Gizliliğe olan bağlılığımız, yalnızca hassasiyete olan adanmışlığımızla eşleşir. Tasarladığımız her çözüm, temel felsefemizi yansıtır: sessiz güç, mutlak güvenilirlik ve her cephede teknolojik üstünlük.',
                stats: [
                    { label: 'Yıllık Deneyim' },
                    { label: 'Ülkeye Hizmet' },
                    { label: 'Çözüm Sunuldu' }
                ]
            },
            fr: {
                sectionLabel: 'QUI SOMMES-NOUS',
                title: "Définir la Norme<br>en Innovation de Défense",
                paragraph1: "OMERTA DÉFENCE se situe à l'avant-garde des solutions de sécurité mondiales. Avec des décennies d'expertise en armement avancé, systèmes autonomes et opérations cyber, nous offrons des capacités sans compromis aux forces de défense et nations souveraines du monde entier.",
                paragraph2: "Notre engagement envers la discrétion n'a d'égal que notre dédication à la précision. Chaque solution que nous concevons reflète notre philosophie fondamentale : force silencieuse, fiabilité absolue et dominance technologique sur tous les fronts.",
                stats: [
                    { label: "Ans d'Expérience" },
                    { label: 'Pays Desservis' },
                    { label: 'Solutions Déployées' }
                ]
            },
            ar: {
                sectionLabel: 'من نحن',
                title: 'تحديد المعيار<br>في ابتكار الدفاع',
                paragraph1: 'تقف أومرتا للدفاع في طليعة حلول الأمن العالمية. مع عقود من الخبرة في الأسلحة المتقدمة والأنظمة غير المأهولة والعمليات السيبرانية، نقدم قدرات لا هوادة فيها لقوات الدفاع والدول ذات السيادة في جميع أنحاء العالم.',
                paragraph2: 'التزامنا بالسرية لا يضاهيه سوى تفانينا في الدقة. كل حل نصممه يعكس فلسفتنا الأساسية: القوة الصامتة، والموثوقية المطلقة، والهيمنة التكنولوجية على كل جبهة.',
                stats: [
                    { label: 'سنوات خبرة' },
                    { label: 'دولة تم خدمتها' },
                    { label: 'حلول تم نشرها' }
                ]
            }
        },
        [KEYS.CONTENT_PRODUCTS]: {
            _v: 2, _shared: {},
            en: { sectionLabel: 'WHAT WE DELIVER', title: 'Our Capabilities', subtitle: 'Comprehensive defence solutions across five critical domains' },
            tr: { sectionLabel: 'SUNDUKLARIMIZ', title: 'Yeteneklerimiz', subtitle: 'Beş kritik alanda kapsamlı savunma çözümleri' },
            fr: { sectionLabel: 'CE QUE NOUS OFFRONS', title: 'Nos Capacités', subtitle: 'Solutions de défense complètes dans cinq domaines critiques' },
            ar: { sectionLabel: 'ما نقدمه', title: 'قدراتنا', subtitle: 'حلول دفاعية شاملة عبر خمسة مجالات حيوية' }
        },
        [KEYS.CONTENT_CYBER]: {
            _v: 2,
            _shared: {
                backgroundImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
                ctaLink: '#contact',
                features: [
                    { icon: 'alert-circle' },
                    { icon: 'lock' },
                    { icon: 'zap' },
                    { icon: 'shield' }
                ]
            },
            en: {
                sectionLabel: 'DIGITAL WARFARE',
                title: 'Cyber Security Division',
                description: "In an era where digital threats are as critical as physical ones, OMERTA DEFENCE's Cyber Security Division provides sovereign-level protection for national infrastructure, military networks, and classified communications.",
                ctaText: 'Secure Your Infrastructure',
                features: [
                    { title: 'Threat Intelligence', text: 'Real-time monitoring and predictive analysis of global cyber threat landscapes.' },
                    { title: 'Network Defence', text: 'Multi-layered intrusion prevention and zero-trust architecture implementation.' },
                    { title: 'Incident Response', text: 'Rapid deployment cyber teams for breach containment and forensic analysis.' },
                    { title: 'Secure Communications', text: 'End-to-end encrypted communication systems for classified operations.' }
                ]
            },
            tr: {
                sectionLabel: 'DİJİTAL SAVAŞ',
                title: 'Siber Güvenlik Birimi',
                description: 'Dijital tehditlerin fiziksel tehditler kadar kritik olduğu bir çağda, OMERTA SAVUNMA Siber Güvenlik Birimi ulusal altyapı, askeri ağlar ve gizli iletişimler için egemenlik düzeyinde koruma sağlar.',
                ctaText: 'Altyapınızı Güvenli Kılın',
                features: [
                    { title: 'Tehdit İstihbaratı', text: 'Küresel siber tehdit ortamlarının gerçek zamanlı izlenmesi ve tahmini analizi.' },
                    { title: 'Ağ Savunması', text: 'Çok katmanlı izinsiz giriş önleme ve sıfır güven mimarisi uygulaması.' },
                    { title: 'Olay Müdahale', text: 'İhlal muhafazası ve adli analiz için hızlı dağıtım siber ekipleri.' },
                    { title: 'Güvenli İletişim', text: 'Gizli operasyonlar için uçtan uca şifrelenmiş iletişim sistemleri.' }
                ]
            },
            fr: {
                sectionLabel: 'GUERRE NUMÉRIQUE',
                title: 'Division Cybersécurité',
                description: "À une époque où les menaces numériques sont aussi critiques que les menaces physiques, la Division Cybersécurité d'OMERTA DÉFENCE offre une protection de niveau souverain pour les infrastructures nationales, les réseaux militaires et les communications classifiées.",
                ctaText: 'Sécurisez Votre Infrastructure',
                features: [
                    { title: 'Renseignement sur les Menaces', text: "Surveillance en temps réel et analyse prédictive des paysages de cybermenaces mondiales." },
                    { title: 'Défense Réseau', text: "Prévention d'intrusion multicouche et implémentation d'architecture zéro confiance." },
                    { title: "Réponse aux Incidents", text: "Équipes cyber de déploiement rapide pour le confinement des violations et l'analyse forensique." },
                    { title: 'Communications Sécurisées', text: "Systèmes de communication chiffrés de bout en bout pour les opérations classifiées." }
                ]
            },
            ar: {
                sectionLabel: 'الحرب الرقمية',
                title: 'قسم الأمن السيبراني',
                description: 'في عصر تعتبر فيه التهديدات الرقمية بنفس أهمية التهديدات المادية، يوفر قسم الأمن السيبراني في أومرتا للدفاع حماية على مستوى السيادة للبنية التحتية الوطنية والشبكات العسكرية والاتصالات السرية.',
                ctaText: 'أمّن بنيتك التحتية',
                features: [
                    { title: 'استخبارات التهديدات', text: 'مراقبة فورية وتحليل تنبؤي لمشهد التهديدات السيبرانية العالمية.' },
                    { title: 'الدفاع عن الشبكات', text: 'منع التسلل متعدد الطبقات وتطبيق بنية انعدام الثقة.' },
                    { title: 'الاستجابة للحوادث', text: 'فرق سيبرانية سريعة الانتشار لاحتواء الاختراقات والتحليل الجنائي.' },
                    { title: 'الاتصالات الآمنة', text: 'أنظمة اتصالات مشفرة من طرف إلى طرف للعمليات السرية.' }
                ]
            }
        },
        [KEYS.CONTENT_CONTACT]: {
            _v: 2,
            _shared: { headquarters: 'Ankara, Turkey', email: 'info@omertadefence.com', phone: '+90 (312) 000 0000', hours: 'Mon - Fri: 09:00 - 18:00' },
            en: { heading: "Let's Discuss Your Requirements", description: 'Our team of defence specialists is ready to provide tailored solutions for your operational needs. All inquiries are handled with the highest level of confidentiality.' },
            tr: { heading: 'Gereksinimlerinizi Konuşalım', description: 'Savunma uzmanları ekibimiz, operasyonel ihtiyaçlarınız için özelleşmiş çözümler sunmaya hazırdır. Tüm sorular en üst düzeyde gizlilikle işlenir.' },
            fr: { heading: 'Discutons de Vos Besoins', description: "Notre équipe de spécialistes de la défense est prête à fournir des solutions sur mesure pour vos besoins opérationnels. Toutes les demandes sont traitées avec le plus haut niveau de confidentialité." },
            ar: { heading: 'لنناقش متطلباتكم', description: 'فريقنا من متخصصي الدفاع جاهز لتقديم حلول مخصصة لاحتياجاتكم التشغيلية. يتم التعامل مع جميع الاستفسارات بأعلى مستوى من السرية.' }
        },
        [KEYS.CONTENT_FOOTER]: {
            _v: 2, _shared: {},
            en: { tagline: 'Silent Strength. Absolute Reliability.', text: 'Advanced defence solutions for sovereign nations and security forces worldwide.', copyright: '&copy; 2026 OMERTA DEFENCE. All rights reserved.' },
            tr: { tagline: 'Sessiz Güç. Mutlak Güvenilirlik.', text: 'Dünya genelindeki egemen devletler ve güvenlik kuvvetleri için gelişmiş savunma çözümleri.', copyright: '&copy; 2026 OMERTA SAVUNMA. Tüm hakları saklıdır.' },
            fr: { tagline: 'Force Silencieuse. Fiabilité Absolue.', text: 'Solutions de défense avancées pour les nations souveraines et les forces de sécurité du monde entier.', copyright: '&copy; 2026 OMERTA DÉFENCE. Tous droits réservés.' },
            ar: { tagline: 'القوة الصامتة. الموثوقية المطلقة.', text: 'حلول دفاعية متقدمة للدول ذات السيادة وقوات الأمن في جميع أنحاء العالم.', copyright: '&copy; 2026 أومرتا للدفاع. جميع الحقوق محفوظة.' }
        },
        [KEYS.SETTINGS_SEO]: {
            _v: 2, _shared: {},
            en: { pageTitle: 'OMERTA DEFENCE | Precision. Power. Protection.', metaDescription: 'OMERTA DEFENCE - Leading provider of advanced defence solutions including Small Arms, Heavy Ordnance, Launchers, Drones & UAVs, and Cyber Security.' },
            tr: { pageTitle: 'OMERTA SAVUNMA | Hassasiyet. Güç. Koruma.', metaDescription: 'OMERTA SAVUNMA - Hafif Silahlar, Ağır Silahlar, Fırlatıcılar, Dronlar ve Siber Güvenlik dahil gelişmiş savunma çözümlerinin lider sağlayıcısı.' },
            fr: { pageTitle: 'OMERTA DÉFENCE | Précision. Puissance. Protection.', metaDescription: "OMERTA DÉFENCE - Fournisseur leader de solutions de défense avancées incluant Armes Légères, Armement Lourd, Lanceurs, Drones et Cybersécurité." },
            ar: { pageTitle: 'أومرتا للدفاع | الدقة. القوة. الحماية.', metaDescription: 'أومرتا للدفاع - المزود الرائد لحلول الدفاع المتقدمة بما في ذلك الأسلحة الخفيفة والأسلحة الثقيلة والقاذفات والطائرات المسيرة والأمن السيبراني.' }
        },
        [KEYS.SETTINGS_BRANDING]: {
            logoUrl: 'assets/images/logo.png',
            primaryColor: '#1B3C4B',
            accentColor: '#3D8FA7'
        },
        [KEYS.SETTINGS_AI]: {
            groqApiKey: '',
            model: 'llama-3.3-70b-versatile',
            enabled: false
        }
    };

    // ── Helpers ──
    function generateId(prefix = 'id') {
        return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function now() {
        return new Date().toISOString();
    }

    // ── Core CRUD ──
    function get(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('AdminStore.set failed:', e);
            return false;
        }
    }

    function remove(key) {
        localStorage.removeItem(key);
    }

    // ── Content CRUD (v2 aware) ──
    function getContent(key) {
        return get(key) || DEFAULTS[key] || null;
    }

    function setContent(key, data) {
        set(key, data);
        auditLog('content_update', `Updated ${key.replace('od_content_', '').replace('od_settings_', '')} content`);
    }

    function resetContent(key) {
        if (DEFAULTS[key]) {
            set(key, JSON.parse(JSON.stringify(DEFAULTS[key])));
            auditLog('content_reset', `Reset ${key.replace('od_content_', '').replace('od_settings_', '')} to defaults`);
        }
    }

    function getDefault(key) {
        return DEFAULTS[key] ? JSON.parse(JSON.stringify(DEFAULTS[key])) : null;
    }

    // ── Language-aware content helpers ──
    function getContentForLang(key, lang) {
        const data = getContent(key);
        if (!data) return null;
        if (data._v !== 2) return data; // v1 fallback
        const langData = data[lang] || data.en || {};
        return { ...data._shared, ...langData };
    }

    function setContentForLang(key, lang, langFields, sharedFields) {
        const data = getContent(key) || { _v: 2, _shared: {} };
        if (data._v !== 2) {
            // Auto-upgrade to v2
            data._v = 2;
            data._shared = data._shared || {};
        }
        if (sharedFields) data._shared = { ...data._shared, ...sharedFields };
        if (langFields) data[lang] = { ...(data[lang] || {}), ...langFields };
        setContent(key, data);
    }

    // ── Catalog CRUD ──
    function getCatalog(categorySlug) {
        const cat = CATALOG_CATEGORIES[categorySlug];
        if (!cat) return [];
        return get(cat.key) || [];
    }

    function setCatalog(categorySlug, items) {
        const cat = CATALOG_CATEGORIES[categorySlug];
        if (!cat) return;
        set(cat.key, items);
    }

    function addCatalogItem(categorySlug, item) {
        const items = getCatalog(categorySlug);
        const newItem = {
            id: generateId('cat'),
            _v: 2,
            name: item.name || { en: '', tr: '', fr: '', ar: '' },
            shortDescription: item.shortDescription || { en: '', tr: '', fr: '', ar: '' },
            fullDescription: item.fullDescription || { en: '', tr: '', fr: '', ar: '' },
            imageUrl: item.imageUrl || '',
            specs: item.specs || [],
            featured: item.featured || false,
            status: item.status || 'active',
            createdAt: now(),
            updatedAt: now()
        };
        items.push(newItem);
        setCatalog(categorySlug, items);
        const displayName = typeof newItem.name === 'object' ? (newItem.name.en || '') : newItem.name;
        auditLog('catalog_add', `Added "${displayName}" to ${CATALOG_CATEGORIES[categorySlug].label}`);
        return newItem;
    }

    function updateCatalogItem(categorySlug, itemId, updates) {
        const items = getCatalog(categorySlug);
        const idx = items.findIndex(i => i.id === itemId);
        if (idx === -1) return null;
        items[idx] = { ...items[idx], ...updates, updatedAt: now() };
        setCatalog(categorySlug, items);
        const displayName = typeof items[idx].name === 'object' ? (items[idx].name.en || '') : items[idx].name;
        auditLog('catalog_update', `Updated "${displayName}" in ${CATALOG_CATEGORIES[categorySlug].label}`);
        return items[idx];
    }

    function deleteCatalogItem(categorySlug, itemId) {
        const items = getCatalog(categorySlug);
        const item = items.find(i => i.id === itemId);
        const filtered = items.filter(i => i.id !== itemId);
        setCatalog(categorySlug, filtered);
        if (item) {
            const displayName = typeof item.name === 'object' ? (item.name.en || '') : item.name;
            auditLog('catalog_delete', `Deleted "${displayName}" from ${CATALOG_CATEGORIES[categorySlug].label}`);
        }
    }

    function duplicateCatalogItem(categorySlug, itemId) {
        const items = getCatalog(categorySlug);
        const original = items.find(i => i.id === itemId);
        if (!original) return null;
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = generateId('cat');
        copy.createdAt = now();
        copy.updatedAt = now();
        if (typeof copy.name === 'object') {
            Object.keys(copy.name).forEach(l => { if (copy.name[l]) copy.name[l] += ' (Copy)'; });
        } else {
            copy.name = (copy.name || '') + ' (Copy)';
        }
        items.push(copy);
        setCatalog(categorySlug, items);
        return copy;
    }

    function getFeaturedItems() {
        const featured = {};
        Object.keys(CATALOG_CATEGORIES).forEach(slug => {
            const items = getCatalog(slug).filter(i => i.featured && i.status === 'active');
            if (items.length > 0) featured[slug] = items;
        });
        return featured;
    }

    function getAllCatalogCounts() {
        const counts = {};
        Object.keys(CATALOG_CATEGORIES).forEach(slug => {
            counts[slug] = getCatalog(slug).length;
        });
        return counts;
    }

    // ── Page CRUD ──
    function getPages() {
        return get(KEYS.PAGES) || [];
    }

    function getPage(id) {
        return getPages().find(p => p.id === id) || null;
    }

    function getPageBySlug(slug) {
        return getPages().find(p => p.slug === slug) || null;
    }

    function addPage(page) {
        const pages = getPages();
        const newPage = {
            id: generateId('page'),
            slug: page.slug || '',
            title: page.title || { en: '', tr: '', fr: '', ar: '' },
            metaDescription: page.metaDescription || { en: '', tr: '', fr: '', ar: '' },
            status: page.status || 'draft',
            blocks: page.blocks || [],
            createdAt: now(),
            updatedAt: now()
        };
        pages.push(newPage);
        set(KEYS.PAGES, pages);
        auditLog('page_create', `Created page "${newPage.slug}"`);
        return newPage;
    }

    function updatePage(id, updates) {
        const pages = getPages();
        const idx = pages.findIndex(p => p.id === id);
        if (idx === -1) return null;
        pages[idx] = { ...pages[idx], ...updates, updatedAt: now() };
        set(KEYS.PAGES, pages);
        auditLog('page_update', `Updated page "${pages[idx].slug}"`);
        return pages[idx];
    }

    function deletePage(id) {
        const pages = getPages();
        const page = pages.find(p => p.id === id);
        set(KEYS.PAGES, pages.filter(p => p.id !== id));
        if (page) auditLog('page_delete', `Deleted page "${page.slug}"`);
    }

    // ── Media CRUD ──
    function getMedia() {
        return get(KEYS.MEDIA) || [];
    }

    function addMedia(item) {
        const media = getMedia();
        const newItem = {
            id: generateId('media'),
            url: item.url || '',
            label: item.label || '',
            usedIn: item.usedIn || [],
            addedAt: now()
        };
        media.unshift(newItem);
        set(KEYS.MEDIA, media);
        auditLog('media_add', `Added media: "${newItem.label}"`);
        return newItem;
    }

    function updateMedia(mediaId, updates) {
        const media = getMedia();
        const idx = media.findIndex(m => m.id === mediaId);
        if (idx === -1) return null;
        media[idx] = { ...media[idx], ...updates };
        set(KEYS.MEDIA, media);
        return media[idx];
    }

    function deleteMedia(mediaId) {
        const media = getMedia();
        const item = media.find(m => m.id === mediaId);
        set(KEYS.MEDIA, media.filter(m => m.id !== mediaId));
        if (item) auditLog('media_delete', `Deleted media: "${item.label}"`);
    }

    // ── Inquiries CRUD ──
    function getInquiries() { return get(KEYS.INQUIRIES) || []; }
    function addInquiry(data) {
        const inquiries = getInquiries();
        const inquiry = { id: generateId('inq'), name: data.name || '', email: data.email || '', company: data.company || '', subject: data.subject || '', message: data.message || '', status: 'new', notes: '', createdAt: now() };
        inquiries.unshift(inquiry);
        set(KEYS.INQUIRIES, inquiries);
        return inquiry;
    }
    function updateInquiry(id, updates) {
        const inquiries = getInquiries();
        const idx = inquiries.findIndex(i => i.id === id);
        if (idx === -1) return null;
        inquiries[idx] = { ...inquiries[idx], ...updates };
        set(KEYS.INQUIRIES, inquiries);
        if (updates.status) auditLog('inquiry_status', `Inquiry from "${inquiries[idx].name}" marked as ${updates.status}`);
        return inquiries[idx];
    }
    function deleteInquiry(id) {
        const inquiries = getInquiries();
        set(KEYS.INQUIRIES, inquiries.filter(i => i.id !== id));
        auditLog('inquiry_delete', 'Deleted an inquiry');
    }

    // ── RFQ CRUD ──
    function getRFQs() { return get(KEYS.RFQ) || []; }
    function addRFQ(data) {
        const rfqs = getRFQs();
        const rfq = { id: generateId('rfq'), company: data.company || '', contact: data.contact || '', email: data.email || '', category: data.category || '', description: data.description || '', estimatedValue: data.estimatedValue || '', priority: data.priority || 'medium', status: data.status || 'received', notes: data.notes || '', linkedInquiryId: data.linkedInquiryId || null, createdAt: now(), updatedAt: now() };
        rfqs.unshift(rfq);
        set(KEYS.RFQ, rfqs);
        auditLog('rfq_create', `Created RFQ for "${rfq.company}"`);
        return rfq;
    }
    function updateRFQ(id, updates) {
        const rfqs = getRFQs();
        const idx = rfqs.findIndex(r => r.id === id);
        if (idx === -1) return null;
        rfqs[idx] = { ...rfqs[idx], ...updates, updatedAt: now() };
        set(KEYS.RFQ, rfqs);
        if (updates.status) auditLog('rfq_status', `RFQ "${rfqs[idx].company}" moved to ${updates.status}`);
        return rfqs[idx];
    }
    function deleteRFQ(id) {
        const rfqs = getRFQs();
        set(KEYS.RFQ, rfqs.filter(r => r.id !== id));
        auditLog('rfq_delete', 'Deleted an RFQ');
    }

    // ── Audit Log ──
    function auditLog(action, description) {
        const log = get(KEYS.AUDIT_LOG) || [];
        log.unshift({ id: generateId('log'), action, description, timestamp: now() });
        if (log.length > AUDIT_MAX) log.length = AUDIT_MAX;
        set(KEYS.AUDIT_LOG, log);
    }
    function getAuditLog() { return get(KEYS.AUDIT_LOG) || []; }
    function clearAuditLog() { set(KEYS.AUDIT_LOG, []); }

    // ── Settings ──
    function getSEO() { return getContent(KEYS.SETTINGS_SEO); }
    function setSEO(data) { setContent(KEYS.SETTINGS_SEO, data); }
    function getBranding() { return getContent(KEYS.SETTINGS_BRANDING); }
    function setBranding(data) { setContent(KEYS.SETTINGS_BRANDING, data); }
    function getAISettings() { return get(KEYS.SETTINGS_AI) || DEFAULTS[KEYS.SETTINGS_AI]; }
    function setAISettings(data) { set(KEYS.SETTINGS_AI, data); auditLog('settings_update', 'Updated AI settings'); }

    // ── Data Import/Export ──
    function exportAll() {
        const data = {};
        Object.values(KEYS).forEach(key => {
            const val = get(key);
            if (val !== null) data[key] = val;
        });
        auditLog('data_export', 'Exported all data');
        return data;
    }

    function importAll(data) {
        if (!data || typeof data !== 'object') return false;
        Object.keys(data).forEach(key => {
            if (Object.values(KEYS).includes(key)) {
                set(key, data[key]);
            }
        });
        auditLog('data_import', 'Imported data from file');
        return true;
    }

    function clearAll() {
        Object.values(KEYS).forEach(key => {
            if (key !== KEYS.AUTH) remove(key);
        });
        auditLog('data_clear', 'Cleared all data');
    }

    function getStorageUsage() {
        let total = 0;
        Object.values(KEYS).forEach(key => {
            const val = localStorage.getItem(key);
            if (val) total += val.length * 2;
        });
        return total;
    }

    // ── Public API ──
    return {
        KEYS, DEFAULTS, CATALOG_CATEGORIES, AVAILABLE_LANGS,
        generateId, now, get, set, remove,
        getContent, setContent, resetContent, getDefault,
        getContentForLang, setContentForLang,
        getCatalog, setCatalog,
        addCatalogItem, updateCatalogItem, deleteCatalogItem, duplicateCatalogItem,
        getFeaturedItems, getAllCatalogCounts,
        getPages, getPage, getPageBySlug, addPage, updatePage, deletePage,
        getMedia, addMedia, updateMedia, deleteMedia,
        getInquiries, addInquiry, updateInquiry, deleteInquiry,
        getRFQs, addRFQ, updateRFQ, deleteRFQ,
        auditLog, getAuditLog, clearAuditLog,
        getSEO, setSEO, getBranding, setBranding,
        getAISettings, setAISettings,
        exportAll, importAll, clearAll, getStorageUsage
    };
})();
