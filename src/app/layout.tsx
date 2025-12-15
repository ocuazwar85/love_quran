import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'Love Al-Quran',
  description: 'Aplikasi Alquran, Jadwal Sholat, Doa dan Hadist.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Noto+Naskh+Arabic:wght@400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <FirebaseClientProvider>
                {children}
                <Toaster />
            </FirebaseClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
