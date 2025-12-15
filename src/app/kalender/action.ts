'use server';

import type { HijriCalendarMonth, HijriCalendarResult, IslamicHoliday, IslamicHolidaysResponse } from '@/types';

// Cache untuk hari libur, kunci dengan tahun
const holidaysCache = new Map<number, IslamicHoliday[]>();

export async function getHijriCalendar(year: number, month: number): Promise<HijriCalendarResult> {
    try {
        // Ambil data kalender untuk bulan dan tahun tertentu
        const calendarResponse = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=-6.175110&longitude=106.865036&method=2`);
        if (!calendarResponse.ok) {
            throw new Error(`Gagal mengambil data kalender. Status: ${calendarResponse.status}`);
        }
        const calendarData: HijriCalendarMonth = await calendarResponse.json();

        if (calendarData.code !== 200 || !calendarData.data) {
            throw new Error('Format data kalender tidak valid dari API.');
        }

        let holidays: IslamicHoliday[] = [];
        
        // Cek cache terlebih dahulu
        if (holidaysCache.has(year)) {
            holidays = holidaysCache.get(year)!;
        } else {
            // Jika tidak ada di cache, fetch dari API
            const holidaysResponse = await fetch(`https://api.aladhan.com/v1/hollidays/${year}`);
            
            // API holidays mungkin tidak tersedia atau memberikan error, jadi kita tangani dengan baik
            if (holidaysResponse.ok) {
                const holidaysData: IslamicHolidaysResponse = await holidaysResponse.json();
                if (holidaysData.code === 200) {
                    holidays = holidaysData.data;
                    // Simpan ke cache
                    holidaysCache.set(year, holidays);
                } else {
                     console.warn(`API hari besar Islam merespon dengan kode ${holidaysData.code}. Mungkin tidak ada data untuk tahun ${year}.`);
                }
            } else {
                console.warn(`Gagal mengambil data hari besar Islam. Status: ${holidaysResponse.status}. Fitur ini mungkin tidak tersedia.`);
            }
        }

        return {
            calendar: calendarData,
            holidays: holidays,
        };

    } catch (error: any) {
        console.error("Error in getHijriCalendar action:", error);
        throw new Error(error.message || "Terjadi kesalahan di server saat mengambil data kalender.");
    }
}
