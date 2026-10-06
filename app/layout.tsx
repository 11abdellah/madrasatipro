import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MadrasatiPro | مدرستي برو — المنصة السحابية لإدارة المؤسسات التعليمية ومراكز الدعم في الجزائر",
  description: "نظام شامل وحديث لإدارة مدارس الدعم، مراكز الدروس الخصوصية، معاهد اللغات ومراكز التحضير للبكالوريا في الجزائر.",
  icons: {
    icon: "/logo-transparent.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-[#F47A3C] selection:text-white">
        {children}
      </body>
    </html>
  );
}
