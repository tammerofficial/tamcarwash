import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function AppShell() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="right" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
                    <Sidebar />
                </SheetContent>
            </Sheet>

            <div className="flex min-w-0 flex-1 flex-col">
                <Header onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
