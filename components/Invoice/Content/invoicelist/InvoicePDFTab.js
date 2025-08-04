"use client";

import React, { useRef } from "react";
import { FiFileText, FiPrinter, FiDownload } from "react-icons/fi";

/**
 * InvoicePDFTab
 * @param {Object} props
 * @param {Object} props.invoice - Invoice object, must contain invoiceTemplate (base64 or URL)
 * @param {Function} [props.onPrint] - Optional custom print handler
 * @param {Function} [props.onDownload] - Optional custom download handler
 */
export default function InvoicePDFTab({ invoice, onPrint, onDownload }) {
  const iframeRef = useRef(null);

  // Determine if the template is a base64 string or a URL
  const getPdfSrc = () => {
    if (!invoice?.invoiceTemplate) return "";
    // If already a data URL, use as is
    if (invoice.invoiceTemplate.startsWith("data:application/pdf")) {
      return invoice.invoiceTemplate;
    }
    // If base64, convert to data URL
    if (/^[A-Za-z0-9+/=]+$/.test(invoice.invoiceTemplate.trim().slice(0, 50))) {
      return `data:application/pdf;base64,${invoice.invoiceTemplate}`;
    }
    // Otherwise, treat as URL
    return invoice.invoiceTemplate;
  };

  const pdfSrc = getPdfSrc();

  // Default print handler if not provided
  const handlePrint = () => {
    if (!pdfSrc) return;
    const printWindow = window.open(pdfSrc, "_blank");
    if (printWindow) {
      printWindow.focus();
      // Some browsers may auto-trigger print, but we can't guarantee it for all
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  // Default download handler if not provided
  const handleDownload = () => {
    if (!pdfSrc) return;
    const link = document.createElement("a");
    link.href = pdfSrc;
    link.download = `Invoice-${invoice.invoiceCode || "Document"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!invoice?.invoiceTemplate) {
    return (
      <div className="p-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No PDF Available
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This invoice doesn't have a PDF template generated yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      <div className="flex space-x-4">
        {/* <button
          onClick={onPrint || handlePrint}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center transition-colors"
          type="button"
        >
          <FiPrinter className="mr-1" /> Print
        </button>
        <button
          onClick={onDownload || handleDownload}
          className="p-2 bg-blue-200 hover:bg-blue-300 rounded flex items-center transition-colors"
          type="button"
        >
          <FiDownload className="mr-1" /> Download
        </button> */}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <iframe
          ref={iframeRef}
          src={pdfSrc}
          width="700px"
          height="1000px"
          style={{ border: "1px solid #ddd", borderRadius: "8px" }}
          title="Invoice PDF"
        >
          <p className="text-center p-4 text-gray-500 dark:text-gray-400">
            Your browser does not support PDFs. Please download the PDF to view it.
          </p>
        </iframe>
      </div>
    </div>
  );
}