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
            'hero.title': 'OMERTA<br>DEFENCE',
            'hero.subtitle': 'Advanced defence solutions engineered for superiority.<br>From tactical systems to cyber warfare — we define the future of security.',
            'hero.btn1': 'Explore Capabilities',
            'hero.btn2': 'Contact Us',
            // About
            'about.label': 'WHO WE ARE',
            'about.title': 'Defining the Standard in Defence Innovation',
            'about.desc1': 'OMERTA DEFENCE stands at the forefront of global security solutions. With decades of expertise in advanced weaponry, unmanned systems, and cyber operations, we deliver uncompromising capability to defence forces and sovereign nations worldwide.',
            'about.desc2': 'Our commitment to discretion is matched only by our dedication to precision. Every solution we engineer reflects our core philosophy: silent strength, absolute reliability, and technological dominance on every front.',
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
            'cyber.desc': 'In an era where digital threats are as critical as physical ones, OMERTA DEFENCE\'s Cyber Security Division provides sovereign-level protection for national infrastructure, military networks, and classified communications.',
            'cyber.feat1.title': 'Threat Intelligence',
            'cyber.feat1.text': 'Real-time monitoring and predictive analysis of global cyber threat landscapes.',
            'cyber.feat2.title': 'Network Defence',
            'cyber.feat2.text': 'Multi-layered intrusion prevention and zero-trust architecture implementation.',
            'cyber.feat3.title': 'Incident Response',
            'cyber.feat3.text': 'Rapid deployment cyber teams for breach containment and forensic analysis.',
            'cyber.feat4.title': 'Secure Communications',
            'cyber.feat4.text': 'End-to-end encrypted communication systems for classified operations.',
            'cyber.cta': 'Secure Your Infrastructure',
            // Contact
            'contact.label': 'GET IN TOUCH',
            'contact.title': 'Contact Us',
            'contact.heading': "Let's Discuss Your Requirements",
            'contact.desc': 'Our team of defence specialists is ready to provide tailored solutions for your operational needs. All inquiries are handled with the highest level of confidentiality.',
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
            'footer.tagline': 'Silent Strength. Absolute Reliability.',
            'footer.text': 'Advanced defence solutions for sovereign nations and security forces worldwide.',
            'footer.copyright': '&copy; 2026 OMERTA DEFENCE. All rights reserved.',
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
            'hero.title': 'OMERTA<br>SAVUNMA',
            'hero.subtitle': 'Üstünlük için tasarlanmış gelişmiş savunma çözümleri.<br>Taktik sistemlerden siber savaşa — güvenliğin geleceğini biz belirliyoruz.',
            'hero.btn1': 'Yetenekleri Keşfedin',
            'hero.btn2': 'Bize Ulaşın',
            'about.label': 'BİZ KİMİZ',
            'about.title': 'Savunma İnovasyonunda Standardı Belirliyoruz',
            'about.desc1': 'OMERTA SAVUNMA, küresel güvenlik çözümlerinin ön saflarında yer almaktadır. Gelişmiş silah sistemleri, insansız sistemler ve siber operasyonlarda onlarca yıllık uzmanlığımızla, dünya genelinde savunma kuvvetlerine ve egemen devletlere taviz vermez yetenekler sunuyoruz.',
            'about.desc2': 'Gizliliğe olan bağlılığımız, ancak hassasiyete olan adanmışlığımızla eşleşir. Geliştirdiğimiz her çözüm, temel felsefemizi yansıtır: sessiz güç, mutlak güvenilirlik ve her cephede teknolojik üstünlük.',
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
            'cyber.desc': 'Dijital tehditlerin fiziksel tehditler kadar kritik olduğu bir çağda, OMERTA SAVUNMA\'nın Siber Güvenlik Birimi, ulusal altyapı, askeri ağlar ve gizli iletişimler için egemenlik düzeyinde koruma sağlar.',
            'cyber.feat1.title': 'Tehdit İstihbaratı',
            'cyber.feat1.text': 'Küresel siber tehdit ortamlarının gerçek zamanlı izlenmesi ve tahmine dayalı analizi.',
            'cyber.feat2.title': 'Ağ Savunması',
            'cyber.feat2.text': 'Çok katmanlı sızma önleme ve sıfır güven mimarisi uygulaması.',
            'cyber.feat3.title': 'Olay Müdahalesi',
            'cyber.feat3.text': 'İhlal kontrol altına alma ve adli analiz için hızlı dağıtım siber ekipleri.',
            'cyber.feat4.title': 'Güvenli İletişim',
            'cyber.feat4.text': 'Gizli operasyonlar için uçtan uca şifreli iletişim sistemleri.',
            'cyber.cta': 'Altyapınızı Güvenli Kılın',
            'contact.label': 'İLETİŞİM',
            'contact.title': 'Bize Ulaşın',
            'contact.heading': 'Gereksinimlerinizi Konuşalım',
            'contact.desc': 'Savunma uzmanlarından oluşan ekibimiz, operasyonel ihtiyaçlarınız için özelleştirilmiş çözümler sunmaya hazırdır. Tüm sorular en üst düzey gizlilikle ele alınır.',
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
            'footer.tagline': 'Sessiz Güç. Mutlak Güvenilirlik.',
            'footer.text': 'Dünya genelinde egemen devletler ve güvenlik kuvvetleri için gelişmiş savunma çözümleri.',
            'footer.copyright': '&copy; 2026 OMERTA SAVUNMA. Tüm hakları saklıdır.',
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
            'hero.title': 'OMERTA<br>DÉFENSE',
            'hero.subtitle': 'Solutions de défense avancées conçues pour la supériorité.<br>Des systèmes tactiques à la cyberguerre — nous définissons l\'avenir de la sécurité.',
            'hero.btn1': 'Explorer les Capacités',
            'hero.btn2': 'Contactez-nous',
            'about.label': 'QUI SOMMES-NOUS',
            'about.title': "Définir la Norme en Innovation de Défense",
            'about.desc1': "OMERTA DÉFENSE se situe à l'avant-garde des solutions de sécurité mondiales. Avec des décennies d'expertise en armement avancé, systèmes sans pilote et opérations cyber, nous offrons des capacités sans compromis aux forces de défense et aux nations souveraines du monde entier.",
            'about.desc2': "Notre engagement envers la discrétion n'a d'égal que notre dévouement à la précision. Chaque solution que nous développons reflète notre philosophie fondamentale : force silencieuse, fiabilité absolue et domination technologique sur tous les fronts.",
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
            'cyber.desc': "À une époque où les menaces numériques sont aussi critiques que les menaces physiques, la Division Cybersécurité d'OMERTA DÉFENSE fournit une protection de niveau souverain pour les infrastructures nationales, les réseaux militaires et les communications classifiées.",
            'cyber.feat1.title': 'Renseignement sur les Menaces',
            'cyber.feat1.text': "Surveillance en temps réel et analyse prédictive des paysages mondiaux de cybermenaces.",
            'cyber.feat2.title': 'Défense Réseau',
            'cyber.feat2.text': "Prévention d'intrusion multicouche et implémentation d'architecture zero-trust.",
            'cyber.feat3.title': "Réponse aux Incidents",
            'cyber.feat3.text': "Équipes cyber de déploiement rapide pour le confinement des brèches et l'analyse forensique.",
            'cyber.feat4.title': 'Communications Sécurisées',
            'cyber.feat4.text': "Systèmes de communication chiffrés de bout en bout pour les opérations classifiées.",
            'cyber.cta': 'Sécurisez Votre Infrastructure',
            'contact.label': 'CONTACTEZ-NOUS',
            'contact.title': 'Nous Contacter',
            'contact.heading': 'Discutons de Vos Besoins',
            'contact.desc': "Notre équipe de spécialistes de la défense est prête à fournir des solutions sur mesure pour vos besoins opérationnels. Toutes les demandes sont traitées avec le plus haut niveau de confidentialité.",
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
            'footer.tagline': 'Force Silencieuse. Fiabilité Absolue.',
            'footer.text': 'Solutions de défense avancées pour les nations souveraines et les forces de sécurité du monde entier.',
            'footer.copyright': '&copy; 2026 OMERTA DÉFENSE. Tous droits réservés.',
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
            'hero.title': 'أومرتا<br>للدفاع',
            'hero.subtitle': 'حلول دفاعية متقدمة مصممة للتفوق.<br>من الأنظمة التكتيكية إلى الحرب السيبرانية — نحن نحدد مستقبل الأمن.',
            'hero.btn1': 'استكشف القدرات',
            'hero.btn2': 'اتصل بنا',
            'about.label': 'من نحن',
            'about.title': 'تحديد المعيار في ابتكار الدفاع',
            'about.desc1': 'تقف أومرتا للدفاع في طليعة حلول الأمن العالمية. بعقود من الخبرة في الأسلحة المتقدمة والأنظمة غير المأهولة والعمليات السيبرانية، نقدم قدرات لا تقبل المساومة لقوات الدفاع والدول ذات السيادة في جميع أنحاء العالم.',
            'about.desc2': 'التزامنا بالسرية لا يضاهيه سوى تفانينا في الدقة. كل حل نصممه يعكس فلسفتنا الأساسية: القوة الصامتة، الموثوقية المطلقة، والهيمنة التكنولوجية على كل جبهة.',
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
            'cyber.desc': 'في عصر أصبحت فيه التهديدات الرقمية بنفس أهمية التهديدات المادية، يوفر قسم الأمن السيبراني في أومرتا للدفاع حماية على مستوى السيادة للبنية التحتية الوطنية والشبكات العسكرية والاتصالات السرية.',
            'cyber.feat1.title': 'استخبارات التهديدات',
            'cyber.feat1.text': 'المراقبة في الوقت الفعلي والتحليل التنبؤي لمشهد التهديدات السيبرانية العالمية.',
            'cyber.feat2.title': 'الدفاع الشبكي',
            'cyber.feat2.text': 'منع التسلل متعدد الطبقات وتنفيذ بنية انعدام الثقة.',
            'cyber.feat3.title': 'الاستجابة للحوادث',
            'cyber.feat3.text': 'فرق سيبرانية سريعة الانتشار لاحتواء الاختراقات والتحليل الجنائي.',
            'cyber.feat4.title': 'الاتصالات الآمنة',
            'cyber.feat4.text': 'أنظمة اتصال مشفرة من طرف إلى طرف للعمليات السرية.',
            'cyber.cta': 'أمّن بنيتك التحتية',
            'contact.label': 'تواصل معنا',
            'contact.title': 'اتصل بنا',
            'contact.heading': 'لنناقش متطلباتكم',
            'contact.desc': 'فريقنا من المتخصصين في الدفاع مستعد لتقديم حلول مخصصة لاحتياجاتكم التشغيلية. يتم التعامل مع جميع الاستفسارات بأعلى مستوى من السرية.',
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
            'footer.tagline': 'القوة الصامتة. الموثوقية المطلقة.',
            'footer.text': 'حلول دفاعية متقدمة للدول ذات السيادة وقوات الأمن في جميع أنحاء العالم.',
            'footer.copyright': '&copy; 2026 أومرتا للدفاع. جميع الحقوق محفوظة.',
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

        // Update all elements with data-i18n (textContent)
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

        // Update all elements with data-i18n-html (innerHTML, for content with <br>, &copy; etc.)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            const translated = t(key);
            el.innerHTML = translated;
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
