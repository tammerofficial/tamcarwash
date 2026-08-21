import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { applyFieldErrors, showApiError } from '@/lib/api-errors';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, Branch } from '@/types/api';

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const workingHourSchema = z.object({
    day_of_week: z.number().min(0).max(6),
    opens_at: z.string().optional(),
    closes_at: z.string().optional(),
    is_closed: z.boolean(),
});

const branchSchema = z.object({
    name: z.string().min(2, t('branches.validation.nameRequired')),
    code: z.string().max(20).optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email(t('branches.validation.emailInvalid')).optional().or(z.literal('')),
    capacity_per_hour: z.coerce.number().min(1).max(100).optional(),
    is_active: z.boolean(),
    working_hours: z.array(workingHourSchema).optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

function defaultWorkingHours(): BranchFormValues['working_hours'] {
    return Array.from({ length: 7 }, (_, day) => ({
        day_of_week: day,
        opens_at: '08:00',
        closes_at: '22:00',
        is_closed: day === 5,
    }));
}

function formatTime(value?: string | null): string {
    if (!value) return '08:00';
    return value.slice(0, 5);
}

export function BranchFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: branch, isLoading } = useAuthenticatedQuery({
        queryKey: ['branches', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Branch>>(`${endpoints.branches}/${id}`);
            return response.data;
        },
        enabled: isEdit,
        retry: false,
    });

    const form = useForm<BranchFormValues>({
        resolver: zodResolver(branchSchema),
        defaultValues: {
            name: '',
            code: '',
            city: '',
            address: '',
            phone: '',
            email: '',
            capacity_per_hour: 10,
            is_active: true,
            working_hours: defaultWorkingHours(),
        },
    });

    useEffect(() => {
        if (branch) {
            form.reset({
                name: branch.name,
                code: branch.code ?? '',
                city: branch.city ?? '',
                address: branch.address ?? '',
                phone: branch.phone ?? '',
                email: branch.email ?? '',
                capacity_per_hour: branch.capacity_per_hour ?? branch.capacity ?? 10,
                is_active: branch.is_active,
                working_hours: branch.working_hours?.length
                    ? branch.working_hours.map((hour) => ({
                          day_of_week: hour.day_of_week,
                          opens_at: formatTime(hour.opens_at),
                          closes_at: formatTime(hour.closes_at),
                          is_closed: hour.is_closed,
                      }))
                    : defaultWorkingHours(),
            });
        }
    }, [branch, form]);

    const mutation = useMutation({
        mutationFn: (values: BranchFormValues) => {
            const payload = { ...values, email: values.email || null, code: values.code || undefined };
            if (isEdit && id) {
                return api.put<ApiResponse<Branch>>(`${endpoints.branches}/${id}`, payload);
            }
            return api.post<ApiResponse<Branch>>(endpoints.branches, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast.success(isEdit ? t('branches.updated') : t('branches.created'));
            navigate('/branches');
        },
        onError: (error) => {
            applyFieldErrors<BranchFormValues>(error, form.setError);
            showApiError(error, isEdit ? t('branches.updateError') : t('branches.createError'));
        },
    });

    const workingHours = form.watch('working_hours') ?? [];

    if (isEdit && isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <FormPage
            title={isEdit ? t('branches.editTitle') : t('branches.createTitle')}
            backTo={isEdit && id ? `/branches/${id}` : '/branches'}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>{t('branches.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="code" render={({ field }) => (
                            <FormItem><FormLabel>{t('branches.code')}</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>{t('branches.city')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>{t('branches.phone')}</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>{t('branches.email')}</FormLabel><FormControl><Input {...field} type="email" dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="capacity_per_hour" render={({ field }) => (
                            <FormItem><FormLabel>{t('branches.capacity')}</FormLabel><FormControl><Input type="number" min={1} max={100} {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="sm:col-span-2"><FormLabel>{t('branches.address')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="is_active" render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0 sm:col-span-2">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel className="!mt-0">{t('common.active')}</FormLabel>
                            </FormItem>
                        )} />
                    </div>

                    <div className="space-y-2">
                        <FormLabel>{t('branches.workingHours')}</FormLabel>
                        <div className="rounded-md border">
                            {workingHours.map((hour, index) => (
                                <div key={hour.day_of_week} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b p-3 last:border-b-0">
                                    <span className="text-sm font-medium">{DAY_NAMES[hour.day_of_week]}</span>
                                    <FormField control={form.control} name={`working_hours.${index}.opens_at`} render={({ field }) => (
                                        <FormItem><FormControl><Input type="time" {...field} disabled={workingHours[index]?.is_closed} dir="ltr" /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`working_hours.${index}.closes_at`} render={({ field }) => (
                                        <FormItem><FormControl><Input type="time" {...field} disabled={workingHours[index]?.is_closed} dir="ltr" /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`working_hours.${index}.is_closed`} render={({ field }) => (
                                        <FormItem className="flex items-center gap-1 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel className="!mt-0 text-xs">{t('branches.closed')}</FormLabel>
                                        </FormItem>
                                    )} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/branches')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
