'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Locate, AlertTriangle, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getQiblaDirection } from './action';
import { KaabaIcon } from '@/components/icons/kaaba';

// Helper to request permission for Device Orientation events on iOS 13+
const requestDeviceOrientationPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error("Error requesting device orientation permission:", error);
            return false;
        }
    }
    // For non-iOS 13+ browsers, permission is not required
    return true;
};


export default function QiblaFinderPage() {
    const [qiblaDirection, setQiblaDirection] = React.useState<number | null>(null);
    const [deviceHeading, setDeviceHeading] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [permissionDenied, setPermissionDenied] = React.useState(false);
    const [isInteracting, setIsInteracting] = React.useState(false);

    const fetchQibla = React.useCallback((latitude: number, longitude: number) => {
        setIsLoading(true);
        setError(null);
        getQiblaDirection(latitude, longitude)
            .then(data => {
                setQiblaDirection(data.direction);
            })
            .catch(err => {
                setError(err.message || 'Gagal mengambil data arah kiblat.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleInitialInteraction = async () => {
        setIsInteracting(true);

        const hasPermission = await requestDeviceOrientationPermission();
        if (!hasPermission) {
            setError("Izin untuk mengakses orientasi perangkat ditolak. Fitur kompas tidak akan berfungsi.");
            setPermissionDenied(true);
            setIsLoading(false);
            return;
        }

        if (!navigator.geolocation) {
            setError("Browser Anda tidak mendukung Geolocation.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            position => {
                fetchQibla(position.coords.latitude, position.coords.longitude);
                setPermissionDenied(false);
            },
            err => {
                if (err.code === err.PERMISSION_DENIED) {
                    setError("Akses lokasi ditolak. Fitur ini memerlukan lokasi untuk berfungsi.");
                    setPermissionDenied(true);
                } else {
                    setError("Gagal mendapatkan lokasi Anda.");
                }
                setIsLoading(false);
            }
        );
    };

    React.useEffect(() => {
        if (!isInteracting) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null) {
                // event.alpha is the direction the device is facing, in degrees
                // 0 is North, 90 is East, 180 is South, 270 is West.
                setDeviceHeading(360 - event.alpha);
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [isInteracting]);

    const compassRotation = deviceHeading !== null ? deviceHeading : 0;
    const qiblaRotation = qiblaDirection !== null ? qiblaDirection : 0;
    const kaabaRotation = qiblaRotation - compassRotation;


    const renderContent = () => {
        if (!isInteracting) {
            return (
                <div className="text-center space-y-4">
                     <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                        <Compass className="w-full h-full text-muted-foreground/30" />
                        <div className="absolute w-full h-full flex items-center justify-center">
                            <KaabaIcon className="w-12 h-12 text-muted-foreground/50"/>
                        </div>
                     </div>
                    <h2 className="text-xl font-semibold">Tentukan Arah Kiblat</h2>
                    <p className="text-muted-foreground">Klik tombol di bawah untuk meminta izin akses lokasi dan sensor perangkat Anda.</p>
                    <Button onClick={handleInitialInteraction} size="lg">
                        <Locate className="mr-2" /> Mulai
                    </Button>
                </div>
            )
        }
        
        if (isLoading) {
            return (
                <div className="space-y-4 flex flex-col items-center">
                     <Skeleton className="w-64 h-64 rounded-full" />
                     <Skeleton className="h-8 w-48" />
                     <Skeleton className="h-6 w-64" />
                </div>
            )
        }

        if (error) {
            return (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Terjadi Kesalahan</AlertTitle>
                    <AlertDescription>
                        {error}
                        {permissionDenied && (
                            <Button onClick={handleInitialInteraction} className="mt-4">
                                Coba Lagi & Izinkan Akses
                            </Button>
                        )}
                    </AlertDescription>
                </Alert>
            )
        }

        return (
            <div className="text-center space-y-4 flex flex-col items-center">
                <div className="relative w-64 h-64">
                    {/* Compass Background */}
                     <div 
                        className="absolute inset-0 rounded-full bg-card border-8 border-border shadow-inner transition-transform duration-200"
                        style={{ transform: `rotate(${compassRotation}deg)`}}
                    >
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-xl">N</div>
                         <div className="absolute -bottom-6 left-1/2 -translate-x-1_2 font-bold text-xl">S</div>
                         <div className="absolute -left-6 top-1/2 -translate-y-1/2 font-bold text-xl">W</div>
                         <div className="absolute -right-6 top-1/2 -translate-y-1/2 font-bold text-xl">E</div>
                    </div>

                    {/* Kaaba Direction Pointer */}
                    <div 
                        className="absolute inset-0 flex justify-center transition-transform duration-200"
                        style={{ transform: `rotate(${kaabaRotation}deg)`}}
                    >
                        <div className="w-1 h-32 bg-primary rounded-full origin-bottom" style={{transform: 'translateY(-1.5rem)'}}></div>
                        <KaabaIcon className="absolute top-0 w-10 h-10 text-primary-foreground bg-primary rounded-full p-1" />
                    </div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground"></div>
                     </div>
                </div>
                 {qiblaDirection !== null ? (
                    <div className="text-center">
                        <p className="font-semibold text-lg text-foreground">Arah Kiblat</p>
                        <p className="text-3xl font-bold text-primary">{qiblaDirection.toFixed(2)}&deg;</p>
                    </div>
                 ) : null}
            </div>
        )

    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Arah Kiblat</h1>
                <p className="text-muted-foreground mt-1">
                    Gunakan kompas untuk menemukan arah Kiblat dari lokasi Anda.
                </p>
            </div>

             <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-6 md:p-8">
                   {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}
