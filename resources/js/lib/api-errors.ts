import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiClientError } from '@/lib/api';
import { toast } from 'sonner';

export function showApiError(error: unknown, fallback = 'حدث خطأ غير متوقع'): void {
    if (error instanceof ApiClientError) {
        const fieldError = error.errors ? Object.values(error.errors).flat()[0] : undefined;
        toast.error(fieldError ?? error.message ?? fallback);
        return;
    }

    toast.error(fallback);
}

export function applyFieldErrors<T extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<T>,
): void {
    if (error instanceof ApiClientError && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
            if (messages[0]) {
                setError(field as Path<T>, { message: messages[0] });
            }
        });
    }
}
