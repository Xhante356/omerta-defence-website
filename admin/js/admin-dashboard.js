/* ===================================================
   OMERTA DEFENCE — Admin Dashboard
   KPIs, recent inquiries, RFQ pipeline, activity, quick actions
   =================================================== */

const AdminDashboard = (() => {
    function render(container) {
        const inquiries = AdminStore.getInquiries();
        const rfqs = AdminStore.getRFQs();
        const auditLog = AdminStore.getAuditLog();
        const counts = AdminStore.getAllCatalogCounts();
        const totalCatalog = Object.values(counts).reduce((a, b) => a + b, 0);
        const newInquiries = inquiries.filter(i => i.status === 'new').length;
        const activeRFQs = rfqs.filter(r => !['won', 'lost'].includes(r.status)).length;

        container.innerHTML = `
            <div class="page-header">
                <p class="page-breadcrumb">OVERVIEW</p>
                <h1 class="page-title">Dashboard</h1>
                <p class="page-subtitle">Command Center overview</p>
            </div>

            <!-- KPI Cards -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <p class="kpi-label">Total Inquiries</p>
                    <p class="kpi-value">${inquiries.length}</p>
                </div>
                <div class="kpi-card">
                    <p class="kpi-label">New / Unread</p>
                    <p class="kpi-value">${newInquiries}</p>
                </div>
                <div class="kpi-card">
                    <p class="kpi-label">Active RFQs</p>
                    <p class="kpi-value">${activeRFQs}</p>
                </div>
                <div class="kpi-card">
                    <p class="kpi-label">Catalog Items</p>
                    <p class="kpi-value">${totalCatalog}</p>
                </div>
            </div>

            <div class="grid-2">
                <!-- Recent Inquiries -->
                <div class="card">
                    <div class="card-header">
                        <span class="card-label">Recent Inquiries</span>
                        <a href="#/inquiries" class="btn btn-ghost btn-sm">View All</a>
                    </div>
                    ${renderRecentInquiries(inquiries.slice(0, 5))}
                </div>

                <!-- RFQ Pipeline -->
                <div class="card">
                    <div class="card-header">
                        <span class="card-label">RFQ Pipeline</span>
                        <a href="#/rfq" class="btn btn-ghost btn-sm">View All</a>
                    </div>
                    ${renderPipeline(rfqs)}
                </div>
            </div>

            <div class="grid-2 mt-24">
                <!-- Recent Activity -->
                <div class="card">
                    <div class="card-header">
                        <span class="card-label">Recent Activity</span>
                        <a href="#/audit" class="btn btn-ghost btn-sm">Full Log</a>
                    </div>
                    ${renderActivity(auditLog.slice(0, 10))}
                </div>

                <!-- Quick Actions -->
                <div class="card">
                    <div class="card-header">
                        <span class="card-label">Quick Actions</span>
                    </div>
                    <div class="btn-group" style="flex-wrap:wrap;">
                        <a href="#/content/hero" class="btn btn-outline btn-sm">Edit Hero</a>
                        <a href="#/catalogs" class="btn btn-outline btn-sm">Manage Catalogs</a>
                        <a href="#/inquiries" class="btn btn-outline btn-sm">View Inquiries</a>
                        <a href="#/settings" class="btn btn-outline btn-sm">Export Data</a>
                    </div>
                </div>
            </div>`;
    }

    function renderRecentInquiries(items) {
        if (items.length === 0) {
            return '<div class="table-empty"><p>No inquiries yet.</p></div>';
        }
        let rows = items.map(i => {
            const statusClass = 'badge-' + i.status;
            const date = new Date(i.createdAt).toLocaleDateString();
            return `<tr>
                <td><span class="badge ${statusClass}">${i.status}</span></td>
                <td>${date}</td>
                <td class="truncate" style="max-width:120px">${escHtml(i.name)}</td>
                <td class="truncate" style="max-width:150px">${escHtml(i.subject)}</td>
            </tr>`;
        }).join('');

        return `<div class="table-wrapper">
            <table class="admin-table">
                <thead><tr><th>Status</th><th>Date</th><th>Name</th><th>Subject</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    function renderPipeline(rfqs) {
        const stages = ['received', 'under-review', 'quoted', 'negotiation', 'won', 'lost'];
        const colors = { received: '#3498db', 'under-review': '#f39c12', quoted: '#9b59b6', negotiation: '#e67e22', won: '#2ecc71', lost: '#e74c3c' };
        const labels = { received: 'Received', 'under-review': 'Review', quoted: 'Quoted', negotiation: 'Negot.', won: 'Won', lost: 'Lost' };
        const total = rfqs.length || 1;

        if (rfqs.length === 0) {
            return '<div class="table-empty"><p>No RFQs yet.</p></div>';
        }

        const segments = stages.map(s => {
            const count = rfqs.filter(r => r.status === s).length;
            if (count === 0) return '';
            const pct = (count / total * 100);
            return `<div class="pipeline-segment" style="width:${pct}%;background:${colors[s]}" title="${labels[s]}: ${count}">${count > 0 ? count : ''}</div>`;
        }).join('');

        const legend = stages.map(s => {
            const count = rfqs.filter(r => r.status === s).length;
            return `<span style="font-size:0.75rem;color:${colors[s]};margin-right:12px;">${labels[s]}: ${count}</span>`;
        }).join('');

        return `<div class="pipeline-bar">${segments}</div><div style="margin-top:8px;">${legend}</div>`;
    }

    function renderActivity(items) {
        if (items.length === 0) {
            return '<div class="table-empty"><p>No activity recorded yet.</p></div>';
        }
        const list = items.map(a => {
            const time = new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `<li class="activity-item">
                <span class="activity-time">${time}</span>
                <span class="badge badge-action badge-${getActionBadge(a.action)}">${a.action.replace(/_/g, ' ')}</span>
                <span class="activity-text">${escHtml(a.description)}</span>
            </li>`;
        }).join('');
        return `<ul class="activity-feed">${list}</ul>`;
    }

    function getActionBadge(action) {
        if (action.startsWith('auth')) return 'read';
        if (action.includes('delete') || action.includes('clear')) return 'archived';
        if (action.includes('create') || action.includes('add')) return 'new';
        if (action.includes('update') || action.includes('status')) return 'draft';
        return 'active';
    }

    function escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    return { render };
})();
