import localFont from 'next/font/local';
import './globals.css';

// ดึงไฟล์ฟอนต์จากเครื่องเรามาใช้
const customFont = localFont({
  src: '../public/fonts/fonttintinver2update.ttf', // เปลี่ยนชื่อไฟล์ตรงนี้ให้ตรงกับของคุณ
  variable: '--font-mali', // เราใช้ชื่อตัวแปรเดิม CSS จะได้ไม่ต้องแก้
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={customFont.variable}>
      <body className="font-mali bg-cute-bg text-cute-dark">
        {children}
      </body>
    </html>
  );
}