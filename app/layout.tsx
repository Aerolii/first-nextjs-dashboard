import '@/app/ui/global.css';
import { inder } from '@/app/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inder.className} antialiased`}>{children}</body>
    </html>
  );
}
