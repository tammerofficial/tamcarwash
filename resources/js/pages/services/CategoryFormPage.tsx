import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import type { ApiResponse, ServiceCategory } from '@/types/api';

const categorySchema = z.object({
    name: z.string().min(2, t('services.nameRequired')),
    name_ar: z.string().optional(),
    is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: '', name_ar: '', is_active: true },
    });

    const mutation = useMutation({
        mutationFn: (values: CategoryFormValues) => api.post<ApiResponse<ServiceCategory>>(endpoints.serviceCategories, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
            toast.success(t('services.categoryCreated'));
            navigate('/services');
        },
        onError: () => toast.error('تعذّر إنشاء الفئة'),
    });

    return (
        <FormPage title={t('services.addCategory')} description={t('services.subtitle')} backTo="/services">
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{t('services.categoryName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="name_ar" render={({ field }) => (
                        <FormItem><FormLabel>{t('services.nameAr')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="is_active" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="!mt-0">{t('common.active')}</FormLabel>
                        </FormItem>
                    )} />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/services')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
