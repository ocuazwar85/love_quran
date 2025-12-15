'use client';

import * as React from 'react';
import { Doa, DoaCategory } from '@/types';
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
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import DoaCard from './doa-card';
import { Skeleton } from '../ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import staticDoas from '@/lib/doa.json';
import AdSlot from '@/components/ads/ad-slot';

export default function DoaExplorer() {
  const firestore = useFirestore();
  
  // Fetching dynamic data from Firestore
  const doasCollection = useMemoFirebase(() => query(collection(firestore, 'doas'), orderBy('doa')), [firestore]);
  const { data: firestoreDoas, isLoading: isLoadingDoas } = useCollection<Doa>(doasCollection);
  
  const doaCategoriesCollection = useMemoFirebase(() => query(collection(firestore, 'doaCategories'), orderBy('name')), [firestore]);
  const { data: firestoreCategories, isLoading: isLoadingCategories } = useCollection<DoaCategory>(doaCategoriesCollection);

  // Combine static and firestore data
  const combinedDoas = React.useMemo(() => {
    // Ensure firestoreDoas is an array, even if it's null/undefined
    const dynamicDoas = firestoreDoas || [];
    // Combine, assuming static doas don't have conflicting IDs with firestore
    return [...staticDoas, ...dynamicDoas];
  }, [firestoreDoas]);

  const combinedCategories = React.useMemo(() => {
    const staticCats = [...new Set(staticDoas.map(d => d.kategori).filter(Boolean))] as string[];
    const dynamicCats = (firestoreCategories || []).map(c => c.name);
    const allCats = [...new Set([...staticCats, ...dynamicCats])].sort();
    return allCats.map((cat, index) => ({ id: `cat-${index}`, name: cat }));
  }, [firestoreCategories]);


  const [selectedKategori, setSelectedKategori] = React.useState<string>('Semua');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredDoas, setFilteredDoas] = React.useState<Doa[]>([]);
  
  const [selectedDoa, setSelectedDoa] = React.useState<Doa | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);


  React.useEffect(() => {
    if (!combinedDoas) {
      setFilteredDoas([]);
      return;
    }
    let tempDoas = [...combinedDoas];
    
    // Category filter
    if (selectedKategori !== 'Semua') {
      tempDoas = tempDoas.filter(doa => doa.kategori === selectedKategori);
    }
    
    // Search query filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      tempDoas = tempDoas.filter(doa => 
        doa.doa.toLowerCase().includes(lowercasedQuery) ||
        doa.ayat.toLowerCase().includes(lowercasedQuery) ||
        doa.latin.toLowerCase().includes(lowercasedQuery) ||
        doa.artinya.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    setFilteredDoas(tempDoas);
  }, [selectedKategori, searchQuery, combinedDoas]);

  const handleCardClick = (doa: Doa) => {
    setSelectedDoa(doa);
    setIsModalOpen(true);
  };
  
  const isLoading = isLoadingDoas || isLoadingCategories;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Doa Sehari-hari</h1>
        <p className="text-muted-foreground mt-1">
          Kumpulan doa-doa pilihan untuk berbagai kesempatan.
        </p>
      </div>

       <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Cari doa..." 
                    className="pl-8" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading && combinedDoas.length === 0}
                />
            </div>
            <div className="w-full md:w-[240px]">
                <Select value={selectedKategori} onValueChange={setSelectedKategori} disabled={isLoading && combinedCategories.length === 0}>
                    <SelectTrigger><SelectValue placeholder="Filter kategori" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Semua">Semua Kategori</SelectItem>
                        {combinedCategories?.map((cat: any) => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

      <div className="text-sm text-muted-foreground">
        {isLoading && combinedDoas.length === 0 ? <Skeleton className="h-5 w-48" /> : <div>Menampilkan {filteredDoas.length} doa hasil pencarian.</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && combinedDoas.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)
        ): (
             filteredDoas.map((doa, index) => (
              <React.Fragment key={doa.id}>
                <DoaCard doa={doa} onCardClick={() => handleCardClick(doa)} />
                {(index + 1) % 5 === 0 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <AdSlot positionId="in-feed-doa" />
                  </div>
                )}
              </React.Fragment>
            ))
        )}
        {combinedDoas && combinedDoas.length === 0 && !isLoading && (
             <p className="text-center text-muted-foreground col-span-full py-8">
              Belum ada doa yang ditambahkan. Silakan tambahkan melalui halaman admin.
            </p>
        )}
        {combinedDoas && filteredDoas.length === 0 && !isLoading && searchQuery && (
             <p className="text-center text-muted-foreground col-span-full py-8">
              Tidak ada doa yang cocok dengan pencarian Anda.
            </p>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl w-[90vw] h-[80vh] flex flex-col">
          {selectedDoa && (
            <>
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="font-headline text-2xl">{selectedDoa.doa}</DialogTitle>
                <DialogDescription>
                  Bacaan lengkap doa beserta artinya.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4 flex-1 overflow-y-auto pr-4">
                <div className="space-y-4">
                  <p className="text-3xl leading-relaxed text-right font-arabic" dir="rtl">
                    {selectedDoa.ayat}
                  </p>
                  <p className="text-lg italic text-muted-foreground leading-relaxed">
                    {selectedDoa.latin}
                  </p>
                  <Separator />
                  <p className="text-lg leading-relaxed">{selectedDoa.artinya}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

    