"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiSearch, FiFilter, FiRefreshCw, FiPlus, FiDownload, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";

import ListFile from "./invoicelist/invoiceListFile";
import SideListFile from "./invoicelist/SideListFile";
import InvoicePayment from "./invoicelist/InvoicePayment";

export default function InvoiceList() {
  // === States ===
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

  // === Fetch invoices ===
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

  // === Fetch selected invoice details ===
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

  // === Filtering logic ===
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    // 1. Search: filters invoiceCode and customer displayName
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          (inv.invoiceCode && inv.invoiceCode.toLowerCase().includes(searchLower)) ||
          (inv.customer?.displayName && inv.customer.displayName.toLowerCase().includes(searchLower))
      );
    }

    // 2. Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // 3. Customer filter
    if (customerFilter !== "All") {
      filtered = filtered.filter((inv) => inv.customer?.id === customerFilter);
    }

    // 4. Invoice number filter (exact match or partial)
    if (invoiceNumberFilter.trim() !== "") {
      const filterLower = invoiceNumberFilter.toLowerCase();
      filtered = filtered.filter((inv) =>
        inv.invoiceCode?.toLowerCase().includes(filterLower)
      );
    }

    // 5. Date range filter (invoice_date or due_date)
    if (startDate !== "" || endDate !== "") {
      filtered = filtered.filter((inv) => {
        let dateValue;
        if (dateRangeFilter === "invoice_date") {
          dateValue = inv.invoiceDate;
        } else if (dateRangeFilter === "due_date") {
          dateValue = inv.dueDate;
        } else {
          return true;
        }
        if (!dateValue) return false;

        const invDate = new Date(dateValue);
        if (isNaN(invDate)) return false;

        if (startDate && invDate < new Date(startDate)) return false;
        if (endDate && invDate > new Date(endDate)) return false;
        return true;
      });
    }

    // 6. Amount filter (=, >, <, >=, <=) applied to total
    if (amountValue.trim() !== "" && !isNaN(amountValue)) {
      const numAmount = parseFloat(amountValue);
      switch (amountFilter) {
        case "=":
          filtered = filtered.filter((inv) => Number(inv.total) === numAmount);
          break;
        case ">":
          filtered = filtered.filter((inv) => Number(inv.total) > numAmount);
          break;
        case "<":
          filtered = filtered.filter((inv) => Number(inv.total) < numAmount);
          break;
        case ">=":
          filtered = filtered.filter((inv) => Number(inv.total) >= numAmount);
          break;
        case "<=":
          filtered = filtered.filter((inv) => Number(inv.total) <= numAmount);
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [
    invoices,
    search,
    statusFilter,
    customerFilter,
    invoiceNumberFilter,
    dateRangeFilter,
    startDate,
    endDate,
    amountFilter,
    amountValue,
  ]);

  // === Sorting logic ===
  const sortedInvoices = useMemo(() => {
    const sorted = [...filteredInvoices];

    sorted.sort((a, b) => {
      let valA, valB;

      switch (sortColumn) {
        case "created_time":
          valA = new Date(a.createdAt);
          valB = new Date(b.createdAt);
          break;
        case "invoice_date":
          valA = new Date(a.invoiceDate);
          valB = new Date(b.invoiceDate);
          break;
        case "due_date":
          valA = new Date(a.dueDate);
          valB = new Date(b.dueDate);
          break;
        case "amount":
          valA = Number(a.total);
          valB = Number(b.total);
          break;
        case "balance_due": {
          const balA = Number(a.total) - (Number(a.paidAmount) || 0);
          const balB = Number(b.total) - (Number(b.paidAmount) || 0);
          valA = balA;
          valB = balB;
          break;
        }
        default:
          valA = a[sortColumn];
          valB = b[sortColumn];
          break;
      }

      // For undefined or invalid dates/numbers, fallback to 0 or minimal value
      if (valA === undefined || valA === null || (valA instanceof Date && isNaN(valA))) valA = 0;
      if (valB === undefined || valB === null || (valB instanceof Date && isNaN(valB))) valB = 0;

      if (valA < valB) return sortOrder === "A" ? -1 : 1;
      if (valA > valB) return sortOrder === "A" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredInvoices, sortColumn, sortOrder]);

  // === Pagination logic ===
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    return sortedInvoices.slice(startIndex, endIndex);
  }, [sortedInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);

  // === Event handlers ===
  const handleSort = useCallback(
    (column) => {
      if (sortColumn === column) {
        setSortOrder(sortOrder === "A" ? "D" : "A");
      } else {
        setSortColumn(column);
        setSortOrder("A");
      }
    },
    [sortColumn, sortOrder]
  );

  const handleInvoiceClick = useCallback(
    (id) => {
      setSelectedInvoiceId(id);
    },
    []
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCustomerFilter("All");
    setDateRangeFilter("invoice_date");
    setStartDate("");
    setEndDate("");
    setAmountFilter("=");
    setAmountValue("");
    setInvoiceNumberFilter("");
  };

  const handleAction = (action, id, data) => {
    // Here you can route actions like update payment, status change, write off, etc.
    console.log("Action:", action, "on Invoice ID:", id, "with data:", data);

    // Example: refetch invoices or update state after action
  };

  // === Render pagination controls (simple example) ===
  const PaginationControls = () => (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 rounded border disabled:opacity-50"
      >
        <FiChevronLeft />
      </button>
      <span className="text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages || 1}
      </span>
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="p-2 rounded border disabled:opacity-50"
      >
        <FiChevronRight />
      </button>
    </div>
  );

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

        {/* Filter UI - You can customize this section */}
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search invoice or customer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-1.5 dark:bg-gray-700 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Draft">Draft</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Sent">Sent</option>
              <option value="Overdue">Overdue</option>
              <option value="PartiallyPaid">Partially Paid</option>
              <option value="Refunded">Refunded</option>
            </select>

            {/* You can add more filters similarly (customerFilter, amount filters, date range, etc.) */}

            <button
              onClick={clearFilters}
              className="ml-auto bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Conditional rendering based on whether an invoice is selected */}
        {!selectedInvoice ? (
          <ListFile
            paginatedInvoices={paginatedInvoices}
            loading={loading}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            handleSort={handleSort}
            handleInvoiceClick={handleInvoiceClick}
          />
        ) : (
          <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden min-h-[600px] border dark:border-gray-700">
            <SideListFile
              paginatedInvoices={paginatedInvoices}
              selectedInvoiceId={selectedInvoiceId}
              setSelectedInvoiceId={setSelectedInvoiceId}
              search={search}
            />
            <div className="w-2/3">
              <InvoicePayment
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoiceId(null)}
                onAction={handleAction}
              />
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <PaginationControls />
      </div>
    </div>
  );
}
