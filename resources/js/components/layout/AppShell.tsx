import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import { getAppName } from '@/lib/branding';
import { t } from '@/lib/i18n';

export function AppShell() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const location = useLocation();

    const closeMobileNav = useCallback(() => {
        setMobileNavOpen(false);
    }, []);

    useEffect(() => {
        closeMobileNav();
    }, [location.pathname, closeMobileNav]);

    useEffect(() => {
        if (!mobileNavOpen) {
            return undefined;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMobileNav();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [mobileNavOpen, closeMobileNav]);

    return (
        <div className="admin-console flex min-h-screen" dir="rtl">
            <Sidebar
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((v) => !v)}
                className="hidden lg:flex shrink-0"
            />

            <div className="admin-console-main relative flex min-w-0 flex-1 flex-col">
                <Header onMenuClick={() => setMobileNavOpen(true)} />

                <main className="flex-1 px-4 py-5 lg:px-7 lg:py-6">
                    <div className="mx-auto w-full max-w-[1600px]">
                        <Outlet />
                    </div>
                </main>

                <footer className="admin-console-footer px-4 py-4 lg:px-7">
                    <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-2 sm:flex-row sm:items-center">
                        <p className="text-[11px] font-semibold tracking-wide">
                            &copy; {new Date().getFullYear()} {getAppName()} · {t('app.operationsConsole')}
                        </p>
                        <p className="text-[11px] font-semibold tracking-[0.12em]">
                            {t('app.sultanate')}
                        </p>
                    </div>
                </footer>
            </div>

            <div
                className={cn(
                    'fixed inset-0 z-50 lg:hidden transition-all duration-300',
                    mobileNavOpen ? 'pointer-events-auto' : 'pointer-events-none',
                )}
                aria-hidden={!mobileNavOpen}
            >
                <div
                    className={cn(
                        'admin-sidebar-mobile-backdrop absolute inset-0 transition-opacity duration-300',
                        mobileNavOpen ? 'opacity-100' : 'opacity-0',
                    )}
                    onClick={closeMobileNav}
                />

                <div
                    className={cn(
                        'absolute inset-y-0 right-0 transition-transform duration-300 ease-out shadow-2xl',
                        mobileNavOpen ? 'translate-x-0' : 'translate-x-full',
                    )}
                >
                    <Sidebar
                        collapsed={false}
                        onNavigate={closeMobileNav}
                        showMobileClose
                        onMobileClose={closeMobileNav}
                        className="h-full"
                    />
                </div>
            </div>
        </div>
    );
}
