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

  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Block numeric input for name fields
  const handleAlphaInput = (e) => {
    if (e.nativeEvent && e.nativeEvent.data && !/[A-Za-z\s]/.test(e.nativeEvent.data)) {
      e.preventDefault();
    }
  };

  // Handles input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles file selection and validates type and size
  const handleFileChange = (e) => {
    setFileError("");
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      fileInputRef.current.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError("PDF file must be 2MB or less.");
      fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // Handles file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    fileInputRef.current.value = "";
  };

  // Handles file selection dialog opening
  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate file before submit
    const file = fileInputRef.current?.files?.[0];
    setFileError("");
    if (file) {
      if (file.type !== "application/pdf") {
        setFileError("Only PDF files are allowed.");
        setLoading(false);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFileError("PDF file must be 2MB or less.");
        setLoading(false);
        return;
      }
    }

    const formDataToSend = new FormData();
    formDataToSend.append("clientName", formData.clientName);
    formDataToSend.append("employeeName", formData.employeeName);
    // formDataToSend.append("employeeId", formData.employeeId);
    formDataToSend.append("poNumber", formData.poNumber);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);
    formDataToSend.append("type", "PO"); // Important to set type

    if (file) {
      formDataToSend.append("fileUpload", file);
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Purchase Order submitted successfully!");
        // Log form data and file to console
        console.log("Form Data:", formData);
        if (file) {
          console.log("Uploaded File:", file);
        }
        // Clear form fields and file input
        setFormData({
          clientName: "",
          employeeName: "",
          // employeeId: "",
          poNumber: "",
          startDate: "",
          endDate: "",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFile(null);
      } else {
        alert(data.message || "Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting PO:", error);
      alert("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Purchase Order Details
      </h2>
      <form id="purchaseOrderForm" onSubmit={handleSubmit} className="space-y-4">
        {/* Client Name */}
        <label htmlFor="clientName" className="block font-medium text-gray-700">
          Client Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          placeholder="Enter client name"
          required
          value={formData.clientName}
          onChange={handleChange}
          onBeforeInput={handleAlphaInput}
          className="w-full p-2 border rounded"
        />

        {/* Employee Name */}
        <label htmlFor="employeeName" className="block font-medium text-gray-700">
          Employee Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="employeeName"
          name="employeeName"
          placeholder="Enter employee name"
          required
          value={formData.employeeName}
          onChange={handleChange}
          onBeforeInput={handleAlphaInput}
          className="w-full p-2 border rounded"
        />

        {/* Employee ID
        <label htmlFor="employeeId" className="block font-medium text-gray-700">
          Employee ID <span className="text-red-600">*</span>
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
        /> */}

        {/* PO Number */}
        <label htmlFor="poNumber" className="block font-medium text-gray-700">
          PO Number <span className="text-red-600">*</span>
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
          Start Date <span className="text-red-600">*</span>
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
          End Date <span className="text-red-600">*</span>
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
          Upload PDF File <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="fileUpload"
            name="fileUpload"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleChooseFile}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 border border-gray-400 text-gray-800"
          >
            {selectedFile ? "Change File" : "Choose File"}
          </button>
          {selectedFile && (
            <span className="flex items-center gap-1">
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-1 text-red-500 hover:text-red-700"
                aria-label="Remove file"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fff"/>
                  <path stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
                </svg>
              </button>
            </span>
          )}
        </div>
        {fileError && (
          <p className="text-red-600 text-xs mt-1 mb-3">{fileError}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
          disabled={loading}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
