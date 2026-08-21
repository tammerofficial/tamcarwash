import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { StorefrontService } from '@/types/api';
import { formatPrice } from '@/hooks/useStorefront';

interface ServiceCardProps {
    service: StorefrontService;
    currency: string;
}

const DEFAULT_FEATURES = ['غسيل خارجي بمعايير معتمدة', 'تنظيف إطارات وعجلات', 'تعطير وتعقيم داخلي'];

export function ServiceCard({ service, currency }: ServiceCardProps) {
    const name = service.name_ar || service.name;
    const category = service.category?.name || 'غسيل';

    return (
        <Card className="sf-card sf-card-accent group relative overflow-hidden rounded-xl shadow-none">
            <div className="relative h-48 overflow-hidden">
                <img
                    src="/images/wash/foam-wash.jpg"
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=800&auto=format&fit=crop';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--inst-teal)] via-black/10 to-transparent" />

                <span className="absolute top-4 start-4 rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--inst-text)]">
                    {category}
                </span>

                <div className="absolute bottom-4 inset-x-4">
                    <h3 className="text-lg font-bold text-white leading-snug">{name}</h3>
                    <div className="mt-1.5 flex items-center gap-1.5 text-white/80">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-semibold">{service.duration_minutes} دقيقة</span>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <p className="text-[13px] leading-relaxed text-[var(--inst-muted)] mb-4 line-clamp-2 min-h-[2.5rem]">
                    {service.description ||
                        'عناية تشغيلية بمواد آمنة ومعايير ثابتة للحفاظ على الطلاء والمقصورة.'}
                </p>

                <div className="space-y-2 mb-5">
                    {DEFAULT_FEATURES.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-[12px] font-medium text-[var(--inst-text)]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0" />
                            {feat}
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--inst-border)]">
                    <div>
                        <p className="text-[11px] font-semibold text-[var(--inst-muted)] mb-0.5">يبدأ من</p>
                        <p className="text-xl font-bold text-[var(--inst-text)]">
                            {formatPrice(Number(service.base_price), currency)}
                        </p>
                    </div>
                    <Button size="icon" asChild className="sf-cta h-11 w-11 rounded-lg shadow-none">
                        <Link to="/book" aria-label={`احجز ${name}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
