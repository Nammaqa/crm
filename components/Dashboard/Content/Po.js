"use client";
import React, { useState, useRef } from "react";

export default function PurchaseOrderForm() {
  const [formData, setFormData] = useState({
    clientName: "",
    employeeName: "",
    employeeId: "",
    poNumber: "",
    startDate: "",
    endDate: "",
  });

  const fileInputRef = useRef(null); // Reference for file upload

  // Handles input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("clientName", formData.clientName);
    formDataToSend.append("employeeName", formData.employeeName);
    formDataToSend.append("employeeId", formData.employeeId);
    formDataToSend.append("poNumber", formData.poNumber);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);

    if (fileInputRef.current.files[0]) {
      formDataToSend.append("fileUpload", fileInputRef.current.files[0]);
    }

    console.log("📝 Purchase Order Form Data Submitted:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }

    alert("Form submitted successfully!");
  };

  // Handles file selection alert
  const handleFileChange = () => {
    alert(
      `Selected file: ${fileInputRef.current.files[0]?.name || "No file chosen"}`
    );
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Purchase Order Details
      </h2>
      <form id="purchaseOrderForm" onSubmit={handleSubmit} className="space-y-4">
        {/* Client Name */}
        <label htmlFor="clientName" className="block font-medium text-gray-700">
          Client Name
        </label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          placeholder="Enter client name"
          required
          value={formData.clientName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Employee Name */}
        <label htmlFor="employeeName" className="block font-medium text-gray-700">
          Employee Name
        </label>
        <input
          type="text"
          id="employeeName"
          name="employeeName"
          placeholder="Enter employee name"
          required
          value={formData.employeeName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Employee ID */}
        <label htmlFor="employeeId" className="block font-medium text-gray-700">
          Employee ID
        </label>
        <input
          type="text"
          id="employeeId"
          name="employeeId"
          placeholder="Enter employee ID"
          required
          value={formData.employeeId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* PO Number */}
        <label htmlFor="poNumber" className="block font-medium text-gray-700">
          PO Number
        </label>
        <input
          type="text"
          id="poNumber"
          name="poNumber"
          placeholder="Enter PO number"
          required
          value={formData.poNumber}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Start Date */}
        <label htmlFor="startDate" className="block font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          required
          value={formData.startDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* End Date */}
        <label htmlFor="endDate" className="block font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          required
          value={formData.endDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* File Upload */}
        <label htmlFor="fileUpload" className="block font-medium text-gray-700">
          Upload File
        </label>
        <input
          type="file"
          id="fileUpload"
          name="fileUpload"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
