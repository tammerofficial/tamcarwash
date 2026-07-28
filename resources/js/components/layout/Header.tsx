import { LogOut, Menu, User } from 'lucide-react';
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
import { t } from '@/lib/i18n';
import { appConfig } from '@/lib/api';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout, isLandlord } = useAuth();

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
            </Button>

            <div className="flex flex-1 items-center justify-between gap-4">
                <div className="hidden sm:block">
                    <p className="text-sm text-muted-foreground">
                        {isLandlord ? t('auth.landlordLogin') : appConfig.tenant?.name ?? 'مغسلة تجريبية'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!isLandlord && <BranchSelector />}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar>
                                    <AvatarFallback>{user?.name?.charAt(0) ?? 'م'}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user?.name ?? 'مستخدم'}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>
                                <User className="me-2 h-4 w-4" />
                                الملف الشخصي
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => logout()}>
                                <LogOut className="me-2 h-4 w-4" />
                                {t('nav.logout')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
