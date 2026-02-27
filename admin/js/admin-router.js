/* ===================================================
   OMERTA DEFENCE — Admin Router
   Hash-based SPA routing + sidebar active states
   =================================================== */

const AdminRouter = (() => {
    const routes = {};
    let currentRoute = null;

    function register(path, handler) {
        routes[path] = handler;
    }

    function navigate(path) {
        window.location.hash = '#/' + path;
    }

    function getRoute() {
        const hash = window.location.hash.replace('#/', '') || 'dashboard';
        return hash;
    }

    function resolve() {
        const route = getRoute();
        if (route === currentRoute) return;
        currentRoute = route;

        // Update sidebar active states
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            const linkRoute = link.getAttribute('data-route');
            if (linkRoute === route || (route.startsWith(linkRoute + '/') && linkRoute !== 'catalogs') ||
                (linkRoute === 'catalogs' && route === 'catalogs')) {
                link.classList.add('active');
            }
        });

        // Also highlight parent for catalog sub-routes
        if (route.startsWith('catalogs/')) {
            const catLink = document.querySelector(`.sidebar-link[data-route="${route}"]`);
            if (catLink) catLink.classList.add('active');
        }

        // Find matching handler
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        // Try exact match first
        if (routes[route]) {
            routes[route](contentArea);
            return;
        }

        // Try prefix match (e.g., "catalogs/small-arms" → "catalogs/:slug")
        for (const [pattern, handler] of Object.entries(routes)) {
            if (pattern.includes(':')) {
                const parts = pattern.split('/');
                const routeParts = route.split('/');
                if (parts.length === routeParts.length) {
                    const params = {};
                    let match = true;
                    for (let i = 0; i < parts.length; i++) {
                        if (parts[i].startsWith(':')) {
                            params[parts[i].slice(1)] = routeParts[i];
                        } else if (parts[i] !== routeParts[i]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        handler(contentArea, params);
                        return;
                    }
                }
            }
        }

        // 404
        contentArea.innerHTML = `
            <div class="page-header">
                <p class="page-breadcrumb">SYSTEM</p>
                <h1 class="page-title">Page Not Found</h1>
            </div>
            <div class="empty-state">
                <div class="empty-state-icon">?</div>
                <p class="empty-state-title">ROUTE NOT FOUND</p>
                <p class="empty-state-text">The page "${route}" does not exist.</p>
                <a href="#/dashboard" class="btn btn-primary">Back to Dashboard</a>
            </div>`;
    }

    function init() {
        window.addEventListener('hashchange', resolve);
        if (!window.location.hash) {
            window.location.hash = '#/dashboard';
        }
        resolve();
    }

    function forceRefresh() {
        currentRoute = null;
        resolve();
    }

    return { register, navigate, getRoute, init, resolve, forceRefresh };
})();
