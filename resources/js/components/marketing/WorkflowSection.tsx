import { Building2, CalendarDays, Receipt, UserPlus } from 'lucide-react';
import { SectionFrame } from '@/components/marketing/SectionFrame';
import { t } from '@/lib/i18n';

const steps = [
    { key: 'step1', icon: UserPlus },
    { key: 'step2', icon: Building2 },
    { key: 'step3', icon: CalendarDays },
    { key: 'step4', icon: Receipt },
] as const;

export function WorkflowSection() {
    return (
        <SectionFrame tone="white">
            <div className="max-w-3xl">
                <h2 className="text-3xl font-black text-inst-text sm:text-4xl">
                    {t('marketing.workflow.title')}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-inst-muted sm:text-lg">
                    {t('marketing.workflow.subtitle')}
                </p>
            </div>

            <ol className="relative mt-8 grid gap-4 md:grid-cols-4">
                <div className="pointer-events-none absolute top-8 right-10 left-10 hidden h-px bg-inst-border md:block" />
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <li key={step.key} className="relative rounded-xl border border-inst-border bg-inst-bg p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-8 items-center justify-center rounded-md bg-inst-teal text-sm font-black text-white">
                                    {index + 1}
                                </span>
                                <span className="inst-icon-box size-10 rounded-md">
                                    <Icon className="size-5" />
                                </span>
                            </div>
                            <h3 className="mt-4 text-lg font-black text-inst-text">
                                {t(`marketing.workflow.${step.key}.title`)}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-inst-muted">
                                {t(`marketing.workflow.${step.key}.description`)}
                            </p>
                        </li>
                    );
                })}
            </ol>
        </SectionFrame>
    );
}
