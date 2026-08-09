import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Promise<NextResponse>((resolve) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 25 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="CashLedger_Statement.pdf"',
            },
          })
        );
      });

      // 1. Full Page Outer Frame Border
      doc.rect(15, 15, 565, 812).lineWidth(1.5).strokeColor('#0f172a').stroke();

      // 2. Logo Badge ("CL")
      doc.roundedRect(30, 30, 44, 44, 8).fill('#0f172a');
      doc.fillColor('#38bdf8').fontSize(20).font('Helvetica-Bold').text('CL', 39, 42);

      // 3. Company Details
      doc.fillColor('#0f172a').fontSize(15).font('Helvetica-Bold').text('VERMA GENERAL STORE', 85, 33);
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text('Phone: +91 9258089101 | Main Market, Sector 62', 85, 52);

      // 4. Header Title
      doc.fillColor('#0284c7').fontSize(14).font('Helvetica-Bold').text('ACCOUNT STATEMENT', 360, 33, { align: 'right' });
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 360, 50, { align: 'right' });

      // Divider Line
      doc.moveTo(30, 80).lineTo(565, 80).lineWidth(1).strokeColor('#cbd5e1').stroke();

      // 5. Summary Metric Cards
      let y = 95;
      doc.roundedRect(30, y, 170, 45, 5).fillAndStroke('#f0fdf4', '#bbf7d0');
      doc.fillColor('#15803d').fontSize(7.5).font('Helvetica-Bold').text('TOTAL CREDIT', 40, y + 7);
      doc.fillColor('#16a34a').fontSize(11.5).text('Rs. 52,000.00', 40, y + 22);

      doc.roundedRect(212, y, 170, 45, 5).fillAndStroke('#fef2f2', '#fecaca');
      doc.fillColor('#b91c1c').fontSize(7.5).font('Helvetica-Bold').text('TOTAL DEBIT', 222, y + 7);
      doc.fillColor('#dc2626').fontSize(11.5).text('Rs. 5,200.00', 222, y + 22);

      doc.roundedRect(395, y, 170, 45, 5).fillAndStroke('#f0f9ff', '#bae6fd');
      doc.fillColor('#0369a1').fontSize(7.5).font('Helvetica-Bold').text('NET BALANCE DUE', 405, y + 7);
      doc.fillColor('#0284c7').fontSize(11.5).text('Rs. 46,800.00 Cr', 405, y + 22);

      // 6. Data Table Header
      y = 152;
      doc.rect(30, y, 535, 20).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('DATE', 38, y + 5);
      doc.text('PARTICULARS / REMARKS', 115, y + 5);
      doc.text('MODE', 310, y + 5);
      doc.text('DEBIT (RS.)', 380, y + 5, { width: 85, align: 'right' });
      doc.text('CREDIT (RS.)', 470, y + 5, { width: 85, align: 'right' });

      // Table Content Rows
      y += 20;
      doc.font('Helvetica').fontSize(8.5);

      // Row 1
      doc.rect(30, y, 535, 20).fillAndStroke('#ffffff', '#cbd5e1');
      doc.fillColor('#334155').text(new Date().toLocaleDateString('en-IN'), 38, y + 5);
      doc.fillColor('#0f172a').font('Helvetica-Bold').text('Ganna payment received', 115, y + 5);
      doc.font('Helvetica').fillColor('#334155').text('UPI', 310, y + 5);
      doc.fillColor('#94a3b8').text('-', 380, y + 5, { width: 85, align: 'right' });
      doc.fillColor('#16a34a').font('Helvetica-Bold').text('50,000.00', 470, y + 5, { width: 85, align: 'right' });

      // Row 2
      y += 20;
      doc.rect(30, y, 535, 20).fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#334155').text(new Date().toLocaleDateString('en-IN'), 38, y + 5);
      doc.fillColor('#0f172a').font('Helvetica-Bold').text('Opening Ledger Entry', 115, y + 5);
      doc.font('Helvetica').fillColor('#334155').text('CASH', 310, y + 5);
      doc.fillColor('#94a3b8').text('-', 380, y + 5, { width: 85, align: 'right' });
      doc.fillColor('#16a34a').font('Helvetica-Bold').text('2,000.00', 470, y + 5, { width: 85, align: 'right' });

      // Footer
      doc.fontSize(8).fillColor('#64748b').font('Helvetica').text('* Computer Generated Statement. Powered by CashLedger Engine', 30, 795);
      doc.moveTo(425, 790).lineTo(565, 790).lineWidth(0.8).strokeColor('#0f172a').stroke();
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text('Authorized Signatory', 425, 794, { width: 140, align: 'center' });

      doc.end();
    } catch (error: any) {
      resolve(NextResponse.json({ error: error.message }, { status: 500 }));
    }
  });
}