'use client';

import { SurahSummary } from '@/types';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

type SurahListProps = {
  surahs: SurahSummary[];
  selectedSurahId: number;
  onSelectSurah: (id: number) => void;
};

export default function SurahList({
  surahs,
  selectedSurahId,
  onSelectSurah,
}: SurahListProps) {
  return (
    <div className="px-2">
      <SidebarMenu>
        {surahs.map((surah) => (
          <SidebarMenuItem key={surah.nomor}>
            <SidebarMenuButton
              onClick={() => onSelectSurah(surah.nomor)}
              isActive={selectedSurahId === surah.nomor}
              className="justify-between"
              tooltip={{
                children: surah.namaLatin,
                className: "font-headline"
              }}
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 text-xs rounded-full bg-primary/20 text-primary-foreground">
                  {surah.nomor}
                </span>
                <div className='flex flex-col items-start'>
                    <span className="font-semibold">{surah.namaLatin}</span>
                    <span className="text-xs text-muted-foreground">{surah.arti}</span>
                </div>
              </div>
              <span className="text-sm font-arabic">{surah.nama}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
