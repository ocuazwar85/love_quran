'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getHijriCalendar } from './action';
import type { CalendarDay, HijriCalendarMonth, IslamicHoliday } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, AlertTriangle, CalendarDays } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function KalenderHijriahPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [calendarData, setCalendarData] = React.useState<HijriCalendarMonth | null>(null);
  const [holidays, setHolidays] = React.useState<IslamicHoliday[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  React.useEffect(() => {
    const fetchCalendar = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const result = await getHijriCalendar(year, month);
        setCalendarData(result.calendar);
        setHolidays(result.holidays);
      } catch (err: any) {
        setError(err.message || "Gagal memuat data kalender.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendar();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };
  
  const handleMonthChange = (monthStr: string) => {
      const month = parseInt(monthStr, 10);
      setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
  };

  const today = new Date();
  // Correctly format today's date to DD-MM-YYYY to match API format
  const todayString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  
  const todayHijriData = calendarData?.data.find(d => d.date.gregorian.date === todayString);

  const todayHijriSimpleFormatted = todayHijriData
    ? `${todayHijriData.date.hijri.day} ${todayHijriData.date.hijri.month.en} ${todayHijriData.date.hijri.year} H`
    : 'Memuat...';

  const renderCalendarGrid = () => {
    if (isLoading) return <CalendarSkeleton />;
    if (error) return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
    if (!calendarData) return <p>Data tidak tersedia.</p>;

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    return (
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {dayNames.map(day => (
          <div key={day} className="text-center font-bold text-muted-foreground text-xs md:text-sm p-2">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="border rounded-lg bg-muted/20"></div>
        ))}
        {calendarData.data.map((day : CalendarDay) => {
          const holiday = holidays.find(h => h.date.gregorian === day.date.gregorian.date);
          const isToday = day.date.gregorian.date === todayString;
          
          return (
            <div
              key={day.date.readable}
              className={cn(
                "border rounded-lg p-2 h-28 md:h-32 flex flex-col relative transition-all duration-200 text-left",
                isToday ? "border-primary-foreground bg-primary/20 shadow-lg" : "bg-card hover:bg-muted/50",
              )}
            >
              <p className="font-bold text-2xl md:text-4xl text-foreground">{day.date.gregorian.day}</p>
              <p className="text-xs md:text-sm text-blue-500 font-semibold">{day.date.hijri.day} {day.date.hijri.month.en}</p>
              
              {holiday && (
                <div className="mt-auto text-center flex-grow flex items-end justify-center">
                    <p className="text-[10px] md:text-xs font-bold text-red-600 dark:text-red-400 leading-tight">{holiday.name}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kalender Hijriah</h1>
        <p className="text-muted-foreground mt-1">
          Lihat kalender Masehi dan Hijriah lengkap dengan hari besar Islam.
        </p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h3 className="text-lg font-semibold flex items-center gap-2"><CalendarDays className="h-5 w-5"/> Hari Ini</h3>
            <p className="text-lg font-bold text-emerald-600">{todayHijriSimpleFormatted}</p>
          </div>
        </CardHeader>
      </Card>


      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className='flex items-center gap-2'>
              <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft /></Button>
              <h2 className="text-xl font-semibold text-center w-48">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight /></Button>
            </div>
            <div className='flex items-center gap-2'>
                <Select value={String(currentMonth)} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        {monthNames.map((name, index) => (
                             <SelectItem key={index} value={String(index)}>{name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={String(currentYear)} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(year => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderCalendarGrid()}
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
        </div>
    )
}
