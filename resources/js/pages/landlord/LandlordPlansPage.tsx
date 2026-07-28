import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApiResponse } from '@/types/api';

interface LandlordPlan {
    id: string;
    slug: string;
    name: string;
    description?: string;
    price_monthly: number;
    price_yearly: number;
    currency: string;
    max_branches?: number;
    max_users?: number;
    features?: string[];
}

export function LandlordPlansPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['landlord-plans'],
        queryFn: () => api.get<ApiResponse<LandlordPlan[]>>(endpoints.landlord.plans),
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">الباقات</h2>
                <p className="text-muted-foreground">باقات الاشتراك المتاحة على المنصة</p>
            </div>

            {isLoading ? (
                <Skeleton className="h-64 w-full" />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(data?.data ?? []).map((plan) => (
                        <Card key={plan.id}>
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                                <p className="text-2xl font-bold">
                                    {plan.price_monthly} {plan.currency}
                                    <span className="text-sm font-normal text-muted-foreground"> / شهر</span>
                                </p>
                                <p className="text-sm">Slug: {plan.slug}</p>
                                <p className="text-sm">فروع: {plan.max_branches ?? 'غير محدود'}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
