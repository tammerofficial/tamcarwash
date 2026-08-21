import { useStorefrontProfile, useStorefrontBranches } from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { QueueStatus } from '@/components/public/QueueStatus';

export function QueuePage() {
    const { data: profile } = useStorefrontProfile();
    const { data: branches } = useStorefrontBranches();

    return (
        <div className="sf-shell min-h-screen" dir="rtl">
            <PublicHeader profile={profile} />
            <main className="pt-24 pb-16">
                <QueueStatus />
            </main>
            <PublicFooter profile={profile} branches={branches} />
        </div>
    );
}
