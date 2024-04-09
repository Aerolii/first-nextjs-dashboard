import React from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex min-h-screen flex-grow flex-col ">
        <div className="px-3 py-4"></div>
        <div className="flex-1 px-3 py-4 md:overflow-y-auto">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
