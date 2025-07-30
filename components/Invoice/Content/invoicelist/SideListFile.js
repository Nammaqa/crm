"use client";
import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

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
  Draft: <></>, // You can add icons as in other file
  Paid: <></>,
  Pending: <></>,
  Cancelled: <></>,
  Sent: <></>,
  Overdue: <></>,
  PartiallyPaid: <></>,
  Refunded: <></>,
};

export default function SideListFile({ paginatedInvoices, selectedInvoiceId, setSelectedInvoiceId, search }) {
  return (
    <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Search Bar for Left Panel */}
      <div className="sticky top-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 z-10 shadow-sm">
        <div className="relative">
          {/* If you want a search input here, controlled from parent or local state */}
        </div>
      </div>

      {/* Invoice List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
        {paginatedInvoices.map((inv) => {
          const balanceDue = inv.total - (inv.paidAmount || 0);
          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-3 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer ${
                selectedInvoiceId === inv.id ? "bg-blue-50 dark:bg-gray-800 border-r-4 border-blue-500 dark:border-blue-400" : ""
              }`}
              onClick={() => setSelectedInvoiceId(inv.id)}
            >
              {/* Customer Name */}
              <div className="font-semibold text-gray-900 dark:text-white mb-1 text-sm truncate">
                {inv.customer?.displayName || 'No Customer'}
              </div>

              {/* Invoice Code and Date */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  #{inv.invoiceCode}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {inv.invoiceDate
                    ? format(new Date(inv.invoiceDate), "dd/MM/yyyy")
                    : "-"}
                </span>
              </div>

              {/* Amount and Status */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  ₹{(inv.total || 0).toLocaleString("en-IN")}
                </span>
                <div className="flex items-center space-x-2">
                  {balanceDue > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Due: ₹{balanceDue.toLocaleString("en-IN")}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status] || statusColors.Draft}`}
                  >
                    {statusIcons[inv.status]}
                    {inv.status}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
