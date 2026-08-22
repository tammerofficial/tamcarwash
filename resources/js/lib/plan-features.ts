export const PLAN_FEATURE_KEYS = [
    'dashboard',
    'cashier',
    'worker',
    'queue',
    'queue_screen',
    'orders',
    'bookings',
    'branches',
    'customers',
    'vehicles',
    'services',
    'pricing',
    'invoices',
    'tax_reports',
    'analytics',
    'appearance',
    'settings',
] as const;

export type PlanFeatureKey = (typeof PLAN_FEATURE_KEYS)[number];

export type PlanFeatureMap = Record<PlanFeatureKey, boolean>;

export interface PlanFeatureDefinition {
    key: PlanFeatureKey;
    label: string;
    description: string;
}

export const PLAN_FEATURE_CATALOG: PlanFeatureDefinition[] = [
    { key: 'dashboard', label: 'لوحة التحكم', description: 'الإحصائيات ونظرة عامة على التشغيل اليومي' },
    { key: 'cashier', label: 'الكاشير', description: 'نقطة البيع، المدفوعات، والدرج النقدي' },
    { key: 'worker', label: 'مهام العامل', description: 'واجهة العامل لمتابعة الطلبات أثناء الغسيل' },
    { key: 'queue', label: 'الطابور', description: 'إدارة الدور واستقبال الزيارات المباشرة' },
    { key: 'queue_screen', label: 'شاشة الطابور', description: 'شاشة العرض للعملاء داخل المغسلة' },
    { key: 'orders', label: 'الطلبات', description: 'إنشاء ومتابعة طلبات الغسيل' },
    { key: 'bookings', label: 'الحجوزات', description: 'جدولة المواعيد من اللوحة ومن الموقع العام' },
    { key: 'branches', label: 'الفروع', description: 'إدارة الفروع وساعات العمل' },
    { key: 'customers', label: 'العملاء', description: 'سجل العملاء ونقاط الولاء' },
    { key: 'vehicles', label: 'المركبات', description: 'ربط المركبات بالعملاء' },
    { key: 'services', label: 'الخدمات', description: 'كتالوج خدمات الغسيل والإضافات' },
    { key: 'pricing', label: 'التسعير', description: 'قواعد الأسعار والكوبونات والخصومات' },
    { key: 'invoices', label: 'الفواتير', description: 'إصدار الفواتير ومتابعتها' },
    { key: 'tax_reports', label: 'تقارير الضريبة', description: 'تقارير ضريبة القيمة المضافة' },
    { key: 'analytics', label: 'التحليلات والتقارير', description: 'لوحة معلومات الأداء والبيانات التحليلية' },
    { key: 'appearance', label: 'المظهر', description: 'تخصيص هوية المغسلة والألوان' },
    { key: 'settings', label: 'الإعدادات', description: 'إعدادات المنشأة والضريبة' },
];

const ROUTE_FEATURE_MAP: Array<{ prefix: string; feature: PlanFeatureKey }> = [
    { prefix: '/cashier', feature: 'cashier' },
    { prefix: '/worker', feature: 'worker' },
    { prefix: '/queue/screen', feature: 'queue_screen' },
    { prefix: '/queue', feature: 'queue' },
    { prefix: '/orders', feature: 'orders' },
    { prefix: '/booking', feature: 'bookings' },
    { prefix: '/branches', feature: 'branches' },
    { prefix: '/customers', feature: 'customers' },
    { prefix: '/vehicles', feature: 'vehicles' },
    { prefix: '/services', feature: 'services' },
    { prefix: '/pricing', feature: 'pricing' },
    { prefix: '/invoices', feature: 'invoices' },
    { prefix: '/tax-reports', feature: 'tax_reports' },
    { prefix: '/analytics', feature: 'analytics' },
    { prefix: '/appearance', feature: 'appearance' },
    { prefix: '/settings', feature: 'settings' },
    { prefix: '/dashboard', feature: 'dashboard' },
];

export function emptyFeatureMap(): PlanFeatureMap {
    return Object.fromEntries(PLAN_FEATURE_KEYS.map((key) => [key, false])) as PlanFeatureMap;
}

export function allFeaturesEnabled(): PlanFeatureMap {
    return Object.fromEntries(PLAN_FEATURE_KEYS.map((key) => [key, true])) as PlanFeatureMap;
}

export function normalizeFeatureMap(features?: Record<string, boolean> | string[] | null): PlanFeatureMap {
    const map = emptyFeatureMap();

    if (!features) {
        return allFeaturesEnabled();
    }

    if (Array.isArray(features)) {
        for (const raw of features) {
            if (raw in map) {
                map[raw as PlanFeatureKey] = true;
            }
        }

        return map;
    }

    for (const key of PLAN_FEATURE_KEYS) {
        map[key] = features[key] === true;
    }

    return map;
}

export function isFeatureEnabled(
    features: Record<string, boolean> | string[] | null | undefined,
    key: PlanFeatureKey,
): boolean {
    if (!features) {
        return true;
    }

    if (Array.isArray(features)) {
        return features.includes(key);
    }

    return features[key] === true;
}

export function featureForPath(pathname: string): PlanFeatureKey | null {
    const match = ROUTE_FEATURE_MAP.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));

    return match?.feature ?? null;
}

export function featureLabel(key: PlanFeatureKey): string {
    return PLAN_FEATURE_CATALOG.find((item) => item.key === key)?.label ?? key;
}
