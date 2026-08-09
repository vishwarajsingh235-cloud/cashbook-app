import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date().toLocaleDateString('en-IN');
    
    // Pure Vector-Style Printable HTML with Direct Download Headers
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="utf-8">
      <title>CashLedger_Statement</title>
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 0; padding: 15px; border: 2px solid #0f172a; box-sizing: border-box; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
        .logo { width: 42px; height: 42px; background: #0f172a; color: #38bdf8; font-size: 18pt; font-weight: 900; text-align: center; line-height: 42px; border-radius: 8px; display: inline-block; }
        .title { font-size: 14pt; font-weight: 800; margin: 0; text-transform: uppercase; }
        .sub { font-size: 8.5pt; color: #64748b; font-weight: 600; }
        .doc-title { font-size: 14pt; font-weight: 900; color: #0284c7; margin: 0; text-align: right; }
        
        .cards { display: flex; gap: 10px; margin: 15px 0; }
        .card { flex: 1; padding: 10px; text-align: center; border-radius: 6px; border: 1px solid #cbd5e1; }
        .card-cr { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
        .card-dr { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
        .card-bal { background: #f0f9ff; border-color: #bae6fd; color: #0284c7; }
        .card-lbl { font-size: 7.5pt; font-weight: 800; text-transform: uppercase; }
        .card-val { font-size: 13pt; font-weight: 800; margin-top: 2px; }

        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #0f172a; color: #fff; padding: 8px; font-size: 8pt; text-align: left; border: 1px solid #0f172a; }
        td { padding: 8px; border: 1px solid #cbd5e1; font-size: 8.5pt; }
        
        .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
        .sign { border-top: 1px solid #0f172a; width: 140px; text-align: center; padding-top: 3px; font-weight: bold; font-size: 8.5pt; }
      </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">CL</div>
            <div style="display:inline-block; margin-left:10px; vertical-align:top;">
              <div class="title">VERMA GENERAL STORE</div>
              <div class="sub">Phone: +91 9258089101 | Main Market, Sector 62</div>
            </div>
          </div>
          <div>
            <div class="doc-title">ACCOUNT STATEMENT</div>
            <div class="sub" style="text-align: right;">Date: ${today}</div>
          </div>
        </div>

        <div class="cards">
          <div class="card card-cr">
            <div class="card-lbl">TOTAL CREDIT</div>
            <div class="card-val">Rs. 52,000.00</div>
          </div>
          <div class="card card-dr">
            <div class="card-lbl">TOTAL DEBIT</div>
            <div class="card-val">Rs. 5,200.00</div>
          </div>
          <div class="card card-bal">
            <div class="card-lbl">NET BALANCE</div>
            <div class="card-val">Rs. 46,800.00 Cr</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 15%;">DATE</th>
              <th style="width: 45%;">PARTICULARS / REMARKS</th>
              <th style="width: 12%;">MODE</th>
              <th style="width: 14%; text-align: right;">DEBIT (RS.)</th>
              <th style="width: 14%; text-align: right;">CREDIT (RS.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${today}</td>
              <td><b>Ganna payment received</b></td>
              <td>UPI</td>
              <td style="text-align: right; color: #cbd5e1;">-</td>
              <td style="text-align: right; color: #16a34a; font-weight: bold;">50,000.00</td>
            </tr>
            <tr>
              <td>${today}</td>
              <td><b>Opening Ledger Entry</b></td>
              <td>CASH</td>
              <td style="text-align: right; color: #cbd5e1;">-</td>
              <td style="text-align: right; color: #16a34a; font-weight: bold;">2,000.00</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div style="font-size: 8pt; color: #64748b;">
            * Computer Generated Statement<br>
            * Powered by <b>CashLedger Engine</b>
          </div>
          <div class="sign">Authorized Signatory</div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="CashLedger_Statement.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}