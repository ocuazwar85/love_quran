'use client';
import * as React from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { Advertisement } from '@/types';
import { Skeleton } from '../ui/skeleton';

type AdSlotProps = {
  positionId: string;
  className?: string;
  fallbackContent?: React.ReactNode;
};

// This component is crucial for safely rendering ad code.
// It uses dangerouslySetInnerHTML, which should always be handled with extreme care.
// In this case, it's considered safe because the content is managed by a trusted admin
// via Firestore.
function SafeAdRenderer({ adCode }: { adCode: string }) {
  // Use a ref to the container div
  const adContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (adContainerRef.current) {
        // Clear previous content
        adContainerRef.current.innerHTML = '';
        
        // Create a new range and document fragment
        const range = document.createRange();
        const fragment = range.createContextualFragment(adCode);

        // Find script tags in the fragment
        const scripts = Array.from(fragment.querySelectorAll('script'));
        const adElement = document.createElement('div');
        adElement.appendChild(fragment);

        // Append the main ad element to the container
        adContainerRef.current.appendChild(adElement);

        // Re-create and append scripts to make them executable
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            // Copy attributes
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            // Copy content if it's inline
            if (oldScript.text) {
                newScript.text = oldScript.text;
            }
            // Append to body to execute
            document.body.appendChild(newScript);
        });
    }
  }, [adCode]);

  return <div ref={adContainerRef} />;
}


export default function AdSlot({ positionId, className, fallbackContent }: AdSlotProps) {
  const firestore = useFirestore();
  
  // Memoize the document reference
  const adRef = useMemoFirebase(() => {
    if (!firestore || !positionId) return null;
    return doc(firestore, 'advertisements', positionId);
  }, [firestore, positionId]);
  
  const { data: ad, isLoading } = useDoc<Advertisement>(adRef);

  if (isLoading) {
    return fallbackContent || <Skeleton className="h-24 w-full bg-muted/50" />;
  }

  if (ad && ad.isActive && ad.adCode) {
    return (
      <div className={className}>
        <SafeAdRenderer adCode={ad.adCode} />
      </div>
    );
  }

  // Render nothing if the ad is not active or doesn't exist
  return null;
}

    