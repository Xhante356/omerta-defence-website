/* ===================================================
   OMERTA DEFENCE — Admin Settings
   SEO, Branding, Data Management (Import/Export/Clear)
   =================================================== */

const AdminSettings = (() => {
    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    function toast(msg, type) {
        if (window.AdminApp) AdminApp.toast(msg, type);
    }

    function render(container) {
        const seo = AdminStore.getSEO();
        const branding = AdminStore.getBranding();
        const aiSettings = AdminStore.getAISettings ? AdminStore.getAISettings() : {};
        const usage = AdminStore.getStorageUsage();
        const usageKB = (usage / 1024).toFixed(1);
        const maxKB = 5120; // ~5MB localStorage limit
        const usagePct = Math.min((usage / (maxKB * 1024)) * 100, 100).toFixed(1);

        container.innerHTML = `
            <div class="page-header">
                <p class="page-breadcrumb">SYSTEM</p>
                <h1 class="page-title">Settings</h1>
            </div>

            <!-- SEO -->
            <div class="form-section">
                <div class="form-section-title">SEO Settings</div>
                <div class="form-group">
                    <label class="form-label">Page Title <span class="char-count" id="titleCount">${seo.pageTitle.length}/60</span></label>
                    <input class="form-input" id="seoTitle" value="${escHtml(seo.pageTitle)}" maxlength="60">
                </div>
                <div class="form-group">
                    <label class="form-label">Meta Description <span class="char-count" id="descCount">${seo.metaDescription.length}/160</span></label>
                    <textarea class="form-textarea" id="seoDesc" rows="3" maxlength="160">${escHtml(seo.metaDescription)}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">SERP Preview</label>
                    <div class="serp-preview" id="serpPreview">
                        <div class="serp-title" id="serpTitle">${escHtml(seo.pageTitle)}</div>
                        <div class="serp-url">omertadefence.com</div>
                        <div class="serp-desc" id="serpDesc">${escHtml(seo.metaDescription)}</div>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" id="saveSeo">Save SEO</button>
                </div>
            </div>

            <!-- Branding -->
            <div class="form-section">
                <div class="form-section-title">Branding</div>
                <div class="form-group">
                    <label class="form-label">Logo URL</label>
                    <input class="form-input" id="brandLogo" value="${escHtml(branding.logoUrl)}">
                    <img id="brandLogoPreview" class="form-image-preview-sm mt-16" src="${branding.logoUrl}" alt="Logo" style="width:80px;height:80px;border-radius:8px;">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Primary Color</label>
                        <div class="flex-gap">
                            <input type="color" id="brandPrimary" value="${branding.primaryColor}" style="width:48px;height:36px;border:none;cursor:pointer;background:none;">
                            <input class="form-input" id="brandPrimaryHex" value="${escHtml(branding.primaryColor)}" style="max-width:120px;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Accent Color</label>
                        <div class="flex-gap">
                            <input type="color" id="brandAccent" value="${branding.accentColor}" style="width:48px;height:36px;border:none;cursor:pointer;background:none;">
                            <input class="form-input" id="brandAccentHex" value="${escHtml(branding.accentColor)}" style="max-width:120px;">
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" id="saveBranding">Save Branding</button>
                </div>
            </div>

            <!-- AI Integration -->
            <div class="form-section">
                <div class="form-section-title">AI Integration (Groq)</div>
                <div class="form-group">
                    <label class="form-label">Groq API Key</label>
                    <input class="form-input" id="aiApiKey" type="password" value="${escHtml(aiSettings.groqApiKey || '')}" placeholder="gsk_...">
                    <p class="form-hint">Get your API key at <a href="https://console.groq.com" target="_blank" rel="noopener">console.groq.com</a></p>
                    <p class="form-hint" style="color:var(--danger);margin-top:8px;">Warning: API keys are stored in your browser's localStorage and sent directly to Groq. Do not use on shared or public computers.</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Model</label>
                    <select class="form-select" id="aiModel">
                        <option value="llama-3.3-70b-versatile" ${aiSettings.model === 'llama-3.3-70b-versatile' ? 'selected' : ''}>Llama 3.3 70B Versatile</option>
                        <option value="llama-3.1-8b-instant" ${aiSettings.model === 'llama-3.1-8b-instant' ? 'selected' : ''}>Llama 3.1 8B Instant</option>
                        <option value="mixtral-8x7b-32768" ${aiSettings.model === 'mixtral-8x7b-32768' ? 'selected' : ''}>Mixtral 8x7B</option>
                        <option value="gemma2-9b-it" ${aiSettings.model === 'gemma2-9b-it' ? 'selected' : ''}>Gemma 2 9B</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="aiEnabled" ${aiSettings.enabled ? 'checked' : ''} style="margin-right:8px;vertical-align:middle;">
                        Enable AI features in Page Builder
                    </label>
                </div>
                <div class="btn-group mt-16">
                    <button class="btn btn-primary" id="saveAI">Save AI Settings</button>
                    <button class="btn btn-outline" id="testAI">Test Connection</button>
                    <span id="aiTestResult" style="font-size:0.85rem;margin-left:12px;"></span>
                </div>
            </div>

            <!-- Data Management -->
            <div class="form-section">
                <div class="form-section-title">Data Management</div>

                <div class="form-group">
                    <label class="form-label">LocalStorage Usage</label>
                    <div class="storage-meter"><div class="storage-meter-fill" style="width:${usagePct}%"></div></div>
                    <p class="form-hint">${usageKB} KB used of ~5 MB (${usagePct}%)</p>
                </div>

                <div class="btn-group mt-24">
                    <button class="btn btn-outline" id="exportAllBtn">Export All (JSON)</button>
                    <label class="btn btn-outline" style="cursor:pointer;">
                        Import (JSON)
                        <input type="file" id="importFileInput" accept=".json" style="display:none;">
                    </label>
                    <button class="btn btn-danger" id="clearAllBtn">Clear All Data</button>
                </div>
            </div>`;

        bindEvents(container);
    }

    function bindEvents(container) {
        // SEO char counts + SERP preview
        const seoTitle = document.getElementById('seoTitle');
        const seoDesc = document.getElementById('seoDesc');

        seoTitle?.addEventListener('input', () => {
            document.getElementById('titleCount').textContent = seoTitle.value.length + '/60';
            document.getElementById('serpTitle').textContent = seoTitle.value;
        });
        seoDesc?.addEventListener('input', () => {
            document.getElementById('descCount').textContent = seoDesc.value.length + '/160';
            document.getElementById('serpDesc').textContent = seoDesc.value;
        });

        // Save SEO
        document.getElementById('saveSeo')?.addEventListener('click', () => {
            AdminStore.setSEO({
                pageTitle: seoTitle.value,
                metaDescription: seoDesc.value
            });
            toast('SEO settings saved!', 'success');
        });

        // Branding color sync
        const brandPrimary = document.getElementById('brandPrimary');
        const brandPrimaryHex = document.getElementById('brandPrimaryHex');
        const brandAccent = document.getElementById('brandAccent');
        const brandAccentHex = document.getElementById('brandAccentHex');

        brandPrimary?.addEventListener('input', () => { brandPrimaryHex.value = brandPrimary.value; });
        brandPrimaryHex?.addEventListener('input', () => { brandPrimary.value = brandPrimaryHex.value; });
        brandAccent?.addEventListener('input', () => { brandAccentHex.value = brandAccent.value; });
        brandAccentHex?.addEventListener('input', () => { brandAccent.value = brandAccentHex.value; });

        // Logo preview
        const brandLogo = document.getElementById('brandLogo');
        brandLogo?.addEventListener('input', () => {
            document.getElementById('brandLogoPreview').src = brandLogo.value;
        });

        // Save Branding
        document.getElementById('saveBranding')?.addEventListener('click', () => {
            AdminStore.setBranding({
                logoUrl: brandLogo.value,
                primaryColor: brandPrimary.value,
                accentColor: brandAccent.value
            });
            toast('Branding saved!', 'success');
        });

        // Save AI
        document.getElementById('saveAI')?.addEventListener('click', () => {
            const apiKey = document.getElementById('aiApiKey')?.value || '';
            if (apiKey && !apiKey.startsWith('gsk_')) {
                toast('Invalid API key format. Key must start with "gsk_"', 'error');
                return;
            }
            const settings = {
                groqApiKey: apiKey,
                model: document.getElementById('aiModel')?.value || 'llama-3.3-70b-versatile',
                enabled: document.getElementById('aiEnabled')?.checked || false
            };
            if (AdminStore.setAISettings) AdminStore.setAISettings(settings);
            toast('AI settings saved!', 'success');
        });

        // Test AI Connection
        document.getElementById('testAI')?.addEventListener('click', () => {
            const resultEl = document.getElementById('aiTestResult');
            resultEl.textContent = 'Testing...';
            resultEl.style.color = 'var(--text-muted)';

            // Save current values first
            const settings = {
                groqApiKey: document.getElementById('aiApiKey')?.value || '',
                model: document.getElementById('aiModel')?.value || 'llama-3.3-70b-versatile',
                enabled: true
            };
            if (AdminStore.setAISettings) AdminStore.setAISettings(settings);

            if (typeof AdminAI !== 'undefined' && AdminAI.testConnection) {
                AdminAI.testConnection()
                    .then(() => {
                        resultEl.textContent = 'Connection successful!';
                        resultEl.style.color = 'var(--success)';
                    })
                    .catch((err) => {
                        resultEl.textContent = 'Failed: ' + (err.message || 'Unknown error');
                        resultEl.style.color = 'var(--danger)';
                    });
            } else {
                resultEl.textContent = 'AI module not loaded';
                resultEl.style.color = 'var(--danger)';
            }
        });

        // Export
        document.getElementById('exportAllBtn')?.addEventListener('click', () => {
            const data = AdminStore.exportAll();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'omerta-defence-backup-' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            toast('Data exported!', 'success');
        });

        // Import
        document.getElementById('importFileInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // File size limit: 2MB
            const MAX_IMPORT_SIZE = 2 * 1024 * 1024;
            if (file.size > MAX_IMPORT_SIZE) {
                toast('File too large. Maximum import size is 2MB.', 'error');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (typeof data !== 'object' || Array.isArray(data)) {
                        toast('Invalid file format', 'error');
                        return;
                    }
                    // Validate: only od_ prefixed keys allowed
                    const keys = Object.keys(data);
                    const validKeys = keys.filter(k => k.startsWith('od_'));
                    const invalidKeys = keys.filter(k => !k.startsWith('od_'));
                    if (invalidKeys.length > 0) {
                        toast(`Rejected ${invalidKeys.length} invalid key(s). Only od_ keys are accepted.`, 'error');
                    }
                    if (validKeys.length === 0) {
                        toast('No valid data keys found in file', 'error');
                        return;
                    }
                    // Value type validation
                    const ALLOWED_VALUE_TYPES = ['object', 'string', 'number', 'boolean'];
                    for (let i = 0; i < validKeys.length; i++) {
                        const val = data[validKeys[i]];
                        if (val !== null && !ALLOWED_VALUE_TYPES.includes(typeof val)) {
                            toast(`Invalid value type for key "${validKeys[i]}"`, 'error');
                            return;
                        }
                    }
                    // Filter to only valid keys for import
                    const safeData = {};
                    validKeys.forEach(k => { safeData[k] = data[k]; });
                    if (confirm(`Import ${validKeys.length} data keys? This will overwrite existing data.`)) {
                        AdminStore.importAll(safeData);
                        toast('Data imported successfully!', 'success');
                        // Refresh
                        setTimeout(() => AdminRouter.forceRefresh(), 500);
                    }
                } catch {
                    toast('Failed to parse JSON file', 'error');
                }
            };
            reader.readAsText(file);
        });

        // Clear All
        document.getElementById('clearAllBtn')?.addEventListener('click', () => {
            const overlay = document.getElementById('modalOverlay');
            const modal = document.getElementById('modalContent');

            modal.innerHTML = `
                <div class="modal-header">
                    <h3 class="modal-title">CLEAR ALL DATA</h3>
                    <button class="modal-close" id="modalClose">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color:var(--danger);font-weight:600;margin-bottom:16px;">This will permanently delete all content, catalogs, inquiries, RFQs, and media. Your password will be preserved.</p>
                    <p class="mb-16">Type <strong>CONFIRM</strong> below to proceed:</p>
                    <input class="form-input" id="clearConfirmInput" placeholder="Type CONFIRM">
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="modalCancel">Cancel</button>
                    <button class="btn btn-danger" id="clearConfirmBtn" disabled>Clear Everything</button>
                </div>`;

            overlay.style.display = 'flex';

            const close = () => { overlay.style.display = 'none'; };
            document.getElementById('modalClose').addEventListener('click', close);
            document.getElementById('modalCancel').addEventListener('click', close);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

            const confirmInput = document.getElementById('clearConfirmInput');
            const confirmBtn = document.getElementById('clearConfirmBtn');

            confirmInput.addEventListener('input', () => {
                confirmBtn.disabled = confirmInput.value !== 'CONFIRM';
            });

            confirmBtn.addEventListener('click', () => {
                AdminStore.clearAll();
                toast('All data cleared', 'warning');
                close();
                setTimeout(() => AdminRouter.forceRefresh(), 500);
            });
        });
    }

    return { render };
})();
