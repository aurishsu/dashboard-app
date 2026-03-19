export type SiteLanguage = 'zh' | 'en';

const SITE_LANGUAGE_KEY = 'harbor_ledger_site_language_v1';

export function loadSiteLanguage(): SiteLanguage {
    if (typeof window === 'undefined') return 'zh';

    try {
        const saved = window.localStorage.getItem(SITE_LANGUAGE_KEY);
        if (saved === 'zh' || saved === 'en') {
            return saved;
        }
    } catch {
        // Ignore storage failures and fall back to browser language.
    }

    return window.navigator.language.toLowerCase().startsWith('en') ? 'en' : 'zh';
}

export function saveSiteLanguage(language: SiteLanguage) {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(SITE_LANGUAGE_KEY, language);
    } catch {
        // Ignore storage failures.
    }
}
