import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { api, endpoints } from '@/lib/api';
import { FormPage } from '@/components/common/FormPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, Branch, WorkingHour } from '@/types/api';

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function formatTime(value?: string | null): string {
    if (!value) return '—';
    return value.slice(0, 5);
}

export function BranchDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: branch, isLoading } = useAuthenticatedQuery({
        queryKey: ['branches', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Branch>>(`${endpoints.branches}/${id}`);
            return response.data;
        },
        enabled: Boolean(id),
        retry: false,
    });

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!branch) return <p className="text-muted-foreground">{t('common.noData')}</p>;

    const hours = branch.working_hours ?? [];

    return (
        <FormPage
            title={branch.name}
            description={t('branches.subtitle')}
            backTo="/branches"
            actions={
                <Button onClick={() => navigate(`/branches/${branch.id}/edit`)}>
                    <Pencil className="h-4 w-4" />
                    {t('common.edit')}
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <p><span className="text-muted-foreground">{t('branches.code')}:</span> {branch.code ?? '—'}</p>
                    <p><span className="text-muted-foreground">{t('branches.city')}:</span> {branch.city ?? '—'}</p>
                    <p><span className="text-muted-foreground">{t('branches.phone')}:</span> {branch.phone ?? '—'}</p>
                    <p><span className="text-muted-foreground">{t('branches.email')}:</span> {branch.email ?? '—'}</p>
                    <p className="sm:col-span-2"><span className="text-muted-foreground">{t('branches.address')}:</span> {branch.address ?? '—'}</p>
                    <p><span className="text-muted-foreground">{t('branches.capacity')}:</span> {branch.capacity_per_hour ?? branch.capacity ?? '—'}</p>
                    <p><span className="text-muted-foreground">{t('branches.bays')}:</span> {branch.wash_bays?.length ?? 0}</p>
                    <p>
                        <span className="text-muted-foreground">{t('common.status')}:</span>{' '}
                        <Badge variant={branch.is_active ? 'success' : 'secondary'}>
                            {branch.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                    </p>
                </div>

                <div className="space-y-2">
                    <h2 className="font-bold">{t('branches.workingHours')}</h2>
                    {hours.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                    ) : (
                        hours.map((hour: WorkingHour) => (
                            <div key={hour.id ?? hour.day_of_week} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                <span className="font-medium">{DAY_NAMES[hour.day_of_week]}</span>
                                <span className="text-muted-foreground">
                                    {hour.is_closed ? t('branches.closed') : `${formatTime(hour.opens_at)} — ${formatTime(hour.closes_at)}`}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </FormPage>
    );
}
