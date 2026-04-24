import type { Metadata } from 'next';
import './globals.css';
import Chatbot from '@/components/Chatbot';

export const metadata: Metadata = {
  title: 'EcoCycle AI – Regenerative Waste Management',
  description:
    'EcoCycle AI uses intelligent computer vision to identify, categorize, and monetize recyclable materials, creating a circular economy for everyone.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter bg-beige text-on-surface antialiased">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
