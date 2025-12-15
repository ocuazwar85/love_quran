'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { Hadith, Doa, SurahSummary, Surah, Ayah } from '@/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import staticDoas from '@/lib/doa.json';
import { BookOpen, Heart, BookCopy } from 'lucide-react';
import AdSlot from '@/components/ads/ad-slot';


async function safeFetch(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new TypeError(`Expected JSON, but got ${contentType}. Response: ${text.substring(0, 100)}...`);
    }
    return response.json();
}

export default function HomePage() {
    const firestore = useFirestore();
    
    // Fetch all data
    const hadithsCollection = useMemoFirebase(() => query(collection(firestore, 'hadiths'), orderBy('namaHadist')), [firestore]);
    const { data: hadiths, isLoading: isLoadingHadiths } = useCollection<Hadith>(hadithsCollection);

    const doasCollection = useMemoFirebase(() => query(collection(firestore, 'doas'), orderBy('doa')), [firestore]);
    const { data: firestoreDoas, isLoading: isLoadingDoas } = useCollection<Doa>(doasCollection);

    const [allDoas, setAllDoas] = React.useState<Doa[]>([]);
    const [allHadiths, setAllHadiths] = React.useState<Hadith[]>([]);
    
    const [randomDoa, setRandomDoa] = React.useState<Doa | null>(null);
    const [randomHadith, setRandomHadith] = React.useState<Hadith | null>(null);
    const [randomAyah, setRandomAyah] = React.useState<Ayah | null>(null);
    const [randomAyahSurahInfo, setRandomAyahSurahInfo] = React.useState<{ name: string; number: number } | null>(null);
    
    const [isLoading, setIsLoading] = React.useState(true);

    // Combine static and firestore doas
    React.useEffect(() => {
        const dynamicDoas = firestoreDoas || [];
        setAllDoas([...staticDoas, ...dynamicDoas]);
    }, [firestoreDoas]);

    // Set all hadiths
    React.useEffect(() => {
        if(hadiths) {
            setAllHadiths(hadiths);
        }
    }, [hadiths]);
    
    // Pick random items and fetch random ayah
    React.useEffect(() => {
        const fetchAndSetRandomItems = async () => {
            setIsLoading(true);

            // Pick random doa
            if (allDoas.length > 0) {
                const randomIndex = Math.floor(Math.random() * allDoas.length);
                setRandomDoa(allDoas[randomIndex]);
            }

            // Pick random hadith
            if (allHadiths.length > 0) {
                const randomIndex = Math.floor(Math.random() * allHadiths.length);
                setRandomHadith(allHadiths[randomIndex]);
            }
            
            // Fetch random ayah
            try {
                const surahListResponse: { data: SurahSummary[] } = await safeFetch('https://equran.id/api/v2/surat');
                const surahs = surahListResponse.data;
                if (surahs.length > 0) {
                    const randomSurahSummary = surahs[Math.floor(Math.random() * surahs.length)];
                    const surahResponse: { data: Surah } = await safeFetch(`https://equran.id/api/v2/surat/${randomSurahSummary.nomor}`);
                    const surahData = surahResponse.data;
                    if (surahData.ayat.length > 0) {
                        const randomAyahData = surahData.ayat[Math.floor(Math.random() * surahData.ayat.length)];
                        setRandomAyah(randomAyahData);
                        setRandomAyahSurahInfo({ name: surahData.namaLatin, number: surahData.nomor });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch random ayah:", error);
            }

            setIsLoading(false);
        };

        // Only run when all data sources have been processed
        if(!isLoadingHadiths && !isLoadingDoas) {
             fetchAndSetRandomItems();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allDoas, allHadiths, isLoadingDoas, isLoadingHadiths]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">Assalamu'alaikum!</h1>
                    <p className="text-muted-foreground mt-1">
                        Inspirasi harian untuk menemani langkahmu.
                    </p>
                </div>
                 <AdSlot positionId="home-top-banner" className="mb-6" />
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        );
    }
    

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Assalamu'alaikum!</h1>
                <p className="text-muted-foreground mt-1">
                    Inspirasi harian untuk menemani langkahmu.
                </p>
            </div>
            <AdSlot positionId="home-top-banner" className="mb-6" />
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
                {/* Ayat Hari Ini */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-primary">
                            <BookOpen className="h-5 w-5" />
                            <h2 className="font-semibold">Ayat Hari Ini</h2>
                        </div>
                        {randomAyah && randomAyahSurahInfo && (
                             <CardTitle className="font-headline pt-2">
                                QS. {randomAyahSurahInfo.name}: {randomAyah.nomorAyat}
                             </CardTitle>
                        )}
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        {randomAyah ? (
                            <>
                                <p className="text-2xl leading-relaxed text-right font-arabic" dir="rtl">{randomAyah.teksArab}</p>
                                <p className="text-sm italic text-muted-foreground leading-relaxed">{randomAyah.teksLatin}</p>
                                <Separator/>
                                <p className="text-base leading-relaxed">{randomAyah.teksIndonesia}</p>
                            </>
                        ) : <p className="text-muted-foreground">Gagal memuat ayat.</p>}
                    </CardContent>
                </Card>

                {/* Hadist Hari Ini */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-primary">
                            <BookCopy className="h-5 w-5" />
                            <h2 className="font-semibold">Hadist Hari Ini</h2>
                        </div>
                        {randomHadith && (
                             <CardTitle className="font-headline pt-2 line-clamp-2">{randomHadith.namaHadist}</CardTitle>
                        )}
                         <CardDescription>{randomHadith?.riwayat}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        {randomHadith ? (
                            <>
                                <p className="text-lg leading-relaxed text-right font-arabic line-clamp-3" dir="rtl">{randomHadith.tulisanArab}</p>
                                <Separator/>
                                <p className="text-base leading-relaxed line-clamp-4">{randomHadith.arti}</p>
                            </>
                        ) : <p className="text-muted-foreground">Tidak ada hadist tersedia.</p>}
                    </CardContent>
                </Card>

                {/* Doa Hari Ini */}
                 <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-primary">
                            <Heart className="h-5 w-5" />
                            <h2 className="font-semibold">Doa Hari Ini</h2>
                        </div>
                        {randomDoa && (
                             <CardTitle className="font-headline pt-2 line-clamp-2">{randomDoa.doa}</CardTitle>
                        )}
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        {randomDoa ? (
                             <>
                                <p className="text-lg leading-relaxed text-right font-arabic line-clamp-3" dir="rtl">{randomDoa.ayat}</p>
                                <Separator/>
                                <p className="text-base leading-relaxed line-clamp-4">{randomDoa.artinya}</p>
                            </>
                        ) : <p className="text-muted-foreground">Tidak ada doa tersedia.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    