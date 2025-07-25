"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaPlus, FaEye, FaTimes, FaEdit, FaEllipsisV, FaFileInvoice, FaUserTie, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAlt } from "react-icons/fa";
import { FiDownload, FiMail, FiExternalLink } from "react-icons/fi";
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
  { name: "Overview", icon: <FaUserTie className="mr-2 text-sm" /> },
  { name: "Invoices", icon: <FaFileInvoice className="mr-2 text-sm" /> },
  { name: "Documents", icon: <FaIdCard className="mr-2 text-sm" /> },
];

const statusColors = {
  Paid: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  Cancelled: "bg-rose-100 text-rose-800",
  Overdue: "bg-red-100 text-red-800",
  Draft: "bg-gray-100 text-gray-800"
};

const documentIcons = {
  pdf: <FaFilePdf className="text-red-500 text-sm" />,
  doc: <FaFileWord className="text-blue-500 text-sm" />,
  docx: <FaFileWord className="text-blue-500 text-sm" />,
  xls: <FaFileExcel className="text-green-500 text-sm" />,
  xlsx: <FaFileExcel className="text-green-500 text-sm" />,
  jpg: <FaFileImage className="text-purple-500 text-sm" />,
  png: <FaFileImage className="text-purple-500 text-sm" />,
  default: <FaFileAlt className="text-gray-500 text-sm" />
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
        <div className="flex items-center text-slate-500 text-xs">
          <FaMapMarkerAlt className="mr-2 text-slate-400 text-xs" />
          <span>No {label} - </span>
          <button className="ml-1 text-blue-600 hover:text-blue-800 font-medium text-xs">Add Address</button>
        </div>
      );
    }
    return (
      <div className="flex">
        <FaMapMarkerAlt className="mr-2 mt-0.5 flex-shrink-0 text-slate-400 text-xs" />
        <div className="text-xs">
          {attention && <div className="font-medium">{attention}</div>}
          <div>{address}</div>
          <div>{[city, state, pin].filter(Boolean).join(", ")}</div>
          {country && <div>{country}</div>}
          {phone && <div className="mt-1 text-slate-500">Phone: {phone}</div>}
          {fax && <div className="text-slate-500">Fax: {fax}</div>}
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
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">Document Viewer</h2>
            <button
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <FaTimes size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {isUrl(doc) ? (
              <iframe
                src={doc}
                title="Document"
                className="w-full h-full min-h-[60vh]"
                frameBorder="0"
              />
            ) : (
              <div className="p-4">
                <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs font-mono">{doc}</pre>
              </div>
            )}
          </div>
          <div className="p-3 border-t flex justify-end space-x-2 bg-gray-50">
            <button className="px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-white flex items-center transition-all">
              <FiDownload className="mr-1.5" /> Download
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center transition-all">
              <FiMail className="mr-1.5" /> Email
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
        <div className="bg-white rounded-lg shadow-sm max-w-xs w-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900">Update Invoice Status</h2>
            <button
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <FaTimes size={16} />
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
          <div className="flex justify-end space-x-2">
            <button
              className="px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50 transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-70 transition-all"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Update"}
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
    }
  ];

  const documents = selectedCustomer?.documents || [
    { name: "Contract Agreement.pdf", type: "PDF", date: "2023-01-15", size: "2.4 MB" },
    { name: "NDA.docx", type: "Word", date: "2023-02-20", size: "1.2 MB" },
    { name: "Tax Certificate.pdf", type: "PDF", date: "2023-03-10", size: "3.1 MB" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 shadow">
        <div className="px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">Customer Management</h1>
              <p className="mt-1 text-xs text-blue-100/90">Manage your customer relationships</p>
            </div>
            <div className="mt-3 flex md:mt-0 md:ml-4 space-x-2">
              <div className="relative w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-3 w-3 text-blue-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-8 pr-3 py-1.5 border border-blue-700/50 rounded text-xs bg-blue-900/20 text-white placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Link
                href="/add-customer"
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded shadow-sm text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
              >
                <FaPlus className="-ml-0.5 mr-1.5 h-3 w-3" />
                New Customer
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-2 rounded text-xs">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Customer List Sidebar */}
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="px-3 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900">Customers ({filteredCustomers.length})</h3>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                {loading ? (
                  <div className="p-4 text-center text-gray-500 text-xs">
                    <div className="inline-flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-1">Loading customers...</span>
                    </div>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-xs">
                    <p>No customers found</p>
                    {search && (
                      <button 
                        onClick={() => setSearch('')} 
                        className="mt-1 text-blue-600 hover:text-blue-800 font-medium"
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
                        className={`px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${safeSelectedIdx === idx ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          setSelectedIdx(idx);
                          setActiveTab(TABS[0].name);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                            style={{ backgroundColor: stringToColor(customer.displayName || customer.name || "") }}
                          >
                            {(customer.displayName || customer.name || "")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {customer.displayName || customer.name || "-"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {customer.companyName || customer.company || "-"}
                            </p>
                          </div>
                          {safeSelectedIdx === idx && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xxs font-medium bg-blue-100 text-blue-800">
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
              <div className="bg-white rounded-lg shadow p-4 text-center border border-gray-200">
                <div className="mx-auto h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">No customer selected</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {loading ? "Loading customer data..." : "Select a customer from the list"}
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => router.push("/add-customer")}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                  >
                    <FaPlus className="-ml-0.5 mr-1 h-3 w-3" />
                    Add New Customer
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                {/* Customer Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <div
                        className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: stringToColor(selectedCustomer.displayName || selectedCustomer.name || "") }}
                      >
                        {(selectedCustomer.displayName || selectedCustomer.name || "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h2 className="text-sm font-bold text-gray-900">
                            {selectedCustomer.displayName || selectedCustomer.name || "-"}
                          </h2>
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xxs font-medium bg-blue-100 text-blue-800">
                            {selectedCustomer.customerType || "Regular"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center mt-1 text-xs text-gray-500 space-x-3">
                          <div className="flex items-center">
                            <FaBuilding className="mr-1 h-3 w-3 text-gray-400" />
                            {selectedCustomer.companyName || selectedCustomer.company || "-"}
                          </div>
                          <div className="flex items-center">
                            <FaEnvelope className="mr-1 h-3 w-3 text-gray-400" />
                            {selectedCustomer.emailAddress || selectedCustomer.email || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex space-x-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-2 py-1 border border-gray-200 shadow-sm text-xs rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                      >
                        <FiMail className="mr-1 h-3 w-3" />
                        Email
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                      >
                        <FaEdit className="mr-1 h-3 w-3" />
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
                        className={`flex items-center py-2 px-3 border-b-2 text-xs ${activeTab === tab.name
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab(tab.name)}
                      >
                        {tab.icon}
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                  {activeTab === "Overview" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded p-3 border border-gray-200">
                          <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                            <FaUserTie className="mr-2 text-blue-500 text-xs" />
                            Personal Info
                          </h3>
                          <div className="space-y-2 text-xs">
                            <div>
                              <dt className="text-gray-500">Name</dt>
                              <dd className="font-medium">{selectedCustomer.displayName || selectedCustomer.name || "-"}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Email</dt>
                              <dd>
                                <a href={`mailto:${selectedCustomer.emailAddress || selectedCustomer.email}`} className="text-blue-600 hover:text-blue-800">
                                  {selectedCustomer.emailAddress || selectedCustomer.email || "-"}
                                </a>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Phone</dt>
                              <dd>{selectedCustomer.phoneNumberMobile || selectedCustomer.phoneNumberWork || selectedCustomer.phone || "-"}</dd>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded p-3 border border-gray-200">
                          <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                            <FaBuilding className="mr-2 text-blue-500 text-xs" />
                            Company Info
                          </h3>
                          <div className="space-y-2 text-xs">
                            <div>
                              <dt className="text-gray-500">Company</dt>
                              <dd className="font-medium">{selectedCustomer.companyName || selectedCustomer.company || "-"}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Website</dt>
                              <dd>
                                {selectedCustomer.website ? (
                                  <a 
                                    href={selectedCustomer.website.startsWith('http') ? selectedCustomer.website : `https://${selectedCustomer.website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    {selectedCustomer.website}
                                    <FiExternalLink className="ml-1 h-2.5 w-2.5" />
                                  </a>
                                ) : "-"}
                              </dd>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded p-3 border border-gray-200">
                          <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-blue-500 text-xs" />
                            Billing Address
                          </h3>
                          {renderAddress(
                            "Billing",
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

                        <div className="bg-gray-50 rounded p-3 border border-gray-200">
                          <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-blue-500 text-xs" />
                            Shipping Address
                          </h3>
                          {renderAddress(
                            "Shipping",
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
                    </div>
                  )}

                  {activeTab === "Invoices" && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-medium text-gray-900">Invoices</h3>
                        <button
                          type="button"
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                        >
                          <FaPlus className="mr-1 h-3 w-3" />
                          New Invoice
                        </button>
                      </div>

                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xxs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice #
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xxs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xxs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xxs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="relative px-3 py-2">
                                <span className="sr-only">Actions</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice, idx) => (
                              <tr key={invoice.id || idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                  {invoice.id}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                  {new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                  ${invoice.total.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <span className={`px-1.5 py-0.5 inline-flex text-xxs leading-4 font-semibold rounded-full ${statusColors[invoice.status]}`}>
                                    {invoice.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => window.open(invoice.url, "_blank", "noopener,noreferrer")}
                                      className="text-blue-600 hover:text-blue-900"
                                      title="View"
                                    >
                                      <FaEye className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => setInvoiceAction({ open: true, invoice, idx })}
                                      className="text-gray-600 hover:text-gray-900"
                                      title="More"
                                    >
                                      <FaEllipsisV className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === "Documents" && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-medium text-gray-900">Documents</h3>
                        <button
                          type="button"
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                        >
                          <FaPlus className="mr-1 h-3 w-3" />
                          Upload
                        </button>
                      </div>

                      <div className="bg-white shadow overflow-hidden rounded border border-gray-200">
                        <ul className="divide-y divide-gray-200">
                          {documents.map((doc, idx) => (
                            <li key={idx} className="hover:bg-gray-50">
                              <div className="px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center min-w-0">
                                    <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                      {getDocumentIcon(doc.name)}
                                    </div>
                                    <div className="ml-2 min-w-0">
                                      <div className="text-xs font-medium text-gray-900 truncate">{doc.name}</div>
                                      <div className="flex items-center text-xxs text-gray-500 mt-0.5">
                                        <span className="capitalize">{doc.type}</span>
                                        <span className="mx-1">•</span>
                                        <span>{doc.size}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-2 flex-shrink-0 flex space-x-1">
                                    <button
                                      onClick={() => setDocModal({ open: true, doc: `https://example.com/docs/${doc.name}` })}
                                      className="inline-flex items-center px-2 py-1 border border-gray-200 shadow-sm text-xxs rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                                    >
                                      <FaEye className="mr-1 h-2.5 w-2.5" />
                                      View
                                    </button>
                                    <button className="inline-flex items-center px-2 py-1 border border-gray-200 shadow-sm text-xxs rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500">
                                      <FiDownload className="mr-1 h-2.5 w-2.5" />
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