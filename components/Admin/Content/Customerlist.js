"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaPlus, FaChevronDown, FaChevronUp, FaEye, FaTimes, FaEdit, FaEllipsisV, FaFileInvoice, FaUserTie, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaIdCard, FaComments, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage } from "react-icons/fa";
import { FiDownload, FiPrinter, FiShare2, FiMail, FiExternalLink } from "react-icons/fi";
import Link from "next/link";

function stringToColor(str) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const TABS = [
  { name: "Overview", icon: <FaUserTie className="mr-2" /> },
  { name: "Invoices", icon: <FaFileInvoice className="mr-2" /> },
  { name: "Documents", icon: <FaIdCard className="mr-2" /> },
];

const statusColors = {
  Paid: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  Cancelled: "bg-rose-100 text-rose-800",
  Overdue: "bg-red-100 text-red-800",
  Draft: "bg-gray-100 text-gray-800"
};

const documentIcons = {
  pdf: <FaFilePdf className="text-red-500" />,
  doc: <FaFileWord className="text-blue-500" />,
  docx: <FaFileWord className="text-blue-500" />,
  xls: <FaFileExcel className="text-green-500" />,
  xlsx: <FaFileExcel className="text-green-500" />,
  jpg: <FaFileImage className="text-purple-500" />,
  png: <FaFileImage className="text-purple-500" />,
  default: <FaFileAlt className="text-gray-500" />
};

function getDocumentIcon(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  return documentIcons[extension] || documentIcons.default;
}

export default function CustomerList() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState(TABS[0].name);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [docModal, setDocModal] = useState({ open: false, doc: null });
  const [invoiceAction, setInvoiceAction] = useState({ open: false, invoice: null });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/api/customer")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCustomers(data.data);
        } else if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          setCustomers([]);
          setError("No customer data found.");
        }
      })
      .catch(() => {
        setError("Failed to fetch customer data.");
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      (c.displayName || c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.companyName || c.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.emailAddress || c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phoneNumberWork || c.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  const safeSelectedIdx =
    filteredCustomers.length > 0
      ? Math.min(selectedIdx, filteredCustomers.length - 1)
      : 0;
  const selectedCustomer =
    filteredCustomers.length > 0 ? filteredCustomers[safeSelectedIdx] : null;

 const renderAddress = (label, address, city, state, pin, country, phone, fax, attention) => {
    if (!address && !city && !state && !pin) {
      return (
        <div className="flex items-center text-slate-500">
          <FaMapMarkerAlt className="mr-2 text-slate-400" />
          <span>No {label} - </span>
          <button className="ml-1 text-blue-600 hover:text-blue-800 font-medium">Add Address</button>
        </div>
      );
    }
    return (
      <div className="flex">
        <FaMapMarkerAlt className="mr-2 mt-1 flex-shrink-0 text-slate-400" />
        <div>
          {attention && <div className="font-medium">{attention}</div>}
          <div>{address}</div>
          <div>{[city, state, pin].filter(Boolean).join(", ")}</div>
          {country && <div>{country}</div>}
          {phone && <div className="mt-1 text-sm text-slate-500">Phone: {phone}</div>}
          {fax && <div className="text-sm text-slate-500">Fax: {fax}</div>}
        </div>
      </div>
    );
  };

  useEffect(() => {
    setDocModal({ open: false, doc: null });
  }, [selectedIdx, activeTab]);

  function isUrl(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  function DocumentModal({ doc, onClose }) {
    if (!doc) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Document Viewer</h2>
            <button
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {isUrl(doc) ? (
              <iframe
                src={doc}
                title="Document"
                className="w-full h-full min-h-[70vh]"
                frameBorder="0"
              />
            ) : (
              <div className="p-6">
                <pre className="bg-gray-50 p-6 rounded-lg overflow-x-auto text-sm font-mono">{doc}</pre>
              </div>
            )}
          </div>
          <div className="p-6 border-t flex justify-end space-x-3 bg-gray-50">
            <button className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-white flex items-center transition-all shadow-sm hover:shadow-md">
              <FiDownload className="mr-2" /> Download
            </button>
            <button className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-white flex items-center transition-all shadow-sm hover:shadow-md">
              <FiPrinter className="mr-2" /> Print
            </button>
            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center transition-all shadow-md hover:shadow-lg">
              <FiShare2 className="mr-2" /> Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  function InvoiceStatusModal({ invoice, onClose, onSave }) {
    const [status, setStatus] = useState(invoice.status || "Pending");
    const [saving, setSaving] = useState(false);

    function handleSave() {
      setSaving(true);
      setTimeout(() => {
        onSave(status);
        setSaving(false);
        onClose();
      }, 700);
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Update Invoice Status</h2>
            <button
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Overdue">Overdue</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 transition-all"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const invoices = selectedCustomer?.Invoice || [
    {
      id: "INV-2023-001",
      date: "2023-06-01",
      dueDate: "2023-06-15",
      total: 1200,
      status: "Pending",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "INV-2023-002",
      date: "2023-06-10",
      dueDate: "2023-06-25",
      total: 800,
      status: "Paid",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "INV-2023-003",
      date: "2023-07-05",
      dueDate: "2023-07-20",
      total: 2450,
      status: "Overdue",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ];

  const documents = selectedCustomer?.documents || [
    { name: "Contract Agreement.pdf", type: "PDF", date: "2023-01-15", size: "2.4 MB" },
    { name: "NDA.docx", type: "Word", date: "2023-02-20", size: "1.2 MB" },
    { name: "Tax Certificate.pdf", type: "PDF", date: "2023-03-10", size: "3.1 MB" },
    { name: "Product Specifications.xlsx", type: "Excel", date: "2023-04-05", size: "1.8 MB" },
    { name: "Company Logo.png", type: "Image", date: "2023-05-12", size: "0.8 MB" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white tracking-tight">Customer Management</h1>
              <p className="mt-1 text-sm text-blue-100/90">Manage your customer relationships efficiently</p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <div className="relative w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-blue-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-blue-700/50 rounded-lg bg-blue-900/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <Link
                href="/add-customer"
                className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                New Customer
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Customer List Sidebar */}
          <div className={`lg:w-80 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
              <div className="px-5 py-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Customers ({filteredCustomers.length})</h3>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="inline-flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2">Loading customers...</span>
                    </div>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No customers found</p>
                    {search && (
                      <button 
                        onClick={() => setSearch('')} 
                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredCustomers.map((customer, idx) => (
                      <li
                        key={customer.id ?? customer.emailAddress ?? customer.email ?? idx}
                        className={`px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${safeSelectedIdx === idx ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          setSelectedIdx(idx);
                          setActiveTab(TABS[0].name);
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm"
                            style={{ backgroundColor: stringToColor(customer.displayName || customer.name || "") }}
                          >
                            {(customer.displayName || customer.name || "")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {customer.displayName || customer.name || "-"}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {customer.companyName || customer.company || "-"}
                            </p>
                          </div>
                          {safeSelectedIdx === idx && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                              Active
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {!selectedCustomer ? (
              <div className="bg-white rounded-xl shadow p-8 text-center border border-gray-100">
                <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No customer selected</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {loading ? "Loading customer data..." : "Select a customer from the list to view details"}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => router.push("/add-customer")}
                    className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                    Add New Customer
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                {/* Customer Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <div
                        className="flex-shrink-0 h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                        style={{ backgroundColor: stringToColor(selectedCustomer.displayName || selectedCustomer.name || "") }}
                      >
                        {(selectedCustomer.displayName || selectedCustomer.name || "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="ml-5">
                        <div className="flex items-center">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedCustomer.displayName || selectedCustomer.name || "-"}
                          </h2>
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                            {selectedCustomer.customerType || "Regular"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <FaBuilding className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                            {selectedCustomer.companyName || selectedCustomer.company || "-"}
                          </div>
                          <div className="flex items-center">
                            <FaEnvelope className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                            {selectedCustomer.emailAddress || selectedCustomer.email || "-"}
                          </div>
                          <div className="flex items-center">
                            <FaPhone className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                            {selectedCustomer.phoneNumberMobile || selectedCustomer.phoneNumberWork || selectedCustomer.phone || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                      >
                        <FiMail className="-ml-0.5 mr-2 h-4 w-4" />
                        Email
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                      >
                        <FaEdit className="-ml-0.5 mr-2 h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex">
                    {TABS.map((tab) => (
                      <button
                        key={tab.name}
                        className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm ${activeTab === tab.name
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } transition-colors`}
                        onClick={() => setActiveTab(tab.name)}
                      >
                        {tab.icon}
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  {activeTab === "Overview" && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900 mb-5 flex items-center">
                            <FaUserTie className="mr-3 text-blue-500" />
                            Personal Information
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Display Name</dt>
                              <dd className="mt-1 text-sm text-gray-900 font-medium">{selectedCustomer.displayName || selectedCustomer.name || "-"}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Email</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                <a href={`mailto:${selectedCustomer.emailAddress || selectedCustomer.email}`} className="text-blue-600 hover:text-blue-800">
                                  {selectedCustomer.emailAddress || selectedCustomer.email || "-"}
                                </a>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Phone</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {selectedCustomer.phoneNumberMobile || selectedCustomer.phoneNumberWork || selectedCustomer.phone || "-"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Customer Since</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                              </dd>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900 mb-5 flex items-center">
                            <FaBuilding className="mr-3 text-blue-500" />
                            Company Information
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                              <dd className="mt-1 text-sm text-gray-900 font-medium">{selectedCustomer.companyName || selectedCustomer.company || "-"}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Website</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {selectedCustomer.website ? (
                                  <a 
                                    href={selectedCustomer.website.startsWith('http') ? selectedCustomer.website : `https://${selectedCustomer.website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    {selectedCustomer.website}
                                    <FiExternalLink className="ml-1 h-3 w-3" />
                                  </a>
                                ) : "-"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.taxId || selectedCustomer.pan || "-"}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Currency</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.currency || "USD"}</dd>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900 mb-5 flex items-center">
                            <FaMapMarkerAlt className="mr-3 text-blue-500" />
                            Billing Address
                          </h3>
                          {renderAddress(
                            "Billing Address",
                            selectedCustomer.billingAddress,
                            selectedCustomer.billingCity,
                            selectedCustomer.billingState,
                            selectedCustomer.billingPinCode,
                            selectedCustomer.billingCountry,
                            selectedCustomer.billingPhone,
                            selectedCustomer.billingFax,
                            selectedCustomer.billingAttention
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900 mb-5 flex items-center">
                            <FaMapMarkerAlt className="mr-3 text-blue-500" />
                            Shipping Address
                          </h3>
                          {renderAddress(
                            "Shipping Address",
                            selectedCustomer.shippingAddress,
                            selectedCustomer.shippingCity,
                            selectedCustomer.shippingState,
                            selectedCustomer.shippingPinCode,
                            selectedCustomer.shippingCountry,
                            selectedCustomer.shippingPhone,
                            selectedCustomer.shippingFax,
                            selectedCustomer.shippingAttention
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-5 flex items-center">
                          <FaComments className="mr-3 text-blue-500" />
                          Additional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Department</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.department || "-"}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Designation</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.designation || "-"}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Portal Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                selectedCustomer.portalStatus === "Enabled" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {selectedCustomer.portalStatus || "Disabled"}
                              </span>
                            </dd>
                          </div>
                          <div className="md:col-span-3">
                            <dt className="text-sm font-medium text-gray-500">Remarks</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {selectedCustomer.remarks || "No remarks available"}
                            </dd>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "Invoices" && (
                    <div>
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-medium text-gray-900">Recent Invoices</h3>
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                          <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                          New Invoice
                        </button>
                      </div>

                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice #
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Due Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice, idx) => (
                              <tr key={invoice.id || idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${invoice.total.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[invoice.status]}`}>
                                    {invoice.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => window.open(invoice.url, "_blank", "noopener,noreferrer")}
                                      className="text-blue-600 hover:text-blue-900 transition-colors"
                                      title="View Invoice"
                                    >
                                      <FaEye className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => setInvoiceAction({ open: true, invoice, idx })}
                                      className="text-gray-600 hover:text-gray-900 transition-colors"
                                      title="More Actions"
                                    >
                                      <FaEllipsisV className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
                          <span className="font-medium">3</span> invoices
                        </div>
                        <nav className="flex space-x-2" aria-label="Pagination">
                          <button
                            disabled
                            className="relative inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-md text-gray-500 bg-white cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            disabled
                            className="relative inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-md text-gray-500 bg-white cursor-not-allowed"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  )}

                  {activeTab === "Documents" && (
                    <div>
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-medium text-gray-900">Customer Documents</h3>
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                          <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                          Upload Document
                        </button>
                      </div>

                      <div className="bg-white shadow overflow-hidden sm:rounded-xl border border-gray-200">
                        <ul className="divide-y divide-gray-200">
                          {documents.map((doc, idx) => (
                            <li key={idx} className="hover:bg-gray-50 transition-colors">
                              <div className="px-6 py-5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center min-w-0">
                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                      {getDocumentIcon(doc.name)}
                                    </div>
                                    <div className="ml-4 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                                      <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <span className="capitalize">{doc.type}</span>
                                        <span className="mx-2">•</span>
                                        <span>{doc.size}</span>
                                        <span className="mx-2">•</span>
                                        <span>{new Date(doc.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-2 flex-shrink-0 flex space-x-2">
                                    <button
                                      onClick={() => setDocModal({ open: true, doc: `https://example.com/docs/${doc.name}` })}
                                      className="inline-flex items-center px-3 py-1.5 border border-gray-200 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                    >
                                      <FaEye className="-ml-0.5 mr-2 h-4 w-4" />
                                      View
                                    </button>
                                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-200 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
                                      <FiDownload className="-ml-0.5 mr-2 h-4 w-4" />
                                      Download
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Document Modal */}
      {docModal.open && (
        <DocumentModal
          doc={docModal.doc}
          onClose={() => setDocModal({ open: false, doc: null })}
        />
      )}

      {/* Invoice Status Modal */}
      {invoiceAction.open && (
        <InvoiceStatusModal
          invoice={invoiceAction.invoice}
          onClose={() => setInvoiceAction({ open: false, invoice: null })}
          onSave={(newStatus) => {
            if (selectedCustomer?.Invoice && invoiceAction.idx !== undefined) {
              setCustomers(prev =>
                prev.map((cust, cidx) =>
                  cidx === safeSelectedIdx
                    ? {
                        ...cust,
                        Invoice: cust.Invoice.map((inv, iidx) =>
                          iidx === invoiceAction.idx
                            ? { ...inv, status: newStatus }
                            : inv
                        )
                      }
                    : cust
                )
              );
            }
          }}
        />
      )}
    </div>
  );
}