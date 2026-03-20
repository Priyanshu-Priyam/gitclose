import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitClose — Close Dashboard",
  description: "Git-native monthly close platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">
        <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-gray-950 text-sm">
                GC
              </div>
              <span className="text-lg font-semibold tracking-tight">GitClose</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/" className="text-gray-300 hover:text-white transition">
                Dashboard
              </a>
              <a href="/audit" className="text-gray-300 hover:text-white transition">
                Audit Trail
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
