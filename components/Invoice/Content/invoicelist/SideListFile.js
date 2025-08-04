"use client";

import React from "react";
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

function getBalanceDue(inv) {
  if (typeof inv.balancedDue === "number") return inv.balancedDue;
  if (typeof inv.balanceDue === "number") return inv.balanceDue;
  return Math.max(0, (inv.total || 0) - (inv.amountReceived || inv.paidAmount || 0));
}

export default function SideListFile({
  paginatedInvoices,
  selectedInvoiceId,
  setSelectedInvoiceId,
  search,
}) {
  if (!paginatedInvoices || paginatedInvoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <span className="text-lg font-medium">No invoices found.</span>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-340 border-r w-80 p-2 bg-white dark:bg-gray-900">
      <h3 className="mb-2 text-base font-bold">Invoices</h3>
      <ul>
        {paginatedInvoices.map((inv) => {
          const balanceDue = getBalanceDue(inv);
          const isSelected = selectedInvoiceId === inv.id;

          return (
            <li
              key={inv.id}
              onClick={() => setSelectedInvoiceId(inv.id)}
              className={`mb-2 cursor-pointer p-3 rounded border transition-colors duration-150 ${
                isSelected
                  ? "bg-blue-100 border-blue-400 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              tabIndex={0}
              aria-selected={isSelected}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedInvoiceId(inv.id);
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  #{inv.invoiceCode}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    statusColors[inv.status] || "bg-gray-200 text-gray-800"
                  }`}
                >
                  {inv.status}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-900 dark:text-white truncate">
                  {inv.customer?.displayName || "No Customer"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {inv.invoiceDate
                    ? format(new Date(inv.invoiceDate), "dd/MM/yyyy")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  ₹{(inv.total || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-red-600 font-semibold">
                  Balance Due: ₹{balanceDue.toLocaleString("en-IN")}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
