"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FiEye,
  FiEdit,
  FiDollarSign,
  FiFileText,
  FiCopy,
  FiPrinter,
  FiDownload,
  FiX,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiMail,
  FiDollarSign as FiDollarSignIcon
} from "react-icons/fi";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReceivedPaymentsTab from "./invoiceReceivedPaymentsTab";
import InvoicePDFTab from "./InvoicePDFTab";

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
  Draft: <FiFileText className="inline mr-1.5 text-xs" />,
  Paid: <FiCheckCircle className="inline mr-1.5 text-xs" />,
  Pending: <FiClock className="inline mr-1.5 text-xs" />,
  Cancelled: <FiXCircle className="inline mr-1.5 text-xs" />,
  Sent: <FiMail className="inline mr-1.5 text-xs" />,
  Overdue: <FiClock className="inline mr-1.5 text-xs" />,
  PartiallyPaid: <FiCheckCircle className="inline mr-1.5 text-xs" />,
  Refunded: <FiDollarSignIcon className="inline mr-1.5 text-xs" />,
};

// Utility to convert numbers to words (basic version)
function numberToWords(n) {
  // ... Implement your full numberToWords utility ...
  return n.toString();
}

function InvoicePayment({ invoice, onClose, onAction }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isPrintView, setIsPrintView] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(invoice.status);
  const [localInvoice, setLocalInvoice] = useState(invoice);

  useEffect(() => {
    setLocalInvoice(invoice);
    setCurrentStatus(invoice.status);
  }, [invoice]);

  if (!localInvoice) return null;

  const subtotal = useMemo(
    () => localInvoice.Item.reduce((sum, item) => sum + item.amount, 0),
    [localInvoice.Item]
  );
  const cgst = useMemo(
    () => localInvoice.Item.reduce((sum, item) => sum + (item.amount * (item.GstPercentage || 9)) / 200, 0),
    [localInvoice.Item]
  );
  const sgst = useMemo(
    () => localInvoice.Item.reduce((sum, item) => sum + (item.amount * (item.GstPercentage || 9)) / 200, 0),
    [localInvoice.Item]
  );
  const total = subtotal + cgst + sgst;
  const balanceDue = total - (localInvoice.paidAmount || 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiEye className="mr-1" /> },
    { id: "edit", label: "Edit", icon: <FiEdit className="mr-1" /> },
    { id: "payments", label: "Payments", icon: <FiDollarSign className="mr-1" /> },
    { id: "invoice", label: "Invoice", icon: <FiFileText className="mr-1" /> },
    { id: "clone", label: "Clone", icon: <FiCopy className="mr-1" /> },
  ];

  const handlePrint = () => {
    const previousTab = activeTab;
    setActiveTab("overview");
    setIsPrintView(true);
    setTimeout(() => {
      window.print();
      setIsPrintView(false);
      setActiveTab(previousTab);
    }, 300);
  };

  const handleDownload = () => {
    const previousTab = activeTab;
    setActiveTab("overview");
    setTimeout(() => {
      const input = document.getElementById("overview-content");
      if (input) {
        html2canvas(input, { scale: 2, useCORS: true, logging: true }).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const width = pdf.internal.pageSize.getWidth();
          const height = pdf.internal.pageSize.getHeight();
          const canvasRatio = canvas.height / canvas.width;
          let pdfHeight = width * canvasRatio;
          let heightLeft = pdfHeight;
          let positionY = 0;

          pdf.addImage(imgData, "PNG", 0, positionY, width, pdfHeight);
          heightLeft -= height;

          while (heightLeft > 0) {
            positionY = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, positionY, width, pdfHeight);
            heightLeft -= height;
          }

          pdf.save(`Invoice_${localInvoice.invoiceCode}.pdf`);
        });
      }
      setActiveTab(previousTab);
    }, 500);
  };

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    setLocalInvoice((prev) => ({ ...prev, status: newStatus }));
    onAction("changeStatus", localInvoice.id, newStatus);
  };

  return (
    <div className={`bg-white dark:bg-gray-900 shadow-sm h-full overflow-y-auto ${isPrintView ? "print-view" : ""}`}>
      {/* Header */}
      <div
        className={`flex justify-between items-center px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 ${
          isPrintView ? "hidden" : ""
        }`}
      >
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Invoice #{localInvoice.invoiceCode}</h2>
          <div className="flex items-center mt-1">
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                statusColors[currentStatus] || statusColors.Draft
              }`}
            >
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="PartiallyPaid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
              <option value="Paid">Paid</option>
            </select>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {localInvoice.invoiceDate ? format(new Date(localInvoice.invoiceDate), "dd MMM yyyy") : "-"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrint} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200" title="Print">
            <FiPrinter className="text-lg" />
          </button>
          <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200" title="Download">
            <FiDownload className="text-lg" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
            onClick={onClose}
            title="Close"
          >
            <FiX className="text-lg" />
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className={`border-b dark:border-gray-700 ${isPrintView ? "hidden" : ""}`}>
        <nav className="flex space-x-4 px-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-xs flex items-center transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="animate-fadeIn p-6 print:p-0" id="overview-content">
          {/* Company & Invoice Info */}
          <div className="flex flex-wrap justify-between mb-6">
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">WizzyBox Private Limited</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">Bengaluru Karnataka 560056, India</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">GSTIN 29AADCW7843F1ZY</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">contactus@wizzybox.com</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">www.wizzybox.com</div>
            </div>
            <div className="text-right">
              <div className="text-md font-bold text-gray-900 dark:text-white">Invoice #{localInvoice.invoiceCode}</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">Status: <span className="font-semibold">{currentStatus}</span></div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                Invoice Date: {localInvoice.invoiceDate ? format(new Date(localInvoice.invoiceDate), "dd/MM/yyyy") : "-"}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                Due Date: {localInvoice.dueDate ? format(new Date(localInvoice.dueDate), "dd/MM/yyyy") : "-"}
              </div>
            </div>
          </div>

          {/* Customer / Billing Info */}
          <div className="flex flex-wrap justify-between mb-6">
            <div>
              <div className="font-bold text-gray-900 dark:text-white mb-1">Billed To:</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                {localInvoice.customer?.displayName || localInvoice.customer?.companyName}
                {localInvoice.customer?.companyName && localInvoice.customer?.displayName !== localInvoice.customer?.companyName && (
                  <> ({localInvoice.customer.companyName})</>
                )}
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">{localInvoice.customer?.billingAddress}</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                {localInvoice.customer?.billingCity} {localInvoice.customer?.billingState} {localInvoice.customer?.billingPinCode}
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">India</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                GSTIN {localInvoice.customer?.gstNumber || 'Not provided'}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white mb-1">Place Of Supply:</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">Karnataka (29)</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="py-2 px-2 border text-xs text-left">#</th>
                  <th className="py-2 px-2 border text-xs text-left">Item & Description</th>
                  <th className="py-2 px-2 border text-xs text-left">HSN/SAC</th>
                  <th className="py-2 px-2 border text-xs text-left">Qty</th>
                  <th className="py-2 px-2 border text-xs text-left">Rate</th>
                  <th className="py-2 px-2 border text-xs text-left">CGST (9%)</th>
                  <th className="py-2 px-2 border text-xs text-left">SGST (9%)</th>
                  <th className="py-2 px-2 border text-xs text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {localInvoice.Item.map((item, idx) => {
                  const itemCgst = ((item.amount * (item.GstPercentage || 9)) / 200) || 0;
                  const itemSgst = ((item.amount * (item.GstPercentage || 9)) / 200) || 0;
                  return (
                    <tr key={idx} className="bg-white dark:bg-gray-900">
                      <td className="py-2 px-2 border text-xs">{idx + 1}</td>
                      <td className="py-2 px-2 border text-xs">
                        {item.itemDetails}
                        {item.description && (<span className="ml-1 text-gray-500">({item.description})</span>)}
                      </td>
                      <td className="py-2 px-2 border text-xs">998313</td>
                      <td className="py-2 px-2 border text-xs">{item.quantity}</td>
                      <td className="py-2 px-2 border text-xs">{item.rate.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-2 border text-xs">{itemCgst.toFixed(2)}</td>
                      <td className="py-2 px-2 border text-xs">{itemSgst.toFixed(2)}</td>
                      <td className="py-2 px-2 border text-xs">{item.amount.toLocaleString("en-IN")}</td>
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
                <span>₹{(localInvoice.paidAmount || 0).toLocaleString("en-IN")}</span>
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
            {localInvoice.writeOffReason && (
              <span className="block text-xs mt-2 text-red-600">Written Off: {localInvoice.writeOffReason}</span>
            )}
          </div>

          <div className="border-t border-dashed mt-6 pt-4">
            <div className="font-bold text-md text-gray-900 dark:text-white mb-1">Bank Details</div>
            <div className="text-gray-700 dark:text-gray-300 text-sm">State Bank of India</div>
            <div className="text-gray-700 dark:text-gray-300 text-sm">Bank A/C No: 00000042985985552</div>
            <div className="text-gray-700 dark:text-gray-300 text-sm">IFSC Code: SBIN0016225</div>
          </div>

          <div className="border-t border-dashed mt-4 pt-4 flex justify-between">
            <span className="text-xs text-gray-400 dark:text-gray-500">Crafted with ease using zoho.com/invoice</span>
            <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">Authorized Signature</span>
          </div>
        </div>
      )}

      {activeTab === "edit" && (
        <div className="p-4 animate-fadeIn">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Invoice</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiClock className="h-5 w-5 text-yellow-400 dark:text-yellow-300" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This feature is under development and will be available in the next update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <ReceivedPaymentsTab
          invoice={localInvoice}
          onAction={(action, id, data) => {
            if (action === "recordPayment") {
              const newPaid = (localInvoice.paidAmount || 0) + parseFloat(data.amountReceived || 0);
              const newStatus = newPaid >= total ? "Paid" : "PartiallyPaid";
              setLocalInvoice((prev) => ({ ...prev, paidAmount: newPaid, status: newStatus }));
            } else if (action === "writeOff") {
              setLocalInvoice((prev) => ({ ...prev, status: "Cancelled", writeOffReason: data.reason }));
            }
            onAction(action, id, data);
          }}
        />
      )}

      {activeTab === "invoice" && (
        <InvoicePDFTab invoice={localInvoice} onPrint={handlePrint} onDownload={handleDownload} />
      )}

      {activeTab === "clone" && (
        <div className="p-4 animate-fadeIn">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Clone Invoice</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiCopy className="h-5 w-5 text-blue-400 dark:text-blue-300" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This feature will create a duplicate of this invoice with a new invoice number.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoicePayment;
