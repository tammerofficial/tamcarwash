import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { Loader2, Save, Upload, Palette } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, TenantSettings } from '@/types/api';
import { toast } from 'sonner';
import {
    applyBrandingCssVariables,
    DEFAULT_BRAND_PRIMARY,
    DEFAULT_BRAND_SECONDARY,
    hexToRgba,
} from '@/lib/branding';

const appearanceSchema = z.object({
    primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t('appearance.invalidColor')),
    secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t('appearance.invalidColor')),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

function AppearancePreview({ primary, secondary }: { primary: string; secondary: string }) {
    return (
        <div className="rounded-2xl border overflow-hidden shadow-sm">
            <div
                className="p-6 text-white space-y-4"
                style={{ backgroundColor: primary }}
            >
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">{t('appearance.previewHero')}</p>
                <h3 className="text-2xl font-bold">
                    {t('appearance.previewHeadline')}{' '}
                    <span style={{ color: secondary }}>{t('appearance.previewAccent')}</span>
                </h3>
                <Button
                    type="button"
                    className="rounded-xl font-bold border-none text-white"
                    style={{ backgroundColor: secondary }}
                >
                    {t('appearance.previewCta')}
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-white p-4">
                {[1, 2].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: hexToRgba(secondary, 0.12), color: secondary }}
                        >
                            <Palette className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{t('appearance.previewTrust')}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Trust Strip</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AppearancePage() {
    const queryClient = useQueryClient();
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { data, isLoading } = useAuthenticatedQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TenantSettings>>(endpoints.settings);
            return response.data;
        },
        retry: false,
    });

    const form = useForm<AppearanceFormValues>({
        resolver: zodResolver(appearanceSchema),
        defaultValues: {
            primary_color: DEFAULT_BRAND_PRIMARY,
            secondary_color: DEFAULT_BRAND_SECONDARY,
        },
    });

    const watchedPrimary = form.watch('primary_color');
    const watchedSecondary = form.watch('secondary_color');

    useEffect(() => {
        if (data) {
            form.reset({
                primary_color: data.primary_color ?? DEFAULT_BRAND_PRIMARY,
                secondary_color: data.secondary_color ?? DEFAULT_BRAND_SECONDARY,
            });
            if (data.logo_url) {
                setLogoPreview(data.logo_url);
            }
        }
    }, [data, form]);

    useEffect(() => {
        applyBrandingCssVariables({
            primaryColor: watchedPrimary,
            secondaryColor: watchedSecondary,
        });
    }, [watchedPrimary, watchedSecondary]);

    const mutation = useMutation({
        mutationFn: (values: AppearanceFormValues) => {
            const formData = new FormData();
            formData.append('primary_color', values.primary_color);
            formData.append('secondary_color', values.secondary_color);
            if (logoFile) {
                formData.append('logo', logoFile);
            }
            formData.append('_method', 'PUT');
            return api.post<ApiResponse<TenantSettings>>(endpoints.settings, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            queryClient.invalidateQueries({ queryKey: ['storefront', 'profile'] });
            toast.success(t('appearance.saveSuccess'));
            window.location.reload();
        },
        onError: () => toast.error(t('appearance.saveError')),
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title={t('appearance.title')} description={t('appearance.subtitle')} />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title={t('appearance.title')} description={t('appearance.subtitle')} />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('appearance.title')}</CardTitle>
                        <CardDescription>{t('appearance.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <FormLabel>{t('appearance.logo')}</FormLabel>
                                    <div className="flex items-center gap-6">
                                        <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50 p-2 overflow-hidden">
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview}
                                                    alt={t('appearance.logoPreviewAlt')}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <Upload className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setLogoFile(file);
                                                        setLogoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                                className="w-full max-w-xs"
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                {t('appearance.logoHint')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="primary_color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('appearance.primaryColor')}</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2">
                                                        <Input type="color" {...field} className="w-16 p-1 h-10" />
                                                        <Input {...field} dir="ltr" />
                                                    </div>
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground">{t('appearance.primaryHint')}</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="secondary_color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('appearance.secondaryColor')}</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2">
                                                        <Input type="color" {...field} className="w-16 p-1 h-10" />
                                                        <Input {...field} dir="ltr" />
                                                    </div>
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground">{t('appearance.secondaryHint')}</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-4 border-t">
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

                <Card>
                    <CardHeader>
                        <CardTitle>{t('appearance.livePreview')}</CardTitle>
                        <CardDescription>{t('appearance.livePreviewHint')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AppearancePreview primary={watchedPrimary} secondary={watchedSecondary} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
