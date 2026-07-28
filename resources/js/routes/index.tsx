import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { GuestRoute, ProtectedRoute } from '@/routes/guards';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { BranchesPage } from '@/pages/branches/BranchesPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { VehiclesPage } from '@/pages/vehicles/VehiclesPage';
import { ServicesPage } from '@/pages/services/ServicesPage';
import { PricingPage } from '@/pages/pricing/PricingPage';
import { BookingPage } from '@/pages/booking/BookingPage';
import { QueuePage } from '@/pages/queue/QueuePage';
import { QueueScreenPage } from '@/pages/queue/QueueScreenPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { InvoicesPage } from '@/pages/invoices/InvoicesPage';
import { TaxReportsPage } from '@/pages/tax/TaxReportsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppShell />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="branches" element={<BranchesPage />} />
                        <Route path="customers" element={<CustomersPage />} />
                        <Route path="vehicles" element={<VehiclesPage />} />
                        <Route path="services" element={<ServicesPage />} />
                        <Route path="pricing" element={<PricingPage />} />
                        <Route path="booking" element={<BookingPage />} />
                        <Route path="queue" element={<QueuePage />} />
                        <Route path="queue/screen" element={<QueueScreenPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="invoices" element={<InvoicesPage />} />
                        <Route path="tax-reports" element={<TaxReportsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
