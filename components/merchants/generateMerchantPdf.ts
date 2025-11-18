import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Merchant } from "@/app/types/Merchant";

const generateMerchantPdf = async (merchant: Merchant) => {
  const doc = new jsPDF({ compress: true });
  doc.setProperties({
    title: 'CityWitty Merchant Details Report',
    subject: 'Merchant details summary',
    author: 'CityWitty Merchant Hub',
    creator: 'CityWitty Merchant Hub'
  });
  let pageWidth = doc.internal.pageSize.getWidth();
  let pageHeight = doc.internal.pageSize.getHeight();
  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const defaultTextColor: [number, number, number] = [33, 37, 41];
  const firstPageMarginTop = 50;
  const internalMarginTop = 15;
  const baseBottomMargin = 15;
  const footerHeight = 60;
  let y = 0;

  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      const filtered = value.filter(Boolean);
      return filtered.length ? filtered.join(', ') : 'Not provided';
    }
    if (typeof value === 'string') {
      return value.trim() || 'Not provided';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }
    return String(value);
  };

  const applyWatermark = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(46);
    doc.setTextColor(227, 231, 236);
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    [-70, 0, 70].forEach(offset => {
      doc.text('citywitty merchant hub', centerX, centerY + offset, { align: 'center', angle: 45 });
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...defaultTextColor);
  };

  const addHeader = async () => {
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setDrawColor(222, 231, 240);
    doc.line(0, 40, pageWidth, 40);
    doc.addImage('https://partner.citywitty.com/logo2.png', 'PNG', 15, 10, 38, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(25, 118, 210);
    doc.text('CityWitty Merchant Details Report', 60, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 128, 138);
    doc.text(`Generated ${currentDate}`, 60, 30);

    const qrSize = 28;
    const qrX = pageWidth - qrSize - 20;
    const qrY = 8;
    doc.text(`Reference ${formatValue(merchant.merchantId)}`, qrX - 12, 30, { align: 'right' });

    if (merchant.merchantId) {
      try {
        const qrDataURL = await QRCode.toDataURL(`https://www.citywitty.com/merchants/${merchant.merchantSlug}`, {
          width: 60,
          margin: 1,
          color: {
            dark: '#1976D2',
            light: '#FFFFFF'
          }
        });
        doc.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(120, 128, 138);
        doc.text('Scan to view merchant', qrX + qrSize / 2, qrY + qrSize + 6, { align: 'center' });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  };

  const ensureSpace = async (spaceNeeded = 0) => {
    if (y + spaceNeeded > pageHeight - baseBottomMargin) {
      doc.addPage();
      pageWidth = doc.internal.pageSize.getWidth();
      pageHeight = doc.internal.pageSize.getHeight();
      applyWatermark();
      y = internalMarginTop;
    }
  };

  const prepareFooterPage = () => {
    const totalPages = doc.getNumberOfPages();
    doc.setPage(totalPages);
    pageWidth = doc.internal.pageSize.getWidth();
    pageHeight = doc.internal.pageSize.getHeight();
    if (y > pageHeight - footerHeight) {
      doc.addPage();
      pageWidth = doc.internal.pageSize.getWidth();
      pageHeight = doc.internal.pageSize.getHeight();
      applyWatermark();
      y = internalMarginTop;
    }
  };

  const addSectionHeader = async (title: string) => {
    await ensureSpace(18);
    doc.setFillColor(240, 245, 252);
    doc.roundedRect(15, y, pageWidth - 30, 14, 3, 3, 'F');
    doc.setDrawColor(207, 221, 235);
    doc.roundedRect(15, y, pageWidth - 30, 14, 3, 3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(25, 118, 210);
    doc.text(title.toUpperCase(), 22, y + 9);
    y += 18;
  };

  type FieldConfig = { label: string; value: any; isImportant?: boolean };

  const addFieldRow = async (fields: FieldConfig[]) => {
    if (!fields.length) {
      return;
    }
    await ensureSpace(16);
    const columnWidth = (pageWidth - 60) / fields.length;
    let rowHeight = 0;
    fields.forEach((field, index) => {
      const columnX = 25 + index * columnWidth;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(138, 152, 168);
      doc.text(field.label.toUpperCase(), columnX, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const color = field.isImportant ? [25, 118, 210] : defaultTextColor;
      doc.setTextColor(color[0], color[1], color[2]);
      const text = formatValue(field.value);
      const lines = doc.splitTextToSize(text.replace(/[^\x00-\x7F]/g, ''), columnWidth - 6);
      lines.forEach((line: string, lineIndex: number) => {
        doc.text(line, columnX, y + 5 + lineIndex * 4);
      });
      rowHeight = Math.max(rowHeight, 5 + lines.length * 4);
    });
    y += rowHeight + 4;
    doc.setTextColor(...defaultTextColor);
  };

  const addSummaryCard = async () => {
    await ensureSpace(26);
    doc.setFillColor(247, 249, 252);
    doc.roundedRect(15, y, pageWidth - 30, 22, 4, 4, 'F');
    doc.setDrawColor(222, 231, 240);
    doc.roundedRect(15, y, pageWidth - 30, 22, 4, 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(25, 118, 210);
    doc.text(formatValue(merchant.displayName), 25, y + 9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 102, 121);
    doc.text(`Legal Name: ${formatValue(merchant.legalName)}`, 25, y + 16);
    doc.text(`Application ID: ${formatValue(merchant.merchantId)}`, pageWidth - 25, y + 9, { align: 'right' });
    doc.text(`Category: ${formatValue(merchant.category)}`, pageWidth - 25, y + 16, { align: 'right' });
    y += 30;
  };

  const addFooter = () => {
    const totalPages = doc.getNumberOfPages();
    const lastPage = totalPages;
    doc.setPage(lastPage);
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    doc.setDrawColor(222, 231, 240);
    doc.line(15, height - 64, width - 15, height - 64);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 128, 138);
    doc.text('This report will be reviewed and you will be informed via email about your merchant status.', 15, height - 56);
    doc.text('CityWitty Partner Success Team', 15, height - 44);
    doc.text('support@citywitty.com | partner.citywitty.com', 15, height - 34);
    doc.text(`Page ${lastPage} of ${totalPages}`, width - 15, height - 34, { align: 'right' });
    doc.setFontSize(7);
    doc.text('This document is confidential and intended solely for the entity to whom it is issued. Unauthorized reproduction or distribution is prohibited.', 15, height - 24, { maxWidth: width - 30 });
    doc.text('CityWitty reserves the right to verify all submitted information and may request additional documentation to authenticate merchant credentials.', 15, height - 16, { maxWidth: width - 30 });
    doc.text('Acceptance into the CityWitty Merchant Program is subject to compliance with our Merchant Terms and Privacy Policy.', 15, height - 8, { maxWidth: width - 30 });
    doc.setPage(lastPage);
    doc.setTextColor(...defaultTextColor);
  };

  const socialFields: FieldConfig[] = [
    { label: 'LinkedIn', value: merchant.socialLinks?.linkedin },
    { label: 'Twitter', value: merchant.socialLinks?.twitter },
    { label: 'YouTube', value: merchant.socialLinks?.youtube },
    { label: 'Instagram', value: merchant.socialLinks?.instagram },
    { label: 'Facebook', value: merchant.socialLinks?.facebook }
  ].filter(field => formatValue(field.value) !== 'Not provided');
  const socialRows: FieldConfig[][] = [];
  for (let index = 0; index < socialFields.length; index += 2) {
    socialRows.push(socialFields.slice(index, index + 2));
  }

  const sections: { title: string; rows: FieldConfig[][] }[] = [
    {
      title: 'Business Information',
      rows: [
        [
          { label: 'Legal Name', value: merchant.legalName, isImportant: true },
          { label: 'Display Name', value: merchant.displayName, isImportant: true }
        ],
        [
          { label: 'Merchant Slug', value: merchant.merchantSlug, isImportant: true },
          { label: 'Business Type', value: merchant.businessType }
        ],
        [
          { label: 'Profile URL (Post Verification)', value: `citywitty.com/merchants/${merchant.merchantSlug}` }
        ],
        [
          { label: 'Street Address', value: merchant.streetAddress }
        ],
        [
          { label: 'Locality', value: merchant.locality },
          { label: 'City', value: merchant.city }
        ],
        [
          { label: 'State', value: merchant.state },
          { label: 'Pincode', value: merchant.pincode },
          { label: 'Country', value: merchant.country }
        ],
        [
          { label: 'Map Location', value: merchant.mapLocation }
        ]
      ]
    },
    {
      title: 'Contact Information',
      rows: [
        [
          { label: 'Email', value: merchant.email, isImportant: true },
          { label: 'Phone', value: merchant.phone, isImportant: true }
        ],
        [
          { label: 'WhatsApp', value: merchant.whatsapp },
          { label: 'Website', value: merchant.website }
        ]
      ]
    },
    ...(socialRows.length ? [{
      title: 'Social Media',
      rows: socialRows
    }] : []),
    {
      title: 'Compliance',
      rows: [
        [
          { label: 'GST Number', value: merchant.gstNumber },
          { label: 'PAN Number', value: merchant.panNumber, isImportant: true }
        ],
        [
          { label: 'Business License', value: 'Not provided' }
        ]
      ]
    },
    {
      title: 'Business Details',
      rows: [
        [
          { label: 'Years in Business', value: merchant.yearsInBusiness },
          { label: 'Average Monthly Revenue', value: merchant.averageMonthlyRevenue }
        ],
        [
          { label: 'Business Description', value: merchant.description }
        ],
        [
          { label: 'Custom Offer', value: merchant.customOffer },
          { label: 'Ribbon Tag', value: merchant.ribbonTag }
        ],
        [
          { label: 'Minimum Order Value', value: merchant.minimumOrderValue ? `₹${merchant.minimumOrderValue}` : undefined },
          { label: 'Discount Offered', value: merchant.discountOffered }
        ]
      ]
    },
    {
      title: 'Operating Schedule',
      rows: [
        [
          { label: 'Opening Time', value: merchant.businessHours?.open },
          { label: 'Closing Time', value: merchant.businessHours?.close }
        ],
        [
          { label: 'Operating Days', value: merchant.businessHours?.days }
        ],
        [
          { label: 'Payment Methods', value: merchant.paymentMethodAccepted }
        ]
      ]
    },
    {
      title: 'Status & Visibility',
      rows: [
        [
          { label: 'Status', value: merchant.status, isImportant: true },
          { label: 'Visibility', value: merchant.visibility ? 'Visible' : 'Hidden' }
        ],
        [
          { label: 'Joined Since', value: merchant.joinedSince ? new Date(merchant.joinedSince).toLocaleDateString() : undefined },
          { label: 'Tags', value: merchant.tags }
        ],
        [
          { label: 'Suspension Reason', value: merchant.suspensionReason },
          { label: 'Onboarding Agent', value: merchant.onboardingAgent ? `${merchant.onboardingAgent.agentName} (${merchant.onboardingAgent.agentId})` : undefined }
        ],
        [
          { label: 'Verified', value: merchant.isVerified },
          { label: 'Premium Seller', value: merchant.isPremiumSeller }
        ],
        [
          { label: 'Top Merchant', value: merchant.isTopMerchant },
          { label: 'CityWitty Assured', value: merchant.citywittyAssured }
        ]
      ]
    },
    ...(merchant.purchasedPackage ? [{
      title: 'Purchased Package',
      rows: [
        [
          { label: 'Variant Name', value: merchant.purchasedPackage.variantName },
          { label: 'Purchase Date', value: new Date(merchant.purchasedPackage.purchaseDate).toLocaleDateString() }
        ],
        [
          { label: 'Expiry Date', value: new Date(merchant.purchasedPackage.expiryDate).toLocaleDateString() },
          { label: 'Transaction ID', value: merchant.purchasedPackage.transactionId }
        ]
      ]
    }] : []),
    ...(merchant.renewal ? [{
      title: 'Renewal Information',
      rows: [
        [
          { label: 'Is Renewed', value: merchant.renewal.isRenewed },
          { label: 'Renewal Date', value: merchant.renewal.renewalDate ? new Date(merchant.renewal.renewalDate).toLocaleDateString() : undefined }
        ],
        [
          { label: 'Renewal Expiry', value: merchant.renewal.renewalExpiry ? new Date(merchant.renewal.renewalExpiry).toLocaleDateString() : undefined }
        ]
      ]
    }] : []),
    ...(merchant.bankDetails ? [{
      title: 'Banking Details',
      rows: [
        [
          { label: 'Bank Name', value: merchant.bankDetails.bankName },
          { label: 'Account Holder', value: merchant.bankDetails.accountHolderName }
        ],
        [
          { label: 'Account Number', value: merchant.bankDetails.accountNumber },
          { label: 'IFSC Code', value: merchant.bankDetails.ifscCode }
        ],
        [
          { label: 'UPI ID', value: merchant.bankDetails.upiId }
        ]
      ]
    }] : []),
    {
      title: 'Limits & Earnings',
      rows: [
        [
          { label: 'Listing Limit', value: merchant.ListingLimit },
          { label: 'Added Listings', value: merchant.Addedlistings }
        ],
        [
          { label: 'Remaining Listings', value: merchant.ListingLimit && merchant.Addedlistings ? merchant.ListingLimit - merchant.Addedlistings : undefined },
          { label: 'Total Graphics', value: merchant.totalGraphics }
        ],
        [
          { label: 'Total Reels', value: merchant.totalReels },
          { label: 'Has Website', value: merchant.isWebsite }
        ],
        [
          { label: 'Total Earnings', value: merchant.totalEarnings ? `₹${merchant.totalEarnings}` : undefined }
        ]
      ]
    },
    ...(merchant.offlineDiscount && merchant.offlineDiscount.length > 0 ? [{
      title: 'Offline Discounts',
      rows: merchant.offlineDiscount.flatMap(discount => [
        [
          { label: 'Category', value: discount.category },
          { label: 'Offer Title', value: discount.offerTitle },
          { label: 'Discount Value', value: `₹${discount.discountValue}` }
        ],
        [
          { label: 'Discount Percent', value: `${discount.discountPercent}%` },
          { label: 'Status', value: discount.status },
          { label: 'Valid Upto', value: new Date(discount.validUpto).toLocaleDateString() }
        ]
      ])
    }] : []),
    ...(merchant.branchLocations && merchant.branchLocations.length > 0 ? [{
      title: 'Branch Locations',
      rows: merchant.branchLocations.map(branch => [
        { label: 'Branch Name', value: branch.branchName },
        { label: 'Address', value: `${branch.streetAddress}, ${branch.locality}, ${branch.city}, ${branch.state} ${branch.pincode}, ${branch.country}` },
        { label: 'Map Location', value: branch.mapLocation }
      ])
    }] : []),
    ...(merchant.ratings && merchant.ratings.length > 0 ? [{
      title: 'Reviews Summary',
      rows: [
        [
          { label: 'Total Reviews', value: merchant.ratings.length },
          { label: 'Average Rating', value: merchant.averageRating ? `${merchant.averageRating}/5` : undefined }
        ]
      ]
    }] : []),
    ...(merchant.ds_graphics && merchant.ds_graphics.length > 0 ? [{
      title: 'Digital Support - Graphics',
      rows: merchant.ds_graphics.map(graphic => [
        { label: 'Request Category', value: graphic.requestCategory },
        { label: 'Status', value: graphic.status },
        { label: 'Request Date', value: new Date(graphic.requestDate).toLocaleDateString() },
        { label: 'Completion Date', value: graphic.completionDate ? new Date(graphic.completionDate).toLocaleDateString() : undefined }
      ])
    }] : []),
    ...(merchant.ds_reel && merchant.ds_reel.length > 0 ? [{
      title: 'Digital Support - Reels',
      rows: merchant.ds_reel.map(reel => [
        { label: 'Subject', value: reel.subject },
        { label: 'Status', value: reel.status },
        { label: 'Request Date', value: new Date(reel.requestDate).toLocaleDateString() },
        { label: 'Completion Date', value: reel.completionDate ? new Date(reel.completionDate).toLocaleDateString() : undefined }
      ])
    }] : []),
    ...(merchant.ds_weblog && merchant.ds_weblog.length > 0 ? [{
      title: 'Digital Support - Weblogs',
      rows: merchant.ds_weblog.map(weblog => [
        { label: 'Description', value: weblog.description },
        { label: 'Status', value: weblog.status },
        { label: 'Completion Date', value: weblog.completionDate ? new Date(weblog.completionDate).toLocaleDateString() : undefined }
      ])
    }] : []),
    ...(merchant.podcastLog && merchant.podcastLog.length > 0 ? [{
      title: 'Podcast Logs',
      rows: merchant.podcastLog.map(log => [
        { label: 'Title', value: log.title },
        { label: 'Status', value: log.status },
        { label: 'Schedule Date', value: new Date(log.scheduleDate).toLocaleDateString() },
        { label: 'Complete Date', value: log.completeDate ? new Date(log.completeDate).toLocaleDateString() : undefined }
      ])
    }] : []),
    {
      title: 'Timestamps',
      rows: [
        [
          { label: 'Created At', value: new Date(merchant.createdAt).toLocaleDateString() },
          { label: 'Updated At', value: new Date(merchant.updatedAt).toLocaleDateString() }
        ]
      ]
    }
  ];

  applyWatermark();
  await addHeader();
  y = firstPageMarginTop;
  await addSummaryCard();
  for (const section of sections) {
    if (!section.rows.length) {
      continue;
    }
    await addSectionHeader(section.title);
    for (const row of section.rows) {
      await addFieldRow(row);
    }
  }
  prepareFooterPage();
  addFooter();
  doc.save(`${merchant.displayName || 'CityWitty_Merchant'}_Details.pdf`);
};

export default generateMerchantPdf;
