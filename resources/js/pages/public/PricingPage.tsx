import { useStorefrontProfile } from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { PricingPreview } from '@/components/public/PricingPreview';

export function PricingPage() {
    const { data: profile } = useStorefrontProfile();

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <PublicHeader profile={profile} />
            <main className="pt-40">
                <PricingPreview />
            </main>
            <PublicFooter profile={profile} />
        </div>
    );
}
