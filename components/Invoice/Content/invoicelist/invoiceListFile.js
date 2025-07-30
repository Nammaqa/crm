"use client";
import React from "react";
import { format } from "date-fns";
import { FiChevronDown, FiFileText } from "react-icons/fi";

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
  Paid: <></>,         // You can map icons similarly if you want
  Pending: <></>,
  Cancelled: <></>,
  Sent: <></>,
  Overdue: <></>,
  PartiallyPaid: <></>,
  Refunded: <></>,
};

export default function ListFile({ paginatedInvoices, loading, sortColumn, sortOrder, handleSort, handleInvoiceClick }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                onClick={() => handleSort("created_time")}
              >
                <div className="flex items-center">
                  Created Time
                  {sortColumn === "created_time" && (
                    <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                onClick={() => handleSort("invoice_date")}
              >
                <div className="flex items-center">
                  Invoice Date
                  {sortColumn === "invoice_date" && (
                    <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                onClick={() => handleSort("due_date")}
              >
                <div className="flex items-center">
                  Due Date
                  {sortColumn === "due_date" && (
                    <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortColumn === "amount" && (
                    <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                onClick={() => handleSort("balance_due")}
              >
                <div className="flex items-center justify-end">
                  Balance Due
                  {sortColumn === "balance_due" && (
                    <FiChevronDown className={`ml-1 transition-transform text-xs ${sortOrder === "A" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="mt-2">Loading invoices...</p>
                </td>
              </tr>
            )}
            {!loading && paginatedInvoices.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  <FiFileText className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
                  <p className="mt-2">No invoices found matching your criteria</p>
                  {/* Add "Clear filters" button as per your parent component logic */}
                </td>
              </tr>
            )}
            {paginatedInvoices.map((inv) => {
              const balanceDue = inv.total - (inv.paidAmount || 0);
              return (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 cursor-pointer"
                  onClick={() => handleInvoiceClick(inv.id)}
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
                      <div className="text-xs text-gray-500 dark:text-gray-400">{inv.customer.companyName}</div>
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status] || statusColors.Draft}`}
                    >
                      {statusIcons[inv.status]}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {/* Actions menu buttons can be added here or in parent */}
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

