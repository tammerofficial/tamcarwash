import { 
    useStorefrontProfile, 
    useStorefrontServices, 
    useStorefrontBranches 
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function HomePage() {
    const { data: profile } = useStorefrontProfile();
    const { data: services, isLoading: servicesLoading } = useStorefrontServices(6);
    const { data: branches } = useStorefrontBranches();

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <PublicHeader profile={profile} />

            <main>
                <PublicHero />
                <TrustStrip />

                <section id="services" className="py-24 bg-gray-50/30">
                    <div className="mx-auto max-w-7xl px-4 lg:px-8">
                        <div className="mb-20 text-center max-w-3xl mx-auto space-y-5">
                            <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-none font-bold text-[10px] px-4 py-1 tracking-widest uppercase">
                                Our Services
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-bold text-[#004d4d]">
                                خدماتنا <span className="text-teal-600">المتميزة</span>
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed opacity-80">
                                نقدم باقة متكاملة من خدمات غسيل وتلميع السيارات بأعلى معايير الجودة والاحترافية.
                            </p>
                        </div>

                        {servicesLoading ? (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, i) => (
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
                </section>

                <QueueStatus />
                <BranchesPreview />
                <PricingPreview />
                <CorporateSection />

                <section className="py-32 bg-white" dir="rtl">
                    <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center">
                        <div className="mb-24 space-y-5">
                            <Badge className="bg-teal-50 text-teal-700 border-none font-bold text-[10px] px-4 py-1 uppercase tracking-widest">
                                The Experience
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-bold text-[#004d4d]">
                                خطوات بسيطة لسيارة <span className="text-teal-600">كالجديدة</span>
                            </h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-16 relative">
                            {/* Connection Lines (Desktop) */}
                            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gray-100 hidden lg:block" />
                            
                            {[
                                { step: '01', title: 'احجز موعدك', desc: 'اختر الخدمة والفرع والموعد المناسب لك أونلاين.' },
                                { step: '02', title: 'أحضر سيارتك', desc: 'توجه إلى الفرع في الموعد المحدد وسنكون بانتظارك.' },
                                { step: '03', title: 'استرخِ قليلاً', desc: 'استمتع بقهوتك في صالة الانتظار بينما نهتم بسيارتك.' },
                                { step: '04', title: 'استلمها لامعة', desc: 'استلم سيارتك نظيفة ومحمية بأفضل المواد.' },
                            ].map((item, i) => (
                                <div key={i} className="relative z-10 space-y-8 group">
                                    <div className="h-20 w-20 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto text-2xl font-bold text-teal-600 transition-all duration-500 group-hover:bg-teal-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-teal-900/10">
                                        {item.step}
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xl font-bold text-gray-900">{item.title}</h4>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
                                    </div>
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
