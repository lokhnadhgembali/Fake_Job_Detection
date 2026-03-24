import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "JobCheck AI | Fake Job Detection",
  description: "Detect fraudulent job postings instantly using advanced Machine Learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`font-sans bg-slate-50 text-slate-900 selection:bg-blue-500/30 selection:text-blue-900 min-h-screen`}>
        {/* Futuristic global background gradient */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px]" />
          <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-pink-400/10 blur-[120px]" />
        </div>

        <AuthProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
