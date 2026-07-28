import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PaginatedResponse } from '@/types/api';

interface LandlordSubscriptionRow {
    id: string;
    status: string;
    amount: number;
    currency: string;
    starts_at?: string;
    ends_at?: string;
    tenant?: { name: string; slug: string; status: string } | null;
    plan?: { slug: string; name: string } | null;
}

export function LandlordSubscriptionsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['landlord-subscriptions'],
        queryFn: () =>
            api.get<PaginatedResponse<LandlordSubscriptionRow>>(endpoints.landlord.subscriptions, {
                per_page: 50,
            }),
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">الاشتراكات</h2>
                <p className="text-muted-foreground">متابعة حالة الاشتراكات والتجارب</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>جميع الاشتراكات</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>المستأجر</TableHead>
                                    <TableHead>الباقة</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>المبلغ</TableHead>
                                    <TableHead>ينتهي في</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data?.data ?? []).map((subscription) => (
                                    <TableRow key={subscription.id}>
                                        <TableCell>{subscription.tenant?.name ?? '—'}</TableCell>
                                        <TableCell>{subscription.plan?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge>{subscription.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {subscription.amount} {subscription.currency}
                                        </TableCell>
                                        <TableCell>
                                            {subscription.ends_at
                                                ? new Date(subscription.ends_at).toLocaleDateString('ar-OM')
                                                : '—'}
                                        </TableCell>
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
