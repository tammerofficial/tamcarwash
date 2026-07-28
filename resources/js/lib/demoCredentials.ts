import type { LucideIcon } from 'lucide-react';
import { CreditCard, Crown, UserCog, Wrench } from 'lucide-react';

/** Demo tenant users — matches `tenants:create --owner-email=owner@demo.test --owner-password=password` */
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

export function isQuickLoginEnabled(): boolean {
    return import.meta.env.DEV || !!window.__TAMMER__?.allowQuickLogin;
}
