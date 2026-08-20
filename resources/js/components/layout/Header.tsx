import { LogOut, Menu, User, Home } from 'lucide-react';
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
import { getTenantPublicHomeHref, shouldUseTenantHomeRouterLink } from '@/lib/tenancy';
import type { ApiResponse, TenantSettings } from '@/types/api';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout, isLandlord, isAuthenticated, isLoading: authLoading } = useAuth();

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TenantSettings>>(endpoints.settings);
            return response.data;
        },
        enabled: isAuthenticated && !isLandlord && !authLoading,
        retry: false,
    });

    const businessName = settings?.business_name ?? appConfig.tenant?.name ?? 'مغسلة تجريبية';
    const tenantHomeHref = getTenantPublicHomeHref();
    const tenantHomeUsesRouterLink = shouldUseTenantHomeRouterLink();

    return (
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border/40 bg-white/80 backdrop-blur-md px-4 lg:px-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl text-foreground hover:bg-muted lg:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>

                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5 opacity-70">
                        {isLandlord ? t('auth.landlordPortal') || 'بوابة الإدارة المركزية' : t('dashboard.welcome') || 'أهلاً بك في'}
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-black text-foreground leading-none">
                            {isLandlord ? t('auth.landlordLogin') : businessName}
                        </p>
                        {!isLandlord && (
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                                {t('app.active') || 'نشط'}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {!isLandlord && (
                    <div className="hidden md:block">
                        <BranchSelector />
                    </div>
                )}

                <div className="h-8 w-[1px] bg-border/40 mx-2 hidden sm:block" />

                <div className="flex items-center gap-3">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all hidden sm:flex"
                        title={t('common.backHome') || 'الرئيسية'}
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
                            <Button variant="ghost" className="relative h-12 gap-3 px-2 hover:bg-muted/50 rounded-2xl transition-all group">
                                <div className="text-end hidden sm:block">
                                    <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors leading-none">{user?.name ?? 'مستخدم'}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1">{isLandlord ? 'Admin' : 'Operator'}</p>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-primary/10 shadow-sm group-hover:border-primary/30 transition-all">
                                    <AvatarFallback className="bg-primary/5 text-primary font-bold uppercase">
                                        {user?.name?.charAt(0) ?? 'م'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl shadow-2xl border-border/40 animate-in fade-in zoom-in-95 duration-200">
                            <DropdownMenuLabel className="p-4">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-black text-foreground">{user?.name ?? 'مستخدم'}</p>
                                    <p className="text-[10px] font-medium text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-2 opacity-50" />
                            <DropdownMenuItem className="h-11 rounded-xl font-bold cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" disabled>
                                <User className="me-3 h-4 w-4 text-muted-foreground" />
                                {t('auth.profile') || 'الملف الشخصي'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 opacity-50" />
                            <DropdownMenuItem 
                                className="h-11 rounded-xl font-bold text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer transition-colors" 
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
