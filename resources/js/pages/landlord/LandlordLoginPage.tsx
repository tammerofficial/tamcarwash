import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
import { useLandlordAuth } from '@/providers/LandlordAuthProvider';
import { ApiClientError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { t } from '@/lib/i18n';
import { DEMO_LANDLORD_CREDENTIALS, isQuickLoginEnabled } from '@/lib/demoCredentials';

const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
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
        },
    });

    const submitLogin = async (values: LoginFormValues) => {
        setError(null);
        try {
            await login(values.email, values.password);
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
            await submitLogin({ email, password });
        } finally {
            setQuickLoginRole(null);
        }
    };

    const isSubmitting = form.formState.isSubmitting || quickLoginRole !== null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md space-y-4">
                <Card>
                    <CardHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Shield className="h-6 w-6" />
                        </div>
                        <CardTitle>دخول إدارة المنصة</CardTitle>
                        <CardDescription>لوحة Landlord لإدارة المستأجرين والاشتراكات</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>البريد الإلكتروني</FormLabel>
                                            <FormControl>
                                                <Input type="email" autoComplete="username" dir="ltr" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>كلمة المرور</FormLabel>
                                            <FormControl>
                                                <Input type="password" autoComplete="current-password" dir="ltr" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting && !quickLoginRole ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'تسجيل الدخول'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {showQuickLogin && (
                    <Card className="border-dashed border-muted-foreground/25 bg-muted/30">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('landlord.quickLogin.title')}
                            </CardTitle>
                            <CardDescription className="text-xs">{t('landlord.quickLogin.hint')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-2">
                                {DEMO_LANDLORD_CREDENTIALS.map(({ role, email, password, labelKey, icon: Icon }) => {
                                    const isLoading = quickLoginRole === role;

                                    return (
                                        <Button
                                            key={role}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-auto justify-start gap-2 py-2.5"
                                            disabled={isSubmitting}
                                            onClick={() => handleQuickLogin(email, password, role)}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                            ) : (
                                                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            )}
                                            <span>{t(labelKey)}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
