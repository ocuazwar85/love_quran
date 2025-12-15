'use client';

import { useState, useEffect } from 'react';

export default function DateTimeDisplay() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial date on client mount to avoid hydration mismatch
    setDate(new Date());
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!date) {
    // Render a placeholder or null on the server and during initial client render
    return (
        <div className="text-center text-sm text-muted-foreground h-6">
        </div>
    );
  }

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(date);

  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace(/\./g, ':');

  return (
    <div className="text-center text-muted-foreground">
       <div className="font-medium text-xs md:text-sm">
        <span>{formattedDate}</span>
        <span className="mx-1">/</span>
        <span className="font-bold">{formattedTime}</span>
      </div>
    </div>
  );
}
