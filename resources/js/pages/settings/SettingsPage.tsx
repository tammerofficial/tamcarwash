import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
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
import type { ApiResponse, TaxSettings, TenantSettings } from '@/types/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const settingsSchema = z.object({
    business_name: z.string().min(2, 'اسم المنشأة مطلوب'),
    vat_enabled: z.boolean(),
    vat_rate: z.coerce.number().min(0).max(100),
    vat_inclusive: z.boolean(),
    currency: z.string().min(3),
    timezone: z.string().min(1),
});

const taxSettingsSchema = z.object({
    vat_enabled: z.boolean(),
    vat_rate: z.coerce.number().min(0).max(100),
    prices_tax_inclusive: z.boolean(),
    vatin: z.string().optional(),
    cr_number: z.string().optional(),
    legal_name_ar: z.string().optional(),
    legal_name_en: z.string().optional(),
    address: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type TaxSettingsFormValues = z.infer<typeof taxSettingsSchema>;

export function SettingsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useAuthenticatedQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TenantSettings>>(endpoints.settings);
            return response.data;
        },
        retry: false,
    });

    const { data: taxData, isLoading: taxLoading } = useAuthenticatedQuery({
        queryKey: ['tax-settings'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TaxSettings>>(endpoints.taxSettings);
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

    const taxForm = useForm<TaxSettingsFormValues>({
        resolver: zodResolver(taxSettingsSchema),
        defaultValues: {
            vat_enabled: true,
            vat_rate: 5,
            prices_tax_inclusive: false,
            vatin: '',
            cr_number: '',
            legal_name_ar: '',
            legal_name_en: '',
            address: '',
        },
    });

    useEffect(() => {
        if (data) {
            form.reset(data);
        }
    }, [data, form]);

    useEffect(() => {
        if (taxData) {
            taxForm.reset({
                vat_enabled: taxData.vat_enabled,
                vat_rate: taxData.vat_rate,
                prices_tax_inclusive: taxData.prices_tax_inclusive,
                vatin: taxData.vatin ?? '',
                cr_number: taxData.cr_number ?? '',
                legal_name_ar: taxData.legal_name_ar ?? '',
                legal_name_en: taxData.legal_name_en ?? '',
                address: taxData.address ?? '',
            });
        }
    }, [taxData, taxForm]);

    const mutation = useMutation({
        mutationFn: (values: SettingsFormValues) =>
            api.put<ApiResponse<TenantSettings>>(endpoints.settings, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success(t('settings.saveSuccess'));
        },
        onError: () => toast.error(t('settings.saveError')),
    });

    const taxMutation = useMutation({
        mutationFn: (values: TaxSettingsFormValues) =>
            api.put<ApiResponse<TaxSettings>>(endpoints.taxSettings, {
                ...values,
                vatin: values.vatin || null,
                cr_number: values.cr_number || null,
                legal_name_ar: values.legal_name_ar || null,
                legal_name_en: values.legal_name_en || null,
                address: values.address || null,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
            toast.success(t('settings.taxSaveSuccess'));
        },
        onError: () => toast.error(t('settings.taxSaveError')),
    });

    if (isLoading || taxLoading) {
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

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
                    <TabsTrigger value="tax">{t('settings.vatSettings')}</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('settings.businessSettings')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
                                    className="grid gap-6 md:grid-cols-2"
                                >
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

                                    <div className="md:col-span-2">
                                        <Button type="submit" disabled={mutation.isPending}>
                                            {mutation.isPending ? (
                                                <>
                                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                                    {t('common.saving')}
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="ml-2 h-4 w-4" />
                                                    {t('common.save')}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tax">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('settings.vatSettings')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...taxForm}>
                                <form
                                    onSubmit={taxForm.handleSubmit((values) => taxMutation.mutate(values))}
                                    className="grid gap-6 md:grid-cols-2"
                                >
                                    <FormField
                                        control={taxForm.control}
                                        name="vatin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('settings.vatin')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} dir="ltr" placeholder="OM1234567890" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={taxForm.control}
                                        name="cr_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('settings.crNumber')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} dir="ltr" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={taxForm.control}
                                        name="legal_name_ar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('settings.legalNameAr')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={taxForm.control}
                                        name="legal_name_en"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('settings.legalNameEn')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} dir="ltr" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={taxForm.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>{t('settings.address')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={taxForm.control}
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
                                        control={taxForm.control}
                                        name="vat_rate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('settings.vatRate')}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} dir="ltr" />
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground">{t('settings.vatRateHint')}</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={taxForm.control}
                                        name="prices_tax_inclusive"
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
                                        <Button type="submit" disabled={taxMutation.isPending}>
                                            {taxMutation.isPending ? (
                                                <>
                                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                                    {t('common.saving')}
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="ml-2 h-4 w-4" />
                                                    {t('settings.saveVat')}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
