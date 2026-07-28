import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, TenantSettings } from '@/types/api';
import { toast } from 'sonner';

const settingsSchema = z.object({
    business_name: z.string().min(2, 'اسم المنشأة مطلوب'),
    vat_enabled: z.boolean(),
    vat_rate: z.coerce.number().min(0).max(100),
    vat_inclusive: z.boolean(),
    currency: z.string().min(3),
    timezone: z.string().min(1),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TenantSettings>>(endpoints.settings);
            return response.data;
        },
        retry: false,
    });

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            business_name: '',
            vat_enabled: true,
            vat_rate: 5,
            vat_inclusive: false,
            currency: 'OMR',
            timezone: 'Asia/Muscat',
        },
    });

    useEffect(() => {
        if (data) {
            form.reset(data);
        }
    }, [data, form]);

    const mutation = useMutation({
        mutationFn: (values: SettingsFormValues) => api.put<ApiResponse<TenantSettings>>(endpoints.settings, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('تم حفظ الإعدادات');
        },
        onError: () => toast.error('تعذّر حفظ الإعدادات'),
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />

            <Card>
                <CardHeader>
                    <CardTitle>إعدادات عامة</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="business_name"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>{t('settings.businessName')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('settings.currency')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="timezone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('settings.timezone')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vat_enabled"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0 md:col-span-2">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="!mt-0">{t('settings.vatEnabled')}</FormLabel>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vat_rate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('settings.vatRate')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vat_inclusive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="!mt-0">{t('settings.vatInclusive')}</FormLabel>
                                    </FormItem>
                                )}
                            />

                            <div className="md:col-span-2">
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            {t('common.save')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
