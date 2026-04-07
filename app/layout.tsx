// app/layout.tsx (или app/layout.jsx / app/page layout)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Dock } from "@/widgets/dock";
import { StoreProvider } from "../shared/ui/providers/StoreProvider";
import { ThemeProvider } from "@/shared/ui/providers/ThemeProvider";
import icon from "@/assets/icon.svg";

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
    icons: {
        icon: icon.src,
    },
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
                    </body>
                </ThemeProvider>
            </StoreProvider>
        </html>
    );
}
