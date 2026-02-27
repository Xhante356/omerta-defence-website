/* ===================================================
   OMERTA DEFENCE — Admin Inquiries
   Contact form submissions management
   =================================================== */

const AdminInquiries = (() => {
    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    function toast(msg, type) {
        if (window.AdminApp) AdminApp.toast(msg, type);
    }

    function render(container) {
        let inquiries = AdminStore.getInquiries();
        let filterStatus = 'all';
        let searchQuery = '';

        function draw() {
            let filtered = inquiries;
            if (filterStatus !== 'all') filtered = filtered.filter(i => i.status === filterStatus);
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(i =>
                    i.name.toLowerCase().includes(q) ||
                    i.email.toLowerCase().includes(q) ||
                    i.company.toLowerCase().includes(q) ||
                    i.subject.toLowerCase().includes(q)
                );
            }

            container.innerHTML = `
                <div class="page-header">
                    <p class="page-breadcrumb">OPERATIONS</p>
                    <h1 class="page-title">Inquiries</h1>
                    <p class="page-subtitle">${inquiries.length} total inquiries</p>
                </div>

                <div class="flex-between mb-16">
                    <div class="filter-bar" style="margin-bottom:0;">
                        <div class="search-input">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input class="form-input" id="inqSearch" placeholder="Search name, email, company..." value="${escHtml(searchQuery)}">
                        </div>
                        <select class="form-select" id="inqStatusFilter">
                            <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>All Status</option>
                            <option value="new" ${filterStatus === 'new' ? 'selected' : ''}>New</option>
                            <option value="read" ${filterStatus === 'read' ? 'selected' : ''}>Read</option>
                            <option value="replied" ${filterStatus === 'replied' ? 'selected' : ''}>Replied</option>
                            <option value="archived" ${filterStatus === 'archived' ? 'selected' : ''}>Archived</option>
                        </select>
                    </div>
                    <button class="btn btn-outline btn-sm" id="exportCsvBtn">Export CSV</button>
                </div>

                ${filtered.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">&#128172;</div>
                        <p class="empty-state-title">NO INQUIRIES</p>
                        <p class="empty-state-text">When visitors submit the contact form, their messages appear here.</p>
                    </div>
                ` : `
                    <div class="table-wrapper">
                        <table class="admin-table">
                            <thead><tr><th>Status</th><th>Date</th><th>Name</th><th>Email</th><th>Company</th><th>Subject</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${filtered.map(inq => `
                                    <tr>
                                        <td><span class="badge badge-${inq.status}">${inq.status}</span></td>
                                        <td style="white-space:nowrap;">${new Date(inq.createdAt).toLocaleDateString()}</td>
                                        <td>${escHtml(inq.name)}</td>
                                        <td class="truncate" style="max-width:180px">${escHtml(inq.email)}</td>
                                        <td>${escHtml(inq.company)}</td>
                                        <td>${escHtml(inq.subject)}</td>
                                        <td>
                                            <div class="table-actions">
                                                <button class="btn-icon" data-action="view" data-id="${inq.id}" title="View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                                                <button class="btn-icon" data-action="promote" data-id="${inq.id}" title="Promote to RFQ"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></button>
                                                <button class="btn-icon" data-action="delete" data-id="${inq.id}" title="Delete" style="color:var(--danger)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}`;

            // Bind events
            container.querySelector('#inqSearch')?.addEventListener('input', (e) => { searchQuery = e.target.value; draw(); });
            container.querySelector('#inqStatusFilter')?.addEventListener('change', (e) => { filterStatus = e.target.value; draw(); });
            container.querySelector('#exportCsvBtn')?.addEventListener('click', exportCSV);

            container.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const action = btn.dataset.action;
                const id = btn.dataset.id;

                if (action === 'view') {
                    const inq = inquiries.find(i => i.id === id);
                    if (inq) openDetail(inq, () => { inquiries = AdminStore.getInquiries(); draw(); });
                } else if (action === 'promote') {
                    const inq = inquiries.find(i => i.id === id);
                    if (inq) {
                        AdminStore.addRFQ({
                            company: inq.company,
                            contact: inq.name,
                            email: inq.email,
                            category: inq.subject,
                            description: inq.message,
                            linkedInquiryId: inq.id
                        });
                        toast('Promoted to RFQ!', 'success');
                    }
                } else if (action === 'delete') {
                    if (confirm('Delete this inquiry?')) {
                        AdminStore.deleteInquiry(id);
                        inquiries = AdminStore.getInquiries();
                        toast('Inquiry deleted', 'warning');
                        draw();
                    }
                }
            });
        }

        draw();
    }

    function openDetail(inq, onDone) {
        // Mark as read
        if (inq.status === 'new') {
            AdminStore.updateInquiry(inq.id, { status: 'read' });
            inq.status = 'read';
        }

        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modalContent');

        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">INQUIRY DETAILS</h3>
                <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="modal-body">
                <div class="flex-between mb-16">
                    <div>
                        <h3 style="color:var(--text-heading);font-family:var(--font-heading);font-size:1rem;">${escHtml(inq.name)}</h3>
                        <p class="text-muted">${escHtml(inq.email)} ${inq.company ? '| ' + escHtml(inq.company) : ''}</p>
                    </div>
                    <span class="badge badge-${inq.status}">${inq.status}</span>
                </div>
                <p class="text-muted" style="font-size:0.8rem;margin-bottom:16px;">${new Date(inq.createdAt).toLocaleString()} | Subject: ${escHtml(inq.subject)}</p>

                <div class="card" style="margin-bottom:20px;">
                    <p style="white-space:pre-wrap;line-height:1.6;">${escHtml(inq.message)}</p>
                </div>

                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-select" id="inqDetailStatus" style="max-width:200px;">
                        <option value="new" ${inq.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="read" ${inq.status === 'read' ? 'selected' : ''}>Read</option>
                        <option value="replied" ${inq.status === 'replied' ? 'selected' : ''}>Replied</option>
                        <option value="archived" ${inq.status === 'archived' ? 'selected' : ''}>Archived</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Internal Notes</label>
                    <textarea class="form-textarea" id="inqDetailNotes" rows="3" placeholder="Private notes about this inquiry...">${escHtml(inq.notes || '')}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" id="modalCancel">Close</button>
                <button class="btn btn-primary" id="modalSave">Save</button>
            </div>`;

        overlay.style.display = 'flex';

        const close = () => { overlay.style.display = 'none'; if (onDone) onDone(); };
        document.getElementById('modalClose').addEventListener('click', close);
        document.getElementById('modalCancel').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        document.getElementById('modalSave').addEventListener('click', () => {
            AdminStore.updateInquiry(inq.id, {
                status: document.getElementById('inqDetailStatus').value,
                notes: document.getElementById('inqDetailNotes').value
            });
            toast('Inquiry updated', 'success');
            close();
        });
    }

    function exportCSV() {
        const inquiries = AdminStore.getInquiries();
        if (inquiries.length === 0) { toast('No inquiries to export', 'warning'); return; }

        const headers = ['Date', 'Status', 'Name', 'Email', 'Company', 'Subject', 'Message'];
        const rows = inquiries.map(i => [
            new Date(i.createdAt).toLocaleDateString(),
            i.status,
            i.name,
            i.email,
            i.company,
            i.subject,
            i.message.replace(/"/g, '""')
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'omerta-inquiries-' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        AdminStore.auditLog('inquiry_export', 'Exported inquiries as CSV');
        toast('CSV exported!', 'success');
    }

    return { render };
})();
