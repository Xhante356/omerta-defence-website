/* ===================================================
   OMERTA DEFENCE — Admin Auth
   Login, password hashing (SHA-256), sessions, lockout
   v2: Salted hashing, constant-time compare, persistent lockout
   =================================================== */

const AdminAuth = (() => {
    const AUTH_KEY = AdminStore.KEYS.AUTH;
    const SESSION_KEY = 'od_session';
    const LOCKOUT_KEY = 'od_auth_lockout';
    const SESSION_HOURS = 4;
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_BASE_MS = 60000; // 1 minute base, doubles each lockout

    // SHA-256 via Web Crypto API
    async function sha256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Generate cryptographic salt
    function generateSalt() {
        var arr = new Uint8Array(16);
        crypto.getRandomValues(arr);
        return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Salted password hashing
    async function hashPassword(password, salt) {
        return sha256(salt + ':' + password);
    }

    // Constant-time string comparison to prevent timing attacks
    function constantTimeCompare(a, b) {
        if (a.length !== b.length) return false;
        var result = 0;
        for (var i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }

    function getAuthData() {
        return AdminStore.get(AUTH_KEY);
    }

    function isFirstTime() {
        return !getAuthData();
    }

    // Persistent lockout state (survives page refresh)
    function getLockoutState() {
        try {
            const raw = localStorage.getItem(LOCKOUT_KEY);
            if (!raw) return { failedAttempts: 0, lockoutUntil: 0 };
            return JSON.parse(raw);
        } catch {
            return { failedAttempts: 0, lockoutUntil: 0 };
        }
    }

    function setLockoutState(state) {
        try {
            localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
        } catch {}
    }

    function isLockedOut() {
        const state = getLockoutState();
        if (Date.now() < state.lockoutUntil) {
            return Math.ceil((state.lockoutUntil - Date.now()) / 1000);
        }
        return false;
    }

    async function setPassword(password) {
        const salt = generateSalt();
        const hash = await hashPassword(password, salt);
        AdminStore.set(AUTH_KEY, { passwordHash: hash, salt: salt });
        createSession();
        // Clear any lockout state on password setup
        setLockoutState({ failedAttempts: 0, lockoutUntil: 0 });
        AdminStore.auditLog('auth_setup', 'Admin password set for the first time');
        return true;
    }

    async function login(password) {
        const lockRemaining = isLockedOut();
        if (lockRemaining) {
            return { success: false, error: `Locked out. Try again in ${lockRemaining}s.` };
        }

        const auth = getAuthData();
        if (!auth) return { success: false, error: 'No password set.' };

        // Support both salted (v2) and legacy unsalted hashes
        let hash;
        if (auth.salt) {
            hash = await hashPassword(password, auth.salt);
        } else {
            hash = await sha256(password);
        }

        if (!constantTimeCompare(hash, auth.passwordHash)) {
            const state = getLockoutState();
            state.failedAttempts++;
            if (state.failedAttempts >= MAX_ATTEMPTS) {
                const lockTime = LOCKOUT_BASE_MS * Math.pow(2, Math.floor(state.failedAttempts / MAX_ATTEMPTS) - 1);
                state.lockoutUntil = Date.now() + lockTime;
                setLockoutState(state);
                return { success: false, error: `Too many attempts. Locked for ${Math.ceil(lockTime / 1000)}s.` };
            }
            setLockoutState(state);
            return { success: false, error: `Invalid password. ${MAX_ATTEMPTS - state.failedAttempts} attempts remaining.` };
        }

        // Successful login — reset lockout
        setLockoutState({ failedAttempts: 0, lockoutUntil: 0 });

        // Auto-upgrade legacy unsalted hash to salted
        if (!auth.salt) {
            const salt = generateSalt();
            const newHash = await hashPassword(password, salt);
            AdminStore.set(AUTH_KEY, { passwordHash: newHash, salt: salt });
        }

        createSession();
        AdminStore.auditLog('auth_login', 'Admin logged in');
        return { success: true };
    }

    function createSession() {
        const expiry = Date.now() + (SESSION_HOURS * 60 * 60 * 1000);
        let token;
        if (crypto.randomUUID) {
            token = crypto.randomUUID();
        } else {
            // Secure fallback using crypto.getRandomValues
            var arr = new Uint8Array(16);
            crypto.getRandomValues(arr);
            token = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, expiry }));
    }

    function isAuthenticated() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            // Always parse and compare to maintain consistent timing
            const session = raw ? JSON.parse(raw) : { token: '', expiry: 0 };
            const now = Date.now();
            const valid = session && session.token && now <= session.expiry;
            if (raw && !valid) {
                sessionStorage.removeItem(SESSION_KEY);
            }
            return !!valid;
        } catch {
            return false;
        }
    }

    function logout() {
        AdminStore.auditLog('auth_logout', 'Admin logged out');
        sessionStorage.removeItem(SESSION_KEY);
    }

    return {
        isFirstTime,
        isLockedOut,
        setPassword,
        login,
        isAuthenticated,
        logout
    };
})();
