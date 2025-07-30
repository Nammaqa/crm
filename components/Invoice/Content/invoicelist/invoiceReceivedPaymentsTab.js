"use client";
import React, { useState } from "react";
import { FiDollarSign, FiFileText, FiX } from "react-icons/fi";
import { format } from "date-fns";

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
  Paid: <></>,
  Pending: <></>,
  Cancelled: <></>,
  Sent: <></>,
  Overdue: <></>,
  PartiallyPaid: <></>,
  Refunded: <></>,
};

export default function ReceivedPaymentsTab({ invoice, onAction }) {
  // Local state for form toggles and inputs
  const [selectedOption, setSelectedOption] = useState("recordPayment"); // or "writeOff"
  const [formData, setFormData] = useState({
    customerName: invoice?.customer?.displayName || "",
    paymentNumber: "",
    amountReceived: "",
    taxDeducted: "No",
    withheldAmount: "",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    paymentReceivedOn: "",
    notes: "",
    bankCharges: "",
    paymentMode: "Bank Transfer",
    reference: "",
    attachments: [],
    writeOffDate: format(new Date(), "yyyy-MM-dd"),
    reason: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption === "recordPayment") {
      onAction("recordPayment", invoice.id, formData);
    } else {
      onAction("writeOff", invoice.id, formData);
    }
    // Reset form
    setFormData({
      customerName: invoice?.customer?.displayName || "",
      paymentNumber: "",
      amountReceived: "",
      taxDeducted: "No",
      withheldAmount: "",
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentReceivedOn: "",
      notes: "",
      bankCharges: "",
      paymentMode: "Bank Transfer",
      reference: "",
      attachments: [],
      writeOffDate: format(new Date(), "yyyy-MM-dd"),
      reason: "",
    });
  };

  const handleCancel = () => {
    // Clear form fields to initial
    setFormData({
      customerName: invoice?.customer?.displayName || "",
      paymentNumber: "",
      amountReceived: "",
      taxDeducted: "No",
      withheldAmount: "",
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentReceivedOn: "",
      notes: "",
      bankCharges: "",
      paymentMode: "Bank Transfer",
      reference: "",
      attachments: [],
      writeOffDate: format(new Date(), "yyyy-MM-dd"),
      reason: "",
    });
  };

  return (
    <div className="p-4 dark:bg-gray-800 rounded-lg overflow-y-auto max-h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payments</h3>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[invoice.status] || statusColors.Draft
            }`}
          >
            {statusIcons[invoice.status]}
            {invoice.status}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Balance: ₹{(invoice.total - (invoice.paidAmount || 0)).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Payment or Write-Off Selection */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="paymentOption"
              value="recordPayment"
              checked={selectedOption === "recordPayment"}
              onChange={() => setSelectedOption("recordPayment")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Record Payment</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="paymentOption"
              value="writeOff"
              checked={selectedOption === "writeOff"}
              onChange={() => setSelectedOption("writeOff")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Write Off</span>
          </label>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedOption === "recordPayment" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name*</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment #*</label>
                <input
                  type="text"
                  value={formData.paymentNumber}
                  onChange={(e) => handleInputChange("paymentNumber", e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Received*</label>
                <input
                  type="number"
                  value={formData.amountReceived}
                  onChange={(e) => handleInputChange("amountReceived", e.target.value)}
                  step="0.01"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Charges (if any)</label>
                <input
                  type="number"
                  value={formData.bankCharges}
                  onChange={(e) => handleInputChange("bankCharges", e.target.value)}
                  step="0.01"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Date*</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Received On</label>
                <input
                  type="text"
                  value={formData.paymentReceivedOn}
                  onChange={(e) => handleInputChange("paymentReceivedOn", e.target.value)}
                  placeholder="Bank account, Cash, etc."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => handleInputChange("paymentMode", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Cheque</option>
                  <option>Credit Card</option>
                  <option>UPI</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference Number</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => handleInputChange("reference", e.target.value)}
                  placeholder="Transaction ID, Cheque number, etc."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Tax deducted radio */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax deducted?</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="taxDeducted"
                    value="No"
                    checked={formData.taxDeducted === "No"}
                    onChange={(e) => handleInputChange("taxDeducted", e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">No Tax deducted</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="taxDeducted"
                    value="Yes"
                    checked={formData.taxDeducted === "Yes"}
                    onChange={(e) => handleInputChange("taxDeducted", e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Yes, TDS</span>
                </label>
              </div>
              {formData.taxDeducted === "Yes" && (
                <div className="mt-4 space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Withheld Amount*</label>
                  <input
                    type="number"
                    value={formData.withheldAmount}
                    onChange={(e) => handleInputChange("withheldAmount", e.target.value)}
                    step="0.01"
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1 mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Additional notes..."
              />
            </div>

            {/* Attachments */}
            <div className="space-y-1 mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attachments</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 hover:border-blue-500 transition-all duration-200">
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
                  Click or drag files here to upload
                </label>

                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-600 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-500 shadow-sm">
                        <span className="truncate max-w-xs">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          aria-label="Remove attachment"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {selectedOption === "writeOff" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Write Off Date*</label>
              <input
                type="date"
                value={formData.writeOffDate}
                onChange={(e) => handleInputChange("writeOffDate", e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason*</label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                rows={3}
                placeholder="Reason for write off..."
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
