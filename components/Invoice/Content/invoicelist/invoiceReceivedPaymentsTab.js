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
  // ... Add icons for other statuses if needed
};

export default function ReceivedPaymentsTab({ invoice, onAction }) {
  const [selectedOption, setSelectedOption] = useState("recordPayment");
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };
  const removeAttachment = (idx) =>
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));

  const handleCancel = () => {
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
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const url = `/api/invoice/${invoice.id}/payment`;
      let res, result;

      if (formData.attachments && formData.attachments.length > 0) {
        const fd = new FormData();
        fd.append("action", selectedOption);
        Object.entries(formData).forEach(([key, value]) => {
          if (key === "attachments") value.forEach((file) => fd.append("attachments", file));
          else fd.append(key, value ?? "");
        });
        res = await fetch(url, { method: "POST", body: fd });
      } else {
        const payload = { action: selectedOption, ...formData };
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      result = await res.json();

      if (result.success) {
        if (typeof onAction === "function") onAction(selectedOption, invoice.id, formData);
        handleCancel();
      } else {
        setSubmitError(result.error || "Failed to submit payment");
      }
    } catch (error) {
      setSubmitError(error.message || "Submission error");
    } finally {
      setSubmitting(false);
    }
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
            Balance: ₹{(invoice.total - (invoice.amountReceived || 0)).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      {/* Option Radio */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <label className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 cursor-pointer ${selectedOption === "recordPayment" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}>
          <input
            type="radio"
            name="paymentOption"
            checked={selectedOption === "recordPayment"}
            onChange={() => setSelectedOption("recordPayment")}
            className="accent-blue-600"
          />
          <span className="text-sm font-semibold text-blue-700">Record Payment</span>
        </label>
        <label className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 cursor-pointer ${selectedOption === "writeOff" ? "border-red-600 bg-red-50" : "border-gray-200"}`}>
          <input
            type="radio"
            name="paymentOption"
            checked={selectedOption === "writeOff"}
            onChange={() => setSelectedOption("writeOff")}
            className="accent-red-600"
          />
          <span className="text-sm font-semibold text-red-700">Write Off</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {selectedOption === "recordPayment" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Customer Name*</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment #*</label>
              <input
                type="text"
                value={formData.paymentNumber}
                onChange={(e) => handleInputChange("paymentNumber", e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Amount Received*</label>
              <input
                type="number"
                value={formData.amountReceived}
                onChange={(e) => handleInputChange("amountReceived", e.target.value)}
                step="0.01"
                required
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bank Charges (if any)</label>
              <input
                type="number"
                value={formData.bankCharges}
                onChange={(e) => handleInputChange("bankCharges", e.target.value)}
                step="0.01"
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Date*</label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Received On</label>
              <input
                type="text"
                value={formData.paymentReceivedOn}
                onChange={(e) => handleInputChange("paymentReceivedOn", e.target.value)}
                placeholder="Bank account, Cash, etc."
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => handleInputChange("paymentMode", e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded"
              >
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Cheque</option>
                <option>Credit Card</option>
                <option>UPI</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Reference Number</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                placeholder="Transaction ID, Cheque number, etc."
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Tax deducted?</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="taxDeducted"
                    value="No"
                    checked={formData.taxDeducted === "No"}
                    onChange={(e) => handleInputChange("taxDeducted", e.target.value)}
                  />
                  <span>No Tax deducted</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="taxDeducted"
                    value="Yes"
                    checked={formData.taxDeducted === "Yes"}
                    onChange={(e) => handleInputChange("taxDeducted", e.target.value)}
                  />
                  <span>Yes, TDS</span>
                </label>
              </div>
              {formData.taxDeducted === "Yes" && (
                <div className="mt-2">
                  <label className="text-sm font-medium">Withheld Amount*</label>
                  <input
                    type="number"
                    value={formData.withheldAmount}
                    onChange={(e) => handleInputChange("withheldAmount", e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border rounded"
                  />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded"
                placeholder="Additional notes..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Attachments</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  multiple
                />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-600">
                  Click or drag files here to upload
                </label>
                <div>
                  {formData.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center bg-white px-2 py-1 rounded">
                          <span className="flex-auto truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-400 ml-2"
                            aria-label="Remove"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedOption === "writeOff" && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium">Write Off Date*</label>
              <input
                type="date"
                value={formData.writeOffDate}
                onChange={(e) => handleInputChange("writeOffDate", e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reason*</label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                rows={2}
                placeholder="Reason for write off..."
                required
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>
          </div>
        )}
        {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded border border-gray-400 bg-white hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm rounded bg-blue-700 text-white hover:bg-blue-800"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
