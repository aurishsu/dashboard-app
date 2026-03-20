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
    SETUP_INSTITUTIONS,
    SETUP_SAFETY_RULES,
    SETUP_STEPS,
    SPREAD_OPTIONS,
    type LocalizedText,
    type SetupAssetId,
    type SetupInstitution,
    type SetupInstitutionGroup,
    type SetupInstitutionId,
    type SetupProfileId,
    type SetupSpreadId,
    type SetupStepId,
} from '../lib/setupCatalog';
import { createDemoWorkspace } from '../lib/demoWorkspace';
import { loadSiteLanguage, saveSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';
import { buildAccountRows, buildCurrencyBreakdown, buildTypeBreakdown } from '../utils/accountMetrics';

const SETUP_DRAFT_KEY = 'harbor_ledger_setup_draft_v2';
const WELCOME_STORAGE_KEY = 'personal_ledger_welcome_seen_v2';
const ONBOARDING_STORAGE_KEY = 'personal_ledger_onboarding_v1';

type SetupDraft = {
    currentStep: SetupStepId;
    profileId: SetupProfileId | null;
    assetIds: SetupAssetId[];
    moneySpread: SetupSpreadId | null;
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
    sources: {
        eyebrow: string;
        title: string;
        body: string;
        spreadLabel: string;
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
            eyebrow: 'Part 1',
            title: '先选一个更接近你的使用方式',
            body: '这里只决定起手顺序和默认视角，不会限制你后面继续加什么。',
            visualLabel: '起手桌面',
            visualBody: '左边选的画像，会决定打开后先把哪几块放到前面。',
        },
        assets: {
            eyebrow: 'Part 2',
            title: '这一次，先把哪些资产带进来',
            body: '先把最核心的入口圈出来，扩展资产用更清楚的 Plus 标记保留。',
            core: '基础',
            plus: 'Plus',
            visualLabel: '桌面结构',
        },
        sources: {
            eyebrow: 'Part 3',
            title: '你平时把钱分散在哪些地方',
            body: '先估一下入口数量，再把最常用的机构点出来，后面导入会顺很多。',
            spreadLabel: '大概有多少个放钱入口',
            institutionsLabel: '先标记最常用的机构',
            banks: '银行',
            wallets: '钱包',
            brokers: '券商',
            visualLabel: '来源映射',
        },
        import: {
            eyebrow: 'Part 4',
            title: '把截图先放进准备区',
            body: '先把入口做顺。现在支持最多 3 张图片，后面再继续接识别。',
            uploadLabel: '拖入图片，或手动选择',
            uploadBody: '建议只保留余额、账户尾号和机构名。',
            queuedLabel: '准备中的图片',
            empty: '还没有加入图片',
            rules: '上传前请先确认这些安全规则',
            limit: '当前最多 3 张图片',
            visualLabel: '导入队列',
        },
        preview: {
            eyebrow: 'Part 5',
            title: '确认完这一步，就直接打开桌面',
            body: '我们先把结构、颜色和模块站位做对，再把真实识别接进来。',
            openHint: '这次会先带你进入一份带示例数据的桌面，方便你直接看效果。',
            visualLabel: '打开后的样子',
            plusNote: '房产和车产会先作为 Plus 扩展位保留。',
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
            eyebrow: 'Part 1',
            title: 'Pick the setup path that feels closest to you',
            body: 'This only sets the starting angle and pacing. You can still add more later.',
            visualLabel: 'Starting surface',
            visualBody: 'Your choice decides which modules surface first when the workspace opens.',
        },
        assets: {
            eyebrow: 'Part 2',
            title: 'Choose the asset types to bring in first',
            body: 'Lock in the core entry points first, then keep extended assets clearly marked with Plus.',
            core: 'Core',
            plus: 'Plus',
            visualLabel: 'Surface structure',
        },
        sources: {
            eyebrow: 'Part 3',
            title: 'Where is your money spread today',
            body: 'Estimate the number of money entry points, then mark the institutions you use most.',
            spreadLabel: 'How many places hold money for you',
            institutionsLabel: 'Most common institutions',
            banks: 'Banks',
            wallets: 'Wallets',
            brokers: 'Brokers',
            visualLabel: 'Source map',
        },
        import: {
            eyebrow: 'Part 4',
            title: 'Queue the screenshots first',
            body: 'Keep the intake silky. Right now you can stage up to three images before analysis lands.',
            uploadLabel: 'Drop images here or choose them manually',
            uploadBody: 'Try to keep only balances, last digits, and institution names.',
            queuedLabel: 'Queued images',
            empty: 'No image has been added yet',
            rules: 'Please confirm the safety rules before upload',
            limit: 'Currently up to 3 images',
            visualLabel: 'Import queue',
        },
        preview: {
            eyebrow: 'Part 5',
            title: 'Confirm this setup, then open the workspace',
            body: 'We are locking the structure and visual hierarchy first, then wiring real recognition into it.',
            openHint: 'This pass opens a seeded workspace so you can judge the visual result immediately.',
            visualLabel: 'What opens next',
            plusNote: 'Property and vehicle stay as Plus expansion slots for now.',
        },
    },
};

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

const DEMO_WORKSPACE = createDemoWorkspace();
const demoToUSD = (balance: number, currency: keyof typeof DEMO_WORKSPACE.exchangeRates | 'USD') => {
    if (currency === 'USD') return balance;
    return balance / DEMO_WORKSPACE.exchangeRates[currency];
};
const DEMO_ACCOUNT_ROWS = buildAccountRows(DEMO_WORKSPACE.accounts, demoToUSD);
const DEMO_TYPE_ROWS = buildTypeBreakdown(DEMO_WORKSPACE.accounts, demoToUSD);
const DEMO_CURRENCY_ROWS = buildCurrencyBreakdown(DEMO_WORKSPACE.accounts, demoToUSD);

function localize(text: LocalizedText, language: SiteLanguage) {
    return text[language];
}

function createDefaultDraft(): SetupDraft {
    return {
        currentStep: 'profile',
        profileId: null,
        assetIds: ['bank', 'wallet', 'broker'],
        moneySpread: 'some',
        institutions: ['cba', 'boc', 'hsbc', 'alipay', 'wechat', 'ibkr', 'moomoo'],
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
            profileId: PROFILE_OPTIONS.some(option => option.id === parsed.profileId) ? parsed.profileId! : fallback.profileId,
            assetIds: Array.isArray(parsed.assetIds)
                ? parsed.assetIds.filter((id): id is SetupAssetId => ASSET_OPTIONS.some(option => option.id === id))
                : fallback.assetIds,
            moneySpread: SPREAD_OPTIONS.some(option => option.id === parsed.moneySpread) ? parsed.moneySpread! : fallback.moneySpread,
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
        case 'sources':
            return Boolean(draft.moneySpread) && draft.institutions.length > 0;
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

function getVisibleInstitutions(assetIds: SetupAssetId[]) {
    const groups = new Set<SetupInstitutionGroup>();
    if (assetIds.includes('bank')) groups.add('bank');
    if (assetIds.includes('wallet')) groups.add('wallet');
    if (assetIds.includes('broker')) groups.add('broker');
    if (groups.size === 0) return SETUP_INSTITUTIONS;
    return SETUP_INSTITUTIONS.filter(option => groups.has(option.group));
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
    const selectedProfile = PROFILE_OPTIONS.find(option => option.id === draft.profileId) ?? PROFILE_OPTIONS[1];
    const visibleInstitutions = useMemo(() => getVisibleInstitutions(draft.assetIds), [draft.assetIds]);
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
    const groupLabels = getInstitutionGroupLabels(language);
    const hasPlusAssets = draft.assetIds.includes('property') || draft.assetIds.includes('vehicle');
    const stepReady = isStepReady(draft.currentStep, draft);

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
        loadDemoWorkspace();
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
            const visibleIds = new Set(getVisibleInstitutions(nextAssetIds).map(option => option.id));
            return {
                ...current,
                assetIds: nextAssetIds,
                institutions: current.institutions.filter(id => visibleIds.has(id)),
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
                        <div className="grid gap-3 md:grid-cols-2">
                            {PROFILE_OPTIONS.map(option => {
                                const Icon = PROFILE_ICONS[option.id];
                                const active = draft.profileId === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setDraft(current => ({ ...current, profileId: option.id }))}
                                        className={clsx(
                                            'setup-chip-lift rounded-[28px] border p-4 text-left',
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
                                        <p className="mt-4 text-lg font-black tracking-[-0.04em]">{localize(option.title, language)}</p>
                                        <p className={clsx('mt-2 text-sm leading-6', active ? 'text-white/72 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
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
                                            'setup-chip-lift rounded-[28px] border p-4 text-left',
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
                                        <p className="mt-4 text-lg font-black tracking-[-0.04em]">{localize(option.title, language)}</p>
                                        <p className={clsx('mt-2 text-sm leading-6', active ? 'text-white/72 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                            {localize(option.note, language)}
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
                        <div className="space-y-5">
                            <div>
                                <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                    {copy.sources.spreadLabel}
                                </p>
                                <div className="grid gap-3 md:grid-cols-3">
                                    {SPREAD_OPTIONS.map(option => {
                                        const active = draft.moneySpread === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setDraft(current => ({ ...current, moneySpread: option.id }))}
                                                className={clsx(
                                                    'setup-chip-lift rounded-[24px] border p-4 text-left',
                                                    active
                                                        ? 'border-slate-900 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                                                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#141b26] dark:hover:border-white/20',
                                                )}
                                            >
                                                <p className="text-base font-black tracking-[-0.03em]">{localize(option.title, language)}</p>
                                                <p className={clsx('mt-2 text-sm leading-6', active ? 'text-white/70 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                                    {localize(option.note, language)}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                    {copy.sources.institutionsLabel}
                                </p>
                                <div className="space-y-4">
                                    {(['bank', 'wallet', 'broker'] as SetupInstitutionGroup[]).map(group => (
                                        <div key={group} className="space-y-2">
                                            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 dark:text-slate-400">{groupLabels[group]}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {groupedVisibleInstitutions[group].map(option => {
                                                    const active = draft.institutions.includes(option.id);
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            onClick={() => toggleInstitution(option.id)}
                                                            className="setup-chip-lift inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold"
                                                            style={{
                                                                borderColor: active ? option.accent : undefined,
                                                                backgroundColor: active ? `${option.accent}14` : undefined,
                                                                color: active ? option.accent : undefined,
                                                            }}
                                                        >
                                                            <span className="size-2.5 rounded-full" style={{ backgroundColor: option.accent }} />
                                                            {localize(option.title, language)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'import':
                return (
                    <>
                        <StepHeader eyebrow={copy.import.eyebrow} title={copy.import.title} body={copy.import.body} />
                        <div className="space-y-4">
                            <div
                                className={clsx(
                                    'rounded-[30px] border border-dashed bg-white p-5 transition dark:bg-[#141b26]',
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
                                        <p className="text-lg font-black tracking-[-0.04em]">{copy.import.uploadLabel}</p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{copy.import.uploadBody}</p>
                                        <div className="mt-4 flex flex-wrap gap-2">
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

                            <div className="rounded-[30px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#141b26]">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{copy.import.queuedLabel}</p>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-white/6 dark:text-slate-300">
                                        {draft.uploadNames.length}/{FREE_UPLOAD_LIMIT}
                                    </span>
                                </div>
                                <div className="mt-4 flex min-h-16 flex-wrap gap-2">
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

                            <div className="rounded-[30px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#141b26]">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{copy.import.rules}</p>
                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                    {SETUP_SAFETY_RULES.map(rule => (
                                        <div key={rule.zh} className="rounded-[22px] bg-slate-50 px-4 py-4 dark:bg-[#101520]">
                                            <div className="flex items-start gap-3">
                                                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{localize(rule, language)}</p>
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

                            <div className="rounded-[30px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#141b26]">
                                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{copy.preview.openHint}</p>
                                {hasPlusAssets && (
                                    <div className="mt-4 inline-flex rounded-full bg-[#2c2015] px-4 py-2 text-sm font-semibold text-[#f0c58f] ring-1 ring-[#5b4532] dark:bg-[#372611] dark:text-[#f3d4a4] dark:ring-[#6c5235]">
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
        <div className="min-h-screen bg-[linear-gradient(180deg,#efe6d9_0%,#f7f2ea_100%)] p-3 text-slate-950 dark:bg-[linear-gradient(180deg,#0f1319_0%,#141922_100%)] dark:text-white">
            <div className="mx-auto flex min-h-[calc(100svh-1.5rem)] max-w-[1720px] flex-col overflow-hidden rounded-[34px] border border-black/6 bg-[#f7f2ea] shadow-[0_38px_120px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-[#0f141d]">
                <header className="border-b border-black/6 bg-white/92 backdrop-blur-sm dark:border-white/10 dark:bg-[#101722]/92">
                    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
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

                <div className="grid flex-1 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)]">
                    <section className="flex min-h-0 flex-col border-r border-black/6 bg-[#fbf8f3] px-6 py-6 dark:border-white/10 dark:bg-[#0f141d] lg:px-9 lg:py-8">
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

                        <div className="mt-7 flex-1 space-y-6">
                            {renderLeftStep()}
                        </div>

                        <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-5 dark:border-white/10">
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

                    <section className="relative min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(248,206,145,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(190,200,255,0.24),transparent_26%),linear-gradient(180deg,#f6efe1_0%,#f3ecde_100%)] px-6 py-6 dark:bg-[radial-gradient(circle_at_top_right,rgba(248,206,145,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(117,130,217,0.16),transparent_22%),linear-gradient(180deg,#0e131b_0%,#121925_100%)] lg:px-10 lg:py-8">
                        {draft.currentStep === 'profile' && <ProfileVisual profile={selectedProfile} language={language} copy={copy.profile} />}
                        {draft.currentStep === 'assets' && <AssetsVisual assetIds={draft.assetIds} language={language} copy={copy.assets} />}
                        {draft.currentStep === 'sources' && (
                            <SourcesVisual
                                language={language}
                                groupLabels={groupLabels}
                                selectedInstitutions={selectedInstitutions}
                                spreadId={draft.moneySpread}
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
            <h1 className="mt-4 max-w-[11ch] text-[clamp(2.8rem,4.8vw,4.9rem)] font-black leading-[0.94] tracking-[-0.08em] text-slate-950 dark:text-white">
                {title}
            </h1>
            <p className="mt-5 max-w-[44ch] text-base leading-8 text-slate-500 dark:text-slate-400">{body}</p>
        </div>
    );
}

function SummaryTile({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-[26px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#141b26]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-3 text-lg font-black tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
    );
}

function VisualShell({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex h-full flex-col rounded-[38px] border border-white/75 bg-white/72 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-white/10 dark:bg-[#121927]/84 dark:shadow-[0_36px_90px_rgba(2,6,23,0.34)] lg:p-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold tracking-[0.14em] text-slate-500 dark:border-white/10 dark:bg-[#181f2d] dark:text-slate-300">
                <Sparkles size={14} />
                {label}
            </div>
            <div className="mt-6 flex-1">{children}</div>
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
    const modules = [
        language === 'zh' ? '总资产' : 'Net worth',
        language === 'zh' ? '账户结构' : 'Structure',
        language === 'zh' ? '预算提醒' : 'Budget',
    ];

    return (
        <VisualShell label={copy.visualLabel}>
            <div className="grid h-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[34px] bg-[linear-gradient(180deg,#0f172a_0%,#101828_100%)] p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Harbor start</p>
                    <div className="mt-5 flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-[22px] bg-white/10">
                            {(() => {
                                const Icon = PROFILE_ICONS[profile.id];
                                return <Icon size={22} />;
                            })()}
                        </div>
                        <div>
                            <p className="text-3xl font-black tracking-[-0.06em]">{localize(profile.title, language)}</p>
                            <p className="mt-2 max-w-md text-sm leading-6 text-white/65">{copy.visualBody}</p>
                        </div>
                    </div>
                    <div className="mt-8 grid gap-3 md:grid-cols-3">
                        {modules.map(label => (
                            <div key={label} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                                <div className="h-2 w-16 rounded-full bg-white/70" />
                                <div className="mt-5 h-2 w-24 rounded-full bg-white/25" />
                                <p className="mt-4 text-sm font-semibold text-white/82">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col justify-between rounded-[34px] border border-slate-200 bg-[#faf6ef] p-6 dark:border-white/10 dark:bg-[#171d27]">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Focus first</p>
                        <p className="mt-4 text-[2.2rem] font-black leading-[1] tracking-[-0.08em] text-slate-950 dark:text-white">
                            {localize(profile.helper, language)}
                        </p>
                    </div>
                    <div className="mt-6 space-y-3">
                        {['bank', 'wallet', 'broker'].map(type => (
                            <div key={type} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#0f141d]">
                                <div className="flex items-center gap-3">
                                    <span className="size-2.5 rounded-full bg-slate-950 dark:bg-white" />
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {type === 'bank'
                                            ? language === 'zh' ? '先看银行卡与主账户' : 'Lead with bank balances'
                                            : type === 'wallet'
                                                ? language === 'zh' ? '再把钱包与日常支出放进来' : 'Then add daily wallets'
                                                : language === 'zh' ? '最后接投资入口' : 'Finish with broker balances'}
                                    </p>
                                </div>
                            </div>
                        ))}
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

    return (
        <VisualShell label={copy.visualLabel}>
            <div className="rounded-[36px] bg-[linear-gradient(180deg,#0f172a_0%,#0b1020_100%)] p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Module map</p>
                        <p className="mt-4 max-w-[15ch] text-[3rem] font-black leading-[0.92] tracking-[-0.08em]">
                            {language === 'zh' ? '桌面会先长出这些入口' : 'These modules open first'}
                        </p>
                    </div>
                    <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white/72">
                        {activeAssets.length} {language === 'zh' ? '块' : 'blocks'}
                    </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {activeAssets.map(option => {
                        const Icon = ASSET_ICONS[option.id];
                        const plus = option.gate === 'plus';

                        return (
                            <div key={option.id} className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-[20px] bg-white/10">
                                        <Icon size={18} />
                                    </div>
                                    <span
                                        className={clsx(
                                            'rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.16em]',
                                            plus ? 'bg-[#2c2015] text-[#f0c58f]' : 'bg-white/12 text-white/76',
                                        )}
                                    >
                                        {plus ? copy.plus : copy.core}
                                    </span>
                                </div>
                                <p className="mt-4 text-lg font-black tracking-[-0.04em]">{localize(option.title, language)}</p>
                                <p className="mt-2 text-sm leading-6 text-white/62">{localize(option.note, language)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </VisualShell>
    );
}

function SourcesVisual({
    language,
    groupLabels,
    selectedInstitutions,
    spreadId,
    visualLabel,
}: {
    language: SiteLanguage;
    groupLabels: Record<SetupInstitutionGroup, string>;
    selectedInstitutions: SetupInstitution[];
    spreadId: SetupSpreadId | null;
    visualLabel: string;
}) {
    const grouped = {
        bank: selectedInstitutions.filter(option => option.group === 'bank'),
        wallet: selectedInstitutions.filter(option => option.group === 'wallet'),
        broker: selectedInstitutions.filter(option => option.group === 'broker'),
    };
    const spreadLabel = SPREAD_OPTIONS.find(option => option.id === spreadId);

    return (
        <VisualShell label={visualLabel}>
            <div className="grid h-full gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[34px] bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Selected sources</p>
                    <p className="mt-4 text-[2.3rem] font-black leading-[0.96] tracking-[-0.08em]">
                        {spreadLabel ? localize(spreadLabel.title, language) : (language === 'zh' ? '待选择' : 'Waiting')}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/62">
                        {language === 'zh'
                            ? '先把最常用的来源圈出来，导入时就不会再从零开始。'
                            : 'Mark the most common sources first so the intake no longer starts from zero.'}
                    </p>

                    <div className="mt-8 space-y-3">
                        {selectedInstitutions.slice(0, 6).map(option => (
                            <div key={option.id} className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="size-2.5 rounded-full" style={{ backgroundColor: option.accent }} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white">{localize(option.title, language)}</p>
                                        <p className="truncate text-xs text-white/54">{localize(option.note, language)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[34px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#171d27]">
                    <div className="grid gap-3 md:grid-cols-3">
                        {(['bank', 'wallet', 'broker'] as SetupInstitutionGroup[]).map(group => (
                            <div key={group} className="rounded-[24px] bg-slate-50 p-4 dark:bg-[#0f141d]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{groupLabels[group]}</p>
                                <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-950 dark:text-white">{grouped[group].length}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {grouped[group].map(option => (
                                        <span key={option.id} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-white/10">
                                            <span className="size-2 rounded-full" style={{ backgroundColor: option.accent }} />
                                            {localize(option.title, language)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
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
    const visibleRows = selectedInstitutions.slice(0, 6);

    return (
        <VisualShell label={visualLabel}>
            <div className="grid h-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[34px] bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-6 text-white">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Queue</p>
                            <p className="mt-4 text-[2.4rem] font-black leading-[0.96] tracking-[-0.08em]">
                                {queued.length > 0 ? `${queued.length}/${FREE_UPLOAD_LIMIT}` : (language === 'zh' ? '0/3' : '0/3')}
                            </p>
                        </div>
                        <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/70">
                            {language === 'zh' ? '准备中' : 'Queued'}
                        </div>
                    </div>
                    <div className="mt-8 space-y-3">
                        {(queued.length > 0 ? queued : [
                            language === 'zh' ? '银行卡截图.jpg' : 'bank-balance.jpg',
                            language === 'zh' ? '券商持仓.png' : 'broker-balance.png',
                        ]).map(name => (
                            <div key={name} className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-[16px] bg-white/10">
                                        <FileImage size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-white">{name}</p>
                                        <p className="text-xs text-white/54">{language === 'zh' ? '等待导入确认' : 'Waiting for confirmation'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[34px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#171d27]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        {language === 'zh' ? '已选来源' : 'Selected sources'}
                    </p>
                    <div className="mt-5 space-y-3">
                        {visibleRows.map(option => (
                            <div key={option.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-[#0f141d]">
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
                    <div className="mt-6 rounded-[24px] bg-slate-50 p-4 dark:bg-[#0f141d]">
                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {language === 'zh'
                                ? '这里先把队列、机构和安全规则站稳。真正的识别结果会接在这套节奏后面。'
                                : 'The queue, institution matching, and safety rhythm land here first. Recognition follows the same path later.'}
                        </p>
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
}: {
    language: SiteLanguage;
    visualLabel: string;
    openHint: string;
    profile: (typeof PROFILE_OPTIONS)[number];
    assetIds: SetupAssetId[];
    institutions: SetupInstitution[];
    uploads: string[];
}) {
    return (
        <VisualShell label={visualLabel}>
            <div className="grid h-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[34px] bg-[linear-gradient(180deg,#0f172a_0%,#101828_100%)] p-6 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Workspace snapshot</p>
                            <p className="mt-4 text-[2.7rem] font-black leading-[0.96] tracking-[-0.08em]">
                                {formatUsd(DEMO_ACCOUNT_ROWS.reduce((sum, row) => sum + row.usdValue, 0))}
                            </p>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">{openHint}</p>
                        </div>
                        <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/72">
                            {localize(profile.title, language)}
                        </div>
                    </div>

                    <div className="mt-8 rounded-[28px] border border-white/10 bg-white/6 p-5">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-semibold text-white/72">{language === 'zh' ? '大类分布' : 'Category split'}</p>
                            <p className="text-xs font-semibold text-white/45">{language === 'zh' ? `${institutions.length} 个来源` : `${institutions.length} sources`}</p>
                        </div>
                        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/10">
                            {DEMO_TYPE_ROWS.map(row => (
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
                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            {DEMO_TYPE_ROWS.map(row => (
                                <div key={row.key} className="rounded-[20px] bg-white/8 px-4 py-4">
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
                            {DEMO_CURRENCY_ROWS.slice(0, 4).map(row => (
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
