import { useMemo } from 'react';

const CONFETTI_COLORS = ['#f8fafc', '#cbd5e1', '#94a3b8', '#fde68a', '#fda4af', '#bfdbfe'];

function buildPieces(direction: 'left' | 'right') {
    return Array.from({ length: 34 }, (_, index) => {
        const offset = 10 + index * 11;
        const drift = (direction === 'left' ? 1 : -1) * (64 + (index % 8) * 18);
        const rise = 190 + (index % 7) * 30;
        const rotation = `${(direction === 'left' ? 1 : -1) * (140 + index * 22)}deg`;
        const delay = `${(index % 8) * 0.03}s`;
        const duration = `${1.35 + (index % 5) * 0.12}s`;
        const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
        const height = 18 + (index % 5) * 6;
        const width = 8 + (index % 3) * 3;

        return { offset, drift, rise, rotation, delay, duration, color, height, width };
    });
}

export function CornerConfetti({ burstKey }: { burstKey: number }) {
    const leftPieces = useMemo(() => buildPieces('left'), []);
    const rightPieces = useMemo(() => buildPieces('right'), []);

    if (burstKey <= 0) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
            <div className="absolute bottom-0 left-0 h-0 w-0">
                {leftPieces.map((piece, index) => (
                    <span
                        key={`left-${index}`}
                        className="corner-confetti-piece"
                        style={{
                            left: `${piece.offset}px`,
                            width: `${piece.width}px`,
                            height: `${piece.height}px`,
                            backgroundColor: piece.color,
                            ['--confetti-x' as string]: `${piece.drift}px`,
                            ['--confetti-y' as string]: `${piece.rise}px`,
                            ['--confetti-rotate' as string]: piece.rotation,
                            ['--confetti-delay' as string]: piece.delay,
                            ['--confetti-duration' as string]: piece.duration,
                        }}
                    />
                ))}
            </div>
            <div className="absolute bottom-0 right-0 h-0 w-0">
                {rightPieces.map((piece, index) => (
                    <span
                        key={`right-${index}`}
                        className="corner-confetti-piece"
                        style={{
                            right: `${piece.offset}px`,
                            width: `${piece.width}px`,
                            height: `${piece.height}px`,
                            backgroundColor: piece.color,
                            ['--confetti-x' as string]: `${piece.drift}px`,
                            ['--confetti-y' as string]: `${piece.rise}px`,
                            ['--confetti-rotate' as string]: piece.rotation,
                            ['--confetti-delay' as string]: piece.delay,
                            ['--confetti-duration' as string]: piece.duration,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
