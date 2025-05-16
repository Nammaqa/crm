"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function InvoiceForm() {
  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    invoiceNumber: "WB-IN105",
    invoiceDate: "2024-12-12",
    dueDate: "2024-12-12",
    poNumber: "",
    shipTo: "",
    customerNotes: "Thanks for your business.",
  });

  const [rows, setRows] = useState([
    { employeeName: "", month: "", leaves: 0, leaveExceptions: "", billableDays: 0, billableRate: 0, currency: "INR", billableCost: 0, gst: 18, totalAmount: 0 }
  ]);

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...rows];
    updatedRows[index][name] = value;

    // Live calculation of Billable Cost and Total Amount
    updatedRows[index].billableCost = updatedRows[index].billableDays * updatedRows[index].billableRate;
    updatedRows[index].totalAmount = updatedRows[index].billableCost + (updatedRows[index].billableCost * updatedRows[index].gst / 100);

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { employeeName: "", month: "", leaves: 0, leaveExceptions: "", billableDays: 0, billableRate: 0, currency: "INR", billableCost: 0, gst: 18, totalAmount: 0 }]);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const totalAmount = rows.reduce((sum, row) => sum + parseFloat(row.totalAmount || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📝 Submitted Invoice:", { invoiceData, rows, totalAmount });
    alert("Invoice saved successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">New Invoice</h2>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-medium text-gray-700">Customer Name:</label>
          <Input name="customerName" value={invoiceData.customerName} onChange={handleInvoiceChange} className="p-2 border rounded w-full" />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Invoice Number:</label>
          <Input type="text" name="invoiceNumber" value={invoiceData.invoiceNumber} readOnly className="p-2 border rounded w-full bg-gray-100" />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Invoice Date:</label>
          <Input type="date" name="invoiceDate" value={invoiceData.invoiceDate} readOnly className="p-2 border rounded w-full bg-gray-100" />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Due Date:</label>
          <Input type="date" name="dueDate" value={invoiceData.dueDate} readOnly className="p-2 border rounded w-full bg-gray-100" />
        </div>
        <div>
          <label className="block font-medium text-gray-700">PO Number:</label>
          <Input type="text" name="poNumber" placeholder="Enter PO Number" value={invoiceData.poNumber} onChange={handleInvoiceChange} className="p-2 border rounded w-full" />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Ship To:</label>
          <Input type="text" name="shipTo" placeholder="Enter Shipping Address" value={invoiceData.shipTo} onChange={handleInvoiceChange} className="p-2 border rounded w-full" />
        </div>
      </div>

      {/* Invoice Table */}
      <table className="w-full border-collapse border mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Employee Name</th>
            <th className="border p-2">Month</th>
            <th className="border p-2">No. of Leaves</th>
            <th className="border p-2">Leave Exceptions</th>
            <th className="border p-2">Total Billable Days</th>
            <th className="border p-2">Billable Rate</th>
            <th className="border p-2">Currency</th>
            <th className="border p-2">Billable Cost</th>
            <th className="border p-2">GST (%)</th>
            <th className="border p-2">Total Amount</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="text-center">
              <td className="border p-2"><Input type="text" name="employeeName" value={row.employeeName} onChange={(e) => handleRowChange(index, e)} className="w-full p-1 border rounded" /></td>
              <td className="border p-2">
                <select name="month" value={row.month} onChange={(e) => handleRowChange(index, e)} className="w-full p-1 border rounded">
                  <option value="">Select Month</option>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </td>
              <td className="border p-2"><Input type="number" name="leaves" value={row.leaves} onChange={(e) => handleRowChange(index, e)} className="w-full p-1 border rounded" /></td>
              <td className="border p-2"><Input type="text" name="leaveExceptions" value={row.leaveExceptions} onChange={(e) => handleRowChange(index, e)} className="w-full p-1 border rounded" /></td>
              <td className="border p-2">{row.billableDays}</td>
              <td className="border p-2">{row.billableRate}</td>
              <td className="border p-2">
                <select name="currency" value={row.currency} onChange={(e) => handleRowChange(index, e)} className="w-full p-1 border rounded">
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </td>
              <td className="border p-2">{row.billableCost.toFixed(2)}</td>
              <td className="border p-2"><td className="border p-2">
                <Input type="number" name="gst" value={row.gst} onChange={(e) => handleRowChange(index, e)} className="w-full p-1 border rounded" />
              </td>
              </td>
              <td className="border p-2">{row.totalAmount.toFixed(2)}</td>
              <td className="border p-2"><button onClick={() => removeRow(index)} className="text-red-500">Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow} className="p-2 bg-green-500 text-white rounded mr-2">+ Add New Row</button>


      <label className="block font-medium text-gray-700 mt-4">Customer Notes:</label>
      <Textarea name="customerNotes" value={invoiceData.customerNotes} onChange={handleInvoiceChange} className="w-full p-2 border rounded" />

      <div className="p-4">
        <button onClick={handleSubmit} className="p-2 bg-blue-500 text-white rounded">Save</button>
        <button onClick={handlePrint} className="p-2 bg-gray-600 text-white rounded ml-2">Print Invoice</button>

      </div>


      <div className="mt-4 font-bold text-right">Total (₹): {totalAmount.toFixed(2)}</div>
    </div>
  );
}
