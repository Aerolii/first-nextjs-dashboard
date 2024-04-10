import React from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import { auth } from '@/auth';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const author = await auth();
  console.log('author :>> ', author);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex h-screen flex-grow flex-col">
        <div className="sticky mx-3 mt-4 flex items-center justify-end">
          <div className="flex h-10 w-10 items-center rounded-full bg-gray-50 p-3 text-center"></div>
        </div>
        <div className="flex-1 px-3 py-4 md:overflow-y-auto">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
