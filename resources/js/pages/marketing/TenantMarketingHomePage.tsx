import { Link } from 'react-router-dom';
import {
    Building2,
    CalendarDays,
    Car,
    Clock,
    Droplets,
    MapPin,
    Phone,
    Sparkles,
    Star,
} from 'lucide-react';
import { TenantMarketingFooter } from '@/components/marketing/TenantMarketingFooter';
import { TenantMarketingHeader } from '@/components/marketing/TenantMarketingHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    formatPrice,
    getBranchAddress,
    getBranchPhone,
    getTenantBranding,
    getTenantDisplayName,
    getTenantPhone,
    useStorefrontBranches,
    useStorefrontProfile,
    useStorefrontServices,
} from '@/hooks/useStorefront';

export function TenantMarketingHomePage() {
    const { data: profile, isLoading: profileLoading } = useStorefrontProfile();
    const { data: services, isLoading: servicesLoading } = useStorefrontServices(6);
    const { data: branches, isLoading: branchesLoading } = useStorefrontBranches();

    const branding = getTenantBranding(profile);
    const businessName = getTenantDisplayName(profile);
    const contactPhone = getTenantPhone(profile);
    const currency = profile?.currency ?? 'OMR';

    const aboutText =
        branding.about ??
        `${businessName} تقدّم خدمات غسيل وتلميع سيارات بجودة عالية، مع فريق محترف ومواعيد مرنة تناسب جدولك.`;

    const stats = [
        {
            value: String(profile?.stats?.services ?? services?.length ?? '—'),
            label: 'خدمة متاحة',
            icon: Sparkles,
        },
        {
            value: String(profile?.stats?.branches ?? branches?.length ?? '—'),
            label: 'فرع',
            icon: Building2,
        },
        {
            value: profile?.vat_rate ? `${profile.vat_rate}%` : '5%',
            label: 'ض.ق.م',
            icon: Star,
        },
        {
            value: '24/7',
            label: 'حجز أونلاين',
            icon: CalendarDays,
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <TenantMarketingHeader profile={profile} />

            <main>
                {/* Hero */}
                <section
                    className="relative overflow-hidden border-b"
                    style={{
                        background: `linear-gradient(135deg, ${branding.primaryColor}12 0%, transparent 55%)`,
                    }}
                >
                    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:px-6 lg:py-24">
                        <div className="flex flex-col justify-center">
                            <Badge
                                variant="secondary"
                                className="mb-4 w-fit"
                                style={{ color: branding.primaryColor, borderColor: `${branding.primaryColor}44` }}
                            >
                                <Droplets className="me-1 h-3 w-3" />
                                {branding.tagline ?? 'غسيل سيارات احترافي'}
                            </Badge>

                            {profileLoading ? (
                                <Skeleton className="mb-4 h-12 w-full max-w-lg" />
                            ) : (
                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{businessName}</h1>
                            )}

                            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{aboutText}</p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Button size="lg" asChild style={{ backgroundColor: branding.primaryColor }}>
                                    <Link to="/booking">
                                        <CalendarDays className="me-2 h-5 w-5" />
                                        احجز موعد غسيل سيارتك
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <a href="#services">استعرض الخدمات</a>
                                </Button>
                            </div>

                            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <a href={`tel:${contactPhone}`} className="hover:text-foreground">
                                    {contactPhone}
                                </a>
                            </p>
                        </div>

                        <div className="relative hidden lg:block">
                            <Card className="border-2 shadow-xl" style={{ borderColor: `${branding.primaryColor}33` }}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Car className="h-5 w-5" style={{ color: branding.primaryColor }} />
                                        لماذا {businessName}؟
                                    </CardTitle>
                                    <CardDescription>تجربة غسيل سريعة، نظيفة، وموثوقة</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        'حجز موعد أونلاين في دقائق',
                                        'فريق محترف ومعدات حديثة',
                                        'أسعار واضحة شاملة الضريبة',
                                        'فروع متعددة وساعات مرنة',
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3 text-sm">
                                            <div
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                                                style={{ backgroundColor: `${branding.primaryColor}18` }}
                                            >
                                                <Sparkles className="h-4 w-4" style={{ color: branding.primaryColor }} />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="border-b bg-muted/20 py-10">
                    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 lg:grid-cols-4 lg:px-6">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <stat.icon
                                    className="mx-auto mb-2 h-6 w-6"
                                    style={{ color: branding.primaryColor }}
                                />
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Services */}
                <section id="services" className="py-16">
                    <div className="mx-auto max-w-6xl px-4 lg:px-6">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold tracking-tight">خدماتنا</h2>
                            <p className="mt-3 text-muted-foreground">اختر الخدمة المناسبة لسيارتك</p>
                        </div>

                        {servicesLoading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-40 rounded-xl" />
                                ))}
                            </div>
                        ) : services && services.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {services.map((service) => (
                                    <Card key={service.id} className="transition-shadow hover:shadow-md">
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                {service.name_ar || service.name}
                                            </CardTitle>
                                            {service.category?.name && (
                                                <Badge variant="secondary">{service.category.name}</Badge>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                                                {service.description ?? 'خدمة غسيل وتلميع بجودة عالية.'}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="text-lg font-bold"
                                                    style={{ color: branding.primaryColor }}
                                                >
                                                    {formatPrice(Number(service.base_price), currency)}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {service.duration_minutes} د
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-10 text-center text-muted-foreground">
                                    الخدمات قيد التحديث — تواصل معنا للحجز مباشرة.
                                </CardContent>
                            </Card>
                        )}

                        <div className="mt-10 text-center">
                            <Button size="lg" asChild style={{ backgroundColor: branding.primaryColor }}>
                                <Link to="/booking">احجز الآن</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section id="about" className="border-y bg-muted/20 py-16">
                    <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:px-6">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">عن {businessName}</h2>
                            <p className="mt-4 leading-relaxed text-muted-foreground">{aboutText}</p>
                            <p className="mt-4 leading-relaxed text-muted-foreground">
                                نحرص على تقديم تجربة مريحة من لحظة الحجز حتى استلام سيارتك نظيفة ولامعة. احجز
                                موعدك أونلاين ووفّر وقت الانتظار.
                            </p>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>ماذا يقول عملاؤنا</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    {
                                        quote: 'خدمة ممتازة وسريعة، سيارتي خرجت كالجديدة.',
                                        author: 'أحمد المعمري',
                                    },
                                    {
                                        quote: 'الحجز أونلاين وفّر عليّ وقت الانتظار.',
                                        author: 'سارة البلوشية',
                                    },
                                ].map((item) => (
                                    <blockquote key={item.author} className="rounded-lg border bg-background p-4">
                                        <div className="mb-2 flex gap-1">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className="h-4 w-4 fill-amber-400 text-amber-400"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm">&ldquo;{item.quote}&rdquo;</p>
                                        <footer className="mt-2 text-xs text-muted-foreground">— {item.author}</footer>
                                    </blockquote>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Location & Hours */}
                <section id="location" className="py-16">
                    <div className="mx-auto max-w-6xl px-4 lg:px-6">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold tracking-tight">الموقع وساعات العمل</h2>
                            <p className="mt-3 text-muted-foreground">زُرنا في أي من فروعنا</p>
                        </div>

                        {branchesLoading ? (
                            <Skeleton className="h-48 rounded-xl" />
                        ) : branches && branches.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {branches.map((branch) => (
                                    <Card key={branch.id}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5" style={{ color: branding.primaryColor }} />
                                                {branch.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {getBranchAddress(branch, profile)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                                            <p className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                <a href={`tel:${getBranchPhone(branch, profile)}`} className="hover:text-foreground">
                                                    {getBranchPhone(branch, profile)}
                                                </a>
                                            </p>
                                            {branch.working_hours && branch.working_hours.length > 0 && (
                                                <div className="flex items-start gap-2">
                                                    <Clock className="mt-0.5 h-4 w-4" />
                                                    <span>
                                                        {branch.working_hours
                                                            .filter((hour) => !hour.is_closed)
                                                            .slice(0, 1)
                                                            .map((hour) => `${hour.opens_at} – ${hour.closes_at}`)
                                                            .join('') || 'يرجى التواصل'}
                                                    </span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" style={{ color: branding.primaryColor }} />
                                        {businessName}
                                    </CardTitle>
                                    <CardDescription>{getBranchAddress(undefined, profile)}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <a href={`tel:${contactPhone}`} className="hover:text-foreground">
                                            {contactPhone}
                                        </a>
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section
                    className="py-16"
                    style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}cc 100%)` }}
                >
                    <div className="mx-auto max-w-3xl px-4 text-center text-white lg:px-6">
                        <h2 className="text-3xl font-bold tracking-tight">جاهز لغسيل سيارتك؟</h2>
                        <p className="mt-4 text-lg text-white/90">
                            احجز موعدك الآن واستمتع بخدمة سريعة واحترافية في {businessName}.
                        </p>
                        <Button size="lg" variant="secondary" className="mt-8" asChild>
                            <Link to="/booking">
                                <CalendarDays className="me-2 h-5 w-5" />
                                احجز موعد غسيل سيارتك
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>

            <TenantMarketingFooter profile={profile} branches={branches} />
        </div>
    );
}
