import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Car, Loader2, ArrowLeft, ShieldCheck, Building2, Lock, User as UserIcon, LogIn, Info, ChevronLeft, ClipboardList, Users } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { appConfig, getActiveTenantSlug } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { t } from '@/lib/i18n';
import { ApiClientError, api, endpoints } from '@/lib/api';
import { DEMO_ROLE_CREDENTIALS, DEMO_LANDLORD_CREDENTIALS, DEFAULT_DEMO_TENANT_SLUG, isQuickLoginEnabled } from '@/lib/demoCredentials';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
    tenant_slug: z.string().optional(),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
    const { login, isLandlord } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [quickLoginRole, setQuickLoginRole] = useState<string | null>(null);
    const needsTenantSlug = !isLandlord && !appConfig.tenant?.slug;
    const showQuickLogin = isQuickLoginEnabled() && !isLandlord;
    const showLandlordQuickLogin = isQuickLoginEnabled() && !isLandlord && needsTenantSlug;
    const storedTenantSlug = getActiveTenantSlug();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            tenant_slug: storedTenantSlug ?? '',
            email: '',
            password: '',
            remember: false,
        },
    });

    const submitLogin = async (values: LoginFormValues) => {
        setError(null);
        try {
            const tenantSlug = values.tenant_slug?.trim() || storedTenantSlug || undefined;
            await login({
                email: values.email,
                password: values.password,
                remember: values.remember,
                tenantSlug,
            });
            navigate('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof ApiClientError ? err.message : 'فشل تسجيل الدخول');
        }
    };

    const onSubmit = async (values: LoginFormValues) => {
        await submitLogin(values);
    };

    const handleQuickLogin = async (email: string, password: string, role: string) => {
        setQuickLoginRole(role);
        setError(null);
        form.setValue('email', email);
        form.setValue('password', password);

        const tenantSlug =
            form.getValues('tenant_slug')?.trim() ||
            storedTenantSlug ||
            (needsTenantSlug ? DEFAULT_DEMO_TENANT_SLUG : undefined);

        if (needsTenantSlug && tenantSlug) {
            form.setValue('tenant_slug', tenantSlug);
        }

        try {
            await submitLogin({
                email,
                password,
                remember: false,
                tenant_slug: tenantSlug,
            });
        } finally {
            setQuickLoginRole(null);
        }
    };

    const handleLandlordQuickLogin = async (email: string, password: string, role: string) => {
        setQuickLoginRole(role);
        setError(null);

        try {
            await api.ensureCsrfCookie();
            await api.post(
                endpoints.landlord.login,
                { email, password, remember: false },
                undefined,
                { baseUrl: 'landlord' },
            );
            navigate('/landlord/dashboard');
        } catch (err: unknown) {
            setError(err instanceof ApiClientError ? err.message : 'فشل تسجيل الدخول');
        } finally {
            setQuickLoginRole(null);
        }
    };

    const isSubmitting = form.formState.isSubmitting || quickLoginRole !== null;

    const features = [
        {
            icon: Car,
            title: t('auth.feature1Title'),
            body: t('auth.feature1Body'),
        },
        {
            icon: ClipboardList,
            title: t('auth.feature2Title'),
            body: t('auth.feature2Body'),
        },
        {
            icon: Users,
            title: t('auth.feature3Title'),
            body: t('auth.feature3Body'),
        },
    ];

    return (
        <section className="inst-geo-pattern flex min-h-screen items-center justify-center bg-inst-bg p-4 sm:p-6 lg:p-8">
            <div className="grid w-full max-w-[1120px] overflow-hidden rounded-2xl border border-inst-border bg-white shadow-lg lg:grid-cols-12">
                <main className="flex flex-col justify-center bg-white p-8 sm:p-12 lg:col-span-7 lg:order-1 lg:p-16 order-2">
                    <div className="mx-auto w-full max-w-md space-y-8">
                        <div className="space-y-3 text-center lg:text-start">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-inst-border bg-inst-silver text-inst-teal lg:mx-0">
                                <LogIn className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="mb-1 text-[10px] font-bold tracking-[0.16em] text-inst-muted">
                                    {isLandlord ? t('auth.landlordPortal') : t('app.operationsConsole')}
                                </p>
                                <h2 className="text-2xl font-bold leading-tight text-inst-text">
                                    {t('auth.loginHeader')}
                                </h2>
                                <p className="mt-2 font-medium text-inst-muted">
                                    {t('auth.consoleDescription')}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
                                <Info className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                {needsTenantSlug && (
                                    <FormField
                                        control={form.control}
                                        name="tenant_slug"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[11px] font-bold tracking-wide text-inst-muted">{t('auth.tenantSlug')}</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Building2 className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-inst-muted group-focus-within:text-inst-primary" />
                                                        <Input
                                                            dir="ltr"
                                                            placeholder="my-wash"
                                                            className="h-12 rounded-lg border-inst-border bg-inst-silver ps-12 text-base font-semibold focus-visible:ring-inst-primary"
                                                            {...field}
                                                            onChange={(event) => {
                                                                field.onChange(event.target.value.toLowerCase());
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <p className="text-xs text-inst-muted">{t('auth.tenantSlugHint')}</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[11px] font-bold tracking-wide text-inst-muted">{t('auth.email')}</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <UserIcon className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-inst-muted group-focus-within:text-inst-primary" />
                                                    <Input
                                                        type="email"
                                                        autoComplete="email"
                                                        dir="ltr"
                                                        className="h-12 rounded-lg border-inst-border bg-inst-silver ps-12 text-base font-semibold focus-visible:ring-inst-primary"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[11px] font-bold tracking-wide text-inst-muted">{t('auth.password')}</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Lock className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-inst-muted group-focus-within:text-inst-primary" />
                                                    <Input
                                                        type="password"
                                                        autoComplete="current-password"
                                                        dir="ltr"
                                                        className="h-12 rounded-lg border-inst-border bg-inst-silver ps-12 text-base font-semibold focus-visible:ring-inst-primary"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="remember"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => field.onChange(checked === true)}
                                                    className="h-5 w-5 rounded-md border-inst-border bg-white data-[state=checked]:border-inst-primary data-[state=checked]:bg-inst-primary"
                                                />
                                            </FormControl>
                                            <FormLabel className="!mt-0 cursor-pointer text-xs font-bold text-inst-muted">{t('auth.remember')}</FormLabel>
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-12 w-full rounded-lg bg-inst-primary text-base font-bold text-white hover:bg-inst-teal"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && !quickLoginRole ? (
                                        <span className="flex items-center gap-3">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            {t('auth.loggingIn')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            {t('auth.submit')}
                                            <ArrowLeft className="h-4 w-4" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        {showQuickLogin && (
                            <div className="space-y-5">
                                <div className="relative flex items-center justify-center">
                                    <Separator className="bg-inst-border" />
                                    <span className="absolute bg-white px-3 text-[10px] font-bold tracking-[0.16em] text-inst-muted">
                                        {t('auth.quickLogin.title')}
                                    </span>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-2">
                                    {DEMO_ROLE_CREDENTIALS.map(({ role, email, password, labelKey, icon: Icon }) => {
                                        const isLoading = quickLoginRole === role;

                                        return (
                                            <Button
                                                key={role}
                                                type="button"
                                                variant="outline"
                                                className="h-12 justify-between rounded-lg border-inst-border bg-white px-3 hover:bg-inst-silver"
                                                disabled={isSubmitting}
                                                onClick={() => handleQuickLogin(email, password, role)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-inst-teal text-white">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="text-start">
                                                        <p className="text-xs font-bold leading-none text-inst-text">{t(labelKey)}</p>
                                                        <p className="mt-1 text-[9px] font-semibold tracking-wide text-inst-muted">{t('auth.quickLogin.hint')}</p>
                                                    </div>
                                                </div>
                                                {isLoading ? (
                                                    <Loader2 className="h-3 w-3 animate-spin text-inst-primary" />
                                                ) : (
                                                    <ChevronLeft className="h-4 w-4 text-inst-muted" />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>

                                {showLandlordQuickLogin && (
                                    <div className="space-y-3 pt-1">
                                        <p className="text-center text-[10px] font-bold tracking-[0.16em] text-inst-muted">
                                            {t('landlord.quickLogin.title')}
                                        </p>
                                        <div className="grid gap-2">
                                            {DEMO_LANDLORD_CREDENTIALS.map(({ role, email, password, labelKey, icon: Icon }) => {
                                                const isLoading = quickLoginRole === role;

                                                return (
                                                    <Button
                                                        key={role}
                                                        type="button"
                                                        variant="outline"
                                                        className="h-12 justify-between rounded-lg border-inst-border bg-white px-3 hover:bg-inst-silver"
                                                        disabled={isSubmitting}
                                                        onClick={() => handleLandlordQuickLogin(email, password, role)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-inst-teal text-white">
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <div className="text-start">
                                                                <p className="text-xs font-bold leading-none text-inst-text">{t(labelKey)}</p>
                                                                <p className="mt-1 text-[9px] font-semibold tracking-wide text-inst-muted">
                                                                    {t('landlord.quickLogin.hint')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isLoading ? (
                                                            <Loader2 className="h-3 w-3 animate-spin text-inst-primary" />
                                                        ) : (
                                                            <ChevronLeft className="h-4 w-4 text-inst-muted" />
                                                        )}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                <aside className="relative flex min-h-[320px] flex-col justify-between overflow-hidden bg-inst-teal p-8 text-white sm:p-12 lg:col-span-5 lg:order-2 lg:min-h-[680px] order-1">
                    <div className="inst-geo-pattern pointer-events-none absolute inset-0 opacity-20" />

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-5">
                            <div className="inline-flex rounded-lg bg-white p-3">
                                <Car className="h-8 w-8 text-inst-teal" />
                            </div>
                            <div className="space-y-2">
                                <Badge className="rounded-md border-0 bg-white/15 px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-white">
                                    {isLandlord ? t('auth.landlordPortal') : t('auth.tenantPortal')}
                                </Badge>
                                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                                    {t('auth.consoleLogin')}
                                </h1>
                            </div>
                            <p className="max-w-sm text-base font-medium leading-relaxed text-white/70">
                                {isLandlord ? t('auth.landlordLogin') : t('auth.tenantLogin')}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {features.map((feature) => (
                                <div key={feature.title} className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <div className="text-start">
                                        <p className="text-sm font-bold">{feature.title}</p>
                                        <p className="text-xs font-medium text-white/55">{feature.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <p className="text-start text-xs font-semibold leading-relaxed text-white/70">
                                {t('auth.officialNotice')}
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
