import {ReactNode} from "react";

const variantClasses = {
    green:  'bg-green-subtle text-green border-green-ring',
    blue:   'bg-blue-subtle text-blue border-blue-ring',
    orange: 'bg-orange-subtle text-orange border-orange-ring',
    red:    'bg-red-subtle text-red border-red-ring',
    muted:  'bg-surface-3 text-dim border-line',
    purple: 'bg-purple-subtle text-purple border-purple-ring',
} as const;

interface Props {
    variant: keyof typeof variantClasses;
    children: ReactNode;
    className?: string;
}

export function Badge({variant, children, className = ''}: Props) {
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.3px] border ${variantClasses[variant]} ${className}`}
        >
      {children}
    </span>
    );
}
