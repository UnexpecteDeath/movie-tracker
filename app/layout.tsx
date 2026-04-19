import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Dock } from "@/widgets/dock";
import { StoreProvider } from "@/shared/ui/providers/StoreProvider";
import { ThemeProvider } from "@/shared/ui/providers/ThemeProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Our Cinema",
    description: "Personal movie tracker",
    manifest: "/manifest.webmanifest",
    icons: {
        icon: [
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Our Cinema",
    },
};

export const viewport: Viewport = {
    themeColor: "#050816",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
            <StoreProvider>
                <ThemeProvider>
                    <body
                        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                    >
                        <main className="app-root">{children}</main>
                        <Dock />
                        <Toaster
                            expand={true}
                            position="top-right"
                            richColors
                        />
                    </body>
                </ThemeProvider>
            </StoreProvider>
        </html>
    );
}
