'use client';
import * as React from 'react';
import AdSlot from './ad-slot';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { VisuallyHidden } from '../ui/visually-hidden';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

type InterstitialAdProps = {
  positionId: string;
  onAdClosed: () => void;
};

export default function InterstitialAd({ positionId, onAdClosed }: InterstitialAdProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [countdown, setCountdown] = React.useState(5);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    // Start countdown when the ad is shown
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onAdClosed();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent 
        className="w-[90vw] max-w-sm"
        onInteractOutside={(e) => {
            if (countdown > 0) {
                e.preventDefault();
            }
        }}
        hideCloseButton={countdown > 0}
      >
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Iklan</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <div className="my-4">
            <AdSlot 
                positionId={positionId} 
                fallbackContent={
                    <div className='text-center space-y-4'>
                        <p className="text-muted-foreground">Memuat Iklan...</p>
                        <Skeleton className='w-48 h-4 mx-auto' />
                    </div>
                }
            />
        </div>
        <DialogFooter className="flex justify-end">
                <Button
                    variant="destructive"
                    onClick={handleClose}
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
