import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Blog App",
  description: "Blog App Microservice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Navbar />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
