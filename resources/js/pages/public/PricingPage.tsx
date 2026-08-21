import { useStorefrontProfile } from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { PricingPreview } from '@/components/public/PricingPreview';

export function PricingPage() {
    const { data: profile } = useStorefrontProfile();

    return (
        <div className="sf-shell min-h-screen" dir="rtl">
            <PublicHeader profile={profile} />
            <main className="pt-24">
                <PricingPreview />
            </main>
            <PublicFooter profile={profile} />
        </div>
    );
}
