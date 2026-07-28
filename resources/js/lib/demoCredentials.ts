import type { LucideIcon } from 'lucide-react';
import { CreditCard, Crown, Shield, UserCog, Wrench } from 'lucide-react';

/** Demo tenant users — seeded by DemoTenantUsersSeeder (see README quick login) */
/** Demo landlord user — seeded by PlatformUserSeeder / LandlordProductionSeeder */
export const DEMO_PASSWORD = 'password';

export interface DemoRoleCredential {
    role: 'owner' | 'manager' | 'cashier' | 'worker';
    email: string;
    password: string;
    labelKey: string;
    icon: LucideIcon;
}

export const DEMO_ROLE_CREDENTIALS: DemoRoleCredential[] = [
    {
        role: 'owner',
        email: 'owner@demo.test',
        password: DEMO_PASSWORD,
        labelKey: 'auth.quickLogin.owner',
        icon: Crown,
    },
    {
        role: 'manager',
        email: 'manager@demo.test',
        password: DEMO_PASSWORD,
        labelKey: 'auth.quickLogin.manager',
        icon: UserCog,
    },
    {
        role: 'cashier',
        email: 'cashier@demo.test',
        password: DEMO_PASSWORD,
        labelKey: 'auth.quickLogin.cashier',
        icon: CreditCard,
    },
    {
        role: 'worker',
        email: 'worker@demo.test',
        password: DEMO_PASSWORD,
        labelKey: 'auth.quickLogin.worker',
        icon: Wrench,
    },
];

export interface DemoLandlordCredential {
    role: 'platform_admin';
    email: string;
    password: string;
    labelKey: string;
    icon: LucideIcon;
}

export const DEMO_LANDLORD_CREDENTIALS: DemoLandlordCredential[] = [
    {
        role: 'platform_admin',
        email: 'admin@tammer.test',
        password: DEMO_PASSWORD,
        labelKey: 'landlord.quickLogin.platformAdmin',
        icon: Shield,
    },
];

export function isQuickLoginEnabled(): boolean {
    return import.meta.env.DEV || !!window.__TAMMER__?.allowQuickLogin;
}
