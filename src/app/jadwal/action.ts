'use server';

import type { PrayerScheduleResult, AladhanSchedule, GeocodingResult, AladhanLocation } from '@/types';

export async function getPrayerSchedule(latitude: number, longitude: number, date: Date): Promise<PrayerScheduleResult> {
    try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // Fetch prayer times for the selected month from the Aladhan API
        const scheduleResponse = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=2`);
        if (!scheduleResponse.ok) {
            throw new Error(`Gagal mengambil data jadwal sholat. Status: ${scheduleResponse.status}`);
        }
        const scheduleData = await scheduleResponse.json();

        if (scheduleData.code !== 200 || !scheduleData.data || scheduleData.data.length === 0) {
            throw new Error('Format data jadwal sholat tidak valid dari API.');
        }

        const dayOfMonth = date.getDate();
        // Find the schedule for the selected day
        const selectedDaySchedule: AladhanSchedule = scheduleData.data[dayOfMonth - 1];

        // Fetch location details
        let location: AladhanLocation = { city: 'Lokasi Tidak Dikenal', country: '', lat: latitude, lon: longitude };
        try {
            const locationResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`);
            if (locationResponse.ok) {
                const locationData = await locationResponse.json();
                location.city = locationData.city || locationData.locality || 'Lokasi Anda';
                location.country = locationData.countryName;
            }
        } catch (locError) {
            console.warn("Gagal mendapatkan nama kota, menggunakan koordinat.", locError);
            // Non-critical, so we don't throw. We'll use the coordinates.
        }

        return {
            schedule: selectedDaySchedule,
            location: location,
        };

    } catch (error: any) {
        console.error("Error in getPrayerSchedule action:", error);
        // Re-throw the error to be caught by the client component's catch block.
        throw new Error(error.message || "Terjadi kesalahan di server saat mengambil jadwal sholat.");
    }
}

export async function searchCity(cityName: string): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=id&format=json`);
    if (!response.ok) {
      throw new Error('Gagal mencari kota.');
    }
    const data = await response.json();
    if (!data.results) {
      return [];
    }
    return data.results.map((item: any) => ({
      name: item.name,
      lat: item.latitude,
      lon: item.longitude,
      country: item.country,
      state: item.admin1,
    }));
  } catch (error: any) {
    console.error("Error in searchCity action:", error);
    throw new Error("Gagal mencari kota.");
  }
}
