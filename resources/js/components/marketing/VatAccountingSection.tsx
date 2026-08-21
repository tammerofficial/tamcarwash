import { CheckCircle2, FileText } from 'lucide-react';
import { SectionFrame } from '@/components/marketing/SectionFrame';
import { t } from '@/lib/i18n';

const checks = ['vat', 'pdf', 'reports', 'pnl', 'cashier', 'ledger'] as const;

export function VatAccountingSection() {
    return (
        <SectionFrame id="vat" tone="white">
            <div className="grid items-center gap-8 lg:grid-cols-2">
                <div>
                    <h2 className="text-3xl font-black text-inst-text sm:text-4xl">
                        {t('marketing.vat.title')}
                    </h2>
                    <p className="mt-3 text-base leading-relaxed text-inst-muted sm:text-lg">
                        {t('marketing.vat.subtitle')}
                    </p>
                    <ul className="mt-6 space-y-3">
                        {checks.map((key) => (
                            <li key={key} className="flex items-start gap-3">
                                <span className="inst-icon-box mt-0.5 size-7 shrink-0 rounded-md">
                                    <CheckCircle2 className="size-4" />
                                </span>
                                <span className="text-base font-semibold text-inst-text">
                                    {t(`marketing.vat.${key}`)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-2xl border border-inst-border bg-inst-bg p-4">
                    <div className="overflow-hidden rounded-xl border border-inst-border bg-white shadow-[0_12px_28px_rgba(6,63,73,0.08)]">
                        <div className="flex items-center justify-between border-b border-inst-border bg-inst-teal px-4 py-3 text-white">
                            <div className="flex items-center gap-2">
                                <FileText className="size-4" />
                                <span className="text-sm font-bold">{t('marketing.vat.previewTitle')}</span>
                            </div>
                            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold">PDF</span>
                        </div>
                        <div className="space-y-4 p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-inst-muted">{t('marketing.vat.invoiceNo')}</p>
                                    <p className="mt-1 text-base font-black text-inst-text">INV-2026-0841</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-inst-muted">{t('marketing.vat.date')}</p>
                                    <p className="mt-1 text-sm font-bold text-inst-text">21 أغسطس 2026</p>
                                </div>
                            </div>
                            <div className="rounded-lg bg-inst-bg p-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold text-inst-muted">{t('marketing.vat.service')}</span>
                                    <span className="font-bold text-inst-text">غسيل شامل — صالون</span>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="font-semibold text-inst-muted">{t('marketing.vat.subtotal')}</span>
                                    <span className="font-bold text-inst-text">8.000 ر.ع</span>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="font-semibold text-inst-muted">{t('marketing.vat.vatLine')}</span>
                                    <span className="font-bold text-inst-text">0.400 ر.ع</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-inst-border pt-3">
                                <span className="text-sm font-bold text-inst-text">{t('marketing.vat.total')}</span>
                                <span className="text-xl font-black text-inst-teal">8.400 ر.ع</span>
                            </div>
                            <div className="rounded-lg border border-inst-border bg-inst-silver px-3 py-2 text-xs font-bold text-inst-teal">
                                {t('marketing.vat.compliant')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SectionFrame>
    );
}
