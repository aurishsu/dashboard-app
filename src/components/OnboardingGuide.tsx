import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, PiggyBank, WalletCards } from 'lucide-react';

type OnboardingStep = 1 | 2 | 3;
type GuidePlacement = 'right' | 'left' | 'bottom';

type AnchorBox = {
    top: number;
    left: number;
    width: number;
    height: number;
    viewportWidth: number;
    viewportHeight: number;
};

type GuideSize = {
    width: number;
    height: number;
};

type GuideBox = GuideSize & {
    top: number;
    left: number;
    placement: GuidePlacement;
};

const GUIDE_EDGE = 16;
const GUIDE_GAP = 28;
const DEFAULT_GUIDE_SIZE: GuideSize = {
    width: typeof window === 'undefined' ? 360 : Math.min(360, window.innerWidth - 32),
    height: 286,
};

const STEP_CONTENT: Record<OnboardingStep, { title: string; body: string; action: string; selector: string; tip: string }> = {
    1: {
        title: '步骤 1. 填写银行卡',
        body: '先把最常用银行卡的余额改成真实数字。主币种先填进去，如果还有其他币种现金，再补副币种。',
        action: '继续到电子钱包',
        selector: '[data-onboarding="bank-balance"]',
        tip: '先点金额，把这张卡当前能看到的余额改成真实数字。',
    },
    2: {
        title: '步骤 2. 填写电子钱包',
        body: '支付宝和微信零钱通只维护当前余额。这里不算流水，也不用做复杂设置。',
        action: '继续到预算提醒',
        selector: '[data-onboarding="wallet-balance"]',
        tip: '钱包里现在有多少，就直接填多少。',
    },
    3: {
        title: '步骤 3. 填写预算提醒',
        body: '最后把本月净收入、房租和生活费填完。到这里，首页和预算结论就都能用起来了。',
        action: '完成初始设置',
        selector: '[data-onboarding="budget-input"]',
        tip: '先填本月净收入，再开关房租、生活费和学费。',
    },
};

function clamp(value: number, min: number, max: number) {
    if (max <= min) return min;
    return Math.min(Math.max(value, min), max);
}

function measureAnchor(selector: string): AnchorBox | null {
    const target = document.querySelector(selector);
    if (!target) return null;

    const rect = target.getBoundingClientRect();
    return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
    };
}

function focusAnchorTarget(selector: string) {
    const target = document.querySelector(selector);
    if (!(target instanceof HTMLElement)) return;

    const focusable = target.querySelector<HTMLElement>('input, button, select, textarea, [href], [tabindex]:not([tabindex="-1"])');
    if (focusable) {
        focusable.focus({ preventScroll: true });
    } else {
        target.focus({ preventScroll: true });
    }
}

function computeGuideBox(anchorBox: AnchorBox, guideSize: GuideSize): GuideBox {
    const canPlaceRight = anchorBox.left + anchorBox.width + guideSize.width + GUIDE_GAP < anchorBox.viewportWidth - GUIDE_EDGE;
    const canPlaceLeft = anchorBox.left - guideSize.width - GUIDE_GAP > GUIDE_EDGE;
    const placement: GuidePlacement = canPlaceRight ? 'right' : canPlaceLeft ? 'left' : 'bottom';

    if (placement === 'right') {
        return {
            width: guideSize.width,
            height: guideSize.height,
            placement,
            left: anchorBox.left + anchorBox.width + GUIDE_GAP,
            top: clamp(
                anchorBox.top + anchorBox.height / 2 - guideSize.height / 2,
                GUIDE_EDGE,
                anchorBox.viewportHeight - guideSize.height - GUIDE_EDGE,
            ),
        };
    }

    if (placement === 'left') {
        return {
            width: guideSize.width,
            height: guideSize.height,
            placement,
            left: clamp(anchorBox.left - guideSize.width - GUIDE_GAP, GUIDE_EDGE, anchorBox.viewportWidth - guideSize.width - GUIDE_EDGE),
            top: clamp(
                anchorBox.top + anchorBox.height / 2 - guideSize.height / 2,
                GUIDE_EDGE,
                anchorBox.viewportHeight - guideSize.height - GUIDE_EDGE,
            ),
        };
    }

    return {
        width: guideSize.width,
        height: guideSize.height,
        placement,
        left: clamp(
            anchorBox.left + anchorBox.width / 2 - guideSize.width / 2,
            GUIDE_EDGE,
            anchorBox.viewportWidth - guideSize.width - GUIDE_EDGE,
        ),
        top: clamp(
            anchorBox.top + anchorBox.height + GUIDE_GAP,
            GUIDE_EDGE,
            anchorBox.viewportHeight - guideSize.height - GUIDE_EDGE,
        ),
    };
}

function shouldRecenter(anchorBox: AnchorBox) {
    return anchorBox.top < 112 || anchorBox.top + anchorBox.height > window.innerHeight - 72;
}

export function OnboardingGuide({
    step,
    onNext,
    onSkip,
    onRestore,
    hasBackupData,
}: {
    step: OnboardingStep;
    onNext: () => void;
    onSkip: () => void;
    onRestore?: () => void;
    hasBackupData?: boolean;
}) {
    const current = STEP_CONTENT[step];
    const guideRef = useRef<HTMLDivElement | null>(null);
    const [anchorBox, setAnchorBox] = useState<AnchorBox | null>(null);
    const [guideSize, setGuideSize] = useState<GuideSize>(DEFAULT_GUIDE_SIZE);

    useEffect(() => {
        if (!guideRef.current || typeof ResizeObserver === 'undefined') return undefined;

        const node = guideRef.current;
        const updateSize = () => {
            const rect = node.getBoundingClientRect();
            setGuideSize({
                width: rect.width || DEFAULT_GUIDE_SIZE.width,
                height: rect.height || DEFAULT_GUIDE_SIZE.height,
            });
        };

        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(node);
        window.addEventListener('resize', updateSize);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateSize);
        };
    }, [step]);

    useEffect(() => {
        let cancelled = false;
        let timer = 0;
        let attempts = 0;

        const focusTarget = () => {
            if (cancelled) return;

            const nextAnchor = measureAnchor(current.selector);
            if (!nextAnchor) {
                if (attempts < 18) {
                    attempts += 1;
                    timer = window.setTimeout(focusTarget, 120);
                }
                return;
            }

            if (shouldRecenter(nextAnchor)) {
                const target = document.querySelector(current.selector);
                if (target instanceof HTMLElement) {
                    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }

            setAnchorBox(nextAnchor);
        };

        focusTarget();

        return () => {
            cancelled = true;
            if (timer) window.clearTimeout(timer);
        };
    }, [current.selector, step]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            focusAnchorTarget(current.selector);
        }, 260);

        return () => window.clearTimeout(timer);
    }, [current.selector, step]);

    useEffect(() => {
        let frame = 0;

        const update = () => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() => {
                setAnchorBox(measureAnchor(current.selector));
            });
        };

        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [current.selector, step]);

    const guideBox = useMemo(() => {
        if (!anchorBox) return null;
        return computeGuideBox(anchorBox, guideSize);
    }, [anchorBox, guideSize]);

    const connector = useMemo(() => {
        if (!anchorBox || !guideBox) return null;

        const anchorCenterX = anchorBox.left + anchorBox.width / 2;
        const anchorCenterY = anchorBox.top + anchorBox.height / 2;

        let startX = guideBox.left + guideBox.width / 2;
        let startY = guideBox.top + guideBox.height / 2;
        let endX = anchorCenterX;
        let endY = anchorCenterY;
        let control1X = startX;
        let control1Y = startY;
        let control2X = endX;
        let control2Y = endY;

        if (guideBox.placement === 'right') {
            startX = guideBox.left;
            startY = clamp(anchorCenterY, guideBox.top + 64, guideBox.top + guideBox.height - 64);
            endX = anchorBox.left + anchorBox.width;
            endY = anchorCenterY;
            control1X = startX - 36;
            control1Y = startY;
            control2X = endX + 28;
            control2Y = endY;
        } else if (guideBox.placement === 'left') {
            startX = guideBox.left + guideBox.width;
            startY = clamp(anchorCenterY, guideBox.top + 64, guideBox.top + guideBox.height - 64);
            endX = anchorBox.left;
            endY = anchorCenterY;
            control1X = startX + 36;
            control1Y = startY;
            control2X = endX - 28;
            control2Y = endY;
        } else {
            startX = clamp(anchorCenterX, guideBox.left + 72, guideBox.left + guideBox.width - 72);
            startY = guideBox.top;
            endX = anchorCenterX;
            endY = anchorBox.top + anchorBox.height;
            control1X = startX;
            control1Y = startY - 34;
            control2X = endX;
            control2Y = endY + 30;
        }

        return {
            width: anchorBox.viewportWidth,
            height: anchorBox.viewportHeight,
            dotX: endX,
            dotY: endY,
            path: `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`,
        };
    }, [anchorBox, guideBox]);

    const fallbackStyle = { right: '20px', bottom: '20px' };
    const guideStyle = guideBox
        ? { top: `${guideBox.top}px`, left: `${guideBox.left}px` }
        : fallbackStyle;

    return (
        <>
            {connector && (
                <svg
                    className="pointer-events-none fixed inset-0 z-[64] text-slate-950/80 dark:text-slate-100/90"
                    width={connector.width}
                    height={connector.height}
                    viewBox={`0 0 ${connector.width} ${connector.height}`}
                    fill="none"
                    aria-hidden="true"
                >
                    <defs>
                        <marker id="onboarding-guide-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                            <path d="M0 0L10 5L0 10Z" fill="currentColor" />
                        </marker>
                    </defs>
                    <path
                        d={connector.path}
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="8 10"
                        markerEnd="url(#onboarding-guide-arrow)"
                    />
                    <circle cx={connector.dotX} cy={connector.dotY} r="6" fill="currentColor" />
                </svg>
            )}

            {anchorBox && (
                <div
                    className="onboarding-highlight pointer-events-none fixed z-[63] rounded-[28px] ring-2 ring-slate-950/90 ring-offset-4 ring-offset-white shadow-[0_0_0_9999px_rgba(15,23,42,0.18)] dark:ring-white dark:ring-offset-slate-950"
                    style={{
                        top: `${anchorBox.top - 8}px`,
                        left: `${anchorBox.left - 8}px`,
                        width: `${anchorBox.width + 16}px`,
                        height: `${anchorBox.height + 16}px`,
                    }}
                />
            )}

            <div
                className="pointer-events-none fixed z-[65] w-[min(360px,calc(100vw-2rem))]"
                style={guideStyle}
            >
                <div ref={guideRef} className="pointer-events-auto surface-card relative overflow-hidden shadow-[0_24px_60px_rgba(15,23,42,0.18)] dark:shadow-[0_24px_64px_rgba(2,6,23,0.52)]">
                    <div className="border-b border-slate-100 bg-slate-50/85 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/88">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white dark:bg-white dark:text-slate-950">
                                    <WalletCards size={13} />
                                    新手引导
                                </div>
                                <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">{current.title}</h3>
                            </div>
                            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {step}/3
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-5">
                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{current.body}</p>

                        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                <PiggyBank size={16} />
                                现在就填
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{current.tip}</p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={onNext}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950"
                            >
                                {current.action}
                                <ArrowRight size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={onSkip}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                            >
                                跳过教学
                            </button>
                            {hasBackupData && onRestore && (
                                <button
                                    type="button"
                                    onClick={onRestore}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                                >
                                    恢复原数据
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
