import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Navigation, Phone, Building2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    formatBranchHours,
    getBranchAddress,
    getBranchPhone,
    useStorefrontBranches,
    useStorefrontProfile,
} from '@/hooks/useStorefront';

export function BranchesPreview() {
    const { data: profile } = useStorefrontProfile();
    const { data: branches, isLoading } = useStorefrontBranches();
    const list = branches ?? [];

    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-[var(--inst-silver)]" dir="rtl">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--brand-primary)]/8 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header */}
                <div className="mb-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-secondary)]/10 border border-[var(--brand-secondary)]/20">
                            <Building2 className="h-4 w-4 text-[var(--brand-secondary)]" />
                            <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">شبكة فروعنا</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--inst-text)]">
                            فروع موزعة بعناية
                            <br />
                            <span className="bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] bg-clip-text text-transparent">لسهولة وصولك</span>
                        </h2>
                        <p className="text-lg text-[var(--inst-muted)] leading-relaxed max-w-2xl">
                            جميع فروعنا مجهزة بأحدث التجهيزات وتدار بمعايير واحدة لضمان خدمة متميزة في كل مكان.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="rounded-xl font-bold border-[var(--inst-border)] text-[var(--inst-text)] h-12 px-7 hover:bg-[var(--brand-primary)]/10 transition-all"
                    >
                        <Link to="/branches">
                            عرض جميع الفروع
                            <ArrowRight className="ms-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>

                {/* Branches Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <Skeleton key={index} className="h-72 rounded-2xl" />
                        ))}
                    </div>
                ) : list.length === 0 ? (
                    <Card className="p-12 rounded-2xl text-center shadow-none bg-white border border-[var(--inst-border)]">
                        <p className="font-bold text-lg text-[var(--inst-text)]">لا توجد فروع معروضة حالياً.</p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {list.map((branch) => {
                            const phone = getBranchPhone(branch, profile);
                            const address = getBranchAddress(branch, profile);
                            const hours = formatBranchHours(branch);
                            const mapsQuery = encodeURIComponent(address);

                            return (
                                <Card
                                    key={branch.id}
                                    className="sf-card rounded-2xl shadow-none overflow-hidden flex flex-col border border-[var(--inst-border)] hover:shadow-xl hover:border-[var(--brand-primary)]/30 transition-all duration-300 group"
                                >
                                    {/* Top accent bar */}
                                    <div className="h-1 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)]" />

                                    {/* Content */}
                                    <div className="p-8 flex flex-col flex-1">
                                        {/* Title */}
                                        <div className="mb-6 pb-6 border-b border-[var(--inst-border)]">
                                            <h3 className="text-2xl font-black text-[var(--inst-text)] mb-2">{branch.name}</h3>
                                            <p className="text-sm text-[var(--inst-muted)] flex items-start gap-2 leading-relaxed font-medium">
                                                <MapPin className="h-4 w-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                                                {address}
                                            </p>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid sm:grid-cols-2 gap-4 mb-8 flex-1">
                                            <div className="p-4 rounded-xl bg-[var(--inst-silver)] border border-[var(--inst-border)] group-hover:border-[var(--brand-primary)]/20 transition-all">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <Phone className="h-4 w-4 text-[var(--brand-primary)]" />
                                                    <p className="text-xs font-bold text-[var(--inst-muted)] uppercase tracking-wider">الهاتف</p>
                                                </div>
                                                <p className="text-lg font-black text-[var(--inst-text)]">{phone}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-[var(--inst-silver)] border border-[var(--inst-border)] group-hover:border-[var(--brand-primary)]/20 transition-all">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <Clock className="h-4 w-4 text-[var(--brand-primary)]" />
                                                    <p className="text-xs font-bold text-[var(--inst-muted)] uppercase tracking-wider">الساعات</p>
                                                </div>
                                                <p className="text-sm font-bold text-[var(--inst-text)]">{hours}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 pt-6 border-t border-[var(--inst-border)]">
                                            <Button asChild className="flex-1 sf-cta-accent h-11 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                                                <a
                                                    href={`https://maps.google.com/?q=${mapsQuery}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Navigation className="me-2 h-4 w-4" />
                                                    اتجاهات
                                                </a>
                                            </Button>
                                            <Button
                                                asChild
                                                className="flex-1 h-11 px-4 rounded-xl font-bold border-[var(--inst-border)] hover:bg-[var(--brand-primary)]/10 transition-all"
                                                variant="outline"
                                            >
                                                <Link to="/book">
                                                    <CalendarDays className="me-2 h-4 w-4" />
                                                    احجز
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
