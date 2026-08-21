import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PlatformHeader } from '@/components/marketing/PlatformHeader';
import { PlatformFooter } from '@/components/marketing/PlatformFooter';
import { HeroSaasSection } from '@/components/marketing/HeroSaasSection';
import { StatsStrip } from '@/components/marketing/StatsStrip';
import { ValueSection } from '@/components/marketing/ValueSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { WorkflowSection } from '@/components/marketing/WorkflowSection';
import { ModulesSection } from '@/components/marketing/ModulesSection';
import { VatAccountingSection } from '@/components/marketing/VatAccountingSection';
import { TrustSection } from '@/components/marketing/TrustSection';
import { FinalCTA } from '@/components/marketing/FinalCTA';

export function MarketingHomePage() {
    const location = useLocation();

    useEffect(() => {
        const id = location.hash.replace('#', '');
        if (!id) {
            return;
        }

        const timer = window.setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);

        return () => window.clearTimeout(timer);
    }, [location.hash]);

    return (
        <div className="min-h-screen bg-white font-sans text-inst-text" dir="rtl">
            <PlatformHeader />
            <main className="pt-16">
                <HeroSaasSection />
                <StatsStrip />
                <ValueSection />
                <PricingSection />
                <WorkflowSection />
                <ModulesSection />
                <VatAccountingSection />
                <TrustSection />
                <FinalCTA />
            </main>
            <PlatformFooter />
        </div>
    );
}
