'use client';
import type { Ayah, DisplayMode, Surah } from '@/types';
import React, { useRef, useEffect } from 'react';
import { Separator } from '../ui/separator';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

type AyahCardProps = {
  ayah: Ayah;
  surahId: number;
  surahName: string;
  displayMode: DisplayMode;
  selectedQori: keyof Surah['audioFull'];
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
};

export default function AyahCard({
  ayah,
  surahId,
  surahName,
  displayMode,
  selectedQori,
  isPlaying,
  onPlay,
  onStop,
}: AyahCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioSrc = ayah.audio[selectedQori];
  
  const showArabic =
    displayMode === 'all' ||
    displayMode === 'arabic-translation' ||
    displayMode === 'arabic';
  const showTransliteration =
    displayMode === 'all' || displayMode === 'transliteration-translation';
  const showTranslation =
    displayMode === 'all' ||
    displayMode === 'arabic-translation' ||
    displayMode === 'transliteration-translation';

  const togglePlayPause = () => {
    if (isPlaying) {
      onStop();
    } else {
      onPlay();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Ensure the correct source is set before playing
      if (audio.currentSrc !== audioSrc) {
        audio.src = audioSrc;
      }
      audio.play().catch(e => {
        console.error("Audio play failed", e);
        onStop(); // Stop if play fails
      });
    } else {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [isPlaying, onStop, audioSrc]);


  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
        onStop();
    };
    audio?.addEventListener('ended', handleEnded);
    return () => {
        audio?.removeEventListener('ended', handleEnded);
    }
  }, [onStop]);


  return (
    <div className="rounded-lg border bg-card/50 text-card-foreground shadow-sm transition-transform duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 [transform-style:preserve-3d] hover:[transform:rotateX(2deg)]">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-semibold text-primary-foreground/80 bg-primary/20 px-3 py-1 rounded-full">
              {surahId}:{ayah.nomorAyat}
            </span>
             {audioSrc && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={togglePlayPause}
                aria-label={isPlaying ? `Pause audio ayat ${ayah.nomorAyat}` : `Play audio ayat ${ayah.nomorAyat}`}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {showArabic && (
            <p
              className="text-xl md:text-2xl leading-relaxed text-right font-arabic"
              dir="rtl"
            >
              {ayah.teksArab}
            </p>
          )}
          {showTransliteration && (
            <p className="text-sm md:text-base italic text-muted-foreground leading-relaxed">
              {ayah.teksLatin}
            </p>
          )}
          {showTranslation && <Separator />}
          {showTranslation && (
            <p className="text-base md:text-lg leading-relaxed">{ayah.teksIndonesia}</p>
          )}
        </div>
      </div>
       {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          key={audioSrc} // Force re-render if src changes
          className="hidden"
          preload="none"
        />
      )}
    </div>
  );
}
