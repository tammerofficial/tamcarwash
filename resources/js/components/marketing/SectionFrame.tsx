import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionFrameProps {
    id?: string;
    tone?: 'white' | 'soft';
    className?: string;
    children: ReactNode;
}

export function SectionFrame({ id, tone = 'white', className, children }: SectionFrameProps) {
    return (
        <section
            id={id}
            className={cn(
                'scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-16',
                tone === 'soft' ? 'bg-inst-bg' : 'bg-white',
                className,
            )}
        >
            <div className="mx-auto max-w-[1280px]">{children}</div>
        </section>
    );
}
