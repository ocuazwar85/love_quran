'use client';

import { Doa } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

type DoaCardProps = {
  doa: Doa;
  onCardClick: () => void;
};

export default function DoaCard({ doa, onCardClick }: DoaCardProps) {
  return (
    <Card 
      onClick={onCardClick}
      className="flex flex-col cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl bg-card/50 hover:bg-card"
    >
      <CardHeader>
        <CardTitle className="font-headline text-xl leading-tight line-clamp-1">{doa.doa}</CardTitle>
        {doa.kategori && <Badge variant="secondary" className="mt-2 w-fit">{doa.kategori}</Badge>}
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
         <p className="text-right font-arabic text-lg line-clamp-2" dir="rtl">{doa.ayat}</p>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {doa.artinya}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
            <BookOpen className="mr-2 h-4 w-4"/>
            Baca Selengkapnya
        </Button>
      </CardFooter>
    </Card>
  );
}
