import {
    useStorefrontProfile,
    useStorefrontServices,
    useStorefrontBranches,
} from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicHero } from '@/components/public/Hero';
import { TrustStrip } from '@/components/public/TrustStrip';
import { QueueStatus } from '@/components/public/QueueStatus';
import { ServiceCard } from '@/components/public/ServiceCard';
import { BranchesPreview } from '@/components/public/BranchesPreview';
import { PricingPreview } from '@/components/public/PricingPreview';
import { CorporateSection } from '@/components/public/CorporateSection';
import { PublicFooter } from '@/components/public/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Car, Coffee, Sparkles } from 'lucide-react';

const STEPS = [
    { step: '01', title: 'احجز موعدك', desc: 'اختر الخدمة والفرع والوقت المناسب عبر الموقع.', icon: CalendarDays },
    { step: '02', title: 'أحضر سيارتك', desc: 'توجّه إلى الفرع في الموعد المحدد وسنكون بانتظارك.', icon: Car },
    { step: '03', title: 'استرخِ قليلاً', desc: 'استرح في صالة الانتظار بينما يتولى الفريق العناية.', icon: Coffee },
    { step: '04', title: 'استلمها لامعة', desc: 'استلم سيارتك بعد فحص جودة وتشغيل منضبط.', icon: Sparkles },
];

export function HomePage() {
    const { data: profile } = useStorefrontProfile();
    const { data: services, isLoading: servicesLoading } = useStorefrontServices(6);
    const { data: branches } = useStorefrontBranches();

    return (
        <div className="sf-shell min-h-screen" dir="rtl">
            <PublicHeader profile={profile} />

            <main>
                <PublicHero profile={profile} featuredService={services?.[0]} />
                <TrustStrip />

                <section id="services" className="py-20 bg-white">
                    <div className="mx-auto max-w-7xl px-4 lg:px-8">
                        <div className="mb-12 max-w-2xl space-y-3">
                            <p className="sf-kicker">خدماتنا</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-[var(--inst-text)]">
                                خدمات تشغيلية <span className="text-[var(--brand-primary)]">واضحة الأسعار</span>
                            </h2>
                            <p className="text-[var(--inst-muted)] leading-relaxed">
                                باقات غسيل وتلميع بمعايير ثابتة — احجز الخدمة المناسبة لسيارتك مباشرة.
                            </p>
                        </div>

                        {servicesLoading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, i) => (
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
                </section>

                <QueueStatus />
                <BranchesPreview />
                <PricingPreview />
                <CorporateSection />

                <section className="py-20 bg-white" dir="rtl">
                    <div className="mx-auto max-w-7xl px-4 lg:px-8">
                        <div className="mb-12 text-center space-y-3">
                            <p className="sf-kicker">مسار الخدمة</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-[var(--inst-text)]">
                                أربع خطوات <span className="text-[var(--brand-primary)]">واضحة</span>
                            </h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {STEPS.map((item) => (
                                <div key={item.step} className="sf-card sf-card-accent rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="h-11 w-11 rounded-lg bg-[var(--inst-silver)] border border-[var(--inst-border)] flex items-center justify-center text-[var(--brand-primary)]">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm font-bold text-[var(--brand-primary)]">{item.step}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--inst-text)] mb-2">{item.title}</h3>
                                    <p className="text-[13px] text-[var(--inst-muted)] leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter profile={profile} branches={branches} />
        </div>
    );
}
