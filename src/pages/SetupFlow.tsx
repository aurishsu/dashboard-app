import { useEffect, useRef, useState, type CSSProperties } from 'react';
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
    Clock3,
    FileUp,
    GraduationCap,
    House,
    ImagePlus,
    Languages,
    Landmark,
    Layers3,
    MoonStar,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    SunMedium,
    Upload,
    WalletCards,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
import { loadSiteLanguage, saveSiteLanguage, type SiteLanguage } from '../lib/siteLanguage';

const SETUP_DRAFT_KEY = 'harbor_ledger_setup_draft_v1';
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
        openProduct: string;
    };
    buttons: {
        back: string;
        continue: string;
        skipImport: string;
        enterDashboard: string;
        browseFiles: string;
        queueLater: string;
    };
    profile: {
        eyebrow: string;
        title: string;
        body: string;
        asideTitle: string;
        asideBody: string;
        badge: string;
    };
    assets: {
        eyebrow: string;
        title: string;
        body: string;
        core: string;
        plus: string;
        asideTitle: string;
        asideBody: string;
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
        asideTitle: string;
        asideBody: string;
    };
    import: {
        eyebrow: string;
        title: string;
        body: string;
        dropTitle: string;
        dropBody: string;
        queued: string;
        rules: string;
        limit: string;
        empty: string;
        placeholderTitle: string;
        placeholderBody: string;
        badge: string;
        status: string;
        asideTitle: string;
        asideBody: string;
        trimNotice: string;
    };
    preview: {
        eyebrow: string;
        title: string;
        body: string;
        dashboardLabel: string;
        importStatus: string;
        queuedFiles: string;
        trialLabel: string;
        trialBody: string;
        plusHint: string;
        zeroState: string;
        aiPending: string;
        asideTitle: string;
        asideBody: string;
    };
};

const COPY: Record<SiteLanguage, FlowCopy> = {
    zh: {
        top: {
            draft: '草稿实时保存在浏览器里',
            startOver: '重新来一次',
            home: '返回首页',
            themeLabel: '切换明暗主题',
            openProduct: '进入产品',
        },
        buttons: {
            back: '返回上一步',
            continue: '继续',
            skipImport: '先跳过，继续预览',
            enterDashboard: '打开零值总览',
            browseFiles: '选择图片',
            queueLater: '稍后再传',
        },
        profile: {
            eyebrow: 'Part 1',
            title: '先告诉我，你现在更像哪一种使用者',
            body: '这一步只用来决定起手模板和提问顺序，不会影响你后面还能加什么资产。',
            asideTitle: '先把入口变得有针对性',
            asideBody: '我们不会一上来就让你填一大堆字段，而是先根据你的状态决定起手视角，让后面的资产归拢更顺。',
            badge: '起手画像',
        },
        assets: {
            eyebrow: 'Part 2',
            title: '你准备先放哪些资产进来',
            body: '核心爽点先不锁。银行卡、钱包和券商先免费给到；房产和车产先作为扩展位保留，试用后再放进 Plus。',
            core: '核心可先用',
            plus: '试用后转入 Plus',
            asideTitle: '先决定桌面会长成什么样',
            asideBody: '你选的资产类型，会直接影响后面的模块结构。先选范围，再让界面自己长出来。',
        },
        sources: {
            eyebrow: 'Part 3',
            title: '平时你把钱分散在哪些地方',
            body: '先选你大概有多少个放钱的地方，再点出最常用的机构。后面上传截图时，我们就能更快对上号。',
            spreadLabel: '大概有多少个放钱入口',
            institutionsLabel: '先把常用机构圈出来',
            banks: '银行',
            wallets: '钱包',
            brokers: '券商',
            asideTitle: '先把银行配色和关键词准备好',
            asideBody: '这些颜色和关键词会放进我们的本地映射里。等以后接 AI 识图时，可以先按品牌去匹配，不需要用户从零说明。',
        },
        import: {
            eyebrow: 'Part 4',
            title: '把截图先拖进准备区，我们先排好队',
            body: 'AI 识别区这一步先留空，但上传入口和安全提示先长出来。你现在可以先试 3 张图片，感受整体流程。',
            dropTitle: '拖进来，或者手动选图',
            dropBody: '建议只保留余额、账户尾号和机构名。我们先不解析，只把导入入口和节奏做好。',
            queued: '已准备好的图片',
            rules: '上传前请先看安全规则',
            limit: '试用期先给 3 张图片 + 7 天体验',
            empty: '还没有放入图片',
            placeholderTitle: 'AI Intake 会接在这里',
            placeholderBody: '下一步我们会把 OCR / Vision 和结构化确认页接到这一层。现在先把拖拽入口、限额和节奏定下来。',
            badge: 'AI 区域先留空',
            status: '状态：占位中，待接入',
            asideTitle: '先把流程做顺，再把 AI 接上',
            asideBody: '真正影响体验的不是模型名字，而是上传、排队、确认和回退是不是够顺。这里先把壳做对。',
            trimNotice: '试用版先保留前 3 张图片，多出来的会先被忽略。',
        },
        preview: {
            eyebrow: 'Part 5',
            title: '这就是导入前的零值桌面',
            body: '真正导入前，先让你确认结构、模块和节奏是不是对的。现在所有数字先归零，等 AI 接上以后再把真实余额放进去。',
            dashboardLabel: '零值 dashboard 预览',
            importStatus: 'AI 导入状态',
            queuedFiles: '准备中的图片',
            trialLabel: '试用策略',
            trialBody: '前 7 天先给体验，上传入口先开放 3 张图片，不把第一次的爽点锁进 Plus。',
            plusHint: '房产和车产会先以扩展模板的形式保留。',
            zeroState: '所有模块先以零值打开',
            aiPending: 'AI 解析区留空，下一步再接',
            asideTitle: '先把打开后的感觉做对',
            asideBody: '先让用户一打开就有“桌面已经长出来了”的感觉，再把数据放进去。这样后面的 AI 才有落点。',
        },
    },
    en: {
        top: {
            draft: 'Draft saved locally in this browser',
            startOver: 'Start over',
            home: 'Back home',
            themeLabel: 'Toggle light and dark theme',
            openProduct: 'Open product',
        },
        buttons: {
            back: 'Back',
            continue: 'Continue',
            skipImport: 'Skip for now',
            enterDashboard: 'Open zero-state dashboard',
            browseFiles: 'Choose images',
            queueLater: 'Queue later',
        },
        profile: {
            eyebrow: 'Part 1',
            title: 'Start with the kind of user you feel closest to',
            body: 'This only shapes the starting template and pacing. It does not limit what you can add later.',
            asideTitle: 'Make the first screen feel more targeted',
            asideBody: 'Instead of forcing a huge form upfront, we use your current context to decide the right starting angle for the rest of the flow.',
            badge: 'Starting profile',
        },
        assets: {
            eyebrow: 'Part 2',
            title: 'Choose the asset types you want to bring in first',
            body: 'The first wow moment stays unlocked. Banks, wallets, and brokers are available first; property and vehicle remain as extended slots after the trial.',
            core: 'Available first',
            plus: 'Extended after trial',
            asideTitle: 'Let the surface grow from the right structure',
            asideBody: 'What you choose here changes the modules we prepare next. Pick the shape first, then let the interface build around it.',
        },
        sources: {
            eyebrow: 'Part 3',
            title: 'Where is your money spread right now',
            body: 'Estimate how many places hold money for you, then tap the institutions you use most. That gives us a cleaner path into future matching.',
            spreadLabel: 'How many money entry points do you have',
            institutionsLabel: 'Mark your most common institutions',
            banks: 'Banks',
            wallets: 'Wallets',
            brokers: 'Brokers',
            asideTitle: 'Prepare colours and keywords before AI lands',
            asideBody: 'These palettes and keywords can live in our local matching table so later OCR can map to a likely institution without making the user explain everything.',
        },
        import: {
            eyebrow: 'Part 4',
            title: 'Queue the screenshots first, then let the system take over',
            body: 'The AI recognition layer stays empty for now, but the upload lane and safety guidance should already feel finished. Start with up to three images.',
            dropTitle: 'Drop images here or choose them manually',
            dropBody: 'Try to keep only balances, account endings, and institution names. We are not parsing yet, just shaping the intake flow.',
            queued: 'Queued images',
            rules: 'Safety rules before you upload',
            limit: 'Trial starts with 3 images and 7 free days',
            empty: 'No images queued yet',
            placeholderTitle: 'AI intake will connect here next',
            placeholderBody: 'OCR / vision and the confirmation layer will sit here later. Right now the focus is the intake rhythm, limits, and rollback.',
            badge: 'AI stays as a placeholder',
            status: 'Status: placeholder only',
            asideTitle: 'Get the flow right before wiring the model',
            asideBody: 'What makes this feel premium is the upload, queue, confirm, and rollback experience. The model comes after the shell feels smooth.',
            trimNotice: 'The trial keeps the first 3 images. Extra files are ignored for now.',
        },
        preview: {
            eyebrow: 'Part 5',
            title: 'This is the zero-state workspace before import',
            body: 'Before any real balance arrives, confirm the structure and pacing. Everything stays at zero now, then we let the future AI layer fill it in.',
            dashboardLabel: 'Zero-state dashboard preview',
            importStatus: 'AI intake status',
            queuedFiles: 'Queued images',
            trialLabel: 'Trial strategy',
            trialBody: 'The first 7 days stay open, and the first 3 images are included so the first wow moment is not hidden behind Plus.',
            plusHint: 'Property and vehicle stay as extended templates for now.',
            zeroState: 'Every module opens at zero first',
            aiPending: 'AI parsing stays empty until the next phase',
            asideTitle: 'Make the post-open feeling right first',
            asideBody: 'Let users feel that the workspace already exists before we fill it with data. That gives the future AI a clear landing place.',
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

function delayStyle(ms: number): CSSProperties {
    return { '--enter-delay': `${ms}ms` } as CSSProperties;
}

function localize(text: LocalizedText, language: SiteLanguage) {
    return text[language];
}

function createDefaultDraft(): SetupDraft {
    return {
        currentStep: 'profile',
        profileId: null,
        assetIds: ['bank', 'wallet', 'broker'],
        moneySpread: null,
        institutions: ['cba', 'alipay', 'wechat', 'ibkr'],
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
        const draft = createDefaultDraft();
        return {
            currentStep: SETUP_STEPS.some(step => step.id === parsed.currentStep) ? parsed.currentStep! : draft.currentStep,
            profileId: PROFILE_OPTIONS.some(option => option.id === parsed.profileId) ? parsed.profileId! : draft.profileId,
            assetIds: Array.isArray(parsed.assetIds)
                ? parsed.assetIds.filter((id): id is SetupAssetId => ASSET_OPTIONS.some(option => option.id === id))
                : draft.assetIds,
            moneySpread: SPREAD_OPTIONS.some(option => option.id === parsed.moneySpread) ? parsed.moneySpread! : draft.moneySpread,
            institutions: Array.isArray(parsed.institutions)
                ? parsed.institutions.filter((id): id is SetupInstitutionId => SETUP_INSTITUTIONS.some(option => option.id === id))
                : draft.institutions,
            uploadNames: Array.isArray(parsed.uploadNames) ? parsed.uploadNames.filter(Boolean).slice(0, FREE_UPLOAD_LIMIT) : [],
            skippedImport: Boolean(parsed.skippedImport),
        };
    } catch {
        return createDefaultDraft();
    }
}

function isStepComplete(stepId: SetupStepId, draft: SetupDraft) {
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
            return false;
        default:
            return false;
    }
}

function getHighestUnlockedIndex(draft: SetupDraft) {
    let highest = 0;

    for (let index = 0; index < SETUP_STEPS.length - 1; index += 1) {
        const step = SETUP_STEPS[index];
        if (!isStepComplete(step.id, draft)) break;
        highest = index + 1;
    }

    const currentIndex = SETUP_STEPS.findIndex(step => step.id === draft.currentStep);
    return Math.max(highest, currentIndex);
}

function getVisibleInstitutions(assetIds: SetupAssetId[]) {
    const visibleGroups = new Set<SetupInstitutionGroup>();
    if (assetIds.includes('bank')) visibleGroups.add('bank');
    if (assetIds.includes('wallet')) visibleGroups.add('wallet');
    if (assetIds.includes('broker')) visibleGroups.add('broker');

    if (visibleGroups.size === 0) return SETUP_INSTITUTIONS;
    return SETUP_INSTITUTIONS.filter(option => visibleGroups.has(option.group));
}

function getStepProgress(stepId: SetupStepId) {
    const index = SETUP_STEPS.findIndex(step => step.id === stepId);
    return ((index + 1) / SETUP_STEPS.length) * 100;
}

function getInstitutionGroups(language: SiteLanguage) {
    const copy = COPY[language].sources;

    return {
        bank: copy.banks,
        wallet: copy.wallets,
        broker: copy.brokers,
    } satisfies Record<SetupInstitutionGroup, string>;
}

export function SetupFlow() {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const { resetToStarterData } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [language, setLanguage] = useState<SiteLanguage>(() => loadSiteLanguage());
    const [draft, setDraft] = useState<SetupDraft>(() => loadDraft());
    const [uploadNotice, setUploadNotice] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const copy = COPY[language];
    const currentStepIndex = SETUP_STEPS.findIndex(step => step.id === draft.currentStep);
    const highestUnlockedIndex = getHighestUnlockedIndex(draft);
    const progress = getStepProgress(draft.currentStep);
    const selectedProfile = PROFILE_OPTIONS.find(option => option.id === draft.profileId) ?? null;
    const selectedInstitutions = SETUP_INSTITUTIONS.filter(option => draft.institutions.includes(option.id));
    const visibleInstitutions = getVisibleInstitutions(draft.assetIds);
    const groupLabels = getInstitutionGroups(language);
    const hasPremiumAssets = draft.assetIds.includes('property') || draft.assetIds.includes('vehicle');

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

        const previousStep = SETUP_STEPS[currentStepIndex - 1];
        setDraft(current => ({ ...current, currentStep: previousStep.id }));
    };

    const goNext = () => {
        if (draft.currentStep === 'preview') {
            resetToStarterData();
            window.localStorage.setItem(WELCOME_STORAGE_KEY, '1');
            window.localStorage.removeItem(SETUP_DRAFT_KEY);
            navigate('/dashboard');
            return;
        }

        if (!isStepComplete(draft.currentStep, draft)) return;
        const nextStep = SETUP_STEPS[currentStepIndex + 1];
        if (!nextStep) return;
        setDraft(current => ({ ...current, currentStep: nextStep.id }));
    };

    const resetFlow = () => {
        const fresh = createDefaultDraft();
        setDraft(fresh);
        setUploadNotice('');
        window.localStorage.setItem(SETUP_DRAFT_KEY, JSON.stringify(fresh));
    };

    const toggleAsset = (assetId: SetupAssetId) => {
        setDraft(current => {
            const active = current.assetIds.includes(assetId);
            const nextAssets = active
                ? current.assetIds.filter(id => id !== assetId)
                : [...current.assetIds, assetId];

            const visibleIds = new Set(getVisibleInstitutions(nextAssets).map(option => option.id));
            const nextInstitutions = current.institutions.filter(id => visibleIds.has(id));

            return {
                ...current,
                assetIds: nextAssets,
                institutions: nextInstitutions.length > 0 ? nextInstitutions : current.institutions.filter(id => visibleIds.has(id)),
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
        const cleaned = names
            .map(name => name.trim())
            .filter(Boolean);

        if (cleaned.length === 0) return;

        setDraft(current => {
            const merged = Array.from(new Set([...current.uploadNames, ...cleaned]));
            const trimmed = merged.slice(0, FREE_UPLOAD_LIMIT);
            setUploadNotice(merged.length > FREE_UPLOAD_LIMIT ? copy.import.trimNotice : '');

            return {
                ...current,
                uploadNames: trimmed,
                skippedImport: trimmed.length > 0 ? false : current.skippedImport,
            };
        });
    };

    const handleFileSelection = (files: FileList | null) => {
        if (!files) return;
        queueNames(Array.from(files).map(file => file.name));
    };

    const removeQueuedFile = (name: string) => {
        setDraft(current => ({
            ...current,
            uploadNames: current.uploadNames.filter(fileName => fileName !== name),
        }));
    };

    const stepCanContinue = isStepComplete(draft.currentStep, draft);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#ece4d6_0%,#f7f3ec_100%)] p-3 text-slate-950 dark:bg-[linear-gradient(180deg,#0f1319_0%,#141922_100%)] dark:text-white sm:p-4">
            <div className="mx-auto flex min-h-[calc(100svh-1.5rem)] max-w-[1720px] flex-col overflow-hidden rounded-[34px] border border-black/6 bg-[#f6f1e9] shadow-[0_36px_120px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-[#10141c]">
                <header className="relative border-b border-black/6 bg-white/92 backdrop-blur-sm dark:border-white/10 dark:bg-[#11161f]/92">
                    <div className="absolute bottom-0 left-0 h-1 bg-[linear-gradient(90deg,#e4cbff_0%,#8fa7ff_52%,#f4c564_100%)] transition-all duration-500" style={{ width: `${progress}%` }} />
                    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5 lg:px-7">
                        <div className="flex items-center gap-3">
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
                                const completed = index < currentStepIndex && isStepComplete(step.id, draft);
                                const locked = index > highestUnlockedIndex;

                                return (
                                    <div key={step.id} className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={locked}
                                            onClick={() => jumpToStep(step.id)}
                                            className={clsx(
                                                'whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-semibold tracking-[0.16em] transition',
                                                active && 'bg-slate-950 text-white shadow-[0_10px_28px_rgba(15,23,42,0.14)] dark:bg-white dark:text-slate-950',
                                                completed && !active && 'bg-slate-100 text-slate-800 dark:bg-white/8 dark:text-slate-200',
                                                locked && 'cursor-not-allowed text-slate-300 dark:text-slate-600',
                                                !active && !completed && !locked && 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                                            )}
                                        >
                                            {localize(step.label, language)}
                                        </button>
                                        {index < SETUP_STEPS.length - 1 && (
                                            <ChevronRight className="shrink-0 text-slate-300 dark:text-slate-600" size={16} />
                                        )}
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
                                    <Languages size={12} />
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
                                aria-label={copy.top.themeLabel}
                                className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-slate-950 dark:border-white/10 dark:bg-[#171d27] dark:text-slate-300 dark:hover:text-white"
                            >
                                {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
                            </button>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                            >
                                {copy.top.openProduct}
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="grid flex-1 min-h-0 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
                    <section className="flex min-h-0 flex-col bg-[#fbfaf6] px-5 py-6 dark:bg-[#0f141c] sm:px-7 sm:py-7 lg:px-10 lg:py-9">
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={goBack}
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                            >
                                <ChevronLeft size={16} />
                                {currentStepIndex === 0 ? copy.top.home : copy.buttons.back}
                            </button>
                            <button
                                type="button"
                                onClick={resetFlow}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                            >
                                <RefreshCcw size={13} />
                                {copy.top.startOver}
                            </button>
                        </div>

                        <div key={draft.currentStep} className="setup-stage-enter mt-8 flex min-h-0 flex-1 flex-col">
                            {draft.currentStep === 'profile' && (
                                <>
                                    <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.profile.eyebrow}</p>
                                    <h1 className="mt-5 max-w-[11ch] text-[clamp(2.4rem,4vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.06em]">
                                        {copy.profile.title}
                                    </h1>
                                    <p className="mt-5 max-w-[34rem] text-[1.02rem] leading-8 text-slate-600 dark:text-slate-300">
                                        {copy.profile.body}
                                    </p>

                                    <div className="mt-8 grid gap-3">
                                        {PROFILE_OPTIONS.map(option => {
                                            const active = draft.profileId === option.id;
                                            const Icon = PROFILE_ICONS[option.id];

                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => setDraft(current => ({ ...current, profileId: option.id }))}
                                                    className={clsx(
                                                        'flex items-start gap-4 rounded-[24px] border px-5 py-5 text-left transition setup-chip-lift',
                                                        active
                                                            ? 'border-slate-950 bg-slate-950 text-white shadow-[0_22px_44px_rgba(15,23,42,0.18)] dark:border-white dark:bg-white dark:text-slate-950'
                                                            : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 dark:border-white/10 dark:bg-[#171d27] dark:text-white',
                                                    )}
                                                >
                                                    <div className={clsx('flex size-11 shrink-0 items-center justify-center rounded-2xl', active ? 'bg-white/12 text-white dark:bg-slate-950/10 dark:text-slate-950' : 'bg-slate-100 text-slate-700 dark:bg-white/6 dark:text-slate-200')}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[1rem] font-semibold tracking-[-0.02em]">{localize(option.title, language)}</p>
                                                            {active && <Check size={15} />}
                                                        </div>
                                                        <p className={clsx('mt-1 text-sm leading-6', active ? 'text-white/78 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                                            {localize(option.note, language)}
                                                        </p>
                                                        <p className={clsx('mt-2 text-[13px] leading-6', active ? 'text-white/68 dark:text-slate-700/80' : 'text-slate-400 dark:text-slate-500')}>
                                                            {localize(option.helper, language)}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {draft.currentStep === 'assets' && (
                                <>
                                    <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.assets.eyebrow}</p>
                                    <h1 className="mt-5 max-w-[11ch] text-[clamp(2.3rem,3.8vw,4.1rem)] font-semibold leading-[1] tracking-[-0.06em]">
                                        {copy.assets.title}
                                    </h1>
                                    <p className="mt-5 max-w-[34rem] text-[1.02rem] leading-8 text-slate-600 dark:text-slate-300">
                                        {copy.assets.body}
                                    </p>

                                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                        {ASSET_OPTIONS.map(option => {
                                            const active = draft.assetIds.includes(option.id);
                                            const Icon = ASSET_ICONS[option.id];
                                            const premium = option.gate === 'plus';

                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => toggleAsset(option.id)}
                                                    className={clsx(
                                                        'rounded-[26px] border px-5 py-5 text-left transition setup-chip-lift',
                                                        active
                                                            ? 'border-slate-950 bg-slate-950 text-white shadow-[0_24px_48px_rgba(15,23,42,0.18)] dark:border-white dark:bg-white dark:text-slate-950'
                                                            : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 dark:border-white/10 dark:bg-[#171d27] dark:text-white',
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className={clsx('flex size-12 items-center justify-center rounded-[18px]', active ? 'bg-white/12 dark:bg-slate-950/10' : 'bg-slate-100 dark:bg-white/6')}>
                                                            <Icon size={18} />
                                                        </div>
                                                        <span className={clsx('rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em]', premium ? (active ? 'bg-white/12 text-white dark:bg-slate-950/10 dark:text-slate-950' : 'bg-[#f3ebdd] text-[#8a5c14] dark:bg-[#241e15] dark:text-[#f1c97c]') : (active ? 'bg-white/12 text-white dark:bg-slate-950/10 dark:text-slate-950' : 'bg-slate-100 text-slate-500 dark:bg-white/6 dark:text-slate-300'))}>
                                                            {premium ? copy.assets.plus : copy.assets.core}
                                                        </span>
                                                    </div>
                                                    <p className="mt-4 text-[1rem] font-semibold tracking-[-0.02em]">{localize(option.title, language)}</p>
                                                    <p className={clsx('mt-2 text-sm leading-6', active ? 'text-white/78 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                                        {localize(option.note, language)}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {draft.currentStep === 'sources' && (
                                <>
                                    <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.sources.eyebrow}</p>
                                    <h1 className="mt-5 max-w-[11ch] text-[clamp(2.2rem,3.7vw,4rem)] font-semibold leading-[1] tracking-[-0.06em]">
                                        {copy.sources.title}
                                    </h1>
                                    <p className="mt-5 max-w-[34rem] text-[1.02rem] leading-8 text-slate-600 dark:text-slate-300">
                                        {copy.sources.body}
                                    </p>

                                    <div className="mt-8">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.sources.spreadLabel}</p>
                                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                            {SPREAD_OPTIONS.map(option => (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => setDraft(current => ({ ...current, moneySpread: option.id }))}
                                                    className={clsx(
                                                        'rounded-[24px] border px-4 py-4 text-left transition setup-chip-lift',
                                                        draft.moneySpread === option.id
                                                            ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                                                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#171d27]',
                                                    )}
                                                >
                                                    <p className="text-sm font-semibold tracking-[-0.02em]">{localize(option.title, language)}</p>
                                                    <p className={clsx('mt-1 text-[13px] leading-6', draft.moneySpread === option.id ? 'text-white/76 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                                        {localize(option.note, language)}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 min-h-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.sources.institutionsLabel}</p>
                                        <div className="mt-4 space-y-5">
                                            {(['bank', 'wallet', 'broker'] as SetupInstitutionGroup[]).map(group => {
                                                const items = visibleInstitutions.filter(option => option.group === group);
                                                if (items.length === 0) return null;

                                                return (
                                                    <div key={group}>
                                                        <p className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{groupLabels[group]}</p>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {items.map(option => {
                                                                const active = draft.institutions.includes(option.id);

                                                                return (
                                                                    <button
                                                                        key={option.id}
                                                                        type="button"
                                                                        onClick={() => toggleInstitution(option.id)}
                                                                        className={clsx(
                                                                            'rounded-full border px-4 py-2.5 text-sm font-medium transition setup-chip-lift',
                                                                            active
                                                                                ? 'text-slate-950 shadow-[0_12px_24px_rgba(15,23,42,0.1)]'
                                                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-[#171d27] dark:text-slate-300',
                                                                        )}
                                                                        style={active ? { borderColor: `${option.accent}55`, backgroundColor: option.surface } : undefined}
                                                                    >
                                                                        {localize(option.title, language)}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            {draft.currentStep === 'import' && (
                                <>
                                    <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.import.eyebrow}</p>
                                    <h1 className="mt-5 max-w-[11ch] text-[clamp(2.2rem,3.7vw,4rem)] font-semibold leading-[1] tracking-[-0.06em]">
                                        {copy.import.title}
                                    </h1>
                                    <p className="mt-5 max-w-[35rem] text-[1.02rem] leading-8 text-slate-600 dark:text-slate-300">
                                        {copy.import.body}
                                    </p>

                                    <div className="mt-8 space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={event => {
                                                event.preventDefault();
                                                setDragActive(true);
                                            }}
                                            onDragLeave={() => setDragActive(false)}
                                            onDrop={event => {
                                                event.preventDefault();
                                                setDragActive(false);
                                                handleFileSelection(event.dataTransfer.files);
                                            }}
                                            className={clsx(
                                                'w-full rounded-[30px] border border-dashed px-6 py-8 text-left transition',
                                                dragActive
                                                    ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                                                    : 'border-slate-300 bg-white hover:border-slate-400 dark:border-white/14 dark:bg-[#171d27]',
                                            )}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={clsx('flex size-12 items-center justify-center rounded-[20px]', dragActive ? 'bg-white/12 dark:bg-slate-950/10' : 'bg-slate-100 dark:bg-white/6')}>
                                                    <Upload size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-base font-semibold tracking-[-0.02em]">{copy.import.dropTitle}</p>
                                                    <p className={clsx('mt-2 max-w-[32rem] text-sm leading-7', dragActive ? 'text-white/76 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                                        {copy.import.dropBody}
                                                    </p>
                                                    <div className="mt-4 flex flex-wrap gap-3">
                                                        <span className={clsx('inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium', dragActive ? 'bg-white/12 dark:bg-slate-950/10' : 'bg-slate-100 text-slate-600 dark:bg-white/6 dark:text-slate-300')}>
                                                            <ImagePlus size={14} />
                                                            {copy.buttons.browseFiles}
                                                        </span>
                                                        <span className={clsx('inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium', dragActive ? 'bg-white/12 dark:bg-slate-950/10' : 'bg-slate-100 text-slate-600 dark:bg-white/6 dark:text-slate-300')}>
                                                            <Clock3 size={14} />
                                                            {copy.import.limit}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={event => handleFileSelection(event.target.files)}
                                        />

                                        <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#171d27]">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.import.queued}</p>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-slate-500 dark:bg-white/6 dark:text-slate-300">
                                                    {draft.uploadNames.length}/{FREE_UPLOAD_LIMIT}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2.5">
                                                {draft.uploadNames.length > 0 ? (
                                                    draft.uploadNames.map(name => (
                                                        <button
                                                            key={name}
                                                            type="button"
                                                            onClick={() => removeQueuedFile(name)}
                                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/6 dark:text-slate-200"
                                                        >
                                                            <FileUp size={14} />
                                                            <span className="max-w-[18rem] truncate">{name}</span>
                                                            <span className="text-slate-400 dark:text-slate-500">×</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{copy.import.empty}</p>
                                                )}
                                            </div>
                                            {uploadNotice ? (
                                                <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">{uploadNotice}</p>
                                            ) : null}
                                        </div>

                                        <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#171d27]">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.import.rules}</p>
                                            <div className="mt-4 grid gap-3">
                                                {SETUP_SAFETY_RULES.map(rule => (
                                                    <div key={rule.zh} className="flex items-start gap-3 rounded-[20px] bg-slate-50 px-4 py-3 dark:bg-white/6">
                                                        <ShieldCheck className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-300" size={16} />
                                                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{localize(rule, language)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {draft.currentStep === 'preview' && (
                                <>
                                    <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.preview.eyebrow}</p>
                                    <h1 className="mt-5 max-w-[11ch] text-[clamp(2.2rem,3.7vw,4rem)] font-semibold leading-[1] tracking-[-0.06em]">
                                        {copy.preview.title}
                                    </h1>
                                    <p className="mt-5 max-w-[35rem] text-[1.02rem] leading-8 text-slate-600 dark:text-slate-300">
                                        {copy.preview.body}
                                    </p>

                                    <div className="mt-8 grid gap-4">
                                        <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#171d27]">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.preview.trialLabel}</p>
                                            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{copy.preview.trialBody}</p>
                                            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{copy.preview.plusHint}</p>
                                        </div>

                                        <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#171d27]">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.preview.queuedFiles}</p>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-slate-500 dark:bg-white/6 dark:text-slate-300">
                                                    {draft.uploadNames.length}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2.5">
                                                {draft.uploadNames.length > 0 ? (
                                                    draft.uploadNames.map(name => (
                                                        <span key={name} className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/6 dark:text-slate-200">
                                                            {name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-500 dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
                                                        {copy.preview.aiPending}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
                                <p className="text-sm text-slate-400 dark:text-slate-500">{copy.top.draft}</p>
                                <div className="flex flex-wrap items-center gap-3">
                                    {draft.currentStep === 'import' && !stepCanContinue && (
                                        <button
                                            type="button"
                                            onClick={() => setDraft(current => ({ ...current, skippedImport: true, currentStep: 'preview' }))}
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                                        >
                                            {copy.buttons.skipImport}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        disabled={!stepCanContinue && draft.currentStep !== 'preview'}
                                        className={clsx(
                                            'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition',
                                            stepCanContinue || draft.currentStep === 'preview'
                                                ? 'bg-slate-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-slate-950'
                                                : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/8 dark:text-slate-500',
                                        )}
                                    >
                                        {draft.currentStep === 'preview' ? copy.buttons.enterDashboard : copy.buttons.continue}
                                        <ArrowRight size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="relative min-h-[440px] overflow-hidden bg-[linear-gradient(180deg,#efe7d8_0%,#f7f3ea_100%)] dark:bg-[linear-gradient(180deg,#121925_0%,#0d1118_100%)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.66),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(196,173,255,0.24),transparent_16%),radial-gradient(circle_at_50%_82%,rgba(143,167,255,0.2),transparent_22%)] dark:bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.06),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(196,173,255,0.14),transparent_16%),radial-gradient(circle_at_50%_82%,rgba(143,167,255,0.1),transparent_22%)]" />
                        <div key={`${draft.currentStep}-visual`} className="setup-stage-enter relative flex h-full flex-col px-5 py-6 sm:px-7 sm:py-7 lg:px-10 lg:py-10">
                            {draft.currentStep === 'profile' && (
                                <ProfileVisual
                                    language={language}
                                    copy={copy.profile}
                                    selectedProfile={selectedProfile}
                                />
                            )}
                            {draft.currentStep === 'assets' && (
                                <AssetsVisual
                                    language={language}
                                    copy={copy.assets}
                                    assetIds={draft.assetIds}
                                />
                            )}
                            {draft.currentStep === 'sources' && (
                                <SourcesVisual
                                    language={language}
                                    copy={copy.sources}
                                    institutions={selectedInstitutions}
                                    moneySpread={draft.moneySpread}
                                />
                            )}
                            {draft.currentStep === 'import' && (
                                <ImportVisual
                                    language={language}
                                    copy={copy.import}
                                    queuedNames={draft.uploadNames}
                                    institutions={selectedInstitutions}
                                />
                            )}
                            {draft.currentStep === 'preview' && (
                                <PreviewVisual
                                    language={language}
                                    copy={copy.preview}
                                    assetIds={draft.assetIds}
                                    institutions={selectedInstitutions}
                                    moneySpread={draft.moneySpread}
                                    queuedCount={draft.uploadNames.length}
                                    hasPremiumAssets={hasPremiumAssets}
                                />
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function ProfileVisual({
    language,
    copy,
    selectedProfile,
}: {
    language: SiteLanguage;
    copy: FlowCopy['profile'];
    selectedProfile: (typeof PROFILE_OPTIONS)[number] | null;
}) {
    const Icon = selectedProfile ? PROFILE_ICONS[selectedProfile.id] : Layers3;

    return (
        <div className="flex h-full flex-col justify-between">
            <div className="rounded-[32px] border border-white/55 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-white/10 dark:bg-[#171d27]/84">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-3.5 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-500 dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
                    <Sparkles size={13} />
                    {copy.badge}
                </span>
                <div className="mt-8 flex items-start gap-4">
                    <div className="flex size-14 items-center justify-center rounded-[22px] bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.asideTitle}</p>
                        <h2 className="mt-2 max-w-[12ch] text-[clamp(2rem,3.8vw,4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
                            {selectedProfile ? localize(selectedProfile.title, language) : copy.asideTitle}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[34px] border border-black/8 bg-[linear-gradient(160deg,#0b1017_0%,#171d27_100%)] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">PROFILE LOCKED IN</p>
                    <h3 className="mt-5 max-w-[10ch] text-[clamp(2.1rem,3.8vw,4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
                        {selectedProfile ? localize(selectedProfile.title, language) : copy.asideTitle}
                    </h3>
                    <p className="mt-5 max-w-[24rem] text-sm leading-7 text-slate-300">
                        {selectedProfile ? localize(selectedProfile.helper, language) : copy.asideBody}
                    </p>
                </div>

                <div className="rounded-[34px] border border-black/8 bg-white/84 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-[#171d27]/84">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">WHY THIS MATTERS</p>
                    <p className="mt-4 text-[1.15rem] font-semibold leading-8 tracking-[-0.03em]">
                        {copy.asideTitle}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">{copy.asideBody}</p>
                </div>
            </div>
        </div>
    );
}

function AssetsVisual({
    language,
    copy,
    assetIds,
}: {
    language: SiteLanguage;
    copy: FlowCopy['assets'];
    assetIds: SetupAssetId[];
}) {
    return (
        <div className="flex h-full flex-col justify-between">
            <div>
                <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.asideTitle}</p>
                <h2 className="mt-4 max-w-[11ch] text-[clamp(2.4rem,4vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.06em]">
                    {copy.asideTitle}
                </h2>
                <p className="mt-4 max-w-[34rem] text-sm leading-7 text-slate-500 dark:text-slate-400">{copy.asideBody}</p>
            </div>

            <div className="mt-10 grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ASSET_OPTIONS.map((option, index) => {
                    const Icon = ASSET_ICONS[option.id];
                    const active = assetIds.includes(option.id);

                    return (
                        <div
                            key={option.id}
                            className={clsx(
                                'setup-pop rounded-[30px] border p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)]',
                                active
                                    ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                                    : 'border-white/70 bg-white/76 text-slate-800 backdrop-blur-sm dark:border-white/10 dark:bg-[#171d27]/84 dark:text-white',
                            )}
                            style={delayStyle(120 + index * 70)}
                        >
                            <div className={clsx('flex size-12 items-center justify-center rounded-[18px]', active ? 'bg-white/12 dark:bg-slate-950/10' : 'bg-slate-100 dark:bg-white/6')}>
                                <Icon size={19} />
                            </div>
                            <p className="mt-4 text-base font-semibold tracking-[-0.03em]">{localize(option.title, language)}</p>
                            <p className={clsx('mt-2 text-sm leading-6', active ? 'text-white/76 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400')}>
                                {localize(option.note, language)}
                            </p>
                            <span className={clsx('mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.14em]', option.gate === 'plus' ? (active ? 'bg-white/12 dark:bg-slate-950/10' : 'bg-[#f3ebdd] text-[#8a5c14] dark:bg-[#241e15] dark:text-[#f1c97c]') : (active ? 'bg-white/12 dark:bg-slate-950/10' : 'bg-slate-100 text-slate-500 dark:bg-white/6 dark:text-slate-300'))}>
                                {option.gate === 'plus' ? copy.plus : copy.core}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SourcesVisual({
    language,
    copy,
    institutions,
    moneySpread,
}: {
    language: SiteLanguage;
    copy: FlowCopy['sources'];
    institutions: SetupInstitution[];
    moneySpread: SetupSpreadId | null;
}) {
    const spreadTitle = moneySpread
        ? localize(SPREAD_OPTIONS.find(option => option.id === moneySpread)?.title ?? SPREAD_OPTIONS[1].title, language)
        : language === 'zh'
            ? '等待你确认入口数量'
            : 'Waiting for your entry count';

    return (
        <div className="flex h-full flex-col justify-between">
            <div>
                <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.asideTitle}</p>
                <h2 className="mt-4 max-w-[12ch] text-[clamp(2.4rem,4vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.06em]">
                    {copy.asideTitle}
                </h2>
                <p className="mt-4 max-w-[34rem] text-sm leading-7 text-slate-500 dark:text-slate-400">{copy.asideBody}</p>
            </div>

            <div className="mt-10 rounded-[34px] border border-black/8 bg-[linear-gradient(160deg,#0c1118_0%,#171d27_100%)] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">SOURCE MAP</p>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-slate-300">
                        {institutions.length}
                    </span>
                </div>
                <h3 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.045em]">{spreadTitle}</h3>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {institutions.length > 0 ? (
                        institutions.map((institution, index) => (
                            <div
                                key={institution.id}
                                className="setup-pop rounded-[24px] border border-white/10 bg-white/6 p-4"
                                style={delayStyle(120 + index * 70)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="block size-3 rounded-full" style={{ backgroundColor: institution.accent }} />
                                    <p className="text-sm font-semibold tracking-[-0.02em]">{localize(institution.title, language)}</p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-300">{localize(institution.note, language)}</p>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm text-slate-300">
                            {copy.asideBody}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ImportVisual({
    language,
    copy,
    queuedNames,
    institutions,
}: {
    language: SiteLanguage;
    copy: FlowCopy['import'];
    queuedNames: string[];
    institutions: SetupInstitution[];
}) {
    return (
        <div className="flex h-full flex-col justify-between">
            <div className="rounded-[34px] border border-black/8 bg-[linear-gradient(160deg,#0c1118_0%,#171d27_100%)] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
                <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-[11px] font-semibold tracking-[0.16em] text-slate-300">
                        <Sparkles size={13} />
                        {copy.badge}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-slate-300">
                        {copy.status}
                    </span>
                </div>
                <h2 className="mt-5 max-w-[12ch] text-[clamp(2.3rem,4vw,4.2rem)] font-semibold leading-[0.96] tracking-[-0.06em]">
                    {copy.placeholderTitle}
                </h2>
                <p className="mt-4 max-w-[34rem] text-sm leading-7 text-slate-300">{copy.placeholderBody}</p>
            </div>

            <div className="mt-8 grid flex-1 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-[#171d27]/84">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.asideTitle}</p>
                    <div className="mt-6 space-y-3">
                        {queuedNames.length > 0 ? (
                            queuedNames.map((name, index) => (
                                <div key={name} className="setup-pop rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/6" style={delayStyle(140 + index * 60)}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-[16px] bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                            <FileUp size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold tracking-[-0.02em]">{name}</p>
                                            <p className="text-[13px] text-slate-500 dark:text-slate-400">{copy.limit}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-6 text-sm leading-7 text-slate-500 dark:border-white/12 dark:text-slate-400">
                                {copy.empty}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-[#171d27]/84">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.rules}</p>
                    <div className="mt-6 space-y-3">
                        {(institutions.length > 0 ? institutions : SETUP_INSTITUTIONS.slice(0, 3)).map(institution => (
                            <div key={institution.id} className="rounded-[20px] border px-4 py-3" style={{ borderColor: `${institution.accent}33`, backgroundColor: institution.surface }}>
                                <p className="text-sm font-semibold tracking-[-0.02em] text-slate-900">{localize(institution.title, language)}</p>
                                <p className="mt-1 text-[13px] leading-6 text-slate-600">{localize(institution.note, language)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PreviewVisual({
    language,
    copy,
    assetIds,
    institutions,
    moneySpread,
    queuedCount,
    hasPremiumAssets,
}: {
    language: SiteLanguage;
    copy: FlowCopy['preview'];
    assetIds: SetupAssetId[];
    institutions: SetupInstitution[];
    moneySpread: SetupSpreadId | null;
    queuedCount: number;
    hasPremiumAssets: boolean;
}) {
    const summaryBlocks = [
        {
            label: localize({ zh: '总资产', en: 'Net total' }, language),
            value: '$0',
            note: localize({ zh: '所有入口都还没导入', en: 'Nothing imported yet' }, language),
        },
        {
            label: localize({ zh: '已选机构', en: 'Chosen sources' }, language),
            value: `${institutions.length}`,
            note: moneySpread ? localize(SPREAD_OPTIONS.find(option => option.id === moneySpread)?.title ?? SPREAD_OPTIONS[1].title, language) : copy.zeroState,
        },
        {
            label: localize({ zh: '导入队列', en: 'Import queue' }, language),
            value: `${queuedCount}`,
            note: copy.aiPending,
        },
    ];

    const moduleCards = [
        {
            title: localize({ zh: '总览', en: 'Overview' }, language),
            note: localize({ zh: '一打开就先看到全局', en: 'The whole picture opens first' }, language),
        },
        {
            title: localize({ zh: '预算', en: 'Budget' }, language),
            note: localize({ zh: '收入和支出先给判断', en: 'Income and costs turn into a signal' }, language),
        },
        {
            title: localize({ zh: '报表', en: 'Reports' }, language),
            note: localize({ zh: '复核放在后面，不挡路', en: 'Review stays later and out of the way' }, language),
        },
        ...assetIds.map(assetId => ({
            title: localize(ASSET_OPTIONS.find(option => option.id === assetId)?.title ?? ASSET_OPTIONS[0].title, language),
            note: localize(ASSET_OPTIONS.find(option => option.id === assetId)?.note ?? ASSET_OPTIONS[0].note, language),
        })),
    ].slice(0, 6);

    return (
        <div className="flex h-full flex-col justify-between">
            <div>
                <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.dashboardLabel}</p>
                <h2 className="mt-4 max-w-[11ch] text-[clamp(2.4rem,4vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.06em]">
                    {copy.asideTitle}
                </h2>
                <p className="mt-4 max-w-[34rem] text-sm leading-7 text-slate-500 dark:text-slate-400">{copy.asideBody}</p>
            </div>

            <div className="mt-8 rounded-[38px] border border-black/8 bg-[linear-gradient(160deg,#0b1017_0%,#171d27_100%)] p-6 text-white shadow-[0_34px_84px_rgba(15,23,42,0.28)]">
                <div className="grid gap-3 md:grid-cols-3">
                    {summaryBlocks.map((block, index) => (
                        <div key={block.label} className="setup-pop rounded-[24px] border border-white/10 bg-white/6 p-4" style={delayStyle(120 + index * 70)}>
                            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400">{block.label}</p>
                            <p className="mt-3 text-[1.8rem] font-semibold tracking-[-0.05em]">{block.value}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{block.note}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {moduleCards.map((card, index) => (
                        <div key={`${card.title}-${index}`} className="setup-pop rounded-[24px] border border-white/10 bg-white/6 p-4" style={delayStyle(360 + index * 60)}>
                            <p className="text-sm font-semibold tracking-[-0.02em]">{card.title}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{card.note}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-[#171d27]/84">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.importStatus}</p>
                    <div className="mt-4 flex items-center gap-3 rounded-[20px] bg-slate-50 px-4 py-4 dark:bg-white/6">
                        <div className="flex size-11 items-center justify-center rounded-[18px] bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Upload size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold tracking-[-0.02em]">{copy.aiPending}</p>
                            <p className="mt-1 text-[13px] leading-6 text-slate-500 dark:text-slate-400">{copy.zeroState}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-[#171d27]/84">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500">{copy.trialLabel}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{copy.trialBody}</p>
                    {hasPremiumAssets ? (
                        <div className="mt-4 rounded-[18px] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600 dark:bg-white/6 dark:text-slate-300">
                            {copy.plusHint}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
