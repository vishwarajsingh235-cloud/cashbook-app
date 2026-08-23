import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CashLedger - Business Cashbook & Invoicing",
  description: "Manage daily cashbook, customers, and tax invoices easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}