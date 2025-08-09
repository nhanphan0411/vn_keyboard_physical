import type { Metadata } from "next";
// Remove Geist imports and import Epilogue instead
import { Epilogue } from "next/font/google";
import "./globals.css";

// Define the Epilogue font and specify the weights you want to use
const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "700"], // Use the weights you imported
});

export const metadata: Metadata = {
  title: "Viet Syllable Keyboard",
  description: "A keyboard for typing Vietnamese syllables",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${epilogue.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
