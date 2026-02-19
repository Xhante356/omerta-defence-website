/* ===================================================
   OMERTA DEFENCE - Scroll Animations, Parallax & Counters
   =================================================== */

(function () {
    // ---------- Scroll Reveal via Intersection Observer ----------
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Trigger hero elements immediately
    setTimeout(() => {
        document.querySelectorAll('.hero .reveal-up').forEach(el => {
            el.classList.add('revealed');
        });
    }, 300);

    // ---------- Stat Counter Animation ----------
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let countersStarted = false;

    function animateCounters() {
        if (countersStarted) return;
        countersStarted = true;

        statNumbers.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                counter.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            }

            requestAnimationFrame(updateCount);
        });
    }

    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    // ---------- Parallax Scrolling ----------
    const heroBg = document.querySelector('.hero-bg');
    const cyberBg = document.querySelector('.cyber-bg');

    function handleParallax() {
        const scrollY = window.scrollY;

        if (heroBg) {
            const heroRect = heroBg.parentElement.getBoundingClientRect();
            if (heroRect.bottom > 0) {
                heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
            }
        }

        if (cyberBg) {
            const cyberRect = cyberBg.parentElement.getBoundingClientRect();
            if (cyberRect.top < window.innerHeight && cyberRect.bottom > 0) {
                const offset = (cyberRect.top - window.innerHeight) * -0.15;
                cyberBg.style.transform = `translateY(${offset}px)`;
            }
        }
    }

    // Use requestAnimationFrame for smooth parallax
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleParallax();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
})();
