'use client';
import * as React from 'react';
import AdSlot from './ad-slot';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';

type ExitIntentAdProps = {
  positionId: string;
};

export default function ExitIntentAd({ positionId }: ExitIntentAdProps) {
  const [showAd, setShowAd] = React.useState(false);
  const [countdown, setCountdown] = React.useState(5);
  
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseLeave = React.useCallback((event: MouseEvent) => {
    // Show ad if cursor leaves the top of the viewport
    if (event.clientY <= 0) {
      setShowAd(true);
      // Remove listener after first trigger to prevent multiple popups
      document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [handleMouseLeave]);

  React.useEffect(() => {
    if (showAd) {
      setCountdown(5); // Reset countdown
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [showAd]);

  if (!showAd) {
    return null;
  }

  return (
    <Dialog open={showAd} onOpenChange={setShowAd}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Tunggu Sebentar!</DialogTitle>
          <DialogDescription>
            Sebelum Anda pergi, lihat penawaran menarik di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
            <AdSlot positionId={positionId} />
        </div>
        <DialogFooter className="flex justify-end">
          <Button
            variant="destructive"
            onClick={() => setShowAd(false)}
            disabled={countdown > 0}
          >
            <X className="mr-2 h-4 w-4" />
            Tutup {countdown > 0 ? `(${countdown})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    