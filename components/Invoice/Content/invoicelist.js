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
  FiUser,
  FiPhone,
  FiHome,
  FiCreditCard,
} from "react-icons/fi";
import { format } from "date-fns";
import Link from "next/link";
import { Tooltip } from 'react-tooltip';
import { motion, AnimatePresence } from "framer-motion";

const statusColors = {
  Paid: "text-green-700 bg-green-50 border-green-200",
  Pending: "text-amber-700 bg-amber-50 border-amber-200",
  Draft: "text-gray-600 bg-gray-50 border-gray-200",
  Cancelled: "text-red-700 bg-red-50 border-red-200",
  Sent: "text-blue-700 bg-blue-50 border-blue-200",
  Overdue: "text-red-800 bg-red-100 border-red-300",
  PartiallyPaid: "text-purple-700 bg-purple-50 border-purple-200",
};

const statusIcons = {
  Draft: <FiFileText className="inline mr-1.5 text-xs" />,
  Paid: <FiCheckCircle className="inline mr-1.5 text-xs" />,
  Pending: <FiClock className="inline mr-1.5 text-xs" />,
  Cancelled: <FiXCircle className="inline mr-1.5 text-xs" />,
  Sent: <FiMail className="inline mr-1.5 text-xs" />,
  Overdue: <FiClock className="inline mr-1.5 text-xs" />,
  PartiallyPaid: <FiCheckCircle className="inline mr-1.5 text-xs" />,
};

const paymentMethodIcons = {
  Cash: <FiDollarSign className="inline mr-1.5 text-xs" />,
  'Bank Transfer': <FiCreditCard className="inline mr-1.5 text-xs" />,
  Cheque: <FiFileText className="inline mr-1.5 text-xs" />,
  'Credit Card': <FiCreditCard className="inline mr-1.5 text-xs" />,
  'Debit Card': <FiCreditCard className="inline mr-1.5 text-xs" />,
  UPI: <FiShare2 className="inline mr-1.5 text-xs" />,
  Other: <FiDollarSign className="inline mr-1.5 text-xs" />,
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

  const menuItems = [
    { label: "Edit", icon: <FiEdit className="mr-2 text-xs" />, action: "edit", color: "text-gray-700" },
    { label: "Download", icon: <FiDownload className="mr-2 text-xs" />, action: "download", color: "text-gray-700" },
    { label: "Clone", icon: <FiCopy className="mr-2 text-xs" />, action: "clone", color: "text-gray-700" },
    { label: "Record Payment", icon: <FiDollarSign className="mr-2 text-xs" />, action: "recordPayment", color: "text-gray-700" },
    { label: "Delete", icon: <FiTrash2 className="mr-2 text-xs" />, action: "delete", color: "text-red-600" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="text-gray-500 hover:text-blue-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="More"
        data-tooltip-id="action-tooltip"
      >
        <FiMoreVertical className="text-sm" />
      </button>
      <Tooltip id="action-tooltip" content="More actions" place="top" />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.action}
                  onClick={() => handleAction(item.action)}
                  className={`flex items-center px-3 py-2 text-xs ${item.color} hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 w-full text-left transition-colors duration-150`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="p-4 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Payment</h3>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status] || statusColors.Draft}`}>
            {statusIcons[invoice.status]}
            {invoice.status}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Balance: ₹{(invoice.total - (invoice.paidAmount || 0)).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment for
            </label>
            <input
              type="text"
              value={formData.paymentFor}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              readOnly
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Customer Name*
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment #*
            </label>
            <input
              type="text"
              value={formData.paymentNumber}
              onChange={(e) => handleInputChange('paymentNumber', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount Received*
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                value={formData.amountReceived}
                onChange={(e) => handleInputChange('amountReceived', e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Date*
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => handleInputChange('paymentDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Received On
            </label>
            <input
              type="text"
              value={formData.paymentReceivedOn}
              onChange={(e) => handleInputChange('paymentReceivedOn', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              placeholder="Bank account, Cash, etc."
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tax deducted?
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="taxDeducted"
                value="No"
                checked={formData.taxDeducted === 'No'}
                onChange={(e) => handleInputChange('taxDeducted', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">No Tax deducted</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="taxDeducted"
                value="Yes"
                checked={formData.taxDeducted === 'Yes'}
                onChange={(e) => handleInputChange('taxDeducted', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Yes, TDS (Income Tax)</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              PAN
            </label>
            <input
              type="text"
              value={formData.pan}
              onChange={(e) => handleInputChange('pan', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              placeholder="Enter PAN number"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bank Charges (if any)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                value={formData.bankCharges}
                onChange={(e) => handleInputChange('bankCharges', e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                step="0.01"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Mode
            </label>
            <select
              value={formData.paymentMode}
              onChange={(e) => handleInputChange('paymentMode', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
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
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reference#
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              placeholder="Transaction ID, Cheque number, etc."
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            placeholder="Additional notes..."
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Attachments
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 transition-all duration-200 hover:border-blue-500">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              multiple
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center text-center text-gray-700 dark:text-gray-300 p-4"
            >
              <FiPaperclip className="mb-2 text-xl text-blue-500" />
              <span className="text-sm font-medium">Drag & drop files here or click to browse</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supports: PDF, JPG, PNG (Max 5MB each)</span>
            </label>
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-600 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-500 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <FiFileText className="text-gray-500 dark:text-gray-300" />
                      <span className="text-sm text-gray-900 dark:text-white truncate max-w-xs">{file.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)}KB</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
            onClick={() => {}}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
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
  const [isPrintView, setIsPrintView] = useState(false);

  if (!invoice) return null;

  const subtotal = useMemo(() => invoice.Item.reduce((sum, item) => sum + item.amount, 0), [invoice.Item]);
  const gst = useMemo(() => invoice.Item.reduce((sum, item) => sum + (item.amount * (item.GstPercentage || 0)) / 100, 0), [invoice.Item]);
  const total = subtotal + gst;
  const balanceDue = total - (invoice.paidAmount || 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiEye className="mr-1" /> },
    { id: 'edit', label: 'Edit', icon: <FiEdit className="mr-1" /> },
    { id: 'payments', label: 'Payments', icon: <FiDollarSign className="mr-1" /> },
    { id: 'clone', label: 'Clone', icon: <FiCopy className="mr-1" /> },
  ];

  const handlePrint = () => {
    setIsPrintView(true);
    setTimeout(() => {
      window.print();
      setIsPrintView(false);
    }, 300);
  };

  return (
    <div className={`bg-white dark:bg-gray-900 shadow-sm h-full overflow-y-auto ${isPrintView ? 'print-view' : ''}`}>
      {/* Header */}
      <div className={`flex justify-between items-center px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 ${isPrintView ? 'hidden' : ''}`}>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Invoice #{invoice.invoiceCode}
          </h2>
          <div className="flex items-center mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium shadow-sm ${statusColors[invoice.status] || statusColors.Draft}`}
            >
              {statusIcons[invoice.status]}
              {invoice.status}
            </span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {invoice.invoiceDate
                ? format(new Date(invoice.invoiceDate), "dd MMM yyyy")
                : "-"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
            title="Print"
          >
            <FiPrinter className="text-lg" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
            title="Download"
          >
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
      <div className={`border-b dark:border-gray-700 ${isPrintView ? 'hidden' : ''}`}>
        <nav className="flex space-x-4 px-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-xs flex items-center transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="animate-fadeIn p-4 print:p-0">
          {/* Invoice Template */}
          <div className="max-w-4xl mx-auto">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <FiFileText className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">TAX INVOICE</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">From your company name</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p>123 Business Street, Suite 456</p>
                  <p>New York, NY 10001, USA</p>
                  <p>GSTIN: 22AAAAA0000A1Z5</p>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                    #{invoice.invoiceCode}
                  </span>
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <div>
                    <span className="font-medium">Invoice Date:</span> {format(new Date(invoice.invoiceDate), "dd/MM/yyyy")}
                  </div>
                  <div>
                    <span className="font-medium">Due Date:</span> {format(new Date(invoice.dueDate), "dd/MM/yyyy")}
                  </div>
                  <div>
                    <span className="font-medium">Terms:</span> Due on Receipt
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold mb-2 text-sm text-gray-900 dark:text-white">Bill To</h3>
                <div className="space-y-1">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{invoice.customer?.displayName}</p>
                  {invoice.customer?.companyName && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">{invoice.customer.companyName}</p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <FiHome className="inline mr-1" /> {invoice.customer?.billingAddress}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {invoice.customer?.billingCity}, {invoice.customer?.billingState} - {invoice.customer?.billingPinCode}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <FiPhone className="inline mr-1" /> {invoice.customer?.phone || 'Not provided'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <FiMail className="inline mr-1" /> {invoice.customer?.email || 'Not provided'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <FiUser className="inline mr-1" /> GSTIN: {invoice.customer?.gstNumber || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold mb-2 text-sm text-gray-900 dark:text-white">Payment Info</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status] || statusColors.Draft}`}
                    >
                      {statusIcons[invoice.status]}
                      {invoice.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance Due</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{balanceDue.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(invoice.dueDate), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Item & Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.Item.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                        <div className="font-medium">{item.itemDetails}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</div>
                        )}
                      </td>
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
              <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Sub Total</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">GST</span>
                    <span>₹{gst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Amount Paid</span>
                    <span>₹{(invoice.paidAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                    <span>Balance Due</span>
                    <span>₹{balanceDue.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoice.customerNotes || "Thanks for your business. Please make payment by the due date."}
              </p>
            </div>

            {/* Payment Instructions */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Payment Instructions:</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Bank Transfer</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <p>Account Name: Your Company Name</p>
                    <p>Bank: National Bank</p>
                    <p>Account #: 1234567890</p>
                    <p>IFSC: NBIN0001234</p>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="font-medium text-green-800 dark:text-green-200 mb-1">UPI Payment</div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    <p>UPI ID: yourcompany@upi</p>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">Other Methods</div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">
                    <p>Cash, Cheque, Credit/Debit Card</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
              <p>Thank you for your business!</p>
              <p className="mt-1">If you have any questions concerning this invoice, contact accounts@yourcompany.com</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
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

      {activeTab === 'payments' && (
        <ReceivedPaymentsTab invoice={invoice} onAction={onAction} />
      )}

      {activeTab === 'clone' && (
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track, manage, and analyze all your invoices in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/admin/content/newinvoice" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
            >
              <FiPlus className="mr-2 text-sm" /> New Invoice
            </Link>
            <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center shadow-sm hover:shadow-md">
              <FiDownload className="mr-2 text-sm" /> Export
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 mb-4 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 text-sm" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-56 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white shadow-sm transition-all duration-200"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white shadow-sm transition-all duration-200"
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
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                onClick={() => setShowFilter((v) => !v)}
              >
                <FiFilter className="mr-1.5" />
                {showFilter ? "Hide Filters" : "More Filters"}
              </button>
              <button 
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200" 
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw className="mr-1.5" />
                Refresh
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredInvoices.length} invoice(s) found
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-50 dark:bg-gray-700 p-4 flex flex-wrap gap-4 border-t dark:border-gray-700"
            >
              <div className="min-w-[200px]">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                <select 
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-full dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="All">All Customers</option>
                  {Array.from(new Set(invoices.map(inv => inv.customer?.displayName))).map(name => (
                    name && <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[300px]">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                <div className="flex items-center gap-2">
                  <select 
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="invoice_date">Invoice Date</option>
                    <option value="due_date">Due Date</option>
                    <option value="created_time">Created Time</option>
                  </select>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">to</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
              </div>
              <div className="min-w-[250px]">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <div className="flex items-center gap-2">
                  <select 
                    value={amountFilter}
                    onChange={(e) => setAmountFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="=">Equal to</option>
                    <option value=">">Greater than</option>
                    <option value="<">Less than</option>
                    <option value="between">Between</option>
                  </select>
                  <input 
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-24 dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    placeholder="Amount" 
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="min-w-[200px]">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Invoice #</label>
                <input 
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-full dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Invoice number" 
                  value={invoiceNumberFilter}
                  onChange={(e) => setInvoiceNumberFilter(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg">
                  Apply Filters
                </button>
                <button 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 px-3 py-2"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Conditional Rendering */}
        {!selectedInvoice ? (
          // Full Width Table View (Initial View)
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                      onClick={() => handleSort("created_time")}
                    >
                      <div className="flex items-center">
                        Created Time
                        {sortColumn === "created_time" && (
                          <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                      onClick={() => handleSort("invoice_date")}
                    >
                      <div className="flex items-center">
                        Invoice Date
                        {sortColumn === "invoice_date" && (
                          <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                      onClick={() => handleSort("due_date")}
                    >
                      <div className="flex items-center">
                        Due Date
                        {sortColumn === "due_date" && (
                          <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        {sortColumn === "amount" && (
                          <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                      onClick={() => handleSort("balance_due")}
                    >
                      <div className="flex items-center justify-end">
                        Balance Due
                        {sortColumn === "balance_due" && (
                          <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
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
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                        <p className="mt-2">Loading invoices...</p>
                      </td>
                    </tr>
                  )}
                  {!loading && paginatedInvoices.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                        <FiFileText className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
                        <p className="mt-2">No invoices found matching your criteria</p>
                        <button 
                          className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                  {paginatedInvoices.map((inv) => {
                    const balanceDue = inv.total - (inv.paidAmount || 0);
                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 cursor-pointer"
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
                          <div className="font-medium">{inv.customer?.displayName}</div>
                          {inv.customer?.companyName && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{inv.customer.companyName}</div>
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
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status] || statusColors.Draft}`}
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
          </div>
        ) : (
          // Split Screen View (After clicking an invoice)
          <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden min-h-[600px] border dark:border-gray-700">
            {/* Left Panel - Simplified Invoice List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Search Bar for Left Panel */}
              <div className="sticky top-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 z-10 shadow-sm">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-sm" />
                  <input
                    type="text"
                    placeholder="Search in Invoices"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white shadow-sm transition-all duration-200"
                  />
                </div>
              </div>

              {/* Invoice List Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedInvoices.map((inv) => {
                  const balanceDue = inv.total - (inv.paidAmount || 0);
                  return (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer ${
                        selectedInvoiceId === inv.id ? "bg-blue-50 dark:bg-gray-800 border-r-4 border-blue-500 dark:border-blue-400" : ""
                      }`}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                    >
                      {/* Customer Name */}
                      <div className="font-semibold text-gray-900 dark:text-white mb-1 text-sm truncate">
                        {inv.customer?.displayName || 'No Customer'}
                      </div>
                      
                      {/* Invoice Code and Date */}
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          #{inv.invoiceCode}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {inv.invoiceDate
                            ? format(new Date(inv.invoiceDate), "dd/MM/yyyy")
                            : "-"}
                        </span>
                      </div>
                      
                      {/* Amount and Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          ₹{(inv.total || 0).toLocaleString("en-IN")}
                        </span>
                        <div className="flex items-center space-x-2">
                          {balanceDue > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Due: ₹{balanceDue.toLocaleString("en-IN")}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status] || statusColors.Draft}`}
                          >
                            {statusIcons[inv.status]}
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedInvoices.length)} of {sortedInvoices.length} invoices
          </div>
          <div className="flex items-center gap-1">
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <FiChevronLeft className="text-sm" />
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
                  className={`w-8 h-8 rounded-lg text-sm transition-all duration-200 ${
                    currentPage === pageNum 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="mx-1 text-gray-500 dark:text-gray-400 text-sm">...</span>
            )}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                className={`w-8 h-8 rounded-lg text-sm transition-all duration-200 ${
                  currentPage === totalPages 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
                }`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            )}
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              aria-label="Next page"
            >
              <FiChevronRight className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}