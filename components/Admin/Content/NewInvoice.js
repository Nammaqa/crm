"use client";
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Tax options
const TAX_OPTIONS = [
  { label: "Non-Taxable", value: "non-taxable", rate: 0, description: "" },
  { label: "Out of Scope", value: "out-of-scope", rate: 0, description: "Supplies on which you don't charge any GST or include them in the returns." },
  { label: "Non-GST Supply", value: "non-gst-supply", rate: 0, description: "Supplies which do not come under GST such as petroleum products and liquor" },
  { label: "GST0 (0%)", value: "gst0", rate: 0 },
  { label: "GST5 (5%)", value: "gst5", rate: 5 },
  { label: "GST12 (12%)", value: "gst12", rate: 12 },
  { label: "GST18 (18%)", value: "gst18", rate: 18 },
  { label: "GST28 (28%)", value: "gst28", rate: 28 },
];

// TDS options
const TDS_OPTIONS = [
  { label: "Commission or Brokerage [5%]", value: 5 },
  { label: "Commission or Brokerage (Reduced) [3.75%]", value: 3.75 },
  { label: "Dividend [10%]", value: 10 },
  { label: "Dividend (Reduced) [7.5%]", value: 7.5 },
  { label: "Other Interest than securities [10%]", value: 10 },
  { label: "Other Interest than securities (Reduced) [7.5%]", value: 7.5 },
  { label: "Payment of contractors for Others [2%]", value: 2 },
  { label: "Payment of contractors for Others (Reduced) [1.5%]", value: 1.5 },
  { label: "Payment of contractors HUF/Indiv [1%]", value: 1 },
  { label: "Payment of contractors HUF/Indiv (Reduced) [0.75%]", value: 0.75 },
  { label: "Professional Fees [10%]", value: 10 },
  { label: "Professional Fees [7.5%]", value: 7.5 },
  { label: "Rent on land or furniture etc [10%]", value: 10 },
  { label: "Rent on land or furniture etc (Reduced) [7.5%]", value: 7.5 },
  { label: "Technical Fees (2%) [2%]", value: 2 },
];

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

// --- DnD Kit Sortable Row ---
function SortableRow({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? "#e0f2fe" : undefined,
  };

  let rowChildren;
  if (typeof children === "function") {
    rowChildren = children({ dragHandleProps: listeners });
  } else if (Array.isArray(children)) {
    rowChildren = React.Children.map(children, (child, idx) =>
      idx === 0
        ? React.cloneElement(child, { dragHandleProps: listeners })
        : child
    );
  } else {
    rowChildren = children;
  }

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      {rowChildren}
    </tr>
  );
}

const InvoiceForm = () => {
  const today = formatDate(new Date());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Customer dropdown state
  const [customers, setCustomers] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(true);

  // Tax options state (for custom tax rates)
  const [taxOptions, setTaxOptions] = useState([...TAX_OPTIONS]);
  const [showAddTax, setShowAddTax] = useState(false);
  const [newTaxLabel, setNewTaxLabel] = useState('');
  const [newTaxRate, setNewTaxRate] = useState('');

  const [items, setItems] = useState([
    { id: `${Date.now()}`, name: '', description: '', quantity: 1, rate: 0, discount: 0, taxType: 'gst18', customTaxRate: '', sac: '' }
  ]);
  const [formData, setFormData] = useState({
    customerId: '',
    invoiceNumber: '',
    invoiceDate: today,
    dueDate: '',
    terms: '',
    discount: 0,
    tdsTcsType: 'TDS', // 'TDS' or 'TCS'
    tdsOption: '', // value from TDS_OPTIONS
    tdsRate: '', // actual rate for TDS
    tcsRate: '', // actual rate for TCS
    notes: 'Thanks for your business.',
    termsAndConditions: '',
    files: [],
    placeOfSupply: '',
    poNumber: '',
    shipTo: '',
    showSummary: true,
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

  // Handle item field changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    if (field === 'name' || field === 'description' || field === 'sac') {
      updatedItems[index][field] = value;
    } else if (field === 'taxType') {
      updatedItems[index][field] = value;
      // Reset customTaxRate if not custom
      if (!value.startsWith('custom-')) {
        updatedItems[index].customTaxRate = '';
      }
    } else if (field === 'customTaxRate') {
      updatedItems[index][field] = value;
    } else {
      updatedItems[index][field] = value === "" ? "" : parseFloat(value);
    }
    setItems(updatedItems);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      { id: `${Date.now()}-${Math.random()}`, name: '', description: '', quantity: 1, rate: 0, discount: 0, taxType: 'gst18', customTaxRate: '', sac: '' }
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

  // --- DnD Kit setup ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      setItems((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  // Per-item calculations
  const getTaxRateForItem = (item) => {
    if (item.taxType && item.taxType.startsWith('custom-')) {
      // Custom tax
      return parseFloat(item.customTaxRate) || 0;
    }
    const found = taxOptions.find(opt => opt.value === item.taxType);
    return found ? found.rate : 0;
  };

  const calculateItemAmount = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const discount = parseFloat(item.discount) || 0;
    const taxRate = getTaxRateForItem(item);
    const base = qty * rate;
    const discounted = base - (base * discount) / 100;
    // If non-taxable, out-of-scope, or non-gst, tax is 0
    if (
      item.taxType === "non-taxable" ||
      item.taxType === "out-of-scope" ||
      item.taxType === "non-gst-supply"
    ) {
      return discounted;
    }
    const taxed = discounted + (discounted * taxRate) / 100;
    return taxed;
  };

  // Subtotal calculations
  const calculateSubtotal = () =>
    items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + qty * rate;
    }, 0);

  const calculateTotalDiscount = () =>
    items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + ((qty * rate) * discount) / 100;
    }, 0);

  // --- GST Split Calculation ---
  // Find the first GST item and use its rate, else 0
  const getGSTRate = () => {
    const gstItem = items.find(item => {
      const rate = getTaxRateForItem(item);
      return rate > 0;
    });
    return gstItem ? getTaxRateForItem(gstItem) : 0;
  };
  const gstRate = getGSTRate();
  const cgstRate = gstRate ? gstRate / 2 : 0;
  const sgstRate = gstRate ? gstRate / 2 : 0;

  // --- New Tax Calculations ---
  const calculateCGST = () => {
    // CGST is half of GST rate on (subtotal - discount)
    const base = calculateSubtotal() - calculateTotalDiscount();
    return (base * cgstRate) / 100;
  };
  const calculateSGST = () => {
    const base = calculateSubtotal() - calculateTotalDiscount();
    return (base * sgstRate) / 100;
  };
  const calculateTDS = () => {
    if (formData.tdsTcsType !== 'TDS' || !formData.tdsRate) return 0;
    const base = calculateSubtotal() - calculateTotalDiscount();
    return -((base * parseFloat(formData.tdsRate)) / 100);
  };
  const calculateTCS = () => {
    if (formData.tdsTcsType !== 'TCS' || !formData.tcsRate) return 0;
    const base = calculateSubtotal() - calculateTotalDiscount();
    return (base * parseFloat(formData.tcsRate)) / 100;
  };

  const calculateTotal = () => {
    const base = calculateSubtotal() - calculateTotalDiscount();
    const total =
      base +
      calculateCGST() +
      calculateSGST() +
      calculateTDS() +
      calculateTCS();
    return total;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCustomer = customers.find(c => c.id === Number(formData.customerId));
    const invoiceData = {
      ...formData,
      customerName: selectedCustomer
        ? (selectedCustomer.displayName || selectedCustomer.companyName || selectedCustomer.emailAddress)
        : '',
      items,
      subtotal: calculateSubtotal(),
      totalDiscount: calculateTotalDiscount(),
      cgst: calculateCGST(),
      sgst: calculateSGST(),
      tds: calculateTDS(),
      tcs: calculateTCS(),
      total: calculateTotal(),
      gstTreatment: selectedCustomer ? selectedCustomer.gstTreatment : '',
      gstin: selectedCustomer ? selectedCustomer.gstin : '',
      cgstRate,
      sgstRate,
      gstRate,
    };
    console.log('Submitting Invoice:', invoiceData);
    // TODO: Replace with actual API call
  };

  const handlePrintDownload = async () => {
    setIsGeneratingPDF(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.text('INVOICE', 14, 18);

      doc.setFontSize(12);
      doc.text(`Invoice #: ${formData.invoiceNumber || '-'}`, 14, 28);
      doc.text(`Invoice Date: ${formData.invoiceDate || '-'}`, 14, 34);
      doc.text(`Due Date: ${formData.dueDate || '-'}`, 14, 40);
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
      doc.text(
        `GST Treatment: ${selectedCustomer && selectedCustomer.gstTreatment ? selectedCustomer.gstTreatment : '-'}`,
        14,
        52
      );
      doc.text(
        `GSTIN: ${selectedCustomer && selectedCustomer.gstin ? selectedCustomer.gstin : '-'}`,
        100,
        52
      );
      doc.text(
        `Place of Supply: ${formData.placeOfSupply || '-'}`,
        14,
        58
      );

      // Items Table
      const itemRows = items.map((item, idx) => [
        idx + 1,
        item.name || '',
        item.quantity === "" || isNaN(item.quantity) ? '' : item.quantity,
        item.rate === "" || isNaN(item.rate) ? '' : item.rate,
        item.discount === "" || isNaN(item.discount) ? '' : item.discount,
        (() => {
          // Show label and rate for custom tax
          if (item.taxType && item.taxType.startsWith('custom-')) {
            return `${item.customTaxRate || 0}%`;
          }
          const found = taxOptions.find(opt => opt.value === item.taxType);
          return found ? found.label : '';
        })(),
        item.sac || '',
        calculateItemAmount(item).toFixed(2)
      ]);

      autoTable(doc, {
        startY: 64,
        head: [['#', 'Item', 'Qty', 'Rate', 'Discount (%)', 'Tax (%)', 'SAC', 'Amount']],
        body: itemRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
      });

      let finalY = doc.lastAutoTable.finalY || 64;

      // Summary section
      doc.setFontSize(12);
      doc.text('Summary', 14, finalY + 10);

      const summaryRows = [
        ['Subtotal', `₹ ${calculateSubtotal().toFixed(2)}`],
        ['Total Discount', `₹ ${calculateTotalDiscount().toFixed(2)}`],
        [`CGST (${cgstRate}%)`, `₹ ${calculateCGST().toFixed(2)}`],
        [`SGST (${sgstRate}%)`, `₹ ${calculateSGST().toFixed(2)}`],
        ['TDS', `₹ ${calculateTDS().toFixed(2)}`],
        ['TCS', `₹ ${calculateTCS().toFixed(2)}`],
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

      doc.save(`Invoice_${formData.invoiceNumber || 'Draft'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Add new custom tax option
  const handleAddTaxOption = (e) => {
    e.preventDefault();
    if (!newTaxLabel.trim() || isNaN(parseFloat(newTaxRate))) return;
    const value = `custom-${Date.now()}`;
    setTaxOptions([
      ...taxOptions,
      { label: newTaxLabel + ` (${parseFloat(newTaxRate)}%)`, value, rate: parseFloat(newTaxRate) }
    ]);
    setNewTaxLabel('');
    setNewTaxRate('');
    setShowAddTax(false);
  };

  const invisibleInput =
    "w-full bg-transparent border-none outline-none focus:ring-0 focus:border-b focus:border-blue-400 transition placeholder-gray-400 text-gray-800";

  const selectedCustomer = customers.find(c => c.id === Number(formData.customerId));

  // Handle TDS/TCS radio and dropdown/textbox
  const handleTdsTcsTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      tdsTcsType: value,
      tdsOption: '',
      tdsRate: '',
      tcsRate: '',
    }));
  };
  const handleTdsOptionChange = (e) => {
    const idx = e.target.selectedIndex - 1;
    const rate = idx >= 0 ? TDS_OPTIONS[idx].value : '';
    setFormData(prev => ({
      ...prev,
      tdsOption: e.target.value,
      tdsRate: rate,
    }));
  };
  const handleTcsRateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      tcsRate: e.target.value,
    }));
  };

  return (
    <div className="w-full px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-screen-2xl mx-auto px-8 py-10 bg-white shadow-2xl rounded-2xl space-y-10 text-gray-800 my-8"
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
          {formData.customerId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-semibold text-sm mb-1">GST Treatment</label>
                <input
                  type="text"
                  value={selectedCustomer && selectedCustomer.gstTreatment ? selectedCustomer.gstTreatment : ''}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-sm mb-1">GSTIN</label>
                <input
                  type="text"
                  value={selectedCustomer && selectedCustomer.gstin ? selectedCustomer.gstin : ''}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-sm mb-1">Place of Supply</label>
                <input
                  type="text"
                  name="placeOfSupply"
                  value={formData.placeOfSupply}
                  onChange={handleChange}
                  placeholder="Enter Place of Supply"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                />
              </div>
            </div>
          )}
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
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-sm mb-1">PO Number</label>
              <input
                type="text"
                name="poNumber"
                value={formData.poNumber}
                onChange={handleChange}
                placeholder="Enter PO Number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Ship To</label>
              <input
                type="text"
                name="shipTo"
                value={formData.shipTo}
                onChange={handleChange}
                placeholder="Enter Ship To Address"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Item Details</h3>
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-gradient-to-br from-white to-blue-50">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                      <th className="border-b px-6 py-3 text-left font-semibold">Item</th>
                      <th className="border-b px-6 py-3 text-right font-semibold">Quantity</th>
                      <th className="border-b px-6 py-3 text-right font-semibold">Rate</th>
                      <th className="border-b px-6 py-3 text-right font-semibold">Discount (%)</th>
                      <th className="border-b px-6 py-3 text-right font-semibold">Tax (%)</th>
                      <th className="border-b px-6 py-3 text-right font-semibold">Amount</th>
                      <th className="border-b px-6 py-3 text-center font-semibold">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <SortableRow key={item.id} id={item.id}>
                        {({ dragHandleProps }) => (
                          <>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  {...dragHandleProps}
                                  title="Drag to reorder"
                                  className="cursor-grab text-gray-400 hover:text-blue-500"
                                  style={{ fontSize: 18 }}
                                >
                                  &#9776;
                                </span>
                                <input
                                  type="text"
                                  value={item.name}
                                  placeholder="Item name"
                                  onChange={(e) =>
                                    handleItemChange(idx, 'name', e.target.value)
                                  }
                                  className={invisibleInput}
                                />
                              </div>
                              {/* Show SAC field only if item name is filled */}
                              {item.name && (
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    value={item.sac}
                                    placeholder="SAC"
                                    onChange={(e) =>
                                      handleItemChange(idx, 'sac', e.target.value)
                                    }
                                    className={invisibleInput + " text-xs border-b border-blue-200"}
                                  />
                                </div>
                              )}
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
                            <td className="px-6 py-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={item.discount === "" || isNaN(item.discount) ? "" : item.discount}
                                onChange={(e) =>
                                  handleItemChange(idx, 'discount', e.target.value)
                                }
                                className={invisibleInput + " text-right"}
                              />
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex items-center gap-2">
                                <select
                                  value={item.taxType || ''}
                                  onChange={e => handleItemChange(idx, 'taxType', e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 text-xs"
                                >
                                  <option value="">Select Tax</option>
                                  {taxOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                  <option value="add-new-tax">+ Add New Tax</option>
                                </select>
                                {/* If custom tax, show input */}
                                {item.taxType && item.taxType.startsWith('custom-') && (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={item.customTaxRate}
                                    onChange={e => handleItemChange(idx, 'customTaxRate', e.target.value)}
                                    placeholder="Tax %"
                                    className="w-16 border border-gray-300 rounded px-1 py-1 text-xs"
                                  />
                                )}
                              </div>
                              {/* Show description for special tax types */}
                              {(() => {
                                const found = taxOptions.find(opt => opt.value === item.taxType);
                                if (found && found.description) {
                                  return (
                                    <div className="text-xs text-gray-500 mt-1">{found.description}</div>
                                  );
                                }
                                return null;
                              })()}
                              {/* Handle add new tax */}
                              {item.taxType === "add-new-tax" && (
                                <div className="mt-2 bg-blue-50 p-2 rounded shadow">
                                  <form
                                    className="flex items-center gap-2"
                                    onSubmit={handleAddTaxOption}
                                  >
                                    <input
                                      type="text"
                                      placeholder="Tax Label"
                                      value={newTaxLabel}
                                      onChange={e => setNewTaxLabel(e.target.value)}
                                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                                      required
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="Rate %"
                                      value={newTaxRate}
                                      onChange={e => setNewTaxRate(e.target.value)}
                                      className="border border-gray-300 rounded px-2 py-1 text-xs w-16"
                                      required
                                    />
                                    <button
                                      type="submit"
                                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                    >
                                      Add
                                    </button>
                                    <button
                                      type="button"
                                      className="text-xs text-gray-500 ml-2"
                                      onClick={() => {
                                        setShowAddTax(false);
                                        setNewTaxLabel('');
                                        setNewTaxRate('');
                                        // Reset the taxType for this item
                                        handleItemChange(idx, 'taxType', '');
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </form>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3 text-right font-semibold text-blue-700">
                              {calculateItemAmount(item).toFixed(2)}
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
                          </>
                        )}
                      </SortableRow>
                    ))}
                  </tbody>
                </table>
              </SortableContext>
            </DndContext>
          </div>
          <button
            type="button"
            onClick={handleAddRow}
            className="mt-4 inline-block text-sm px-5 py-2 border-2 border-blue-400 rounded-lg text-blue-700 font-semibold bg-white hover:bg-blue-50 transition"
          >
            + Add New Item
          </button>
        </div>

        {/* Subtotal Section */}
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
              <span className="font-medium">Sub Total</span>
              <span className="font-semibold text-blue-900">
                ₹ {calculateSubtotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">CGST ({cgstRate}%)</span>
              <input
                type="number"
                name="cgst"
                value={cgstRate}
                readOnly
                className="w-20 text-right border border-gray-300 rounded px-2 py-1 bg-gray-100 text-gray-700"
              />
              <span className="font-semibold text-blue-900">
                ₹ {calculateCGST().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">SGST ({sgstRate}%)</span>
              <input
                type="number"
                name="sgst"
                value={sgstRate}
                readOnly
                className="w-20 text-right border border-gray-300 rounded px-2 py-1 bg-gray-100 text-gray-700"
              />
              <span className="font-semibold text-blue-900">
                ₹ {calculateSGST().toFixed(2)}
              </span>
            </div>
            {/* TDS/TCS Section */}
            <div className="flex flex-col gap-2">
              <span className="font-medium">TDS / TCS</span>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="tdsTcsType"
                    value="TDS"
                    checked={formData.tdsTcsType === 'TDS'}
                    onChange={handleTdsTcsTypeChange}
                  />
                  TDS
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="tdsTcsType"
                    value="TCS"
                    checked={formData.tdsTcsType === 'TCS'}
                    onChange={handleTdsTcsTypeChange}
                  />
                  TCS
                </label>
              </div>
              {formData.tdsTcsType === 'TDS' && (
                <div className="flex gap-2 items-center mt-2">
                  <select
                    name="tdsOption"
                    value={formData.tdsOption}
                    onChange={handleTdsOptionChange}
                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 text-xs"
                  >
                    <option value="">Select TDS Type</option>
                    {TDS_OPTIONS.map((opt, idx) => (
                      <option key={idx} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="tdsRate"
                    value={formData.tdsRate}
                    readOnly
                    className="w-16 text-right border border-gray-300 rounded px-2 py-1 bg-gray-100 text-gray-700"
                    placeholder="Rate %"
                  />
                  <span className="text-gray-500 text-xs">%</span>
                  <span className="font-semibold text-blue-900 ml-2">
                    ₹ {calculateTDS().toFixed(2)}
                  </span>
                </div>
              )}
              {formData.tdsTcsType === 'TCS' && (
                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="number"
                    name="tcsRate"
                    value={formData.tcsRate}
                    onChange={handleTcsRateChange}
                    min="0"
                    max="100"
                    className="w-16 text-right border border-gray-300 rounded px-2 py-1"
                    placeholder="TCS %"
                  />
                  <span className="text-gray-500 text-xs">%</span>
                  <span className="font-semibold text-blue-900 ml-2">
                    ₹ {calculateTCS().toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total </span>
              <span className="text-blue-700">
                ₹ {calculateTotal().toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              className="text-xs text-blue-500 underline mt-2"
              onClick={() => setFormData({ ...formData, showSummary: !formData.showSummary })}
            >
              {formData.showSummary ? "Hide Total Summary^" : "Show Total Summary^"}
            </button>
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
    </div>
  );
};

export default InvoiceForm;