import { LogOut, Menu, User, Home, Monitor, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { BranchSelector } from '@/components/layout/BranchSelector';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { api, appConfig, endpoints } from '@/lib/api';
import { getTenantPublicHomeHref, shouldUseTenantHomeRouterLink, tenantPath } from '@/lib/tenancy';
import { useBranch } from '@/providers/BranchProvider';
import type { ApiResponse, TenantSettings } from '@/types/api';

interface HeaderProps {
    onMenuClick?: () => void;
}

function roleLabel(roles?: string[], isLandlord?: boolean): string {
    if (isLandlord) {
        return t('roles.admin');
    }

    const role = roles?.[0];
    if (!role) {
        return t('roles.operator');
    }

    const mapped = t(`roles.${role}`);
    return mapped === `roles.${role}` ? t('roles.operator') : mapped;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout, isLandlord, isAuthenticated, isLoading: authLoading } = useAuth();
    const { selectedBranchId } = useBranch();

    const openTvScreen = (path: string) => {
        const params = selectedBranchId ? `?branch_id=${selectedBranchId}` : '';
        window.open(`${tenantPath(path)}${params}`, '_blank', 'noopener,noreferrer');
    };

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TenantSettings>>(endpoints.settings);
            return response.data;
        },
        enabled: isAuthenticated && !isLandlord && !authLoading,
        retry: false,
    });

    const businessName = settings?.business_name ?? appConfig.tenant?.name ?? t('app.name');
    const logoUrl = settings?.logo_url;
    const tenantHomeHref = getTenantPublicHomeHref();
    const tenantHomeUsesRouterLink = shouldUseTenantHomeRouterLink();
    const currentRole = roleLabel(user?.roles, isLandlord);

    return (
        <header className="admin-header sticky top-0 z-40 flex h-[4.25rem] items-center justify-between px-4 lg:px-7">
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-lg border-inst-border bg-white text-inst-text hover:bg-inst-silver lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3">
                    {logoUrl && !isLandlord && (
                        <div className="hidden h-10 w-10 overflow-hidden rounded-lg border border-inst-border bg-inst-silver p-1 sm:block">
                            <img src={logoUrl} alt={businessName} className="h-full w-full object-contain" />
                        </div>
                    )}
                    <div>
                        <p className="mb-0.5 text-[10px] font-bold tracking-[0.16em] text-inst-muted">
                            {isLandlord ? t('auth.landlordPortal') : t('app.operationsConsole')}
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-[1.05rem] font-bold leading-none text-inst-text">
                                {isLandlord ? t('auth.landlordLogin') : businessName}
                            </p>
                            {!isLandlord && (
                                <Badge className="rounded-md border border-inst-border bg-inst-silver px-2 py-0.5 text-[10px] font-bold text-inst-teal">
                                    {t('app.active')}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {!isLandlord && (
                    <>
                        <div className="hidden items-center gap-2 md:flex">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="hidden h-10 gap-2 rounded-lg border-inst-border bg-white font-bold text-inst-text hover:bg-inst-silver lg:flex"
                                onClick={() => openTvScreen('/tv/queue')}
                                title={t('tv.openQueue')}
                            >
                                <Monitor className="h-4 w-4 text-inst-primary" />
                                {t('nav.tvQueue')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="hidden h-10 gap-2 rounded-lg border-inst-border bg-white font-bold text-inst-text hover:bg-inst-silver lg:flex"
                                onClick={() => openTvScreen('/tv/status')}
                                title={t('tv.openStatus')}
                            >
                                <Tv className="h-4 w-4 text-inst-primary" />
                                {t('nav.tvStatus')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-lg border-inst-border bg-white lg:hidden"
                                onClick={() => openTvScreen('/tv/queue')}
                                title={t('tv.openQueue')}
                            >
                                <Monitor className="h-5 w-5 text-inst-primary" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-lg border-inst-border bg-white lg:hidden"
                                onClick={() => openTvScreen('/tv/status')}
                                title={t('tv.openStatus')}
                            >
                                <Tv className="h-5 w-5 text-inst-primary" />
                            </Button>
                        </div>
                        <div className="hidden md:block">
                            <BranchSelector />
                        </div>
                    </>
                )}

                <div className="mx-1 hidden h-8 w-px bg-inst-border sm:block" />

                <div className="flex items-center gap-2">
                    <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="hidden h-10 w-10 rounded-lg border-inst-border bg-white text-inst-muted hover:bg-inst-silver hover:text-inst-text sm:flex"
                        title={t('common.backHome')}
                    >
                        {tenantHomeUsesRouterLink ? (
                            <Link to="/">
                                <Home className="h-5 w-5" />
                            </Link>
                        ) : (
                            <a href={tenantHomeHref}>
                                <Home className="h-5 w-5" />
                            </a>
                        )}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="relative h-11 gap-3 rounded-lg border-inst-border bg-white px-2 hover:bg-inst-silver"
                            >
                                <div className="hidden text-end sm:block">
                                    <p className="text-sm font-bold leading-none text-inst-text">{user?.name ?? t('roles.operator')}</p>
                                    <p className="mt-1 text-[10px] font-semibold tracking-wide text-inst-muted">{currentRole}</p>
                                </div>
                                <Avatar className="h-8 w-8 border border-inst-border">
                                    <AvatarFallback className="bg-inst-teal text-[11px] font-bold text-white uppercase">
                                        {user?.name?.charAt(0) ?? 'م'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 rounded-xl border-inst-border p-2 shadow-lg">
                            <DropdownMenuLabel className="p-3">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold text-inst-text">{user?.name ?? t('roles.operator')}</p>
                                    <p className="truncate text-[11px] font-medium text-inst-muted">{user?.email}</p>
                                    <p className="text-[10px] font-bold tracking-wide text-inst-primary">{currentRole}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1 bg-inst-border" />
                            <DropdownMenuItem className="h-10 cursor-pointer rounded-lg font-semibold" disabled>
                                <User className="me-3 h-4 w-4 text-inst-muted" />
                                {t('auth.profile')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-inst-border" />
                            <DropdownMenuItem
                                className="h-10 cursor-pointer rounded-lg font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => logout()}
                            >
                                <LogOut className="me-3 h-4 w-4" />
                                {t('nav.logout')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
