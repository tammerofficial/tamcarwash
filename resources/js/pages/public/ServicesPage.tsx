import { useStorefrontProfile, useStorefrontServices } from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { ServiceCard } from '@/components/public/ServiceCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function ServicesPage() {
    const { data: profile } = useStorefrontProfile();
    const { data: services, isLoading } = useStorefrontServices();

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <PublicHeader profile={profile} />
            <main className="pt-48 pb-24">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="mb-20 text-center space-y-5 max-w-2xl mx-auto">
                        <Badge className="bg-teal-50 text-teal-700 border-none font-bold text-[10px] px-4 py-1 tracking-widest uppercase">
                            Premium Selection
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#004d4d]">
                            كافة <span className="text-teal-600">الخدمات</span>
                        </h1>
                        <p className="text-gray-500 text-lg leading-relaxed opacity-80">
                            اختر من بين باقاتنا المتنوعة المصممة خصيصاً لتلبي احتياجات سيارتك وتحمي قيمتها.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-[450px] rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {services?.map((service) => (
                                <ServiceCard 
                                    key={service.id} 
                                    service={service} 
                                    currency={profile?.currency ?? 'OMR'} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <PublicFooter profile={profile} />
        </div>
    );
}
