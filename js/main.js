/* ===================================================
   OMERTA DEFENCE - Main Script
   Nav, Mobile Menu, Smooth Scroll, Form, Active Section,
   Particle Burst, SiteRouter Init
   =================================================== */

(function () {
    // ---------- DOM Elements ----------
    var navbar = document.getElementById('navbar');
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    var navLinks = document.querySelectorAll('.nav-link');
    var mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');
    var contactForm = document.getElementById('contactForm');
    var sections = document.querySelectorAll('section[id]');

    // ---------- Navbar Scroll Effect ----------
    function handleNavScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ---------- Active Section Highlighting ----------
    function updateActiveSection() {
        var scrollPos = window.scrollY + window.innerHeight / 3;

        sections.forEach(function (section) {
            var top = section.offsetTop;
            var bottom = top + section.offsetHeight;
            var id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < bottom) {
                navLinks.forEach(function (link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    updateActiveSection();

    // ---------- Mobile Menu ----------
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // ---------- Smooth Scroll ----------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            // Skip router routes — let SiteRouter handle #/ links
            if (targetId.indexOf('#/') === 0) return;

            var target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            // If we're on a dynamic route, go back to main site first
            if (window.location.hash.indexOf('#/') === 0) {
                if (typeof SiteRouter !== 'undefined') SiteRouter.goHome(null);
            }

            var navHeight = navbar.offsetHeight;
            var targetPos = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPos,
                behavior: 'smooth'
            });

            // Update hash without triggering hashchange scroll
            history.pushState(null, '', targetId);
            closeMobileMenu();
        });
    });

    // ---------- Particle Burst on Form Submit ----------
    function createParticleBurst(x, y) {
        var container = document.getElementById('particleBurst');
        if (!container) return;

        for (var i = 0; i < 20; i++) {
            var particle = document.createElement('div');
            particle.className = 'particle-burst';
            var angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.5;
            var distance = 60 + Math.random() * 80;
            var px = Math.cos(angle) * distance;
            var py = Math.sin(angle) * distance;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.setProperty('--px', px + 'px');
            particle.style.setProperty('--py', py + 'px');
            particle.style.width = (3 + Math.random() * 4) + 'px';
            particle.style.height = particle.style.width;
            container.appendChild(particle);

            // Clean up after animation
            setTimeout(function () {
                if (particle.parentNode) particle.parentNode.removeChild(particle);
            }, 800);
        }
    }

    // ---------- Contact Form ----------
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = document.getElementById('name').value.trim();
            var email = document.getElementById('email').value.trim();
            var subject = document.getElementById('subject').value;
            var message = document.getElementById('message').value.trim();

            // Basic validation
            if (!name || !email || !subject || !message) {
                return;
            }

            // Email format check
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return;
            }

            // Show loading
            var btnText = contactForm.querySelector('.btn-text');
            var btnLoading = contactForm.querySelector('.btn-loading');
            var submitBtn = contactForm.querySelector('button[type="submit"]');
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.disabled = true;

            // Simulate form submission
            setTimeout(function () {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;

                // Persist inquiry to localStorage for admin panel
                try {
                    var inquiries = JSON.parse(localStorage.getItem('od_inquiries') || '[]');
                    inquiries.unshift({
                        id: 'inq-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                        name: name,
                        email: email,
                        company: document.getElementById('company').value.trim(),
                        subject: subject,
                        message: message,
                        status: 'new',
                        notes: '',
                        createdAt: new Date().toISOString()
                    });
                    localStorage.setItem('od_inquiries', JSON.stringify(inquiries));
                } catch (err) { /* localStorage unavailable */ }

                // Particle burst from submit button
                var btnRect = submitBtn.getBoundingClientRect();
                createParticleBurst(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2);

                // Show success message
                var formSuccess = document.getElementById('formSuccess');
                formSuccess.style.display = 'flex';
                contactForm.reset();

                // Hide success after 5 seconds
                setTimeout(function () {
                    formSuccess.style.display = 'none';
                }, 5000);
            }, 1500);
        });

        // Floating label support
        contactForm.querySelectorAll('input, textarea').forEach(function (input) {
            input.setAttribute('placeholder', ' ');
        });
    }

    // ---------- Init Site Router ----------
    if (typeof SiteRouter !== 'undefined' && SiteRouter.init) {
        SiteRouter.init();
    }

})();
