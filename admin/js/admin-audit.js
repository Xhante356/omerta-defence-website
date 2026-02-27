/* ===================================================
   OMERTA DEFENCE — Admin Audit Log
   Chronological activity viewer
   =================================================== */

const AdminAudit = (() => {
    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    const ACTION_TYPES = [
        'auth_login', 'auth_logout', 'auth_setup',
        'content_update', 'content_reset',
        'catalog_add', 'catalog_update', 'catalog_delete', 'catalog_duplicate',
        'media_add', 'media_delete',
        'inquiry_status', 'inquiry_delete', 'inquiry_export',
        'rfq_create', 'rfq_status', 'rfq_delete',
        'data_export', 'data_import', 'data_clear'
    ];

    function render(container) {
        let log = AdminStore.getAuditLog();
        let filterType = 'all';

        function draw() {
            let filtered = log;
            if (filterType !== 'all') filtered = filtered.filter(e => e.action === filterType);

            container.innerHTML = `
                <div class="page-header">
                    <p class="page-breadcrumb">SYSTEM</p>
                    <h1 class="page-title">Audit Log</h1>
                    <p class="page-subtitle">${log.length} entries (max 500)</p>
                </div>

                <div class="filter-bar">
                    <select class="form-select" id="auditFilter">
                        <option value="all">All Actions</option>
                        ${ACTION_TYPES.map(t => `<option value="${t}" ${filterType === t ? 'selected' : ''}>${t.replace(/_/g, ' ')}</option>`).join('')}
                    </select>
                </div>

                ${filtered.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">&#128221;</div>
                        <p class="empty-state-title">NO LOG ENTRIES</p>
                        <p class="empty-state-text">Admin actions will be recorded here automatically.</p>
                    </div>
                ` : `
                    <div class="table-wrapper">
                        <table class="admin-table">
                            <thead><tr><th>Timestamp</th><th>Action</th><th>Description</th></tr></thead>
                            <tbody>
                                ${filtered.map(e => `
                                    <tr>
                                        <td style="white-space:nowrap;font-family:var(--font-sub);font-size:0.8rem;color:var(--text-muted);">${new Date(e.timestamp).toLocaleString()}</td>
                                        <td><span class="badge badge-action badge-${getBadgeType(e.action)}">${e.action.replace(/_/g, ' ')}</span></td>
                                        <td>${escHtml(e.description)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}`;

            container.querySelector('#auditFilter')?.addEventListener('change', (e) => { filterType = e.target.value; draw(); });
        }

        draw();
    }

    function getBadgeType(action) {
        if (action.includes('delete') || action.includes('clear')) return 'archived';
        if (action.includes('login') || action.includes('setup')) return 'read';
        if (action.includes('create') || action.includes('add')) return 'new';
        if (action.includes('export') || action.includes('import')) return 'draft';
        return 'active';
    }

    return { render };
})();
