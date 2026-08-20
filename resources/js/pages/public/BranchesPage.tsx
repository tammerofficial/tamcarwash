import { useStorefrontProfile, useStorefrontBranches } from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { BranchesPreview } from '@/components/public/BranchesPreview';

export function BranchesPage() {
    const { data: profile } = useStorefrontProfile();
    const { data: branches } = useStorefrontBranches();

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <PublicHeader profile={profile} />
            <main className="pt-40">
                <BranchesPreview />
            </main>
            <PublicFooter profile={profile} branches={branches} />
        </div>
    );
}
