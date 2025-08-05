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

const paymentTermsOptions = [
  { value: "NET 15", label: "Net 15" },
  { value: "NET 30", label: "Net 30" },
  { value: "NET 45", label: "Net 45" },
  { value: "NET 60", label: "Net 60" },
  { value: "DUE ON RECEIPT", label: "Due on Receipt" },
  { value: "DUE END OF MONTH", label: "Due end of the month" },
  { value: "DUE END OF NEXT MONTH", label: "Due end of next month" },
];

function formatDate(date) {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function formatDisplayDate(date) {
  const d = new Date(date);
  const day = `${d.getDate()}`.padStart(2, '0');
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
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

// Helper function to convert image to base64
async function getImageAsBase64(imagePath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = imagePath;
  });
}

// Number to words conversion
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  function convertHundreds(n) {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  }

  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  const thousandsValue = Math.floor(num / 1000);
  
  num %= 1000;
  const hundreds = num;

  let result = '';
  if (crores > 0) result += convertHundreds(crores) + 'Crore ';
  if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh ';
  if (thousandsValue > 0) result += convertHundreds(thousandsValue) + 'Thousand ';
  if (hundreds > 0) result += convertHundreds(hundreds);

  return result.trim();
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

export default function InvoiceForm() {
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
    customerId: "",
    invoiceNumber: "",
    invoiceDate: today,
    dueDate: today,
    terms: "DUE_ON_RECEIPT",
    discount: 0,
    tdsTcsType: 'TDS', // 'TDS' or 'TCS'
    tdsOption: '', // value from TDS_OPTIONS
    tdsRate: '', // actual rate for TDS
    tcsRate: '', // actual rate for TCS
    customerNotes: 'Thanks for your business.',
    termsAndConditions: '',
    files: [],
    placeOfSupply: '',
    poNumber: '',
    shipTo: '',
    gstTreatment: '',
    gstNumber: '',
    showSummary: false, // Changed to false by default
    isDraft: true,
    // Company details
    companyName: 'Wizzybox Private Limited',
    companyAddress: 'Bengaluru Karnataka 560056\nIndia',
    companyGSTIN: '29AADCW7843F1ZY',
    companyEmail: 'contactus@wizzybox.com',
    companyWebsite: 'www.wizzybox.com',
    bankName: 'State Bank of India',
    bankAccountNo: '00000042985985552',
    bankIFSC: 'SBIN0016225',
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

    // Fetch invoice number
    fetch("/api/invoice")
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.length) {
          const last = d.data[0].invoiceCode || "INV-000000";
          const match = last.match(/\d+$/);
          const next = match ? String(Number(match[0]) + 1).padStart(6, "0") : "000001";
          setFormData(f => ({ ...f, invoiceNumber: "INV-" + next }));
        } else {
          setFormData(f => ({ ...f, invoiceNumber: "INV-000001" }));
        }
      });
  }, []);

  // Auto-fill GST Treatment, GST Number, Place of Supply, Ship To when customer is selected
  useEffect(() => {
    if (formData.customerId) {
      const selectedCustomer = customers.find(c => c.id === Number(formData.customerId));
      setFormData(prev => ({
        ...prev,
        gstTreatment: selectedCustomer?.gstTreatment || "",
        gstNumber: selectedCustomer?.gstNumber || "",
        placeOfSupply: selectedCustomer?.placeOfSupply || "",
        shipTo: [
          selectedCustomer?.shippingAddress,
          selectedCustomer?.shippingCity,
          selectedCustomer?.shippingState,
          selectedCustomer?.shippingPinCode,
          selectedCustomer?.shippingCountry,
        ].filter(Boolean).join(", ")
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        gstTreatment: "",
        gstNumber: "",
        placeOfSupply: "",
        shipTo: ""
      }));
    }
  }, [formData.customerId, customers]);

  useEffect(() => {
    let dueDate = formData.dueDate;
    if (formData.terms && formData.invoiceDate) {
      switch (formData.terms) {
        case 'NET 15':
          dueDate = addDays(formData.invoiceDate, 15);
          break;
        case 'NET 30':
          dueDate = addDays(formData.invoiceDate, 30);
          break;
        case 'NET 45':
          dueDate = addDays(formData.invoiceDate, 45);
          break;
        case 'NET 60':
          dueDate = addDays(formData.invoiceDate, 60);
          break;
        case 'DUE ON RECEIPT':
          dueDate = formData.invoiceDate;
          break;
        case 'DUE END OF MONTH':
          dueDate = getLastDayOfMonth(formData.invoiceDate);
          break;
        case 'DUE END OF NEXT MONTH':
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

  // --- PDF Generation Utility ---
  // Returns { doc, pdfBuffer }
  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    // Create landscape PDF (297mm x 210mm) with compression
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    // Load the Wizzybox logo
    let logoBase64 = null;
    try {
      logoBase64 = await getImageAsBase64('/Wizzybox Logo.png');
    } catch (error) {}
    // Load the background template image
    let backgroundBase64 = null;
    try {
      backgroundBase64 = await getImageAsBase64('/template.jpg');
    } catch (error) {}
    // Colors matching template
    const primaryColor = [0, 0, 0];
    const lightGray = [245, 245, 245];
    const borderColor = [0, 0, 0];
    // Add Zoho branding at top (matching template exactly)
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    // Add Wizzybox logo - STANDARD SIZE: Reduced to standard dimensions
    let logoYPosition = 18;
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', 14, logoYPosition, 80,15) 
        logoYPosition += 25;
      } catch (error) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('WIZZYBOX', 14, logoYPosition + 10);
        logoYPosition += 15;
      }
    } else {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('WIZZYBOX', 14, logoYPosition + 10);
      logoYPosition += 15;
    }
    // Header - Company Details
    doc.setFontSize(12); 
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.companyName, 14, logoYPosition + 5);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const companyAddressLines = formData.companyAddress.split('\n');
    let yPos = logoYPosition + 12;
    companyAddressLines.forEach(line => {
      doc.text(line, 14, yPos);
      yPos += 4;
    });
    doc.text(`GSTIN ${formData.companyGSTIN}`, 14, yPos);
    doc.text(formData.companyEmail, 14, yPos + 4);
    doc.text(formData.companyWebsite, 14, yPos + 8);
    // TAX INVOICE Header - Right side
    doc.setFontSize(30);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TAX INVOICE', 280, 35, { align: 'right' });
    // Invoice Number - Right side
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Invoice# ${formData.invoiceNumber || 'WB-IN106'}`, 280, 45, { align: 'right' });
    // Customer Details Section
    const selectedCustomer = customers.find(c => c.id === Number(formData.customerId));
    // Bill To Section
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To', 14, 80);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    if (selectedCustomer) {
      const customerName = selectedCustomer.displayName || selectedCustomer.companyName || selectedCustomer.emailAddress;
      doc.text(customerName, 14, 88);
      let customerAddressY = 93;
      if (selectedCustomer.billingAddress) {
        doc.text(selectedCustomer.billingAddress, 14, customerAddressY);
        customerAddressY += 4;
      }
      if (selectedCustomer.billingCity) {
        doc.text(selectedCustomer.billingCity, 14, customerAddressY);
        customerAddressY += 4;
      }
      if (selectedCustomer.billingPinCode && selectedCustomer.billingState) {
        doc.text(`${selectedCustomer.billingPinCode} ${selectedCustomer.billingState}`, 14, customerAddressY);
        customerAddressY += 4;
      }
      if (selectedCustomer.billingCountry) {
        doc.text(selectedCustomer.billingCountry, 14, customerAddressY);
        customerAddressY += 4;
      }
      // if (formData.gstNumber) {
      //   doc.text(`GSTIN ${formData.gstNumber}`, 14, customerAddressY + 4);
      // }
    }
    // Ship To Section
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Ship To', 150, 80);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    if (formData.gstNumber) {
      doc.text(`GSTIN ${formData.gstNumber}`, 150, 88);
    }
    if (formData.placeOfSupply) {
      doc.text(`Place Of Supply: ${formData.placeOfSupply}`, 150, 93);
    }
    // Invoice Details Table - WITHOUT GRID
    const invoiceDetailsY = 120;
    const tableWidth = 270;
    const colWidth = tableWidth / 4;
    const rowHeight = 8;
    doc.setFillColor(59, 61, 57);
    doc.rect(14, invoiceDetailsY - 6, tableWidth, rowHeight, 'F');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Invoice Date', 16, invoiceDetailsY - 1, { align: 'left' });
    doc.text('Terms', 16 + colWidth, invoiceDetailsY - 1, { align: 'left' });
    doc.text('Due Date', 16 + 2*colWidth, invoiceDetailsY - 1, { align: 'left' });
    doc.text('PO Number', 16 + 3*colWidth, invoiceDetailsY - 1, { align: 'left' });
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formatDisplayDate(formData.invoiceDate), 16, invoiceDetailsY + 7, { align: 'left' });
    doc.text(formData.terms || 'Due on Receipt', 16 + colWidth, invoiceDetailsY + 7, { align: 'left' });
    doc.text(formatDisplayDate(formData.dueDate), 16 + 2*colWidth, invoiceDetailsY + 7, { align: 'left' });
    doc.text(formData.poNumber || 'NA', 16 + 3*colWidth, invoiceDetailsY + 7, { align: 'left' });
    // Items Table
    const itemTableY = invoiceDetailsY + 25;
    const itemRows = items.map((item, idx) => {
      const baseAmount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
      const discountedAmount = baseAmount - (baseAmount * (parseFloat(item.discount) || 0) / 100);
      const cgstAmount = (discountedAmount * cgstRate) / 100;
      const sgstAmount = (discountedAmount * sgstRate) / 100;
      return [
        (idx + 1).toString(),
        item.name || '',
        item.sac || '',
        parseFloat(item.quantity || 1).toFixed(2),
        parseFloat(item.rate || 0).toFixed(2).replace(/\.00$/, '.00'),
        cgstAmount.toFixed(2),
        `${cgstRate.toFixed(0)}%`,
        sgstAmount.toFixed(2),
        `${sgstRate.toFixed(0)}%`,
        discountedAmount.toFixed(2)
      ];
    });
    autoTable(doc, {
      startY: itemTableY,
      head: [['#', 'Item & Description', 'HSN/SAC', 'Qty', 'Rate', 'CGST', '', 'SGST', '', 'Amount']],
      body: itemRows,
      theme: 'plain',
      headStyles: { 
        fillColor: [59, 61, 57],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        lineWidth: 0,
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: { 
        fontSize: 9,
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
        lineWidth: 0,
        valign: 'middle'
      },
      styles: {
        lineWidth: 0,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 70, halign: 'left' },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 30 },
        5: { halign: 'center', cellWidth: 25 },
        6: { halign: 'center', cellWidth: 15 },
        7: { halign: 'center', cellWidth: 25 },
        8: { halign: 'center', cellWidth: 15 },
        9: { halign: 'right', cellWidth: 30 }
      },
      margin: { left: 14 },
      tableLineWidth: 0,
      tableLineColor: [255, 255, 255]
    });
   
    doc.addPage();
    if (backgroundBase64) {
      try {
        doc.addImage(backgroundBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
      } catch (error) {}
    }
    const summaryStartY = 40;
    const summaryData = [
      ['Sub Total'`${calculateSubtotal().toFixed(2)}`],
      [`CGST${cgstRate.toFixed(0)} (${cgstRate.toFixed(0)}%)`, `${calculateCGST().toFixed(2)}`],
      [`SGST${sgstRate.toFixed(0)} (${sgstRate.toFixed(0)}%)`, `${calculateSGST().toFixed(2)}`],
      ['Total'`₹${calculateTotal().toFixed(2)}`],
      ['Balance Due', `₹${calculateTotal().toFixed(2)}`]
    ];
    if (formData.tdsTcsType === 'TDS' && formData.tdsRate) {
      summaryData.splice(-2, 0, [`TDS (${formData.tdsRate}%)`, `${calculateTDS().toFixed(2)}`]);
    }
    if (formData.tdsTcsType === 'TCS' && formData.tcsRate) {
      summaryData.splice(-2, 0, [`TCS (${formData.tcsRate}%)`, `${calculateTCS().toFixed(2)}`]);
    }
    autoTable(doc, {
      startY: summaryStartY,
      body: summaryData,
      theme: 'plain',
      styles: { 
        fontSize: 9,
        cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
        lineWidth: 0
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30, halign: 'left' },
        1: { halign: 'right', cellWidth: 30 }
      },
      margin: { left: 220 }
    });
//the total amount in words
    let finalY = doc.lastAutoTable.finalY || itemTableY + 50;
    finalY += 5;
    const totalInWords = numberToWords(Math.floor(calculateTotal()));
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Total In Words:', 200, finalY + 2, { align: 'left' });
    doc.setFont(undefined, 'normal');
    const wordsText = `Indian Rupee ${totalInWords} Only`;
    // If the wordsText is too long, split into two lines
    const maxLineLength = 40;
    if (wordsText.length > maxLineLength) {
      const firstLine = wordsText.slice(0, maxLineLength);
      // Try to break at last space for better readability
      const lastSpace = firstLine.lastIndexOf(' ');
      const line1 = lastSpace > 0 ? wordsText.slice(0, lastSpace) : firstLine;
      const line2 = wordsText.slice(line1.length).trim();
      doc.text(line1, 230, finalY + 2, { align: 'left' });
      doc.text(line2, 230, finalY + 7, { align: 'left' });
    } else {
      doc.text(wordsText, 230, finalY + 2, { align: 'left' });
    }
    if (formData.customerNotes) {
      doc.setFontSize(10);
      doc.text(formData.customerNotes, 14, finalY + 20, { align: 'left' });
    }
    // Return both doc and buffer (use 'arraybuffer' with compression)
    // Also try to reduce image quality if possible
    const pdfArrayBuffer = doc.output('arraybuffer');
    return { doc, pdfBuffer: Buffer.from(pdfArrayBuffer) };
  };

  const handleSubmit = async (e, send = false) => {
    e.preventDefault();
    if (!formData.customerId || !formData.invoiceNumber || !formData.invoiceDate || !formData.dueDate || items.length === 0) {
      alert("Fill all required fields");
      return;
    }
    try {
      let pdfBase64 = null;
      // Always generate PDF for both draft and send
      try {
        const { pdfBuffer } = await generatePDF();
        if (pdfBuffer) {
          pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
      const submitFormData = new FormData();
      submitFormData.append('customerId', formData.customerId.toString());
      submitFormData.append('invoiceCode', formData.invoiceNumber);
      submitFormData.append('invoiceDate', formData.invoiceDate);
      submitFormData.append('terms', formData.terms);
      submitFormData.append('dueDate', formData.dueDate);
      submitFormData.append('poNumber', formData.poNumber || '');
      submitFormData.append('notes', formData.customerNotes || '');
      submitFormData.append('gstTreatment', formData.gstTreatment || '');
      submitFormData.append('gstNumber', formData.gstNumber || '');
      submitFormData.append('placeOfSupply', formData.placeOfSupply || '');
      submitFormData.append('total', calculateTotal().toString());
      submitFormData.append('isDraft', (!send).toString());
      const itemsData = items.map(i => ({
        name: i.name,
        description: i.description,
        quantity: i.quantity,
        rate: i.rate,
        discount: i.discount,
        taxType: i.taxType,
        customTaxRate: i.customTaxRate,
        sac: i.sac,
        amount: calculateItemAmount(i),
        gstPercentage: getTaxRateForItem(i),
      }));
      submitFormData.append('items', JSON.stringify(itemsData));
      // Always attach invoiceTemplate
      if (pdfBase64) {
        submitFormData.append('invoiceTemplate', pdfBase64);
      }
      if (formData.files && formData.files.length > 0) {
        Array.from(formData.files).forEach((file) => {
          submitFormData.append('files', file);
        });
      }
      const res = await fetch("/api/invoice", {
        method: "POST",
        body: submitFormData,
      });
      const data = await res.json();
      if (data.success) {
        const url = data.data?.invoiceTemplate;
        alert(
          (send ? "Invoice saved!" : "Invoice saved as draft.")
        );
      } else {
        alert("Failed to save invoice: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving invoice:", err);
      alert("Failed to save invoice. Please try again.");
    }
  };

  const handlePrintDownload = async () => {
    setIsGeneratingPDF(true);
    try {
      const { doc } = await generatePDF();
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
    <div className="w-full px-2 min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6 text-gray-800 my-4">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Create Invoice
          </h2>
          <div className="text-xs text-gray-500">
            Professional Invoice Template
          </div>
        </div>
        
        <form
          onSubmit={e => handleSubmit(e, true)}
          className="space-y-10"
        >
          {/* Invoice Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-xs mb-1 text-gray-700">
                  Customer Name<span className="text-red-500">*</span>
                </label>
                <select
                  name="customerId"
                  required
                  value={formData.customerId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs text-gray-800"
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
                <label className="block font-medium text-xs mb-1 text-gray-700">Invoice #</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs text-gray-800"
                  required
                />
              </div>
            </div>

            {formData.customerId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded">
                <div>
                  <label className="block font-medium text-xs mb-1 text-gray-700">GST Treatment</label>
                  <input
                    type="text"
                    name="gstTreatment"
                    value={formData.gstTreatment || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-1 text-xs text-gray-700"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block font-medium text-xs mb-1 text-gray-700">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-1 text-xs text-gray-700"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block font-medium text-xs mb-1 text-gray-700">Place of Supply</label>
                  <input
                    type="text"
                    name="placeOfSupply"
                    value={formData.placeOfSupply}
                    onChange={handleChange}
                    placeholder="Enter Place of Supply"
                    className="w-full border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs"
                  />
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs mb-1 text-gray-700">
                  Invoice Date
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-xs mb-1 text-gray-700">Terms</label>
                <select
                  name="terms"
                  value={formData.terms}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs text-gray-800"
                >
                  {paymentTermsOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-xs mb-1 text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs text-gray-800"
                  readOnly={!!formData.terms}
                  required
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-xs mb-1 text-gray-700">PO Number</label>
                <input
                  type="text"
                  name="poNumber"
                  value={formData.poNumber}
                  onChange={handleChange}
                  placeholder="Enter PO Number"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-xs mb-1 text-gray-700">Ship To</label>
                <input
                  type="text"
                  name="shipTo"
                  value={formData.shipTo}
                  onChange={handleChange}
                  placeholder="Enter Ship To Address"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-800">
              Item Details
            </h3>
            <div className="overflow-x-auto rounded border">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-medium">Item</th>
                        <th className="px-3 py-2 text-center font-medium">Quantity</th>
                        <th className="px-3 py-2 text-center font-medium">Rate</th>
                        <th className="px-3 py-2 text-center font-medium">Discount (%)</th>
                        <th className="px-3 py-2 text-center font-medium">Tax (%)</th>
                        <th className="px-3 py-2 text-center font-medium">Amount</th>
                        <th className="px-3 py-2 text-center font-medium">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <SortableRow key={item.id} id={item.id}>
                          {({ dragHandleProps }) => (
                            <>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    {...dragHandleProps}
                                    title="Drag to reorder"
                                    className="cursor-grab text-gray-400 hover:text-blue-500 transition-colors text-sm"
                                  >
                                    &#9776;
                                  </span>
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={item.name}
                                      placeholder="Item name"
                                      onChange={(e) =>
                                        handleItemChange(idx, 'name', e.target.value)
                                      }
                                      className={invisibleInput + " font-medium text-xs"}
                                    />
                                    {/* Show SAC field only if item name is filled */}
                                    {item.name && (
                                      <div className="mt-1">
                                        <input
                                          type="text"
                                          value={item.sac}
                                          placeholder="SAC"
                                          onChange={(e) =>
                                            handleItemChange(idx, 'sac', e.target.value)
                                          }
                                          className={invisibleInput + " text-xs text-gray-600 border-b border-blue-200"}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity === "" || isNaN(item.quantity) ? "" : item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(idx, 'quantity', e.target.value)
                                  }
                                  className={invisibleInput + " text-center text-xs"}
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.rate === "" || isNaN(item.rate) ? "" : item.rate}
                                  onChange={(e) =>
                                    handleItemChange(idx, 'rate', e.target.value)
                                  }
                                  className={invisibleInput + " text-center text-xs"}
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={item.discount === "" || isNaN(item.discount) ? "" : item.discount}
                                  onChange={(e) =>
                                    handleItemChange(idx, 'discount', e.target.value)
                                  }
                                  className={invisibleInput + " text-center text-xs"}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <div className="space-y-1">
                                  <select
                                    value={item.taxType || ''}
                                    onChange={e => handleItemChange(idx, 'taxType', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
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
                                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                    />
                                  )}
                                </div>
                                {/* Show description for special tax types */}
                                {(() => {
                                  const found = taxOptions.find(opt => opt.value === item.taxType);
                                  if (found && found.description) {
                                    return (
                                      <div className="text-xs text-gray-500 mt-1 italic">{found.description}</div>
                                    );
                                  }
                                  return null;
                                })()}
                                {/* Handle add new tax */}
                                {item.taxType === "add-new-tax" && (
                                  <div className="mt-2 p-2 rounded border">
                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        placeholder="Tax Label"
                                        value={newTaxLabel}
                                        onChange={e => setNewTaxLabel(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                        required
                                      />
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="Rate %"
                                        value={newTaxRate}
                                        onChange={e => setNewTaxRate(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                        required
                                      />
                                      <div className="flex gap-1">
                                        <button
                                          type="button"
                                          onClick={handleAddTaxOption}
                                          className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-600 transition"
                                        >
                                          Add
                                        </button>
                                        <button
                                          type="button"
                                          className="flex-1 text-xs text-gray-500 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition"
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
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center font-medium text-blue-700 text-xs">
                                ₹{calculateItemAmount(item).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(idx)}
                                  className="text-red-500 font-bold hover:text-red-700 transition p-1 rounded hover:bg-red-50 text-xs"
                                  title="Remove Item"
                                  disabled={items.length === 1}
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
              className="inline-flex items-center px-4 py-2 border-2 border-blue-400 rounded text-blue-700 font-medium hover:bg-blue-50 transition text-xs"
            >
              <span className="mr-1">+</span>
              Add New Item
            </button>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2 text-xs text-gray-700">Customer Notes</label>
                <textarea
                  name="customerNotes"
                  rows="3"
                  value={formData.customerNotes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-xs"
                  placeholder="Enter customer notes..."
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2 text-xs text-gray-700">
                  Terms & Conditions
                </label>
                <textarea
                  name="termsAndConditions"
                  rows="2"
                  value={formData.termsAndConditions}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-xs"
                  placeholder="Enter terms and conditions..."
                />
              </div>
              
              <div>
                <label className="block font-medium mb-2 text-xs text-gray-700">Attach File(s)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setFormData({ ...formData, files: e.target.files })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 3 files, 10MB each
                </p>
              </div>
            </div>
            
            <div className="rounded border p-4 space-y-3">
              {/* Show/Hide Summary Toggle Button */}
              <div className="flex justify-between items-center border-b pb-2">
                <button
                  type="button"
                  className="text-blue-600 font-medium underline hover:text-blue-800 transition text-xs"
                  onClick={() => setFormData({ ...formData, showSummary: !formData.showSummary })}
                >
                  {formData.showSummary ? "Hide Total Summary" : "Show Total Summary"}
                </button>
              </div>
              
              {/* Summary Details (hidden by default, shown when showSummary is true) */}
              {formData.showSummary && (
                <>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-gray-700 text-xs">Sub Total</span>
                    <span className="font-medium text-blue-900 text-xs">
                      ₹ {calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-gray-700 text-xs">CGST ({cgstRate.toFixed(1)}%)</span>
                    <span className="font-medium text-blue-900 text-xs">
                      ₹ {calculateCGST().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-gray-700 text-xs">SGST ({sgstRate.toFixed(1)}%)</span>
                    <span className="font-medium text-blue-900 text-xs">
                      ₹ {calculateSGST().toFixed(2)}
                    </span>
                  </div>
                  
                  {/* TDS/TCS Section */}
                  <div className="border-t pt-3 space-y-2">
                    <span className="font-medium text-gray-700 block text-xs">TDS / TCS</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="tdsTcsType"
                          value="TDS"
                          checked={formData.tdsTcsType === 'TDS'}
                          onChange={handleTdsTcsTypeChange}
                          className="text-blue-600"
                        />
                        <span className="text-xs">TDS</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="tdsTcsType"
                          value="TCS"
                          checked={formData.tdsTcsType === 'TCS'}
                          onChange={handleTdsTcsTypeChange}
                          className="text-blue-600"
                        />
                        <span className="text-xs">TCS</span>
                      </label>
                    </div>
                    
                    {formData.tdsTcsType === 'TDS' && (
                      <div className="space-y-2">
                        <select
                          name="tdsOption"
                          value={formData.tdsOption}
                          onChange={handleTdsOptionChange}
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                        >
                          <option value="">Select TDS Type</option>
                          {TDS_OPTIONS.map((opt, idx) => (
                            <option key={idx} value={opt.label}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {formData.tdsRate && (
                          <div className="flex justify-between items-center py-1">
                            <span className="font-medium text-gray-700 text-xs">TDS ({formData.tdsRate}%)</span>
                            <span className="font-medium text-red-600 text-xs">
                              ₹ {calculateTDS().toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {formData.tdsTcsType === 'TCS' && (
                      <div className="space-y-2">
                        <input
                          type="number"
                          name="tcsRate"
                          value={formData.tcsRate}
                          onChange={handleTcsRateChange}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                          placeholder="TCS Rate %"
                        />
                        {formData.tcsRate && (
                          <div className="flex justify-between items-center py-1">
                            <span className="font-medium text-gray-700 text-xs">TCS ({formData.tcsRate}%)</span>
                            <span className="font-medium text-green-600 text-xs">
                              ₹ {calculateTCS().toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Total (always visible) */}
              <div className="flex justify-between items-center font-bold text-lg border-t pt-3">
                <span className="text-gray-800 text-sm">Total</span>
                <span className="text-blue-700 text-sm">
                  ₹ {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 rounded border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition text-xs"
              onClick={handlePrintDownload}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </span>
              ) : (
                'Print/Download'
              )}
            </button>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* <button
                type="button"
                className="px-4 py-2 rounded border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-medium transition text-xs"
                onClick={e => handleSubmit(e, false)}
              >
                Save as Draft
              </button> */}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition text-xs"
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-medium transition text-xs"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}