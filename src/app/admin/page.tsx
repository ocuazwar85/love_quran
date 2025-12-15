'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Doa, Hadith, DoaCategory, HadithCategory, Advertisement } from '@/types';
import { PlusCircle, Edit, Trash2, LogOut, User, Moon, Sun, BookCopy, Settings, Heart, Search, Megaphone } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';


const adPositions = [
  { id: 'sidebar-footer', name: 'Sidebar Footer' },
  { id: 'content-top-banner', name: 'Banner Atas Konten' },
  { id: 'home-top-banner', name: 'Banner Atas Halaman Home' },
  { id: 'in-feed-doa', name: 'Sela Daftar Doa (setelah 5 item)' },
  { id: 'in-feed-hadith', name: 'Sela Daftar Hadist (setelah 5 item)' },
  { id: 'in-feed-quran', name: 'Sela Daftar Ayat (setelah 5 ayat)' },
  { id: 'interstitial-mobile', name: 'Iklan Modal (klik menu mobile)' },
  { id: 'interstitial-exit', name: 'Iklan Modal (saat akan keluar)' },
];


export default function AdminPage() {
  const { isAuthenticated, logout, updateCredentials } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Dialog states
  const [isDoaFormOpen, setIsDoaFormOpen] = useState(false);
  const [isHadithFormOpen, setIsHadithFormOpen] = useState(false);
  const [isDoaCategoryManagerOpen, setIsDoaCategoryManagerOpen] = useState(false);
  const [isHadithCategoryManagerOpen, setIsHadithCategoryManagerOpen] = useState(false);
  const [isAdFormOpen, setIsAdFormOpen] = useState(false);

  // Current item states
  const [currentDoa, setCurrentDoa] = useState<Partial<Doa>>({});
  const [currentHadith, setCurrentHadith] = useState<Partial<Hadith>>({});
  const [currentAd, setCurrentAd] = useState<Partial<Advertisement>>({});
  const [newDoaCategory, setNewDoaCategory] = useState('');
  const [newHadithCategory, setNewHadithCategory] = useState('');

  // Credentials state
  const [newUsername, setNewUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('admin1');

  const firestore = useFirestore();

  // Firestore hooks
  const doasCollection = useMemoFirebase(() => query(collection(firestore, 'doas'), orderBy('doa')), [firestore]);
  const { data: doas, isLoading: isLoadingDoas } = useCollection<Doa>(doasCollection);

  const hadithsCollection = useMemoFirebase(() => query(collection(firestore, 'hadiths'), orderBy('namaHadist')), [firestore]);
  const { data: hadiths, isLoading: isLoadingHadiths } = useCollection<Hadith>(hadithsCollection);

  const doaCategoriesCollection = useMemoFirebase(() => query(collection(firestore, 'doaCategories'), orderBy('name')), [firestore]);
  const { data: doaCategories, isLoading: isLoadingDoaCategories } = useCollection<DoaCategory>(doaCategoriesCollection);

  const hadithCategoriesCollection = useMemoFirebase(() => query(collection(firestore, 'hadithCategories'), orderBy('name')), [firestore]);
  const { data: hadithCategories, isLoading: isLoadingHadithCategories } = useCollection<HadithCategory>(hadithCategoriesCollection);

  const adsCollection = useMemoFirebase(() => collection(firestore, 'advertisements'), [firestore]);
  const { data: ads, isLoading: isLoadingAds } = useCollection<Advertisement>(adsCollection);

  // Filter and Search States
  const [doaSearchQuery, setDoaSearchQuery] = useState('');
  const [hadithSearchQuery, setHadithSearchQuery] = useState('');
  const [selectedDoaCategory, setSelectedDoaCategory] = useState('Semua');
  const [selectedHadithCategory, setSelectedHadithCategory] = useState('Semua');
  
  const [filteredDoas, setFilteredDoas] = useState<Doa[]>([]);
  const [filteredHadiths, setFilteredHadiths] = useState<Hadith[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  // Filtering and Searching Logic for Doas
  useEffect(() => {
    if (!doas) return;
    let tempDoas = [...doas];
    
    // Category filter
    if (selectedDoaCategory !== 'Semua') {
      tempDoas = tempDoas.filter(doa => doa.kategori === selectedDoaCategory);
    }
    
    // Search query filter
    if (doaSearchQuery) {
      const lowercasedQuery = doaSearchQuery.toLowerCase();
      tempDoas = tempDoas.filter(doa => 
        doa.doa.toLowerCase().includes(lowercasedQuery) ||
        doa.ayat.toLowerCase().includes(lowercasedQuery) ||
        doa.latin.toLowerCase().includes(lowercasedQuery) ||
        doa.artinya.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    setFilteredDoas(tempDoas);
  }, [doas, doaSearchQuery, selectedDoaCategory]);
  
  // Filtering and Searching Logic for Hadiths
  useEffect(() => {
    if (!hadiths) return;
    let tempHadiths = [...hadiths];
    
    // Category filter
    if (selectedHadithCategory !== 'Semua') {
      tempHadiths = tempHadiths.filter(hadith => hadith.kategori === selectedHadithCategory);
    }
    
    // Search query filter
    if (hadithSearchQuery) {
      const lowercasedQuery = hadithSearchQuery.toLowerCase();
      tempHadiths = tempHadiths.filter(hadith => 
        hadith.namaHadist.toLowerCase().includes(lowercasedQuery) ||
        hadith.tulisanArab.toLowerCase().includes(lowercasedQuery) ||
        hadith.arti.toLowerCase().includes(lowercasedQuery) ||
        hadith.penjelasan.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    setFilteredHadiths(tempHadiths);
  }, [hadiths, hadithSearchQuery, selectedHadithCategory]);

  // DOA Handlers
  const handleAddOrUpdateDoa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoa.doa || !currentDoa.ayat || !currentDoa.latin || !currentDoa.artinya) {
      toast({ variant: "destructive", title: "Error", description: "Semua field doa (kecuali kategori) harus diisi." });
      return;
    }
    const dataToSave = { ...currentDoa, kategori: currentDoa.kategori || 'Tanpa Kategori' };

    if (currentDoa.id) {
      setDocumentNonBlocking(doc(firestore, 'doas', currentDoa.id), dataToSave, { merge: true });
      toast({ title: "Berhasil", description: "Doa telah diperbarui." });
    } else {
      addDocumentNonBlocking(collection(firestore, 'doas'), dataToSave);
      toast({ title: "Berhasil", description: "Doa baru telah ditambahkan." });
    }
    setIsDoaFormOpen(false);
    setCurrentDoa({});
  };

  const handleEditDoa = (doa: Doa) => {
    setCurrentDoa(doa);
    setIsDoaFormOpen(true);
  };
  
  const handleAddNewDoa = () => {
    setCurrentDoa({});
    setIsDoaFormOpen(true);
  };

  const handleDeleteDoa = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'doas', id));
    toast({ title: "Berhasil", description: "Doa telah dihapus." });
  };

  // HADITH Handlers
  const handleAddOrUpdateHadith = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields: (keyof Omit<Hadith, 'id'>)[] = ['namaHadist', 'tulisanArab', 'latin', 'arti', 'penjelasan', 'riwayat'];
    const isMissingField = requiredFields.some(field => !currentHadith[field]);

    if (isMissingField || !currentHadith.kategori) {
      toast({ variant: "destructive", title: "Error", description: "Semua field hadist harus diisi." });
      return;
    }

    if (currentHadith.id) {
      setDocumentNonBlocking(doc(firestore, 'hadiths', currentHadith.id), currentHadith as Hadith, { merge: true });
      toast({ title: "Berhasil", description: "Hadist telah diperbarui." });
    } else {
      addDocumentNonBlocking(collection(firestore, 'hadiths'), currentHadith);
      toast({ title: "Berhasil", description: "Hadist baru telah ditambahkan." });
    }
    setIsHadithFormOpen(false);
    setCurrentHadith({});
  };

  const handleEditHadith = (hadith: Hadith) => {
    setCurrentHadith(hadith);
    setIsHadithFormOpen(true);
  };

  const handleAddNewHadith = () => {
    setCurrentHadith({});
    setIsHadithFormOpen(true);
  };

  const handleDeleteHadith = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'hadiths', id));
    toast({ title: "Berhasil", description: "Hadist telah dihapus." });
  };

  // Category Handlers
  const handleAddDoaCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDoaCategory.trim()) {
      addDocumentNonBlocking(collection(firestore, 'doaCategories'), { name: newDoaCategory.trim() });
      setNewDoaCategory('');
      toast({ title: "Berhasil", description: `Kategori "${newDoaCategory}" ditambahkan.` });
    }
  };

  const handleDeleteDoaCategory = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'doaCategories', id));
    toast({ title: "Berhasil", description: "Kategori doa telah dihapus." });
  };
  
  const handleAddHadithCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHadithCategory.trim()) {
      addDocumentNonBlocking(collection(firestore, 'hadithCategories'), { name: newHadithCategory.trim() });
      setNewHadithCategory('');
      toast({ title: "Berhasil", description: `Kategori "${newHadithCategory}" ditambahkan.` });
    }
  };

  const handleDeleteHadithCategory = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'hadithCategories', id));
    toast({ title: "Berhasil", description: "Kategori hadist telah dihapus." });
  };
  
  // Ad Handlers
  const handleEditAd = (positionId: string) => {
    const existingAd = ads?.find(ad => ad.id === positionId);
    setCurrentAd(existingAd || { id: positionId, positionId, adCode: '', isActive: false });
    setIsAdFormOpen(true);
  };
  
  const handleSaveAd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentAd.id) return;
      const dataToSave = {
          positionId: currentAd.id,
          adCode: currentAd.adCode || '',
          isActive: currentAd.isActive || false
      };
      setDocumentNonBlocking(doc(firestore, 'advertisements', currentAd.id), dataToSave, { merge: true });
      toast({ title: "Berhasil", description: `Iklan untuk posisi ${currentAd.id} telah disimpan.` });
      setIsAdFormOpen(false);
      setCurrentAd({});
  };


  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    updateCredentials(newUsername, newPassword);
  };

  if (!isAuthenticated) return <div className="flex min-h-screen items-center justify-center bg-background"><p>Mengarahkan ke halaman login...</p></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <h1 className="text-xl font-bold font-headline">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" size="icon"><User /></Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Edit Kredensial Login</DialogTitle><DialogDescription>Perbarui username dan password untuk login.</DialogDescription></DialogHeader>
              <form onSubmit={handleUpdateCredentials} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="new-username">Username Baru</Label><Input id="new-username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="new-password">Password Baru</Label><Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
                <DialogFooter><Button type="submit">Simpan Perubahan</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="icon" onClick={logout}><LogOut /></Button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <Tabs defaultValue="doa" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="doa"><Heart className="mr-2 h-4 w-4" /> Manajemen Doa</TabsTrigger>
            <TabsTrigger value="hadist"><BookCopy className="mr-2 h-4 w-4" /> Manajemen Hadist</TabsTrigger>
            <TabsTrigger value="iklan"><Megaphone className="mr-2 h-4 w-4" /> Manajemen Iklan</TabsTrigger>
          </TabsList>

          {/* DOA TAB */}
          <TabsContent value="doa" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Daftar Doa</CardTitle>
                    <CardDescription>Tambah, edit, atau hapus doa yang ditampilkan di aplikasi.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDoaCategoryManagerOpen(true)}><Settings className="mr-2 h-4 w-4" /> Kelola Kategori</Button>
                    <Button onClick={handleAddNewDoa}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Doa</Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Cari doa..." className="pl-8" value={doaSearchQuery} onChange={(e) => setDoaSearchQuery(e.target.value)} />
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select value={selectedDoaCategory} onValueChange={setSelectedDoaCategory}>
                            <SelectTrigger><SelectValue placeholder="Filter kategori" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Semua">Semua Kategori</SelectItem>
                                {doaCategories?.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoadingDoas ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-60 w-full" />)
                  : filteredDoas?.map(doa => (
                    <Card key={doa.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="font-arabic text-right text-2xl leading-relaxed line-clamp-2">{doa.ayat}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-2">
                        <p className="font-semibold line-clamp-1">{doa.doa}</p>
                        <p className="text-sm italic text-muted-foreground line-clamp-2">{doa.latin}</p>
                        <p className="text-sm line-clamp-2">{doa.artinya}</p>
                        {doa.kategori && <Badge variant="secondary">{doa.kategori}</Badge>}
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditDoa(doa)}><Edit className="h-4 w-4"/></Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteDoa(doa.id)}><Trash2 className="h-4 w-4"/></Button>
                      </CardFooter>
                    </Card>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* HADITH TAB */}
          <TabsContent value="hadist" className="mt-6">
            <Card>
              <CardHeader>
                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Daftar Hadist</CardTitle>
                    <CardDescription>Tambah, edit, atau hapus hadist yang ditampilkan di aplikasi.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsHadithCategoryManagerOpen(true)}><Settings className="mr-2 h-4 w-4" /> Kelola Kategori</Button>
                    <Button onClick={handleAddNewHadith}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Hadist</Button>
                  </div>
                </div>
                 <div className="mt-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Cari hadist..." className="pl-8" value={hadithSearchQuery} onChange={(e) => setHadithSearchQuery(e.target.value)} />
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select value={selectedHadithCategory} onValueChange={setSelectedHadithCategory}>
                            <SelectTrigger><SelectValue placeholder="Filter kategori" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Semua">Semua Kategori</SelectItem>
                                {hadithCategories?.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoadingHadiths ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
                  : filteredHadiths?.map(hadith => (
                    <Card key={hadith.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="font-headline text-lg line-clamp-2">{hadith.namaHadist}</CardTitle>
                        <CardDescription>{hadith.kategori} &bull; {hadith.riwayat}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-2">
                          <p className="text-right font-arabic text-lg line-clamp-2" dir="rtl">{hadith.tulisanArab}</p>
                          <p className="text-sm line-clamp-3">{hadith.arti}</p>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditHadith(hadith)}><Edit className="h-4 w-4"/></Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteHadith(hadith.id)}><Trash2 className="h-4 w-4"/></Button>
                      </CardFooter>
                    </Card>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ADS TAB */}
          <TabsContent value="iklan" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Iklan</CardTitle>
                <CardDescription>Kelola kode iklan untuk berbagai posisi di aplikasi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAds ? (
                  Array.from({ length: adPositions.length }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : (
                  adPositions.map(position => {
                    const adData = ads?.find(ad => ad.id === position.id);
                    return (
                      <Card key={position.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-semibold">{position.name}</p>
                          <p className={`text-sm ${adData?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            Status: {adData?.isActive ? 'Aktif' : 'Tidak Aktif'}
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => handleEditAd(position.id)}><Edit className="mr-2 h-4 w-4" /> Kelola Iklan</Button>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>

      {/* Doa Form Modal */}
      <Dialog open={isDoaFormOpen} onOpenChange={setIsDoaFormOpen}>
        <DialogContent className="sm:max-w-[600px]"><DialogHeader><DialogTitle>{currentDoa.id ? 'Edit Doa' : 'Tambah Doa'}</DialogTitle><DialogDescription>Isi detail doa di bawah ini.</DialogDescription></DialogHeader>
          <form onSubmit={handleAddOrUpdateDoa} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div><Label>Judul Doa</Label><Input value={currentDoa.doa || ''} onChange={e => setCurrentDoa({ ...currentDoa, doa: e.target.value })} /></div>
            <div><Label>Kategori</Label>
              <Select value={currentDoa.kategori || ''} onValueChange={value => setCurrentDoa({ ...currentDoa, kategori: value })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>{isLoadingDoaCategories ? <SelectItem value="loading" disabled>Memuat...</SelectItem> : doaCategories?.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Tulisan Arab</Label><Textarea value={currentDoa.ayat || ''} onChange={e => setCurrentDoa({ ...currentDoa, ayat: e.target.value })} className="font-arabic text-right" dir="rtl" /></div>
            <div><Label>Teks Latin</Label><Textarea value={currentDoa.latin || ''} onChange={e => setCurrentDoa({ ...currentDoa, latin: e.target.value })} /></div>
            <div><Label>Artinya</Label><Textarea value={currentDoa.artinya || ''} onChange={e => setCurrentDoa({ ...currentDoa, artinya: e.target.value })} /></div>
            <DialogFooter className="sticky bottom-0 bg-background pt-4"><DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose><Button type="submit">Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hadith Form Modal */}
      <Dialog open={isHadithFormOpen} onOpenChange={setIsHadithFormOpen}>
        <DialogContent className="sm:max-w-[600px]"><DialogHeader><DialogTitle>{currentHadith.id ? 'Edit Hadist' : 'Tambah Hadist'}</DialogTitle><DialogDescription>Isi detail hadist di bawah ini.</DialogDescription></DialogHeader>
          <form onSubmit={handleAddOrUpdateHadith} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div><Label>Nama Hadist</Label><Input value={currentHadith.namaHadist || ''} onChange={e => setCurrentHadith({ ...currentHadith, namaHadist: e.target.value })} /></div>
            <div><Label>Kategori</Label>
              <Select value={currentHadith.kategori || ''} onValueChange={value => setCurrentHadith({ ...currentHadith, kategori: value })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>{isLoadingHadithCategories ? <SelectItem value="loading" disabled>Memuat...</SelectItem> : hadithCategories?.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Diriwayatkan oleh</Label><Input value={currentHadith.riwayat || ''} onChange={e => setCurrentHadith({ ...currentHadith, riwayat: e.target.value })} /></div>
            <div><Label>Tulisan Arab</Label><Textarea value={currentHadith.tulisanArab || ''} onChange={e => setCurrentHadith({ ...currentHadith, tulisanArab: e.target.value })} className="font-arabic text-right" dir="rtl" /></div>
            <div><Label>Teks Latin</Label><Textarea value={currentHadith.latin || ''} onChange={e => setCurrentHadith({ ...currentHadith, latin: e.target.value })} /></div>
            <div><Label>Artinya</Label><Textarea value={currentHadith.arti || ''} onChange={e => setCurrentHadith({ ...currentHadith, arti: e.target.value })} /></div>
            <div><Label>Penjelasan</Label><Textarea value={currentHadith.penjelasan || ''} onChange={e => setCurrentHadith({ ...currentHadith, penjelasan: e.target.value })} /></div>
            <DialogFooter className="sticky bottom-0 bg-background pt-4"><DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose><Button type="submit">Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Doa Category Manager Modal */}
      <Dialog open={isDoaCategoryManagerOpen} onOpenChange={setIsDoaCategoryManagerOpen}>
        <DialogContent><DialogHeader><DialogTitle>Kelola Kategori Doa</DialogTitle><DialogDescription>Tambah atau hapus kategori untuk doa.</DialogDescription></DialogHeader>
          <form onSubmit={handleAddDoaCategory} className="flex gap-2"><Input value={newDoaCategory} onChange={e => setNewDoaCategory(e.target.value)} placeholder="Nama kategori baru..." /><Button type="submit">Tambah</Button></form>
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {isLoadingDoaCategories ? <p>Memuat...</p> : doaCategories?.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-2 border rounded-md"><span className="font-medium">{cat.name}</span><Button variant="ghost" size="icon" onClick={() => handleDeleteDoaCategory(cat.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hadith Category Manager Modal */}
      <Dialog open={isHadithCategoryManagerOpen} onOpenChange={setIsHadithCategoryManagerOpen}>
        <DialogContent><DialogHeader><DialogTitle>Kelola Kategori Hadist</DialogTitle><DialogDescription>Tambah atau hapus kategori untuk hadist.</DialogDescription></DialogHeader>
          <form onSubmit={handleAddHadithCategory} className="flex gap-2"><Input value={newHadithCategory} onChange={e => setNewHadithCategory(e.target.value)} placeholder="Nama kategori baru..." /><Button type="submit">Tambah</Button></form>
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {isLoadingHadithCategories ? <p>Memuat...</p> : hadithCategories?.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-2 border rounded-md"><span className="font-medium">{cat.name}</span><Button variant="ghost" size="icon" onClick={() => handleDeleteHadithCategory(cat.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Ad Form Modal */}
      <Dialog open={isAdFormOpen} onOpenChange={setIsAdFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Kelola Iklan: {adPositions.find(p => p.id === currentAd.id)?.name}</DialogTitle>
            <DialogDescription>Masukkan kode iklan dan atur statusnya.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAd} className="space-y-4 py-4">
            <div>
              <Label htmlFor="adCode">Kode Iklan (HTML/Script)</Label>
              <Textarea
                id="adCode"
                placeholder="<script async src=...></script>"
                value={currentAd.adCode || ''}
                onChange={e => setCurrentAd({ ...currentAd, adCode: e.target.value })}
                className="font-mono h-48"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={currentAd.isActive || false}
                onCheckedChange={checked => setCurrentAd({ ...currentAd, isActive: checked })}
              />
              <Label htmlFor="isActive">Aktifkan Iklan ini</Label>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
              <Button type="submit">Simpan Iklan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    