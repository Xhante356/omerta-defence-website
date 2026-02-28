/* ===================================================
   OMERTA DEFENCE — Admin App
   Initialization, shell rendering, toast, clock
   =================================================== */

const AdminApp = (() => {
    // ── Toast System ──
    function toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.textContent = message;
        container.appendChild(el);

        setTimeout(() => {
            el.classList.add('removing');
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }

    // ── Clock ──
    function startClock() {
        const clock = document.getElementById('topbarClock');
        if (!clock) return;
        function update() {
            const now = new Date();
            clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        update();
        setInterval(update, 1000);
    }

    // ── Sidebar Toggle (mobile) ──
    function initSidebarToggle() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        if (toggle && sidebar) {
            toggle.addEventListener('click', () => sidebar.classList.toggle('open'));

            // Close sidebar on nav click (mobile)
            sidebar.addEventListener('click', (e) => {
                if (e.target.closest('.sidebar-link') && window.innerWidth <= 1024) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }

    // ── Login Flow ──
    function initLogin() {
        const overlay = document.getElementById('loginOverlay');
        const shell = document.getElementById('adminShell');
        const form = document.getElementById('loginForm');
        const errorEl = document.getElementById('loginError');
        const lockoutEl = document.getElementById('loginLockout');
        const setupMsg = document.getElementById('loginSetupMsg');
        const confirmField = document.getElementById('loginConfirmField');
        const loginBtnText = document.getElementById('loginBtnText');

        // Check if already authenticated
        if (AdminAuth.isAuthenticated()) {
            overlay.style.display = 'none';
            shell.style.display = 'flex';
            bootApp();
            return;
        }

        // First-time setup
        const isSetup = AdminAuth.isFirstTime();
        if (isSetup) {
            setupMsg.style.display = 'block';
            confirmField.style.display = 'block';
            loginBtnText.textContent = 'SET PASSWORD';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.textContent = '';
            lockoutEl.style.display = 'none';

            const password = document.getElementById('loginPassword').value;

            if (isSetup) {
                const confirm = document.getElementById('loginPasswordConfirm').value;
                if (password.length < 4) {
                    errorEl.textContent = 'Password must be at least 4 characters.';
                    return;
                }
                if (password !== confirm) {
                    errorEl.textContent = 'Passwords do not match.';
                    return;
                }
                await AdminAuth.setPassword(password);
                overlay.style.display = 'none';
                shell.style.display = 'flex';
                bootApp();
                toast('Password set. Welcome to Command Center.', 'success');
            } else {
                // Check lockout
                const lockSec = AdminAuth.isLockedOut();
                if (lockSec) {
                    lockoutEl.textContent = `Locked out. Try again in ${lockSec}s.`;
                    lockoutEl.style.display = 'block';
                    return;
                }

                const result = await AdminAuth.login(password);
                if (result.success) {
                    overlay.style.display = 'none';
                    shell.style.display = 'flex';
                    bootApp();
                    toast('Access granted.', 'success');
                } else {
                    errorEl.textContent = result.error;
                }
            }
        });
    }

    // ── Logout ──
    function initLogout() {
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            AdminAuth.logout();
            toast('Logged out.', 'info');
            setTimeout(() => location.reload(), 500);
        });
    }

    // ── Register Routes ──
    function registerRoutes() {
        AdminRouter.register('dashboard', (c) => AdminDashboard.render(c));

        AdminRouter.register('content/hero', (c) => AdminContent.renderHero(c));
        AdminRouter.register('content/about', (c) => AdminContent.renderAbout(c));
        AdminRouter.register('content/products', (c) => AdminContent.renderProducts(c));
        AdminRouter.register('content/cyber', (c) => AdminContent.renderCyber(c));
        AdminRouter.register('content/contact', (c) => AdminContent.renderContact(c));
        AdminRouter.register('content/footer', (c) => AdminContent.renderFooter(c));

        AdminRouter.register('catalogs', (c) => AdminCatalogs.renderOverview(c));
        AdminRouter.register('catalogs/:slug', (c, p) => AdminCatalogs.renderCategory(c, p));

        AdminRouter.register('pages', (c) => AdminPages.renderList(c));
        AdminRouter.register('pages/new', (c) => AdminPages.renderEditor(c, null));
        AdminRouter.register('pages/edit/:id', (c, p) => AdminPages.renderEditor(c, p.id));

        AdminRouter.register('media', (c) => AdminMedia.render(c));
        AdminRouter.register('inquiries', (c) => AdminInquiries.render(c));
        AdminRouter.register('rfq', (c) => AdminRFQ.render(c));
        AdminRouter.register('audit', (c) => AdminAudit.render(c));
        AdminRouter.register('settings', (c) => AdminSettings.render(c));
        AdminRouter.register('ai-chat', (c) => AdminAIChat.render(c));
    }

    // ── Boot (after login) ──
    function bootApp() {
        // Run v1→v2 migration (idempotent)
        if (typeof AdminMigration !== 'undefined' && AdminMigration.run) {
            AdminMigration.run();
        }
        // Init admin i18n
        if (typeof AdminI18n !== 'undefined' && AdminI18n.init) {
            AdminI18n.init();
        }

        startClock();
        initSidebarToggle();
        initLogout();
        registerRoutes();
        AdminRouter.init();
    }

    // ── Initialize ──
    function init() {
        initLogin();
    }

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { toast, init };
})();
