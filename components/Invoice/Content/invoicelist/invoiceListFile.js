"use client";
import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { FiChevronDown, FiFileText } from "react-icons/fi";

// Status color and icon mappings
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

const columns = [
  { key: "createdAt", label: "Created Time", sortable: true },
  { key: "invoiceCode", label: "Invoice #", sortable: true },
  { key: "customer", label: "Customer", sortable: false },
  { key: "invoiceDate", label: "Invoice Date", sortable: true },
  { key: "dueDate", label: "Due Date", sortable: true },
  { key: "total", label: "Amount", sortable: true },
  { key: "balanceDue", label: "Balance Due", sortable: true },
  { key: "status", label: "Status", sortable: false },
  { key: "actions", label: "Actions", sortable: false },
];

function getBalanceDue(inv) {
  // Use balancedDue if present, else calculate
  if (typeof inv.balancedDue === "number") return inv.balancedDue;
  if (typeof inv.balanceDue === "number") return inv.balanceDue;
  return Math.max(0, (inv.total || 0) - (inv.amountReceived || inv.paidAmount || 0));
}

export default function InvoiceListFile({ invoices, onSelectInvoice }) {
  const [sortColumn, setSortColumn] = useState("invoiceDate");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (col) => {
    if (col === sortColumn) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const sortedInvoices = useMemo(() => {
    if (!Array.isArray(invoices)) return [];
    const sorted = [...invoices].sort((a, b) => {
      let aVal, bVal;
      if (sortColumn === "customer") {
        aVal = a.customer?.displayName || "";
        bVal = b.customer?.displayName || "";
      } else if (sortColumn === "balanceDue") {
        aVal = getBalanceDue(a);
        bVal = getBalanceDue(b);
      } else {
        aVal = a[sortColumn];
        bVal = b[sortColumn];
      }
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [invoices, sortColumn, sortDirection]);

  if (!invoices) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-400 dark:text-gray-500 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        Loading invoices...
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-400 dark:text-gray-500 text-sm">
        <FiFileText className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
        No invoices found matching your criteria
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${
                    col.key === "amount" || col.key === "balanceDue"
                      ? "text-right"
                      : col.key === "status" || col.key === "actions"
                      ? "text-center"
                      : "text-left"
                  } text-gray-500 dark:text-gray-400 ${
                    col.sortable
                      ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                      : ""
                  }`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div
                    className={`flex items-center ${
                      col.key === "amount" || col.key === "balanceDue"
                        ? "justify-end"
                        : col.key === "status" || col.key === "actions"
                        ? "justify-center"
                        : ""
                    }`}
                  >
                    {col.label}
                    {col.sortable && sortColumn === col.key && (
                      <FiChevronDown
                        className={`ml-1 transition-transform text-xs ${
                          sortDirection === "asc" ? "transform rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedInvoices.map((inv) => {
              const balanceDue = getBalanceDue(inv);
              return (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 cursor-pointer"
                  onClick={() => onSelectInvoice && onSelectInvoice(inv.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {inv.createdAt
                      ? format(new Date(inv.createdAt), "dd MMM yyyy, hh:mm a")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700 dark:text-blue-400">
                    {inv.invoiceCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="font-medium">{inv.customer?.displayName}</div>
                    {inv.customer?.companyName && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {inv.customer.companyName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {inv.invoiceDate
                      ? format(new Date(inv.invoiceDate), "dd MMM yyyy")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {inv.dueDate
                      ? format(new Date(inv.dueDate), "dd MMM yyyy")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    ₹{(inv.total || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    ₹{balanceDue.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[inv.status] || statusColors.Draft
                      }`}
                    >
                      {statusIcons[inv.status]}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <FiFileText
                      className="inline-block mr-2 text-blue-600"
                      title="View Details"
                    />
                    {/* Add more action icons as needed */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}