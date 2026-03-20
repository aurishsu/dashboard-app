import { useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import {
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CarFront,
    Check,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    FileImage,
    GraduationCap,
    House,
    Languages,
    Landmark,
    MoonStar,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    SunMedium,
    Upload,
    WalletCards,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/useData';
import { useTheme } from '../context/useTheme';
import {
    ASSET_OPTIONS,
    FREE_UPLOAD_LIMIT,
    PROFILE_OPTIONS,
    SETUP_REGIONS,
    SETUP_INSTITUTIONS,
    SETUP_SAFETY_RULES,
    SETUP_STEPS,
    type LocalizedText,
    type SetupAssetId,
    type SetupInstitution,
    type SetupInstitutionGroup,
    type SetupInstitutionId,
    type SetupProfileId,
    type SetupRegionId,
    type SetupStepId,
} from '../lib/setupCatalog';
import { createDemoWorkspace } from '../lib/demoWorkspace';
import { loadSiteLanguage, saveSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';
import { buildAccountRows, buildCurrencyBreakdown, buildTypeBreakdown, type AccountRow } from '../utils/accountMetrics';

const SETUP_DRAFT_KEY = 'harbor_ledger_setup_draft_v3';
const WELCOME_STORAGE_KEY = 'personal_ledger_welcome_seen_v2';
const ONBOARDING_STORAGE_KEY = 'personal_ledger_onboarding_v1';

type SetupDraft = {
    currentStep: SetupStepId;
    profileId: SetupProfileId | null;
    assetIds: SetupAssetId[];
    regionId: SetupRegionId | null;
    institutions: SetupInstitutionId[];
    uploadNames: string[];
    skippedImport: boolean;
};

type FlowCopy = {
    top: {
        draft: string;
        startOver: string;
        home: string;
        themeLabel: string;
        openWorkspace: string;
    };
    buttons: {
        back: string;
        continue: string;
        browseFiles: string;
        skip: string;
        finish: string;
    };
    profile: {
        eyebrow: string;
        title: string;
        body: string;
        visualLabel: string;
        visualBody: string;
    };
    assets: {
        eyebrow: string;
        title: string;
        body: string;
        core: string;
        plus: string;
        visualLabel: string;
    };
    region: {
        eyebrow: string;
        title: string;
        body: string;
        visualLabel: string;
    };
    sources: {
        eyebrow: string;
        title: string;
        body: string;
        institutionsLabel: string;
        banks: string;
        wallets: string;
        brokers: string;
        visualLabel: string;
    };
    import: {
        eyebrow: string;
        title: string;
        body: string;
        uploadLabel: string;
        uploadBody: string;
        queuedLabel: string;
        empty: string;
        rules: string;
        limit: string;
        visualLabel: string;
    };
    preview: {
        eyebrow: string;
        title: string;
        body: string;
        openHint: string;
        visualLabel: string;
        plusNote: string;
    };
};

const COPY: Record<SiteLanguage, FlowCopy> = {
    zh: {
        top: {
            draft: '草稿保存在当前浏览器',
            startOver: '重新来一次',
            home: '返回首页',
            themeLabel: '切换明暗主题',
            openWorkspace: '进入产品',
        },
        buttons: {
            back: '返回上一步',
            continue: '继续',
            browseFiles: '选择图片',
            skip: '先跳过',
            finish: '打开桌面',
        },
        profile: {
            eyebrow: '起手方式',
            title: '你更像哪一种',
            body: '这里只决定打开后的默认顺序，后面还能继续加资产。',
            visualLabel: '起手桌面',
            visualBody: '右边只保留一张预览，直接看打开后什么会先到前面。',
        },
        assets: {
            eyebrow: '资产类型',
            title: '这次先带哪些资产',
            body: '先把最常用的入口摆出来，扩展资产后面再接。',
            core: '基础',
            plus: 'Plus',
            visualLabel: '桌面结构',
        },
        region: {
            eyebrow: '生活地区',
            title: '你现在主要生活在哪个地区',
            body: '先把地区定下来，下一步的银行卡、钱包和券商来源才会更贴近你真的会用到的那一批。',
            visualLabel: '地区预览',
        },
        sources: {
            eyebrow: '常用来源',
            title: '先圈出你常用的机构',
            body: '地区只会影响推荐顺序，不会把其他常用机构删掉。先把你最常用的来源圈出来，后面识别会从这些入口开始。',
            institutionsLabel: '先标记最常用的机构',
            banks: '银行',
            wallets: '钱包',
            brokers: '券商',
            visualLabel: '来源映射',
        },
        import: {
            eyebrow: '导入准备',
            title: '先把截图放进来',
            body: '先把资料放好，后面识别就会从这里开始。当前最多 3 张图片。',
            uploadLabel: '拖入图片，或手动选择',
            uploadBody: '请只保留余额、尾号和机构名，其他敏感信息尽量遮住。',
            queuedLabel: '准备中的图片',
            empty: '还没有加入图片',
            rules: '上传前请先确认这些安全规则',
            limit: '当前最多 3 张图片',
            visualLabel: '导入队列',
        },
        preview: {
            eyebrow: '确认桌面',
            title: '确认后直接打开桌面',
            body: '先把结构看顺，再继续把真实识别接进来。',
            openHint: '这次会先打开一份演示桌面，方便你直接看效果。',
            visualLabel: '打开后的样子',
            plusNote: '房产和车产会留到后一步再接进去。',
        },
    },
    en: {
        top: {
            draft: 'Draft saved in this browser',
            startOver: 'Start over',
            home: 'Back home',
            themeLabel: 'Toggle light and dark theme',
            openWorkspace: 'Open workspace',
        },
        buttons: {
            back: 'Back',
            continue: 'Continue',
            browseFiles: 'Choose images',
            skip: 'Skip for now',
            finish: 'Open workspace',
        },
        profile: {
            eyebrow: 'SETUP STYLE',
            title: 'Which setup feels closest to you',
            body: 'This only sets the opening order. You can keep adding assets later.',
            visualLabel: 'Starting surface',
            visualBody: 'A single preview shows what comes forward first.',
        },
        assets: {
            eyebrow: 'ASSET TYPES',
            title: 'Choose what comes in first',
            body: 'Bring the core entry points in first. Property and vehicle can wait.',
            core: 'Core',
            plus: 'Plus',
            visualLabel: 'Surface structure',
        },
        region: {
            eyebrow: 'LIVING REGION',
            title: 'Where do you mainly live right now',
            body: 'Set the region first so the next institution list matches the cards and wallets you are more likely to use.',
            visualLabel: 'Region preview',
        },
        sources: {
            eyebrow: 'COMMON SOURCES',
            title: 'Mark the institutions you use most',
            body: 'Your region now changes the recommendation order only. It does not remove other institutions you may still use.',
            institutionsLabel: 'Most common institutions',
            banks: 'Banks',
            wallets: 'Wallets',
            brokers: 'Brokers',
            visualLabel: 'Source map',
        },
        import: {
            eyebrow: 'IMPORT PREP',
            title: 'Bring the screenshots in first',
            body: 'Place the files here first. Recognition starts from this queue, with up to three images for now.',
            uploadLabel: 'Drop images here or choose them manually',
            uploadBody: 'Keep balances, last digits, and institution names. Mask everything else when possible.',
            queuedLabel: 'Queued images',
            empty: 'No image has been added yet',
            rules: 'Please confirm the safety rules before upload',
            limit: 'Currently up to 3 images',
            visualLabel: 'Import queue',
        },
        preview: {
            eyebrow: 'WORKSPACE CHECK',
            title: 'Confirm this setup, then open the workspace',
            body: 'Check the structure first, then keep building from there.',
            openHint: 'This pass opens a seeded workspace so you can judge the visual result immediately.',
            visualLabel: 'What opens next',
            plusNote: 'Property and vehicle stay for a later pass.',
        },
    },
};

const ACTIVE_PROFILE_IDS = ['student', 'working', 'founder'] as const;
const ACTIVE_PROFILE_OPTIONS = PROFILE_OPTIONS.filter(option =>
    ACTIVE_PROFILE_IDS.includes(option.id as (typeof ACTIVE_PROFILE_IDS)[number]),
);

const PROFILE_ICONS = {
    student: GraduationCap,
    working: BriefcaseBusiness,
    founder: Sparkles,
    family: House,
    global: CircleDollarSign,
} satisfies Record<SetupProfileId, typeof GraduationCap>;

const ASSET_ICONS = {
    bank: Landmark,
    wallet: WalletCards,
    broker: Building2,
    property: House,
    vehicle: CarFront,
} satisfies Record<SetupAssetId, typeof Landmark>;

function localize(text: LocalizedText, language: SiteLanguage) {
    return text[language];
}

function createDefaultDraft(): SetupDraft {
    return {
        currentStep: 'profile',
        profileId: null,
        assetIds: ['bank', 'wallet', 'broker'],
        regionId: null,
        institutions: [],
        uploadNames: [],
        skippedImport: false,
    };
}

function loadDraft(): SetupDraft {
    if (typeof window === 'undefined') {
        return createDefaultDraft();
    }

    try {
        const raw = window.localStorage.getItem(SETUP_DRAFT_KEY);
        if (!raw) return createDefaultDraft();
        const parsed = JSON.parse(raw) as Partial<SetupDraft>;
        const fallback = createDefaultDraft();

        return {
            currentStep: SETUP_STEPS.some(step => step.id === parsed.currentStep) ? parsed.currentStep! : fallback.currentStep,
            profileId: ACTIVE_PROFILE_OPTIONS.some(option => option.id === parsed.profileId) ? parsed.profileId! : fallback.profileId,
            assetIds: Array.isArray(parsed.assetIds)
                ? parsed.assetIds.filter((id): id is SetupAssetId => ASSET_OPTIONS.some(option => option.id === id))
                : fallback.assetIds,
            regionId: SETUP_REGIONS.some(option => option.id === parsed.regionId) ? parsed.regionId! : fallback.regionId,
            institutions: Array.isArray(parsed.institutions)
                ? parsed.institutions.filter((id): id is SetupInstitutionId => SETUP_INSTITUTIONS.some(option => option.id === id))
                : fallback.institutions,
            uploadNames: Array.isArray(parsed.uploadNames) ? parsed.uploadNames.filter(Boolean).slice(0, FREE_UPLOAD_LIMIT) : fallback.uploadNames,
            skippedImport: Boolean(parsed.skippedImport),
        };
    } catch {
        return createDefaultDraft();
    }
}

function isStepReady(stepId: SetupStepId, draft: SetupDraft) {
    switch (stepId) {
        case 'profile':
            return Boolean(draft.profileId);
        case 'assets':
            return draft.assetIds.length > 0;
        case 'region':
            return Boolean(draft.regionId);
        case 'sources':
            return draft.institutions.length > 0;
        case 'import':
            return draft.uploadNames.length > 0 || draft.skippedImport;
        case 'preview':
            return true;
        default:
            return false;
    }
}

function getHighestUnlockedIndex(draft: SetupDraft) {
    let highest = 0;
    for (let index = 0; index < SETUP_STEPS.length - 1; index += 1) {
        if (!isStepReady(SETUP_STEPS[index].id, draft)) break;
        highest = index + 1;
    }
    return Math.max(highest, SETUP_STEPS.findIndex(step => step.id === draft.currentStep));
}

function getVisibleInstitutions(regionId: SetupRegionId | null, assetIds: SetupAssetId[]) {
    const groups = new Set<SetupInstitutionGroup>();
    if (assetIds.includes('bank')) groups.add('bank');
    if (assetIds.includes('wallet')) groups.add('wallet');
    if (assetIds.includes('broker')) groups.add('broker');
    if (groups.size === 0) return [];
    return SETUP_INSTITUTIONS.filter(option => groups.has(option.group)).sort((left, right) => {
        const leftPriority = regionId && left.regions.includes(regionId) ? 0 : 1;
        const rightPriority = regionId && right.regions.includes(regionId) ? 0 : 1;
        if (leftPriority !== rightPriority) return leftPriority - rightPriority;
        return left.title.en.localeCompare(right.title.en);
    });
}

function getRecommendedInstitutions(regionId: SetupRegionId | null, assetIds: SetupAssetId[]) {
    if (!regionId) return [];
    const visible = getVisibleInstitutions(regionId, assetIds);
    return [
        ...visible.filter(option => option.group === 'bank').slice(0, 3),
        ...visible.filter(option => option.group === 'wallet').slice(0, 2),
        ...visible.filter(option => option.group === 'broker').slice(0, 2),
    ].map(option => option.id);
}

function getInstitutionGroupLabels(language: SiteLanguage) {
    return {
        bank: COPY[language].sources.banks,
        wallet: COPY[language].sources.wallets,
        broker: COPY[language].sources.brokers,
    } satisfies Record<SetupInstitutionGroup, string>;
}

function formatUsd(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function SetupFlow() {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const { loadDemoWorkspace } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [language, setLanguage] = useState<SiteLanguage>(() => loadSiteLanguage());
    const [draft, setDraft] = useState<SetupDraft>(() => loadDraft());
    const [dragActive, setDragActive] = useState(false);

    const copy = COPY[language];
    const currentStepIndex = SETUP_STEPS.findIndex(step => step.id === draft.currentStep);
    const highestUnlockedIndex = getHighestUnlockedIndex(draft);
    const selectedProfile = ACTIVE_PROFILE_OPTIONS.find(option => option.id === draft.profileId) ?? ACTIVE_PROFILE_OPTIONS[1];
    const selectedRegion = SETUP_REGIONS.find(option => option.id === draft.regionId) ?? null;
    const visibleInstitutions = useMemo(() => getVisibleInstitutions(draft.regionId, draft.assetIds), [draft.regionId, draft.assetIds]);
    const selectedInstitutions = useMemo(
        () => SETUP_INSTITUTIONS.filter(option => draft.institutions.includes(option.id)),
        [draft.institutions],
    );
    const groupedVisibleInstitutions = useMemo(
        () => ({
            bank: visibleInstitutions.filter(option => option.group === 'bank'),
            wallet: visibleInstitutions.filter(option => option.group === 'wallet'),
            broker: visibleInstitutions.filter(option => option.group === 'broker'),
        }),
        [visibleInstitutions],
    );
    const recommendedInstitutionIds = useMemo(
        () => new Set(getRecommendedInstitutions(draft.regionId, draft.assetIds)),
        [draft.regionId, draft.assetIds],
    );
    const groupLabels = getInstitutionGroupLabels(language);
    const hasPlusAssets = draft.assetIds.includes('property') || draft.assetIds.includes('vehicle');
    const stepReady = isStepReady(draft.currentStep, draft);
    const previewWorkspace = useMemo(
        () =>
            createDemoWorkspace({
                profileId: draft.profileId,
                regionId: draft.regionId,
                assetIds: draft.assetIds,
                institutions: draft.institutions,
            }),
        [draft.profileId, draft.regionId, draft.assetIds, draft.institutions],
    );
    const previewToUSD = useMemo(
        () => (balance: number, currency: keyof typeof previewWorkspace.exchangeRates | 'USD') => {
            if (currency === 'USD') return balance;
            return balance / previewWorkspace.exchangeRates[currency];
        },
        [previewWorkspace],
    );
    const previewAccountRows = useMemo(() => buildAccountRows(previewWorkspace.accounts, previewToUSD), [previewWorkspace.accounts, previewToUSD]);
    const previewTypeRows = useMemo(() => buildTypeBreakdown(previewWorkspace.accounts, previewToUSD), [previewWorkspace.accounts, previewToUSD]);
    const previewCurrencyRows = useMemo(() => buildCurrencyBreakdown(previewWorkspace.accounts, previewToUSD), [previewWorkspace.accounts, previewToUSD]);

    useEffect(() => {
        saveSiteLanguage(language);
    }, [language]);

    useEffect(() => {
        window.localStorage.setItem(SETUP_DRAFT_KEY, JSON.stringify(draft));
    }, [draft]);

    useEffect(() => {
        window.localStorage.setItem(WELCOME_STORAGE_KEY, '1');
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ active: false, completed: true, step: 0 }));
    }, []);

    const jumpToStep = (stepId: SetupStepId) => {
        const targetIndex = SETUP_STEPS.findIndex(step => step.id === stepId);
        if (targetIndex <= highestUnlockedIndex) {
            setDraft(current => ({ ...current, currentStep: stepId }));
        }
    };

    const goBack = () => {
        if (currentStepIndex <= 0) {
            navigate('/');
            return;
        }
        setDraft(current => ({ ...current, currentStep: SETUP_STEPS[currentStepIndex - 1].id }));
    };

    const openWorkspace = () => {
        loadDemoWorkspace({
            profileId: draft.profileId,
            regionId: draft.regionId,
            assetIds: draft.assetIds,
            institutions: draft.institutions,
        });
        window.localStorage.removeItem(SETUP_DRAFT_KEY);
        navigate('/dashboard');
    };

    const goNext = () => {
        if (draft.currentStep === 'preview') {
            openWorkspace();
            return;
        }

        if (draft.currentStep === 'import' && draft.uploadNames.length === 0) {
            setDraft(current => ({ ...current, skippedImport: true, currentStep: 'preview' }));
            return;
        }

        if (!stepReady) return;
        const nextStep = SETUP_STEPS[currentStepIndex + 1];
        if (!nextStep) return;
        setDraft(current => ({ ...current, currentStep: nextStep.id }));
    };

    const resetFlow = () => {
        const next = createDefaultDraft();
        setDraft(next);
        window.localStorage.setItem(SETUP_DRAFT_KEY, JSON.stringify(next));
    };

    const toggleAsset = (assetId: SetupAssetId) => {
        setDraft(current => {
            const nextAssetIds = current.assetIds.includes(assetId)
                ? current.assetIds.filter(id => id !== assetId)
                : [...current.assetIds, assetId];
            const visibleIds = new Set(getVisibleInstitutions(current.regionId, nextAssetIds).map(option => option.id));
            const retained = current.institutions.filter(id => visibleIds.has(id));
            return {
                ...current,
                assetIds: nextAssetIds,
                institutions: retained.length > 0 ? retained : getRecommendedInstitutions(current.regionId, nextAssetIds),
            };
        });
    };

    const selectRegion = (regionId: SetupRegionId) => {
        setDraft(current => {
            const visibleIds = new Set(getVisibleInstitutions(regionId, current.assetIds).map(option => option.id));
            const retained = current.institutions.filter(id => visibleIds.has(id));
            return {
                ...current,
                regionId,
                institutions: retained.length > 0 ? retained : getRecommendedInstitutions(regionId, current.assetIds),
            };
        });
    };

    const toggleInstitution = (institutionId: SetupInstitutionId) => {
        setDraft(current => ({
            ...current,
            institutions: current.institutions.includes(institutionId)
                ? current.institutions.filter(id => id !== institutionId)
                : [...current.institutions, institutionId],
        }));
    };

    const queueNames = (names: string[]) => {
        const cleaned = names.map(name => name.trim()).filter(Boolean);
        if (cleaned.length === 0) return;
        setDraft(current => ({
            ...current,
            uploadNames: Array.from(new Set([...current.uploadNames, ...cleaned])).slice(0, FREE_UPLOAD_LIMIT),
            skippedImport: false,
        }));
    };

    const handleFileSelection = (files: FileList | null) => {
        if (!files) return;
        queueNames(Array.from(files).map(file => file.name));
    };

    const renderLeftStep = () => {
        switch (draft.currentStep) {
            case 'profile':
                return (
                    <>
                        <StepHeader eyebrow={copy.profile.eyebrow} title={copy.profile.title} body={copy.profile.body} />
                        <div className="grid gap-3">
                            {ACTIVE_PROFILE_OPTIONS.map(option => {
                                const Icon = PROFILE_ICONS[option.id];
                                const active = draft.profileId === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setDraft(current => ({ ...current, profileId: option.id }))}
                                        className={clsx(
                                            'setup-chip-lift rounded-[24px] border p-3.5 text-left',
                                            active
                                                ? 'border-slate-900 bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-white dark:bg-white dark:text-slate-950'
                                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#141b26] dark:hover:border-white/20',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className={clsx('flex size-11 items-center justify-center rounded-2xl', active ? 'bg-white/12 dark:bg-slate-950/8' : 'bg-slate-100 dark:bg-white/6')}>
                                                <Icon size={18} />
                                            </div>
                                            {active && <Check size={18} className="mt-1 shrink-0" />}
                                        </div>
                                        <p className="mt-3 text-[15px] font-extrabold tracking-[0.01em]">{localize(option.title, language)}</p>
                                        <p className={clsx('mt-1.5 text-[13px] leading-5', active ? 'text-white/72 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                            {localize(option.note, language)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                );
            case 'assets':
                return (
                    <>
                        <StepHeader eyebrow={copy.assets.eyebrow} title={copy.assets.title} body={copy.assets.body} />
                        <div className="grid gap-3 md:grid-cols-2">
                            {ASSET_OPTIONS.map(option => {
                                const Icon = ASSET_ICONS[option.id];
                                const active = draft.assetIds.includes(option.id);
                                const plus = option.gate === 'plus';

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => toggleAsset(option.id)}
                                        className={clsx(
                                            'setup-chip-lift rounded-[24px] border p-3.5 text-left',
                                            active
                                                ? 'border-slate-900 bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-white dark:bg-white dark:text-slate-950'
                                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#141b26] dark:hover:border-white/20',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className={clsx('flex size-11 items-center justify-center rounded-2xl', active ? 'bg-white/12 dark:bg-slate-950/8' : 'bg-slate-100 dark:bg-white/6')}>
                                                <Icon size={18} />
                                            </div>
                                            <span
                                                className={clsx(
                                                    'rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.14em]',
                                                    plus
                                                        ? 'bg-[#2c2015] text-[#f0c58f] ring-1 ring-[#5b4532] dark:bg-[#372611] dark:text-[#f3d4a4] dark:ring-[#6c5235]'
                                                        : active
                                                            ? 'bg-white/12 text-white dark:bg-slate-950/8 dark:text-slate-950'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-white/6 dark:text-slate-300',
                                                )}
                                            >
                                                {plus ? copy.assets.plus : copy.assets.core}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-[15px] font-extrabold tracking-[0.01em]">{localize(option.title, language)}</p>
                                        <p className={clsx('mt-1.5 text-[13px] leading-5', active ? 'text-white/72 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                            {localize(option.note, language)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                );
            case 'region':
                return (
                    <>
                        <StepHeader eyebrow={copy.region.eyebrow} title={copy.region.title} body={copy.region.body} />
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {SETUP_REGIONS.map(option => {
                                const active = draft.regionId === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => selectRegion(option.id)}
                                        className={clsx(
                                            'setup-chip-lift rounded-[24px] border p-3.5 text-left',
                                            active
                                                ? 'border-slate-900 bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-white dark:bg-white dark:text-slate-950'
                                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#141b26] dark:hover:border-white/20',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className={clsx('flex size-11 items-center justify-center rounded-2xl', active ? 'bg-white/12 dark:bg-slate-950/8' : 'bg-slate-100 dark:bg-white/6')}>
                                                <Languages size={18} />
                                            </div>
                                            {active && <Check size={18} className="mt-1 shrink-0" />}
                                        </div>
                                        <p className="mt-3 text-[15px] font-extrabold tracking-[0.012em]">{localize(option.title, language)}</p>
                                        <p className={clsx('mt-1.5 text-[13px] leading-5', active ? 'text-white/72 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                            {localize(option.note, language)}
                                        </p>
                                        <p className={clsx('mt-3 text-[12px] leading-5', active ? 'text-white/55 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500')}>
                                            {localize(option.helper, language)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                );
            case 'sources':
                return (
                    <>
                        <StepHeader eyebrow={copy.sources.eyebrow} title={copy.sources.title} body={copy.sources.body} />
                        <div className="space-y-3">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                {copy.sources.institutionsLabel}
                            </p>
                            {selectedRegion && (
                                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-[#141b26] dark:text-slate-300">
                                    {language === 'zh'
                                        ? `当前地区：${localize(selectedRegion.title, language)}。这里只调整推荐顺序，不会隐藏其他常用机构。`
                                        : `Current region: ${localize(selectedRegion.title, language)}. This only changes recommendation priority and keeps the rest available.`}
                                </div>
                            )}
                            <div className="space-y-3">
                                {(['bank', 'wallet', 'broker'] as SetupInstitutionGroup[]).map(group => (
                                    <div key={group} className="space-y-2">
                                        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 dark:text-slate-400">{groupLabels[group]}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {groupedVisibleInstitutions[group].map(option => {
                                                const active = draft.institutions.includes(option.id);
                                                const recommended = recommendedInstitutionIds.has(option.id);
                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => toggleInstitution(option.id)}
                                                        className="setup-chip-lift inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.01em]"
                                                        style={{
                                                            borderColor: active ? option.accent : recommended ? `${option.accent}55` : undefined,
                                                            backgroundColor: active ? `${option.accent}14` : recommended ? `${option.accent}0b` : undefined,
                                                            color: active ? option.accent : undefined,
                                                        }}
                                                    >
                                                        <span className="size-2.5 rounded-full" style={{ backgroundColor: option.accent }} />
                                                        {localize(option.title, language)}
                                                        {recommended && !active ? (
                                                            <span
                                                                className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.12em]"
                                                                style={{ backgroundColor: `${option.accent}14`, color: option.accent }}
                                                            >
                                                                {language === 'zh' ? '优先' : 'PRIORITY'}
                                                            </span>
                                                        ) : null}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                );
            case 'import':
                return (
                    <>
                        <StepHeader eyebrow={copy.import.eyebrow} title={copy.import.title} body={copy.import.body} />
                        <div className="space-y-3.5">
                            <div
                                className={clsx(
                                    'rounded-[28px] border border-dashed bg-white p-4 transition dark:bg-[#141b26]',
                                    dragActive ? 'border-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:border-white' : 'border-slate-300 dark:border-white/15',
                                )}
                                onDragOver={event => {
                                    event.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={event => {
                                    event.preventDefault();
                                    setDragActive(false);
                                    queueNames(Array.from(event.dataTransfer.files).map(file => file.name));
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/6">
                                        <Upload size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[15px] font-extrabold tracking-[0.01em]">{copy.import.uploadLabel}</p>
                                        <p className="mt-1.5 text-[13px] leading-5 text-slate-500 dark:text-slate-400">{copy.import.uploadBody}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                                            >
                                                <FileImage size={15} />
                                                {copy.buttons.browseFiles}
                                            </button>
                                            <span className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
                                                {copy.import.limit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={event => handleFileSelection(event.target.files)}
                                />
                            </div>

                            <div className="rounded-[28px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#141b26]">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{copy.import.queuedLabel}</p>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-white/6 dark:text-slate-300">
                                        {draft.uploadNames.length}/{FREE_UPLOAD_LIMIT}
                                    </span>
                                </div>
                                <div className="mt-3 flex min-h-14 flex-wrap gap-2">
                                    {draft.uploadNames.length > 0 ? draft.uploadNames.map(name => (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => setDraft(current => ({ ...current, uploadNames: current.uploadNames.filter(item => item !== name) }))}
                                            className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300"
                                        >
                                            <FileImage size={14} />
                                            <span className="truncate">{name}</span>
                                        </button>
                                    )) : (
                                        <p className="text-sm text-slate-400 dark:text-slate-500">{copy.import.empty}</p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#141b26]">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{copy.import.rules}</p>
                                <div className="mt-3 grid gap-2.5">
                                    {SETUP_SAFETY_RULES.map(rule => (
                                        <div key={rule.zh} className="rounded-[20px] bg-slate-50 px-4 py-3 dark:bg-[#101520]">
                                            <div className="flex items-start gap-3">
                                                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                                <p className="text-[13px] leading-5 text-slate-600 dark:text-slate-300">{localize(rule, language)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'preview':
                return (
                    <>
                        <StepHeader eyebrow={copy.preview.eyebrow} title={copy.preview.title} body={copy.preview.body} />
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                <SummaryTile
                                    label={language === 'zh' ? '起手画像' : 'Profile'}
                                    value={localize(selectedProfile.title, language)}
                                    note={localize(selectedProfile.note, language)}
                                />
                                <SummaryTile
                                    label={language === 'zh' ? '资产类型' : 'Asset types'}
                                    value={`${draft.assetIds.length}`}
                                    note={draft.assetIds.map(id => localize(ASSET_OPTIONS.find(option => option.id === id)?.title ?? ASSET_OPTIONS[0].title, language)).join(' / ')}
                                />
                                <SummaryTile
                                    label={language === 'zh' ? '导入图片' : 'Queued images'}
                                    value={`${draft.uploadNames.length}`}
                                    note={draft.uploadNames.length > 0 ? draft.uploadNames.join(' / ') : copy.import.empty}
                                />
                            </div>

                            <div className="rounded-[30px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#141b26]">
                                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{copy.preview.openHint}</p>
                                {hasPlusAssets && (
                                    <div className="mt-3 inline-flex rounded-full bg-[#2c2015] px-4 py-2 text-sm font-semibold text-[#f0c58f] ring-1 ring-[#5b4532] dark:bg-[#372611] dark:text-[#f3d4a4] dark:ring-[#6c5235]">
                                        {copy.preview.plusNote}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,#efe6d9_0%,#f7f2ea_100%)] p-3 text-slate-950 dark:bg-[linear-gradient(180deg,#0f1319_0%,#141922_100%)] dark:text-white">
            <div className="mx-auto flex h-[calc(100dvh-1.5rem)] max-w-[1720px] flex-col overflow-hidden rounded-[34px] border border-black/6 bg-[#f7f2ea] shadow-[0_38px_120px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-[#0f141d]">
                <header className="border-b border-black/6 bg-white/92 backdrop-blur-sm dark:border-white/10 dark:bg-[#101722]/92">
                    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="size-3 rounded-full bg-[#ff5f57]" />
                                <span className="size-3 rounded-full bg-[#febc2e]" />
                                <span className="size-3 rounded-full bg-[#28c840]" />
                            </div>
                            <div className="hidden items-center gap-3 rounded-full border border-black/8 bg-white px-4 py-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#171d27] sm:flex">
                                <div className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                    <Landmark size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold tracking-[-0.03em]">Harbor Ledger</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{copy.top.draft}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="order-3 flex w-full items-center justify-center gap-2 overflow-x-auto px-1 pb-1 lg:order-none lg:w-auto">
                            {SETUP_STEPS.map((step, index) => {
                                const active = step.id === draft.currentStep;
                                const completed = index < currentStepIndex && isStepReady(step.id, draft);
                                const locked = index > highestUnlockedIndex;

                                return (
                                    <div key={step.id} className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={locked}
                                            onClick={() => jumpToStep(step.id)}
                                            className={clsx(
                                                'whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-semibold tracking-[0.16em] transition',
                                                active && 'bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.14)] dark:bg-white dark:text-slate-950',
                                                completed && !active && 'bg-slate-100 text-slate-800 dark:bg-white/8 dark:text-slate-200',
                                                locked && 'cursor-not-allowed text-slate-300 dark:text-slate-600',
                                                !active && !completed && !locked && 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                                            )}
                                        >
                                            {localize(step.label, language)}
                                        </button>
                                        {index < SETUP_STEPS.length - 1 && <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />}
                                    </div>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-[#171d27]">
                                <button
                                    type="button"
                                    onClick={() => setLanguage('zh')}
                                    className={clsx(
                                        'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition',
                                        language === 'zh' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400',
                                    )}
                                >
                                    <Languages size={14} />
                                    中文
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLanguage('en')}
                                    className={clsx(
                                        'rounded-full px-3 py-2 text-xs font-medium transition',
                                        language === 'en' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400',
                                    )}
                                >
                                    EN
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="inline-flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:bg-[#171d27] dark:text-slate-300 dark:hover:text-white"
                                aria-label={copy.top.themeLabel}
                                title={copy.top.themeLabel}
                            >
                                {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
                            </button>
                            <button
                                type="button"
                                onClick={openWorkspace}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition hover:translate-y-[-1px] dark:bg-white dark:text-slate-950"
                            >
                                {copy.top.openWorkspace}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)]">
                    <section className="flex min-h-0 flex-col overflow-hidden border-r border-black/6 bg-[#fbf8f3] px-6 py-3 tracking-[0.01em] dark:border-white/10 dark:bg-[#0f141d] lg:px-7 lg:py-3">
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={goBack}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                <ChevronLeft size={16} />
                                {currentStepIndex <= 0 ? copy.top.home : copy.buttons.back}
                            </button>
                            <button
                                type="button"
                                onClick={resetFlow}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:border-white/10 dark:bg-[#171d27] dark:text-slate-300"
                            >
                                <RefreshCcw size={15} />
                                {copy.top.startOver}
                            </button>
                        </div>

                        <div className="mt-3 min-h-0 flex-1 overflow-hidden">
                            {renderLeftStep()}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-3 dark:border-white/10">
                            <button
                                type="button"
                                onClick={goBack}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:bg-[#171d27] dark:text-slate-300 dark:hover:text-white"
                            >
                                <ChevronLeft size={16} />
                                {copy.buttons.back}
                            </button>
                            <div className="flex items-center gap-3">
                                {draft.currentStep === 'import' && draft.uploadNames.length === 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setDraft(current => ({ ...current, skippedImport: true, currentStep: 'preview' }))}
                                        className="text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    >
                                        {copy.buttons.skip}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={!stepReady && draft.currentStep !== 'import'}
                                    className={clsx(
                                        'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition',
                                        (!stepReady && draft.currentStep !== 'import')
                                            ? 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-slate-600'
                                            : 'bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] hover:translate-y-[-1px] dark:bg-white dark:text-slate-950',
                                    )}
                                >
                                    {draft.currentStep === 'preview' ? copy.buttons.finish : copy.buttons.continue}
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="relative min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(248,206,145,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(190,200,255,0.24),transparent_26%),linear-gradient(180deg,#f6efe1_0%,#f3ecde_100%)] px-5 py-3 tracking-[0.01em] dark:bg-[radial-gradient(circle_at_top_right,rgba(248,206,145,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(117,130,217,0.16),transparent_22%),linear-gradient(180deg,#0e131b_0%,#121925_100%)] lg:px-6 lg:py-3">
                        {draft.currentStep === 'profile' && <ProfileVisual profile={selectedProfile} language={language} copy={copy.profile} />}
                        {draft.currentStep === 'assets' && <AssetsVisual assetIds={draft.assetIds} language={language} copy={copy.assets} />}
                        {draft.currentStep === 'region' && (
                            <RegionVisual
                                language={language}
                                visualLabel={copy.region.visualLabel}
                                region={selectedRegion}
                                institutions={visibleInstitutions}
                            />
                        )}
                        {draft.currentStep === 'sources' && (
                            <SourcesVisual
                                language={language}
                                groupLabels={groupLabels}
                                selectedInstitutions={selectedInstitutions}
                                visualLabel={copy.sources.visualLabel}
                            />
                        )}
                        {draft.currentStep === 'import' && (
                            <ImportVisual
                                language={language}
                                queued={draft.uploadNames}
                                selectedInstitutions={selectedInstitutions}
                                visualLabel={copy.import.visualLabel}
                            />
                        )}
                        {draft.currentStep === 'preview' && (
                            <PreviewVisual
                                language={language}
                                visualLabel={copy.preview.visualLabel}
                                openHint={copy.preview.openHint}
                                profile={selectedProfile}
                                assetIds={draft.assetIds}
                                institutions={selectedInstitutions}
                                uploads={draft.uploadNames}
                                accountRows={previewAccountRows}
                                typeRows={previewTypeRows}
                                currencyRows={previewCurrencyRows}
                            />
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function StepHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
    return (
        <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{eyebrow}</p>
            <h1 className="mt-4 max-w-[14ch] text-[clamp(1.28rem,1.62vw,1.95rem)] font-extrabold leading-[1.08] tracking-[0.018em] text-slate-950 dark:text-white">
                {title}
            </h1>
            <p className="mt-3 max-w-[44ch] text-[13.5px] leading-6 tracking-[0.022em] text-slate-500 dark:text-slate-400">{body}</p>
        </div>
    );
}

function SummaryTile({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[26px] border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-[#141b26]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-2.5 text-lg font-black tracking-[0.002em] text-slate-950 dark:text-white">{value}</p>
            <p className="mt-1.5 text-[13px] leading-5 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function CompactVisualStat({
    label,
    value,
    note,
    inverse = false,
}: {
    label: string;
    value: string;
    note: string;
    inverse?: boolean;
}) {
    return (
        <div
            className={clsx(
                'rounded-[24px] px-4 py-4',
                inverse
                    ? 'border border-white/10 bg-white/6 text-white'
                    : 'border border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-[#171d27] dark:text-white',
            )}
        >
            <p className={clsx('text-[11px] font-semibold uppercase tracking-[0.16em]', inverse ? 'text-white/45' : 'text-slate-400 dark:text-slate-500')}>
                {label}
            </p>
            <p className={clsx('mt-3 text-[1.75rem] font-black leading-none tracking-[-0.04em]', inverse ? 'text-white' : 'text-slate-950 dark:text-white')}>
                {value}
            </p>
            <p className={clsx('mt-2 text-[13px] leading-5', inverse ? 'text-white/62' : 'text-slate-500 dark:text-slate-400')}>{note}</p>
        </div>
    );
}

function VisualShell({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[38px] border border-white/75 bg-white/72 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-white/10 dark:bg-[#121927]/84 dark:shadow-[0_36px_90px_rgba(2,6,23,0.34)] lg:p-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold tracking-[0.14em] text-slate-500 dark:border-white/10 dark:bg-[#181f2d] dark:text-slate-300">
                <Sparkles size={14} />
                {label}
            </div>
            <div className="mt-4 flex-1 min-h-0">{children}</div>
        </div>
    );
}

function ProfileVisual({
    profile,
    language,
    copy,
}: {
    profile: (typeof PROFILE_OPTIONS)[number];
    language: SiteLanguage;
    copy: FlowCopy['profile'];
}) {
    const modules = profile.id === 'student'
        ? [
            language === 'zh' ? '总资产' : 'Net worth',
            language === 'zh' ? '币种分布' : 'Currency',
            language === 'zh' ? '生活预算' : 'Budget',
        ]
        : profile.id === 'working'
            ? [
                language === 'zh' ? '总资产' : 'Net worth',
                language === 'zh' ? '账户结构' : 'Structure',
                language === 'zh' ? '月度提醒' : 'Monthly guide',
            ]
            : [
                language === 'zh' ? '总资产' : 'Net worth',
                language === 'zh' ? '账户集中度' : 'Concentration',
                language === 'zh' ? '现金安全线' : 'Runway',
            ];
    const profileFocus = profile.id === 'student'
        ? (language === 'zh' ? '先把多币种和日常支出放到同一张桌面。' : 'Bring mixed currencies and daily spending onto one surface first.')
        : profile.id === 'working'
            ? (language === 'zh' ? '先看工资、储蓄和投资是不是排得够顺。' : 'Lead with salary, savings, and investing on one calmer surface.')
            : (language === 'zh' ? '先把大账户和高频入口抓出来，少来回切。' : 'Bring large balances and high-frequency entry points forward first.');
    const orderedSteps = profile.id === 'student'
        ? [
            language === 'zh' ? '先看银行卡和主账户' : 'Start with bank balances',
            language === 'zh' ? '再看钱包和生活预算' : 'Then bring in wallets',
            language === 'zh' ? '最后接券商入口' : 'Finish with brokers',
        ]
        : profile.id === 'working'
            ? [
                language === 'zh' ? '先看工资和储蓄' : 'Start with salary and savings',
                language === 'zh' ? '再看投资账户' : 'Then bring in brokers',
                language === 'zh' ? '最后补钱包入口' : 'Finish with wallets',
            ]
            : [
                language === 'zh' ? '先看大额账户' : 'Start with the largest accounts',
                language === 'zh' ? '再看高频入口' : 'Then bring in high-frequency surfaces',
                language === 'zh' ? '最后补预算提醒' : 'Finish with budget prompts',
            ];

    return (
        <VisualShell label={copy.visualLabel}>
            <div className="flex h-full min-h-0 flex-col">
                <div className="grid h-full min-h-0 gap-4 rounded-[34px] bg-[linear-gradient(180deg,#0f172a_0%,#101828_100%)] p-5 text-white">
                    <div className="flex items-start gap-4">
                        <div className="flex size-14 items-center justify-center rounded-[22px] bg-white/10">
                            {(() => {
                                const Icon = PROFILE_ICONS[profile.id];
                                return <Icon size={22} />;
                            })()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                                {language === 'zh' ? '打开后的默认重心' : 'Opening focus'}
                            </p>
                            <p className="mt-3 text-[1.48rem] font-extrabold leading-[1.1] tracking-[0.01em]">
                                {localize(profile.helper, language)}
                            </p>
                            <p className="mt-3 max-w-xl text-sm leading-6 tracking-[0.01em] text-white/65">{copy.visualBody}</p>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        {modules.map(label => (
                            <div key={label} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                                <div className="h-2 w-16 rounded-full bg-white/72" />
                                <div className="mt-5 h-2 w-24 rounded-full bg-white/20" />
                                <p className="mt-4 text-sm font-semibold text-white/82">{label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1.08fr_0.92fr]">
                        <div className="rounded-[26px] border border-white/10 bg-white/6 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                                {language === 'zh' ? '打开后的顺序' : 'Opening order'}
                            </p>
                            <div className="mt-4 space-y-3">
                                {orderedSteps.map((step, index) => (
                                    <div key={step} className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/10 px-4 py-3">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/82">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm font-semibold text-white/78">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <CompactVisualStat
                            label={language === 'zh' ? '这一步影响' : 'What changes'}
                            value={language === 'zh' ? '更顺手' : 'More direct'}
                            note={profileFocus}
                            inverse
                        />
                    </div>
                </div>
            </div>
        </VisualShell>
    );
}

function AssetsVisual({
    assetIds,
    language,
    copy,
}: {
    assetIds: SetupAssetId[];
    language: SiteLanguage;
    copy: FlowCopy['assets'];
}) {
    const activeAssets = ASSET_OPTIONS.filter(option => assetIds.includes(option.id));
    const coreAssets = activeAssets.filter(option => option.gate === 'core');
    const plusAssets = activeAssets.filter(option => option.gate === 'plus');

    return (
        <VisualShell label={copy.visualLabel}>
            <div className="grid h-full min-h-0 gap-4">
                <div className="rounded-[36px] bg-[linear-gradient(180deg,#0f172a_0%,#0b1020_100%)] p-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                                {language === 'zh' ? '桌面预览' : 'Surface preview'}
                            </p>
                            <p className="mt-4 max-w-[14ch] text-[2rem] font-black leading-[1.02] tracking-[0.01em]">
                                {language === 'zh' ? '这次会先把这些区域摆上桌面' : 'These surfaces come onto the workspace first'}
                            </p>
                        </div>
                        <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white/72">
                            {activeAssets.length} {language === 'zh' ? '项' : 'items'}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        {coreAssets.map((option, index) => {
                            const Icon = ASSET_ICONS[option.id];
                            return (
                                <div key={option.id} className="rounded-[28px] border border-white/10 bg-white/6 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-[20px] bg-white/10">
                                            <Icon size={18} />
                                        </div>
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
                                            0{index + 1}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm font-semibold tracking-[0.08em] text-white/84">
                                        {language === 'zh' ? `入口模块 ${index + 1}` : `Entry module ${index + 1}`}
                                    </p>
                                    <div className="mt-4 space-y-2">
                                        <div className="h-2 w-16 rounded-full bg-white/80" />
                                        <div className="h-2 w-24 rounded-full bg-white/20" />
                                        <div className="h-2 w-20 rounded-full bg-white/20" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <CompactVisualStat
                            label={language === 'zh' ? '基础模块' : 'Core modules'}
                            value={`${coreAssets.length}`}
                            note={language === 'zh' ? '这次会直接打开' : 'Shown in this pass'}
                            inverse
                        />
                        <CompactVisualStat
                            label={language === 'zh' ? '后一步再接' : 'Later add-ons'}
                            value={`${plusAssets.length}`}
                            note={language === 'zh' ? '扩展资产先留位置' : 'Reserved for a later pass'}
                            inverse
                        />
                    </div>
                </div>
            </div>
        </VisualShell>
    );
}

function RegionVisual({
    language,
    visualLabel,
    region,
    institutions,
}: {
    language: SiteLanguage;
    visualLabel: string;
    region: (typeof SETUP_REGIONS)[number] | null;
    institutions: SetupInstitution[];
}) {
    const grouped = {
        bank: institutions.filter(option => option.group === 'bank'),
        wallet: institutions.filter(option => option.group === 'wallet'),
        broker: institutions.filter(option => option.group === 'broker'),
    };

    return (
        <VisualShell label={visualLabel}>
            <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[0.96fr_1.04fr]">
                <div className="rounded-[34px] bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                        {language === 'zh' ? '地区入口' : 'Region lane'}
                    </p>
                    <p className="mt-4 text-[2rem] font-black leading-[1.02] tracking-[-0.02em]">
                        {region ? localize(region.title, language) : language === 'zh' ? '先选生活地区' : 'Choose a living region first'}
                    </p>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">
                        {region
                            ? localize(region.note, language)
                            : language === 'zh'
                                ? '地区会先决定后面更常见的银行卡、钱包和券商来源。'
                                : 'The region sets which banks, wallets, and brokers show up next.'}
                    </p>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        {([
                            { key: 'bank', label: language === 'zh' ? '银行卡' : 'Banks', value: grouped.bank.length },
                            { key: 'wallet', label: language === 'zh' ? '钱包' : 'Wallets', value: grouped.wallet.length },
                            { key: 'broker', label: language === 'zh' ? '券商' : 'Brokers', value: grouped.broker.length },
                        ] as const).map(item => (
                            <div key={item.key} className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">{item.label}</p>
                                <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[34px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#171d27]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        {language === 'zh' ? '下一步会出现的机构' : 'What appears next'}
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {institutions.slice(0, 8).map(option => (
                            <div key={option.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/10 dark:bg-[#0f141d]">
                                <div className="flex items-center gap-3">
                                    <span className="size-2.5 rounded-full" style={{ backgroundColor: option.accent }} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{localize(option.title, language)}</p>
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{localize(option.note, language)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-[#0f141d]">
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {region
                                ? localize(region.helper, language)
                                : language === 'zh'
                                    ? '先选地区后，后面的机构选择才会真的跟着变化。'
                                    : 'Choose a region first so the institution list can actually change.'}
                        </p>
                    </div>
                </div>
            </div>
        </VisualShell>
    );
}

function SourcesVisual({
    language,
    groupLabels,
    selectedInstitutions,
    visualLabel,
}: {
    language: SiteLanguage;
    groupLabels: Record<SetupInstitutionGroup, string>;
    selectedInstitutions: SetupInstitution[];
    visualLabel: string;
}) {
    const grouped = {
        bank: selectedInstitutions.filter(option => option.group === 'bank'),
        wallet: selectedInstitutions.filter(option => option.group === 'wallet'),
        broker: selectedInstitutions.filter(option => option.group === 'broker'),
    };

    return (
        <VisualShell label={visualLabel}>
            <div className="grid h-full min-h-0 gap-4">
                <div className="rounded-[34px] bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                                {language === 'zh' ? '已选来源' : 'Selected sources'}
                            </p>
                            <p className="mt-4 text-[1.92rem] font-black leading-[1.04] tracking-[0.01em]">
                                {language === 'zh' ? '先把机构识别的起点定下来' : 'Set the starting point for institution matching'}
                            </p>
                            <p className="mt-3 max-w-2xl text-sm leading-6 tracking-[0.015em] text-white/62">
                                {language === 'zh'
                                    ? '你现在选的这些机构，会成为上传截图时最先匹配的来源。'
                                    : 'These selections become the first institutions we try to match once screenshots arrive.'}
                            </p>
                        </div>
                        <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white/72">
                            {selectedInstitutions.length} {language === 'zh' ? '个来源' : 'sources'}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
                        <div className="grid gap-3 md:grid-cols-2">
                            {selectedInstitutions.map(option => (
                                <div key={option.id} className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="size-2.5 rounded-full" style={{ backgroundColor: option.accent }} />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-white">{localize(option.title, language)}</p>
                                            <p className="truncate text-xs text-white/48">{localize(option.note, language)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-3">
                            {(['bank', 'wallet', 'broker'] as SetupInstitutionGroup[]).map(group => (
                                <div key={group} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">{groupLabels[group]}</p>
                                            <p className="mt-3 text-3xl font-black tracking-[-0.02em] text-white">{grouped[group].length}</p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-[13px] leading-5 text-white/60">
                                        {grouped[group].length > 0
                                            ? grouped[group]
                                                .slice(0, 2)
                                                .map(option => localize(option.title, language))
                                                .join(' / ')
                                            : language === 'zh'
                                                ? '这类来源这次先不带进来。'
                                                : 'This source type is skipped in this pass.'}
                                    </p>
                                </div>
                            ))}
                            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">
                                    {language === 'zh' ? '导入时会怎么用' : 'How this helps later'}
                                </p>
                                <p className="mt-3 text-[13px] leading-5 text-white/62">
                                    {language === 'zh'
                                        ? '上传截图后，会先按这里的机构名和品牌色去贴近匹配。'
                                        : 'When screenshots arrive, matching starts from the institution names and brand colours shown here.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </VisualShell>
    );
}

function ImportVisual({
    language,
    queued,
    selectedInstitutions,
    visualLabel,
}: {
    language: SiteLanguage;
    queued: string[];
    selectedInstitutions: SetupInstitution[];
    visualLabel: string;
}) {
    return (
        <VisualShell label={visualLabel}>
            <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[0.96fr_1.04fr]">
                <div className="rounded-[34px] bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-5 text-white">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                                {language === 'zh' ? '导入队列' : 'Import queue'}
                            </p>
                            <p className="mt-4 text-[2.15rem] font-black leading-[1] tracking-[-0.035em]">
                                {queued.length > 0 ? `${queued.length}/${FREE_UPLOAD_LIMIT}` : '0/3'}
                            </p>
                        </div>
                        <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/70">
                            {language === 'zh' ? '准备中' : 'Queued'}
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {(queued.length > 0 ? queued : [
                            language === 'zh' ? '银行卡截图.jpg' : 'bank-balance.jpg',
                        ]).map(name => (
                            <div key={name} className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-[16px] bg-white/10">
                                        <FileImage size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white">{name}</p>
                                        <p className="text-xs text-white/54">{language === 'zh' ? '等待识别' : 'Waiting for analysis'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-[24px] border border-white/10 bg-white/6 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                            {language === 'zh' ? '准备顺序' : 'Next in line'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {selectedInstitutions.map(option => (
                                <span key={option.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/72">
                                    <span className="size-2 rounded-full" style={{ backgroundColor: option.accent }} />
                                    {localize(option.title, language)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[34px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#171d27]">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                {language === 'zh' ? '识别前预览' : 'Pre-check'}
                            </p>
                            <p className="mt-3 text-[1.58rem] font-black leading-[1.1] tracking-[-0.02em] text-slate-950 dark:text-white">
                                {language === 'zh' ? '右边先准备好机构映射' : 'The mapped institutions are ready first'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {selectedInstitutions.map(option => (
                            <div key={option.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/10 dark:bg-[#0f141d]">
                                <div className="flex items-center gap-3">
                                    <span className="size-2.5 rounded-full" style={{ backgroundColor: option.accent }} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{localize(option.title, language)}</p>
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{localize(option.note, language)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </VisualShell>
    );
}

function PreviewVisual({
    language,
    visualLabel,
    openHint,
    profile,
    assetIds,
    institutions,
    uploads,
    accountRows,
    typeRows,
    currencyRows,
}: {
    language: SiteLanguage;
    visualLabel: string;
    openHint: string;
    profile: (typeof PROFILE_OPTIONS)[number];
    assetIds: SetupAssetId[];
    institutions: SetupInstitution[];
    uploads: string[];
    accountRows: AccountRow[];
    typeRows: ReturnType<typeof buildTypeBreakdown>;
    currencyRows: ReturnType<typeof buildCurrencyBreakdown>;
}) {
    const workspaceTotal = accountRows.reduce((sum, row) => sum + row.usdValue, 0);

    return (
        <VisualShell label={visualLabel}>
            <div className="grid h-full gap-4 lg:grid-cols-[1.04fr_0.96fr]">
                <div className="rounded-[34px] bg-[linear-gradient(180deg,#0f172a_0%,#101828_100%)] p-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                                {language === 'zh' ? '桌面快照' : 'Workspace snapshot'}
                            </p>
                            <p className="mt-4 text-[2.2rem] font-black leading-[1] tracking-[-0.04em]">
                                {formatUsd(workspaceTotal)}
                            </p>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">{openHint}</p>
                        </div>
                        <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/72">
                            {localize(profile.title, language)}
                        </div>
                    </div>

                    <div className="mt-5 rounded-[28px] border border-white/10 bg-white/6 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-semibold text-white/72">{language === 'zh' ? '大类分布' : 'Category split'}</p>
                            <p className="text-xs font-semibold text-white/45">{language === 'zh' ? `${institutions.length} 个来源` : `${institutions.length} sources`}</p>
                        </div>
                        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/10">
                            {typeRows.map(row => (
                                <div
                                    key={row.key}
                                    className="h-full first:rounded-l-full last:rounded-r-full"
                                    style={{
                                        width: `${row.share}%`,
                                        background: row.key === 'bank' ? '#f5f5f5' : row.key === 'wallet' ? '#9ca3af' : '#475569',
                                    }}
                                />
                            ))}
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {typeRows.map(row => (
                                <div key={row.key} className="rounded-[20px] bg-white/8 px-4 py-3.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">{row.label}</p>
                                    <p className="mt-3 text-2xl font-black tracking-[-0.06em] text-white">{row.share.toFixed(1)}%</p>
                                    <p className="mt-1 text-xs text-white/54">{formatUsd(row.usdValue)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="rounded-[30px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#171d27]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                            {language === 'zh' ? '主币种' : 'Top currencies'}
                        </p>
                        <div className="mt-4 space-y-3">
                            {currencyRows.slice(0, 4).map(row => (
                                <div key={row.key} className="rounded-[22px] bg-slate-50 px-4 py-4 dark:bg-[#0f141d]">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-lg font-black tracking-[-0.04em] text-slate-950 dark:text-white">{row.label}</p>
                                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{row.share.toFixed(1)}%</p>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/8">
                                        <div className="h-full rounded-full bg-slate-950 dark:bg-white" style={{ width: `${row.share}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#171d27]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                            {language === 'zh' ? '这次会一起带进去' : 'Included in this pass'}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {assetIds.map(id => (
                                <span key={id} className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold dark:border-white/10">
                                    {localize(ASSET_OPTIONS.find(option => option.id === id)?.title ?? ASSET_OPTIONS[0].title, language)}
                                </span>
                            ))}
                        </div>
                        <div className="mt-5 rounded-[24px] bg-slate-50 p-4 dark:bg-[#0f141d]">
                            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                                {language === 'zh'
                                    ? `当前已标记 ${institutions.length} 个常用来源，准备中的图片 ${uploads.length} 张。`
                                    : `${institutions.length} common sources are marked, with ${uploads.length} images queued right now.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </VisualShell>
    );
}
