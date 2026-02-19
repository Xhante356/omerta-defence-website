/* ===================================================
   OMERTA DEFENCE - Main Script
   Nav, Mobile Menu, Smooth Scroll, Form, Active Section
   =================================================== */

(function () {
    // ---------- DOM Elements ----------
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');
    const contactForm = document.getElementById('contactForm');
    const sections = document.querySelectorAll('section[id]');

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
        const scrollPos = window.scrollY + window.innerHeight / 3;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < bottom) {
                navLinks.forEach(link => {
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

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // ---------- Smooth Scroll ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navHeight = navbar.offsetHeight;
            const targetPos = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPos,
                behavior: 'smooth'
            });
        });
    });

    // ---------- Contact Form ----------
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();

            // Basic validation
            if (!name || !email || !subject || !message) {
                return;
            }

            // Email format check
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return;
            }

            // Show loading
            const btnText = contactForm.querySelector('.btn-text');
            const btnLoading = contactForm.querySelector('.btn-loading');
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.disabled = true;

            // Simulate form submission
            setTimeout(() => {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;

                // Show success message
                const formSuccess = document.getElementById('formSuccess');
                formSuccess.style.display = 'flex';
                contactForm.reset();

                // Hide success after 5 seconds
                setTimeout(() => {
                    formSuccess.style.display = 'none';
                }, 5000);
            }, 1500);
        });

        // Floating label support - add placeholder for CSS :not(:placeholder-shown)
        contactForm.querySelectorAll('input, textarea').forEach(input => {
            input.setAttribute('placeholder', ' ');
        });
    }
})();
