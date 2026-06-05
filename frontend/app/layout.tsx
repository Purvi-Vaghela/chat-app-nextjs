import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ChatApp - Real-Time Messaging",
  description: "WhatsApp-inspired real-time chat application with 1-1 messaging and groups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full antialiased bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary">
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              className: 'dark:bg-dark-sidebar dark:text-dark-text-primary',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
