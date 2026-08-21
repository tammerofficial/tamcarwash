import { useStorefrontProfile, useStorefrontServices } from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { ServiceCard } from '@/components/public/ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';

export function ServicesPage() {
    const { data: profile } = useStorefrontProfile();
    const { data: services, isLoading } = useStorefrontServices();

    return (
        <div className="sf-shell min-h-screen" dir="rtl">
            <PublicHeader profile={profile} />
            <main className="pt-28 pb-20">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="mb-12 max-w-2xl space-y-3">
                        <p className="sf-kicker">الخدمات</p>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--inst-text)]">
                            كافة <span className="text-[var(--brand-primary)]">الخدمات</span>
                        </h1>
                        <p className="text-[var(--inst-muted)] leading-relaxed">
                            اختر الخدمة المناسبة ثم أكمل الحجز. الأسعار بالريال العماني وواضحة قبل التأكيد.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-[420px] rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
