import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LandlordShell } from '@/components/layout/LandlordShell';
import { GuestRoute, MarketingRoute, ProtectedRoute } from '@/routes/guards';
import { LandlordGuestRoute, LandlordProtectedRoute } from '@/routes/landlordGuards';
import { LandlordAuthProvider } from '@/providers/LandlordAuthProvider';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterTenantPage } from '@/pages/auth/RegisterTenantPage';
import { MarketingHomePage } from '@/pages/marketing/MarketingHomePage';
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
import { LandlordLoginPage } from '@/pages/landlord/LandlordLoginPage';
import { LandlordDashboardPage } from '@/pages/landlord/LandlordDashboardPage';
import { LandlordTenantsPage } from '@/pages/landlord/LandlordTenantsPage';
import { LandlordSubscriptionsPage } from '@/pages/landlord/LandlordSubscriptionsPage';
import { LandlordPlansPage } from '@/pages/landlord/LandlordPlansPage';
import { LandlordSettingsPage } from '@/pages/landlord/LandlordSettingsPage';
import { getRouterBasename, isLandlordContext } from '@/lib/tenancy';

function TenantRoutes() {
    return (
        <Routes>
            <Route element={<MarketingRoute />}>
                <Route index element={<MarketingHomePage />} />
            </Route>

            <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterTenantPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
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
    );
}

function LandlordRoutes() {
    return (
        <LandlordAuthProvider>
            <Routes>
                <Route element={<LandlordGuestRoute />}>
                    <Route path="/landlord/login" element={<LandlordLoginPage />} />
                </Route>

                <Route element={<LandlordProtectedRoute />}>
                    <Route element={<LandlordShell />}>
                        <Route path="/landlord/dashboard" element={<LandlordDashboardPage />} />
                        <Route path="/landlord/tenants" element={<LandlordTenantsPage />} />
                        <Route path="/landlord/subscriptions" element={<LandlordSubscriptionsPage />} />
                        <Route path="/landlord/plans" element={<LandlordPlansPage />} />
                        <Route path="/landlord/settings" element={<LandlordSettingsPage />} />
                    </Route>
                </Route>

                <Route path="/" element={<Navigate to="/landlord/dashboard" replace />} />
                <Route path="/landlord" element={<Navigate to="/landlord/dashboard" replace />} />
                <Route path="/landlord/*" element={<Navigate to="/landlord/dashboard" replace />} />
            </Routes>
        </LandlordAuthProvider>
    );
}

export function AppRoutes() {
    const landlord = isLandlordContext();

    if (landlord) {
        return (
            <BrowserRouter>
                <LandlordRoutes />
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter basename={getRouterBasename()}>
            <TenantRoutes />
        </BrowserRouter>
    );
}
