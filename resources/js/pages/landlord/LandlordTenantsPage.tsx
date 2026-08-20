import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Search, Filter, Building2 } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
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
    dashboard_url?: string;
    subdirectory_url?: string;
    subdomain_url?: string;
}

export function LandlordTenantsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['landlord-tenants'],
        queryFn: () => api.get<PaginatedResponse<LandlordTenantRow>>(endpoints.landlord.tenants, { per_page: 50 }),
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border/10 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="rounded-lg border-primary/20 bg-primary/5 text-primary font-black px-3 py-0.5 text-[10px] uppercase tracking-widest">
                            <Building2 className="h-3 w-3 me-1.5" />
                            {t('nav.tenants') || 'إدارة المستأجرين'}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">المستأجرون</h1>
                    <p className="text-muted-foreground font-bold flex items-center gap-2">
                        جميع مغاسل السيارات المسجلة على المنصة
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder={t('common.search') || 'بحث عن مستأجر...'}
                            className="h-11 w-64 rounded-xl border border-border/40 bg-white ps-10 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm" 
                        />
                    </div>
                    <Button variant="outline" className="h-11 px-5 rounded-xl border-border/60 font-bold hover:bg-muted/30 shadow-sm bg-white">
                        <Filter className="me-2 h-4 w-4" />
                        {t('common.filter') || 'تصفية'}
                    </Button>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border border-border/50 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
                <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">قائمة المستأجرين</CardTitle>
                        <CardDescription className="text-xs font-bold text-muted-foreground mt-1">إدارة بيانات المشتركين والوصول إلى لوحات تحكمهم</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-10 pt-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-border/40">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">الاسم</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Slug</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">الباقة</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-center">الحالة</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">الاشتراك</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-left">لوحة المستأجر</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(data?.data ?? []).map((tenant) => (
                                        <TableRow key={tenant.id} className="border-border/40 hover:bg-primary/[0.02] group/row transition-colors">
                                            <TableCell className="font-bold py-5">{tenant.name}</TableCell>
                                            <TableCell className="font-medium text-muted-foreground">{tenant.slug}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                                                    {tenant.plan?.name ?? '—'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={cn(
                                                    "rounded-lg px-3 py-1 font-black uppercase tracking-widest text-[9px]",
                                                    tenant.status === 'active' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {tenant.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-bold">{tenant.subscription_status ?? '—'}</span>
                                                    {tenant.subscription_ends_at && (
                                                        <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                                                            تنتهي في: {new Date(tenant.subscription_ends_at).toLocaleDateString('ar-OM')}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-left">
                                                {tenant.status === 'active' && tenant.dashboard_url ? (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        asChild
                                                        className="h-9 rounded-xl font-bold text-primary hover:bg-primary/10 hover:text-primary transition-all gap-2"
                                                    >
                                                        <a href={tenant.dashboard_url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4" />
                                                            فتح اللوحة
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground opacity-30">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
