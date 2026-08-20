import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

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
        <div className="flex min-h-screen bg-muted/30">
            {/* Desktop Sidebar */}
            <Sidebar 
                collapsed={collapsed} 
                onToggleCollapse={() => setCollapsed((v) => !v)}
                className="hidden lg:flex"
            />

            {/* Mobile Sidebar Overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-50 lg:hidden transition-all duration-300',
                    mobileNavOpen ? 'pointer-events-auto' : 'pointer-events-none',
                )}
                aria-hidden={!mobileNavOpen}
            >
                {/* Backdrop */}
                <div
                    className={cn(
                        'admin-sidebar-mobile-backdrop absolute inset-0 transition-opacity duration-300',
                        mobileNavOpen ? 'opacity-100' : 'opacity-0',
                    )}
                    onClick={closeMobileNav}
                />

                {/* Sidebar Panel */}
                <div
                    className={cn(
                        'absolute inset-y-0 start-0 transition-transform duration-300 ease-out shadow-2xl',
                        mobileNavOpen
                            ? 'translate-x-0'
                            : document.documentElement.dir === 'rtl'
                              ? 'translate-x-full'
                              : '-translate-x-full',
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

            {/* Main Content Area */}
            <div className="relative flex min-w-0 flex-1 flex-col">
                <Header onMenuClick={() => setMobileNavOpen(true)} />
                
                <main className="flex-1 p-6 lg:p-8 animate-in fade-in duration-700">
                    <div className="mx-auto w-full max-w-[1600px]">
                        <Outlet />
                    </div>
                </main>

                <footer className="border-t border-border/40 bg-white/50 px-6 py-6 lg:px-8 text-center sm:text-start">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || 'Tammer Wash'}. All Rights Reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Privacy Policy</a>
                            <a href="#" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Terms of Service</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
