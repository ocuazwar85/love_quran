'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, CalendarIcon, Locate, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPrayerSchedule, searchCity } from './action';
import type { AladhanSchedule, AladhanLocation, GeocodingResult } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';


export default function JadwalSholatPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [schedule, setSchedule] = React.useState<AladhanSchedule | null>(null);
  const [location, setLocation] = React.useState<AladhanLocation | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<GeocodingResult[]>([]);
  const [isSearchListVisible, setIsSearchListVisible] = React.useState(false);
  
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchScheduleForCoords = React.useCallback(async (latitude: number, longitude: number, date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPrayerSchedule(latitude, longitude, date);
      if (result.schedule && result.location) {
        setSchedule(result.schedule);
        setLocation(result.location);
      } else {
        throw new Error('Format data jadwal sholat tidak valid.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal mendapatkan jadwal sholat. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGetCurrentLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      setError("Browser Anda tidak mendukung Geolocation.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if(selectedDate) {
            setSearchQuery('');
            fetchScheduleForCoords(latitude, longitude, selectedDate);
        }
        setPermissionDenied(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError("Akses lokasi ditolak. Silakan izinkan akses lokasi atau cari kota secara manual.");
        } else {
          setError("Gagal mendapatkan lokasi Anda. Pastikan GPS aktif atau cari kota manual.");
        }
        setIsLoading(false);
      }
    );
  }, [fetchScheduleForCoords, selectedDate]);
  
  // Fetch for current location on initial load
  React.useEffect(() => {
    handleGetCurrentLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleDateChange = (date: Date | undefined) => {
      if (!date || !location) return;
      
      setSelectedDate(date);
      // Re-fetch schedule for the currently set location (either GPS or searched city)
      if (location.lat && location.lon) {
          fetchScheduleForCoords(location.lat, location.lon, date);
      } else {
          handleGetCurrentLocation(); // Fallback to GPS if coords aren't stored
      }
  }


  const handleSearchCity = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      setIsSearchListVisible(false);
      return;
    }
    setIsSearchListVisible(true);
    setIsSearching(true);
    try {
      const results = await searchCity(query);
      setSearchResults(results);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mencari kota.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCity = (city: GeocodingResult) => {
    if (selectedDate) {
      fetchScheduleForCoords(city.lat, city.lon, selectedDate);
    }
    setSearchQuery(`${city.name}, ${city.country}`);
    setSearchResults([]);
    setIsSearchListVisible(false);
  };
  
    // Effect to close search results when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchListVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);


  const renderContent = () => {
    if (!schedule && isLoading && !error) {
      return (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertTitle>Meminta Lokasi</AlertTitle>
          <AlertDescription>
            Aplikasi ini mencoba mendapatkan lokasi Anda untuk menampilkan jadwal sholat yang akurat.
          </AlertDescription>
        </Alert>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription>
                {error}
                {permissionDenied && (
                    <Button onClick={handleGetCurrentLocation} className="mt-4">
                        Coba Lagi & Izinkan Lokasi
                    </Button>
                )}
            </AlertDescription>
        </Alert>
      );
    }
    
    if (isLoading) {
        return <ScheduleSkeleton />;
    }

    if (schedule && selectedDate) {
      const prayerTimes = {
        Imsak: schedule.timings.Imsak.split(' ')[0],
        Subuh: schedule.timings.Fajr.split(' ')[0],
        Dzuhur: schedule.timings.Dhuhr.split(' ')[0],
        Ashar: schedule.timings.Asr.split(' ')[0],
        Maghrib: schedule.timings.Maghrib.split(' ')[0],
        Isya: schedule.timings.Isha.split(' ')[0],
      };
      
      const indonesianDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(selectedDate);

      return (
        <Card className="w-full max-w-3xl mx-auto shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <MapPin className="h-5 w-5" />
                        <span className="font-semibold">{location?.city || 'Lokasi Anda'}</span>
                    </div>
                    <CardTitle className="font-headline text-3xl">Jadwal Sholat</CardTitle>
                    <CardDescription>{indonesianDate}</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full sm:w-[280px]" ref={searchContainerRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari kota lain..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => handleSearchCity(e.target.value)}
                            onFocus={() => { if(searchQuery.length > 2) setIsSearchListVisible(true)}}
                        />
                        {isSearchListVisible && (
                            <div className="absolute top-full mt-2 w-full z-10">
                                <Command className="rounded-lg border bg-popover text-popover-foreground shadow-md">
                                    <CommandList>
                                        {isSearching && <div className="p-4 text-sm text-center">Mencari...</div>}
                                        <CommandEmpty hidden={isSearching || searchQuery.length < 3 || searchResults.length > 0}>Tidak ada kota ditemukan.</CommandEmpty>
                                        {searchResults.length > 0 && (
                                            <CommandGroup>
                                                {searchResults.map((city) => (
                                                    <CommandItem 
                                                      key={`${city.lat}-${city.lon}`} 
                                                      onSelect={() => handleSelectCity(city)} 
                                                      value={`${city.name}, ${city.country}`}
                                                      className="aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto"
                                                    >
                                                        <span>{city.name}, {city.state ? `${city.state}, ` : ''}{city.country}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </div>
                        )}
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[200px] justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateChange}
                            initialFocus
                            locale={id}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={handleGetCurrentLocation} title="Gunakan Lokasi Saat Ini">
                        <Locate className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(prayerTimes).map(([name, time]) => (
                <div key={name} className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
                    <p className="text-lg font-semibold capitalize text-foreground">{name}</p>
                    <p className="text-2xl font-bold text-emerald-600">{time}</p>
                </div>
            ))}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Jadwal Sholat</h1>
        <p className="text-muted-foreground mt-1">
          Jadwal sholat otomatis berdasarkan lokasi Anda atau cari kota lain.
        </p>
      </div>
      <div className="flex justify-center py-8">
        {renderContent()}
      </div>
    </div>
  );
}

function ScheduleSkeleton() {
    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:flex-wrap md:items-start md:justify-between gap-4">
                    <div className='flex-1 min-w-[200px]'>
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                        <Skeleton className="h-9 w-3/4" />
                        <Skeleton className="h-5 w-1/2 mt-2" />
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <Skeleton className="h-10 w-full sm:w-[280px]" />
                        <Skeleton className="h-10 w-full sm:w-[200px]" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    )
}
