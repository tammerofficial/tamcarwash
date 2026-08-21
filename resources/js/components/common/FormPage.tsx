import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/lib/i18n';

interface FormPageProps {
    title: string;
    description?: string;
    backTo: string;
    backLabel?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export function FormPage({ title, description, backTo, backLabel, actions, children }: FormPageProps) {
    return (
        <div className="space-y-6" dir="rtl">
            <div className="space-y-4">
                <Button variant="ghost" size="sm" className="px-0 text-muted-foreground hover:text-foreground" asChild>
                    <Link to={backTo}>
                        <ArrowRight className="h-4 w-4" />
                        {backLabel ?? t('common.back')}
                    </Link>
                </Button>
                <PageHeader title={title} description={description} actions={actions} />
            </div>
            <Card>
                <CardContent className="pt-6">{children}</CardContent>
            </Card>
        </div>
    );
}
