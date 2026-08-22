import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Mobile-optimized wrapper for tables that stacks on mobile
 * Ensures minimum touch targets and readable font sizes on all breakpoints
 */
export function ResponsiveTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('w-full overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-7', className)}>
      <div className="inline-block min-w-full px-3 sm:px-4 lg:px-7">
        <table className="w-full text-sm sm:text-base">
          {children}
        </table>
      </div>
    </div>
  );
}

/**
 * Mobile-friendly form grid that adapts columns based on screen size
 */
export function ResponsiveFormGrid({
  children,
  cols = 1,
  className,
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols];

  return (
    <div className={cn(`grid ${gridClass} gap-4 sm:gap-5 lg:gap-6`, className)}>
      {children}
    </div>
  );
}

/**
 * Minimum touch-friendly button sizing (48x48px)
 */
export function TouchButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'min-h-12 min-w-12 px-4 py-3 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Mobile-safe modal/dialog padding
 */
export function MobileSafeDialog({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-4 sm:p-6 max-h-[90vh] overflow-y-auto', className)}>
      {children}
    </div>
  );
}

/**
 * Responsive card that adjusts padding on mobile
 */
export function ResponsiveCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-3 sm:p-4 lg:p-6',
        'shadow-sm hover:shadow-md transition-shadow',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stack that becomes horizontal on tablets/desktops
 */
export function ResponsiveStack({
  children,
  className,
  spacing = 4,
}: {
  children: React.ReactNode;
  className?: string;
  spacing?: 2 | 3 | 4 | 5 | 6;
}) {
  const spacingClass = {
    2: 'gap-2 md:gap-3',
    3: 'gap-3 md:gap-4',
    4: 'gap-4 md:gap-5',
    5: 'gap-5 md:gap-6',
    6: 'gap-6 md:gap-8',
  }[spacing];

  return (
    <div className={cn(`flex flex-col md:flex-row ${spacingClass}`, className)}>
      {children}
    </div>
  );
}

/**
 * Mobile-friendly input with proper sizing
 */
export function MobileInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full min-h-11 px-3 py-2 rounded-lg border border-input bg-background text-base',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'placeholder:text-muted-foreground transition-colors',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Touch-friendly select dropdown
 */
export function MobileSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full min-h-11 px-3 py-2 rounded-lg border border-input bg-background text-base',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'appearance-none cursor-pointer transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/**
 * Collapsible section for mobile - expands on click
 */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-12 px-4 py-3 bg-card hover:bg-muted transition-colors font-semibold text-start flex items-center justify-between"
      >
        {title}
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-border bg-card/50">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Horizontally scrollable container for mobile (e.g., filters, tags)
 */
export function MobileHorizontalScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-7', className)}>
      <div className="flex gap-3 px-3 sm:px-4 lg:px-7 pb-2">
        {children}
      </div>
    </div>
  );
}
