import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { Ban, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { applyFieldErrors, showApiError } from '@/lib/api-errors';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, Customer, CustomerNote } from '@/types/api';

const customerSchema = z.object({
    name: z.string().min(2, t('customers.validation.nameRequired')),
    phone: z.string().min(5, t('customers.validation.phoneRequired')),
    email: z.string().email(t('customers.validation.emailInvalid')).optional().or(z.literal('')),
    status: z.enum(['active', 'inactive', 'blacklisted']),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CustomerFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [noteText, setNoteText] = useState('');

    const { data: customerDetail, isLoading } = useAuthenticatedQuery({
        queryKey: ['customers', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Customer>>(`${endpoints.customers}/${id}`);
            return response.data;
        },
        enabled: isEdit,
        retry: false,
    });

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: { name: '', phone: '', email: '', status: 'active' },
    });

    useEffect(() => {
        if (customerDetail) {
            form.reset({
                name: customerDetail.name,
                phone: customerDetail.phone,
                email: customerDetail.email ?? '',
                status: customerDetail.status,
            });
        }
    }, [customerDetail, form]);

    const saveMutation = useMutation({
        mutationFn: (values: CustomerFormValues) => {
            const payload = { ...values, email: values.email || null };
            if (isEdit && id) {
                return api.put<ApiResponse<Customer>>(`${endpoints.customers}/${id}`, payload);
            }
            return api.post<ApiResponse<Customer>>(endpoints.customers, payload);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success(isEdit ? t('customers.updated') : t('customers.created'));
            navigate(isEdit ? `/customers/${id}` : `/customers/${response.data.id}`);
        },
        onError: (error) => {
            applyFieldErrors<CustomerFormValues>(error, form.setError);
            showApiError(error, isEdit ? t('customers.updateError') : t('customers.createError'));
        },
    });

    const addNoteMutation = useMutation({
        mutationFn: (note: string) => api.post<ApiResponse<CustomerNote>>(`${endpoints.customers}/${id}/notes`, { note }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers', id] });
            setNoteText('');
            toast.success(t('customers.noteAdded'));
        },
        onError: (error) => showApiError(error, t('customers.noteError')),
    });

    const blacklistMutation = useMutation({
        mutationFn: () => api.post<ApiResponse<Customer>>(`${endpoints.customers}/${id}/blacklist`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            form.setValue('status', 'blacklisted');
            toast.success(t('customers.blacklistedSuccess'));
        },
        onError: (error) => showApiError(error, t('customers.blacklistError')),
    });

    const activateMutation = useMutation({
        mutationFn: () => api.post<ApiResponse<Customer>>(`${endpoints.customers}/${id}/activate`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            form.setValue('status', 'active');
            toast.success(t('customers.activated'));
        },
        onError: (error) => showApiError(error, t('customers.activateError')),
    });

    if (isEdit && isLoading) return <Skeleton className="h-64 w-full" />;

    const notes = customerDetail?.notes ?? [];

    return (
        <FormPage title={isEdit ? t('customers.editTitle') : t('customers.createTitle')} backTo={isEdit ? `/customers/${id}` : '/customers'}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{t('customers.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>{t('customers.phone')}</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>{t('customers.email')}</FormLabel><FormControl><Input {...field} type="email" dir="ltr" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('common.status')}</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="active">{t('common.active')}</SelectItem>
                                    <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                                    <SelectItem value="blacklisted">{t('customers.blacklisted')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {isEdit && (
                        <>
                            <div className="rounded-md border bg-muted/30 p-3">
                                <p className="text-sm font-medium">{t('customers.loyaltyPoints')}</p>
                                <p className="text-2xl font-bold">{customerDetail?.loyalty_points_balance ?? 0}</p>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="text-sm font-medium">{t('customers.blacklistToggle')}</p>
                                    <p className="text-xs text-muted-foreground">{t('customers.blacklistHint')}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant={form.watch('status') === 'blacklisted' ? 'secondary' : 'destructive'}
                                    size="sm"
                                    disabled={blacklistMutation.isPending || activateMutation.isPending}
                                    onClick={() => form.watch('status') === 'blacklisted' ? activateMutation.mutate() : blacklistMutation.mutate()}
                                >
                                    <Ban className="h-4 w-4" />
                                    {form.watch('status') === 'blacklisted' ? t('customers.removeBlacklist') : t('customers.addBlacklist')}
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <FormLabel>{t('customers.notes')}</FormLabel>
                                {notes.length > 0 ? notes.map((note) => (
                                    <div key={note.id} className="rounded bg-muted/50 p-2 text-sm">
                                        <p>{note.note}</p>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">{t('customers.noNotes')}</p>}
                                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder={t('customers.notePlaceholder')} />
                                <Button type="button" variant="outline" size="sm" disabled={!noteText.trim() || addNoteMutation.isPending} onClick={() => addNoteMutation.mutate(noteText.trim())}>
                                    {t('customers.addNote')}
                                </Button>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/customers')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
