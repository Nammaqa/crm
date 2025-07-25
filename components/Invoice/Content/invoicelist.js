"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiMoreVertical,
  FiMail,
  FiPrinter,
  FiDownload,
  FiEdit,
  FiPlus,
  FiChevronUp,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiShare2,
  FiTrash2,
  FiCopy,
  FiDollarSign,
  FiX,
  FiPaperclip,
} from "react-icons/fi";
import { format } from "date-fns";
import Link from "next/link";
import { Tooltip } from 'react-tooltip'; // Assuming you install react-tooltip for premium tooltips

const statusColors = {
  Paid: "text-green-600 bg-gradient-to-r from-green-50 to-green-100 border-green-200",
  Pending: "text-yellow-700 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200",
  Draft: "text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200",
  Cancelled: "text-red-600 bg-gradient-to-r from-red-50 to-red-100 border-red-200",
  Sent: "text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200",
  Overdue: "text-red-800 bg-gradient-to-r from-red-100 to-red-200 border-red-300",
  PartiallyPaid: "text-purple-600 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200",
};

const statusIcons = {
  Draft: <FiFileText className="inline mr-1" />,
  Paid: <FiCheckCircle className="inline mr-1" />,
  Pending: <FiClock className="inline mr-1" />,
  Cancelled: <FiXCircle className="inline mr-1" />,
  Sent: <FiMail className="inline mr-1" />,
  Overdue: <FiClock className="inline mr-1" />,
  PartiallyPaid: <FiCheckCircle className="inline mr-1" />,
};

function ActionMenu({ invoiceId, onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAction = (action) => {
    onAction(action, invoiceId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="More"
        data-tooltip-id="action-tooltip"
      >
        <FiMoreVertical />
      </button>
      <Tooltip id="action-tooltip" content="More actions" place="top" />
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-10 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => handleAction("edit")}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 w-full text-left transition"
            >
              <FiEdit className="mr-2" /> Edit
            </button>
            <button
              onClick={() => handleAction("download")}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 w-full text-left transition"
            >
              <FiDownload className="mr-2" /> Download
            </button>
            <button
              onClick={() => handleAction("clone")}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 w-full text-left transition"
            >
              <FiCopy className="mr-2" /> Clone
            </button>
            <button
              onClick={() => handleAction("recordPayment")}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 w-full text-left transition"
            >
              <FiDollarSign className="mr-2" /> Record Payment
            </button>
            <button
              onClick={() => handleAction("delete")}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 w-full text-left transition"
            >
              <FiTrash2 className="mr-2" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceivedPaymentsTab({ invoice, onAction }) {
  const [formData, setFormData] = useState({
    paymentFor: `INV-${invoice?.invoiceCode || ''}`,
    customerName: invoice?.customer?.displayName || '',
    paymentNumber: '',
    amountReceived: '',
    taxDeducted: 'No',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentReceivedOn: '',
    notes: '',
    pan: '',
    bankCharges: '',
    paymentMode: 'Cash',
    reference: '',
    attachments: []
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAction('recordPayment', invoice.id, formData);
  };

  return (
    <div className="p-6 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Record Payment</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment for
            </label>
            <input
              type="text"
              value={formData.paymentFor}
              onChange={(e) => handleInputChange('paymentFor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer Name*
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment #*
            </label>
            <input
              type="text"
              value={formData.paymentNumber}
              onChange={(e) => handleInputChange('paymentNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount Received
            </label>
            <input
              type="number"
              value={formData.amountReceived}
              onChange={(e) => handleInputChange('amountReceived', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Date*
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => handleInputChange('paymentDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Received On
            </label>
            <input
              type="text"
              value={formData.paymentReceivedOn}
              onChange={(e) => handleInputChange('paymentReceivedOn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Bank account, Cash, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tax deducted?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="taxDeducted"
                value="No"
                checked={formData.taxDeducted === 'No'}
                onChange={(e) => handleInputChange('taxDeducted', e.target.value)}
                className="mr-2 text-blue-500"
              />
              No Tax deducted
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="taxDeducted"
                value="Yes"
                checked={formData.taxDeducted === 'Yes'}
                onChange={(e) => handleInputChange('taxDeducted', e.target.value)}
                className="mr-2 text-blue-500"
              />
              Yes, TDS (Income Tax)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PAN
            </label>
            <input
              type="text"
              value={formData.pan}
              onChange={(e) => handleInputChange('pan', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter PAN number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bank Charges (if any)
            </label>
            <input
              type="number"
              value={formData.bankCharges}
              onChange={(e) => handleInputChange('bankCharges', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Mode
            </label>
            <select
              value={formData.paymentMode}
              onChange={(e) => handleInputChange('paymentMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="UPI">UPI</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reference#
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Transaction ID, Cheque number, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Additional notes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Attachments
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              multiple
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex items-center justify-center text-gray-700 dark:text-gray-300"
            >
              <FiPaperclip className="mr-2" />
              Click to upload files
            </label>
            {formData.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded">
                    <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            onClick={() => {}}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition shadow-md"
          >
            Record Payment
          </button>
        </div>
      </form>
    </div>
  );
}

function InvoiceDetailPanel({ invoice, onClose, onAction }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!invoice) return null;

  const subtotal = useMemo(() => invoice.Item.reduce((sum, item) => sum + item.amount, 0), [invoice.Item]);
  const gst = useMemo(() => invoice.Item.reduce((sum, item) => sum + (item.amount * (item.GstPercentage || 0)) / 100, 0), [invoice.Item]);
  const total = subtotal + gst;
  const balanceDue = total - (invoice.paidAmount || 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiEye /> },
    { id: 'edit', label: 'Edit', icon: <FiEdit /> },
    { id: 'payments', label: 'Received Payments', icon: <FiDollarSign /> },
    { id: 'clone', label: 'Clone', icon: <FiCopy /> },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto rounded-r-xl">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Invoice #{invoice.invoiceCode}
          </h2>
          <div className="flex items-center mt-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium shadow-sm ${statusColors[invoice.status] || statusColors.Draft}`}
            >
              {statusIcons[invoice.status]}
              {invoice.status}
            </span>
            <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
              {invoice.invoiceDate
                ? format(new Date(invoice.invoiceDate), "dd MMM yyyy")
                : "-"}
            </span>
          </div>
        </div>
        <button
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl transition"
          onClick={onClose}
          title="Close"
          aria-label="Close invoice details"
        >
          <FiX />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b dark:border-gray-700">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="animate-fadeIn">
          {/* Action Buttons */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-3 border-b flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition shadow-sm">
                <FiPrinter className="mr-2" /> Print
              </button>
              <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition shadow-sm">
                <FiDownload className="mr-2" /> Download
              </button>
              <button 
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition shadow-sm"
                onClick={() => setActiveTab('edit')}
              >
                <FiEdit className="mr-2" /> Edit
              </button>
              <button 
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition shadow-sm"
                onClick={() => onAction("delete", invoice.id)}
              >
                <FiTrash2 className="mr-2" /> Delete
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium shadow-sm ${statusColors[invoice.status] || statusColors.Draft}`}
              >
                {statusIcons[invoice.status]}
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Invoice Template */}
          <div className="p-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TAX INVOICE</h1>
              </div>
              <div className="text-right text-sm text-gray-700 dark:text-gray-300">
                <div className="mb-1">
                  <span className="font-medium">#</span> {invoice.invoiceCode}
                </div>
                <div className="mb-1">
                  <span className="font-medium">Invoice Date:</span> {format(new Date(invoice.invoiceDate), "dd/MM/yyyy")}
                </div>
                <div className="mb-1">
                  <span className="font-medium">Terms:</span> Due on Receipt
                </div>
                <div>
                  <span className="font-medium">Due Date:</span> {format(new Date(invoice.dueDate), "dd/MM/yyyy")}
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-6">
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Bill To</h3>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 shadow-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{invoice.customer?.displayName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customer?.billingAddress}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customer?.billingCity}, {invoice.customer?.billingState}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customer?.billingPinCode}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">GSTIN: {invoice.customer?.gstNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto shadow-md rounded-xl">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">#</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Item & Description</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Qty</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Rate</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.Item.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{item.itemDetails}</td>
                      <td className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">₹{item.rate.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">₹{item.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-md">
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex justify-between mb-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Sub Total</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Amount Paid</span>
                    <span>₹{(invoice.paidAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 font-medium text-gray-900 dark:text-white">
                    <span>Balance Due</span>
                    <span>₹{balanceDue.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-8">
              <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoice.customerNotes || "Thanks for your business."}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Invoice</h3>
          <p className="text-gray-600 dark:text-gray-400">Edit functionality will be implemented here.</p>
        </div>
      )}

      {activeTab === 'payments' && (
        <ReceivedPaymentsTab invoice={invoice} onAction={onAction} />
      )}

      {activeTab === 'clone' && (
        <div className="p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Clone Invoice</h3>
          <p className="text-gray-600 dark:text-gray-400">Clone functionality will be implemented here.</p>
        </div>
      )}
    </div>
  );
}

export default function InvoiceList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [dateRangeFilter, setDateRangeFilter] = useState("invoice_date");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amountFilter, setAmountFilter] = useState("=");
  const [amountValue, setAmountValue] = useState("");
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState("");
  
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortColumn, setSortColumn] = useState("created_time");
  const [sortOrder, setSortOrder] = useState("D");
  const [invoices, setInvoices] = useState([]);

  // Fetch invoices from backend API
  useEffect(() => {
    setLoading(true);
    fetch("/api/invoice")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInvoices(data.data);
        else setInvoices([]);
        setLoading(false);
      })
      .catch(() => {
        setInvoices([]);
        setLoading(false);
      });
  }, []);

  // Fetch selected invoice details
  useEffect(() => {
    if (!selectedInvoiceId) {
      setSelectedInvoice(null);
      return;
    }
    
    setLoading(true);
    fetch(`/api/invoice/${selectedInvoiceId}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedInvoice(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedInvoiceId]);

  // Filter and search logic (memoized for performance)
  const filteredInvoices = useMemo(() => invoices.filter((inv) => {
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    const matchesCustomer = customerFilter === "All" || 
      inv.customer?.displayName === customerFilter || 
      inv.customer?.companyName === customerFilter;
    const matchesSearch = search === "" ||
      inv.invoiceCode?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.companyName?.toLowerCase().includes(search.toLowerCase());
    let matchesDateRange = true;
    if (startDate && endDate) {
      const dateField = dateRangeFilter === "invoice_date" ? inv.invoiceDate : 
                       dateRangeFilter === "due_date" ? inv.dueDate : 
                       inv.createdAt;
      if (dateField) {
        const invoiceDate = new Date(dateField);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDateRange = invoiceDate >= start && invoiceDate <= end;
      } else {
        matchesDateRange = false;
      }
    }
    let matchesAmount = true;
    if (amountValue) {
      const numValue = parseFloat(amountValue);
      if (!isNaN(numValue)) {
        const total = inv.total || 0;
        switch (amountFilter) {
          case "=": matchesAmount = total === numValue; break;
          case ">": matchesAmount = total > numValue; break;
          case "<": matchesAmount = total < numValue; break;
          case "between": 
            const [min, max] = amountValue.split(",").map(Number);
            matchesAmount = total >= min && total <= max;
            break;
          default: matchesAmount = true;
        }
      }
    }
    const matchesInvoiceNumber = invoiceNumberFilter === "" || 
      inv.invoiceCode?.toLowerCase().includes(invoiceNumberFilter.toLowerCase());
    return matchesStatus && matchesCustomer && matchesSearch && 
           matchesDateRange && matchesAmount && matchesInvoiceNumber;
  }), [invoices, statusFilter, customerFilter, search, startDate, endDate, dateRangeFilter, amountValue, amountFilter, invoiceNumberFilter]);

  // Sort invoices (memoized)
  const sortedInvoices = useMemo(() => [...filteredInvoices].sort((a, b) => {
    if (sortColumn === "created_time") {
      return sortOrder === "D"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortColumn === "invoice_date") {
      return sortOrder === "D"
        ? new Date(b.invoiceDate) - new Date(a.invoiceDate)
        : new Date(a.invoiceDate) - new Date(b.invoiceDate);
    }
    if (sortColumn === "due_date") {
      return sortOrder === "D"
        ? new Date(b.dueDate) - new Date(a.dueDate)
        : new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortColumn === "amount") {
      return sortOrder === "D" ? b.total - a.total : a.total - b.total;
    }
    if (sortColumn === "balance_due") {
      const balanceA = a.total - (a.paidAmount || 0);
      const balanceB = b.total - (b.paidAmount || 0);
      return sortOrder === "D" ? balanceB - balanceA : balanceA - balanceB;
    }
    return 0;
  }), [filteredInvoices, sortColumn, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const paginatedInvoices = useMemo(() => sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ), [sortedInvoices, currentPage, itemsPerPage]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "D" ? "A" : "D");
    } else {
      setSortColumn(column);
      setSortOrder("D");
    }
  };

  const handleAction = (action, invoiceId, data = null) => {
    switch (action) {
      case "edit":
        console.log("Edit invoice", invoiceId);
        break;
      case "download":
        console.log("Download invoice", invoiceId);
        break;
      case "clone":
        console.log("Clone invoice", invoiceId);
        break;
      case "recordPayment":
        console.log("Record payment for invoice", invoiceId, data);
        break;
      case "delete":
        console.log("Delete invoice", invoiceId);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setCustomerFilter("All");
    setDateRangeFilter("invoice_date");
    setStartDate("");
    setEndDate("");
    setAmountFilter("=");
    setAmountValue("");
    setInvoiceNumberFilter("");
  };

  const handleInvoiceClick = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage all your invoices in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/admin/content/newinvoice" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition flex items-center shadow-md"
            >
              <FiPlus className="mr-2" /> New Invoice
            </Link>
            <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center shadow-md">
              <FiDownload className="mr-2" /> Export
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by invoice #, customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
              <div className="ml-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white shadow-sm"
                >
                  <option value="All">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Pending">Pending</option>
                  <option value="PartiallyPaid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button
                className="ml-2 flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setShowFilter((v) => !v)}
              >
                <FiFilter className="mr-1" />
                {showFilter ? "Hide Filters" : "More Filters"}
              </button>
              <button 
                className="ml-2 flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" 
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw className="mr-1" />
                Refresh
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filteredInvoices.length} invoice(s)
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs dark:bg-gray-700 dark:text-white shadow-sm"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
          
          {/* More Filters */}
          {showFilter && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 flex flex-wrap gap-4 border-t dark:border-gray-700">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</label>
                <select 
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs w-40 dark:bg-gray-700 dark:text-white shadow-sm"
                >
                  <option value="All">All Customers</option>
                  {Array.from(new Set(invoices.map(inv => inv.customer?.displayName))).map(name => (
                    name && <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date Range</label>
                <div className="flex items-center">
                  <select 
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs w-24 mr-2 dark:bg-gray-700 dark:text-white shadow-sm"
                  >
                    <option value="invoice_date">Invoice Date</option>
                    <option value="due_date">Due Date</option>
                    <option value="created_time">Created Time</option>
                  </select>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs dark:bg-gray-700 dark:text-white shadow-sm" 
                  />
                  <span className="mx-2 text-xs text-gray-400 dark:text-gray-500">to</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs dark:bg-gray-700 dark:text-white shadow-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</label>
                <div className="flex items-center">
                  <select 
                    value={amountFilter}
                    onChange={(e) => setAmountFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs w-24 mr-2 dark:bg-gray-700 dark:text-white shadow-sm"
                  >
                    <option value="=">Equal to</option>
                    <option value=">">Greater than</option>
                    <option value="<">Less than</option>
                    <option value="between">Between</option>
                  </select>
                  <input 
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs w-20 dark:bg-gray-700 dark:text-white shadow-sm" 
                    placeholder="Amount" 
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Invoice #</label>
                <input 
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs dark:bg-gray-700 dark:text-white shadow-sm" 
                  placeholder="Invoice number" 
                  value={invoiceNumberFilter}
                  onChange={(e) => setInvoiceNumberFilter(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-blue-700 hover:to-blue-800 transition h-7 shadow-md">
                  Apply
                </button>
                <button 
                  className="ml-2 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 h-7"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Conditional Rendering */}
        {!selectedInvoice ? (
          // Full Width Table View (Initial View)
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("created_time")}
                  >
                    <div className="flex items-center">
                      Created Time
                      {sortColumn === "created_time" && (
                        <FiChevronDown className={`ml-1 transition ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("invoice_date")}
                  >
                    <div className="flex items-center">
                      Invoice Date
                      {sortColumn === "invoice_date" && (
                        <FiChevronDown className={`ml-1 transition ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("due_date")}
                  >
                    <div className="flex items-center">
                      Due Date
                      {sortColumn === "due_date" && (
                        <FiChevronDown className={`ml-1 transition ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end">
                      Amount
                      {sortColumn === "amount" && (
                        <FiChevronDown className={`ml-1 transition ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("balance_due")}
                  >
                    <div className="flex items-center justify-end">
                      Balance Due
                      {sortColumn === "balance_due" && (
                        <FiChevronDown className={`ml-1 transition ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && paginatedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      No invoices found.
                    </td>
                  </tr>
                )}
                {paginatedInvoices.map((inv) => {
                  const balanceDue = inv.total - (inv.paidAmount || 0);
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-blue-50 dark:hover:bg-gray-800 transition cursor-pointer"
                      onClick={() => handleInvoiceClick(inv.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {inv.createdAt
                          ? format(new Date(inv.createdAt), "dd MMM yyyy, hh:mm a")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700 dark:text-blue-400">
                        {inv.invoiceCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {inv.customer?.displayName}
                        {inv.customer?.companyName && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400">{inv.customer.companyName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {inv.invoiceDate
                          ? format(new Date(inv.invoiceDate), "dd MMM yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {inv.dueDate
                          ? format(new Date(inv.dueDate), "dd MMM yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        ₹{(inv.total || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        ₹{balanceDue.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium shadow-sm ${statusColors[inv.status] || statusColors.Draft}`}
                        >
                          {statusIcons[inv.status]}
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          <ActionMenu 
                            invoiceId={inv.id} 
                            onAction={handleAction}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // Split Screen View (After clicking an invoice)
          <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden min-h-[600px]">
            {/* Left Panel - Simplified Invoice List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
              <div className="overflow-y-auto h-full">
                {/* Search Bar for Left Panel */}
                <div className="sticky top-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 z-10 shadow-sm">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search in Invoices"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Invoice List Items */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className={`p-4 hover:bg-blue-50 dark:hover:bg-gray-800 transition cursor-pointer hover:scale-[1.02] duration-200 ${
                        selectedInvoiceId === inv.id ? "bg-blue-50 dark:bg-gray-800 border-r-4 border-blue-500 dark:border-blue-400" : ""
                      }`}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                    >
                      {/* Customer Name */}
                      <div className="font-semibold text-gray-900 dark:text-white mb-1 text-base">
                        {inv.customer?.displayName || 'No Customer'}
                      </div>
                      
                      {/* Invoice Code and Date */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {inv.invoiceCode}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {inv.invoiceDate
                            ? format(new Date(inv.invoiceDate), "dd/MM/yyyy")
                            : "-"}
                        </span>
                      </div>
                      
                      {/* Amount and Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{(inv.total || 0).toLocaleString("en-IN")}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shadow-sm ${statusColors[inv.status] || statusColors.Draft}`}
                        >
                          {inv.status === 'Paid' && <FiCheckCircle className="mr-1 text-xs" />}
                          {inv.status === 'Draft' && <FiFileText className="mr-1 text-xs" />}
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Panel - Invoice Details */}
            <div className="w-2/3">
              <InvoiceDetailPanel 
                invoice={selectedInvoice} 
                onClose={() => setSelectedInvoiceId(null)}
                onAction={handleAction}
              />
            </div>
          </div>
        )}
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedInvoices.length)} of {sortedInvoices.length} invoices
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`w-8 h-8 rounded text-xs shadow-sm transition ${currentPage === pageNum ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="mx-1 text-gray-500 dark:text-gray-400">...</span>
            )}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                className={`w-8 h-8 rounded text-xs shadow-sm transition ${currentPage === totalPages ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            )}
            <button 
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              aria-label="Next page"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
