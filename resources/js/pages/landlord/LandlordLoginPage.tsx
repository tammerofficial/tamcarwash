import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
    Loader2,
    ArrowLeft,
    Car,
    Droplets,
    Info,
    ShieldCheck,
    Lock,
    User as UserIcon,
    ChevronLeft,
    CreditCard,
    Layers,
    Building2,
    BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import { useLandlordAuth } from '@/providers/LandlordAuthProvider';
import { ApiClientError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { t } from '@/lib/i18n';
import { DEMO_LANDLORD_CREDENTIALS, isQuickLoginEnabled } from '@/lib/demoCredentials';

const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LandlordLoginPage() {
    const { login } = useLandlordAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [quickLoginRole, setQuickLoginRole] = useState<string | null>(null);
    const showQuickLogin = isQuickLoginEnabled();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    const submitLogin = async (values: LoginFormValues) => {
        setError(null);
        try {
            await login(values.email, values.password, values.remember);
            navigate('/landlord/dashboard');
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
            });
        } finally {
            setQuickLoginRole(null);
        }
    };

    const isSubmitting = form.formState.isSubmitting || quickLoginRole !== null;

    const features = [
        {
            icon: CreditCard,
            title: t('landlord.login.feature1Title'),
            body: t('landlord.login.feature1Body'),
        },
        {
            icon: Layers,
            title: t('landlord.login.feature2Title'),
            body: t('landlord.login.feature2Body'),
        },
        {
            icon: Building2,
            title: t('landlord.login.feature3Title'),
            body: t('landlord.login.feature3Body'),
        },
        {
            icon: BarChart3,
            title: t('landlord.login.feature4Title'),
            body: t('landlord.login.feature4Body'),
        },
    ];

    const mockStats = [
        {
            label: t('landlord.login.statWashesLabel'),
            value: t('landlord.login.statWashesValue'),
        },
        {
            label: t('landlord.login.statSubscriptionsLabel'),
            value: t('landlord.login.statSubscriptionsValue'),
        },
    ];

    return (
        <section className="min-h-screen bg-muted/30 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-700">
            <div className="w-full max-w-[1200px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-border/40 grid lg:grid-cols-12">
                {/* 1. Login form — first in RTL grid = right side */}
                <main className="lg:col-span-7 bg-muted/5 p-8 sm:p-12 lg:p-20 flex flex-col justify-center order-2 lg:order-1">
                    <div className="max-w-md mx-auto w-full space-y-10">
                        <div className="space-y-4 text-center lg:text-start">
                            <div className="flex flex-col items-center gap-3 lg:items-start">
                                <div className="h-16 w-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shadow-sm border border-primary/10">
                                    <Car className="h-8 w-8" />
                                </div>
                                <p className="text-sm font-black text-primary tracking-tight">
                                    {t('landlord.login.brandName')}
                                </p>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-foreground leading-none">
                                    {t('landlord.login.title')}
                                </h2>
                                <p className="text-muted-foreground font-bold mt-3">
                                    {t('landlord.login.subtitle')}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-2xl flex items-center gap-3 text-destructive animate-in slide-in-from-top-2 duration-300">
                                <Info className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">
                                                {t('landlord.login.email')}
                                            </FormLabel>
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
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ps-1">
                                                {t('landlord.login.password')}
                                            </FormLabel>
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
                                                <FormLabel className="!mt-0 text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer">
                                                    {t('landlord.login.remember')}
                                                </FormLabel>
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
                                                {t('landlord.login.loggingIn')}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                {t('landlord.login.submit')}
                                                <ArrowLeft className="h-5 w-5" />
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        {showQuickLogin && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                                <div className="relative flex items-center justify-center">
                                    <Separator className="bg-border/60" />
                                    <span className="absolute bg-muted/5 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('landlord.quickLogin.title')}
                                    </span>
                                </div>

                                <div className="grid gap-3">
                                    {DEMO_LANDLORD_CREDENTIALS.map(({ role, email, password, labelKey, icon: Icon }) => {
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
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                                                            {t('landlord.quickLogin.hint')}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isLoading ? (
                                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                ) : (
                                                    <ChevronLeft className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary" />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* 2. Brand / marketing panel — second in RTL grid = left side */}
                <aside
                    className="lg:col-span-5 relative overflow-hidden text-primary-foreground p-8 sm:p-12 flex flex-col justify-between min-h-[400px] lg:min-h-[700px] order-1 lg:order-2"
                    style={{
                        backgroundImage: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #0ea5e9 55%, #0891b2 100%)',
                    }}
                >
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.07]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                        }}
                    />

                    <div className="absolute inset-0 pointer-events-none opacity-10">
                        <Car className="absolute -top-10 -start-10 h-64 w-64 rotate-12" />
                        <Droplets className="absolute -bottom-20 end-20 h-96 w-96 -rotate-12" />
                        <Building2 className="absolute top-1/2 start-1/3 h-48 w-48 opacity-50" />
                    </div>

                    <div className="relative z-10 space-y-10">
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-3xl inline-block shadow-xl">
                                <Car className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <Badge className="bg-white/20 text-white border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                                    {t('landlord.login.badge')}
                                </Badge>
                                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mt-4">
                                    {t('landlord.login.heroTitle')}
                                </h1>
                            </div>
                            <p className="text-white/70 text-lg leading-relaxed max-w-sm font-medium">
                                {t('landlord.login.heroDescription')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-all duration-300">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <div className="text-start">
                                        <p className="font-black text-sm">{feature.title}</p>
                                        <p className="text-xs text-white/50 font-bold">{feature.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {mockStats.map((stat) => (
                                <Card key={stat.label} className="border-white/10 bg-white/10 backdrop-blur-md shadow-none">
                                    <CardContent className="p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <p className="text-xs text-white/60 font-bold leading-relaxed text-start">
                                    {t('landlord.login.securityNotice')}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
