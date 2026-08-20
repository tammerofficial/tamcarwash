import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, PaginatedResponse, Service, ServiceCategory } from '@/types/api';

const categorySchema = z.object({
    name: z.string().min(2, t('services.nameRequired')),
    name_ar: z.string().optional(),
    is_active: z.boolean(),
});

const serviceSchema = z.object({
    category_id: z.coerce.number().min(1, t('services.categoryRequired')),
    name: z.string().min(2, t('services.nameRequired')),
    duration_minutes: z.coerce.number().min(1).max(480),
    base_price: z.coerce.number().min(0),
    vat_included: z.boolean(),
    is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type ServiceFormValues = z.infer<typeof serviceSchema>;

export function ServicesPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('services');
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deletingService, setDeletingService] = useState<Service | null>(null);

    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['service-categories'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<ServiceCategory>>(endpoints.serviceCategories, {
                per_page: 50,
            });
            return response.data;
        },
        retry: false,
    });

    const { data: services, isLoading: servicesLoading } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    const categoryForm = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: '', name_ar: '', is_active: true },
    });

    const serviceForm = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            category_id: 0,
            name: '',
            duration_minutes: 30,
            base_price: 0,
            vat_included: false,
            is_active: true,
        },
    });

    const createCategoryMutation = useMutation({
        mutationFn: (values: CategoryFormValues) =>
            api.post<ApiResponse<ServiceCategory>>(endpoints.serviceCategories, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
            toast.success(t('services.categoryCreated'));
            setCategoryDialogOpen(false);
            categoryForm.reset({ name: '', name_ar: '', is_active: true });
        },
        onError: () => toast.error('تعذّر إنشاء الفئة'),
    });

    const saveServiceMutation = useMutation({
        mutationFn: (values: ServiceFormValues) => {
            if (editingService) {
                return api.put<ApiResponse<Service>>(endpoints.service(editingService.id), values);
            }
            return api.post<ApiResponse<Service>>(endpoints.services, values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success(editingService ? t('services.updated') : t('services.created'));
            closeServiceDialog();
        },
        onError: () => toast.error('تعذّر حفظ الخدمة'),
    });

    const deleteServiceMutation = useMutation({
        mutationFn: (id: number) => api.delete<ApiResponse<null>>(endpoints.service(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success(t('services.deleted'));
            setDeleteDialogOpen(false);
            setDeletingService(null);
        },
        onError: () => toast.error('تعذّر حذف الخدمة'),
    });

    const openCreateService = () => {
        setEditingService(null);
        serviceForm.reset({
            category_id: categories?.[0]?.id ?? 0,
            name: '',
            duration_minutes: 30,
            base_price: 0,
            vat_included: false,
            is_active: true,
        });
        setServiceDialogOpen(true);
    };

    const openEditService = async (service: Service) => {
        try {
            const response = await api.get<ApiResponse<Service>>(endpoints.service(service.id));
            const full = response.data;
            setEditingService(full);
            serviceForm.reset({
                category_id: full.category_id,
                name: full.name,
                duration_minutes: full.duration_minutes,
                base_price: full.base_price,
                vat_included: full.vat_included,
                is_active: full.is_active,
            });
            setServiceDialogOpen(true);
        } catch {
            toast.error('تعذّر تحميل بيانات الخدمة');
        }
    };

    const closeServiceDialog = () => {
        setServiceDialogOpen(false);
        setEditingService(null);
        serviceForm.reset();
    };

    const categoryColumns: ColumnDef<ServiceCategory>[] = useMemo(
        () => [
            { accessorKey: 'name', header: t('services.categoryName') },
            {
                accessorKey: 'is_active',
                header: t('common.status'),
                cell: ({ row }) => (
                    <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
                        {row.original.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                ),
            },
        ],
        [],
    );

    const serviceColumns: ColumnDef<Service>[] = useMemo(
        () => [
            { accessorKey: 'name', header: t('services.name') },
            {
                accessorKey: 'category',
                header: t('services.category'),
                cell: ({ row }) => row.original.category?.name ?? '—',
            },
            { accessorKey: 'duration_minutes', header: t('services.duration') },
            {
                accessorKey: 'base_price',
                header: t('services.price'),
                cell: ({ row }) => formatCurrency(row.original.base_price),
            },
            {
                accessorKey: 'vat_included',
                header: t('services.vat'),
                cell: ({ row }) =>
                    row.original.vat_included ? t('services.vatIncludedLabel') : t('services.vatExcluded'),
            },
            {
                accessorKey: 'is_active',
                header: t('common.status'),
                cell: ({ row }) => (
                    <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
                        {row.original.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                ),
            },
            {
                id: 'actions',
                header: t('common.actions'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditService(row.original)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setDeletingService(row.original);
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ),
            },
        ],
        [categories],
    );

    return (
        <div className="space-y-6">
            <PageHeader title={t('services.title')} description={t('services.subtitle')} />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <TabsList>
                        <TabsTrigger value="services">{t('services.tabServices')}</TabsTrigger>
                        <TabsTrigger value="categories">{t('services.tabCategories')}</TabsTrigger>
                    </TabsList>
                    <Button
                        onClick={() => {
                            if (activeTab === 'categories') {
                                setCategoryDialogOpen(true);
                            } else {
                                openCreateService();
                            }
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {activeTab === 'categories' ? t('services.addCategory') : t('services.addService')}
                    </Button>
                </div>

                <TabsContent value="services" className="mt-4">
                    <DataTable
                        columns={serviceColumns}
                        data={services ?? []}
                        searchKey="name"
                        loading={servicesLoading}
                    />
                </TabsContent>

                <TabsContent value="categories" className="mt-4">
                    <DataTable
                        columns={categoryColumns}
                        data={categories ?? []}
                        searchKey="name"
                        loading={categoriesLoading}
                    />
                </TabsContent>
            </Tabs>

            {/* Category Dialog */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{t('services.addCategory')}</DialogTitle>
                        <DialogDescription>{t('services.subtitle')}</DialogDescription>
                    </DialogHeader>
                    <Form {...categoryForm}>
                        <form
                            onSubmit={categoryForm.handleSubmit((values) => createCategoryMutation.mutate(values))}
                            className="space-y-4"
                        >
                            <FormField
                                control={categoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.categoryName')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={categoryForm.control}
                                name="name_ar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.nameAr')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={categoryForm.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="!mt-0">{t('common.active')}</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={createCategoryMutation.isPending}>
                                    {createCategoryMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('common.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Service Dialog */}
            <Dialog open={serviceDialogOpen} onOpenChange={(open) => !open && closeServiceDialog()}>
                <DialogContent className="sm:max-w-lg" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingService ? t('services.editService') : t('services.addService')}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...serviceForm}>
                        <form
                            onSubmit={serviceForm.handleSubmit((values) => saveServiceMutation.mutate(values))}
                            className="space-y-4"
                        >
                            <FormField
                                control={serviceForm.control}
                                name="category_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.category')}</FormLabel>
                                        <Select
                                            value={field.value ? String(field.value) : undefined}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('services.selectCategory')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(categories ?? []).map((cat) => (
                                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={serviceForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.name')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={serviceForm.control}
                                    name="duration_minutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('services.duration')}</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} {...field} dir="ltr" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={serviceForm.control}
                                    name="base_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('services.price')}</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.001" min={0} {...field} dir="ltr" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={serviceForm.control}
                                name="vat_included"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="!mt-0">{t('services.vatIncluded')}</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={serviceForm.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="!mt-0">{t('common.active')}</FormLabel>
                                    </FormItem>
                                )}
                            />

                            {editingService && (
                                <div className="rounded-md border p-4">
                                    <p className="mb-2 text-sm font-medium">{t('services.addons')}</p>
                                    {editingService.addons && editingService.addons.length > 0 ? (
                                        <ul className="space-y-2 text-sm">
                                            {editingService.addons.map((addon) => (
                                                <li
                                                    key={addon.id}
                                                    className="flex items-center justify-between rounded bg-muted/50 px-3 py-2"
                                                >
                                                    <span>{addon.name}</span>
                                                    <span className="text-muted-foreground">
                                                        {formatCurrency(addon.price)}
                                                        {!addon.is_active && ` · ${t('common.inactive')}`}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">{t('services.addonsEmpty')}</p>
                                    )}
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeServiceDialog}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={saveServiceMutation.isPending}>
                                    {saveServiceMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('common.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{t('common.delete')}</DialogTitle>
                        <DialogDescription>{t('services.deleteConfirm')}</DialogDescription>
                    </DialogHeader>
                    <p className="font-medium">{deletingService?.name}</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleteServiceMutation.isPending}
                            onClick={() => deletingService && deleteServiceMutation.mutate(deletingService.id)}
                        >
                            {deleteServiceMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
