import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LandlordShell } from '@/components/layout/LandlordShell';
import { GuestRoute, MarketingRoute, ProtectedRoute } from '@/routes/guards';
import { LandlordGuestRoute, LandlordProtectedRoute } from '@/routes/landlordGuards';
import { FeatureGuard } from '@/routes/FeatureGuard';
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
import { BranchFormPage } from '@/pages/branches/BranchFormPage';
import { BranchDetailPage } from '@/pages/branches/BranchDetailPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { CustomerFormPage } from '@/pages/customers/CustomerFormPage';
import { CustomerDetailPage } from '@/pages/customers/CustomerDetailPage';
import { VehiclesPage } from '@/pages/vehicles/VehiclesPage';
import { VehicleFormPage } from '@/pages/vehicles/VehicleFormPage';
import { VehicleDetailPage } from '@/pages/vehicles/VehicleDetailPage';
import { ServicesPage } from '@/pages/services/ServicesPage';
import { ServiceFormPage } from '@/pages/services/ServiceFormPage';
import { ServiceDetailPage } from '@/pages/services/ServiceDetailPage';
import { CategoryFormPage } from '@/pages/services/CategoryFormPage';
import { PricingPage } from '@/pages/pricing/PricingPage';
import { PriceRuleFormPage } from '@/pages/pricing/PriceRuleFormPage';
import { CouponFormPage } from '@/pages/pricing/CouponFormPage';
import { DiscountFormPage } from '@/pages/pricing/DiscountFormPage';
import { BookingPage } from '@/pages/booking/BookingPage';
import { BookingCreatePage } from '@/pages/booking/BookingCreatePage';
import { BookingDetailPage } from '@/pages/booking/BookingDetailPage';
import { QueuePage } from '@/pages/queue/QueuePage';
import { QueueScreenPage } from '@/pages/queue/QueueScreenPage';
import { QueueWalkInPage } from '@/pages/queue/QueueWalkInPage';
import { QueueEntryDetailPage } from '@/pages/queue/QueueEntryDetailPage';
import { QueueDisplayPage } from '@/pages/queue/QueueDisplayPage';
import { TvQueuePage } from '@/pages/tv/TvQueuePage';
import { TvStatusPage } from '@/pages/tv/TvStatusPage';
import { CashierPage } from '@/pages/cashier/CashierPage';
import { WorkerPage } from '@/pages/worker/WorkerPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { OrderCreatePage } from '@/pages/orders/OrderCreatePage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { InvoicesPage } from '@/pages/invoices/InvoicesPage';
import { InvoiceDetailPage } from '@/pages/invoices/InvoiceDetailPage';
import { TaxReportsPage } from '@/pages/tax/TaxReportsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { AppearancePage } from '@/pages/settings/AppearancePage';
import { LandlordLoginPage } from '@/pages/landlord/LandlordLoginPage';
import { LandlordDashboardPage } from '@/pages/landlord/LandlordDashboardPage';
import { LandlordTenantsPage } from '@/pages/landlord/LandlordTenantsPage';
import { LandlordTenantFormPage } from '@/pages/landlord/LandlordTenantFormPage';
import { LandlordTenantDetailPage } from '@/pages/landlord/LandlordTenantDetailPage';
import { LandlordSubscriptionsPage } from '@/pages/landlord/LandlordSubscriptionsPage';
import { LandlordSubscriptionFormPage } from '@/pages/landlord/LandlordSubscriptionFormPage';
import { LandlordSubscriptionDetailPage } from '@/pages/landlord/LandlordSubscriptionDetailPage';
import { LandlordPlansPage } from '@/pages/landlord/LandlordPlansPage';
import { LandlordPlanFormPage } from '@/pages/landlord/LandlordPlanFormPage';
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
                    <Route element={<FeatureGuard />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="branches" element={<BranchesPage />} />
                        <Route path="branches/create" element={<BranchFormPage />} />
                        <Route path="branches/:id" element={<BranchDetailPage />} />
                        <Route path="branches/:id/edit" element={<BranchFormPage />} />
                        <Route path="customers" element={<CustomersPage />} />
                        <Route path="customers/create" element={<CustomerFormPage />} />
                        <Route path="customers/:id" element={<CustomerDetailPage />} />
                        <Route path="customers/:id/edit" element={<CustomerFormPage />} />
                        <Route path="vehicles" element={<VehiclesPage />} />
                        <Route path="vehicles/create" element={<VehicleFormPage />} />
                        <Route path="vehicles/:id" element={<VehicleDetailPage />} />
                        <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />
                        <Route path="services" element={<ServicesPage />} />
                        <Route path="services/create" element={<ServiceFormPage />} />
                        <Route path="services/categories/create" element={<CategoryFormPage />} />
                        <Route path="services/:id" element={<ServiceDetailPage />} />
                        <Route path="services/:id/edit" element={<ServiceFormPage />} />
                        <Route path="pricing" element={<PricingPage />} />
                        <Route path="pricing/rules/create" element={<PriceRuleFormPage />} />
                        <Route path="pricing/coupons/create" element={<CouponFormPage />} />
                        <Route path="pricing/discounts/create" element={<DiscountFormPage />} />
                        <Route path="booking" element={<BookingPage />} />
                        <Route path="booking/create" element={<BookingCreatePage />} />
                        <Route path="booking/:id" element={<BookingDetailPage />} />
                        <Route path="queue" element={<QueuePage />} />
                        <Route path="queue/screen" element={<QueueScreenPage />} />
                        <Route path="queue/walk-in" element={<QueueWalkInPage />} />
                        <Route path="queue/:id" element={<QueueEntryDetailPage />} />
                        <Route path="cashier" element={<CashierPage />} />
                        <Route path="worker" element={<WorkerPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="orders/create" element={<OrderCreatePage />} />
                        <Route path="orders/:id" element={<OrderDetailPage />} />
                        <Route path="invoices" element={<InvoicesPage />} />
                        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                        <Route path="tax-reports" element={<TaxReportsPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="appearance" element={<AppearancePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
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
                        <Route path="/landlord/tenants/create" element={<LandlordTenantFormPage />} />
                        <Route path="/landlord/tenants/:id/edit" element={<LandlordTenantFormPage />} />
                        <Route path="/landlord/tenants/:id" element={<LandlordTenantDetailPage />} />
                        <Route path="/landlord/subscriptions" element={<LandlordSubscriptionsPage />} />
                        <Route path="/landlord/subscriptions/:id/edit" element={<LandlordSubscriptionFormPage />} />
                        <Route path="/landlord/subscriptions/:id" element={<LandlordSubscriptionDetailPage />} />
                        <Route path="/landlord/plans" element={<LandlordPlansPage />} />
                        <Route path="/landlord/plans/create" element={<LandlordPlanFormPage />} />
                        <Route path="/landlord/plans/:id/edit" element={<LandlordPlanFormPage />} />
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
