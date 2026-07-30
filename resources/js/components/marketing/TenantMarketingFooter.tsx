import { Link } from 'react-router-dom';
import { CalendarDays, Droplets, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ARABIC_DAYS, getBranchAddress, getTenantBranding, getTenantDisplayName, getTenantPhone } from '@/hooks/useStorefront';
import type { StorefrontBranch, StorefrontProfile } from '@/types/api';

interface TenantMarketingFooterProps {
    profile?: StorefrontProfile | null;
    branches?: StorefrontBranch[];
}

function formatWorkingHoursSummary(branch?: StorefrontBranch): string {
    if (!branch?.working_hours?.length) {
        return 'يومياً — يرجى التواصل للتأكيد';
    }

    const openDays = branch.working_hours.filter((hour) => !hour.is_closed && hour.opens_at && hour.closes_at);

    if (openDays.length === 0) {
        return 'يرجى التواصل لمعرفة ساعات العمل';
    }

    const first = openDays[0];

    return `${first.opens_at} – ${first.closes_at}`;
}

export function TenantMarketingFooter({ profile, branches }: TenantMarketingFooterProps) {
    const year = new Date().getFullYear();
    const branding = getTenantBranding(profile);
    const businessName = getTenantDisplayName(profile);
    const primaryBranch = branches?.[0];
    const social = branding.social ?? {};
    const contactPhone = getTenantPhone(profile);
    const contactAddress = getBranchAddress(primaryBranch, profile);

    return (
        <footer className="border-t bg-muted/30">
            <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            {branding.logoUrl ? (
                                <img
                                    src={branding.logoUrl}
                                    alt={businessName}
                                    className="h-10 w-10 rounded-lg object-cover"
                                />
                            ) : (
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                                    style={{ backgroundColor: branding.primaryColor }}
                                >
                                    <Droplets className="h-5 w-5" />
                                </div>
                            )}
                            <span className="font-bold">{businessName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {branding.tagline ?? 'غسيل سيارات احترافي بجودة عالية وخدمة سريعة.'}
                        </p>
                        <Button asChild size="sm" style={{ backgroundColor: branding.primaryColor }}>
                            <Link to="/booking">
                                <CalendarDays className="me-2 h-4 w-4" />
                                احجز موعدك الآن
                            </Link>
                        </Button>
                    </div>

                    <div>
                        <h4 className="mb-3 text-sm font-semibold">تواصل معنا</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" />
                                <a href={`tel:${contactPhone}`} className="hover:text-foreground">
                                    {contactPhone}
                                </a>
                            </li>
                            {profile?.email && (
                                <li className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <a href={`mailto:${profile.email}`} className="hover:text-foreground">
                                        {profile.email}
                                    </a>
                                </li>
                            )}
                            <li className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{contactAddress}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-3 text-sm font-semibold">ساعات العمل</h4>
                        {primaryBranch?.working_hours?.length ? (
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {primaryBranch.working_hours.map((hour) => (
                                    <li key={hour.id} className="flex justify-between gap-4">
                                        <span>{ARABIC_DAYS[hour.day_of_week] ?? `يوم ${hour.day_of_week}`}</span>
                                        <span>
                                            {hour.is_closed
                                                ? 'مغلق'
                                                : `${hour.opens_at ?? '--'} – ${hour.closes_at ?? '--'}`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">{formatWorkingHoursSummary(primaryBranch)}</p>
                        )}
                    </div>

                    <div>
                        <h4 className="mb-3 text-sm font-semibold">روابط</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/booking" className="text-muted-foreground hover:text-foreground">
                                    حجز موعد
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-muted-foreground hover:text-foreground">
                                    دخول الموظفين
                                </Link>
                            </li>
                        </ul>
                        {(social.instagram || social.facebook) && (
                            <div className="mt-4 flex gap-2">
                                {social.instagram && (
                                    <a
                                        href={social.instagram}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
                                    >
                                        <Instagram className="h-4 w-4" />
                                    </a>
                                )}
                                {social.facebook && (
                                    <a
                                        href={social.facebook}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
                                    >
                                        <Facebook className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
                    <p>
                        © {year} {businessName}. جميع الحقوق محفوظة.
                    </p>
                    <p>مدعوم من تمير واش</p>
                </div>
            </div>
        </footer>
    );
}
