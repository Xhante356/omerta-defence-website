/* ===================================================
   OMERTA DEFENCE - Scroll Animations, Parallax, Counters,
   Loading Screen, Text Split, Mouse Glow, Scroll Progress
   =================================================== */

(function () {

    // ---------- Loading Screen Dismiss ----------
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        const dismiss = function () {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            setTimeout(function () {
                loadingScreen.style.display = 'none';
            }, 500);
        };
        // Dismiss after 1.8s or when page fully loads, whichever comes last
        var loadingReady = false;
        var timerDone = false;

        function tryDismiss() {
            if (loadingReady && timerDone) dismiss();
        }

        setTimeout(function () { timerDone = true; tryDismiss(); }, 1800);

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

    // ---------- Scroll Reveal via Intersection Observer ----------
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver(function (entries) {
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

    // Trigger hero elements immediately
    setTimeout(function () {
        document.querySelectorAll('.hero .reveal-up').forEach(function (el) {
            el.classList.add('revealed');
        });
    }, 300);

    // ---------- Hero Text Split Animation ----------
    function splitHeroText() {
        var heroTitle = document.querySelector('.hero-title');
        if (!heroTitle || heroTitle.dataset.split === 'done') return;

        var original = heroTitle.innerHTML;
        // Split by <br> tags first, then process each segment
        var segments = original.split(/(<br\s*\/?>)/gi);
        var html = '';
        var charIndex = 0;

        segments.forEach(function (segment) {
            if (segment.match(/^<br\s*\/?>$/i)) {
                html += '<br>';
            } else {
                for (var i = 0; i < segment.length; i++) {
                    var ch = segment[i];
                    if (ch === ' ') {
                        html += ' ';
                    } else {
                        html += '<span class="split-char" style="animation-delay:' + (charIndex * 0.05) + 's">' + ch + '</span>';
                        charIndex++;
                    }
                }
            }
        });

        heroTitle.innerHTML = html;
        heroTitle.dataset.split = 'done';
    }

    // Run split after loading screen dismisses
    setTimeout(splitHeroText, 2000);

    // ---------- Stat Counter Animation with Pulse ----------
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
                    // Pulse effect on completion
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
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
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

    // ---------- Mouse-Tracking Card Glow ----------
    function initCardGlow() {
        var cards = document.querySelectorAll('.product-card');
        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
            });
        });
    }

    initCardGlow();

    // Re-init glow when content is dynamically loaded
    window.addEventListener('contentloaded', initCardGlow);

})();
