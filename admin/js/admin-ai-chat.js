/* ===================================================
   OMERTA DEFENCE — AI Chat
   A) Chat UI  B) Site Context Engine
   C) Change Execution Engine  D) Claude Integration
   =================================================== */

const AdminAIChat = (() => {
    'use strict';

    let _messages = [];
    let _sending = false;
    let _container = null;

    // ── A) Chat UI ──

    function render(container) {
        _container = container;
        _messages = AdminStore.getChatHistory();

        container.innerHTML = `
            <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;">
                <div>
                    <p class="page-breadcrumb">AI ASSISTANT</p>
                    <h1 class="page-title">AI Chat</h1>
                </div>
                <button class="ai-clear-btn" id="aiClearChat">Clear Chat</button>
            </div>

            <div class="ai-chat-wrapper">
                <!-- Claude Premium Bar -->
                <div class="ai-claude-bar">
                    <span class="ai-claude-bar-label">
                        <span class="claude-icon">&#9899;</span>
                        Claude ile Karmasik Isleri Coz
                    </span>
                    <div style="position:relative;">
                        <button class="ai-claude-dropdown-btn" id="aiClaudeToggle">Secenekler &#9662;</button>
                        <div class="ai-claude-dropdown" id="aiClaudeDropdown">
                            <button class="ai-claude-dropdown-item" id="aiClaudeCopy">
                                <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                Panoya Kopyala
                            </button>
                            <button class="ai-claude-dropdown-item" id="aiClaudeOpen">
                                <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                Claude.ai Ac
                            </button>
                            <button class="ai-claude-dropdown-item" id="aiClaudeCLI">
                                <svg viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                                CLI Promptu Uret
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Provider Status -->
                <div class="ai-provider-bar" id="aiProviderBar"></div>

                <!-- Messages -->
                <div class="ai-messages" id="aiMessages"></div>

                <!-- Suggestions -->
                <div class="ai-suggestions" id="aiSuggestions"></div>

                <!-- Input -->
                <div class="ai-input-area">
                    <textarea class="ai-input" id="aiInput" placeholder="Mesajinizi yazin..." rows="1"></textarea>
                    <button class="ai-send-btn" id="aiSendBtn" title="Gonder">
                        <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>

                <!-- Snapshot History -->
                <div class="ai-snapshot-toggle" id="aiSnapshotToggle">
                    <span class="ai-snapshot-toggle-arrow">&#9654;</span>
                    Snapshot Gecmisi
                </div>
                <div class="ai-snapshot-list" id="aiSnapshotList"></div>
            </div>`;

        _renderProviderBar();
        _renderMessages();
        _renderSuggestions();
        _renderSnapshots();
        _bindEvents();
    }

    function _renderProviderBar() {
        const bar = document.getElementById('aiProviderBar');
        if (!bar) return;

        if (typeof AIProviderManager === 'undefined') {
            bar.innerHTML = '<span style="color:#ef4444;">AI Provider module not loaded</span>';
            return;
        }

        const statuses = AIProviderManager.getProviderStatuses();
        bar.innerHTML = statuses.map(s => `
            <span class="ai-provider-status">
                <span class="ai-provider-dot ${s.status}"></span>
                ${s.name}${s.onCooldown ? ` (${s.cooldownRemaining}s)` : ''}
            </span>
        `).join('');
    }

    function _renderMessages() {
        const el = document.getElementById('aiMessages');
        if (!el) return;

        if (_messages.length === 0) {
            el.innerHTML = `
                <div class="ai-welcome">
                    <div class="ai-welcome-icon">&#129302;</div>
                    <h3>AI Asistan</h3>
                    <p>Siteyi degistirmek icin bana talimat verin. Ornegin: "Hero basligini degistir" veya "Footer metnini guncelle".</p>
                </div>`;
            return;
        }

        el.innerHTML = _messages.map((m, i) => _renderMessage(m, i)).join('');
        el.scrollTop = el.scrollHeight;
    }

    function _renderMessage(msg, index) {
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        if (msg.role === 'system') {
            return `<div class="ai-msg ai-msg-system">${_escHtml(msg.content)}</div>`;
        }

        if (msg.role === 'user') {
            return `
                <div class="ai-msg ai-msg-user">
                    ${_escHtml(msg.content)}
                    <div class="ai-msg-time">${time}</div>
                </div>`;
        }

        // AI message
        let changeHtml = '';
        if (msg.changes && msg.changes.length > 0) {
            const items = msg.changes.map(c => {
                const desc = c.type === 'langField'
                    ? `${c.key} → ${c.lang}.${c.field}`
                    : c.type === 'sharedField'
                        ? `${c.key} → _shared.${c.field}`
                        : `${c.key} (full replace)`;
                return `<div class="ai-change-item">${_escHtml(desc)}</div>`;
            }).join('');

            const undone = msg.undone ? ' undone' : '';
            const undoLabel = msg.undone ? 'Geri Alindi' : 'Geri Al';

            changeHtml = `
                <div class="ai-change-card">
                    <div class="ai-change-card-title">Yapilan Degisiklikler</div>
                    ${items}
                    <button class="ai-undo-btn${undone}" data-msg-index="${index}" ${msg.undone ? 'disabled' : ''}>&#8617; ${undoLabel}</button>
                </div>`;
        }

        return `
            <div class="ai-msg ai-msg-ai">
                ${_escHtml(msg.content)}
                ${changeHtml}
                <div class="ai-msg-time">${msg.provider ? `via ${msg.provider} · ` : ''}${time}</div>
            </div>`;
    }

    function _renderSuggestions() {
        const el = document.getElementById('aiSuggestions');
        if (!el) return;

        if (_messages.length > 0) {
            el.innerHTML = '';
            return;
        }

        const suggestions = [
            'Hero basligini degistir',
            'Iletisim e-postasini guncelle',
            'Footer metnini degistir',
            'About basligini guncelle',
            'Siber guvenlik aciklamasini degistir'
        ];

        el.innerHTML = suggestions.map(s =>
            `<button class="ai-suggestion-pill" data-suggestion="${_escHtml(s)}">${_escHtml(s)}</button>`
        ).join('');
    }

    function _renderSnapshots() {
        const el = document.getElementById('aiSnapshotList');
        if (!el) return;

        const snapshots = AdminStore.getSnapshots();

        if (snapshots.length === 0) {
            el.innerHTML = '<div class="ai-snapshot-empty">Henuz snapshot yok</div>';
            return;
        }

        el.innerHTML = snapshots.map(s => {
            const time = new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="ai-snapshot-item">
                    <span class="ai-snapshot-label">${_escHtml(s.label)}</span>
                    <span class="ai-snapshot-time">${time}</span>
                    <button class="ai-snapshot-restore-btn" data-snap-id="${s.id}">&#8617; Geri Yukle</button>
                </div>`;
        }).join('');
    }

    function _showTyping() {
        const el = document.getElementById('aiMessages');
        if (!el) return;
        const existing = el.querySelector('.ai-typing');
        if (existing) return;
        const div = document.createElement('div');
        div.className = 'ai-typing';
        div.innerHTML = '<span class="ai-typing-dot"></span><span class="ai-typing-dot"></span><span class="ai-typing-dot"></span>';
        el.appendChild(div);
        el.scrollTop = el.scrollHeight;
    }

    function _hideTyping() {
        const el = document.getElementById('aiMessages');
        if (!el) return;
        const typing = el.querySelector('.ai-typing');
        if (typing) typing.remove();
    }

    function _bindEvents() {
        // Send
        document.getElementById('aiSendBtn')?.addEventListener('click', _handleSend);

        // Input: Enter to send, Shift+Enter for newline, auto-resize
        const input = document.getElementById('aiInput');
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                _handleSend();
            }
        });
        input?.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        // Suggestions
        document.getElementById('aiSuggestions')?.addEventListener('click', (e) => {
            const pill = e.target.closest('.ai-suggestion-pill');
            if (pill) {
                const text = pill.dataset.suggestion;
                const input = document.getElementById('aiInput');
                input.value = text;
                input.focus();
            }
        });

        // Undo buttons
        document.getElementById('aiMessages')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.ai-undo-btn');
            if (btn && !btn.disabled) {
                const idx = parseInt(btn.dataset.msgIndex);
                _handleUndo(idx);
            }
        });

        // Snapshot toggle
        document.getElementById('aiSnapshotToggle')?.addEventListener('click', () => {
            const toggle = document.getElementById('aiSnapshotToggle');
            const list = document.getElementById('aiSnapshotList');
            toggle.classList.toggle('open');
            list.classList.toggle('open');
        });

        // Snapshot restore
        document.getElementById('aiSnapshotList')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.ai-snapshot-restore-btn');
            if (btn) {
                const id = btn.dataset.snapId;
                if (confirm('Bu snapshot\'i geri yuklemek istediginize emin misiniz?')) {
                    AdminStore.restoreSnapshot(id);
                    _addMessage('system', 'Snapshot geri yuklendi.');
                    _toast('Snapshot geri yuklendi', 'success');
                    _renderSnapshots();
                }
            }
        });

        // Claude dropdown
        document.getElementById('aiClaudeToggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('aiClaudeDropdown')?.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            document.getElementById('aiClaudeDropdown')?.classList.remove('open');
        });

        // Claude actions
        document.getElementById('aiClaudeCopy')?.addEventListener('click', () => _claudeCopyToClipboard());
        document.getElementById('aiClaudeOpen')?.addEventListener('click', () => _claudeOpenBrowser());
        document.getElementById('aiClaudeCLI')?.addEventListener('click', () => _claudeShowCLI());

        // Clear chat
        document.getElementById('aiClearChat')?.addEventListener('click', () => {
            if (confirm('Tum sohbet gecmisini silmek istediginize emin misiniz?')) {
                _messages = [];
                AdminStore.clearChatHistory();
                _renderMessages();
                _renderSuggestions();
                _toast('Sohbet temizlendi', 'info');
            }
        });
    }

    // ── Send handler ──
    async function _handleSend() {
        if (_sending) return;
        const input = document.getElementById('aiInput');
        const text = input?.value?.trim();
        if (!text) return;

        input.value = '';
        input.style.height = 'auto';

        _addMessage('user', text);
        _renderMessages();
        _renderSuggestions();
        _showTyping();
        _sending = true;
        document.getElementById('aiSendBtn').disabled = true;

        try {
            const systemPrompt = buildSystemPrompt();
            const { provider, result } = await AIProviderManager.send(systemPrompt, text);

            _hideTyping();

            const aiMsg = {
                role: 'ai',
                content: result.message || 'Islem tamamlandi.',
                changes: [],
                snapshotId: null,
                provider,
                timestamp: new Date().toISOString()
            };

            if (result.changes && result.changes.length > 0 && !result.noChanges) {
                const snap = executeChanges(result.changes);
                aiMsg.changes = result.changes;
                aiMsg.snapshotId = snap.id;
            }

            _messages.push(aiMsg);
            AdminStore.saveChatHistory(_messages);
            _renderMessages();
            _renderSnapshots();
            _renderProviderBar();
        } catch (err) {
            _hideTyping();
            _addMessage('ai', `Hata: ${err.message}`);
            _renderMessages();
            _renderProviderBar();
        }

        _sending = false;
        const sendBtn = document.getElementById('aiSendBtn');
        if (sendBtn) sendBtn.disabled = false;
    }

    function _handleUndo(msgIndex) {
        const msg = _messages[msgIndex];
        if (!msg || !msg.snapshotId || msg.undone) return;

        AdminStore.restoreSnapshot(msg.snapshotId);
        msg.undone = true;
        AdminStore.saveChatHistory(_messages);
        _renderMessages();
        _renderSnapshots();
        _toast('Degisiklik geri alindi', 'success');
    }

    function _addMessage(role, content) {
        _messages.push({ role, content, timestamp: new Date().toISOString() });
        AdminStore.saveChatHistory(_messages);
    }

    // ── B) Site Context Engine ──

    function buildSiteContext() {
        const sections = [
            { key: AdminStore.KEYS.CONTENT_HERO, label: 'Hero Section' },
            { key: AdminStore.KEYS.CONTENT_ABOUT, label: 'About Section' },
            { key: AdminStore.KEYS.CONTENT_PRODUCTS, label: 'Products Section' },
            { key: AdminStore.KEYS.CONTENT_CYBER, label: 'Cyber Section' },
            { key: AdminStore.KEYS.CONTENT_CONTACT, label: 'Contact Section' },
            { key: AdminStore.KEYS.CONTENT_FOOTER, label: 'Footer' },
            { key: AdminStore.KEYS.SETTINGS_SEO, label: 'SEO Settings' },
            { key: AdminStore.KEYS.SETTINGS_BRANDING, label: 'Branding' }
        ];

        const context = {};
        sections.forEach(s => {
            const data = AdminStore.getContent(s.key);
            if (data) context[s.key] = { label: s.label, data };
        });

        return context;
    }

    function buildSystemPrompt() {
        const ctx = buildSiteContext();
        const langs = AdminStore.AVAILABLE_LANGS;

        return `You are an AI assistant for the OMERTA DEFENCE admin panel. You help manage website content.

SITE STRUCTURE:
The website uses a multi-language system (${langs.join(', ')}). Content is stored in localStorage with v2 format:
- "_v": 2
- "_shared": { fields shared across languages }
- "en": { English fields }, "tr": { Turkish fields }, "fr": { French fields }, "ar": { Arabic fields }

CURRENT SITE CONTENT:
${JSON.stringify(ctx, null, 1)}

AVAILABLE KEYS:
- od_content_hero: Hero section (preheading, title, subtitle, btn1Text, btn2Text | _shared: backgroundImage, btn1Link, btn2Link)
- od_content_about: About section (sectionLabel, title, paragraph1, paragraph2, stats | _shared: imageUrl, stats[numbers])
- od_content_products: Products overview (sectionLabel, title, subtitle)
- od_content_cyber: Cyber section (sectionLabel, title, description, ctaText, features[] | _shared: backgroundImage, ctaLink, features[icons])
- od_content_contact: Contact (heading, description | _shared: headquarters, email, phone, hours)
- od_content_footer: Footer (tagline, text, copyright)
- od_settings_seo: SEO (pageTitle, metaDescription)
- od_settings_branding: Branding (_shared: logoUrl, primaryColor, accentColor)

INSTRUCTIONS:
- Respond in Turkish.
- When the user asks to change content, return the changes in the JSON format below.
- If the user is just asking a question (not requesting a change), set noChanges to true.
- Only change what is explicitly requested. Do not modify other fields.
- For language-specific fields, change ALL languages unless the user specifies a language.

RESPONSE FORMAT (strict JSON):
{
  "message": "Yapilan islemi aciklayan Turkce mesaj",
  "changes": [
    {
      "key": "od_content_hero",
      "type": "langField",
      "lang": "en",
      "field": "title",
      "value": "NEW VALUE"
    }
  ],
  "noChanges": false
}

CHANGE TYPES:
- "langField": Change a language-specific field. Requires: key, lang, field, value
- "sharedField": Change a shared field. Requires: key, field, value
- "fullReplace": Replace entire object for a key. Requires: key, value (full object)

Return ONLY valid JSON. No markdown, no code blocks.`;
    }

    // ── C) Change Execution Engine ──

    function executeChanges(changes) {
        // Collect affected keys
        const affectedKeys = [...new Set(changes.map(c => c.key))];

        // Create snapshot before changes
        const label = changes.map(c => {
            if (c.type === 'langField') return `${c.key.replace('od_content_', '').replace('od_settings_', '')}.${c.lang}.${c.field}`;
            if (c.type === 'sharedField') return `${c.key.replace('od_content_', '').replace('od_settings_', '')}._shared.${c.field}`;
            return c.key.replace('od_content_', '').replace('od_settings_', '');
        }).join(', ');

        const snap = AdminStore.createSnapshot(label, affectedKeys);

        // Apply each change
        changes.forEach(change => {
            const data = AdminStore.getContent(change.key);
            if (!data) return;

            if (change.type === 'langField') {
                if (!data[change.lang]) data[change.lang] = {};
                _setNestedField(data[change.lang], change.field, change.value);
            } else if (change.type === 'sharedField') {
                if (!data._shared) data._shared = {};
                _setNestedField(data._shared, change.field, change.value);
            } else if (change.type === 'fullReplace') {
                AdminStore.setContent(change.key, change.value);
                return;
            }

            AdminStore.setContent(change.key, data);
        });

        AdminStore.auditLog('ai_change', `AI applied ${changes.length} change(s): ${label}`);
        return snap;
    }

    function _setNestedField(obj, fieldPath, value) {
        const parts = fieldPath.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const key = parts[i];
            // Handle array index
            const arrMatch = key.match(/^(.+)\[(\d+)\]$/);
            if (arrMatch) {
                if (!current[arrMatch[1]]) current[arrMatch[1]] = [];
                const idx = parseInt(arrMatch[2]);
                if (!current[arrMatch[1]][idx]) current[arrMatch[1]][idx] = {};
                current = current[arrMatch[1]][idx];
            } else {
                if (!current[key] || typeof current[key] !== 'object') current[key] = {};
                current = current[key];
            }
        }
        const lastKey = parts[parts.length - 1];
        const lastArr = lastKey.match(/^(.+)\[(\d+)\]$/);
        if (lastArr) {
            if (!current[lastArr[1]]) current[lastArr[1]] = [];
            current[lastArr[1]][parseInt(lastArr[2])] = value;
        } else {
            current[lastKey] = value;
        }
    }

    // ── D) Claude Integration ──

    function _buildClaudeContext() {
        const ctx = buildSiteContext();
        const history = _messages.filter(m => m.role !== 'system').slice(-20);

        let text = `=== OMERTA DEFENCE ADMIN - SITE CONTEXT ===\n\n`;
        text += `Site: OMERTA DEFENCE (Defence company website)\n`;
        text += `Languages: en, tr, fr, ar\n`;
        text += `Storage: localStorage with v2 format\n\n`;

        text += `=== CURRENT CONTENT ===\n`;
        text += JSON.stringify(ctx, null, 2);

        if (history.length > 0) {
            text += `\n\n=== RECENT CHAT HISTORY ===\n`;
            history.forEach(m => {
                const role = m.role === 'user' ? 'USER' : 'AI';
                text += `[${role}] ${m.content}\n`;
            });
        }

        text += `\n\n=== INSTRUCTIONS ===\n`;
        text += `You are helping manage the OMERTA DEFENCE website.\n`;
        text += `The user needs help with content changes or complex operations.\n`;
        text += `Provide specific instructions or code changes as needed.\n`;

        return text;
    }

    async function _claudeCopyToClipboard() {
        const text = _buildClaudeContext();
        try {
            await navigator.clipboard.writeText(text);
            _toast('Context panoya kopyalandi', 'success');
        } catch {
            _showClaudeModal('Panoya Kopyala', text);
        }
        document.getElementById('aiClaudeDropdown')?.classList.remove('open');
    }

    function _claudeOpenBrowser() {
        _claudeCopyToClipboard().then(() => {
            window.open('https://claude.ai/new', '_blank');
        });
        document.getElementById('aiClaudeDropdown')?.classList.remove('open');
    }

    function _claudeShowCLI() {
        const text = _buildClaudeContext();
        const cliPrompt = `cat << 'CONTEXT_EOF'\n${text}\nCONTEXT_EOF`;
        _showClaudeModal('CLI Promptu', cliPrompt);
        document.getElementById('aiClaudeDropdown')?.classList.remove('open');
    }

    function _showClaudeModal(title, content) {
        const existing = document.querySelector('.ai-claude-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'ai-claude-modal-overlay';
        overlay.innerHTML = `
            <div class="ai-claude-modal">
                <div class="ai-claude-modal-header">
                    <h3>${_escHtml(title)}</h3>
                    <button class="ai-claude-modal-close">&times;</button>
                </div>
                <div class="ai-claude-modal-body">
                    <textarea class="ai-claude-modal-textarea" readonly>${_escHtml(content)}</textarea>
                </div>
                <div class="ai-claude-modal-footer">
                    <button class="btn btn-outline ai-claude-modal-copy-btn">Kopyala</button>
                    <button class="btn btn-outline ai-claude-modal-close-btn">Kapat</button>
                </div>
            </div>`;

        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.querySelector('.ai-claude-modal-close').addEventListener('click', close);
        overlay.querySelector('.ai-claude-modal-close-btn').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        overlay.querySelector('.ai-claude-modal-copy-btn')?.addEventListener('click', () => {
            const ta = overlay.querySelector('.ai-claude-modal-textarea');
            ta.select();
            navigator.clipboard.writeText(ta.value).then(() => {
                _toast('Kopyalandi', 'success');
            }).catch(() => {
                document.execCommand('copy');
                _toast('Kopyalandi', 'success');
            });
        });
    }

    // ── Helpers ──

    function _escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    function _toast(msg, type) {
        if (window.AdminApp) AdminApp.toast(msg, type);
    }

    return { render };
})();
