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
    { step: '04', title: 'استلمها لامعة', desc: 'استلم سيارتك بعد فحص جودة دقيق.', icon: Sparkles },
];

export function HomePage() {
    const { data: profile } = useStorefrontProfile();
    const { data: services, isLoading: servicesLoading } = useStorefrontServices(6);
    const { data: branches } = useStorefrontBranches();

    return (
        <div className="min-h-screen bg-brand-primary/[0.02] font-sans" dir="rtl">
            <PublicHeader profile={profile} />

            <main>
                <PublicHero profile={profile} featuredService={services?.[0]} />
                <TrustStrip />

                <section id="services" className="py-24 bg-white">
                    <div className="mx-auto max-w-7xl px-4 lg:px-8">
                        <div className="mb-16 max-w-2xl space-y-4">
                            <p className="text-sm font-bold tracking-widest uppercase text-brand-primary/40">خدماتنا</p>
                            <h2 className="text-4xl md:text-5xl font-black text-brand-primary-dark tracking-tight">
                                عناية فائقة <span className="text-brand-primary/30">وأسعار واضحة</span>
                            </h2>
                            <p className="text-lg text-brand-primary/70 leading-relaxed">
                                باقات غسيل وتلميع بعناية فائقة — احجز الخدمة المناسبة لسيارتك مباشرة.
                            </p>
                        </div>

                        {servicesLoading ? (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-[420px] rounded-2xl" />
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
                </section>

                <QueueStatus />
                <BranchesPreview />
                <PricingPreview />
                <CorporateSection />

                <section className="py-24 bg-brand-primary/[0.02]" dir="rtl">
                    <div className="mx-auto max-w-7xl px-4 lg:px-8">
                        <div className="mb-16 text-center space-y-4">
                            <p className="text-sm font-bold tracking-widest uppercase text-brand-primary/40">مسار الخدمة</p>
                            <h2 className="text-4xl md:text-5xl font-black text-brand-primary-dark tracking-tight">
                                أربع خطوات <span className="text-brand-primary/30">واضحة</span>
                            </h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {STEPS.map((item) => (
                                <div key={item.step} className="bg-white rounded-2xl p-8 border border-brand-primary/10 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="h-12 w-12 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-primary">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-bold text-brand-primary/20">{item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-primary-dark mb-3">{item.title}</h3>
                                    <p className="text-sm text-brand-primary/60 leading-relaxed">{item.desc}</p>
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
