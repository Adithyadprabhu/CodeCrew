import { NextResponse } from 'next/server';

// Simulated "database" of base upload counts per day
const BASE_DATA = [
  { time: 'Mon', base: 8 },
  { time: 'Tue', base: 14 },
  { time: 'Wed', base: 10 },
  { time: 'Thu', base: 18 },
  { time: 'Fri', base: 22 },
  { time: 'Sat', base: 15 },
  { time: 'Sun', base: 9 },
];

// Simulated daily + monthly views
const MONTHLY_DATA = [
  { time: 'Jan', base: 32 },
  { time: 'Feb', base: 45 },
  { time: 'Mar', base: 38 },
  { time: 'Apr', base: 60 },
  { time: 'May', base: 55 },
  { time: 'Jun', base: 72 },
  { time: 'Jul', base: 68 },
  { time: 'Aug', base: 80 },
  { time: 'Sep', base: 74 },
  { time: 'Oct', base: 88 },
  { time: 'Nov', base: 95 },
  { time: 'Dec', base: 110 },
];

// Simulated hourly data for "daily" view (last 24 hours)
function getDailyData() {
  const now = new Date();
  return Array.from({ length: 20 }, (_, i) => {
    const d = new Date(now.getTime() - (19 - i) * 60 * 60 * 1000);
    const hour = d.getHours();
    const label = `${hour.toString().padStart(2, '0')}:00`;
    const uploads = Math.floor(Math.random() * 8 + 1) + (hour >= 9 && hour <= 18 ? 5 : 0);
    return { time: label, uploads };
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'weekly';

  let data;

  if (view === 'daily') {
    data = getDailyData();
  } else if (view === 'monthly') {
    data = MONTHLY_DATA.map(d => ({
      time: d.time,
      uploads: d.base + Math.floor(Math.random() * 15 - 7),
    }));
  } else {
    // weekly — add small random fluctuation each poll to simulate live changes
    data = BASE_DATA.map(d => ({
      time: d.time,
      uploads: Math.max(1, d.base + Math.floor(Math.random() * 7 - 3)),
    }));
  }

  return NextResponse.json(data);
}
