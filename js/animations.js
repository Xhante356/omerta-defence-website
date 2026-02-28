/* ===================================================
   OMERTA DEFENCE - Complete Animation System
   Boot terminal, Custom cursor, Scramble text,
   3D tilt, Typing effect, Magnetic buttons, Odometer,
   SVG draw, Parallax, Scroll progress, Stat rings
   =================================================== */

(function () {
    'use strict';

    var isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Boot Terminal ----------
    // Delay boot terminal start until after bullet transition
    var bulletTransitionEl = document.getElementById('bulletTransition');
    var bootStartDelay = (bulletTransitionEl && !prefersReducedMotion && !isMobile) ? 1400 : 0;

    (function initBootTerminal() {
        var terminal = document.getElementById('bootTerminal');
        if (!terminal) return;

        var lines = terminal.querySelectorAll('.boot-line');
        var delay = 0;

        setTimeout(function () {
            lines.forEach(function (line, i) {
                delay = (i + 1) * 250;
                setTimeout(function () {
                    line.classList.add('visible');
                }, delay);
            });

            // Hide terminal after all lines shown
            setTimeout(function () {
                terminal.classList.add('hidden');
            }, delay + 800);
        }, bootStartDelay);
    })();

    // ---------- Loading Screen Dismiss ----------
    var loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        var dismiss = function () {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            setTimeout(function () {
                loadingScreen.style.display = 'none';
            }, 500);
        };
        var loadingReady = false;
        var timerDone = false;

        function tryDismiss() {
            if (loadingReady && timerDone) dismiss();
        }

        // Wait for bullet transition + boot terminal to finish first
        var hasBullet = document.getElementById('bulletTransition') && !prefersReducedMotion && !isMobile;
        var bootDelay = document.getElementById('bootTerminal') ? 2800 : 1800;
        if (hasBullet) bootDelay += 1400;
        setTimeout(function () { timerDone = true; tryDismiss(); }, bootDelay);

        if (document.readyState === 'complete') {
            loadingReady = true;
            tryDismiss();
        } else {
            window.addEventListener('load', function () {
                loadingReady = true;
                tryDismiss();
            });
        }
    }

    // ---------- Custom Cursor ----------
    (function initCustomCursor() {
        if (isMobile || prefersReducedMotion) return;

        var ring = document.getElementById('cursorRing');
        var dot = document.getElementById('cursorDot');
        if (!ring || !dot) return;

        var mouseX = 0, mouseY = 0;
        var ringX = 0, ringY = 0;
        var lerp = 0.12;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        function animateRing() {
            ringX += (mouseX - ringX) * lerp;
            ringY += (mouseY - ringY) * lerp;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Expand on interactive elements
        var interactiveSelector = 'a, button, .btn, input, textarea, select, .product-card, .nav-link, .card-link, .lang-btn';
        document.addEventListener('mouseover', function (e) {
            if (e.target.closest(interactiveSelector)) {
                ring.classList.add('expanded');
            }
        });
        document.addEventListener('mouseout', function (e) {
            if (e.target.closest(interactiveSelector)) {
                ring.classList.remove('expanded');
            }
        });
    })();

    // ---------- Scroll Reveal via Intersection Observer ----------
    var revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-clip, .reveal-focus, .reveal-3d, .reveal-wipe, .reveal-line');

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function (el) { revealObserver.observe(el); });

    // Trigger hero elements immediately after bullet+boot+loading
    var hasBulletTrans = document.getElementById('bulletTransition') && !prefersReducedMotion && !isMobile;
    var heroRevealDelay = document.getElementById('bootTerminal') ? 3500 : 300;
    if (hasBulletTrans) heroRevealDelay += 1400;
    setTimeout(function () {
        document.querySelectorAll('.hero .reveal-clip, .hero .reveal-up').forEach(function (el) {
            el.classList.add('revealed');
        });
    }, heroRevealDelay);

    // ---------- Hero Text Scramble Effect ----------
    function scrambleHeroText() {
        var heroTitle = document.querySelector('.hero-title');
        if (!heroTitle || heroTitle.dataset.scrambled === 'done') return;

        var original = heroTitle.innerHTML;
        var segments = original.split(/(<br\s*\/?>)/gi);
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
        var html = '';
        var allChars = [];

        segments.forEach(function (segment) {
            if (segment.match(/^<br\s*\/?>$/i)) {
                html += '<br>';
            } else {
                for (var i = 0; i < segment.length; i++) {
                    var ch = segment[i];
                    if (ch === ' ') {
                        html += ' ';
                    } else {
                        var id = 'sc-' + allChars.length;
                        html += '<span id="' + id + '" class="scramble-char" style="display:inline-block;">' + chars[Math.floor(Math.random() * chars.length)] + '</span>';
                        allChars.push({ id: id, target: ch });
                    }
                }
            }
        });

        heroTitle.innerHTML = html;
        heroTitle.dataset.scrambled = 'done';

        // Animate each character
        allChars.forEach(function (charData, index) {
            var el = document.getElementById(charData.id);
            if (!el) return;
            var iterations = 6 + Math.floor(Math.random() * 8);
            var count = 0;
            var stagger = index * 40;

            setTimeout(function () {
                var interval = setInterval(function () {
                    if (count >= iterations) {
                        el.textContent = charData.target;
                        clearInterval(interval);
                        return;
                    }
                    el.textContent = chars[Math.floor(Math.random() * chars.length)];
                    count++;
                }, 40);
            }, stagger);
        });
    }

    // Run scramble after loading completes
    var scrambleDelay = document.getElementById('bootTerminal') ? 4000 : 2000;
    if (hasBulletTrans) scrambleDelay += 1400;
    setTimeout(scrambleHeroText, scrambleDelay);

    // ---------- Odometer Stat Counter Animation ----------
    var statNumbers = document.querySelectorAll('.stat-number[data-target]');
    var countersStarted = false;

    function animateCounters() {
        if (countersStarted) return;
        countersStarted = true;

        statNumbers.forEach(function (counter) {
            var target = parseInt(counter.getAttribute('data-target'));
            var duration = 2000;
            var startTime = performance.now();

            function updateCount(currentTime) {
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = Math.floor(eased * target);

                counter.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.textContent = target.toLocaleString();
                    counter.classList.add('pulse');
                    setTimeout(function () {
                        counter.classList.remove('pulse');
                    }, 600);
                }
            }

            requestAnimationFrame(updateCount);
        });
    }

    var statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        var statsObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounters();
                    animateStatRings();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    // ---------- SVG Stat Rings Animation ----------
    function animateStatRings() {
        var rings = document.querySelectorAll('.stat-ring-fill');
        rings.forEach(function (ring) {
            var percent = parseInt(ring.getAttribute('data-percent')) || 80;
            var circumference = 283; // 2 * PI * 45
            var offset = circumference - (circumference * percent / 100);
            ring.style.strokeDashoffset = offset;
            ring.classList.add('animated');
        });
    }

    // ---------- Parallax Scrolling ----------
    var heroBg = document.querySelector('.hero-bg');
    var cyberBg = document.querySelector('.cyber-bg');

    function handleParallax() {
        var scrollY = window.scrollY;

        if (heroBg) {
            var heroRect = heroBg.parentElement.getBoundingClientRect();
            if (heroRect.bottom > 0) {
                heroBg.style.transform = 'translateY(' + (scrollY * 0.4) + 'px)';
            }
        }

        if (cyberBg) {
            var cyberRect = cyberBg.parentElement.getBoundingClientRect();
            if (cyberRect.top < window.innerHeight && cyberRect.bottom > 0) {
                var offset = (cyberRect.top - window.innerHeight) * -0.15;
                cyberBg.style.transform = 'translateY(' + offset + 'px)';
            }
        }

        // Floating badges parallax
        document.querySelectorAll('.floating-badge').forEach(function (badge) {
            var speed = parseFloat(badge.dataset.parallaxSpeed) || 0;
            badge.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
        });
    }

    // ---------- Scroll Progress Bar ----------
    var scrollProgress = document.querySelector('.scroll-progress');

    function updateScrollProgress() {
        if (!scrollProgress) return;
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = percent + '%';
    }

    // ---------- Combined Scroll Handler ----------
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                handleParallax();
                updateScrollProgress();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // ---------- Mouse-Tracking Card Glow + 3D Tilt ----------
    function initCardGlow() {
        var cards = document.querySelectorAll('.product-card');
        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');

                // 3D Tilt effect (desktop only)
                if (!isMobile) {
                    var centerX = rect.width / 2;
                    var centerY = rect.height / 2;
                    var rotateY = ((x - centerX) / centerX) * 8;
                    var rotateX = ((centerY - y) / centerY) * 8;
                    var inner = card.querySelector('.card-inner');
                    if (inner && !card.classList.contains('flipped')) {
                        inner.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(10px)';
                    }
                }
            });

            card.addEventListener('mouseleave', function () {
                var inner = card.querySelector('.card-inner');
                if (inner && !card.classList.contains('flipped')) {
                    inner.style.transform = '';
                    inner.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                    setTimeout(function () { inner.style.transition = ''; }, 500);
                }
            });

            // Card flip on click
            card.addEventListener('click', function (e) {
                // Don't flip if clicking a link
                if (e.target.closest('a')) return;
                card.classList.toggle('flipped');
            });
        });
    }

    initCardGlow();

    // Grid glow trail
    var productsGrid = document.querySelector('.products-grid');
    if (productsGrid && !isMobile) {
        productsGrid.addEventListener('mousemove', function (e) {
            var rect = productsGrid.getBoundingClientRect();
            productsGrid.style.setProperty('--grid-glow-x', (e.clientX - rect.left) + 'px');
            productsGrid.style.setProperty('--grid-glow-y', (e.clientY - rect.top) + 'px');
        });
    }

    // Re-init glow when content is dynamically loaded
    window.addEventListener('contentloaded', initCardGlow);

    // ---------- Magnetic CTA Buttons ----------
    (function initMagneticButtons() {
        if (isMobile || prefersReducedMotion) return;

        document.querySelectorAll('.magnetic-btn').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(function () { btn.style.transition = ''; }, 500);
            });
        });
    })();

    // ---------- SVG Draw Effect ----------
    (function initSVGDraw() {
        var svgElements = document.querySelectorAll('.svg-draw');
        if (!svgElements.length) return;

        // Set initial dash values from actual path lengths
        svgElements.forEach(function (el) {
            var paths = el.querySelectorAll('svg *[stroke]');
            paths.forEach(function (path) {
                if (path.getTotalLength) {
                    var len = path.getTotalLength();
                    path.style.strokeDasharray = len;
                    path.style.strokeDashoffset = len;
                }
            });
        });

        var svgObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('drawn');
                    // Animate with actual lengths
                    var paths = entry.target.querySelectorAll('svg *[stroke]');
                    paths.forEach(function (path) {
                        if (path.getTotalLength) {
                            path.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
                            path.style.strokeDashoffset = '0';
                        }
                    });
                    svgObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        svgElements.forEach(function (el) { svgObserver.observe(el); });
    })();

    // ---------- Typing Effect ----------
    (function initTypingEffect() {
        if (prefersReducedMotion) return;

        var typingElements = document.querySelectorAll('[data-typing-effect]');
        typingElements.forEach(function (el) {
            var originalText = el.textContent;
            el.dataset.originalText = originalText;
        });

        var typingObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var text = el.dataset.originalText || el.textContent;
                    el.textContent = '';
                    var cursor = document.createElement('span');
                    cursor.className = 'typing-cursor';
                    el.appendChild(cursor);

                    var i = 0;
                    var typingInterval = setInterval(function () {
                        if (i >= text.length) {
                            clearInterval(typingInterval);
                            // Remove cursor after a delay
                            setTimeout(function () {
                                if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
                            }, 2000);
                            return;
                        }
                        el.insertBefore(document.createTextNode(text[i]), cursor);
                        i++;
                    }, 15);

                    typingObserver.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        typingElements.forEach(function (el) { typingObserver.observe(el); });
    })();

    // ---------- Hero Video Management ----------
    (function initHeroVideo() {
        var video = document.getElementById('heroVideo');
        if (!video) return;

        // Check for source element or src attribute
        var hasSource = video.querySelector('source') || video.src;
        if (!hasSource) {
            video.style.display = 'none';
            return;
        }

        // Lazy: only play when hero is visible
        var heroSection = document.getElementById('hero');
        var videoObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    video.play().catch(function () {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.1 });

        if (heroSection) videoObserver.observe(heroSection);

        video.addEventListener('loadeddata', function () {
            video.classList.add('loaded');
        });

        // Also try canplay for broader compatibility
        video.addEventListener('canplay', function () {
            video.classList.add('loaded');
        });
    })();

    // ---------- Bullet Transition Effect ----------
    (function initBulletTransition() {
        var transition = document.getElementById('bulletTransition');
        if (!transition || prefersReducedMotion || isMobile) {
            if (transition) transition.style.display = 'none';
            return;
        }

        var shell = transition.querySelector('.bullet-shell');
        var flash = transition.querySelector('.bullet-flash');
        var smoke = document.getElementById('bulletSmoke');
        var impact = document.getElementById('bulletImpact');
        var shutter = document.getElementById('bulletShutter');
        var sparks = document.getElementById('impactSparks');
        var trails = transition.querySelectorAll('.bullet-trail');

        // Create smoke particles
        for (var i = 0; i < 12; i++) {
            var smokeP = document.createElement('div');
            smokeP.className = 'smoke-particle';
            smokeP.style.setProperty('--delay', (Math.random() * 200) + 'ms');
            smokeP.style.setProperty('--drift-x', (Math.random() * 80 - 40) + 'px');
            smokeP.style.setProperty('--drift-y', -(Math.random() * 60 + 20) + 'px');
            smokeP.style.setProperty('--size', (8 + Math.random() * 16) + 'px');
            smoke.appendChild(smokeP);
        }

        // Create spark particles on impact
        for (var j = 0; j < 20; j++) {
            var spark = document.createElement('div');
            spark.className = 'spark-particle';
            var angle = (Math.PI * 2 * j) / 20 + (Math.random() - 0.5) * 0.8;
            var dist = 30 + Math.random() * 100;
            spark.style.setProperty('--sx', (Math.cos(angle) * dist) + 'px');
            spark.style.setProperty('--sy', (Math.sin(angle) * dist) + 'px');
            spark.style.setProperty('--delay', (Math.random() * 50) + 'ms');
            sparks.appendChild(spark);
        }

        // Animation timeline
        var timeline = [
            // Phase 1: Bullet enters from left (0ms)
            { time: 0, fn: function () {
                transition.classList.add('active');
                shell.classList.add('fly');
                // Activate trails
                trails.forEach(function (t) { t.classList.add('active'); });
            }},
            // Phase 2: Muzzle flash (50ms)
            { time: 50, fn: function () {
                flash.classList.add('fire');
                smoke.classList.add('active');
            }},
            // Phase 3: Impact on center (450ms - bullet crosses screen fast)
            { time: 450, fn: function () {
                shell.classList.add('hit');
                impact.classList.add('active');
                sparks.classList.add('active');
                // Screen shake
                transition.classList.add('shake');
            }},
            // Phase 4: Shutter close / wipe (650ms)
            { time: 650, fn: function () {
                shutter.classList.add('close');
                transition.classList.remove('shake');
            }},
            // Phase 5: Shutter open revealing site (1200ms)
            { time: 1200, fn: function () {
                shutter.classList.add('open');
            }},
            // Phase 6: Clean up (2000ms)
            { time: 2000, fn: function () {
                transition.classList.add('done');
                setTimeout(function () {
                    transition.style.display = 'none';
                }, 500);
            }}
        ];

        timeline.forEach(function (step) {
            setTimeout(step.fn, step.time);
        });
    })();

})();
