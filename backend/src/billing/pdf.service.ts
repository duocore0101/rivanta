import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async generateInvoicePdf(invoice: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header Background Banner
        doc.rect(0, 0, 595.28, 90).fill('#172554');

        // Hotel Brand
        doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text(invoice.hotel.name, 40, 25);
        doc.fontSize(10).font('Helvetica').text(`${invoice.hotel.address}, ${invoice.hotel.city}, ${invoice.hotel.state} | Ph: ${invoice.hotel.phone}`, 40, 52);
        doc.text(`Email: ${invoice.hotel.email} | GST / Tax ID: 27AABCR8910F1Z8`, 40, 66);

        // Document Title
        doc.fillColor('#0F766E').fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', 400, 110, { align: 'right' });
        doc.fillColor('#111827').fontSize(10).font('Helvetica');
        doc.text(`Invoice No: ${invoice.invoiceNumber}`, 400, 130, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 400, 145, { align: 'right' });
        doc.text(`Status: ${invoice.status}`, 400, 160, { align: 'right' });

        // Bill To (Guest)
        doc.fontSize(12).font('Helvetica-Bold').text('BILLED TO (GUEST):', 40, 110);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Guest: ${invoice.stay.guest.fullName}`, 40, 130);
        doc.text(`Phone: ${invoice.stay.guest.phone}`, 40, 145);
        if (invoice.stay.guest.email) doc.text(`Email: ${invoice.stay.guest.email}`, 40, 160);
        doc.text(`Room: ${invoice.stay.room.roomNumber} (${invoice.stay.room.roomType?.name || 'Room'})`, 40, 175);
        doc.text(`Check-in: ${new Date(invoice.stay.checkInTime).toLocaleDateString('en-IN')}  |  Check-out: ${new Date(invoice.stay.expectedCheckOutTime).toLocaleDateString('en-IN')}`, 40, 190);

        // Divider
        doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, 215).lineTo(555, 215).stroke();

        // Table Header
        let y = 230;
        doc.rect(40, y, 515, 24).fill('#F6F8FB');
        doc.fillColor('#172554').fontSize(9).font('Helvetica-Bold');
        doc.text('ITEM DESCRIPTION', 45, y + 7, { width: 230 });
        doc.text('QTY', 280, y + 7, { width: 35, align: 'center' });
        doc.text('RATE (₹)', 320, y + 7, { width: 65, align: 'right' });
        doc.text('TAX (₹)', 390, y + 7, { width: 65, align: 'right' });
        doc.text('TOTAL (₹)', 460, y + 7, { width: 90, align: 'right' });

        y += 28;
        doc.font('Helvetica').fontSize(9).fillColor('#111827');

        for (const item of invoice.lineItems) {
          if (y > 700) {
            doc.addPage();
            y = 40;
          }
          doc.text(item.description, 45, y, { width: 230 });
          doc.text(String(item.quantity), 280, y, { width: 35, align: 'center' });
          doc.text(Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 320, y, { width: 65, align: 'right' });
          doc.text(Number(item.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 390, y, { width: 65, align: 'right' });
          doc.text(Number(item.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 460, y, { width: 90, align: 'right' });
          y += 20;
        }

        // Totals Box
        y += 10;
        doc.strokeColor('#E2E8F0').moveTo(40, y).lineTo(555, y).stroke();
        y += 15;

        const rightLabelX = 350;
        const rightValueX = 460;

        doc.font('Helvetica').fontSize(9).fillColor('#475569');
        doc.text('Subtotal:', rightLabelX, y);
        doc.text(`₹ ${Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightValueX, y, { width: 90, align: 'right' });
        y += 16;

        doc.text('Taxes & Levies:', rightLabelX, y);
        doc.text(`₹ ${Number(invoice.taxTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightValueX, y, { width: 90, align: 'right' });
        y += 16;

        if (Number(invoice.discountTotal) > 0) {
          doc.text('Discounts:', rightLabelX, y);
          doc.text(`- ₹ ${Number(invoice.discountTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightValueX, y, { width: 90, align: 'right' });
          y += 16;
        }

        doc.font('Helvetica-Bold').fontSize(11).fillColor('#172554');
        doc.text('Grand Total:', rightLabelX, y);
        doc.text(`₹ ${Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightValueX, y, { width: 90, align: 'right' });
        y += 20;

        doc.font('Helvetica').fontSize(9).fillColor('#15803D');
        doc.text('Payments Received:', rightLabelX, y);
        doc.text(`₹ ${Number(invoice.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightValueX, y, { width: 90, align: 'right' });
        y += 16;

        doc.font('Helvetica-Bold').fontSize(11).fillColor(Number(invoice.balanceAmount) > 0 ? '#DC2626' : '#15803D');
        doc.text('Outstanding Balance:', rightLabelX, y);
        doc.text(`₹ ${Number(invoice.balanceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightValueX, y, { width: 90, align: 'right' });
        y += 35;

        // Payment Details Section
        if (invoice.payments && invoice.payments.length > 0) {
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#172554').text('PAYMENT TRANSACTIONS', 40, y);
          y += 16;
          doc.font('Helvetica').fontSize(8).fillColor('#475569');
          for (const p of invoice.payments) {
            doc.text(`• ${new Date(p.paymentDate).toLocaleDateString('en-IN')} - ${p.paymentMethod} (Ref: ${p.transactionReference || 'N/A'}) - ₹ ${Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} [${p.status}]`, 45, y);
            y += 14;
          }
        }

        // Terms & Footer
        doc.font('Helvetica').fontSize(8).fillColor('#94A3B8');
        doc.text('This is a computer-generated tax invoice issued by Rivanta Hospitality System. No physical signature required.', 40, 780, { align: 'center', width: 515 });
        doc.text('Thank you for choosing Rivanta Luxury Hotel & Suites!', 40, 792, { align: 'center', width: 515 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
