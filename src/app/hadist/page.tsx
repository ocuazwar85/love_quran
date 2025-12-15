'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { Hadith, HadithCategory } from '@/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdSlot from '@/components/ads/ad-slot';

function HadithCard({ hadith, onCardClick }: { hadith: Hadith; onCardClick: () => void; }) {
  return (
    <Card 
      onClick={onCardClick}
      className="flex flex-col cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl bg-card/50 hover:bg-card"
    >
      <CardHeader>
        <CardTitle className="font-headline text-xl leading-tight line-clamp-2">{hadith.namaHadist}</CardTitle>
        <CardDescription>{hadith.kategori} &bull; {hadith.riwayat}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-right font-arabic text-lg line-clamp-2" dir="rtl">{hadith.tulisanArab}</p>
        <p className="text-sm text-muted-foreground line-clamp-3">{hadith.arti}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
            <BookOpen className="mr-2 h-4 w-4"/>
            Baca Selengkapnya
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function HadistPage() {
  const firestore = useFirestore();
  
  // Fetching data
  const hadithsCollection = useMemoFirebase(() => query(collection(firestore, 'hadiths'), orderBy('namaHadist')), [firestore]);
  const { data: hadiths, isLoading: isLoadingHadiths } = useCollection<Hadith>(hadithsCollection);
  
  const hadithCategoriesCollection = useMemoFirebase(() => query(collection(firestore, 'hadithCategories'), orderBy('name')), [firestore]);
  const { data: hadithCategories, isLoading: isLoadingCategories } = useCollection<HadithCategory>(hadithCategoriesCollection);

  // State for filtering and searching
  const [selectedKategori, setSelectedKategori] = React.useState<string>('Semua');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredHadiths, setFilteredHadiths] = React.useState<Hadith[]>([]);
  
  // State for modal
  const [selectedHadith, setSelectedHadith] = React.useState<Hadith | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Filtering and Searching Logic
  React.useEffect(() => {
    if (!hadiths) {
      setFilteredHadiths([]);
      return;
    }

    let tempHadiths = [...hadiths];

    // Category filter
    if (selectedKategori !== 'Semua') {
      tempHadiths = tempHadiths.filter(h => h.kategori === selectedKategori);
    }
    
    // Search query filter
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        tempHadiths = tempHadiths.filter(hadith => 
          hadith.namaHadist.toLowerCase().includes(lowercasedQuery) ||
          hadith.tulisanArab.toLowerCase().includes(lowercasedQuery) ||
          hadith.arti.toLowerCase().includes(lowercasedQuery) ||
          hadith.penjelasan.toLowerCase().includes(lowercasedQuery) ||
          hadith.riwayat.toLowerCase().includes(lowercasedQuery)
        );
    }

    setFilteredHadiths(tempHadiths);
  }, [selectedKategori, searchQuery, hadiths]);
  
  const handleCardClick = (hadith: Hadith) => {
    setSelectedHadith(hadith);
    setIsModalOpen(true);
  };

  const isLoading = isLoadingHadiths || isLoadingCategories;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Hadist Muhammad SAW</h1>
        <p className="text-muted-foreground mt-1">
          Kumpulan hadist-hadist pilihan sebagai pedoman hidup.
        </p>
      </div>
      
       <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Cari hadist..." 
                    className="pl-8" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    disabled={isLoading}
                />
            </div>
            <div className="w-full md:w-[240px]">
                <Select value={selectedKategori} onValueChange={setSelectedKategori} disabled={isLoading}>
                    <SelectTrigger><SelectValue placeholder="Filter kategori" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Semua">Semua Kategori</SelectItem>
                        {hadithCategories?.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

      <div className="text-sm text-muted-foreground">
        {isLoading ? <Skeleton className="h-5 w-48" /> : <div>Menampilkan {filteredHadiths.length} hadist hasil pencarian.</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
        ) : (
           filteredHadiths.map((hadith, index) => (
            <React.Fragment key={hadith.id}>
              <HadithCard hadith={hadith} onCardClick={() => handleCardClick(hadith)} />
              {(index + 1) % 5 === 0 && (
                <div className="md:col-span-2 lg:col-span-3">
                  <AdSlot positionId="in-feed-hadith" />
                </div>
              )}
            </React.Fragment>
          ))
        )}
         {hadiths && hadiths.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground col-span-full py-8">
              Belum ada hadist yang ditambahkan. Silakan tambahkan melalui halaman admin.
            </p>
        )}
        {hadiths && filteredHadiths.length === 0 && !isLoading && searchQuery && (
             <p className="text-center text-muted-foreground col-span-full py-8">
              Tidak ada hadist yang cocok dengan pencarian Anda.
            </p>
        )}
      </div>

       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl w-[90vw] h-[80vh] flex flex-col">
          {selectedHadith && (
            <>
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="font-headline text-2xl">{selectedHadith.namaHadist}</DialogTitle>
                <DialogDescription>
                  Diriwayatkan oleh {selectedHadith.riwayat}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4 flex-1 overflow-y-auto pr-4">
                <div className="space-y-4">
                  <p className="text-3xl leading-relaxed text-right font-arabic" dir="rtl">
                    {selectedHadith.tulisanArab}
                  </p>
                  <p className="text-lg italic text-muted-foreground leading-relaxed">
                    {selectedHadith.latin}
                  </p>
                   <p className="text-lg leading-relaxed">{selectedHadith.arti}</p>
                   <Separator />
                   <div>
                        <h3 className="font-semibold text-lg mb-2">Penjelasan</h3>
                        <p className="text-base leading-relaxed text-muted-foreground">{selectedHadith.penjelasan}</p>
                   </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

    