"use client";

import React, { useState, useEffect } from "react";

const Paymentlist = () => {
  const [payments, setPayments] = useState([]);

  // Simulate data fetch (replace with real API call later)
  useEffect(() => {
    const dummyPayments = [
      {
        id: 1,
        customer: "John Doe",
        amount: 2500,
        date: "2025-07-20",
        method: "UPI",
      },
      {
        id: 2,
        customer: "Priya Sharma",
        amount: 1500,
        date: "2025-07-22",
        method: "Cash",
      },
      {
        id: 3,
        customer: "Sameer Khan",
        amount: 3000,
        date: "2025-07-24",
        method: "Bank Transfer",
      },
    ];
    setPayments(dummyPayments);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Payments Received</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 border-b">Customer</th>
              <th className="text-left px-4 py-2 border-b">Amount (₹)</th>
              <th className="text-left px-4 py-2 border-b">Date</th>
              <th className="text-left px-4 py-2 border-b">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No payments received yet.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="border-t">
                  <td className="px-4 py-2">{payment.customer}</td>
                  <td className="px-4 py-2">₹{payment.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">{payment.date}</td>
                  <td className="px-4 py-2">{payment.method}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Paymentlist;
