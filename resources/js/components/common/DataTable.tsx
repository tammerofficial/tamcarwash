import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import { EmptyState } from '@/components/common/EmptyState';
import { Inbox } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    loading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder,
    loading,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-3" dir="rtl">
            <div className="admin-table-card rounded-xl">
                {searchKey && (
                    <div className="admin-table-toolbar px-4 py-3">
                        <Input
                            placeholder={searchPlaceholder ?? t('common.search')}
                            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                            onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                            className="h-10 max-w-sm rounded-lg border-inst-border bg-white font-semibold"
                        />
                    </div>
                )}

                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-inst-border hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-11 text-[11px] font-bold tracking-wide text-inst-muted">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index} className="border-inst-border">
                                    {columns.map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="border-inst-border hover:bg-inst-silver/70">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 font-medium text-inst-text">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={columns.length} className="h-auto p-0">
                                    <EmptyState
                                        icon={Inbox}
                                        title={t('common.noData')}
                                        description={t('common.noDataHint')}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-1">
                <p className="text-sm font-semibold text-inst-muted">
                    {formatNumber(table.getFilteredRowModel().rows.length)} {t('common.records')}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-inst-border bg-white font-bold text-inst-text hover:bg-inst-silver"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {t('common.previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-inst-border bg-white font-bold text-inst-text hover:bg-inst-silver"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {t('common.next')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('ar-OM').format(value);
}
