import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PaginatedResponse } from '@/types/api';

interface LandlordTenantRow {
    id: string;
    name: string;
    slug: string;
    email?: string;
    status: string;
    plan?: { slug: string; name: string } | null;
    subscription_status?: string;
    subscription_ends_at?: string;
    created_at?: string;
    subdirectory_url?: string;
}

export function LandlordTenantsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['landlord-tenants'],
        queryFn: () => api.get<PaginatedResponse<LandlordTenantRow>>(endpoints.landlord.tenants, { per_page: 50 }),
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">المستأجرون</h2>
                <p className="text-muted-foreground">جميع مغاسل السيارات المسجلة على المنصة</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>قائمة المستأجرين</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>الباقة</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>الاشتراك</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data?.data ?? []).map((tenant) => (
                                    <TableRow key={tenant.id}>
                                        <TableCell>{tenant.name}</TableCell>
                                        <TableCell>{tenant.slug}</TableCell>
                                        <TableCell>{tenant.plan?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                                                {tenant.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{tenant.subscription_status ?? '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
