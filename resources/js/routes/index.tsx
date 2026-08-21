import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LandlordShell } from '@/components/layout/LandlordShell';
import { GuestRoute, MarketingRoute, ProtectedRoute } from '@/routes/guards';
import { LandlordGuestRoute, LandlordProtectedRoute } from '@/routes/landlordGuards';
import { LandlordAuthProvider } from '@/providers/LandlordAuthProvider';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterTenantPage } from '@/pages/auth/RegisterTenantPage';
import { MarketingHomePage } from '@/pages/marketing/MarketingHomePage';
import { AboutPage } from '@/pages/marketing/AboutPage';
import { PricingPage as PlatformPricingPage } from '@/pages/marketing/PricingPage';
import { WhyUsPage } from '@/pages/marketing/WhyUsPage';
import { HomePage } from '@/pages/public/HomePage';
import { QueuePage as PublicQueuePage } from '@/pages/public/QueuePage';
import { TrackPage } from '@/pages/public/TrackPage';
import { ServicesPage as PublicServicesPage } from '@/pages/public/ServicesPage';
import { BranchesPage as PublicBranchesPage } from '@/pages/public/BranchesPage';
import { PricingPage as PublicPricingPage } from '@/pages/public/PricingPage';
import { PublicBookingPage } from '@/pages/booking/PublicBookingPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { BranchesPage } from '@/pages/branches/BranchesPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { VehiclesPage } from '@/pages/vehicles/VehiclesPage';
import { ServicesPage } from '@/pages/services/ServicesPage';
import { PricingPage } from '@/pages/pricing/PricingPage';
import { BookingPage } from '@/pages/booking/BookingPage';
import { QueuePage } from '@/pages/queue/QueuePage';
import { QueueScreenPage } from '@/pages/queue/QueueScreenPage';
import { QueueDisplayPage } from '@/pages/queue/QueueDisplayPage';
import { TvQueuePage } from '@/pages/tv/TvQueuePage';
import { TvStatusPage } from '@/pages/tv/TvStatusPage';
import { CashierPage } from '@/pages/cashier/CashierPage';
import { WorkerPage } from '@/pages/worker/WorkerPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { InvoicesPage } from '@/pages/invoices/InvoicesPage';
import { TaxReportsPage } from '@/pages/tax/TaxReportsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { AppearancePage } from '@/pages/settings/AppearancePage';
import { LandlordLoginPage } from '@/pages/landlord/LandlordLoginPage';
import { LandlordDashboardPage } from '@/pages/landlord/LandlordDashboardPage';
import { LandlordTenantsPage } from '@/pages/landlord/LandlordTenantsPage';
import { LandlordTenantDetailPage } from '@/pages/landlord/LandlordTenantDetailPage';
import { LandlordSubscriptionsPage } from '@/pages/landlord/LandlordSubscriptionsPage';
import { LandlordSubscriptionDetailPage } from '@/pages/landlord/LandlordSubscriptionDetailPage';
import { LandlordPlansPage } from '@/pages/landlord/LandlordPlansPage';
import { LandlordPlanDetailPage } from '@/pages/landlord/LandlordPlanDetailPage';
import { LandlordSettingsPage } from '@/pages/landlord/LandlordSettingsPage';
import { getRouterBasename, isLandlordAdminContext, isTenantContext, resolveTenantSlug } from '@/lib/tenancy';

function TenantRoutes() {
    const tenantPublic = isTenantContext();

    return (
        <Routes>
            <Route element={<MarketingRoute />}>
                <Route index element={tenantPublic ? <HomePage /> : <MarketingHomePage />} />
                <Route path="/booking" element={<PublicBookingPage />} />
                <Route path="/book" element={<PublicBookingPage />} />
                <Route path="/queue" element={<PublicQueuePage />} />
                <Route path="/track" element={<TrackPage />} />
                <Route path="/services" element={<PublicServicesPage />} />
                <Route path="/branches" element={<PublicBranchesPage />} />
                <Route path="/pricing" element={<PublicPricingPage />} />
                <Route path="/queue/display" element={<QueueDisplayPage />} />
                <Route path="/tv/queue" element={<TvQueuePage />} />
                <Route path="/tv/status" element={<TvStatusPage />} />
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
                    <Route path="cashier" element={<CashierPage />} />
                    <Route path="worker" element={<WorkerPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="invoices" element={<InvoicesPage />} />
                    <Route path="tax-reports" element={<TaxReportsPage />} />
                    <Route path="appearance" element={<AppearancePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function PlatformRoutes() {
    const dedicatedAdminHost =
        isLandlordAdminContext() && ! window.location.pathname.startsWith('/landlord');

    return (
        <LandlordAuthProvider>
            <Routes>
                {dedicatedAdminHost ? (
                    <Route path="/" element={<Navigate to="/landlord/dashboard" replace />} />
                ) : (
                    <Route element={<MarketingRoute />}>
                        <Route index element={<MarketingHomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/pricing" element={<PlatformPricingPage />} />
                        <Route path="/why-us" element={<WhyUsPage />} />
                    </Route>
                )}

                <Route element={<GuestRoute />}>
                    <Route path="/register" element={<RegisterTenantPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Route>

                <Route element={<LandlordGuestRoute />}>
                    <Route path="/landlord/login" element={<LandlordLoginPage />} />
                </Route>

                <Route element={<LandlordProtectedRoute />}>
                    <Route element={<LandlordShell />}>
                        <Route path="/landlord/dashboard" element={<LandlordDashboardPage />} />
                        <Route path="/landlord/tenants" element={<LandlordTenantsPage />} />
                        <Route path="/landlord/tenants/:id" element={<LandlordTenantDetailPage />} />
                        <Route path="/landlord/subscriptions" element={<LandlordSubscriptionsPage />} />
                        <Route path="/landlord/subscriptions/:id" element={<LandlordSubscriptionDetailPage />} />
                        <Route path="/landlord/plans" element={<LandlordPlansPage />} />
                        <Route path="/landlord/plans/:id" element={<LandlordPlanDetailPage />} />
                        <Route path="/landlord/settings" element={<LandlordSettingsPage />} />
                    </Route>
                </Route>

                <Route path="/landlord" element={<Navigate to="/landlord/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </LandlordAuthProvider>
    );
}

export function AppRoutes() {
    if (resolveTenantSlug() !== null) {
        return (
            <BrowserRouter basename={getRouterBasename()}>
                <TenantRoutes />
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <PlatformRoutes />
        </BrowserRouter>
    );
}
