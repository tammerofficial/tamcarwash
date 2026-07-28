import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApiResponse } from '@/types/api';

interface PlatformSettings {
    platform_name: string;
    platform_domain: string;
    trial_days: number;
    support_email?: string | null;
}

export function LandlordSettingsPage() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['landlord-settings'],
        queryFn: () => api.get<ApiResponse<PlatformSettings>>(endpoints.landlord.settings),
    });

    const form = useForm<PlatformSettings>({
        values: data?.data ?? {
            platform_name: '',
            platform_domain: '',
            trial_days: 14,
            support_email: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (values: PlatformSettings) => api.put<ApiResponse<PlatformSettings>>(endpoints.landlord.settings, values),
        onSuccess: () => {
            toast.success('تم حفظ الإعدادات');
            queryClient.invalidateQueries({ queryKey: ['landlord-settings'] });
        },
        onError: () => toast.error('تعذر حفظ الإعدادات'),
    });

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">إعدادات المنصة</h2>
                <p className="text-muted-foreground">اسم المنصة، النطاق، وأيام التجربة</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>الإعدادات العامة</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="platform_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>اسم المنصة</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="platform_domain"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>نطاق المنصة</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="trial_days"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>أيام التجربة</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="support_email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>بريد الدعم</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={mutation.isPending}>
                                حفظ الإعدادات
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
