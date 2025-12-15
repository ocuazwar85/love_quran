'use client';
import { cn } from "@/lib/utils";
import Image from 'next/image';

export const Logo = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        className={cn("relative w-10 h-10", className)}
        {...props}
    >
        <Image
            src="https://w7.pngwing.com/pngs/43/379/png-transparent-al-quran-thumbnail.png"
            alt="Love Al-Quran Logo"
            fill
            sizes="40px"
            className="object-contain"
        />
    </div>
);
