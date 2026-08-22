import { Link } from 'react-router-dom';
import { CreditCard, Droplets, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { getBranchAddress, getTenantDisplayName, getTenantPhone } from '@/hooks/useStorefront';
import type { StorefrontBranch, StorefrontProfile } from '@/types/api';

interface PublicFooterProps {
    profile?: StorefrontProfile | null;
    branches?: StorefrontBranch[] | null;
}

export function PublicFooter({ profile, branches }: PublicFooterProps) {
    const businessName = getTenantDisplayName(profile);
    const contactPhone = getTenantPhone(profile);
    const contactEmail = profile?.email ?? 'info@tammer.om';
    const primaryAddress = getBranchAddress(branches?.[0], profile);
    const currentYear = new Date().getFullYear();
    const tagline = profile?.branding?.tagline ?? 'عناية سيارات احترافية';

    return (
        <footer className="bg-white border-t border-brand-primary/10 pt-16 pb-8" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-4">
                    <div className="space-y-5">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white shadow-sm shadow-brand-primary/20">
                                <Droplets className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold tracking-tight text-brand-primary-dark">{businessName}</span>
                                <span className="text-[11px] font-semibold text-brand-primary/60">{tagline}</span>
                            </div>
                        </Link>
                        <p className="text-brand-primary/70 text-[13px] leading-relaxed max-w-xs">
                            عناية سيارات فائقة: دقة في التفاصيل، مواد عالية الجودة، وتجربة استثنائية من الحجز حتى التسليم.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[13px] font-bold text-brand-primary-dark mb-5">روابط سريعة</h4>
                        <ul className="space-y-3">
                            {[
                                { to: '/', label: 'الرئيسية' },
                                { to: '/services', label: 'الخدمات' },
                                { to: '/pricing', label: 'الأسعار' },
                                { to: '/branches', label: 'الفروع' },
                                { to: '/book', label: 'حجز موعد' },
                                { to: '/queue', label: 'حالة الطابور' },
                                { to: '/track', label: 'تتبع الطلب' },
                                { to: '/login', label: 'دخول الموظفين' },
                            ].map((item) => (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        className="text-[13px] font-medium text-brand-primary/60 hover:text-brand-primary transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[13px] font-bold text-brand-primary-dark mb-5">التواصل</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href={`tel:${contactPhone}`} className="flex items-start gap-3 group">
                                    <Phone className="h-4 w-4 mt-0.5 text-brand-primary/40 group-hover:text-brand-primary transition-colors" />
                                    <div>
                                        <p className="text-[11px] font-semibold text-brand-primary/40 mb-0.5">الهاتف</p>
                                        <p className="font-bold text-sm text-brand-primary-dark">{contactPhone}</p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href={`mailto:${contactEmail}`} className="flex items-start gap-3 group">
                                    <Mail className="h-4 w-4 mt-0.5 text-brand-primary/40 group-hover:text-brand-primary transition-colors" />
                                    <div>
                                        <p className="text-[11px] font-semibold text-brand-primary/40 mb-0.5">البريد</p>
                                        <p className="font-bold text-sm text-brand-primary-dark">{contactEmail}</p>
                                    </div>
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-0.5 text-brand-primary/40" />
                                <div>
                                    <p className="text-[11px] font-semibold text-brand-primary/40 mb-0.5">العنوان</p>
                                    <p className="font-medium text-sm text-brand-primary-dark">{primaryAddress}</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[13px] font-bold text-brand-primary-dark mb-5">التزامنا</h4>
                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <ShieldCheck className="h-4 w-4 text-brand-primary" />
                                    <span className="text-[13px] font-bold text-brand-primary-dark">ضمان الجودة</span>
                                </div>
                                <p className="text-[12px] text-brand-primary/60 leading-relaxed">
                                    مواد عالية الجودة وعناية فائقة لحماية الطلاء والمقصورة.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <CreditCard className="h-4 w-4 text-brand-primary" />
                                    <span className="text-[13px] font-bold text-brand-primary-dark">دفع آمن</span>
                                </div>
                                <p className="text-[12px] text-brand-primary/60 leading-relaxed">
                                    خيارات دفع واضحة تناسب الأفراد والشركات.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-brand-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-brand-primary/50 text-[12px] font-medium">
                        © {currentYear} {businessName}. جميع الحقوق محفوظة.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="/track" className="text-[12px] font-semibold text-brand-primary/50 hover:text-brand-primary transition-colors">
                            تتبع طلبي
                        </Link>
                        <Link to="/book" className="text-[12px] font-semibold text-brand-primary/50 hover:text-brand-primary transition-colors">
                            احجز الآن
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
