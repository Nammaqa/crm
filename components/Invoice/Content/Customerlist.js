"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaPlus, FaChevronDown, FaChevronUp, FaEye, FaTimes, FaEdit, FaEllipsisV } from "react-icons/fa";
import Link from "next/link";

function stringToColor(str) {
  return "#2563eb";
}

const TABS = [
  { name: "Overview" },
  { name: "Invoice" },
  // { name: "Statement" },
];

export default function Customerlist() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState(TABS[0].name);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  // Helper for showing "No Address" with add link
  const renderAddress = (label, address, city, state, pin, country, phone, fax, attention) => {
    if (!address && !city && !state && !pin) {
      return (
        <span className="text-[#64748b]">
          No {label} - <button className="text-[#2563eb] underline hover:text-[#1e40af]">New Address</button>
        </span>
      );
    }
    return (
      <span className="text-[#0f172a]">
        {attention && <span className="font-medium">{attention}, </span>}
        {address}
        {city && `, ${city}`}
        {state && `, ${state}`}
        {pin && `, ${pin}`}
        {country && `, ${country}`}
        {phone && `, Phone: ${phone}`}
        {fax && `, Fax: ${fax}`}
      </span>
    );
  };

  // Reset detailsOpen when switching customers or tabs
  useEffect(() => {
    setDetailsOpen(false);
    setDocModal({ open: false, doc: null });
  }, [selectedIdx, activeTab]);

  // Helper to check if a string is a URL
  function isUrl(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  // Modal for document viewing
  function DocumentModal({ doc, onClose }) {
    if (!doc) return null;
    // If it's a URL, show iframe for PDF/images, else show as text
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-lg font-bold mb-4 text-[#1e40af]">Document Viewer</h2>
          {isUrl(doc) ? (
            <iframe
              src={doc}
              title="Document"
              className="w-full h-96 border rounded"
              frameBorder="0"
            />
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">{doc}</pre>
          )}
        </div>
      </div>
    );
  }

  // Modal for invoice status change
  function InvoiceStatusModal({ invoice, onClose, onSave }) {
    const [status, setStatus] = useState(invoice.status || "Pending");
    const [saving, setSaving] = useState(false);

    function handleSave() {
      setSaving(true);
      setTimeout(() => {
        onSave(status);
        setSaving(false);
        onClose();
      }, 700); // Simulate API
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-lg font-bold mb-4 text-[#1e40af]">Change Invoice Status</h2>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <button
            className="bg-[#2563eb] text-white px-4 py-2 rounded font-semibold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  // Mock invoices if not present
  const invoices = selectedCustomer?.Invoice || [
    {
      id: "INV-001",
      date: "2024-06-01",
      total: 1200,
      status: "Pending",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "INV-002",
      date: "2024-06-10",
      total: 800,
      status: "Paid",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Container */}
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between p-6 rounded-2xl shadow-lg"
        style={{ background: "#101828" }}
      >
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Customer List</h2>
          <p className="text-[#e0e7ef] mt-1">Manage your customers efficiently</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#2563eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8] bg-white text-[#0f172a] shadow-sm transition"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2563eb]" />
          </div>
          {/* Add Button */}
          <Link href="/customer"
               className="flex items-center gap-2 bg-[#2563eb] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#1e40af] transition"
              //  onClick={() => router.push("/customer")}
>
            <FaPlus />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Split Container */}
      <div className="bg-white rounded-2xl shadow-xl flex h-[600px] min-h-[350px] overflow-hidden border border-[#e0e7ef]">
        {/* Left: Customer Names List */}
        <div className="w-1/3 border-r border-[#e0e7ef] bg-gradient-to-b from-[#f1f5f9] to-white overflow-y-auto">
          {loading ? (
            <div className="p-8 text-[#2563eb] text-center">Loading...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-[#2563eb] text-center">No customers found.</div>
          ) : (
            <ul>
              {filteredCustomers.map((customer, idx) => (
                <li
                  key={customer.id ?? customer.emailAddress ?? customer.email ?? idx}
                  className={`flex items-center gap-3 cursor-pointer px-6 py-4 border-b border-[#e0e7ef] hover:bg-[#e0e7ef] transition
                    ${safeSelectedIdx === idx ? "bg-[#2563eb]/10 font-semibold text-[#1e40af] shadow-inner" : ""}
                  `}
                  onClick={() => {
                    setSelectedIdx(idx);
                    setActiveTab(TABS[0].name);
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow"
                    style={{
                      background: stringToColor(customer.displayName || customer.name || ""),
                    }}
                  >
                    {(customer.displayName || customer.name || "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base">{customer.displayName || customer.name || "-"}</div>
                    <div className="text-xs text-[#2563eb]">{customer.companyName || customer.company || "-"}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: Details & Tabs */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white via-[#f1f5f9] to-[#e0e7ef]">
          {/* Tabs */}
          <div className="flex border-b border-[#e0e7ef] bg-white/80 px-6">
            {TABS.map((tab) => (
              <button
                key={tab.name}
                className={`flex items-center gap-2 px-6 py-4 -mb-px border-b-4 font-semibold text-lg transition
                  ${activeTab === tab.name
                    ? "border-[#2563eb] text-[#1e40af] bg-[#e0e7ef]"
                    : "border-transparent text-[#2563eb] hover:text-[#1e40af] hover:bg-[#f1f5f9]"}
                `}
                onClick={() => setActiveTab(tab.name)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {!selectedCustomer ? (
              <div className="text-[#2563eb] text-center mt-20 text-lg">
                {loading ? "Loading..." : "Select a customer to view details."}
              </div>
            ) : (
              <>
                {activeTab === "Overview" && (
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow border border-[#e0e7ef] p-8">
                      {/* Top Row: Avatar + Basic Info */}
                      <div className="flex items-center gap-6 mb-6">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                          style={{
                            background: stringToColor(selectedCustomer.displayName || selectedCustomer.name || ""),
                          }}
                        >
                          {(selectedCustomer.displayName || selectedCustomer.name || "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#1e40af]">{selectedCustomer.displayName || selectedCustomer.name || "-"}</h3>
                          <div className="text-[#2563eb]">{selectedCustomer.companyName || selectedCustomer.company || "-"}</div>
                        </div>
                      </div>
                      {/* Divider */}
                      <div className="border-t border-[#e0e7ef] my-4"></div>
                      {/* Basic Info */}
                      <div className="space-y-3">
                        <div>
                          <span className="font-semibold text-[#2563eb]">Email: </span>
                          <span>{selectedCustomer.emailAddress || selectedCustomer.email || "-"}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#2563eb]">Phone: </span>
                          <span>
                            {selectedCustomer.phoneNumberMobile ||
                              selectedCustomer.phoneNumberWork ||
                              selectedCustomer.phone ||
                              "-"}
                          </span>
                        </div>
                        {/* Documents */}
                        <div>
                          <span className="font-semibold text-[#2563eb]">Documents: </span>
                          {Array.isArray(selectedCustomer.documents) && selectedCustomer.documents.length > 0 ? (
                            <ul className="list-disc ml-6 space-y-1">
                              {selectedCustomer.documents.map((doc, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="truncate max-w-xs">{typeof doc === "string" ? doc : "Document"}</span>
                                  <button
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2563eb] text-white rounded hover:bg-[#1e40af] transition"
                                    onClick={() => {
                                      if (typeof doc === "string" && isUrl(doc)) {
                                        window.open(doc, "_blank", "noopener,noreferrer");
                                      } else {
                                        setDocModal({ open: true, doc });
                                      }
                                    }}
                                  >
                                    <FaEye /> View
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-[#64748b]">No documents</span>
                          )}
                        </div>
                      </div>
                      {/* Expand/Collapse Button */}
                      <button
                        className="flex items-center gap-2 mt-6 text-[#2563eb] hover:text-[#1e40af] font-semibold transition"
                        onClick={() => setDetailsOpen((open) => !open)}
                        aria-expanded={detailsOpen}
                        aria-controls="customer-details-panel"
                      >
                        {detailsOpen ? <FaChevronUp /> : <FaChevronDown />}
                        {detailsOpen ? "Hide Details" : "Show More Details"}
                      </button>
                      {/* Collapsible Details */}
                      {detailsOpen && (
                        <div
                          id="customer-details-panel"
                          className="mt-6 space-y-4 animate-fade-in"
                        >
                          {/* Address */}
                          <div>
                            <span className="font-semibold text-[#2563eb]">Billing Address: </span>
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
                          <div>
                            <span className="font-semibold text-[#2563eb]">Shipping Address: </span>
                            <span className="text-[#64748b]">
                              No Shipping Address - <button className="text-[#2563eb] underline hover:text-[#1e40af]">New Address</button>
                            </span>
                          </div>
                          {/* Contact Details */}
                          <div>
                            <span className="font-semibold text-[#2563eb]">Customer Type: </span>
                            <span>{selectedCustomer.customerType || "-"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2563eb]">Default Currency: </span>
                            <span>{selectedCustomer.currency || "-"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2563eb]">Portal Status: </span>
                            <span>{selectedCustomer.portalStatus || "Disabled"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2563eb]">Portal Language: </span>
                            <span>{selectedCustomer.portalLanguage || "English"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2563eb]">PAN: </span>
                            <span>{selectedCustomer.pan || "-"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2563eb]">Website: </span>
                            <span>{selectedCustomer.website || "-"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2563eb]">Department: </span>
                            <span>{selectedCustomer.department || "-"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2563eb]">Designation: </span>
                            <span>{selectedCustomer.designation || "-"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2563eb]">Remarks: </span>
                            <span>{selectedCustomer.remarks || "-"}</span>
                          </div>
                          {/* Contact Persons (if any) */}
                          <div>
                            <span className="font-semibold text-[#2563eb]">Contact Persons: </span>
                            <span className="text-[#64748b]">No contact persons - <button className="text-[#2563eb] underline hover:text-[#1e40af]">Add</button></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === "Invoice" && (
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow border border-[#e0e7ef] p-6">
                      <h3 className="text-xl font-bold mb-6 text-[#1e40af]">Invoices</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-[#e0e7ef] rounded">
                          <thead>
                            <tr className="bg-[#f1f5f9] text-[#1e40af]">
                              <th className="px-4 py-2 border-b">Invoice ID</th>
                              <th className="px-4 py-2 border-b">Invoice Date</th>
                              <th className="px-4 py-2 border-b">Total Amount</th>
                              <th className="px-4 py-2 border-b">Status</th>
                              <th className="px-4 py-2 border-b">View</th>
                              <th className="px-4 py-2 border-b">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedCustomer?.Invoice && selectedCustomer.Invoice.length > 0
                              ? selectedCustomer.Invoice
                              : [
                                  {
                                    id: "INV-001",
                                    date: "2024-06-01",
                                    total: 1200,
                                    status: "Pending",
                                    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                                  },
                                  {
                                    id: "INV-002",
                                    date: "2024-06-10",
                                    total: 800,
                                    status: "Paid",
                                    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                                  }
                                ]
                            ).map((invoice, idx) => (
                              <tr key={invoice.id || idx} className="text-[#0f172a]">
                                <td className="px-4 py-2 border-b">{invoice.id}</td>
                                <td className="px-4 py-2 border-b">{invoice.date}</td>
                                <td className="px-4 py-2 border-b">₹{invoice.total}</td>
                                <td className="px-4 py-2 border-b">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold
                                    ${invoice.status === "Paid" ? "bg-green-100 text-green-700" :
                                      invoice.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                      invoice.status === "Cancelled" ? "bg-red-100 text-red-700" :
                                      invoice.status === "Overdue" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}
                                  `}>
                                    {invoice.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 border-b">
                                  <button
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2563eb] text-white rounded hover:bg-[#1e40af] transition"
                                    onClick={() => window.open(invoice.url, "_blank", "noopener,noreferrer")}
                                  >
                                    <FaEye /> View
                                  </button>
                                </td>
                                <td className="px-4 py-2 border-b">
                                  <button
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[#64748b] text-white rounded hover:bg-[#1e40af] transition"
                                    onClick={() => setInvoiceAction({ open: true, invoice, idx })}
                                  >
                                    <FaEllipsisV /> Action
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
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
            // Update status in mock data or in real data
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