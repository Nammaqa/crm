"use client";
import React, { useState, useEffect } from 'react';

// Helper functions for date calculations
function formatDate(date) {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function getLastDayOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  return formatDate(d);
}

function getLastDayOfNextMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 2, 0);
  return formatDate(d);
}

const InvoiceForm = () => {
  const today = formatDate(new Date());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Customer dropdown state
  const [customers, setCustomers] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(true);

  const [items, setItems] = useState([
    { id: Date.now(), name: '', description: '', quantity: 1, rate: 0 }
  ]);
  const [formData, setFormData] = useState({
    customerId: '', // Will store the selected customer id
    invoiceNumber: '',
    invoiceDate: today,
    dueDate: '',
    terms: '',
    discount: 0,
    taxType: 'TDS',
    taxRate: '',
    adjustment: 0,
    notes: 'Thanks for your business.',
    termsAndConditions: '',
    files: [],
  });

  // Fetch customers from API on mount
  useEffect(() => {
    async function fetchCustomers() {
      setCustomerLoading(true);
      try {
        const res = await fetch("/api/customer");
        const data = await res.json();
        if (data.success) {
          setCustomers(data.data);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        setCustomers([]);
      }
      setCustomerLoading(false);
    }
    fetchCustomers();
  }, []);

  useEffect(() => {
    let dueDate = formData.dueDate;
    if (formData.terms && formData.invoiceDate) {
      switch (formData.terms) {
        case 'Net 15':
          dueDate = addDays(formData.invoiceDate, 15);
          break;
        case 'Net 30':
          dueDate = addDays(formData.invoiceDate, 30);
          break;
        case 'Net 45':
          dueDate = addDays(formData.invoiceDate, 45);
          break;
        case 'Net 60':
          dueDate = addDays(formData.invoiceDate, 60);
          break;
        case 'Due on Receipt':
          dueDate = formData.invoiceDate;
          break;
        case 'Due end of the month':
          dueDate = getLastDayOfMonth(formData.invoiceDate);
          break;
        case 'Due end of next month':
          dueDate = getLastDayOfNextMonth(formData.invoiceDate);
          break;
        default:
          break;
      }
    }
    setFormData(prev => ({
      ...prev,
      dueDate
    }));
  }, [formData.terms, formData.invoiceDate]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    if (field === 'name' || field === 'description') {
      updatedItems[index][field] = value;
    } else {
      updatedItems[index][field] = value === "" ? "" : parseFloat(value);
    }
    setItems(updatedItems);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      { id: Date.now() + Math.random(), name: '', description: '', quantity: 1, rate: 0 }
    ]);
  };

  const handleRemoveRow = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val;
    if (type === 'number') {
      val = value === "" ? "" : parseFloat(value);
    } else {
      val = value;
    }
    setFormData({ ...formData, [name]: val });
  };

  const calculateSubtotal = () =>
    items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)), 0);

  const calculateTax = () =>
    (calculateSubtotal() * (parseFloat(formData.taxRate) || 0)) / 100;

  const calculateTotal = () =>
    calculateSubtotal() -
    (calculateSubtotal() * (parseFloat(formData.discount) || 0)) / 100 +
    calculateTax() +
    (parseFloat(formData.adjustment) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Find selected customer for display
    const selectedCustomer = customers.find(c => c.id === Number(formData.customerId));
    const invoiceData = {
      ...formData,
      customerName: selectedCustomer
        ? (selectedCustomer.displayName || selectedCustomer.companyName || selectedCustomer.emailAddress)
        : '',
      items,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
    };
    console.log('Submitting Invoice:', invoiceData);
    // TODO: Replace with actual API call
  };

  const handlePrintDownload = async () => {
    setIsGeneratingPDF(true);
    try {
      // Dynamically import jsPDF and autoTable
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      // Initialize jsPDF
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.text('INVOICE', 14, 18);

      // Invoice details
      doc.setFontSize(12);
      doc.text(`Invoice #: ${formData.invoiceNumber || '-'}`, 14, 28);
      doc.text(`Invoice Date: ${formData.invoiceDate || '-'}`, 14, 34);
      doc.text(`Due Date: ${formData.dueDate || '-'}`, 14, 40);
      // Show customer name from dropdown
      const selectedCustomer = customers.find(c => c.id === Number(formData.customerId));
      doc.text(
        `Customer Name: ${
          selectedCustomer
            ? (selectedCustomer.displayName || selectedCustomer.companyName || selectedCustomer.emailAddress)
            : '-'
        }`,
        14,
        46
      );

      // Items Table
      const itemRows = items.map((item, idx) => [
        idx + 1,
        item.name || '',
        item.description || '',
        item.quantity === "" || isNaN(item.quantity) ? '' : item.quantity,
        item.rate === "" || isNaN(item.rate) ? '' : item.rate,
        ((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)
      ]);

      // Add table using autoTable
      autoTable(doc, {
        startY: 54,
        head: [['#', 'Item', 'Description', 'Qty', 'Rate', 'Amount']],
        body: itemRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
      });

      let finalY = doc.lastAutoTable.finalY || 54;

      // Summary section
      doc.setFontSize(12);
      doc.text('Summary', 14, finalY + 10);

      const summaryRows = [
        ['Subtotal', `₹ ${calculateSubtotal().toFixed(2)}`],
        ['Discount', `${formData.discount === "" || isNaN(formData.discount) ? 0 : formData.discount}%`],
        [formData.taxType, `${formData.taxRate === "" || isNaN(formData.taxRate) ? 0 : formData.taxRate}%`],
        ['Adjustment', `₹ ${formData.adjustment === "" || isNaN(formData.adjustment) ? 0 : formData.adjustment}`],
        ['Total', `₹ ${calculateTotal().toFixed(2)}`],
      ];

      autoTable(doc, {
        startY: finalY + 14,
        head: [],
        body: summaryRows,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
      });

      // Notes and Terms
      let afterSummaryY = doc.lastAutoTable.finalY || (finalY + 14 + summaryRows.length * 8);

      if (formData.notes) {
        doc.setFontSize(11);
        doc.text('Notes:', 14, afterSummaryY + 10);
        doc.setFontSize(10);
        doc.text(formData.notes, 14, afterSummaryY + 16);
        afterSummaryY += 12;
      }
      if (formData.termsAndConditions) {
        doc.setFontSize(11);
        doc.text('Terms & Conditions:', 14, afterSummaryY + 18);
        doc.setFontSize(10);
        doc.text(formData.termsAndConditions, 14, afterSummaryY + 24);
      }

      // Save the PDF
      doc.save(`Invoice_${formData.invoiceNumber || 'Draft'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const invisibleInput =
    "w-full bg-transparent border-none outline-none focus:ring-0 focus:border-b focus:border-blue-400 transition placeholder-gray-400 text-gray-800";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto px-6 py-10 bg-white shadow-2xl rounded-2xl space-y-10 text-gray-800"
    >
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">
        Create Invoice
      </h2>

      {/* Invoice Details */}
      <div className="space-y-6">
        <div>
          <label className="block font-semibold text-sm mb-1">
            Customer Name<span className="text-red-500">*</span>
          </label>
          <select
            name="customerId"
            required
            value={formData.customerId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            disabled={customerLoading}
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName || c.companyName || c.emailAddress}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-sm mb-1">Invoice #</label>
          <input
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block font-semibold text-sm mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-sm mb-1">Terms</label>
            <select
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            >
              <option value="">Select Terms</option>
              <option>Net 15</option>
              <option>Net 30</option>
              <option>Net 45</option>
              <option>Net 60</option>
              <option>Due on Receipt</option>
              <option>Due end of the month</option>
              <option>Due end of next month</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-sm mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
              readOnly={!!formData.terms}
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Item Details</h3>
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-gradient-to-br from-white to-blue-50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                <th className="border-b px-6 py-3 text-left font-semibold">Item</th>
                <th className="border-b px-6 py-3 text-right font-semibold">Qty</th>
                <th className="border-b px-6 py-3 text-right font-semibold">Rate</th>
                <th className="border-b px-6 py-3 text-right font-semibold">Amount</th>
                <th className="border-b px-6 py-3 text-center font-semibold">Remove</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'
                  } hover:bg-blue-100`}
                >
                  <td className="px-6 py-3">
                    <input
                      type="text"
                      value={item.name}
                      placeholder="Item name"
                      onChange={(e) =>
                        handleItemChange(idx, 'name', e.target.value)
                      }
                      className={invisibleInput}
                    />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity === "" || isNaN(item.quantity) ? "" : item.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, 'quantity', e.target.value)
                      }
                      className={invisibleInput + " text-right"}
                    />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={item.rate === "" || isNaN(item.rate) ? "" : item.rate}
                      onChange={(e) =>
                        handleItemChange(idx, 'rate', e.target.value)
                      }
                      className={invisibleInput + " text-right"}
                    />
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-blue-700">
                    {((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="text-red-500 font-bold hover:text-red-700 transition"
                      title="Remove Item"
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="mt-4 inline-block text-sm px-5 py-2 border-2 border-blue-400 rounded-lg text-blue-700 font-semibold bg-white hover:bg-blue-50 transition"
        >
          + Add New Item
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <label className="block font-semibold mb-2">Customer Notes</label>
          <textarea
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
          />
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold text-blue-900">
              ₹ {calculateSubtotal().toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Discount</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                name="discount"
                value={formData.discount === "" || isNaN(formData.discount) ? "" : formData.discount}
                onChange={handleChange}
                className="w-20 text-right border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
              <span>%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">{formData.taxType}</span>
            <select
              name="taxRate"
              value={formData.taxRate === "" || isNaN(formData.taxRate) ? "" : formData.taxRate}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              <option value="">Tax %</option>
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Adjustment</span>
            <input
              type="number"
              name="adjustment"
              value={formData.adjustment === "" || isNaN(formData.adjustment) ? "" : formData.adjustment}
              onChange={handleChange}
              className="w-24 text-right border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-4">
            <span>Total</span>
            <span className="text-blue-700">
              ₹ {calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms and Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-2">
            Terms & Conditions
          </label>
          <textarea
            name="termsAndConditions"
            rows="3"
            value={formData.termsAndConditions}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Attach File(s)</label>
          <input
            type="file"
            multiple
            onChange={(e) =>
              setFormData({ ...formData, files: e.target.files })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Max 3 files, 10MB each
          </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between pt-8 border-t">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 font-medium disabled:opacity-50"
          onClick={handlePrintDownload}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? 'Generating PDF...' : 'Print/Download'}
        </button>
        <div className="space-x-2">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            Save & Send
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;