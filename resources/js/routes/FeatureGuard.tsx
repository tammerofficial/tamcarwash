import { Outlet, useLocation } from 'react-router-dom';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { featureForPath } from '@/lib/plan-features';
import { FeatureUnavailablePage } from '@/pages/common/FeatureUnavailablePage';

export function FeatureGuard() {
    const location = useLocation();
    const { hasFeature } = usePlanFeatures();
    const feature = featureForPath(location.pathname);

    if (feature && !hasFeature(feature)) {
        return <FeatureUnavailablePage />;
    }

    return <Outlet />;
}
