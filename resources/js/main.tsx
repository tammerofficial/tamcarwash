import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { BranchProvider } from '@/providers/BranchProvider';
import { AppRoutes } from '@/routes';

const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error('Root element #app not found');
}

createRoot(rootElement).render(
    <StrictMode>
        <QueryProvider>
            <AuthProvider>
                <BranchProvider>
                    <AppRoutes />
                    <Toaster position="top-right" dir="rtl" richColors />
                </BranchProvider>
            </AuthProvider>
        </QueryProvider>
    </StrictMode>,
);
