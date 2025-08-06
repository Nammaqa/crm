"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { 
  FiFileText, 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight,
  FiX,
  FiDownload,
  FiPrinter
} from "react-icons/fi";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Demo data for testing
const DEMO_INVOICES = [
  {
    id: "INV-000007",
    invoiceCode: "INV-000007",
    referenceNumber: "REF-2025-001",
    invoiceDate: "2025-08-04T10:30:00Z",
    customer: {
      displayName: "VESTIGE MARKETING PRIVATE LIMITED",
      companyName: "VESTIGE MARKETING PRIVATE LIMITED",
      address: "PLOT NO.11, SY NO.6/1 BERHAMUR COLONY, BIDAR, Karnataka, 585403, India",
      email: "contact@vestige.com"
    },
    poNumber: "PO-2025-001",
    paymentMode: "Bank Transfer",
    total: 50000,
    amountReceived: 46700,
    balancedDue: 0,
    status: "Paid"
  },
  {
    id: "INV-000008",
    invoiceCode: "INV-000008",
    referenceNumber: "REF-2025-002",
    invoiceDate: "2025-08-05T14:15:00Z",
    customer: {
      displayName: "Tech Solutions Pvt Ltd",
      companyName: "Tech Solutions Private Limited",
      address: "Block A, Tech Park, Whitefield, Bangalore, Karnataka, 560066, India",
      email: "billing@techsolutions.com"
    },
    poNumber: "PO-2025-002",
    paymentMode: "NEFT",
    total: 75000,
    amountReceived: 71250,
    balancedDue: 0,
    status: "Paid"
  },
  {
    id: "INV-000009",
    invoiceCode: "INV-000009",
    referenceNumber: "REF-2025-003",
    invoiceDate: "2025-08-06T09:45:00Z",
    customer: {
      displayName: "Global Industries Ltd",
      companyName: "Global Industries Limited",
      address: "Industrial Area, Phase 2, Gurgaon, Haryana, 122016, India",
      email: "accounts@globalindustries.com"
    },
    poNumber: "PO-2025-003",
    paymentMode: "UPI",
    total: 25000,
    amountReceived: 23750,
    balancedDue: 0,
    status: "Paid"
  },
  // Adding some non-paid invoices to test filtering
  {
    id: "INV-000010",
    invoiceCode: "INV-000010",
    referenceNumber: "REF-2025-004",
    invoiceDate: "2025-08-06T16:20:00Z",
    customer: {
      displayName: "Pending Corp",
      companyName: "Pending Corporation",
      address: "123 Business Street, Mumbai, Maharashtra, 400001, India",
      email: "finance@pendingcorp.com"
    },
    poNumber: "PO-2025-004",
    paymentMode: "Bank Transfer",
    total: 30000,
    amountReceived: 0,
    balancedDue: 30000,
    status: "Pending"
  }
];

const InvoiceListTable = ({ invoices = [] }) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("invoiceDate");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use demo data if no invoices provided
  const allInvoices = invoices.length > 0 ? invoices : DEMO_INVOICES;

  // Filter only paid invoices
  const paidInvoices = useMemo(() => {
    return allInvoices.filter(inv => inv.status === "Paid");
  }, [allInvoices]);

  // Search logic - only search in paid invoices
  const filteredInvoices = useMemo(() => {
    let filtered = paidInvoices;
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
    return filtered;
  }, [paidInvoices, search]);

  // Sorting
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
        sortBy === "total" ||
        sortBy === "balancedDue" ||
        sortBy === "amountReceived"
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

  // Pagination logic
  const totalRecords = sortedInvoices.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedInvoices.slice(start, start + pageSize);
  }, [sortedInvoices, page, pageSize]);

  // Reset page if out of range
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  // Handle row click
  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  // Number to words conversion (basic implementation)
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    let result = '';
    
    // Handle crores
    if (num >= 10000000) {
      result += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
      num %= 10000000;
    }
    
    // Handle lakhs
    if (num >= 100000) {
      result += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
      num %= 100000;
    }
    
    // Handle thousands
    if (num >= 1000) {
      result += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    
    // Handle hundreds
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    // Handle tens and ones
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      num = 0;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result.trim();
  };

  // Download functionality
  const handleDownload = () => {
    if (selectedInvoice) {
      // You can implement PDF generation here using libraries like jsPDF
      window.print();
    }
  };

  // Print functionality
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-template');
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Payment Receipt</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
      .header { text-align: center; margin-bottom: 30px; }
      .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
      .amount-words { margin: 10px 0; }
      .details { margin: 20px 0; }
      .row { display: flex; justify-content: space-between; margin: 10px 0; }
      .label { font-weight: bold; }
      .company-info { margin: 20px 0; }
      .signature { margin-top: 50px; text-align: right; }
      .grid { display: grid; }
      .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
      .gap-4 { gap: 1rem; }
      .gap-8 { gap: 2rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-4 { margin-bottom: 1rem; }
      .mb-8 { margin-bottom: 2rem; }
      .mt-16 { margin-top: 4rem; }
      .text-center { text-align: center; }
      .text-right { text-right; }
      .text-lg { font-size: 1.125rem; }
      .text-2xl { font-size: 1.5rem; }
      .text-3xl { font-size: 1.875rem; }
      .font-bold { font-weight: bold; }
      .font-semibold { font-weight: 600; }
      .border-t { border-top: 1px solid black; }
      .w-48 { width: 12rem; }
      .ml-auto { margin-left: auto; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Columns
  const columns = [
    { key: "invoiceDate", label: "Date", sortable: true },
    { key: "id", label: "Invoice ID", sortable: true },
    { key: "invoiceCode", label: "Invoice Code", sortable: true },
    { key: "referenceNumber", label: "Reference Number", sortable: true },
    { key: "customer", label: "Customer Name", sortable: true },
    { key: "poNumber", label: "PO Number", sortable: true },
    { key: "paymentMode", label: "Mode", sortable: true },
    { key: "total", label: "Amount (Total)", sortable: true, align: "right" },
    { key: "amountReceived", label: "Received", sortable: true, align: "right" },
    { key: "balancedDue", label: "Balance Due", sortable: true, align: "right" },
    { key: "status", label: "Status", sortable: true },
  ];

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  // Payment Receipt Template Component
  const PaymentReceiptTemplate = ({ invoice }) => (
    <div id="receipt-template" className="receipt bg-white p-8 max-w-4xl mx-auto">
      <div className="header text-center mb-8">
        <h1 className="text-2xl font-bold mb-4">PAYMENT RECEIPT</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold mb-2">Received From</h3>
          <div className="company-info">
            <div className="font-semibold text-lg">{invoice?.customer?.displayName || 'N/A'}</div>
            {invoice?.customer?.address && (
              <div className="text-sm text-gray-600 mt-1">
                {invoice.customer.address}
              </div>
            )}
            {invoice?.customer?.email && (
              <div className="text-sm text-gray-600">
                {invoice.customer.email}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-right">
            <div className="company-info">
              <div className="font-semibold">wizzybox</div>
              <div>Karnataka</div>
              <div>India</div>
              <div>priya.d@wizzybox.com</div>
            </div>
          </div>
        </div>
      </div>

      <div className="amount-section text-center mb-8">
        <div className="amount text-3xl font-bold text-blue-600 mb-2">
          ₹{(invoice?.amountReceived || 0).toLocaleString("en-IN")}
        </div>
        <div className="amount-words text-lg font-medium">
          Indian Rupee {numberToWords(invoice?.amountReceived || 0)} Only
        </div>
        <div className="text-sm text-gray-600 mt-1">Amount Received In Words</div>
      </div>

      <div className="details grid grid-cols-2 gap-4 mb-8">
        <div className="row">
          <span className="label">Payment Mode:</span>
          <span>{invoice?.paymentMode || 'Bank Transfer'}</span>
        </div>
        <div className="row">
          <span className="label">Reference Number:</span>
          <span>{invoice?.referenceNumber || 'N/A'}</span>
        </div>
        <div className="row">
          <span className="label">Payment Date:</span>
          <span>
            {invoice?.invoiceDate 
              ? format(new Date(invoice.invoiceDate), "dd/MM/yyyy")
              : format(new Date(), "dd/MM/yyyy")
            }
          </span>
        </div>
        <div className="row">
          <span className="label">Payment for:</span>
          <span>Invoice Payment</span>
        </div>
      </div>

      <div className="invoice-details grid grid-cols-2 gap-4 mb-8">
        <div className="row">
          <span className="label">Invoice Number:</span>
          <span>{invoice?.invoiceCode || invoice?.id || 'N/A'}</span>
        </div>
        <div className="row">
          <span className="label">Invoice Date:</span>
          <span>
            {invoice?.invoiceDate 
              ? format(new Date(invoice.invoiceDate), "dd/MM/yyyy")
              : 'N/A'
            }
          </span>
        </div>
        <div className="row">
          <span className="label">Invoice Amount:</span>
          <span>₹{(invoice?.total || 0).toLocaleString("en-IN")}</span>
        </div>
        <div className="row">
          <span className="label">Withholding Tax:</span>
          <span>₹{((invoice?.total || 0) - (invoice?.amountReceived || 0)).toLocaleString("en-IN")}</span>
        </div>
        <div className="row">
          <span className="label">Payment Amount:</span>
          <span>₹{(invoice?.amountReceived || 0).toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="signature text-right mt-16">
        <div className="border-t border-black w-48 ml-auto mb-2"></div>
        <div className="label">Authorized Signature</div>
      </div>
    </div>
  );

  // Pagination UI
  const Pagination = () => (
    <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Rows per page:</span>
        <select
          className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-900"
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
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {totalRecords === 0
            ? "0"
            : `${(page - 1) * pageSize + 1} - ${Math.min(page * pageSize, totalRecords)}`}
          {" "}
          of {totalRecords} paid invoices
        </span>
        <button
          className="p-1 rounded disabled:opacity-40"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <FiChevronLeft />
        </button>
        <span className="text-xs font-semibold">{page}</span>
        <button
          className="p-1 rounded disabled:opacity-40"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Demo Data Info */}
      {invoices.length === 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Demo Mode:</strong> Using sample data for testing. The table shows {paidInvoices.length} paid invoices out of {allInvoices.length} total invoices.
          </p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            className="pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-64"
            placeholder="Search paid invoices..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search invoices"
          />
        </div>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          {totalRecords} paid invoice{totalRecords !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full border-separate border-spacing-0 text-[13px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold text-left text-gray-700 dark:text-gray-200 select-none whitespace-nowrap ${
                    col.align === "right" ? "text-right" : ""
                  } ${col.sortable ? "cursor-pointer group" : ""}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  style={{ position: "sticky", top: 0, background: "inherit", zIndex: 1 }}
                  aria-sort={
                    sortBy === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <span className="flex items-center">
                    {col.label}
                    {col.sortable && (
                      <svg
                        className={`ml-1 w-3 h-3 transition-transform ${
                          sortBy === col.key
                            ? sortDir === "asc"
                              ? "rotate-180 text-blue-500"
                              : "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-400 dark:text-gray-500"
                >
                  <FiFileText className="mx-auto mb-2 text-3xl" />
                  No paid invoices found.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv, idx) => (
                <tr
                  key={inv.id}
                  className={`transition-colors duration-150 cursor-pointer ${
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                  } hover:bg-blue-50 dark:hover:bg-blue-900/40`}
                  onClick={() => handleRowClick(inv)}
                >
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                    {inv.invoiceDate
                      ? (
                        <span title={format(new Date(inv.invoiceDate), "yyyy-MM-dd'T'HH:mm:ssXXX")}>
                          {format(new Date(inv.invoiceDate), "dd MMM yyyy, hh:mm a")}
                        </span>
                      )
                      : "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 font-medium whitespace-nowrap">
                    {inv.id}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                    {inv.invoiceCode ? (
                      <span>{inv.invoiceCode}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                    {inv.referenceNumber || (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                    <span className="font-semibold">
                      {inv.customer?.displayName || "-"}
                    </span>
                    {inv.customer?.companyName &&
                      inv.customer.displayName !== inv.customer.companyName && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({inv.customer.companyName})
                        </span>
                      )}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                    {inv.poNumber || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                    <span className="inline-block px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                      {inv.paymentMode || <span className="text-gray-400">-</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-right font-semibold whitespace-nowrap">
                    ₹{(inv.total || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-right whitespace-nowrap">
                    ₹{(inv.amountReceived || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-right whitespace-nowrap">
                    <span
                      className={`${inv.balancedDue > 0
                        ? "text-orange-600 dark:text-orange-400 font-semibold"
                        : "text-gray-500"
                        }`}>
                      ₹{(inv.balancedDue || 0).toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Paid
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination />

      {/* Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Payment Receipt</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FiDownload size={16} />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FiPrinter size={16} />
                  Print
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <PaymentReceiptTemplate invoice={selectedInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceListTable;
