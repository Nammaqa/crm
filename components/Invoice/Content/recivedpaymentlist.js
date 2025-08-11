"use client";
import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import {
  FiFileText,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiDownload,
  FiFilter,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiCheckCircle,
  FiCreditCard,
  FiBriefcase,
  FiPrinter
} from "react-icons/fi";
import { MdAccountBalance } from "react-icons/md";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25];

// MUI Modal style for smaller screens
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '800px',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  overflow: 'auto'
};

const PaidInvoicesTable = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("paymentDate");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [amountRange, setAmountRange] = useState({ min: null, max: null });
  const [paymentModeFilter, setPaymentModeFilter] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch paid invoices from backend API
  useEffect(() => {
    setLoading(true);
    fetch("/api/recivedpayment")
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allPaidInvoices = useMemo(() => {
    return invoices.filter(inv => inv.status === "Paid");
  }, [invoices]);

  const paymentModes = useMemo(() => {
    const modes = new Set();
    allPaidInvoices.forEach(inv => inv.paymentMode && modes.add(inv.paymentMode));
    return Array.from(modes);
  }, [allPaidInvoices]);

  const filteredInvoices = useMemo(() => {
    let filtered = [...allPaidInvoices];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          (inv.invoiceCode && inv.invoiceCode.toLowerCase().includes(s)) ||
          (inv.poNumber && inv.poNumber.toLowerCase().includes(s)) ||
          (inv.referenceNumber && inv.referenceNumber.toLowerCase().includes(s)) ||
          (inv.customer?.displayName && inv.customer.displayName.toLowerCase().includes(s)) ||
          (inv.customer?.companyName && inv.customer.companyName.toLowerCase().includes(s)) ||
          (String(inv.id).includes(s))
      );
    }
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.paymentDate || inv.invoiceDate);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        if (startDate && endDate) {
          return invDate >= startDate && invDate <= endDate;
        } else if (startDate) {
          return invDate >= startDate;
        } else if (endDate) {
          return invDate <= endDate;
        }
        return true;
      });
    }
    if (amountRange.min !== null || amountRange.max !== null) {
      filtered = filtered.filter(inv => {
        const amount = inv.amountReceived || inv.total;
        const min = amountRange.min !== null && amountRange.min !== "" ? Number(amountRange.min) : null;
        const max = amountRange.max !== null && amountRange.max !== "" ? Number(amountRange.max) : null;
        if (min !== null && max !== null) {
          return amount >= min && amount <= max;
        } else if (min !== null) {
          return amount >= min;
        } else if (max !== null) {
          return amount <= max;
        }
        return true;
      });
    }
    if (paymentModeFilter.length > 0) {
      filtered = filtered.filter(inv =>
        paymentModeFilter.includes(inv.paymentMode)
      );
    }
    return filtered;
  }, [allPaidInvoices, search, dateRange, amountRange, paymentModeFilter]);

  const sortedInvoices = useMemo(() => {
    const sorted = [...filteredInvoices];
    sorted.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === "customer") {
        aVal = a.customer?.displayName || "";
        bVal = b.customer?.displayName || "";
      }
      if (
        sortBy === "amountReceived" ||
        sortBy === "unusedAmount" ||
        sortBy === "total"
      ) {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [filteredInvoices, sortBy, sortDir]);

  const totalRecords = sortedInvoices.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedInvoices.slice(start, start + pageSize);
  }, [sortedInvoices, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to format customer address
  const formatCustomerAddress = (address) => {
    if (!address) return 'Address not available';
    
    const addressParts = [
      address.street,
      address.city,
      `${address.state || ''} ${address.pincode || ''}`.trim(),
      address.country
    ].filter(part => part && part.trim());
    
    return addressParts.length > 0 ? addressParts.join('<br>') : 'Address not available';
  };

  const convertToWords = (amount) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertHundreds = (num) => {
      let result = '';
      if (Math.floor(num / 100)) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      if (num >= 10 && num < 20) {
        result += teens[num - 10] + ' ';
      } else {
        if (Math.floor(num / 10)) {
          result += tens[Math.floor(num / 10)] + ' ';
        }
        if (num % 10) {
          result += ones[num % 10] + ' ';
        }
      }
      return result;
    };
    
    if (amount === 0) return 'Zero';
    
    let words = '';
    const crore = Math.floor(amount / 10000000);
    amount %= 10000000;
    
    if (crore) {
      words += convertHundreds(crore) + 'Crore ';
    }
    
    const lakh = Math.floor(amount / 100000);
    amount %= 100000;
    
    if (lakh) {
      words += convertHundreds(lakh) + 'Lakh ';
    }
    
    const thousand = Math.floor(amount / 1000);
    amount %= 1000;
    
    if (thousand) {
      words += convertHundreds(thousand) + 'Thousand ';
    }
    
    if (amount) {
      words += convertHundreds(amount);
    }
    
    return words.trim() + ' Only';
  };

  const resetFilters = () => {
    setDateRange({ start: null, end: null });
    setAmountRange({ min: null, max: null });
    setPaymentModeFilter([]);
    setSearch("");
  };

  const columns = [
    { key: "paymentDate", label: "Date", sortable: true, width: "w-24" },
    { key: "amountReceived", label: "Payment", sortable: true, align: "right", width: "w-24" },
    { key: "referenceNumber", label: "Reference", sortable: true, width: "w-32" },
    { key: "customer", label: "Customer", sortable: true, width: "w-40" },
    { key: "invoiceCode", label: "Invoice #", sortable: true, width: "w-28" },
    { key: "paymentMode", label: "Mode", sortable: true, width: "w-28" },
    { key: "unusedAmount", label: "Unused", sortable: true, align: "right", width: "w-24" }
  ];

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  // Convert image to base64
  const imageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // Enhanced PDF download function with logo and signature
  const handleDownloadPDF = async (invoice) => {
    try {
      // Try to get the logo as base64
      let logoBase64 = '';
      try {
        logoBase64 = await imageToBase64('/Wizzybox Logo.png');
      } catch (error) {
        console.log('Logo not found, using text fallback');
      }

      // Try to get the signature as base64
      let signatureBase64 = '';
      try {
        signatureBase64 = await imageToBase64('/karthik.png');
      } catch (error) {
        console.log('Signature not found, using text fallback');
      }

      const receiptHTML = generatePDFReceiptHTML(invoice, logoBase64, signatureBase64);
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Close window after print dialog
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to HTML download
      handleDownloadHTML(invoice);
    }
  };

  // Alternative: Direct HTML download with embedded logo and signature
  const handleDownloadHTML = async (invoice) => {
    try {
      let logoBase64 = '';
      try {
        logoBase64 = await imageToBase64('/Wizzybox Logo.png');
      } catch (error) {
        console.log('Logo not found, using text fallback');
      }

      let signatureBase64 = '';
      try {
        signatureBase64 = await imageToBase64('/karthik.png');
      } catch (error) {
        console.log('Signature not found, using text fallback');
      }

      const receiptContent = generatePDFReceiptHTML(invoice, logoBase64, signatureBase64);
      const blob = new Blob([receiptContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payment_Receipt_${invoice.invoiceCode || 'Invoice'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading HTML:', error);
    }
  };

  // Generate PDF-optimized HTML with embedded logo and signature image
  const generatePDFReceiptHTML = (invoice, logoBase64, signatureBase64) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${invoice.invoiceCode}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        
        .receipt-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-sizing: border-box;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 20px;
        }
        
        .company-info {
            flex: 1;
            max-width: 60%;
        }
        
        .company-logo-container {
            margin-bottom: 15px;
        }
        
        .company-logo-img {
            max-height: 60px;
            max-width: 200px;
            height: auto;
            width: auto;
        }
        
        .company-logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            ${logoBase64 ? 'display: none;' : 'display: block;'}
        }
        
        .company-details {
            font-size: 11px;
            color: #666;
            line-height: 1.6;
        }
        
        .company-details div {
            margin-bottom: 2px;
        }
        
        .receipt-title {
            text-align: right;
            font-size: 20px;
            font-weight: bold;
            color: #D17109;
            padding: 10px 20px;
            display: inline-block;
            margin-top: 20px;
        }
        
        .receipt-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 30px;
        }
        
        .left-section {
            flex: 1;
            max-width: 45%;
        }
        
        .right-section {
            flex: 1;
            max-width: 45%;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .received-from {
            margin-bottom: 20px;
        }
        
        .label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 8px;
            font-size: 12px;
        }
        
        .customer-name {
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .customer-address {
            color: #666;
            font-size: 11px;
            line-height: 1.6;
            border: 1px solid #e5e7eb;
            padding: 8px;
            border-radius: 4px;
            background: #f9f9f9;
        }
        
        .amount-section {
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 15px;
        }
        
        .amount-received {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .amount-value {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
        }
        
        .amount-words-section {
            margin-top: 10px;
        }
        
        .amount-words {
            font-size: 11px;
            color: #374151;
            font-style: italic;
            margin-top: 5px;
        }
        
        .payment-info-table, .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-size: 11px;
        }
        
        .payment-info-table td, .invoice-table th, .invoice-table td {
            border: 1px solid #d1d5db;
            padding: 10px 12px;
            text-align: center;
            vertical-align: top;
        }
        
        .payment-info-table td:first-child, .invoice-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            width: 30%;
        }
        
        .invoice-table th {
            background: #f3f4f6;
            font-weight: bold;
            text-align: center;
            font-size: 10px;
        }
        
        .invoice-table td:nth-child(3), 
        .invoice-table td:nth-child(4), 
        .invoice-table td:nth-child(5) {
            text-align: center;
        }
        
        .invoice-table td:nth-child(2) {
            text-align: center;
        }
        
        .payment-for-header {
            background: #e5e7eb;
            padding: 10px 12px;
            font-weight: bold;
            border: 1px solid #d1d5db;
            margin-bottom: 0;
            font-size: 12px;
        }
        
        .signature-section {
            margin-top: 60px;
            text-align: right;
            page-break-inside: avoid;
            position: relative;
        }
        
        .signature-container {
            display: inline-block;
            text-align: center;
            position: relative;
        }
        
        .signature-image {
            max-width: 200px;
            max-height: 200px;
            width: auto;
            height: auto;
            margin-bottom: 5px;
            display: block;
            ${signatureBase64 ? '' : 'display: none;'}
        }
        
        .signature-line {
            border-top: 2px solid #6b7280;
            width: 200px;
            margin: 0 auto 8px auto;
            ${signatureBase64 ? 'display: none;' : 'display: block;'}
        }
        
        .signature-label {
            font-size: 11px;
            font-weight: bold;
            color: #374151;
            margin-top: 5px;
        }
        
        @media print {
            body { 
                margin: 0; 
                padding: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .receipt-container { 
                padding: 0;
                max-width: 100%;
                width: 100%;
            }
            .no-print { 
                display: none !important; 
            }
            .header {
                page-break-inside: avoid;
            }
            .signature-section {
                page-break-inside: avoid;
            }
        }
        
        @media screen {
            .receipt-container {
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin: 20px auto;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-logo-container">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Wizzybox Logo" class="company-logo-img">` : ''}
                    <div class="company-logo-text">Wizzybox Private Limited</div>
                </div>
                <div class="company-details">
                    <div><strong>Wizzybox Private Limited</strong></div>
                    <div>Bengaluru Karnataka 560056, India</div>
                    <div>GSTIN: 29AADCW7843F1ZY</div>
                    <div>contactus@wizzybox.com</div>
                    <div>www.wizzybox.com</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div class="receipt-title">PAYMENT RECEIPT</div>
            </div>
        </div>

        <!-- Receipt Details -->
        <div class="receipt-details">
            <div class="left-section">
                <div class="received-from">
                    <div class="label">Received From</div>
                    <div class="customer-name">${invoice.customer?.companyName || invoice.customer?.displayName || 'N/A'}</div>
                    <div class="customer-address">
                        ${formatCustomerAddress(invoice.customer?.address)}
                    </div>
                </div>
            </div>
            
            <div class="right-section">
                <div class="amount-received">
                    <span class="label">Amount Received</span>
                    <span class="amount-value">${formatCurrency(invoice.amountReceived || 0)}</span>
                </div>
                <div class="amount-section">
                    <div class="amount-words-section">
                        <div class="label">Amount Received In Words</div>
                        <div class="amount-words">Indian Rupee ${convertToWords(Math.floor(invoice.amountReceived || 0))}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payment Information -->
        <table class="payment-info-table">
            <tr>
                <td>Payment Mode</td>
                <td>${invoice.paymentMode || 'Bank Transfer'}</td>
            </tr>
            <tr>
                <td>Reference Number</td>
                <td>${invoice.referenceNumber || '-'}</td>
            </tr>
            <tr>
                <td>Payment Date</td>
                <td>${invoice.paymentDate ? format(new Date(invoice.paymentDate), "dd/MM/yyyy") : '-'}</td>
            </tr>
        </table>

        <!-- Invoice Details -->
        <div class="payment-for-header">Payment for</div>
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Invoice Number</th>
                    <th>Invoice Date</th>
                    <th>Invoice Amount</th>
                    <th>Withholding Tax</th>
                    <th>Payment Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${invoice.invoiceCode || '-'}</td>
                    <td>${invoice.invoiceDate ? format(new Date(invoice.invoiceDate), "dd/MM/yyyy") : '-'}</td>
                    <td>${formatCurrency(invoice.total || 0)}</td>
                    <td>${formatCurrency(invoice.taxAmount || 0)}</td>
                    <td style="font-weight: bold;">${formatCurrency(invoice.amountReceived || 0)}</td>
                </tr>
            </tbody>
        </table>

        <!-- Enhanced Signature Section with Image -->
        <div class="signature-section">
            <div class="signature-container">
                ${signatureBase64 ? `<img src="${signatureBase64}" alt="Authorized Signature" class="signature-image">` : ''}
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signature</div>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-print when opened in new window
        window.onload = function() {
            // Small delay to ensure content is fully loaded
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`;
  };

  const Pagination = () => (
    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 text-xs bg-white rounded-b-lg">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Rows:</span>
        <select
          className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {PAGE_SIZE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="text-gray-600">
          {totalRecords === 0
            ? "No records"
            : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalRecords)} of ${totalRecords}`}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <FiChevronLeft className="w-3 h-3" />
        </button>
        <div className="flex items-center">
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (page <= 2) {
              pageNum = i + 1;
            } else if (page >= totalPages - 1) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = page - 1 + i;
            }
            return (
              <button
                key={pageNum}
                className={`w-6 h-6 rounded text-xs flex items-center justify-center font-semibold ${
                  page === pageNum
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <FiChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${selectedInvoice?.invoiceCode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 15px; font-size: 11px; }
            .receipt-content { max-width: 700px; margin: 0 auto; }
            table { font-size: 10px; }
            h1 { font-size: 16px; color: #D17109; }
            h2 { font-size: 14px; }
            h3 { font-size: 12px; }
            .customer-address { border: 1px solid #ddd; padding: 8px; background: #f9f9f9; border-radius: 4px; }
            .signature-image { max-width: 120px; max-height: 60px; }
            @media print {
              body { margin: 0; padding: 8px; font-size: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-content">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  // Payment Receipt Modal Component using MUI with enhanced address display and signature
  const PaymentReceiptModal = () => (
    <Modal
      open={showModal}
      onClose={closeModal}
      aria-labelledby="payment-receipt-modal"
      aria-describedby="payment-receipt-details"
    >
      <Box sx={modalStyle}>
        {/* Header with action buttons */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">Payment Receipt</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={handlePrint}
              startIcon={<FiPrinter />}
              sx={{ fontSize: '11px', py: 0.5, px: 1.5 }}
            >
              Print
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleDownloadPDF(selectedInvoice)}
              startIcon={<FiDownload />}
              sx={{ fontSize: '11px', py: 0.5, px: 1.5 }}
            >
              Download PDF
            </Button>
            <Button
              onClick={closeModal}
              size="small"
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <FiX size={16} />
            </Button>
          </div>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="p-4 bg-white text-xs">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4">
            {/* Left side - Logo and Company Info */}
            <div className="flex-1">
              <div className="mb-3">
                <img 
                  src="/Wizzybox Logo.png" 
                  alt="Wizzybox Logo" 
                  className="h-10 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  Wizzybox Private Limited
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-4">
                <div className="font-semibold text-gray-800 mb-1">Wizzybox Private Limited</div>
                <div>Bengaluru Karnataka 560056, India</div>
                <div>GSTIN 29AADCW7843F1ZY</div>
                <div>contactus@wizzybox.com</div>
                <div>www.wizzybox.com</div>
              </div>
            </div>

            {/* Right side - Receipt Title */}
            <div className="text-right">
              <h1 className="text-lg font-bold text-[#D17109] px-3 py-1 inline-block">
                PAYMENT RECEIPT
              </h1>
            </div>
          </div>

          {/* Receipt Details with Enhanced Address Display */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Received From</div>
                  <div className="text-xs text-gray-900 font-medium mb-2">
                    {selectedInvoice?.customer?.companyName || selectedInvoice?.customer?.displayName}
                  </div>
                  {/* Enhanced Address Display */}
                  <div className="customer-address border border-gray-300 rounded p-2 bg-gray-50">
                    {selectedInvoice?.customer?.address ? (
                      <div className="text-xs text-gray-700 space-y-1">
                        {selectedInvoice.customer.address.street && (
                          <div>{selectedInvoice.customer.address.street}</div>
                        )}
                        {selectedInvoice.customer.address.city && (
                          <div>{selectedInvoice.customer.address.city}</div>
                        )}
                        {(selectedInvoice.customer.address.state || selectedInvoice.customer.address.pincode) && (
                          <div>
                            {selectedInvoice.customer.address.state} {selectedInvoice.customer.address.pincode}
                          </div>
                        )}
                        {selectedInvoice.customer.address.country && (
                          <div>{selectedInvoice.customer.address.country}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">Address not available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Amount Details */}
              <div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-gray-700">Amount Received</span>
                      <span className="text-base font-bold text-gray-900">
                        {formatCurrency(selectedInvoice?.amountReceived || 0)}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Amount Received In Words</div>
                      <div className="text-xs text-gray-900">
                        Indian Rupee {convertToWords(Math.floor(selectedInvoice?.amountReceived || 0))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information Table */}
          <div className="mb-4">
            <table className="w-full border border-gray-300 text-xs">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-gray-700 w-1/4">
                    Payment Mode
                  </td>
                  <td className="px-3 py-2 text-gray-900">
                    {selectedInvoice?.paymentMode || 'Bank Transfer'}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-gray-700">
                    Reference Number
                  </td>
                  <td className="px-3 py-2 text-gray-900">
                    {selectedInvoice?.referenceNumber || '-'}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-gray-700">
                    Payment Date
                  </td>
                  <td className="px-3 py-2 text-gray-900">
                    {selectedInvoice?.paymentDate ? format(new Date(selectedInvoice.paymentDate), "dd/MM/yyyy") : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Invoice Details Table */}
          <div className="mb-6">
            <div className="bg-gray-100 px-3 py-1 font-semibold text-xs text-gray-700 border border-gray-300">
              Payment for
            </div>
            <table className="w-full border-l border-r border-b border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="border-r border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">Invoice Number</th>
                  <th className="border-r border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">Invoice Date</th>
                  <th className="border-r border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">Invoice Amount</th>
                  <th className="border-r border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">Withholding Tax</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">Payment Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-gray-300 px-3 py-2 text-gray-900">
                    {selectedInvoice?.invoiceCode || '-'}
                  </td>
                  <td className="border-r border-gray-300 px-3 py-2 text-gray-900">
                    {selectedInvoice?.invoiceDate ? format(new Date(selectedInvoice.invoiceDate), "dd/MM/yyyy") : '-'}
                  </td>
                  <td className="border-r border-gray-300 px-3 py-2 text-gray-900 text-right">
                    {formatCurrency(selectedInvoice?.total || 0)}
                  </td>
                  <td className="border-r border-gray-300 px-3 py-2 text-gray-900 text-right">
                    {formatCurrency(selectedInvoice?.taxAmount || 0)}
                  </td>
                  <td className="px-3 py-2 text-gray-900 text-right font-semibold">
                    {formatCurrency(selectedInvoice?.amountReceived || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Enhanced Signature Section with Image */}
          <div className="flex justify-end mt-8">
            <div className="text-center">
              <img 
                src="/karthik.png" 
                alt="Authorized Signature" 
                className="signature-image max-w-32 max-h-16 w-auto h-auto mb-2 mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="border-t-2 border-gray-400 w-32 mb-1 hidden"></div>
              <div className="text-xs font-semibold text-gray-700">Authorized Signature</div>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );

  // Main Render
  return (
    <div className="bg-gray-50 min-h-screen text-xs">
      <div className="max-w-6xl mx-auto px-3 py-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <FiCheckCircle className="text-white w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Received Payments</h1>
          </div>
          <p className="text-gray-600 text-sm">Manage and track all received payments</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-3 text-sm">Loading payments...</p>
          </div>
        ) : (
          <>
            {/* Filters Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                      showFilters
                        ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <FiFilter size={14} />
                    Filters
                  </button>
                  {showFilters && (
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
                
                {/* Search */}
                <div className="relative w-full lg:w-64">
                  <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Search payments..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Date Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={dateRange.start || ""}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <span className="text-gray-400 text-xs">to</span>
                        <input
                          type="date"
                          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={dateRange.end || ""}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Amount Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Amount Range</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Min"
                          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={amountRange.min || ""}
                          onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                        />
                        <span className="text-gray-400 text-xs">to</span>
                        <input
                          type="number"
                          placeholder="Max"
                          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={amountRange.max || ""}
                          onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Payment Mode</label>
                      <select
                        multiple
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                        value={paymentModeFilter}
                        onChange={(e) => {
                          const options = Array.from(e.target.selectedOptions, option => option.value);
                          setPaymentModeFilter(options);
                        }}
                      >
                        {paymentModes.map(mode => (
                          <option key={mode} value={mode}>{mode}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-600">
                Showing {paginatedInvoices.length} of {totalRecords} payments
              </div>
              <div className="text-xs text-gray-600">
                Total: <span className="font-semibold text-green-600">
                  {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + (inv.amountReceived || 0), 0))}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className={`px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${
                            col.align === "right" ? "text-right" : ""
                          } ${col.sortable ? "cursor-pointer group hover:bg-gray-200 transition-colors" : ""} ${col.width || ""}`}
                          onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        >
                          <div className={`flex items-center gap-1 ${col.align === "right" ? "justify-end" : ""}`}>
                            {col.label}
                            {col.sortable && (
                              <svg
                                className={`w-3 h-3 transition-transform duration-200 ${
                                  sortBy === col.key
                                    ? sortDir === "asc"
                                      ? "rotate-180 text-blue-600"
                                      : "text-blue-600"
                                    : "text-gray-400 opacity-0 group-hover:opacity-100"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 1} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <FiFileText className="h-12 w-12 text-gray-300 mb-3" />
                            <h3 className="text-base font-semibold text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-500 mb-3 text-sm">
                              {filteredInvoices.length === 0 && allPaidInvoices.length === 0
                                ? "No payment records are available."
                                : "No payments match your filters."}
                            </p>
                            {(search || dateRange.start || dateRange.end || amountRange.min || amountRange.max || paymentModeFilter.length > 0) && (
                              <button
                                onClick={resetFilters}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                              >
                                Clear filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedInvoices.map((inv, idx) => (
                        <tr
                          key={inv.id}
                          className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                          onClick={() => handleRowClick(inv)}
                        >
                          {/* Date */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <FiCalendar className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs font-medium text-gray-900">
                                {inv.paymentDate ? format(new Date(inv.paymentDate), "dd/MM/yy") : '-'}
                              </span>
                            </div>
                          </td>

                          {/* Payment Amount */}
                          <td className="px-3 py-2 whitespace-nowrap text-right">
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                              {formatCurrency(inv.amountReceived || 0)}
                            </span>
                          </td>

                          {/* Reference Number */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-xs text-gray-900 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                              {inv.referenceNumber || '-'}
                            </span>
                          </td>

                          {/* Customer Name with enhanced address preview */}
                          <td className="px-3 py-2">
                            <div className="flex items-center">
                              <FiUser className="h-3 w-3 text-gray-400 mr-1" />
                              <div>
                                <div className="text-xs font-semibold text-gray-900 truncate">
                                  {inv.customer?.displayName || '-'}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {inv.customer?.companyName || 'Individual'}
                                </div>
                                {/* Show city/state if available */}
                                {inv.customer?.address?.city && (
                                  <div className="text-xs text-gray-400 truncate">
                                    {inv.customer.address.city}{inv.customer.address.state ? `, ${inv.customer.address.state}` : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Invoice # */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <FiFileText className="h-3 w-3 text-blue-500 mr-1" />
                              <span className="text-xs font-semibold text-blue-600">
                                {inv.invoiceCode || inv.id}
                              </span>
                            </div>
                          </td>

                          {/* Payment Mode */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              {inv.paymentMode === "Bank Transfer" || inv.paymentMode === "NEFT" ? (
                                <MdAccountBalance className="h-3 w-3 text-blue-500 mr-1" />
                              ) : inv.paymentMode === "UPI" ? (
                                <FiCreditCard className="h-3 w-3 text-purple-500 mr-1" />
                              ) : (
                                <FiDollarSign className="h-3 w-3 text-green-500 mr-1" />
                              )}
                              <span className="text-xs text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                {inv.paymentMode || 'Cash'}
                              </span>
                            </div>
                          </td>

                          {/* Unused Amount */}
                          <td className="px-3 py-2 whitespace-nowrap text-right">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                              (inv.unusedAmount || 0) > 0 
                                ? 'text-orange-600 bg-orange-50' 
                                : 'text-gray-500 bg-gray-50'
                            }`}>
                              {formatCurrency(inv.unusedAmount || 0)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-2 whitespace-nowrap text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoice(inv);
                                setShowModal(true);
                              }}
                              className="inline-flex items-center px-2 py-1 border border-blue-200 text-xs font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                            >
                              <FiFileText className="h-3 w-3 mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination />
            </div>
          </>
        )}
      </div>

      {/* Payment Receipt Modal using MUI */}
      {selectedInvoice && <PaymentReceiptModal />}
    </div>
  );
};

export default PaidInvoicesTable;
