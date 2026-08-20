import { Link } from 'react-router-dom';
import { 
    Droplets, 
    Facebook, 
    Instagram, 
    Linkedin, 
    Mail, 
    Phone, 
    Twitter, 
    ChevronLeft,
    ShieldCheck,
    CreditCard
} from 'lucide-react';
import { getTenantDisplayName, getTenantPhone } from '@/hooks/useStorefront';
import type { StorefrontProfile, Branch } from '@/types/api';

interface PublicFooterProps {
    profile?: StorefrontProfile | null;
    branches?: Branch[] | null;
}

export function PublicFooter({ profile }: PublicFooterProps) {
    const businessName = getTenantDisplayName(profile);
    const contactPhone = getTenantPhone(profile);

    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-[#002d2d] pt-24 pb-12 text-white overflow-hidden" dir="rtl">
            <div className="absolute top-0 right-0 h-96 w-96 bg-teal-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid gap-16 lg:grid-cols-4 lg:gap-8">
                    <div className="space-y-8">
                        <Link to="/" className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 shadow-xl shadow-teal-900/20">
                                <Droplets className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold tracking-tight">{businessName}</span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-500/60">Professional Car Care</span>
                            </div>
                        </Link>
                        <p className="text-teal-50/50 text-sm leading-relaxed max-w-xs">
                            نحن نضع معايير جديدة للعناية بالسيارات في سلطنة عمان، من خلال دمج الخبرة الفنية مع أرقى مواد الحماية العالمية.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
                                <a 
                                    key={i} 
                                    href="#" 
                                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-teal-600 hover:text-white transition-all duration-300 border border-white/5"
                                >
                                    <Icon className="h-4 w-4 opacity-70" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-500/80 mb-10 flex items-center gap-3">
                            <span className="h-px w-8 bg-teal-500/30" />
                            Quick Links
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { to: '/', label: 'الرئيسية' },
                                { to: '/services', label: 'خدماتنا' },
                                { to: '/pricing', label: 'الأسعار' },
                                { to: '/branches', label: 'الفروع' },
                                { to: '/book', label: 'حجز موعد' },
                                { to: '/track', label: 'تتبع الطلب' },
                            ].map((item) => (
                                <li key={item.to}>
                                    <Link 
                                        to={item.to} 
                                        className="text-teal-50/50 hover:text-teal-400 flex items-center gap-2 group transition-colors text-sm font-medium"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-500/80 mb-10 flex items-center gap-3">
                            <span className="h-px w-8 bg-teal-500/30" />
                            Contact
                        </h4>
                        <ul className="space-y-6">
                            <li>
                                <a href={`tel:${contactPhone}`} className="flex items-center gap-5 group">
                                    <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-teal-600 group-hover:text-white transition-all border border-white/5 shadow-sm">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-teal-500/50 mb-0.5">Contact Number</p>
                                        <p className="font-bold text-base">{contactPhone}</p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:info@tammer.om" className="flex items-center gap-5 group">
                                    <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-teal-600 group-hover:text-white transition-all border border-white/5 shadow-sm">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-teal-500/50 mb-0.5">Email Address</p>
                                        <p className="font-bold text-base">info@tammer.om</p>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="lg:ps-8">
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-teal-500/80 mb-10 flex items-center gap-3">
                            <span className="h-px w-8 bg-teal-500/30" />
                            Premium Care
                        </h4>
                        <div className="space-y-5">
                            <div className="p-5 rounded-xl bg-white/5 border border-white/5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2.5">
                                    <ShieldCheck className="h-4 w-4 text-teal-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Quality Assurance</span>
                                </div>
                                <p className="text-[11px] text-teal-50/30 leading-relaxed font-medium">نضمن لك أفضل حماية لطلاء سيارتك باستخدام مواد عالية الجودة.</p>
                            </div>
                            <div className="p-5 rounded-xl bg-white/5 border border-white/5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2.5">
                                    <CreditCard className="h-4 w-4 text-teal-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Secure Payment</span>
                                </div>
                                <p className="text-[11px] text-teal-50/30 leading-relaxed font-medium">خيارات دفع متعددة وآمنة تناسب احتياجاتك.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-teal-50/20 text-[10px] font-bold uppercase tracking-widest">
                        © {currentYear} {businessName}. All Rights Reserved. 
                    </p>
                    <div className="flex items-center gap-10">
                        <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-50/20 hover:text-teal-400 transition-colors">Privacy</a>
                        <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-50/20 hover:text-teal-400 transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
