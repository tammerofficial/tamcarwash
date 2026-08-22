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

const DEFAULT_FEATURES = ['غسيل احترافي متقن', 'تنظيف شامل وعميق', 'تعطير وتعقيم كامل', 'فحص جودة نهائي'];

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
        <Card className="group relative overflow-hidden rounded-2xl shadow-sm border border-slate-200 bg-white hover:shadow-xl transition-all duration-500 flex flex-col">
            {/* Image section */}
            <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                    src="/images/wash/foam-wash.jpg"
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=800&auto=format&fit=crop';
                    }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
                        <IconComponent className="h-4 w-4" />
                        {category}
                    </span>
                </div>

                {/* Content overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 p-5">
                    <h3 className="text-2xl font-black text-white leading-snug drop-shadow-md">{name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-white/90 drop-shadow-sm">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-bold">{service.duration_minutes} دقيقة</span>
                    </div>
                </div>
            </div>

            {/* Content section */}
            <div className="p-6 flex flex-col flex-1">
                <p className="text-sm leading-relaxed text-slate-600 mb-6 line-clamp-3">
                    {service.description ||
                        'عناية احترافية بمواد عالية الجودة مع ضمان الرضا التام للحفاظ على تألق سيارتك.'}
                </p>

                {/* Features grid */}
                <div className="space-y-3 mb-8 flex-1">
                    {DEFAULT_FEATURES.map((feat) => (
                        <div key={feat} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-slate-900 shrink-0" />
                            {feat}
                        </div>
                    ))}
                </div>

                {/* Price and CTA section */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">يبدأ من</p>
                        <p className="text-2xl font-black text-slate-900">
                            {formatPrice(Number(service.base_price), currency)}
                        </p>
                    </div>
                    <Button size="lg" asChild className="bg-slate-900 text-white hover:bg-slate-800 h-12 w-12 rounded-xl shadow-sm transition-all font-bold">
                        <Link to="/book" aria-label={`احجز ${name}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
