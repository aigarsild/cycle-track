import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import SignOutButton from '@/components/SignOutButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cycle Track - Bike Service Management',
  description: 'A comprehensive solution for bicycle service shops',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="bg-navy text-white shadow-md">
              <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <a href="/" className="text-xl font-bold flex items-center">
                  🚲 Cycle Track
                </a>
                
                <div className="flex items-center space-x-6">
                  <nav className="hidden md:flex space-x-6">
                    <a href="/dashboard" className="hover:text-blue-light transition-colors">
                      Dashboard
                    </a>
                    <a href="/service-inquiry" className="hover:text-blue-light transition-colors">
                      Service Inquiry
                    </a>
                    <a href="/workshop" className="hover:text-blue-light transition-colors">
                      Workshop
                    </a>
                    <a href="/inventory" className="hover:text-blue-light transition-colors">
                      Inventory
                    </a>
                    <a href="/customers" className="hover:text-blue-light transition-colors">
                      Customers
                    </a>
                  </nav>
                  
                  <SignOutButton />
                </div>
                
                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button className="text-white focus:outline-none">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>
            
            <main className="flex-1 bg-white">
              {children}
            </main>
            
            <footer className="bg-dark text-white py-4">
              <div className="container mx-auto px-4">
                <p className="text-center text-sm">© 2025 Cycle Track. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}