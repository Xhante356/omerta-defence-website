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

            <!-- AI Integration - Multi Provider -->
            <div class="form-section">
                <div class="form-section-title">AI Integration</div>
                <p class="form-hint" style="color:var(--danger);margin-bottom:16px;">Warning: API keys are stored in your browser's localStorage. Do not use on shared or public computers.</p>

                <!-- Preferred Provider -->
                <div class="form-group">
                    <label class="form-label">Preferred Provider</label>
                    <select class="form-select" id="aiPreferredProvider">
                        <option value="auto" ${(aiSettings.preferredProvider || 'auto') === 'auto' ? 'selected' : ''}>Auto (Gemini &rarr; Groq &rarr; OpenRouter)</option>
                        <option value="gemini" ${aiSettings.preferredProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
                        <option value="groq" ${aiSettings.preferredProvider === 'groq' ? 'selected' : ''}>Groq</option>
                        <option value="openrouter" ${aiSettings.preferredProvider === 'openrouter' ? 'selected' : ''}>OpenRouter</option>
                    </select>
                </div>

                ${_renderProviderSettings('gemini', 'Google Gemini', aiSettings)}
                ${_renderProviderSettings('groq', 'Groq', aiSettings)}
                ${_renderProviderSettings('openrouter', 'OpenRouter', aiSettings)}

                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="aiEnabled" ${aiSettings.enabled ? 'checked' : ''} style="margin-right:8px;vertical-align:middle;">
                        Enable AI features in Page Builder
                    </label>
                </div>
                <div class="btn-group mt-16">
                    <button class="btn btn-primary" id="saveAI">Save AI Settings</button>
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

    function _renderProviderSettings(providerId, label, aiSettings) {
        let providers = aiSettings.providers || {};
        // Backward compat: migrate old groqApiKey
        if (!aiSettings.providers && aiSettings.groqApiKey && providerId === 'groq') {
            providers = { groq: { apiKey: aiSettings.groqApiKey, model: aiSettings.model || '' } };
        }
        const config = providers[providerId] || {};
        let providerInfo = null;
        if (typeof AIProviderManager !== 'undefined') {
            providerInfo = AIProviderManager.getProviderInfo(providerId);
        }
        const models = providerInfo ? providerInfo.models : [];
        const placeholder = providerInfo ? providerInfo.keyPlaceholder : '';
        const consoleUrl = providerInfo ? providerInfo.consoleUrl : '#';
        const limit = providerInfo ? providerInfo.limit : '';
        const currentModel = config.model || (providerInfo ? providerInfo.defaultModel : '');

        const modelOptions = models.map(m =>
            `<option value="${m.id}" ${currentModel === m.id ? 'selected' : ''}>${m.name}</option>`
        ).join('');

        return `
            <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px;margin-bottom:12px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <strong style="color:#e0e0e0;font-size:0.9rem;">${label}</strong>
                    <span style="font-size:0.72rem;color:var(--text-muted);">${limit}</span>
                </div>
                <div class="form-group" style="margin-bottom:8px;">
                    <label class="form-label" style="font-size:0.8rem;">API Key</label>
                    <input class="form-input" id="aiKey_${providerId}" type="password" value="${escHtml(config.apiKey || '')}" placeholder="${placeholder}">
                    <p class="form-hint">Get your key at <a href="${consoleUrl}" target="_blank" rel="noopener">${consoleUrl.replace('https://', '')}</a></p>
                </div>
                <div class="form-group" style="margin-bottom:8px;">
                    <label class="form-label" style="font-size:0.8rem;">Model</label>
                    <select class="form-select" id="aiModel_${providerId}">${modelOptions}</select>
                </div>
                <div class="btn-group">
                    <button class="btn btn-outline btn-sm" id="aiTest_${providerId}">Test Connection</button>
                    <span id="aiTestResult_${providerId}" style="font-size:0.8rem;margin-left:8px;"></span>
                </div>
            </div>`;
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

        // Save AI (multi-provider)
        document.getElementById('saveAI')?.addEventListener('click', () => {
            const providerIds = ['gemini', 'groq', 'openrouter'];
            const providers = {};
            providerIds.forEach(pid => {
                providers[pid] = {
                    apiKey: document.getElementById(`aiKey_${pid}`)?.value || '',
                    model: document.getElementById(`aiModel_${pid}`)?.value || ''
                };
            });

            const settings = {
                providers,
                preferredProvider: document.getElementById('aiPreferredProvider')?.value || 'auto',
                enabled: document.getElementById('aiEnabled')?.checked || false,
                // Backward compatibility for admin-ai.js
                groqApiKey: providers.groq.apiKey,
                model: providers.groq.model
            };

            if (AdminStore.setAISettings) AdminStore.setAISettings(settings);
            toast('AI settings saved!', 'success');
        });

        // Test AI Connection (per-provider)
        ['gemini', 'groq', 'openrouter'].forEach(pid => {
            document.getElementById(`aiTest_${pid}`)?.addEventListener('click', () => {
                const resultEl = document.getElementById(`aiTestResult_${pid}`);
                resultEl.textContent = 'Testing...';
                resultEl.style.color = 'var(--text-muted)';

                // Save current values first
                _saveCurrentAISettings();

                if (typeof AIProviderManager !== 'undefined') {
                    AIProviderManager.testProvider(pid)
                        .then(() => {
                            resultEl.textContent = 'Connection successful!';
                            resultEl.style.color = 'var(--success)';
                        })
                        .catch((err) => {
                            resultEl.textContent = 'Failed: ' + (err.message || 'Unknown error');
                            resultEl.style.color = 'var(--danger)';
                        });
                } else {
                    resultEl.textContent = 'AI Provider module not loaded';
                    resultEl.style.color = 'var(--danger)';
                }
            });
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

    function _saveCurrentAISettings() {
        const providerIds = ['gemini', 'groq', 'openrouter'];
        const providers = {};
        providerIds.forEach(pid => {
            providers[pid] = {
                apiKey: document.getElementById(`aiKey_${pid}`)?.value || '',
                model: document.getElementById(`aiModel_${pid}`)?.value || ''
            };
        });
        const settings = {
            providers,
            preferredProvider: document.getElementById('aiPreferredProvider')?.value || 'auto',
            enabled: document.getElementById('aiEnabled')?.checked || false,
            groqApiKey: providers.groq.apiKey,
            model: providers.groq.model
        };
        if (AdminStore.setAISettings) AdminStore.setAISettings(settings);
    }

    return { render };
})();
