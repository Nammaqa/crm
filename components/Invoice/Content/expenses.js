"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaChartPie,
  FaFileInvoice,
  FaSignOutAlt,
  FaAddressBook,
  FaUserCircle,
  FaCog,
  FaChevronDown,
  FaChevronRight,
  FaHome,
  FaFileAlt,
  FaUsers,
  FaMoneyBillWave,
  FaFilePdf,
} from "react-icons/fa";
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

// Sidebar sections
const sections = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: <FaHome size={16} />, 
    path: "/admin/dashboard" 
  },
  { 
    id: "invoices", 
    label: "Invoices", 
    icon: <FaFileInvoice size={16} />,
    path: "/admin/invoices",
    subItems: [
      { id: "new-invoice", label: "Create Invoice", path: "/admin/invoices/new" },
      { id: "invoice-list", label: "Invoice List", path: "/admin/invoices/list" },
    ]
  },
  { 
    id: "customers", 
    label: "Customers", 
    icon: <FaUsers size={16} />,
    path: "/admin/customers",
    subItems: [
      { id: "customer-list", label: "Customer List", path: "/admin/customers/list" },
      { id: "add-customer", label: "Add Customer", path: "/admin/customers/new" },
    ]
  },
  { 
    id: "expenses", 
    label: "Expenses", 
    icon: <FaMoneyBillWave size={16} />,
    path: "/admin/expenses" 
  },
  { 
    id: "reports", 
    label: "Reports", 
    icon: <FaFileAlt size={16} />,
    path: "/admin/reports" 
  },
];

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
  { value: "NET_15", label: "Net 15" },
  { value: "NET_30", label: "Net 30" },
  { value: "NET_45", label: "Net 45" },
  { value: "NET_60", label: "Net 60" },
  { value: "DUE_ON_RECEIPT", label: "Due on Receipt" },
  { value: "DUE_END_OF_MONTH", label: "Due end of the month" },
  { value: "DUE_END_OF_NEXT_MONTH", label: "Due end of next month" },
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
    background: isDragging ? "#f8fafc" : undefined,
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

function NavItem({ item, open, isActive, onClick, isSubItem = false }) {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isActive && hasSubItems) {
      setIsExpanded(true);
    }
  }, [isActive, hasSubItems]);

  const handleClick = () => {
    if (hasSubItems) {
      setIsExpanded(!isExpanded);
    } else {
      onClick(item);
    }
  };

  return (
    <li>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-medium
          transition-all
          ${isActive ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md" : "hover:bg-gray-100 text-gray-700 hover:text-blue-600"}
          ${!open && !isSubItem ? 'justify-center' : ''}
        `}
        title={!open && !isSubItem ? item.label : ''}
      >
        <div className="w-6 text-center flex-shrink-0">{item.icon}</div>
        {open && (
          <>
            <span className="flex-1 whitespace-nowrap">{item.label}</span>
            {hasSubItems && (
              <span className="text-xs">
                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            )}
          </>
        )}
      </div>
      {open && hasSubItems && isExpanded && (
        <ul className="ml-8 mt-1 space-y-1">
          {item.subItems.map((subItem) => (
            <NavItem
              key={subItem.id}
              item={subItem}
              open={open}
              isActive={isActive && subItem.id === activeSubItem}
              onClick={onClick}
              isSubItem={true}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function InvoiceLayout({ children }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("new-invoice");
  const [activeSubItem, setActiveSubItem] = useState(null);
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
    invoiceDate: formatDate(new Date()),
    dueDate: formatDate(new Date()),
    terms: "DUE_ON_RECEIPT",
    discount: 0,
    tdsTcsType: 'TDS',
    tdsOption: '',
    tdsRate: '',
    tcsRate: '',
    customerNotes: 'Thanks for your business.',
    termsAndConditions: '',
    files: [],
    placeOfSupply: '',
    poNumber: '',
    shipTo: '',
    gstTreatment: '',
    gstNumber: '',
    showSummary: false,
    isDraft: true,
    companyName: 'Wizzybox Private Limited',
    companyAddress: 'Bengaluru Karnataka 560056\nIndia',
    companyGSTIN: '29AADCW7843F1ZY',
    companyEmail: 'contactus@wizzybox.com',
    companyWebsite: 'www.wizzybox.com',
    bankName: 'State Bank of India',
    bankAccountNo: '00000042985985552',
    bankIFSC: 'SBIN0016225',
  });

  const handleNavigation = (item) => {
    setActiveSection(item.id);
    if (item.subItems && item.subItems.length > 0) {
      setActiveSubItem(item.subItems[0].id);
      router.push(item.subItems[0].path);
    } else {
      setActiveSubItem(null);
      router.push(item.path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    if (field === 'name' || field === 'description' || field === 'sac') {
      updatedItems[index][field] = value;
    } else if (field === 'taxType') {
      updatedItems[index][field] = value;
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

  const getTaxRateForItem = (item) => {
    if (item.taxType && item.taxType.startsWith('custom-')) {
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

  const calculateCGST = () => {
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

  const handleSubmit = async (e, send = false) => {
    e.preventDefault();
    if (!formData.customerId || !formData.invoiceNumber || !formData.invoiceDate || !formData.dueDate || items.length === 0) {
      alert("Fill all required fields");
      return;
    }
    const payload = {
      customerId: Number(formData.customerId),
      invoiceCode: formData.invoiceNumber,
      invoiceDate: formData.invoiceDate,
      terms: formData.terms,
      dueDate: formData.dueDate,
      notes: formData.customerNotes,
      gstTreatment: formData.gstTreatment,
      gstNumber: formData.gstNumber,
      placeOfSupply: formData.placeOfSupply,
      poNumber: formData.poNumber,
      items: items.map(i => ({
        name: i.name,
        description: i.description,
        quantity: i.quantity,
        rate: i.rate,
        discount: i.discount,
        taxType: i.taxType,
        customTaxRate: i.customTaxRate,
        sac: i.sac,
        amount: calculateItemAmount(i),
      })),
      total: calculateTotal(),
      discount: calculateTotalDiscount(),
      gstRate,
      isDraft: !send,
    };

    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert(send ? "Invoice sent!" : "Saved as draft.");
      } else {
        alert("Failed to save invoice: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to save invoice. Please try again.");
    }
  };

  const handlePrintDownload = async () => {
    setIsGeneratingPDF(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      let logoBase64 = null;
      try {
        logoBase64 = await getImageAsBase64('/Wizzybox Logo.png');
      } catch (error) {
        console.log('Could not load Wizzybox logo image');
      }

      let backgroundBase64 = null;
      try {
        backgroundBase64 = await getImageAsBase64('/template.jpg');
      } catch (error) {
        console.log('Could not load template background image');
      }

      const primaryColor = [0, 0, 0];
      const lightGray = [245, 245, 245];
      const borderColor = [0, 0, 0];

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);

      let logoYPosition = 18;
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', 14, logoYPosition, 60,19); 
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

      doc.setFontSize(30);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('TAX INVOICE', 280, 35, { align: 'right' });

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Invoice# ${formData.invoiceNumber || 'WB-IN106'}`, 280, 45, { align: 'right' });

      const selectedCustomer = customers.find(c => c.id === Number(formData.customerId));
      
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
        
        if (formData.gstNumber) {
          doc.text(`GSTIN ${formData.gstNumber}`, 14, customerAddressY + 4);
        }
      }

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

      const itemTableY = invoiceDetailsY + 25;
      
      const itemRows = items.map((item, idx) => {
        const baseAmount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
        const discountedAmount = baseAmount - (baseAmount * (parseFloat(item.discount) || 0) / 100);
        const cgstAmount = (discountedAmount * cgstRate) / 100;
        const sgstAmount = (discountedAmount * sgstRate) / 100;
        
        return [
          (idx + 1).toString(),
          item.name || '',
          item.sac || '998313',
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
          3: { halign: 'right', cellWidth: 20 },
          4: { halign: 'right', cellWidth: 30 },
          5: { halign: 'right', cellWidth: 25 },
          6: { halign: 'center', cellWidth: 15 },
          7: { halign: 'right', cellWidth: 25 },
          8: { halign: 'center', cellWidth: 15 },
          9: { halign: 'right', cellWidth: 30 }
        },
        margin: { left: 14 },
        tableLineWidth: 0,
        tableLineColor: [255, 255, 255]
      });

      let finalY = doc.lastAutoTable.finalY || itemTableY + 50;
      finalY += 10;

      const totalInWords = numberToWords(Math.floor(calculateTotal()));
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('Total In Words:', 14, finalY + 15, { align: 'left' });
      doc.setFont(undefined, 'normal');
      const wordsText = `Indian Rupee ${totalInWords} Only`;
      doc.text(wordsText, 14, finalY + 22, { align: 'left' });

      if (formData.customerNotes) {
        doc.setFontSize(9);
        doc.text(formData.customerNotes, 14, finalY + 35, { align: 'left' });
      }

      doc.addPage();

      if (backgroundBase64) {
        try {
          doc.addImage(backgroundBase64, 'JPEG', 0, 0, pageWidth, pageHeight);
        } catch (error) {
          console.log('Error adding background image to second page');
        }
      }

      const summaryStartY = 40;
      const summaryData = [
        ['Sub Total', `${calculateSubtotal().toFixed(2)}`],
        [`CGST${cgstRate.toFixed(0)} (${cgstRate.toFixed(0)}%)`, `${calculateCGST().toFixed(2)}`],
        [`SGST${sgstRate.toFixed(0)} (${sgstRate.toFixed(0)}%)`, `${calculateSGST().toFixed(2)}`],
        ['Total', `₹${calculateTotal().toFixed(2)}`],
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
          0: { fontStyle: 'bold', cellWidth: 60, halign: 'left' },
          1: { halign: 'right', cellWidth: 50 }
        },
        margin: { left: 150 }
      });

      doc.save(`Invoice_${formData.invoiceNumber || 'Draft'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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
    "w-full bg-transparent border-none outline-none focus:ring-0 focus:border-b focus:border-gray-300 hover:border-gray-400 transition-colors placeholder-gray-400 text-gray-800 px-2 py-1";

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
        case 'NET_15':
          dueDate = addDays(formData.invoiceDate, 15);
          break;
        case 'NET_30':
          dueDate = addDays(formData.invoiceDate, 30);
          break;
        case 'NET_45':
          dueDate = addDays(formData.invoiceDate, 45);
          break;
        case 'NET_60':
          dueDate = addDays(formData.invoiceDate, 60);
          break;
        case 'DUE_ON_RECEIPT':
          dueDate = formData.invoiceDate;
          break;
        case 'DUE_END_OF_MONTH':
          dueDate = getLastDayOfMonth(formData.invoiceDate);
          break;
        case 'DUE_END_OF_NEXT_MONTH':
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

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-30 h-full flex flex-col relative
          transition-all duration-300 ease-in-out
          ${open ? "w-64" : "w-20"}
          bg-white shadow-xl border-r border-gray-200
          overflow-y-auto scrollbar-hide
        `}
      >
        {/* Header row: logo + toggle button */}
        <div className={`flex items-center ${open ? 'justify-between' : 'justify-center flex-col'} gap-x-2 px-4 mt-6 mb-8 flex-shrink-0`}>
          <div className={`flex items-center ${open ? '' : 'mb-4'}`}>
            <Image
              src={open ? "/Wizzybox Logo.png" : "/smalllogo.png"}
              alt="Company Logo"
              width={open ? 140 : 40}
              height={open ? 50 : 40}
              className="transition-all duration-300"
              priority
            />
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            className={`
              p-2 rounded-lg
              text-white
              bg-gradient-to-b from-blue-600 to-blue-400
              shadow-lg border border-white/30
              hover:scale-105 transition-transform
              ${!open ? 'w-10 h-10' : ''}
            `}
          >
            {open ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
          <ul className="flex flex-col space-y-1 pb-4">
            {sections.map((section) => (
              <NavItem
                key={section.id}
                item={section}
                open={open}
                isActive={activeSection === section.id}
                onClick={handleNavigation}
              />
            ))}
          </ul>
        </div>

        {/* Logout */}
        <div className="mb-8 px-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className={`
              w-full flex items-center py-3 rounded-xl 
              bg-gradient-to-br from-blue-600 to-blue-400 text-white 
              shadow-lg hover:scale-105 transition
              ${!open ? 'justify-center px-2' : 'justify-center px-4'}
            `}
            title={!open ? 'Logout' : ''}
          >
            <FaSignOutAlt size={18} className={open ? "mr-2" : ""} />
            {open && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeSection === 'new-invoice' ? 'Create Invoice' : 
                 activeSection === 'invoice-list' ? 'Invoice List' : 
                 activeSection === 'customer-list' ? 'Customer List' : 
                 activeSection === 'add-customer' ? 'Add Customer' : 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {activeSection === 'new-invoice' && (
                <>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={handlePrintDownload}
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? 'Generating...' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={e => handleSubmit(e, false)}
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    form="invoice-form"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Save & Send
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeSection === 'new-invoice' && (
            <form
              id="invoice-form"
              onSubmit={e => handleSubmit(e, true)}
              className="space-y-6"
            >
              {/* Basic Invoice Information */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="customerId"
                    required
                    value={formData.customerId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice #</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Number</label>
                  <input
                    type="text"
                    name="poNumber"
                    value={formData.poNumber}
                    onChange={handleChange}
                    placeholder="PO Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Date and Terms Row */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms</label>
                  <select
                    name="terms"
                    value={formData.terms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {paymentTermsOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    readOnly={!!formData.terms}
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Place of Supply</label>
                  <input
                    type="text"
                    name="placeOfSupply"
                    value={formData.placeOfSupply}
                    onChange={handleChange}
                    placeholder="Enter Place of Supply"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Customer GST Information */}
              {formData.customerId && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST Treatment</label>
                      <input
                        type="text"
                        name="gstTreatment"
                        value={formData.gstTreatment || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm"
                        readOnly
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm"
                        readOnly
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ship To</label>
                      <input
                        type="text"
                        name="shipTo"
                        value={formData.shipTo}
                        onChange={handleChange}
                        placeholder="Enter Ship To Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="mr-1">+</span>
                    Add Item
                  </button>
                </div>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={items.map(i => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item & Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qty
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Discount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tax
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {items.map((item, idx) => (
                            <SortableRow key={item.id} id={item.id}>
                              {({ dragHandleProps }) => (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-start space-x-2">
                                      <span
                                        {...dragHandleProps}
                                        className="cursor-grab text-gray-400 hover:text-gray-600 mt-1"
                                        title="Drag to reorder"
                                      >
                                        ⋮⋮
                                      </span>
                                      <div className="flex-1 space-y-2">
                                        <input
                                          type="text"
                                          value={item.name}
                                          placeholder="Item name"
                                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                          className={invisibleInput + " font-medium"}
                                        />
                                        {item.name && (
                                          <input
                                            type="text"
                                            value={item.sac}
                                            placeholder="HSN/SAC"
                                            onChange={(e) => handleItemChange(idx, 'sac', e.target.value)}
                                            className={invisibleInput + " text-sm text-gray-600"}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity === "" || isNaN(item.quantity) ? "" : item.quantity}
                                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                      className={invisibleInput + " text-center w-16"}
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.rate === "" || isNaN(item.rate) ? "" : item.rate}
                                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                                      className={invisibleInput + " text-right w-20"}
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      value={item.discount === "" || isNaN(item.discount) ? "" : item.discount}
                                      onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                                      className={invisibleInput + " text-center w-16"}
                                      placeholder="%"
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="space-y-2 w-32">
                                      <select
                                        value={item.taxType || ''}
                                        onChange={e => handleItemChange(idx, 'taxType', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                        <option value="">Select Tax</option>
                                        {taxOptions.map(opt => (
                                          <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </option>
                                        ))}
                                        <option value="add-new-tax">+ Add New Tax</option>
                                      </select>
                                      {item.taxType && item.taxType.startsWith('custom-') && (
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={item.customTaxRate}
                                          onChange={e => handleItemChange(idx, 'customTaxRate', e.target.value)}
                                          placeholder="Tax %"
                                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                        />
                                      )}
                                      {(() => {
                                        const found = taxOptions.find(opt => opt.value === item.taxType);
                                        if (found && found.description) {
                                          return (
                                            <div className="text-xs text-gray-500 italic">{found.description}</div>
                                          );
                                        }
                                        return null;
                                      })()}
                                      {item.taxType === "add-new-tax" && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                          <form
                                            className="space-y-2"
                                            onSubmit={handleAddTaxOption}
                                          >
                                            <input
                                              type="text"
                                              placeholder="Tax Label"
                                              value={newTaxLabel}
                                              onChange={e => setNewTaxLabel(e.target.value)}
                                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                              required
                                            />
                                            <input
                                              type="number"
                                              min="0"
                                              max="100"
                                              placeholder="Rate %"
                                              value={newTaxRate}
                                              onChange={e => setNewTaxRate(e.target.value)}
                                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                              required
                                            />
                                            <div className="flex gap-1">
                                              <button
                                                type="submit"
                                                className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                              >
                                                Add
                                              </button>
                                              <button
                                                type="button"
                                                className="flex-1 text-xs text-gray-500 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                                                onClick={() => {
                                                  setShowAddTax(false);
                                                  setNewTaxLabel('');
                                                  setNewTaxRate('');
                                                  handleItemChange(idx, 'taxType', '');
                                                }}
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </form>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ₹{calculateItemAmount(item).toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRow(idx)}
                                      className="text-red-600 hover:text-red-900"
                                      disabled={items.length === 1}
                                    >
                                      Remove
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
              </div>

              {/* Summary and Additional Information */}
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
                    <textarea
                      name="customerNotes"
                      rows="3"
                      value={formData.customerNotes}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Enter customer notes..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                    <textarea
                      name="termsAndConditions"
                      rows="3"
                      value={formData.termsAndConditions}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Enter terms and conditions..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attach Files</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFormData({ ...formData, files: e.target.files })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 3 files, 10MB each</p>
                  </div>
                </div>
                
                <div className="col-span-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-gray-900">Summary</h3>
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => setFormData({ ...formData, showSummary: !formData.showSummary })}
                      >
                        {formData.showSummary ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                    
                    {formData.showSummary && (
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sub Total</span>
                          <span>₹ {calculateSubtotal().toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">CGST ({cgstRate.toFixed(1)}%)</span>
                          <span>₹ {calculateCGST().toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">SGST ({sgstRate.toFixed(1)}%)</span>
                          <span>₹ {calculateSGST().toFixed(2)}</span>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-2 space-y-3">
                          <div className="text-xs font-medium text-gray-700">TDS / TCS</div>
                          <div className="flex gap-4">
                            <label className="flex items-center text-xs">
                              <input
                                type="radio"
                                name="tdsTcsType"
                                value="TDS"
                                checked={formData.tdsTcsType === 'TDS'}
                                onChange={handleTdsTcsTypeChange}
                                className="mr-1"
                              />
                              TDS
                            </label>
                            <label className="flex items-center text-xs">
                              <input
                                type="radio"
                                name="tdsTcsType"
                                value="TCS"
                                checked={formData.tdsTcsType === 'TCS'}
                                onChange={handleTdsTcsTypeChange}
                                className="mr-1"
                              />
                              TCS
                            </label>
                          </div>
                          
                          {formData.tdsTcsType === 'TDS' && (
                            <div className="space-y-2">
                              <select
                                name="tdsOption"
                                value={formData.tdsOption}
                                onChange={handleTdsOptionChange}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Select TDS Type</option>
                                {TDS_OPTIONS.map((opt, idx) => (
                                  <option key={idx} value={opt.label}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {formData.tdsRate && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">TDS ({formData.tdsRate}%)</span>
                                  <span className="text-red-600">₹ {calculateTDS().toFixed(2)}</span>
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
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="TCS Rate %"
                              />
                              {formData.tcsRate && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">TCS ({formData.tcsRate}%)</span>
                                  <span className="text-green-600">₹ {calculateTCS().toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-300 pt-4">
                      <span>Total</span>
                      <span>₹ {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}