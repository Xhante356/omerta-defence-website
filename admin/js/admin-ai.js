/* ===================================================
   OMERTA DEFENCE — Admin AI (Groq API Client)
   suggestLayout(), generateBlockContent(), testConnection()
   =================================================== */

var AdminAI = (function () {
    'use strict';

    var GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    var DEFAULT_MODEL = 'llama-3.3-70b-versatile';

    function getSettings() {
        if (typeof AdminStore !== 'undefined' && AdminStore.getAISettings) {
            return AdminStore.getAISettings();
        }
        try {
            return JSON.parse(localStorage.getItem('od_settings_ai') || '{}');
        } catch (e) { return {}; }
    }

    function isAvailable() {
        var s = getSettings();
        return !!(s.enabled && s.groqApiKey);
    }

    function getModel() {
        var s = getSettings();
        return s.model || DEFAULT_MODEL;
    }

    function getApiKey() {
        var s = getSettings();
        return s.groqApiKey || '';
    }

    // ── Core API call ──
    function callGroq(systemPrompt, userPrompt) {
        var key = getApiKey();
        if (!key) return Promise.reject(new Error('No Groq API key configured'));

        return fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + key
            },
            body: JSON.stringify({
                model: getModel(),
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
                max_tokens: 4096
            })
        })
        .then(function (res) {
            if (!res.ok) {
                return res.json().then(function (err) {
                    throw new Error(err.error && err.error.message ? err.error.message : 'API error ' + res.status);
                });
            }
            return res.json();
        })
        .then(function (data) {
            var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
            if (!content) throw new Error('Empty response from AI');
            return JSON.parse(content);
        });
    }

    // ── suggestLayout ──
    function suggestLayout(description) {
        var systemPrompt = 'You are a web page layout designer for a defence company website called OMERTA DEFENCE.\n' +
            'The website has a dark military/tactical theme with teal accents.\n\n' +
            'Given a page description, return a JSON object with:\n' +
            '- "pageTitle": { "en": "...", "tr": "...", "fr": "...", "ar": "..." }\n' +
            '- "pageSlug": "kebab-case-slug"\n' +
            '- "blocks": array of block objects\n\n' +
            'Each block has:\n' +
            '- "type": one of "hero", "text", "image", "gallery", "featuresGrid", "specsTable", "cta", "productShowcase", "spacer", "divider", "video"\n' +
            '- "data": object with "_shared" (non-translatable fields) and language keys "en", "tr", "fr", "ar" (translatable fields)\n\n' +
            'Block type schemas:\n' +
            '- hero: _shared: {backgroundImage, btnLink, fullHeight(bool), overlayOpacity(0-1)}, lang: {title, subtitle, btnText}\n' +
            '- text: _shared: {alignment("left"/"center"/"right"), maxWidth("800px")}, lang: {heading, body}\n' +
            '- image: _shared: {src(url), aspectRatio("16/9"), rounded(bool)}, lang: {caption, alt}\n' +
            '- gallery: _shared: {images:[{src,alt}], columns(2-4), gap(px)}\n' +
            '- featuresGrid: _shared: {items:[{icon(emoji)}], columns(2-4)}, lang: {heading, items:[{title,text}]}\n' +
            '- specsTable: lang: {heading, rows:[{label,value}]}\n' +
            '- cta: _shared: {btnLink, backgroundColor}, lang: {heading, subheading, btnText}\n' +
            '- productShowcase: _shared: {catalogCategory, maxItems, showFeaturedOnly(bool)}\n' +
            '- spacer: _shared: {height(px number)}\n' +
            '- divider: _shared: {style("solid"/"dashed"), width("100%"/"80%")}\n' +
            '- video: _shared: {url, aspectRatio("16/9"), autoplay(bool)}, lang: {caption}\n\n' +
            'Use professional defence/military themed content. For images use unsplash URLs.\n' +
            'Return ONLY valid JSON.';

        return callGroq(systemPrompt, 'Create a page layout for: ' + description);
    }

    // ── generateBlockContent ──
    function generateBlockContent(blockType, context, lang) {
        var systemPrompt = 'You are a content writer for a defence company called OMERTA DEFENCE.\n' +
            'Generate content for a "' + blockType + '" block on the website.\n' +
            'The language should be: ' + lang + '\n' +
            'Return a JSON object with the translatable fields for this block type.\n' +
            'For a "text" block: {"heading": "...", "body": "..."}\n' +
            'For a "hero" block: {"title": "...", "subtitle": "...", "btnText": "..."}\n' +
            'For a "cta" block: {"heading": "...", "subheading": "...", "btnText": "..."}\n' +
            'For "featuresGrid": {"heading": "...", "items": [{"title": "...", "text": "..."}]}\n' +
            'For "specsTable": {"heading": "...", "rows": [{"label": "...", "value": "..."}]}\n' +
            'Use professional, authoritative language appropriate for a defence industry website.\n' +
            'Return ONLY valid JSON.';

        var userMsg = context ? 'Context: ' + context + '\nGenerate ' + blockType + ' content.' : 'Generate ' + blockType + ' content for a defence company page.';

        return callGroq(systemPrompt, userMsg);
    }

    // ── testConnection ──
    function testConnection() {
        var key = getApiKey();
        if (!key) return Promise.reject(new Error('No API key configured'));

        return fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + key
            },
            body: JSON.stringify({
                model: getModel(),
                messages: [
                    { role: 'user', content: 'Reply with exactly: {"status":"ok"}' }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 20
            })
        })
        .then(function (res) {
            if (!res.ok) {
                return res.json().then(function (err) {
                    throw new Error(err.error && err.error.message ? err.error.message : 'API error ' + res.status);
                });
            }
            return { status: 'ok' };
        });
    }

    return {
        isAvailable: isAvailable,
        suggestLayout: suggestLayout,
        generateBlockContent: generateBlockContent,
        testConnection: testConnection
    };

})();
