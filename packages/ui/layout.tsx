import { ReactNode } from 'react';

interface SharedLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  appName: 'SmartMeet' | 'SmartDoc' | 'SmartCode';
  fontClass?: string;
}

export function SharedLayout({ children, title, description, appName, fontClass = 'font-sans' }: SharedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">{appName}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className={`container mx-auto px-4 py-6 ${fontClass}`}>
        {children}
      </main>

      {/* App Footer */}
      <footer className="bg-white border-t mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {appName}. All rights reserved.</p>
          <p className="mt-1">Powered by SmartX AI Platform</p>
        </div>
      </footer>
    </div>
  );
}
