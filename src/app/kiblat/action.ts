'use server';

import type { QiblaDirection } from '@/types';

export async function getQiblaDirection(latitude: number, longitude: number): Promise<QiblaDirection> {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data arah kiblat. Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.code !== 200 || !data.data) {
            throw new Error('Format data arah kiblat tidak valid dari API.');
        }

        return data.data;

    } catch (error: any) {
        console.error("Error in getQiblaDirection action:", error);
        throw new Error(error.message || "Terjadi kesalahan di server saat mengambil arah kiblat.");
    }
}
