/* ===================================================
   OMERTA DEFENCE — Admin RFQ Tracker
   Pipeline stages, CRUD, status transitions
   =================================================== */

const AdminRFQ = (() => {
    const STAGES = ['received', 'under-review', 'quoted', 'negotiation', 'won', 'lost'];
    const STAGE_LABELS = { received: 'Received', 'under-review': 'Under Review', quoted: 'Quoted', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' };
    const STAGE_COLORS = { received: '#3498db', 'under-review': '#f39c12', quoted: '#9b59b6', negotiation: '#e67e22', won: '#2ecc71', lost: '#e74c3c' };
    const PRIORITIES = ['low', 'medium', 'high', 'critical'];

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    function toast(msg, type) {
        if (window.AdminApp) AdminApp.toast(msg, type);
    }

    function render(container) {
        let rfqs = AdminStore.getRFQs();
        let filterStatus = 'all';

        function draw() {
            let filtered = rfqs;
            if (filterStatus !== 'all') filtered = filtered.filter(r => r.status === filterStatus);

            container.innerHTML = `
                <div class="page-header">
                    <p class="page-breadcrumb">OPERATIONS</p>
                    <h1 class="page-title">RFQ Tracker</h1>
                    <p class="page-subtitle">${rfqs.length} total RFQs</p>
                </div>

                <div class="flex-between mb-16">
                    <div class="filter-bar" style="margin-bottom:0;">
                        <select class="form-select" id="rfqStatusFilter">
                            <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>All Stages</option>
                            ${STAGES.map(s => `<option value="${s}" ${filterStatus === s ? 'selected' : ''}>${STAGE_LABELS[s]}</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm" id="addRfqBtn">+ New RFQ</button>
                </div>

                ${filtered.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">&#128203;</div>
                        <p class="empty-state-title">NO RFQs</p>
                        <p class="empty-state-text">Create a new RFQ or promote an inquiry.</p>
                    </div>
                ` : `
                    <div class="table-wrapper">
                        <table class="admin-table">
                            <thead><tr><th>Status</th><th>Priority</th><th>Company</th><th>Contact</th><th>Category</th><th>Est. Value</th><th>Date</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${filtered.map(r => `
                                    <tr>
                                        <td><span class="badge badge-${r.status}">${STAGE_LABELS[r.status] || r.status}</span></td>
                                        <td><span class="badge badge-priority-${r.priority}">${r.priority}</span></td>
                                        <td>${escHtml(r.company)}</td>
                                        <td>${escHtml(r.contact)}</td>
                                        <td>${escHtml(r.category)}</td>
                                        <td>${escHtml(r.estimatedValue)}</td>
                                        <td style="white-space:nowrap;">${new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div class="table-actions">
                                                <button class="btn-icon" data-action="view" data-id="${r.id}" title="View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                                                <button class="btn-icon" data-action="delete" data-id="${r.id}" title="Delete" style="color:var(--danger)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}`;

            container.querySelector('#rfqStatusFilter')?.addEventListener('change', (e) => { filterStatus = e.target.value; draw(); });
            container.querySelector('#addRfqBtn')?.addEventListener('click', () => openRFQModal(null, () => { rfqs = AdminStore.getRFQs(); draw(); }));

            container.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const id = btn.dataset.id;
                if (btn.dataset.action === 'view') {
                    const rfq = rfqs.find(r => r.id === id);
                    if (rfq) openRFQModal(rfq, () => { rfqs = AdminStore.getRFQs(); draw(); });
                } else if (btn.dataset.action === 'delete') {
                    if (confirm('Delete this RFQ?')) {
                        AdminStore.deleteRFQ(id);
                        rfqs = AdminStore.getRFQs();
                        toast('RFQ deleted', 'warning');
                        draw();
                    }
                }
            });
        }

        draw();
    }

    function openRFQModal(existing, onDone) {
        const isEdit = !!existing;
        const r = existing || { company: '', contact: '', email: '', category: '', description: '', estimatedValue: '', priority: 'medium', status: 'received', notes: '' };
        const catOptions = ['small-arms', 'heavy-ordnance', 'launchers', 'drones', 'cyber', 'general'];

        const modal = document.getElementById('modalContent');
        const overlay = document.getElementById('modalOverlay');

        // Status timeline for existing RFQ
        const timeline = isEdit ? `
            <div class="form-group">
                <label class="form-label">Pipeline Stage</label>
                <div class="flex-gap" style="margin-bottom:8px;">
                    ${STAGES.map(s => `
                        <span class="badge badge-${s}" style="opacity:${r.status === s ? '1' : '0.3'};cursor:pointer;" data-stage="${s}">${STAGE_LABELS[s]}</span>
                    `).join(' ')}
                </div>
            </div>` : '';

        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'RFQ DETAILS' : 'NEW RFQ'}</h3>
                <button class="modal-close" id="modalClose">&times;</button>
            </div>
            <div class="modal-body">
                ${timeline}
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Company</label><input class="form-input" id="rfqCompany" value="${escHtml(r.company)}"></div>
                    <div class="form-group"><label class="form-label">Contact Name</label><input class="form-input" id="rfqContact" value="${escHtml(r.contact)}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="rfqEmail" value="${escHtml(r.email)}"></div>
                    <div class="form-group"><label class="form-label">Product Category</label>
                        <select class="form-select" id="rfqCategory">
                            ${catOptions.map(c => `<option value="${c}" ${r.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="rfqDesc" rows="3">${escHtml(r.description)}</textarea></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Estimated Value</label><input class="form-input" id="rfqValue" value="${escHtml(r.estimatedValue)}" placeholder="e.g. $50,000"></div>
                    <div class="form-group"><label class="form-label">Priority</label>
                        <select class="form-select" id="rfqPriority">
                            ${PRIORITIES.map(p => `<option value="${p}" ${r.priority === p ? 'selected' : ''}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="rfqNotes" rows="2">${escHtml(r.notes || '')}</textarea></div>
                ${r.linkedInquiryId ? `<p class="text-muted" style="font-size:0.8rem;">Linked inquiry: ${r.linkedInquiryId}</p>` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" id="modalCancel">Cancel</button>
                <button class="btn btn-primary" id="modalSave">${isEdit ? 'Save Changes' : 'Create RFQ'}</button>
            </div>`;

        overlay.style.display = 'flex';

        // Stage badges clickable for status change
        if (isEdit) {
            modal.querySelectorAll('[data-stage]').forEach(badge => {
                badge.addEventListener('click', () => {
                    r.status = badge.dataset.stage;
                    modal.querySelectorAll('[data-stage]').forEach(b => b.style.opacity = '0.3');
                    badge.style.opacity = '1';
                });
            });
        }

        const close = () => { overlay.style.display = 'none'; };
        document.getElementById('modalClose').addEventListener('click', close);
        document.getElementById('modalCancel').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        document.getElementById('modalSave').addEventListener('click', () => {
            const data = {
                company: document.getElementById('rfqCompany').value.trim(),
                contact: document.getElementById('rfqContact').value.trim(),
                email: document.getElementById('rfqEmail').value.trim(),
                category: document.getElementById('rfqCategory').value,
                description: document.getElementById('rfqDesc').value,
                estimatedValue: document.getElementById('rfqValue').value,
                priority: document.getElementById('rfqPriority').value,
                status: r.status,
                notes: document.getElementById('rfqNotes').value
            };

            if (!data.company) { toast('Company is required', 'error'); return; }

            if (isEdit) {
                AdminStore.updateRFQ(existing.id, data);
                toast('RFQ updated', 'success');
            } else {
                AdminStore.addRFQ(data);
                toast('RFQ created', 'success');
            }

            close();
            if (onDone) onDone();
        });
    }

    return { render };
})();
