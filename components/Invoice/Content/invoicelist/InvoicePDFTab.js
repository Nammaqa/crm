"use client";
import React from "react";
import { FiFileText, FiPrinter, FiDownload } from "react-icons/fi";

export default function InvoicePDFTab({ invoice, onPrint, onDownload }) {
  if (!invoice?.invoiceTemplate) {
    return (
      <div className="p-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No PDF Available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This invoice doesn't have a PDF template generated yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={onPrint}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200 flex items-center"
          title="Print PDF"
        >
          <FiPrinter className="text-lg mr-1" /> Print
        </button>
        <button
          onClick={onDownload}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200 flex items-center"
          title="Download PDF"
        >
          <FiDownload className="text-lg mr-1" /> Download
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 flex-1">
        <iframe
          id="invoice-iframe"
          src={`data:application/pdf;base64,${invoice.invoiceTemplate}`}
          className="w-full h-full min-h-[600px] rounded-lg"
          frameBorder="0"
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
