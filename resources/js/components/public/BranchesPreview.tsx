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
        <section className="py-24 bg-brand-primary/[0.02]" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header */}
                <div className="mb-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/5 border border-brand-primary/10 shadow-sm">
                            <Building2 className="h-4 w-4 text-brand-primary" />
                            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">شبكة فروعنا</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-brand-primary-dark tracking-tight">
                            فروع موزعة بعناية
                            <br />
                            <span className="text-brand-primary/30">لسهولة وصولك</span>
                        </h2>
                        <p className="text-lg text-brand-primary/70 leading-relaxed max-w-2xl">
                            جميع فروعنا مجهزة بأحدث التجهيزات وتدار بعناية فائقة لضمان خدمة متميزة في كل مكان.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="rounded-xl font-bold border-brand-primary/20 text-brand-primary-dark h-12 px-7 hover:bg-brand-primary/5 transition-all bg-white shadow-sm"
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
                    <Card className="p-12 rounded-2xl text-center shadow-sm bg-white border border-brand-primary/10">
                        <p className="font-bold text-lg text-brand-primary-dark">لا توجد فروع معروضة حالياً.</p>
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
                                    className="rounded-3xl shadow-sm overflow-hidden flex flex-col border border-brand-primary/10 hover:shadow-md transition-all duration-300 bg-white"
                                >
                                    {/* Content */}
                                    <div className="p-8 flex flex-col flex-1">
                                        {/* Title */}
                                        <div className="mb-6 pb-6 border-b border-brand-primary/5">
                                            <h3 className="text-2xl font-black text-brand-primary-dark mb-2">{branch.name}</h3>
                                            <p className="text-sm text-brand-primary/70 flex items-start gap-2 leading-relaxed font-medium">
                                                <MapPin className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                                                {address}
                                            </p>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid sm:grid-cols-2 gap-4 mb-8 flex-1">
                                            <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 transition-colors group-hover:bg-brand-primary/10">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <Phone className="h-4 w-4 text-brand-primary" />
                                                    <p className="text-xs font-bold text-brand-primary/40 uppercase tracking-wider">الهاتف</p>
                                                </div>
                                                <p className="text-lg font-black text-brand-primary-dark">{phone}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 transition-colors group-hover:bg-brand-primary/10">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <Clock className="h-4 w-4 text-brand-primary" />
                                                    <p className="text-xs font-bold text-brand-primary/40 uppercase tracking-wider">الساعات</p>
                                                </div>
                                                <p className="text-sm font-bold text-brand-primary-dark">{hours}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 pt-6 border-t border-brand-primary/5">
                                            <Button asChild className="flex-1 bg-brand-primary text-white hover:bg-brand-primary-dark h-12 rounded-xl font-bold shadow-md shadow-brand-primary/20 transition-all">
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
                                                className="flex-1 h-12 px-4 rounded-xl font-bold border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 transition-all bg-white shadow-sm"
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
