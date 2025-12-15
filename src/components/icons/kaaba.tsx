'use client';
import { cn } from "@/lib/utils";
import React from 'react';

export const KaabaIcon = ({ className, ...props }: React.ComponentProps<"svg">) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("w-6 h-6", className)}
        {...props}
    >
        <path d="M4 4h16v16H4z" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M22 12h-2" />
        <path d="M4 12H2" />
        <path d="M18.5 5.5l-1.4 1.4" />
        <path d="M6.9 17.1l-1.4 1.4" />
        <path d_v-ignore="M18.5 18.5l-1.4-1.4" />
        <path d_v-ignore="M6.9 6.9l-1.4-1.4" />
        <path d="M16 4.01V4" />
        <path d="M8 4.01V4" />
        <path d="M20 8h.01" />
        <path d="M20 16h.01" />
        <path d="M4 8h.01" />
        <path d="M4 16h.01" />
    </svg>
);
