import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Navigation, Phone } from 'lucide-react';
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
        <section className="py-20 bg-white" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="mb-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                    <div className="max-w-2xl space-y-3">
                        <p className="sf-kicker">شبكة الفروع</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--inst-text)]">
                            فروع تُدار <span className="text-[var(--brand-primary)]">بمعيار واحد</span>
                        </h2>
                        <p className="text-[var(--inst-muted)] leading-relaxed">
                            اختر أقرب فرع واحجز مسبقاً، أو تابع حالة الطابور قبل الوصول.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="rounded-lg font-bold border-[var(--inst-border)] text-[var(--inst-text)] h-11 px-6"
                    >
                        <Link to="/branches">كل الفروع</Link>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <Skeleton key={index} className="h-64 rounded-xl" />
                        ))}
                    </div>
                ) : list.length === 0 ? (
                    <Card className="sf-card rounded-xl p-10 text-center shadow-none">
                        <p className="font-semibold text-[var(--inst-text)]">لا توجد فروع معروضة حالياً.</p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {list.map((branch) => {
                            const phone = getBranchPhone(branch, profile);
                            const address = getBranchAddress(branch, profile);
                            const hours = formatBranchHours(branch);
                            const mapsQuery = encodeURIComponent(address);

                            return (
                                <Card
                                    key={branch.id}
                                    className="sf-card sf-card-accent rounded-xl shadow-none overflow-hidden flex flex-col"
                                >
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-bold text-[var(--inst-text)] mb-2">{branch.name}</h3>
                                        <p className="text-[13px] text-[var(--inst-muted)] flex items-start gap-2 leading-relaxed">
                                            <MapPin className="h-4 w-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                                            {address}
                                        </p>

                                        <div className="grid sm:grid-cols-2 gap-3 mt-6 mb-6">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--inst-silver)] border border-[var(--inst-border)]">
                                                <Phone className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                                                <div>
                                                    <p className="text-[11px] font-semibold text-[var(--inst-muted)]">الهاتف</p>
                                                    <p className="text-sm font-bold text-[var(--inst-text)]">{phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--inst-silver)] border border-[var(--inst-border)]">
                                                <Clock className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                                                <div>
                                                    <p className="text-[11px] font-semibold text-[var(--inst-muted)]">ساعات العمل</p>
                                                    <p className="text-sm font-bold text-[var(--inst-text)]">{hours}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center gap-3">
                                            <Button asChild className="sf-cta-accent flex-1 h-11 rounded-lg font-bold shadow-none">
                                                <a
                                                    href={`https://maps.google.com/?q=${mapsQuery}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Navigation className="me-2 h-4 w-4" />
                                                    الاتجاهات
                                                </a>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-11 px-4 rounded-lg border-[var(--inst-border)] font-bold"
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
