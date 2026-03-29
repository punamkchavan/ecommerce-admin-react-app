import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generateInvoice = (order) => {
  if (!order) return;

  const doc = new jsPDF();
  
  const orderIdRaw = order.orderNumber || order.id.slice(-8).toUpperCase();
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : '-';

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('E-COMMERCE ADMIN', 14, 30);
  doc.text('shrivardhan, Maharashtra', 14, 35);
  doc.text('business@ecommerce.com', 14, 40);


  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${orderIdRaw}`, 130, 30);
  doc.text(`Issue Date: ${orderDate}`, 130, 35);
  if (order.paymentId) {
    doc.text(`Transaction ID: ${order.paymentId}`, 130, 40);
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', 14, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerName || 'N/A', 14, 62);
  doc.text(order.customerEmail || 'N/A', 14, 67);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Shipped To:', 110, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const ship = order.shippingAddress || {};
  doc.text(ship.name || order.customerName || '', 110, 62);
  doc.text(ship.street || '', 110, 67);
  doc.text(`${ship.city || ''}, ${ship.state || ''} ${ship.zip || ''}`, 110, 72);
  doc.text(`Phone: ${ship.phone || 'N/A'}`, 110, 77);

  const tableData = (order.items || []).map(item => [
    item.name,
    item.quantity.toString(),
    `INR ${Number(item.price || 0).toLocaleString()}`,
    `INR ${(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Item Description', 'Quantity', 'Unit Price', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [37, 99, 235], 
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });

  const finalY = doc.lastAutoTable.finalY || 90;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryX = 130;
  
  doc.text('Subtotal:', summaryX, finalY + 15);
  doc.text(`INR ${Number(order.totalAmount || 0).toLocaleString()}`, 196, finalY + 15, { align: 'right' });
  
  doc.text('Shipping:', summaryX, finalY + 22);
  doc.text('FREE', 196, finalY + 22, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(summaryX, finalY + 26, 196, finalY + 26);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', summaryX, finalY + 34);
  doc.text(`INR ${Number(order.totalAmount || 0).toLocaleString()}`, 196, finalY + 34, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Order Status: ${order.status?.toUpperCase()}`, 14, finalY + 15);
  doc.text(`Payment Status: ${order.paymentStatus?.toUpperCase()}`, 14, finalY + 20);

  doc.save(`Invoice-INV${orderIdRaw}.pdf`);
};

export default generateInvoice;
