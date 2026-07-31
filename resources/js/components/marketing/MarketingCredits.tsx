import { cn } from '@/lib/utils';

const TAMMER_SOFTWARE_URL = 'https://tammer.net';

interface MarketingCreditsProps {
    className?: string;
}

export function MarketingCredits({ className }: MarketingCreditsProps) {
    return (
        <p className={cn('text-xs text-muted-foreground/80', className)}>
            تصميم وبرمجة:{' '}
            <a
                href={TAMMER_SOFTWARE_URL}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground underline-offset-4 hover:underline"
            >
                تامر للبرمجيات
            </a>
        </p>
    );
}
