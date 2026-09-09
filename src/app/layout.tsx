// src/app/layout.tsx
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Paris Traffic Dashboard",
	description: "Dashboard de prédiction du trafic routier à Paris",
};

export default function RootLayout({
									   children,
								   }: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="fr"
			className={`${geistSans.variable} ${geistMono.variable}`}
		>
		<body>{children}</body>
		</html>
	);
}
