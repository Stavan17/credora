import jsPDF from 'jspdf';

export const exportApplicationToPDF = (application, user) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const textStr = String(text); // Ensure text is always a string
    const lines = doc.splitTextToSize(textStr, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.4);
  };

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Credora Loan Application', margin, 25);
  
  yPos = 50;

  // Application Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Application Details', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const details = [
    ['Application ID', `#${application.id}`],
    ['Applicant Name', user?.full_name || 'N/A'],
    ['Email', user?.email || 'N/A'],
    ['Status', application.status || 'PENDING'],
    ['Date', application.created_at ? new Date(application.created_at).toLocaleDateString() : 'N/A'],
  ];

  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 60, yPos);
    yPos += 7;
  });

  yPos += 5;

  // Financial Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Information', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const financial = [
    ['Annual Income', `₹${(application.income_annum || 0).toLocaleString('en-IN')}`],
    ['Loan Amount', `₹${(application.loan_amount || 0).toLocaleString('en-IN')}`],
    ['Loan Term', `${application.loan_term || 0} years`],
    ['CIBIL Score', application.cibil_score ? String(application.cibil_score) : 'N/A'],
  ];

  financial.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 60, yPos);
    yPos += 7;
  });

  yPos += 5;

  // Asset Information
  if (application.residential_assets_value || application.commercial_assets_value || 
      application.luxury_assets_value || application.bank_asset_value) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Asset Information', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const assets = [
      ['Residential Assets', `₹${(application.residential_assets_value || 0).toLocaleString('en-IN')}`],
      ['Commercial Assets', `₹${(application.commercial_assets_value || 0).toLocaleString('en-IN')}`],
      ['Luxury Assets', `₹${(application.luxury_assets_value || 0).toLocaleString('en-IN')}`],
      ['Bank Assets', `₹${(application.bank_asset_value || 0).toLocaleString('en-IN')}`],
    ];

    assets.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), margin + 60, yPos);
      yPos += 7;
    });

    yPos += 5;
  }

  // AI Analysis Results
  if (application.approval_probability !== null && application.approval_probability !== undefined) {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Analysis Results', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const approvalPercent = (application.approval_probability * 100).toFixed(2);
    doc.setFont('helvetica', 'bold');
    doc.text('Approval Probability:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${approvalPercent}%`, margin + 60, yPos);
    yPos += 7;

    if (application.fraud_score !== null && application.fraud_score !== undefined) {
      const fraudPercent = (application.fraud_score * 100).toFixed(2);
      doc.setFont('helvetica', 'bold');
      doc.text('Fraud Risk Score:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${fraudPercent}%`, margin + 60, yPos);
      yPos += 7;
    }

    if (application.final_decision) {
      doc.setFont('helvetica', 'bold');
      doc.text('AI Recommendation:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(String(application.final_decision), margin + 60, yPos);
      yPos += 7;
    }
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated by Credora`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`credora-application-${application.id}.pdf`);
};

export const exportAnalyticsToPDF = (analyticsData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Credora Analytics Report', margin, 25);
  
  yPos = 50;

  // Summary Statistics
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const stats = [
    ['Total Applications', analyticsData.total || 0],
    ['Approved', analyticsData.approved || 0],
    ['Rejected', analyticsData.rejected || 0],
    ['Pending Review', analyticsData.pending || 0],
    ['Approval Rate', `${((analyticsData.approved || 0) / (analyticsData.total || 1) * 100).toFixed(2)}%`],
  ];

  stats.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 60, yPos);
    yPos += 7;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString()} | Credora Analytics`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`credora-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
};

