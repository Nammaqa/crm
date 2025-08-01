"use client";

import React, { useMemo } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiMoreVertical,
  FiMail,
  FiPrinter,
  FiDownload,
  FiEdit,
  FiPlus,
  FiChevronUp,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiShare2,
  FiTrash2,
  FiCopy,
  FiDollarSign,
  FiX,
  FiPaperclip,
  FiUser,
  FiPhone,
  FiHome,
  FiCreditCard,
} from "react-icons/fi";
import { format } from "date-fns";
import Link from "next/link";
import { Tooltip } from 'react-tooltip';

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
  Paid: <FiCheckCircle className="inline-block mr-1" />,
  Pending: <FiClock className="inline-block mr-1" />,
  Draft: <FiFileText className="inline-block mr-1" />,
  Cancelled: <FiXCircle className="inline-block mr-1" />,
  Sent: <FiMail className="inline-block mr-1" />,
  Overdue: <FiXCircle className="inline-block mr-1" />,
  PartiallyPaid: <FiDollarSign className="inline-block mr-1" />,
  Refunded: <FiDollarSign className="inline-block mr-1" />,
};

const InvoiceList = ({ invoices }) => {
  // Only invoices whose status is 'Paid'
  const paidInvoices = useMemo(
    () => invoices.filter(inv => inv.status === "Paid"),
    [invoices]
  );
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Paid Invoices</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b px-4 py-2 text-left">Created Time</th>
              <th className="border-b px-4 py-2 text-left">Invoice #</th>
              <th className="border-b px-4 py-2 text-left">Customer</th>
              <th className="border-b px-4 py-2 text-left">Invoice Date</th>
              <th className="border-b px-4 py-2 text-left">Due Date</th>
              <th className="border-b px-4 py-2 text-right">Amount</th>
              <th className="border-b px-4 py-2 text-right">Balance Due</th>
              <th className="border-b px-4 py-2 text-left">Status</th>
              <th className="border-b px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paidInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  No paid invoices found.
                </td>
              </tr>
            ) : (
              paidInvoices.map(inv => {
                const balanceDue = (inv.total || 0) - (inv.amountPaid || 0);
                return (
                  <tr key={inv.invoiceCode} className="hover:bg-gray-50">
                    <td className="border-b px-4 py-2">
                      {inv.createdAt ? format(new Date(inv.createdAt), "dd MMM yyyy, hh:mm a") : "-"}
                    </td>
                    <td className="border-b px-4 py-2">{inv.invoiceCode}</td>
                    <td className="border-b px-4 py-2">
                      {inv.customer?.displayName}
                      {inv.customer?.companyName && inv.customer.displayName !== inv.customer.companyName && ` (${inv.customer.companyName})`}
                    </td>
                    <td className="border-b px-4 py-2">
                      {inv.invoiceDate ? format(new Date(inv.invoiceDate), "dd MMM yyyy") : "-"}
                    </td>
                    <td className="border-b px-4 py-2">
                      {inv.dueDate ? format(new Date(inv.dueDate), "dd MMM yyyy") : "-"}
                    </td>
                    <td className="border-b px-4 py-2 text-right">₹{(inv.total || 0).toLocaleString("en-IN")}</td>
                    <td className="border-b px-4 py-2 text-right">₹{balanceDue.toLocaleString("en-IN")}</td>
                    <td className="border-b px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        statusColors[inv.status] || statusColors.Draft
                      }`}>
                        {statusIcons[inv.status]} {inv.status}
                      </span>
                    </td>
                    <td className="border-b px-4 py-2 text-center space-x-3">
                      {/* $ Payments */}
                      <button
                        type="button"
                        className="text-green-600 hover:text-green-900"
                        title="$ Payments"
                        onClick={() => {
                          // Implement payment details logic here
                          alert(`Show payments for Invoice ${inv.invoiceCode}`);
                        }}
                      >
                        <FiDollarSign size={18} />
                      </button>
                      {/* Invoice */}
                      <Link href={`/invoices/${inv.invoiceCode}`} passHref>
                        <a className="text-blue-600 hover:text-blue-900" title="Invoice Details">
                          <FiFileText size={18} />
                        </a>
                      </Link>
                      {/* Clone */}
                      <button
                        type="button"
                        className="text-gray-600 hover:text-gray-900"
                        title="Clone Invoice"
                        onClick={() => {
                          // Implement clone logic here
                          alert(`Clone Invoice ${inv.invoiceCode}`);
                        }}
                      >
                        <FiCopy size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Tooltip id="action-tooltip" />
    </div>
  );
};

export default InvoiceList;
  