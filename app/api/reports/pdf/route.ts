import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <title>CashLedger Statement</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 15px; border: 2px solid #0f172a; }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
      .logo { width: 42px; height: 42px; background: #0f172a; color: #38bdf8; font-size: 18pt; font-weight: 900; text-align: center; line-height: 42px; border-radius: 8px; display: inline-block; }
      .title { font-size: 14pt; font-weight: 800; margin: 0; }
      .doc-title { font-size: 14pt; font-weight: 900; color: #0284c7; margin: 0; }
      .cards { display: flex; gap: 10px; margin: 15px 0; }
      .card { flex: 1; padding: 10px; text-align: center; border-radius: 6px; border: 1px solid #cbd5e1; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th { background: #0f172a; color: #fff; padding: 8px; font-size: 8pt; text-align: left; }
      td { padding: 8px; border: 1px solid #cbd5e1; font-size: 8.5pt; }
    </style>
    </head>
    <body onload="window.print()">
      <div class="header">
        <div>
          <div class="logo">CL</div>
          <div style="display:inline-block; margin-left:10px; vertical-align:top;">
            <div class="title">VERMA GENERAL STORE</div>
            <div style="font-size:8.5pt; color:#64748b;">Phone: +91 9258089101</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="doc-title">ACCOUNT STATEMENT</div>
          <div style="font-size:8.5pt; color:#64748b;">Date: ${new Date().toLocaleDateString('en-IN')}</div>
        </div>
      </div>
      <div class="cards">
        <div class="card" style="background:#f0fdf4; color:#16a34a;"><b>TOTAL CREDIT</b><br>Rs. 52,000.00</div>
        <div class="card" style="background:#fef2f2; color:#dc2626;"><b>TOTAL DEBIT</b><br>Rs. 5,200.00</div>
        <div class="card" style="background:#f0f9ff; color:#0284c7;"><b>NET BALANCE</b><br>Rs. 46,800.00 Cr</div>
      </div>
      <table>
        <thead>
          <tr><th>DATE</th><th>REMARKS</th><th>MODE</th><th style="text-align:right;">DEBIT (RS.)</th><th style="text-align:right;">CREDIT (RS.)</th></tr>
        </thead>
        <tbody>
          <tr><td>${new Date().toLocaleDateString('en-IN')}</td><td>Opening Ledger Entry</td><td>UPI</td><td style="text-align:right;">-</td><td style="text-align:right; color:#16a34a; font-weight:bold;">52,000.00</td></tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}