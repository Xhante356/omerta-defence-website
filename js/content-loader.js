/* ===================================================
   OMERTA DEFENCE — Content Loader
   Reads localStorage (od_*) and patches DOM on main site.
   v2: Multi-language support, resolveContent for v1/v2 formats
   =================================================== */

(function () {
    'use strict';

    // ── Security Helpers ──
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    // Allow <br> and &copy; through, escape everything else
    function sanitizeHTML(str) {
        if (!str) return '';
        var safe = escapeHTML(str);
        safe = safe.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
        safe = safe.replace(/&amp;copy;/gi, '&copy;');
        return safe;
    }

    function sanitizeBackgroundUrl(url) {
        if (!url) return '';
        var clean = String(url).replace(/['"()]/g, '');
        if (/^(https?:\/\/|data:image\/)/.test(clean)) {
            return clean;
        }
        return '';
    }

    // ── Site Defaults (mirrors admin-store DEFAULTS for standalone use) ──
    const SITE_DEFAULTS = {
        od_content_hero: {
            _v: 2,
            _shared: {
                backgroundImage: 'https://images.unsplash.com/photo-1534642960519-11ad79bc19df?w=1920&q=80',
                btn1Link: '#products',
                btn2Link: '#contact'
            },
            en: {
                preheading: 'PRECISION. POWER. PROTECTION.',
                title: 'OMERTA<br>DEFENCE',
                subtitle: 'Advanced defence solutions engineered for superiority.<br>From tactical systems to cyber warfare \u2014 we define the future of security.',
                btn1Text: 'Explore Capabilities',
                btn2Text: 'Contact Us'
            },
            tr: {
                preheading: 'HASSASIYET. G\u00DC\u00C7. KORUMA.',
                title: 'OMERTA<br>SAVUNMA',
                subtitle: '\u00DCst\u00FCnl\u00FCk i\u00E7in tasarlanm\u0131\u015F geli\u015Fmi\u015F savunma \u00E7\u00F6z\u00FCmleri.<br>Taktik sistemlerden siber sava\u015Fa \u2014 g\u00FCvenli\u011Fin gelece\u011Fini biz belirliyoruz.',
                btn1Text: 'Yetenekleri Ke\u015Ffedin',
                btn2Text: 'Bize Ula\u015F\u0131n'
            },
            fr: {
                preheading: 'PR\u00C9CISION. PUISSANCE. PROTECTION.',
                title: 'OMERTA<br>D\u00C9FENCE',
                subtitle: "Solutions de d\u00E9fense avanc\u00E9es con\u00E7ues pour la sup\u00E9riorit\u00E9.<br>Des syst\u00E8mes tactiques \u00E0 la cyberguerre \u2014 nous d\u00E9finissons l'avenir de la s\u00E9curit\u00E9.",
                btn1Text: 'Explorer les Capacit\u00E9s',
                btn2Text: 'Contactez-nous'
            },
            ar: {
                preheading: '\u0627\u0644\u062F\u0642\u0629. \u0627\u0644\u0642\u0648\u0629. \u0627\u0644\u062D\u0645\u0627\u064A\u0629.',
                title: '\u0623\u0648\u0645\u0631\u062A\u0627<br>\u0644\u0644\u062F\u0641\u0627\u0639',
                subtitle: '\u062D\u0644\u0648\u0644 \u062F\u0641\u0627\u0639\u064A\u0629 \u0645\u062A\u0642\u062F\u0645\u0629 \u0645\u0635\u0645\u0645\u0629 \u0644\u0644\u062A\u0641\u0648\u0642.<br>\u0645\u0646 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u062A\u0643\u062A\u064A\u0643\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u062D\u0631\u0628 \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A\u0629 \u2014 \u0646\u062D\u0646 \u0646\u062D\u062F\u062F \u0645\u0633\u062A\u0642\u0628\u0644 \u0627\u0644\u0623\u0645\u0646.',
                btn1Text: '\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u0642\u062F\u0631\u0627\u062A',
                btn2Text: '\u0627\u062A\u0635\u0644 \u0628\u0646\u0627'
            }
        },
        od_content_about: {
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
                sectionLabel: 'B\u0130Z K\u0130M\u0130Z',
                title: 'Savunma \u0130novasyonunda<br>Standard\u0131 Belirliyoruz',
                paragraph1: 'OMERTA SAVUNMA, k\u00FCresel g\u00FCvenlik \u00E7\u00F6z\u00FCmlerinin \u00F6n saflar\u0131nda yer almaktad\u0131r. Geli\u015Fmi\u015F silah, insans\u0131z sistemler ve siber operasyonlardaki onlarca y\u0131ll\u0131k uzmanl\u0131\u011F\u0131m\u0131zla, d\u00FCnya genelindeki savunma kuvvetlerine ve egemen devletlere taviz vermeyen yetenek sunuyoruz.',
                paragraph2: 'Gizlili\u011Fe olan ba\u011Fl\u0131l\u0131\u011F\u0131m\u0131z, yaln\u0131zca hassasiyete olan adanm\u0131\u015Fl\u0131\u011F\u0131m\u0131zla e\u015Fle\u015Fir. Tasarlad\u0131\u011F\u0131m\u0131z her \u00E7\u00F6z\u00FCm, temel felsefemizi yans\u0131t\u0131r: sessiz g\u00FC\u00E7, mutlak g\u00FCvenilirlik ve her cephede teknolojik \u00FCst\u00FCnl\u00FCk.',
                stats: [
                    { label: 'Y\u0131ll\u0131k Deneyim' },
                    { label: '\u00DClkeye Hizmet' },
                    { label: '\u00C7\u00F6z\u00FCm Sunuldu' }
                ]
            },
            fr: {
                sectionLabel: 'QUI SOMMES-NOUS',
                title: "D\u00E9finir la Norme<br>en Innovation de D\u00E9fense",
                paragraph1: "OMERTA D\u00C9FENCE se situe \u00E0 l'avant-garde des solutions de s\u00E9curit\u00E9 mondiales. Avec des d\u00E9cennies d'expertise en armement avanc\u00E9, syst\u00E8mes autonomes et op\u00E9rations cyber, nous offrons des capacit\u00E9s sans compromis aux forces de d\u00E9fense et nations souveraines du monde entier.",
                paragraph2: "Notre engagement envers la discr\u00E9tion n'a d'\u00E9gal que notre d\u00E9dication \u00E0 la pr\u00E9cision. Chaque solution que nous concevons refl\u00E8te notre philosophie fondamentale : force silencieuse, fiabilit\u00E9 absolue et dominance technologique sur tous les fronts.",
                stats: [
                    { label: "Ans d'Exp\u00E9rience" },
                    { label: 'Pays Desservis' },
                    { label: 'Solutions D\u00E9ploy\u00E9es' }
                ]
            },
            ar: {
                sectionLabel: '\u0645\u0646 \u0646\u062D\u0646',
                title: '\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0639\u064A\u0627\u0631<br>\u0641\u064A \u0627\u0628\u062A\u0643\u0627\u0631 \u0627\u0644\u062F\u0641\u0627\u0639',
                paragraph1: '\u062A\u0642\u0641 \u0623\u0648\u0645\u0631\u062A\u0627 \u0644\u0644\u062F\u0641\u0627\u0639 \u0641\u064A \u0637\u0644\u064A\u0639\u0629 \u062D\u0644\u0648\u0644 \u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629. \u0645\u0639 \u0639\u0642\u0648\u062F \u0645\u0646 \u0627\u0644\u062E\u0628\u0631\u0629 \u0641\u064A \u0627\u0644\u0623\u0633\u0644\u062D\u0629 \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629 \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u063A\u064A\u0631 \u0627\u0644\u0645\u0623\u0647\u0648\u0644\u0629 \u0648\u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A\u0629\u060C \u0646\u0642\u062F\u0645 \u0642\u062F\u0631\u0627\u062A \u0644\u0627 \u0647\u0648\u0627\u062F\u0629 \u0641\u064A\u0647\u0627 \u0644\u0642\u0648\u0627\u062A \u0627\u0644\u062F\u0641\u0627\u0639 \u0648\u0627\u0644\u062F\u0648\u0644 \u0630\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u062F\u0629 \u0641\u064A \u062C\u0645\u064A\u0639 \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0639\u0627\u0644\u0645.',
                paragraph2: '\u0627\u0644\u062A\u0632\u0627\u0645\u0646\u0627 \u0628\u0627\u0644\u0633\u0631\u064A\u0629 \u0644\u0627 \u064A\u0636\u0627\u0647\u064A\u0647 \u0633\u0648\u0649 \u062A\u0641\u0627\u0646\u064A\u0646\u0627 \u0641\u064A \u0627\u0644\u062F\u0642\u0629. \u0643\u0644 \u062D\u0644 \u0646\u0635\u0645\u0645\u0647 \u064A\u0639\u0643\u0633 \u0641\u0644\u0633\u0641\u062A\u0646\u0627 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629: \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0635\u0627\u0645\u062A\u0629\u060C \u0648\u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0642\u0629\u060C \u0648\u0627\u0644\u0647\u064A\u0645\u0646\u0629 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0629 \u0639\u0644\u0649 \u0643\u0644 \u062C\u0628\u0647\u0629.',
                stats: [
                    { label: '\u0633\u0646\u0648\u0627\u062A \u062E\u0628\u0631\u0629' },
                    { label: '\u062F\u0648\u0644\u0629 \u062A\u0645 \u062E\u062F\u0645\u062A\u0647\u0627' },
                    { label: '\u062D\u0644\u0648\u0644 \u062A\u0645 \u0646\u0634\u0631\u0647\u0627' }
                ]
            }
        },
        od_content_products: {
            _v: 2, _shared: {},
            en: { sectionLabel: 'WHAT WE DELIVER', title: 'Our Capabilities', subtitle: 'Comprehensive defence solutions across five critical domains' },
            tr: { sectionLabel: 'SUNDUKLARIMIZ', title: 'Yeteneklerimiz', subtitle: 'Be\u015F kritik alanda kapsaml\u0131 savunma \u00E7\u00F6z\u00FCmleri' },
            fr: { sectionLabel: 'CE QUE NOUS OFFRONS', title: 'Nos Capacit\u00E9s', subtitle: 'Solutions de d\u00E9fense compl\u00E8tes dans cinq domaines critiques' },
            ar: { sectionLabel: '\u0645\u0627 \u0646\u0642\u062F\u0645\u0647', title: '\u0642\u062F\u0631\u0627\u062A\u0646\u0627', subtitle: '\u062D\u0644\u0648\u0644 \u062F\u0641\u0627\u0639\u064A\u0629 \u0634\u0627\u0645\u0644\u0629 \u0639\u0628\u0631 \u062E\u0645\u0633\u0629 \u0645\u062C\u0627\u0644\u0627\u062A \u062D\u064A\u0648\u064A\u0629' }
        },
        od_content_cyber: {
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
                sectionLabel: 'D\u0130J\u0130TAL SAVA\u015E',
                title: 'Siber G\u00FCvenlik Birimi',
                description: 'Dijital tehditlerin fiziksel tehditler kadar kritik oldu\u011Fu bir \u00E7a\u011Fda, OMERTA SAVUNMA Siber G\u00FCvenlik Birimi ulusal altyap\u0131, askeri a\u011Flar ve gizli ileti\u015Fimler i\u00E7in egemenlik d\u00FCzeyinde koruma sa\u011Flar.',
                ctaText: 'Altyap\u0131n\u0131z\u0131 G\u00FCvenli K\u0131l\u0131n',
                features: [
                    { title: 'Tehdit \u0130stihbarat\u0131', text: 'K\u00FCresel siber tehdit ortamlar\u0131n\u0131n ger\u00E7ek zamanl\u0131 izlenmesi ve tahmini analizi.' },
                    { title: 'A\u011F Savunmas\u0131', text: '\u00C7ok katmanl\u0131 izinsiz giri\u015F \u00F6nleme ve s\u0131f\u0131r g\u00FCven mimarisi uygulamas\u0131.' },
                    { title: 'Olay M\u00FCdahale', text: '\u0130hlal muhafazas\u0131 ve adli analiz i\u00E7in h\u0131zl\u0131 da\u011F\u0131t\u0131m siber ekipleri.' },
                    { title: 'G\u00FCvenli \u0130leti\u015Fim', text: 'Gizli operasyonlar i\u00E7in u\u00E7tan uca \u015Fifrelenmi\u015F ileti\u015Fim sistemleri.' }
                ]
            },
            fr: {
                sectionLabel: 'GUERRE NUM\u00C9RIQUE',
                title: 'Division Cybers\u00E9curit\u00E9',
                description: "\u00C0 une \u00E9poque o\u00F9 les menaces num\u00E9riques sont aussi critiques que les menaces physiques, la Division Cybers\u00E9curit\u00E9 d'OMERTA D\u00C9FENCE offre une protection de niveau souverain pour les infrastructures nationales, les r\u00E9seaux militaires et les communications classifi\u00E9es.",
                ctaText: 'S\u00E9curisez Votre Infrastructure',
                features: [
                    { title: 'Renseignement sur les Menaces', text: 'Surveillance en temps r\u00E9el et analyse pr\u00E9dictive des paysages de cybermenaces mondiales.' },
                    { title: 'D\u00E9fense R\u00E9seau', text: "Pr\u00E9vention d'intrusion multicouche et impl\u00E9mentation d'architecture z\u00E9ro confiance." },
                    { title: 'R\u00E9ponse aux Incidents', text: "\u00C9quipes cyber de d\u00E9ploiement rapide pour le confinement des violations et l'analyse forensique." },
                    { title: 'Communications S\u00E9curis\u00E9es', text: 'Syst\u00E8mes de communication chiffr\u00E9s de bout en bout pour les op\u00E9rations classifi\u00E9es.' }
                ]
            },
            ar: {
                sectionLabel: '\u0627\u0644\u062D\u0631\u0628 \u0627\u0644\u0631\u0642\u0645\u064A\u0629',
                title: '\u0642\u0633\u0645 \u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A',
                description: '\u0641\u064A \u0639\u0635\u0631 \u062A\u0639\u062A\u0628\u0631 \u0641\u064A\u0647 \u0627\u0644\u062A\u0647\u062F\u064A\u062F\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0628\u0646\u0641\u0633 \u0623\u0647\u0645\u064A\u0629 \u0627\u0644\u062A\u0647\u062F\u064A\u062F\u0627\u062A \u0627\u0644\u0645\u0627\u062F\u064A\u0629\u060C \u064A\u0648\u0641\u0631 \u0642\u0633\u0645 \u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A \u0641\u064A \u0623\u0648\u0645\u0631\u062A\u0627 \u0644\u0644\u062F\u0641\u0627\u0639 \u062D\u0645\u0627\u064A\u0629 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0633\u064A\u0627\u062F\u0629 \u0644\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629 \u0648\u0627\u0644\u0634\u0628\u0643\u0627\u062A \u0627\u0644\u0639\u0633\u0643\u0631\u064A\u0629 \u0648\u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u0633\u0631\u064A\u0629.',
                ctaText: '\u0623\u0645\u0651\u0646 \u0628\u0646\u064A\u062A\u0643 \u0627\u0644\u062A\u062D\u062A\u064A\u0629',
                features: [
                    { title: '\u0627\u0633\u062A\u062E\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0647\u062F\u064A\u062F\u0627\u062A', text: '\u0645\u0631\u0627\u0642\u0628\u0629 \u0641\u0648\u0631\u064A\u0629 \u0648\u062A\u062D\u0644\u064A\u0644 \u062A\u0646\u0628\u0624\u064A \u0644\u0645\u0634\u0647\u062F \u0627\u0644\u062A\u0647\u062F\u064A\u062F\u0627\u062A \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629.' },
                    { title: '\u0627\u0644\u062F\u0641\u0627\u0639 \u0639\u0646 \u0627\u0644\u0634\u0628\u0643\u0627\u062A', text: '\u0645\u0646\u0639 \u0627\u0644\u062A\u0633\u0644\u0644 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0637\u0628\u0642\u0627\u062A \u0648\u062A\u0637\u0628\u064A\u0642 \u0628\u0646\u064A\u0629 \u0627\u0646\u0639\u062F\u0627\u0645 \u0627\u0644\u062B\u0642\u0629.' },
                    { title: '\u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0644\u0644\u062D\u0648\u0627\u062F\u062B', text: '\u0641\u0631\u0642 \u0633\u064A\u0628\u0631\u0627\u0646\u064A\u0629 \u0633\u0631\u064A\u0639\u0629 \u0627\u0644\u0627\u0646\u062A\u0634\u0627\u0631 \u0644\u0627\u062D\u062A\u0648\u0627\u0621 \u0627\u0644\u0627\u062E\u062A\u0631\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u062C\u0646\u0627\u0626\u064A.' },
                    { title: '\u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u0622\u0645\u0646\u0629', text: '\u0623\u0646\u0638\u0645\u0629 \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0645\u0634\u0641\u0631\u0629 \u0645\u0646 \u0637\u0631\u0641 \u0625\u0644\u0649 \u0637\u0631\u0641 \u0644\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0633\u0631\u064A\u0629.' }
                ]
            }
        },
        od_content_contact: {
            _v: 2,
            _shared: { headquarters: 'Ankara, Turkey', email: 'info@omertadefence.com', phone: '+90 (312) 000 0000', hours: 'Mon - Fri: 09:00 - 18:00' },
            en: { heading: "Let's Discuss Your Requirements", description: 'Our team of defence specialists is ready to provide tailored solutions for your operational needs. All inquiries are handled with the highest level of confidentiality.' },
            tr: { heading: 'Gereksinimlerinizi Konu\u015Fal\u0131m', description: 'Savunma uzmanlar\u0131 ekibimiz, operasyonel ihtiya\u00E7lar\u0131n\u0131z i\u00E7in \u00F6zelle\u015Fmi\u015F \u00E7\u00F6z\u00FCmler sunmaya haz\u0131rd\u0131r. T\u00FCm sorular en \u00FCst d\u00FCzeyde gizlilikle i\u015Flenir.' },
            fr: { heading: 'Discutons de Vos Besoins', description: "Notre \u00E9quipe de sp\u00E9cialistes de la d\u00E9fense est pr\u00EAte \u00E0 fournir des solutions sur mesure pour vos besoins op\u00E9rationnels. Toutes les demandes sont trait\u00E9es avec le plus haut niveau de confidentialit\u00E9." },
            ar: { heading: '\u0644\u0646\u0646\u0627\u0642\u0634 \u0645\u062A\u0637\u0644\u0628\u0627\u062A\u0643\u0645', description: '\u0641\u0631\u064A\u0642\u0646\u0627 \u0645\u0646 \u0645\u062A\u062E\u0635\u0635\u064A \u0627\u0644\u062F\u0641\u0627\u0639 \u062C\u0627\u0647\u0632 \u0644\u062A\u0642\u062F\u064A\u0645 \u062D\u0644\u0648\u0644 \u0645\u062E\u0635\u0635\u0629 \u0644\u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A\u0643\u0645 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629. \u064A\u062A\u0645 \u0627\u0644\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u062C\u0645\u064A\u0639 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0628\u0623\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0645\u0646 \u0627\u0644\u0633\u0631\u064A\u0629.' }
        },
        od_content_footer: {
            _v: 2, _shared: {},
            en: { tagline: 'Silent Strength. Absolute Reliability.', text: 'Advanced defence solutions for sovereign nations and security forces worldwide.', copyright: '&copy; 2026 OMERTA DEFENCE. All rights reserved.' },
            tr: { tagline: 'Sessiz G\u00FC\u00E7. Mutlak G\u00FCvenilirlik.', text: 'D\u00FCnya genelindeki egemen devletler ve g\u00FCvenlik kuvvetleri i\u00E7in geli\u015Fmi\u015F savunma \u00E7\u00F6z\u00FCmleri.', copyright: '&copy; 2026 OMERTA SAVUNMA. T\u00FCm haklar\u0131 sakl\u0131d\u0131r.' },
            fr: { tagline: 'Force Silencieuse. Fiabilit\u00E9 Absolue.', text: 'Solutions de d\u00E9fense avanc\u00E9es pour les nations souveraines et les forces de s\u00E9curit\u00E9 du monde entier.', copyright: '&copy; 2026 OMERTA D\u00C9FENCE. Tous droits r\u00E9serv\u00E9s.' },
            ar: { tagline: '\u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0635\u0627\u0645\u062A\u0629. \u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0642\u0629.', text: '\u062D\u0644\u0648\u0644 \u062F\u0641\u0627\u0639\u064A\u0629 \u0645\u062A\u0642\u062F\u0645\u0629 \u0644\u0644\u062F\u0648\u0644 \u0630\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u062F\u0629 \u0648\u0642\u0648\u0627\u062A \u0627\u0644\u0623\u0645\u0646 \u0641\u064A \u062C\u0645\u064A\u0639 \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0639\u0627\u0644\u0645.', copyright: '&copy; 2026 \u0623\u0648\u0645\u0631\u062A\u0627 \u0644\u0644\u062F\u0641\u0627\u0639. \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.' }
        },
        od_settings_seo: {
            _v: 2, _shared: {},
            en: { pageTitle: 'OMERTA DEFENCE | Precision. Power. Protection.', metaDescription: 'OMERTA DEFENCE - Leading provider of advanced defence solutions including Small Arms, Heavy Ordnance, Launchers, Drones & UAVs, and Cyber Security.' },
            tr: { pageTitle: 'OMERTA SAVUNMA | Hassasiyet. G\u00FC\u00E7. Koruma.', metaDescription: 'OMERTA SAVUNMA - Hafif Silahlar, A\u011F\u0131r Silahlar, F\u0131rlat\u0131c\u0131lar, Dronlar ve Siber G\u00FCvenlik dahil geli\u015Fmi\u015F savunma \u00E7\u00F6z\u00FCmlerinin lider sa\u011Flay\u0131c\u0131s\u0131.' },
            fr: { pageTitle: 'OMERTA D\u00C9FENCE | Pr\u00E9cision. Puissance. Protection.', metaDescription: "OMERTA D\u00C9FENCE - Fournisseur leader de solutions de d\u00E9fense avanc\u00E9es incluant Armes L\u00E9g\u00E8res, Armement Lourd, Lanceurs, Drones et Cybers\u00E9curit\u00E9." },
            ar: { pageTitle: '\u0623\u0648\u0645\u0631\u062A\u0627 \u0644\u0644\u062F\u0641\u0627\u0639 | \u0627\u0644\u062F\u0642\u0629. \u0627\u0644\u0642\u0648\u0629. \u0627\u0644\u062D\u0645\u0627\u064A\u0629.', metaDescription: '\u0623\u0648\u0645\u0631\u062A\u0627 \u0644\u0644\u062F\u0641\u0627\u0639 - \u0627\u0644\u0645\u0632\u0648\u062F \u0627\u0644\u0631\u0627\u0626\u062F \u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u062F\u0641\u0627\u0639 \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629 \u0628\u0645\u0627 \u0641\u064A \u0630\u0644\u0643 \u0627\u0644\u0623\u0633\u0644\u062D\u0629 \u0627\u0644\u062E\u0641\u064A\u0641\u0629 \u0648\u0627\u0644\u0623\u0633\u0644\u062D\u0629 \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0648\u0627\u0644\u0642\u0627\u0630\u0641\u0627\u062A \u0648\u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u064A\u0631\u0629 \u0648\u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u0633\u064A\u0628\u0631\u0627\u0646\u064A.' }
        }
    };

    // ── Helpers ──
    function getLS(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    // Return localStorage data if present, otherwise fall back to SITE_DEFAULTS
    function getContent(key) {
        const stored = getLS(key);
        if (stored) return stored;
        return SITE_DEFAULTS[key] || null;
    }

    function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
    function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

    function getLang() {
        if (window.I18n) return I18n.getLang();
        try { return localStorage.getItem('od_site_lang') || 'en'; } catch { return 'en'; }
    }

    // Resolve a field that might be a string (v1) or lang object (v2)
    function resolveLangField(field, lang) {
        if (field === null || field === undefined) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && !Array.isArray(field)) {
            return field[lang] || field.en || '';
        }
        return String(field);
    }

    // Resolve v1/v2 content into flat object for current lang
    function resolveContent(key) {
        const data = getContent(key);
        if (!data) return null;

        // v2 format: merge _shared + lang data
        if (data._v === 2) {
            const lang = getLang();
            const shared = data._shared || {};
            const langData = data[lang] || data.en || {};
            return { ...shared, ...langData, _v: 2, _raw: data };
        }

        // v1 format: return as-is
        return data;
    }

    // SVG icon map (same as cyber section uses)
    const ICONS = {
        'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        'cpu': '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
        'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
        'crosshair': '<circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>',
        'radio': '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>'
    };

    function svgIcon(name) {
        const inner = ICONS[name] || ICONS['shield'];
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
    }

    // ── Patch Functions ──

    function patchHero() {
        const data = resolveContent('od_content_hero');
        if (!data) return;

        if (data.preheading) { const e = qs('.hero-preheading'); if (e) e.textContent = data.preheading; }
        if (data.title) { const e = qs('.hero-title'); if (e) e.innerHTML = sanitizeHTML(data.title); }
        if (data.subtitle) { const e = qs('.hero-subtitle'); if (e) e.innerHTML = sanitizeHTML(data.subtitle); }
        if (data.backgroundImage) { const e = qs('.hero-bg'); const url = sanitizeBackgroundUrl(data.backgroundImage); if (e && url) e.style.backgroundImage = "url('" + url + "')"; }

        const btns = qsa('.hero-buttons .btn');
        if (btns[0] && data.btn1Text) { btns[0].textContent = data.btn1Text; if (data.btn1Link) btns[0].href = data.btn1Link; }
        if (btns[1] && data.btn2Text) { btns[1].textContent = data.btn2Text; if (data.btn2Link) btns[1].href = data.btn2Link; }
    }

    function patchAbout() {
        const raw = getContent('od_content_about');
        if (!raw) return;
        const lang = getLang();

        const section = qs('#about');
        if (!section) return;

        let data;
        if (raw._v === 2) {
            const shared = raw._shared || {};
            const langData = raw[lang] || raw.en || {};
            data = { ...shared, ...langData };

            // Merge stats: shared stats have number/suffix, lang stats have label
            if (shared.stats && langData.stats) {
                data.stats = shared.stats.map((s, i) => ({
                    ...s,
                    ...(langData.stats[i] || {})
                }));
            }
        } else {
            data = raw;
        }

        if (data.sectionLabel) { const e = qs('.section-label', section); if (e) e.textContent = data.sectionLabel; }
        if (data.title) { const e = qs('.section-title', section); if (e) e.innerHTML = sanitizeHTML(data.title); }

        const descs = qsa('.about-description', section);
        if (descs[0] && data.paragraph1) descs[0].textContent = data.paragraph1;
        if (descs[1] && data.paragraph2) descs[1].textContent = data.paragraph2;

        if (data.imageUrl) {
            const img = qs('.about-image img', section);
            if (img) img.src = data.imageUrl;
        }

        if (data.stats && Array.isArray(data.stats)) {
            const stats = qsa('.stat', section);
            data.stats.forEach((s, i) => {
                if (stats[i]) {
                    const num = qs('.stat-number', stats[i]);
                    const suf = qs('.stat-suffix', stats[i]);
                    const lbl = qs('.stat-label', stats[i]);
                    if (num && s.number !== undefined) { num.setAttribute('data-target', s.number); num.textContent = '0'; }
                    if (suf && s.suffix !== undefined) suf.textContent = s.suffix;
                    if (lbl && s.label) lbl.textContent = s.label;
                }
            });
        }
    }

    function patchProducts() {
        const data = resolveContent('od_content_products');
        const section = qs('#products');
        if (!section) return;
        const lang = getLang();

        if (data) {
            if (data.sectionLabel) { const e = qs('.section-label', section); if (e) e.textContent = data.sectionLabel; }
            if (data.title) { const e = qs('.section-title', section); if (e) e.innerHTML = sanitizeHTML(data.title); }
            if (data.subtitle) { const e = qs('.section-subtitle', section); if (e) e.textContent = data.subtitle; }
        }

        // Rebuild product cards from featured catalog items
        const categories = ['small-arms', 'heavy-ordnance', 'launchers', 'drones', 'cyber'];
        let allFeatured = [];
        categories.forEach(cat => {
            const items = getLS('od_catalog_' + cat);
            if (items && Array.isArray(items)) {
                items.filter(i => i.featured && i.status === 'active').forEach(item => {
                    allFeatured.push({ ...item, _category: cat });
                });
            }
        });

        if (allFeatured.length === 0) return; // Keep hardcoded cards

        const grid = qs('.products-grid', section);
        if (!grid) return;

        const learnMoreText = (window.I18n) ? I18n.t('products.learnMore') : 'Learn More';

        grid.innerHTML = '';
        allFeatured.forEach((item, i) => {
            const delay = (i % 4) + 1;
            const card = document.createElement('div');
            card.className = `product-card reveal-up delay-${delay}`;
            const name = resolveLangField(item.name, lang);
            const desc = resolveLangField(item.shortDescription, lang);
            card.innerHTML = `
                <div class="card-image">
                    <img src="${escapeHTML(item.imageUrl || 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&q=80')}" alt="${escapeHTML(name)}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${escapeHTML(name)}</h3>
                    <p class="card-text">${escapeHTML(desc)}</p>
                    <a href="#/products/${escapeHTML(item._category)}" class="card-link">${escapeHTML(learnMoreText)} <span>&rarr;</span></a>
                </div>`;
            grid.appendChild(card);
        });
    }

    function patchCyber() {
        const raw = getContent('od_content_cyber');
        if (!raw) return;
        const lang = getLang();

        const section = qs('#cyber');
        if (!section) return;

        let data;
        if (raw._v === 2) {
            const shared = raw._shared || {};
            const langData = raw[lang] || raw.en || {};
            data = { ...shared, ...langData };
            // Merge features
            if (shared.features && langData.features) {
                data.features = shared.features.map((s, i) => ({
                    ...s,
                    ...(langData.features[i] || {})
                }));
            }
        } else {
            data = raw;
        }

        if (data.sectionLabel) { const e = qs('.section-label', section); if (e) e.textContent = data.sectionLabel; }
        if (data.title) { const e = qs('.section-title', section); if (e) e.innerHTML = sanitizeHTML(data.title); }
        if (data.description) { const e = qs('.cyber-description', section); if (e) e.textContent = data.description; }
        if (data.backgroundImage) { const e = qs('.cyber-bg', section); const url = sanitizeBackgroundUrl(data.backgroundImage); if (e && url) e.style.backgroundImage = "url('" + url + "')"; }

        const ctaBtn = qs('.cyber-panel > .btn', section);
        if (ctaBtn) {
            if (data.ctaText) ctaBtn.textContent = data.ctaText;
            if (data.ctaLink) ctaBtn.href = data.ctaLink;
        }

        if (data.features && Array.isArray(data.features)) {
            const featureEls = qsa('.cyber-feature', section);
            data.features.forEach((f, i) => {
                if (featureEls[i]) {
                    const iconEl = qs('.feature-icon', featureEls[i]);
                    const titleEl = qs('.feature-title', featureEls[i]);
                    const textEl = qs('.feature-text', featureEls[i]);
                    if (iconEl && f.icon) iconEl.innerHTML = svgIcon(f.icon);
                    if (titleEl && f.title) titleEl.textContent = f.title;
                    if (textEl && f.text) textEl.textContent = f.text;
                }
            });
        }
    }

    function patchContact() {
        const data = resolveContent('od_content_contact');
        if (!data) return;

        const section = qs('#contact');
        if (!section) return;

        if (data.heading) { const e = qs('.contact-heading', section); if (e) e.textContent = data.heading; }
        if (data.description) { const e = qs('.contact-description', section); if (e) e.textContent = data.description; }

        const values = qsa('.contact-item-value', section);
        if (values[0] && data.headquarters) values[0].textContent = data.headquarters;
        if (values[1] && data.email) values[1].textContent = data.email;
        if (values[2] && data.phone) values[2].textContent = data.phone;
        if (values[3] && data.hours) values[3].textContent = data.hours;
    }

    function patchFooter() {
        const data = resolveContent('od_content_footer');
        if (!data) return;

        const footer = qs('.footer');
        if (!footer) return;

        if (data.tagline) { const e = qs('.footer-tagline', footer); if (e) e.textContent = data.tagline; }
        if (data.text) { const e = qs('.footer-text', footer); if (e) e.textContent = data.text; }
        if (data.copyright) { const e = qs('.footer-bottom p', footer); if (e) e.innerHTML = sanitizeHTML(data.copyright); }
    }

    function patchSEO() {
        const data = resolveContent('od_settings_seo');
        if (!data) return;

        if (data.pageTitle) document.title = data.pageTitle;
        if (data.metaDescription) {
            const meta = qs('meta[name="description"]');
            if (meta) meta.setAttribute('content', data.metaDescription);
        }
    }

    function patchBranding() {
        const data = getContent('od_settings_branding');
        if (!data) return;

        if (data.logoUrl) {
            qsa('img[alt*="OMERTA"]').forEach(img => { img.src = data.logoUrl; });
        }
    }

    // ── Run All Patches ──
    function patchAll() {
        patchSEO();
        patchBranding();
        patchHero();
        patchAbout();
        patchProducts();
        patchCyber();
        patchContact();
        patchFooter();
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchAll);
    } else {
        patchAll();
    }

    // Cross-tab live sync
    window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('od_')) {
            patchAll();
        }
    });

    // Re-patch on language change
    window.addEventListener('langchange', () => {
        patchAll();
    });

    // Export for router use
    window.ContentLoader = { patchAll, resolveContent, resolveLangField, getLang, escapeHTML, sanitizeHTML };
})();
