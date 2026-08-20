import { 
    Clock, 
    CheckCircle2, 
    ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StorefrontService } from '@/types/api';
import { formatPrice } from '@/hooks/useStorefront';

interface ServiceCardProps {
    service: StorefrontService;
    currency: string;
}

export function ServiceCard({ service, currency }: ServiceCardProps) {
    return (
        <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-500 hover:border-brand-secondary-20 hover:shadow-xl hover:-translate-y-1">
            <div className="relative h-56 overflow-hidden">
                <img 
                    src={`/images/wash/foam-wash.jpg`} 
                    alt={service.name_ar || service.name}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=800&auto=format&fit=crop';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                <div className="absolute top-5 left-5">
                    <Badge className="bg-white/95 backdrop-blur-md text-brand-primary border-none font-bold px-3 py-1 text-[10px] uppercase tracking-wider">
                        {service.category?.name || 'غسيل'}
                    </Badge>
                </div>

                <div className="absolute bottom-5 right-6 left-6">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-secondary transition-colors">{service.name_ar || service.name}</h3>
                    <div className="flex items-center gap-2 text-white/80">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{service.duration_minutes} MIN</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2 min-h-[2.5rem]">
                    {service.description || 'نستخدم أرقى أنواع الشامبو والمواد الكيميائية الآمنة لضمان نظافة وحماية سيارتك من العوامل الجوية.'}
                </p>

                <div className="space-y-3 mb-8">
                    {[
                        'غسيل خارجي شامبو',
                        'تنظيف إطارات ومحركات',
                        'تعطير وتعقيم داخلي',
                    ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-medium text-gray-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-brand-secondary" />
                            {feat}
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">Price starts at</p>
                        <p className="text-2xl font-bold text-brand-primary">
                            {formatPrice(Number(service.base_price), currency)}
                        </p>
                    </div>
                    <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-12 w-12 rounded-xl bg-brand-secondary-10 text-brand-secondary hover:bg-brand-secondary hover:text-white transition-all shadow-sm group-hover:shadow-md"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
