/* ===================================================
   OMERTA DEFENCE — AI Provider Manager
   Multi-provider: Mistral → Gemini → Groq → OpenRouter (fallback)
   5-min cooldown on failed providers
   =================================================== */

const AIProviderManager = (() => {
    'use strict';

    const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

    const PROVIDERS = {
        gemini: {
            id: 'gemini',
            name: 'Google Gemini',
            url: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}',
            defaultModel: 'gemini-2.0-flash',
            models: [
                { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' }
            ],
            limit: '1000 req/day',
            keyPrefix: '',
            keyPlaceholder: 'AIzaSy...',
            consoleUrl: 'https://aistudio.google.com/apikey'
        },
        groq: {
            id: 'groq',
            name: 'Groq',
            url: 'https://api.groq.com/openai/v1/chat/completions',
            defaultModel: 'llama-3.3-70b-versatile',
            models: [
                { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
                { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
                { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
                { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
            ],
            limit: '14400 req/day',
            keyPrefix: 'gsk_',
            keyPlaceholder: 'gsk_...',
            consoleUrl: 'https://console.groq.com'
        },
        mistral: {
            id: 'mistral',
            name: 'Mistral AI',
            url: 'https://api.mistral.ai/v1/chat/completions',
            defaultModel: 'mistral-small-latest',
            models: [
                { id: 'mistral-small-latest', name: 'Mistral Small (Fast)' },
                { id: 'mistral-medium-latest', name: 'Mistral Medium' },
                { id: 'mistral-large-latest', name: 'Mistral Large (Best)' },
                { id: 'open-mistral-nemo', name: 'Mistral Nemo (Free)' }
            ],
            limit: 'Unlimited (Experiment)',
            keyPrefix: '',
            keyPlaceholder: '',
            consoleUrl: 'https://console.mistral.ai/api-keys'
        },
        openrouter: {
            id: 'openrouter',
            name: 'OpenRouter',
            url: 'https://openrouter.ai/api/v1/chat/completions',
            defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
            models: [
                { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
                { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
                { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' },
                { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)' }
            ],
            limit: '50 req/day',
            keyPrefix: 'sk-or-',
            keyPlaceholder: 'sk-or-...',
            consoleUrl: 'https://openrouter.ai/keys'
        }
    };

    const FALLBACK_ORDER = ['mistral', 'gemini', 'groq', 'openrouter'];

    // Track failed providers with cooldown
    const _failedProviders = {}; // { providerId: timestamp }

    function _getSettings() {
        const settings = AdminStore.getAISettings ? AdminStore.getAISettings() : {};
        // Backward compatibility: migrate old groqApiKey to providers format
        if (!settings.providers && settings.groqApiKey) {
            settings.providers = {
                groq: {
                    apiKey: settings.groqApiKey,
                    model: settings.model || PROVIDERS.groq.defaultModel
                }
            };
        }
        return settings;
    }

    function _getProviderConfig(providerId) {
        const settings = _getSettings();
        const providers = settings.providers || {};
        return providers[providerId] || {};
    }

    function _isOnCooldown(providerId) {
        const failedAt = _failedProviders[providerId];
        if (!failedAt) return false;
        if (Date.now() - failedAt > COOLDOWN_MS) {
            delete _failedProviders[providerId];
            return false;
        }
        return true;
    }

    function _markFailed(providerId) {
        _failedProviders[providerId] = Date.now();
    }

    function _clearCooldown(providerId) {
        delete _failedProviders[providerId];
    }

    // ── Gemini API call ──
    async function _callGemini(systemPrompt, userPrompt, config) {
        const provider = PROVIDERS.gemini;
        const model = config.model || provider.defaultModel;
        const url = provider.url.replace('{model}', model).replace('{key}', config.apiKey);

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.7,
                    maxOutputTokens: 4096
                }
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Gemini API error ${res.status}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response from Gemini');
        return JSON.parse(text);
    }

    // ── Groq API call (OpenAI-compatible) ──
    async function _callGroq(systemPrompt, userPrompt, config) {
        const provider = PROVIDERS.groq;
        const model = config.model || provider.defaultModel;

        const res = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Groq API error ${res.status}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from Groq');
        return JSON.parse(content);
    }

    // ── Mistral API call (OpenAI-compatible) ──
    async function _callMistral(systemPrompt, userPrompt, config) {
        const provider = PROVIDERS.mistral;
        const model = config.model || provider.defaultModel;

        const res = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || err.message || `Mistral API error ${res.status}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from Mistral');
        return JSON.parse(content);
    }

    // ── OpenRouter API call (OpenAI-compatible) ──
    async function _callOpenRouter(systemPrompt, userPrompt, config) {
        const provider = PROVIDERS.openrouter;
        const model = config.model || provider.defaultModel;

        const res = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'HTTP-Referer': window.location.origin || 'https://omertadefence.com',
                'X-Title': 'OMERTA DEFENCE Admin'
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `OpenRouter API error ${res.status}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from OpenRouter');
        return JSON.parse(content);
    }

    const _callers = {
        mistral: _callMistral,
        gemini: _callGemini,
        groq: _callGroq,
        openrouter: _callOpenRouter
    };

    // ── Main send with fallback ──
    async function send(systemPrompt, userPrompt) {
        const settings = _getSettings();
        const preferred = settings.preferredProvider || 'auto';
        const providers = settings.providers || {};

        // Build order
        let order;
        if (preferred !== 'auto' && providers[preferred]?.apiKey) {
            order = [preferred, ...FALLBACK_ORDER.filter(p => p !== preferred)];
        } else {
            order = [...FALLBACK_ORDER];
        }

        const errors = [];

        for (const pid of order) {
            const config = providers[pid];
            if (!config?.apiKey) continue;
            if (_isOnCooldown(pid)) {
                errors.push({ provider: pid, error: 'On cooldown' });
                continue;
            }

            try {
                const result = await _callers[pid](systemPrompt, userPrompt, config);
                _clearCooldown(pid);
                return { provider: pid, result };
            } catch (err) {
                _markFailed(pid);
                errors.push({ provider: pid, error: err.message });
                console.warn(`[AIProvider] ${pid} failed:`, err.message);
            }
        }

        throw new Error('All AI providers failed: ' + errors.map(e => `${e.provider}: ${e.error}`).join('; '));
    }

    // ── Test a specific provider ──
    async function testProvider(providerId) {
        const config = _getProviderConfig(providerId);
        if (!config?.apiKey) throw new Error('No API key configured');

        const caller = _callers[providerId];
        if (!caller) throw new Error('Unknown provider');

        await caller(
            'Reply with exactly the JSON: {"status":"ok"}',
            'Test connection',
            config
        );
        _clearCooldown(providerId);
        return { status: 'ok' };
    }

    // ── Get provider statuses ──
    function getProviderStatuses() {
        const settings = _getSettings();
        const providers = settings.providers || {};

        return FALLBACK_ORDER.map(pid => {
            const config = providers[pid] || {};
            const hasKey = !!config.apiKey;
            const onCooldown = _isOnCooldown(pid);
            let status = 'unconfigured';
            if (hasKey && !onCooldown) status = 'ready';
            else if (hasKey && onCooldown) status = 'cooldown';

            return {
                id: pid,
                name: PROVIDERS[pid].name,
                status,
                hasKey,
                onCooldown,
                cooldownRemaining: onCooldown ? Math.ceil((COOLDOWN_MS - (Date.now() - _failedProviders[pid])) / 1000) : 0
            };
        });
    }

    function getProviderInfo(providerId) {
        return PROVIDERS[providerId] || null;
    }

    function getAllProviders() {
        return PROVIDERS;
    }

    return {
        send,
        testProvider,
        getProviderStatuses,
        getProviderInfo,
        getAllProviders,
        FALLBACK_ORDER
    };
})();
