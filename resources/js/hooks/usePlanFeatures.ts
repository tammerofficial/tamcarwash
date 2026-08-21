import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
    allFeaturesEnabled,
    isFeatureEnabled,
    normalizeFeatureMap,
    type PlanFeatureKey,
    type PlanFeatureMap,
} from '@/lib/plan-features';

export function usePlanFeatures() {
    const { user, isLandlord } = useAuth();

    const features = useMemo<PlanFeatureMap>(() => {
        if (isLandlord) {
            return allFeaturesEnabled();
        }

        return normalizeFeatureMap(user?.features);
    }, [isLandlord, user?.features]);

    const hasFeature = (key: PlanFeatureKey): boolean => {
        if (isLandlord) {
            return true;
        }

        return isFeatureEnabled(features, key);
    };

    return { features, hasFeature, isLandlord };
}
