'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  useSidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import SurahList from '@/components/quran/surah-list';
import QuranView from '@/components/quran/quran-view';
import DoaExplorer from '@/components/doa/doa-explorer';
import HadistPage from '@/app/hadist/page';
import JadwalSholatPage from '@/app/jadwal/page';
import KalenderHijriahPage from '@/app/kalender/page';
import QiblaFinderPage from '@/app/kiblat/page';
import HomePage from '@/app/home/page';
import { Logo } from '@/components/icons/logo';
import { KaabaIcon } from '@/components/icons/kaaba';
import { Button } from '@/components/ui/button';
import { Github, BookOpen, Heart, Moon, Sun, BookMarked, Clock, CalendarDays, Home as HomeIcon } from 'lucide-react';
import { Surah, SurahSummary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import DateTimeDisplay from '@/components/ui/date-time-display';
import { ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import AdSlot from '@/components/ads/ad-slot';
import ExitIntentAd from '@/components/ads/exit-intent-ad';
import InterstitialAd from '@/components/ads/interstitial-ad';


async function safeFetch(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    throw new TypeError(`Expected JSON, but got ${contentType}. Response: ${text.substring(0, 100)}...`);
  }
  return response.json();
}

function PageContent() {
  const [surahs, setSurahs] = React.useState<SurahSummary[]>([]);
  const [selectedSurah, setSelectedSurah] = React.useState<Surah | null>(null);
  const [selectedSurahId, setSelectedSurahId] = React.useState<number>(1);
  const [loadingSurahs, setLoadingSurahs] = React.useState(true);
  const [loadingSelectedSurah, setLoadingSelectedSurah] = React.useState(true);

  const [activeMenu, setActiveMenu] = React.useState('home');
  const [isQuranMenuOpen, setIsQuranMenuOpen] = React.useState(false);
  const [showInterstitial, setShowInterstitial] = React.useState(false);
  const [nextMenu, setNextMenu] = React.useState<string | null>(null);

  const { theme, setTheme } = useTheme();
  const { isMobile, setOpenMobile } = useSidebar();


  React.useEffect(() => {
    async function fetchSurahs() {
      try {
        setLoadingSurahs(true);
        const json = await safeFetch('https://equran.id/api/v2/surat');
        setSurahs(json.data);
      } catch (error) {
        console.error('Failed to fetch surahs list', error);
      } finally {
        setLoadingSurahs(false);
      }
    }
    fetchSurahs();
  }, []);

  React.useEffect(() => {
    async function fetchSurah(id: number) {
      if (!id) return;
      try {
        setLoadingSelectedSurah(true);
        const json = await safeFetch(`https://equran.id/api/v2/surat/${id}`);
        setSelectedSurah(json.data);
      } catch (error) {
        console.error(`Failed to fetch surah ${id}`, error);
      } finally {
        setLoadingSelectedSurah(false);
      }
    }
    if (activeMenu === 'quran') {
        fetchSurah(selectedSurahId);
    }
  }, [selectedSurahId, activeMenu]);

  React.useEffect(() => {
    setIsQuranMenuOpen(activeMenu === 'quran');
  }, [activeMenu]);

  const handleMenuClick = (menu: string) => {
    if (isMobile) {
        setNextMenu(menu);
        setShowInterstitial(true);
    } else {
        setActiveMenu(menu);
    }
  };

  const handleInterstitialClose = () => {
      setShowInterstitial(false);
      if (nextMenu) {
          setActiveMenu(nextMenu);
          setOpenMobile(false);
          setNextMenu(null);
      }
  };

  const handleSelectSurah = (id: number) => {
    setSelectedSurahId(id);
     if (isMobile) {
      setOpenMobile(false);
    }
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return <HomePage />;
      case 'quran':
        return loadingSelectedSurah ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : selectedSurah ? (
          <QuranView surah={selectedSurah} />
        ) : (
          <p>Gagal memuat surah.</p>
        );
      case 'doa':
        return <DoaExplorer />;
      case 'hadist':
        return <HadistPage />;
      case 'jadwal':
        return <JadwalSholatPage />;
       case 'kalender':
        return <KalenderHijriahPage />;
      case 'kiblat':
        return <QiblaFinderPage />;
      default:
        return null;
    }
  };


  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xl font-bold font-headline">Love Al-Quran</span>
          </div>
           <SidebarTrigger className="md:hidden ml-auto" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeMenu === 'home'} onClick={() => handleMenuClick('home')}>
                <HomeIcon />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
              <Collapsible open={isQuranMenuOpen} onOpenChange={setIsQuranMenuOpen}>
                <SidebarMenuItem>
                  <div className='flex items-center w-full'>
                    <SidebarMenuButton isActive={activeMenu === 'quran'} onClick={() => handleMenuClick('quran')} className="flex-grow">
                        <BookOpen />
                        Al-Quran
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className='h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground'>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <div className="h-full max-h-[calc(100vh-250px)] overflow-y-auto">
                        {loadingSurahs ? (
                            <div className="px-2 space-y-1">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                            </div>
                        ) : (
                            <SurahList
                            surahs={surahs}
                            selectedSurahId={selectedSurahId}
                            onSelectSurah={handleSelectSurah}
                            />
                        )}
                    </div>
                </CollapsibleContent>
              </Collapsible>
            
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeMenu === 'jadwal'} onClick={() => handleMenuClick('jadwal')}>
                <Clock />
                Jadwal Sholat
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeMenu === 'kalender'} onClick={() => handleMenuClick('kalender')}>
                <CalendarDays />
                Kalender Hijriah
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeMenu === 'kiblat'} onClick={() => handleMenuClick('kiblat')}>
                <KaabaIcon />
                Arah Kiblat
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeMenu === 'doa'} onClick={() => handleMenuClick('doa')}>
                <Heart />
                Doa Sehari-hari
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeMenu === 'hadist'} onClick={() => handleMenuClick('hadist')}>
                <BookMarked />
                Hadist Muhammad SAW
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <AdSlot positionId="sidebar-footer" />
          <Button variant="ghost" asChild>
            <a href="https://github.com/firebase/genkit-nextjs-starter" target="_blank" rel="noopener noreferrer">
              <Github />
              <span>Source Code</span>
            </a>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <DateTimeDisplay />
            </div>
            <div className="flex items-center gap-4">
                <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8"
                >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </header>

        <main className="p-4 md:p-8">
          <AdSlot positionId="content-top-banner" className="mb-6" />
          {renderContent()}
        </main>
      </SidebarInset>
      <ExitIntentAd positionId="interstitial-exit" />
      {showInterstitial && (
        <InterstitialAd positionId="interstitial-mobile" onAdClosed={handleInterstitialClose} />
      )}
    </>
  );
}


export default function Home() {
  return (
    <SidebarProvider>
      <PageContent />
    </SidebarProvider>
  )
}

    