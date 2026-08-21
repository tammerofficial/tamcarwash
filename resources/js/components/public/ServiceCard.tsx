import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Sparkles, Zap, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { StorefrontService } from '@/types/api';
import { formatPrice } from '@/hooks/useStorefront';

interface ServiceCardProps {
    service: StorefrontService;
    currency: string;
}

const DEFAULT_FEATURES = ['غسيل احترافي معتمد', 'تنظيف شامل وعميق', 'تعطير وتعقيم كامل', 'فحص جودة نهائي'];

const ICON_MAP = {
    'غسيل': Zap,
    'تلميع': Sparkles,
    'صيانة': Star,
};

export function ServiceCard({ service, currency }: ServiceCardProps) {
    const name = service.name_ar || service.name;
    const category = service.category?.name || 'غسيل';
    const IconComponent = (ICON_MAP as any)[category] || Sparkles;

    return (
        <Card className="group relative overflow-hidden rounded-xl shadow-none border border-[var(--inst-border)] bg-white hover:shadow-2xl transition-all duration-500">
            {/* Premium accent bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)]" />

            {/* Image section */}
            <div className="relative h-56 overflow-hidden bg-gradient-to-b from-[var(--inst-silver)] to-white">
                <img
                    src="/images/wash/foam-wash.jpg"
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=800&auto=format&fit=crop';
                    }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[var(--inst-text)] shadow-md">
                        <IconComponent className="h-4 w-4 text-[var(--brand-primary)]" />
                        {category}
                    </span>
                </div>

                {/* Content overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                    <h3 className="text-xl font-black text-white leading-snug drop-shadow-lg">{name}</h3>
                    <div className="mt-2.5 flex items-center gap-2 text-white drop-shadow-md">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-bold">{service.duration_minutes} دقيقة</span>
                    </div>
                </div>
            </div>

            {/* Content section */}
            <div className="p-6 flex flex-col flex-1">
                <p className="text-sm leading-relaxed text-[var(--inst-muted)] mb-6 line-clamp-3">
                    {service.description ||
                        'عناية احترافية بمواد عالية الجودة مع ضمان الرضا التام للحفاظ على تألق سيارتك.'}
                </p>

                {/* Features grid */}
                <div className="space-y-3 mb-8 flex-1">
                    {DEFAULT_FEATURES.map((feat) => (
                        <div key={feat} className="flex items-center gap-2.5 text-sm font-medium text-[var(--inst-text)]">
                            <CheckCircle2 className="h-4 w-4 text-[var(--brand-secondary)] shrink-0" />
                            {feat}
                        </div>
                    ))}
                </div>

                {/* Price and CTA section */}
                <div className="flex items-center justify-between pt-6 border-t border-[var(--inst-border)]">
                    <div>
                        <p className="text-xs font-bold text-[var(--inst-muted)] uppercase tracking-wider mb-1">يبدأ من</p>
                        <p className="text-2xl font-black text-[var(--brand-primary)]">
                            {formatPrice(Number(service.base_price), currency)}
                        </p>
                    </div>
                    <Button size="lg" asChild className="sf-cta-accent h-12 w-12 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold">
                        <Link to="/book" aria-label={`احجز ${name}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
