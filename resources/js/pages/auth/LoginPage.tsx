import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Car, Loader2, ArrowRight, ShieldCheck, Building2, Lock, User as UserIcon, LogIn, Droplets, Info, ChevronRight, ClipboardList, Users } from 'lucide-react';
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
import { ApiClientError } from '@/lib/api';
import { DEMO_ROLE_CREDENTIALS, isQuickLoginEnabled } from '@/lib/demoCredentials';
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
    const showQuickLogin = isQuickLoginEnabled() && !isLandlord;

    const needsTenantSlug = !isLandlord && !appConfig.tenant?.slug;
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

        try {
            await submitLogin({
                email,
                password,
                remember: false,
                tenant_slug: form.getValues('tenant_slug')?.trim() || storedTenantSlug || undefined,
            });
        } finally {
            setQuickLoginRole(null);
        }
    };

    const isSubmitting = form.formState.isSubmitting || quickLoginRole !== null;

    const features = [
        {
            icon: Car,
            title: t('auth.feature1Title') || 'إدارة غسيل السيارات',
            body: t('auth.feature1Body') || 'نظام متكامل لإدارة الطلبات والعملاء والمغاسل.',
        },
        {
            icon: ClipboardList,
            title: t('auth.feature2Title') || 'تتبع الطلبات',
            body: t('auth.feature2Body') || 'متابعة حالة الطلبات من الاستلام حتى التسليم.',
        },
        {
            icon: Users,
            title: t('auth.feature3Title') || 'إدارة العملاء',
            body: t('auth.feature3Body') || 'قاعدة بيانات شاملة للعملاء وتاريخ تعاملاتهم.',
        },
    ];

    return (
        <section className="min-h-screen bg-muted/30 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-700">
            <div className="w-full max-w-[1200px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-border/40 grid lg:grid-cols-12">
                
                {/* 1. Left Aside: Institutional Branding & Values */}
                <aside className="lg:col-span-5 relative overflow-hidden bg-primary text-primary-foreground p-8 sm:p-12 flex flex-col justify-between min-h-[400px] lg:min-h-[700px]">
                    {/* Background Decorations */}
                    <div className="absolute inset-0 pointer-events-none opacity-5">
                        <Car className="absolute -top-10 -left-10 h-64 w-64 rotate-12" />
                        <Droplets className="absolute -bottom-20 right-20 h-96 w-96 -rotate-12" />
                        <Car className="absolute top-1/2 left-1/3 h-48 w-48 opacity-50" />
                    </div>

                    <div className="relative z-10 space-y-10">
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-3xl inline-block shadow-xl">
                                <Car className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <Badge className="bg-white/20 text-white border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                                    {isLandlord ? t('auth.landlordPortal') || 'بوابة الإدارة المركزية' : t('auth.tenantPortal') || 'بوابة المشتركين'}
                                </Badge>
                                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mt-4">
                                    {t('auth.loginTitle')}
                                </h1>
                            </div>
                            <p className="text-white/60 text-lg leading-relaxed max-w-sm font-medium">
                                {isLandlord ? t('auth.landlordLogin') : t('auth.tenantLogin')}
                            </p>
                        </div>

                        {/* Value Props / Features */}
                        <div className="space-y-4">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-all duration-300">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">{feature.title}</p>
                                        <p className="text-xs text-white/40 font-bold">{feature.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <p className="text-xs text-white/60 font-bold leading-relaxed">
                                    {t('auth.officialNotice') || 'نظام آمن ومشفر لحماية بياناتك ومعاملاتك المالية.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* 2. Right Side: Login Form */}
                <main className="lg:col-span-7 bg-muted/5 p-8 sm:p-12 lg:p-20 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full space-y-10">
                        {/* Welcome Header */}
                        <div className="space-y-4 text-center lg:text-start">
                            <div className="h-16 w-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto lg:mx-0 shadow-sm border border-primary/10">
                                <LogIn className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-foreground leading-none">
                                    {t('auth.loginHeader') || 'تسجيل الدخول'}
                                </h2>
                                <p className="text-muted-foreground font-bold mt-3">
                                    {t('auth.loginDescription') || 'أهلاً بك مجدداً، يرجى إدخال بياناتك للمتابعة.'}
                                </p>
                            </div>
                        </div>

                        {/* Error Handling */}
                        {error && (
                            <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-2xl flex items-center gap-3 text-destructive animate-in slide-in-from-top-2 duration-300">
                                <Info className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {needsTenantSlug && (
                                    <FormField
                                        control={form.control}
                                        name="tenant_slug"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">{t('auth.tenantSlug')}</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Building2 className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                                                        <Input
                                                            dir="ltr"
                                                            placeholder="my-wash"
                                                            className="h-14 ps-12 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary font-bold text-lg transition-all"
                                                            {...field}
                                                            onChange={(event) => {
                                                                field.onChange(event.target.value.toLowerCase());
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground ps-1">{t('auth.tenantSlugHint')}</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">{t('auth.email')}</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <UserIcon className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                                                    <Input 
                                                        type="email" 
                                                        autoComplete="email" 
                                                        dir="ltr" 
                                                        className="h-14 ps-12 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary font-bold text-lg transition-all"
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
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">{t('auth.password')}</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Lock className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                                                    <Input 
                                                        type="password" 
                                                        autoComplete="current-password" 
                                                        dir="ltr" 
                                                        className="h-14 ps-12 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary font-bold text-lg transition-all"
                                                        {...field} 
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between gap-4 ps-1">
                                    <FormField
                                        control={form.control}
                                        name="remember"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0 cursor-pointer group">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={(checked) => field.onChange(checked === true)}
                                                        className="h-5 w-5 rounded-lg border-2 border-muted-foreground/20 bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0 text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer">{t('auth.remember')}</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button 
                                        type="submit" 
                                        size="lg"
                                        className="h-16 w-full rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && !quickLoginRole ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                {t('auth.loggingIn')}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                {t('auth.submit')}
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        {/* Quick Login for Demo/Dev */}
                        {showQuickLogin && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                                <div className="relative flex items-center justify-center">
                                    <Separator className="bg-border/60" />
                                    <span className="absolute bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('auth.quickLogin.title')}
                                    </span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {DEMO_ROLE_CREDENTIALS.map(({ role, email, password, labelKey, icon: Icon }) => {
                                        const isLoading = quickLoginRole === role;

                                        return (
                                            <Button
                                                key={role}
                                                type="button"
                                                variant="outline"
                                                className="h-14 rounded-xl border-border/60 bg-white/50 hover:bg-white hover:border-primary/30 justify-between px-4 group transition-all"
                                                disabled={isSubmitting}
                                                onClick={() => handleQuickLogin(email, password, role)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="text-start">
                                                        <p className="text-xs font-black text-foreground leading-none">{t(labelKey)}</p>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{t('auth.quickLogin.hint')}</p>
                                                    </div>
                                                </div>
                                                {isLoading ? (
                                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary" />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </section>
    );
}
