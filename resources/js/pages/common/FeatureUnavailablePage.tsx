import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { featureForPath, featureLabel } from '@/lib/plan-features';
import { t } from '@/lib/i18n';

export function FeatureUnavailablePage() {
    const location = useLocation();
    const feature = featureForPath(location.pathname);
    const label = feature ? featureLabel(feature) : t('nav.dashboard');

    return (
        <div className="flex min-h-[60vh] items-center justify-center" dir="rtl">
            <Card className="w-full max-w-lg">
                <CardContent className="space-y-4 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('features.unavailableTitle')}</h1>
                    <p className="text-muted-foreground">
                        {t('features.unavailableHint', { feature: label })}
                    </p>
                    <Button asChild>
                        <Link to="/dashboard">{t('features.backToDashboard')}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
