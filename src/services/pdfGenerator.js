import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateLeaseContract = (formData, site, priceBreakdown) => {
  const doc = new jsPDF();
  
  const primaryColor = [25, 118, 210]; 
  const secondaryColor = [117, 117, 117]; 
  const accentColor = [237, 108, 2]; 
  
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Boulevard World', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Leasing Management System', 20, 25);
  
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('LEASE AGREEMENT', 105, 50, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`Contract No: BW-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`, 20, 60);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 60);
  
  let yPos = 80;
  
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('PARTIES', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Lessor:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('Boulevard World Management Company', 45, yPos);
  
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Lessee:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formData.business_name}`, 45, yPos);
  
  yPos += 5;
  doc.text(`Contact: ${formData.client_name}`, 45, yPos);
  
  yPos += 5;
  doc.text(`Phone: ${formData.contact_phone}`, 45, yPos);
  
  yPos += 5;
  doc.text(`Email: ${formData.contact_email}`, 45, yPos);
  
  yPos += 20;
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPERTY DETAILS', 20, yPos);
  
  yPos += 15;
  
  const propertyData = [
    ['Site Code', site?.site_code || 'N/A'],
    ['Zone', site?.zone_name || 'N/A'],
    ['Area', `${site?.area_sqm || 0} sqm`],
    ['Usage Type', site?.usage_type || 'N/A'],
    ['Description', site?.description || 'Premium commercial space'],
    ['Location', site?.sector || 'Boulevard World Complex']
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Property Attribute', 'Details']],
    body: propertyData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 120 }
    }
  });
  
  yPos = doc.lastAutoTable.finalY + 20;
  
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('LEASE TERMS', 20, yPos);
  
  yPos += 15;
  
  const leaseTermsData = [
    ['Lease Duration', `${formData.requested_duration_months} months`],
    ['Start Date', formData.requested_start_date ? new Date(formData.requested_start_date).toLocaleDateString() : 'TBD'],
    ['End Date', formData.requested_start_date ? new Date(new Date(formData.requested_start_date).getTime() + formData.requested_duration_months * 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'TBD'],
    ['Payment Method', formData.payment_method?.replace('_', ' ').toUpperCase()],
    ['Payment Day', '1st of each month'],
    ['Security Deposit', `${(priceBreakdown?.total_amount * 2)?.toLocaleString()} SAR`]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Term', 'Details']],
    body: leaseTermsData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 120 }
    }
  });
  
  yPos = doc.lastAutoTable.finalY + 20;
  
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL DETAILS', 20, yPos);
  
  yPos += 15;
  
  const financialData = [
    ['Base Monthly Rent', `${priceBreakdown?.base_rent?.toLocaleString()} SAR`],
    ['VAT (15%)', `${priceBreakdown?.vat_amount?.toLocaleString()} SAR`],
    ['Platform Fee (2%)', `${priceBreakdown?.platform_fee?.toLocaleString()} SAR`],
    ['Total Monthly Amount', `${priceBreakdown?.total_amount?.toLocaleString()} SAR`],
    ['Total for Full Duration', `${(priceBreakdown?.total_amount * formData.requested_duration_months)?.toLocaleString()} SAR`]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Financial Component', 'Amount']],
    body: financialData,
    theme: 'grid',
    headStyles: { fillColor: accentColor, textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 60, halign: 'right' }
    }
  });
  
  doc.addPage();
  
  yPos = 30;
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS AND CONDITIONS', 20, yPos);
  
  yPos += 20;
  
  const termsAndConditions = [
    {
      title: '1. PAYMENT TERMS',
      content: 'Rent is due on the 1st of each month. Late payments after 5 days will incur a 5% late fee. All payments must be made in Saudi Riyals.'
    },
    {
      title: '2. USE OF PREMISES',
      content: 'The premises shall be used solely for the business activities specified in this agreement. Any change in use requires written approval from the lessor.'
    },
    {
      title: '3. MAINTENANCE AND REPAIRS',
      content: 'The lessee is responsible for daily maintenance and minor repairs. Major structural repairs remain the responsibility of the lessor.'
    },
    {
      title: '4. INSURANCE',
      content: 'The lessee must maintain comprehensive general liability insurance with minimum coverage of 1,000,000 SAR naming the lessor as additional insured.'
    },
    {
      title: '5. MODIFICATIONS',
      content: 'No modifications, alterations, or improvements may be made to the premises without prior written consent from the lessor.'
    },
    {
      title: '6. TERMINATION',
      content: 'Either party may terminate this lease with 30 days written notice. Early termination by lessee requires payment of penalty equal to 2 months rent.'
    },
    {
      title: '7. COMPLIANCE',
      content: 'The lessee must comply with all applicable laws, regulations, and municipal requirements including but not limited to business licensing and safety regulations.'
    },
    {
      title: '8. DISPUTE RESOLUTION',
      content: 'Any disputes arising from this agreement shall be resolved through arbitration in accordance with Saudi Arabian law.'
    }
  ];
  
  termsAndConditions.forEach((term) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(term.title, 20, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    
    const splitText = doc.splitTextToSize(term.content, 170);
    doc.text(splitText, 20, yPos);
    
    yPos += splitText.length * 5 + 10;
    
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
  });
  
  yPos += 20;
  
  if (yPos > 220) {
    doc.addPage();
    yPos = 30;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('SIGNATURES', 20, yPos);
  
  yPos += 30;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('LESSOR:', 20, yPos);
  doc.text('LESSEE:', 120, yPos);
  
  yPos += 30;
  doc.line(20, yPos, 90, yPos);
  doc.line(120, yPos, 190, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text('Boulevard World Management', 20, yPos);
  doc.text(formData.business_name, 120, yPos);
  
  yPos += 20;
  doc.text('Date: _______________', 20, yPos);
  doc.text('Date: _______________', 120, yPos);
  
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text('This document is electronically generated by Boulevard World Leasing Management System', 105, 280, { align: 'center' });
  
  const fileName = `Lease_Contract_${formData.business_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};


export const generateMonthlyReport = (reportData) => {
  const doc = new jsPDF();
  
  const primaryColor = [25, 118, 210];
  const secondaryColor = [117, 117, 117];
  
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Boulevard World', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Operations Report', 20, 25);
  
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTHLY OPERATIONS REPORT', 105, 50, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`Report Period: ${reportData.startDate} - ${reportData.endDate}`, 105, 60, { align: 'center' });
  
  let yPos = 80;
  
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY METRICS', 20, yPos);
  
  yPos += 15;
  
  const metricsData = [
    ['Total Sites', reportData.totalSites?.toString() || '0'],
    ['Occupied Sites', reportData.occupiedSites?.toString() || '0'],
    ['Occupancy Rate', `${reportData.occupancyRate?.toFixed(1) || 0}%`],
    ['Monthly Revenue', `${reportData.monthlyRevenue?.toLocaleString() || 0} SAR`],
    ['New Leases', reportData.newLeases?.toString() || '0'],
    ['Contract Renewals', reportData.renewals?.toString() || '0']
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 60, halign: 'right' }
    }
  });
  
  const fileName = `Monthly_Report_${reportData.startDate}_to_${reportData.endDate}.pdf`;
  doc.save(fileName);
};


export const generateSiteListing = (sites) => {
  const doc = new jsPDF('l'); // Landscape orientation
  
  const primaryColor = [25, 118, 210];
  
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 297, 30, 'F');
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Boulevard World', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Site Listing Report', 20, 25);
  
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('SITE LISTING REPORT', 148, 50, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(117, 117, 117);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 148, 60, { align: 'center' });
  
  let yPos = 80;
  
  const siteData = sites.map(site => [
    site.site_code,
    site.zone_name,
    site.usage_type,
    `${site.area_sqm} sqm`,
    site.status,
    `${site.current_price_per_sqm} SAR/sqm`,
    `${site.foot_traffic_score}/10`,
    `${site.readiness_index}%`
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [['Site Code', 'Zone', 'Type', 'Area', 'Status', 'Price/sqm', 'Traffic', 'Readiness']],
    body: siteData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
      6: { cellWidth: 20 },
      7: { cellWidth: 25 }
    }
  });
  
  const fileName = `Site_Listing_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default {
  generateLeaseContract,
  generateMonthlyReport,
  generateSiteListing
};