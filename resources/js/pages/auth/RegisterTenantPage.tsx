import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check, Droplets, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import {
    api,
    ApiClientError,
    appConfig,
    endpoints,
    setActiveTenantSlug,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { getPlatformName } from '@/lib/branding';
import { cn } from '@/lib/utils';
import { getTenantDashboardHref } from '@/lib/tenancy';
import type { ApiResponse, RegisterTenantResponse } from '@/types/api';

const planOptions = ['starter', 'pro', 'enterprise'] as const;

type PlanOption = (typeof planOptions)[number];

function resolvePlanFromQuery(value: string | null): PlanOption {
    if (value === 'professional') {
        return 'pro';
    }

    if (planOptions.includes(value as PlanOption)) {
        return value as PlanOption;
    }

    return 'starter';
}

const slugRegex = /^[a-z0-9-]*$/;

const registerSchema = z
    .object({
        business_name: z.string().min(2, 'اسم المغسلة مطلوب'),
        slug: z
            .string()
            .regex(slugRegex, 'الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط')
            .optional()
            .or(z.literal('')),
        owner_name: z.string().min(2, 'اسم المالك مطلوب'),
        owner_email: z.string().email('البريد الإلكتروني غير صالح'),
        owner_password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
        password_confirmation: z.string().min(8, 'تأكيد كلمة المرور مطلوب'),
        phone: z.string().optional(),
        plan_slug: z.enum(planOptions),
    })
    .refine((data) => data.owner_password === data.password_confirmation, {
        message: 'تأكيد كلمة المرور غير متطابق',
        path: ['password_confirmation'],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

function slugifyPreview(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export function RegisterTenantPage() {
    const [searchParams] = useSearchParams();
    const { refreshUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

    const platformDomain = appConfig.platformDomain ?? 'tamcarwash.com';
    const initialPlan = resolvePlanFromQuery(searchParams.get('plan'));
    const initialBilling = searchParams.get('billing') === 'yearly' ? 'yearly' : 'monthly';

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            business_name: '',
            slug: '',
            owner_name: '',
            owner_email: '',
            owner_password: '',
            password_confirmation: '',
            phone: '',
            plan_slug: initialPlan,
        },
    });

    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialBilling);

    const businessName = form.watch('business_name');
    const slugValue = form.watch('slug');
    const selectedPlan = form.watch('plan_slug');

    const previewSlug = useMemo(() => {
        if (slugValue?.trim()) {
            return slugValue.trim().toLowerCase();
        }

        const generated = slugifyPreview(businessName);
        return generated || 'your-wash';
    }, [businessName, slugValue]);

    const onSubmit = async (values: RegisterFormValues) => {
        setError(null);
        setFieldErrors(undefined);

        try {
            await api.ensureCsrfCookie();

            const payload = {
                business_name: values.business_name,
                slug: values.slug?.trim() || undefined,
                owner_name: values.owner_name,
                owner_email: values.owner_email,
                owner_password: values.owner_password,
                password_confirmation: values.password_confirmation,
                phone: values.phone?.trim() || undefined,
                plan_slug: values.plan_slug,
                billing_cycle: billingCycle, // Pass the billing cycle
            };

            const response = await api.post<ApiResponse<RegisterTenantResponse>>(
                endpoints.landlord.register,
                payload,
                undefined,
                { baseUrl: 'landlord' },
            );

            const tenantSlug = response.data.tenant.slug;
            setActiveTenantSlug(tenantSlug);

            try {
                await api.post(
                    endpoints.auth.login,
                    {
                        email: values.owner_email,
                        password: values.owner_password,
                        remember: true,
                    },
                    undefined,
                    { tenantSlug },
                );

                await refreshUser();
                window.location.assign(getTenantDashboardHref(tenantSlug));
            } catch (loginErr: unknown) {
                if (loginErr instanceof ApiClientError) {
                    setError(
                        `تم إنشاء المغسلة "${response.data.tenant.name}" بنجاح، لكن تعذّر تسجيل الدخول تلقائياً. يرجى تسجيل الدخول يدوياً باستخدام الرابط: ${tenantSlug}`,
                    );
                    return;
                }

                setError('تم إنشاء المغسلة، لكن تعذّر تسجيل الدخول تلقائياً. يرجى المحاولة من صفحة تسجيل الدخول.');
            }
        } catch (err: unknown) {
            if (err instanceof ApiClientError) {
                setError(err.message);
                setFieldErrors(err.errors);
                return;
            }

            setError('فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
        }
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/30" dir="rtl">
            <header className="border-b border-border/60 bg-background/80 backdrop-blur-lg">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                            <Droplets className="size-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">{getPlatformName()}</span>
                    </Link>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/login">{t('register.haveAccount')}</Link>
                    </Button>
                </div>
            </header>

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
                <div className="mb-8 space-y-2 text-center">
                    <Badge variant="secondary" className="border border-primary/20 bg-accent px-3 py-1 text-accent-foreground">
                        {t('register.badge')}
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('register.title')}</h1>
                    <p className="mx-auto max-w-2xl text-muted-foreground">{t('register.subtitle')}</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                        <Card className="border-border/80 shadow-lg">
                            <CardHeader>
                                <CardTitle>{t('register.formTitle')}</CardTitle>
                                <CardDescription>{t('register.formSubtitle')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="business_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('register.businessName')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('register.businessNamePlaceholder')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            {fieldErrors?.business_name && (
                                                <p className="text-sm text-destructive">{fieldErrors.business_name[0]}</p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('register.slug')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    dir="ltr"
                                                    placeholder="al-wadi-wash"
                                                    {...field}
                                                    onChange={(event) => {
                                                        field.onChange(event.target.value.toLowerCase());
                                                    }}
                                                />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground" dir="ltr">
                                                {t('register.slugPreview')}:{' '}
                                                <span className="font-medium text-foreground">
                                                    {previewSlug}.{platformDomain}
                                                </span>
                                            </p>
                                            <FormMessage />
                                            {fieldErrors?.slug && (
                                                <p className="text-sm text-destructive">{fieldErrors.slug[0]}</p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="owner_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('register.ownerName')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('register.phone')}</FormLabel>
                                                <FormControl>
                                                    <Input dir="ltr" placeholder="+965 18XXXXXX" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="owner_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('register.email')}</FormLabel>
                                            <FormControl>
                                                <Input type="email" autoComplete="email" dir="ltr" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            {fieldErrors?.owner_email && (
                                                <p className="text-sm text-destructive">{fieldErrors.owner_email[0]}</p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="owner_password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('register.password')}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        autoComplete="new-password"
                                                        dir="ltr"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password_confirmation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('register.passwordConfirm')}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        autoComplete="new-password"
                                                        dir="ltr"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {error && <p className="text-sm text-destructive">{error}</p>}

                                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            {t('register.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            {t('register.submit')}
                                            <ArrowLeft className="size-4" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="mb-1 text-lg font-black text-slate-950">{t('register.planTitle')}</h2>
                                    <p className="text-xs font-bold text-slate-500">{t('register.planSubtitle')}</p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('monthly')}
                                        className={cn(
                                            'rounded-full px-3 py-1 text-[10px] font-black transition-all',
                                            billingCycle === 'monthly'
                                                ? 'bg-slate-950 text-white'
                                                : 'text-slate-500 hover:text-slate-950',
                                        )}
                                    >
                                        شهري
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('yearly')}
                                        className={cn(
                                            'rounded-full px-3 py-1 text-[10px] font-black transition-all',
                                            billingCycle === 'yearly'
                                                ? 'bg-slate-950 text-white'
                                                : 'text-slate-500 hover:text-slate-950',
                                        )}
                                    >
                                        سنوي
                                    </button>
                                </div>
                            </div>

                            {planOptions.map((plan) => {
                                const isSelected = selectedPlan === plan;
                                const isEnterprise = plan === 'enterprise';
                                const price = billingCycle === 'yearly'
                                    ? (plan === 'starter' ? 290 : plan === 'pro' ? 590 : 'تواصل')
                                    : (plan === 'starter' ? 29 : plan === 'pro' ? 59 : 'تواصل');
                                const period = billingCycle === 'yearly' ? 'ر.ع / سنوياً' : 'ر.ع / شهرياً';

                                return (
                                    <button
                                        key={plan}
                                        type="button"
                                        onClick={() => form.setValue('plan_slug', plan, { shouldValidate: true })}
                                        className={cn(
                                            'w-full rounded-2xl border-2 p-5 text-start transition-all duration-300',
                                            isSelected
                                                ? 'border-[#0A4B78] bg-sky-50 shadow-xl shadow-sky-900/5 ring-1 ring-[#0A4B78]/20'
                                                : 'border-slate-100 bg-white hover:border-sky-200 hover:shadow-lg',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-slate-950 tracking-tight">{t(`marketing.pricing.${plan}.name`)}</p>
                                                    {plan === 'pro' && (
                                                        <Badge variant="secondary" className="bg-[#0A4B78] text-white text-[9px] font-black px-2 py-0">
                                                            الأكثر طلباً
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-500 leading-snug">
                                                    {t(`marketing.pricing.${plan}.description`)}
                                                </p>
                                                <div className="flex items-baseline gap-1.5 pt-1">
                                                    <span className="text-xl font-black text-[#0A4B78]">
                                                        {price}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">
                                                        {period}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className={cn(
                                                    'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                                                    isSelected
                                                        ? 'border-[#0A4B78] bg-[#0A4B78] text-white'
                                                        : 'border-slate-200',
                                                )}
                                            >
                                                {isSelected && <Check className="size-3.5 stroke-[4]" />}
                                            </div>
                                        </div>
                                        {isEnterprise && isSelected && (
                                            <p className="mt-3 text-[10px] font-bold text-sky-700 bg-sky-100/50 p-2 rounded-lg">{t('register.enterpriseNote')}</p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
