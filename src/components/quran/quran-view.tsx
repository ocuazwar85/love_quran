'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { Surah, DisplayMode, Tafsir } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import AyahCard from './ayah-card';
import { Separator } from '../ui/separator';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import AdSlot from '@/components/ads/ad-slot';


type QuranViewProps = {
  surah: Surah;
};

const displayOptions: { value: DisplayMode; label: string }[] = [
  { value: 'all', label: 'Arab, Indo, Arti' },
  { value: 'arabic-translation', label: 'Arab, Arti' },
  { value: 'transliteration-translation', label: 'Indo, Arti' },
  { value: 'arabic', label: 'Arab' },
];

const qoriOptions: { value: keyof Surah['audioFull']; label: string }[] = [
    { value: '01', label: 'Abdullah Al-Juhany' },
    { value: '02', label: 'Abdul Muhsin Al-Qasim' },
    { value: '03', label: 'Abdurrahman as-Sudais' },
    { value: '04', label: 'Ibrahim Al-Akhdar' },
    { value: '05', label: 'Mishary Rashid Al-Afasy' },
];

export default function QuranView({ surah }: QuranViewProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('all');
  const [selectedQori, setSelectedQori] = useState<keyof Surah['audioFull']>('05');
  const [isSurahPlaying, setIsSurahPlaying] = useState(false);
  const [currentlyPlayingAyah, setCurrentlyPlayingAyah] = useState<number | null>(null);

  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [tafsirData, setTafsirData] = useState<Tafsir[]>([]);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const bismillah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

  const showBismillah = surah.nomor !== 1 && surah.nomor !== 9;

  const toggleSurahPlayPause = () => {
    if (audioRef.current) {
        if (currentlyPlayingAyah) {
            setCurrentlyPlayingAyah(null); // Stop any playing ayah
        }
      if (isSurahPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsSurahPlaying(!isSurahPlaying);
    }
  };

  const handleAyahPlay = (ayahNumber: number) => {
    if (isSurahPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsSurahPlaying(false);
    }
    setCurrentlyPlayingAyah(ayahNumber);
  };
  
  const handleAyahStop = () => {
    setCurrentlyPlayingAyah(null);
  };

  useEffect(() => {
    const fetchTafsir = async () => {
      if (tafsirOpen && surah.nomor) {
        setLoadingTafsir(true);
        try {
          const response = await fetch(`https://equran.id/api/v2/tafsir/${surah.nomor}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setTafsirData(data.data.tafsir);
        } catch (error) {
          console.error("Gagal mengambil data tafsir:", error);
        } finally {
          setLoadingTafsir(false);
        }
      }
    };
  
    fetchTafsir();
  }, [tafsirOpen, surah.nomor]);


  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsSurahPlaying(false);

    if (audio) {
      audio.addEventListener('ended', handleEnded);
      audio.pause();
      audio.currentTime = 0;
      setIsSurahPlaying(false);
    }

    // Stop ayah audio when surah changes
    setCurrentlyPlayingAyah(null);
    
    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleEnded);
      }
    };
  }, [surah.nomor, selectedQori]); // Also reset on qori change

  return (
    <Card className="shadow-lg border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-3xl mb-1">
              {surah.namaLatin}
            </CardTitle>
            <CardDescription className="text-lg">
              {surah.arti} &bull; {surah.tempatTurun} &bull; {surah.jumlahAyat}{' '}
              Ayat
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
             <div className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                <Select
                    value={displayMode}
                    onValueChange={(value) => setDisplayMode(value as DisplayMode)}
                    >
                    <SelectTrigger className="w-full min-w-[180px]">
                        <SelectValue placeholder="Pilih Tampilan" />
                    </SelectTrigger>
                    <SelectContent>
                        {displayOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
             <div className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                <Select
                    value={selectedQori}
                    onValueChange={(value) => setSelectedQori(value as keyof Surah['audioFull'])}
                    >
                    <SelectTrigger className="w-full min-w-[180px]">
                        <SelectValue placeholder="Pilih Qori" />
                    </SelectTrigger>
                    <SelectContent>
                        {qoriOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
             <Dialog open={tafsirOpen} onOpenChange={setTafsirOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        Lihat Tafsir
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-4 md:p-6">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className='font-headline text-2xl'>Tafsir Surah {surah.namaLatin}</DialogTitle>
                        <DialogDescription>
                            Sumber: Kemenag RI, via API equran.id
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-6">
                        {loadingTafsir ? (
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : tafsirData.length > 0 ? (
                            tafsirData.map((item) => (
                                <div key={item.ayat} className="border rounded-lg p-4 bg-background/50">
                                    <h4 className='font-bold text-lg mb-2'>Ayat {item.ayat}</h4>
                                    <p className='text-justify leading-relaxed'>{item.teks}</p>
                                </div>
                            ))
                        ) : (
                            <p>Tafsir tidak ditemukan.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSurahPlayPause}
              aria-label={isSurahPlaying ? 'Pause audio surah' : 'Play audio surah'}
              disabled={!surah.audioFull[selectedQori]}
            >
              {isSurahPlaying ? <Pause /> : <Play />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4">
        {showBismillah && (
          <div className="text-center p-6 bg-primary/10 rounded-lg">
            <p className="text-4xl font-arabic" dir="rtl">
              {bismillah}
            </p>
          </div>
        )}
        <Separator />
        <div className="space-y-6">
          {surah.ayat.map((ayah, index) => (
            <React.Fragment key={ayah.nomorAyat}>
              <AyahCard
                ayah={ayah}
                surahId={surah.nomor}
                surahName={surah.namaLatin}
                displayMode={displayMode}
                selectedQori={selectedQori}
                isPlaying={currentlyPlayingAyah === ayah.nomorAyat}
                onPlay={() => handleAyahPlay(ayah.nomorAyat)}
                onStop={handleAyahStop}
              />
              {(index + 1) % 5 === 0 && <AdSlot positionId="in-feed-quran" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
      {surah.audioFull[selectedQori] && (
        <audio
          ref={audioRef}
          key={selectedQori} // Add key to force re-render on qori change
          src={surah.audioFull[selectedQori]}
          onPlay={() => setIsSurahPlaying(true)}
          onPause={() => setIsSurahPlaying(false)}
          className="hidden"
        />
      )}
    </Card>
  );
}

    