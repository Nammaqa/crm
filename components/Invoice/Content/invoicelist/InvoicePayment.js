"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import {FiCheckCircle,FiXCircle,FiDollarSign,FiMail,FiDownload,FiPrinter,FiCopy,FiX,} from "react-icons/fi";
import ReceivedPaymentsTab from "./invoiceReceivedPaymentsTab";
import InvoicePDFTab from "./InvoicePDFTab";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Status mapping ---
const statusColors = {
  Paid: "text-green-700 bg-green-50 border-green-200",
  Pending: "text-amber-700 bg-amber-50 border-amber-200",
  Draft: "text-gray-600 bg-gray-50 border-gray-200",
  Cancelled: "text-red-700 bg-red-50 border-red-200",
  Sent: "text-blue-700 bg-blue-50 border-blue-200",
  Overdue: "text-red-800 bg-red-100 border-red-300",
  PartiallyPaid: "text-purple-700 bg-purple-50 border-purple-200",
  Refunded: "text-indigo-700 bg-indigo-50 border-indigo-200",
};
const statusIcons = {
  Paid: <FiCheckCircle className="inline mr-1.5 text-xs" />,
  Pending: <FiDollarSign className="inline mr-1.5 text-xs" />,
  Draft: <FiMail className="inline mr-1.5 text-xs" />,
  Cancelled: <FiXCircle className="inline mr-1.5 text-xs" />,
  Sent: <FiMail className="inline mr-1.5 text-xs" />,
  Overdue: <FiXCircle className="inline mr-1.5 text-xs" />,
  PartiallyPaid: <FiDollarSign className="inline mr-1.5 text-xs" />,
  Refunded: <FiDollarSign className="inline mr-1.5 text-xs" />,
};
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "payments", label: "Payments" },
  { id: "pdf", label: "Invoice PDF" },
  { id: "clone", label: "Clone" },
];
function numberToWords(n) {
  if (n === 0) return "zero";
  return n.toLocaleString("en-IN");
}

const InvoicePayment = ({ invoice, onClone, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [cloneInProgress, setCloneInProgress] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(invoice.status === "Sent");
  const [localInvoice, setLocalInvoice] = useState(invoice);
  const [refreshing, setRefreshing] = useState(false);

  const overviewRef = useRef();

  // Sync prop updates
  useEffect(() => {
    setLocalInvoice(invoice);
    setSent(invoice.status === "Sent");
  }, [invoice]);

  // Refresh invoice data
  const refreshInvoiceData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/invoice/${localInvoice.id}`);
      const data = await res.json();
      if (data && data.data) {
        setLocalInvoice(data.data);
        setSent(data.data.status === "Sent");
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Memoized calculations
  const invoiceItems = localInvoice.Item || [];
  const subtotal = useMemo(() => invoiceItems.reduce((sum, item) => sum + (item.amount || 0), 0),[invoiceItems]);
  const cgst = useMemo(() =>invoiceItems.reduce((sum, item) => sum + ((item.amount || 0) * (item.GstPercentage || 9)) / 200,0),[invoiceItems]);
  const sgst = useMemo(() =>invoiceItems.reduce((sum, item) => sum + ((item.amount || 0) * (item.GstPercentage || 9)) / 200,0),[invoiceItems]);
  const total = subtotal + cgst + sgst;
  const paidAmount = localInvoice.amountReceived || 0;

  // --- Force balanceDue to zero if status is Paid
  const balanceDue =
    localInvoice.status === "Paid" ? 0 : Math.floor(total - paidAmount);

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch(`/api/invoice/${localInvoice.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        await refreshInvoiceData();
      }
    } finally {
      setSending(false);
    }
  };

  // --- Patch to remove "oklch" before export for html2canvas ---
  const patchUnsupportedColors = (node) => {
    if (!node || !node.querySelectorAll) return;
    const all = node.querySelectorAll("*");
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if (style.backgroundColor && style.backgroundColor.startsWith("oklch")) {
        el.style.backgroundColor = "#fff";
      }
      if (style.color && style.color.startsWith("oklch")) {
        el.style.color = "#222";
      }
      if (style.borderColor && style.borderColor.startsWith("oklch")) {
        el.style.borderColor = "#eee";
      }
    }
    const nodeStyle = window.getComputedStyle(node);
    if (
      nodeStyle.backgroundColor &&
      nodeStyle.backgroundColor.startsWith("oklch")
    ) {
      node.style.backgroundColor = "#fff";
    }
    if (nodeStyle.color && nodeStyle.color.startsWith("oklch")) {
      node.style.color = "#222";
    }
  };

  // --- Overview PDF Download ---
  const handleDownloadPDF = async () => {
    if (!overviewRef.current) return;
    patchUnsupportedColors(overviewRef.current); // Patch all children with oklch colors
    const element = overviewRef.current;
    element.style.background = "#fff";
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#fff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);

    let pdfWidth = pageWidth;
    let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    if (pdfHeight > pageHeight) pdfHeight = pageHeight;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${localInvoice.invoiceCode || localInvoice.id}.pdf`);
  };

  if (!localInvoice) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-400 dark:text-gray-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        Loading invoice details...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-8 border rounded bg-white dark:bg-gray-900 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold mb-1 flex items-center">
            Invoice Overview
            <span
              className={`ml-3 px-2 py-1 rounded-full text-xs font-medium border ${
                statusColors[localInvoice.status] || ""
              }`}
            >
              {statusIcons[localInvoice.status]}
              {localInvoice.status}
            </span>
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {localInvoice.invoiceDate
              ? format(new Date(localInvoice.invoiceDate), "dd MMM yyyy")
              : "-"}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {/* Send Button only for Draft status */}
          {localInvoice.status === "Draft" && (
            <button
              className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={async () => {
                await handleSend();
              }}
              disabled={sending}
              type="button"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          )}
          {/* Download PDF */}
          {activeTab === "overview" && (
            <button
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              title="Download PDF"
              type="button"
              onClick={handleDownloadPDF}
            >
              <FiDownload />
            </button>
          )}
          {/* Cancel/Close Icon Action */}
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            title="Close"
            onClick={onClose} 
            type="button"
          >
            <FiX />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 focus:outline-none transition-colors duration-150 ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 font-semibold text-blue-700 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300"
            }`}
            type="button">
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* TAB: Overview */}
      {activeTab === "overview" && (
        <div
          ref={overviewRef}
          className="animate-fadeIn p-4 bg-white dark:bg-gray-900 relative"
          id="overview-content"
        >
          {/* Company & Invoice Info */}
          <div className="flex flex-wrap justify-between mb-6 items-start">
            <div>
              <img
                src="/Wizzybox-logo.png"
                alt="WizzyBox Logo"
                className="h-11 w-auto mb-2"
                style={{ maxHeight: "48px" }}
              />
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                WizzyBox Private Limited
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                Bengaluru Karnataka 560056, India
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                GSTIN 29AADCW7843F1ZY
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                contactus@wizzybox.com
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                www.wizzybox.com
              </div>
            </div>
            <div className="text-right">
              <div className="text-md font-bold text-gray-900 dark:text-white">
                Invoice #{localInvoice.invoiceCode}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                Status: <span className="font-semibold">{localInvoice.status}</span>
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                Invoice Date:{" "}
                {localInvoice.invoiceDate
                  ? format(new Date(localInvoice.invoiceDate), "dd/MM/yyyy")
                  : "-"}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                Due Date:{" "}
                {localInvoice.dueDate
                  ? format(new Date(localInvoice.dueDate), "dd/MM/yyyy")
                  : "-"}
              </div>
            </div>
          </div>
          
          {/* Billing Info */}
          <div className="flex flex-wrap justify-between mb-6">
            <div>
              <div className="font-bold text-gray-900 dark:text-white mb-1">
                Billed To:
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                {localInvoice.customer?.displayName ||
                  localInvoice.customer?.companyName}
                {localInvoice.customer?.companyName &&
                  localInvoice.customer?.displayName !==
                    localInvoice.customer?.companyName && (
                    <> ({localInvoice.customer.companyName})</>
                  )}
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                {localInvoice.customer?.billingAddress}
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                {localInvoice.customer?.billingCity}{" "}
                {localInvoice.customer?.billingState}{" "}
                {localInvoice.customer?.billingPinCode}
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                India
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                GSTIN {localInvoice.customer?.gstNumber || "Not provided"}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white mb-1">
                Place Of Supply:
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                Karnataka (29)
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="py-2 px-2 border text-xs text-center">#</th>
                  <th className="py-2 px-2 border text-xs text-center">
                    Item & Description
                  </th>
                  <th className="py-2 px-2 border text-xs text-center">HSN/SAC</th>
                  <th className="py-2 px-2 border text-xs text-center">Qty</th>
                  <th className="py-2 px-2 border text-xs text-center">Rate</th>
                  <th className="py-2 px-2 border text-xs text-center">
                    CGST (9%)
                  </th>
                  <th className="py-2 px-2 border text-xs text-center">
                    SGST (9%)
                  </th>
                  <th className="py-2 px-2 border text-xs text-center">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, idx) => {
                  const itemCgst =
                    ((item.amount || 0) * (item.GstPercentage || 9)) / 200;
                  const itemSgst =
                    ((item.amount || 0) * (item.GstPercentage || 9)) / 200;
                  return (
                    <tr key={idx} className="bg-white dark:bg-gray-900">
                      <td className="py-2 px-2 border text-xs">{idx + 1}</td>
                      <td className="py-2 px-2 border text-xs">
                        {item.itemDetails}
                        {item.description && (
                          <span className="ml-1 text-gray-500">
                            ({item.description})
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 border text-xs">{item.sac}</td>
                      <td className="py-2 px-2 border text-xs">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-2 border text-xs">
                        {item.rate?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-2 border text-xs">
                        {itemCgst?.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 border text-xs">
                        {itemSgst?.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 border text-xs">
                        {item.amount?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-1 text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 text-gray-600 dark:text-gray-300">
                <span>CGST (9%)</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-gray-600 dark:text-gray-300">
                <span>SGST (9%)</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-black dark:text-white py-2 border-t mt-2">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 text-gray-600 dark:text-gray-300">
                <span>Paid</span>
                <span>₹{paidAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold text-black dark:text-white py-2 border-t mt-2">
                <span>Balance Due</span>
                <span>₹{balanceDue.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
          
          {/* In Words & Notes */}
          <div className="mt-5 text-gray-700 dark:text-gray-300 text-sm">
            <strong>Total In Words:</strong> Indian Rupee {numberToWords(Math.floor(total))} Only
          </div>
          <div className="mt-1 text-gray-700 dark:text-gray-300 text-sm italic">
            {localInvoice.customerNotes || "Thanks for your business."}
            {localInvoice.writeofnotes && (
              <span className="block text-xs mt-2 text-red-600">
                Written Off: {localInvoice.writeofnotes}
              </span>
            )}
          </div>
          
          <div className="mt-6 pt-4">
            <div className="font-bold text-md text-gray-900 dark:text-white mb-1">
              Bank Details
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              State Bank of India
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              Bank A/C No: 00000042985985552
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              IFSC Code: SBIN0016225
            </div>
          </div>
          
          <div className="mt-4 pt-4 flex justify-between items-end relative">
            <span className="text-xs text-gray-400 dark:text-gray-500"></span>
          
              {/* Karthik's signature image */}
              <div className="flex flex-col items-end">
              <img
                src="/karthik.png"
                alt="Signature"
                className="h-20 w-170 opacity-100 mt-9 "
                style={{ maxHeight: "80px", maxWidth: "200px" }}
              />
                  {/* Authorized Signature with Image */}
              <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold mb-1">
                Authorized Signature
              </span>
            </div>

          </div>
        </div>
      )}
      
      {/* Payments Tab */}
      {activeTab === "payments" && (
        <ReceivedPaymentsTab invoice={localInvoice} refreshInvoice={refreshInvoiceData} />
      )}
      
      {/* Invoice PDF Tab */}
      {activeTab === "pdf" && <InvoicePDFTab invoice={localInvoice} />}
      
      {/* Clone Tab */}
      {activeTab === "clone" && (
        <div className="p-4 flex flex-col items-center animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded shadow px-8 py-6 border border-blue-600">
            <div className="flex items-center mb-4">
              <FiCopy className="text-blue-600 mr-2" />
              <span className="font-semibold text-blue-700 dark:text-blue-300 text-lg">
                Clone Invoice
              </span>
            </div>
            <div className="text-gray-700 dark:text-gray-200 text-base mb-6">
              Do you want to clone this invoice?
            </div>
            <div className="flex gap-3">
              <button
                className={`bg-blue-600 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50`}
                onClick={async () => {
                  setCloneInProgress(true);
                  if (typeof onClone === "function") {
                    await onClone(localInvoice);
                  }
                  setCloneInProgress(false);
                }}
                disabled={cloneInProgress}
                type="button"
              >
                {cloneInProgress ? "Cloning..." : "Submit"}
              </button>
              <button
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setActiveTab("overview")}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePayment;
