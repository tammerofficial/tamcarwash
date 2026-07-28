import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Car, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { appConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { t } from '@/lib/i18n';
import { ApiClientError } from '@/lib/api';
import { useState } from 'react';

const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
    const { login, isLandlord } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setError(null);
        try {
            await login(values);
            navigate('/');
        } catch (err: unknown) {
            setError(err instanceof ApiClientError ? err.message : 'فشل تسجيل الدخول');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Car className="h-7 w-7" />
                    </div>
                    <CardTitle>{t('auth.loginTitle')}</CardTitle>
                    <CardDescription>
                        {isLandlord ? t('auth.landlordLogin') : t('auth.tenantLogin')}
                        {appConfig.tenant?.name ? ` — ${appConfig.tenant.name}` : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('auth.email')}</FormLabel>
                                        <FormControl>
                                            <Input type="email" autoComplete="email" dir="ltr" {...field} />
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
                                        <FormLabel>{t('auth.password')}</FormLabel>
                                        <FormControl>
                                            <Input type="password" autoComplete="current-password" dir="ltr" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="remember"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="!mt-0 font-normal">{t('auth.remember')}</FormLabel>
                                    </FormItem>
                                )}
                            />

                            {error && <p className="text-sm text-destructive">{error}</p>}

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {t('auth.loggingIn')}
                                    </>
                                ) : (
                                    t('auth.submit')
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
