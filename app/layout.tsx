import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Ledger of Loss | Privacy-Focused Data Exposure Navigator',
  description: 'Track data exposures, calculate transparent risk scores, and navigate recovery playbooks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-sky-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <p>Ledger of Loss &bull; DBMS Level 3 Project (PostgreSQL + MongoDB) &bull; Built with Next.js</p>
        </footer>
      </body>
    </html>
  );
}
