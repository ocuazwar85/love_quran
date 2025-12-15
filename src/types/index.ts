export type Ayah = {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: {
    '01': string;
    '02': string;
    '03': string;
    '04': string;
    '05': string;
  };
};

export type Tafsir = {
  ayat: number;
  teks: string;
};

export type Surah = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: 'Mekah' | 'Madinah';
  arti: string;
  deskripsi: string;
  audioFull: {
    '01': string;
    '02': string;
    '03': string;
    '04': string;
    '05': string;
  };
  ayat: Ayah[];
  suratSelanjutnya: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  } | false;
  suratSebelumnya: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  } | false;
};

export type SurahSummary = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: 'Mekah' | 'Madinah';
  arti: string;
  deskripsi: string;
  audioFull: {
    [key: string]: string;
  };
};

export type DisplayMode = 'all' | 'arabic-translation' | 'arabic' | 'transliteration-translation';

export type Doa = {
    id: string;
    doa: string;
    ayat: string;
    latin: string;
    artinya: string;
    kategori?: string;
};

export type DoaCategory = {
  id: string;
  name: string;
}

export type Hadith = {
  id: string;
  namaHadist: string;
  kategori: string;
  tulisanArab: string;
  latin: string;
  arti: string;
  penjelasan: string;
  riwayat: string;
}

export type HadithCategory = {
  id: string;
  name: string;
}

export type Advertisement = {
    id: string;
    positionId: string;
    adCode: string;
    isActive: boolean;
}

// Tipe data untuk API Aladhan
export type AladhanTimings = {
  [key: string]: string; // More flexible to handle different prayer names
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
};

export type AladhanSchedule = {
  timings: AladhanTimings;
  date: {
    readable: string;
    gregorian: {
      weekday: {
        en: string;
      }
    }
  };
};

export type GeocodingResult = {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
};


export type AladhanLocation = {
    city: string;
    country: string;
    lat: number;
    lon: number;
};

export type PrayerScheduleResult = {
  schedule: AladhanSchedule | null;
  location: AladhanLocation | null;
  error?: string;
};

// Tipe data untuk Kalender Hijriah dari API Aladhan
export type HijriDate = {
  date: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
      abbreviated: string;
      expanded: string;
  }
};

export type GregorianDate = {
  date: string;
  day: string;
  weekday: {
    en: string;
  };
  month: {
    number: number;
    en: string;
  };
  year: string;
  designation: {
      abbreviated: string;
      expanded: string;
  }
};

export type CalendarDay = {
  date: {
    readable: string;
    hijri: HijriDate;
    gregorian: GregorianDate;
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
};

export type HijriCalendarMonth = {
  code: number;
  status: string;
  data: CalendarDay[];
};

export type IslamicHoliday = {
    name: string;
    date: {
        hijri: string;
        gregorian: string;
    };
};

export type IslamicHolidaysResponse = {
    code: number;
    status: string;
    data: IslamicHoliday[];
};


export type HijriCalendarResult = {
  calendar: HijriCalendarMonth;
  holidays: IslamicHoliday[];
};


// Tipe data untuk Arah Kiblat
export type QiblaDirection = {
    latitude: number;
    longitude: number;
    direction: number;
};
